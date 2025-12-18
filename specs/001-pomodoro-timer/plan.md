# Implementation Plan: Pomodoro Timer

**Branch**: `001-pomodoro-timer` | **Date**: December 18, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-pomodoro-timer/spec.md`

## Summary

A single-page Pomodoro timer application built with React + TypeScript that provides focus session tracking (25 min), break management (5 min short, 15-20 min long), session counting, notifications, and customization options. The UI features a circular progress ring, warm color scheme, and intuitive controls. All state is managed locally in the browser with persistence via localStorage. No backend required - pure frontend application with browser APIs for notifications and audio.

## Technical Context

**Language/Version**: TypeScript 5.3+ with React 18.2+  
**Primary Dependencies**: React 18.2+, React Hooks (useState, useEffect, useRef), date-fns (time utilities)  
**Storage**: Browser localStorage for user preferences and session state  
**Testing**: Jest + React Testing Library for unit/integration tests  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Single-page web application (SPA)  
**Performance Goals**: 
- Timer updates at 60fps (smooth countdown animation)
- UI interactions respond within 16ms (60fps target)
- Initial load under 2 seconds on broadband
- Minimal re-renders (optimized with React.memo and useMemo)

**Constraints**: 
- No backend/server required (client-side only)
- Must work offline after initial load
- localStorage limited to 5-10MB (more than sufficient for settings)
- Audio notifications require user interaction before first play (browser autoplay policy)
- Desktop notifications require user permission grant

**Scale/Scope**: 
- Single-user application
- ~10 React components
- ~5 custom hooks
- 3 timer modes (focus, short break, long break)
- Approximately 1500-2000 lines of TypeScript

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS - No project constitution exists yet; this is a greenfield project. Following React community best practices and established patterns for single-page applications.

**Standard Practices Applied**:
- Component-based architecture with clear separation of concerns
- Custom hooks for business logic reusability
- TypeScript for type safety
- Testing coverage for critical paths
- Browser API usage follows feature detection patterns

**No violations to justify** - Clean slate project following industry standards.

## Project Structure

### Documentation (this feature)

```text
specs/001-pomodoro-timer/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Technology decisions & best practices
├── data-model.md        # Phase 1 output - TypeScript interfaces & state structure
├── quickstart.md        # Phase 1 output - Development setup & running instructions
├── contracts/           # Phase 1 output - Component contracts & hook signatures
│   ├── components.ts    # Component prop interfaces
│   └── hooks.ts         # Custom hook interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
pomodoro/
├── public/
│   ├── index.html
│   ├── sounds/              # Notification audio files
│   │   ├── focus-complete.mp3
│   │   └── break-complete.mp3
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── Timer/
│   │   │   ├── Timer.tsx              # Main timer display with circular progress
│   │   │   ├── TimerDisplay.tsx       # MM:SS countdown display
│   │   │   ├── TimerControls.tsx      # Start/Pause/Resume/Reset buttons
│   │   │   └── ProgressRing.tsx       # Circular SVG progress indicator
│   │   │
│   │   ├── SessionTracking/
│   │   │   ├── SessionCounter.tsx     # Daily Pomodoro count display
│   │   │   └── CycleIndicator.tsx     # 🍅🍅⬜⬜ visual progress (1-4)
│   │   │
│   │   ├── Settings/
│   │   │   ├── SettingsPanel.tsx      # Settings overlay/modal
│   │   │   ├── DurationSlider.tsx     # Reusable slider for time durations
│   │   │   └── ToggleSwitch.tsx       # Reusable toggle for boolean settings
│   │   │
│   │   ├── Notifications/
│   │   │   └── NotificationBanner.tsx # In-app notification banner
│   │   │
│   │   └── App.tsx                    # Root application component
│   │
│   ├── hooks/
│   │   ├── useTimer.ts                # Core timer logic (countdown, mode switching)
│   │   ├── useSessionTracking.ts      # Daily count & cycle position (1-4)
│   │   ├── useSettings.ts             # Settings persistence via localStorage
│   │   ├── useNotifications.ts        # Audio + visual notifications
│   │   └── useLocalStorage.ts         # Generic localStorage hook with JSON parse
│   │
│   ├── types/
│   │   ├── timer.ts                   # TimerMode, TimerStatus, TimerSession types
│   │   ├── settings.ts                # UserPreferences interface
│   │   └── session.ts                 # DailyProgress interface
│   │
│   ├── utils/
│   │   ├── time.ts                    # Time formatting utilities (MM:SS)
│   │   ├── audio.ts                   # Audio playback utilities
│   │   └── storage.ts                 # localStorage helper functions
│   │
│   ├── constants/
│   │   └── defaults.ts                # Default durations, ranges, settings
│   │
│   ├── styles/
│   │   ├── global.css                 # Global styles, CSS variables (colors)
│   │   └── theme.ts                   # Color palette (warm colors for focus/break)
│   │
│   ├── index.tsx                      # React root entry point
│   └── setupTests.ts                  # Jest/RTL configuration
│
├── tests/
│   ├── unit/
│   │   ├── hooks/
│   │   │   ├── useTimer.test.ts
│   │   │   ├── useSessionTracking.test.ts
│   │   │   └── useSettings.test.ts
│   │   │
│   │   └── utils/
│   │       ├── time.test.ts
│   │       └── storage.test.ts
│   │
│   └── integration/
│       ├── TimerFlow.test.tsx         # Full Pomodoro cycle (focus → break)
│       ├── SettingsPersistence.test.tsx
│       └── SessionTracking.test.tsx   # 4-session → long break flow
│
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

**Structure Decision**: Single-page web application using standard React project structure. Organized by feature domain (Timer, Settings, SessionTracking) rather than technical role. Custom hooks centralize business logic and make it reusable across components. Type definitions separated for clarity. No backend required - all state management happens client-side with localStorage persistence.

## Complexity Tracking

> **No violations to justify** - This is a straightforward React SPA following community best practices.

---

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed technology evaluation and decisions.

### Key Decisions Made

1. **State Management**: React Hooks (useState, useReducer) - no external state library needed
2. **Timer Implementation**: setInterval with useRef for mutable timer ID
3. **Progress Animation**: CSS transitions on SVG stroke-dashoffset for 60fps performance
4. **Audio**: HTML5 Audio API with pre-loaded sound buffers
5. **Notifications**: In-app banner component (no OS-level notifications required per spec)
6. **Persistence**: localStorage with JSON serialization
7. **Time Utilities**: date-fns for reliable time calculations
8. **Styling**: CSS Modules or Styled-Components for component-scoped styles

---

## Phase 1: Design & Contracts

See detailed artifacts:
- [data-model.md](./data-model.md) - TypeScript interfaces and state structure
- [contracts/](./contracts/) - Component props and hook signatures
- [quickstart.md](./quickstart.md) - Setup and development instructions

### Core Data Model Summary

**TimerSession**
```typescript
{
  mode: 'focus' | 'short-break' | 'long-break'
  duration: number  // milliseconds
  remaining: number // milliseconds
  status: 'idle' | 'running' | 'paused' | 'completed'
}
```

**DailyProgress**
```typescript
{
  date: string  // ISO date (YYYY-MM-DD)
  completedCount: number  // 0-N
  cyclePosition: number   // 0-3 (resets after 4)
}
```

**UserPreferences**
```typescript
{
  focusDuration: number     // minutes (5-60)
  shortBreakDuration: number // minutes (1-15)
  longBreakDuration: number  // minutes (10-30)
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundsEnabled: boolean
}
```

### Component Hierarchy

```text
App
├── Timer
│   ├── ProgressRing (SVG circular progress)
│   ├── TimerDisplay (MM:SS)
│   └── TimerControls (Start/Pause/Reset/Skip)
├── SessionTracking
│   ├── SessionCounter ("X Pomodoros today")
│   └── CycleIndicator (🍅🍅⬜⬜)
├── NotificationBanner (conditional render when session completes)
└── SettingsPanel (overlay)
    ├── DurationSlider (×3)
    └── ToggleSwitch (×3)
```

---

## Phase 2: Task Breakdown

*Task breakdown will be created via `/speckit.tasks` command - not part of `/speckit.plan` output.*

---

## Implementation Notes

### Critical Path (MVP - P1 Priority)

1. Core timer countdown with start/pause/reset (User Story 1)
2. Mode switching: focus → break (User Story 2)
3. Session completion notifications (banner + sound)
4. localStorage persistence for timer state on app close

### Enhancement Path (P2-P3)

1. Session tracking and cycle indicator (User Story 3)
2. Settings panel with customization (User Story 4-6)
3. Auto-start behavior
4. Sound toggling

### Testing Strategy

- **Unit tests**: All custom hooks (useTimer, useSessionTracking, useSettings)
- **Integration tests**: Full Pomodoro cycle workflows (focus → break → focus)
- **Manual browser testing**: Audio playback, notifications, localStorage across sessions
- **Cross-browser testing**: Chrome, Firefox, Safari, Edge

### Performance Considerations

- Use `React.memo` for Timer display to prevent unnecessary re-renders
- Use `useMemo` for expensive calculations (progress percentage)
- Debounce settings slider changes
- Pre-load audio files on app mount
- Use CSS transforms for progress ring animation (GPU-accelerated)

### Browser Compatibility Notes

- localStorage: Supported in all modern browsers
- Audio API: Requires user interaction before first play (add click handler)
- CSS custom properties: Fully supported in target browsers
- Notification API: Not used (in-app banner only per spec clarification)

---

**Plan Status**: ✅ Complete - Ready for Phase 0 artifact generation
