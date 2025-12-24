/**
 * Theme type definitions for Gruvbox theme system
 * Feature: 013-gruvbox-theme
 */

/**
 * Theme mode - light or dark
 */
export type ThemeMode = 'light' | 'dark';

/**
 * User's theme preference stored in localStorage
 */
export interface ThemePreference {
  /** Selected theme mode */
  mode: ThemeMode;
  
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
  
  /** How the preference was determined */
  source: 'user' | 'system' | 'default';
}

/**
 * Theme context value provided by ThemeProvider
 * Consumed via useTheme hook
 */
export interface ThemeContextValue {
  /** Currently active theme mode */
  theme: ThemeMode;
  
  /** Set theme explicitly (creates user preference) */
  setTheme: (mode: ThemeMode) => void;
  
  /** Toggle between light and dark */
  toggleTheme: () => void;
  
  /** True if theme was manually set by user */
  isUserPreference: boolean;
  
  /** Current OS theme preference (null if unavailable) */
  systemPreference: ThemeMode | null;
}

/**
 * localStorage key for theme preference
 */
export const THEME_STORAGE_KEY = 'theme-preference' as const;

/**
 * Default theme when no preference exists
 */
export const DEFAULT_THEME: ThemeMode = 'light';

/**
 * Type guard for ThemeMode
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

/**
 * Type guard for ThemePreference
 * Validates structure and types of stored preference
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    isThemeMode(obj.mode) &&
    typeof obj.updatedAt === 'string' &&
    (obj.source === 'user' || obj.source === 'system' || obj.source === 'default')
  );
}

