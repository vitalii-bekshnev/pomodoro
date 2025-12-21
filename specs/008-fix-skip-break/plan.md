# Implementation Plan: Fix Skip Break Button Behavior

**Branch**: `008-fix-skip-break` | **Date**: December 21, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-fix-skip-break/spec.md`

## Summary

Fix broken Skip Break button behavior by implementing auto-transitions and auto-start functionality. Currently, completing a focus timer leaves it stuck at 00:00 in focus mode, and clicking "Skip Break - Start Focus" doesn't properly transition or start the timer. The fix will add automatic mode transitions (focus → break on completion, break → focus on skip) and immediate timer starts on all button clicks, eliminating the need for double-clicks and ensuring seamless Pomodoro workflow.

**Key Fixes**:
1. **Auto-transition on focus complete**: When focus timer reaches 00:00 → automatically switch to break mode (idle state)
2. **Auto-start on skip break**: When "Skip Break - Start Focus" clicked → switch to focus mode AND start running
3. **Auto-start on all clicks**: "Start Break" and "Start Focus" buttons immediately start timer (no second click)

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18  
**Primary Dependencies**: 
- React Hooks (useState, useEffect, useCallback) - already in use
- Existing custom hooks: `useTimer`, `useSessionTracking`
- No new dependencies required

**Storage**: localStorage (browser native, already implemented)  
**Testing**: Manual testing (UI interactions, page refreshes, state transitions)  
**Target Platform**: Modern browsers with ES2020+ support (Chrome 90+, Firefox 88+, Safari 14+)

**Project Type**: Single-page React web application (bug fixes to existing implementation)

**Performance Goals**: 
- Auto-transition: <10ms (imperceptible to user)
- Button click to timer start: <50ms (instant feedback)
- No new performance regression vs current implementation

**Constraints**: 
- Must not break existing Bug 1-3 fixes (timer accuracy, completion tracking, persistent UI)
- Must reuse existing hooks and functions (`useTimer`, `switchMode`, `start`)
- Timer state transitions must be atomic (mode + status + duration update together)
- localStorage writes must complete before page unload

**Scale/Scope**: 
- Bug fixes in existing code, estimated ~50-80 lines changed across 2 files
- 3 user stories (P1-P3)
- No new components, only modify existing handlers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (No constitution file exists, proceeding with standard React best practices)

Since this project uses a standard React + TypeScript setup without a custom constitution, we'll follow industry-standard practices:

- ✅ **Component-based architecture**: Already established
- ✅ **Hooks for state management**: Already established (`useTimer`, `useSessionTracking`)
- ✅ **Type safety**: TypeScript strict mode enabled
- ✅ **Minimal dependencies**: No new dependencies required
- ✅ **Testing**: Manual testing for UI behavior (appropriate for bug fixes)
- ✅ **Backwards compatibility**: Must not break existing Bugs 1-3 fixes

**Re-evaluation after Phase 1**: Will verify that design doesn't introduce unnecessary complexity or violate existing patterns.

## Project Structure

### Documentation (this feature)

```text
specs/008-fix-skip-break/
├── spec.md              # Feature specification (already created)
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
└── contracts/           # Phase 1 output (to be created)
    └── timer-transitions.md  # Timer state transition contracts
```

### Source Code (repository root)

```text
src/
├── components/
│   └── App.tsx              # [MODIFY] Update handleStartBreak, handleSkipBreak handlers
├── hooks/
│   └── useTimer.ts          # [MODIFY] Add auto-transition logic to completion handler
└── types/
    └── timer.ts             # [NO CHANGE] Type definitions already support this

tests/
└── [Manual testing only - no automated tests for this fix]
```

**Structure Decision**: Single project (default React app). All changes will be in existing files:
- `src/components/App.tsx`: Update button click handlers to call `start()` immediately after `switchMode()`
- `src/hooks/useTimer.ts`: Add auto-transition from focus → break in the completion handler (where `onComplete()` is called)

**Files Affected**: 2 files total
- `src/components/App.tsx` (~30 lines changed)
- `src/hooks/useTimer.ts` (~20 lines changed)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - this fix follows existing patterns and doesn't introduce new complexity.

---

## Phase 0: Research & Discovery

**Status**: In Progress

### Research Topics

This section will be filled by generating `research.md` with the following investigations:

#### Research Topic 1: Auto-Transition Timing

**Question**: When should auto-transition from focus → break occur?

**Investigation areas**:
- Where is the completion handler currently triggered? (in `useTimer.ts` interval callback when `newRemaining <= 0`)
- Can we add `switchMode(breakType)` call immediately after `onComplete(mode)`?
- Will this interfere with Bug 2's completion tracking (sessionId check)?
- What happens to the notification banner that shows after completion?

**Expected finding**: Auto-transition should happen in the same callback where `onComplete()` is called, right after it. The `switchMode()` call will change mode/duration/status, and the notification banner will still show because it's triggered by `onComplete()`.

---

#### Research Topic 2: Sequential State Updates

**Question**: Can we call `switchMode()` then `start()` sequentially, or does React batching interfere?

**Investigation areas**:
- How does `switchMode()` work? (from existing `useTimer` implementation)
- Does it use `setSession()` directly or return a promise?
- Can we chain `switchMode(mode)` followed immediately by `start()`?
- Will the state updates be applied in correct order?

**Expected finding**: `switchMode()` uses `setSession()` (synchronous state update), followed by `start()` which also uses `setSession()`. React 18 may batch these, but since `start()` uses `setSession(prev => ...)` callback form, it will read the latest state. Should work correctly.

---

#### Research Topic 3: Skip Break Implementation Pattern

**Question**: How should "Skip Break - Start Focus" button work differently from regular skip?

**Investigation areas**:
- Current `skip()` function in `useTimer`: What does it do? (sets remaining=0, status='completed', calls onComplete)
- For "Skip Break", we want: skip break → switch to focus → start focus running
- Should we reuse `skip()` or create new function?
- How to prevent duplicate session increment (Bug 2 concern)?

**Expected finding**: Don't call `skip()` for "Skip Break - Start Focus". Instead, directly call `switchMode('focus')` then `start()`. The session increment already happened when focus completed (that's what triggered the break). Skipping break doesn't complete anything new.

---

#### Research Topic 4: Existing Handler Analysis

**Question**: What do current handlers (`handleStartBreak`, `handleSkipBreak`) do, and what needs to change?

**Investigation areas**:
- Review `App.tsx` to find current implementations (from Bug 3)
- Do they already call `start()`? Or just `switchMode()`?
- What's the current user flow?

**Expected finding** (from Bug 3 implementation):
```typescript
// Current (Bug 3):
const handleStartBreak = () => {
  const breakType = getNextBreakType();
  timer.switchMode(breakType);
  // Missing: timer.start(); ← Need to add this
};

const handleSkipBreak = () => {
  timer.switchMode('focus');
  // Missing: timer.start(); ← Need to add this
};
```

**Fix**: Add `timer.start()` call after each `switchMode()`.

---

### Technical Decisions

Will be documented in `research.md` after investigation:

1. **Auto-transition location**: In `useTimer.ts` completion callback, after `onComplete(mode)`, add:
   ```typescript
   if (prev.mode === 'focus') {
     const nextMode = getNextBreakMode(); // Need to pass or compute
     switchMode(nextMode); // This will break - switchMode is not in scope here
   }
   ```
   **Issue**: `switchMode()` is defined as a `useCallback`, not accessible in interval callback. Need different approach.

2. **Revised approach**: Instead of calling `switchMode()` in interval, modify the completion handler outside to check if mode transition is needed after `onComplete()`.

3. **Button handlers**: Simple fix - just add `timer.start()` call after `timer.switchMode()` in both handlers.

---

## Phase 1: Design & Contracts

**Status**: Pending (will be completed in `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)

### Planned Artifacts

1. **research.md**: Document findings from Phase 0 investigations and final technical decisions
2. **data-model.md**: Document timer state transitions (no new entities, just state flow diagrams)
3. **contracts/timer-transitions.md**: Document the contract for when auto-transitions occur
4. **quickstart.md**: Step-by-step testing scenarios for all 3 user stories

### Key Design Questions to Resolve

1. **Where to add auto-transition logic for focus → break?**
   - Option A: In `useTimer` interval callback (where timer completes)
   - Option B: In `App.tsx` after `handleTimerComplete` is called
   - **Preferred**: Option B (better separation of concerns, easier to test)

2. **How to determine next break type in the right context?**
   - `getNextBreakMode()` is in `App.tsx` (from `useSessionTracking`)
   - `useTimer` doesn't have access to this
   - **Solution**: Pass `getNextBreakMode` callback to auto-transition logic, or handle transition in `App.tsx`

3. **How to avoid breaking Bug 2 completion tracking?**
   - Auto-transition happens after `onComplete()` triggers
   - `onComplete()` already has sessionId tracking (Bug 2)
   - Auto-transition just changes mode, doesn't trigger new completion
   - **Conclusion**: No conflict with Bug 2

---

## Phase 2: Planning Complete

**Status**: Plan created, ready for Phase 0 research

**Next Steps**:
1. Generate `research.md` to resolve all technical questions
2. Generate `data-model.md` to document timer state transitions
3. Generate `contracts/timer-transitions.md` to formalize transition behavior
4. Generate `quickstart.md` with testing scenarios
5. After Phase 1 complete, run `/speckit.tasks` to break down into actionable tasks

**Estimated Implementation Time**: 1-2 hours
- Research & design: 30 minutes
- Core implementation: 30-45 minutes
- Testing: 30 minutes
- Documentation: 15 minutes

