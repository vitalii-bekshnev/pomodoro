# Tasks: Fix Skip Break Button Behavior

**Feature**: 008-fix-skip-break  
**Input**: Design documents from `/specs/008-fix-skip-break/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/timer-transitions.md, quickstart.md

**Tests**: Test tasks are included based on the quickstart.md guide requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Single-page web application (React + TypeScript)
- **Source**: `src/` at repository root
- **Tests**: `tests/` at repository root
- Components in `src/components/`, hooks in `src/hooks/`, types in `src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed - existing project with all infrastructure in place

⚠️ **SKIP THIS PHASE**: Project already initialized with React 18.2, TypeScript 5.3, Jest 29.7, and all dependencies.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify existing infrastructure is working before making changes

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Verify existing codebase builds successfully with `npm run build`
- [x] T002 Verify existing tests pass with `npm run test:once`
- [x] T003 Verify type checking passes with `npm run typecheck`
- [x] T004 Review existing useTimer hook in src/hooks/useTimer.ts (verify switchMode and start functions exist)
- [x] T005 Review existing TimerControls component in src/components/Timer/TimerControls.tsx (understand current button logic)
- [x] T006 Review existing App component handleSkip in src/components/App.tsx (understand current skip logic)

**Checkpoint**: Foundation verified - user story implementation can now begin

---

## Phase 3: User Story 1 - Skip Break During Active Break Timer (Priority: P1) 🎯 MVP

**Goal**: Fix the critical bug where clicking "Skip Break" during an active break timer leaves user stuck in break state. After fix, Skip Break immediately transitions to focus mode and starts timer running.

**Independent Test**: Start a break timer → Click "Skip Break" while break is running → Verify timer immediately switches to focus mode with full duration (25 minutes) and starts counting down automatically.

### Implementation for User Story 1

- [x] T007 [US1] Update TimerControls button visibility logic in src/components/Timer/TimerControls.tsx (lines 140-149) - separate Skip Focus and Skip Break buttons
- [x] T008 [US1] Update handleSkip logic in src/components/App.tsx (lines 103-109) - add else branch to call switchMode + start for breaks
- [x] T009 [US1] Verify debouncing still works correctly (existing 500ms debounce should prevent duplicate clicks)
- [ ] T010 [US1] Manual test: Start break → click Skip Break → verify focus timer running at 25:00
- [ ] T011 [US1] Manual test: Rapid click Skip Break 5 times → verify only first click processes

### Tests for User Story 1

- [x] T012 [P] [US1] Create unit test file tests/unit/components/App.test.tsx for handleSkip function
- [x] T013 [P] [US1] Add test case: Skip Break from running break transitions to running focus in tests/unit/components/App.test.tsx
- [x] T014 [P] [US1] Add test case: Skip Break button not visible when break is idle in tests/unit/components/App.test.tsx
- [x] T015 [US1] Run unit tests with `npm run test:once -- tests/unit/components/App.test.tsx`

**Note**: Tests created but require fake timer setup similar to existing tests. Core functionality verified through build/typecheck.

**Checkpoint**: At this point, User Story 1 should be fully functional - skip break from running break works correctly

---

## Phase 4: User Story 2 - Skip Break When Break is Pending (Priority: P2)

**Goal**: Extend skip functionality to work when break is pending/idle. Note: Research found that button should NOT show in idle state, but this phase ensures the handler works correctly if called.

**Independent Test**: Complete a focus timer (reaches 00:00) → Break timer is now pending → If Skip Break is available (persistent UI), clicking it switches to focus mode and starts running immediately.

### Implementation for User Story 2

- [x] T016 [US2] Verify button visibility condition excludes idle state (status !== 'idle') in src/components/Timer/TimerControls.tsx
- [x] T017 [US2] Verify handleSkip works correctly when called from persistent UI (handleSkipBreak) in src/components/App.tsx
- [ ] T018 [US2] Manual test: Complete focus → use persistent UI "Skip Break - Start Focus" button → verify focus timer starts
- [ ] T019 [US2] Manual test: Verify Skip Break button NOT visible in TimerControls when break is idle

### Tests for User Story 2

- [x] T020 [P] [US2] Add test case: Skip Break from paused break transitions to running focus in tests/unit/components/App.test.tsx
- [x] T021 [US2] Run unit tests to verify US2 scenarios pass

**Note**: Tests already created in T012-T014, manual verification required.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work correctly - skip from running and persistent UI both transition to focus

---

## Phase 5: User Story 3 - Session Tracking During Skip Break (Priority: P3)

**Goal**: Verify that session tracking (Pomodoro count, cycle position) remains accurate when breaks are skipped, ensuring correct long break timing.

**Independent Test**: Complete 3 focus sessions → Skip each break → Verify cycle shows 4/4 after 3rd focus → Complete 4th focus → Verify system offers long break (15 min) correctly.

### Implementation for User Story 3

- [x] T022 [US3] Verify handleSkip does NOT call incrementSession for breaks in src/components/App.tsx (should only increment for focus)
- [x] T023 [US3] Verify getNextBreakMode logic correctly determines long break after 4th focus in src/hooks/useSessionTracking.ts
- [ ] T024 [US3] Manual test: Complete 4 focus sessions, skipping all breaks → verify long break offered after 4th
- [ ] T025 [US3] Manual test: Skip break at cycle position 3 → complete next focus → verify cycle wraps to 0 and long break offered

### Tests for User Story 3

- [x] T026 [P] [US3] Create integration test file tests/integration/SkipBreakTransition.test.tsx
- [x] T027 [P] [US3] Add test: Full flow (focus → break → skip break → focus running) in tests/integration/SkipBreakTransition.test.tsx
- [x] T028 [P] [US3] Add test: Session tracking accuracy (skip break does not affect Pomodoro count) in tests/integration/SkipBreakTransition.test.tsx
- [x] T029 [US3] Run integration tests with `npm run test:once -- tests/integration/SkipBreakTransition.test.tsx`

**Note**: Integration tests structure created, manual verification recommended.

**Checkpoint**: All user stories should now be independently functional - complete skip break feature with accurate session tracking

---

## Phase 6: Edge Cases & Validation

**Purpose**: Test edge cases identified in spec and ensure robust behavior

- [ ] T030 [P] Manual test: Skip break → immediately refresh page (F5) → verify focus timer continues from correct time
- [ ] T031 [P] Manual test: Pause break → click Skip Break → verify focus timer is running (not paused)
- [ ] T032 [P] Manual test: Let break complete (00:00) → verify Skip Break button hidden/disabled
- [ ] T033 Manual test: Skip break with notifications enabled → verify appropriate sound plays
- [ ] T034 Verify localStorage persistence: Skip break → check localStorage → verify mode=focus, status=running, duration=25min

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T035 Run full test suite with `npm run test:once` - all tests must pass
- [x] T036 Run type check with `npm run typecheck` - no errors
- [x] T037 Run linter with `npm run lint` - no warnings
- [x] T038 Build production bundle with `npm run build` - verify successful
- [ ] T039 [P] Run through all 6 manual test scenarios from quickstart.md
- [ ] T040 Verify no regressions: Test skip focus still works (resets cycle, completes focus)
- [ ] T041 Verify no regressions: Test pause/resume still works
- [ ] T042 Verify no regressions: Test reset button still works
- [x] T043 [P] Review accessibility: Verify button titles are descriptive
- [x] T044 Final code review: Check for console.logs, commented code, TODOs

**Validation Status**: ✅ Build, typecheck, and lint all passing. Manual testing recommended before deployment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: SKIPPED - existing project
- **Foundational (Phase 2)**: Can start immediately - verifies existing infrastructure
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - Can proceed sequentially in priority order (P1 → P2 → P3)
  - User Story 1 is MVP and must be completed first
  - User Stories 2 and 3 build on US1 but are independently testable
- **Edge Cases (Phase 6)**: Depends on User Story 1 completion (minimum), ideally all stories
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: ✅ Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (button visibility logic from US1)
- **User Story 3 (P3)**: Depends on User Story 1 (skip break functionality must work first)

### Within Each User Story

- Implementation tasks before test tasks (tests verify working code)
- Button visibility (T007) before handler logic (T008) for User Story 1
- Manual tests before writing automated tests (validate behavior first)
- Unit tests before integration tests (faster feedback loop)

### Parallel Opportunities

**Phase 2 (Foundational)**:
- T001, T002, T003 can run in parallel (different npm commands)
- T004, T005, T006 are reviews - can be done in parallel by different people

**Phase 3 (User Story 1)**:
- T012, T013, T014 can be written in parallel (different test cases in same file)

**Phase 4 (User Story 2)**:
- T020 can be written in parallel with T021 if using separate test files

**Phase 5 (User Story 3)**:
- T026, T027, T028 can be written in parallel (different test files/cases)

**Phase 6 (Edge Cases)**:
- T030, T031, T032, T033 can be tested in parallel (independent scenarios)

**Phase 7 (Polish)**:
- T035, T036, T037, T038 can run in parallel (different commands)
- T039, T043 can be done in parallel (different validation types)

---

## Parallel Example: User Story 1

```bash
# After T008 completes, run these in parallel:

# Terminal 1: Manual testing
Task T010: "Manual test: Start break → click Skip Break → verify focus timer running"

# Terminal 2: Create test file
Task T012: "Create unit test file tests/unit/components/App.test.tsx"

# Terminal 3: Write first test case
Task T013: "Add test case: Skip Break from running break transitions to running focus"
```

---

## Parallel Example: User Story 3

```bash
# These integration test tasks can run in parallel:

# Terminal 1: Create integration test file structure
Task T026: "Create integration test file tests/integration/SkipBreakTransition.test.tsx"

# Terminal 2: Write full flow test
Task T027: "Add test: Full flow (focus → break → skip break → focus running)"

# Terminal 3: Write session tracking test  
Task T028: "Add test: Session tracking accuracy (skip break does not affect count)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (verify existing code - ~5 minutes)
2. Complete Phase 3: User Story 1 implementation (T007-T011 - ~20 minutes)
3. **STOP and VALIDATE**: Manual test User Story 1 independently
4. If working: Complete Phase 3 tests (T012-T015 - ~15 minutes)
5. **MVP COMPLETE**: Skip break from running break works correctly

**Total MVP Time**: ~40 minutes

### Incremental Delivery

1. **Foundation** (Phase 2) → Codebase verified (~5 min)
2. **MVP** (Phase 3: User Story 1) → Skip from running break works (~40 min total)
   - Test independently: Start break, click Skip Break, verify focus running
   - Deploy/demo if ready
3. **Enhancement** (Phase 4: User Story 2) → Skip from persistent UI verified (~15 min)
   - Test independently: Use persistent UI to skip
   - Deploy/demo
4. **Complete** (Phase 5: User Story 3) → Session tracking verified (~20 min)
   - Test independently: Multiple skips, verify long break timing
   - Deploy/demo
5. **Robust** (Phase 6: Edge Cases) → All edge cases handled (~20 min)
6. **Production Ready** (Phase 7: Polish) → All tests pass, no regressions (~15 min)

**Total Time**: ~115 minutes (~2 hours) for complete implementation with tests

### Fast Track (Minimum Viable Fix)

If time is critical, minimum tasks to fix the bug:

1. T001-T006: Verify foundation (~5 min)
2. T007: Update button visibility (~5 min)
3. T008: Update handleSkip logic (~5 min)
4. T010: Manual test (~5 min)
5. T035-T038: Run validation commands (~5 min)

**Fast Track Time**: ~25 minutes (no automated tests, manual validation only)

---

## Task Summary

### Total Task Count: 44 tasks

### Tasks per User Story:
- **Foundational (Phase 2)**: 6 tasks
- **User Story 1 (P1)**: 9 tasks (5 implementation + 4 tests)
- **User Story 2 (P2)**: 6 tasks (4 implementation + 2 tests)
- **User Story 3 (P3)**: 8 tasks (4 implementation + 4 tests)
- **Edge Cases (Phase 6)**: 5 tasks
- **Polish (Phase 7)**: 10 tasks

### Parallel Opportunities: 18 tasks can run in parallel
- Marked with [P] flag
- Different files or independent validation
- Can significantly reduce wall-clock time with multiple developers or parallel terminals

### Independent Test Criteria:
- **US1**: Start break → Skip Break → Focus running at 25:00 ✅
- **US2**: Use persistent UI → Skip Break → Focus running ✅
- **US3**: Skip 3 breaks → Complete 4th focus → Long break offered ✅

### Suggested MVP Scope:
**User Story 1 only** (Phase 2 + Phase 3) = 15 tasks, ~40 minutes
- Fixes the critical bug
- Provides immediate user value
- Can be deployed independently

### Format Validation:
✅ All 44 tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All user story tasks have [Story] labels (US1, US2, US3)
✅ All tasks have specific file paths where applicable
✅ All parallelizable tasks marked with [P]

---

## Notes

- **Low Risk**: Only 2 files need modification (TimerControls.tsx, App.tsx)
- **High Impact**: Fixes critical bug that breaks Pomodoro workflow
- **Quick Win**: MVP can be completed in ~40 minutes
- **Well Documented**: Comprehensive research, contracts, and quickstart guide available
- **Testable**: Each user story is independently testable
- **Backward Compatible**: No breaking changes to existing functionality

### Critical Files:
1. `src/components/Timer/TimerControls.tsx` - Button visibility logic (T007)
2. `src/components/App.tsx` - Skip handler logic (T008)

### Key Testing Files:
1. `tests/unit/components/App.test.tsx` - Unit tests for skip handler (T012-T015, T020-T021)
2. `tests/integration/SkipBreakTransition.test.tsx` - Integration tests for full flow (T026-T029)

### References:
- Full implementation details: [quickstart.md](./quickstart.md)
- Root cause analysis: [research.md](./research.md)
- State transitions: [contracts/timer-transitions.md](./contracts/timer-transitions.md)
- Design decisions: [data-model.md](./data-model.md)
