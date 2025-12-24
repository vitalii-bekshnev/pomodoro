/**
 * TimerDigit component - Individual digit display with animations
 */

import React from 'react';
import './TimerDigit.css';

export interface TimerDigitProps {
  /** The digit character to display (0-9, :, .) */
  digit: string;

  /** Position identifier for animation key */
  position: string;

  /** Whether this is a separator (colon or period) */
  isSeparator?: boolean;

  /** Whether this is a centisecond digit (disables animation for performance) */
  isCentisecond?: boolean;
}

/**
 * TimerDigit component renders individual digits with smooth animations
 * 
 * Each digit is rendered with a unique key based on its value and position,
 * which triggers CSS animations when the digit value changes.
 */
export const TimerDigit: React.FC<TimerDigitProps> = React.memo(
  ({ digit, position, isSeparator = false, isCentisecond = false }) => {
    return (
      <span
        key={`${digit}-${position}`}
        className={`timer-digit ${isSeparator ? 'timer-digit-separator' : ''}`}
        data-digit={digit}
        data-cs={isCentisecond ? 'true' : undefined}
      >
        {digit}
      </span>
    );
  }
);

TimerDigit.displayName = 'TimerDigit';

