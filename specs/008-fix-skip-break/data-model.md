# Data Model: Timer State Transitions

**Feature**: `008-fix-skip-break`  
**Date**: December 21, 2025  
**Purpose**: Document timer state transitions and auto-transition behavior

---

## Timer State Machine

### States

**TimerStatus** (existing enum):
- `idle`: Timer is ready to start
- `running`: Timer is counting down
- `paused`: Timer is temporarily stopped
- `completed`: Timer has reached 00:00

**TimerMode** (existing enum):
- `focus`: Work session (default 25 minutes)
- `short-break`: Short break (default 5 minutes)
- `long-break`: Long break (default 15 minutes)

---

## State Transitions

### Current State Transitions (Before Fix)

```
[Idle Focus] --start()--> [Running Focus] --pause()--> [Paused Focus]
                                  |                          |
                                  +--resume()----------------+
                                  |
                              reaches 00:00
                                  |
                                  v
                          [Completed Focus] <-- STUCK HERE (BUG)
```

**Problem**: Timer stays in `Completed Focus` state. User must manually click to switch modes.

---

### Fixed State Transitions (After Fix)

```
[Idle Focus] --start()--> [Running Focus] --reaches 00:00--> [Completed Focus]
                                                                      |
                                                                auto-transition
                                                                      |
                                                                      v
                                                              [Idle Break] --start()--> [Running Break]
                                                                                              |
                                                                                         reaches 00:00
                                                                                              |
                                                                                              v
                                                                                      [Completed Break]
                                                                                              |
                                                                                       user clicks
                                                                                        "Start Focus"
                                                                                              |
                                                                                              v
                                                                                      [Running Focus]
```

**Key changes**:
1. `[Completed Focus]` → **auto-transitions** → `[Idle Break]`
2. `[Idle Break]` + user click "Start Break" → **immediately** → `[Running Break]`
3. `[Completed Focus]` + user click "Skip Break" → **immediately** → `[Running Focus]`

---

## Transition Rules

### Rule 1: Auto-Transition on Focus Complete

**Trigger**: Focus timer reaches 00:00  
**From**: `{mode: 'focus', status: 'completed', remaining: 0}`  
**To**: `{mode: 'short-break' | 'long-break', status: 'idle', remaining: duration}`

**Logic**:
```typescript
// In App.tsx handleTimerComplete:
if (completedMode === 'focus') {
  const nextBreakMode = getNextBreakMode(); // Returns 'short-break' or 'long-break'
  timer.switchMode(nextBreakMode);
}
```

**Break Type Selection**:
- Cycle position 1-3: `short-break` (5 minutes)
- Cycle position 0 (after 4th focus): `long-break` (15 minutes)

**Timing**: Happens immediately after `onComplete()` callback, before UI re-renders

---

### Rule 2: Auto-Start on "Start Break" Click

**Trigger**: User clicks "Start Break" button  
**From**: `{mode: 'short-break' | 'long-break', status: 'idle'}`  
**To**: `{mode: 'short-break' | 'long-break', status: 'running'}`

**Logic** (already implemented in Bug 3):
```typescript
const handleStartBreak = () => {
  const breakType = getNextBreakType();
  timer.switchMode(breakType); // Ensures correct mode
  timer.start();               // Immediately start running
};
```

**Timing**: Immediate (single click, no idle state)

---

### Rule 3: Auto-Start on "Skip Break - Start Focus" Click

**Trigger**: User clicks "Skip Break - Start Focus" button  
**From**: `{mode: 'focus', status: 'completed'}` OR `{mode: 'break', status: 'idle'}`  
**To**: `{mode: 'focus', status: 'running', remaining: 25 * 60 * 1000}`

**Logic** (already implemented in Bug 3):
```typescript
const handleSkipBreak = () => {
  timer.switchMode('focus'); // Switch to focus mode
  timer.start();             // Immediately start running
};
```

**Session Tracking**: Does NOT call `onComplete()` because break wasn't completed. Focus session was already counted when it completed.

**Timing**: Immediate (single click, no idle state)

---

### Rule 4: Auto-Start on "Start Focus" Click (from notification)

**Trigger**: User clicks "Start Focus" button in notification after break completes  
**From**: `{mode: 'short-break' | 'long-break', status: 'completed'}`  
**To**: `{mode: 'focus', status: 'running', remaining: 25 * 60 * 1000}`

**Logic** (from existing `handleStartNext` in App.tsx):
```typescript
if (completedMode === 'short-break' || completedMode === 'long-break') {
  timer.switchMode('focus');
  if (preferences.autoStartFocus) {
    timer.start();
  }
}
```

**Existing behavior**: Auto-start depends on `preferences.autoStartFocus` setting

**No change needed**: This already works correctly

---

## State Persistence

### localStorage Structure

**Key**: `pomodoro_timer_state`

**Value**:
```typescript
{
  mode: TimerMode;           // Current mode
  duration: number;          // Total duration (ms)
  remaining: number;         // Time left (ms)
  status: TimerStatus;       // Current status
  startedAt: number | null;  // Timestamp when started (for restoration)
  sessionId: string;         // Unique session ID (Bug 2)
}
```

### Transition Persistence

**Scenario**: User completes focus → Auto-transitions to break → Refreshes page

**Expected behavior**:
1. Focus completes → `{mode: 'focus', status: 'completed'}` saved to localStorage
2. Auto-transition → `{mode: 'short-break', status: 'idle', duration: 300000}` saved
3. Refresh → State restored from localStorage → Shows break mode (idle)

**Implementation**: Existing `useEffect` in `useTimer` saves state on every change:
```typescript
useEffect(() => {
  setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
}, [session]);
```

**Verification**: Auto-transition updates state → useEffect triggers → localStorage updated → Refresh works correctly

---

## Edge Cases

### Edge Case 1: Rapid Multiple Clicks

**Scenario**: User rapidly clicks "Skip Break - Start Focus" multiple times

**Current behavior**: Each click calls `switchMode()` + `start()`

**Expected behavior**: Only first click should process

**Mitigation**: Add guard check at start of handler:
```typescript
const handleSkipBreak = () => {
  if (timer.status === 'running') return; // Already running, ignore
  timer.switchMode('focus');
  timer.start();
};
```

**Status**: ✅ Already handled - `start()` function checks `if (session.status === 'running') return`

---

### Edge Case 2: Refresh During Auto-Transition

**Scenario**: Focus completes → Auto-transition starts → User refreshes mid-transition

**Possible states on refresh**:
- State A: `{mode: 'focus', status: 'completed'}` (before transition saved)
- State B: `{mode: 'short-break', status: 'idle'}` (after transition saved)

**Handling**:
- State A: On restore, timer shows completed focus. Auto-transition will NOT re-run (one-time event).
  - **Issue**: User must manually click to switch modes
  - **Acceptable**: Very rare edge case (requires refresh within <100ms window)
- State B: On restore, timer shows idle break. User can click "Start Break".
  - **Perfect**: This is the expected state

**Mitigation**: None needed (acceptable behavior for rare edge case)

---

### Edge Case 3: Skip Break While Timer Running

**Scenario**: User starts break timer → Clicks "Skip Break - Start Focus" mid-break

**Expected behavior**: Should skip the running break and start focus

**Current implementation**: Button is only visible when `timer.status === 'completed' && timer.mode === 'focus'`

**Conclusion**: Button is hidden when break is running, so this scenario can't occur

**Status**: ✅ Handled by UI conditional rendering

---

## Validation Rules

### Transition Validation

**Rule**: Timer can only auto-transition from `completed` status

```typescript
// Validate before auto-transition:
if (timer.status !== 'completed') {
  throw new Error('Cannot auto-transition from non-completed state');
}
```

**Rule**: Auto-transition only applies to focus→break (not break→focus)

```typescript
// Validate mode:
if (completedMode === 'focus') {
  // OK: Auto-transition to break
  timer.switchMode(nextBreakMode);
} else {
  // Don't auto-transition from break to focus (user must click)
}
```

---

## No New Entities

**Note**: This fix does not introduce new entities. It only modifies state transition logic for existing `TimerSession` entity.

**Existing entity** (defined in `src/types/timer.ts`):
```typescript
export interface TimerSession {
  mode: TimerMode;
  duration: number;
  remaining: number;
  status: TimerStatus;
  startedAt: number | null;
  sessionId: string;
}
```

**No changes needed** to the `TimerSession` interface.

---

**Status**: Data model complete, state transitions documented


