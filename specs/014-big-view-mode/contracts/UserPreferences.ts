/**
 * UserPreferences Contract
 * 
 * Extended type definition for user preferences including Big View mode
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

  /** 
   * Enable immersive Big View mode
   * 
   * When enabled:
   * - Timer fills 90-95% of viewport with large font
   * - Timer displays centiseconds (MM:SS.CS format)
   * - Header is hidden
   * - Controls arranged in horizontal row below timer (accessible via scroll)
   * - Session info and footer below controls (accessible via scroll)
   * - Settings button moved to control row (left-most position)
   * - Smooth digit transition animations
   */
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
  bigViewEnabled: false, // Defaults to disabled for non-intrusive first experience
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
 * 
 * @param prefs - Partial preferences object (e.g., from localStorage)
 * @returns Validated preferences with defaults for missing fields
 * 
 * @example
 * // Backward compatibility - existing user without bigViewEnabled
 * const saved = { focusDuration: 30, soundsEnabled: false };
 * const validated = validatePreferences(saved);
 * // validated.bigViewEnabled === false (from DEFAULT_PREFERENCES)
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
    autoStartBreaks: prefs.autoStartBreaks ?? DEFAULT_PREFERENCES.autoStartBreaks,
    autoStartFocus: prefs.autoStartFocus ?? DEFAULT_PREFERENCES.autoStartFocus,
    soundsEnabled: prefs.soundsEnabled ?? DEFAULT_PREFERENCES.soundsEnabled,
    bigViewEnabled: prefs.bigViewEnabled ?? DEFAULT_PREFERENCES.bigViewEnabled,
  };
};

