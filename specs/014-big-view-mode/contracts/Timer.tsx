/**
 * Timer Component Contract
 * 
 * Updated interface for Timer component with Big View mode support
 */

import { TimerMode, TimerStatus } from '../../../src/types/timer';

/**
 * Timer component props
 */
export interface TimerProps {
  /** Current timer mode (focus, short-break, long-break) */
  mode: TimerMode;

  /** Remaining time in milliseconds */
  remaining: number;

  /** Total duration in milliseconds */
  duration: number;

  /** Timer status (idle, running, paused, completed) */
  status: TimerStatus;

  /** Start/resume timer callback */
  start: () => void;

  /** Pause running timer callback */
  pause: () => void;

  /** Resume paused timer callback */
  resume: () => void;

  /** Reset timer to initial duration callback */
  reset: () => void;

  /** Skip current session callback */
  skip: () => void;

  /** Switch to different mode callback */
  switchMode: (mode: TimerMode, autoStart?: boolean) => void;

  /**
   * Big View mode enabled flag (from preferences)
   * 
   * When true:
   * - Display timer in MM:SS.CS format (with centiseconds)
   * - Apply .timer--big-view CSS class for large font scaling
   * - Enable digit transition animations
   * - Request higher update frequency (10ms vs 100ms)
   */
  bigViewEnabled?: boolean;
}

/**
 * Time display format utilities
 */
export interface TimeFormat {
  minutes: string;
  seconds: string;
  centiseconds?: string; // Only populated in Big View mode
}

/**
 * Format milliseconds to time display
 * 
 * @param ms - Time in milliseconds
 * @param includeCentiseconds - Whether to include centiseconds component
 * @returns Formatted time object
 * 
 * @example
 * formatTime(125450, false); // { minutes: '02', seconds: '05' }
 * formatTime(125450, true);  // { minutes: '02', seconds: '05', centiseconds: '45' }
 */
export function formatTime(ms: number, includeCentiseconds: boolean = false): TimeFormat {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const result: TimeFormat = {
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };

  if (includeCentiseconds) {
    const centiseconds = Math.floor((ms % 1000) / 10);
    result.centiseconds = centiseconds.toString().padStart(2, '0');
  }

  return result;
}

/**
 * TimerDigit component props (new component for animations)
 */
export interface TimerDigitProps {
  /** The digit to display (0-9) */
  digit: string;

  /** Position identifier for animation key */
  position: string;

  /** Whether this is a separator (colon or period) */
  isSeparator?: boolean;
}

/**
 * Timer update frequency based on mode
 */
export const TIMER_UPDATE_INTERVAL = {
  REGULAR: 100, // 100ms = 10 Hz (existing behavior)
  BIG_VIEW: 10, // 10ms = 100 Hz (centiseconds precision)
} as const;

/**
 * CSS class names for timer modes
 */
export const TIMER_CLASSES = {
  BASE: 'timer',
  BIG_VIEW: 'timer--big-view',
  DIGIT: 'timer-digit',
  DIGIT_SEPARATOR: 'timer-digit-separator',
  DISPLAY: 'timer-display',
  CONTROLS: 'timer-controls',
} as const;

/**
 * Component hierarchy in Big View mode
 * 
 * Timer (container)
 *   ├── TimerDisplay
 *   │     ├── TimerDigit (minutes[0])
 *   │     ├── TimerDigit (minutes[1])
 *   │     ├── TimerDigit (':' separator)
 *   │     ├── TimerDigit (seconds[0])
 *   │     ├── TimerDigit (seconds[1])
 *   │     ├── TimerDigit ('.' separator)  ← only in Big View
 *   │     ├── TimerDigit (centiseconds[0]) ← only in Big View
 *   │     └── TimerDigit (centiseconds[1]) ← only in Big View
 *   └── TimerControls
 *         ├── Button (Start/Pause)
 *         ├── Button (Reset)
 *         └── Button (Skip)
 */

