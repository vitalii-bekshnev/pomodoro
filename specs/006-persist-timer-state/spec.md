# Feature Specification: Persist Timer State Across Page Refresh

**Feature Branch**: `006-persist-timer-state`  
**Created**: December 19, 2025  
**Status**: Implemented  
**Input**: User description: "currently when the Focus Time timer is in progress, if to refresh the browser page without clicking the Pause button, the timer will be reset back to the default value (progress is lost). We need to keep the current timer value while it is in progress so that on page refresh the timer continues from the same state we left it. If it's in progress: it continues from the same time when we refreshed the page. If it's paused or not started, the behavior is the same: timer value before refresh and timer state are preserved."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Running Timer Persistence (Priority: P1)

Users need the timer to preserve its running state and exact remaining time when the browser page is refreshed, so that accidental refreshes or browser restarts don't cause lost productivity tracking.

**Why this priority**: Users often accidentally refresh pages (Ctrl+R, F5, browser navigation). Losing 20+ minutes of focus progress is frustrating and breaks trust in the timer's reliability.

**Independent Test**: Start focus timer → Let 10 minutes elapse → Refresh browser page → Timer should continue counting down from remaining time (15 min remaining) without resetting to 25 minutes

**Acceptance Scenarios**:

1. **Given** focus timer is running for 10 minutes (15 min remaining), **When** user refreshes browser page, **Then** timer continues running from 15 minutes remaining
2. **Given** short break timer is running for 2 minutes (3 min remaining), **When** user refreshes page, **Then** timer continues running from 3 minutes remaining
3. **Given** long break timer is running for 5 minutes (10 min remaining), **When** user refreshes page, **Then** timer continues running from 10 minutes remaining
4. **Given** timer is running and user closes browser, **When** user reopens browser and navigates to app, **Then** timer reflects accurate remaining time based on elapsed wall-clock time

---

### User Story 2 - Paused Timer Persistence (Priority: P1)

Users need paused timers to maintain their exact state (remaining time and mode) across page refreshes, so they can resume work without losing progress.

**Why this priority**: Users may pause a timer to check references, step away, or handle interruptions. Browser refreshes during pause shouldn't reset their progress.

**Independent Test**: Start focus timer → Pause at 20 minutes remaining → Refresh browser page → Timer should show paused state with 20 minutes remaining → Resume works correctly

**Acceptance Scenarios**:

1. **Given** focus timer is paused at 20 minutes remaining, **When** user refreshes page, **Then** timer displays 20 minutes remaining in paused state
2. **Given** short break is paused at 3 minutes remaining, **When** user refreshes page, **Then** timer displays 3 minutes remaining in paused state
3. **Given** paused timer is displayed, **When** user clicks Resume, **Then** timer continues countdown from displayed remaining time
4. **Given** timer is paused for extended period (hours/days), **When** user returns and refreshes, **Then** timer still shows paused state at same remaining time (no wall-clock adjustment)

---

### User Story 3 - Idle Timer Persistence (Priority: P2)

Users need the initial/idle timer state to persist across page refreshes, maintaining any custom duration settings and current mode.

**Why this priority**: If users configure custom timer durations and refresh before starting, they shouldn't lose their settings. Lower priority than running/paused states since no active work is lost.

**Independent Test**: Configure 30-minute custom focus duration → Refresh page before starting → Timer should show 30:00 in idle state → Start button works correctly

**Acceptance Scenarios**:

1. **Given** idle focus timer with default 25 minutes, **When** user refreshes page, **Then** timer displays 25:00 in idle state
2. **Given** idle focus timer with custom 30 minutes, **When** user refreshes page, **Then** timer displays 30:00 in idle state
3. **Given** user completed focus and is viewing idle short break screen, **When** user refreshes, **Then** short break timer shows in idle state (not focus)
4. **Given** idle timer at any mode, **When** user clicks Start, **Then** timer begins countdown correctly

---

### User Story 4 - Session Progress Preservation (Priority: P2)

Users need their daily Pomodoro count and 4-session cycle position to persist across page refreshes, so accurate progress tracking continues.

**Why this priority**: Session tracking motivates users and determines when long breaks occur. Losing progress breaks the Pomodoro cycle logic and user motivation.

**Independent Test**: Complete 3 focus sessions → Start 4th session → Refresh page → Session count should show 3 completed, cycle position should indicate long break is next

**Acceptance Scenarios**:

1. **Given** user completed 2 Pomodoros today, **When** user refreshes page, **Then** session counter displays 2 completed Pomodoros
2. **Given** user is on 3rd session of 4-session cycle, **When** user refreshes page, **Then** cycle indicator shows position 3/4
3. **Given** user completed 4 sessions and is due for long break, **When** user refreshes page, **Then** next break should be long break (not short)
4. **Given** user completed 10 Pomodoros across day with multiple refreshes, **When** user checks count, **Then** all 10 Pomodoros are accurately counted

---

### Edge Cases

- What happens if user refreshes while timer completes (0:00)?
  - **Assumption**: Treat as completed timer, show completion notification/banner on reload if not yet dismissed

- What if local storage is cleared or unavailable?
  - **Assumption**: Gracefully degrade to default idle state (25:00 focus), no error shown. Timer works normally going forward.

- What if system clock changes (time travel, DST, timezone)?
  - **Assumption**: For running timers, use wall-clock time to calculate remaining. May cause unexpected jumps. Clamp to 0 if negative.

- What if user has multiple tabs open with same timer?
  - **Assumption**: Each tab operates independently with shared storage. Last-write-wins for state. No cross-tab synchronization required (out of scope).

- What if page refresh happens during transition (timer just completed)?
  - **Assumption**: If timer remaining ≤ 0, treat as completed. Show idle state for next mode.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Timer MUST save current state (status, mode, remaining time, duration) to persistent storage whenever state changes
- **FR-002**: Timer MUST save a timestamp when transitioning to "running" status to enable wall-clock-based calculation
- **FR-003**: On page load, timer MUST restore saved state from persistent storage if available
- **FR-004**: For running timers, app MUST calculate actual remaining time based on elapsed wall-clock time since last save
- **FR-005**: For paused timers, app MUST restore exact remaining time without wall-clock adjustment
- **FR-006**: For idle timers, app MUST restore mode and duration without starting countdown
- **FR-007**: Timer MUST restore correct mode (focus, short-break, long-break) from saved state
- **FR-008**: Session tracking (daily count, cycle position) MUST be saved to persistent storage on each change
- **FR-009**: Session tracking MUST be restored on page load to maintain accurate progress
- **FR-010**: If saved running timer has elapsed past 0 (wall-clock check), app MUST treat as completed
- **FR-011**: If persistent storage is unavailable or corrupted, app MUST gracefully degrade to default idle state
- **FR-012**: Timer state MUST be saved atomically to prevent partial state corruption
- **FR-013**: Settings/preferences MUST continue to persist independently of timer state
- **FR-014**: Restored running timer MUST continue countdown animation smoothly without visible jumps

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of page refreshes during running timer preserve remaining time within 1-second accuracy
- **SC-002**: 100% of page refreshes during paused timer restore exact remaining time
- **SC-003**: Timer state recovery from storage completes in under 100ms on page load
- **SC-004**: Restored running timers resume countdown within 500ms of page load
- **SC-005**: Zero data loss for session progress (daily count, cycle position) across refreshes
- **SC-006**: Restored timers show correct mode (focus/break) 100% of the time
- **SC-007**: App handles missing/corrupted storage gracefully with no errors or crashes
- **SC-008**: Running timer elapsed time calculation accurate within 2 seconds even after hours of being closed
- **SC-009**: Paused timer maintains exact remaining time even after days of being paused
- **SC-010**: User can refresh page at any time (idle, running, paused) without unexpected behavior

## Assumptions

- Persistent storage (localStorage) is available and functional in user's browser
- Users have JavaScript enabled (application requirement)
- Browser maintains consistent localStorage across page refreshes and sessions
- System clock is reasonably accurate and doesn't jump dramatically
- Users primarily use single tab (multi-tab synchronization is out of scope)
- Timer state updates occur frequently enough (every second while running) to minimize data loss
- User preferences/settings are already persisted (not part of this feature)
- Session tracking (daily count, cycle position) is already persisted (verify and enhance if needed)

## Scope

### In Scope

- Save timer state (status, mode, remaining, duration, timestamp) to localStorage
- Restore timer state on page load/initialization
- Calculate wall-clock elapsed time for running timers on restore
- Preserve exact remaining time for paused timers
- Restore idle timer state with correct mode and duration
- Persist session tracking data (daily Pomodoro count, cycle position)
- Restore session tracking on page load
- Handle edge cases: timer completion during refresh, missing storage, corrupted data
- Graceful degradation when storage unavailable
- Unit and integration tests for persistence logic
- Update existing persistence code if needed

### Out of Scope

- Multi-tab synchronization (each tab independent)
- Real-time cross-device synchronization (cloud sync)
- Offline service worker implementation
- Timer state history or undo functionality
- Recovery UI for corrupted state (just reset to default)
- Notification state persistence (notification banner state not persisted)
- Sound state persistence across refreshes (out of scope)
- Settings/preferences persistence (already implemented, not part of this feature)
- Browser extension or PWA installation for better persistence
- IndexedDB or other storage mechanisms (localStorage sufficient)

## Technical Constraints

- Must use existing localStorage infrastructure (don't introduce new storage layer)
- Must work with existing timer hook (useTimer) and session tracking (useSessionTracking)
- Must not break existing timer functionality or tests
- Must maintain <100ms page load performance impact
- Must handle localStorage quota limits gracefully (unlikely but possible)
- Must work in private/incognito mode (localStorage may be unavailable)
- Must maintain compatibility with existing state management patterns
- Should use TypeScript for type safety
- Must follow existing code style and patterns
