# Contract: useTimer Hook

**Feature**: `006-persist-timer-state`  
**Date**: December 19, 2025  
**Purpose**: Define the interface contract for the enhanced useTimer hook

---

## Hook Interface

### Function Signature

```typescript
function useTimer(
  preferences: UserPreferences,
  onComplete: (completedMode: TimerMode) => void
): UseTimerReturn
```

### Parameters

**`preferences`**: `UserPreferences`
```typescript
interface UserPreferences {
  focusDuration: number;          // Minutes (5-60)
  shortBreakDuration: number;     // Minutes (1-15)
  longBreakDuration: number;      // Minutes (10-30)
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundsEnabled: boolean;
}
```

**`onComplete`**: `(completedMode: TimerMode) => void`
- Callback invoked when timer reaches 0
- Receives the mode that just completed
- Used to trigger notifications and mode transitions

### Return Value

**`UseTimerReturn`**:
```typescript
interface UseTimerReturn {
  // State
  mode: TimerMode;              // Current mode ('focus' | 'short-break' | 'long-break')
  remaining: number;            // Remaining time in milliseconds
  duration: number;             // Total duration in milliseconds
  status: TimerStatus;          // Current status ('idle' | 'running' | 'paused' | 'completed')
  
  // Actions
  start: () => void;            // Start idle timer
  pause: () => void;            // Pause running timer
  resume: () => void;           // Resume paused timer
  reset: () => void;            // Reset to idle with full duration
  skip: () => void;             // Skip to next mode (triggers onComplete)
  switchMode: (mode: TimerMode) => void; // Change mode (resets timer)
}
```

---

## Behavior Contracts

### Initialization (Page Load)

**Contract**: Hook MUST restore saved state from localStorage on mount.

**Behavior**:

1. **If running timer saved**:
   - Calculate elapsed time: `elapsed = Date.now() - startedAt`
   - Calculate remaining: `remaining = savedRemaining - elapsed`
   - If `remaining > 0`: Resume running timer
   - If `remaining <= 0`: Trigger `onComplete(mode)`, transition to idle

2. **If paused timer saved**:
   - Restore exact `remaining` time (no calculation)
   - Display paused state
   - `resume()` available

3. **If idle timer saved**:
   - Restore `mode` and `duration`
   - Display Start button
   - `start()` available

4. **If no saved state or corrupted**:
   - Use `DEFAULT_TIMER_SESSION` (idle, focus, 25 min)

**Example**:
```typescript
// Saved state: running focus, 20 min remaining, started 5 min ago
const { mode, remaining, status } = useTimer(prefs, onComplete);
// Result: mode='focus', remaining≈900000ms (15 min), status='running'
```

---

### start()

**Contract**: Start an idle timer.

**Pre-conditions**:
- `status === 'idle'`

**Post-conditions**:
- `status === 'running'`
- `startedAt === Date.now()`
- `remaining` begins decrementing
- State saved to localStorage

**Behavior**: Does nothing if status is not 'idle'.

---

### pause()

**Contract**: Pause a running timer.

**Pre-conditions**:
- `status === 'running'`

**Post-conditions**:
- `status === 'paused'`
- `startedAt === null`
- `remaining` frozen at current value
- State saved to localStorage

**Behavior**: Does nothing if status is not 'running'.

---

### resume()

**Contract**: Resume a paused timer.

**Pre-conditions**:
- `status === 'paused'`

**Post-conditions**:
- `status === 'running'`
- `startedAt === Date.now()`
- `remaining` continues decrementing from paused value
- State saved to localStorage

**Behavior**: Does nothing if status is not 'paused'.

---

### reset()

**Contract**: Reset timer to idle state with full duration.

**Pre-conditions**: Any status

**Post-conditions**:
- `status === 'idle'`
- `startedAt === null`
- `remaining === duration` (full time)
- State saved to localStorage

---

### skip()

**Contract**: Skip current session and trigger completion.

**Pre-conditions**: Any status

**Post-conditions**:
- Calls `onComplete(mode)`
- Transitions based on parent component logic
- State saved to localStorage

---

### switchMode(mode)

**Contract**: Change timer mode and reset.

**Pre-conditions**: Any status

**Parameters**:
- `mode`: `TimerMode` - New mode to switch to

**Post-conditions**:
- `mode` updated to new mode
- `duration` updated based on preferences for new mode
- `remaining === duration`
- `status === 'idle'`
- `startedAt === null`
- State saved to localStorage

---

## Persistence Contract

### Save Timing

**Contract**: State MUST be saved to localStorage on every state change.

**Trigger Events**:
- `start()` called → Save running state with `startedAt`
- `pause()` called → Save paused state with `startedAt=null`
- `resume()` called → Save running state with new `startedAt`
- `reset()` called → Save idle state
- Countdown tick (every second) → Save updated `remaining`
- `switchMode()` called → Save new idle state

**Storage Key**: `STORAGE_KEYS.TIMER_STATE` (`'pomodoro_timer_state'`)

**Format**: JSON serialization of `TimerSession` object

---

### Restore Contract

**Contract**: On hook initialization, MUST attempt to restore from localStorage.

**Restore Logic**:
```typescript
1. Read from localStorage[STORAGE_KEYS.TIMER_STATE]
2. Parse JSON (handle errors)
3. Validate structure
4. If status === 'running':
   a. Calculate elapsed since startedAt
   b. Adjust remaining time
   c. If remaining <= 0: trigger completion
5. If status === 'paused' || 'idle':
   a. Use exact saved remaining
6. Apply preferences (duration) if changed
7. Return validated TimerSession
```

**Fallback**: If restore fails, use `DEFAULT_TIMER_SESSION`.

---

## Error Handling

### Missing localStorage

**Scenario**: localStorage unavailable (private mode, disabled)

**Behavior**: 
- `getStorageItem` returns default value
- Hook works normally, state doesn't persist
- No error shown to user

### Corrupted State

**Scenario**: Invalid JSON or missing fields in localStorage

**Behavior**:
- `getStorageItem` catches parse error
- Returns `DEFAULT_TIMER_SESSION`
- Hook works normally from default state

### Missing startedAt for Running Timer

**Scenario**: `status='running'` but `startedAt=null`

**Behavior**:
- Treat as paused (safety fallback)
- Use saved `remaining` without calculation
- Continue normally

### Clock Jump (Time Travel)

**Scenario**: System clock changed significantly

**Behavior**:
- Calculate remaining as usual
- Clamp to valid range `[0, duration]`
- If negative: clamp to 0, trigger completion
- If > duration: clamp to duration

---

## Performance Contract

**State Restore**: MUST complete in <100ms

**Timer Resume**: MUST start countdown within 500ms of page load

**localStorage Writes**: Non-blocking (browser async I/O)

**Memory**: No leaks, single interval per hook instance

---

## Testing Contract

### Unit Test Requirements

1. ✅ Restore running timer with elapsed time calculation
2. ✅ Restore paused timer with exact remaining time
3. ✅ Restore idle timer with mode and duration
4. ✅ Handle completed timer (remaining <= 0 after calculation)
5. ✅ Handle missing startedAt for running timer
6. ✅ Handle corrupted localStorage
7. ✅ Verify state saves on all actions

### Integration Test Requirements

1. ✅ Full flow: start → wait → refresh → continues
2. ✅ Full flow: start → pause → refresh → resume works
3. ✅ Full flow: timer completes during refresh → notification
4. ✅ Session tracking persists with timer state

---

**Status**: Contract complete, ready for implementation

