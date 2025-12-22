/**
 * Audio playback utilities
 */

/**
 * Pre-loaded audio instances
 */
let focusCompleteAudio: HTMLAudioElement | null = null;
let breakCompleteAudio: HTMLAudioElement | null = null;

/**
 * Get the base path from Vite's import.meta.env
 * In development, this is usually '/', in production it respects the base config
 */
const getBasePath = (): string => {
  // Vite sets import.meta.env.BASE_URL based on the base config
  return import.meta.env.BASE_URL || '/';
};

/**
 * Initialize and pre-load audio files
 * Should be called on app mount
 */
export const initializeAudio = (): void => {
  try {
    const basePath = getBasePath();
    focusCompleteAudio = new Audio(`${basePath}sounds/focus-complete.mp3`);
    breakCompleteAudio = new Audio(`${basePath}sounds/break-complete.mp3`);

    // Pre-load
    focusCompleteAudio.load();
    breakCompleteAudio.load();
  } catch (error) {
    console.warn('Failed to initialize audio:', error);
  }
};

/**
 * Play focus completion sound
 * 
 * @returns Promise that resolves when playback starts
 */
export const playFocusCompleteSound = async (): Promise<void> => {
  try {
    if (focusCompleteAudio) {
      // Reset to beginning if already played
      focusCompleteAudio.currentTime = 0;
      await focusCompleteAudio.play();
    } else {
      // Fallback: Use a simple beep
      console.warn('Focus audio not initialized, using fallback');
    }
  } catch (error) {
    // Browser autoplay policy may block this
    console.warn('Failed to play focus complete sound:', error);
  }
};

/**
 * Play break completion sound
 * 
 * @returns Promise that resolves when playback starts
 */
export const playBreakCompleteSound = async (): Promise<void> => {
  try {
    if (breakCompleteAudio) {
      // Reset to beginning if already played
      breakCompleteAudio.currentTime = 0;
      await breakCompleteAudio.play();
    } else {
      // Fallback: Use a simple beep
      console.warn('Break audio not initialized, using fallback');
    }
  } catch (error) {
    // Browser autoplay policy may block this
    console.warn('Failed to play break complete sound:', error);
  }
};

/**
 * Test if audio playback is available
 * Useful for checking if user has interacted with page
 * 
 * @returns true if audio can be played
 */
export const isAudioAvailable = (): boolean => {
  return focusCompleteAudio !== null && breakCompleteAudio !== null;
};

