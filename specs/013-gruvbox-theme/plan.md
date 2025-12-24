# Implementation Plan: Gruvbox Theme with Light/Dark Mode Toggle

**Branch**: `013-gruvbox-theme` | **Date**: December 24, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-gruvbox-theme/spec.md`

## Summary

Implement a complete theme system with Gruvbox color palette (medium contrast) supporting light and dark modes. Users can toggle themes via settings modal with instant application-wide updates. System preference detection provides smart defaults for first-time users. Theme preferences persist across sessions using localStorage.

**Technical Approach**: CSS custom properties for theme variables, React Context for theme state management, prefers-color-scheme media query for system detection, localStorage for persistence.

## Technical Context

**Language/Version**: TypeScript 5.3+ / React 18.2  
**Primary Dependencies**: React 18.2, Vite 5.0 (existing stack)  
**Storage**: localStorage (browser-native, existing pattern in codebase)  
**Testing**: Jest 29.7 + React Testing Library 14.1 (existing setup)  
**Target Platform**: Modern web browsers (Chrome 76+, Firefox 67+, Safari 12.1+, Edge 79+)  
**Project Type**: Single-page web application (SPA)  
**Performance Goals**: Theme transitions < 200ms, no layout shifts, < 5% performance impact  
**Constraints**: WCAG AA contrast ratios (4.5:1 normal text, 3:1 large text), CSS custom properties support required  
**Scale/Scope**: 7 existing component groups to theme, 2 theme variants (light/dark), ~40 CSS variables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: The constitution file appears to be a template without project-specific rules defined. Proceeding with standard best practices:

### Standard Development Gates

- ✅ **Type Safety**: TypeScript strict mode enabled, all new code fully typed
- ✅ **Testing**: Unit tests for theme hook, integration tests for theme switching
- ✅ **Accessibility**: WCAG AA compliance verified with contrast checkers
- ✅ **Performance**: Theme transitions measured, no degradation > 5% baseline
- ✅ **Code Quality**: ESLint + Prettier compliance (existing tooling)
- ✅ **Backward Compatibility**: No breaking changes to existing components

**Re-evaluation Point**: After Phase 1 design artifacts generated

## Project Structure

### Documentation (this feature)

```text
specs/013-gruvbox-theme/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0: Gruvbox colors, CSS theming patterns, system detection
├── data-model.md        # Phase 1: Theme types, preference model, color mappings
├── quickstart.md        # Phase 1: Developer guide for theme usage
├── contracts/           # Phase 1: Hook interfaces, theme type definitions
│   ├── useTheme.md     # Theme hook contract
│   ├── theme-types.ts  # TypeScript type definitions
│   └── gruvbox-colors.md # Color palette specifications
└── tasks.md             # Phase 2: Task breakdown (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Existing structure (web application)
src/
├── components/          # Existing UI components (to be themed)
│   ├── App.tsx
│   ├── Logo/
│   ├── Notifications/
│   ├── SessionTracking/
│   ├── Settings/       # ← Theme toggle control added here
│   │   ├── SettingsPanel.tsx  # Add theme toggle
│   │   └── ThemeToggle.tsx    # NEW: Toggle switch component
│   └── Timer/
│
├── hooks/              # Existing hooks
│   ├── useLocalStorage.ts   # Existing (used for persistence)
│   ├── useSettings.ts       # Existing (extended for theme)
│   └── useTheme.ts          # NEW: Theme management hook
│
├── styles/             # Existing styles
│   ├── global.css      # ← Update with theme variables
│   ├── theme.ts        # Existing (mode colors - integrate with theme system)
│   └── themes/         # NEW: Theme definitions
│       ├── gruvbox-dark.css   # Dark theme variables
│       ├── gruvbox-light.css  # Light theme variables
│       └── index.ts           # Theme exports
│
├── types/              # Existing type definitions
│   ├── settings.ts     # ← Extend with theme preference
│   └── theme.ts        # NEW: Theme type definitions
│
├── utils/              # Existing utilities
│   └── theme.ts        # NEW: Theme helper functions
│
└── contexts/           # NEW: React contexts
    └── ThemeContext.tsx  # Theme provider & context

tests/
├── unit/
│   ├── hooks/
│   │   └── useTheme.test.ts     # NEW: Theme hook tests
│   └── utils/
│       └── theme.test.ts         # NEW: Theme utility tests
└── integration/
    └── ThemeSwitching.test.tsx   # NEW: End-to-end theme tests
```

**Structure Decision**: Single-project web application structure (existing). Theme system integrates with existing component architecture using React Context pattern for global state and CSS custom properties for styling. No new build tooling required - leverages existing Vite + TypeScript setup.

## Complexity Tracking

> **No violations requiring justification**

The implementation follows existing architectural patterns:
- React Context for global state (standard pattern for cross-cutting concerns)
- CSS custom properties for theming (modern, performant approach)
- localStorage for persistence (already used for settings)
- TypeScript strict typing (project standard)

No new dependencies required. Implementation complexity is justified by user value (accessibility, customization, comfort).
