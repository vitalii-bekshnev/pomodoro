# Tasks: Auto Focus After Break

**Input**: Design documents from `/specs/010-auto-focus-after-break/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included for the auto-transition behavior to ensure the feature works correctly.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Note**: No setup tasks required - this is an existing React TypeScript project with all necessary infrastructure already in place.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Note**: No foundational tasks required - all core timer functionality and React infrastructure is already implemented.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic Focus Start After Break (Priority: P1) 🎯 MVP

**Goal**: Implement automatic transition from break completion to focus mode, fixing the broken Pomodoro workflow.

**Independent Test**: Complete a break session and verify timer automatically switches to focus mode (25:00) without manual intervention.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T001 [P] [US1] Add unit test for break-to-focus auto-transition in tests/unit/components/App.test.tsx

### Implementation for User Story 1

- [x] T002 [US1] Add useEffect hook for break-to-focus auto-transition in src/components/App.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T003 [P] Run existing test suite to ensure no regressions in tests/unit/hooks/useTimer.test.ts
- [x] T004 [P] Run existing test suite to ensure no regressions in tests/unit/components/App.test.tsx
- [x] T005 Run quickstart.md validation steps manually
- [x] T006 [P] Verify feature works with both short breaks and long breaks as described in spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (but no tasks)
- **Foundational (Phase 2)**: No dependencies - can start immediately (but no tasks)
- **User Stories (Phase 3+)**: No blocking dependencies - can proceed immediately
- **Polish (Final Phase)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately - No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Story complete before moving to polish phase

### Parallel Opportunities

- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (though only one story here)

---

## Parallel Example: User Story 1

```bash
# Launch test for User Story 1:
Task: "Add unit test for break-to-focus auto-transition in tests/unit/components/App.test.tsx"

# After test is written and failing, implement:
Task: "Add useEffect hook for break-to-focus auto-transition in src/components/App.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1
2. **STOP and VALIDATE**: Test User Story 1 independently
3. Complete Phase 4: Polish & Cross-Cutting Concerns
4. Deploy/demo if ready

### Incremental Delivery

1. Add test for auto-transition behavior → Test fails
2. Implement auto-transition logic → Test passes
3. Verify no regressions in existing functionality
4. Manual testing per quickstart.md

### Parallel Team Strategy

With multiple developers:

1. Developer A: Write test for auto-transition
2. Developer B: Implement auto-transition logic
3. Both: Verify no regressions and manual testing

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
