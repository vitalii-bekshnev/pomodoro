# Research: Timer State Restoration Bug Fixes

**Feature**: `007-fix-timer-state-bugs`  
**Date**: December 19, 2025  
**Purpose**: Document root cause analysis and fix patterns for 4 critical timer bugs

---

## Bug 1: Timer Jumps 2 Seconds Forward on Refresh

### Problem Statement

**Symptom**: When refreshing page with running timer showing 24:35, timer jumps to 24:37 (2 seconds forward)

**User Impact**: P1 - Breaks trust in timer accuracy, makes Pomodoro technique unreliable

**Frequency**: 100% of running timer refreshes

### Root Cause Analysis

**Buggy Code** (src/hooks/useTimer.ts, lines 42-44):
```typescript
const elapsedTime = Date.now() - saved.startedAt;
const calculatedRemaining = saved.remaining - elapsedTime;
```

**Why This Is Wrong**:

1. **Double-Counting Problem**:
   - `saved.remaining` was already decremented during the last timer run (every 100ms in the interval)
   - `elapsedTime` calculates total time since timer STARTED (not since last save)
   - Calculation: `remaining - elapsedTime` subtracts the elapsed time AGAIN

2. **Example Walkthrough**:
   ```
   T=0: Timer starts
        - duration = 1500000ms (25 min)
        - remaining = 1500000ms
        - startedAt = T0
        - Saved to localStorage
   
   T=295000ms (4 min 55 sec elapsed):
        - Interval has been updating remaining every 100ms
        - remaining = 1500000 - 295000 = 1205000ms (20:05 left)
        - startedAt = T0 (unchanged)
        - Saved to localStorage
   
   T=297000ms (4 min 57 sec): User refreshes
        - Load from localStorage:
          - remaining = 1205000ms (20:05)
          - startedAt = T0
        - Calculate: elapsedTime = 297000ms (4:57 from start)
        - Bug: remaining - elapsedTime = 1205000 - 297000 = 908000ms (15:08)
        - Should be: 1500000 - 297000 = 1203000ms (20:03)
        - Error: Shows 15:08 instead of 20:03 → 5 minutes LOST!
   ```

3. **Why 2 Seconds Not 5 Minutes?**:
   - The 2-second jump is the time between last `setSession` call and page refresh
   - If refresh happens immediately after save, error is minimal
   - If refresh happens 2 seconds after last save, that 2 seconds is double-counted

**Correct Approach**:
```typescript
// Calculate from ORIGINAL duration, not current remaining
const elapsedFromStart = Date.now() - saved.startedAt;
const calculatedRemaining = saved.duration - elapsedFromStart;
```

**Why This Works**:
- `startedAt` = timestamp when timer first started
- `duration` = total timer length (constant, never changes)
- `elapsedFromStart` = how much time passed since start
- `calculatedRemaining` = simple subtraction, no cumulative errors

### Fix Implementation

**File**: `src/hooks/useTimer.ts`  
**Location**: Lines 42-44 in useState initialization

**Change**:
```typescript
// OLD (BUGGY):
const elapsedTime = Date.now() - saved.startedAt;
const calculatedRemaining = saved.remaining - elapsedTime;

// NEW (FIXED):
const elapsedFromStart = Date.now() - saved.startedAt;
const calculatedRemaining = saved.duration - elapsedFromStart;
```

**Testing**:
- Mock Date.now() to control time
- Set startedAt to T0, duration to 1500000ms
- After 295000ms, verify remaining = 1205000ms (not 908000ms)
- After multiple refreshes, verify no cumulative errors

---

## Bug 2: Duplicate Session Count on Every Refresh

### Problem Statement

**Symptom**: After timer completes, refreshing page increments Pomodoro count by 2 each time

**User Impact**: P1 - Invalidates progress tracking, breaks motivation metrics

**Frequency**: 100% of refreshes after completion

### Root Cause Analysis

**Buggy Code** (src/hooks/useTimer.ts, lines 103-108):
```typescript
useEffect(() => {
  if (session.status === 'completed' && session.remaining === 0) {
    onComplete(session.mode);
  }
}, []); // Runs once on mount
```

**Why This Is Wrong**:

1. **No Duplicate Detection**:
   - useEffect runs on EVERY page load/mount
   - When status is 'completed', it calls `onComplete()`
   - No tracking to prevent calling `onComplete()` multiple times for the same completion

2. **Sequence of Events**:
   ```
   1. Timer reaches 0 → status = 'completed' → onComplete() called → count = 1
   2. State saved to localStorage with status = 'completed'
   3. User refreshes page
   4. Page loads → useEffect runs → status still 'completed' → onComplete() called AGAIN → count = 2
   5. User refreshes again
   6. Page loads → useEffect runs → status still 'completed' → onComplete() called AGAIN → count = 3
   ```

3. **Why It Happens**:
   - Completed state persists in localStorage
   - No mechanism to track "already processed this completion"
   - useEffect dependency array `[]` means it only checks on mount, not on session changes
   - But it checks EVERY mount (every page load/refresh)

**Correct Approach**:

Track completed sessions with unique IDs:
```typescript
// When timer starts, generate unique session ID
sessionId = `${Date.now()}-${mode}`;

// On restore/mount, check if this completion already processed
const lastCompletion = getStorageItem('last_completion');
const isAlreadyProcessed = 
  lastCompletion && 
  lastCompletion.sessionId === session.sessionId;

if (!isAlreadyProcessed) {
  onComplete(session.mode);
  setStorageItem('last_completion', {
    sessionId: session.sessionId,
    completedAt: Date.now(),
    mode: session.mode
  });
}
```

### Fix Implementation

**Files**: 
- `src/hooks/useTimer.ts` (completion handler)
- `src/types/timer.ts` (add sessionId, CompletionRecord interface)

**Change 1 - Add sessionId to TimerSession**:
```typescript
// types/timer.ts
export interface TimerSession {
  mode: TimerMode;
  duration: number;
  remaining: number;
  status: TimerStatus;
  startedAt: number | null;
  sessionId: string;  // NEW: Unique ID for this timer session
}

export interface CompletionRecord {
  sessionId: string;
  completedAt: number;
  mode: TimerMode;
}
```

**Change 2 - Generate sessionId when starting**:
```typescript
// useTimer.ts, start() function
const sessionId = `${Date.now()}-${prev.mode}`;
setSession((prev) => ({
  ...prev,
  status: 'running',
  startedAt: Date.now(),
  sessionId,
}));
```

**Change 3 - Track completions**:
```typescript
// useTimer.ts, completion handler useEffect
useEffect(() => {
  if (session.status === 'completed' && session.remaining === 0) {
    const lastCompletion = getStorageItem<CompletionRecord>(
      STORAGE_KEYS.LAST_COMPLETION,
      null
    );
    
    const isAlreadyProcessed = 
      lastCompletion && 
      lastCompletion.sessionId === session.sessionId;
    
    if (!isAlreadyProcessed) {
      onComplete(session.mode);
      setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
        sessionId: session.sessionId,
        completedAt: Date.now(),
        mode: session.mode
      });
    }
  }
}, []);
```

**Testing**:
- Complete timer (count = 1)
- Verify `last_completion` in localStorage has sessionId
- Refresh 5 times
- Verify count still = 1
- Verify onComplete not called on refreshes

---

## Bug 3: No Break Start Option After Notification Dismissed

### Problem Statement

**Symptom**: After dismissing completion notification, no UI element to start break

**User Impact**: P2 - Users get stuck, can't continue Pomodoro cycle

**Frequency**: 100% when notification dismissed or auto-disappears

### Root Cause Analysis

**Current Behavior**:
1. Timer completes → notification banner appears with "Start Break" button
2. User dismisses notification OR notification auto-disappears after timeout
3. UI returns to normal timer display
4. No persistent "Start Break" button/option
5. User is stuck (can only reset or manually start new session)

**Why This Is Wrong**:
- Notification is transient (dismissible, timeout)
- Break start action is critical to Pomodoro flow
- User may want to dismiss notification but start break later
- No recovery mechanism if notification missed

**Correct Approach**:

Add persistent UI element when in completed-awaiting-break state:
```typescript
// Show persistent break actions when:
// 1. Timer status is 'completed'
// 2. Mode is 'focus' (completed focus → need to start break)

{timer.status === 'completed' && timer.mode === 'focus' && (
  <div className="break-pending-actions">
    <p>Focus session complete! Time for a break.</p>
    <button onClick={handleStartBreak}>
      Start {nextBreakType()} Break
    </button>
    <button onClick={handleSkipBreak}>
      Skip Break - Start Focus
    </button>
  </div>
)}
```

### Fix Implementation

**Files**:
- `src/components/App.tsx` (add persistent UI)
- `src/components/App.css` (styles)

**Location**: After Timer component, before controls

**UI Design Decisions**:
- **Placement**: Below timer display, always visible
- **Style**: Highlighted background (warning color) to draw attention
- **Content**: Clear message + 2 action buttons
- **Persistence**: Remains until user takes action (start break or skip)

**Handler Functions**:
```typescript
const handleStartBreak = () => {
  // Determine which break (short or long) based on cycle
  const breakMode = determineNextBreakMode(sessionTracking);
  timer.switchMode(breakMode);
  timer.start();
};

const handleSkipBreak = () => {
  timer.skipBreakAndStartFocus(); // Bug 4 fix
};

const nextBreakType = () => {
  const shouldBeLongBreak = (sessionTracking.cyclePosition % 4) === 0;
  return shouldBeLongBreak ? 'Long' : 'Short';
};
```

**Testing**:
- Complete focus timer
- Dismiss notification
- Verify "Start Break" UI visible and functional
- Click button → break starts correctly
- Refresh page → UI still visible
- Start break → UI disappears

---

## Bug 4: Non-Functional "Start Focus" Button

### Problem Statement

**Symptom**: After completion, "Start Focus" button appears but does nothing when clicked

**User Impact**: P3 - Can't skip breaks, workflow blocked

**Frequency**: 100% of clicks on "Start Focus" in completed state

### Root Cause Analysis

**Current Behavior**:
- "Start Focus" button exists in UI (likely in notification or controls)
- Clicking button has no effect
- Timer remains in completed state
- User expects: new focus timer to start immediately (break skipped)

**Why This Doesn't Work**:
- Existing `skip()` function transitions current timer to completed state
- Not designed for "skip break and start focus" workflow
- No function wired to "Start Focus" button in completed state

**Correct Approach**:

Create dedicated function for skip-break-and-start-focus:
```typescript
const skipBreakAndStartFocus = useCallback(() => {
  if (session.status !== 'completed' || session.mode !== 'focus') return;
  
  // Switch to focus mode (creates idle focus timer)
  const duration = getDurationForMode('focus', preferences);
  setSession({
    mode: 'focus',
    duration,
    remaining: duration,
    status: 'idle',
    startedAt: null,
    sessionId: `${Date.now()}-focus`,
  });
  
  // Auto-start the timer
  setTimeout(() => start(), 0);
}, [session, preferences, start]);
```

### Fix Implementation

**File**: `src/hooks/useTimer.ts`

**Add New Function**:
```typescript
const skipBreakAndStartFocus = useCallback(() => {
  // Guard: only works in completed state after focus
  if (session.status !== 'completed' || session.mode !== 'focus') return;
  
  // Clear any existing intervals
  if (intervalRef.current !== null) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  
  // Create new focus session (idle state)
  const duration = getDurationForMode('focus', preferences);
  const sessionId = `${Date.now()}-focus`;
  
  setSession({
    mode: 'focus',
    duration,
    remaining: duration,
    status: 'idle',
    startedAt: null,
    sessionId,
  });
  
  // Auto-start after state update completes
  setTimeout(() => {
    start();
  }, 0);
}, [session.status, session.mode, preferences, start]);
```

**Export in UseTimerReturn**:
```typescript
export interface UseTimerReturn {
  // ... existing fields
  skipBreakAndStartFocus: () => void;  // NEW
}

// In return statement
return {
  // ... existing returns
  skipBreakAndStartFocus,
};
```

**Wire to UI**:
```typescript
// In App.tsx
<button onClick={timer.skipBreakAndStartFocus}>
  Skip Break - Start Focus
</button>
```

**Testing**:
- Complete focus timer
- Click "Start Focus" button
- Verify new focus timer starts (25:00, running)
- Verify session count incremented (break skip counts as completed cycle)
- Verify all timer controls work (pause, reset, etc.)

---

## Summary of Fixes

| Bug # | Root Cause | Fix | Files Changed | Lines Changed |
|-------|------------|-----|---------------|---------------|
| 1 | Wrong baseline for time calc (remaining vs duration) | Change to `duration - elapsed` | useTimer.ts | 2 lines |
| 2 | No duplicate completion tracking | Add sessionId + completion record | useTimer.ts, timer.ts | ~30 lines |
| 3 | No persistent break start UI | Add conditional UI component | App.tsx, App.css | ~20 lines |
| 4 | No skip break function | Add skipBreakAndStartFocus | useTimer.ts | ~25 lines |

**Total Estimated Changes**: ~80 lines across 3-4 files

**Risk Level**: Low - All changes are additive or fix existing bugs, no breaking changes

**Testing Requirement**: High - All 4 bugs have clear test scenarios with expected outcomes

---

**Status**: Research complete, ready for data model and contracts generation

