# Implementation Plan: Fix Auto-Start Timers

**Branch**: `011-fix-auto-start-timers` | **Date**: 2025-01-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-fix-auto-start-timers/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement automatic timer transitions for focus and break sessions based on user preferences. When auto-start settings are enabled, completed sessions should automatically transition to the next session type within 100ms without requiring user interaction. Break start notification banners should be suppressed when auto-start breaks is enabled.

**Technical Approach**: Modify the timer completion handler in App.tsx to check auto-start preferences immediately upon completion, conditionally suppressing notification banners and automatically starting the next timer session.

## Technical Context

**Language/Version**: TypeScript 5.3.0, React 18.2.0
**Primary Dependencies**: React, TypeScript, Vite 5.0.0, Jest 29.7.0, React Testing Library
**Storage**: localStorage (browser-based key-value storage)
**Testing**: Jest with React Testing Library for component testing
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page React web application
**Performance Goals**: Auto-start transitions within 100ms of timer completion
**Constraints**: Browser-based execution, no server-side components, offline-capable
**Scale/Scope**: Single-user productivity application with timer state persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS - No specific constitutional constraints defined for this project. The constitution.md file contains template placeholders rather than active project guidelines. Implementation may proceed with standard React/TypeScript best practices.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── App.tsx                           # Main app component with auto-start logic
│   ├── Notifications/
│   │   ├── NotificationBanner.tsx        # Banner component (may need conditional rendering)
│   │   └── NotificationBanner.css
│   ├── Settings/
│   │   ├── SettingsPanel.tsx            # Settings UI (already has auto-start toggles)
│   │   ├── SettingsPanel.css
│   │   ├── ToggleSwitch.tsx             # Toggle components for auto-start settings
│   │   └── ToggleSwitch.css
│   └── Timer/
│       ├── Timer.tsx                    # Timer component (interface remains same)
│       ├── TimerDisplay.tsx
│       ├── TimerControls.tsx
│       ├── ProgressRing.tsx
│       └── *.css
├── hooks/
│   ├── useTimer.ts                      # Timer logic (completion callback interface)
│   ├── useNotifications.ts              # Notification logic (conditional banner display)
│   ├── useSettings.ts                   # Settings persistence (already has auto-start fields)
│   └── useLocalStorage.ts               # Storage utilities
├── types/
│   ├── settings.ts                      # UserPreferences interface (auto-start fields exist)
│   └── timer.ts                         # Timer types and interfaces
├── utils/
│   ├── audio.ts                         # Audio notification utilities
│   ├── storage.ts                       # localStorage utilities
│   └── time.ts                          # Time conversion utilities
├── constants/
│   └── defaults.ts                      # Default preferences and constants
└── index.tsx                            # App entry point

tests/
├── integration/
│   └── SettingsPersistence.test.tsx     # Existing integration tests
└── unit/
    ├── components/
    │   ├── App.test.tsx                 # Will need updates for auto-start behavior
    │   └── [other component tests]
    └── hooks/
        ├── [existing hook tests]        # May need updates for auto-start logic
        └── [new tests for auto-start behavior]
```

**Structure Decision**: Single-page React application following the existing project structure. Auto-start functionality will be implemented primarily in App.tsx by modifying the timer completion handler to conditionally auto-start timers and suppress notification banners based on user preferences.

