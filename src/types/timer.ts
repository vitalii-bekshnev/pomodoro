/**
 * Timer type definitions
 */

/**
 * Timer operating modes corresponding to Pomodoro methodology
 */
export type TimerMode = 'focus' | 'short-break' | 'long-break';

/**
 * Timer lifecycle states
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Complete timer session state
 */
export interface TimerSession {
  /** Current timer mode */
  mode: TimerMode;
  
  /** Total session duration in milliseconds */
  duration: number;
  
  /** Remaining time in milliseconds */
  remaining: number;
  
  /** Current status of the timer */
  status: TimerStatus;
  
  /** Timestamp when timer was last started (for drift compensation) */
  startedAt: number | null;
  
  /** Unique identifier for this timer session (for completion tracking) */
  sessionId: string;
}

/**
 * Completion record for tracking processed timer completions
 * Used to prevent duplicate onComplete() calls on page refresh
 */
export interface CompletionRecord {
  /** Session ID that completed */
  sessionId: string;
  
  /** Timestamp when completion was processed (Unix ms) */
  completedAt: number;
  
  /** Mode that completed */
  mode: TimerMode;
}

/**
 * Default timer session (idle state, focus mode, 25 minutes)
 */
export const DEFAULT_TIMER_SESSION: TimerSession = {
  mode: 'focus',
  duration: 25 * 60 * 1000, // 25 minutes in milliseconds
  remaining: 25 * 60 * 1000,
  status: 'idle',
  startedAt: null,
  sessionId: `${Date.now()}-focus`, // Default session ID
};

