# Feature Specification: Add Notification Sounds

**Feature Branch**: `009-add-notification-sounds`  
**Created**: December 22, 2025  
**Status**: Draft  
**Input**: User description: "Sounds are not present for the application: Failed to load resource: the server responded with a status of 404. Need to find free sounds to use or generate our own for focus-complete.mp3 and break-complete.mp3"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Focus Completion Sound (Priority: P1)

Users need to hear an audio notification when a focus session completes, so they know it's time to take a break without needing to watch the timer constantly.

**Why this priority**: This is the core functionality - audio feedback for focus completion is essential for the Pomodoro technique. Users expect auditory confirmation that their focus time is done, especially when they're not actively watching the screen.

**Independent Test**: Complete a focus timer (25 minutes) → Verify an upbeat, celebratory sound plays automatically when timer reaches 00:00 → Sound should be pleasant and energizing.

**Acceptance Scenarios**:

1. **Given** focus timer is running and sounds are enabled, **When** timer reaches 00:00 and focus completes, **Then** a pleasant, celebratory chime sound plays automatically
2. **Given** focus timer completes with sounds enabled, **When** sound plays, **Then** sound duration is 1-3 seconds and file size is under 50KB
3. **Given** multiple focus sessions complete back-to-back, **When** each session ends, **Then** sound plays for each completion without overlap or distortion
4. **Given** browser autoplay policy blocks audio, **When** user clicks any button after focus completes, **Then** sound plays on first user interaction

---

### User Story 2 - Break Completion Sound (Priority: P2)

Users need to hear an audio notification when a break ends, so they know it's time to return to focused work without needing to monitor the timer.

**Why this priority**: Completes the audio feedback loop for the Pomodoro cycle. While less critical than focus completion (users are more likely to be away from device during breaks), it's still important for a complete experience.

**Independent Test**: Complete a break timer (5 or 15 minutes) → Verify a calm, gentle sound plays automatically when timer reaches 00:00 → Sound should be soothing but attention-getting.

**Acceptance Scenarios**:

1. **Given** break timer (short or long) is running and sounds are enabled, **When** timer reaches 00:00 and break completes, **Then** a gentle, calming notification sound plays automatically
2. **Given** break timer completes with sounds enabled, **When** sound plays, **Then** sound is noticeably different from focus completion sound (calmer tone)
3. **Given** user completes both short break (5 min) and long break (15 min), **When** either completes, **Then** same break completion sound plays for both
4. **Given** break completes while user is away from device, **When** user returns and interacts, **Then** sound plays if browser autoplay was blocked

---

### User Story 3 - Sound File Acquisition and Integration (Priority: P1)

Development team needs to source or generate appropriate, license-free sound files and integrate them into the application, so audio notifications work without legal or copyright issues.

**Why this priority**: Blocking issue - without actual audio files, the feature doesn't work at all. Currently returns 404 errors. Must be resolved before other user stories can be validated.

**Independent Test**: Run application in development mode → Check browser console for audio loading errors → Verify no 404 errors for sound files → Verify files load successfully.

**Acceptance Scenarios**:

1. **Given** application starts in development or production mode, **When** audio system initializes, **Then** both `focus-complete.mp3` and `break-complete.mp3` files load without 404 errors
2. **Given** sound files are added to project, **When** checking file licenses, **Then** files are either original creations, public domain, or have appropriate Creative Commons licenses (CC0, CC-BY)
3. **Given** sound files are in place, **When** building for production, **Then** files are included in distribution bundle under `/sounds/` directory
4. **Given** sound files exist in `/public/sounds/`, **When** checking file sizes, **Then** each file is under 50KB and playable in all major browsers

---

### Edge Cases

- What happens if sound files fail to load (404 or network error)?
  - **Assumption**: System continues to work silently, logs warning to console, does not crash or show error UI to user

- What happens if browser blocks autoplay (autoplay policy restriction)?
  - **Assumption**: Sound is queued and plays on first user interaction (button click, keyboard input)

- What happens if user has system volume muted or headphones unplugged?
  - **Assumption**: This is user's system configuration - app cannot detect or warn about this, user responsible for audio hardware

- What happens if sounds setting is toggled while timer is running?
  - **Assumption**: Changed setting takes effect on next timer completion (not retroactive for current running timer)

- What happens if user enables sounds but files are corrupted or invalid format?
  - **Assumption**: Audio playback fails gracefully (console warning), feature degrades to silent operation

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include two audio notification files: `focus-complete.mp3` for focus completion and `break-complete.mp3` for break completion
- **FR-002**: System MUST use license-free or properly licensed audio files (public domain, CC0, CC-BY, or original creation)
- **FR-003**: System MUST place audio files in `/public/sounds/` directory so they are accessible at runtime via `/sounds/` URL path
- **FR-004**: System MUST ensure focus completion sound has an upbeat, celebratory, energizing tone suitable for signaling accomplishment
- **FR-005**: System MUST ensure break completion sound has a calm, gentle, soothing tone suitable for signaling time to resume work
- **FR-006**: System MUST keep each audio file under 50KB in size for fast loading
- **FR-007**: System MUST keep each audio file between 1-3 seconds in duration for non-intrusive notification
- **FR-008**: System MUST play focus completion sound automatically when focus timer reaches 00:00 (if sounds enabled)
- **FR-009**: System MUST play break completion sound automatically when break timer reaches 00:00 (if sounds enabled)
- **FR-010**: System MUST handle audio loading failures gracefully without crashing or showing error UI (fail silently with console warning)

### Key Entities

- **Audio File Asset**: Represents a sound notification file
  - Attributes: file path, file size, duration, tone/mood, license type
  - Types: Focus completion sound, Break completion sound
  - Format: MP3 audio file
  - Location: `/public/sounds/` directory

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of focus timer completions play audio notification when sounds are enabled
- **SC-002**: 100% of break timer completions play audio notification when sounds are enabled
- **SC-003**: Both audio files load without 404 errors in browser console
- **SC-004**: Each audio file is under 50KB and loads in under 500ms on standard broadband connection
- **SC-005**: Audio files are properly licensed (verifiable Creative Commons, public domain, or original work with documentation)
- **SC-006**: Focus completion sound is perceivably different from break completion sound (distinct tones)
- **SC-007**: Audio playback works correctly in all major browsers (Chrome, Firefox, Safari, Edge)

## Scope *(mandatory)*

### In Scope

- Sourcing or generating two license-free audio files (focus completion, break completion)
- Adding audio files to `/public/sounds/` directory
- Verifying audio files load correctly without 404 errors
- Ensuring audio files meet technical requirements (size, duration, format)
- Documenting audio file sources and licenses
- Testing audio playback in major browsers

### Out of Scope

- Creating custom audio editing/mixing tools
- Adding volume control slider (sounds setting already exists as on/off toggle)
- Supporting multiple sound themes or user-uploaded sounds
- Adding sound preview/test button in settings (can be added later)
- Supporting audio formats other than MP3
- Adding fade-in/fade-out audio effects
- Creating unique sounds for short break vs long break (same break sound for both)
- Adding sound waveform visualizations

## Assumptions *(mandatory)*

1. **Existing audio infrastructure works**: The `audio.ts` utility and audio integration in `App.tsx` already function correctly - only files are missing
2. **Sounds toggle exists**: The "sounds enabled" setting already exists in user preferences (no new UI needed)
3. **MP3 format support**: All target browsers support MP3 audio format natively
4. **Public domain sources exist**: Free, license-appropriate sounds can be found on sites like freesound.org, pixabay.com, or generated using free tools
5. **File size acceptable**: 50KB limit is sufficient for 1-3 second MP3 at reasonable quality (128kbps or lower)
6. **No audio editing required**: Found/generated sounds can be used as-is or with minimal trimming to meet duration requirements
7. **Browser autoplay handled**: Existing code already handles autoplay policy blocking (falls back to play on user interaction)
8. **No backend storage**: Audio files are static assets served from `/public/sounds/`, not uploaded or managed via backend

## Dependencies *(mandatory)*

- **Existing audio.ts utility**: Already implements audio loading and playback logic (lines 15-26 for initialization, 33-68 for playback)
- **Browser Audio API**: Requires HTML5 Audio API support (standard in all modern browsers)
- **Public/static asset serving**: Build system (Vite) must copy files from `/public/` to distribution folder
- **License-free audio sources**: Access to public domain or Creative Commons audio libraries (freesound.org, pixabay.com, etc.)

## Notes

This is primarily an **asset integration task** rather than a code development task. The application code already supports audio playback - it just needs the actual MP3 files to exist.

**Recommended Sources** for license-free sounds:
- **Pixabay** (pixabay.com/sound-effects) - CC0 (public domain)
- **Freesound.org** - Various licenses (filter for CC0 or CC-BY)
- **Zapsplat** (zapsplat.com) - Free with attribution or paid license
- **Generate using**: Online tone generators (e.g., AudioCheck.net, Online Tone Generator)
- **Create with**: Free tools like Audacity (can generate simple tones/chimes)

**Sound Characteristics**:
- **Focus Complete**: Chime, bell, success ding, positive notification, celebration
- **Break Complete**: Soft bell, gentle notification, calm alert, meditation chime
