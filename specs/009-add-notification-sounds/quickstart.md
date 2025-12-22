# Quickstart: Add Notification Sounds

**Feature**: Add Notification Sounds  
**Date**: December 22, 2025  
**Target Audience**: Developers implementing this feature

## Overview

This feature adds missing audio notification files to fix 404 errors. The audio playback infrastructure already exists - we just need to source two MP3 files and place them in the correct directory.

**Time Estimate**: 30-60 minutes

---

## Prerequisites

- Access to the repository with write permissions
- Audio file sources: Pixabay account (free) OR Audacity (free audio editor)
- ffmpeg or ffprobe (optional, for audio metadata verification)
- Ability to test in multiple browsers

---

## Quick Implementation Steps

### Step 1: Source Audio Files

**Option A: Download from Pixabay (Recommended)**

1. Go to https://pixabay.com/sound-effects/
2. Search for **focus completion sound**:
   - Keywords: "success notification", "achievement chime", "positive bell"
   - Filter: Duration < 5 seconds
   - License: All are CC0 (public domain)
   - Preview sounds and download one that's upbeat/celebratory
3. Search for **break completion sound**:
   - Keywords: "gentle notification", "soft bell", "meditation chime"
   - Filter: Duration < 5 seconds
   - Download one that's calm/soothing (noticeably different from focus sound)

**Option B: Download from Freesound.org**

1. Create free account at https://freesound.org
2. Search with keywords above
3. **Important**: Filter by license → Select CC0 only (avoid CC-BY if possible)
4. Download chosen sounds

**Option C: Generate with Audacity**

1. Install Audacity (free): https://www.audacityteam.org/
2. Generate → Tone or Chirp
3. For focus: Higher frequency (800-1200 Hz), shorter duration (~1.5s)
4. For break: Lower frequency (400-600 Hz), gentle fade
5. Export as MP3

---

### Step 2: Prepare Files

**Convert to MP3 (if needed)**:

```bash
# If downloaded as WAV or other format
ffmpeg -i downloaded-sound.wav -b:a 128k -ac 1 focus-complete.mp3
ffmpeg -i downloaded-sound.wav -b:a 128k -ac 1 break-complete.mp3
```

**Verify specifications**:

```bash
# Check duration and file size
ffprobe focus-complete.mp3
ls -lh focus-complete.mp3

# Ensure:
# - Duration: 1-3 seconds
# - File size: <50KB
# - Format: MP3
```

**Trim/adjust if needed**:

```bash
# Trim to 2 seconds if too long
ffmpeg -i focus-complete.mp3 -t 2 -c copy focus-complete-trimmed.mp3

# Reduce bitrate if file too large
ffmpeg -i focus-complete.mp3 -b:a 96k focus-complete-96k.mp3
```

---

### Step 3: Add Files to Repository

```bash
# Navigate to project root
cd /path/to/pomodoro-timer

# Add audio files
cp ~/Downloads/focus-complete.mp3 public/sounds/
cp ~/Downloads/break-complete.mp3 public/sounds/

# Verify files are in place
ls -lh public/sounds/*.mp3
```

---

### Step 4: Update README.md

Edit `public/sounds/README.md`:

```markdown
# Notification Sounds

## focus-complete.mp3
- **Description**: Upbeat chime for focus timer completion
- **Duration**: 2.1 seconds
- **File Size**: 38KB
- **Source**: Pixabay - https://pixabay.com/sound-effects/[id]/
- **License**: CC0 (Public Domain)
- **Added**: December 22, 2025

## break-complete.mp3
- **Description**: Gentle bell for break timer completion
- **Duration**: 1.8 seconds
- **File Size**: 32KB
- **Source**: Pixabay - https://pixabay.com/sound-effects/[id]/
- **License**: CC0 (Public Domain)
- **Added**: December 22, 2025
```

---

### Step 5: Test in Development Mode

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:5173
# Open browser console (F12)
```

**Verification checklist**:
- [ ] No 404 errors for `/sounds/focus-complete.mp3`
- [ ] No 404 errors for `/sounds/break-complete.mp3`
- [ ] No console errors about audio initialization
- [ ] Focus timer completes → sound plays
- [ ] Break timer completes → different sound plays
- [ ] Sounds toggle in settings works (disables audio)

---

### Step 6: Test Production Build

```bash
# Build for production
npm run build

# Verify files copied to dist
ls -lh dist/sounds/*.mp3

# Preview production build
npm run preview

# Test audio playback in preview mode
```

---

### Step 7: Cross-Browser Testing

Test in each browser:
- [ ] Chrome/Edge: Audio plays on timer completion
- [ ] Firefox: Audio plays on timer completion
- [ ] Safari: Audio plays on timer completion

**Note**: First audio play may require user interaction (browser autoplay policy). Click start timer button, then let it complete - this satisfies autoplay requirements.

---

## Troubleshooting

### Problem: 404 errors still showing

**Solution**:
- Verify files are in `/public/sounds/` (not `/src/sounds/`)
- Check file names match exactly: `focus-complete.mp3` and `break-complete.mp3`
- Restart dev server: Ctrl+C, then `npm run dev` again

---

### Problem: Files too large (>50KB)

**Solution**:

```bash
# Reduce bitrate
ffmpeg -i focus-complete.mp3 -b:a 96k focus-complete-96k.mp3

# Or reduce to mono
ffmpeg -i focus-complete.mp3 -ac 1 -b:a 96k focus-complete-mono.mp3
```

---

### Problem: Audio duration too long

**Solution**:

```bash
# Trim to 2 seconds
ffmpeg -i focus-complete.mp3 -t 2 -c copy focus-complete-trimmed.mp3
```

---

### Problem: Audio doesn't play in Safari

**Cause**: Safari has strict autoplay policy

**Solution**:
- Ensure sounds setting is enabled
- Click timer start button (user gesture)
- Let timer complete naturally (don't manually trigger completion)
- If still blocked, check Safari settings → Websites → Auto-Play

---

### Problem: Sounds are too similar

**Solution**:
- Download different sounds with more distinct tones
- Focus sound should be higher pitch, more energetic
- Break sound should be lower pitch, calmer
- Test with eyes closed - should be able to distinguish which timer completed

---

## Validation Checklist

Before committing:

- [ ] Both MP3 files exist in `public/sounds/`
- [ ] Each file is under 50KB
- [ ] Each file duration is 1-3 seconds
- [ ] Files have valid MP3 format
- [ ] Files have proper licenses (CC0, CC-BY, or original)
- [ ] README.md documents source and license
- [ ] No 404 errors in browser console
- [ ] Focus completion plays sound
- [ ] Break completion plays different sound
- [ ] Sounds setting toggle works
- [ ] Production build includes files in `dist/sounds/`
- [ ] Tested in Chrome, Firefox, Safari

---

## Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Audio file operations
ffprobe file.mp3         # Show audio metadata
ffmpeg -i in.mp3 ...     # Convert/process audio

# File verification
ls -lh public/sounds/    # Check file sizes
file public/sounds/*.mp3 # Check file formats
```

---

## Next Steps

After implementation:
1. Commit changes with message: `Add notification sound files`
2. Test in production deployment
3. Gather user feedback on sound choices
4. Consider future enhancements:
   - Volume control slider
   - Multiple sound themes
   - Sound preview in settings

---

## Support Resources

- **Pixabay Sound Effects**: https://pixabay.com/sound-effects/
- **Freesound.org**: https://freesound.org
- **Audacity Download**: https://www.audacityteam.org/
- **ffmpeg Documentation**: https://ffmpeg.org/documentation.html
- **Browser Autoplay Policies**: 
  - Chrome: https://developer.chrome.com/blog/autoplay/
  - Safari: https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/

---

## Estimated Time Breakdown

| Task | Time |
|------|------|
| Source audio files | 10-20 min |
| Prepare/convert files | 5-10 min |
| Add to repository | 2 min |
| Update documentation | 5 min |
| Test in dev mode | 5 min |
| Test production build | 5 min |
| Cross-browser testing | 5-10 min |
| **Total** | **~37-52 min** |

---

## Success Criteria

✅ **Feature Complete When**:
- Zero 404 errors for audio files
- Audio plays on focus completion (upbeat sound)
- Audio plays on break completion (different, calmer sound)
- All files under 50KB
- Proper licenses documented
- Works in all target browsers
- Production build includes files

