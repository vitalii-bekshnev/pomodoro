# Implementation Tasks: Center Header Title Block

**Feature**: `004-center-header`  
**Created**: December 19, 2025  
**Status**: Ready for implementation

This document provides a complete, dependency-ordered task breakdown for fixing the header title centering issue.

---

## Task Execution Guidelines

### Phases

1. **Phase 1: Setup** - Verify current layout and prepare for changes
2. **Phase 2: User Story 1** - Visual Balance and Centering (P1)
3. **Phase 3: User Story 2** - Responsive Layout Integrity (P1)
4. **Phase 4: Validation** - Cross-browser testing and documentation

### Dependency Rules

- **Sequential tasks**: Must complete in order (numbered within phase)
- **Parallel tasks [P]**: Can run simultaneously (marked with [P])
- **Phase gates**: All tasks in a phase must complete before next phase
- **User Story labels**: [US1], [US2] indicate which story the task implements

---

## Phase 1: Setup and Current Layout Analysis

**Goal**: Understand current CSS layout and verify the root cause of misalignment

### Task 1.1: Inspect Current CSS Layout

- [ ] T001 Inspect current `.header-content` styles in src/components/App.css
- **Description**: Review lines 26-34 to understand flexbox layout
- **Acceptance**: 
  - Confirm `display: flex` with `justify-content: center`
  - Identify `position: relative` presence (or absence)
  - Document current layout behavior
- **Status**: ⬜ Pending

### Task 1.2: Inspect Title Container Styles

- [ ] T002 Inspect `.header-content > div` styles in src/components/App.css
- **Description**: Review lines 36-38 to identify `flex: 1` issue
- **Acceptance**:
  - Confirm `flex: 1` is present (root cause)
  - Understand how it affects centering
- **Status**: ⬜ Pending

### Task 1.3: Inspect Settings Button Styles

- [ ] T003 Inspect `.settings-button` styles in src/components/App.css
- **Description**: Review lines 40-53 to understand button positioning
- **Acceptance**:
  - Confirm button is currently in flexbox flow
  - Note button width (48px) and current positioning
  - Verify hover effects and transitions exist
- **Status**: ⬜ Pending

### Task 1.4: Visual Baseline Capture

- [ ] T004 [P] Take screenshot of current off-center layout for comparison
- **Description**: Capture current state at 1920px, 768px, and 375px widths
- **Acceptance**:
  - Screenshots show title shifted left
  - Document approximate offset (expected ~24px left shift)
- **Status**: ⬜ Pending
- **Parallel**: ✅ Can run alongside Tasks 1.1-1.3

---

## Phase 2: User Story 1 - Visual Balance and Centering (P1)

**Goal**: Fix horizontal centering of header title and subtitle so they appear perfectly centered regardless of settings button presence

**Independent Test**: Load application → Inspect header → Verify title/subtitle centered relative to viewport → Settings button doesn't affect center position

### CSS Implementation Tasks

#### Task 2.1: Add Positioning Context to Header Container

- [ ] T005 [US1] Add `position: relative` to `.header-content` in src/components/App.css (line ~26-34)
- **Description**: Ensure `.header-content` has `position: relative` for absolute positioning context
- **CSS Change**:
  ```css
  .header-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-lg);
    position: relative;       /* ADD if not present */
    max-width: 800px;
    margin: 0 auto;
  }
  ```
- **Acceptance**:
  - `position: relative` added or verified present
  - No visual change yet (preparation for next task)
- **Status**: ⬜ Pending

#### Task 2.2: Remove Flex Growth from Title Container

- [ ] T006 [US1] Remove `flex: 1` from `.header-content > div` in src/components/App.css (line ~36-38)
- **Description**: Comment out or delete `flex: 1` to allow true centering
- **CSS Change**:
  ```css
  .header-content > div {
    /* flex: 1; */  /* REMOVE OR COMMENT OUT */
  }
  ```
- **Acceptance**:
  - `flex: 1` removed or commented
  - Title container no longer grows to fill space
  - If rule becomes empty, selector can be deleted
- **Status**: ⬜ Pending
- **Dependencies**: T005 (context established)

#### Task 2.3: Apply Absolute Positioning to Settings Button

- [ ] T007 [US1] Add `position: absolute` and `right: 0` to `.settings-button` in src/components/App.css (line ~40)
- **Description**: Remove settings button from flex flow to enable title centering
- **CSS Change**:
  ```css
  .settings-button {
    position: absolute;      /* ADD THIS */
    right: 0;                /* ADD THIS */
    /* All existing styles below remain unchanged */
    font-size: var(--font-size-2xl);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    /* ... rest of styles ... */
  }
  ```
- **Acceptance**:
  - `position: absolute` added to button
  - `right: 0` added to anchor button to right edge
  - All existing styles preserved (hover effects, transitions, etc.)
  - Button removed from flex flow
- **Status**: ⬜ Pending
- **Dependencies**: T005, T006 (centering mechanism ready)

### Visual Verification Tasks

#### Task 2.4: Verify Desktop Centering

- [ ] T008 [US1] Test title centering at 1920px viewport width
- **Description**: Load app in browser at full desktop width and verify centering
- **Test Steps**:
  1. Open http://localhost:5173 in browser
  2. Maximize window or set to 1920px width
  3. Inspect title "Pomodoro Timer" position
  4. Measure left and right spacing (DevTools)
- **Acceptance**:
  - Title appears exactly centered horizontally
  - Equal spacing on left and right (±5px tolerance)
  - Subtitle also centered
  - Settings button visible at right edge
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)

#### Task 2.5: Verify Settings Button Functionality

- [ ] T009 [P] [US1] Test settings button remains clickable and functional
- **Description**: Verify button hover and click work after positioning change
- **Test Steps**:
  1. Hover settings button → verify rotate/scale animation
  2. Click settings button → verify modal opens
  3. Close modal → verify layout unchanged
- **Acceptance**:
  - Hover effect works (rotate 90°, scale 1.1)
  - Click opens settings modal
  - Button remains accessible
  - No layout shift on interaction
- **Status**: ⬜ Pending
- **Dependencies**: T007 (button positioned)
- **Parallel**: ✅ Can run alongside T008

#### Task 2.6: Measure Centering Accuracy

- [ ] T010 [P] [US1] Use DevTools to measure pixel-perfect centering
- **Description**: Verify title center matches viewport center
- **Test Method**:
  ```javascript
  // Paste in browser console
  const titleRect = document.querySelector('.app-title').getBoundingClientRect();
  const center = titleRect.left + titleRect.width / 2;
  const viewportCenter = window.innerWidth / 2;
  const offset = Math.abs(center - viewportCenter);
  console.log('Offset from perfect center:', offset, 'px');
  // Should be <5px
  ```
- **Acceptance**:
  - Offset from viewport center ≤5px
  - Pixel-perfect centering achieved
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)
- **Parallel**: ✅ Can run alongside T008, T009

---

## Phase 3: User Story 2 - Responsive Layout Integrity (P1)

**Goal**: Ensure header centering is maintained consistently across all device sizes and remains stable during browser resize

**Independent Test**: Test desktop (1920px) → tablet (768px) → mobile (375px) → Verify centering consistent across all breakpoints

### Responsive Testing Tasks

#### Task 3.1: Verify Tablet Centering

- [ ] T011 [US2] Test title centering at 768px viewport width (tablet)
- **Description**: Verify centering maintained on tablet-sized screens
- **Test Steps**:
  1. Resize browser to 768px width (or use DevTools device emulation)
  2. Inspect title and subtitle positioning
  3. Verify settings button still visible and accessible
- **Acceptance**:
  - Title centered at 768px width
  - Subtitle centered at 768px width
  - Settings button visible at right edge
  - No overlap between title and button
  - Equal left/right spacing (±5px)
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)

#### Task 3.2: Verify Mobile Centering

- [ ] T012 [US2] Test title centering at 375px viewport width (mobile)
- **Description**: Verify centering maintained on mobile screens
- **Test Steps**:
  1. Resize browser to 375px width (iPhone SE size)
  2. Inspect title and subtitle positioning
  3. Verify settings button accessible
  4. Check for horizontal scrollbar (should not exist)
- **Acceptance**:
  - Title centered at 375px width
  - Subtitle centered at 375px width
  - Settings button visible and tappable
  - No overlap between title and button
  - Adequate spacing between elements
  - Text wraps gracefully if needed
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)

#### Task 3.3: Test Ultra-Narrow Screens

- [ ] T013 [P] [US2] Test layout at 320px width (iPhone 5)
- **Description**: Verify no overlap or layout break on very narrow screens
- **Test Steps**:
  1. Resize browser to 320px width
  2. Check for title/button overlap
  3. Verify all elements still accessible
- **Acceptance**:
  - No overlap between title and settings button
  - Layout remains functional
  - If title wraps, centering maintained
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)
- **Parallel**: ✅ Can run alongside T011, T012

#### Task 3.4: Test Ultra-Wide Screens

- [ ] T014 [P] [US2] Test layout at 2560px width (ultra-wide monitor)
- **Description**: Verify max-width constraint prevents excessive stretching
- **Test Steps**:
  1. Set browser to 2560px width
  2. Verify title centered within max-width container (800px)
  3. Check settings button position
- **Acceptance**:
  - Title centered within 800px max-width container
  - Settings button at right edge of content box
  - Layout doesn't stretch excessively
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)
- **Parallel**: ✅ Can run alongside T011, T012, T013

#### Task 3.5: Dynamic Resize Testing

- [ ] T015 [US2] Test smooth centering during browser window resize
- **Description**: Verify no layout "jumps" or shifts during dynamic resize
- **Test Steps**:
  1. Start at 375px width
  2. Slowly drag browser window to 1920px width
  3. Observe title position throughout resize
  4. Look for sudden shifts or layout jumps
- **Acceptance**:
  - Title stays centered throughout resize
  - No sudden "jumps" or layout shifts
  - Settings button stays at right edge
  - Smooth, stable centering behavior
  - Re-centering is fluid and continuous
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied), T011, T012 (breakpoints verified)

#### Task 3.6: All-Breakpoint Verification

- [ ] T016 [US2] Test centering across all 5 specified breakpoints
- **Description**: Comprehensive test at 375px, 640px, 768px, 1024px, 1920px
- **Test Checklist**:
  - [ ] 375px (mobile): Title centered ✓
  - [ ] 640px (large mobile): Title centered ✓
  - [ ] 768px (tablet): Title centered ✓
  - [ ] 1024px (small desktop): Title centered ✓
  - [ ] 1920px (desktop): Title centered ✓
- **Acceptance**:
  - Title centered at all 5 breakpoints
  - Settings button functional at all breakpoints
  - No layout issues at any tested width
- **Status**: ⬜ Pending
- **Dependencies**: T015 (resize behavior verified)

---

## Phase 4: Cross-Browser Testing and Validation

**Goal**: Ensure fix works across all target browsers and document results

### Browser Compatibility Tasks

#### Task 4.1: Chrome Testing

- [ ] T017 [P] Test centering fix in Chrome 90+ (latest stable)
- **Description**: Verify all centering behavior in Chrome
- **Test Steps**:
  1. Open app in Chrome
  2. Test desktop, tablet, mobile widths
  3. Verify settings button hover/click
- **Acceptance**:
  - Title centered in Chrome
  - Settings button functional
  - No visual glitches
  - Smooth hover animations
- **Status**: ⬜ Pending
- **Dependencies**: All Phase 2 and 3 tasks complete

#### Task 4.2: Firefox Testing

- [ ] T018 [P] Test centering fix in Firefox 88+ (latest stable)
- **Description**: Verify all centering behavior in Firefox
- **Test Steps**:
  1. Open app in Firefox
  2. Test desktop, tablet, mobile widths
  3. Verify settings button hover/click
- **Acceptance**:
  - Title centered in Firefox
  - Settings button functional
  - No visual glitches
  - Consistent with Chrome behavior
- **Status**: ⬜ Pending
- **Dependencies**: All Phase 2 and 3 tasks complete
- **Parallel**: ✅ Can run alongside T017, T019, T020

#### Task 4.3: Safari Testing

- [ ] T019 [P] Test centering fix in Safari 14+ (macOS/iOS)
- **Description**: Verify all centering behavior in Safari
- **Test Steps**:
  1. Open app in Safari (macOS or iOS)
  2. Test desktop, tablet, mobile widths
  3. Verify settings button hover/click
- **Acceptance**:
  - Title centered in Safari
  - Settings button functional
  - No visual glitches
  - Webkit rendering correct
- **Status**: ⬜ Pending
- **Dependencies**: All Phase 2 and 3 tasks complete
- **Parallel**: ✅ Can run alongside T017, T018, T020

#### Task 4.4: Edge Testing

- [ ] T020 [P] Test centering fix in Edge 90+ (latest stable)
- **Description**: Verify all centering behavior in Edge
- **Test Steps**:
  1. Open app in Edge
  2. Test desktop, tablet, mobile widths
  3. Verify settings button hover/click
- **Acceptance**:
  - Title centered in Edge
  - Settings button functional
  - No visual glitches
  - Chromium-based rendering correct
- **Status**: ⬜ Pending
- **Dependencies**: All Phase 2 and 3 tasks complete
- **Parallel**: ✅ Can run alongside T017, T018, T019

### Accessibility Verification Tasks

#### Task 4.5: Keyboard Navigation Testing

- [ ] T021 Verify keyboard navigation works after CSS changes
- **Description**: Test Tab key navigation and focus indicators
- **Test Steps**:
  1. Reload page
  2. Press Tab repeatedly
  3. Verify settings button receives focus
  4. Press Enter/Space on settings button
- **Acceptance**:
  - Settings button receives keyboard focus
  - Focus outline visible
  - Enter/Space opens settings modal
  - Tab order logical (header → timer → controls)
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)

#### Task 4.6: Screen Reader Testing

- [ ] T022 [P] Test with VoiceOver (macOS) or NVDA (Windows)
- **Description**: Verify screen reader announces elements in correct order
- **Test Steps**:
  1. Enable screen reader (VoiceOver: Cmd+F5)
  2. Navigate through header with VO+arrow keys
  3. Verify reading order
- **Acceptance**:
  - Header announces "Pomodoro Timer"
  - Subtitle announces "Focus. Work. Rest. Repeat."
  - Settings button announces "Settings button"
  - Reading order is logical (title → subtitle → settings)
  - No positioning issues announced
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)
- **Parallel**: ✅ Can run alongside T021

#### Task 4.7: Zoom Testing

- [ ] T023 [P] Test layout at 200% browser zoom
- **Description**: Verify centering maintained at high zoom levels
- **Test Steps**:
  1. Zoom to 200% (Cmd/Ctrl + Plus)
  2. Verify title still centered
  3. Check settings button position
  4. Verify no overlap
- **Acceptance**:
  - Title centered at 200% zoom
  - Settings button visible
  - No overlap between elements
  - Layout intact and accessible
- **Status**: ⬜ Pending
- **Dependencies**: T007 (CSS changes applied)
- **Parallel**: ✅ Can run alongside T021, T022

### Regression Testing Tasks

#### Task 4.8: Verify No Functional Regressions

- [ ] T024 Test all non-header functionality remains unchanged
- **Description**: Ensure CSS changes don't affect other app features
- **Test Checklist**:
  - [ ] Timer starts/pauses/resets correctly
  - [ ] Progress ring animates
  - [ ] Session tracking updates
  - [ ] Notifications appear
  - [ ] Settings modal opens/closes
  - [ ] Settings save correctly
  - [ ] All buttons work
- **Acceptance**:
  - All timer functionality works
  - Settings panel functional
  - No visual regressions in other areas
  - Footer visible and styled correctly
- **Status**: ⬜ Pending
- **Dependencies**: All Phase 2 and 3 tasks complete

### Documentation Tasks

#### Task 4.9: Update Specification Status

- [ ] T025 Update spec.md status to "Implemented"
- **Description**: Mark specification as implemented in spec.md
- **File**: `/Users/vitaliibekshnev/Source/Personal/pomodoro/specs/004-center-header/spec.md`
- **Change**: Update status line to `**Status**: ✅ Implemented`
- **Acceptance**:
  - Status updated in spec.md
  - Date of implementation noted
- **Status**: ⬜ Pending
- **Dependencies**: All testing tasks complete (T008-T024)

#### Task 4.10: Document Actual Metrics

- [ ] T026 [P] Document actual centering offset and performance metrics
- **Description**: Record measured results in plan.md or IMPLEMENTATION.md
- **Metrics to Document**:
  - Actual centering offset (measured in T010)
  - Lines of CSS changed (expected ~8-10)
  - Testing time taken
  - Any deviations from planned approach
- **Acceptance**:
  - Metrics documented
  - Actual vs expected comparison noted
  - Any issues or learnings captured
- **Status**: ⬜ Pending
- **Dependencies**: All testing complete
- **Parallel**: ✅ Can run alongside T025

#### Task 4.11: Capture After Screenshots

- [ ] T027 [P] Take after screenshots for comparison with baseline (T004)
- **Description**: Capture fixed state at 1920px, 768px, 375px widths
- **Comparison Points**:
  - Before: Title shifted left ~24px
  - After: Title perfectly centered
- **Acceptance**:
  - Screenshots show title centered
  - Side-by-side comparison demonstrates fix
  - Visual improvement documented
- **Status**: ⬜ Pending
- **Dependencies**: All Phase 2 and 3 tasks complete
- **Parallel**: ✅ Can run alongside T025, T026

---

## Summary

**Total Tasks**: 27  
**Phases**: 4  
**Estimated Time**: 15-30 minutes (5 min implementation + 10-25 min testing)  
**Parallel Opportunities**: 11 tasks can run in parallel

### Task Breakdown by Phase

| Phase | Tasks | Parallel | Type |
|-------|-------|----------|------|
| Phase 1: Setup | 4 tasks | 1 | Analysis |
| Phase 2: User Story 1 (P1) | 6 tasks | 3 | Implementation + Testing |
| Phase 3: User Story 2 (P1) | 6 tasks | 4 | Testing |
| Phase 4: Validation | 11 tasks | 8 | Cross-browser + Documentation |

### Critical Path

1. **Phase 1**: T001 → T002 → T003 (inspect current layout)
2. **Phase 2**: T005 → T006 → T007 (apply CSS fixes) → T008 (verify centering)
3. **Phase 3**: T011, T012 (test breakpoints) → T015 (resize test) → T016 (all breakpoints)
4. **Phase 4**: T017-T020 (browser tests, parallel) → T024 (regression) → T025-T027 (docs, parallel)

### MVP Scope

**Minimum Viable Implementation**:
- Phase 1: All setup tasks (T001-T004)
- Phase 2: CSS implementation (T005-T007) + Desktop verification (T008)
- Basic validation: Settings button works (T009)

**Total MVP Time**: ~10 minutes

**Full Implementation**: All 27 tasks (~30 minutes)

### Dependencies

**User Story 1** (Phase 2):
- No dependencies (can start immediately after setup)
- Provides: Centered header on desktop

**User Story 2** (Phase 3):
- Depends on: User Story 1 complete (T007)
- Provides: Responsive centering verified

**Validation** (Phase 4):
- Depends on: Both user stories complete
- Provides: Browser compatibility + documentation

### Task Status Legend

- ⬜ Pending: Not started
- 🔄 In Progress: Currently working
- ✅ Complete: Finished and verified
- ❌ Failed: Encountered errors
- ⏭️ Skipped: Intentionally bypassed

---

**Ready for Implementation**: All tasks defined with clear acceptance criteria and file paths. Each task is specific enough for immediate execution.

