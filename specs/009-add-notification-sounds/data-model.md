# Data Model: Add Notification Sounds

**Feature**: Add Notification Sounds  
**Date**: December 22, 2025

## Overview

This feature is an **asset integration task** with minimal data modeling. The existing codebase already defines all necessary data structures for audio playback. This document catalogs the relevant existing entities and confirms no new data structures are required.

---

## Existing Entities

### AudioAsset (Conceptual)

**Description**: Represents a static audio file served from the public directory.

**Physical Representation**: MP3 file in filesystem

**Location**: `/public/sounds/`

**Attributes**:

| Attribute | Type | Description | Constraints | Example |
|-----------|------|-------------|-------------|---------|
| filename | string | Name of audio file | Must end in `.mp3` | `focus-complete.mp3` |
| path | string | URL path to access file | Absolute path from root | `/sounds/focus-complete.mp3` |
| duration | number (seconds) | Audio duration | 1-3 seconds | 2.5 |
| fileSize | number (bytes) | File size on disk | <50KB (51200 bytes) | 42000 |
| bitrate | number (kbps) | Audio encoding bitrate | 96-128 kbps | 128 |
| sampleRate | number (Hz) | Audio sample rate | 44100 Hz (standard) | 44100 |
| channels | number | Audio channels | 1 (mono) or 2 (stereo) | 1 |
| format | string | Audio file format | `mp3` | `mp3` |
| license | string | License type | CC0, CC-BY, or "Original" | `CC0` |
| source | string | Origin of audio file | URL or "Generated" | `https://pixabay.com/...` |

**Instances**:
1. Focus completion audio: `/sounds/focus-complete.mp3`
2. Break completion audio: `/sounds/break-complete.mp3`

**Validation Rules**:
- File must exist at specified path
- File must be valid MP3 format
- File size must be ≤50KB
- Duration must be 1-3 seconds
- Must have appropriate license (CC0, CC-BY, original)

**State**: Static (files don't change at runtime)

---

### HTMLAudioElement (Browser API)

**Description**: Browser-provided API for audio playback. Used by `audio.ts` utility.

**Created By**: `new Audio(path)` constructor (lines 17-18 in audio.ts)

**Attributes** (relevant subset):

| Attribute | Type | Description | Usage |
|-----------|------|-------------|-------|
| src | string | URL of audio file | Set via constructor: `new Audio('/sounds/focus-complete.mp3')` |
| currentTime | number | Playback position (seconds) | Reset to 0 before play (lines 37, 58) |
| paused | boolean | Whether audio is paused | Queried implicitly by play() |
| duration | number | Total audio duration | Read-only, set by browser after load |
| volume | number | Volume (0.0-1.0) | Not modified (uses default 1.0) |

**Methods**:

| Method | Description | Usage |
|--------|-------------|-------|
| `load()` | Pre-load audio file | Called on initialization (lines 21-22) |
| `play()` | Start playback | Returns Promise, called on timer completion (lines 38, 59) |
| `pause()` | Pause playback | Not used in current implementation |

**Relationships**: 
- Two instances stored in module-level variables: `focusCompleteAudio`, `breakCompleteAudio` (lines 8-9)
- Initialized once on app mount via `initializeAudio()` (line 15)
- Played by `playFocusCompleteSound()` and `playBreakCompleteSound()` functions

---

## Data Flow

### Initialization Flow

```
App Mount (App.tsx)
  → initializeAudio() (audio.ts:15)
    → new Audio('/sounds/focus-complete.mp3') (audio.ts:17)
    → new Audio('/sounds/break-complete.mp3') (audio.ts:18)
    → audio.load() × 2 (audio.ts:21-22)
      → Browser fetches MP3 files from /public/sounds/
      → Files buffered in memory (ready to play)
```

**Current Issue**: Files don't exist → 404 error → audio instances created but empty

**After Fix**: Files exist → 200 OK → audio instances loaded and ready

### Playback Flow

```
Timer Completes (useTimer.ts)
  → App.tsx plays sound (based on timerMode)
    → playFocusCompleteSound() (audio.ts:33) OR
    → playBreakCompleteSound() (audio.ts:54)
      → audio.currentTime = 0 (reset to start)
      → await audio.play()
        → Browser plays audio through system audio
        → Promise resolves on playback start
        OR Promise rejects if autoplay blocked
      → Catch block logs warning (lines 44-45, 65-66)
```

**No Changes Needed**: This flow already works correctly. Only missing audio files.

---

## Settings Integration

### Sounds Enabled Setting

**Type**: `SettingsState.soundsEnabled` (boolean)

**Defined In**: `src/types/settings.ts`

**Storage**: localStorage via `useSettings` hook

**Default Value**: `true`

**Validation**: Boolean (true/false only)

**Relationship to Audio**:
- When `false`: Audio playback functions still called but no sound heard (silent operation)
- When `true`: Audio plays when timer completes (if files loaded)
- Setting checked in `App.tsx` before calling play functions

**State Transitions**: User toggles via ToggleSwitch in SettingsPanel

---

## No New Data Structures Required

This feature **does not** introduce:
- ❌ New TypeScript types/interfaces
- ❌ New state management
- ❌ New localStorage keys
- ❌ New API contracts
- ❌ New database schemas
- ❌ New configuration files

**Reason**: All necessary data structures already exist in codebase. This is purely an asset addition task.

---

## File System Structure

### Before (Current State)

```
/public/sounds/
└── README.md (placeholder documentation)
```

**Problem**: Audio files missing → 404 errors

### After (Target State)

```
/public/sounds/
├── focus-complete.mp3 (1-3s, <50KB, upbeat chime)
├── break-complete.mp3 (1-3s, <50KB, gentle bell)
└── README.md (updated with file documentation)
```

**Build Output** (`npm run build`):

```
/dist/sounds/
├── focus-complete.mp3 (copied from public/)
└── break-complete.mp3 (copied from public/)
```

**Vite Behavior**: Automatically copies entire `/public/` directory to `/dist/` during build

---

## Validation & Constraints Summary

### File-Level Constraints

| Constraint | Value | Verification Method |
|------------|-------|---------------------|
| File format | MP3 | File extension + playback test |
| File size | <50KB | `ls -lh` or file properties |
| Duration | 1-3 seconds | Play in audio player + check metadata |
| Bitrate | 96-128 kbps | Audio file metadata (ffprobe) |
| Sample rate | 44.1 kHz | Audio file metadata |
| Channels | Mono preferred | Audio file metadata |

### Licensing Constraints

| Constraint | Requirement | Verification |
|------------|-------------|--------------|
| License type | CC0, CC-BY, or Original | Check source website/documentation |
| Attribution | Not required (CC0) or in README (CC-BY) | Update README.md if CC-BY |
| Commercial use | Allowed | Verify license terms |

### Runtime Constraints

| Constraint | Requirement | Handled By |
|------------|-------------|------------|
| Load failure | Must not crash app | try/catch in audio.ts:23-25 |
| Playback failure | Must not crash app | try/catch in audio.ts:33-46, 54-67 |
| Autoplay blocking | Must not show error UI | catch block logs warning only |
| Sounds disabled | Must not play audio | Checked in App.tsx before play call |

---

## Testing Validation

### File Existence Tests

```typescript
// Conceptual test structure (not implemented yet)
test('focus-complete.mp3 exists in public/sounds', () => {
  expect(fileExists('/public/sounds/focus-complete.mp3')).toBe(true);
});

test('break-complete.mp3 exists in public/sounds', () => {
  expect(fileExists('/public/sounds/break-complete.mp3')).toBe(true);
});
```

### File Size Tests

```typescript
test('focus-complete.mp3 is under 50KB', () => {
  const size = getFileSize('/public/sounds/focus-complete.mp3');
  expect(size).toBeLessThan(51200); // 50KB in bytes
});

test('break-complete.mp3 is under 50KB', () => {
  const size = getFileSize('/public/sounds/break-complete.mp3');
  expect(size).toBeLessThan(51200);
});
```

### Integration Tests

```typescript
test('audio files load without 404 errors in dev mode', async () => {
  const response1 = await fetch('/sounds/focus-complete.mp3');
  const response2 = await fetch('/sounds/break-complete.mp3');
  
  expect(response1.status).toBe(200);
  expect(response2.status).toBe(200);
});

test('audio files are playable', async () => {
  const audio1 = new Audio('/sounds/focus-complete.mp3');
  const audio2 = new Audio('/sounds/break-complete.mp3');
  
  await audio1.load();
  await audio2.load();
  
  expect(audio1.duration).toBeGreaterThan(0);
  expect(audio2.duration).toBeGreaterThan(0);
});
```

---

## Summary

**Key Finding**: This feature requires **no new data models or structures**. All necessary types, interfaces, and state management already exist in:
- `src/utils/audio.ts` - Audio loading and playback logic
- `src/types/settings.ts` - Settings state including soundsEnabled flag
- Browser HTMLAudioElement API - Native audio playback

**Only Action Required**: Add two MP3 files to `/public/sounds/` directory meeting the specified constraints.

**Validation Focus**: File existence, size, duration, format, and license compliance (asset validation, not data structure validation).

