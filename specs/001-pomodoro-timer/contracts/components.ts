/**
 * Component Contracts
 * 
 * TypeScript interfaces for all React component props.
 * Defines the public API for each component.
 */

import { TimerMode, TimerStatus } from '../types/timer';
import { UserPreferences } from '../types/settings';

// ============================================================================
// App Component
// ============================================================================

/**
 * Root application component
 * No props - manages all application state internally
 */
export interface AppProps {}

// ============================================================================
// Timer Components
// ============================================================================

/**
 * Main timer component
 * 
 * Displays timer with circular progress ring, countdown, and controls.
 * Handles start/pause/resume/reset/skip actions.
 */
export interface TimerProps {
  /** Current timer mode */
  mode: TimerMode;
  
  /** Remaining time in milliseconds */
  remaining: number;
  
  /** Total duration in milliseconds */
  duration: number;
  
  /** Current status */
  status: TimerStatus;
  
  /** Start timer callback */
  onStart: () => void;
  
  /** Pause timer callback */
  onPause: () => void;
  
  /** Resume timer callback */
  onResume: () => void;
  
  /** Reset timer callback */
  onReset: () => void;
  
  /** Skip current session callback */
  onSkip: () => void;
}

/**
 * Timer display component (MM:SS)
 * 
 * Displays formatted countdown time.
 */
export interface TimerDisplayProps {
  /** Remaining time in milliseconds */
  remaining: number;
  
  /** Current timer mode (for color styling) */
  mode: TimerMode;
}

/**
 * Timer control buttons
 * 
 * Start/Pause/Resume/Reset/Skip buttons with appropriate states.
 */
export interface TimerControlsProps {
  /** Current timer status */
  status: TimerStatus;
  
  /** Current timer mode */
  mode: TimerMode;
  
  /** Start timer callback */
  onStart: () => void;
  
  /** Pause timer callback */
  onPause: () => void;
  
  /** Resume timer callback */
  onResume: () => void;
  
  /** Reset timer callback */
  onReset: () => void;
  
  /** Skip current session callback */
  onSkip: () => void;
}

/**
 * Circular SVG progress ring
 * 
 * Animated progress indicator around timer display.
 */
export interface ProgressRingProps {
  /** Progress percentage (0-100) */
  percent: number;
  
  /** Ring radius in pixels */
  radius: number;
  
  /** Stroke width in pixels */
  stroke: number;
  
  /** Current mode (for color) */
  mode: TimerMode;
  
  /** Optional CSS class */
  className?: string;
}

// ============================================================================
// Session Tracking Components
// ============================================================================

/**
 * Session counter component
 * 
 * Displays "X Pomodoros completed today"
 */
export interface SessionCounterProps {
  /** Number of completed Pomodoros today */
  completedCount: number;
}

/**
 * Cycle indicator component
 * 
 * Visual display of progress through 4-session cycle (🍅🍅⬜⬜)
 */
export interface CycleIndicatorProps {
  /** Current position in cycle (0-3) */
  cyclePosition: number;
  
  /** Total cycle length (always 4) */
  cycleLength?: number;
}

// ============================================================================
// Settings Components
// ============================================================================

/**
 * Settings panel overlay/modal
 * 
 * Contains all user preference controls.
 */
export interface SettingsPanelProps {
  /** Whether panel is visible */
  isOpen: boolean;
  
  /** Current preferences */
  preferences: UserPreferences;
  
  /** Save preferences callback */
  onSave: (preferences: UserPreferences) => void;
  
  /** Close panel callback */
  onClose: () => void;
}

/**
 * Duration slider component
 * 
 * Reusable slider for adjusting time durations.
 */
export interface DurationSliderProps {
  /** Slider label */
  label: string;
  
  /** Current value in minutes */
  value: number;
  
  /** Minimum allowed value in minutes */
  min: number;
  
  /** Maximum allowed value in minutes */
  max: number;
  
  /** Step increment in minutes */
  step?: number;
  
  /** Value change callback */
  onChange: (value: number) => void;
  
  /** Optional unit display (default: "min") */
  unit?: string;
}

/**
 * Toggle switch component
 * 
 * Reusable toggle for boolean settings.
 */
export interface ToggleSwitchProps {
  /** Toggle label */
  label: string;
  
  /** Current state */
  checked: boolean;
  
  /** Change callback */
  onChange: (checked: boolean) => void;
  
  /** Optional description text */
  description?: string;
}

// ============================================================================
// Notification Components
// ============================================================================

/**
 * In-app notification banner
 * 
 * Displays at top of window when session completes.
 */
export interface NotificationBannerProps {
  /** Whether banner is visible */
  visible: boolean;
  
  /** Session type that just completed */
  completedMode: TimerMode | null;
  
  /** Dismiss callback */
  onDismiss: () => void;
  
  /** Start next session callback */
  onStartNext: () => void;
}

// ============================================================================
// Button Components (Reusable)
// ============================================================================

/**
 * Primary action button
 */
export interface ButtonProps {
  /** Button text */
  children: React.ReactNode;
  
  /** Click handler */
  onClick: () => void;
  
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Optional CSS class */
  className?: string;
}

/**
 * Icon button (no text, just icon)
 */
export interface IconButtonProps {
  /** Icon component or element */
  icon: React.ReactNode;
  
  /** Accessible label */
  'aria-label': string;
  
  /** Click handler */
  onClick: () => void;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Optional CSS class */
  className?: string;
}

