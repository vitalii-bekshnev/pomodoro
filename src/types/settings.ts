/**
 * User preferences type definitions
 */

/**
 * User preference settings
 *
 * All durations stored in minutes (not milliseconds) for user-friendliness
 * in settings UI. Converted to milliseconds for timer operations.
 */
export interface UserPreferences {
  /** Focus session duration in minutes (5-60) */
  focusDuration: number;

  /** Short break duration in minutes (1-15) */
  shortBreakDuration: number;

  /** Long break duration in minutes (10-30) */
  longBreakDuration: number;

  /** Auto-start break timer when focus completes */
  autoStartBreaks: boolean;

  /** Auto-start focus timer when break completes */
  autoStartFocus: boolean;

  /** Enable notification sounds (visual banner always shows) */
  soundsEnabled: boolean;

  /** Enable immersive Big View mode with full-screen timer */
  bigViewEnabled: boolean;
}

/**
 * Default user preferences (Pomodoro standard: 25-5-15)
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundsEnabled: true,
  bigViewEnabled: false,
};

/**
 * Validation constraints for duration settings
 */
export const DURATION_CONSTRAINTS = {
  focus: { min: 5, max: 60 },
  shortBreak: { min: 1, max: 15 },
  longBreak: { min: 10, max: 30 },
} as const;

/**
 * Validate and clamp user preferences to valid ranges
 */
export const validatePreferences = (
  prefs: Partial<UserPreferences>
): UserPreferences => {
  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  return {
    focusDuration: clamp(
      prefs.focusDuration ?? DEFAULT_PREFERENCES.focusDuration,
      DURATION_CONSTRAINTS.focus.min,
      DURATION_CONSTRAINTS.focus.max
    ),
    shortBreakDuration: clamp(
      prefs.shortBreakDuration ?? DEFAULT_PREFERENCES.shortBreakDuration,
      DURATION_CONSTRAINTS.shortBreak.min,
      DURATION_CONSTRAINTS.shortBreak.max
    ),
    longBreakDuration: clamp(
      prefs.longBreakDuration ?? DEFAULT_PREFERENCES.longBreakDuration,
      DURATION_CONSTRAINTS.longBreak.min,
      DURATION_CONSTRAINTS.longBreak.max
    ),
    autoStartBreaks:
      prefs.autoStartBreaks ?? DEFAULT_PREFERENCES.autoStartBreaks,
    autoStartFocus:
      prefs.autoStartFocus ?? DEFAULT_PREFERENCES.autoStartFocus,
    soundsEnabled: prefs.soundsEnabled ?? DEFAULT_PREFERENCES.soundsEnabled,
    bigViewEnabled: prefs.bigViewEnabled ?? DEFAULT_PREFERENCES.bigViewEnabled,
  };
};

