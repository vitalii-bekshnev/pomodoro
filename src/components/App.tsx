/**
 * App component - Root application
 */

import React, { useCallback, useState } from 'react';
import { Timer } from './Timer/Timer';
import { NotificationBanner } from './Notifications/NotificationBanner';
import { SessionCounter } from './SessionTracking/SessionCounter';
import { CycleIndicator } from './SessionTracking/CycleIndicator';
import { SettingsPanel } from './Settings/SettingsPanel';
import { useTimer } from '../hooks/useTimer';
import { useNotifications } from '../hooks/useNotifications';
import { useSessionTracking } from '../hooks/useSessionTracking';
import { useSettings } from '../hooks/useSettings';
import { TimerMode } from '../types/timer';
import './App.css';

export const App: React.FC = () => {
  // Settings hook
  const { preferences, updatePreferences } = useSettings();
  
  // Settings panel visibility
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Session tracking hook
  const {
    completedCount,
    cyclePosition,
    incrementSession,
    resetCycle,
    getNextBreakMode,
  } = useSessionTracking();

  // Notifications hook
  const {
    bannerVisible,
    completedMode,
    playFocusComplete,
    playBreakComplete,
    showBanner,
    dismissBanner,
  } = useNotifications(preferences.soundsEnabled);

  // Handle timer completion
  const handleTimerComplete = useCallback(
    (mode: TimerMode) => {
      // Update session tracking if focus session completed
      if (mode === 'focus') {
        incrementSession();
      }

      // Play appropriate sound
      if (mode === 'focus') {
        playFocusComplete();
      } else {
        playBreakComplete();
      }

      // Show notification banner
      showBanner(mode);
    },
    [incrementSession, playFocusComplete, playBreakComplete, showBanner]
  );

  // Timer hook
  const timer = useTimer(preferences, handleTimerComplete);

  // Handle "Start Next" action from notification banner
  const handleStartNext = useCallback(() => {
    dismissBanner();

    // If focus just completed, switch to appropriate break mode
    if (completedMode === 'focus') {
      const nextMode = getNextBreakMode();
      timer.switchMode(nextMode);
      
      // Auto-start if preference is enabled
      if (preferences.autoStartBreaks) {
        timer.start();
      }
    } 
    // If break just completed, switch to focus
    else if (completedMode === 'short-break' || completedMode === 'long-break') {
      timer.switchMode('focus');
      
      // Auto-start if preference is enabled
      if (preferences.autoStartFocus) {
        timer.start();
      }
    }
  }, [dismissBanner, completedMode, getNextBreakMode, timer, preferences]);

  // Override skip function to reset cycle when skipping focus
  const handleSkip = useCallback(() => {
    if (timer.mode === 'focus') {
      // Reset cycle when skipping focus session
      resetCycle();
    }
    timer.skip();
  }, [timer, resetCycle]);

  return (
    <div className="app">
      <NotificationBanner
        visible={bannerVisible}
        completedMode={completedMode}
        onDismiss={dismissBanner}
        onStartNext={handleStartNext}
      />

      <SettingsPanel
        isOpen={settingsOpen}
        preferences={preferences}
        onSave={updatePreferences}
        onClose={() => setSettingsOpen(false)}
      />

      <main className="app-main">
        <header className="app-header">
          <div className="header-content">
            <div>
              <h1 className="app-title">Pomodoro Timer</h1>
              <p className="app-subtitle">Focus. Work. Rest. Repeat.</p>
            </div>
            <button
              className="settings-button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* Session tracking display */}
        <div className="session-tracking">
          <SessionCounter completedCount={completedCount} />
          <CycleIndicator cyclePosition={cyclePosition} />
        </div>

        <Timer {...timer} skip={handleSkip} />
      </main>

      <footer className="app-footer">
        <p>
          {completedCount > 0
            ? `${completedCount} Pomodoro${completedCount > 1 ? 's' : ''} completed today`
            : 'Press Start to begin your focus session'}
        </p>
      </footer>
    </div>
  );
};

