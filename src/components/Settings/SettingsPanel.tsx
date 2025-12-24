/**
 * SettingsPanel component
 * 
 * Settings overlay/modal with all user preference controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserPreferences, DURATION_CONSTRAINTS } from '../../types/settings';
import { DurationSlider } from './DurationSlider';
import { ToggleSwitch } from './ToggleSwitch';
import { ThemeToggle } from './ThemeToggle';
import './SettingsPanel.css';

export interface SettingsPanelProps {
  isOpen: boolean;
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  preferences,
  onSave,
  onClose,
}) => {
  // Local state for editing (only save on "Save" button)
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);

  // Update local state when preferences prop changes
  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleCancel = useCallback(() => {
    // Reset to original preferences
    setLocalPrefs(preferences);
    onClose();
  }, [preferences, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleCancel]);

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  const handlePreviewFocusSound = () => {
    const audio = new Audio('/sounds/focus-complete.mp3');
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  };

  const handlePreviewBreakSound = () => {
    const audio = new Audio('/sounds/break-complete.mp3');
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="settings-backdrop" onClick={handleCancel} />

      {/* Panel */}
      <div className="settings-panel">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button
            className="settings-close"
            onClick={handleCancel}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* Timer Durations Section */}
          <section className="settings-section">
            <h3 className="section-title">Timer Durations</h3>
            
            <DurationSlider
              label="Focus Duration"
              value={localPrefs.focusDuration}
              min={DURATION_CONSTRAINTS.focus.min}
              max={DURATION_CONSTRAINTS.focus.max}
              onChange={(value) =>
                setLocalPrefs({ ...localPrefs, focusDuration: value })
              }
            />

            <DurationSlider
              label="Short Break"
              value={localPrefs.shortBreakDuration}
              min={DURATION_CONSTRAINTS.shortBreak.min}
              max={DURATION_CONSTRAINTS.shortBreak.max}
              onChange={(value) =>
                setLocalPrefs({ ...localPrefs, shortBreakDuration: value })
              }
            />

            <DurationSlider
              label="Long Break"
              value={localPrefs.longBreakDuration}
              min={DURATION_CONSTRAINTS.longBreak.min}
              max={DURATION_CONSTRAINTS.longBreak.max}
              onChange={(value) =>
                setLocalPrefs({ ...localPrefs, longBreakDuration: value })
              }
            />
          </section>

          {/* Auto-Start Section */}
          <section className="settings-section">
            <h3 className="section-title">Auto-Start</h3>
            
            <ToggleSwitch
              label="Auto-start Breaks"
              checked={localPrefs.autoStartBreaks}
              onChange={(checked) =>
                setLocalPrefs({ ...localPrefs, autoStartBreaks: checked })
              }
              description="Automatically start break timer when focus session completes"
            />

            <ToggleSwitch
              label="Auto-start Focus"
              checked={localPrefs.autoStartFocus}
              onChange={(checked) =>
                setLocalPrefs({ ...localPrefs, autoStartFocus: checked })
              }
              description="Automatically start focus timer when break completes"
            />
          </section>

          {/* Notifications Section */}
          <section className="settings-section">
            <h3 className="section-title">Notifications</h3>
            
            <ToggleSwitch
              label="Sound Notifications"
              checked={localPrefs.soundsEnabled}
              onChange={(checked) =>
                setLocalPrefs({ ...localPrefs, soundsEnabled: checked })
              }
              description="Play sound when session completes (visual banner always shows)"
            />

            {localPrefs.soundsEnabled && (
              <div className="sound-preview">
                <p className="preview-label">Preview notification sounds:</p>
                <div className="preview-buttons">
                  <button
                    type="button"
                    className="preview-button"
                    onClick={handlePreviewFocusSound}
                  >
                    🎯 Focus Complete
                  </button>
                  <button
                    type="button"
                    className="preview-button"
                    onClick={handlePreviewBreakSound}
                  >
                    ☕ Break Complete
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Theme Section */}
          <section className="settings-section">
            <h3 className="section-title">Appearance</h3>
            
            <ThemeToggle />
          </section>
        </div>

        <div className="settings-footer">
          <button className="settings-button secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="settings-button primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

