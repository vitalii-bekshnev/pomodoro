/**
 * CycleIndicator component
 * 
 * Visual display of progress through 4-session cycle (🍅🍅⬜⬜)
 */

import React from 'react';
import './CycleIndicator.css';

export interface CycleIndicatorProps {
  cyclePosition: number;
  cycleLength?: number;
}

export const CycleIndicator: React.FC<CycleIndicatorProps> = ({
  cyclePosition,
  cycleLength = 4,
}) => {
  // Create array of indicators
  const indicators = Array.from({ length: cycleLength }, (_, index) => {
    // If we're at position 0 and have completed sessions, all should be filled
    // Otherwise, fill based on current position
    const isFilled = index < cyclePosition;
    return isFilled;
  });

  return (
    <div className="cycle-indicator">
      <div className="cycle-label">Current Cycle</div>
      <div className="cycle-dots">
        {indicators.map((filled, index) => (
          <span
            key={index}
            className={`cycle-dot ${filled ? 'filled' : 'empty'}`}
            aria-label={filled ? 'Completed' : 'Not completed'}
          >
            {filled ? '🍅' : '⬜'}
          </span>
        ))}
      </div>
      <div className="cycle-progress">
        {cyclePosition}/{cycleLength}
      </div>
    </div>
  );
};

