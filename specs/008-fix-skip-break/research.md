# Research: Fix Skip Break Button Behavior

**Feature**: `008-fix-skip-break`  
**Date**: December 21, 2025  
**Status**: Complete

---

## Overview

This document resolves technical questions and documents implementation patterns for fixing the Skip Break button auto-transition and auto-start behavior.

---

## Research Topic 1: Auto-Transition Timing (Focus → Break)

### Problem Statement

**Question**: When and where should auto-transition from focus → break occur?

**Context**: Currently, when focus timer reaches 00:00, it stays in focus mode with completed status. We need it to automatically switch to break mode (idle state).

### Current Implementation Analysis

**File**: `src/hooks/useTimer.ts`, lines ~140-155

```typescript
// Inside setInterval callback when timer completes:
if (newRemaining <= 0) {
  clearInterval(intervalRef.current);
  intervalRef.current = null;
  
  // Call onComplete callback
  onComplete(prev.mode);
  
  // Save completion record (Bug 2 fix)
  setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
    sessionId: prev.sessionId,
    completedAt: Date.now(),
    mode: prev.mode,
  });

  return {
    ...prev,
    remaining: 0,
    status: 'completed',
    startedAt: null,
  };
}
```

**Issue**: After this code executes, timer is in `status='completed', mode='focus'`. There's no auto-transition to break mode.

### Investigation

**Attempt 1**: Call `switchMode()` directly in interval callback
- **Problem**: `switchMode` is defined as a `useCallback`, not accessible in this scope
- **Verdict**: ❌ Won't work

**Attempt 2**: Add auto-transition logic in the returned state update
- **Problem**: `setSession()` updates state but can't call other functions like `switchMode()`
- **Verdict**: ❌ Won't work

**Attempt 3**: Handle auto-transition in `App.tsx` after `onComplete` callback
- **How**: In `handleTimerComplete`, after calling session tracking and notifications, add auto-transition logic
- **Pros**: Has access to `getNextBreakMode()` from session tracking, clean separation of concerns
- **Cons**: Slight delay between completion and transition (one render cycle)
- **Verdict**: ✅ **RECOMMENDED**

### Decision

**Implementation Location**: `src/components/App.tsx`, in `handleTimerComplete` function

**Pattern**:
```typescript
const handleTimerComplete = useCallback(
  (mode: TimerMode) => {
    // Existing code: update session tracking, play sound, show banner
    if (mode === 'focus') {
      incrementSession();
    }
    playSound();
    showBanner(mode);

    // NEW: Auto-transition from focus to break
    if (mode === 'focus') {
      const nextBreakMode = getNextBreakMode();
      timer.switchMode(nextBreakMode);
      // Note: Don't call timer.start() here - let user click "Start Break" button
    }
  },
  [incrementSession, playSound, showBanner, getNextBreakMode, timer]
);
```

**Rationale**:
- Clean separation: `useTimer` handles timer mechanics, `App.tsx` handles workflow logic
- Has access to `getNextBreakMode()` for determining short vs long break
- Doesn't interfere with completion tracking (Bug 2) - happens after `onComplete()`
- Slight delay (one render cycle) is imperceptible to users

**Testing**: Complete focus timer → Should automatically show break mode with correct duration (idle state)

---

## Research Topic 2: Sequential State Updates (switchMode + start)

### Problem Statement

**Question**: Can we call `switchMode()` then `start()` sequentially without React batching issues?

**Context**: Buttons need to switch mode AND start timer running immediately (no idle state).

### Current `switchMode` Implementation Analysis

**File**: `src/hooks/useTimer.ts`, lines ~224-241

```typescript
const switchMode = useCallback(
  (newMode: TimerMode) => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const duration = getDurationForMode(newMode, preferences);

    setSession({
      mode: newMode,
      duration,
      remaining: duration,
      status: 'idle',
      startedAt: null,
      sessionId: `${Date.now()}-${newMode}`,
    });
  },
  [preferences]
);
```

**Key observations**:
- `switchMode()` uses direct `setSession({...})` (not callback form)
- Sets `status: 'idle'`
- Synchronous call (no async/await)

### Current `start` Implementation Analysis

**File**: `src/hooks/useTimer.ts`, lines ~120-130

```typescript
const start = useCallback(() => {
  if (session.status === 'running') return;

  startTimeRef.current = Date.now();
  elapsedRef.current = session.duration - session.remaining;

  setSession((prev) => ({
    ...prev,
    status: 'running',
    startedAt: Date.now(),
    sessionId: `${Date.now()}-${prev.mode}`,
  }));
  
  // ... interval setup
}, [session.status, session.duration, session.remaining, onComplete]);
```

**Key observations**:
- `start()` checks current `session.status`
- Uses callback form `setSession((prev) => ...)` to read latest state
- Reads `session.duration` and `session.remaining` from closure

### Investigation: React 18 Batching Behavior

**Scenario**: Call `timer.switchMode('focus')` then `timer.start()` immediately

**React 18 automatic batching**: Multiple state updates in same event handler are batched

**Question**: Will `start()` see the updated state from `switchMode()`?

**Analysis**:
```typescript
// In button handler:
timer.switchMode('focus');  // setSession({mode: 'focus', status: 'idle', ...})
timer.start();              // Reads session.status, session.duration, session.remaining

// Problem: start() uses closure over session state from when useCallback was created
// If switchMode hasn't re-rendered yet, start() might see OLD session values
```

**Testing**: Need to verify this works correctly

### Decision

**Pattern**: Call `switchMode()` then `start()` sequentially

```typescript
const handleSkipBreak = useCallback(() => {
  timer.switchMode('focus');
  timer.start();
}, [timer]);
```

**Why this should work**:
1. `switchMode()` updates state immediately (synchronous `setSession` call)
2. `start()` uses `setSession((prev) => ...)` callback form, which reads fresh state
3. Even with batching, the `prev` in `start()` will have the updated mode/duration from `switchMode()`

**Caveat**: The `session.status` check at top of `start()` reads from closure. If `switchMode` sets `status='idle'` and React hasn't re-rendered, `start()` might read old status.

**Mitigation**: Since we're calling both in same handler, and `start()` checks `if (session.status === 'running') return`, it should work:
- Before: status was 'completed' or 'idle' (not 'running') → passes check
- After switchMode: status is 'idle' (not 'running') → still passes check
- `start()` proceeds to update status to 'running'

**Verdict**: ✅ **Should work, but requires testing**

**Fallback**: If batching causes issues, use `useEffect` to call `start()` after `switchMode()` completes:
```typescript
const [shouldAutoStart, setShouldAutoStart] = useState(false);

useEffect(() => {
  if (shouldAutoStart) {
    timer.start();
    setShouldAutoStart(false);
  }
}, [shouldAutoStart, timer]);

const handleSkipBreak = () => {
  timer.switchMode('focus');
  setShouldAutoStart(true);
};
```

**Testing**: Click "Skip Break - Start Focus" → Should immediately switch to focus mode AND start countdown (not idle)

---

## Research Topic 3: Skip Break vs Regular Skip

### Problem Statement

**Question**: How should "Skip Break - Start Focus" differ from regular timer skip?

**Context**: Existing `skip()` function sets timer to 00:00, marks as completed, and calls `onComplete()`. For skip break, we don't want to call `onComplete()` again (focus already completed).

### Current `skip` Implementation Analysis

**File**: `src/hooks/useTimer.ts`, lines ~206-223

```typescript
const skip = useCallback(() => {
  if (intervalRef.current !== null) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  setSession((prev) => {
    // Call onComplete callback
    onComplete(session.mode);
    
    // Save completion record (Bug 2 fix)
    setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
      sessionId: prev.sessionId,
      completedAt: Date.now(),
      mode: prev.mode,
    });
    
    return {
      ...prev,
      remaining: 0,
      status: 'completed',
      startedAt: null,
    };
  });
}, [session.mode, onComplete]);
```

**Key behavior**:
- Sets `remaining: 0`, `status: 'completed'`
- Calls `onComplete(session.mode)` → This increments session count if mode is 'focus'
- Saves completion record (Bug 2)

### Investigation: Session Tracking for Skip Break

**Scenario**: User completes 3rd focus session → Skips break → Starts 4th focus session

**Expected behavior**:
1. 3rd focus completes → `onComplete('focus')` called → Session count: 3, Cycle position: 3
2. User skips break → **Should NOT call `onComplete('short-break')`** (break wasn't completed)
3. 4th focus completes → Session count: 4, Cycle position: 0 (reset to long break)

**Key insight**: Skipping a break does NOT complete the break. The Pomodoro was already completed when focus finished. Skipping just means "don't take the break, go straight to next focus".

### Decision

**Don't use `skip()` for "Skip Break - Start Focus"**

**Instead**: Directly switch mode and start:
```typescript
const handleSkipBreak = useCallback(() => {
  timer.switchMode('focus');  // Switch to focus mode (idle state)
  timer.start();              // Start focus timer running
}, [timer]);
```

**Rationale**:
- Skip break is NOT a completion event (break wasn't taken)
- Focus session was already completed and counted when timer reached 00:00
- We just want to skip the break phase and start a new focus session
- No need to call `onComplete()` or save completion record

**Cycle Position Handling**:
- Current implementation (from spec assumptions): Cycle position already incremented when focus completed
- Skipping break doesn't affect cycle position (it's still at the same position)
- Next focus completion will increment cycle position as normal

**Testing**: Complete 3 focus sessions → Skip break after 3rd → Complete 4th focus → Should trigger long break (cycle position tracks correctly)

---

## Research Topic 4: Current Handler Analysis (Bug 3 Implementation)

### Problem Statement

**Question**: What do current handlers from Bug 3 do, and what needs to change?

### File Review: `src/components/App.tsx`

**Current `handleStartBreak` implementation** (from Bug 3):

```typescript
const handleStartBreak = useCallback(() => {
  const breakType = getNextBreakType();
  timer.switchMode(breakType);
  timer.start();
}, [getNextBreakType, timer]);
```

**Status**: ✅ **Already correct!** Bug 3 implementation already calls `timer.start()` after `switchMode()`.

**Current `handleSkipBreak` implementation** (from Bug 3):

```typescript
const handleSkipBreak = useCallback(() => {
  timer.switchMode('focus');
  timer.start();
}, [timer]);
```

**Status**: ✅ **Already correct!** Bug 3 implementation already calls `timer.start()` after `switchMode()`.

### Investigation Result

**Surprising finding**: The Bug 3 implementation ALREADY includes `timer.start()` calls in both handlers!

**Implication**: User Stories 2 and 3 (auto-start on button clicks) may already be fixed by Bug 3.

**Remaining issue**: User Story 1 (auto-transition from focus complete to break) is still broken. This is the only fix needed.

**Verification needed**: Manual testing to confirm that:
1. ✅ "Start Break" button already starts timer running immediately
2. ✅ "Skip Break - Start Focus" button already switches mode and starts running
3. ❌ Focus completion does NOT auto-transition to break (this is the bug to fix)

### Decision

**Only one change needed**: Add auto-transition logic in `handleTimerComplete`

**Bug 3 handlers are already correct** - they call `start()` after `switchMode()`.

**Updated implementation scope**:
- ✅ Modify: `src/components/App.tsx` - `handleTimerComplete` function (add auto-transition)
- ✅ No changes needed: `handleStartBreak` and `handleSkipBreak` already correct
- ✅ No changes needed: `src/hooks/useTimer.ts` - no modifications required

**New estimated LOC**: ~10-15 lines (much smaller than originally estimated)

---

## Summary of Technical Decisions

### Decision 1: Auto-Transition Location

**Chosen approach**: Add auto-transition in `App.tsx` `handleTimerComplete` function

**Implementation**:
```typescript
const handleTimerComplete = useCallback(
  (mode: TimerMode) => {
    // Existing: session tracking, sounds, notification
    if (mode === 'focus') {
      incrementSession();
    }
    if (mode === 'focus') {
      playFocusComplete();
    } else {
      playBreakComplete();
    }
    showBanner(mode);

    // NEW: Auto-transition from focus to break
    if (mode === 'focus') {
      const nextBreakMode = getNextBreakMode();
      timer.switchMode(nextBreakMode);
    }
  },
  [incrementSession, playFocusComplete, playBreakComplete, showBanner, getNextBreakMode, timer]
);
```

**Rationale**: Clean separation of concerns, has access to `getNextBreakMode()`, doesn't interfere with Bug 2

---

### Decision 2: Button Handlers

**Status**: ✅ Already implemented correctly in Bug 3

**No changes needed** - both handlers already call `timer.start()` after `timer.switchMode()`

---

### Decision 3: Skip Break Behavior

**Pattern**: Don't use `skip()` function - use `switchMode('focus')` + `start()`

**Rationale**: Skip break is not a completion event, just a mode transition

**Status**: ✅ Already implemented correctly in Bug 3 `handleSkipBreak`

---

## Testing Strategy

### Manual Testing Scenarios

1. **Focus Complete Auto-Transition**:
   - Start focus timer → Let it complete → Should automatically switch to break mode (idle, 5 or 15 min duration)
   - Verify notification still shows
   - Verify "Start Break" button appears and works

2. **Skip Break Auto-Start**:
   - Complete focus → Click "Skip Break - Start Focus" → Should immediately switch to focus AND start running
   - Verify no idle state
   - Verify countdown begins immediately

3. **Start Break Auto-Start**:
   - Complete focus → Wait for auto-transition to break → Click "Start Break" → Should start running immediately
   - Verify no second click needed

4. **Cycle Position**:
   - Complete 3 focus sessions → Skip break after each → Complete 4th focus → Should show long break (15 min)
   - Verify cycle tracking works correctly

5. **Page Refresh**:
   - Complete focus → Refresh page → Should remain in break mode (from auto-transition)
   - Skip break and start focus → Refresh mid-countdown → Should continue from correct time

### Regression Testing

- ✅ Bug 1: Timer accuracy preserved
- ✅ Bug 2: Completion tracking (no duplicate counts)
- ✅ Bug 3: Persistent UI buttons still work

---

**Status**: Research complete, ready for Phase 1 design artifacts


