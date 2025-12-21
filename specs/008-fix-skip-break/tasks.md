# Implementation Tasks: Fix Skip Break Button Behavior

**Feature**: `008-fix-skip-break`  
**Branch**: `008-fix-skip-break`  
**Date**: December 21, 2025

---

## Summary

Fix broken Skip Break button behavior by implementing auto-transition from focus complete to break mode. Research revealed that Bug 3 already implements auto-start functionality correctly in button handlers. The only missing piece is automatic mode transition when focus timer completes.

**Implementation scope**:
- **1 file to modify**: `src/components/App.tsx`
- **1 function to modify**: `handleTimerComplete` (add ~5 lines)
- **Estimated effort**: ~1 hour (30 min implementation, 30 min testing)

---

## User Stories

### User Story 1 (P1) - Auto-Transition After Focus Complete
**Goal**: Timer automatically transitions from focus to break mode when focus session completes  
**Independent Test**: Complete focus → Verify auto-switch to break idle → Click "Start Break" → Verify starts immediately  
**Status**: ❌ Not implemented (core fix needed)

### User Story 2 (P2) - Auto-Transition After Skip Break
**Goal**: Timer immediately switches to focus and starts running when "Skip Break - Start Focus" clicked  
**Independent Test**: Complete focus → Click "Skip Break - Start Focus" → Verify focus starts running immediately  
**Status**: ✅ Already implemented in Bug 3 (`handleSkipBreak` calls `switchMode` + `start`)

### User Story 3 (P3) - Auto-Start After Start Break/Focus Click
**Goal**: Break and focus timers start immediately on button clicks (no double-click)  
**Independent Test**: Complete focus → Click "Start Break" → Verify break starts running immediately  
**Status**: ✅ Already implemented in Bug 3 (`handleStartBreak` calls `switchMode` + `start`)

---

## Implementation Strategy

**MVP Scope**: User Story 1 (P1) only - auto-transition on focus complete  
**Reason**: User Stories 2 and 3 are already implemented by Bug 3. Only US1 needs implementation.

**Incremental Delivery**:
1. Phase 1: Setup - Review current code
2. Phase 2: Implement US1 - Add auto-transition logic
3. Phase 3: Manual Testing - Verify all 3 user stories
4. Phase 4: Documentation - Update spec status

---

## Dependencies

### Story Dependencies
```
Phase 1 (Setup) ─┐
                 ├─> Phase 2 (US1 Implementation) ─> Phase 3 (Testing) ─> Phase 4 (Documentation)
                 │
                 └─> (US2 & US3 already complete - no action needed)
```

**Critical Path**: Setup → US1 Implementation → Testing  
**Parallel Opportunities**: None (single file modification)

---

## Phase 1: Setup & Code Review

**Goal**: Understand current implementation and verify Bug 3 completeness

**Tasks**:

- [x] T001 Review current `handleTimerComplete` implementation in src/components/App.tsx (lines 45-63)
- [x] T002 Verify `handleStartBreak` already calls `timer.start()` after `timer.switchMode()` in src/components/App.tsx (line 113)
- [x] T003 Verify `handleSkipBreak` already calls `timer.start()` after `timer.switchMode()` in src/components/App.tsx (line 120)
- [x] T004 Review `getNextBreakMode()` function from `useSessionTracking` hook to understand break type selection logic
- [x] T005 Review Bug 3 persistent UI implementation in src/components/App.tsx (lines 158-173) to understand when buttons appear

**Completion Criteria**:
- ✅ Confirmed `handleStartBreak` and `handleSkipBreak` already implement auto-start (US2, US3)
- ✅ Confirmed `handleTimerComplete` does NOT auto-transition (US1 missing)
- ✅ Understood how `getNextBreakMode()` determines short vs long break

---

## Phase 2: User Story 1 - Auto-Transition After Focus Complete (P1)

**Goal**: Add automatic mode transition from focus complete to break idle state

### Independent Test Criteria for US1

**Test**: Complete a focus timer → Verify auto-transition to break mode
- ✅ Timer automatically switches to "Short Break" or "Long Break" mode
- ✅ Timer shows correct break duration (05:00 for short, 15:00 for long)
- ✅ Timer status is "idle" (not "running", not "completed")
- ✅ "Start Break" button appears in persistent UI
- ✅ Session count increments to 1
- ✅ After 4th focus, timer auto-transitions to long break (15:00)

### Implementation Tasks

- [x] T006 [US1] Add auto-transition logic to `handleTimerComplete` function in src/components/App.tsx after line 60
- [x] T007 [US1] Add conditional check for `mode === 'focus'` to trigger auto-transition
- [x] T008 [US1] Call `getNextBreakMode()` to determine if short or long break
- [x] T009 [US1] Call `timer.switchMode(nextBreakMode)` to transition to break mode
- [x] T010 [US1] Update `handleTimerComplete` dependency array to include `timer` and `getNextBreakMode`

**Implementation Pattern**:
```typescript
// In handleTimerComplete, after showBanner(mode):
// NEW: Auto-transition from focus to break
if (mode === 'focus') {
  const nextBreakMode = getNextBreakMode();
  timer.switchMode(nextBreakMode);
}
```

**File Changes**:
- `src/components/App.tsx`: Modify `handleTimerComplete` function (lines 45-63)
  - Add 4 lines of code after line 60
  - Update dependency array on line 62

**Estimated LOC**: +5 lines (4 new lines + 1 dependency update)

---

## Phase 3: Manual Testing

**Goal**: Verify all 3 user stories pass acceptance criteria

### Test Scenario 1: Auto-Transition on Focus Complete (US1 - CRITICAL)

- [ ] T011 [US1] Start dev server (`npm run dev`) and open browser to http://localhost:5173
- [ ] T012 [US1] Start focus timer and click "Skip" button to complete immediately
- [ ] T013 [US1] Verify timer automatically switches to "Short Break" mode with 05:00 duration
- [ ] T014 [US1] Verify timer status shows idle (not completed, not running)
- [ ] T015 [US1] Verify "Start Break" button appears in persistent UI below timer
- [ ] T016 [US1] Verify "Pomodoros completed today" count incremented to 1
- [ ] T017 [US1] Click "Start Break" button and verify break timer starts immediately (countdown begins)

**Expected Result**: ✅ Focus completion auto-transitions to break idle, "Start Break" works

---

### Test Scenario 2: Long Break After 4th Focus (US1 - CRITICAL)

- [ ] T018 [US1] Complete 3 more focus sessions (click Skip 3 times)
- [ ] T019 [US1] After 4th focus completes, verify timer auto-transitions to "Long Break" (not "Short Break")
- [ ] T020 [US1] Verify long break duration is 15:00 (900 seconds)
- [ ] T021 [US1] Verify cycle indicator shows 4/4 or resets to 0/4

**Expected Result**: ✅ 4th focus completion auto-transitions to long break (15 min)

---

### Test Scenario 3: Persistence Across Refresh (US1)

- [ ] T022 [US1] Complete a focus timer (should auto-transition to break idle)
- [ ] T023 [US1] Refresh page (F5) and verify timer remains in break mode (not focus mode)
- [ ] T024 [US1] Verify break duration is preserved (05:00 or 15:00)
- [ ] T025 [US1] Verify "Start Break" button still appears after refresh
- [ ] T026 [US1] Click "Start Break" and verify timer starts normally

**Expected Result**: ✅ Auto-transition state persists across page refresh

---

### Test Scenario 4: Skip Break Auto-Start (US2 - Verify Bug 3)

- [ ] T027 [US2] Complete a focus timer (auto-transitions to break idle)
- [ ] T028 [US2] Click "Skip Break - Start Focus" button from persistent UI
- [ ] T029 [US2] Verify timer IMMEDIATELY switches to "Focus Time" mode AND starts running
- [ ] T030 [US2] Verify no idle state visible (countdown begins immediately: 25:00 → 24:59 → 24:58...)
- [ ] T031 [US2] Verify session count does NOT increment (skip doesn't complete break)

**Expected Result**: ✅ Skip break immediately switches to focus and starts running

---

### Test Scenario 5: Start Break Auto-Start (US3 - Verify Bug 3)

- [ ] T032 [US3] Complete a focus timer (auto-transitions to break idle)
- [ ] T033 [US3] Click "Start Break" button from persistent UI
- [ ] T034 [US3] Verify break timer IMMEDIATELY starts running (no second click needed)
- [ ] T035 [US3] Verify countdown begins immediately (05:00 → 04:59 → 04:58...)
- [ ] T036 [US3] Click "Pause" and verify pause works correctly

**Expected Result**: ✅ Start break immediately starts timer running

---

### Test Scenario 6: Skip Break + Refresh (US2 Persistence)

- [ ] T037 [US2] Complete focus, click "Skip Break - Start Focus", let timer run to ~24:30
- [ ] T038 [US2] Refresh page and verify timer continues in focus mode from accurate time
- [ ] T039 [US2] Verify time is accurate within ±1 second (Bug 1 not broken)

**Expected Result**: ✅ Skip + start persists across refresh with accurate time

---

### Regression Testing

- [ ] T040 Regression: Test Bug 1 (Timer Accuracy) - Start focus, pause at 20:00, refresh, resume, run 1 min, pause, verify time is 19:00 ±1s
- [ ] T041 Regression: Test Bug 2 (Duplicate Count) - Complete focus (count=1), refresh page 5 times, verify count stays at 1
- [ ] T042 Regression: Test Bug 3 (Persistent UI) - Complete focus, dismiss notification, verify "Start Break" and "Skip Break" buttons still visible

**Expected Result**: ✅ All 3 previous bug fixes still work correctly

---

## Phase 4: Documentation & Cleanup

**Goal**: Update feature status and commit changes

- [ ] T043 Update spec.md status from "Draft" to "Implemented" in specs/008-fix-skip-break/spec.md
- [ ] T044 Create IMPLEMENTATION.md summary document in specs/008-fix-skip-break/
- [ ] T045 Commit all changes with message: "008-fix-skip-break: Implement auto-transition on focus complete"
- [ ] T046 Mark all tasks in tasks.md as complete

**Completion Criteria**:
- ✅ Spec status updated
- ✅ Implementation summary created
- ✅ All changes committed
- ✅ All tasks marked complete

---

## Quick Validation Checklist

Run these 5 tests to verify core functionality:

1. [ ] ✅ Focus completes → Auto-switches to break idle
2. [ ] ✅ Click "Start Break" → Timer runs immediately (no second click)
3. [ ] ✅ Click "Skip Break" → Focus starts running immediately
4. [ ] ✅ 4th focus → Auto-switches to long break (15 min)
5. [ ] ✅ Refresh after auto-transition → State persists

**If all 5 pass**: Feature complete! ✅  
**If any fail**: Debug that specific scenario ❌

---

## Task Summary

**Total Tasks**: 46 tasks
- Phase 1 (Setup): 5 tasks
- Phase 2 (US1 Implementation): 5 tasks
- Phase 3 (Manual Testing): 32 tasks
  - US1 tests: 16 tasks
  - US2 tests (verification): 5 tasks
  - US3 tests (verification): 5 tasks
  - Regression tests: 3 tasks
  - Persistence tests: 3 tasks
- Phase 4 (Documentation): 4 tasks

**Parallel Opportunities**: None (single file modification, sequential testing)

**Estimated Time**:
- Phase 1: 15 minutes (code review)
- Phase 2: 15 minutes (implementation)
- Phase 3: 30 minutes (manual testing)
- Phase 4: 10 minutes (documentation)
- **Total**: ~70 minutes

---

## Implementation Notes

### Key Insight from Research

**Bug 3 already implements US2 and US3**:
- `handleStartBreak`: Calls `timer.switchMode(breakType)` then `timer.start()` ✅
- `handleSkipBreak`: Calls `timer.switchMode('focus')` then `timer.start()` ✅

**Only US1 needs implementation**:
- `handleTimerComplete`: Currently does NOT call `timer.switchMode()` after focus completes ❌
- Fix: Add 4 lines to auto-transition from focus → break

### Why This Works

**Sequential state updates are safe**:
- `switchMode()` uses direct `setSession({...})`
- `start()` uses callback form `setSession((prev) => ...)`
- Even with React 18 batching, `start()` reads fresh state from `prev`

**Auto-transition timing**:
- Happens in `handleTimerComplete` callback (after `onComplete()`)
- One render cycle delay is imperceptible (<100ms)
- localStorage automatically persists the new state via existing `useEffect`

### Integration Points

**With Bug 1 (Timer Accuracy)**:
- Auto-transition doesn't affect wall-clock restoration
- `switchMode()` sets new duration, `startedAt: null` (idle state)
- If user starts break, restoration works normally

**With Bug 2 (Completion Tracking)**:
- Auto-transition happens AFTER `onComplete()` and session increment
- Does NOT call `onComplete()` again (no duplicate count)
- Session count accurate

**With Bug 3 (Persistent UI)**:
- After auto-transition, `timer.mode` changes to break, `timer.status` is idle
- Persistent UI condition: `timer.status === 'completed' && timer.mode === 'focus'`
- After auto-transition, condition becomes FALSE (mode is now break)
- UI correctly shows break pending state instead

---

**Status**: Tasks generated, ready for implementation

**Next Step**: Run `/speckit.implement` to start Phase 1 (Setup & Code Review)


