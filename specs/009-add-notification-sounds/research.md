# Research: Add Notification Sounds

**Feature**: Add Notification Sounds  
**Date**: December 22, 2025  
**Status**: Complete

## Research Tasks

### 1. Audio File Sources and Licensing

**Task**: Identify license-free audio sources suitable for notification sounds

**Findings**:

#### Recommended Sources

1. **Pixabay Sound Effects** (https://pixabay.com/sound-effects/)
   - License: CC0 (public domain)
   - No attribution required
   - Free for commercial use
   - Large library of notification sounds
   - Search terms: "chime", "bell", "notification", "success"

2. **Freesound.org** (https://freesound.org)
   - License: Various (CC0, CC-BY, CC-BY-SA)
   - Filter by CC0 or CC-BY for simplest licensing
   - CC-BY requires attribution (can be added to README.md)
   - High-quality user-submitted sounds
   - Search terms: "success chime", "gentle notification", "meditation bell"

3. **Zapsplat** (https://zapsplat.com)
   - License: Free tier with attribution, or paid license
   - Attribution required for free usage
   - Professional quality sounds
   - Requires account creation

4. **Generate Original Tones**
   - Tool: Audacity (free, open source)
   - Method: Generate > Tone/Chirp
   - Pros: No licensing concerns, custom tailored
   - Cons: Requires audio editing skills
   - Suitable for: Simple chimes, beeps, tones

**Decision**: Use **Pixabay** as primary source (CC0, no attribution needed) or **generate original tones** using Audacity. Freesound.org as backup if Pixabay doesn't have suitable sounds.

**Rationale**: CC0 licensing eliminates attribution requirements and legal complexity. Pixabay has a large library of notification-style sounds. If no suitable sounds found, generating simple tones with Audacity is straightforward and ensures originality.

**Alternatives Considered**:
- Premium sound libraries (rejected: unnecessary cost for simple notification sounds)
- Recording custom sounds (rejected: requires equipment and audio editing expertise)
- Using system notification sounds (rejected: not portable across platforms)

---

### 2. Audio Format and Technical Requirements

**Task**: Determine optimal audio format, encoding, and technical specifications

**Findings**:

#### Format Support

| Format | Chrome | Firefox | Safari | Edge | Size Efficiency |
|--------|--------|---------|--------|------|-----------------|
| MP3    | ✅     | ✅      | ✅     | ✅   | Good            |
| OGG    | ✅     | ✅      | ❌     | ✅   | Better          |
| WAV    | ✅     | ✅      | ✅     | ✅   | Poor            |
| AAC    | ✅     | ❌      | ✅     | ✅   | Best            |

**Decision**: Use **MP3 format** at **128kbps or lower** bitrate.

**Rationale**: 
- Universal browser support (all target browsers support MP3)
- Good size efficiency (128kbps = ~16KB/second, 3 seconds = ~48KB)
- Existing code already references `.mp3` files in `audio.ts` (lines 17-18)
- No need to change code or provide multiple format fallbacks

**Technical Specifications**:
- **Format**: MP3
- **Bitrate**: 96-128kbps (balance quality vs. size)
- **Sample Rate**: 44.1kHz (standard)
- **Channels**: Mono (sufficient for notification sounds, saves space)
- **Duration**: 1-3 seconds
- **File Size**: <50KB per file

**Alternatives Considered**:
- OGG Vorbis (rejected: Safari doesn't support, would need format detection)
- AAC (rejected: Firefox incompatibility)
- WAV (rejected: uncompressed, would exceed 50KB limit)
- Multiple format fallbacks (rejected: adds complexity, MP3 is sufficient)

---

### 3. Sound Design Characteristics

**Task**: Define audio characteristics for focus vs. break completion sounds

**Findings**:

#### Focus Completion Sound

**Purpose**: Signal accomplishment, provide positive reinforcement, signal break time

**Characteristics**:
- **Tone**: Upbeat, celebratory, energizing
- **Frequency**: Higher pitch (600-1200 Hz)
- **Pattern**: Rising pitch or major chord progression
- **Volume**: Moderate (noticeable but not jarring)
- **Examples**: Success chime, bell ding, positive notification

**Search Terms for Sourcing**:
- "success notification"
- "achievement chime"
- "positive bell"
- "completion sound"
- "level up sound"

#### Break Completion Sound

**Purpose**: Gently notify user break is over, encourage return to work

**Characteristics**:
- **Tone**: Calm, gentle, soothing but attention-getting
- **Frequency**: Lower/mid pitch (400-800 Hz)
- **Pattern**: Soft bell or gentle tone fade
- **Volume**: Softer than focus completion
- **Examples**: Meditation bell, soft notification, gentle chime

**Search Terms for Sourcing**:
- "gentle notification"
- "soft bell"
- "meditation chime"
- "calm alert"
- "mindfulness bell"

**Decision**: Focus sound should be noticeably more upbeat/energetic than break sound. Users should be able to distinguish which timer completed based on sound alone.

**Rationale**: Different sound characteristics provide immediate auditory feedback about which phase completed, improving UX. Focus completion deserves celebratory tone (accomplishment), while break completion should be gentle (don't startle user returning to work).

**Alternatives Considered**:
- Same sound for both (rejected: users can't distinguish timer types)
- Multiple sounds per type (rejected: out of scope, adds complexity)
- Voice notifications (rejected: requires speech synthesis or recordings, file size issues)

---

### 4. Browser Autoplay Policy Compliance

**Task**: Research browser autoplay restrictions and ensure compliance

**Findings**:

#### Autoplay Policies (2025)

**Chrome/Edge**:
- Autoplay allowed after user interaction with page (click, tap, key press)
- Audio won't play on page load without interaction
- `play()` returns rejected promise if blocked

**Firefox**:
- Similar to Chrome: requires user interaction
- "Allow Audio and Video" site permission can override

**Safari**:
- Strictest policy: requires user gesture
- Audio won't autoplay even after page interaction in some cases
- Must be in direct response to user event

**Decision**: Existing code in `audio.ts` already handles autoplay blocking gracefully (try/catch on lines 33-46, 54-67). Playback failures are logged but don't crash app. This is sufficient.

**Rationale**: 
- Timer start/stop/skip actions are user interactions, satisfying autoplay policies
- Failed playback is caught and logged (no user-facing error)
- Audio files are pre-loaded on app mount (line 21-22), but playback is deferred
- No code changes needed - existing implementation is compliant

**Alternatives Considered**:
- Show UI prompt for audio permission (rejected: UX friction, not necessary)
- Detect autoplay blocking and show banner (rejected: adds complexity, graceful degradation is sufficient)
- Use Web Audio API instead of HTMLAudioElement (rejected: overkill for simple playback)

---

### 5. Audio Integration Best Practices

**Task**: Identify best practices for audio asset integration in Vite/React applications

**Findings**:

#### Static Asset Handling in Vite

**Public Directory Pattern** (recommended for audio):
- Files in `/public/` are served at root URL during dev and copied to dist during build
- Reference with absolute path: `/sounds/file.mp3`
- No import/bundling needed
- Preserves original filename and URL structure

**Import Pattern** (alternative):
- Import audio files in code: `import audioFile from './audio.mp3'`
- Vite processes and adds hash to filename
- Requires code changes to use imported URLs
- Better for cache-busting but overkill for notification sounds

**Decision**: Continue using **public directory pattern** (`/public/sounds/`). Existing code already references `/sounds/*.mp3` paths.

**Rationale**: 
- Audio files are already referenced by static path in `audio.ts` (lines 17-18)
- No code changes needed
- Notification sounds rarely change, cache-busting not critical
- Simpler deployment (files are just copied, not processed)

**Build Verification**:
- Vite automatically copies `/public/` to `/dist/` during build
- Verify files exist in `dist/sounds/` after running `npm run build`
- Test production build with `npm run preview`

**Alternatives Considered**:
- Import pattern with dynamic URLs (rejected: requires code changes)
- Base64 embed in code (rejected: increases bundle size, bad practice for audio)
- CDN hosting (rejected: adds external dependency, increases latency)

---

## Summary

**Audio Files to Create**:
1. **focus-complete.mp3**: Upbeat chime/bell, 1-3 seconds, <50KB, 96-128kbps MP3
2. **break-complete.mp3**: Gentle bell/tone, 1-3 seconds, <50KB, 96-128kbps MP3

**Source Strategy**:
1. Search Pixabay for CC0 sounds matching characteristics above
2. If not found, generate simple tones using Audacity
3. Convert to MP3 at 96-128kbps mono if needed
4. Verify file size <50KB and duration 1-3 seconds

**Integration Steps**:
1. Download/generate audio files
2. Place in `/public/sounds/` directory
3. Verify files load in dev mode (no 404 errors)
4. Test playback when timers complete
5. Build project and verify files copied to `/dist/sounds/`
6. Document sources and licenses in updated README.md

**No Code Changes Required**: Existing `audio.ts` utility and `App.tsx` integration already implement all necessary functionality. This is purely an asset addition task.

---

## Questions Resolved

All "NEEDS CLARIFICATION" items from Technical Context are now resolved:

✅ Audio file format: MP3 at 96-128kbps  
✅ Licensing approach: CC0 (Pixabay) or original creation  
✅ Sound characteristics: Documented for focus vs. break  
✅ Browser compatibility: MP3 universally supported  
✅ Autoplay policy: Existing code handles gracefully  
✅ Integration pattern: Public directory, no code changes

**Ready for Phase 1: Design & Contracts**

