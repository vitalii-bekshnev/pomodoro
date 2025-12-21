# Contract: useTimer Hook (Bug Fixes)

**Feature**: `007-fix-timer-state-bugs`  
**Date**: December 19, 2025  
**Purpose**: Define updated interface for useTimer hook with bug fixes

---

## Hook Interface (Updated)

### Function Signature

```typescript
function useTimer(
  preferences: UserPreferences,
  onComplete: (completedMode: TimerMode) => void
): UseTimerReturn
```

**No changes to parameters**

### Return Value (Enhanced)

```typescript
export interface UseTimerReturn {
  // Existing fields
  mode: TimerMode;
  remaining: number;
  duration: number;
  status: TimerStatus;
  
  // NEW: Session ID for debugging/tracking
  sessionId: string;
  
  // Existing actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (mode: TimerMode) => void;
  
  // NEW: Skip break and start focus immediately
  skipBreakAndStartFocus: () => void;
}
```

**New Fields**:
- `sessionId`: Unique identifier for current timer session (format: `"timestamp-mode"`)

**New Actions**:
- `skipBreakAndStartFocus()`: Skip break and immediately start new focus session (Bug 4 fix)

---

## Behavior Contracts (Updated)

### Initialization (Page Load) - Bug 1 Fix

**Contract**: Hook MUST restore timer with accurate remaining time (±1 second max)

**Behavior Change**:

**OLD (BUGGY)**:
```typescript
const elapsedTime = Date.now() - saved.startedAt;
const calculatedRemaining = saved.remaining - elapsedTime;
// Bug: Uses remaining (already decremented) as baseline
```

**NEW (FIXED)**:
```typescript
const elapsedFromStart = Date.now() - saved.startedAt;
const calculatedRemaining = saved.duration - elapsedFromStart;
// Fix: Uses duration (constant) as baseline
```

**Testing**:
- Timer at 24:35 → refresh → shows 24:35 (±1s), not 24:37
- Multiple refreshes don't cause cumulative errors

---

### onComplete Callback - Bug 2 Fix

**Contract**: onComplete MUST only be called once per timer completion, even across multiple refreshes

**Behavior Change**:

**OLD (BUGGY)**:
```typescript
useEffect(() => {
  if (session.status === 'completed' && session.remaining === 0) {
    onComplete(session.mode);
  }
}, []); // Called on EVERY mount
// Bug: No duplicate detection
```

**NEW (FIXED)**:
```typescript
useEffect(() => {
  if (session.status === 'completed' && session.remaining === 0) {
    const lastCompletion = getStorageItem<CompletionRecord>(...);
    const isAlreadyProcessed = 
      lastCompletion && lastCompletion.sessionId === session.sessionId;
    
    if (!isAlreadyProcessed) {
      onComplete(session.mode);
      setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
        sessionId: session.sessionId,
        completedAt: Date.now(),
        mode: session.mode
      });
    }
  }
}, []);
// Fix: Tracks completion by sessionId, prevents duplicates
```

**Testing**:
- Complete timer (count = 1)
- Refresh 5 times
- Verify count still = 1 (onComplete not called on refreshes)

---

### start() - Enhanced with Session ID

**Contract**: Unchanged behavior, now generates unique sessionId

**Enhancement**:
```typescript
const start = useCallback(() => {
  // ... existing checks
  
  const sessionId = `${Date.now()}-${prev.mode}`;
  setSession((prev) => ({
    ...prev,
    status: 'running',
    startedAt: Date.now(),
    sessionId,  // NEW: Unique ID generated
  }));
  
  // ... rest of function
}, []);
```

**sessionId Format**: `"{timestamp}-{mode}"` e.g. `"1703012345678-focus"`

---

### skipBreakAndStartFocus() - New Function (Bug 4 Fix)

**Contract**: Skip break and immediately start new focus session

**Pre-conditions**:
- `status === 'completed'`
- `mode === 'focus'` (completed focus session)

**Post-conditions**:
- New focus timer created (idle state)
- Timer automatically started (running state)
- New sessionId generated
- Break skipped (no break timer shown)

**Behavior**:
```typescript
const skipBreakAndStartFocus = useCallback(() => {
  // Guard: only works after focus completion
  if (session.status !== 'completed' || session.mode !== 'focus') return;
  
  // Create new focus session
  const duration = getDurationForMode('focus', preferences);
  setSession({
    mode: 'focus',
    duration,
    remaining: duration,
    status: 'idle',
    startedAt: null,
    sessionId: `${Date.now()}-focus`,
  });
  
  // Auto-start
  setTimeout(() => start(), 0);
}, [session, preferences, start]);
```

**Testing**:
- Complete focus → click "Skip Break" → new focus starts
- Verify count incremented (break skip counts as cycle completion)

---

## Error Handling

### Missing sessionId

**Scenario**: Old localStorage state doesn't have sessionId

**Behavior**:
```typescript
// On restore
if (!saved.sessionId) {
  saved.sessionId = `${Date.now()}-${saved.mode}-migrated`;
}
```

**Result**: Graceful migration, no errors

### Invalid Completion Record

**Scenario**: Corrupted last_completion in localStorage

**Behavior**:
```typescript
const lastCompletion = getStorageItem<CompletionRecord>(
  STORAGE_KEYS.LAST_COMPLETION,
  null  // Default to null if invalid
);

// null is handled gracefully
const isAlreadyProcessed = 
  lastCompletion && lastCompletion.sessionId === session.sessionId;
// If lastCompletion is null, isAlreadyProcessed is false
// onComplete will fire (safe default)
```

**Result**: Worst case = onComplete fires once, then tracking starts working

---

## Backwards Compatibility

**Old TimerSession** (no sessionId):
```json
{
  "mode": "focus",
  "duration": 1500000,
  "remaining": 900000,
  "status": "running",
  "startedAt": 1703012345678
}
```

**Migration**:
```typescript
const saved = getStorageItem<TimerSession>(...);
if (!saved.sessionId) {
  saved.sessionId = `${Date.now()}-${saved.mode}`;
}
```

**New TimerSession** (with sessionId):
```json
{
  "mode": "focus",
  "duration": 1500000,
  "remaining": 900000,
  "status": "running",
  "startedAt": 1703012345678,
  "sessionId": "1703012345678-focus"
}
```

**No Breaking Changes**: All existing code continues to work

---

**Status**: Contracts complete, ready for quickstart generation

