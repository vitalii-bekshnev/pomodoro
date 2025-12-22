# Audio Asset Contract

**Feature**: Add Notification Sounds  
**Date**: December 22, 2025  
**Version**: 1.0

## Overview

This document defines the contract for audio asset files used in the Pomodoro timer application. Since this is an asset integration task (not an API), the "contract" defines the expected file specifications, naming conventions, and integration points.

---

## File Specifications

### Focus Completion Audio

**File Name**: `focus-complete.mp3`

**Location**: `/public/sounds/focus-complete.mp3`

**URL Path**: `/sounds/focus-complete.mp3`

**Purpose**: Played when a focus/work timer completes (25 minutes by default)

**Requirements**:

| Property | Specification | Validation Method |
|----------|---------------|-------------------|
| **Format** | MP3 (MPEG-1 Layer 3) | File extension + MIME type check |
| **Duration** | 1-3 seconds | Audio metadata / playback test |
| **File Size** | ≤50KB (51,200 bytes) | File system check |
| **Bitrate** | 96-128 kbps | Audio metadata (ffprobe/ffmpeg) |
| **Sample Rate** | 44.1 kHz | Audio metadata |
| **Channels** | Mono (1 channel) preferred | Audio metadata |
| **Tone** | Upbeat, celebratory, energizing | Manual QA / user testing |
| **Volume** | Normalized to prevent clipping | Audio waveform analysis |
| **License** | CC0, CC-BY, or original creation | Source documentation |

**Sound Characteristics**:
- Higher pitch (600-1200 Hz range)
- Rising tone or major chord
- Pleasant, non-jarring
- Clearly distinguishable from break completion sound

**Examples**: Success notification, achievement chime, positive bell, level-up sound

---

### Break Completion Audio

**File Name**: `break-complete.mp3`

**Location**: `/public/sounds/break-complete.mp3`

**URL Path**: `/sounds/break-complete.mp3`

**Purpose**: Played when a break timer completes (5 or 15 minutes)

**Requirements**:

| Property | Specification | Validation Method |
|----------|---------------|-------------------|
| **Format** | MP3 (MPEG-1 Layer 3) | File extension + MIME type check |
| **Duration** | 1-3 seconds | Audio metadata / playback test |
| **File Size** | ≤50KB (51,200 bytes) | File system check |
| **Bitrate** | 96-128 kbps | Audio metadata (ffprobe/ffmpeg) |
| **Sample Rate** | 44.1 kHz | Audio metadata |
| **Channels** | Mono (1 channel) preferred | Audio metadata |
| **Tone** | Calm, gentle, soothing | Manual QA / user testing |
| **Volume** | Normalized, slightly softer than focus | Audio waveform analysis |
| **License** | CC0, CC-BY, or original creation | Source documentation |

**Sound Characteristics**:
- Lower/mid pitch (400-800 Hz range)
- Soft bell or gentle chime
- Calming but attention-getting
- Noticeably different from focus completion sound

**Examples**: Meditation bell, soft notification, gentle chime, mindfulness timer

---

## Integration Contract

### File System Contract

**Input**: Audio files placed in repository at `/public/sounds/`

**Build Process** (Vite):
1. Developer adds MP3 files to `/public/sounds/` directory
2. Run `npm run build`
3. Vite copies entire `/public/` directory to `/dist/`
4. Result: Files accessible at `/dist/sounds/` in production build

**Development Mode**: Files served from `/public/sounds/` by Vite dev server

**Production Mode**: Files served from `/dist/sounds/` by static file server (nginx, etc.)

---

### Audio Loading Contract

**Defined In**: `src/utils/audio.ts`

**Initialization Function**: `initializeAudio(): void`

```typescript
// Pseudo-code representation
function initializeAudio(): void {
  try {
    // Create HTMLAudioElement instances pointing to files
    focusCompleteAudio = new Audio('/sounds/focus-complete.mp3');
    breakCompleteAudio = new Audio('/sounds/break-complete.mp3');
    
    // Pre-load audio buffers
    focusCompleteAudio.load();
    breakCompleteAudio.load();
  } catch (error) {
    // Graceful degradation: log warning, continue without audio
    console.warn('Failed to initialize audio:', error);
  }
}
```

**Called From**: `App.tsx` on component mount

**Expected Behavior**:
- ✅ **Success**: Files load, buffered in memory, ready for playback
- ⚠️ **404 Error**: Warning logged, app continues without audio (silent mode)
- ⚠️ **Network Error**: Warning logged, app continues without audio
- ⚠️ **Invalid Format**: Warning logged, app continues without audio

**Contract Guarantee**: Audio loading failure **must not** crash the application.

---

### Audio Playback Contract

**Play Focus Sound Function**: `playFocusCompleteSound(): Promise<void>`

```typescript
// Pseudo-code representation
async function playFocusCompleteSound(): Promise<void> {
  try {
    if (focusCompleteAudio) {
      focusCompleteAudio.currentTime = 0; // Reset to start
      await focusCompleteAudio.play();     // Attempt playback
    }
  } catch (error) {
    // Browser autoplay policy may block - this is expected
    console.warn('Failed to play focus complete sound:', error);
  }
}
```

**Play Break Sound Function**: `playBreakCompleteSound(): Promise<void>`

```typescript
// Pseudo-code representation  
async function playBreakCompleteSound(): Promise<void> {
  try {
    if (breakCompleteAudio) {
      breakCompleteAudio.currentTime = 0; // Reset to start
      await breakCompleteAudio.play();     // Attempt playback
    }
  } catch (error) {
    // Browser autoplay policy may block - this is expected
    console.warn('Failed to play break complete sound:', error);
  }
}
```

**Called From**: `App.tsx` when timer reaches 00:00

**Preconditions**:
- Audio files must exist at specified paths
- `initializeAudio()` must have been called
- `settings.soundsEnabled` must be `true` (checked in caller)

**Expected Behavior**:
- ✅ **Success**: Sound plays immediately
- ⚠️ **Autoplay Blocked**: Promise rejects, warning logged, no UI error
- ⚠️ **Audio Not Loaded**: Warning logged, silent operation
- ⚠️ **User Volume Muted**: Sound doesn't play (system issue, not app concern)

**Contract Guarantee**: Playback failure **must not** crash the application or show error UI to user.

---

## Browser Compatibility Contract

### Supported Browsers

| Browser | Version | MP3 Support | Expected Behavior |
|---------|---------|-------------|-------------------|
| Chrome  | Latest  | ✅ Native   | Full functionality |
| Firefox | Latest  | ✅ Native   | Full functionality |
| Safari  | Latest  | ✅ Native   | Full functionality |
| Edge    | Latest  | ✅ Native   | Full functionality |

**Guarantee**: MP3 format works in all target browsers without format fallbacks.

### Autoplay Policy Compliance

**Chrome/Edge Policy**:
- Autoplay allowed after user interaction (click, keypress)
- Timer start/stop/skip actions count as user interaction
- **Expected**: Audio plays successfully after timer starts

**Firefox Policy**:
- Similar to Chrome
- Site permission can override
- **Expected**: Audio plays successfully after timer starts

**Safari Policy**:
- Strictest: requires recent user gesture
- **Expected**: Audio plays successfully after timer starts (timer controls are user gestures)

**Fallback Behavior**: If autoplay blocked, `play()` promise rejects → caught by try/catch → warning logged → app continues silently

---

## Licensing Contract

### Acceptable Licenses

**Option 1: Creative Commons Zero (CC0)**
- ✅ Public domain equivalent
- ✅ No attribution required
- ✅ Commercial use allowed
- ✅ No restrictions
- **Preferred**: Simplest licensing

**Option 2: Creative Commons Attribution (CC-BY)**
- ✅ Commercial use allowed
- ⚠️ Attribution required
- **Action Required**: Add attribution to README.md in same directory
- Format: `"[Sound Name]" by [Author] licensed under CC-BY ([link])`

**Option 3: Original Creation**
- ✅ Full ownership
- ✅ No licensing concerns
- **Documentation**: Note "Original creation" in README.md

**Unacceptable Licenses**:
- ❌ CC-BY-SA (Share-Alike: requires entire project to be same license)
- ❌ CC-BY-NC (Non-Commercial: conflicts with potential commercial use)
- ❌ Copyrighted without license
- ❌ Royalty-requiring licenses

---

## Validation Contract

### Automated Checks

```bash
# File existence
test -f public/sounds/focus-complete.mp3 || echo "FAIL: focus-complete.mp3 missing"
test -f public/sounds/break-complete.mp3 || echo "FAIL: break-complete.mp3 missing"

# File size (under 50KB = 51200 bytes)
[ $(stat -f%z public/sounds/focus-complete.mp3) -lt 51200 ] || echo "FAIL: focus-complete.mp3 too large"
[ $(stat -f%z public/sounds/break-complete.mp3) -lt 51200 ] || echo "FAIL: break-complete.mp3 too large"

# File format (has MP3 header)
file public/sounds/focus-complete.mp3 | grep -q "MPEG" || echo "FAIL: focus-complete.mp3 not MP3"
file public/sounds/break-complete.mp3 | grep -q "MPEG" || echo "FAIL: break-complete.mp3 not MP3"
```

### Manual Verification

**Development Mode**:
1. Run `npm run dev`
2. Open browser console
3. Check for audio loading errors (should be none)
4. Complete a focus timer → verify sound plays
5. Complete a break timer → verify different sound plays

**Production Build**:
1. Run `npm run build`
2. Verify files in `/dist/sounds/` directory
3. Run `npm run preview`
4. Test audio playback as above

**Cross-Browser**:
1. Test in Chrome, Firefox, Safari, Edge
2. Verify audio plays in each browser
3. Verify no console errors

---

## Error Handling Contract

### Loading Failures

| Error Type | Handling | User Impact |
|------------|----------|-------------|
| 404 (File Not Found) | Catch in `initializeAudio()`, log warning | Silent mode (no audio) |
| Network Error | Catch in `initializeAudio()`, log warning | Silent mode (no audio) |
| Invalid Format | Catch in `initializeAudio()`, log warning | Silent mode (no audio) |
| Corrupted File | Catch in `initializeAudio()`, log warning | Silent mode (no audio) |

**Contract**: Application **must** continue to function without audio if files fail to load.

### Playback Failures

| Error Type | Handling | User Impact |
|------------|----------|-------------|
| Autoplay Blocked | Catch in play functions, log warning | Silent (expected browser behavior) |
| Audio Context Suspended | Catch in play functions, log warning | Silent until user interaction |
| File Not Loaded | Check if audio object exists, log warning | Silent mode |
| Decode Error | Catch in play functions, log warning | Silent mode |

**Contract**: Application **must** never show error UI for audio failures. All failures degrade gracefully to silent operation.

---

## Documentation Contract

### README.md Requirements

**Location**: `/public/sounds/README.md`

**Required Contents**:
1. List of audio files with descriptions
2. Source information (URL or "Original")
3. License information for each file
4. Attribution if CC-BY license used
5. Date added
6. Technical specifications (duration, file size)

**Example Format**:

```markdown
# Notification Sounds

## focus-complete.mp3
- **Description**: Upbeat chime for focus timer completion
- **Duration**: 2.1 seconds
- **File Size**: 38KB
- **Source**: Pixabay - [URL]
- **License**: CC0 (Public Domain)
- **Added**: December 22, 2025

## break-complete.mp3
- **Description**: Gentle bell for break timer completion  
- **Duration**: 1.8 seconds
- **File Size**: 32KB
- **Source**: Pixabay - [URL]
- **License**: CC0 (Public Domain)
- **Added**: December 22, 2025
```

---

## Testing Contract

### Acceptance Criteria

**AC-001**: Focus completion sound file exists and is under 50KB  
**AC-002**: Break completion sound file exists and is under 50KB  
**AC-003**: Both files load without 404 errors in development mode  
**AC-004**: Both files load without 404 errors in production build  
**AC-005**: Focus sound plays when focus timer completes (with sounds enabled)  
**AC-006**: Break sound plays when break timer completes (with sounds enabled)  
**AC-007**: Focus and break sounds are noticeably different (manual QA)  
**AC-008**: Audio loading failure does not crash application  
**AC-009**: Audio playback failure does not crash application  
**AC-010**: Audio files have proper licenses documented in README.md

### Test Scenarios

**Scenario 1: Happy Path**
1. Start application in dev mode
2. Enable sounds in settings
3. Start focus timer
4. Wait for completion or skip to end
5. **Expected**: Focus completion sound plays
6. Start break timer
7. Wait for completion or skip to end
8. **Expected**: Break completion sound plays (different from focus)

**Scenario 2: Sounds Disabled**
1. Disable sounds in settings
2. Complete focus timer
3. **Expected**: No sound plays (silent)

**Scenario 3: File Loading Failure**
1. Delete audio files from `/public/sounds/`
2. Start application
3. **Expected**: Console warning logged, app continues without crash
4. Complete timer
5. **Expected**: No sound plays, no error UI shown

**Scenario 4: Production Build**
1. Run `npm run build`
2. Check `/dist/sounds/` directory
3. **Expected**: Both MP3 files present
4. Run `npm run preview`
5. Test audio playback
6. **Expected**: Audio plays normally

---

## Summary

**Contract Type**: Static asset integration (not API contract)

**Key Guarantees**:
1. Files must be ≤50KB MP3 format, 1-3 seconds duration
2. Files must have valid license (CC0, CC-BY, or original)
3. Loading failures must not crash application (graceful degradation)
4. Playback failures must not show error UI (console warnings only)
5. Build process must copy files to `/dist/sounds/`

**Integration Points**:
- `src/utils/audio.ts` - Loading and playback logic (no changes needed)
- `App.tsx` - Calls initialization and playback functions (no changes needed)
- Vite build system - Copies files from `/public/` to `/dist/`

**Validation Method**: File system checks + manual playback testing + cross-browser verification

