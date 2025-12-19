/**
 * useLocalStorage hook
 *
 * React state that syncs with localStorage
 */

import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

/**
 * Hook for managing state that persists to localStorage
 *
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStorageItem(key, initialValue);
  });

  // Update localStorage when state changes
  useEffect(() => {
    setStorageItem(key, storedValue);
  }, [key, storedValue]);

  // Wrapped setValue to support functional updates
  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      return newValue;
    });
  };

  // Remove value from localStorage and reset to initial
  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

