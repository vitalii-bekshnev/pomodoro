import { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import {
  ThemeMode,
  ThemePreference,
  ThemeContextValue,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  isThemePreference,
} from '../types/theme';

// Create context with undefined default (requires provider)
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // State
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME);
  const [isUserPreference, setIsUserPreference] = useState(false);
  const [systemPreference, setSystemPreference] = useState<ThemeMode | null>(null);

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemPreference = () => {
      const preference: ThemeMode = mediaQuery.matches ? 'dark' : 'light';
      setSystemPreference(preference);
    };

    // Initial detection
    updateSystemPreference();

    // Listen for changes
    mediaQuery.addEventListener('change', updateSystemPreference);
    return () => mediaQuery.removeEventListener('change', updateSystemPreference);
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const loadTheme = () => {
      try {
        // Try loading from localStorage
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isThemePreference(parsed) && parsed.source === 'user') {
            setThemeState(parsed.mode);
            setIsUserPreference(true);
            applyThemeToDOM(parsed.mode);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }

      // Fall back to system preference
      if (systemPreference) {
        setThemeState(systemPreference);
        applyThemeToDOM(systemPreference);
        saveThemePreference(systemPreference, 'system');
      }
    };

    if (systemPreference !== null) {
      loadTheme();
    }
  }, [systemPreference]); // applyThemeToDOM and saveThemePreference are stable (useCallback)

  // Apply system preference changes (only if no user preference)
  useEffect(() => {
    if (!isUserPreference && systemPreference) {
      setThemeState(systemPreference);
      applyThemeToDOM(systemPreference);
      saveThemePreference(systemPreference, 'system');
    }
  }, [systemPreference, isUserPreference]); // applyThemeToDOM and saveThemePreference are stable (useCallback)

  // Apply theme to DOM
  const applyThemeToDOM = useCallback((mode: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', mode);
  }, []);

  // Save to localStorage
  const saveThemePreference = useCallback((mode: ThemeMode, source: ThemePreference['source']) => {
    try {
      const preference: ThemePreference = {
        mode,
        updatedAt: new Date().toISOString(),
        source,
      };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Public API: setTheme
  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    setIsUserPreference(true);
    applyThemeToDOM(mode);
    saveThemePreference(mode, 'user');
  }, [applyThemeToDOM, saveThemePreference]);

  // Public API: toggleTheme
  const toggleTheme = useCallback(() => {
    const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Context value
  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    isUserPreference,
    systemPreference,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

