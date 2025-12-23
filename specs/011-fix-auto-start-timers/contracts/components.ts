# Component Contracts

**Feature**: Fix Auto-Start Timers
**Date**: 2025-01-22

## Modified Component Interfaces

### App Component (App.tsx)

**Purpose**: Main application component with auto-start logic integration.

**New Behavior**:
- Timer completion handler checks auto-start preferences
- Conditionally suppresses notification banners
- Automatically starts next timer session when enabled

**Interface Changes**: None - internal logic modification only.

### Timer Hook (useTimer.ts)

**Purpose**: Core timer logic and state management.

**Interface**: Unchanged - completion callback signature remains the same.

**New Behavior**:
- Timer completion triggers callback with mode information
- Auto-start logic handled at App component level (separation of concerns)

### Notification Hook (useNotifications.ts)

**Purpose**: Audio and visual notification management.

**Interface**: Unchanged - banner display controlled by App component.

**New Behavior**:
- Banner display conditionally suppressed based on auto-start settings
- Audio notifications continue to play regardless of banner visibility

### Settings Hook (useSettings.ts)

**Purpose**: User preferences management with localStorage persistence.

**Interface**: Unchanged - existing auto-start preference fields used.

**New Behavior**:
- Persists autoStartBreaks and autoStartFocus settings
- Settings changes apply to subsequent timer transitions only

## Data Contracts

### Timer Completion Flow

```typescript
// Timer completes → callback fired
handleTimerComplete: (completedMode: TimerMode) => void

// App checks auto-start preferences
const shouldAutoStart = completedMode === 'focus'
  ? preferences.autoStartBreaks
  : preferences.autoStartFocus

// Conditional behavior
if (shouldAutoStart) {
  // Auto-start next session
  switchMode(nextMode)
  start()
} else {
  // Show notification banner
  showBanner(completedMode)
}
```

### Settings Validation

```typescript
// Auto-start preferences are boolean flags
interface UserPreferences {
  autoStartBreaks: boolean  // Default: false
  autoStartFocus: boolean   // Default: false
}

// Validation: No additional constraints needed
// Values persist across sessions via localStorage
```

## Error Handling

- **Invalid Settings**: Boolean preferences fallback to defaults if corrupted
- **Timer State Corruption**: Existing restoration logic handles invalid timer state
- **Audio Playback Failure**: Logged but non-blocking (existing behavior)
- **Storage Unavailable**: Graceful degradation (existing behavior)
