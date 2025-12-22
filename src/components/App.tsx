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

  // Auto-transition from focus complete to break (Bug 4 fix)
  // Using useEffect to avoid circular dependency (handleTimerComplete needs timer, but timer needs handleTimerComplete)
  React.useEffect(() => {
    if (timer.status === 'completed' && timer.mode === 'focus') {
      const nextBreakMode = getNextBreakMode();
      timer.switchMode(nextBreakMode);
    }
  }, [timer.status, timer.mode, timer, getNextBreakMode]);

  // Auto-transition from break complete to focus
  // Using useEffect to mirror the existing focus-to-break pattern
  React.useEffect(() => {
    if (timer.status === 'completed' &&
        (timer.mode === 'short-break' || timer.mode === 'long-break')) {
      timer.switchMode('focus');
    }
  }, [timer.status, timer.mode, timer]);

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
      // Skip focus: reset cycle and complete session
      resetCycle();
      timer.skip();
    } else {
      // Skip break: transition to focus and auto-start
      timer.switchMode('focus');
      timer.start();
    }
  }, [timer, resetCycle]);

  // Helper to determine next break type (short vs long) - Bug 3 fix
  const getNextBreakType = useCallback((): 'short-break' | 'long-break' => {
    const nextMode = getNextBreakMode();
    // getNextBreakMode always returns a break mode (short or long), but TypeScript needs explicit cast
    return nextMode as 'short-break' | 'long-break';
  }, [getNextBreakMode]);

  // Handle starting break from persistent UI - Bug 3 fix
  const handleStartBreak = useCallback(() => {
    const breakType = getNextBreakType();
    timer.switchMode(breakType);
    timer.start();
  }, [getNextBreakType, timer]);

  // Handle skipping break and starting new focus - Bug 4 placeholder
  const handleSkipBreak = useCallback(() => {
    // Bug 4 implementation: skip break and start new focus session
    timer.switchMode('focus');
    timer.start();
  }, [timer]);

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

        {/* Persistent break start option - Bug 3 fix */}
        {timer.status === 'completed' && timer.mode === 'focus' && (
          <div className="break-pending-actions">
            <p className="break-pending-message">
              🎉 Focus session complete! Time for a break.
            </p>
            <div className="break-pending-buttons">
              <button 
                className="btn-break-start"
                onClick={handleStartBreak}
              >
                Start {getNextBreakType() === 'long-break' ? 'Long' : 'Short'} Break
              </button>
              <button 
                className="btn-skip-break"
                onClick={handleSkipBreak}
              >
                Skip Break - Start Focus
              </button>
            </div>
          </div>
        )}

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

