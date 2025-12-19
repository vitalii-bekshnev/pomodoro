# Quickstart Guide: Fix Settings Modal Button Layout

**Feature**: 002-fix-settings-buttons  
**Branch**: `002-fix-settings-buttons`  
**Last Updated**: December 19, 2025

---

## Prerequisites

- Node.js 18+
- npm 9+
- Existing Pomodoro Timer app running
- Modern browser with DevTools (Chrome/Firefox/Safari/Edge)

---

## Quick Start

```bash
# Already on feature branch
git status
# Should show: On branch 002-fix-settings-buttons

# Start development server
npm run dev

# Opens at http://localhost:5173
```

---

## Testing the Fix

### Step 1: Reproduce the Bug (Before Fix)

1. **Open the app** at `http://localhost:5173`
2. **Click the ⚙️ (gear) icon** in the header to open Settings modal
3. **Observe the footer buttons**:
   - Look for text overflow (text cut off or wrapping oddly)
   - Note current button widths
4. **Hover over Cancel button**:
   - Does it rotate? (Bug: Yes, it shouldn't)
   - Does it provide visual feedback? (Expected: color change + lift)

### Step 2: Apply the Fix

**File to modify**: `src/components/Settings/SettingsPanel.css`

**Change 1**: Fix button width (around line 113-119)

```css
.settings-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  /* ADD THESE THREE LINES */
  min-width: fit-content;
  white-space: nowrap;
  cursor: pointer;
}
```

**Change 2**: Fix hover isolation (around line 127-132)

Update to use scoped selector:

```css
/* Change from .settings-button.primary:hover to: */
.settings-footer .settings-button.primary:hover {
  background-color: #d35400;
  border-color: #d35400;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Change from .settings-button.secondary:hover to: */
.settings-footer .settings-button.secondary:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}
```

**Change 3**: Add mobile responsive rules (around line 190-201)

```css
@media (max-width: 640px) {
  .settings-panel {
    width: 95%;
    max-height: 95vh;
  }
  
  .settings-header,
  .settings-content,
  .settings-footer {
    padding: var(--spacing-md);
  }
  
  /* ADD THESE LINES */
  .settings-footer {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .settings-button {
    width: 100%;
  }
}
```

### Step 3: Verify the Fix

**Desktop (Full Width)**:
1. Refresh the app (`Cmd+R` / `Ctrl+R`)
2. Open Settings modal (⚙️ icon)
3. **Check text visibility**:
   - [ ] "Cancel" text fully visible
   - [ ] "Save Changes" text fully visible
   - [ ] No text overflow or wrapping
4. **Check hover behavior**:
   - [ ] Hover Cancel → Color changes to lighter gray, subtle lift
   - [ ] **NO ROTATION** ✅
   - [ ] Hover Save → Color darkens, subtle lift
   - [ ] Transitions smooth (<300ms)

**Tablet (768px)**:
1. Open DevTools (`F12`)
2. Click device toolbar (mobile icon) or `Cmd+Shift+M`
3. Select "iPad" or set width to 768px
4. **Check layout**:
   - [ ] Buttons remain side-by-side
   - [ ] Text fully visible
   - [ ] Hover effects work

**Mobile (375px)**:
1. In DevTools, select "iPhone" or set width to 375px
2. **Check responsive layout**:
   - [ ] Buttons stack vertically
   - [ ] Each button full width
   - [ ] Text fully visible
   - [ ] Adequate spacing between buttons

**Zoom Test**:
1. Set browser zoom to 200% (`Cmd/Ctrl + Plus`)
2. **Check scaling**:
   - [ ] Buttons scale proportionally
   - [ ] No text overflow
   - [ ] Layout maintains integrity

---

## Success Criteria Checklist

### FR-001: Button Text Display
- [ ] "Cancel" text fully visible without truncation
- [ ] "Save Changes" text fully visible without truncation
- [ ] No text wrapping or awkward breaks

### FR-002: Button Width Adaptation
- [ ] Buttons automatically size to content
- [ ] Adequate padding maintained
- [ ] Flexible for longer text (localization ready)

### FR-003-004: Hover Behavior
- [ ] Cancel button hover: Color change + lift, **NO rotation**
- [ ] Save button hover: Consistent feedback
- [ ] Smooth transitions

### FR-005: Mobile Viewports
- [ ] Works on 320px width (smallest mobile)
- [ ] Works on 375px (iPhone)
- [ ] Works on 768px (tablet)

### FR-006: Text Length Flexibility
- [ ] Try changing button text in SettingsPanel.tsx temporarily:
  ```tsx
  <button onClick={handleCancel}>Cancel Operation</button>
  <button onClick={handleSave}>Save All Changes Now</button>
  ```
- [ ] Buttons adapt to longer text without overflow

### FR-007: Transition Timing
- [ ] Hover transitions feel smooth
- [ ] Complete within 300ms (perceived)
- [ ] No janky animations

### FR-008: Accessibility
- [ ] Tab navigation works
- [ ] Focus indicators visible
- [ ] Browser zoom respected

---

## Cross-Browser Testing

### Chrome 90+ (Primary)
```bash
# Already tested in dev server
```

### Firefox 88+
1. Open Firefox
2. Navigate to `http://localhost:5173`
3. Repeat verification steps above
4. **Check**: Transform and flex properties work correctly

### Safari 14+
1. Open Safari
2. Navigate to `http://localhost:5173`
3. Repeat verification steps
4. **Check**: Webkit-specific quirks (if any)

### Edge 90+
1. Open Edge
2. Navigate to `http://localhost:5173`
3. Repeat verification steps
4. **Check**: Chromium parity

---

## Troubleshooting

### Issue: Changes Not Appearing

**Solution**:
```bash
# Hard refresh
Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

# Or clear cache
# DevTools → Network tab → Disable cache checkbox
```

### Issue: Still See Rotation on Hover

**Diagnosis**: CSS specificity issue

**Solution**: Check that selector is `.settings-footer .settings-button:hover` not just `.settings-button:hover`

**Verify in DevTools**:
1. Inspect Cancel button
2. Hover over it
3. Check "Computed" tab → "transform" property
4. Should show: `translateY(-1px)` NOT `rotate(90deg)`

### Issue: Text Still Overflowing

**Diagnosis**: `min-width` not applied or parent constraint

**Solution**: 
1. Inspect button in DevTools
2. Check "Styles" tab
3. Verify `min-width: fit-content` is not crossed out
4. Check parent `.settings-footer` has `display: flex` (should be there already)

### Issue: Mobile Layout Not Stacking

**Diagnosis**: Media query not applied

**Solution**:
1. Check viewport width in DevTools (bottom right corner)
2. Ensure width ≤ 640px
3. Verify media query syntax is correct
4. Hard refresh

---

## Performance Verification

### Check Render Performance

1. Open DevTools → Performance tab
2. Click Record
3. Open Settings modal
4. Hover over buttons multiple times
5. Stop recording
6. **Analyze**:
   - [ ] No long tasks (>50ms)
   - [ ] Smooth 60fps animations
   - [ ] No layout thrashing

### Check CSS Specificity

1. Inspect button element
2. Check "Styles" tab
3. **Verify**:
   - [ ] `.settings-footer .settings-button:hover` rules are applied
   - [ ] No conflicting rules from `App.css`
   - [ ] No `!important` flags (shouldn't need them)

---

## Rollback Instructions

If the fix causes issues:

```bash
# Discard changes
git checkout src/components/Settings/SettingsPanel.css

# Restart dev server
npm run dev
```

Or revert specific changes and keep investigating.

---

## Next Steps

After verifying all checkboxes pass:

1. **Commit the changes**:
   ```bash
   git add src/components/Settings/SettingsPanel.css
   git commit -m "Fix Settings modal button layout and hover behavior
   
   - Add min-width: fit-content to prevent text overflow
   - Scope button hover selectors to prevent rotation inheritance
   - Add mobile responsive rules for button stacking
   - Maintain accessibility and smooth transitions
   
   Fixes: Text overflow in Cancel/Save buttons
   Fixes: Incorrect rotation on button hover"
   ```

2. **Manual QA**: Have another person test on their machine

3. **Deploy**: Merge to main branch

---

## Documentation

**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Research**: [research.md](./research.md)

**Status**: ✅ Ready for testing

