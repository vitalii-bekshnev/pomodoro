/**
 * useSettings hook
 * 
 * Manages user preferences with validation and localStorage persistence
 */

import { useCallback } from 'react';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  validatePreferences,
} from '../types/settings';
import { STORAGE_KEYS } from '../constants/defaults';
import { useLocalStorage } from './useLocalStorage';

export interface UseSettingsReturn {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [preferences, setPreferences, removePreferences] = useLocalStorage<UserPreferences>(
    STORAGE_KEYS.PREFERENCES,
    DEFAULT_PREFERENCES
  );

  // Update preferences with validation
  const updatePreferences = useCallback(
    (newPreferences: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        // Merge with existing preferences
        const merged = { ...prev, ...newPreferences };
        // Validate and clamp to valid ranges
        return validatePreferences(merged);
      });
    },
    [setPreferences]
  );

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    removePreferences();
    setPreferences(DEFAULT_PREFERENCES);
  }, [removePreferences, setPreferences]);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
}

