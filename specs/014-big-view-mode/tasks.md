# Tasks: Big View Mode

**Input**: Design documents from `/specs/014-big-view-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare type definitions and constants needed across all user stories

- [x] T001 [P] Add `bigViewEnabled: boolean` field to `UserPreferences` interface in `src/types/settings.ts`
- [x] T002 [P] Add `bigViewEnabled: false` to `DEFAULT_PREFERENCES` constant in `src/types/settings.ts`
- [x] T003 [P] Update `validatePreferences` function in `src/types/settings.ts` to include bigViewEnabled with default value

**Checkpoint**: Type system ready - all preferences include bigViewEnabled support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components and utilities that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `TimerDigit` component in `src/components/Timer/TimerDigit.tsx` with props interface (digit, position, isSeparator)
- [x] T005 Create `TimerDigit.css` in `src/components/Timer/TimerDigit.css` with digit animation styles (slide-in, transitions, prefers-reduced-motion)
- [x] T006 Add centiseconds calculation helper function `formatTime(ms, includeCentiseconds)` to `src/components/Timer/Timer.tsx` returning { minutes, seconds, centiseconds? }

**Checkpoint**: Foundation ready - TimerDigit component and centiseconds formatting available for use

---

## Phase 3: User Story 1 - Enable Big View for Distraction-Free Focus (Priority: P1) 🎯 MVP

**Goal**: User can toggle Big View mode in settings, and when enabled, the timer fills the viewport with centiseconds display, hiding all other UI elements from initial view

**Independent Test**: Toggle Big View setting on/off and verify timer display fills viewport when scrolled to top with MM:SS.CS format, all other elements hidden from initial view, setting persists across page reloads

### Implementation for User Story 1

- [x] T007 [P] [US1] Add Big View toggle control to `SettingsPanel` in `src/components/Settings/SettingsPanel.tsx` under Appearance section using `ToggleSwitch` component
- [x] T008 [P] [US1] Update `App.tsx` to read `bigViewEnabled` from preferences and apply conditional className `app--big-view` to main app container in `src/components/App.tsx`
- [x] T009 [P] [US1] Add Big View layout CSS rules to `src/components/App.css` to hide header (`.app--big-view .app-header { display: none; }`)
- [x] T010 [P] [US1] Add timer container full-viewport styles to `src/components/App.css` (`.app--big-view .timer-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; }`)
- [x] T011 [US1] Pass `bigViewEnabled` prop from `App` to `Timer` component in `src/components/App.tsx`
- [x] T012 [US1] Update `Timer` component in `src/components/Timer/Timer.tsx` to accept `bigViewEnabled` prop and conditionally render centiseconds using `TimerDigit` components for MM:SS.CS format
- [x] T013 [US1] Add Big View timer styles to `src/components/Timer/Timer.css` with responsive font scaling (`.timer--big-view .timer-display { font-size: clamp(8rem, 25vmin, 40rem); }`)
- [x] T014 [US1] Update `useTimer` hook in `src/hooks/useTimer.ts` to accept `bigViewEnabled` parameter and use conditional interval timing (10ms for Big View, 100ms for regular)
- [x] T015 [US1] Update `App.tsx` to pass `preferences.bigViewEnabled` to `useTimer` hook instantiation in `src/components/App.tsx`

**Checkpoint**: Big View mode fully functional - toggle works, timer fills viewport with centiseconds, preference persists, layout hides header

---

## Phase 4: User Story 2 - Interact with Timer in Big View Mode (Priority: P2)

**Goal**: User can access all timer controls (Settings, Start/Pause, Reset, Skip) in a horizontal row below the timer when scrolling down in Big View mode

**Independent Test**: Enable Big View, scroll down to find controls arranged horizontally with Settings button on left, verify all control functions (start/pause/reset/skip) work correctly

### Implementation for User Story 2

- [x] T016 [P] [US2] Add controls container layout styles to `src/components/App.css` for Big View mode (`.app--big-view .controls-container { display: flex; justify-content: center; gap: var(--spacing-md); padding: var(--spacing-2xl); flex-wrap: wrap; }`)
- [x] T017 [US2] Extract Settings button to variable in `src/components/App.tsx` and conditionally render in header (regular mode) or controls container (Big View mode) based on `bigViewEnabled` state
- [x] T018 [US2] Update `Timer` component layout in `src/components/Timer/Timer.tsx` to ensure control buttons (Start/Pause, Reset, Skip) are rendered in controls container that appears below timer display
- [x] T019 [US2] Add mobile responsive styles to `src/components/App.css` for controls container in Big View mode (`@media (max-width: 640px) { .app--big-view .controls-container { flex-direction: column; } }`)

**Checkpoint**: Timer controls accessible and functional in Big View mode - Settings button in correct position, all buttons work, horizontal layout responsive

---

## Phase 5: User Story 3 - View Session Information in Big View Mode (Priority: P3)

**Goal**: User can scroll past controls to see session tracking information (pomodoros completed, cycle position) and footer in Big View mode

**Independent Test**: Enable Big View, scroll down past controls, verify session counter and cycle indicator appear correctly, then footer appears at bottom, layout order correct (timer → controls → session info → footer)

### Implementation for User Story 3

- [x] T020 [P] [US3] Add session tracking layout styles to `src/components/App.css` for Big View mode (`.app--big-view .session-tracking { padding: var(--spacing-xl); }`)
- [x] T021 [P] [US3] Verify footer appears correctly below session tracking in `src/components/App.tsx` (no CSS changes needed, but validate scrollable order)
- [x] T022 [US3] Add vertical spacing styles to `src/components/App.css` to ensure proper separation between timer, controls, session tracking, and footer sections in Big View mode

**Checkpoint**: All UI elements accessible in correct order via scroll - timer at top, controls below, session info below controls, footer at bottom

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Refinements and accessibility improvements that affect the entire feature

- [x] T023 [P] Add accessibility ARIA labels for Big View state changes in `src/components/App.tsx` (e.g., `aria-label="Big View mode ${bigViewEnabled ? 'enabled' : 'disabled'}"`)
- [x] T024 [P] Add screen reader announcement when toggling Big View mode in `src/components/Settings/SettingsPanel.tsx` using ARIA live regions
- [x] T025 [P] Verify `prefers-reduced-motion` media query support in `src/components/Timer/TimerDigit.css` to disable animations for accessibility
- [ ] T026 [P] Test timer display scaling across multiple viewport sizes (320px mobile to 4K desktop) and adjust clamp() values in `src/components/Timer/Timer.css` if needed
- [ ] T027 [P] Verify keyboard navigation works correctly with Settings button in both positions (header and controls row) in `src/components/App.tsx`
- [ ] T028 Performance profiling of 100Hz timer updates in Big View mode - verify no jank or excessive CPU usage using React DevTools Profiler
- [ ] T029 Manual cross-browser testing (Chrome, Firefox, Safari, Edge) for Big View mode layout and animations
- [x] T030 [P] Add JSDoc comments to new `TimerDigit` component and updated functions in `src/components/Timer/TimerDigit.tsx` and `src/components/Timer/Timer.tsx`

**Checkpoint**: Feature polished, accessible, performant, and tested across browsers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 can start after Phase 2
  - User Story 2 can start after Phase 2 (depends on US1 for Settings button context)
  - User Story 3 can start after Phase 2 (depends on US1 for Big View mode existence)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Independent, no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for Big View mode and Settings button to exist
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for Big View mode context

### Within Each User Story

- Tasks marked [P] within a phase can run in parallel
- Tasks without [P] may have dependencies on previous tasks in the same phase
- CSS changes are generally parallelizable with TypeScript/React changes when in different files

### Parallel Opportunities

**Phase 1 (Setup)**: All 3 tasks can run in parallel (T001, T002, T003)

**Phase 3 (User Story 1)**: Several parallel groups:
- Group 1: T007, T008, T009, T010, T013 (different files/sections)
- Group 2: After Group 1, T011, T012, T014, T015 (sequential, depend on previous)

**Phase 4 (User Story 2)**: T016, T019 can run in parallel (both CSS), then T017, T018 (sequential)

**Phase 5 (User Story 3)**: T020, T021 can run in parallel

**Phase 6 (Polish)**: T023, T024, T025, T026, T027, T030 all can run in parallel

---

## Parallel Example: User Story 1

```bash
# Parallel Group 1 - Different files, no conflicts:
Task T007: "Add Big View toggle to SettingsPanel in src/components/Settings/SettingsPanel.tsx"
Task T008: "Update App.tsx conditional className in src/components/App.tsx"
Task T009: "Add header hiding CSS to src/components/App.css"
Task T010: "Add timer container viewport CSS to src/components/App.css"
Task T013: "Add Big View timer font scaling CSS to src/components/Timer/Timer.css"

# Sequential Group 2 - Depends on Group 1 completion:
Task T011: "Pass bigViewEnabled prop to Timer"
Task T012: "Update Timer component for centiseconds display"
Task T014: "Update useTimer hook for conditional interval"
Task T015: "Pass bigViewEnabled to useTimer hook"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 (T007-T015)
4. **STOP and VALIDATE**: Test Big View toggle, verify timer fills viewport with centiseconds, check persistence
5. Demo MVP: Immersive full-screen timer mode working

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (30 minutes)
2. Add User Story 1 → Test independently → Deploy/Demo MVP (45 minutes)
3. Add User Story 2 → Test independently → Deploy/Demo controls accessible (30 minutes)
4. Add User Story 3 → Test independently → Deploy/Demo complete layout (15 minutes)
5. Complete Polish → Final validation → Deploy production (30 minutes)

**Total Estimated Time**: ~2.5 hours

### Parallel Team Strategy

With 2-3 developers:

1. Team completes Setup + Foundational together (30 minutes)
2. Once Foundational is done:
   - Developer A: User Story 1 (T007-T015) - 45 minutes
   - Developer B: Can start on Polish tasks that don't depend on US1 completion
3. After US1 complete:
   - Developer A: User Story 2 (T016-T019) - 30 minutes
   - Developer B: User Story 3 (T020-T022) - 15 minutes
4. Both: Complete remaining Polish tasks together (30 minutes)

**Parallel Estimated Time**: ~1.5 hours

---

## Acceptance Criteria Mapping

### User Story 1 Acceptance (Tasks T007-T015)

1. ✅ Big View mode disabled → user sees header, session tracking, timer, controls (default behavior preserved)
2. ✅ User toggles Big View in settings → setting saved and mode activates (T007, T001-T003)
3. ✅ Big View enabled + scroll to top → only timer visible with MM:SS.CS format (T008-T013)
4. ✅ Big View enabled + scroll down → controls appear below timer (T009-T010 CSS layout)
5. ✅ Big View enabled + refresh → setting persists (T001-T003 localStorage)

### User Story 2 Acceptance (Tasks T016-T019)

1. ✅ Big View enabled + scroll down → all buttons (Settings, Start/Pause, Reset, Skip) in horizontal row, Settings on left (T016-T017)
2. ✅ Start button works correctly in Big View (T018 - existing functionality preserved)
3. ✅ Pause button works correctly in Big View (T018 - existing functionality preserved)
4. ✅ Reset button works correctly in Big View (T018 - existing functionality preserved)
5. ✅ Skip button works correctly in Big View (T018 - existing functionality preserved)

### User Story 3 Acceptance (Tasks T020-T022)

1. ✅ Big View enabled + scroll past controls → session counter appears (T020-T022 layout)
2. ✅ Big View enabled + scroll past controls → cycle indicator appears (T020-T022 layout)
3. ✅ Complete focus session → count increments correctly (existing functionality, verified in layout)
4. ✅ Scroll through page → correct order: timer, controls, session info, footer (T020-T022)

---

## Success Criteria Validation

| Criterion | Validated By | Tasks |
|-----------|--------------|-------|
| SC-001: Toggle <3 seconds | SettingsPanel toggle interaction | T007 |
| SC-002: 100% viewport at top | CSS min-height: 100vh + header hidden | T009, T010 |
| SC-003: 90-95% viewport fill | clamp(8rem, 25vmin, 40rem) font sizing | T013 |
| SC-004: 100Hz updates | 10ms interval in useTimer when bigViewEnabled | T014, T015 |
| SC-005: Controls <1vh scroll | Flexbox layout with timer at top | T016, T018 |
| SC-006: 100% persistence | localStorage via validatePreferences | T001-T003 |
| SC-007: Transition <500ms | CSS transitions 0.15s + React render | T005, T013 |
| SC-008: 100% functionality | All existing timer functions unchanged | T018 (verify) |

---

## Notes

- [P] tasks = different files, can run in parallel without conflicts
- [Story] label (US1, US2, US3) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests explicitly requested in spec, so no test tasks included (feature relies on manual testing + existing test suite)
- Commit after completing each user story phase for clean rollback points
- Verify timer accuracy at 100Hz during T028 performance profiling
- Mobile testing critical due to viewport-based font scaling (T026)
- Accessibility validation in Phase 6 ensures keyboard and screen reader compatibility (T023-T025, T027)

