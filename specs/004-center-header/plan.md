# Implementation Plan: Center Header Title Block

**Branch**: `004-center-header` | **Date**: December 19, 2025 | **Spec**: [spec.md](./spec.md)  
**Status**: Planning | **Input**: Feature specification from `/specs/004-center-header/spec.md`

## Summary

Fix the horizontal centering issue of the header title "Pomodoro Timer" and subtitle "Focus. Work. Rest. Repeat." which are currently misaligned due to the settings button affecting the flexbox layout. Implement a CSS-only solution using absolute positioning for the settings button to allow true centering of the title/subtitle block.

## Technical Context

**Language/Version**: CSS3, React 18 (JSX structure, CSS styling only)  
**Primary Dependencies**: None (pure CSS fix)  
**Storage**: N/A (visual layout fix only)  
**Testing**: Visual inspection, responsive testing across breakpoints  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: UI/UX fix for existing React SPA  
**Performance Goals**: No performance impact (CSS-only changes)  
**Constraints**: CSS-only (no HTML structure changes), maintain existing class names, preserve accessibility  
**Scale/Scope**: Single component CSS fix (~10-15 lines modified in App.css)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS - No constitution violations

This is a minor CSS layout fix for visual centering. No new dependencies, architecture changes, or testing paradigm modifications.

- ✅ No new application dependencies (CSS-only)
- ✅ No changes to application logic or functionality
- ✅ Visual/UI enhancement only
- ✅ Existing tests remain valid (no component behavior changes)
- ✅ Follows CSS best practices

## Project Structure

### Documentation (this feature)

```text
specs/004-center-header/
├── spec.md                # Feature specification
├── plan.md                # This file
├── research.md            # CSS centering techniques research
├── quickstart.md          # Testing and verification guide
└── checklists/
    └── requirements.md    # Quality validation checklist
```

### Source Code (repository root)

```text
src/
└── components/
    ├── App.tsx            # Header JSX structure (inspect only, minimal changes)
    └── App.css            # Main CSS file to modify (MODIFY)
```

**Structure Decision**: Modify only `App.css`. The current HTML structure in `App.tsx` is adequate; the issue is purely CSS-based flexbox centering.

## Phase 0: Research & CSS Centering Techniques

### Research Topics

#### 1. CSS Centering Techniques for Headers with Side Elements

**Decision**: Use absolute positioning for settings button with left offset

**Rationale**:
- **Problem**: Current flexbox layout with `.header-content > div { flex: 1 }` causes title to shift left because settings button takes up space on the right
- **Root Cause**: Flexbox distributes space equally among flex children. When settings button (48px width) is a flex child, it pushes the title container off-center
- **Solution**: Remove settings button from flex flow by using `position: absolute`

**Implementation Pattern**:
```css
.header-content {
  display: flex;
  justify-content: center;  /* Center the title/subtitle */
  align-items: center;
  position: relative;       /* For absolute positioning context */
  max-width: 800px;
  margin: 0 auto;
}

/* Remove flex: 1 from title container */
.header-content > div {
  /* flex: 1; */ /* REMOVE THIS */
  text-align: center;
}

/* Position settings button absolutely */
.settings-button {
  position: absolute;
  right: 0;                /* Anchor to right edge */
  /* All other styles remain unchanged */
}
```

**Alternatives Considered**:
- **CSS Grid**: Rejected - More complex than needed, requires 3-column grid with `grid-template-columns: auto 1fr auto`
- **Transform centering**: Rejected - Doesn't solve issue when button is flex child
- **Negative margins**: Rejected - Brittle, breaks responsiveness
- **Padding compensation**: Rejected - Requires JavaScript to calculate, not maintainable

---

#### 2. Responsive Behavior for Absolute Positioned Elements

**Decision**: Keep absolute positioning across all breakpoints, adjust right offset on mobile if needed

**Rationale**:
- Absolute positioning works consistently across screen sizes
- Settings button remains in top-right corner on all devices
- No special breakpoint handling required for centering logic
- Mobile (<640px) already has adequate spacing for button + title

**Mobile Considerations**:
```css
@media (max-width: 640px) {
  .settings-button {
    right: 0;  /* Keep at edge or add small offset if needed */
    /* Button size already appropriate (48px) */
  }
}
```

**Alternatives Considered**:
- **Different layout on mobile**: Rejected - Consistency across devices preferred
- **Hide button on mobile**: Rejected - Settings access needed on all devices
- **Stack vertically**: Rejected - Wastes vertical space, not user-friendly

---

#### 3. Flexbox vs CSS Grid for Header Layout

**Decision**: Keep flexbox, modify positioning of settings button only

**Rationale**:
- Current flexbox setup works well for title/subtitle vertical stacking
- Minimal changes required (remove `flex: 1`, add absolute positioning)
- Flexbox `justify-content: center` perfectly centers title once button is removed from flow
- Grid would require more extensive refactoring

**Comparison**:

| Approach | Complexity | Lines Changed | Responsiveness | Verdict |
|----------|-----------|---------------|----------------|---------|
| Absolute positioning (button) | Low | ~5 lines | Excellent | ✅ **CHOSEN** |
| CSS Grid (3 columns) | Medium | ~15 lines | Excellent | ⚠️ Overkill |
| Flexbox with spacer | Medium | ~10 lines | Good | ❌ Less elegant |
| Transform centering | Low | ~8 lines | Poor | ❌ Doesn't fix root cause |

---

#### 4. Browser Compatibility for position: absolute

**Decision**: Use standard `position: absolute` - fully supported in target browsers

**Rationale**:
- `position: absolute` supported since IE6+ (ancient)
- No fallbacks or vendor prefixes needed
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ all fully support
- No polyfills required

**Browser Support**:
- Chrome 90+ (May 2021): ✅ Full support
- Firefox 88+ (April 2021): ✅ Full support
- Safari 14+ (September 2020): ✅ Full support
- Edge 90+ (May 2021): ✅ Full support

---

#### 5. Impact on Accessibility and Screen Readers

**Decision**: Absolute positioning has no impact on accessibility - DOM order preserved

**Rationale**:
- Absolute positioning is purely visual (CSS rendering layer)
- Screen readers follow DOM order in HTML, not visual layout
- Keyboard navigation (tab order) follows DOM order
- ARIA attributes and semantic HTML unaffected by CSS positioning

**Accessibility Verification**:
- ✅ Settings button remains keyboard accessible (tabindex preserved)
- ✅ Screen reader announces elements in DOM order (header → title → subtitle → settings)
- ✅ Focus outline still visible when button is focused
- ✅ No impact on ARIA labels or roles

**Testing**:
- Test keyboard navigation (Tab key)
- Test with VoiceOver (macOS) or NVDA (Windows)
- Verify focus indicators visible

---

### Technical Specifications

#### CSS Changes Required

**File**: `src/components/App.css`

**Lines to Modify**: ~8-12 lines

**Changes**:

1. **Update `.header-content` ** (add `position: relative`):
```css
.header-content {
  display: flex;
  justify-content: center;  /* This will now center title properly */
  align-items: center;
  gap: var(--spacing-lg);  /* Keep gap or remove if not needed */
  position: relative;       /* NEW: Context for absolute positioning */
  max-width: 800px;
  margin: 0 auto;
}
```

2. **Remove flex: 1 from title container**:
```css
.header-content > div {
  /* flex: 1; */  /* REMOVE THIS LINE */
  text-align: center;  /* Keep this for title/subtitle centering */
}
```

3. **Add absolute positioning to settings button**:
```css
.settings-button {
  position: absolute;      /* NEW: Remove from flex flow */
  right: 0;                /* NEW: Anchor to right edge */
  /* All existing styles below remain unchanged */
  font-size: var(--font-size-2xl);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;  /* Can be removed since no longer in flex */
}
```

---

## Phase 1: Implementation Plan

### File Modification Order

1. **`src/components/App.css`** - Apply CSS changes for centering

### Implementation Steps

#### Step 1: Add position: relative to .header-content

**Location**: `App.css` line ~26-34

**Change**:
```css
.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;       /* ADD THIS LINE */
  max-width: 800px;
  margin: 0 auto;
}
```

---

#### Step 2: Remove flex: 1 from title container

**Location**: `App.css` line ~36-38

**Change**:
```css
.header-content > div {
  /* flex: 1; */  /* REMOVE OR COMMENT OUT */
}
```

**Note**: If this results in an empty rule, the selector can be removed entirely. The title div will still center due to parent's `justify-content: center`.

---

#### Step 3: Add absolute positioning to settings button

**Location**: `App.css` line ~40-53

**Change**:
```css
.settings-button {
  position: absolute;      /* ADD */
  right: 0;                /* ADD */
  /* Existing styles continue below */
  font-size: var(--font-size-2xl);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;  /* Optional: can remove */
}
```

---

#### Step 4: (Optional) Remove gap if no longer needed

**Location**: `App.css` line ~28

**Consideration**: The `gap: var(--spacing-lg)` in `.header-content` may no longer be necessary since settings button is absolutely positioned. Test visually - if title and subtitle spacing looks correct without gap, it can be removed. If gap is needed for vertical spacing between title/subtitle, keep it.

**Decision**: Keep gap initially, remove only if it causes issues.

---

## Testing Strategy

### Visual Testing Checklist

#### Desktop Testing (1920px)

- [ ] Title "Pomodoro Timer" horizontally centered
- [ ] Subtitle "Focus. Work. Rest. Repeat." horizontally centered
- [ ] Equal spacing on left and right of title block (measure with DevTools)
- [ ] Settings button visible in top-right corner
- [ ] Settings button hover effect works
- [ ] No layout shift when hovering settings button

#### Tablet Testing (768px)

- [ ] Title remains horizontally centered
- [ ] Subtitle remains horizontally centered
- [ ] Settings button still accessible and functional
- [ ] No overlap between title and settings button

#### Mobile Testing (375px)

- [ ] Title horizontally centered
- [ ] Subtitle horizontally centered
- [ ] Settings button visible and tappable
- [ ] Adequate spacing between title and button edge
- [ ] Text wraps gracefully if needed

#### Responsive Resize Testing

- [ ] Smoothly drag browser window from 375px to 1920px
- [ ] Title stays centered throughout resize
- [ ] No layout "jumps" or sudden shifts
- [ ] Settings button remains in place

---

### Browser Testing

Test in:
- Chrome 90+ (latest stable)
- Firefox 88+ (latest stable)
- Safari 14+ (macOS/iOS)
- Edge 90+ (latest stable)

---

### Accessibility Testing

- [ ] Keyboard navigation: Tab to settings button works
- [ ] Focus indicator visible on settings button
- [ ] Screen reader announces header elements in correct order
- [ ] Zoom to 200%: layout remains intact and centered

---

## Complexity Tracking

> **No complexity violations** - Simple CSS positioning fix

**Justification**:
- Pure CSS change (3 properties modified)
- No new dependencies
- No architectural changes
- Standard CSS positioning technique
- ~10 lines of code changed

---

**Status**: ✅ Ready for implementation  
**Estimated Time**: 15-30 minutes (5 min implementation + 10-25 min testing)  
**Risk Level**: Very Low (CSS-only, easily reversible, no breaking changes)
