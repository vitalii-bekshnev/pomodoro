# Data Model: Big View Mode

**Feature**: 014-big-view-mode  
**Date**: December 24, 2025  
**Purpose**: Define data structures and state management for Big View functionality

## Overview

Big View mode introduces minimal data model changes, primarily a single boolean preference and an optional centiseconds field for enhanced timer precision.

---

## Entities

### 1. UserPreferences (Modified)

**Location**: `src/types/settings.ts`

**Description**: User preference settings extended with Big View toggle

**Attributes**:

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| focusDuration | number | Yes | 25 | 5-60 | Focus session duration in minutes |
| shortBreakDuration | number | Yes | 5 | 1-15 | Short break duration in minutes |
| longBreakDuration | number | Yes | 15 | 10-30 | Long break duration in minutes |
| autoStartBreaks | boolean | Yes | false | - | Auto-start break after focus |
| autoStartFocus | boolean | Yes | false | Auto-start focus after break |
| soundsEnabled | boolean | Yes | true | - | Play completion sounds |
| **bigViewEnabled** | **boolean** | **Yes** | **false** | **-** | **Enable immersive Big View mode** |

**Relationships**: None (flat preference object)

**Persistence**: localStorage key `pomodoro-preferences`

**Lifecycle**: 
- Created: On first app load with DEFAULT_PREFERENCES
- Updated: Via SettingsPanel save action
- Read: On every app render via useSettings hook

**TypeScript Definition**:
```typescript
export interface UserPreferences {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundsEnabled: boolean;
  bigViewEnabled: boolean; // NEW
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundsEnabled: true,
  bigViewEnabled: false, // NEW - defaults to disabled
};
```

**Validation Rules**:
- `bigViewEnabled` must be boolean (TypeScript enforced)
- No cross-field validation needed (independent preference)

---

### 2. TimerSession (Modified - Optional Enhancement)

**Location**: `src/types/timer.ts`

**Description**: Timer session state with optional centiseconds tracking

**Attributes**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| mode | TimerMode | Yes | 'focus' | Current mode (focus/short-break/long-break) |
| duration | number | Yes | - | Total duration in milliseconds |
| remaining | number | Yes | - | Remaining time in milliseconds |
| status | TimerStatus | Yes | 'idle' | Timer status (idle/running/paused/completed) |
| startedAt | number \| null | Yes | null | Timestamp when timer started |
| sessionId | string | Yes | - | Unique session identifier |
| **centiseconds** | **number** | **No** | **0** | **Centiseconds component (0-99)** |

**Note**: The `centiseconds` field is optional and can be calculated on-the-fly from `remaining` rather than stored in state. This keeps the data model minimal.

**Calculation Pattern**:
```typescript
// In render/display logic (not stored in state)
const centiseconds = Math.floor((remaining % 1000) / 10);
```

**Decision**: Do NOT add `centiseconds` to TimerSession state. Calculate dynamically in Timer component for Big View display. This avoids state bloat and maintains existing timer logic.

---

## State Management

### Component-Level State

#### App Component
```typescript
interface AppState {
  settingsOpen: boolean;
  // bigViewEnabled comes from preferences (useSettings hook)
}
```

#### Timer Component
```typescript
interface TimerState {
  // No local state - all timer state from useTimer hook
  // Centiseconds calculated from props.remaining
}
```

### Global State (localStorage)

**Key**: `pomodoro-preferences`

**Structure**:
```json
{
  "focusDuration": 25,
  "shortBreakDuration": 5,
  "longBreakDuration": 15,
  "autoStartBreaks": false,
  "autoStartFocus": false,
  "soundsEnabled": true,
  "bigViewEnabled": false
}
```

**Migration**: Existing preferences without `bigViewEnabled` will use default value `false` (backward compatible)

---

## Data Flow

### 1. Big View Toggle Flow

```
User clicks toggle in SettingsPanel
  ↓
SettingsPanel.onSave(newPreferences)
  ↓
useSettings.updatePreferences(newPreferences)
  ↓
localStorage.setItem('pomodoro-preferences', JSON.stringify(newPreferences))
  ↓
App re-renders with preferences.bigViewEnabled = true
  ↓
App applies className 'app--big-view'
  ↓
CSS layout changes applied (full-screen timer, hidden header, etc.)
```

### 2. Centiseconds Display Flow

```
Timer running in Big View mode
  ↓
useTimer interval fires every 10ms (vs 100ms in regular mode)
  ↓
session.remaining updated
  ↓
Timer component re-renders
  ↓
Calculate: centiseconds = Math.floor((remaining % 1000) / 10)
  ↓
Display: MM:SS.CS format
  ↓
TimerDigit components animate on value change
```

### 3. Settings Button Position Flow

```
App renders with preferences.bigViewEnabled
  ↓
Conditional JSX determines button placement
  ↓
if (bigViewEnabled):
  settingsButton rendered in controls-container
else:
  settingsButton rendered in app-header
  ↓
Button click opens SettingsPanel (same logic regardless of position)
```

---

## Validation Rules

### Runtime Validation

```typescript
// src/types/settings.ts
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
    soundsEnabled: prefs.soundsEnabled ?? DEFAULT_PREFERENCES.soundsEnabled,
    bigViewEnabled: prefs.bigViewEnabled ?? DEFAULT_PREFERENCES.bigViewEnabled, // NEW
  };
};
```

### Constraints

- `bigViewEnabled`: Must be boolean (TypeScript enforced at compile time)
- No business logic constraints (pure UI preference)
- No cross-field dependencies with other preferences

---

## Migration Strategy

### Backward Compatibility

**Scenario**: Existing user has saved preferences without `bigViewEnabled` field

**Handling**:
```typescript
// src/hooks/useSettings.ts (existing pattern)
const [preferences, setPreferences] = useState<UserPreferences>(() => {
  const saved = getStorageItem<Partial<UserPreferences>>(
    STORAGE_KEYS.PREFERENCES,
    {}
  );
  
  return validatePreferences(saved); // validatePreferences adds default bigViewEnabled: false
});
```

**Result**: No migration script needed. `validatePreferences` function provides default value for missing field.

---

## Performance Considerations

### State Update Frequency

| Scenario | Update Frequency | Impact | Mitigation |
|----------|------------------|--------|------------|
| Regular mode | 10 Hz (100ms) | Low | Existing behavior |
| Big View mode | 100 Hz (10ms) | Medium | Conditional interval timing |
| Settings toggle | <1 Hz (user action) | Negligible | One-time state update |

### Memory Footprint

- `bigViewEnabled`: 1 boolean = 4 bytes in memory, negligible
- No additional timer state stored (centiseconds calculated on-the-fly)
- Total memory impact: <100 bytes

### Rendering Performance

- Big View toggle triggers full App re-render (acceptable, user-initiated action)
- Timer updates in Big View trigger only Timer component re-renders (React reconciliation)
- TimerDigit components memoized to prevent unnecessary re-renders

---

## Testing Considerations

### Unit Test Cases

1. **UserPreferences validation**:
   - Default value for missing `bigViewEnabled` field
   - Boolean coercion (truthy/falsy values)

2. **Centiseconds calculation**:
   - `remaining = 25000ms` → centiseconds = 0
   - `remaining = 25456ms` → centiseconds = 45
   - `remaining = 999ms` → centiseconds = 99
   - `remaining = 0ms` → centiseconds = 0

3. **localStorage persistence**:
   - Save preferences with `bigViewEnabled: true`
   - Reload → verify `bigViewEnabled: true` restored

### Integration Test Cases

1. **Big View toggle flow**: Enable in settings → verify App className updated
2. **Settings button position**: Big View on → button in controls, Big View off → button in header
3. **Timer precision**: Big View on → updates 10x per second, Big View off → updates 1x per 100ms

---

## Summary

**Data Model Changes**:
- ✅ Add `bigViewEnabled: boolean` to `UserPreferences` (1 new field)
- ✅ Calculate centiseconds dynamically (no state changes)
- ✅ Backward compatible (existing users default to `false`)

**State Management Pattern**:
- ✅ Follows existing useSettings hook pattern
- ✅ Persisted in localStorage
- ✅ No new hooks or context providers needed

**Performance Impact**:
- ✅ Minimal memory overhead (<100 bytes)
- ✅ Conditional high-frequency updates (only in Big View mode)
- ✅ React efficiently handles 100Hz updates

Ready to proceed to contracts definition.

