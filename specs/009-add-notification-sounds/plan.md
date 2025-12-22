# Implementation Plan: Add Notification Sounds

**Branch**: `009-add-notification-sounds` | **Date**: December 22, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-add-notification-sounds/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature resolves 404 errors for missing audio notification files by sourcing or generating two license-free MP3 files (focus-complete.mp3 and break-complete.mp3) and adding them to the `/public/sounds/` directory. The audio playback infrastructure already exists in `src/utils/audio.ts` - only the actual audio file assets are missing. Focus completion sound should be upbeat/celebratory (1-3 seconds, <50KB), while break completion sound should be calm/gentle with similar constraints.

## Technical Context

**Language/Version**: TypeScript 5.3, React 18.2  
**Primary Dependencies**: Vite 5.0 (build tool), React 18.2, date-fns 2.30  
**Storage**: LocalStorage for settings persistence (existing), Static assets for audio files  
**Testing**: Jest 29.7 with jsdom environment, React Testing Library 14.1  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with HTML5 Audio API support  
**Project Type**: Web (single-page React application)  
**Performance Goals**: Audio file load <500ms, playback latency <100ms, each file <50KB  
**Constraints**: Browser autoplay policy compliance, license-free audio assets only, 1-3 second audio duration  
**Scale/Scope**: Two audio files, minimal code changes (asset integration only), existing audio.ts utility handles playback

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: License Compliance
- **Requirement**: All audio files must be license-free (public domain, CC0, CC-BY) or original creations
- **Status**: ✅ PASS - Will source from known free repositories (Pixabay, Freesound) or generate original tones
- **Verification**: Document source and license in research.md

### Gate 2: Asset Integration Only
- **Requirement**: No breaking changes to existing audio.ts utility or playback logic
- **Status**: ✅ PASS - This is purely an asset addition task; audio.ts already implements all required functionality
- **Verification**: No code changes needed in src/utils/audio.ts

### Gate 3: Browser Compatibility
- **Requirement**: MP3 format must work in all target browsers (Chrome, Firefox, Safari, Edge)
- **Status**: ✅ PASS - MP3 is universally supported in modern browsers via HTML5 Audio API
- **Verification**: Test playback in target browsers during implementation

### Gate 4: Performance Budget
- **Requirement**: Each audio file must be <50KB and 1-3 seconds duration
- **Status**: ✅ PASS - Can achieve with 128kbps or lower MP3 encoding
- **Verification**: Check file sizes before committing to repository

**Overall Assessment**: No constitution violations. This is a low-risk asset integration task with no architectural changes.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
public/
└── sounds/                    # Static audio assets served at /sounds/ URL path
    ├── focus-complete.mp3     # NEW: Upbeat completion notification (1-3s, <50KB)
    ├── break-complete.mp3     # NEW: Calm completion notification (1-3s, <50KB)
    └── README.md              # EXISTING: Placeholder documentation

src/
├── utils/
│   └── audio.ts               # EXISTING: Audio playback utilities (no changes needed)
└── components/
    └── App.tsx                # EXISTING: Calls initializeAudio() on mount (no changes needed)

dist/
└── sounds/                    # Build output: Vite copies from public/ to dist/
    ├── focus-complete.mp3
    └── break-complete.mp3
```

**Structure Decision**: This is an asset integration task. Audio files are placed in `/public/sounds/` directory, which Vite automatically copies to `/dist/sounds/` during build. The existing `audio.ts` utility already references these paths (`/sounds/focus-complete.mp3`, `/sounds/break-complete.mp3`). No source code structure changes required.

## Complexity Tracking

> **No violations to justify** - This feature has no constitution violations and introduces no architectural complexity. It's a pure asset integration task.

---

## Phase Completion Status

### ✅ Phase 0: Research (Complete)

**Output**: `research.md`

**Key Decisions**:
- Audio source: Pixabay (CC0) or Audacity-generated tones
- Format: MP3 at 96-128kbps mono
- Focus sound: Upbeat, 600-1200Hz range
- Break sound: Calm, 400-800Hz range
- Integration: Public directory pattern (existing code compatible)

**All NEEDS CLARIFICATION items resolved**: Yes

---

### ✅ Phase 1: Design & Contracts (Complete)

**Outputs**:
- `data-model.md` - Documents existing audio entities and validation rules
- `contracts/audio-assets.md` - Defines file specifications and integration contract
- `quickstart.md` - Step-by-step implementation guide
- Agent context updated via `update-agent-context.sh`

**Key Findings**:
- No new data structures required
- No code changes required
- Pure asset integration task
- Existing `audio.ts` utility handles all functionality

**Constitution Re-Check**: ✅ All gates still pass after design phase

---

### Phase 2: Tasks & Implementation Planning

**Status**: Ready for `/speckit.tasks` command

**Recommended Task Breakdown**:
1. Source/download audio files meeting specifications
2. Add files to `/public/sounds/` directory  
3. Update `/public/sounds/README.md` with sources and licenses
4. Test in development mode (verify no 404s, sounds play)
5. Test production build (verify files copied to dist)
6. Cross-browser verification (Chrome, Firefox, Safari, Edge)

**Estimated Implementation Time**: 30-60 minutes

---

## Next Steps

1. **Run** `/speckit.tasks` to generate `tasks.md` with detailed task breakdown
2. **Create** branch `009-add-notification-sounds` (if not already created)
3. **Implement** according to `quickstart.md` guide
4. **Verify** all acceptance criteria in feature spec
5. **Commit** changes with proper git message format
6. **Deploy** and verify in production environment

---

## Artifacts Generated

| Artifact | Location | Purpose |
|----------|----------|---------|
| Implementation Plan | `plan.md` | This file - overall planning document |
| Research | `research.md` | Audio sourcing, format selection, integration patterns |
| Data Model | `data-model.md` | Audio asset specifications and existing entities |
| Contract | `contracts/audio-assets.md` | File specifications and integration contract |
| Quickstart | `quickstart.md` | Implementation guide for developers |
| Agent Context | `.cursor/rules/specify-rules.mdc` | Updated with feature tech stack |

---

## Summary

**Feature Type**: Asset Integration  
**Complexity**: Low  
**Code Changes**: None (existing infrastructure complete)  
**Primary Work**: Sourcing/preparing two MP3 files  
**Risk Level**: Minimal (graceful degradation if files missing)  
**Branch**: `009-add-notification-sounds`

**Ready for Implementation**: Yes ✅

