/**
 * Custom Hook Contracts
 * 
 * TypeScript interfaces for all custom React hooks.
 * Defines the public API and return types for each hook.
 */

import { TimerMode, TimerStatus } from '../types/timer';
import { UserPreferences } from '../types/settings';

// ============================================================================
// Timer Hook
// ============================================================================

/**
 * Core timer management hook
 * 
 * Handles countdown logic, mode switching, and timer state persistence.
 * Manages setInterval for countdown updates and localStorage sync.
 */
export interface UseTimerReturn {
  /** Current timer mode */
  mode: TimerMode;
  
  /** Remaining time in milliseconds */
  remaining: number;
  
  /** Total duration in milliseconds */
  duration: number;
  
  /** Current status */
  status: TimerStatus;
  
  /** Start timer from current remaining time */
  start: () => void;
  
  /** Pause timer (preserves remaining time) */
  pause: () => void;
  
  /** Resume timer from paused state */
  resume: () => void;
  
  /** Reset timer to initial duration */
  reset: () => void;
  
  /** Skip current session and switch to appropriate next mode */
  skip: () => void;
  
  /** Switch to specific mode (internal use or testing) */
  switchMode: (mode: TimerMode) => void;
}

/**
 * useTimer hook signature
 * 
 * @param preferences - User preferences for durations
 * @param onComplete - Callback when timer reaches 0
 * @returns Timer state and control functions
 */
export type UseTimerHook = (
  preferences: UserPreferences,
  onComplete: (completedMode: TimerMode) => void
) => UseTimerReturn;

// ============================================================================
// Session Tracking Hook
// ============================================================================

/**
 * Daily progress and cycle tracking hook
 * 
 * Tracks completed Pomodoros, manages 4-session cycles, and handles
 * daily reset at midnight. Persists to localStorage.
 */
export interface UseSessionTrackingReturn {
  /** Number of Pomodoros completed today */
  completedCount: number;
  
  /** Current position in 4-session cycle (0-3) */
  cyclePosition: number;
  
  /** Increment count and cycle position (called on focus completion) */
  incrementSession: () => void;
  
  /** Reset cycle to 0 (called on focus skip per FR-020) */
  resetCycle: () => void;
  
  /** Get next break mode based on current cycle position */
  getNextBreakMode: () => TimerMode;
  
  /** Manually reset progress (for testing or user action) */
  resetProgress: () => void;
}

/**
 * useSessionTracking hook signature
 * 
 * @returns Session tracking state and functions
 */
export type UseSessionTrackingHook = () => UseSessionTrackingReturn;

// ============================================================================
// Settings Hook
// ============================================================================

/**
 * User preferences management hook
 * 
 * Manages user settings with validation and localStorage persistence.
 */
export interface UseSettingsReturn {
  /** Current user preferences */
  preferences: UserPreferences;
  
  /** Update preferences (validates and persists) */
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  
  /** Reset preferences to defaults */
  resetPreferences: () => void;
}

/**
 * useSettings hook signature
 * 
 * @returns Settings state and functions
 */
export type UseSettingsHook = () => UseSettingsReturn;

// ============================================================================
// Notifications Hook
// ============================================================================

/**
 * Audio and visual notification hook
 * 
 * Manages notification sounds and banner state. Pre-loads audio files
 * and handles browser autoplay policies.
 */
export interface UseNotificationsReturn {
  /** Whether notification banner is visible */
  bannerVisible: boolean;
  
  /** Mode of completed session (for banner message) */
  completedMode: TimerMode | null;
  
  /** Play focus completion sound */
  playFocusComplete: () => void;
  
  /** Play break completion sound */
  playBreakComplete: () => void;
  
  /** Show notification banner */
  showBanner: (mode: TimerMode) => void;
  
  /** Dismiss notification banner */
  dismissBanner: () => void;
}

/**
 * useNotifications hook signature
 * 
 * @param soundsEnabled - Whether to play audio (from user preferences)
 * @returns Notification state and functions
 */
export type UseNotificationsHook = (
  soundsEnabled: boolean
) => UseNotificationsReturn;

// ============================================================================
// localStorage Hook
// ============================================================================

/**
 * Generic localStorage persistence hook
 * 
 * Provides React state backed by localStorage with JSON serialization.
 * Handles parse errors gracefully.
 */
export interface UseLocalStorageReturn<T> {
  /** Current value */
  value: T;
  
  /** Update value (persists to localStorage) */
  setValue: (newValue: T | ((prevValue: T) => T)) => void;
  
  /** Remove value from localStorage and reset to initial */
  removeValue: () => void;
}

/**
 * useLocalStorage hook signature
 * 
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns State value and setter function
 */
export type UseLocalStorageHook = <T>(
  key: string,
  initialValue: T
) => UseLocalStorageReturn<T>;

// ============================================================================
// Keyboard Shortcuts Hook (Future Enhancement)
// ============================================================================

/**
 * Keyboard shortcut management hook
 * 
 * Optional enhancement for power users.
 * Not in initial MVP but included in contracts for future reference.
 */
export interface UseKeyboardShortcutsReturn {
  /** Register keyboard shortcut */
  registerShortcut: (key: string, callback: () => void) => void;
  
  /** Unregister keyboard shortcut */
  unregisterShortcut: (key: string) => void;
}

/**
 * useKeyboardShortcuts hook signature
 * 
 * @param enabled - Whether shortcuts are active
 * @returns Shortcut registration functions
 */
export type UseKeyboardShortcutsHook = (
  enabled: boolean
) => UseKeyboardShortcutsReturn;

// ============================================================================
// Document Title Hook
// ============================================================================

/**
 * Document title updater hook
 * 
 * Updates browser tab title with current timer state.
 * Shows countdown in tab title when timer is running.
 */
export interface UseDocumentTitleReturn {
  /** Update document title */
  setTitle: (title: string) => void;
  
  /** Reset title to default */
  resetTitle: () => void;
}

/**
 * useDocumentTitle hook signature
 * 
 * @param defaultTitle - Default title when no timer running
 * @returns Title update functions
 */
export type UseDocumentTitleHook = (
  defaultTitle: string
) => UseDocumentTitleReturn;

// ============================================================================
// Interval Hook (Internal Utility)
// ============================================================================

/**
 * setInterval wrapper with React lifecycle
 * 
 * Handles cleanup automatically on unmount.
 * Internal utility hook used by useTimer.
 */
export interface UseIntervalReturn {
  /** Start interval */
  start: (callback: () => void, delay: number) => void;
  
  /** Stop interval */
  stop: () => void;
  
  /** Whether interval is running */
  isRunning: boolean;
}

/**
 * useInterval hook signature
 * 
 * @returns Interval control functions
 */
export type UseIntervalHook = () => UseIntervalReturn;

// ============================================================================
// Window Visibility Hook
// ============================================================================

/**
 * Window visibility detection hook
 * 
 * Detects when user switches tabs or minimizes window.
 * Can be used to pause timer or adjust behavior.
 */
export interface UseWindowVisibilityReturn {
  /** Whether window is currently visible */
  isVisible: boolean;
  
  /** Timestamp of last visibility change */
  lastVisibilityChange: number | null;
}

/**
 * useWindowVisibility hook signature
 * 
 * @returns Visibility state
 */
export type UseWindowVisibilityHook = () => UseWindowVisibilityReturn;

// ============================================================================
// Hook Usage Examples
// ============================================================================

/**
 * Example: Using hooks together in a component
 * 
 * ```typescript
 * const MyComponent = () => {
 *   // Settings
 *   const { preferences, updatePreferences } = useSettings();
 *   
 *   // Session tracking
 *   const {
 *     completedCount,
 *     cyclePosition,
 *     incrementSession,
 *     resetCycle,
 *     getNextBreakMode
 *   } = useSessionTracking();
 *   
 *   // Notifications
 *   const {
 *     bannerVisible,
 *     completedMode,
 *     playFocusComplete,
 *     showBanner,
 *     dismissBanner
 *   } = useNotifications(preferences.soundsEnabled);
 *   
 *   // Timer (with completion callback)
 *   const handleTimerComplete = (mode: TimerMode) => {
 *     if (mode === 'focus') {
 *       incrementSession();
 *       playFocusComplete();
 *     } else {
 *       // Break completed
 *     }
 *     showBanner(mode);
 *   };
 *   
 *   const timer = useTimer(preferences, handleTimerComplete);
 *   
 *   return (
 *     <div>
 *       <Timer {...timer} />
 *       <SessionCounter completedCount={completedCount} />
 *       <NotificationBanner
 *         visible={bannerVisible}
 *         completedMode={completedMode}
 *         onDismiss={dismissBanner}
 *         onStartNext={timer.start}
 *       />
 *     </div>
 *   );
 * };
 * ```
 */

