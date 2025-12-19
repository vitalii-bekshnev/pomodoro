/**
 * TimerDisplay component
 * 
 * Displays countdown time in MM:SS format
 */

import React from 'react';
import { TimerMode } from '../../types/timer';
import { formatTime } from '../../utils/time';
import { getThemeForMode } from '../../styles/theme';
import './TimerDisplay.css';

export interface TimerDisplayProps {
  remaining: number;
  mode: TimerMode;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(
  ({ remaining, mode }) => {
    const theme = getThemeForMode(mode);
    const formattedTime = formatTime(remaining);

    return (
      <div
        className="timer-display"
        style={{
          color: theme.primary,
        }}
      >
        {formattedTime}
      </div>
    );
  }
);

TimerDisplay.displayName = 'TimerDisplay';

