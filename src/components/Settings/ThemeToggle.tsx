import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css';

/**
 * Theme toggle component for switching between light and dark modes
 * Feature: 013-gruvbox-theme (User Story 1)
 * 
 * Displays current theme and provides toggle button to switch themes.
 * Theme preference is automatically persisted to localStorage.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <label className="theme-toggle-label">
        <span>Theme</span>
        <button
          className="theme-toggle-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
          <span className="theme-toggle-text">
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </span>
        </button>
      </label>
    </div>
  );
}

