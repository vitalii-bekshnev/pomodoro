/**
 * useTimer hook - Core timer logic
 *
 * Handles countdown, mode switching, state persistence
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerStatus, TimerSession, DEFAULT_TIMER_SESSION, CompletionRecord } from '../types/timer';
import { UserPreferences } from '../types/settings';
import { minutesToMilliseconds } from '../utils/time';
import { STORAGE_KEYS } from '../constants/defaults';
import { getStorageItem, setStorageItem } from '../utils/storage';

export interface UseTimerReturn {
  mode: TimerMode;
  remaining: number;
  duration: number;
  status: TimerStatus;
  sessionId: string; // Exposed for debugging (Bug 2 fix)
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  skipManual: () => void; // Skip without triggering onComplete callback
  switchMode: (mode: TimerMode, autoStart?: boolean) => void;
}

export function useTimer(
  preferences: UserPreferences,
  onComplete: (completedMode: TimerMode) => void
): UseTimerReturn {
  // Calculate update interval based on Big View mode
  // Big View: 10ms (100Hz) for centiseconds precision
  // Regular: 100ms (10Hz) for standard display
  const updateInterval = preferences.bigViewEnabled ? 10 : 100;

  // Load initial state from localStorage or use default
  const [session, setSession] = useState<TimerSession>(() => {
    const saved = getStorageItem<TimerSession>(
      STORAGE_KEYS.TIMER_STATE,
      DEFAULT_TIMER_SESSION
    );
    
    // Handle backwards compatibility: add sessionId if missing
    if (!saved.sessionId) {
      saved.sessionId = `${Date.now()}-${saved.mode}-migrated`;
    }
    
    // Update duration based on preferences if mode matches
    const duration = getDurationForMode(saved.mode, preferences);
    
    // Handle running timer restore with wall-clock calculation
    if (saved.status === 'running' && saved.startedAt !== null) {
      const elapsedTime = Date.now() - saved.startedAt;
      const calculatedRemaining = saved.remaining - elapsedTime;
      
      // Clamp remaining time to valid range [0, duration]
      const remaining = Math.min(
        Math.max(0, calculatedRemaining),
        duration
      );
      
      if (remaining === 0) {
        // Timer completed while page was closed
        return {
          ...saved,
          duration,
          remaining: 0,
          status: 'completed',
        };
      }
      
      // Continue running with adjusted remaining time
      return {
        ...saved,
        duration,
        remaining,
        status: 'running',
      };
    }
    
    // Paused or idle: restore exact state without wall-clock calculation
    return {
      ...saved,
      duration,
      // Reset remaining if it's greater than new duration
      remaining: Math.min(saved.remaining, duration),
    };
  });

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  // Helper to get duration for a mode
  function getDurationForMode(mode: TimerMode, prefs: UserPreferences): number {
    switch (mode) {
      case 'focus':
        return minutesToMilliseconds(prefs.focusDuration);
      case 'short-break':
        return minutesToMilliseconds(prefs.shortBreakDuration);
      case 'long-break':
        return minutesToMilliseconds(prefs.longBreakDuration);
    }
  }

  // Persist session to localStorage whenever it changes
  // Save ALL states including running (with startedAt timestamp for restore calculation)
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.TIMER_STATE, session);
  }, [session]);

  // Handle timer that completed while page was closed/refreshed
  // Check completion tracking to prevent duplicate onComplete() calls (Bug 2 fix)
  useEffect(() => {
    if (session.status === 'completed' && session.remaining === 0) {
      // Load last completion record to check if this session was already processed
      const lastCompletion = getStorageItem<CompletionRecord | null>(
        STORAGE_KEYS.LAST_COMPLETION,
        null
      );
      
      // Check if this completion was already processed
      const isAlreadyProcessed = 
        lastCompletion !== null && 
        lastCompletion.sessionId === session.sessionId;
      
      if (!isAlreadyProcessed) {
        // First time processing this completion
        onComplete(session.mode);
        
        // Save completion record to prevent duplicate processing on future refreshes
        setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
          sessionId: session.sessionId,
          completedAt: Date.now(),
          mode: session.mode,
        });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Run once on mount only to trigger completion notification for timers that finished while closed

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start timer
  const start = useCallback(() => {
    if (session.status === 'running') return;

    startTimeRef.current = Date.now();
    elapsedRef.current = session.duration - session.remaining;

    setSession((prev) => ({
      ...prev,
      status: 'running',
      startedAt: Date.now(),
      sessionId: `${Date.now()}-${prev.mode}`, // Generate unique session ID
    }));

    intervalRef.current = window.setInterval(() => {
      if (startTimeRef.current === null) return;

      const now = Date.now();
      const totalElapsed = elapsedRef.current + (now - startTimeRef.current);
      const newRemaining = Math.max(0, session.duration - totalElapsed);

      setSession((prev) => {
        if (newRemaining <= 0) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Call onComplete callback
          onComplete(prev.mode);
          
          // Save completion record to prevent duplicate processing on refresh (Bug 2 fix)
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

        return {
          ...prev,
          remaining: newRemaining,
        };
      });
    }, updateInterval); // Update interval based on Big View mode
  }, [session.status, session.duration, session.remaining, onComplete, updateInterval]);

  // Pause timer
  const pause = useCallback(() => {
    if (session.status !== 'running') return;

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setSession((prev) => ({
      ...prev,
      status: 'paused',
      startedAt: null,
    }));
  }, [session.status]);

  // Resume timer
  const resume = useCallback(() => {
    if (session.status !== 'paused') return;
    start();
  }, [session.status, start]);

  // Reset timer
  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const duration = getDurationForMode(session.mode, preferences);

    setSession({
      mode: session.mode,
      duration,
      remaining: duration,
      status: 'idle',
      startedAt: null,
      sessionId: `${Date.now()}-${session.mode}`, // Generate new session ID on reset
    });
  }, [session.mode, preferences]);

  // Skip current session (will be enhanced in Phase 4 for mode switching)
  const skip = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setSession((prev) => {
      // Call onComplete callback
      onComplete(session.mode);
      
      // Save completion record to prevent duplicate processing on refresh (Bug 2 fix)
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

  // Skip current session without triggering onComplete callback
  // Used for manual skip actions that handle their own transitions
  const skipManual = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setSession((prev) => {
      // Do NOT call onComplete - let caller handle transition
      // Save completion record to track the skip (for session counting if needed)
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
  }, []);

  // Switch to a different mode
  const switchMode = useCallback(
    (newMode: TimerMode, autoStart: boolean = false) => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const duration = getDurationForMode(newMode, preferences);

      setSession({
        mode: newMode,
        duration,
        remaining: duration,
        status: autoStart ? 'running' : 'idle',
        startedAt: autoStart ? Date.now() : null,
        sessionId: `${Date.now()}-${newMode}`, // Generate new session ID on mode switch
      });

      // If autoStart is true, start the interval
      if (autoStart) {
        startTimeRef.current = Date.now();
        elapsedRef.current = 0;

        intervalRef.current = window.setInterval(() => {
          if (startTimeRef.current === null) return;

          const now = Date.now();
          const totalElapsed = elapsedRef.current + (now - startTimeRef.current);
          const newRemaining = Math.max(0, duration - totalElapsed);

          setSession((prev) => {
            if (newRemaining <= 0) {
              if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              
              // Call onComplete callback
              onComplete(prev.mode);
              
              // Save completion record to prevent duplicate processing on refresh (Bug 2 fix)
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

            return {
              ...prev,
              remaining: newRemaining,
            };
          });
        }, updateInterval); // Update interval based on Big View mode
      }
    },
    [preferences, onComplete, updateInterval]
  );

  return {
    mode: session.mode,
    remaining: session.remaining,
    duration: session.duration,
    status: session.status,
    sessionId: session.sessionId, // Expose for debugging (Bug 2 fix)
    start,
    pause,
    resume,
    reset,
    skip,
    skipManual,
    switchMode,
  };
}

