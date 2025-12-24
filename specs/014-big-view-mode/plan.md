# Implementation Plan: Big View Mode

**Branch**: `014-big-view-mode` | **Date**: December 24, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-big-view-mode/spec.md`

## Summary

Add an immersive Big View mode that transforms the Pomodoro timer into a full-screen, distraction-free countdown display. When enabled, the timer fills 90-95% of the viewport with centiseconds precision (MM:SS.CS format) and smooth digit animations. All UI elements (header, controls, session tracking, footer) are hidden from the initial viewport and accessible by scrolling down. The Settings button is repositioned into the control button row for accessibility.

**Technical Approach**: Implement as a CSS-driven layout mode toggled by a boolean preference, with JavaScript handling the centiseconds timer update at 100Hz and CSS animations for smooth digit transitions.

## Technical Context

**Language/Version**: TypeScript 5.3, React 18.2  
**Primary Dependencies**: React, React DOM, Vite (build), date-fns (time utilities)  
**Storage**: localStorage for preference persistence  
**Testing**: Jest 29.7, @testing-library/react 14.1, @testing-library/user-event 14.5  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: 
- 100Hz timer updates (10ms intervals) for centiseconds display
- <500ms transition time to/from Big View mode
- 60fps smooth animations for digit transitions
- No layout jank during scroll

**Constraints**: 
- Must work across viewport sizes from 320px (mobile) to 4K displays
- Timer accuracy must remain consistent with existing 100ms update interval
- No breaking changes to existing timer functionality
- Big View must be accessible via keyboard and screen readers

**Scale/Scope**: 
- Single new preference (bigViewEnabled: boolean)
- ~3-4 new CSS classes for layout modes
- 1 modified component (Timer) for centiseconds display
- 1 modified component (App) for layout orchestration
- 1 modified component (SettingsPanel) for new toggle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: The constitution file is a template placeholder. Based on the existing pomodoro codebase patterns, the following principles are inferred and will be checked:

### Principle 1: Component Isolation
✅ **PASS**: Big View mode is implemented as an isolated layout concern using CSS classes and React state. No architectural changes required.

### Principle 2: State Management
✅ **PASS**: Big View preference follows existing pattern of storing user preferences in localStorage via useSettings hook. No new state management paradigm introduced.

### Principle 3: Testing
✅ **PASS**: All new functionality will have corresponding unit and integration tests following existing Jest + Testing Library patterns.

### Principle 4: Accessibility
✅ **PASS**: Settings button remains accessible in Big View mode via control row. Keyboard navigation preserved. Screen reader compatibility maintained.

### Principle 5: Performance
⚠️ **REVIEW NEEDED**: 100Hz timer updates (vs current 100ms) requires validation for performance impact across devices.

**Decision**: Proceed with conditional centiseconds display only in Big View mode. Regular mode maintains existing 100ms update interval.

## Project Structure

### Documentation (this feature)

```text
specs/014-big-view-mode/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── UserPreferences.ts   # Updated type definition
│   ├── Timer.tsx            # Updated component interface
│   └── App.css              # Big View CSS contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── App.tsx                    # [MODIFIED] Add bigViewEnabled state, conditional layout classes
│   ├── App.css                    # [MODIFIED] Add .app--big-view layout styles
│   ├── Settings/
│   │   ├── SettingsPanel.tsx      # [MODIFIED] Add Big View toggle in Appearance section
│   │   └── SettingsPanel.css      # [MODIFIED] Styling for new toggle (if needed)
│   └── Timer/
│       ├── Timer.tsx              # [MODIFIED] Add centiseconds display, conditional formatting
│       ├── Timer.css              # [MODIFIED] Add .timer--big-view styles with animations
│       ├── TimerDigit.tsx         # [NEW] Individual digit component for animations
│       └── TimerDigit.css         # [NEW] Smooth transition animations
├── types/
│   └── settings.ts                # [MODIFIED] Add bigViewEnabled: boolean to UserPreferences
├── hooks/
│   └── useTimer.ts                # [MODIFIED] Add centiseconds calculation, optional higher frequency updates
└── constants/
    └── defaults.ts                # [MODIFIED] Add DEFAULT_BIG_VIEW_ENABLED = false

tests/
├── unit/
│   ├── components/
│   │   ├── Timer.test.tsx         # [MODIFIED] Add centiseconds display tests
│   │   └── TimerDigit.test.tsx    # [NEW] Animation component tests
│   └── hooks/
│       └── useTimer.test.ts       # [MODIFIED] Add centiseconds calculation tests
└── integration/
    ├── BigViewLayout.test.tsx     # [NEW] Full layout behavior tests
    └── BigViewPersistence.test.tsx # [NEW] Preference persistence tests
```

**Structure Decision**: Web application structure (frontend only). Big View is purely a UI/layout feature with no backend dependencies. All changes are contained within the React component tree and CSS layer.

## Complexity Tracking

No constitution violations identified. Feature follows established patterns for:
- Preference management (matches autoStartBreaks, soundsEnabled pattern)
- Component modification (follows existing Timer/Settings modification precedent)
- Layout modes (similar to theme system using CSS classes)
- Testing strategy (unit + integration tests with Jest + Testing Library)
