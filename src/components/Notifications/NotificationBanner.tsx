/**
 * NotificationBanner component
 * 
 * In-app notification banner that appears at top when session completes
 */

import React from 'react';
import { TimerMode } from '../../types/timer';
import './NotificationBanner.css';

export interface NotificationBannerProps {
  visible: boolean;
  completedMode: TimerMode | null;
  onDismiss: () => void;
  onStartNext: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  completedMode,
  onDismiss,
  onStartNext,
}) => {
  if (!visible || !completedMode) {
    return null;
  }

  const getMessage = (): string => {
    if (completedMode === 'focus') {
      return '🎉 Focus session complete! Time for a break.';
    }
    return '✨ Break time is over! Ready to focus?';
  };

  const getActionLabel = (): string => {
    if (completedMode === 'focus') {
      return 'Start Break';
    }
    return 'Start Focus';
  };

  return (
    <div className={`notification-banner ${visible ? 'visible' : ''}`}>
      <div className="banner-content">
        <p className="banner-message">{getMessage()}</p>
        
        <div className="banner-actions">
          <button className="banner-button primary" onClick={onStartNext}>
            {getActionLabel()}
          </button>
          
          <button className="banner-button secondary" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

