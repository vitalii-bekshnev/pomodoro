/**
 * TimerControls component
 * 
 * Start/Pause/Resume/Reset buttons with debouncing for rapid clicks
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TimerStatus, TimerMode } from '../../types/timer';
import { getThemeForMode } from '../../styles/theme';
import './TimerControls.css';

export interface TimerControlsProps {
  status: TimerStatus;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const DEBOUNCE_DELAY = 500; // ms

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  mode,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}) => {
  const theme = getThemeForMode(mode);
  const [isDisabled, setIsDisabled] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced action wrapper
  const debouncedAction = useCallback((action: () => void) => {
    if (isDisabled) return;

    action();
    setIsDisabled(true);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Re-enable after delay
    debounceTimerRef.current = setTimeout(() => {
      setIsDisabled(false);
    }, DEBOUNCE_DELAY);
  }, [isDisabled]);

  const handleStart = useCallback(() => debouncedAction(onStart), [debouncedAction, onStart]);
  const handlePause = useCallback(() => debouncedAction(onPause), [debouncedAction, onPause]);
  const handleResume = useCallback(() => debouncedAction(onResume), [debouncedAction, onResume]);
  const handleReset = useCallback(() => debouncedAction(onReset), [debouncedAction, onReset]);
  const handleSkip = useCallback(() => debouncedAction(onSkip), [debouncedAction, onSkip]);

  const renderPrimaryButton = () => {
    if (status === 'idle' || status === 'completed') {
      const label = mode === 'focus' ? 'Start Focus' : 
                    mode === 'short-break' ? 'Start Break' : 
                    'Start Long Break';
      
      return (
        <button
          className="control-button primary"
          onClick={handleStart}
          disabled={isDisabled}
          style={{
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          }}
        >
          {label}
        </button>
      );
    }

    if (status === 'running') {
      return (
        <button
          className="control-button primary"
          onClick={handlePause}
          disabled={isDisabled}
          style={{
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          }}
        >
          Pause
        </button>
      );
    }

    if (status === 'paused') {
      return (
        <button
          className="control-button primary"
          onClick={handleResume}
          disabled={isDisabled}
          style={{
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          }}
        >
          Resume
        </button>
      );
    }
  };

  return (
    <div className="timer-controls">
      <div className="primary-controls">{renderPrimaryButton()}</div>

      <div className="secondary-controls">
        {status !== 'idle' && (
          <button
            className="control-button secondary"
            onClick={handleReset}
            disabled={isDisabled}
            title="Reset timer"
          >
            Reset
          </button>
        )}

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
      </div>
    </div>
  );
};

