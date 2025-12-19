/**
 * Session tracking type definitions
 */

/**
 * Daily progress tracking
 *
 * Resets at midnight local time. Tracks both total completed
 * Pomodoros for motivation and cycle position (1-4) for long break timing.
 */
export interface DailyProgress {
  /** Date in ISO format (YYYY-MM-DD) for matching */
  date: string;

  /** Number of focus sessions completed today */
  completedCount: number;

  /** Current position in 4-session cycle (0-3) */
  cyclePosition: number;

  /** Timestamp of last update (for debugging) */
  lastUpdated: number;
}

/**
 * Default daily progress (new day)
 */
export const DEFAULT_DAILY_PROGRESS: DailyProgress = {
  date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  completedCount: 0,
  cyclePosition: 0,
  lastUpdated: Date.now(),
};

/**
 * Check if daily progress is from today
 */
export const isDailyProgressCurrent = (progress: DailyProgress): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return progress.date === today;
};

/**
 * Reset daily progress for new day
 */
export const resetDailyProgress = (): DailyProgress => {
  return {
    ...DEFAULT_DAILY_PROGRESS,
    date: new Date().toISOString().split('T')[0],
    lastUpdated: Date.now(),
  };
};

