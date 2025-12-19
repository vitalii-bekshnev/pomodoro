/**
 * useNotifications hook
 * 
 * Manages audio and visual notification banner state
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { TimerMode } from '../types/timer';
import {
  initializeAudio,
  playFocusCompleteSound,
  playBreakCompleteSound,
} from '../utils/audio';
import { NOTIFICATION_AUTO_DISMISS_MS } from '../constants/defaults';

export interface UseNotificationsReturn {
  bannerVisible: boolean;
  completedMode: TimerMode | null;
  playFocusComplete: () => void;
  playBreakComplete: () => void;
  showBanner: (mode: TimerMode) => void;
  dismissBanner: () => void;
}

export function useNotifications(
  soundsEnabled: boolean
): UseNotificationsReturn {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [completedMode, setCompletedMode] = useState<TimerMode | null>(null);
  const autoDismissTimerRef = useRef<number | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
  }, []);

  // Clean up auto-dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (autoDismissTimerRef.current !== null) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, []);

  // Play focus completion sound
  const playFocusComplete = useCallback(() => {
    if (soundsEnabled) {
      playFocusCompleteSound().catch((error) => {
        console.warn('Could not play focus complete sound:', error);
      });
    }
  }, [soundsEnabled]);

  // Play break completion sound
  const playBreakComplete = useCallback(() => {
    if (soundsEnabled) {
      playBreakCompleteSound().catch((error) => {
        console.warn('Could not play break complete sound:', error);
      });
    }
  }, [soundsEnabled]);

  // Show notification banner
  const showBanner = useCallback((mode: TimerMode) => {
    // Clear any existing auto-dismiss timer
    if (autoDismissTimerRef.current !== null) {
      clearTimeout(autoDismissTimerRef.current);
    }

    setCompletedMode(mode);
    setBannerVisible(true);

    // Auto-dismiss after 10 seconds
    autoDismissTimerRef.current = window.setTimeout(() => {
      setBannerVisible(false);
      setCompletedMode(null);
    }, NOTIFICATION_AUTO_DISMISS_MS);
  }, []);

  // Dismiss notification banner
  const dismissBanner = useCallback(() => {
    if (autoDismissTimerRef.current !== null) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    setBannerVisible(false);
    setCompletedMode(null);
  }, []);

  return {
    bannerVisible,
    completedMode,
    playFocusComplete,
    playBreakComplete,
    showBanner,
    dismissBanner,
  };
}

