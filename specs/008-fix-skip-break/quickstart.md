# Quick Start Guide: Fix Skip Break Button Behavior

**Feature**: 008-fix-skip-break  
**Created**: December 21, 2025  
**Estimated Time**: 30-45 minutes (implementation + testing)

## Overview

This guide walks through implementing the fix for the Skip Break button bug where clicking "Skip Break" during a break timer leaves the user stuck in break state at 00:00 with no way to continue.

**Root Cause**: Two issues:
1. Skip Break button only visible when `status === 'running'` (too restrictive)
2. Skip break handler calls `timer.skip()` which completes break but doesn't transition to focus

**Solution**:
1. Update button visibility to show for all break states (running, paused, completed)
2. Modify skip handler to transition break → focus and auto-start

## Prerequisites

- [x] Specification reviewed ([spec.md](./spec.md))
- [x] Research completed ([research.md](./research.md))
- [x] Contracts defined ([contracts/timer-transitions.md](./contracts/timer-transitions.md))
- [x] Development environment ready (Node.js, npm installed)
- [x] Project dependencies installed (`npm install`)

## Implementation Steps

### Step 1: Update Skip Break Button Visibility (5 minutes)

**File**: `src/components/Timer/TimerControls.tsx`

**Location**: Lines 140-149

**Current Code**:
```typescript
{status === 'running' && (
  <button
    className="control-button secondary"
    onClick={handleSkip}
    disabled={isDisabled}
    title={mode === 'focus' ? 'Skip focus session' : 'Skip break'}
  >
    {mode === 'focus' ? 'Skip Focus' : 'Skip Break'}
  </button>
)}
```

**Updated Code**:
```typescript
{/* Skip Focus button - only during running focus */}
{mode === 'focus' && status === 'running' && (
  <button
    className="control-button secondary"
    onClick={handleSkip}
    disabled={isDisabled}
    title="Skip focus session"
  >
    Skip Focus
  </button>
)}

{/* Skip Break button - during any break (not idle) */}
{(mode === 'short-break' || mode === 'long-break') && status !== 'idle' && (
  <button
    className="control-button secondary"
    onClick={handleSkip}
    disabled={isDisabled}
    title="Skip break and start next focus session"
  >
    Skip Break
  </button>
)}
```

**Changes**:
- Split into two separate button renders for clarity
- Skip Focus: Only shows when `mode === 'focus' && status === 'running'`
- Skip Break: Shows when in break mode (`short-break` or `long-break`) and `status !== 'idle'`
- Added descriptive title attributes

**Verification**:
```bash
npm run typecheck  # Should pass with no errors
```

---

### Step 2: Fix Skip Break Handler Logic (10 minutes)

**File**: `src/components/App.tsx`

**Location**: Lines 103-109

**Current Code**:
```typescript
const handleSkip = useCallback(() => {
  if (timer.mode === 'focus') {
    // Reset cycle when skipping focus session
    resetCycle();
  }
  timer.skip();
}, [timer, resetCycle]);
```

**Updated Code**:
```typescript
const handleSkip = useCallback(() => {
  if (timer.mode === 'focus') {
    // Skip focus: reset cycle and complete session
    resetCycle();
    timer.skip();
  } else {
    // Skip break: transition to focus and auto-start
    timer.switchMode('focus');
    timer.start();
  }
}, [timer, resetCycle]);
```

**Changes**:
- Added `else` branch to handle break mode
- Break skip calls `switchMode('focus')` then `start()` instead of `skip()`
- Preserves existing focus skip behavior (reset cycle + complete)

**Rationale**:
- `timer.skip()` completes the current session but stays in same mode
- For breaks, we want to transition to focus AND start running immediately
- This matches the existing `handleSkipBreak` function (lines 126-130) but is now called from TimerControls too

**Verification**:
```bash
npm run typecheck  # Should pass with no errors
npm run lint       # Should pass with no warnings
```

---

### Step 3: Add Unit Tests (15 minutes)

**File**: `tests/unit/components/App.test.tsx` (create if doesn't exist)

**Test Cases**:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../../src/components/App';

describe('App - Skip Break Functionality', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('Skip Break button transitions to running focus timer', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Start focus timer
    const startButton = screen.getByText('Start Focus');
    await user.click(startButton);

    // Skip to trigger break
    const skipFocusButton = screen.getByText('Skip Focus');
    await user.click(skipFocusButton);

    // Wait for break state
    await waitFor(() => {
      expect(screen.getByText(/Start.*Break/)).toBeInTheDocument();
    });

    // Start break timer
    const startBreakButton = screen.getByText(/Start.*Break/);
    await user.click(startBreakButton);

    // Wait for Skip Break button to appear
    await waitFor(() => {
      expect(screen.getByText('Skip Break')).toBeInTheDocument();
    });

    // Click Skip Break
    const skipBreakButton = screen.getByText('Skip Break');
    await user.click(skipBreakButton);

    // Verify focus timer is now running
    await waitFor(() => {
      expect(screen.getByText('25:00')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });
  });

  test('Skip Break button not visible when break is idle', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Start and skip focus to get to break pending state
    const startButton = screen.getByText('Start Focus');
    await user.click(startButton);

    const skipFocusButton = screen.getByText('Skip Focus');
    await user.click(skipFocusButton);

    // Break is now pending (idle state)
    await waitFor(() => {
      expect(screen.getByText(/Start.*Break/)).toBeInTheDocument();
    });

    // Skip Break button should NOT be visible (status is idle)
    expect(screen.queryByText('Skip Break')).not.toBeInTheDocument();
  });

  test('Skip Break from paused break starts focus timer', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Get to break and start it
    await user.click(screen.getByText('Start Focus'));
    await user.click(screen.getByText('Skip Focus'));
    
    await waitFor(() => {
      expect(screen.getByText(/Start.*Break/)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/Start.*Break/));

    // Pause the break
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Pause'));

    // Wait for Skip Break button (should be visible when paused)
    await waitFor(() => {
      expect(screen.getByText('Skip Break')).toBeInTheDocument();
    });

    // Click Skip Break
    await user.click(screen.getByText('Skip Break'));

    // Verify focus timer is running
    await waitFor(() => {
      expect(screen.getByText('25:00')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });
  });
});
```

**Run Tests**:
```bash
npm run test:once
```

**Expected**: All tests pass

---

### Step 4: Add Integration Test (10 minutes)

**File**: `tests/integration/SkipBreakTransition.test.tsx` (create new file)

**Test Case**:

```typescript
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/components/App';

describe('Skip Break Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Full flow: focus → break → skip break → focus running', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // 1. Start focus timer
    await user.click(screen.getByText('Start Focus'));
    
    expect(screen.getByText('Pause')).toBeInTheDocument();

    // 2. Fast-forward to complete focus (25 minutes)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // 3. Focus completes, break should be offered
    await waitFor(() => {
      expect(screen.getByText(/Start.*Break/)).toBeInTheDocument();
    });

    // 4. Start the break
    await user.click(screen.getByText(/Start.*Break/));

    // 5. Break is running, Skip Break button should appear
    await waitFor(() => {
      expect(screen.getByText('Skip Break')).toBeInTheDocument();
    });

    // 6. Click Skip Break
    await user.click(screen.getByText('Skip Break'));

    // 7. Verify focus timer is running immediately
    await waitFor(() => {
      // Timer should show 25:00 (full focus duration)
      expect(screen.getByText('25:00')).toBeInTheDocument();
      // Pause button should be visible (timer is running)
      expect(screen.getByText('Pause')).toBeInTheDocument();
      // Skip Break button should be gone (now in focus mode)
      expect(screen.queryByText('Skip Break')).not.toBeInTheDocument();
    });

    // 8. Verify state persists across refresh
    const { unmount } = render(<App />);
    unmount();

    // Render again (simulating page refresh)
    render(<App />);

    await waitFor(() => {
      // Should still be in focus mode, running
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.queryByText('Skip Break')).not.toBeInTheDocument();
    });
  });

  test('Session tracking: skip break does not affect Pomodoro count', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // Complete first focus
    await user.click(screen.getByText('Start Focus'));
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Skip break
    await waitFor(() => {
      expect(screen.getByText(/Start.*Break/)).toBeInTheDocument();
    });
    await user.click(screen.getByText(/Start.*Break/));
    
    await waitFor(() => {
      expect(screen.getByText('Skip Break')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Skip Break'));

    // Check footer shows 1 Pomodoro (not 2)
    await waitFor(() => {
      expect(screen.getByText('1 Pomodoro completed today')).toBeInTheDocument();
    });

    // Cycle indicator should show 1/4
    expect(screen.getByText('1/4')).toBeInTheDocument();
  });
});
```

**Run Integration Tests**:
```bash
npm run test:once -- tests/integration/SkipBreakTransition.test.tsx
```

**Expected**: All integration tests pass

---

## Manual Testing Checklist

### Test Scenario 1: Skip During Active Break

**Steps**:
1. Open app in browser: `npm run dev`
2. Click "Start Focus"
3. Click "Skip Focus" immediately
4. Click "Start Break" (break timer starts)
5. While break is running, click "Skip Break"

**Expected**:
- ✅ Focus timer immediately shows 25:00
- ✅ Timer is running (counting down)
- ✅ "Pause" button visible
- ✅ "Skip Break" button no longer visible
- ✅ Footer shows Pomodoro count unchanged

---

### Test Scenario 2: Skip From Paused Break

**Steps**:
1. Start focus timer
2. Skip focus
3. Start break timer
4. Click "Pause" (break timer paused)
5. Click "Skip Break"

**Expected**:
- ✅ Focus timer shows 25:00 and is running (not paused)
- ✅ Transition is immediate (< 100ms)

---

### Test Scenario 3: Button Visibility Rules

**Steps**:
1. Start app (focus idle) → "Skip Break" should NOT be visible
2. Start focus (focus running) → "Skip Focus" should be visible
3. Skip focus (break pending/idle) → "Skip Break" should NOT be visible
4. Start break (break running) → "Skip Break" should be visible
5. Pause break (break paused) → "Skip Break" should be visible
6. Let break complete (break completed) → "Skip Break" should be visible

**Expected**: ✅ All visibility rules correct

---

### Test Scenario 4: Page Refresh During Skip

**Steps**:
1. Start break timer
2. Click "Skip Break"
3. Immediately press F5 (refresh) within 1 second

**Expected**:
- ✅ Page reloads with focus timer running
- ✅ Time is approximately 25:00 (minus ~1 second)
- ✅ No stuck state or error

---

### Test Scenario 5: Rapid Clicking (Debouncing)

**Steps**:
1. Start break timer
2. Rapidly click "Skip Break" 5 times within 1 second

**Expected**:
- ✅ Only first click processes
- ✅ Button becomes disabled
- ✅ Timer switches to focus once
- ✅ No error or multiple transitions

---

### Test Scenario 6: Session Tracking Accuracy

**Steps**:
1. Complete focus #1 → count = 1, cycle = 1/4
2. Skip break #1
3. Complete focus #2 → count = 2, cycle = 2/4
4. Skip break #2
5. Complete focus #3 → count = 3, cycle = 3/4
6. Skip break #3
7. Complete focus #4 → count = 4, cycle = 4/4

**Expected**:
- ✅ After 4th focus, system offers **long break** (15 min) not short break
- ✅ Skipping breaks doesn't affect cycle progression
- ✅ Footer shows correct Pomodoro count throughout

---

## Verification Commands

### Run All Tests
```bash
npm run test:once
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Type Check
```bash
npm run typecheck
```

### Lint
```bash
npm run lint
```

### Build Production
```bash
npm run build
```

**Expected**: All commands succeed with no errors

---

## Troubleshooting

### Issue: "Skip Break" button doesn't appear

**Possible Causes**:
1. Break timer is in 'idle' state (button intentionally hidden)
2. Mode is 'focus' not break
3. Button visibility logic not updated correctly

**Debug**:
```typescript
// Add console.log in TimerControls.tsx
console.log('Mode:', mode, 'Status:', status);
// Should show mode='short-break' or 'long-break', status='running'/'paused'/'completed'
```

---

### Issue: Clicking "Skip Break" doesn't start focus timer

**Possible Causes**:
1. Handler logic not updated in `App.tsx`
2. `timer.switchMode` or `timer.start` not working

**Debug**:
```typescript
// Add console.log in handleSkip (App.tsx)
const handleSkip = useCallback(() => {
  console.log('Skip called, mode:', timer.mode);
  if (timer.mode === 'focus') {
    resetCycle();
    timer.skip();
  } else {
    console.log('Calling switchMode and start');
    timer.switchMode('focus');
    timer.start();
  }
}, [timer, resetCycle]);
```

---

### Issue: Tests fail with "localStorage is not defined"

**Solution**: Ensure jest config includes localStorage mock

**File**: `jest.config.cjs`

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // ...
};
```

**File**: `src/setupTests.ts`

```typescript
import '@testing-library/jest-dom';

// Mock localStorage if not already done
if (!global.localStorage) {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}
```

---

## Rollback Plan

If issues arise after deployment:

### Step 1: Revert Code Changes
```bash
git revert HEAD  # Reverts last commit
```

### Step 2: Verify Rollback
```bash
npm run test:once
npm run build
```

### Step 3: Redeploy Previous Version
```bash
npm run build
# Deploy dist/ folder to production
```

---

## Success Criteria

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Manual test scenarios pass (6/6)
- ✅ Type check passes with no errors
- ✅ Linter passes with no warnings
- ✅ No regressions in existing functionality
- ✅ Skip Break button visible during all break states except idle
- ✅ Clicking Skip Break immediately starts focus timer
- ✅ Session tracking remains accurate
- ✅ State persists correctly across page refresh

---

## Next Steps

After successful implementation and testing:

1. **Commit Changes**
```bash
git add src/components/Timer/TimerControls.tsx
git add src/components/App.tsx
git add tests/unit/components/App.test.tsx
git add tests/integration/SkipBreakTransition.test.tsx
git commit -m "Fix Skip Break button behavior

- Update button visibility to show for all break states (not just running)
- Modify skip handler to transition break to focus and auto-start
- Add unit and integration tests for skip break functionality

Fixes: Skip Break button leaving user stuck in break state at 00:00"
```

2. **Push to Remote**
```bash
git push origin 008-fix-skip-break
```

3. **Create Pull Request**
- Title: "Fix Skip Break Button Behavior"
- Description: Link to spec.md and list changes
- Assign reviewers

4. **Deploy to Production** (after PR approval)
```bash
npm run build
# Deploy dist/ folder
```

---

## Resources

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Contracts**: [contracts/timer-transitions.md](./contracts/timer-transitions.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Project README**: [../../README.md](../../README.md)

---

## Support

If you encounter issues not covered in this guide:

1. Check existing test files for examples
2. Review research.md for detailed analysis
3. Consult contracts/timer-transitions.md for expected behavior
4. Check browser console for runtime errors
5. Use React DevTools to inspect component state

**Estimated Total Time**: 30-45 minutes for experienced developer, 60-90 minutes for someone new to the codebase.
