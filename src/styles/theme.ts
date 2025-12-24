/**
 * Theme colors for different timer modes
 * Integrated with Gruvbox theme system (Feature: 013-gruvbox-theme)
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
 * Get computed CSS variable value
 */
const getCSSVar = (varName: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};

/**
 * Color themes for each timer mode
 * Now uses Gruvbox accent colors that adapt to light/dark theme
 */
export const modeThemes: Record<TimerMode, ThemeColors> = {
  focus: {
    primary: getCSSVar('--color-accent-orange') || '#d65d0e', // Gruvbox orange
    primaryLight: getCSSVar('--color-accent-orange') || '#fe8019',
    primaryDark: getCSSVar('--color-accent-orange-dark') || '#af3a03',
    text: getCSSVar('--color-text-primary') || '#2c3e50',
    background: getCSSVar('--color-background') || '#fef5e7',
  },
  'short-break': {
    primary: getCSSVar('--color-accent-blue') || '#458588', // Gruvbox blue
    primaryLight: getCSSVar('--color-accent-blue') || '#83a598',
    primaryDark: getCSSVar('--color-accent-blue-dark') || '#076678',
    text: getCSSVar('--color-text-primary') || '#2c3e50',
    background: getCSSVar('--color-background') || '#ebf5fb',
  },
  'long-break': {
    primary: getCSSVar('--color-accent-green') || '#98971a', // Gruvbox green
    primaryLight: getCSSVar('--color-accent-green') || '#b8bb26',
    primaryDark: getCSSVar('--color-accent-green-dark') || '#79740e',
    text: getCSSVar('--color-text-primary') || '#2c3e50',
    background: getCSSVar('--color-background') || '#e8f8f5',
  },
};

/**
 * Get theme colors for a specific mode
 * Dynamically fetches current CSS variable values to support theme switching
 */
export const getThemeForMode = (mode: TimerMode): ThemeColors => {
  // Re-fetch CSS variables on each call to support theme switching
  return {
    focus: {
      primary: getCSSVar('--color-accent-orange') || '#d65d0e',
      primaryLight: getCSSVar('--color-accent-orange') || '#fe8019',
      primaryDark: getCSSVar('--color-accent-orange-dark') || '#af3a03',
      text: getCSSVar('--color-text-primary') || '#2c3e50',
      background: getCSSVar('--color-background') || '#fef5e7',
    },
    'short-break': {
      primary: getCSSVar('--color-accent-blue') || '#458588',
      primaryLight: getCSSVar('--color-accent-blue') || '#83a598',
      primaryDark: getCSSVar('--color-accent-blue-dark') || '#076678',
      text: getCSSVar('--color-text-primary') || '#2c3e50',
      background: getCSSVar('--color-background') || '#ebf5fb',
    },
    'long-break': {
      primary: getCSSVar('--color-accent-green') || '#98971a',
      primaryLight: getCSSVar('--color-accent-green') || '#b8bb26',
      primaryDark: getCSSVar('--color-accent-green-dark') || '#79740e',
      text: getCSSVar('--color-text-primary') || '#2c3e50',
      background: getCSSVar('--color-background') || '#e8f8f5',
    },
  }[mode];
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

