/**
 * ProgressRing component
 * 
 * Circular SVG progress indicator that shows timer progress
 */

import React, { useMemo } from 'react';
import { TimerMode } from '../../types/timer';
import { getThemeForMode } from '../../styles/theme';

export interface ProgressRingProps {
  percent: number;
  radius: number;
  stroke: number;
  mode: TimerMode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = React.memo(({
  percent,
  radius,
  stroke,
  mode,
  className = '',
}) => {
  const theme = getThemeForMode(mode);
  
  // Memoize expensive calculations
  const { normalizedRadius, circumference, strokeDashoffset } = useMemo(() => {
    const normalized = radius - stroke / 2;
    const circ = 2 * Math.PI * normalized;
    const offset = circ - (percent / 100) * circ;
    return {
      normalizedRadius: normalized,
      circumference: circ,
      strokeDashoffset: offset,
    };
  }, [radius, stroke, percent]);

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      className={className}
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background circle */}
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="transparent"
        stroke="#e0e0e0"
        strokeWidth={stroke}
      />
      
      {/* Progress circle */}
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="transparent"
        stroke={theme.primary}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
        }}
      />
    </svg>
  );
});

ProgressRing.displayName = 'ProgressRing';

