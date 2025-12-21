# Implementation Plan: Fix Skip Break Button Behavior

**Branch**: `008-fix-skip-break` | **Date**: December 21, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-fix-skip-break/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix the Skip Break button to immediately transition from break state to focus mode and auto-start the focus timer. Currently, clicking "Skip Break" during an active break timer resets the timer to 00:00 but leaves the user stuck in break state with no way to start the next focus cycle. The fix will make the Skip Break button immediately switch to focus mode (25 minutes) and start the timer running automatically.

**Technical Approach**: Modify the `handleSkipBreak` function in `App.tsx` to call `timer.switchMode('focus')` followed by `timer.start()`. The existing `useTimer` hook already provides the necessary functions for atomic state transitions. Button debouncing is already implemented in `TimerControls` component.

## Technical Context

**Language/Version**: TypeScript 5.3, React 18.2  
**Primary Dependencies**: React 18.2, Vite 5.0 (build tool), date-fns 2.30.0  
**Storage**: localStorage (browser-based key-value persistence)  
**Testing**: Jest 29.7 with @testing-library/react 14.1  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application (SPA)  
**Performance Goals**: UI response time < 100ms for button clicks, localStorage write < 10ms  
**Constraints**: Must maintain state persistence across page refreshes, no backend server  
**Scale/Scope**: Single-user client-side application, ~3,000 LOC, 15 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: No constitution file found (template placeholder only). Proceeding with standard React best practices.

### Standard React Best Practices Applied

- ✅ **Component Modularity**: Keep components focused and single-purpose
- ✅ **Hook Composition**: Use existing hooks (`useTimer`, `useSessionTracking`) without modification where possible
- ✅ **State Management**: Maintain state in appropriate locations (timer state in `useTimer`, session tracking in `useSessionTracking`)
- ✅ **Type Safety**: Use TypeScript for all code with strict mode enabled
- ✅ **Testing**: Write tests for new behavior (skip break transition)
- ✅ **Performance**: Avoid unnecessary re-renders, use `useCallback` for event handlers
- ✅ **Accessibility**: Maintain keyboard navigation and screen reader support

### Design Principles for This Fix

1. **Minimal Change**: Modify only the `handleSkipBreak` function in `App.tsx` - no hook changes needed
2. **Reuse Existing Functions**: Use `timer.switchMode()` and `timer.start()` which already exist
3. **Preserve Existing Behavior**: Don't break skip focus, reset, pause, or other timer functions
4. **Maintain Debouncing**: Keep existing debounce logic in `TimerControls` (500ms delay)
5. **Session Tracking**: Ensure cycle position and Pomodoro count remain accurate

## Project Structure

### Documentation (this feature)

```text
specs/008-fix-skip-break/
├── spec.md                 # Feature specification
├── plan.md                 # This file (/speckit.plan command output)
├── research.md             # Phase 0 output (/speckit.plan command)
├── data-model.md           # Phase 1 output (/speckit.plan command)
├── quickstart.md           # Phase 1 output (/speckit.plan command)
├── contracts/              # Phase 1 output (/speckit.plan command)
│   └── timer-transitions.md # State transition contract
├── tasks.md                # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
└── checklists/
    └── requirements.md     # Quality checklist (already created)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── App.tsx                     # Main app component - WILL MODIFY handleSkipBreak
│   ├── Timer/
│   │   ├── Timer.tsx               # Timer display component - no changes
│   │   ├── TimerControls.tsx      # Control buttons - no changes (debouncing already exists)
│   │   └── TimerDisplay.tsx       # Time display - no changes
│   ├── Settings/                   # Settings components - no changes
│   └── SessionTracking/            # Session tracking components - no changes
├── hooks/
│   ├── useTimer.ts                 # Timer state management - no changes needed
│   ├── useSessionTracking.ts      # Session tracking - no changes needed
│   └── useSettings.ts              # Settings - no changes
├── types/
│   ├── timer.ts                    # Timer types - no changes
│   ├── session.ts                  # Session types - no changes
│   └── settings.ts                 # Settings types - no changes
├── utils/
│   ├── storage.ts                  # localStorage utilities - no changes
│   └── time.ts                     # Time utilities - no changes
└── constants/
    └── defaults.ts                 # Default values - no changes

tests/
├── integration/
│   └── SkipBreakTransition.test.tsx  # NEW: Integration test for skip break
└── unit/
    └── components/
        └── App.test.tsx              # MODIFY: Add test for handleSkipBreak
```

**Structure Decision**: This is a single-page web application using the standard React project structure with components, hooks, and utilities. The fix requires modification to only one function (`handleSkipBreak` in `App.tsx`). All supporting infrastructure (hooks, debouncing, persistence) already exists. Testing will be added to verify the new behavior.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - this fix aligns with standard React patterns and existing codebase architecture.

## Phase 0: Research & Analysis

### Research Questions

Based on the technical context and existing code review:

1. **How does the current skip break flow work?**
   - Current: `handleSkipBreak` in `App.tsx` calls `timer.switchMode('focus')` then `timer.start()`
   - Issue: The implementation already looks correct on line 126-130 of `App.tsx`
   - Need to investigate: Why isn't it working? Is the button wired correctly?

2. **What is the current button wiring in TimerControls?**
   - Line 140-149: "Skip Break" button only shows when `status === 'running'`
   - Issue found: Skip Break button only appears during running state, not during idle/completed break state
   - This explains the bug: If break is idle/completed, there's no Skip Break button!

3. **What conditions should show the Skip Break button?**
   - Should show during break mode (short-break or long-break) regardless of status
   - Should show when: `mode !== 'focus'` (for any break state: idle, running, paused, completed)
   - Current logic is too restrictive (only shows during running)

4. **How should session tracking behave when skipping breaks?**
   - Current: No special handling in `handleSkipBreak` (line 126-130)
   - Question: Should skipping a break increment the completed Pomodoro count?
   - Analysis: Based on spec FR-006 and existing pattern, skip break should NOT increment (only focus completion increments)
   - Current implementation is correct - no session tracking changes needed

### Research Findings

See [research.md](./research.md) for detailed analysis.

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for state machine and transition definitions.

### Contracts

See [contracts/timer-transitions.md](./contracts/timer-transitions.md) for the Skip Break state transition contract.

### Quick Start Guide

See [quickstart.md](./quickstart.md) for implementation steps and testing instructions.

## Implementation Strategy

### Changes Required

**File 1: `src/components/Timer/TimerControls.tsx`** (Lines 140-149)

Current logic:
```typescript
{status === 'running' && (
  <button onClick={handleSkip}>
    {mode === 'focus' ? 'Skip Focus' : 'Skip Break'}
  </button>
)}
```

**Change**: Modify button visibility condition to show Skip Break during any break state.

**File 2: `src/components/App.tsx`** (Lines 126-130)

Current implementation:
```typescript
const handleSkipBreak = useCallback(() => {
  timer.switchMode('focus');
  timer.start();
}, [timer]);
```

**Analysis**: The implementation is already correct! The issue is the button isn't showing at the right times.

**File 3: Tests** (New files)

- Add integration test: `tests/integration/SkipBreakTransition.test.tsx`
- Add unit test cases to `tests/unit/components/App.test.tsx`

### Risk Assessment

**Low Risk Changes:**
- Modifying button visibility condition in `TimerControls`
- Adding tests for existing `handleSkipBreak` function

**No Changes to Core Logic:**
- `useTimer` hook remains unchanged (already provides correct functions)
- `useSessionTracking` remains unchanged (correct behavior for skip)
- Debouncing logic remains unchanged (already implemented)

**Testing Coverage:**
- Integration test: Full skip break flow (break running → click Skip Break → focus starts)
- Unit test: `handleSkipBreak` function calls correct timer methods
- Manual test: Verify button shows in all break states (idle, running, paused, completed)

## Next Steps

After this plan is complete:

1. **Run `/speckit.tasks`** to generate task breakdown for implementation
2. **Implement changes** following the quickstart guide
3. **Run tests** to verify no regressions
4. **Manual testing** using the test scenarios from spec.md
5. **Update documentation** if needed

## Approval Gates

- [x] Technical context complete (all fields filled, no NEEDS CLARIFICATION)
- [x] Constitution check passed (standard React patterns applied)
- [x] Research complete (root cause identified)
- [x] Design artifacts created (data-model, contracts, quickstart)
- [ ] Tasks generated (next phase: `/speckit.tasks`)
- [ ] Implementation complete (future phase)
- [ ] Tests passing (future phase)
