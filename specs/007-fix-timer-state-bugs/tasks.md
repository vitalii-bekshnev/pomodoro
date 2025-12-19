# Implementation Tasks: Fix Timer 2-Second Jump Bug (US1)

**Feature**: `007-fix-timer-state-bugs`  
**Branch**: `007-fix-timer-state-bugs`  
**Status**: Ready for implementation  
**Scope**: Bug 1 only - Fix timer 2-second jump on refresh

---

## Overview

This document contains tasks for fixing Bug 1 (P1): Timer jumps 2 seconds forward on page refresh (24:35 → 24:37).

**Root Cause**: Timer restoration uses `saved.remaining - elapsedTime` which double-counts time already decremented during the last run.

**Fix**: Change calculation to `saved.duration - elapsedFromStart` to use constant baseline.

**Impact**: ~2 lines changed in `src/hooks/useTimer.ts`

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential (T001, T002...)
- **[P]**: Parallelizable
- **[Story]**: User story label ([US1])
- **File path**: Exact file location

---

## User Story Mapping

| User Story | Priority | Phase | Description |
|------------|----------|-------|-------------|
| US1 | P1 | Phase 2 | Fix 2-second time jump (accurate timer restoration) |

---

## Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: US1 - Fix Time Calculation ← ONLY BUG TO FIX
    ↓
Phase 3: Verification & Testing
```

---

## Phase 1: Setup and Prerequisites

**Goal**: Prepare development environment and understand current buggy implementation

**Duration**: ~5 minutes

### Tasks

- [ ] T001 Verify on feature branch `007-fix-timer-state-bugs`
- [ ] T002 Read current buggy implementation in `src/hooks/useTimer.ts` (lines 42-44)
- [ ] T003 Understand the bug: `saved.remaining - elapsedTime` uses wrong baseline
- [ ] T004 Review research.md for detailed bug analysis (Bug 1 section)
- [ ] T005 Confirm dev server can run: `npm run dev`

**Acceptance**: Environment ready, buggy code location identified, root cause understood

---

## Phase 2: User Story 1 - Fix Time Calculation Bug (P1) 🎯

**Goal**: Fix 2-second time jump by changing calculation to use duration as baseline

**Duration**: ~15-20 minutes

**Priority**: P1 (Critical - affects all timer refreshes)

**Independent Test**: Start timer at 24:35 → Refresh page → Timer shows 24:35 (±1s), not 24:37

### Tasks

#### Core Fix

- [ ] T006 [US1] Open `src/hooks/useTimer.ts` and locate line 43 (buggy calculation)
- [ ] T007 [US1] Change line 43 from `const elapsedTime = Date.now() - saved.startedAt` to `const elapsedFromStart = Date.now() - saved.startedAt`
- [ ] T008 [US1] Change line 44 from `const calculatedRemaining = saved.remaining - elapsedTime` to `const calculatedRemaining = saved.duration - elapsedFromStart`
- [ ] T009 [US1] Add comment above calculation explaining the fix: "// Calculate from original duration (constant), not remaining (already decremented)"
- [ ] T010 [US1] Save file and verify no TypeScript errors

#### Manual Testing

- [ ] T011 [US1] Start dev server if not running: `npm run dev`
- [ ] T012 [US1] Open browser to http://localhost:5173
- [ ] T013 [US1] Start focus timer and wait until shows 24:35 remaining
- [ ] T014 [US1] Note exact time shown (e.g., 24:35)
- [ ] T015 [US1] Refresh page (F5)
- [ ] T016 [US1] Verify timer shows 24:35 (±1 second), NOT 24:37
- [ ] T017 [US1] Test with short break timer: start, wait to 4:20, refresh, verify 4:20 (±1s)
- [ ] T018 [US1] Test rapid refreshes: refresh 5 times quickly, verify no cumulative errors
- [ ] T019 [US1] Test wall-clock accuracy: note time, wait 5 seconds, refresh, verify time decreased by ~5 seconds

#### Browser Console Verification

- [ ] T020 [US1] Open browser console (F12)
- [ ] T021 [US1] Check localStorage before refresh: `JSON.parse(localStorage.getItem('pomodoro_timer_state'))`
- [ ] T022 [US1] Note values: `duration`, `remaining`, `startedAt`
- [ ] T023 [US1] Calculate expected after refresh: `duration - (Date.now() - startedAt)`
- [ ] T024 [US1] Refresh page
- [ ] T025 [US1] Check localStorage after refresh, verify `remaining` matches expected (±1000ms)

#### Code Quality

- [ ] T026 [US1] Review the 2-line change for correctness
- [ ] T027 [US1] Ensure variable name changed from `elapsedTime` to `elapsedFromStart` for clarity
- [ ] T028 [US1] Verify comment added explaining why `duration` is used instead of `remaining`
- [ ] T029 [US1] Run linter: `npm run lint` (fix any issues)
- [ ] T030 [US1] Run type check: `npm run typecheck` (fix any issues)

#### Commit Changes

- [ ] T031 [US1] Stage changes: `git add src/hooks/useTimer.ts`
- [ ] T032 [US1] Commit with descriptive message: "Fix Bug 1: Correct timer restoration calculation to prevent 2-second jump"
- [ ] T033 [US1] Commit message body: Explain the bug (remaining vs duration) and the fix

**Acceptance Scenarios**:
1. ✅ Focus timer at 24:35 → refresh → shows 24:35 (±1s), not 24:37
2. ✅ Short break at 4:20 → refresh → shows 4:20 (±1s)
3. ✅ Timer running, wait 5s, refresh → time decreased by ~5s (wall-clock accurate)
4. ✅ Rapid refreshes (5x) → no cumulative errors, each accurate

**Independent Test Result**: Timer restoration accurate within ±1 second, 2-second jump eliminated

---

## Phase 3: Verification & Documentation

**Goal**: Verify fix works correctly and document the change

**Duration**: ~10 minutes

### Tasks

#### Comprehensive Testing

- [ ] T034 Test all 3 timer modes (focus, short break, long break) with refresh
- [ ] T035 Test at different time points (beginning, middle, near end of timer)
- [ ] T036 Test with rapid refreshes (10x in a row)
- [ ] T037 Test with paused timer (should NOT use wall-clock calculation, still exact time)
- [ ] T038 Test with idle timer (should restore to saved remaining)

#### Edge Case Verification

- [ ] T039 Test: Timer at 0:01, refresh, verify doesn't go negative
- [ ] T040 Test: Timer just started (25:00), refresh, verify stays at ~25:00
- [ ] T041 Test: Multiple timers in sequence with refreshes between
- [ ] T042 Verify no regression in paused timer restoration (exact time preserved)
- [ ] T043 Verify no regression in idle timer restoration

#### Documentation

- [ ] T044 Update `specs/007-fix-timer-state-bugs/spec.md` status for Bug 1 to "Fixed"
- [ ] T045 Add note to research.md confirming fix applied
- [ ] T046 Document before/after code comparison in commit message (if not already)

#### Final Validation

- [ ] T047 Review git diff to confirm only 2-3 lines changed
- [ ] T048 Ensure no unintended changes to other parts of useTimer.ts
- [ ] T049 Verify localStorage structure unchanged (backwards compatible)
- [ ] T050 Test in multiple browsers (Chrome, Firefox, Safari if available)

**Acceptance**: 
- Bug 1 completely fixed
- All test scenarios pass
- No regressions in other timer functionality
- Changes documented

---

## Task Summary

| Phase | Description | Task Count | Duration | Status |
|-------|-------------|------------|----------|--------|
| 1 | Setup | 5 | ~5 min | ⏳ Pending |
| 2 | US1: Fix Bug 1 | 28 | ~20 min | ⏳ Pending |
| 3 | Verification | 17 | ~10 min | ⏳ Pending |
| **Total** | **Bug 1 Fix** | **50** | **~35 min** | ⏳ Pending |

---

## Code Change Summary

**File**: `src/hooks/useTimer.ts`  
**Lines**: 43-44 (2 lines changed, 1 comment added)

**Before (BUGGY)**:
```typescript
const elapsedTime = Date.now() - saved.startedAt;
const calculatedRemaining = saved.remaining - elapsedTime;
```

**After (FIXED)**:
```typescript
// Calculate from original duration (constant), not remaining (already decremented)
const elapsedFromStart = Date.now() - saved.startedAt;
const calculatedRemaining = saved.duration - elapsedFromStart;
```

**Impact**: Eliminates 2-second jump, restores ±1 second accuracy

---

## Success Criteria Validation

### User Story 1 - Accurate Timer Restoration

| Scenario | Expected | Test Method | Status |
|----------|----------|-------------|--------|
| Timer at 24:35 → refresh | Shows 24:35 (±1s) not 24:37 | Manual test (T013-T016) | ⏳ |
| Short break 4:20 → refresh | Shows 4:20 (±1s) | Manual test (T017) | ⏳ |
| Wait 5s, refresh | Time decreased by ~5s | Manual test (T019) | ⏳ |
| Rapid 5x refreshes | No cumulative errors | Manual test (T018) | ⏳ |

---

## Testing Checklist

### Manual Tests (Required)
- [ ] Focus timer refresh at 24:35 (primary bug scenario)
- [ ] Short break timer refresh at 4:20
- [ ] Long break timer refresh at any time
- [ ] Timer refresh after waiting 5 seconds
- [ ] Rapid refreshes (5-10x in a row)
- [ ] Timer at start (25:00) refresh
- [ ] Timer near end (0:10) refresh
- [ ] Paused timer refresh (should be exact, no wall-clock calc)
- [ ] Idle timer refresh (should preserve time)

### Browser Console Tests (Recommended)
- [ ] Verify `duration` used in calculation (not `remaining`)
- [ ] Verify localStorage `remaining` matches `duration - elapsed`
- [ ] Verify no cumulative error after multiple refreshes

### Regression Tests (Critical)
- [ ] Paused timer still shows exact time (no calculation)
- [ ] Idle timer still restores correctly
- [ ] Timer controls still work (pause, resume, reset, skip)
- [ ] Completion detection still works
- [ ] Session tracking not affected

---

## Debugging Quick Reference

**If timer still jumps**:
```javascript
// In browser console
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
const elapsed = Date.now() - state.startedAt;
const shouldBe = state.duration - elapsed;
const actualIs = state.remaining;
console.log('Expected:', Math.floor(shouldBe/1000), 'Actual:', Math.floor(actualIs/1000));
// Should match within 1-2 seconds
```

**If calculation wrong**:
- Check: Is `duration` being used (not `remaining`)?
- Check: Is `elapsedFromStart` calculated from `startedAt`?
- Check: Is result clamped to [0, duration]?

---

## Implementation Notes

### Why This Fix Works

**Problem**: 
- `saved.remaining` was already decremented by the timer interval (every 100ms)
- Subtracting `elapsedTime` again creates double-counting
- Example: Timer started, ran 5min, remaining = 20min, elapsed = 5min
  - Buggy: 20min - 5min = 15min (WRONG, should be 20min)
  - Fixed: 25min - 5min = 20min (CORRECT)

**Solution**:
- Use `duration` (constant, never changes) as baseline
- Subtract elapsed time from start
- Simple, accurate, no cumulative errors

**Performance**: No impact (same complexity, just different baseline)

**Backwards Compatibility**: Yes (only changes calculation, not data structure)

---

## Next Steps

After Bug 1 is fixed and verified:

1. **Test Bug 1 thoroughly** (all scenarios above)
2. **Commit the fix** with clear message
3. **Optional**: Fix remaining bugs (2, 3, 4) if needed
4. **Optional**: Add automated tests for Bug 1
5. **Merge** to master when confident

---

**Status**: 📝 Task list complete, ready for implementation  
**Focus**: Bug 1 only (2-second time jump)  
**Estimated Time**: ~35 minutes  
**Code Impact**: 2-3 lines in one file  
**Risk**: Very low - simple calculation fix

---

## Quick Start

**To implement Bug 1 fix immediately**:

1. Open `src/hooks/useTimer.ts`
2. Go to lines 43-44
3. Change:
   - Line 43: `elapsedTime` → `elapsedFromStart`
   - Line 44: `saved.remaining` → `saved.duration`
4. Add comment: `// Calculate from original duration (constant), not remaining (already decremented)`
5. Save, test with refresh, verify 24:35 stays 24:35
6. Commit: "Fix Bug 1: Correct timer restoration calculation"

**Done!** Bug 1 fixed in ~3 minutes of coding + ~20 minutes of testing.

