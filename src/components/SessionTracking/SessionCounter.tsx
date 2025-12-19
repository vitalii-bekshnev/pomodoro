/**
 * SessionCounter component
 * 
 * Displays total completed Pomodoros today
 */

import React from 'react';
import './SessionCounter.css';

export interface SessionCounterProps {
  completedCount: number;
}

export const SessionCounter: React.FC<SessionCounterProps> = ({
  completedCount,
}) => {
  return (
    <div className="session-counter">
      <div className="counter-value">{completedCount}</div>
      <div className="counter-label">
        Pomodoro{completedCount !== 1 ? 's' : ''} completed today
      </div>
    </div>
  );
};

