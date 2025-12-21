# Feature Specification: Fix Timer State Restoration Bugs

**Feature Branch**: `007-fix-timer-state-bugs`  
**Created**: December 19, 2025  
**Status**: Draft  
**Input**: User description: "1. On refreshing the page while the timer is running, it sets the timer 2 seconds forward, like 24:35 -> 24:37
2. After the timer finishes AND while the user hasn't clicked START BREAK in the notification, the pomodoros completed today count will be increased by 2 on every tab refresh
3. If the notification about starting a break disappears, there is no other way to start the break. We need to either keep the notification there until the user starts the break.
4. After the timer is finished, there is still a button Start Focus, on clicking which nothing happens. It should start the new Focus Time timer skipping the break."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate Timer Restoration (Priority: P1)

Users need the timer to restore to the exact remaining time when refreshing the page, without any time jumps or inaccuracies, so they can trust the timer's reliability during focus sessions.

**Why this priority**: Time accuracy is fundamental to the Pomodoro technique. A 2-second jump on every refresh breaks user trust and makes the timer unreliable. This is the most critical bug as it affects every running timer restoration.

**Independent Test**: Start timer showing 24:35 remaining → Refresh page → Timer shows exactly 24:35 (±1 second max for calculation overhead), not 24:37

**Acceptance Scenarios**:

1. **Given** focus timer is running with 24:35 remaining, **When** user refreshes page, **Then** timer shows 24:35 (±1 sec) remaining, not 24:37
2. **Given** short break timer is running with 4:20 remaining, **When** user refreshes page, **Then** timer shows 4:20 (±1 sec) remaining
3. **Given** timer is running and user waits 5 seconds then refreshes, **When** page reloads, **Then** timer shows original_time minus ~5 seconds (wall-clock accurate)
4. **Given** any running timer, **When** user refreshes multiple times rapidly, **Then** each refresh shows accurate remaining time without cumulative errors

---

### User Story 2 - Prevent Duplicate Session Count (Priority: P1)

Users need their daily Pomodoro count to remain accurate across page refreshes, even when a completion notification is showing, so their productivity tracking reflects actual work completed.

**Why this priority**: Duplicate session counting invalidates progress tracking and motivation metrics. After finishing a timer, refreshing the page should never increment the count again. This breaks the core session tracking functionality.

**Independent Test**: Complete 1 Pomodoro (count shows 1) → Wait on notification screen without clicking → Refresh page 5 times → Count still shows 1, not 3/5/7/etc.

**Acceptance Scenarios**:

1. **Given** timer just completed and notification is showing (count = 1), **When** user refreshes page without clicking notification, **Then** count remains 1 after refresh
2. **Given** timer completed and notification showing (count = 3), **When** user refreshes page multiple times (5x), **Then** count remains 3, not incremented on each refresh
3. **Given** timer in completed state with notification dismissed, **When** user refreshes page, **Then** count does not increment
4. **Given** user completes 2 Pomodoros in sequence with refreshes between, **When** checking final count, **Then** count shows exactly 2, not 4 or more

---

### User Story 3 - Persistent Break Start Option (Priority: P2)

Users need a way to start their break even if the completion notification disappears or is dismissed, so they can continue their Pomodoro cycle without getting stuck.

**Why this priority**: Losing the ability to start a break after notification dismissal breaks the Pomodoro flow. While less critical than accuracy bugs, it forces users into a dead-end state with no recovery option.

**Independent Test**: Complete focus session → Dismiss/lose notification → Verify visible UI element (button/banner) to start break → Click element → Break timer starts correctly

**Acceptance Scenarios**:

1. **Given** focus timer completed and notification dismissed, **When** user looks at UI, **Then** a "Start Break" button/option is visible and clickable
2. **Given** focus timer completed and notification auto-dismissed after timeout, **When** user returns to app, **Then** break start option is still available
3. **Given** break start option is visible, **When** user clicks it, **Then** appropriate break timer (short/long based on cycle) starts immediately
4. **Given** timer completed and notification dismissed, **When** user refreshes page, **Then** break start option persists and remains functional

---

### User Story 4 - Skip Break Functionality (Priority: P3)

Users need the ability to skip a break and immediately start a new focus session, so they can maintain momentum when deeply engaged in work.

**Why this priority**: Enhances flexibility but is not critical to core functionality. Users can work around this by waiting for break timer to complete or manually resetting. Still valuable for user experience and workflow customization.

**Independent Test**: Complete focus session → See "Start Focus" button → Click button → New focus timer starts immediately (break skipped) → Daily count incremented correctly

**Acceptance Scenarios**:

1. **Given** focus timer just completed with notification showing, **When** user clicks "Start Focus" button, **Then** new 25-minute focus timer starts immediately (break skipped)
2. **Given** break is skipped via "Start Focus" button, **When** checking daily Pomodoro count, **Then** count is incremented by 1 (break skip still counts as completing cycle)
3. **Given** user is on 3rd Pomodoro of 4-session cycle and skips break, **When** starting 4th Pomodoro, **Then** cycle position correctly shows 4/4 (long break next)
4. **Given** "Start Focus" button is clicked after completion, **When** new focus timer starts, **Then** all timer controls (pause, reset, skip) work correctly

---

### Edge Cases

- What happens if user completes timer, refreshes during notification display, and completion handler runs twice?
  - **Assumption**: System should track completion state in localStorage to prevent duplicate onComplete calls for the same session

- What happens if notification is dismissed and page is closed/reopened hours later?
  - **Assumption**: Break start option should persist until user explicitly starts break or resets timer

- What happens if user rapidly refreshes page multiple times during timer running state?
  - **Assumption**: Each refresh should calculate elapsed time from original startedAt, not from last refresh (prevent cumulative errors)

- What happens if user skips break when on 4th session (long break due)?
  - **Assumption**: Cycle resets to 1/4, next break after 4 more sessions is long break again

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate remaining time on restore using wall-clock time only (Date.now() - startedAt), not adding any fixed offsets
- **FR-002**: System MUST ensure refresh time calculation does not introduce cumulative errors or constant offsets (e.g., 2-second jump)
- **FR-003**: System MUST track completion state to prevent duplicate session count increments on refresh
- **FR-004**: System MUST persist completion state (session ID or timestamp) to localStorage to detect already-counted completions
- **FR-005**: System MUST provide a persistent "Start Break" UI element when timer completes, visible even after notification dismissal
- **FR-006**: System MUST persist break-pending state to localStorage so break start option survives page refresh
- **FR-007**: System MUST implement "Skip Break" functionality via "Start Focus" button that immediately starts new focus session
- **FR-008**: System MUST increment daily Pomodoro count when break is skipped (counts as completing cycle)
- **FR-009**: System MUST update cycle position correctly when break is skipped
- **FR-010**: System MUST clear break-pending state when break is started (either via notification or persistent button)
- **FR-011**: System MUST validate that onComplete callback is only called once per actual timer completion (not on every refresh)
- **FR-012**: System MUST remove or disable "Start Focus" button when not in completed state

## Success Criteria *(mandatory)*

- **SC-001**: 100% of timer refreshes show accurate remaining time within 1 second of expected value (no 2-second jumps)
- **SC-002**: 0% of page refreshes cause duplicate session count increments when in completed state
- **SC-003**: 100% of users can start a break after notification dismissal (persistent UI element visible and functional)
- **SC-004**: "Skip Break" functionality works in 100% of cases (new focus timer starts, count increments, cycle updates)
- **SC-005**: Daily Pomodoro count remains accurate across 20+ refresh scenarios (start, complete, refresh multiple times)
- **SC-006**: Cycle position (X/4) remains accurate when skipping breaks across full 4-session cycle
- **SC-007**: Timer restoration accuracy measured within ±1 second (eliminating 2-second offset bug)
- **SC-008**: No duplicate onComplete callbacks fired for the same timer completion across refreshes

## Scope *(mandatory)*

### In Scope

- Fix wall-clock time calculation to eliminate 2-second offset on refresh
- Add completion tracking to prevent duplicate session count increments
- Add persistent "Start Break" UI element (button or banner) visible after notification dismissal
- Implement "Skip Break" functionality for "Start Focus" button
- Ensure completion state and break-pending state persist across refreshes
- Validate onComplete callback only fires once per actual completion

### Out of Scope

- Redesigning notification system (only fixing persistence of break start option)
- Adding undo functionality for skipped breaks
- Customizing break skip behavior (e.g., skip short but not long breaks)
- Multi-tab synchronization of completion state (each tab independent)

## Assumptions *(mandatory)*

1. Timer already has wall-clock-based restoration (feature 006) - this fix addresses accuracy issue in that implementation
2. localStorage is available and functional (established in feature 006)
3. Completion notification shows "Start Break" action - need to add persistent fallback
4. "Start Focus" button exists in UI after completion - currently non-functional
5. Session tracking hook (useSessionTracking) handles count increments on onComplete callback
6. onComplete callback is the only mechanism that should increment session count
7. Users expect break skip to count as completing a Pomodoro cycle (maintains 4-session rhythm)
8. Completion state can be tracked via a unique session ID or timestamp in localStorage

## Non-Goals *(optional)*

- Implementing auto-start for breaks or focus sessions
- Adding break duration customization
- Implementing break reminder notifications
- Creating break history or skip tracking
- Adding analytics for break skip patterns

## Dependencies *(optional)*

- **Feature 006 (Timer State Persistence)**: This fix depends on the wall-clock restoration logic implemented in feature 006. The 2-second offset bug is in that restoration calculation.
- **Existing Session Tracking**: Relies on useSessionTracking hook and onComplete callback mechanism for count increments.
- **Existing Notification System**: Needs to integrate with existing completion notification to add persistent break start option.

## Technical Constraints *(optional)*

- Must maintain backwards compatibility with existing localStorage structure from feature 006
- Must not break existing timer pause/resume/reset functionality
- Should minimize performance overhead of completion state checks (<1ms per operation)
- Completion tracking state should be small (<50 bytes) to avoid localStorage bloat
- Break-pending state must be independent from timer running state (can coexist with paused timer)

## Open Questions *(optional)*

None. All ambiguities have been resolved with reasonable assumptions documented above.
