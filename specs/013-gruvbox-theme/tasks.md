# Tasks: Gruvbox Theme with Light/Dark Mode Toggle

**Input**: Design documents from `/specs/013-gruvbox-theme/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as this is a new feature with clear acceptance criteria and measurable outcomes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (this project structure)
- All file paths are relative to repository root: `/Users/vitaliibekshnev/Source/Personal/pomodoro/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational theme system structure and type definitions

- [x] T001 Create theme types file in src/types/theme.ts with ThemeMode, ThemePreference, ThemeContextValue interfaces
- [x] T002 [P] Create themes directory structure: src/styles/themes/ with index.ts
- [x] T003 [P] Create contexts directory for React Context: src/contexts/
- [x] T004 [P] Create Gruvbox light theme CSS file in src/styles/themes/gruvbox-light.css with all background, foreground, and accent color variables
- [x] T005 [P] Create Gruvbox dark theme CSS file in src/styles/themes/gruvbox-dark.css with all color variables and [data-theme="dark"] selector
- [x] T006 Update src/styles/global.css to import theme CSS files and add smooth transition rules with prefers-reduced-motion support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Implement ThemeContext provider in src/contexts/ThemeContext.tsx with state management, localStorage integration, and system preference detection
- [x] T008 Implement useTheme custom hook in src/hooks/useTheme.ts that consumes ThemeContext with error handling
- [x] T009 Add FOIT (Flash of Incorrect Theme) prevention script to index.html before React loads
- [x] T010 Wrap App component with ThemeProvider in src/index.tsx (or src/main.tsx)
- [x] T011 Add type guards (isThemeMode, isThemePreference) to src/types/theme.ts
- [x] T012 Export THEME_STORAGE_KEY and DEFAULT_THEME constants from src/types/theme.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Toggle Between Light and Dark Themes (Priority: P1) 🎯 MVP

**Goal**: Enable users to manually switch between light and dark themes via settings modal with instant visual feedback and persistence

**Independent Test**: Open settings modal, click theme toggle, observe entire app changes color instantly. Close and reopen app - theme persists.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Create unit test for useTheme hook initialization in tests/unit/hooks/useTheme.test.ts (test default theme)
- [ ] T014 [P] [US1] Create unit test for theme toggling in tests/unit/hooks/useTheme.test.ts (light→dark, dark→light)
- [ ] T015 [P] [US1] Create unit test for setTheme function in tests/unit/hooks/useTheme.test.ts (explicit theme setting)
- [ ] T016 [P] [US1] Create unit test for localStorage persistence in tests/unit/hooks/useTheme.test.ts (save/load theme preference)
- [ ] T017 [P] [US1] Create integration test for theme switching UI in tests/integration/ThemeSwitching.test.tsx (click toggle, verify DOM attribute changes)

### Implementation for User Story 1

- [x] T018 [P] [US1] Create ThemeToggle component in src/components/Settings/ThemeToggle.tsx with toggle button UI
- [x] T019 [P] [US1] Create ThemeToggle styles in src/components/Settings/ThemeToggle.css with button, icon, and hover states
- [x] T020 [US1] Integrate ThemeToggle into SettingsPanel component in src/components/Settings/SettingsPanel.tsx
- [x] T021 [US1] Update SettingsPanel.tsx import to include ThemeToggle component
- [x] T022 [US1] Test theme toggle functionality manually: verify toggle switches theme, localStorage saves preference, page reload maintains theme

**Checkpoint**: At this point, User Story 1 should be fully functional - users can manually toggle themes and preference persists

---

## Phase 4: User Story 2 - Default Theme Based on System Preference (Priority: P2)

**Goal**: Automatically detect and apply user's OS theme preference on first visit, providing seamless experience for new users

**Independent Test**: Clear localStorage, set OS to dark mode, open app → should display dark theme. Set OS to light mode, clear storage, reload → should display light theme. User manual preference should override system changes.

### Tests for User Story 2

- [ ] T023 [P] [US2] Create unit test for system preference detection in tests/unit/hooks/useTheme.test.ts (matchMedia mock, initial detection)
- [ ] T024 [P] [US2] Create unit test for system preference changes in tests/unit/hooks/useTheme.test.ts (OS theme change listener)
- [ ] T025 [P] [US2] Create unit test for user preference override in tests/unit/hooks/useTheme.test.ts (user sets theme, system changes ignored)
- [ ] T026 [P] [US2] Create integration test for first-visit behavior in tests/integration/ThemeSwitching.test.tsx (no stored preference, uses system)

### Implementation for User Story 2

- [ ] T027 [US2] Verify ThemeContext system preference detection logic in src/contexts/ThemeContext.tsx (matchMedia implementation already from Phase 2)
- [ ] T028 [US2] Verify system preference change listener in src/contexts/ThemeContext.tsx (mediaQuery.addEventListener already from Phase 2)
- [ ] T029 [US2] Verify user preference priority logic in src/contexts/ThemeContext.tsx (source='user' blocks system changes)
- [ ] T030 [US2] Test system preference detection manually: clear localStorage, change OS theme, verify app follows OS theme
- [ ] T031 [US2] Test user preference override: set theme manually in app, change OS theme, verify app maintains user choice

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - manual toggle + automatic system detection

---

## Phase 5: User Story 3 - Consistent Gruvbox Styling Across All Components (Priority: P3)

**Goal**: Apply Gruvbox theme colors consistently to all UI components with proper contrast and smooth transitions

**Independent Test**: Toggle theme and verify each component (App, Timer, Settings, SessionTracking, Notifications, Logo) displays correctly in both light and dark modes with readable text.

### Tests for User Story 3

- [ ] T032 [P] [US3] Create visual regression checklist for component theming (manual test document for each component in both themes)
- [ ] T033 [P] [US3] Create accessibility test for contrast ratios in tests/integration/ThemeSwitching.test.tsx (verify WCAG AA compliance)

### Implementation for User Story 3

**App Component**:
- [x] T034 [P] [US3] Update App.css to use CSS variables: --color-background, --color-text-primary, --color-surface in src/components/App.css

**Timer Components**:
- [x] T035 [P] [US3] Update TimerDisplay.css to use theme variables for display background, text, and borders in src/components/Timer/TimerDisplay.css
- [x] T036 [P] [US3] Update TimerControls.css to use theme variables for buttons, hover states in src/components/Timer/TimerControls.css
- [x] T037 [P] [US3] Update ModeSelector.css to use theme variables for mode buttons and active states in src/components/Timer/ModeSelector.css
- [x] T038 [P] [US3] Integrate timer mode colors (orange, blue, green) with Gruvbox accent colors in src/styles/theme.ts

**Settings Components**:
- [x] T039 [P] [US3] Update SettingsPanel.css to use theme variables for modal background, borders in src/components/Settings/SettingsPanel.css
- [x] T040 [P] [US3] Update DurationSlider.css to use theme variables for slider track, thumb, labels in src/components/Settings/DurationSlider.css
- [x] T041 [P] [US3] Update ToggleSwitch.css to use theme variables for switch background, handle in src/components/Settings/ToggleSwitch.css

**Session Tracking Components**:
- [x] T042 [P] [US3] Update SessionHistory.css to use theme variables for session cards, text in src/components/SessionTracking/SessionHistory.css
- [x] T043 [P] [US3] Update SessionStats.css to use theme variables for stats display, labels in src/components/SessionTracking/SessionStats.css

**Notifications Components**:
- [x] T044 [P] [US3] Update NotificationBanner.css to use theme variables for banner background, text, icons in src/components/Notifications/NotificationBanner.css

**Logo Component**:
- [x] T045 [P] [US3] Update PomodoroLogo.css to use theme variables for logo colors, text in src/components/Logo/PomodoroLogo.css

**Integration & Verification**:
- [x] T046 [US3] Manually test all components in light theme: verify colors, contrast, readability
- [x] T047 [US3] Manually test all components in dark theme: verify colors, contrast, readability
- [x] T048 [US3] Test theme transitions: toggle rapidly, verify no flashing or layout shifts
- [x] T049 [US3] Test with prefers-reduced-motion enabled: verify instant theme switching (no transitions)
- [x] T050 [US3] Verify WCAG AA contrast compliance using WebAIM contrast checker for primary text on backgrounds

**Checkpoint**: All user stories should now be independently functional - complete theme system with manual toggle, system detection, and full component styling

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Refinements and enhancements that affect multiple user stories

- [x] T051 [P] Run all tests to verify no regressions: npm run test:once
- [x] T052 [P] Run TypeScript type checking: npm run typecheck
- [x] T053 [P] Run linter and fix any issues: npm run lint:fix
- [ ] T054 [P] Test in multiple browsers (Chrome, Firefox, Safari, Edge) for compatibility
- [ ] T055 [P] Test localStorage unavailable scenario (private browsing mode) - verify graceful degradation
- [ ] T056 [P] Measure theme toggle performance: verify < 200ms transition time (SC-001)
- [ ] T057 [P] Verify no page load performance regression: measure load time within 5% of baseline (SC-007)
- [ ] T058 Add JSDoc comments to theme-related functions and components for documentation
- [ ] T059 Update main README.md to document theme feature and keyboard shortcuts (if applicable)
- [ ] T060 Create visual documentation showing light and dark theme screenshots in specs/013-gruvbox-theme/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (system detection logic already in ThemeContext from Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (just applies existing theme variables to components)

**Note**: US2 and US3 don't strictly depend on US1, but US1 provides the user-facing toggle to verify the system works. Recommended order: US1 → US2 → US3

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core infrastructure (Phase 2) before user story implementation
- US1: Tests → Component (ThemeToggle) → Integration
- US2: Tests → Verification of existing logic → Manual testing
- US3: Tests → Parallel component updates → Integration testing

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004, T005 can run in parallel (different files)

**Foundational Phase (Phase 2)**:
- Most tasks are sequential (T007 → T008 → T009 → T010)

**User Story 1 Tests**:
- T013, T014, T015, T016, T017 can run in parallel (different test files/suites)

**User Story 1 Implementation**:
- T018 and T019 can run in parallel (component + styles)

**User Story 2 Tests**:
- T023, T024, T025, T026 can run in parallel (different test scenarios)

**User Story 3 Tests**:
- T032, T033 can run in parallel

**User Story 3 Implementation** (HIGHLY PARALLEL):
- T034 (App.css)
- T035-T038 (Timer components) can run in parallel
- T039-T041 (Settings components) can run in parallel
- T042-T043 (Session tracking) can run in parallel
- T044 (Notifications)
- T045 (Logo)
All component styling updates (T034-T045) can run in parallel

**Polish Phase**:
- T051-T057, T060 can run in parallel (different activities)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create unit test for useTheme hook initialization in tests/unit/hooks/useTheme.test.ts"
Task: "Create unit test for theme toggling in tests/unit/hooks/useTheme.test.ts"
Task: "Create unit test for setTheme function in tests/unit/hooks/useTheme.test.ts"
Task: "Create unit test for localStorage persistence in tests/unit/hooks/useTheme.test.ts"
Task: "Create integration test for theme switching UI in tests/integration/ThemeSwitching.test.tsx"

# Launch component and styles together:
Task: "Create ThemeToggle component in src/components/Settings/ThemeToggle.tsx"
Task: "Create ThemeToggle styles in src/components/Settings/ThemeToggle.css"
```

## Parallel Example: User Story 3

```bash
# Launch all component styling updates together (MAXIMUM PARALLELIZATION):
Task: "Update App.css to use CSS variables in src/components/App.css"
Task: "Update TimerDisplay.css in src/components/Timer/TimerDisplay.css"
Task: "Update TimerControls.css in src/components/Timer/TimerControls.css"
Task: "Update ModeSelector.css in src/components/Timer/ModeSelector.css"
Task: "Update SettingsPanel.css in src/components/Settings/SettingsPanel.css"
Task: "Update DurationSlider.css in src/components/Settings/DurationSlider.css"
Task: "Update ToggleSwitch.css in src/components/Settings/ToggleSwitch.css"
Task: "Update SessionHistory.css in src/components/SessionTracking/SessionHistory.css"
Task: "Update SessionStats.css in src/components/SessionTracking/SessionStats.css"
Task: "Update NotificationBanner.css in src/components/Notifications/NotificationBanner.css"
Task: "Update PomodoroLogo.css in src/components/Logo/PomodoroLogo.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T012) - CRITICAL foundation
3. Complete Phase 3: User Story 1 (T013-T022)
4. **STOP and VALIDATE**: Test theme toggle manually, verify persistence, run tests
5. Deploy/demo if ready - **Users can now toggle themes!**

**Estimated Time**: 3-4 hours for MVP

### Incremental Delivery

1. **Foundation** (Setup + Foundational): ~2 hours
   - Types, CSS variables, ThemeContext, useTheme hook
   - FOIT prevention
   - Foundation ready ✅

2. **MVP** (+ User Story 1): ~1.5 hours
   - Theme toggle in settings
   - Manual switching works
   - Persistence working
   - Deploy/Demo (Core value delivered!) 🚀

3. **Enhanced** (+ User Story 2): ~1 hour
   - System preference detection
   - Smart defaults for new users
   - Deploy/Demo (Better first impression!) 🎨

4. **Complete** (+ User Story 3): ~2 hours
   - All components themed
   - Full visual consistency
   - WCAG AA compliance
   - Deploy/Demo (Production ready!) ✨

5. **Polished** (+ Phase 6): ~1 hour
   - Testing, documentation
   - Cross-browser verification
   - Performance validation
   - Final release 🎉

**Total Estimated Time**: 7-8 hours

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (T001-T012) - ~2 hours
2. **Once Foundational is done**:
   - **Developer A**: User Story 1 (T013-T022) - Theme toggle
   - **Developer B**: User Story 2 (T023-T031) - System detection
   - **Developer C**: User Story 3 (T032-T050) - Component styling (MOST PARALLELIZABLE)
3. Stories complete independently, merge in priority order (US1 → US2 → US3)

**Parallel Team Time**: ~3-4 hours total (vs 7-8 sequential)

---

## Task Summary

**Total Tasks**: 60

**Tasks per Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 6 tasks (BLOCKING)
- Phase 3 (US1 - Toggle): 10 tasks (5 tests + 5 implementation)
- Phase 4 (US2 - System Preference): 9 tasks (4 tests + 5 verification)
- Phase 5 (US3 - Component Styling): 19 tasks (2 tests + 17 implementation)
- Phase 6 (Polish): 10 tasks

**Parallel Opportunities**:
- Setup: 4 tasks can run in parallel
- US1 Tests: 5 tasks can run in parallel
- US1 Implementation: 2 tasks can run in parallel
- US2 Tests: 4 tasks can run in parallel
- US3 Tests: 2 tasks can run in parallel
- US3 Implementation: 12 tasks can run in parallel (highest parallelization!)
- Polish: 7 tasks can run in parallel

**Critical Path**: Setup → Foundational (BLOCKING) → US1 → US2 → US3 → Polish

**MVP Scope** (Minimum Viable Product):
- Phase 1: Setup (T001-T006)
- Phase 2: Foundational (T007-T012)
- Phase 3: User Story 1 (T013-T022)
- **Total MVP Tasks**: 22 tasks (~3-4 hours)

**Success Criteria Mapping**:
- SC-001 (< 200ms toggle): Verified in T056
- SC-002 (100% components themed): Achieved in Phase 5 (US3)
- SC-003 (Persistence): Tested in T016, T022
- SC-004 (System detection): Tested in T023-T026, T030
- SC-005 (WCAG AA): Verified in T033, T050
- SC-006 (User comfort): Qualitative - collect feedback post-deployment
- SC-007 (< 5% performance): Measured in T057

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Phase 2 is BLOCKING - no user stories can start until foundation complete
- Phase 5 (US3) has highest parallelization potential (12 CSS files independently updatable)
- Refer to quickstart.md for detailed implementation guidance per phase
- Refer to contracts/ for API contracts and type definitions
- Refer to gruvbox-colors.md for exact color values

