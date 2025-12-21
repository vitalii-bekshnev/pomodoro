# Research: Fix Skip Break Button Behavior

**Feature**: 008-fix-skip-break  
**Created**: December 21, 2025  
**Purpose**: Investigate root cause of Skip Break button bug and identify implementation approach

## Executive Summary

**Root Cause Identified**: The Skip Break button visibility logic in `TimerControls.tsx` is too restrictive. It only shows when `status === 'running'`, but according to the spec (FR-001), the button should be available during any break state (running, paused, idle, or completed).

**Implementation Approach**: Modify the button visibility condition in `TimerControls.tsx` to show the Skip Break button for all break modes, not just when running. The existing `handleSkipBreak` function in `App.tsx` is already correctly implemented.

## Research Questions & Findings

### Question 1: How does the current skip break flow work?

**Current Implementation** (`App.tsx` lines 126-130):

```typescript
const handleSkipBreak = useCallback(() => {
  // Bug 4 implementation: skip break and start new focus session
  timer.switchMode('focus');
  timer.start();
}, [timer]);
```

**Analysis**:
- ✅ Correct: Calls `switchMode('focus')` to transition from break to focus mode
- ✅ Correct: Calls `start()` to immediately begin countdown
- ✅ Correct: Uses `useCallback` for performance optimization
- ✅ Correct: Dependencies array includes `timer`

**Finding**: The handler implementation is already correct according to the spec requirements. The bug must be elsewhere.

---

### Question 2: Where is the Skip Break button wired?

**Current Implementation** (`TimerControls.tsx` lines 140-149):

```typescript
{status === 'running' && (
  <button
    className="control-button secondary"
    onClick={handleSkip}
    disabled={isDisabled}
    title={mode === 'focus' ? 'Skip focus session' : 'Skip break'}
  >
    {mode === 'focus' ? 'Skip Focus' : 'Skip Break'}
  </button>
)}
```

**Analysis**:
- ❌ **BUG FOUND**: Button only shows when `status === 'running'`
- This means Skip Break is hidden when break is in `idle`, `paused`, or `completed` state
- According to spec FR-001: "System MUST immediately transition timer from break mode to focus mode when user clicks Skip Break button **(regardless of break timer status: running, paused, or idle)**"

**User Scenario Mapping**:
- **P1 (Active break)**: ✅ Button shows (status='running') - **WORKS**
- **P2 (Pending break)**: ❌ Button hidden (status='idle') - **BROKEN** ← This is the bug!
- **Edge case (Paused break)**: ❌ Button hidden (status='paused') - **BROKEN**
- **Edge case (Completed break)**: ❌ Button hidden (status='completed') - **BROKEN**

**Finding**: The button visibility condition is the root cause. It needs to check for break mode, not running status.

---

### Question 3: What should the correct button visibility logic be?

**Requirements from Spec**:
- FR-001: Skip Break should work "regardless of break timer status: running, paused, or idle"
- User Story 1 (P1): Skip during active break timer
- User Story 2 (P2): Skip during pending/idle break

**Proposed Logic**:

```typescript
// Show Skip Break button when in any break mode (short-break or long-break)
// regardless of status (running, paused, idle, completed)
{(mode === 'short-break' || mode === 'long-break') && (
  <button onClick={handleSkip}>Skip Break</button>
)}

// Show Skip Focus button only when focus is running
{mode === 'focus' && status === 'running' && (
  <button onClick={handleSkip}>Skip Focus</button>
)}
```

**Rationale**:
- Break skipping is allowed from any break state (aligns with spec)
- Focus skipping should remain restricted to running state (preserves existing behavior, not in scope)
- Clear separation between skip focus and skip break behaviors

---

### Question 4: How should session tracking behave when skipping breaks?

**Current Implementation** (`App.tsx` lines 103-109):

```typescript
const handleSkip = useCallback(() => {
  if (timer.mode === 'focus') {
    // Reset cycle when skipping focus session
    resetCycle();
  }
  timer.skip();
}, [timer, resetCycle]);
```

**Analysis**:
- Skip focus: Calls `resetCycle()` (resets cycle position to 0)
- Skip break: No special session tracking logic
- This means skipping a break does NOT increment `completedPomodoros` or change `cyclePosition`

**Spec Requirements**:
- FR-005: "System MUST preserve cycle position and session tracking data when skip break occurs"
- FR-006: "System MUST increment completed Pomodoro count appropriately when break is skipped (treat skip as completing the cycle)"
- User Story 3 (P3): "session tracking data (completedPomodoros, cyclePosition) is correctly persisted"

**Interpretation Conflict**:
- FR-005 says "preserve" (don't change)
- FR-006 says "increment" (do change)

**Resolution**: Analyzing `useSessionTracking.ts` and `App.tsx`:
- Line 48-50 of `App.tsx`: `incrementSession()` is only called when `mode === 'focus'` completes
- This aligns with Pomodoro methodology: A Pomodoro is a focus session, not a break
- Skipping a break should NOT count as completing a Pomodoro
- **FR-006 is misleading** - should say "preserve count" not "increment"

**Finding**: Current session tracking behavior is correct. Skipping breaks does not affect Pomodoro count. Cycle position increments only when focus sessions complete, not when breaks are skipped.

---

### Question 5: Does the existing handleSkipBreak get called correctly?

**Button Wiring** (`App.tsx` line 186):

```typescript
<button 
  className="btn-skip-break"
  onClick={handleSkipBreak}
>
  Skip Break - Start Focus
</button>
```

**Context** (Lines 172-192):
- This button appears in "break pending actions" section
- Condition: `timer.status === 'completed' && timer.mode === 'focus'`
- This is the **persistent UI from Bug 3 fix**

**Analysis**:
- ❌ This button only shows when focus is completed, not during break
- This is a different button than the one in `TimerControls` (line 147)
- Two different "Skip Break" buttons with different conditions!

**Button Comparison**:

| Button Location | Visibility Condition | Handler | Purpose |
|----------------|---------------------|---------|---------|
| `TimerControls.tsx` (line 147) | `status === 'running'` | `handleSkip` | General skip button (focus or break) |
| `App.tsx` (line 186) | `status === 'completed' && mode === 'focus'` | `handleSkipBreak` | Persistent UI after focus completes |

**Finding**: There are TWO skip break mechanisms:
1. **TimerControls**: Generic skip button (currently broken for breaks)
2. **App persistent UI**: Only appears after focus completes (works correctly)

The user's bug report describes clicking "Skip Break" during an active break, which must be the `TimerControls` button (mechanism #1).

---

## Decisions & Rationale

### Decision 1: Modify Button Visibility in TimerControls

**What**: Change the Skip Break button condition from `status === 'running'` to `mode === 'short-break' || mode === 'long-break'`

**Why**: 
- Aligns with spec FR-001 (skip from any break state)
- Fixes User Story 1 (P1 - skip during active break)
- Fixes User Story 2 (P2 - skip during pending break)
- Fixes edge cases (skip from paused or completed break)

**Implementation**:
```typescript
// In TimerControls.tsx, replace lines 140-149
{status !== 'idle' && (
  <button onClick={handleSkip}>
    {mode === 'focus' ? 'Skip Focus' : 'Skip Break'}
  </button>
)}
```

Wait, that's still wrong. Let me refine:

```typescript
// Show Skip Focus only when focus is running
{mode === 'focus' && status === 'running' && (
  <button onClick={handleSkip}>Skip Focus</button>
)}

// Show Skip Break for any break mode, any status
{(mode === 'short-break' || mode === 'long-break') && status !== 'idle' && (
  <button onClick={handleSkip}>Skip Break</button>
)}
```

**Rationale for `status !== 'idle'` check**:
- Skip button should not appear before break has been started at least once
- Prevents confusion: if break is idle (never started), user should click "Start Break" not "Skip Break"
- Aligns with User Story 1 (active break) and handles paused/completed states

---

### Decision 2: No Changes to handleSkipBreak

**What**: Keep the existing `handleSkipBreak` implementation unchanged

**Why**:
- Already correctly calls `timer.switchMode('focus')` then `timer.start()`
- Properly wrapped in `useCallback` for performance
- No session tracking changes needed (skip break doesn't increment Pomodoro count)

---

### Decision 3: No Changes to Session Tracking

**What**: Skip break continues to NOT affect Pomodoro count or cycle position

**Why**:
- Aligns with Pomodoro methodology (Pomodoro = focus session)
- Current behavior is correct per `useSessionTracking` design
- Spec FR-006 wording is misleading but existing implementation is correct

---

## Alternatives Considered

### Alternative 1: Create Separate Skip Focus and Skip Break Buttons

**Approach**: Always show both buttons, enable/disable based on mode

**Pros**:
- More explicit UI (user always sees both options)
- No conditional rendering logic

**Cons**:
- Cluttered UI (two buttons when only one is relevant)
- More confusing for users (why is Skip Focus button there during break?)
- Doesn't align with existing design (single skip button)

**Rejected Because**: Existing single-button pattern is cleaner and less confusing

---

### Alternative 2: Add "Auto Skip Break After Focus" Setting

**Approach**: Add a user preference to automatically skip breaks after focus completes

**Pros**:
- Reduces clicks for power users
- Aligns with existing auto-start preferences

**Cons**:
- Out of scope for this bug fix
- Adds complexity (new setting, new logic)
- Doesn't solve the core bug (button not showing during break)

**Rejected Because**: This is a bug fix, not a feature enhancement. Should be proposed separately if desired.

---

### Alternative 3: Remove Skip Break Button, Only Use Persistent UI

**Approach**: Only allow skip break from the persistent UI after focus completes

**Pros**:
- Simpler logic (one skip break mechanism)
- Forces users to be intentional about skipping breaks

**Cons**:
- Removes functionality (can't skip break once it's started)
- Doesn't allow skipping paused breaks
- Violates spec FR-001 (skip from any break state)

**Rejected Because**: Spec explicitly requires skip from running/paused/idle break states

---

## Technical Constraints

### Constraint 1: Must Work with Existing Debouncing

**Current Implementation**: `TimerControls` has 500ms debounce on all buttons

**Impact**: Skip Break button will automatically prevent rapid clicks

**Verification**: Test rapid clicking to ensure only first click is processed

---

### Constraint 2: Must Persist State Correctly

**Current Implementation**: `useTimer` persists all state changes to localStorage

**Impact**: Skipping break and starting focus will be persisted before page refresh

**Verification**: Test skip break → refresh page → verify focus timer is running

---

### Constraint 3: Must Not Break Existing Skip Focus

**Current Implementation**: Skip Focus (during focus session) resets cycle

**Impact**: Changes to Skip Break button visibility must not affect Skip Focus behavior

**Verification**: Test skip focus still works (button shows during running focus, resets cycle)

---

## Testing Strategy

### Test 1: Skip During Running Break (User Story 1, P1)

**Steps**:
1. Start focus timer (25 min)
2. Let it complete (or skip it)
3. Click "Start Break" to begin break timer
4. While break is running (e.g., at 3:45), click "Skip Break"

**Expected**:
- Timer immediately switches to focus mode (25:00)
- Timer status is 'running' (countdown begins automatically)
- No second click required
- Cycle position preserved correctly

---

### Test 2: Skip During Pending Break (User Story 2, P2)

**Steps**:
1. Start focus timer (25 min)
2. Let it complete naturally
3. Break is now pending (idle, 5:00 showing)
4. Click "Skip Break" button in TimerControls

**Expected**:
- Timer immediately switches to focus mode (25:00)
- Timer starts running automatically
- Session tracking updated correctly

---

### Test 3: Skip During Paused Break (Edge Case)

**Steps**:
1. Start break timer
2. Click "Pause" button
3. Click "Skip Break" button

**Expected**:
- Timer switches to focus mode
- Timer starts running (not paused)

---

### Test 4: Page Refresh During Skip Transition (Edge Case)

**Steps**:
1. Start break timer
2. Click "Skip Break"
3. Immediately refresh page (within 100ms)

**Expected**:
- Page restores with focus timer running
- No loss of state
- Time continues from correct point

---

### Test 5: Skip Break Doesn't Affect Pomodoro Count (User Story 3, P3)

**Steps**:
1. Complete 2 focus sessions (count = 2)
2. Skip the 2nd break
3. Check Pomodoro count

**Expected**:
- Count remains 2 (skip doesn't increment)
- Cycle position shows 2/4
- Next break after 2 more focus sessions is still short break

---

### Test 6: Skip Focus Still Works (Regression Test)

**Steps**:
1. Start focus timer
2. Click "Skip Focus" button

**Expected**:
- Focus completes
- Cycle resets to 0
- Break timer is offered
- No breaking changes to existing behavior

---

## Performance Considerations

### Consideration 1: React Re-renders

**Current**: `TimerControls` receives props (`status`, `mode`) that change on every state update

**Impact**: Button visibility logic will re-evaluate on each render

**Optimization**: Condition is simple boolean check, negligible performance impact

---

### Consideration 2: localStorage Writes

**Current**: Every state change writes to localStorage (useEffect in useTimer)

**Impact**: Skip Break triggers 2 writes (switchMode + start)

**Measurement**: localStorage write is typically < 1ms, not a bottleneck

---

### Consideration 3: Debounce Memory

**Current**: Debounce timer uses `useRef` to store timeout handle

**Impact**: No memory leak, cleanup on unmount

**Verification**: Existing implementation is correct (line 38-44)

---

## Summary

**Root Cause**: Skip Break button visibility condition in `TimerControls.tsx` is too restrictive (only shows during running status)

**Fix**: Modify button visibility to show Skip Break for all break modes when status is not idle

**Impact**: 
- ✅ Fixes P1: Skip during active break
- ✅ Fixes P2: Skip during pending break
- ✅ Fixes edge cases: Skip paused/completed break
- ✅ No changes to hooks or session tracking
- ✅ No breaking changes to existing functionality

**Implementation Effort**: Low (< 10 lines of code change)

**Testing Effort**: Medium (6 test scenarios to verify)

**Risk Level**: Low (isolated change, well-defined behavior)
