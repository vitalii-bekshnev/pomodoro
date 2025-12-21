# Quickstart: Testing Skip Break Auto-Transition Fix

**Feature**: `008-fix-skip-break`  
**Date**: December 21, 2025  
**Purpose**: Step-by-step guide for testing auto-transition and auto-start fixes

---

## Prerequisites

1. **Development server running**:
   ```bash
   cd /Users/vitaliibekshnev/Source/Personal/pomodoro
   npm run dev
   ```

2. **Browser open**: `http://localhost:5173`

3. **Browser DevTools**: Open Console (F12) to monitor state changes

---

## Test Scenario 1: Auto-Transition on Focus Complete (P1 - Critical)

**User Story**: Focus timer should automatically transition to break mode when it completes

### Steps

1. **Start focus timer**:
   - Click "Start Focus" button
   - Timer starts counting down from 25:00

2. **Skip to completion** (for faster testing):
   - Click "Skip" button
   - Timer jumps to 00:00 and shows "Completed"

3. **Verify auto-transition**:
   - ✅ **Expected**: Timer AUTOMATICALLY switches to "Short Break" or "Long Break" mode
   - ✅ **Expected**: Timer shows correct break duration (05:00 for short, 15:00 for long)
   - ✅ **Expected**: Timer status is "idle" (not "running", not "completed")
   - ❌ **Bug if**: Timer stays in "Focus Time" mode at 00:00

4. **Verify persistent UI**:
   - ✅ **Expected**: "Start Break" button appears below timer (Bug 3 UI)
   - ✅ **Expected**: Notification banner shows "Time for a break"

5. **Verify session count**:
   - ✅ **Expected**: "Pomodoros completed today" increments to 1

### Console Verification

```javascript
// Check timer state after auto-transition:
JSON.parse(localStorage.getItem('pomodoro_timer_state'))

// Should show:
{
  mode: "short-break",  // or "long-break" after 4th focus
  status: "idle",
  duration: 300000,     // 5 min = 300,000 ms (or 900,000 for long)
  remaining: 300000,
  sessionId: "1703012345678-short-break",
  startedAt: null
}
```

### Expected Result

✅ **PASS**: Focus completion automatically transitions to break mode (idle state)  
❌ **FAIL**: Focus stays at 00:00 in focus mode

---

## Test Scenario 2: Auto-Start on "Start Break" Click (P3)

**User Story**: "Start Break" button should immediately start timer (no second click)

### Steps

1. **Complete focus timer** (from Scenario 1)
   - Should auto-transition to break idle state

2. **Click "Start Break" button**:
   - Button is in the persistent UI below timer

3. **Verify immediate start**:
   - ✅ **Expected**: Break timer IMMEDIATELY starts counting down (05:00 → 04:59 → 04:58...)
   - ✅ **Expected**: "Start Break" button disappears (timer is running)
   - ✅ **Expected**: Timer controls show "Pause" button (not "Start")
   - ❌ **Bug if**: Timer stays at 05:00 idle, requiring second click to start

4. **Test pause/resume**:
   - Click "Pause" → Timer stops
   - Click "Resume" → Timer continues

### Expected Result

✅ **PASS**: Single click on "Start Break" immediately starts timer running  
❌ **FAIL**: Need to click "Start" again after mode switch

---

## Test Scenario 3: Auto-Start on "Skip Break - Start Focus" (P2)

**User Story**: "Skip Break" button should immediately start focus timer (no idle state)

### Steps

1. **Complete focus timer**
   - Should auto-transition to break idle state
   - "Skip Break - Start Focus" button appears in persistent UI

2. **Click "Skip Break - Start Focus" button**:
   - Button is in the persistent UI below timer

3. **Verify immediate focus start**:
   - ✅ **Expected**: Timer IMMEDIATELY switches to "Focus Time" mode
   - ✅ **Expected**: Timer IMMEDIATELY starts countdown (25:00 → 24:59 → 24:58...)
   - ✅ **Expected**: NO idle state visible
   - ✅ **Expected**: Persistent UI disappears (timer is running)
   - ❌ **Bug if**: Timer switches to focus but stays idle at 25:00

4. **Verify session count**:
   - ✅ **Expected**: Pomodoro count DOES NOT increment (skip doesn't complete break)
   - ❌ **Bug if**: Count increments on skip (should only increment on focus complete)

### Expected Result

✅ **PASS**: Single click on "Skip Break" immediately switches to focus and starts running  
❌ **FAIL**: Timer switches mode but doesn't auto-start

---

## Test Scenario 4: Long Break After 4th Focus

**User Story**: Auto-transition should select correct break type (short vs long)

### Steps

1. **Complete 3 focus sessions**:
   - Focus 1 → Skip → Focus 2 → Skip → Focus 3 → Skip
   - OR complete breaks between each focus (slower)

2. **Complete 4th focus session**:
   - Click "Skip" to complete focus #4

3. **Verify long break**:
   - ✅ **Expected**: Timer auto-transitions to "Long Break" (15:00)
   - ✅ **Expected**: NOT "Short Break" (05:00)
   - ❌ **Bug if**: Shows short break instead of long break

4. **Verify cycle position**:
   - Cycle indicator should show "4/4" or reset to "0/4" (depending on display logic)

### Console Verification

```javascript
// Check session progress:
JSON.parse(localStorage.getItem('pomodoro_session_progress'))

// Should show:
{
  completedCount: 4,
  cyclePosition: 0,  // Reset after 4th focus
  date: "2025-12-21"
}

// Check timer mode:
JSON.parse(localStorage.getItem('pomodoro_timer_state')).mode
// Should be: "long-break"
```

### Expected Result

✅ **PASS**: 4th focus completes → Auto-transitions to long break (15 min)  
❌ **FAIL**: Shows short break instead of long break

---

## Test Scenario 5: Persistence Across Refresh

**User Story**: Auto-transition state should persist after page refresh

### Steps

1. **Complete focus timer**
   - Should auto-transition to break idle state

2. **Refresh page** (F5):
   - Browser reloads application

3. **Verify state preserved**:
   - ✅ **Expected**: Timer shows "Short Break" or "Long Break" mode (NOT "Focus Time")
   - ✅ **Expected**: Timer shows idle state at correct duration (05:00 or 15:00)
   - ✅ **Expected**: "Start Break" button still appears
   - ❌ **Bug if**: Timer reverts to "Focus Time" mode after refresh

4. **Click "Start Break" after refresh**:
   - ✅ **Expected**: Timer starts running normally

### Expected Result

✅ **PASS**: Auto-transition persists across page refresh  
❌ **FAIL**: Timer resets to focus mode after refresh

---

## Test Scenario 6: Skip Break + Refresh Mid-Countdown

**User Story**: Skip break and start focus should persist across refresh (running timer restoration)

### Steps

1. **Complete focus → Click "Skip Break - Start Focus"**
   - Focus timer starts running (e.g., 24:30 remaining)

2. **Immediately refresh page** (F5):
   - While timer is counting down

3. **Verify restoration**:
   - ✅ **Expected**: Timer continues in "Focus Time" mode
   - ✅ **Expected**: Time is accurate (within ±1 second of expected)
   - ✅ **Expected**: Countdown continues from correct time
   - ❌ **Bug if**: Timer resets or loses time accuracy

### Console Verification

```javascript
// Before refresh:
{
  mode: "focus",
  status: "running",
  startedAt: 1703012345000,
  remaining: 1470000  // ~24:30
}

// After refresh (10 seconds later):
{
  mode: "focus",
  status: "running",
  startedAt: 1703012345000,
  remaining: 1460000  // ~24:20 (10 seconds elapsed)
}
```

### Expected Result

✅ **PASS**: Skip + start persists across refresh with accurate time  
❌ **FAIL**: Timer loses state or accuracy after refresh

---

## Regression Tests

### Regression 1: Bug 1 (Timer Accuracy) Not Broken

**Steps**:
1. Start focus timer → Pause at 20:00
2. Refresh page
3. Resume timer → Let run for 1 minute
4. Pause → Check remaining time

**Expected**: Time is accurate within ±1 second (e.g., 19:00 ±1s)  
**Bug if**: Time jumps 2+ seconds (Bug 1 reintroduced)

---

### Regression 2: Bug 2 (Duplicate Count) Not Broken

**Steps**:
1. Complete focus timer (count = 1)
2. Refresh page 5 times
3. Check Pomodoro count

**Expected**: Count stays at 1 (not 2, 3, 4, etc.)  
**Bug if**: Count increments on each refresh (Bug 2 reintroduced)

---

### Regression 3: Bug 3 (Persistent UI) Still Works

**Steps**:
1. Complete focus timer
2. Dismiss notification
3. Check for persistent UI

**Expected**: "Start Break" and "Skip Break - Start Focus" buttons visible  
**Bug if**: No buttons appear after dismissing notification (Bug 3 broken)

---

## Quick Validation Checklist

Run these 5 quick tests to verify core functionality:

- [ ] ✅ Focus completes → Auto-switches to break idle
- [ ] ✅ Click "Start Break" → Timer runs immediately (no second click)
- [ ] ✅ Click "Skip Break" → Focus starts running immediately
- [ ] ✅ 4th focus → Auto-switches to long break (15 min)
- [ ] ✅ Refresh after auto-transition → State persists

**If all 5 pass**: Core functionality works! ✅  
**If any fail**: Debug that specific scenario ❌

---

## Debugging Tips

### Issue: Auto-Transition Doesn't Happen

**Check**:
```javascript
// In handleTimerComplete, verify this code exists:
if (mode === 'focus') {
  const nextBreakMode = getNextBreakMode();
  timer.switchMode(nextBreakMode);
}
```

**Verify**: Add `console.log` to confirm this code runs

---

### Issue: Button Click Doesn't Auto-Start

**Check**:
```javascript
// In handleStartBreak, verify:
timer.switchMode(breakType);
timer.start();  // <-- This line must exist

// In handleSkipBreak, verify:
timer.switchMode('focus');
timer.start();  // <-- This line must exist
```

**Verify**: Add `console.log(timer.status)` after each line

---

### Issue: Session Count Wrong After Skip

**Check**: Verify `handleSkipBreak` does NOT call `onComplete()` or `timer.skip()`

**Expected pattern**:
```typescript
// Correct:
timer.switchMode('focus');
timer.start();

// Wrong (causes duplicate count):
timer.skip();  // <-- Should NOT be here
onComplete('break');  // <-- Should NOT be here
```

---

## Summary

**Total Test Time**: ~15-20 minutes for all scenarios  
**Quick Test Time**: ~5 minutes for checklist only

**Critical Tests** (must pass):
1. ✅ Auto-transition on focus complete
2. ✅ No double-click on "Start Break"
3. ✅ No double-click on "Skip Break"

**Important Tests** (should pass):
4. ✅ Long break after 4th focus
5. ✅ Persistence across refresh

**Regression Tests** (must pass):
6. ✅ Bug 1: Timer accuracy preserved
7. ✅ Bug 2: No duplicate counts
8. ✅ Bug 3: Persistent UI works

**Next Step**: Run `/speckit.tasks` to generate implementation task breakdown


