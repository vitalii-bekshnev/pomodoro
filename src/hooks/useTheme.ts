import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ThemeContextValue } from '../types/theme';

/**
 * Hook for accessing theme state and controls
 * Must be used within ThemeProvider
 * 
 * @returns ThemeContextValue with theme state and control functions
 * @throws Error if used outside of ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   return <button onClick={toggleTheme}>Current: {theme}</button>;
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}

