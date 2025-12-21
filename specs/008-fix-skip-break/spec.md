# Feature Specification: Fix Skip Break Button Behavior

**Feature Branch**: `008-fix-skip-break`  
**Created**: December 21, 2025  
**Status**: Draft  
**Input**: User description: "while break timer is in progress, if to click Skip Break button, break timer is reset to 00:00 and still stays in the break state: there is no button to start the next focus cycle. Instead of this behavior, on clicking Skip Break, the next Focus timer should start automatically."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Skip Break During Active Break Timer (Priority: P1)

Users need to skip an active break timer and immediately start the next focus session, so they can maintain their workflow momentum without getting stuck in a non-functional state.

**Why this priority**: This is the critical bug fix. Currently, clicking "Skip Break" while a break timer is running resets the timer to 00:00 but leaves the user stuck in break state with no way to start the next focus cycle. This completely breaks the Pomodoro workflow and forces users to reload the page or manually work around the issue.

**Independent Test**: Start a break timer → Click "Skip Break" while break is running → Verify timer immediately switches to focus mode with full duration (25 minutes) and starts counting down automatically.

**Acceptance Scenarios**:

1. **Given** break timer is actively running (e.g., at 03:45 remaining), **When** user clicks "Skip Break" button, **Then** timer immediately switches to focus mode (25 minutes) and status changes to 'running' (starts counting down)
2. **Given** user skipped an active break and focus timer started, **When** checking the timer display, **Then** focus timer shows correct duration (25:00 initially) and counts down normally
3. **Given** user skipped break and focus timer is now running, **When** user refreshes the page, **Then** timer continues in focus mode from the correct remaining time
4. **Given** user skipped break at 3rd cycle position, **When** new focus timer completes, **Then** system correctly moves to 4th cycle position (long break next)

---

### User Story 2 - Skip Break When Break is Pending (Priority: P2)

Users need to skip a pending (idle) break timer and immediately start the next focus session, providing a seamless transition without manual mode switching.

**Why this priority**: Handles the case where a focus session just completed and the break is ready to start (idle state) but user wants to skip it. This is less critical than P1 because the break isn't actively running, but still important for complete skip functionality.

**Independent Test**: Complete a focus timer (reaches 00:00) → Break timer is now pending/idle → Click "Skip Break" button → Verify timer switches to focus mode and starts running immediately (25 minutes, countdown begins).

**Acceptance Scenarios**:

1. **Given** break timer is in idle state (ready to start but not running), **When** user clicks "Skip Break" button, **Then** timer immediately switches to focus mode (25 min) and starts running (no manual start needed)
2. **Given** user skipped idle break and focus started, **When** checking session tracking, **Then** completed Pomodoro count is correctly incremented (skip doesn't bypass session tracking)
3. **Given** user skipped idle break, **When** focus timer starts, **Then** appropriate notification sound plays (if notifications enabled)
4. **Given** user skipped idle break at 4th cycle position, **When** checking next break type, **Then** system correctly plans for long break after this focus completes

---

### User Story 3 - Session Tracking During Skip Break (Priority: P3)

Users need the session tracking system to correctly handle break skips, ensuring cycle positions and Pomodoro counts remain accurate regardless of whether breaks are completed or skipped.

**Why this priority**: Ensures data integrity for the Pomodoro tracking system. Lower priority because it's a supporting feature that doesn't block core workflow, but necessary for accurate statistics and correct long-break timing.

**Independent Test**: Complete 3 focus sessions (with or without breaks) → Skip the 3rd break → Verify cycle shows 4/4 → Complete 4th focus → Verify system offers long break (15 min) correctly.

**Acceptance Scenarios**:

1. **Given** user has completed 2 Pomodoros and is on 3rd break, **When** user skips the break, **Then** completed Pomodoro count shows 3 and cycle position shows 3/4
2. **Given** user skipped multiple breaks during a cycle, **When** reaching 4th focus completion, **Then** system correctly offers long break (not short break)
3. **Given** user skipped a break, **When** checking localStorage, **Then** session tracking data (completedPomodoros, cyclePosition) is correctly persisted
4. **Given** user skipped break and focus is running, **When** user refreshes page, **Then** session tracking data (cycle position, count) is correctly restored

---

### Edge Cases

- What happens if user clicks "Skip Break" multiple times rapidly?
  - **Assumption**: System debounces the button (disable after first click until transition completes) to prevent duplicate transitions

- What happens if break timer completes naturally (reaches 00:00) while user is about to click "Skip Break"?
  - **Assumption**: Button should be disabled or hidden when timer reaches 00:00, only "Start Focus" button should be available

- What happens if user clicks "Skip Break" while break timer is paused (status='paused', not 'running')?
  - **Assumption**: Skip works from any break state (running, paused, or idle) - always transitions to running focus timer

- How does system handle refreshing page immediately after clicking "Skip Break" (mid-transition)?
  - **Assumption**: localStorage persistence captures the transition to focus mode + running status before the transition, so refresh shows focus timer running from full duration

- What happens if user skips all breaks in a cycle - does long break timing still work?
  - **Assumption**: Cycle position tracking is independent of break completion - skipping breaks doesn't affect when long break is offered (after 4th focus completion)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST immediately transition timer from break mode to focus mode when user clicks "Skip Break" button (regardless of break timer status: running, paused, or idle)
- **FR-002**: System MUST set timer status to 'running' (not 'idle') when transitioning from break to focus via "Skip Break" button
- **FR-003**: System MUST set focus timer duration to full default value (25 minutes) when transitioning via "Skip Break"
- **FR-004**: System MUST begin countdown immediately after "Skip Break" transition (no manual start action required)
- **FR-005**: System MUST preserve cycle position and session tracking data when skip break occurs
- **FR-006**: System MUST increment completed Pomodoro count appropriately when break is skipped (treat skip as completing the cycle)
- **FR-007**: System MUST persist the skip transition state (mode=focus, status=running, duration=25min) to localStorage for page refresh recovery
- **FR-008**: System MUST disable or debounce "Skip Break" button during transition to prevent duplicate actions
- **FR-009**: System MUST trigger appropriate notifications (if enabled) when focus timer starts after skip break
- **FR-010**: System MUST maintain correct long break timing (after 4th focus) even when breaks are skipped

### Technical Constraints

- Must not break existing timer state management (mode, status, duration, remaining time)
- Must not break existing session tracking (cycle position, completed count, sessionId)
- Must not break existing localStorage persistence and restoration
- Must reuse existing `useTimer` hook functions (`switchMode`, `start`, or equivalent)
- Must work seamlessly with existing notification system (if enabled)
- Button click must trigger atomic state transition (mode + status + duration update together)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of "Skip Break" clicks during active break timer immediately transition to running focus timer (no stuck state at 00:00)
- **SC-002**: 100% of "Skip Break" clicks from any break state (running, paused, idle) successfully start focus timer without manual intervention
- **SC-003**: Focus timer displays correct full duration (25:00) and counts down properly after skip break action
- **SC-004**: Cycle position and Pomodoro count remain accurate across multiple skip break operations (verified by correct long break timing after 4th focus)
- **SC-005**: Timer state persists correctly across page refresh during and after skip break transition
- **SC-006**: User Story 1, 2, and 3 acceptance scenarios all pass manual testing
- **SC-007**: Zero regressions in existing timer functionality (pause, reset, mode switching, completion tracking, persistence)

## Scope *(mandatory)*

### In Scope

- Fix "Skip Break" button to immediately transition from break to focus mode
- Auto-start focus timer (status='running') when skip break is clicked
- Handle skip break from any break state (running, paused, idle)
- Preserve session tracking and cycle position during skip transitions
- Persist skip transition state to localStorage for refresh recovery
- Prevent duplicate transitions with button debouncing

### Out of Scope

- Changing break notification system behavior (use existing notifications)
- Adding undo/revert for skip break action
- Implementing skip focus functionality (not mentioned in requirement)
- Adding confirmation dialog before skip break
- Customizing skip behavior (e.g., optional auto-start vs manual start)
- Multi-tab synchronization of skip actions
- Transition animations or special sound effects for skip action
- Analytics or logging of skip frequency

## Assumptions *(mandatory)*

1. **"Skip Break" button exists**: A UI button labeled "Skip Break" or similar is already present in the interface when timer is in break mode
2. **Timer hook provides functions**: The `useTimer` hook exposes functions for mode switching (e.g., `switchMode(mode)`) and starting timer (e.g., `start()`)
3. **Session tracking hook exists**: A `useSessionTracking` hook or similar tracks cycle position and completed Pomodoro count
4. **localStorage persistence works**: Timer state changes are automatically persisted to localStorage and restored on page load
5. **Mode switch behavior**: Calling mode switch function sets the new mode and updates duration to default for that mode
6. **Start function behavior**: Calling start function changes status from any state to 'running' and begins countdown
7. **Sequential function calls**: Functions can be called sequentially (switchMode then start) within the same event handler to achieve desired state transition
8. **Notification system exists**: System can trigger notifications when timers start (if user has enabled notifications)
9. **Single timer instance**: Only one timer can be active at a time (no concurrent focus and break timers)

## Dependencies *(mandatory)*

- **useTimer hook**: Provides state management functions for mode switching and timer control
- **useSessionTracking hook**: Tracks Pomodoro cycle position and completion count for correct break type determination
- **localStorage utilities**: Handles persistence and restoration of timer state across page refreshes
- **Notification system**: Triggers audio/visual notifications when timers start (if user enabled notifications)
- **Existing timer UI**: "Skip Break" button component that triggers the skip action

## Technical Constraints *(optional - remove if not applicable)*

- State transitions must be atomic and synchronous to prevent race conditions
- Button must be disabled/debounced during transition to prevent duplicate clicks
- localStorage writes must complete before page navigation/refresh
- Must work with existing React hooks patterns and state management
- Must not introduce memory leaks or unnecessary re-renders

