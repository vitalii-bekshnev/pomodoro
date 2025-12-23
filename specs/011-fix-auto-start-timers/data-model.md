# Data Model

**Feature**: Fix Auto-Start Timers
**Date**: 2025-01-22

## Existing Data Structures

This feature leverages existing data models without introducing new entities or relationships.

### UserPreferences (settings.ts)

```typescript
interface UserPreferences {
  focusDuration: number;        // Focus session duration in minutes
  shortBreakDuration: number;   // Short break duration in minutes
  longBreakDuration: number;    // Long break duration in minutes
  autoStartBreaks: boolean;     // NEW: Auto-start break after focus completion
  autoStartFocus: boolean;      // NEW: Auto-start focus after break completion
  soundsEnabled: boolean;       // Enable audio notifications
}
```

**Usage**: Auto-start settings control timer transition behavior in App.tsx timer completion handler.

### TimerSession (timer.ts)

```typescript
interface TimerSession {
  mode: TimerMode;              // 'focus' | 'short-break' | 'long-break'
  duration: number;             // Total duration in milliseconds
  remaining: number;            // Remaining time in milliseconds
  status: TimerStatus;          // 'idle' | 'running' | 'paused' | 'completed'
  startedAt: number | null;     // Timestamp when timer started
  sessionId: string;            // Unique session identifier
}
```

**Usage**: Timer state persists to localStorage and restores on app restart with auto-start settings preserved.

## Data Flow

1. **Settings Persistence**: UserPreferences stored in localStorage via useLocalStorage hook
2. **Timer State**: TimerSession persisted on every state change for restart recovery
3. **Auto-Start Logic**: Reads autoStartBreaks/autoStartFocus from preferences on timer completion
4. **State Transitions**: Automatic mode switching (focus→break, break→focus) with optional auto-start

## Validation Rules

- Auto-start settings are boolean flags with no additional validation required
- Timer state restoration includes sessionId validation to prevent duplicate completion processing
- Duration values validated via existing DURATION_CONSTRAINTS

## Storage Strategy

- **localStorage**: Used for both preferences and timer state persistence
- **Key Strategy**: `STORAGE_KEYS.PREFERENCES` for settings, `STORAGE_KEYS.TIMER_STATE` for current session
- **Backup**: Completion records prevent duplicate processing on refresh/restart
