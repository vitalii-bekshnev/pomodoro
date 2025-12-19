/**
 * Unit tests for useTimer hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimer } from '../../../src/hooks/useTimer';
import { DEFAULT_PREFERENCES } from '../../../src/types/settings';

// Mock timers
jest.useFakeTimers();

describe('useTimer', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('should initialize with default focus mode and idle status', () => {
    const { result } = renderHook(() =>
      useTimer(DEFAULT_PREFERENCES, mockOnComplete)
    );

    expect(result.current.mode).toBe('focus');
    expect(result.current.status).toBe('idle');
    expect(result.current.remaining).toBe(25 * 60 * 1000); // 25 minutes in ms
    expect(result.current.duration).toBe(25 * 60 * 1000);
  });

  it('should start timer and change status to running', () => {
    const { result } = renderHook(() =>
      useTimer(DEFAULT_PREFERENCES, mockOnComplete)
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe('running');
  });

  it('should pause timer and preserve remaining time', () => {
    const { result } = renderHook(() =>
      useTimer(DEFAULT_PREFERENCES, mockOnComplete)
    );

    act(() => {
      result.current.start();
    });

    // Advance time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const remainingBeforePause = result.current.remaining;

    act(() => {
      result.current.pause();
    });

    expect(result.current.status).toBe('paused');
    expect(result.current.remaining).toBeLessThan(25 * 60 * 1000);
    expect(result.current.remaining).toBe(remainingBeforePause);
  });

  it('should resume timer from paused state', () => {
    const { result } = renderHook(() =>
      useTimer(DEFAULT_PREFERENCES, mockOnComplete)
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.pause();
    });

    const remainingAfterPause = result.current.remaining;

    act(() => {
      result.current.resume();
    });

    expect(result.current.status).toBe('running');
    expect(result.current.remaining).toBeLessThanOrEqual(remainingAfterPause);
  });

  it('should reset timer to initial duration', () => {
    const { result } = renderHook(() =>
      useTimer(DEFAULT_PREFERENCES, mockOnComplete)
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(5000); // 5 seconds
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.remaining).toBe(25 * 60 * 1000);
  });

  it('should call onComplete when timer reaches zero', async () => {
    const { result } = renderHook(() =>
      useTimer(DEFAULT_PREFERENCES, mockOnComplete)
    );

    act(() => {
      result.current.start();
    });

    // Fast-forward to completion (25 minutes)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000 + 1000);
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('focus');
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.remaining).toBe(0);
  });

  it('should persist timer state to localStorage on pause', () => {
    const { result } = renderHook(() =>
      useTimer(DEFAULT_PREFERENCES, mockOnComplete)
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.pause();
    });

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should use custom focus duration from preferences', () => {
    const customPreferences = {
      ...DEFAULT_PREFERENCES,
      focusDuration: 30, // 30 minutes
    };

    const { result } = renderHook(() =>
      useTimer(customPreferences, mockOnComplete)
    );

    expect(result.current.duration).toBe(30 * 60 * 1000);
    expect(result.current.remaining).toBe(30 * 60 * 1000);
  });
});

