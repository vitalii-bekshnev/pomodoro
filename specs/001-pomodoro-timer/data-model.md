# Phase 1: Data Model

**Feature**: Pomodoro Timer  
**Date**: December 18, 2025  
**Language**: TypeScript

---

## Overview

This document defines all TypeScript interfaces, types, and enums for the Pomodoro timer application. The data model is designed for client-side state management with localStorage persistence.

---

## Core Entities

### 1. Timer Session

Represents the current timer state including mode, duration, and countdown progress.

```typescript
// types/timer.ts

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
 * 
 * Tracks current mode, total duration, remaining time, and status.
 * All time values in milliseconds for precision.
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
}

/**
 * Default timer session (idle state, focus mode, 25 minutes)
 */
export const DEFAULT_TIMER_SESSION: TimerSession = {
  mode: 'focus',
  duration: 25 * 60 * 1000, // 25 minutes in milliseconds
  remaining: 25 * 60 * 1000,
  status: 'idle',
  startedAt: null
};
```

**Storage Key**: `pomodoro_timer_state`

**Validation Rules**:
- `duration` must be > 0
- `remaining` must be >= 0 and <= duration
- `startedAt` must be null when status is 'idle', 'paused', or 'completed'
- `startedAt` must be a valid timestamp when status is 'running'

**State Transitions**:
```
idle → running (start button)
running → paused (pause button)
paused → running (resume button)
running → completed (timer reaches 0)
completed → idle (reset or new session)
any state → idle (reset button)
```

---

### 2. Daily Progress

Tracks completed Pomodoros and cycle position for the current day.

```typescript
// types/session.ts

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
  lastUpdated: Date.now()
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
    lastUpdated: Date.now()
  };
};
```

**Storage Key**: `pomodoro_daily_progress`

**Validation Rules**:
- `completedCount` must be >= 0
- `cyclePosition` must be 0-3 (resets to 0 after 4 completions)
- `date` must be valid ISO date string (YYYY-MM-DD format)
- `lastUpdated` must be valid timestamp

**Business Logic**:
- Increment `completedCount` when focus session completes
- Increment `cyclePosition` when focus session completes (mod 4)
- Reset `cyclePosition` to 0 when user skips focus session (FR-020)
- Reset entire object at midnight (compare `date` to current date)
- Long break triggers when `cyclePosition === 0` after completing 4th session

---

### 3. User Preferences

User-customizable settings persisted across browser sessions.

```typescript
// types/settings.ts

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
  soundsEnabled: true
};

/**
 * Validation constraints for duration settings
 */
export const DURATION_CONSTRAINTS = {
  focus: { min: 5, max: 60 },
  shortBreak: { min: 1, max: 15 },
  longBreak: { min: 10, max: 30 }
} as const;

/**
 * Validate user preferences
 * Returns validated preferences (clamped to valid ranges) or null if invalid
 */
export const validatePreferences = (
  prefs: Partial<UserPreferences>
): UserPreferences => {
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
    soundsEnabled: prefs.soundsEnabled ?? DEFAULT_PREFERENCES.soundsEnabled
  };
};

/**
 * Helper: Clamp number between min and max
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
```

**Storage Key**: `pomodoro_preferences`

**Validation Rules**:
- `focusDuration`: 5-60 minutes (FR-013)
- `shortBreakDuration`: 1-15 minutes (FR-014)
- `longBreakDuration`: 10-30 minutes (FR-015)
- Boolean fields must be true/false
- Invalid values clamped to nearest valid value (don't reject, fix)

**Conversion Utilities**:
```typescript
// utils/time.ts

/**
 * Convert minutes to milliseconds for timer operations
 */
export const minutesToMilliseconds = (minutes: number): number => {
  return minutes * 60 * 1000;
};

/**
 * Convert milliseconds to minutes for settings display
 */
export const millisecondsToMinutes = (ms: number): number => {
  return Math.floor(ms / 60000);
};
```

---

## UI State (Transient - Not Persisted)

### Notification Banner State

```typescript
// types/notification.ts

/**
 * In-app notification banner state
 * 
 * Displayed when session completes. Auto-dismisses after 10 seconds
 * or when user clicks action button.
 */
export interface NotificationState {
  /** Whether notification is visible */
  visible: boolean;
  
  /** Session type that just completed */
  completedMode: TimerMode | null;
  
  /** Timestamp when notification appeared (for auto-dismiss) */
  appearedAt: number | null;
}

export const DEFAULT_NOTIFICATION_STATE: NotificationState = {
  visible: false,
  completedMode: null,
  appearedAt: null
};
```

**Not persisted** - Transient UI state only.

---

### Settings Panel State

```typescript
// types/ui.ts

/**
 * Settings panel visibility
 */
export interface SettingsPanelState {
  /** Whether settings panel is open */
  isOpen: boolean;
}

export const DEFAULT_SETTINGS_PANEL_STATE: SettingsPanelState = {
  isOpen: false
};
```

**Not persisted** - Always closed on app load.

---

## Computed Values

These are derived from base state and not stored directly.

### Progress Percentage

```typescript
/**
 * Calculate progress percentage for circular progress ring
 * 
 * @param remaining - Remaining time in milliseconds
 * @param duration - Total duration in milliseconds
 * @returns Percentage complete (0-100)
 */
export const calculateProgress = (remaining: number, duration: number): number => {
  if (duration === 0) return 0;
  const elapsed = duration - remaining;
  return (elapsed / duration) * 100;
};
```

### Formatted Time Display

```typescript
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
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
```

### Next Mode Determination

```typescript
/**
 * Determine next timer mode based on cycle position
 * 
 * @param cyclePosition - Current position in 4-session cycle (0-3)
 * @returns Next mode after focus session completes
 */
export const getNextBreakMode = (cyclePosition: number): TimerMode => {
  // After completing 4th session (position will be 0 after increment)
  return cyclePosition === 0 ? 'long-break' : 'short-break';
};
```

---

## localStorage Schema

All persisted data stored as JSON strings in localStorage.

### Storage Structure

```typescript
// localStorage keys and their TypeScript types

interface LocalStorageSchema {
  'pomodoro_timer_state': TimerSession;
  'pomodoro_daily_progress': DailyProgress;
  'pomodoro_preferences': UserPreferences;
}
```

### Example Stored Data

```json
{
  "pomodoro_timer_state": {
    "mode": "focus",
    "duration": 1500000,
    "remaining": 850000,
    "status": "paused",
    "startedAt": null
  },
  
  "pomodoro_daily_progress": {
    "date": "2025-12-18",
    "completedCount": 3,
    "cyclePosition": 3,
    "lastUpdated": 1734537600000
  },
  
  "pomodoro_preferences": {
    "focusDuration": 25,
    "shortBreakDuration": 5,
    "longBreakDuration": 15,
    "autoStartBreaks": false,
    "autoStartFocus": false,
    "soundsEnabled": true
  }
}
```

---

## Type Guards

Utility functions for runtime type validation.

```typescript
// types/guards.ts

/**
 * Type guard for TimerMode
 */
export const isTimerMode = (value: unknown): value is TimerMode => {
  return typeof value === 'string' && 
    ['focus', 'short-break', 'long-break'].includes(value);
};

/**
 * Type guard for TimerStatus
 */
export const isTimerStatus = (value: unknown): value is TimerStatus => {
  return typeof value === 'string' && 
    ['idle', 'running', 'paused', 'completed'].includes(value);
};

/**
 * Type guard for TimerSession
 */
export const isTimerSession = (value: unknown): value is TimerSession => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    isTimerMode(obj.mode) &&
    typeof obj.duration === 'number' &&
    typeof obj.remaining === 'number' &&
    isTimerStatus(obj.status) &&
    (obj.startedAt === null || typeof obj.startedAt === 'number')
  );
};

/**
 * Type guard for DailyProgress
 */
export const isDailyProgress = (value: unknown): value is DailyProgress => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.date === 'string' &&
    typeof obj.completedCount === 'number' &&
    typeof obj.cyclePosition === 'number' &&
    typeof obj.lastUpdated === 'number' &&
    obj.cyclePosition >= 0 &&
    obj.cyclePosition <= 3
  );
};

/**
 * Type guard for UserPreferences
 */
export const isUserPreferences = (value: unknown): value is UserPreferences => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.focusDuration === 'number' &&
    typeof obj.shortBreakDuration === 'number' &&
    typeof obj.longBreakDuration === 'number' &&
    typeof obj.autoStartBreaks === 'boolean' &&
    typeof obj.autoStartFocus === 'boolean' &&
    typeof obj.soundsEnabled === 'boolean'
  );
};
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      localStorage                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ timer_state  │  │daily_progress│  │ preferences  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         ↓ load                ↓ load              ↓ load
         ↓ save                ↓ save              ↓ save
┌─────────────────────────────────────────────────────────────┐
│                      React State (Hooks)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  useTimer()  │  │useSession    │  │useSettings() │      │
│  │              │  │ Tracking()   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         ↓ props               ↓ props              ↓ props
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Timer     │  │   Session    │  │  Settings    │      │
│  │  Component   │  │   Counter    │  │    Panel     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

**Total Interfaces**: 6 (3 persisted, 3 transient)  
**Storage Keys**: 3  
**Total Storage Size**: <500 bytes (typical session)

All types defined with validation, defaults, and type guards for runtime safety.

**Status**: ✅ Data Model Complete

