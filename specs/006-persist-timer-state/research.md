# Research: Timer State Persistence

**Feature**: `006-persist-timer-state`  
**Date**: December 19, 2025  
**Purpose**: Document technical decisions for restoring timer state across page refreshes

---

## 1. Timer State Restore Patterns

### Decision: Wall-Clock-Based Time Calculation

**Chosen Approach**: Calculate elapsed time using wall-clock timestamps (`Date.now()`)

**Rationale**:
- Browser JavaScript timers (`setInterval`, `setTimeout`) do not survive page refreshes
- Must use timestamps to calculate "real" elapsed time
- Existing `TimerSession.startedAt` field is perfect for this
- Simple and accurate: `elapsed = Date.now() - startedAt`

**Implementation**:
```typescript
// On timer restore
if (savedStatus === 'running' && startedAt !== null) {
  const elapsed = Date.now() - startedAt;
  const currentRemaining = Math.max(0, savedRemaining - elapsed);
  
  if (currentRemaining > 0) {
    restoreRunningTimer(currentRemaining);
  } else {
    handleTimerCompletion();
  }
}
```

**Alternatives Considered**:

1. **Service Worker with Background Sync**
   - **Pros**: True background execution, works even when tab closed
   - **Cons**: Complex setup, requires PWA, overkill for this feature
   - **Verdict**: Rejected - too complex for simple timer

2. **Periodic localStorage Updates**
   - **Pros**: Frequent snapshots of remaining time
   - **Cons**: Inaccurate (depends on update frequency), race conditions on refresh
   - **Verdict**: Rejected - less accurate than timestamp approach

3. **Store Completion Timestamp Instead**
   - **Pros**: Alternative calculation method
   - **Cons**: Less intuitive, same math different direction
   - **Verdict**: Rejected - startTimestamp more natural

**Best Practices Applied**:
- Use monotonic time source (Date.now())
- Clamp calculated values to valid range [0, duration]
- Handle edge cases (completed timers, clock changes)

---

## 2. Persistence Timing Strategy

### Decision: Save on Every State Change (Including Running)

**Current Behavior**:
```typescript
// From src/hooks/useTimer.ts (lines 65-69)
useEffect(() => {
  if (session.status === 'paused' || session.status === 'idle') {
    setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
  }
}, [session]);
```

**Problem**: Running timers are NOT saved! Only paused/idle states persist.

**Solution**: Remove status condition:
```typescript
useEffect(() => {
  setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
  // Save ALL states, including running
}, [session]);
```

**Rationale**:
- Running state MUST be saved with `startedAt` timestamp for restore
- localStorage writes are fast (<1ms), minimal performance impact
- Browser handles async persistence automatically
- Ensures crash/force-close scenarios save most recent state

**Performance Analysis**:
- Save frequency: Every state change (~1/second while running)
- localStorage write time: <1ms per operation
- Impact: Negligible (<0.1% CPU usage)
- localStorage quota: 5-10MB (timer state ~200 bytes)

**Alternative Considered**:
- **Debounced saves**: Wait 100-500ms before saving
- **Verdict**: Rejected - adds complexity, minimal benefit, risk of data loss on rapid refresh

---

## 3. Edge Case Handling Strategies

### Decision: Graceful Degradation for All Edge Cases

#### Edge Case 1: Timer Completed During Page Close

**Scenario**: User starts 25-min focus timer, closes browser for 30 minutes, reopens.

**Detection**:
```typescript
const elapsed = Date.now() - startedAt;
const remaining = savedRemaining - elapsed;
if (remaining <= 0) {
  // Timer finished while page was closed
}
```

**Handling**:
1. Set status to 'completed'
2. Call `onComplete(mode)` callback immediately on restore
3. Show completion notification banner
4. Transition to idle state for next mode

**Rationale**: User should see completion notification even if they missed it.

#### Edge Case 2: System Clock Changed

**Scenario**: User changes system clock, enters DST, or timezone shifts.

**Detection**: Elapsed time is unreasonably large or negative.

**Handling**:
```typescript
const elapsed = Date.now() - startedAt;
const calculatedRemaining = savedRemaining - elapsed;

// Clamp to valid range
const remaining = Math.min(
  Math.max(0, calculatedRemaining),
  duration
);
```

**Rationale**: Prevent negative times or values exceeding duration. Timer continues with clamped value.

**Optional**: Log warning if jump >1 hour (debugging aid).

#### Edge Case 3: Missing or Corrupted State

**Scenario**: localStorage cleared, corrupted JSON, or missing fields.

**Handling**: Already implemented in existing code:
```typescript
const saved = getStorageItem<TimerSession>(
  STORAGE_KEYS.TIMER_STATE,
  DEFAULT_TIMER_SESSION  // ← Fallback to default
);
```

**Rationale**: Graceful degradation to idle 25-minute focus timer. No error shown to user.

#### Edge Case 4: Missing `startedAt` for Running Timer

**Scenario**: Corrupted state has `status: 'running'` but `startedAt: null`.

**Handling**:
```typescript
if (saved.status === 'running' && saved.startedAt !== null) {
  // Restore running timer
} else if (saved.status === 'running') {
  // Missing startedAt - treat as paused for safety
  return { ...saved, status: 'paused' };
}
```

**Rationale**: Safety fallback. Preserves remaining time without attempting invalid calculation.

#### Edge Case 5: Multiple Tabs

**Scenario**: User has two tabs open with the same timer app.

**Behavior**: Each tab operates independently with shared localStorage.
- Last write wins (localStorage has no locking)
- Tabs don't synchronize in real-time
- User sees potentially different states per tab

**Handling**: Document as known limitation, mark out of scope.
- **Future enhancement**: Add cross-tab synchronization with BroadcastChannel API
- **Current**: Acceptable - most users use single tab

---

## 4. State Transition Flows

### Flow 1: Restore Running Timer

```
1. Load saved state from localStorage
2. Check: status === 'running' && startedAt !== null
3. Calculate: elapsed = Date.now() - startedAt
4. Calculate: remaining = savedRemaining - elapsed
5. If remaining > 0:
   - setSession({ status: 'running', remaining, ... })
   - Start interval for countdown
6. If remaining <= 0:
   - setSession({ status: 'completed', remaining: 0, ... })
   - Call onComplete(mode)
```

### Flow 2: Restore Paused Timer

```
1. Load saved state from localStorage
2. Check: status === 'paused'
3. Use exact savedRemaining (no calculation)
4. setSession({ status: 'paused', remaining: savedRemaining, ... })
5. Display paused UI with Resume button
```

### Flow 3: Restore Idle Timer

```
1. Load saved state from localStorage
2. Check: status === 'idle'
3. Use savedRemaining or default duration
4. setSession({ status: 'idle', remaining, ... })
5. Display Start button
```

### Flow 4: Corrupted/Missing State

```
1. Attempt to load from localStorage
2. getStorageItem returns DEFAULT_TIMER_SESSION (fallback)
3. setSession(DEFAULT_TIMER_SESSION)
4. Display default idle 25-minute focus timer
```

---

## 5. Data Persistence Format

### localStorage Key

```typescript
STORAGE_KEYS.TIMER_STATE = 'pomodoro_timer_state'
```

### Stored JSON Structure

```json
{
  "mode": "focus",
  "duration": 1500000,
  "remaining": 900000,
  "status": "running",
  "startedAt": 1734615432000
}
```

**Field Descriptions**:
- `mode`: "focus" | "short-break" | "long-break"
- `duration`: Total session length in milliseconds
- `remaining`: Time left when saved (in milliseconds)
- `status`: "idle" | "running" | "paused" | "completed"
- `startedAt`: Unix timestamp (ms) when timer started, or null

**Storage Size**: ~150-200 bytes per save

---

## 6. Browser Compatibility

**Target Browsers**:
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**localStorage Support**: Universal in modern browsers

**Date.now() Accuracy**:
- Resolution: 1ms on most browsers
- Sufficient for timer accuracy (display shows seconds, not milliseconds)

**Known Limitations**:
- Private/Incognito mode: localStorage may not persist across sessions
  - **Handling**: Works within session, resets on browser close (acceptable)
- iOS Safari: localStorage quota is smaller (5MB vs 10MB)
  - **Impact**: None - timer state is ~200 bytes

---

## 7. Testing Strategy

### Time Mocking Approach

**Challenge**: Need to simulate time passing for test verification.

**Solution**: Use Jest fake timers and Date mocking:

```typescript
// Mock Date.now()
jest.spyOn(Date, 'now')
  .mockReturnValueOnce(1000000)  // Start time
  .mockReturnValueOnce(1600000); // 10 minutes later

// Simulate page refresh
const { rerender } = renderHook(() => useTimer(...));

// Verify remaining time accounts for elapsed 10 minutes
expect(result.current.remaining).toBe(900000); // 15 min
```

**Tools**:
- `jest.useFakeTimers()`: Control setInterval
- `jest.spyOn(Date, 'now')`: Mock wall-clock time
- `jest.advanceTimersByTime()`: Simulate time passing

---

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| **Restore Method** | Wall-clock timestamps | Accurate, simple, reliable |
| **Save Timing** | On every state change | No data loss, minimal overhead |
| **Completed Timer** | Call onComplete on restore | User sees notification |
| **Clock Changes** | Clamp to valid range | Prevents negative/invalid times |
| **Corrupted State** | Fallback to default | Graceful degradation |
| **Missing startedAt** | Treat as paused | Safety fallback |
| **Multi-Tab** | Independent operation | Simple, no sync complexity |

**Status**: All research complete, ready for implementation

