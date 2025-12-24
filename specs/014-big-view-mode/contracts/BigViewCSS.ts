/**
 * Big View CSS Contract
 * 
 * CSS class names and layout specifications for Big View mode
 */

/**
 * App-level CSS classes
 */
export const APP_CLASSES = {
  /** Base app container class */
  BASE: 'app',

  /** Big View mode modifier (applied to .app when bigViewEnabled: true) */
  BIG_VIEW: 'app--big-view',

  /** Main content area */
  MAIN: 'app-main',

  /** Header container (hidden in Big View) */
  HEADER: 'app-header',

  /** Footer container (moved below session info in Big View) */
  FOOTER: 'app-footer',
} as const;

/**
 * Layout specifications for Big View mode
 */
export interface BigViewLayout {
  /**
   * Timer container
   * - Fills entire viewport height (100vh)
   * - Centers timer display vertically and horizontally
   * - Timer font scales to 90-95% of viewport
   */
  timerContainer: {
    minHeight: '100vh';
    display: 'flex';
    alignItems: 'center';
    justifyContent: 'center';
  };

  /**
   * Controls container
   * - Appears below timer (requires scroll from top)
   * - Horizontal flexbox layout
   * - Contains: Settings button (left) + Timer controls (Start/Pause, Reset, Skip)
   * - Centered with gap between buttons
   */
  controlsContainer: {
    display: 'flex';
    justifyContent: 'center';
    gap: 'var(--spacing-md)';
    padding: 'var(--spacing-2xl)';
    flexWrap: 'wrap'; // Mobile responsiveness
  };

  /**
   * Session tracking container
   * - Below controls container
   * - Contains: SessionCounter + CycleIndicator
   * - Horizontal layout with gap
   */
  sessionTracking: {
    display: 'flex';
    justifyContent: 'center';
    gap: 'var(--spacing-lg)';
    padding: 'var(--spacing-xl)';
  };

  /**
   * Footer
   * - Below session tracking
   * - Contains: Completion message + GitHub link
   * - Same styling as regular mode
   */
  footer: {
    // No specific Big View overrides, inherits from .app-footer
  };
}

/**
 * Timer font scaling formula
 * 
 * Uses CSS clamp() for responsive scaling:
 * - min: 8rem (128px) - smallest readable size on mobile
 * - preferred: 25vmin - scales with viewport, uses smaller dimension
 * - max: 40rem (640px) - prevents excessive size on large displays
 * 
 * vmin = min(vw, vh) ensures timer fits both width and height
 */
export const TIMER_FONT_SCALE = 'clamp(8rem, 25vmin, 40rem)';

/**
 * Animation specifications
 */
export interface DigitAnimation {
  /** Digit slide-in animation on value change */
  slideIn: {
    duration: '0.15s';
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'; // Material Design ease-in-out
    from: {
      transform: 'translateY(-20%)';
      opacity: 0;
    };
    to: {
      transform: 'translateY(0)';
      opacity: 1;
    };
  };

  /** Respect reduced motion preference */
  prefersReducedMotion: {
    duration: '0.01s'; // Near-instant for accessibility
    transform: 'none';
  };
}

/**
 * Z-index layering
 */
export const Z_INDEX = {
  /** App base layer */
  APP: 0,

  /** Settings panel overlay */
  SETTINGS_PANEL: 1000,

  /** Notification banner */
  NOTIFICATION_BANNER: 900,

  /** Timer (no special z-index in Big View, part of normal flow) */
  TIMER: 'auto',
} as const;

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  /** Mobile: 320px - 640px */
  MOBILE: '640px',

  /** Tablet: 641px - 1024px */
  TABLET: '1024px',

  /** Desktop: 1025px+ */
  DESKTOP: '1025px',
} as const;

/**
 * Example CSS implementation (reference)
 */
export const CSS_EXAMPLE = `
/* Big View mode activated */
.app--big-view .app-header {
  display: none; /* Hide header in Big View */
}

.app--big-view .timer-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app--big-view .timer-display {
  font-size: clamp(8rem, 25vmin, 40rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

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

/* Accessibility: Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .timer-digit {
    transition-duration: 0.01s;
  }

  .timer-digit:not(.timer-digit-separator) {
    animation: none;
  }
}

/* Controls container in Big View */
.app--big-view .controls-container {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  flex-wrap: wrap;
}

/* Session tracking in Big View */
.app--big-view .session-tracking {
  padding: var(--spacing-xl);
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .app--big-view .timer-display {
    font-size: clamp(4rem, 20vmin, 10rem);
  }

  .app--big-view .controls-container {
    flex-direction: column;
    align-items: stretch;
  }
}
`;

/**
 * Accessibility attributes for Big View
 */
export interface A11yAttributes {
  /** ARIA label for Big View mode state */
  bigViewLabel: string; // "Big View mode enabled" or "Big View mode disabled"

  /** Screen reader announcement when toggling */
  toggleAnnouncement: string; // "Switched to Big View mode" or "Switched to regular view"

  /** Timer display format for screen readers */
  timerAriaLabel: (minutes: string, seconds: string, centiseconds?: string) => string;
  // Example: "2 minutes, 30 seconds, 45 centiseconds remaining"
}

