# Implementation Tasks: Add Notification Sounds

**Feature**: Add Notification Sounds  
**Branch**: `009-add-notification-sounds`  
**Date**: December 22, 2025  
**Status**: Ready for Implementation

## Task Overview

This is an **asset integration task** - no code changes required. The implementation consists of sourcing/generating audio files and adding them to the repository.

**Total Tasks**: 7  
**Estimated Time**: 30-60 minutes  
**Dependencies**: None (all tasks can proceed independently of other features)

---

## Phase 1: Setup and Preparation

### Task 1.1: Verify Project Structure [P]
**ID**: T1.1  
**Type**: Verification  
**Parallel**: Yes  
**Estimated Time**: 2 minutes

**Description**: Verify that the required directory structure exists and audio.ts utility is in place.

**Actions**:
- [X] Confirm `/public/sounds/` directory exists
- [X] Confirm `src/utils/audio.ts` exists and references correct paths
- [X] Confirm `App.tsx` calls `initializeAudio()` on mount (via useNotifications hook)
- [X] Updated audio.ts to use Vite base path for proper path resolution

**Files**:
- `/public/sounds/` (directory)
- `src/utils/audio.ts` (read-only verification)
- `src/components/App.tsx` (read-only verification)

**Success Criteria**:
- Directory structure matches plan.md
- No changes needed to existing code

---

## Phase 2: Audio File Acquisition

### Task 2.1: Source Focus Completion Sound
**ID**: T2.1  
**Type**: Asset Creation  
**Parallel**: Yes (can run parallel with T2.2)  
**Estimated Time**: 10-15 minutes

**Description**: Find or generate an upbeat, celebratory sound for focus timer completion.

**Actions**:
- [ ] Search Pixabay for suitable sound (keywords: "success notification", "achievement chime", "positive bell")
- [ ] Preview multiple options to find best match
- [ ] Download selected sound
- [ ] Verify/convert to MP3 format if needed
- [ ] Verify duration is 1-3 seconds
- [ ] Verify file size is <50KB
- [ ] Save as `focus-complete.mp3`

**Requirements** (from contracts/audio-assets.md):
- Format: MP3 (MPEG-1 Layer 3)
- Duration: 1-3 seconds
- File Size: ≤50KB
- Bitrate: 96-128 kbps
- Channels: Mono preferred
- Tone: Upbeat, celebratory, energizing (600-1200 Hz)
- License: CC0, CC-BY, or original creation

**Tools**:
- Browser for Pixabay: https://pixabay.com/sound-effects/
- OR Audacity for generation: https://www.audacityteam.org/
- ffmpeg for conversion (if needed): `ffmpeg -i input.wav -b:a 128k -ac 1 focus-complete.mp3`

**Success Criteria**:
- File meets all technical requirements
- Sound is pleasant and celebratory
- Proper license (CC0 or equivalent)

---

### Task 2.2: Source Break Completion Sound
**ID**: T2.2  
**Type**: Asset Creation  
**Parallel**: Yes (can run parallel with T2.1)  
**Estimated Time**: 10-15 minutes

**Description**: Find or generate a calm, gentle sound for break timer completion.

**Actions**:
- [ ] Search Pixabay for suitable sound (keywords: "gentle notification", "soft bell", "meditation chime")
- [ ] Preview multiple options to find best match
- [ ] Download selected sound
- [ ] Verify/convert to MP3 format if needed
- [ ] Verify duration is 1-3 seconds
- [ ] Verify file size is <50KB
- [ ] Save as `break-complete.mp3`
- [ ] Ensure sound is noticeably different from focus sound

**Requirements** (from contracts/audio-assets.md):
- Format: MP3 (MPEG-1 Layer 3)
- Duration: 1-3 seconds
- File Size: ≤50KB
- Bitrate: 96-128 kbps
- Channels: Mono preferred
- Tone: Calm, gentle, soothing (400-800 Hz)
- License: CC0, CC-BY, or original creation

**Tools**:
- Browser for Pixabay: https://pixabay.com/sound-effects/
- OR Audacity for generation
- ffmpeg for conversion (if needed): `ffmpeg -i input.wav -b:a 128k -ac 1 break-complete.mp3`

**Success Criteria**:
- File meets all technical requirements
- Sound is calm and distinguishable from focus sound
- Proper license (CC0 or equivalent)

---

## Phase 3: Integration

### Task 3.1: Add Audio Files to Repository
**ID**: T3.1  
**Type**: File Addition  
**Parallel**: No (depends on T2.1 and T2.2)  
**Estimated Time**: 2 minutes

**Description**: Copy the prepared audio files to the correct directory in the repository.

**Actions**:
- [ ] Copy `focus-complete.mp3` to `/public/sounds/`
- [ ] Copy `break-complete.mp3` to `/public/sounds/`
- [ ] Verify files are in correct location
- [ ] Check file permissions (should be readable)

**Files**:
- `/public/sounds/focus-complete.mp3` (NEW)
- `/public/sounds/break-complete.mp3` (NEW)

**Success Criteria**:
- Both files present in `/public/sounds/` directory
- Files are accessible and readable

---

### Task 3.2: Update Documentation
**ID**: T3.2  
**Type**: Documentation  
**Parallel**: Yes (can run parallel with T3.1)  
**Estimated Time**: 5 minutes
**Status**: ✅ COMPLETE

**Description**: Update README.md in sounds directory to document the audio files, their sources, and licenses.

**Actions**:
- [ ] Open `/public/sounds/README.md`
- [ ] Replace placeholder content with actual file documentation
- [ ] Include file descriptions, durations, sizes
- [ ] Document source URLs or note "Original creation"
- [ ] Document license type (CC0, CC-BY, etc.)
- [ ] Add attribution if CC-BY license used
- [ ] Include date added

**Files**:
- `/public/sounds/README.md` (UPDATE)

**Template**:
```markdown
# Notification Sounds

## focus-complete.mp3
- **Description**: Upbeat chime for focus timer completion
- **Duration**: [X.X] seconds
- **File Size**: [XX]KB
- **Source**: [Pixabay URL or "Generated with Audacity"]
- **License**: [CC0 / CC-BY / Original]
- **Attribution**: [If CC-BY, include attribution]
- **Added**: December 22, 2025

## break-complete.mp3
- **Description**: Gentle bell for break timer completion
- **Duration**: [X.X] seconds
- **File Size**: [XX]KB
- **Source**: [Pixabay URL or "Generated with Audacity"]
- **License**: [CC0 / CC-BY / Original]
- **Attribution**: [If CC-BY, include attribution]
- **Added**: December 22, 2025
```

**Success Criteria**:
- README.md accurately documents both files
- Source and license clearly stated
- Attribution included if required

---

## Phase 4: Testing and Validation

### Task 4.1: Test in Development Mode
**ID**: T4.1  
**Type**: Manual Testing  
**Parallel**: No (depends on T3.1)  
**Estimated Time**: 5 minutes

**Description**: Verify audio files load and play correctly in development mode.

**Actions**:
- [ ] Start dev server: `npm run dev`
- [ ] Open application in browser
- [ ] Open browser console (F12)
- [ ] Verify no 404 errors for `/sounds/focus-complete.mp3`
- [ ] Verify no 404 errors for `/sounds/break-complete.mp3`
- [ ] Verify no audio initialization errors
- [ ] Enable sounds in settings (if not already enabled)
- [ ] Start and complete a focus timer (or skip to end)
- [ ] Verify focus completion sound plays
- [ ] Start and complete a break timer (or skip to end)
- [ ] Verify break completion sound plays (different from focus)
- [ ] Verify sounds are distinguishable
- [ ] Test with sounds disabled → verify no audio plays

**Files Tested**:
- `/public/sounds/focus-complete.mp3` (load and playback)
- `/public/sounds/break-complete.mp3` (load and playback)
- `src/utils/audio.ts` (functionality verification)

**Success Criteria** (from spec.md):
- ✅ SC-001: 100% of focus timer completions play audio notification
- ✅ SC-002: 100% of break timer completions play audio notification
- ✅ SC-003: Both audio files load without 404 errors
- ✅ SC-006: Sounds are perceivably different

---

### Task 4.2: Test Production Build
**ID**: T4.2  
**Type**: Build Verification  
**Parallel**: No (depends on T4.1)  
**Estimated Time**: 5 minutes

**Description**: Verify audio files are correctly copied to distribution folder and work in production build.

**Actions**:
- [ ] Run production build: `npm run build`
- [ ] Verify `dist/sounds/focus-complete.mp3` exists
- [ ] Verify `dist/sounds/break-complete.mp3` exists
- [ ] Verify file sizes match original files
- [ ] Start preview server: `npm run preview`
- [ ] Open application in browser
- [ ] Test focus timer completion → verify sound plays
- [ ] Test break timer completion → verify sound plays
- [ ] Check browser console for any errors

**Files Tested**:
- `dist/sounds/focus-complete.mp3` (build output)
- `dist/sounds/break-complete.mp3` (build output)

**Success Criteria**:
- Files successfully copied to dist folder by Vite
- Audio playback works in production build
- No console errors

---

### Task 4.3: Cross-Browser Verification [P]
**ID**: T4.3  
**Type**: Compatibility Testing  
**Parallel**: Yes (can run parallel with other tasks if needed)  
**Estimated Time**: 5-10 minutes

**Description**: Verify audio playback works correctly in all target browsers.

**Actions**:
- [ ] Test in Chrome: Start timer → complete → verify sound plays
- [ ] Test in Firefox: Start timer → complete → verify sound plays
- [ ] Test in Safari: Start timer → complete → verify sound plays
- [ ] Test in Edge (if available): Start timer → complete → verify sound plays
- [ ] Document any browser-specific issues

**Target Browsers** (from plan.md):
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Success Criteria** (from spec.md):
- ✅ SC-007: Audio playback works in all major browsers
- No browser-specific errors
- Autoplay policy handling works correctly

---

## Phase 5: Completion

### Task 5.1: Final Validation
**ID**: T5.1  
**Type**: Acceptance Testing  
**Parallel**: No (final task)  
**Estimated Time**: 5 minutes

**Description**: Verify all acceptance criteria from spec.md are met.

**Acceptance Criteria Checklist**:

**User Story 1 - Focus Completion Sound**:
- [ ] Focus timer completion plays pleasant, celebratory chime automatically
- [ ] Sound duration is 1-3 seconds and file size is <50KB
- [ ] Multiple completions play sound without overlap or distortion
- [ ] Browser autoplay blocking is handled gracefully

**User Story 2 - Break Completion Sound**:
- [ ] Break timer completion plays gentle, calming notification automatically
- [ ] Sound is noticeably different from focus completion sound (calmer tone)
- [ ] Same sound plays for both short (5 min) and long (15 min) breaks
- [ ] Browser autoplay blocking is handled gracefully

**User Story 3 - Sound File Acquisition**:
- [ ] Both files load without 404 errors
- [ ] Files have appropriate licenses (CC0, CC-BY, or original)
- [ ] Files included in production bundle under `/sounds/` directory
- [ ] Each file is under 50KB and playable in all major browsers

**Functional Requirements** (FR-001 to FR-010):
- [ ] FR-001: Two audio files present (focus-complete.mp3, break-complete.mp3)
- [ ] FR-002: Files are license-free or properly licensed
- [ ] FR-003: Files in `/public/sounds/` accessible at `/sounds/` URL path
- [ ] FR-004: Focus sound has upbeat, celebratory tone
- [ ] FR-005: Break sound has calm, gentle tone
- [ ] FR-006: Each file under 50KB
- [ ] FR-007: Each file 1-3 seconds duration
- [ ] FR-008: Focus sound plays on focus completion (if enabled)
- [ ] FR-009: Break sound plays on break completion (if enabled)
- [ ] FR-010: Loading failures handled gracefully without crash

**Success Criteria** (SC-001 to SC-007):
- [ ] SC-001: Focus completions play audio (100%)
- [ ] SC-002: Break completions play audio (100%)
- [ ] SC-003: No 404 errors in console
- [ ] SC-004: Files <50KB and load <500ms
- [ ] SC-005: Proper licenses with documentation
- [ ] SC-006: Sounds are perceivably different
- [ ] SC-007: Works in Chrome, Firefox, Safari, Edge

**Files Validated**:
- All files in `/public/sounds/`
- All files in `dist/sounds/` (after build)
- README.md documentation

**Success Criteria**:
- All acceptance criteria met
- All functional requirements satisfied
- All success criteria achieved
- Feature ready for commit and deployment

---

## Execution Summary

### Dependency Graph

```
Phase 1: Setup
  └─ T1.1 (Verification) [P]

Phase 2: Asset Creation
  ├─ T2.1 (Focus Sound) [P] ──┐
  └─ T2.2 (Break Sound) [P] ──┤
                              │
Phase 3: Integration          │
  ├─ T3.1 (Add Files) ←───────┘
  └─ T3.2 (Documentation) [P]
                  │
Phase 4: Testing  │
  ├─ T4.1 (Dev) ←─┘
  ├─ T4.2 (Prod) ← T4.1
  └─ T4.3 (Browsers) [P]
                  │
Phase 5: Complete │
  └─ T5.1 (Final) ← all tests
```

### Parallel Execution Opportunities

- **T2.1 and T2.2**: Can source both audio files simultaneously
- **T3.2**: Can update documentation while adding files
- **T4.3**: Can run browser tests in parallel if multiple browsers available

### Sequential Dependencies

- T3.1 depends on T2.1 and T2.2 (need files before adding to repo)
- T4.1 depends on T3.1 (need files in place before testing)
- T4.2 depends on T4.1 (verify dev mode works before testing production)
- T5.1 depends on all testing tasks (final validation)

### Risk Assessment

**Low Risk Tasks**: T1.1, T3.1, T3.2, T4.2 (straightforward operations)  
**Medium Risk Tasks**: T2.1, T2.2 (dependent on finding suitable sounds)  
**No High Risk Tasks**: This is an asset integration task with no code changes

---

## Notes

1. **No Code Changes**: This implementation requires zero code changes. All necessary functionality exists in `src/utils/audio.ts` and `App.tsx`.

2. **License Compliance**: Ensure proper licenses (CC0 preferred). Document all sources in README.md.

3. **Sound Quality**: Focus on finding sounds that are pleasant and distinguishable. Users should be able to tell which timer completed without looking.

4. **File Size Optimization**: If downloaded files are too large, use ffmpeg to reduce bitrate or convert to mono:
   ```bash
   ffmpeg -i input.mp3 -b:a 96k -ac 1 output.mp3
   ```

5. **Browser Testing**: Safari may have stricter autoplay policies. Ensure timer start button (user interaction) is clicked before completion to satisfy autoplay requirements.

6. **Graceful Degradation**: The application already handles missing or failed audio gracefully (console warnings only). No error UI is shown to users.

---

## Definition of Done

- [ ] All 7 tasks completed
- [ ] All acceptance criteria met
- [ ] All functional requirements satisfied
- [ ] README.md updated with proper documentation
- [ ] Dev mode tested successfully
- [ ] Production build tested successfully
- [ ] Cross-browser compatibility verified
- [ ] Files committed to git with proper message
- [ ] Feature branch ready for merge/deploy

