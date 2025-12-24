/**
 * TimerDisplay component
 * 
 * Displays countdown time in MM:SS format (regular mode) or MM:SS.CS format (Big View mode)
 */

import React from 'react';
import { TimerMode } from '../../types/timer';
import { formatTime, formatTimeWithCentiseconds } from '../../utils/time';
import { getThemeForMode } from '../../styles/theme';
import { TimerDigit } from './TimerDigit';
import './TimerDisplay.css';

export interface TimerDisplayProps {
  remaining: number;
  mode: TimerMode;
  bigViewEnabled?: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(
  ({ remaining, mode, bigViewEnabled = false }) => {
    const theme = getThemeForMode(mode);

    // Big View mode: Use TimerDigit components with centiseconds
    if (bigViewEnabled) {
      const { minutes, seconds, centiseconds } = formatTimeWithCentiseconds(remaining, true);

      return (
        <div
          className="timer-display"
          style={{
            color: theme.primary,
          }}
        >
          <TimerDigit digit={minutes[0]} position="min-tens" />
          <TimerDigit digit={minutes[1]} position="min-ones" />
          <TimerDigit digit=":" position="colon" isSeparator />
          <TimerDigit digit={seconds[0]} position="sec-tens" />
          <TimerDigit digit={seconds[1]} position="sec-ones" />
          <TimerDigit digit="." position="period" isSeparator />
          <TimerDigit digit={centiseconds![0]} position="cs-tens" isCentisecond />
          <TimerDigit digit={centiseconds![1]} position="cs-ones" isCentisecond />
        </div>
      );
    }

    // Regular mode: Standard formatting
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

