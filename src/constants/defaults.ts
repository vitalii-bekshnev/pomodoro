/**
 * Default constants for the Pomodoro timer
 */

import { DURATION_CONSTRAINTS } from '../types/settings';

/**
 * Default timer durations in minutes
 */
export const DEFAULT_DURATIONS = {
  FOCUS: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
} as const;

/**
 * Timer duration constraints (min/max ranges)
 */
export const TIMER_CONSTRAINTS = DURATION_CONSTRAINTS;

/**
 * Number of focus sessions before long break
 */
export const SESSIONS_BEFORE_LONG_BREAK = 4;

/**
 * Notification banner auto-dismiss duration in milliseconds
 */
export const NOTIFICATION_AUTO_DISMISS_MS = 10000; // 10 seconds

/**
 * Timer update interval in milliseconds
 */
export const TIMER_UPDATE_INTERVAL_MS = 100; // Update every 100ms for smooth display

/**
 * localStorage keys (re-exported from storage utils)
 */
export { STORAGE_KEYS } from '../utils/storage';

