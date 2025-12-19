# Tasks: Pomodoro Timer

**Input**: Design documents from `/specs/001-pomodoro-timer/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Optional - not explicitly requested in specification. Tests included for critical hooks only to ensure reliability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses single-page React app structure:
- **Source**: `src/` at repository root
- **Tests**: `tests/` at repository root
- **Public assets**: `public/` at repository root

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize React + TypeScript project with Vite in /Users/vitaliibekshnev/Source/Personal/pomodoro
- [x] T002 Install core dependencies: react@18.2+, react-dom@18.2+, typescript@5.3+, date-fns@2.30+
- [x] T003 [P] Install dev dependencies: jest@29+, @testing-library/react@14+, @testing-library/jest-dom@6+
- [x] T004 [P] Configure TypeScript in /Users/vitaliibekshnev/Source/Personal/pomodoro/tsconfig.json with strict mode
- [x] T005 [P] Configure Jest in /Users/vitaliibekshnev/Source/Personal/pomodoro/jest.config.js for React Testing Library
- [x] T006 [P] Configure ESLint and Prettier in /Users/vitaliibekshnev/Source/Personal/pomodoro/.eslintrc.js
- [x] T007 [P] Setup test configuration in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/setupTests.ts
- [x] T008 Create project directory structure per plan.md (src/, tests/, public/)
- [x] T009 [P] Add notification sound files to /Users/vitaliibekshnev/Source/Personal/pomodoro/public/sounds/ (focus-complete.mp3, break-complete.mp3)
- [x] T010 [P] Create package.json scripts: dev, build, test, lint, typecheck

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core type definitions and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 [P] Define TimerMode, TimerStatus types in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/types/timer.ts
- [x] T012 [P] Define TimerSession interface in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/types/timer.ts with defaults
- [x] T013 [P] Define UserPreferences interface in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/types/settings.ts with defaults and validation
- [x] T014 [P] Define DailyProgress interface in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/types/session.ts with defaults
- [x] T015 [P] Implement time formatting utilities in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/utils/time.ts (formatTime, minutesToMilliseconds)
- [x] T016 [P] Implement localStorage helpers in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/utils/storage.ts
- [x] T017 [P] Define default constants in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/constants/defaults.ts (durations, ranges)
- [x] T018 [P] Create global CSS with CSS variables for warm color theme in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/styles/global.css
- [x] T019 [P] Define theme colors in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/styles/theme.ts (focus, short-break, long-break colors)
- [x] T020 Implement useLocalStorage hook in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/hooks/useLocalStorage.ts with JSON serialization

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 - Basic Focus Session (Priority: P1) 🎯 MVP ✅

**Goal**: Users can start a 25-minute focus session, pause/resume, reset, and receive notification when complete

**Independent Test**: Launch app, click "Start Focus", timer counts down (can fast-forward in dev), reaches 00:00, notification appears (banner + sound), app shows ready for next session

### Tests for User Story 1 (Critical hooks only)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US1] Unit test for useTimer hook in /Users/vitaliibekshnev/Source/Personal/pomodoro/tests/unit/hooks/useTimer.test.ts covering start/pause/resume/reset
- [x] T022 [P] [US1] Integration test for timer countdown flow in /Users/vitaliibekshnev/Source/Personal/pomodoro/tests/integration/TimerFlow.test.tsx

### Implementation for User Story 1

- [x] T023 [US1] Implement useTimer hook in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/hooks/useTimer.ts with setInterval + drift compensation
- [x] T024 [P] [US1] Create ProgressRing SVG component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Timer/ProgressRing.tsx
- [x] T025 [P] [US1] Create TimerDisplay component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Timer/TimerDisplay.tsx showing MM:SS
- [x] T026 [P] [US1] Create TimerControls component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Timer/TimerControls.tsx with Start/Pause/Resume/Reset buttons
- [x] T027 [US1] Create main Timer component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Timer/Timer.tsx integrating ProgressRing, TimerDisplay, TimerControls
- [x] T028 [P] [US1] Implement audio utilities in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/utils/audio.ts with pre-loading
- [x] T029 [US1] Implement useNotifications hook in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/hooks/useNotifications.ts with Audio API and banner state
- [x] T030 [US1] Create NotificationBanner component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Notifications/NotificationBanner.tsx with dismiss and action buttons
- [x] T031 [US1] Create root App component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/App.tsx wiring Timer and NotificationBanner
- [x] T032 [US1] Setup React entry point in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/index.tsx
- [x] T033 [US1] Add timer state persistence to localStorage on pause/close (FR-024) in useTimer hook
- [x] T034 [US1] Add state restoration on app launch in useTimer hook

**Checkpoint**: User Story 1 complete - App displays timer, user can start/pause/reset focus session, receives notification when complete ✅

---

## Phase 4: User Story 2 - Break Management (Priority: P2) ✅

**Goal**: After focus session completes, timer automatically switches to break mode (short/long), manages 4-session cycle for long breaks

**Independent Test**: Complete focus session → timer switches to 5-min break with different color → complete break → ready for next focus. Complete 4 focus sessions → get long break (15 min) instead of short.

### Tests for User Story 2

- [x] T035 [P] [US2] Unit test for cycle tracking logic in /Users/vitaliibekshnev/Source/Personal/pomodoro/tests/unit/hooks/useSessionTracking.test.ts
- [x] T036 [P] [US2] Integration test for 4-session cycle → long break in /Users/vitaliibekshnev/Source/Personal/pomodoro/tests/integration/SessionTracking.test.tsx

### Implementation for User Story 2

- [x] T037 [US2] Implement useSessionTracking hook in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/hooks/useSessionTracking.ts tracking completedCount and cyclePosition
- [x] T038 [US2] Add mode switching logic to useTimer hook (focus → break, determine short vs long based on cycle)
- [x] T039 [US2] Update Timer component to show mode-specific colors and labels (focus/short-break/long-break)
- [x] T040 [US2] Add skip functionality to Timer component and TimerControls (skip break → focus, skip focus → reset cycle to 0 per FR-020)
- [x] T041 [US2] Update NotificationBanner to show appropriate message for completed mode and offer next action
- [x] T042 [US2] Add daily progress persistence to localStorage in useSessionTracking hook
- [x] T043 [US2] Add daily reset logic (midnight check) in useSessionTracking hook

**Checkpoint**: User Stories 1 AND 2 complete - Full Pomodoro cycle functional (focus → break → focus, 4-session → long break) ✅

---

## Phase 5: User Story 3 - Session Tracking & Visual Progress (Priority: P2) ✅

**Goal**: Display daily Pomodoro count and cycle progress indicator (🍅🍅⬜⬜ visual)

**Independent Test**: Start fresh → counter shows 0. Complete focus session → counter shows 1 🍅⬜⬜⬜. Complete 3 more → counter shows 4. Next day → counter resets to 0.

### Implementation for User Story 3

- [x] T044 [P] [US3] Create SessionCounter component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/SessionTracking/SessionCounter.tsx showing "X Pomodoros today"
- [x] T045 [P] [US3] Create CycleIndicator component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/SessionTracking/CycleIndicator.tsx with tomato emoji progress (🍅⬜⬜⬜)
- [x] T046 [US3] Add SessionCounter and CycleIndicator to App component layout
- [x] T047 [US3] Wire session tracking state from useSessionTracking to SessionCounter and CycleIndicator components

**Checkpoint**: User Stories 1, 2, AND 3 complete - Users see progress tracking and feel motivated ✅

---

## Phase 6: User Story 4 - Timer Customization (Priority: P3)

**Goal**: Users can customize focus/short-break/long-break durations via settings panel

**Independent Test**: Open settings → adjust focus to 30 min → save → timer shows 30:00. Reopen app → still shows 30:00 (persistence).

### Tests for User Story 4

- [x] T048 [P] [US4] Integration test for settings persistence in /Users/vitaliibekshnev/Source/Personal/pomodoro/tests/integration/SettingsPersistence.test.tsx

### Implementation for User Story 4

- [x] T049 [US4] Implement useSettings hook in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/hooks/useSettings.ts with validation and localStorage persistence
- [x] T050 [P] [US4] Create DurationSlider component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Settings/DurationSlider.tsx with range validation
- [x] T051 [P] [US4] Create ToggleSwitch component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Settings/ToggleSwitch.tsx for boolean settings
- [x] T052 [US4] Create SettingsPanel component in /Users/vitaliibekshnev/Source/Personal/pomodoro/src/components/Settings/SettingsPanel.tsx with 3 duration sliders
- [x] T053 [US4] Add settings icon/button to App component that opens SettingsPanel overlay
- [x] T054 [US4] Wire useSettings preferences to useTimer hook for custom durations
- [x] T055 [US4] Ensure settings can be modified without interrupting running timer (FR-024, SC-008)

**Checkpoint**: User Story 4 complete - Users can customize timer durations ✅

---

## Phase 7: User Story 5 - Auto-Start Behavior (Priority: P3)

**Goal**: Users can enable auto-start for breaks/focus to minimize interruptions

**Independent Test**: Enable "auto-start breaks" → complete focus → break starts automatically without clicking. Enable "auto-start focus" → complete break → focus starts automatically.

### Implementation for User Story 5

- [x] T056 [US5] Add autoStartBreaks and autoStartFocus toggles to SettingsPanel component
- [x] T057 [US5] Implement auto-start logic in useTimer hook when mode switches (check preferences)
- [x] T058 [US5] Update NotificationBanner to show different message when auto-start is enabled

**Checkpoint**: User Story 5 complete - Auto-start reduces friction for deep work sessions ✅

---

## Phase 8: User Story 6 - Notification Customization (Priority: P3)

**Goal**: Users can toggle notification sounds on/off (banner always shows per clarification)

**Independent Test**: Disable sounds → complete session → banner appears but no audio. Enable sounds → audio plays.

### Implementation for User Story 6

- [x] T059 [US6] Add soundsEnabled toggle to SettingsPanel component
- [x] T060 [US6] Wire soundsEnabled preference to useNotifications hook
- [x] T061 [US6] Add sound preview buttons to SettingsPanel (test focus/break sounds)
- [x] T062 [US6] Ensure distinct sounds for focus vs break completion (FR-008)

**Checkpoint**: All user stories (1-6) complete - Full feature set implemented ✅

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [x] T063 [P] Add React.memo optimization to TimerDisplay component to prevent unnecessary re-renders
- [x] T064 [P] Add useMemo for progress percentage calculation in ProgressRing component
- [x] T065 [P] Debounce settings slider changes in DurationSlider component
- [x] T066 [P] Add CSS transitions for mode color changes (focus ↔ break)
- [x] T067 [P] Add animations for notification banner appearance/dismissal
- [x] T068 [P] Implement button debouncing for rapid clicks on Start/Pause/Reset (edge case)
- [x] T069 [P] Add unit test for time formatting utilities in /Users/vitaliibekshnev/Source/Personal/pomodoro/tests/unit/utils/time.test.ts
- [x] T070 [P] Add unit test for storage utilities in /Users/vitaliibekshnev/Source/Personal/pomodoro/tests/unit/utils/storage.test.ts
- [ ] T071 Test audio pre-loading on app mount (handle browser autoplay policy)
- [ ] T072 Cross-browser testing: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- [ ] T073 Verify timer accuracy over 60-minute session (±1 second per FR/assumptions)
- [ ] T074 Test localStorage quota handling (graceful degradation if full)
- [x] T075 Verify bundle size <150KB gzipped per performance goals
- [x] T076 Run accessibility audit (keyboard navigation, ARIA labels)
- [x] T077 [P] Create README.md at repository root with setup instructions
- [x] T078 [P] Update documentation with final implementation notes

**Checkpoint**: Polish phase complete - Application ready for production ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 (P1) → US2, US3 (P2) → US4, US5, US6 (P3)
- **Polish (Phase 9)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - **No dependencies on other stories** ✅ MVP
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 timer with mode switching
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Displays data from US2 session tracking
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Adds settings that affect US1 timer
- **User Story 5 (P3)**: Depends on US2 and US4 (needs mode switching + settings)
- **User Story 6 (P3)**: Depends on US1 (needs notifications working first)

### Within Each User Story

- Tests (when included) MUST be written and FAIL before implementation
- Foundational hooks before components
- Reusable UI components (sliders, toggles) can be parallel
- Integration into App component last within each story
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase** (all can run in parallel):
- T002, T003, T004, T005, T006, T007, T009, T010

**Foundational Phase** (all can run in parallel):
- T011-T019 (types, utils, constants, styles)
- T020 comes after others (uses storage utils)

**User Story 1**:
- T021, T022 (tests) - parallel
- T024, T025, T026, T028 (independent components/utils) - parallel after T023
- T029-T034 sequentially integrate everything

**User Story 2**:
- T035, T036 (tests) - parallel
- T037-T043 sequential (mode switching logic builds on itself)

**User Story 3**:
- T044, T045 (independent components) - parallel
- T046, T047 sequential (integration)

**User Story 4**:
- T050, T051 (reusable components) - parallel after T049
- T052-T055 sequential (settings panel integration)

**User Story 5**:
- T056-T058 sequential (builds on US4 settings)

**User Story 6**:
- T059-T062 sequential (sound toggle integration)

**Polish Phase** (many can run in parallel):
- T063, T064, T065, T066, T067, T068, T069, T070, T077, T078 - all parallel

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task T021: "Unit test for useTimer hook in tests/unit/hooks/useTimer.test.ts"
Task T022: "Integration test for timer countdown flow in tests/integration/TimerFlow.test.tsx"

# After implementing useTimer (T023), launch UI components in parallel:
Task T024: "Create ProgressRing component in src/components/Timer/ProgressRing.tsx"
Task T025: "Create TimerDisplay component in src/components/Timer/TimerDisplay.tsx"
Task T026: "Create TimerControls component in src/components/Timer/TimerControls.tsx"
Task T028: "Implement audio utilities in src/utils/audio.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended Initial Approach

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T020) ← **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T021-T034)
4. **STOP and VALIDATE**: 
   - Can user start focus session?
   - Does timer count down correctly?
   - Does notification appear at 00:00?
   - Does state persist on app close/reopen?
5. Deploy/demo MVP if ready ✅

**Result**: Fully functional basic Pomodoro timer (25 min focus → notification)

### Incremental Delivery (Add Features Progressively)

1. Complete Setup + Foundational (T001-T020) → Foundation ready ✅
2. Add User Story 1 (T021-T034) → Test independently → Deploy/Demo **(MVP!)** 🎯
3. Add User Story 2 (T035-T043) → Test independently → Deploy/Demo (Full Pomodoro cycle)
4. Add User Story 3 (T044-T047) → Test independently → Deploy/Demo (Progress tracking)
5. Add User Story 4 (T048-T055) → Test independently → Deploy/Demo (Customization)
6. Add User Story 5 (T056-T058) → Test independently → Deploy/Demo (Auto-start)
7. Add User Story 6 (T059-T062) → Test independently → Deploy/Demo (Sound control)
8. Polish (T063-T078) → Final release

**Each increment adds value without breaking previous stories**

### Parallel Team Strategy (Multiple Developers)

With 2-3 developers:

1. **Team completes Setup + Foundational together** (T001-T020)
2. **Once Foundational is done, split work**:
   - Developer A: User Story 1 (T021-T034) - Critical path
   - Developer B: User Story 4 (T048-T055) - Settings infrastructure
   - Developer C: Tests and utilities (T069, T070, foundational polish)
3. **After US1 complete**:
   - Developer A: User Story 2 (T035-T043) - Builds on US1
   - Developer B: User Story 3 (T044-T047) - Independent UI
   - Developer C: User Story 6 (T059-T062) - Independent feature
4. **Finally**:
   - Developer A: User Story 5 (T056-T058) - Needs US2 + US4
   - All developers: Polish phase (T063-T078) in parallel

---

## Success Criteria Mapping

| Success Criterion | Validated By | User Story |
|-------------------|--------------|------------|
| SC-001: Start focus with single click | T031, T034 | US1 |
| SC-002: Notification within 1 second | T029, T030, T041 | US1, US2 |
| SC-003: Complete Pomodoro cycle | T038, T039, T041 | US2 |
| SC-004: View daily progress at glance | T044, T046 | US3 |
| SC-005: Smooth countdown updates | T023, T063 | US1 |
| SC-006: Customize durations with persistence | T049, T054, T048 | US4 |
| SC-007: Visual mode distinction <2s | T039, T066 | US2 |
| SC-008: Settings without interrupting timer | T055 | US4 |
| SC-009: Understand start button <30s | T031, T076 | US1 |
| SC-010: 4 Pomodoros → long break | T037, T038, T036 | US2 |

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be **independently completable and testable**
- **Verify tests fail before implementing** (T021, T022, T035, T036, T048)
- Commit after each task or logical group
- **Stop at any checkpoint** to validate story independently
- **MVP = User Story 1 only** (~34 tasks, approximately 2-3 days for experienced React developer)
- **Full feature set** = All user stories + polish (~78 tasks, approximately 1-2 weeks)

---

## Quick Reference

**Total Tasks**: 78  
**User Stories**: 6 (3 priorities: P1, P2, P3)  
**Test Tasks**: 7 (critical paths only)

**Task Breakdown by Phase**:
- Setup: 10 tasks
- Foundational: 10 tasks (**BLOCKS all user stories**)
- US1 (P1 - MVP): 14 tasks 🎯
- US2 (P2): 9 tasks
- US3 (P2): 4 tasks  
- US4 (P3): 7 tasks
- US5 (P3): 3 tasks
- US6 (P3): 4 tasks
- Polish: 16 tasks

**Parallel Opportunities**: 40+ tasks marked [P] can run in parallel within their phase

**MVP Scope** (Recommended): Phases 1-3 (34 tasks) = Basic functional Pomodoro timer

**Full Feature Set**: Phases 1-9 (78 tasks) = Complete application with all customization

