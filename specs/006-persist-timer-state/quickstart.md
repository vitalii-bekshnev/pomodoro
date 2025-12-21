# Quickstart Guide: Timer State Persistence Testing

**Feature**: `006-persist-timer-state`  
**Date**: December 19, 2025  
**Purpose**: Quick setup and testing guide for timer state persistence

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
- **Safari**: `Cmd+Option+C` (enable Dev menu first in Preferences)

---

## Manual Testing Scenarios

### Test 1: Running Timer Persistence ⏱️

**Goal**: Verify running timer continues after page refresh.

**Steps**:
1. Start focus timer (click "Start Focus")
2. Wait 5 minutes (timer shows ~20:00 remaining)
3. Check localStorage in console:
   ```javascript
   JSON.parse(localStorage.getItem('pomodoro_timer_state'))
   ```
   Should show: `{ status: 'running', startedAt: <timestamp>, remaining: ~1200000, ... }`

4. **Refresh page** (F5 or Ctrl+R)
5. **Expected**: Timer continues from ~20 minutes remaining (may show ~19:59 due to refresh time)
6. **Verify**: No reset to 25:00

**Success Criteria**:
- ✅ Timer doesn't reset to 25:00
- ✅ Timer continues counting down from ~20 minutes
- ✅ Status shows "running" (pause button visible)

---

### Test 2: Paused Timer Persistence ⏸️

**Goal**: Verify paused timer maintains exact time after refresh.

**Steps**:
1. Start focus timer
2. Wait 10 minutes (timer shows 15:00 remaining)
3. Click "Pause"
4. Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('pomodoro_timer_state'))
   ```
   Should show: `{ status: 'paused', startedAt: null, remaining: 900000, ... }`

5. **Refresh page**
6. **Expected**: Timer shows exactly 15:00 in paused state
7. Click "Resume" → timer continues from 15:00

**Success Criteria**:
- ✅ Timer shows exactly 15:00 after refresh
- ✅ Status shows "paused" (resume button visible)
- ✅ Resume button works correctly
- ✅ No time lost or gained

---

### Test 3: Idle Timer Persistence 🆕

**Goal**: Verify idle timer with custom duration persists.

**Steps**:
1. Click settings ⚙️
2. Change focus duration to 30 minutes
3. Click "Save Changes"
4. **Don't start timer** (stays in idle state)
5. Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('pomodoro_timer_state'))
   ```
   Should show: `{ status: 'idle', duration: 1800000, remaining: 1800000, ... }`

6. **Refresh page**
7. **Expected**: Timer shows 30:00 in idle state

**Success Criteria**:
- ✅ Timer shows 30:00 (not default 25:00)
- ✅ Status shows "idle" (start button visible)
- ✅ Start button works correctly

---

### Test 4: Completed Timer During Refresh 🎯

**Goal**: Verify timer that completes while page is closed triggers notification.

**Steps**:
1. Start focus timer
2. Wait 1 minute
3. **Close browser tab completely**
4. Wait 25+ minutes (let timer complete while closed)
5. Reopen browser and navigate to app
6. **Expected**: 
   - Completion notification/banner shows
   - Timer shows idle state for short break
   - Daily Pomodoro count increased by 1

**Success Criteria**:
- ✅ Completion notification appears
- ✅ Timer transitions to next mode (short break)
- ✅ Session count incremented

**Alternative Quick Test** (simulate with console):
```javascript
// Manually set completed state
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
state.remaining = 100; // Very small remaining
state.startedAt = Date.now() - 30*60*1000; // 30 min ago
localStorage.setItem('pomodoro_timer_state', JSON.stringify(state));
// Refresh page → should trigger completion
```

---

### Test 5: Multiple Modes 🔄

**Goal**: Verify state persists across different timer modes.

**Steps**:
1. Start focus timer → wait 5 min → pause
2. Refresh → verify focus paused at ~20 min
3. Reset timer
4. Start short break (5 min) → wait 2 min → pause
5. Refresh → verify short break paused at ~3 min
6. Complete short break (or skip)
7. Long break appears → start → wait 3 min → pause
8. Refresh → verify long break paused at ~12 min

**Success Criteria**:
- ✅ Each mode persists correctly
- ✅ Mode transitions work after refresh
- ✅ No mode confusion (focus ≠ break)

---

## Automated Testing

### Run Unit Tests

```bash
npm run test:once
```

**Key Test Files**:
- `tests/unit/hooks/useTimer.test.ts` - Hook logic tests
- `tests/integration/TimerPersistence.test.tsx` - Full flow tests

**Look for tests**:
- ✅ `should restore running timer with calculated remaining time`
- ✅ `should restore paused timer with exact remaining time`
- ✅ `should handle timer completion during page close`
- ✅ `should handle corrupted localStorage gracefully`

### Run Specific Test Suite

```bash
npm test -- useTimer.test.ts
```

---

## Debugging Tools

### Inspect localStorage

**View Current State**:
```javascript
// In browser console
JSON.parse(localStorage.getItem('pomodoro_timer_state'))
```

**Expected Output**:
```json
{
  "mode": "focus",
  "duration": 1500000,
  "remaining": 900000,
  "status": "running",
  "startedAt": 1734615432000
}
```

### Calculate Time Manually

**Verify Elapsed Time Calculation**:
```javascript
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
const now = Date.now();
const elapsed = now - state.startedAt;
const calculatedRemaining = state.remaining - elapsed;
console.log('Elapsed (ms):', elapsed);
console.log('Elapsed (min):', Math.floor(elapsed / 60000));
console.log('Calculated Remaining (ms):', calculatedRemaining);
console.log('Calculated Remaining (min:sec):', 
  Math.floor(calculatedRemaining / 60000) + ':' + 
  Math.floor((calculatedRemaining % 60000) / 1000).toString().padStart(2, '0')
);
```

### Clear State for Fresh Test

```javascript
// Reset to default state
localStorage.removeItem('pomodoro_timer_state');
// Refresh page to start fresh
```

### Monitor State Changes

```javascript
// Watch for localStorage changes
window.addEventListener('storage', (e) => {
  if (e.key === 'pomodoro_timer_state') {
    console.log('Timer state changed:', JSON.parse(e.newValue));
  }
});
```

---

## Common Issues & Solutions

### Issue 1: Timer Resets on Refresh

**Symptom**: Timer goes back to 25:00 on refresh

**Causes**:
- Running timer not being saved (status === 'running' excluded from save)
- startedAt not set when timer starts
- localStorage blocked (private mode)

**Check**:
```javascript
// Verify state is being saved
localStorage.getItem('pomodoro_timer_state') !== null
```

**Solution**: Ensure all timer states are saved (not just paused/idle).

---

### Issue 2: Wrong Time After Refresh

**Symptom**: Timer shows incorrect remaining time

**Causes**:
- startedAt not accurate
- Calculation error in restore logic
- System clock changed

**Check**:
```javascript
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
console.log('StartedAt:', new Date(state.startedAt));
console.log('Now:', new Date());
console.log('Diff (min):', (Date.now() - state.startedAt) / 60000);
```

**Solution**: Verify elapsed time calculation matches wall-clock time.

---

### Issue 3: Paused Timer Changes Time

**Symptom**: Paused timer shows different time after refresh

**Cause**: Wall-clock calculation applied to paused timer (incorrect)

**Check**:
```javascript
const state = JSON.parse(localStorage.getItem('pomodoro_timer_state'));
console.log('Status:', state.status);
console.log('StartedAt:', state.startedAt); // Should be null for paused
```

**Solution**: Paused timers should NOT use elapsed time calculation.

---

### Issue 4: Completion Not Triggered

**Symptom**: Timer that completed while page closed doesn't show notification

**Cause**: Completion detection not implemented in restore logic

**Check**: Close tab with 1 min remaining, wait 2 min, reopen

**Solution**: Check if `remaining <= 0` after calculation, call `onComplete()`.

---

## Performance Verification

### Measure Restore Time

```javascript
// In browser console before refresh
performance.mark('before-refresh');

// After refresh, immediately:
performance.mark('after-refresh');
performance.measure('restore-time', 'before-refresh', 'after-refresh');
console.log(performance.getEntriesByName('restore-time')[0].duration, 'ms');
// Should be < 100ms
```

### Check localStorage Write Performance

```javascript
// Time a save operation
const state = { /* ... timer state ... */ };
console.time('save');
localStorage.setItem('pomodoro_timer_state', JSON.stringify(state));
console.timeEnd('save');
// Should be < 1ms
```

---

## Test Checklist

Before considering feature complete, verify:

- [ ] Running focus timer persists across refresh
- [ ] Running short break persists across refresh
- [ ] Running long break persists across refresh
- [ ] Paused timer maintains exact time across refresh
- [ ] Idle timer maintains mode and custom duration
- [ ] Timer completed during page close triggers notification
- [ ] Session count persists across refreshes
- [ ] Cycle position persists across refreshes
- [ ] Cleared localStorage degrades gracefully
- [ ] Multiple refreshes don't cause issues
- [ ] Resume button works after restoring paused timer
- [ ] Reset button works after restoring any state
- [ ] Mode switching works after restore

---

## Next Steps

After manual testing passes:

1. Run full test suite: `npm run test`
2. Check for console errors/warnings
3. Test on multiple browsers (Chrome, Firefox, Safari)
4. Test in private/incognito mode (expect no persistence)
5. Verify no performance regression
6. Ready for code review

---

**Status**: Quickstart guide complete, ready for testing

