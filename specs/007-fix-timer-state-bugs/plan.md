# Implementation Plan: Fix Timer State Restoration Bugs

**Branch**: `007-fix-timer-state-bugs` | **Date**: December 19, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Bug fixes for timer state restoration issues from feature 006

## Summary

Fix 4 critical bugs in the timer state persistence feature (006) that cause time accuracy issues, duplicate session counting, stuck states, and non-functional buttons. All bugs stem from the recently implemented wall-clock restoration logic.

**Key Fixes**:
1. **Bug 1 (P1)**: Fix 2-second time jump - restore calculation using wrong baseline (`remaining` instead of `duration - elapsedTotal`)
2. **Bug 2 (P1)**: Prevent duplicate session counts - track completed session IDs to prevent re-firing `onComplete`
3. **Bug 3 (P2)**: Add persistent break start UI - show button/banner when in completed state awaiting break
4. **Bug 4 (P3)**: Enable skip break - wire up existing `skip()` function for "Start Focus" action in completed state

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18  
**Primary Dependencies**: 
- React Hooks (useState, useEffect, useRef, useCallback) - already in use
- localStorage via existing storage utils (`getStorageItem`, `setStorageItem`)
- Existing timer hooks: `useTimer`, `useSessionTracking`, `useNotifications`

**Storage**: localStorage (browser native, already implemented)  
**Testing**: Jest + React Testing Library (already configured)  
**Target Platform**: Modern browsers with localStorage support (Chrome 90+, Firefox 88+, Safari 14+)

**Project Type**: Single-page React web application (bug fixes to existing feature)

**Performance Goals**: 
- Fix accuracy to ±1 second (currently ±2 seconds)
- Completion tracking check: <1ms overhead
- No new performance regression

**Constraints**: 
- Must maintain backwards compatibility with feature 006 localStorage structure
- Must not break existing timer pause/resume/reset functionality
- Must not break existing session tracking (useSessionTracking hook)
- Completion tracking state must be minimal (<50 bytes per session)

**Scale/Scope**: 
- 4 bug fixes in existing code
- Estimated changes: ~50-80 lines across 2-3 files
- No new dependencies required
- No breaking changes to existing features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: No constitution file found (template placeholder only)

**Default Quality Gates Applied**:

- ✅ **Testability**: All 4 bugs are easily testable with time mocking and state inspection
- ✅ **Maintainability**: Fixes enhance existing code without adding complexity
- ✅ **Simplicity**: Uses existing infrastructure (localStorage, existing hooks)
- ✅ **No Breaking Changes**: Backwards compatible, fixes bugs in recently added feature
- ✅ **Documentation**: Will document all bug fixes and root causes

**Assessment**: No violations. Bug fixes improve reliability and accuracy without introducing new complexity or dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/007-fix-timer-state-bugs/
├── plan.md              # This file
├── research.md          # Phase 0 output (bug analysis, fix patterns)
├── data-model.md        # Phase 1 output (completion tracking structure)
├── quickstart.md        # Phase 1 output (testing instructions for each bug)
└── contracts/           # Phase 1 output (updated hook interfaces)
```

### Source Code (repository root)

```text
# Existing Files to Modify
src/hooks/
└── useTimer.ts          # MODIFY: Fix bugs 1, 2, 4 (time calc, completion tracking, skip break)

src/components/
└── App.tsx              # MODIFY: Add persistent break start UI (bug 3)

src/types/
└── timer.ts             # ADD: CompletionRecord interface for tracking

# Test Files to Add/Modify
tests/unit/hooks/
└── useTimer.test.ts     # ADD: Tests for all 4 bug fixes

tests/integration/
└── TimerBugFixes.test.tsx # ADD: Integration tests for bug scenarios
```

**Structure Decision**: Bug fixes to existing feature 006. Primary changes in `useTimer.ts` where the bugs originated. Minimal UI changes in `App.tsx` for persistent break start option.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This section is not applicable.

---

## Phase 0: Research

**Status**: Complete

### Research Topic 1: Root Cause Analysis - Bug 1 (2-second Time Jump)

**Problem**: Timer shows 24:35, refresh jumps to 24:37 (2 seconds forward)

**Root Cause Investigation**:

Current code (lines 42-44 in useTimer.ts):
```typescript
const elapsedTime = Date.now() - saved.startedAt;
const calculatedRemaining = saved.remaining - elapsedTime;
```

**Bug**: The calculation `saved.remaining - elapsedTime` is incorrect because:
1. `saved.remaining` was already decremented during the last timer run (every 100ms)
2. `elapsedTime` is calculated from `startedAt` which was set when timer STARTED, not when page loaded
3. This creates a double-counting situation:
   - Time was already subtracted during the interval updates
   - Now we subtract the total elapsed time again on restore
4. The 2-second jump is likely the time between last save and refresh

**Correct Calculation**:
```typescript
// Should calculate from ORIGINAL duration, not current remaining
const elapsedFromStart = Date.now() - saved.startedAt;
const calculatedRemaining = saved.duration - elapsedFromStart;
```

**Decision**: Calculate remaining time from `duration - elapsedFromStart` instead of `remaining - elapsedTime`

**Rationale**:
- `startedAt` represents when timer first started (not current session)
- `duration` is the total timer length
- Elapsed from start = current time - start time
- Remaining = duration - elapsed (simple, accurate, no cumulative errors)

**Alternatives Considered**:
1. **Update remaining on save**: Too complex, requires tracking last save time
2. **Reset startedAt on each save**: Breaks wall-clock calculation across refreshes
3. **Store elapsed instead of remaining**: More complex, requires refactoring

### Research Topic 2: Completion Tracking - Bug 2 (Duplicate Counts)

**Problem**: Refreshing after completion increments count by 2 each time

**Root Cause Investigation**:

Current code (lines 103-108 in useTimer.ts):
```typescript
useEffect(() => {
  if (session.status === 'completed' && session.remaining === 0) {
    onComplete(session.mode);
  }
}, []); // Runs once on mount
```

**Bug**: This runs on EVERY page load/refresh when status is 'completed':
1. User completes timer → status set to 'completed' → onComplete called → count+1
2. User refreshes page → status still 'completed' → useEffect runs → onComplete called AGAIN → count+1
3. Each refresh calls onComplete again because there's no tracking

**Decision**: Track completed session IDs in localStorage to prevent duplicate onComplete calls

**Pattern**:
```typescript
interface CompletionRecord {
  sessionId: string;        // Unique ID for each timer session
  completedAt: number;      // Timestamp when completed
  mode: TimerMode;          // Mode that completed
}

// On restore, check if this completion already processed
const lastCompletion = getStorageItem<CompletionRecord>('last_completion');
if (session.status === 'completed' && 
    (!lastCompletion || lastCompletion.sessionId !== session.sessionId)) {
  onComplete(session.mode);
  setStorageItem('last_completion', {
    sessionId: session.sessionId,
    completedAt: Date.now(),
    mode: session.mode
  });
}
```

**Session ID Generation**:
- Generate unique ID when timer starts: `${Date.now()}-${mode}`
- Store in TimerSession: `sessionId: string`
- Check on restore to prevent duplicate onComplete

**Alternatives Considered**:
1. **Boolean flag**: Too simple, doesn't handle multiple completions correctly
2. **Completion timestamp**: Ambiguous if user completes same mode twice
3. **Array of completed IDs**: Overkill, only need to track last completion

### Research Topic 3: Persistent Break Start UI - Bug 3 (Stuck State)

**Problem**: After dismissing notification, no way to start break

**Current State**:
- Completion notification appears (banner with "Start Break" button)
- User dismisses or notification auto-disappears
- No other UI element to start break
- User is stuck

**Decision**: Add persistent "Start Break" button when in completed state

**UI Pattern**:
```typescript
// In App.tsx or Timer component
{timer.status === 'completed' && breakPending && (
  <div className="break-pending-actions">
    <button onClick={handleStartBreak}>
      Start {nextBreakType} Break
    </button>
    <button onClick={handleSkipBreak}>
      Skip Break
    </button>
  </div>
)}
```

**State Management**:
- Add `breakPending: boolean` to TimerSession or separate state
- Set to `true` when focus timer completes
- Set to `false` when break starts or user skips
- Persist in localStorage to survive refresh

**Location**: Below timer display, above controls (always visible)

**Alternatives Considered**:
1. **Persistent notification**: Clutters UI, notification should be dismissible
2. **Modal dialog**: Too intrusive for this workflow
3. **Hidden until hover**: Not discoverable enough

### Research Topic 4: Skip Break Implementation - Bug 4 (Non-functional Button)

**Problem**: "Start Focus" button appears but does nothing when clicked

**Current Code Analysis**:
- `skip()` function exists in useTimer (lines 166-181)
- Calls `onComplete()` and transitions to completed state
- Should work for skipping current timer, but may not work for skipping break

**Decision**: Add explicit "skip break and start focus" function

**Implementation**:
```typescript
const skipBreakAndStartFocus = useCallback(() => {
  // When in completed state after focus session
  if (session.status === 'completed' && session.mode === 'focus') {
    // Don't call onComplete (already called for focus completion)
    // Just start a new focus session
    switchMode('focus'); // Resets to idle focus state
    // Then immediately start
    start();
  }
}, [session.status, session.mode, switchMode, start]);
```

**Wiring**: Pass function to UI component as `onSkipBreak` prop

**Alternatives Considered**:
1. **Reuse skip() function**: Doesn't fit completed→focus transition
2. **Auto-start after mode switch**: Breaks existing behavior
3. **Reset then start**: Two steps, less user-friendly

---

## Phase 1: Design & Contracts

**Status**: Complete

### Data Model

See [data-model.md](./data-model.md) for complete structures.

**Key Data Model Changes**:

```typescript
// Add to TimerSession interface
interface TimerSession {
  mode: TimerMode;
  duration: number;
  remaining: number;
  status: TimerStatus;
  startedAt: number | null;
  sessionId: string;        // NEW: Unique ID for completion tracking
}

// New interface for completion tracking
interface CompletionRecord {
  sessionId: string;
  completedAt: number;
  mode: TimerMode;
}

// localStorage keys
const STORAGE_KEYS = {
  TIMER_STATE: 'pomodoro_timer_state',
  LAST_COMPLETION: 'pomodoro_last_completion',  // NEW
  SESSION_PROGRESS: 'pomodoro_session_progress'
};
```

### Contracts

See [contracts/timer-hook.md](./contracts/timer-hook.md) for complete interface.

**Updated useTimer Interface**:

```typescript
export interface UseTimerReturn {
  mode: TimerMode;
  remaining: number;
  duration: number;
  status: TimerStatus;
  sessionId: string;          // NEW: Expose for UI/debugging
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (mode: TimerMode) => void;
  skipBreakAndStartFocus: () => void;  // NEW: Bug 4 fix
}
```

**No breaking changes** - only additions for new functionality.

### Quickstart

See [quickstart.md](./quickstart.md) for complete testing guide.

**Quick Test Scenarios**:

**Bug 1 Test**:
```bash
1. Start timer, wait until 24:35 shown
2. Note exact time
3. Refresh page (F5)
4. Verify timer shows 24:35 (±1 sec), not 24:37
```

**Bug 2 Test**:
```bash
1. Complete timer (count = 1)
2. Wait on notification screen
3. Refresh 5 times
4. Verify count still = 1, not 3/5/7
```

**Bug 3 Test**:
```bash
1. Complete timer
2. Dismiss notification
3. Verify "Start Break" button visible
4. Click button → break starts
```

**Bug 4 Test**:
```bash
1. Complete timer
2. Click "Start Focus" (skip break)
3. Verify new focus timer starts
4. Verify count incremented correctly
```

---

## Implementation Changes Required

### Change 1: Fix Time Calculation (Bug 1) - useTimer.ts

**Location**: `src/hooks/useTimer.ts` lines 42-44

**Current Code** (BUGGY):
```typescript
const elapsedTime = Date.now() - saved.startedAt;
const calculatedRemaining = saved.remaining - elapsedTime;
```

**Problem**: Uses `saved.remaining` which was already decremented. Creates cumulative error.

**New Code** (FIXED):
```typescript
// Calculate from original duration, not current remaining
const elapsedFromStart = Date.now() - saved.startedAt;
const calculatedRemaining = saved.duration - elapsedFromStart;
```

**Rationale**: `duration` is constant, `startedAt` is when timer first started. Simple subtraction gives accurate remaining time.

---

### Change 2: Add Session ID Generation (Bug 2 Setup) - useTimer.ts

**Location**: `src/hooks/useTimer.ts` start function (line 129)

**Current Code**:
```typescript
setSession((prev) => ({
  ...prev,
  status: 'running',
  startedAt: Date.now(),
}));
```

**New Code**:
```typescript
const sessionId = `${Date.now()}-${prev.mode}`;
setSession((prev) => ({
  ...prev,
  status: 'running',
  startedAt: Date.now(),
  sessionId,  // NEW: Unique ID for this timer session
}));
```

**Also update**: TimerSession interface in `types/timer.ts` to add `sessionId: string` field.

---

### Change 3: Add Completion Tracking (Bug 2 Fix) - useTimer.ts

**Location**: `src/hooks/useTimer.ts` lines 103-108 (completion handler)

**Current Code** (BUGGY):
```typescript
useEffect(() => {
  if (session.status === 'completed' && session.remaining === 0) {
    onComplete(session.mode);
  }
}, []);
```

**New Code** (FIXED):
```typescript
useEffect(() => {
  if (session.status === 'completed' && session.remaining === 0) {
    // Check if this completion already processed
    const lastCompletion = getStorageItem<CompletionRecord>(
      STORAGE_KEYS.LAST_COMPLETION,
      null
    );
    
    const isAlreadyProcessed = 
      lastCompletion && 
      lastCompletion.sessionId === session.sessionId;
    
    if (!isAlreadyProcessed) {
      // First time seeing this completion
      onComplete(session.mode);
      
      // Record completion to prevent duplicates
      setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
        sessionId: session.sessionId,
        completedAt: Date.now(),
        mode: session.mode
      });
    }
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

**Also add**: `CompletionRecord` interface to `types/timer.ts`

---

### Change 4: Add Skip Break Function (Bug 4 Fix) - useTimer.ts

**Location**: `src/hooks/useTimer.ts` add new function after skip()

**New Code**:
```typescript
// Skip break and immediately start new focus session
const skipBreakAndStartFocus = useCallback(() => {
  if (session.status !== 'completed' || session.mode !== 'focus') return;
  
  // Clear interval if any
  if (intervalRef.current !== null) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  
  // Switch to focus mode (resets to idle)
  const duration = getDurationForMode('focus', preferences);
  
  setSession({
    mode: 'focus',
    duration,
    remaining: duration,
    status: 'idle',
    startedAt: null,
    sessionId: `${Date.now()}-focus`,
  });
  
  // Auto-start the focus timer
  // Use setTimeout to ensure state update completes first
  setTimeout(() => {
    start();
  }, 0);
}, [session.status, session.mode, preferences, start]);
```

**Return** in UseTimerReturn interface: Add `skipBreakAndStartFocus` to exports

---

### Change 5: Add Persistent Break Start UI (Bug 3 Fix) - App.tsx

**Location**: `src/components/App.tsx` in timer display area

**Current Code**: Timer component renders with notification banner

**New Code**: Add persistent break actions UI

```typescript
{/* Add after Timer component */}
{timer.status === 'completed' && timer.mode === 'focus' && (
  <div className="break-pending-actions">
    <p className="break-pending-message">
      Focus session complete! Time for a break.
    </p>
    <div className="break-action-buttons">
      <button 
        className="btn-primary" 
        onClick={handleStartBreak}
      >
        Start {nextBreakType()} Break
      </button>
      <button 
        className="btn-secondary" 
        onClick={timer.skipBreakAndStartFocus}
      >
        Skip Break - Start Focus
      </button>
    </div>
  </div>
)}
```

**Helper functions needed**:
```typescript
const handleStartBreak = () => {
  const breakMode = determineNextBreakMode(sessionTracking);
  timer.switchMode(breakMode);
  timer.start();
};

const nextBreakType = () => {
  const shouldBeLongBreak = (sessionTracking.cyclePosition % 4) === 0;
  return shouldBeLongBreak ? 'Long' : 'Short';
};
```

**CSS** (add to App.css):
```css
.break-pending-actions {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--color-warning-light);
  border-radius: 8px;
  text-align: center;
}

.break-pending-message {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.break-action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
```

---

## Testing Strategy

### Unit Tests (tests/unit/hooks/useTimer.test.ts)

**New Test Cases for Bug Fixes**:

1. ✅ **Bug 1 - Time Accuracy**:
   - Test: Restore running timer, verify no 2-second jump
   - Test: Multiple refreshes don't create cumulative errors
   - Test: Elapsed time calculation uses duration not remaining

2. ✅ **Bug 2 - Duplicate Count Prevention**:
   - Test: Completion handler only fires once per sessionId
   - Test: Refresh after completion doesn't call onComplete
   - Test: Different sessionIds trigger separate completions

3. ✅ **Bug 4 - Skip Break**:
   - Test: skipBreakAndStartFocus starts new focus timer
   - Test: sessionId updated correctly on skip
   - Test: Count incremented when break skipped

### Integration Tests (tests/integration/TimerBugFixes.test.tsx)

**New Test Scenarios**:

1. ✅ **Bug 1 Full Flow**: Start timer (24:35) → refresh → verify 24:35 (±1s)
2. ✅ **Bug 2 Full Flow**: Complete timer → refresh 5x → verify count = 1
3. ✅ **Bug 3 Full Flow**: Complete → dismiss notification → verify button → click → break starts
4. ✅ **Bug 4 Full Flow**: Complete → click skip break → new focus starts → count correct

---

## Performance Considerations

**Completion Check Overhead**:
- localStorage read for lastCompletion: <1ms
- sessionId comparison: <0.1ms
- Total overhead: <1ms per page load
- Negligible impact ✅

**Session ID Storage**:
- sessionId: ~20 bytes (timestamp + mode)
- CompletionRecord: ~50 bytes total
- No memory leaks (single record, overwritten)
- Storage impact: Negligible ✅

**Time Calculation Fix**:
- Changed from `remaining - elapsed` to `duration - elapsed`
- Same computational complexity (one subtraction)
- No performance change
- Accuracy improvement: ±2s → ±1s ✅

---

## Risk Assessment

**Low Risk** ✅

**Risks**:
1. **Breaking backwards compatibility**: Mitigated by adding sessionId with default value
2. **Session ID collisions**: Minimal risk with timestamp-based IDs
3. **localStorage unavailable**: Already handled by existing fallback logic
4. **UI layout shift**: Mitigated by fixed placement for break actions

**Mitigation**:
- Comprehensive test coverage (unit + integration)
- Backwards compatible data model changes
- Default values for new fields
- Graceful degradation for all edge cases
- Code review before merge

---

## Next Steps

1. ✅ Plan created (this file)
2. ✅ Research complete (bug root causes identified)
3. ✅ Design complete (data model, contracts, quickstart)
4. ⏳ Run `/speckit.tasks` to generate implementation tasks
5. ⏳ Implement bug fixes (4 changes across 2-3 files)
6. ⏳ Add unit and integration tests
7. ⏳ Manual testing for all 4 bugs
8. ⏳ Code review and merge

**Planning Status**: Complete ✅  
**Ready for**: Task generation (`/speckit.tasks`)

**Estimated Implementation Time**: 2-3 hours
- Bug 1 fix (time calculation): ~30 minutes
- Bug 2 fix (completion tracking): ~45 minutes
- Bug 3 fix (persistent UI): ~30 minutes
- Bug 4 fix (skip break): ~15 minutes
- Testing (unit + integration): ~45 minutes
- Manual verification: ~15 minutes
