# Quickstart Guide: Timer State Bug Fixes Testing

**Feature**: `007-fix-timer-state-bugs`  
**Date**: December 19, 2025  
**Purpose**: Quick setup and testing guide for all 4 bug fixes

---

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Browser with localStorage enabled
- Dev tools (browser console) for debugging

---

## Development Setup

### 1. Start Development Server

```bash
cd /Users/vitaliibekshnev/Source/Personal/pomodoro
npm run dev
```

Application runs at: `http://localhost:5173`

### 2. Open Browser Dev Tools

- **Chrome/Edge**: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

---

## Bug 1: Timer 2-Second Jump Fix ⏱️

**Problem**: Timer jumps 2 seconds forward on refresh (24:35 → 24:37)

**Test Scenario**:
1. Start focus timer (click "Start Focus")
2. Wait until timer shows 24:35 remaining (or any specific time)
3. Note the exact time shown
4. **Refresh page** (F5 or Ctrl+R)
5. **Expected**: Timer shows same time ±1 second (e.g., 24:34 to 24:36)
6. **Bug (Before Fix)**: Timer shows 24:37 (2 seconds forward)

**Verification Steps**:
```javascript
// In browser console BEFORE refresh
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
console.log('Before refresh:', {
  remaining: Math.floor(state.remaining / 1000), // seconds
  startedAt: state.startedAt,
  duration: state.duration
});

// After refresh, check again
const newState = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
const elapsed = Date.now() - newState.startedAt;
const expectedRemaining = (newState.duration - elapsed) / 1000;
console.log('After refresh:', {
  displayedRemaining: Math.floor(newState.remaining / 1000),
  expectedRemaining: Math.floor(expectedRemaining),
  error: Math.abs((newState.remaining / 1000) - expectedRemaining)
});
// Error should be < 1 second
```

**Success Criteria**:
- ✅ Refresh doesn't cause 2-second jump
- ✅ Timer accuracy within ±1 second
- ✅ Multiple refreshes don't cause cumulative errors

---

## Bug 2: Duplicate Session Count Fix 🔢

**Problem**: Refreshing after completion increments count by 2 each time

**Test Scenario**:
1. Start fresh (clear localStorage or use incognito)
2. Complete 1 Pomodoro (let timer reach 0:00 OR click "Skip")
3. Verify count shows 1 on screen
4. **DO NOT click any buttons** (leave notification showing)
5. **Refresh page 5 times** (F5, F5, F5, F5, F5)
6. **Expected**: Count still shows 1
7. **Bug (Before Fix)**: Count shows 3, 5, 7, 11, etc. (increments on each refresh)

**Verification Steps**:
```javascript
// After completing timer, check localStorage
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
console.log('Timer state:', {
  status: state.status,
  sessionId: state.sessionId
});

const completion = JSON.parse(localStorage.getItem('pomodoro_last_completion'));
console.log('Last completion:', completion);

// After each refresh, check if completion record matches
// Should be the same sessionId, not a new one
```

**Success Criteria**:
- ✅ Count remains 1 after 5 refreshes
- ✅ `last_completion` in localStorage has matching sessionId
- ✅ No increments on refresh, only on actual completions

---

## Bug 3: Persistent Break Start UI 🔘

**Problem**: After dismissing notification, no way to start break

**Test Scenario**:
1. Complete focus session (let timer reach 0:00)
2. Notification appears with "Start Break" button
3. **Dismiss notification** (click X or wait for auto-dismiss)
4. **Expected**: Persistent "Start Break" button/banner visible below timer
5. **Bug (Before Fix)**: No UI element to start break, user stuck
6. Click persistent "Start Break" button
7. **Expected**: Appropriate break timer starts (short or long based on cycle)

**UI Check**:
```javascript
// After dismissing notification, check for persistent UI
document.querySelector('.break-pending-actions');
// Should exist and be visible

// Check buttons
document.querySelectorAll('.break-pending-actions button');
// Should have 2 buttons: "Start Break" and "Skip Break"
```

**Test with Refresh**:
1. Complete timer → dismiss notification
2. **Refresh page**
3. **Expected**: "Start Break" UI still visible and functional
4. Click button → break starts

**Success Criteria**:
- ✅ Persistent break start UI visible after notification dismissed
- ✅ UI persists across page refreshes
- ✅ Clicking button starts appropriate break (short/long)
- ✅ UI disappears after break starts

---

## Bug 4: Skip Break Functionality 🚀

**Problem**: "Start Focus" button doesn't work after completion

**Test Scenario**:
1. Complete focus session
2. Notification shows (or use persistent UI from Bug 3 fix)
3. Click "Skip Break - Start Focus" button
4. **Expected**: New focus timer starts immediately (25:00, running)
5. **Bug (Before Fix)**: Button does nothing, timer stays in completed state
6. Verify daily Pomodoro count incremented by 1

**Cycle Position Check**:
1. Complete 3 Pomodoros (skip breaks for faster testing)
2. After 3rd completion, verify cycle position = 3/4
3. Click "Skip Break - Start Focus" for 4th session
4. Complete 4th session
5. **Expected**: Long break offered (not short break)

**Verification Steps**:
```javascript
// After clicking "Skip Break"
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
console.log('After skip:', {
  status: state.status,        // Should be 'running'
  mode: state.mode,            // Should be 'focus'
  remaining: state.remaining,  // Should be ~1500000 (25 min)
  sessionId: state.sessionId   // Should be new ID
});

// Check session progress
const progress = JSON.parse(localStorage.getItem('pomodoro_session_progress'));
console.log('Session count:', progress.dailyCount);
// Should be incremented
```

**Success Criteria**:
- ✅ "Skip Break" button starts new focus timer
- ✅ Timer is running (not idle)
- ✅ Daily count incremented correctly
- ✅ Cycle position updated correctly (4/4 → long break next)
- ✅ All timer controls work (pause, reset, skip)

---

## Combined Test: Full Workflow ✅

**Test all 4 bugs in sequence**:

1. **Bug 1 Test**: Start timer → wait to 24:35 → refresh → verify 24:35 (±1s)
2. **Continue running** → let complete naturally
3. **Bug 2 Test**: After completion → refresh 5x → verify count = 1
4. **Bug 3 Test**: Dismiss notification → verify "Start Break" button → click → break starts
5. **Bug 4 Test**: Complete break → click "Skip Break" → new focus starts

**Rapid Testing Shortcuts**:
```javascript
// Set timer to 10 seconds for faster testing
localStorage.setItem('pomodoro_preferences', JSON.stringify({
  focusDuration: 0.17,  // ~10 seconds
  shortBreakDuration: 0.08,  // ~5 seconds
  longBreakDuration: 0.17,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundsEnabled: false
}));
// Refresh page to apply
```

---

## Debugging Tools

### Inspect Timer State

```javascript
// Current timer state
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
console.table(state);

// Completion record
const completion = JSON.parse(localStorage.getItem('pomodoro_last_completion'));
console.log('Last completion:', completion);

// Session progress
const progress = JSON.parse(localStorage.getItem('pomodoro_session_progress'));
console.log('Progress:', progress);
```

### Calculate Time Manually (Bug 1 Debugging)

```javascript
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
if (state.status === 'running' && state.startedAt) {
  const elapsedFromStart = Date.now() - state.startedAt;
  const expectedRemaining = state.duration - elapsedFromStart;
  const actualRemaining = state.remaining;
  const error = actualRemaining - expectedRemaining;
  
  console.log('Time calculation:', {
    elapsed: Math.floor(elapsedFromStart / 1000) + 's',
    expected: Math.floor(expectedRemaining / 1000) + 's',
    actual: Math.floor(actualRemaining / 1000) + 's',
    error: Math.floor(error / 1000) + 's'
  });
  
  if (Math.abs(error) > 2000) {
    console.warn('⚠️ Bug 1 detected: Time calculation error > 2 seconds');
  }
}
```

### Clear State for Fresh Test

```javascript
// Reset all timer state
localStorage.removeItem('pomodoro_timer_state');
localStorage.removeItem('pomodoro_last_completion');
localStorage.removeItem('pomodoro_session_progress');
// Refresh page
```

---

## Common Issues & Solutions

### Issue 1: Still seeing 2-second jump

**Check**:
```javascript
// Verify fix is applied
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
const elapsed = Date.now() - state.startedAt;
const calculated = state.duration - elapsed; // Should use duration, not remaining
console.log('Calculation uses duration?', calculated);
```

**Solution**: Ensure code uses `duration - elapsed`, not `remaining - elapsed`

---

### Issue 2: Count still incrementing on refresh

**Check**:
```javascript
// Verify sessionId exists
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
console.log('Has sessionId?', !!state.sessionId);

// Verify completion record exists
const completion = localStorage.getItem('pomodoro_last_completion');
console.log('Completion record exists?', !!completion);
```

**Solution**: Ensure sessionId generated on start, completion tracking implemented

---

### Issue 3: No persistent break button

**Check**:
```javascript
// Verify UI element exists
const ui = document.querySelector('.break-pending-actions');
console.log('Break UI exists?', !!ui);
console.log('Is visible?', ui && ui.offsetParent !== null);
```

**Solution**: Ensure component renders when `status === 'completed' && mode === 'focus'`

---

### Issue 4: Skip break not working

**Check**:
```javascript
// Verify function exists
const timer = /* access useTimer hook return */;
console.log('Has skipBreakAndStartFocus?', typeof timer.skipBreakAndStartFocus === 'function');
```

**Solution**: Ensure `skipBreakAndStartFocus` exported from useTimer and wired to button

---

## Automated Testing

### Run Unit Tests

```bash
npm run test:once
```

**Look for new tests**:
- `useTimer.test.ts` - Bug 1 & 2 tests
- `TimerBugFixes.test.tsx` - Integration tests for all bugs

### Run Specific Test File

```bash
npm test -- useTimer.test.ts
```

---

## Test Checklist

Before considering bugs fixed, verify:

### Bug 1: Time Accuracy
- [ ] Timer at 24:35 → refresh → shows 24:35 (±1s)
- [ ] Multiple refreshes don't cause cumulative errors
- [ ] Rapid refreshes (5x in a row) stay accurate
- [ ] Works for all 3 modes (focus, short break, long break)

### Bug 2: No Duplicate Counts
- [ ] Complete timer (count = 1)
- [ ] Refresh 5 times → count still = 1
- [ ] Complete 2nd timer → count = 2 (not 4)
- [ ] sessionId changes between sessions

### Bug 3: Persistent Break Start
- [ ] Dismiss notification → button visible
- [ ] Button persists across refresh
- [ ] Click button → break starts
- [ ] Button disappears after break starts

### Bug 4: Skip Break Works
- [ ] Click "Skip Break" → new focus starts
- [ ] Count incremented correctly
- [ ] Cycle position updated correctly
- [ ] All controls work after skip

---

**Status**: Quickstart guide complete, ready for implementation and testing

