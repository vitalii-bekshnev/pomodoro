/**
 * Time formatting and conversion utilities
 */

/**
 * Format milliseconds as MM:SS for display
 *
 * @param milliseconds - Time in milliseconds
 * @returns Formatted string (e.g., "24:35", "00:00")
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

/**
 * Convert minutes to milliseconds for timer operations
 *
 * @param minutes - Duration in minutes
 * @returns Duration in milliseconds
 */
export const minutesToMilliseconds = (minutes: number): number => {
  return minutes * 60 * 1000;
};

/**
 * Convert milliseconds to minutes for settings display
 *
 * @param ms - Duration in milliseconds
 * @returns Duration in minutes (rounded down)
 */
export const millisecondsToMinutes = (ms: number): number => {
  return Math.floor(ms / 60000);
};

/**
 * Calculate progress percentage for circular progress ring
 *
 * @param remaining - Remaining time in milliseconds
 * @param duration - Total duration in milliseconds
 * @returns Percentage complete (0-100)
 */
export const calculateProgress = (
  remaining: number,
  duration: number
): number => {
  if (duration === 0) return 0;
  const elapsed = duration - remaining;
  return (elapsed / duration) * 100;
};

