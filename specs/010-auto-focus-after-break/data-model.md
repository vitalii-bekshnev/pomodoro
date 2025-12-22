# Data Model: Auto Focus After Break

**Date**: December 22, 2025
**Feature**: Auto Focus After Break
**Status**: Complete

## Summary

No new data models required. This feature modifies existing timer state transition logic without introducing new entities, relationships, or data structures.

## Existing Data Models

### Timer Session (Unchanged)

**Source**: `src/types/timer.ts`

```typescript
export interface TimerSession {
  mode: TimerMode;           // 'focus' | 'short-break' | 'long-break'
  duration: number;          // Total duration in milliseconds
  remaining: number;         // Remaining time in milliseconds
  status: TimerStatus;       // 'idle' | 'running' | 'paused' | 'completed'
  startedAt: number | null;  // Timestamp when timer started
  sessionId: string;         // Unique identifier for session tracking
}
```

**Usage**: Timer state is persisted to localStorage and restored on app launch. No changes needed.

### User Preferences (Unchanged)

**Source**: `src/types/settings.ts`

```typescript
export interface UserPreferences {
  focusDuration: number;      // Focus session length (minutes)
  shortBreakDuration: number; // Short break length (minutes)
  longBreakDuration: number;  // Long break length (minutes)
  autoStartBreaks: boolean;   // Auto-start breaks after focus
  autoStartFocus: boolean;    // Auto-start focus after breaks
  soundsEnabled: boolean;     // Enable/disable notification sounds
}
```

**Usage**: Settings are stored in localStorage. Note: `autoStartFocus` setting exists but is not currently used in auto-transition logic.

## State Transitions

### Current Flow (Before Fix)

```
Focus Running → Focus Completed (00:00) → Auto-switch to Break (05:00/15:00) → [User must manually start break]
Break Running → Break Completed (00:00) → Stay in Break Completed (00:00) ❌
                                              [User must Reset + Skip Break]
```

### Fixed Flow (After Implementation)

```
Focus Running → Focus Completed (00:00) → Auto-switch to Break (05:00/15:00) → [User must manually start break]
Break Running → Break Completed (00:00) → Auto-switch to Focus (25:00) ✅
                                              [Timer ready for user to start focus]
```

## Validation Rules

**No new validation rules required**. Existing timer logic handles:
- Duration bounds checking
- Status transition validation
- Session ID generation
- Completion tracking

## Storage Considerations

**No changes to storage strategy**. Feature leverages existing:
- localStorage for timer state persistence
- localStorage for user preferences
- Session completion tracking for duplicate prevention

## Conclusion

This feature is purely behavioral - modifying when `timer.switchMode()` is called without changing the underlying data structures or validation logic.
