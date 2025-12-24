/**
 * Timer component
 * 
 * Main timer display integrating ProgressRing, TimerDisplay, and TimerControls
 */

import React, { useMemo } from 'react';
import { ProgressRing } from './ProgressRing';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { UseTimerReturn } from '../../hooks/useTimer';
import { calculateProgress } from '../../utils/time';
import { getThemeForMode, getLabelForMode } from '../../styles/theme';
import './Timer.css';

export interface TimerProps extends UseTimerReturn {
  bigViewEnabled?: boolean;
  settingsButton?: React.ReactNode;
}

export const Timer: React.FC<TimerProps> = ({
  mode,
  remaining,
  duration,
  status,
  start,
  pause,
  resume,
  reset,
  skip,
  bigViewEnabled = false,
  settingsButton,
}) => {
  const theme = getThemeForMode(mode);
  const modeLabel = getLabelForMode(mode);
  
  // Calculate progress percentage (memoized for performance)
  const progressPercent = useMemo(() => {
    return calculateProgress(remaining, duration);
  }, [remaining, duration]);

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h2
          className="timer-mode-label"
          style={{ color: theme.primary }}
        >
          {modeLabel}
        </h2>
      </div>

      <div className="timer-visual">
        <div className="progress-ring-container">
          <ProgressRing
            percent={progressPercent}
            radius={150}
            stroke={12}
            mode={mode}
          />
          
          <div className="timer-display-overlay">
            <TimerDisplay remaining={remaining} mode={mode} bigViewEnabled={bigViewEnabled} />
          </div>
        </div>
      </div>

      {bigViewEnabled && settingsButton ? (
        <div className="controls-container">
          {settingsButton}
          <TimerControls
            status={status}
            mode={mode}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onSkip={skip}
          />
        </div>
      ) : (
        <TimerControls
          status={status}
          mode={mode}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onSkip={skip}
        />
      )}
    </div>
  );
};

