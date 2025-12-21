# Contract: Timer Auto-Transition Behavior

**Feature**: `008-fix-skip-break`  
**Date**: December 21, 2025  
**Purpose**: Define the contract for automatic timer state transitions

---

## Overview

This document specifies the behavior contract for auto-transitions and auto-start functionality in the Pomodoro timer.

---

## Contract 1: Auto-Transition on Focus Complete

### Trigger Condition

**WHEN**: Focus timer reaches 00:00 and transitions to `status='completed'`

**THEN**: System SHALL automatically switch timer to break mode (idle state)

### Pre-conditions

- Timer mode MUST be `'focus'`
- Timer status MUST become `'completed'`
- Timer remaining MUST be `0`

### Post-conditions

- Timer mode SHALL be `'short-break'` OR `'long-break'` (based on cycle position)
- Timer status SHALL be `'idle'`
- Timer duration SHALL be set to break duration (5 min for short, 15 min for long)
- Timer remaining SHALL equal duration
- `sessionId` SHALL be regenerated (new session)

### Break Type Selection

**IF** cycle position is 1, 2, or 3:
- **THEN** mode becomes `'short-break'`
- Duration: 5 minutes (300,000 ms)

**IF** cycle position is 0 (after 4th focus):
- **THEN** mode becomes `'long-break'`
- Duration: 15 minutes (900,000 ms)

### Timing Guarantee

- Auto-transition SHALL complete within 100ms of focus completion
- Auto-transition SHALL occur before next UI render cycle
- `onComplete()` callback SHALL be called BEFORE auto-transition

### Persistence

- New timer state (break mode, idle status) SHALL be saved to localStorage
- Page refresh after auto-transition SHALL preserve break mode (not revert to focus)

### Examples

**Example 1: 1st Focus Complete (Short Break)**
```typescript
// Before:
{ mode: 'focus', status: 'running', remaining: 1 }

// After completion:
{ mode: 'focus', status: 'completed', remaining: 0 }

// After auto-transition:
{ mode: 'short-break', status: 'idle', remaining: 300000, duration: 300000 }
```

**Example 2: 4th Focus Complete (Long Break)**
```typescript
// Before:
{ mode: 'focus', status: 'running', remaining: 1 }

// After completion:
{ mode: 'focus', status: 'completed', remaining: 0 }

// After auto-transition:
{ mode: 'long-break', status: 'idle', remaining: 900000, duration: 900000 }
```

---

## Contract 2: Auto-Start on "Start Break" Click

### Trigger Condition

**WHEN**: User clicks "Start Break" button

**THEN**: System SHALL immediately switch to break mode AND start timer running

### Pre-conditions

- Timer mode MAY be any mode (focus or break)
- Timer status SHOULD be `'completed'` or `'idle'`
- Break start button MUST be visible (rendered in UI)

### Post-conditions

- Timer mode SHALL be correct break type (`'short-break'` or `'long-break'`)
- Timer status SHALL be `'running'` (not `'idle'`)
- Timer countdown SHALL begin immediately
- `startedAt` timestamp SHALL be set to current time

### Single-Click Guarantee

- User SHALL NOT need to click a second time to start timer
- State transition from idle → running SHALL occur in single event handler
- No intermediate idle state SHALL be visible to user

### Implementation Pattern

```typescript
handleStartBreak() {
  const breakType = getNextBreakType();
  timer.switchMode(breakType);  // Sets mode, duration, status='idle'
  timer.start();                 // Changes status='running', starts interval
}
```

### Example

```typescript
// Before click:
{ mode: 'focus', status: 'completed', remaining: 0 }

// After "Start Break" click (single click):
{ mode: 'short-break', status: 'running', remaining: 300000, startedAt: 1703012345678 }
// Timer is counting down immediately
```

---

## Contract 3: Auto-Start on "Skip Break - Start Focus" Click

### Trigger Condition

**WHEN**: User clicks "Skip Break - Start Focus" button

**THEN**: System SHALL immediately switch to focus mode AND start timer running

### Pre-conditions

- Button MUST be visible (timer completed or break pending)
- Focus session MUST have already completed (session count already incremented)

### Post-conditions

- Timer mode SHALL be `'focus'`
- Timer status SHALL be `'running'` (not `'idle'`)
- Timer duration SHALL be 25 minutes (default focus duration)
- Timer countdown SHALL begin immediately
- `startedAt` timestamp SHALL be set to current time
- Session count SHALL NOT increment again (was already incremented when focus completed)

### Session Tracking Contract

**SHALL NOT** call `onComplete()` for skip break action

**Rationale**: Break was not completed, it was skipped. The Pomodoro was already counted when focus finished. Skipping a break does not complete a new Pomodoro.

### Implementation Pattern

```typescript
handleSkipBreak() {
  timer.switchMode('focus');  // Sets mode='focus', duration=25min, status='idle'
  timer.start();               // Changes status='running', starts interval
  // Note: Does NOT call onComplete() or increment session
}
```

### Example

```typescript
// Before click (break pending):
{ mode: 'short-break', status: 'idle', remaining: 300000 }

// After "Skip Break - Start Focus" click (single click):
{ mode: 'focus', status: 'running', remaining: 1500000, startedAt: 1703012345678 }
// Focus timer is counting down immediately
// Session count unchanged (was already incremented when previous focus completed)
```

---

## Contract 4: State Persistence Across Page Refresh

### Trigger Condition

**WHEN**: User refreshes page (F5 or browser reload)

**THEN**: Timer state (including any auto-transitions) SHALL be restored from localStorage

### Persistence Guarantees

**Auto-transition SHALL persist**:
```typescript
// Scenario: Focus completes → Auto-transitions to break → User refreshes

// localStorage contains:
{ mode: 'short-break', status: 'idle', remaining: 300000 }

// After refresh, timer shows:
- Mode: Short Break (not Focus)
- Status: Idle (ready to start)
- Duration: 5 minutes
```

**Running timer SHALL restore**:
```typescript
// Scenario: User starts break → Refreshes mid-countdown

// localStorage contains:
{ mode: 'short-break', status: 'running', startedAt: 1703012345000 }

// After refresh:
- Calculate elapsed time since startedAt
- Restore remaining time (Bug 1 fix ensures accuracy)
- Resume countdown
```

### Implementation

**Contract with Bug 1**: Leverage existing wall-clock restoration logic

**Existing behavior** (from Bug 1 fix):
```typescript
if (saved.status === 'running' && saved.startedAt !== null) {
  const elapsedTime = Date.now() - saved.startedAt;
  const remaining = saved.duration - elapsedTime;
  // Restore with accurate remaining time
}
```

**No new code needed**: Auto-transitions save state via existing `useEffect` that persists on every state change

---

## Contract 5: Integration with Existing Fixes

### Integration with Bug 1 (Timer Accuracy)

**SHALL NOT** interfere with wall-clock restoration logic

**Verification**: Auto-transition changes mode but preserves restoration accuracy

### Integration with Bug 2 (Completion Tracking)

**SHALL NOT** cause duplicate session increments

**Guarantee**: Auto-transition occurs AFTER `onComplete()` and does NOT call `onComplete()` again

**Example**:
```typescript
// Focus completes:
onComplete('focus');              // Increments session count: count = 1
setStorageItem(LAST_COMPLETION);  // Save completion record (Bug 2)

// Then auto-transition:
timer.switchMode('short-break');  // Does NOT call onComplete()

// Result: Session count = 1 (correct, no duplicate)
```

### Integration with Bug 3 (Persistent UI)

**SHALL** work seamlessly with persistent "Start Break" button

**Guarantee**: After auto-transition to break mode, persistent button remains functional

**Example**:
```typescript
// Focus completes → Auto-transition to break idle
{ mode: 'short-break', status: 'idle' }

// Persistent UI renders (Bug 3):
{timer.status === 'completed' && timer.mode === 'focus' && ...}
// Wait, this condition is FALSE now (mode is 'short-break', not 'focus')

// Issue: Need to update Bug 3 UI condition to also show for break idle
```

**Action required**: Verify Bug 3 UI button visibility after auto-transition

---

## Validation & Testing Contract

### Manual Test Cases (Must Pass)

**Test 1: Auto-Transition**
- Start focus timer → Let complete → Should auto-switch to break idle
- ✅ PASS: Mode changes to break, status is idle, duration is correct

**Test 2: No Double-Click**
- Complete focus → Auto-transition → Click "Start Break" → Should start immediately
- ✅ PASS: Timer starts running on single click

**Test 3: Skip Break**
- Complete focus → Click "Skip Break - Start Focus" → Should start focus immediately
- ✅ PASS: Timer switches to focus and starts running on single click

**Test 4: Session Tracking**
- Complete 3 focuses → Skip break → Complete 4th focus → Should show long break
- ✅ PASS: Cycle position tracks correctly

**Test 5: Persistence**
- Complete focus → Auto-transition → Refresh → Should show break mode
- ✅ PASS: Break mode persists after refresh

### Regression Tests (Must Pass)

- ✅ Bug 1: Timer accuracy within ±1 second after refresh
- ✅ Bug 2: No duplicate session count increments
- ✅ Bug 3: Persistent UI buttons remain functional

---

## Error Handling Contract

### Scenario: switchMode() Fails

**IF** `switchMode()` throws error or state update fails

**THEN** System SHALL:
1. Log error to console
2. NOT proceed with `start()` call
3. Leave timer in previous state (fail-safe)

### Scenario: start() Fails

**IF** `start()` throws error after `switchMode()` succeeds

**THEN** System SHALL:
1. Log error to console
2. Timer remains in idle state (user can manually retry)
3. No data corruption (state is valid idle state)

---

## Performance Contract

### Auto-Transition Performance

**SHALL** complete within 100ms of focus completion

**Measurement**: Time from `remaining=0` to `mode='break'`

### Button Click Performance

**SHALL** start timer within 50ms of button click

**Measurement**: Time from click event to `status='running'`

### localStorage Write Performance

**SHALL** persist state within 10ms of state change

**Measurement**: Time from `setState()` to localStorage write complete

---

**Status**: Contracts defined, ready for implementation


