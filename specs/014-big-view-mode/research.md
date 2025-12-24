# Research: Big View Mode

**Feature**: 014-big-view-mode  
**Date**: December 24, 2025  
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Overview

This document captures research findings for implementing an immersive full-screen timer mode with centiseconds precision and smooth animations.

## Research Areas

### 1. Viewport-Based Font Scaling

**Question**: How to scale timer font to fill 90-95% of viewport across all screen sizes?

**Decision**: Use CSS `clamp()` with viewport units (vw/vh)

**Rationale**:
- `clamp(min, preferred, max)` provides responsive scaling with boundaries
- Viewport units (vw, vh) scale proportionally to viewport dimensions
- Pure CSS solution avoids JavaScript resize listeners
- Browser support excellent (Chrome 79+, Firefox 75+, Safari 13.1+)

**Implementation Pattern**:
```css
.timer--big-view .timer-display {
  font-size: clamp(8rem, 25vmin, 40rem);
  /* vmin = smaller of vw or vh, ensures fit in both dimensions */
}
```

**Alternatives Considered**:
- JavaScript resize listeners + dynamic inline styles: Rejected (performance overhead, layout thrashing)
- Fixed breakpoints (mobile/tablet/desktop): Rejected (not truly responsive, gaps between breakpoints)
- Container queries: Rejected (newer spec, less browser support for timer use case)

**References**:
- MDN: CSS clamp() - https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
- CSS Tricks: Viewport Units - https://css-tricks.com/fun-viewport-units/

---

### 2. Centiseconds Display & 100Hz Updates

**Question**: How to implement centiseconds (10ms precision) without affecting regular mode performance?

**Decision**: Conditional interval timing based on Big View mode

**Rationale**:
- Existing timer uses 100ms interval (10 updates/second)
- Centiseconds require 10ms interval (100 updates/second)
- 100Hz updates only needed in Big View mode
- React state updates at this frequency are performant (proven in game loops, animation libraries)

**Implementation Pattern**:
```typescript
// useTimer.ts
const updateInterval = bigViewEnabled ? 10 : 100; // ms

intervalRef.current = window.setInterval(() => {
  // existing timer logic
  const newRemaining = Math.max(0, duration - totalElapsed);
  
  // Calculate centiseconds (always, but only display in Big View)
  const centiseconds = Math.floor((newRemaining % 1000) / 10);
  
  setSession((prev) => ({
    ...prev,
    remaining: newRemaining,
    centiseconds, // new field
  }));
}, updateInterval);
```

**Performance Validation**:
- 100Hz = 100 state updates/second
- React batches updates within 16ms frame (60fps)
- Modern browsers handle this easily (game engines run at 60-144Hz)
- Only renders changed digits due to React reconciliation

**Alternatives Considered**:
- `requestAnimationFrame` (RAF): Rejected (tied to display refresh rate, not time accuracy)
- Web Animations API: Rejected (CSS animations sufficient for visual effect)
- Always run at 100Hz: Rejected (unnecessary power consumption in regular mode)

**References**:
- React performance with high-frequency updates: https://react.dev/learn/render-and-commit
- JavaScript timer accuracy: https://developer.mozilla.org/en-US/docs/Web/API/setInterval

---

### 3. Smooth Digit Transition Animations

**Question**: How to create smooth "flowing" effect when digits change?

**Decision**: CSS transitions on individual digit components

**Rationale**:
- Split timer display into individual digit components (TimerDigit)
- Apply CSS transform + opacity transitions when digit value changes
- Use React key prop to trigger re-render animations
- GPU-accelerated via `transform` property

**Implementation Pattern**:
```tsx
// TimerDigit.tsx
<span 
  key={`${digit}-${position}`} 
  className="timer-digit"
  data-digit={digit}
>
  {digit}
</span>

// TimerDigit.css
.timer-digit {
  display: inline-block;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.15s ease-out;
}

.timer-digit[data-digit] {
  animation: digit-slide-in 0.15s cubic-bezier(0.4, 0, 0.2, 1);
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
```

**Animation Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design "ease-in-out" curve for natural motion

**Alternatives Considered**:
- FLIP animation technique: Rejected (overkill for single digit changes)
- Spring animations (react-spring): Rejected (adds dependency, CSS sufficient)
- Canvas/WebGL rendering: Rejected (massive complexity for simple digit animation)

**References**:
- CSS transforms performance: https://web.dev/animations-guide/
- React key prop animations: https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key

---

### 4. Big View Layout Strategy

**Question**: How to implement scrollable layout with full-viewport timer at top?

**Decision**: CSS Flexbox with viewport height units

**Rationale**:
- Use `min-height: 100vh` on timer container to fill viewport
- Flexbox column layout for vertical stacking
- `overflow-y: auto` on app container for scrolling
- Conditional CSS class `.app--big-view` toggles layout mode

**Implementation Pattern**:
```css
/* Regular mode (default) */
.app-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-lg);
}

/* Big View mode */
.app--big-view .app-main {
  justify-content: flex-start;
  padding: 0;
}

.app--big-view .timer-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app--big-view .app-header {
  display: none; /* Hide header in Big View */
}

.app--big-view .controls-container {
  padding: var(--spacing-2xl);
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
```

**Alternatives Considered**:
- CSS Grid: Rejected (Flexbox simpler for linear stacking)
- Fixed positioning: Rejected (breaks natural scroll flow)
- Multiple scroll containers: Rejected (confusing UX, accessibility issues)

**References**:
- Flexbox layout patterns: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- Viewport units best practices: https://web.dev/viewport-units/

---

### 5. Settings Button Repositioning

**Question**: How to move Settings button from header to control row?

**Decision**: Conditional rendering based on bigViewEnabled state

**Rationale**:
- Settings button exists in two locations: header (regular mode) and controls (Big View)
- Use same component instance, different parent containers
- React portal not needed - simple conditional JSX

**Implementation Pattern**:
```tsx
// App.tsx
const settingsButton = (
  <button
    className="settings-button"
    onClick={() => setSettingsOpen(true)}
    aria-label="Open settings"
  >
    ⚙️
  </button>
);

return (
  <div className={`app ${bigViewEnabled ? 'app--big-view' : ''}`}>
    <header className="app-header">
      {!bigViewEnabled && settingsButton}
      {/* ... title, logo ... */}
    </header>
    
    <div className="controls-container">
      {bigViewEnabled && settingsButton}
      {/* ... Start/Pause, Reset, Skip buttons ... */}
    </div>
  </div>
);
```

**Alternatives Considered**:
- React Portal: Rejected (unnecessary complexity for simple conditional render)
- Two separate button instances: Rejected (DRY violation, state synchronization issues)
- CSS-only show/hide: Rejected (button still in header DOM, affects tab order)

**References**:
- React conditional rendering: https://react.dev/learn/conditional-rendering

---

## Best Practices Applied

### React Performance
- **Memoization**: Wrap TimerDigit in React.memo() to prevent unnecessary re-renders
- **Debouncing**: Not needed - state updates are already batched by React
- **Virtual DOM**: React efficiently updates only changed digits

### CSS Performance
- **GPU Acceleration**: Use `transform` and `opacity` (not `top`, `left`, `width`, `height`)
- **Will-change hint**: Apply `will-change: transform` to animated elements
- **Reduced motion**: Respect `prefers-reduced-motion` media query for accessibility

### Accessibility
- **Keyboard navigation**: Ensure Settings button in control row is keyboard accessible
- **Screen readers**: Add ARIA labels for Big View state changes
- **Focus management**: Maintain logical tab order when Settings button moves
- **Reduced motion**: Disable animations for users with motion sensitivity

### Browser Compatibility
- **Baseline**: Modern browsers (2021+) supporting clamp(), vmin, CSS Grid/Flexbox
- **Fallbacks**: Not needed - target audience uses modern browsers
- **Testing**: Validate on Chrome, Firefox, Safari, Edge

---

## Integration Points

### Existing Systems
1. **useSettings hook**: Add `bigViewEnabled` to UserPreferences interface
2. **useTimer hook**: Add centiseconds calculation, conditional interval timing
3. **localStorage**: Persist Big View preference alongside other settings
4. **Theme system**: Big View works with both light and dark themes

### Dependencies
- No new npm packages required
- All functionality achievable with React 18.2, TypeScript 5.3, CSS3

---

## Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 100Hz updates drain battery on mobile | Medium | Medium | Conditional timing - only in Big View mode |
| Animations cause motion sickness | Low | Medium | Respect `prefers-reduced-motion`, subtle animations |
| Font scaling breaks on ultra-wide displays | Low | Low | Use `clamp()` max value to cap font size |
| Centiseconds drift from actual time | Low | High | Use wall-clock calculation (existing pattern in useTimer) |

---

## Summary

All technical decisions are based on:
1. **Browser standards**: CSS clamp(), viewport units, CSS transitions
2. **React patterns**: Conditional rendering, memoization, key prop animations
3. **Existing codebase**: Follow useTimer patterns, useSettings patterns
4. **Performance**: GPU-accelerated animations, conditional high-frequency updates
5. **Accessibility**: Keyboard nav, screen readers, reduced motion support

No blockers identified. Ready to proceed to Phase 1 (Design & Contracts).

