/**
 * App component - Root application
 */

import React, { useCallback, useState } from 'react';
import { Timer } from './Timer/Timer';
import { NotificationBanner } from './Notifications/NotificationBanner';
import { SessionCounter } from './SessionTracking/SessionCounter';
import { CycleIndicator } from './SessionTracking/CycleIndicator';
import { SettingsPanel } from './Settings/SettingsPanel';
import { PomodoroLogo } from './Logo/PomodoroLogo';
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

  // Handle timer completion (defined before timer hook to avoid circular dependency)
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

      // Show notification banner only when auto-start is disabled
      // (auto-start logic will be handled by a separate effect)
      const shouldShowBanner =
        (mode === 'focus' && !preferences.autoStartBreaks) ||
        ((mode === 'short-break' || mode === 'long-break') && !preferences.autoStartFocus);

      if (shouldShowBanner) {
        showBanner(mode);
      }
    },
    [incrementSession, playFocusComplete, playBreakComplete, showBanner, preferences.autoStartBreaks, preferences.autoStartFocus]
  );

  // Timer hook
  const timer = useTimer(preferences, handleTimerComplete);

  // Auto-start logic: Check for auto-start after timer completion
  React.useEffect(() => {
    if (timer.status === 'completed') {
      // Auto-start focus: break completed and auto-start focus enabled
      if ((timer.mode === 'short-break' || timer.mode === 'long-break') && preferences.autoStartFocus) {
        dismissBanner();
        timer.switchMode('focus', true); // Use autoStart parameter
      }
      // Auto-start breaks: focus completed and auto-start breaks enabled
      else if (timer.mode === 'focus' && preferences.autoStartBreaks) {
        dismissBanner();
        const nextBreakMode = getNextBreakMode();
        timer.switchMode(nextBreakMode, true); // Use autoStart parameter
      }
    }
  }, [timer.status, timer.mode, preferences.autoStartFocus, preferences.autoStartBreaks, dismissBanner, getNextBreakMode, timer]);


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

  // Override skip function to handle mode transitions
  const handleSkip = useCallback(() => {
    if (timer.mode === 'focus') {
      // Skip focus: manually handle completion without triggering auto-start loop
      // Increment session count (focus was skipped but still counts)
      incrementSession();
      
      // Play sound
      playFocusComplete();
      
      // Get next break mode and switch, optionally auto-starting
      const nextBreakMode = getNextBreakMode();
      timer.switchMode(nextBreakMode, preferences.autoStartBreaks);
    } else {
      // Skip break: transition to focus
      playBreakComplete();
      
      // Switch to focus mode, optionally auto-starting
      timer.switchMode('focus', preferences.autoStartFocus);
    }
  }, [timer, incrementSession, playFocusComplete, playBreakComplete, preferences.autoStartBreaks, preferences.autoStartFocus, getNextBreakMode]);

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
            <div className="header-title-group">
              <PomodoroLogo size={48} className="pomodoro-logo header-logo" />
              <div>
                <h1 className="app-title">Pomodoro Timer</h1>
                <p className="app-subtitle">Focus. Work. Rest. Repeat.</p>
              </div>
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
        {timer.status === 'completed' && timer.mode === 'focus' && !preferences.autoStartBreaks && (
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
        <a
          href="https://github.com/vitalii-bekshnev/pomodoro"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit GitHub repository"
          className="github-link"
        >
          <svg
            aria-hidden="true"
            className="github-icon"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>GitHub</span>
        </a>
      </footer>
    </div>
  );
};

