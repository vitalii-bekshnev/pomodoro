/**
 * useSessionTracking hook
 * 
 * Tracks daily completed Pomodoros and 4-session cycle position
 */

import { useState, useEffect, useCallback } from 'react';
import {
  DailyProgress,
  DEFAULT_DAILY_PROGRESS,
  isDailyProgressCurrent,
  resetDailyProgress,
} from '../types/session';
import { TimerMode } from '../types/timer';
import { STORAGE_KEYS, SESSIONS_BEFORE_LONG_BREAK } from '../constants/defaults';
import { getStorageItem, setStorageItem } from '../utils/storage';

export interface UseSessionTrackingReturn {
  completedCount: number;
  cyclePosition: number;
  incrementSession: () => void;
  resetCycle: () => void;
  getNextBreakMode: () => TimerMode;
  resetProgress: () => void;
}

export function useSessionTracking(): UseSessionTrackingReturn {
  // Load initial progress from localStorage or use default
  const [progress, setProgress] = useState<DailyProgress>(() => {
    const saved = getStorageItem<DailyProgress>(
      STORAGE_KEYS.DAILY_PROGRESS,
      DEFAULT_DAILY_PROGRESS
    );

    // Check if progress is from today
    if (!isDailyProgressCurrent(saved)) {
      // It's a new day, reset progress
      return resetDailyProgress();
    }

    return saved;
  });

  // Persist progress to localStorage whenever it changes
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.DAILY_PROGRESS, progress);
  }, [progress]);

  // Check for day change periodically (every minute)
  useEffect(() => {
    const checkDayChange = () => {
      if (!isDailyProgressCurrent(progress)) {
        setProgress(resetDailyProgress());
      }
    };

    const interval = setInterval(checkDayChange, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [progress]);

  // Increment session (called when focus session completes)
  const incrementSession = useCallback(() => {
    setProgress((prev) => {
      const newCount = prev.completedCount + 1;
      const newPosition = (prev.cyclePosition + 1) % SESSIONS_BEFORE_LONG_BREAK;

      return {
        ...prev,
        completedCount: newCount,
        cyclePosition: newPosition,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  // Reset cycle to 0 (called when user skips focus session)
  const resetCycle = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      cyclePosition: 0,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Get next break mode based on current cycle position
  const getNextBreakMode = useCallback((): TimerMode => {
    // After completing 4th session, cycle position wraps to 0
    // At position 0, we should offer long break
    if (progress.cyclePosition === 0 && progress.completedCount > 0) {
      return 'long-break';
    }
    return 'short-break';
  }, [progress.cyclePosition, progress.completedCount]);

  // Manually reset all progress
  const resetProgress = useCallback(() => {
    setProgress(resetDailyProgress());
  }, []);

  return {
    completedCount: progress.completedCount,
    cyclePosition: progress.cyclePosition,
    incrementSession,
    resetCycle,
    getNextBreakMode,
    resetProgress,
  };
}

