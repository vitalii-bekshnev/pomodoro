# Feature Specification: Big View Mode

**Feature Branch**: `014-big-view-mode`  
**Created**: December 24, 2025  
**Status**: Draft  
**Input**: User description: "let's add BIG VIEW setting. The idea is that the pomodoro timer will take up the whole screen width and height in the browser tab. The buttons to interact with the timer should be placed slightly below the timer and be aligned in a straight horizontal line, not in two lines with the Pause above like it is right now. All the other stuff such as pomodoros completed today and current cycle should be placed below the control buttons. Heading block at the top must be hidden iin this view. When we scroll to the very top, we must only see the timer, nothing else. All the other stuff must be below the timer, we should scroll down to see control buttons and other stuff."

## Clarifications

### Session 2025-12-24

- Q: What happens to the footer (completed count message and GitHub link) when Big View mode is enabled? → A: Footer appears below session tracking at the bottom of scrollable content
- Q: How do users access settings when Big View is enabled and the header is hidden? → A: Settings button is aligned with control buttons (Pause, Reset, Skip) in the same horizontal row, positioned to the left
- Q: How should the timer digits scale to create an immersive full-screen effect? → A: Timer font size scales dynamically based on viewport dimensions to fill 90-95% of viewport (responsive sizing)
- Q: Should the timer display milliseconds in Big View mode for enhanced precision? → A: Display centiseconds (hundredths of a second, e.g., "24:59.87") with smooth animation effects for digit transitions

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enable Big View for Distraction-Free Focus (Priority: P1)

A user wants to focus intensely on their work and eliminate all visual distractions. They enable Big View mode through the settings and see only the large timer display when viewing the top of the page. The timer fills the screen, creating an immersive focus environment similar to a meditation timer or countdown display.

**Why this priority**: This is the core value proposition of the feature - providing a distraction-free, immersive timer experience. Without this, the feature has no purpose.

**Independent Test**: Can be fully tested by toggling the Big View setting on/off and verifying that the timer display fills the viewport when scrolled to top, with all other UI elements hidden from initial view.

**Acceptance Scenarios**:

1. **Given** Big View mode is disabled, **When** user scrolls to top of page, **Then** user sees header, session tracking, timer, and controls all visible in viewport
2. **Given** user opens settings panel, **When** user toggles Big View setting to enabled, **Then** setting is saved and Big View mode activates
3. **Given** Big View mode is enabled, **When** user scrolls to very top of page, **Then** user sees only the timer display filling the viewport with centiseconds precision (MM:SS.CS format), with no header or other elements visible
4. **Given** Big View mode is enabled and user is at top of page, **When** user scrolls down, **Then** control buttons appear below the timer, followed by session tracking information
5. **Given** Big View mode is enabled, **When** user refreshes the page, **Then** Big View setting persists and remains enabled

---

### User Story 2 - Interact with Timer in Big View Mode (Priority: P2)

With Big View enabled, a user needs to control the timer (start/pause/reset/skip) without the buttons being immediately visible at the top. They scroll down slightly below the large timer display to find all control buttons arranged in a single horizontal line, making them easy to access when needed but not distracting when focusing on the timer.

**Why this priority**: Essential for usability - users must be able to control the timer. However, the controls are secondary to the timer display itself (P1).

**Independent Test**: Can be fully tested by enabling Big View, scrolling down to find controls, and verifying all timer control functions work correctly and buttons are arranged horizontally.

**Acceptance Scenarios**:

1. **Given** Big View mode is enabled, **When** user scrolls down below the timer, **Then** all control buttons (Settings, Start/Pause, Reset, Skip) appear in a single horizontal row with Settings positioned to the left
2. **Given** Big View mode is enabled and control buttons are visible, **When** user clicks Start button, **Then** timer starts counting down as expected
3. **Given** Big View mode is enabled and timer is running, **When** user clicks Pause button, **Then** timer pauses as expected
4. **Given** Big View mode is enabled, **When** user clicks Reset button, **Then** timer resets to initial duration
5. **Given** Big View mode is enabled, **When** user clicks Skip button, **Then** timer advances to next mode (break or focus)

---

### User Story 3 - View Session Information in Big View Mode (Priority: P3)

After scrolling past the timer and controls, a user wants to see their session progress (pomodoros completed today, current cycle position) without this information cluttering the main timer view. They scroll down further to find session tracking information displayed below the control buttons.

**Why this priority**: Useful for tracking progress but least critical to the immersive timer experience. Users can check this information when needed rather than having it always visible.

**Independent Test**: Can be fully tested by enabling Big View, scrolling down past controls, and verifying session information displays correctly in the expected location.

**Acceptance Scenarios**:

1. **Given** Big View mode is enabled, **When** user scrolls down past control buttons, **Then** session counter showing completed pomodoros appears
2. **Given** Big View mode is enabled, **When** user scrolls down past control buttons, **Then** cycle indicator showing current position in 4-session cycle appears
3. **Given** Big View mode is enabled and user completes a focus session, **When** user scrolls to session information area, **Then** completed count increments correctly
4. **Given** Big View mode is enabled, **When** user scrolls through entire page, **Then** all information appears in order: timer (top), controls (below timer), session info (below controls), footer (at bottom)

---

### Edge Cases

- What happens when user has Big View enabled and opens settings panel? The settings panel should overlay the Big View display and function normally, opened via the Settings button in the control row.
- What happens when user has Big View enabled and a notification banner appears? The notification banner should appear at the top of the page as normal, potentially overlaying part of the timer display.
- What happens when viewport is very small (mobile device)? Timer should scale appropriately to fill available space without breaking layout, centiseconds display and animations remain functional, controls (including Settings button) remain accessible by scrolling.
- What happens when user enables Big View during an active timer session? The layout should immediately transition to Big View mode without affecting the running timer state, and centiseconds display should begin immediately.
- What happens when timer completes in Big View mode? Completion notifications and sounds should function normally, with completion message/controls appearing below the timer as expected.
- What happens when timer is paused in Big View mode? Centiseconds freeze at current value, animations stop, but the large display format remains.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Big View setting that users can toggle on/off through the settings panel
- **FR-002**: System MUST persist the Big View setting preference across browser sessions
- **FR-003**: System MUST hide the header block (logo, title, settings button) when Big View mode is enabled
- **FR-004**: System MUST display the timer occupying full viewport width and height when Big View is enabled and page is scrolled to top
- **FR-005**: System MUST arrange all timer control buttons (Settings, Start/Pause, Reset, Skip) in a single horizontal row below the timer when Big View is enabled, with Settings button positioned to the left of timer controls
- **FR-006**: System MUST position session tracking information (completed count, cycle indicator) below the control buttons when Big View is enabled
- **FR-007**: System MUST position footer (with GitHub link and completion message) below the session tracking information when Big View is enabled
- **FR-008**: System MUST allow users to scroll down to access control buttons, session information, and footer when Big View is enabled
- **FR-009**: System MUST maintain all existing timer functionality (start, pause, reset, skip) in Big View mode
- **FR-010**: System MUST maintain all existing notification functionality (sounds, banners) in Big View mode
- **FR-011**: System MUST allow users to access settings panel by clicking the Settings button in the control button row when Big View mode is enabled
- **FR-012**: System MUST apply Big View layout immediately when setting is toggled without requiring page reload
- **FR-013**: Timer display MUST scale font size dynamically based on viewport dimensions to fill 90-95% of viewport when Big View is enabled
- **FR-014**: Timer MUST display centiseconds (hundredths of a second) in MM:SS.CS format when Big View mode is enabled
- **FR-015**: Timer digit changes MUST include smooth visual transition animations to create a swift, flowing countdown effect when Big View mode is enabled

### Key Entities

- **Big View Setting**: Boolean preference indicating whether Big View mode is enabled or disabled. Stored in user preferences alongside other settings like autoStartBreaks and soundsEnabled. Defaults to disabled (false) for new users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle Big View mode on/off in under 3 seconds through the settings panel
- **SC-002**: When Big View is enabled and scrolled to top, 100% of the viewport displays only the timer with no other UI elements visible
- **SC-003**: Timer display in Big View mode scales to fill 90-95% of viewport height and width across screen sizes from 320px to 4K displays
- **SC-004**: Timer updates at 100Hz (centiseconds precision) providing smooth visual countdown in Big View mode
- **SC-005**: Users can access all timer controls by scrolling down less than one viewport height from the top in Big View mode
- **SC-006**: Big View setting persists across 100% of page reloads and browser restarts
- **SC-007**: Transition to/from Big View mode completes in under 500ms with smooth visual change
- **SC-008**: All existing timer functionality (start/pause/reset/skip) continues to work with 100% reliability in Big View mode
