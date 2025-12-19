/**
 * Theme colors for different timer modes
 */

import { TimerMode } from '../types/timer';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  text: string;
  background: string;
}

/**
 * Color themes for each timer mode
 */
export const modeThemes: Record<TimerMode, ThemeColors> = {
  focus: {
    primary: '#e67e22', // Warm orange
    primaryLight: '#f39c12',
    primaryDark: '#d35400',
    text: '#2c3e50',
    background: '#fef5e7',
  },
  'short-break': {
    primary: '#3498db', // Calm blue
    primaryLight: '#5dade2',
    primaryDark: '#2980b9',
    text: '#2c3e50',
    background: '#ebf5fb',
  },
  'long-break': {
    primary: '#27ae60', // Refreshing green
    primaryLight: '#52be80',
    primaryDark: '#229954',
    text: '#2c3e50',
    background: '#e8f8f5',
  },
};

/**
 * Get theme colors for a specific mode
 */
export const getThemeForMode = (mode: TimerMode): ThemeColors => {
  return modeThemes[mode];
};

/**
 * Mode display labels
 */
export const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus Time',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

/**
 * Get display label for a mode
 */
export const getLabelForMode = (mode: TimerMode): string => {
  return modeLabels[mode];
};

