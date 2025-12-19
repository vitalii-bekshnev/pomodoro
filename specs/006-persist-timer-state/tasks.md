# Implementation Tasks: Persist Timer State Across Page Refresh

**Feature**: `006-persist-timer-state`  
**Branch**: `006-persist-timer-state`  
**Status**: Ready for implementation

---

## Overview

This document breaks down the timer state persistence feature into actionable, dependency-ordered tasks organized by user story.

**Implementation Strategy**: Enhanced existing persistence
- **Current State**: Timer already saves paused/idle states, but NOT running states
- **Enhancement**: Add running timer save + wall-clock restore calculation
- **Code Impact**: ~30-50 lines in `src/hooks/useTimer.ts`

Each user story is independently testable and delivers incremental value.

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential (T001, T002...)
- **[P]**: Parallelizable (can run simultaneously with other [P] tasks)
- **[Story]**: User story label ([US1], [US2], [US3], [US4])
- **File path**: Exact file location for implementation

---

## User Story Mapping

| User Story | Priority | Phase | Description |
|------------|----------|-------|-------------|
| US1 | P1 | Phase 3 | Running Timer Persistence (wall-clock calculation) |
| US2 | P1 | Phase 4 | Paused Timer Persistence (exact time preservation) |
| US3 | P2 | Phase 5 | Idle Timer Persistence (mode and duration) |
| US4 | P2 | Phase 6 | Session Progress Preservation (already implemented, verify only) |

---

## Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: Foundational (Fix persistence save logic)
    ↓
Phase 3: US1 (Running Timer) ← MVP
    ↓
Phase 4: US2 (Paused Timer) ← Technically already works, add tests
    ↓
Phase 5: US3 (Idle Timer) ← Technically already works, add tests
    ↓
Phase 6: US4 (Session Progress) ← Already implemented, verify only
    ↓
Phase 7: Polish & Documentation
```

**Note**: US2, US3, US4 can be implemented in parallel after US1.

---

## Phase 1: Setup and Prerequisites

**Goal**: Prepare development environment and understand current implementation

**Duration**: ~10 minutes

### Tasks

- [x] T001 Checkout feature branch `006-persist-timer-state`
- [x] T002 Verify branch is up to date with master
- [x] T003 Read current `src/hooks/useTimer.ts` implementation (lines 32-46 initialization, lines 64-69 persistence)
- [x] T004 Read `src/types/timer.ts` to verify `TimerSession` structure includes `startedAt` field
- [x] T005 Run existing tests to establish baseline: `npm run test:once`

**Acceptance**: Environment ready, current implementation understood, all existing tests pass

---

## Phase 2: Foundational Tasks (Fix Save Logic)

**Goal**: Fix critical bug where running timers are not saved

**Duration**: ~5 minutes

**Blocking**: All user stories depend on this fix

**Critical Bug Found**: Current code only saves paused/idle states!

### Tasks

- [x] T006 Open `src/hooks/useTimer.ts` and locate persistence useEffect (lines 64-69)
- [x] T007 Remove status condition from persistence useEffect to save ALL states including running
- [x] T008 Add comment explaining why all states must be saved (including running with startedAt)
- [ ] T009 Verify change by checking localStorage after starting timer in browser
- [ ] T010 Commit fix: "Fix persistence to save running timer states"

**Current Code** (BROKEN):
```typescript
useEffect(() => {
  if (session.status === 'paused' || session.status === 'idle') {
    setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
  }
}, [session]);
```

**New Code** (FIXED):
```typescript
useEffect(() => {
  // Save ALL states including running (with startedAt for restore calculation)
  setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
}, [session]);
```

**Acceptance**: 
- Running timers are now saved to localStorage with `startedAt` timestamp
- Paused and idle timers still save correctly (no regression)
- localStorage contains correct state after any timer action

**Independent Test**: Start timer, check `localStorage.getItem('pomodoro_timer_state')` contains `"status":"running"` and `startedAt` timestamp

---

## Phase 3: User Story 1 - Running Timer Persistence (P1) 🎯 MVP

**Goal**: Running timers restore with accurate remaining time after page refresh

**Duration**: ~45-60 minutes

**Priority**: P1 (MVP - most critical user value)

**Independent Test**: Start focus timer → Wait 10 minutes (15 min remaining) → Refresh page → Timer continues from 15 minutes without resetting to 25

### Tasks

#### Core Restore Logic

- [ ] T011 [US1] Open `src/hooks/useTimer.ts` initialization logic (lines 32-46)
- [ ] T012 [US1] Add wall-clock elapsed time calculation for running timers in useState initialization
- [ ] T013 [US1] Calculate current remaining time: `remaining = savedRemaining - elapsed`
- [ ] T014 [US1] Handle timer completion case: if `remaining <= 0`, set status to 'completed'
- [ ] T015 [US1] Handle timer continuation case: if `remaining > 0`, restore running state with adjusted remaining
- [ ] T016 [US1] Add Math.max(0, ...) to clamp remaining time to non-negative values
- [ ] T017 [US1] Add Math.min(calculated, duration) to clamp remaining time to valid range

#### Completion Handler

- [ ] T018 [US1] Add new useEffect to handle restored completed timers (run once on mount)
- [ ] T019 [US1] In completion handler useEffect, check if `session.status === 'completed'`
- [ ] T020 [US1] If completed, call `onComplete(session.mode)` to trigger notifications and mode transition
- [ ] T021 [US1] Add dependency array `[]` to ensure useEffect runs once on mount only

#### Verify Start Function

- [ ] T022 [US1] Review `start()` function in `src/hooks/useTimer.ts` (around line 81)
- [ ] T023 [US1] Verify `startedAt: Date.now()` is set when transitioning to running status
- [ ] T024 [US1] If missing, add `startedAt` field to setSession call in start function

#### Manual Testing

- [ ] T025 [US1] Start dev server: `npm run dev`
- [ ] T026 [US1] Start focus timer, wait 5 minutes, verify localStorage has running state
- [ ] T027 [US1] Refresh page (F5), verify timer continues from ~20 minutes remaining
- [ ] T028 [US1] Test with short break (5 min timer), verify restore works
- [ ] T029 [US1] Test with long break (15 min timer), verify restore works
- [ ] T030 [US1] Test completion: start 1-min timer, close tab, wait 2 min, reopen → verify notification shows

#### Code Quality

- [ ] T031 [US1] Add code comments explaining wall-clock calculation logic
- [ ] T032 [US1] Add JSDoc comments for restore logic section
- [ ] T033 [US1] Commit changes: "Add running timer restore with wall-clock calculation (US1)"

**Acceptance Scenarios**:
1. ✅ Focus timer running for 10 minutes → refresh → continues from 15 minutes
2. ✅ Short break running for 2 minutes → refresh → continues from 3 minutes
3. ✅ Long break running for 5 minutes → refresh → continues from 10 minutes
4. ✅ Timer running, close browser for 30 min → reopen → completion notification shows

**Independent Test Result**: Running timers restore accurately based on elapsed wall-clock time, no reset to default duration

---

## Phase 4: User Story 2 - Paused Timer Persistence (P1)

**Goal**: Paused timers restore with exact remaining time (no wall-clock adjustment)

**Duration**: ~20-30 minutes

**Priority**: P1

**Dependencies**: Requires Phase 2 (persistence save fix) complete

**Note**: This should already work with existing code! Focus is on verification and edge case testing.

**Independent Test**: Start focus timer → Pause at 20 minutes → Refresh page → Timer shows 20 minutes in paused state → Resume works

### Tasks

#### Verification

- [ ] T034 [US2] Review restore logic in `useTimer.ts` initialization
- [ ] T035 [US2] Verify paused timers use exact `saved.remaining` without calculation
- [ ] T036 [US2] Verify paused timers have `startedAt === null` in saved state
- [ ] T037 [US2] Confirm no wall-clock calculation applied to paused status

#### Manual Testing

- [ ] T038 [US2] Start focus timer, pause at 20 minutes remaining
- [ ] T039 [US2] Check localStorage: verify `status: 'paused'` and `startedAt: null`
- [ ] T040 [US2] Refresh page, verify timer shows exactly 20:00 in paused state
- [ ] T041 [US2] Click Resume, verify timer continues from 20:00 correctly
- [ ] T042 [US2] Test with short break: start, pause at 3 min, refresh, verify 3:00 shown
- [ ] T043 [US2] Test extended pause: pause timer, wait 1 hour, refresh, verify time unchanged

#### Edge Cases

- [ ] T044 [US2] Test paused timer with corrupted `startedAt` (manually set in localStorage)
- [ ] T045 [US2] Verify graceful handling if `startedAt` is not null for paused timer
- [ ] T046 [US2] Document behavior: paused timers ignore `startedAt` field entirely

**Acceptance Scenarios**:
1. ✅ Focus paused at 20 minutes → refresh → displays 20 minutes paused
2. ✅ Short break paused at 3 minutes → refresh → displays 3 minutes paused
3. ✅ Paused timer displayed → Resume clicked → continues from displayed time
4. ✅ Timer paused for days → refresh → still shows same remaining time

**Independent Test Result**: Paused timers maintain exact remaining time regardless of how long page was closed

---

## Phase 5: User Story 3 - Idle Timer Persistence (P2)

**Goal**: Idle timers restore mode and custom duration settings

**Duration**: ~15-20 minutes

**Priority**: P2

**Dependencies**: Requires Phase 2 complete

**Note**: This should already work with existing code! Focus is on verification and custom duration testing.

**Independent Test**: Configure 30-min custom focus → Refresh before starting → Timer shows 30:00 idle → Start works

### Tasks

#### Verification

- [ ] T047 [US3] Review restore logic for idle timers in `useTimer.ts`
- [ ] T048 [US3] Verify idle timers restore `mode` and `duration` from localStorage
- [ ] T049 [US3] Verify `remaining` is set to `duration` for idle timers
- [ ] T050 [US3] Confirm idle timers have `startedAt === null`

#### Manual Testing - Default Durations

- [ ] T051 [US3] Open app with default settings (25-min focus)
- [ ] T052 [US3] Don't start timer, refresh page
- [ ] T053 [US3] Verify timer shows 25:00 in idle focus state
- [ ] T054 [US3] Click Start, verify timer begins countdown correctly

#### Manual Testing - Custom Durations

- [ ] T055 [US3] Open settings, change focus duration to 30 minutes
- [ ] T056 [US3] Save settings, verify timer shows 30:00
- [ ] T057 [US3] Refresh page (don't start timer)
- [ ] T058 [US3] Verify timer still shows 30:00 in idle state
- [ ] T059 [US3] Click Start, verify 30-minute countdown begins

#### Manual Testing - Mode Persistence

- [ ] T060 [US3] Complete a focus session to transition to short break idle screen
- [ ] T061 [US3] Don't start short break, refresh page
- [ ] T062 [US3] Verify short break timer shows (not focus timer)
- [ ] T063 [US3] Verify correct duration for short break (5 min default)

**Acceptance Scenarios**:
1. ✅ Idle focus with default 25 min → refresh → displays 25:00 idle
2. ✅ Idle focus with custom 30 min → refresh → displays 30:00 idle
3. ✅ Completed focus, viewing idle short break → refresh → short break shown
4. ✅ Idle timer at any mode → Start clicked → countdown begins correctly

**Independent Test Result**: Idle timers preserve mode and duration settings, Start button functions correctly after restore

---

## Phase 6: User Story 4 - Session Progress Preservation (P2)

**Goal**: Verify daily Pomodoro count and cycle position persist across refreshes

**Duration**: ~15-20 minutes

**Priority**: P2

**Dependencies**: None (session tracking already implemented in `useSessionTracking`)

**Note**: Session tracking already persists! This phase is VERIFICATION ONLY.

**Independent Test**: Complete 3 Pomodoros → Start 4th → Refresh → Count shows 3, cycle indicates long break next

### Tasks

#### Code Review

- [ ] T064 [US4] Review `src/hooks/useSessionTracking.ts` for persistence logic
- [ ] T065 [US4] Verify session count is saved to localStorage on completion
- [ ] T066 [US4] Verify cycle position is saved to localStorage
- [ ] T067 [US4] Check localStorage key for session data

#### Manual Testing - Session Count

- [ ] T068 [US4] Start fresh (clear localStorage or use incognito)
- [ ] T069 [US4] Complete 1 Pomodoro (or skip), verify count shows 1
- [ ] T070 [US4] Refresh page, verify count still shows 1
- [ ] T071 [US4] Complete 2nd Pomodoro, refresh, verify count shows 2
- [ ] T072 [US4] Complete 3rd Pomodoro, refresh, verify count shows 3

#### Manual Testing - Cycle Position

- [ ] T073 [US4] With 3 Pomodoros complete, verify cycle position is 3/4
- [ ] T074 [US4] Start 4th Pomodoro, refresh during countdown
- [ ] T075 [US4] Verify cycle position maintained (still indicates 3 complete)
- [ ] T076 [US4] Complete 4th Pomodoro, verify long break is offered (not short)
- [ ] T077 [US4] Refresh during long break, verify long break state persists

#### Daily Reset Testing

- [ ] T078 [US4] Check if daily reset logic exists (resets count at midnight)
- [ ] T079 [US4] Document daily reset behavior in comments if not already documented

**Acceptance Scenarios**:
1. ✅ Completed 2 Pomodoros → refresh → counter displays 2
2. ✅ 3rd session of cycle → refresh → cycle shows position 3/4
3. ✅ 4 sessions complete, due for long break → refresh → long break offered
4. ✅ 10 Pomodoros with multiple refreshes → count accurately shows 10

**Independent Test Result**: Session progress (count and cycle position) persists correctly across all refreshes

---

## Phase 7: Polish, Testing, and Documentation

**Goal**: Comprehensive testing, edge case handling, documentation

**Duration**: ~30-45 minutes

### Tasks

#### Unit Tests

- [ ] T080 Add test: "should restore running timer with elapsed time calculation" in `tests/unit/hooks/useTimer.test.ts`
- [ ] T081 Add test: "should restore running timer that completed (remaining = 0)" 
- [ ] T082 Add test: "should restore paused timer with exact remaining time (no calculation)"
- [ ] T083 Add test: "should restore idle timer with mode and duration"
- [ ] T084 Add test: "should handle missing startedAt for running timer (fallback to paused)"
- [ ] T085 Add test: "should handle corrupted localStorage gracefully"
- [ ] T086 Add test: "should clamp negative remaining time to 0"
- [ ] T087 Add test: "should clamp remaining time exceeding duration"
- [ ] T088 Run unit tests: `npm run test useTimer.test.ts`

#### Integration Tests

- [ ] T089 Create `tests/integration/TimerPersistence.test.tsx` if not exists
- [ ] T090 Add test: "full flow - start, wait, refresh, verify continuation"
- [ ] T091 Add test: "full flow - start, pause, refresh, resume works"
- [ ] T092 Add test: "full flow - timer completes during refresh, notification triggers"
- [ ] T093 Add test: "session tracking persists with timer state"
- [ ] T094 Run integration tests: `npm run test TimerPersistence.test.tsx`

#### Edge Case Testing

- [ ] T095 Test system clock change: manually change system time, verify timer behavior
- [ ] T096 Test localStorage cleared: clear storage mid-session, refresh, verify default state
- [ ] T097 Test private/incognito mode: verify timer works but doesn't persist
- [ ] T098 Test multiple tabs: open 2 tabs, verify independent operation (document limitation)
- [ ] T099 Test rapid refresh: refresh multiple times quickly, verify no crashes

#### Documentation

- [ ] T100 Add JSDoc comments to restore logic in `useTimer.ts`
- [ ] T101 Document wall-clock calculation formula in code comments
- [ ] T102 Document edge case handling (completion, clock changes) in comments
- [ ] T103 Update `README.md` if needed (mention persistence feature)
- [ ] T104 Verify `quickstart.md` testing instructions are accurate

#### Code Review Preparation

- [ ] T105 Review all changes for code quality and consistency
- [ ] T106 Run linter: `npm run lint`
- [ ] T107 Run type check: `npm run typecheck`
- [ ] T108 Run full test suite: `npm run test:once`
- [ ] T109 Check for console warnings in browser during manual testing
- [ ] T110 Verify no performance regression (timer should be smooth)

#### Final Validation

- [ ] T111 Test all 4 user stories end-to-end manually
- [ ] T112 Verify all acceptance criteria from spec.md are met
- [ ] T113 Check localStorage size (should be ~150-200 bytes)
- [ ] T114 Verify state restore completes in <100ms (use performance.now())
- [ ] T115 Verify running timer resumes within 500ms of page load

#### Feature Completion

- [ ] T116 Update feature status to "Implemented" in `specs/006-persist-timer-state/spec.md`
- [ ] T117 Final commit: "Complete timer state persistence feature (US1-US4)"
- [ ] T118 Merge feature branch to master (or create PR for review)

**Acceptance**: 
- All tests pass
- All user stories verified
- No performance regression
- Documentation complete
- Feature ready for production

---

## Parallel Execution Opportunities

### Phase 3 (US1) - Sequential Only
All tasks in US1 must be executed sequentially due to core logic dependencies.

### Phases 4, 5, 6 (US2, US3, US4) - Fully Parallelizable
After US1 is complete, these can be implemented in parallel:
- **Developer A**: Verify US2 (paused timer)
- **Developer B**: Verify US3 (idle timer)
- **Developer C**: Verify US4 (session tracking)
- All are verification/testing focused, no conflicting code changes

### Phase 7 (Polish) - Partial Parallelization
- T080-T088 (Unit tests) - parallelizable (different test files)
- T089-T094 (Integration tests) - parallelizable
- T095-T099 (Edge case testing) - can be split across team
- T100-T118 (Documentation/validation) - mostly sequential

---

## Task Summary

| Phase | User Story | Task Count | Duration | Status |
|-------|------------|------------|----------|--------|
| 1 | Setup | 5 | ~10 min | ⏳ Pending |
| 2 | Foundational | 5 | ~5 min | ⏳ Pending |
| 3 | US1 (P1) 🎯 | 23 | ~60 min | ⏳ Pending |
| 4 | US2 (P1) | 13 | ~30 min | ⏳ Pending |
| 5 | US3 (P2) | 17 | ~20 min | ⏳ Pending |
| 6 | US4 (P2) | 16 | ~20 min | ⏳ Pending |
| 7 | Polish | 39 | ~45 min | ⏳ Pending |
| **Total** | **All** | **118** | **~3 hours** | ⏳ Pending |

---

## MVP Scope (Minimum Viable Product)

**Recommendation**: Implement Phase 1-3 first (Setup + Foundational + US1)

**MVP Deliverables**:
- ✅ Fix persistence save logic (saves running timers)
- ✅ Running timer restore with wall-clock calculation
- ✅ Completed timer detection and notification
- ✅ Core functionality: prevents 20+ minutes of lost progress

**MVP Timeline**: ~75 minutes (Phases 1-3 only)

**Post-MVP Iterations**:
- **Iteration 2**: Add US2 verification (paused timers) - ~30 minutes
- **Iteration 3**: Add US3 verification (idle timers) - ~20 minutes
- **Iteration 4**: Add US4 verification (session tracking) - ~20 minutes
- **Iteration 5**: Polish, tests, documentation - ~45 minutes

---

## Success Criteria Validation

### User Story 1 (US1) - Running Timer Persistence
- [ ] Running focus timer for 10 min → refresh → continues from 15 min
- [ ] Running short break → refresh → continues accurately
- [ ] Running long break → refresh → continues accurately
- [ ] Timer completes while closed → notification on reopen

### User Story 2 (US2) - Paused Timer Persistence
- [ ] Paused at 20 min → refresh → shows 20 min paused
- [ ] Paused short break → refresh → exact time maintained
- [ ] Resume after refresh works correctly
- [ ] Extended pause (hours/days) → time unchanged

### User Story 3 (US3) - Idle Timer Persistence
- [ ] Default duration idle → refresh → correct default shown
- [ ] Custom duration idle → refresh → custom duration maintained
- [ ] Mode persists (focus vs break)
- [ ] Start button works after restore

### User Story 4 (US4) - Session Progress Preservation
- [ ] Daily count persists across refreshes
- [ ] Cycle position (X/4) persists
- [ ] Long break offered after 4 sessions
- [ ] Multiple refreshes don't corrupt count

---

## Testing Checklist

### Manual Tests
- [ ] Running timer continuation (all 3 modes)
- [ ] Paused timer exact time (all 3 modes)
- [ ] Idle timer mode and duration
- [ ] Completion notification on restore
- [ ] Session count persistence
- [ ] Cycle position persistence
- [ ] localStorage cleared → graceful default
- [ ] Private mode → no persistence, no errors
- [ ] Multiple tabs → independent operation

### Automated Tests
- [ ] Unit tests for restore logic (8 tests)
- [ ] Integration tests for full flows (4 tests)
- [ ] Edge case tests (corrupted state, missing fields)
- [ ] Performance tests (restore <100ms, resume <500ms)

---

## Troubleshooting Quick Reference

**Timer resets on refresh**:
- Check: Is running state being saved? (Phase 2 fix)
- Check: Is `startedAt` present in localStorage?
- Check: Is restore logic calculating elapsed time?

**Wrong time after refresh**:
- Check: Elapsed time calculation: `Date.now() - startedAt`
- Check: Remaining calculation: `savedRemaining - elapsed`
- Check: Is time clamped to [0, duration]?

**Paused timer changes time**:
- Check: Is wall-clock calculation skipped for paused?
- Check: Is `startedAt` null for paused timers?

**Completion not triggered**:
- Check: Is `remaining <= 0` detected?
- Check: Is `onComplete()` called in useEffect?

---

## Implementation Notes

### Key Code Locations

**Persistence Save**: `src/hooks/useTimer.ts` lines 64-69
**Initialization**: `src/hooks/useTimer.ts` lines 32-46
**Start Function**: `src/hooks/useTimer.ts` ~line 81
**Timer Types**: `src/types/timer.ts`

### Critical Changes

1. **Remove save condition** (Phase 2):
   ```typescript
   // OLD: if (session.status === 'paused' || session.status === 'idle')
   // NEW: (no condition - save all states)
   ```

2. **Add restore calculation** (Phase 3):
   ```typescript
   if (saved.status === 'running' && saved.startedAt !== null) {
     const elapsed = Date.now() - saved.startedAt;
     const remaining = Math.max(0, saved.remaining - elapsed);
     // ... handle completion or continuation
   }
   ```

### Testing Tools

**Check localStorage**:
```javascript
JSON.parse(localStorage.getItem('pomodoro_timer_state'))
```

**Calculate elapsed manually**:
```javascript
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
const elapsed = Date.now() - state.startedAt;
console.log('Elapsed (min):', Math.floor(elapsed / 60000));
```

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 (Setup)
2. **Follow MVP Approach**: Complete Phases 1-3 for core functionality
3. **Iterate**: Add US2, US3, US4 verification in subsequent iterations
4. **Test Thoroughly**: Verify each user story independently
5. **Document**: Update comments and documentation as you go

**Ready to begin**: Run `/speckit.implement` to start implementation in phases

---

**Status**: 📝 Task list complete, ready for implementation
**Total Tasks**: 118 tasks across 7 phases
**MVP Tasks**: 33 tasks (Phases 1-3)
**Estimated Total Time**: ~3 hours (MVP: ~75 minutes)
**Code Impact**: Minimal (~30-50 lines in one file)

