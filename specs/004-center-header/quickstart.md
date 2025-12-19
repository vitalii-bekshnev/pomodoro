# Quick Start Guide: Center Header Title Block

**Feature**: `004-center-header`  
**Version**: 1.0.0  
**Last Updated**: December 19, 2025

This guide provides quick instructions for implementing and testing the header centering fix.

---

## Prerequisites

- Code editor (VS Code, Cursor, etc.)
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Development server running (`npm run dev`)

---

## Quick Implementation (5 minutes)

### Step 1: Open the CSS File

```bash
# Navigate to project root
cd /Users/vitaliibekshnev/Source/Personal/pomodoro

# Open App.css in your editor
code src/components/App.css
```

### Step 2: Modify CSS

Make these 3 changes in `src/components/App.css`:

**Change 1**: Add `position: relative` to `.header-content` (if not present)
**Change 2**: Remove `flex: 1` from `.header-content > div`
**Change 3**: Add `position: absolute; right: 0;` to `.settings-button`

### Complete Solution

```css
.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;       /* Ensure this is present */
  max-width: 800px;
  margin: 0 auto;
}

.header-content > div {
  /* flex: 1; */  /* Remove or comment out */
}

.settings-button {
  position: absolute;       /* Add this */
  right: 0;                 /* Add this */
  /* ... rest of styles unchanged ... */
}
```

---

## Testing Checklist

- [ ] Desktop (1920px): Title centered
- [ ] Tablet (768px): Title centered
- [ ] Mobile (375px): Title centered
- [ ] Settings button functional
- [ ] No layout shifts on resize
- [ ] Keyboard navigation works
- [ ] All browsers (Chrome, Firefox, Safari, Edge)

---

**Total Time**: 15-20 minutes (5 min implementation + 10-15 min testing)

