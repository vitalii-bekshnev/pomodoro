# Contract: Timer State Transitions for Skip Break

**Feature**: 008-fix-skip-break  
**Created**: December 21, 2025  
**Purpose**: Define the contract for Skip Break button behavior and state transitions

## Overview

This contract defines the expected behavior of the Skip Break functionality, including button visibility, state transitions, and handler responsibilities.

## Contract 1: TimerControls Component API

### Interface

```typescript
export interface TimerControlsProps {
  status: TimerStatus;           // Current timer status
  mode: TimerMode;                // Current timer mode
  onStart: () => void;            // Start timer from idle
  onPause: () => void;            // Pause running timer
  onResume: () => void;           // Resume paused timer
  onReset: () => void;            // Reset timer to initial state
  onSkip: () => void;             // Skip current session (focus or break)
}
```

### Button Visibility Contract

#### Skip Focus Button

**Condition**: 
```typescript
visible = (mode === 'focus' && status === 'running')
```

**Label**: "Skip Focus"

**Handler**: Calls `onSkip()` prop

**Behavior**: 
- Resets cycle position to 0
- Completes focus session
- Shows notification banner

---

#### Skip Break Button (FIXED)

**Condition (Before Fix)**:
```typescript
visible = (status === 'running')  // ← BUG: Too restrictive
```

**Condition (After Fix)**:
```typescript
visible = (
  (mode === 'short-break' || mode === 'long-break') && 
  status !== 'idle'
)
```

**Rationale for `status !== 'idle'`**:
- Skip button should not appear before break has been started/viewed
- If status is 'idle', user should use "Start Break" button instead
- Prevents UI confusion: don't show both "Start Break" and "Skip Break" simultaneously

**Label**: "Skip Break"

**Handler**: Calls `onSkip()` prop

**Behavior (Expected After Handler Fix)**: 
- Immediately switches to focus mode
- Auto-starts focus timer (status='running')
- Does NOT increment Pomodoro count
- Does NOT modify cycle position

---

### Debouncing Contract

**Requirement**: All buttons must be debounced to prevent rapid clicks

**Implementation**:
```typescript
const DEBOUNCE_DELAY = 500; // milliseconds

// After any button click:
1. Execute action immediately
2. Disable ALL buttons for 500ms
3. Re-enable buttons after delay
```

**Verification**:
- Clicking Skip Break multiple times within 500ms processes only the first click
- Other buttons (Start, Pause, Reset) also disabled during debounce period
- Debounce timer cleaned up on component unmount

---

## Contract 2: App Component Skip Break Handler

### Current Implementation (Broken)

```typescript
const handleSkip = useCallback(() => {
  if (timer.mode === 'focus') {
    resetCycle();
  }
  timer.skip();  // ← For breaks, this completes break but stays in break state
}, [timer, resetCycle]);
```

**Issue**: `timer.skip()` sets status to 'completed' but doesn't transition mode to focus

---

### Required Fix

**Option A: Modify handleSkip to Handle Breaks Differently**

```typescript
const handleSkip = useCallback(() => {
  if (timer.mode === 'focus') {
    // Skip focus: reset cycle and complete
    resetCycle();
    timer.skip();
  } else {
    // Skip break: transition to focus and auto-start
    timer.switchMode('focus');
    timer.start();
  }
}, [timer, resetCycle]);
```

**Option B: Create Separate Break Skip Handler**

```typescript
// Keep handleSkip for focus only
const handleSkip = useCallback(() => {
  if (timer.mode === 'focus') {
    resetCycle();
    timer.skip();
  }
}, [timer, resetCycle]);

// New handler for break skip
const handleSkipBreak = useCallback(() => {
  timer.switchMode('focus');
  timer.start();
}, [timer]);

// Pass different handler to TimerControls based on mode
const skipHandler = timer.mode === 'focus' ? handleSkip : handleSkipBreak;
```

**Option C: Use Existing handleSkipBreak for Both**

```typescript
// Reuse existing handleSkipBreak (line 126-130)
const handleSkipBreak = useCallback(() => {
  timer.switchMode('focus');
  timer.start();
}, [timer]);

// Modify handleSkip to call handleSkipBreak for breaks
const handleSkip = useCallback(() => {
  if (timer.mode === 'focus') {
    resetCycle();
    timer.skip();
  } else {
    handleSkipBreak();
  }
}, [timer, resetCycle, handleSkipBreak]);
```

**Recommended**: Option A (simplest, least code change)

---

## Contract 3: useTimer Hook State Transitions

### Function: switchMode(mode: TimerMode)

**Pre-conditions**: Can be called from any state

**Actions**:
1. Stop countdown interval (if running)
2. Set `mode` = new mode
3. Set `duration` = default for new mode (from preferences)
4. Set `remaining` = `duration`
5. Set `status` = `'idle'`
6. Set `startedAt` = `null`
7. Generate new `sessionId`
8. Persist to localStorage

**Post-conditions**:
- Timer is in idle state with full duration for new mode
- Countdown is stopped
- localStorage updated

---

### Function: start()

**Pre-conditions**: 
- Can be called from any status except 'running'
- Typically called from 'idle', 'paused', or 'completed' status

**Actions**:
1. Set `status` = `'running'`
2. Set `startedAt` = `Date.now()`
3. Generate new `sessionId` (if starting from idle/completed)
4. Start countdown interval (100ms precision)
5. Persist to localStorage

**Post-conditions**:
- Timer is running and counting down
- `remaining` decreases every 100ms
- When `remaining` reaches 0, calls `onComplete(mode)`

---

### Function: skip()

**Pre-conditions**: Typically called when status is 'running'

**Actions**:
1. Stop countdown interval
2. Call `onComplete(mode)` callback
3. Set `remaining` = 0
4. Set `status` = `'completed'`
5. Set `startedAt` = `null`
6. Save completion record to prevent duplicate processing
7. Persist to localStorage

**Post-conditions**:
- Timer shows 00:00
- Status is 'completed'
- Notification banner appears
- Mode is unchanged ← **This is why skip() doesn't work for breaks**

---

## Contract 4: Skip Break State Transition Sequence

### Sequence Diagram

```
┌─────┐                  ┌────────────────┐                ┌──────────┐
│User │                  │ TimerControls  │                │   App    │
└──┬──┘                  └───────┬────────┘                └────┬─────┘
   │                             │                              │
   │ Click "Skip Break"          │                              │
   │─────────────────────────────>                              │
   │                             │                              │
   │                             │ Debounce check (500ms)       │
   │                             │──────┐                       │
   │                             │      │                       │
   │                             │<─────┘                       │
   │                             │                              │
   │                             │ onSkip()                     │
   │                             │──────────────────────────────>
   │                             │                              │
   │                             │                              │ Check mode
   │                             │                              │──────┐
   │                             │                              │      │
   │                             │                              │<─────┘
   │                             │                              │
   │                             │                              │ If break:
   │                             │                              │ switchMode('focus')
   │                             │                              │ start()
   │                             │                              │──────┐
   │                             │                              │      │
   │                             │                              │<─────┘
   │                             │                              │
   │                             │ Re-render with new state     │
   │                             │<──────────────────────────────
   │                             │                              │
   │ See focus timer running     │                              │
   │<────────────────────────────│                              │
   │                             │                              │
```

---

## Contract 5: Acceptance Criteria

### AC-001: Button Visibility

**Given**: Timer is in short-break or long-break mode  
**And**: Status is 'running', 'paused', or 'completed'  
**When**: Rendering TimerControls  
**Then**: "Skip Break" button is visible

**Counter-case**:  
**Given**: Timer is in short-break or long-break mode  
**And**: Status is 'idle'  
**When**: Rendering TimerControls  
**Then**: "Skip Break" button is NOT visible

---

### AC-002: Skip Break During Running Break

**Given**: Timer is in break mode with status 'running'  
**When**: User clicks "Skip Break" button  
**Then**: 
- Timer mode changes to 'focus'
- Timer status changes to 'running' (not 'idle')
- Timer duration is set to 25 minutes
- Timer remaining time is 25 minutes
- Countdown begins immediately
- localStorage reflects new state

---

### AC-003: Skip Break During Paused Break

**Given**: Timer is in break mode with status 'paused'  
**When**: User clicks "Skip Break" button  
**Then**: Same as AC-002 (immediate focus timer running)

---

### AC-004: Skip Break After Completed Break

**Given**: Timer is in break mode with status 'completed'  
**When**: User clicks "Skip Break" button  
**Then**: Same as AC-002 (immediate focus timer running)

---

### AC-005: Session Tracking Unaffected

**Given**: User has completed 2 Pomodoros (count = 2, cycle = 2)  
**When**: User skips a break  
**Then**: 
- Completed count remains 2
- Cycle position remains 2
- Next break type determination unchanged

---

### AC-006: Debouncing Prevents Duplicate Actions

**Given**: User clicks "Skip Break" button  
**When**: User clicks "Skip Break" again within 500ms  
**Then**: 
- Second click is ignored
- Timer state only changes once
- Button remains disabled until 500ms elapsed

---

### AC-007: State Persistence Across Refresh

**Given**: User clicks "Skip Break" during running break  
**When**: User immediately refreshes page (within 1 second)  
**Then**: 
- Timer restores in focus mode
- Timer is running (not idle)
- Remaining time is approximately 25 minutes minus elapsed time
- No data loss or corruption

---

## Contract 6: Error Handling

### Error Case 1: Rapid Clicks

**Scenario**: User double-clicks Skip Break button

**Expected Behavior**: 
- First click processes immediately
- Button becomes disabled
- Second click is blocked by debounce
- After 500ms, button re-enables (in focus mode, Skip Break button now hidden)

**Implementation**: Existing debounce logic in TimerControls

---

### Error Case 2: State Corruption

**Scenario**: localStorage contains invalid timer state

**Expected Behavior**:
- `useTimer` hook validates restored state
- Falls back to DEFAULT_TIMER_SESSION if invalid
- Logs error to console (if applicable)
- User sees default timer state (focus, 25 min, idle)

**Implementation**: Existing validation in useTimer initialization

---

### Error Case 3: Mode Mismatch

**Scenario**: Skip Break button somehow rendered when mode is 'focus'

**Expected Behavior**:
- Handler checks mode before acting
- If mode is 'focus', calls skip() (reset cycle + complete)
- If mode is break, calls switchMode + start
- Graceful handling, no crash

**Implementation**: Type safety via TypeScript + handler logic

---

## Contract 7: Backward Compatibility

### Requirement

Changes must NOT break:
- Skip Focus functionality (during focus sessions)
- Reset button behavior
- Pause/Resume buttons
- Start button behavior
- Existing session tracking
- Existing localStorage persistence
- Existing notification system

### Verification

Run existing test suite:
- `tests/unit/hooks/useTimer.test.ts`
- `tests/unit/hooks/useSessionTracking.test.ts`
- `tests/integration/SettingsPersistence.test.tsx`

All tests must pass without modification.

---

## Contract 8: Performance Requirements

### Requirement 1: Button Visibility Calculation

**Max Time**: < 1ms per render

**Implementation**: Simple boolean expression, no loops or async

---

### Requirement 2: State Transition

**Max Time**: < 50ms from click to UI update

**Breakdown**:
- Debounce check: < 1ms
- Handler execution: < 5ms
- switchMode + start: < 10ms
- localStorage write: < 10ms
- React re-render: < 30ms

---

### Requirement 3: localStorage Operations

**Max Time**: < 10ms per write

**Data Size**: ~200 bytes per state object

**Frequency**: Every state change (acceptable for user actions)

---

## Summary

This contract defines:

1. **Button Visibility**: Skip Break shows for breaks (not idle), Skip Focus shows for running focus
2. **Handler Behavior**: Skip break must call `switchMode('focus')` + `start()`, not just `skip()`
3. **State Transitions**: Atomic transition from break to running focus (no intermediate states)
4. **Session Tracking**: Skip break does NOT affect Pomodoro count or cycle position
5. **Debouncing**: 500ms delay prevents duplicate actions
6. **Persistence**: All state changes persist to localStorage
7. **Backward Compatibility**: Existing functionality remains unchanged

**Implementation Priority**: 
1. Fix handleSkip to handle breaks correctly (highest priority)
2. Update button visibility condition (required for fix to be accessible)
3. Add tests (verification)
4. Manual testing (final validation)
