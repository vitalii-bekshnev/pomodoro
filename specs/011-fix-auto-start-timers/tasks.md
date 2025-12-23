# Tasks: Fix Auto-Start Timers

**Input**: Design documents from `/specs/011-fix-auto-start-timers/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included for critical functionality validation. Write tests first and ensure they fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project structure and dependencies are ready

- [x] T001 Verify existing React/TypeScript setup in src/
- [x] T002 Confirm auto-start settings fields exist in src/types/settings.ts
- [x] T003 Verify timer completion hooks are functional in src/hooks/useTimer.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure core timer and settings infrastructure works correctly

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Test current timer completion behavior in src/components/App.tsx
- [x] T005 Verify settings persistence works in src/hooks/useSettings.ts
- [x] T006 Confirm notification banner logic in src/hooks/useNotifications.ts

**Checkpoint**: Foundation verified - auto-start implementation can now begin

---

## Phase 3: User Story 1 - Auto-Start Focus Sessions (Priority: P1) 🎯 MVP

**Goal**: Focus timers automatically start after break sessions complete when auto-start focus is enabled

**Independent Test**: Enable auto-start focus toggle, complete a break session, verify focus timer starts automatically without banner

### Implementation for User Story 1

- [x] T007 [US1] Modify handleTimerComplete in src/components/App.tsx to check autoStartFocus setting
- [x] T008 [US1] Add conditional auto-start logic for break→focus transitions in src/components/App.tsx
- [x] T020 Fix skip focus functionality to properly transition to break mode
- [x] T009 [US1] Test US1 independently with manual break completion and auto-start focus enabled

**Checkpoint**: User Story 1 functional - focus sessions auto-start after breaks

---

## Phase 4: User Story 2 - Auto-Start Break Sessions (Priority: P1)

**Goal**: Break timers automatically start after focus sessions complete when auto-start breaks is enabled

**Independent Test**: Enable auto-start breaks toggle, complete a focus session, verify break timer starts automatically without banner

### Implementation for User Story 2

- [x] T010 [US2] Extend handleTimerComplete in src/components/App.tsx to check autoStartBreaks setting
- [x] T011 [US2] Add conditional auto-start logic for focus→break transitions in src/components/App.tsx
- [x] T012 [US2] Test US2 independently with manual focus completion and auto-start breaks enabled

**Checkpoint**: User Stories 1 AND 2 functional - both auto-start directions work

---

## Phase 5: User Story 3 - Suppress Break Start Notifications (Priority: P2)

**Goal**: Notification banners are suppressed when auto-start breaks is enabled, preventing UI clutter

**Independent Test**: Enable auto-start breaks, complete focus session, verify no banner appears

### Implementation for User Story 3

- [x] T013 [US3] Modify banner display logic and persistent UI in src/components/App.tsx to conditionally suppress when autoStartBreaks enabled
- [x] T014 [US3] Test US3 independently with auto-start breaks enabled and disabled states

**Checkpoint**: All user stories functional - auto-start works with clean UI

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, testing, and final verification

- [x] T015 [P] Update App.test.tsx to cover auto-start behavior scenarios
- [x] T016 [P] Add integration tests for settings persistence with auto-start
- [x] T017 Run quickstart.md test scenarios to validate all functionality
- [x] T018 Performance verification - ensure <100ms auto-start transitions
- [x] T019 Edge case testing - app restart, tab focus, manual overrides

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify existing code
- **Foundational (Phase 2)**: Depends on Setup - verify infrastructure works
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories proceed in priority order (P1 → P1 → P2)
  - Each story builds incrementally on previous work
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - modifies timer completion for break→focus
- **User Story 2 (P1)**: Can start after US1 - adds focus→break auto-start logic
- **User Story 3 (P2)**: Can start after US2 - adds banner suppression logic

### Within Each User Story

- Implementation tasks depend on foundational verification
- Test independently after implementation
- Stories build incrementally but remain independently testable

### Parallel Opportunities

- Setup tasks can run in parallel (different files)
- Foundational verification can run in parallel
- Once foundational is done, user stories proceed sequentially due to shared App.tsx file
- Polish tasks can run in parallel (different test files)

---

## Parallel Example: Setup Phase

```bash
# Launch all setup verification tasks together:
Task: "Verify existing React/TypeScript setup in src/"
Task: "Confirm auto-start settings fields exist in src/types/settings.ts"
Task: "Verify timer completion hooks are functional in src/hooks/useTimer.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup verification
2. Complete Phase 2: Foundational testing
3. Complete Phase 3: User Story 1 (Auto-start focus)
4. **STOP and VALIDATE**: Test focus auto-start independently
5. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Infrastructure verified
2. Add User Story 1 → Focus auto-start works → Deploy/Demo (MVP!)
3. Add User Story 2 → Break auto-start works → Deploy/Demo
4. Add User Story 3 → Clean UI experience → Deploy/Demo
5. Each story adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once foundational verified:
   - Developer A: User Stories 1 & 2 (core auto-start logic)
   - Developer B: User Story 3 (UI polish)
3. Stories integrate through shared App.tsx component

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- App.tsx is shared across stories - coordinate changes carefully
- Verify tests fail before implementing auto-start logic
- Commit after each task completion
- Stop at any checkpoint to validate story independently
- Manual testing: Use quickstart.md scenarios for validation
