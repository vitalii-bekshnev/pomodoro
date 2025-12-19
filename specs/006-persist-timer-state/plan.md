# Implementation Plan: Persist Timer State Across Page Refresh

**Branch**: `006-persist-timer-state` | **Date**: December 19, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-persist-timer-state/spec.md`

## Summary

Enhance existing timer state persistence to handle running timers correctly across page refreshes. The timer already persists paused and idle states, but running timers reset on refresh because the interval is lost. This plan adds wall-clock-based time calculation to restore running timers accurately.

**Key Enhancement**: When restoring a running timer, calculate elapsed time since `startedAt` timestamp and subtract from saved `remaining` to get accurate current remaining time.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18  
**Primary Dependencies**: 
- React Hooks (useState, useEffect, useRef, useCallback) - already in use
- localStorage via existing storage utils (`getStorageItem`, `setStorageItem`)
- date-fns (optional, for time utilities) - already available

**Storage**: localStorage (browser native, already implemented)  
**Testing**: Jest + React Testing Library (already configured)  
**Target Platform**: Modern browsers with localStorage support (Chrome 90+, Firefox 88+, Safari 14+)

**Project Type**: Single-page React web application

**Performance Goals**: 
- State restore on page load: <100ms
- Running timer resume: <500ms after page load
- No visible timer jump or flicker on restore

**Constraints**: 
- Must work with existing timer hook (`useTimer`)
- Must not break existing timer functionality
- Must maintain compatibility with existing tests
- localStorage quota limits (unlikely to hit with small state object)

**Scale/Scope**: 
- Single hook modification (`useTimer`)
- Minimal new code (~30-50 lines)
- Enhanced initialization logic only
- No new dependencies required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: No constitution file found (template placeholder only)

**Default Quality Gates Applied**:

- ✅ **Testability**: Feature is highly testable with time mocking
- ✅ **Maintainability**: Enhances existing hook with minimal changes
- ✅ **Simplicity**: Uses existing infrastructure (localStorage, startedAt field)
- ✅ **No Breaking Changes**: Backwards compatible with existing state
- ✅ **Documentation**: Will document restore logic in code comments

**Assessment**: No violations. Feature enhances existing functionality without introducing new complexity or dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/006-persist-timer-state/
├── plan.md              # This file
├── research.md          # Phase 0 output (restore patterns, time calculation)
├── data-model.md        # Phase 1 output (TimerSession structure)
├── quickstart.md        # Phase 1 output (testing instructions)
└── contracts/           # Phase 1 output (timer hook interface)
```

### Source Code (repository root)

```text
# Existing Files to Modify
src/hooks/
└── useTimer.ts          # MODIFY: Add running timer restore logic

src/types/
└── timer.ts             # VERIFY: TimerSession.startedAt exists (already present)

src/utils/
└── storage.ts           # VERIFY: getStorageItem/setStorageItem work correctly

# Existing Files (No Changes Required)
src/hooks/
├── useSettings.ts       # Already persists preferences
└── useSessionTracking.ts # Already persists session count/cycle

# Test Files to Add/Modify
tests/unit/hooks/
└── useTimer.test.ts     # ADD: Tests for running timer restore

tests/integration/
└── TimerPersistence.test.tsx # ADD: Integration tests for all states
```

**Structure Decision**: Enhancement to existing hook only. The `useTimer` hook already has infrastructure for persistence (saves state to localStorage, reads on init). We enhance the initialization logic to handle running timers by calculating elapsed time.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This section is not applicable.

---

## Phase 0: Research

**Status**: Complete

### Research Topic 1: Timer State Restore Patterns

**Decision**: Calculate elapsed time on restore using wall-clock timestamps

**Rationale**:
- Browser timers (`setInterval`) don't survive page refresh
- Must use wall-clock time to calculate elapsed time
- Existing `startedAt` field perfect for this purpose
- Simple subtraction: `elapsedTime = Date.now() - startedAt`
- Then: `currentRemaining = savedRemaining - elapsedTime`

**Alternatives Considered**:
1. **Service Worker persistence**: Complex, requires PWA setup, overkill
2. **Periodic localStorage updates while running**: Inaccurate, race conditions on refresh
3. **Store completion timestamp instead**: Less intuitive, same calculation different direction

**Implementation Pattern**:
```typescript
// On restore (simplified)
if (savedStatus === 'running' && savedStartedAt !== null) {
  const elapsedSinceStart = Date.now() - savedStartedAt;
  const currentRemaining = Math.max(0, savedRemaining - elapsedSinceStart);
  
  if (currentRemaining === 0) {
    // Timer completed while page was closed
    handleCompletion(savedMode);
  } else {
    // Resume timer with calculated remaining time
    resumeTimerWith(currentRemaining);
  }
}
```

### Research Topic 2: Edge Case Handling

**Decision**: Handle completion, clock changes, and negative times gracefully

**Edge Cases**:
1. **Timer completed during refresh** (remaining ≤ 0):
   - Call `onComplete` callback immediately
   - Transition to idle state for next mode
   - Show completion notification

2. **System clock changed** (time travel, DST):
   - Clamp remaining to [0, duration]
   - Log warning if jump >1 hour (optional)
   - Continue with clamped value

3. **Corrupted localStorage**:
   - Handled by existing `getStorageItem` default fallback
   - Resets to DEFAULT_TIMER_SESSION
   - No error shown to user

4. **Missing `startedAt` for running timer**:
   - Treat as paused timer (safety fallback)
   - No wall-clock calculation
   - Maintains remaining time

### Research Topic 3: Persistence Timing

**Decision**: Save state on every significant change, including when starting timer

**Current Behavior** (from code review):
```typescript
// useEffect in useTimer (lines 65-69)
useEffect(() => {
  if (session.status === 'paused' || session.status === 'idle') {
    setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
  }
}, [session]);
```

**Problem**: Running timers NOT saved! Only paused/idle states persist.

**Solution**: Save running state too:
```typescript
useEffect(() => {
  setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
  // Save ALL states, not just paused/idle
  // Running state includes startedAt for restore calculation
}, [session]);
```

**Rationale**:
- Running state must be saved with `startedAt` timestamp
- Current code skip saving running timers
- Simple fix: remove status condition, save all states
- localStorage writes are fast (<1ms), not a performance concern

---

## Phase 1: Design & Contracts

**Status**: Complete

### Data Model

See [data-model.md](./data-model.md) for complete TimerSession structure.

**Key Fields for Persistence**:
```typescript
interface TimerSession {
  mode: TimerMode;           // 'focus' | 'short-break' | 'long-break'
  duration: number;          // Total duration in ms
  remaining: number;         // Remaining time in ms
  status: TimerStatus;       // 'idle' | 'running' | 'paused' | 'completed'
  startedAt: number | null;  // Timestamp when started (for wall-clock calc)
}
```

**Restore Logic Flow**:
```
1. Load saved state from localStorage
2. If status === 'running' && startedAt !== null:
   a. Calculate elapsed = Date.now() - startedAt
   b. Calculate remaining = savedRemaining - elapsed
   c. If remaining <= 0: trigger completion
   d. Else: restore running state with new remaining
3. If status === 'paused' || status === 'idle':
   a. Restore exact remaining time (no calculation)
4. Start interval to continue countdown
```

### Contracts

See [contracts/timer-hook.ts](./contracts/timer-hook.ts) for complete interface.

**useTimer Hook Interface** (unchanged):
```typescript
export interface UseTimerReturn {
  mode: TimerMode;
  remaining: number;
  duration: number;
  status: TimerStatus;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (mode: TimerMode) => void;
}
```

**No API changes required** - internal restore logic only.

### Quickstart

See [quickstart.md](./quickstart.md) for complete testing guide.

**Quick Test Scenario**:
```bash
# 1. Start dev server
npm run dev

# 2. Open browser console
# 3. Start focus timer, wait 5 minutes
# 4. Check localStorage:
localStorage.getItem('pomodoro_timer_state')
# Should see: { status: 'running', startedAt: <timestamp>, ... }

# 5. Refresh page (F5)
# 6. Timer should continue from ~20 minutes remaining
# 7. No reset to 25:00
```

---

## Implementation Changes Required

### Change 1: Update Persistence Logic (useTimer.ts)

**Location**: `src/hooks/useTimer.ts` lines 64-69

**Current Code**:
```typescript
useEffect(() => {
  if (session.status === 'paused' || session.status === 'idle') {
    setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
  }
}, [session]);
```

**New Code**:
```typescript
useEffect(() => {
  // Save ALL states including running (with startedAt timestamp)
  setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
}, [session]);
```

**Rationale**: Running timers need `startedAt` saved for restore calculation.

---

### Change 2: Add Running Timer Restore Logic (useTimer.ts)

**Location**: `src/hooks/useTimer.ts` lines 32-46 (initialization)

**Current Code** (simplified):
```typescript
const [session, setSession] = useState<TimerSession>(() => {
  const saved = getStorageItem<TimerSession>(
    STORAGE_KEYS.TIMER_STATE,
    DEFAULT_TIMER_SESSION
  );
  
  const duration = getDurationForMode(saved.mode, preferences);
  return {
    ...saved,
    duration,
    remaining: Math.min(saved.remaining, duration),
  };
});
```

**New Code** (with restore logic):
```typescript
const [session, setSession] = useState<TimerSession>(() => {
  const saved = getStorageItem<TimerSession>(
    STORAGE_KEYS.TIMER_STATE,
    DEFAULT_TIMER_SESSION
  );
  
  const duration = getDurationForMode(saved.mode, preferences);
  
  // Handle running timer restore
  if (saved.status === 'running' && saved.startedAt !== null) {
    const elapsedTime = Date.now() - saved.startedAt;
    const calculatedRemaining = Math.max(0, saved.remaining - elapsedTime);
    
    if (calculatedRemaining === 0) {
      // Timer completed while page was closed
      // Will be handled by onComplete callback in useEffect below
      return {
        ...saved,
        duration,
        remaining: 0,
        status: 'completed' as TimerStatus,
      };
    }
    
    // Continue running with adjusted remaining time
    return {
      ...saved,
      duration,
      remaining: Math.min(calculatedRemaining, duration),
      status: 'running',
    };
  }
  
  // Paused or idle: restore exact state
  return {
    ...saved,
    duration,
    remaining: Math.min(saved.remaining, duration),
  };
});
```

---

### Change 3: Add Completion Handler for Restored Completed Timers (useTimer.ts)

**Location**: Add new useEffect after initialization

**New Code**:
```typescript
// Handle timer that completed while page was closed/refreshed
useEffect(() => {
  if (session.status === 'completed') {
    onComplete(session.mode);
    // Transition to idle for next mode (handled by parent component)
  }
}, []); // Run once on mount only
```

**Rationale**: If timer reached 0 during page close, trigger completion flow.

---

### Change 4: Update Start Function to Set startedAt (useTimer.ts)

**Location**: `src/hooks/useTimer.ts` start function (around line 81)

**Verify** `startedAt` is set:
```typescript
const start = useCallback(() => {
  if (session.status !== 'idle') return;
  
  const now = Date.now();
  setSession((prev) => ({
    ...prev,
    status: 'running',
    startedAt: now,  // ← Verify this line exists
  }));
  
  startTimeRef.current = now;
  elapsedRef.current = 0;
  // ... rest of function
}, [session.status]);
```

**If missing**: Add `startedAt: Date.now()` to setSession call.

---

## Testing Strategy

### Unit Tests (tests/unit/hooks/useTimer.test.ts)

**New Test Cases**:
1. ✅ Restore running focus timer after 10 minutes elapsed
2. ✅ Restore running timer that completed (remaining = 0)
3. ✅ Restore paused timer with exact remaining time
4. ✅ Restore idle timer maintains mode and duration
5. ✅ Handle corrupted localStorage (missing startedAt)
6. ✅ Handle system clock change (clamp to valid range)
7. ✅ Verify running state is saved to localStorage

### Integration Tests (tests/integration/TimerPersistence.test.tsx)

**New Test Scenarios**:
1. ✅ Full flow: start timer, mock page refresh, verify continuation
2. ✅ Full flow: pause timer, refresh, resume works correctly
3. ✅ Full flow: timer completes during "refresh", notification shows
4. ✅ Session tracking persists across refreshes

---

## Performance Considerations

**State Save Performance**:
- localStorage write: <1ms per save
- Triggered on every session state change
- No performance impact (writes are async in browser)

**State Restore Performance**:
- localStorage read: <1ms
- Wall-clock calculation: <0.1ms (simple subtraction)
- Total restore time: <5ms
- Well under 100ms target ✅

**Memory Impact**:
- TimerSession object: ~200 bytes
- No memory leaks (no new intervals or refs)
- Negligible impact ✅

---

## Risk Assessment

**Low Risk** ✅

**Risks**:
1. **System clock change**: Mitigated by clamping to valid range
2. **localStorage unavailable**: Already handled by existing fallback
3. **Race conditions on rapid refresh**: Minimal risk, last-write-wins
4. **Breaking existing tests**: Low risk, mostly additions not changes

**Mitigation**:
- Comprehensive test coverage (unit + integration)
- Graceful degradation for all edge cases
- Backwards compatible state structure
- Code review before merge

---

## Next Steps

1. ✅ Plan created (this file)
2. ✅ Research complete (restore patterns, edge cases)
3. ✅ Design complete (data model, contracts, quickstart)
4. ⏳ Run `/speckit.tasks` to generate implementation tasks
5. ⏳ Implement changes to useTimer hook
6. ⏳ Add unit and integration tests
7. ⏳ Manual testing with various scenarios
8. ⏳ Code review and merge

**Planning Status**: Complete ✅  
**Ready for**: Task generation (`/speckit.tasks`)

**Estimated Implementation Time**: 2-3 hours
- useTimer modifications: ~1 hour
- Unit tests: ~30-45 minutes
- Integration tests: ~30-45 minutes
- Manual testing & fixes: ~30 minutes
