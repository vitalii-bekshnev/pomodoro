/**
 * Unit tests for useSessionTracking hook
 */

import { renderHook, act } from '@testing-library/react';
import { useSessionTracking } from '../../../src/hooks/useSessionTracking';

describe('useSessionTracking', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should initialize with zero completed count and cycle position', () => {
    const { result } = renderHook(() => useSessionTracking());

    expect(result.current.completedCount).toBe(0);
    expect(result.current.cyclePosition).toBe(0);
  });

  it('should increment session count and cycle position', () => {
    const { result } = renderHook(() => useSessionTracking());

    act(() => {
      result.current.incrementSession();
    });

    expect(result.current.completedCount).toBe(1);
    expect(result.current.cyclePosition).toBe(1);
  });

  it('should return short-break for positions 1-3', () => {
    const { result } = renderHook(() => useSessionTracking());

    // Position 0 (before any completion)
    expect(result.current.getNextBreakMode()).toBe('short-break');

    act(() => {
      result.current.incrementSession(); // Position 1
    });
    expect(result.current.getNextBreakMode()).toBe('short-break');

    act(() => {
      result.current.incrementSession(); // Position 2
    });
    expect(result.current.getNextBreakMode()).toBe('short-break');

    act(() => {
      result.current.incrementSession(); // Position 3
    });
    expect(result.current.getNextBreakMode()).toBe('short-break');
  });

  it('should return long-break after 4th session (position 0)', () => {
    const { result } = renderHook(() => useSessionTracking());

    // Complete 4 sessions
    act(() => {
      result.current.incrementSession(); // Position 1
      result.current.incrementSession(); // Position 2
      result.current.incrementSession(); // Position 3
      result.current.incrementSession(); // Position 0 (wraps around)
    });

    expect(result.current.completedCount).toBe(4);
    expect(result.current.cyclePosition).toBe(0);
    expect(result.current.getNextBreakMode()).toBe('long-break');
  });

  it('should reset cycle to 0 when resetCycle is called', () => {
    const { result } = renderHook(() => useSessionTracking());

    act(() => {
      result.current.incrementSession();
      result.current.incrementSession();
    });

    expect(result.current.cyclePosition).toBe(2);

    act(() => {
      result.current.resetCycle();
    });

    expect(result.current.cyclePosition).toBe(0);
    expect(result.current.completedCount).toBe(2); // Count should remain
  });

  it('should persist progress to localStorage', () => {
    const { result } = renderHook(() => useSessionTracking());

    act(() => {
      result.current.incrementSession();
    });

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should reset count at midnight (new day)', () => {
    // Create progress from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const oldProgress = {
      date: yesterdayStr,
      completedCount: 5,
      cyclePosition: 2,
      lastUpdated: yesterday.getTime(),
    };

    localStorage.setItem('pomodoro_daily_progress', JSON.stringify(oldProgress));

    const { result } = renderHook(() => useSessionTracking());

    // Should have reset to 0 for new day
    expect(result.current.completedCount).toBe(0);
    expect(result.current.cyclePosition).toBe(0);
  });
});

