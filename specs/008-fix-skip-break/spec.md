# Feature Specification: Fix Skip Break Button Behavior

**Feature Branch**: `008-fix-skip-break`  
**Created**: December 21, 2025  
**Status**: Draft  
**Input**: User description: "On clicking Skip Focus, the timer is set to 00:00, but still stays in the Focus Time state. On clicking Skip Focus and when the focus timer finishes, the timer should switch to the Break state automatically. When the user clicks Start Break OR Start Focus, the timer starts automatically, there is no need to click Start Focus or Start Break additionally."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-Transition After Focus Complete (Priority: P1)

Users need the timer to automatically transition from focus to break state when a focus session completes, so they don't have to manually switch modes before starting their break.

**Why this priority**: This is the core fix for the broken behavior. Currently, completing a focus timer leaves users stuck in focus mode at 00:00, breaking the Pomodoro workflow. This is a critical usability issue that prevents the app from functioning as designed.

**Independent Test**: Complete a focus timer (let it reach 00:00) → Verify timer automatically switches to break mode (idle state, correct break duration) → Click "Start Break" button from Bug 3 UI → Verify break timer starts immediately without needing a second click.

**Acceptance Scenarios**:

1. **Given** focus timer is running and reaches 00:00, **When** timer completes, **Then** timer automatically transitions to appropriate break mode (short-break or long-break) with correct duration and idle status
2. **Given** focus timer just completed and transitioned to break mode, **When** user clicks "Start Break" button, **Then** break timer starts immediately (no additional click needed)
3. **Given** timer completed and transitioned to break mode, **When** user refreshes page, **Then** timer remains in break mode (not focus mode) with idle status preserved
4. **Given** user completes 4th focus session, **When** timer completes, **Then** timer automatically transitions to long-break mode (15 minutes), not short-break

---

### User Story 2 - Auto-Transition After Skip Break (Priority: P2)

Users need the timer to automatically transition from break to focus state when they skip a break, so they can immediately start a new focus session without manual mode switching.

**Why this priority**: Addresses the "Skip Break - Start Focus" button behavior from Bug 3. Currently, clicking this button may require two actions (skip + start). Users expect one click to both skip break and start focus timer running.

**Independent Test**: Complete focus timer → Click "Skip Break - Start Focus" button → Verify timer automatically switches to focus mode AND starts running (25 minutes, countdown begins).

**Acceptance Scenarios**:

1. **Given** focus timer completed and break is pending, **When** user clicks "Skip Break - Start Focus" button, **Then** timer immediately switches to focus mode (25 min) and starts running (no idle state)
2. **Given** user skipped break and focus timer is running, **When** checking session count, **Then** completed Pomodoro count is correctly incremented (skip doesn't bypass tracking)
3. **Given** user is on 3rd Pomodoro and skips break, **When** next focus completes, **Then** cycle correctly shows 4/4 (long break next)
4. **Given** user skipped break and focus timer is running, **When** user refreshes page, **Then** timer continues running in focus mode from correct time

---

### User Story 3 - Auto-Start After Start Break/Focus Click (Priority: P3)

Users need break and focus timers to start immediately when they click "Start Break" or "Start Focus" buttons, eliminating the need for a second click after mode transition.

**Why this priority**: Improves user experience by reducing clicks. Currently functional (Bug 3 implementation may already handle this), but needs verification that no double-click is required. Lower priority because workaround exists (user can click Start if needed).

**Independent Test**: Complete focus timer → Click "Start Break" button → Verify break timer is running immediately (not idle). Complete break timer → Click "Start Focus" from notification → Verify focus timer is running immediately (not idle).

**Acceptance Scenarios**:

1. **Given** focus completed and break pending (idle), **When** user clicks "Start Break" button, **Then** break timer starts running immediately (countdown begins, no additional Start click needed)
2. **Given** break completed and focus pending (idle), **When** user clicks "Start Focus" from notification, **Then** focus timer starts running immediately (countdown begins)
3. **Given** timer auto-started after button click, **When** user immediately clicks Pause, **Then** pause works correctly (timer was truly running, not idle)
4. **Given** timer auto-started after button click, **When** user refreshes page mid-countdown, **Then** timer continues running from correct time (auto-start persists)

---

### Edge Cases

- What happens if user clicks "Skip Break" multiple times rapidly?
  - **Assumption**: System debounces click (ignore additional clicks) or only processes first click
  
- How does system handle refreshing page during auto-transition from focus to break?
  - **Assumption**: localStorage saves the completed focus state, on restore the system re-checks and completes the transition to break mode
  
- What happens if user clicks "Skip Break" while break timer is already running (not idle)?
  - **Assumption**: Skip only works when timer is idle or completed, not while running. If running, button should be disabled or hidden.

- How does cycle tracking handle skipping breaks?
  - **Assumption**: Skipping a break still counts as completing the Pomodoro cycle (cycle position increments), consistent with existing session tracking logic

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically switch timer mode from 'focus' to appropriate break mode ('short-break' or 'long-break') when focus timer reaches 00:00
- **FR-002**: System MUST automatically switch timer mode from any break state to 'focus' when user clicks "Skip Break - Start Focus" button
- **FR-003**: System MUST set timer status to 'idle' (not 'completed') after auto-transition from focus to break
- **FR-004**: System MUST start timer running (status='running') immediately after user clicks "Start Break" button when timer is in idle break state
- **FR-005**: System MUST start timer running (status='running') immediately after user clicks "Start Focus" button when timer is in idle focus state
- **FR-006**: System MUST start timer running (status='running') immediately after user clicks "Skip Break - Start Focus" button (combines mode switch + start)
- **FR-007**: System MUST preserve correct cycle position after skipping breaks (skip counts as completing cycle)
- **FR-008**: System MUST persist auto-transition state changes to localStorage for page refresh recovery
- **FR-009**: System MUST trigger session tracking increment (if needed) during auto-transition from focus to break
- **FR-010**: System MUST use existing `switchMode()` function from `useTimer` hook for all mode transitions

### Technical Constraints

- Must not break existing Bug 3 implementation (persistent break start UI)
- Must not break existing Bug 2 implementation (completion tracking with sessionId)
- Must not break existing Bug 1 implementation (timer state restoration accuracy)
- Must reuse existing hooks and functions (`useTimer`, `switchMode`, `start`)
- Timer state transitions must be atomic (mode + status + duration update together)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of focus timer completions automatically transition to break mode (idle state with correct duration)
- **SC-002**: 100% of "Skip Break" clicks immediately start focus timer running (no idle state, no second click needed)
- **SC-003**: 100% of "Start Break" / "Start Focus" clicks immediately start timer running (no second click required)
- **SC-004**: Timer mode and status persist correctly across page refreshes during auto-transition states
- **SC-005**: User Story 1, 2, and 3 acceptance scenarios all pass manual testing
- **SC-006**: Zero regressions in existing Bugs 1-3 fixes (timer accuracy, completion tracking, persistent UI)
- **SC-007**: Cycle position and session count remain accurate after skip break operations

## Scope *(mandatory)*

### In Scope

- Auto-transition from focus complete (00:00) to break idle state
- Auto-transition from break skip to focus running state
- Auto-start timer on "Start Break" / "Start Focus" button clicks
- Immediate start (no idle state) on "Skip Break - Start Focus" click
- Preserve session tracking and cycle position during transitions
- localStorage persistence of transition states

### Out of Scope

- Changing notification system behavior (notifications already implemented in Bug 3)
- Adding undo/cancel for skip break action
- Customizing auto-transition behavior (e.g., optional manual transition)
- Multi-tab sync for transition states
- Transition animations or sound effects (beyond existing notification sounds)
- Break reminder if user ignores break pending state

## Assumptions *(mandatory)*

1. **Bug 3 implemented**: Persistent "Start Break" and "Skip Break - Start Focus" buttons already exist in UI (from Bug 3 implementation)
2. **Existing functions available**: `useTimer` hook exposes `switchMode()` and `start()` functions that can be called sequentially
3. **localStorage working**: Timer state persistence (from Bug 1/2/6) correctly saves and restores mode, status, duration
4. **Session tracking exists**: `useSessionTracking` hook correctly tracks cycle position and completed count
5. **Mode switch resets timer**: Calling `switchMode(newMode)` already sets duration to default for that mode and status to 'idle'
6. **Start function works**: Calling `start()` changes status from 'idle' to 'running' and begins countdown
7. **Completion handler timing**: The completion handler (where auto-transition occurs) runs before UI updates, allowing seamless transition
8. **One timer at a time**: User cannot have multiple timers running simultaneously (single global timer state)

## Dependencies *(mandatory)*

- **Bug 3 implementation**: Persistent break start UI provides the "Skip Break - Start Focus" button
- **Bug 2 implementation**: Completion tracking ensures transitions don't trigger duplicate session increments
- **Bug 1 implementation**: Timer state restoration ensures transitions persist across refreshes
- **useTimer hook**: Provides `switchMode()` and `start()` functions for state management
- **useSessionTracking hook**: Tracks cycle position to determine short vs long break

## Technical Constraints *(optional - remove if not applicable)*

- Must maintain React hooks patterns (useCallback for event handlers)
- State updates must be sequential (switchMode → start) not batched, to ensure correct state transitions
- localStorage writes must complete before page unload during transitions
- Auto-transition logic must run in completion handler (useEffect or timer interval completion callback)

