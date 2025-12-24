# Quickstart: Big View Mode Implementation

**Feature**: 014-big-view-mode  
**Date**: December 24, 2025  
**Purpose**: Quick reference guide for implementing Big View mode

## 🎯 Overview

**What**: Immersive full-screen timer mode with centiseconds precision and smooth animations

**Why**: Provide distraction-free focus experience similar to meditation timers

**Impact**: 5-7 files modified, 2 new components, ~300 lines of code

---

## ⚡ Quick Implementation Checklist

### Phase 1: Add Preference (15 min)
- [ ] Update `src/types/settings.ts` - add `bigViewEnabled: boolean`
- [ ] Update `src/constants/defaults.ts` - add to default preferences
- [ ] Update `src/components/Settings/SettingsPanel.tsx` - add toggle control
- [ ] Test: Toggle persists across page reloads

### Phase 2: Update Timer Display (30 min)
- [ ] Create `src/components/Timer/TimerDigit.tsx` - individual digit component
- [ ] Create `src/components/Timer/TimerDigit.css` - animation styles
- [ ] Update `src/components/Timer/Timer.tsx` - centiseconds display logic
- [ ] Update `src/components/Timer/Timer.css` - Big View styles
- [ ] Test: Centiseconds display correctly, animations smooth

### Phase 3: Update Layout (20 min)
- [ ] Update `src/components/App.tsx` - conditional className, Settings button position
- [ ] Update `src/components/App.css` - Big View layout styles
- [ ] Test: Header hidden, controls below timer, scrollable layout

### Phase 4: High-Frequency Updates (15 min)
- [ ] Update `src/hooks/useTimer.ts` - conditional 10ms interval
- [ ] Test: 100Hz updates in Big View, 10Hz in regular mode

### Phase 5: Testing (30 min)
- [ ] Write unit tests for preference, timer display, centiseconds
- [ ] Write integration tests for layout, persistence
- [ ] Manual testing across devices (mobile, tablet, desktop)

**Total Estimated Time**: ~2 hours

---

## 📁 Files To Modify

### Types & Constants
```typescript
// src/types/settings.ts
export interface UserPreferences {
  // ... existing fields ...
  bigViewEnabled: boolean;
}

// src/constants/defaults.ts
export const DEFAULT_PREFERENCES: UserPreferences = {
  // ... existing fields ...
  bigViewEnabled: false,
};
```

### Components

#### App.tsx
```tsx
const { preferences } = useSettings();
const bigViewEnabled = preferences.bigViewEnabled;

return (
  <div className={`app ${bigViewEnabled ? 'app--big-view' : ''}`}>
    <header className="app-header">
      {!bigViewEnabled && settingsButton}
      {/* ... */}
    </header>
    
    <Timer {...timer} bigViewEnabled={bigViewEnabled} />
    
    <div className="controls-container">
      {bigViewEnabled && settingsButton}
      {/* ... other controls ... */}
    </div>
  </div>
);
```

#### Timer.tsx
```tsx
export const Timer: React.FC<TimerProps & { bigViewEnabled?: boolean }> = ({
  remaining,
  bigViewEnabled,
  // ... other props
}) => {
  const { minutes, seconds, centiseconds } = formatTime(remaining, bigViewEnabled);
  
  return (
    <div className={`timer ${bigViewEnabled ? 'timer--big-view' : ''}`}>
      <div className="timer-display">
        <TimerDigit digit={minutes[0]} position="min-tens" />
        <TimerDigit digit={minutes[1]} position="min-ones" />
        <TimerDigit digit=":" position="colon" isSeparator />
        <TimerDigit digit={seconds[0]} position="sec-tens" />
        <TimerDigit digit={seconds[1]} position="sec-ones" />
        {bigViewEnabled && (
          <>
            <TimerDigit digit="." position="period" isSeparator />
            <TimerDigit digit={centiseconds![0]} position="cs-tens" />
            <TimerDigit digit={centiseconds![1]} position="cs-ones" />
          </>
        )}
      </div>
    </div>
  );
};
```

#### TimerDigit.tsx (NEW)
```tsx
export const TimerDigit: React.FC<TimerDigitProps> = ({ 
  digit, 
  position,
  isSeparator = false 
}) => {
  return (
    <span
      key={`${digit}-${position}`}
      className={`timer-digit ${isSeparator ? 'timer-digit-separator' : ''}`}
    >
      {digit}
    </span>
  );
};
```

#### SettingsPanel.tsx
```tsx
<section className="settings-section">
  <h3 className="section-title">Appearance</h3>
  
  <ThemeToggle />
  
  <ToggleSwitch
    label="Big View Mode"
    checked={localPrefs.bigViewEnabled}
    onChange={(checked) =>
      setLocalPrefs({ ...localPrefs, bigViewEnabled: checked })
    }
    description="Immersive full-screen timer with centiseconds precision"
  />
</section>
```

### Hooks

#### useTimer.ts
```typescript
export function useTimer(preferences: UserPreferences, onComplete: ...) {
  const updateInterval = preferences.bigViewEnabled ? 10 : 100;
  
  intervalRef.current = window.setInterval(() => {
    // ... existing timer logic ...
  }, updateInterval);
  
  // ... rest of hook ...
}
```

### Styles

#### App.css
```css
/* Big View: Hide header */
.app--big-view .app-header {
  display: none;
}

/* Big View: Full-viewport timer container */
.app--big-view .timer-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Big View: Controls below timer */
.app--big-view .controls-container {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
}
```

#### Timer.css
```css
/* Big View: Large responsive font */
.timer--big-view .timer-display {
  font-size: clamp(8rem, 25vmin, 40rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Digit animations */
.timer-digit {
  display: inline-block;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.15s ease-out;
}

@keyframes digit-slide-in {
  from {
    transform: translateY(-20%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.timer-digit:not(.timer-digit-separator) {
  animation: digit-slide-in 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .timer-digit {
    transition-duration: 0.01s;
    animation: none;
  }
}
```

---

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- Timer.test.tsx

# Run with coverage
npm test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 🐛 Common Issues & Fixes

### Issue: Centiseconds not updating
**Fix**: Check `bigViewEnabled` is passed to Timer component and interval is 10ms

### Issue: Animations too fast/slow
**Fix**: Adjust animation duration in Timer.css (recommended: 0.15s)

### Issue: Timer doesn't fill viewport
**Fix**: Verify `min-height: 100vh` on `.app--big-view .timer-container`

### Issue: Settings button missing in Big View
**Fix**: Check conditional rendering in App.tsx controls-container

### Issue: Preference not persisting
**Fix**: Verify `validatePreferences` includes `bigViewEnabled` default

---

## 📊 Acceptance Criteria Checklist

### Functional Requirements
- [ ] FR-001: Big View toggle in settings panel
- [ ] FR-002: Preference persists across sessions
- [ ] FR-003: Header hidden when enabled
- [ ] FR-004: Timer fills viewport at top
- [ ] FR-005: Controls in horizontal row (Settings left-most)
- [ ] FR-006: Session info below controls
- [ ] FR-007: Footer below session info
- [ ] FR-008: All elements scrollable
- [ ] FR-009: Timer functionality works (start/pause/reset/skip)
- [ ] FR-010: Notifications work (sounds, banners)
- [ ] FR-011: Settings accessible via button in control row
- [ ] FR-012: Layout applies immediately (no reload)
- [ ] FR-013: Timer scales dynamically (90-95% viewport)
- [ ] FR-014: Centiseconds display (MM:SS.CS)
- [ ] FR-015: Smooth digit animations

### Success Criteria
- [ ] SC-001: Toggle in <3 seconds
- [ ] SC-002: 100% viewport coverage at top
- [ ] SC-003: 90-95% viewport fill (320px to 4K)
- [ ] SC-004: 100Hz updates (centiseconds)
- [ ] SC-005: Controls within 1 viewport scroll
- [ ] SC-006: Persistence 100% reliable
- [ ] SC-007: Transition <500ms
- [ ] SC-008: Functionality 100% reliable

---

## 🔗 Related Documentation

- [Full Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Findings](./research.md)
- [Data Model](./data-model.md)
- [Contracts](./contracts/)

---

## 💡 Tips

1. **Start small**: Implement preference toggle first, verify persistence before layout changes
2. **Test incrementally**: Test each phase before moving to next
3. **Use browser DevTools**: Inspect animations, check CSS class application
4. **Profile performance**: Use React DevTools Profiler to verify 100Hz updates don't cause jank
5. **Test accessibility**: Use keyboard only, enable screen reader, test reduced motion

---

## 🚀 Deployment Checklist

- [ ] All tests passing (unit + integration)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Manual testing on Chrome, Firefox, Safari, Edge
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Accessibility testing (keyboard nav, screen reader, reduced motion)
- [ ] Performance profiling (no jank at 100Hz updates)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Merge to main branch

**Ready to implement! 🎉**

