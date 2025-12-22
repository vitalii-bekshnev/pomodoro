# Notification Sounds

This directory contains audio notification files for the Pomodoro Timer application.

## Audio Files

### focus-complete.mp3
**Purpose**: Played when a focus/work timer completes (25 minutes by default)

**Specifications**:
- **Duration**: 1-3 seconds
- **File Size**: <50KB
- **Tone**: Upbeat, celebratory, energizing
- **Format**: MP3 (MPEG-1 Layer 3)
- **Bitrate**: 96-128 kbps
- **Channels**: Mono

**Status**: ⚠️ **NEEDS TO BE ADDED**

**How to add**:
1. Visit https://pixabay.com/sound-effects/search/success%20notification/
2. Search for upbeat notification sounds (1-3 seconds)
3. Download a suitable CC0 (public domain) sound as MP3
4. Save as `focus-complete.mp3` in this directory

**Recommended characteristics**:
- Higher pitch (600-1200 Hz range)
- Rising tone or major chord
- Pleasant, non-jarring
- Clearly celebratory

---

### break-complete.mp3
**Purpose**: Played when a break timer completes (5 or 15 minutes)

**Specifications**:
- **Duration**: 1-3 seconds
- **File Size**: <50KB
- **Tone**: Calm, gentle, soothing
- **Format**: MP3 (MPEG-1 Layer 3)
- **Bitrate**: 96-128 kbps
- **Channels**: Mono

**Status**: ⚠️ **NEEDS TO BE ADDED**

**How to add**:
1. Visit https://pixabay.com/sound-effects/search/gentle%20bell/
2. Search for calm notification sounds (1-3 seconds)
3. Download a suitable CC0 (public domain) sound as MP3
4. Save as `break-complete.mp3` in this directory

**Recommended characteristics**:
- Lower/mid pitch (400-800 Hz range)
- Soft bell or gentle chime
- Calming but attention-getting
- Noticeably different from focus completion sound

---

## Licensing Requirements

All audio files MUST have one of the following licenses:
- **CC0 (Creative Commons Zero)** - Public domain equivalent, no attribution required (PREFERRED)
- **CC-BY (Creative Commons Attribution)** - Requires attribution in this README
- **Original Creation** - Created specifically for this project

### Attribution

If using CC-BY licensed sounds, add attribution here:

```
[Sound Name] by [Author Name]
Licensed under CC-BY [version]
Source: [URL]
```

---

## Recommended Sources

### Pixabay (CC0 - No Attribution Required)
- URL: https://pixabay.com/sound-effects/
- License: CC0 (Public Domain)
- Quality: High
- Search suggestions:
  - Focus: "success notification", "achievement", "level up", "positive bell"
  - Break: "gentle bell", "meditation chime", "soft notification", "calm alert"

### Freesound.org (Various Licenses - Filter for CC0)
- URL: https://freesound.org
- License: Various (filter by CC0 or CC-BY)
- Quality: High, user-submitted
- Note: Create free account to download
- Filter by license when searching

### Online Tone Generator (For Simple Tones)
- URL: https://www.audiocheck.net/audiofrequencysignalgenerator_sinetone.php
- License: Original creation (no restrictions)
- Use cases: Simple sine wave tones if specific sounds not found
- Export as MP3, adjust frequency and duration

---

## Verification

After adding audio files, verify they meet requirements:

```bash
# Check files exist
ls -lh *.mp3

# Check file sizes (should be <50KB each)
# Check format
file *.mp3

# Test in development
cd ../..
npm run dev
# Open browser, complete a timer, verify sound plays
```

---

## Integration

These audio files are loaded by `src/utils/audio.ts`:

```typescript
// Files are referenced at these paths:
'/sounds/focus-complete.mp3'
'/sounds/break-complete.mp3'
```

The application automatically:
1. Pre-loads audio files on app mount (`initializeAudio()`)
2. Plays appropriate sound when timer completes (if sounds enabled in settings)
3. Handles loading/playback failures gracefully (no user-facing errors)

---

## Browser Compatibility

MP3 format is supported in all target browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

Audio playback respects browser autoplay policies. User interaction (starting timer) satisfies autoplay requirements in all browsers.

---

## Testing

### Development Mode
```bash
npm run dev
```

1. Open browser console (F12)
2. Check for audio loading errors (should be none after files added)
3. Enable sounds in settings
4. Complete a focus timer → verify upbeat sound plays
5. Complete a break timer → verify calm sound plays (different from focus)

### Production Build
```bash
npm run build
ls -lh dist/sounds/*.mp3  # Verify files copied to dist
npm run preview
```

Test audio playback in preview mode.

---

## Current Status

| File | Status | Action Needed |
|------|--------|---------------|
| focus-complete.mp3 | ❌ Missing | Download from Pixabay or generate |
| break-complete.mp3 | ❌ Missing | Download from Pixabay or generate |

**Next Step**: Follow the "How to add" instructions above for each file.

---

*Last Updated: December 22, 2025*
