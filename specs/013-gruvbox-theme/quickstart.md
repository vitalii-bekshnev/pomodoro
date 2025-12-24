# Quickstart Guide: Gruvbox Theme Implementation

**Feature**: 013-gruvbox-theme  
**Audience**: Developers implementing the theme system  
**Time to Complete**: ~4-6 hours

---

## Overview

This guide provides step-by-step instructions for implementing the Gruvbox theme system with light/dark mode toggle. Follow the phases in order to ensure proper integration with existing code.

---

## Prerequisites

### Required Knowledge

- TypeScript fundamentals
- React hooks (useState, useContext, useEffect, useCallback)
- CSS custom properties (CSS variables)
- localStorage API
- matchMedia API

### Required Tools

- Node.js 18+ & npm
- TypeScript 5.3+
- Existing project dependencies (see package.json)
- Code editor with TypeScript support

### Project State

- ✅ React 18.2 application running
- ✅ Vite build system configured
- ✅ TypeScript strict mode enabled
- ✅ Existing settings system (`useSettings` hook)

---

## Implementation Phases

### Phase 1: Type Definitions (~30 minutes)

**Goal**: Create TypeScript types for theme system.

**Files to Create**:
1. `src/types/theme.ts`

**Steps**:

```bash
# 1. Create theme types file
touch src/types/theme.ts
```

**2. Add core types**:

```typescript
// src/types/theme.ts

/**
 * Theme mode - light or dark
 */
export type ThemeMode = 'light' | 'dark';

/**
 * User's theme preference stored in localStorage
 */
export interface ThemePreference {
  mode: ThemeMode;
  updatedAt: string;
  source: 'user' | 'system' | 'default';
}

/**
 * Theme context value provided by ThemeProvider
 */
export interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isUserPreference: boolean;
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
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    isThemeMode(obj.mode) &&
    typeof obj.updatedAt === 'string' &&
    (obj.source === 'user' || obj.source === 'system' || obj.source === 'default')
  );
}
```

**Verification**:
```bash
npm run typecheck  # Should pass with no errors
```

---

### Phase 2: CSS Variables (~1 hour)

**Goal**: Define Gruvbox color palettes as CSS variables.

**Files to Create**:
1. `src/styles/themes/gruvbox-light.css`
2. `src/styles/themes/gruvbox-dark.css`
3. `src/styles/themes/index.ts`

**Files to Modify**:
1. `src/styles/global.css`

**Steps**:

```bash
# 1. Create themes directory
mkdir -p src/styles/themes
```

**2. Create light theme** (`src/styles/themes/gruvbox-light.css`):

```css
/**
 * Gruvbox Light Theme (Medium Contrast)
 */
:root {
  /* Backgrounds */
  --color-bg-bg0: #fbf1c7;
  --color-bg-bg1: #ebdbb2;
  --color-bg-bg2: #d5c4a1;
  --color-bg-bg3: #bdae93;
  --color-bg-bg4: #a89984;
  
  /* Foregrounds */
  --color-fg-fg0: #282828;
  --color-fg-fg1: #3c3836;
  --color-fg-fg2: #504945;
  --color-fg-fg3: #665c54;
  --color-fg-fg4: #7c6f64;
  
  /* Accents */
  --color-accent-red: #cc241d;
  --color-accent-red-dark: #9d0006;
  --color-accent-green: #98971a;
  --color-accent-green-dark: #79740e;
  --color-accent-yellow: #d79921;
  --color-accent-yellow-dark: #b57614;
  --color-accent-blue: #458588;
  --color-accent-blue-dark: #076678;
  --color-accent-purple: #b16286;
  --color-accent-purple-dark: #8f3f71;
  --color-accent-aqua: #689d6a;
  --color-accent-aqua-dark: #427b58;
  --color-accent-orange: #d65d0e;
  --color-accent-orange-dark: #af3a03;
  
  /* Convenience aliases */
  --color-background: var(--color-bg-bg0);
  --color-surface: var(--color-bg-bg1);
  --color-text-primary: var(--color-fg-fg0);
  --color-text-secondary: var(--color-fg-fg2);
  --color-border: var(--color-bg-bg4);
}
```

**3. Create dark theme** (`src/styles/themes/gruvbox-dark.css`):

```css
/**
 * Gruvbox Dark Theme (Medium Contrast)
 */
[data-theme="dark"] {
  /* Backgrounds */
  --color-bg-bg0: #282828;
  --color-bg-bg1: #3c3836;
  --color-bg-bg2: #504945;
  --color-bg-bg3: #665c54;
  --color-bg-bg4: #7c6f64;
  
  /* Foregrounds */
  --color-fg-fg0: #fbf1c7;
  --color-fg-fg1: #ebdbb2;
  --color-fg-fg2: #d5c4a1;
  --color-fg-fg3: #bdae93;
  --color-fg-fg4: #a89984;
  
  /* Accents */
  --color-accent-red: #fb4934;
  --color-accent-red-dark: #cc241d;
  --color-accent-green: #b8bb26;
  --color-accent-green-dark: #98971a;
  --color-accent-yellow: #fabd2f;
  --color-accent-yellow-dark: #d79921;
  --color-accent-blue: #83a598;
  --color-accent-blue-dark: #458588;
  --color-accent-purple: #d3869b;
  --color-accent-purple-dark: #b16286;
  --color-accent-aqua: #8ec07c;
  --color-accent-aqua-dark: #689d6a;
  --color-accent-orange: #fe8019;
  --color-accent-orange-dark: #d65d0e;
  
  /* Convenience aliases (inherited variable names) */
  --color-background: var(--color-bg-bg0);
  --color-surface: var(--color-bg-bg1);
  --color-text-primary: var(--color-fg-fg0);
  --color-text-secondary: var(--color-fg-fg2);
  --color-border: var(--color-bg-bg4);
}
```

**4. Update global.css** (`src/styles/global.css`):

```css
/* At the top of the file, import theme styles */
@import './themes/gruvbox-light.css';
@import './themes/gruvbox-dark.css';

/* Add smooth transitions for theme changes */
* {
  transition: 
    background-color 150ms ease-in-out,
    color 150ms ease-in-out,
    border-color 150ms ease-in-out;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}

/* Update body to use theme variables */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text-primary);  /* ← Updated */
  background-color: var(--color-background);  /* ← Updated */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**5. Create index file** (`src/styles/themes/index.ts`):

```typescript
// Re-export for cleaner imports (optional)
export {};
```

**Verification**:
```bash
npm run dev
# Open browser DevTools > Elements > :root
# Verify CSS variables are defined
```

---

### Phase 3: Theme Context & Provider (~1.5 hours)

**Goal**: Create React Context for theme state management.

**Files to Create**:
1. `src/contexts/ThemeContext.tsx`

**Steps**:

```bash
# 1. Create contexts directory
mkdir -p src/contexts
```

**2. Create ThemeContext** (`src/contexts/ThemeContext.tsx`):

```typescript
import React, { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
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
  }, [systemPreference]);

  // Apply system preference changes (only if no user preference)
  useEffect(() => {
    if (!isUserPreference && systemPreference) {
      setThemeState(systemPreference);
      applyThemeToDOM(systemPreference);
      saveThemePreference(systemPreference, 'system');
    }
  }, [systemPreference, isUserPreference]);

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
```

**Verification**:
```bash
npm run typecheck  # Should pass
```

---

### Phase 4: useTheme Hook (~15 minutes)

**Goal**: Create custom hook for consuming theme context.

**Files to Create**:
1. `src/hooks/useTheme.ts`

**Steps**:

**1. Create hook** (`src/hooks/useTheme.ts`):

```typescript
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ThemeContextValue } from '../types/theme';

/**
 * Hook for accessing theme state and controls
 * Must be used within ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
```

**Verification**:
```bash
npm run typecheck  # Should pass
```

---

### Phase 5: Integrate with App (~30 minutes)

**Goal**: Wrap app with ThemeProvider and add FOIT prevention.

**Files to Modify**:
1. `src/index.tsx` (or `src/main.tsx`)
2. `index.html`

**Steps**:

**1. Update index.tsx/main.tsx**:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';  // ← Add
import App from './components/App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>  {/* ← Add */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

**2. Add FOIT prevention script to index.html** (before other scripts):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pomodoro Timer</title>
    
    <!-- FOIT Prevention: Apply theme before first paint -->
    <script>
      (function() {
        try {
          const stored = localStorage.getItem('theme-preference');
          const theme = stored 
            ? JSON.parse(stored).mode
            : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {
          // Silently fail - React will handle it
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

**Verification**:
```bash
npm run dev
# Theme should be applied on page load
# Check DevTools > Elements: <html data-theme="light">
```

---

### Phase 6: Theme Toggle Component (~45 minutes)

**Goal**: Create toggle switch for settings modal.

**Files to Create**:
1. `src/components/Settings/ThemeToggle.tsx`
2. `src/components/Settings/ThemeToggle.css`

**Files to Modify**:
1. `src/components/Settings/SettingsPanel.tsx`

**Steps**:

**1. Create ThemeToggle component** (`src/components/Settings/ThemeToggle.tsx`):

```typescript
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css';

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
          <span className="theme-toggle-icon">
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
```

**2. Create styles** (`src/components/Settings/ThemeToggle.css`):

```css
.theme-toggle-container {
  margin-bottom: var(--spacing-md);
}

.theme-toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.theme-toggle-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle-button:hover {
  background-color: var(--color-bg-bg2);
  transform: translateY(-1px);
}

.theme-toggle-button:active {
  transform: translateY(0);
}

.theme-toggle-icon {
  font-size: var(--font-size-lg);
}

.theme-toggle-text {
  font-weight: 500;
}
```

**3. Add to SettingsPanel** (`src/components/Settings/SettingsPanel.tsx`):

```typescript
import { ThemeToggle } from './ThemeToggle';  // ← Add import

// In the component JSX, add before or after other settings:
<ThemeToggle />
```

**Verification**:
```bash
npm run dev
# Open settings modal
# Theme toggle should appear and work
```

---

### Phase 7: Update Component Styles (~2 hours)

**Goal**: Replace hard-coded colors with theme variables in all components.

**Strategy**: Update one component at a time, testing after each change.

**Files to Modify** (in order):
1. `src/components/App.css`
2. `src/components/Timer/*.css`
3. `src/components/Settings/*.css`
4. `src/components/SessionTracking/*.css`
5. `src/components/Notifications/*.css`

**Example Transformation**:

```css
/* BEFORE */
.timer-display {
  background-color: #ffffff;
  color: #2c3e50;
  border: 1px solid #ecf0f1;
}

/* AFTER */
.timer-display {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

**Verification After Each Component**:
```bash
# 1. Start dev server
npm run dev

# 2. Test both themes:
#    - Toggle to dark mode
#    - Verify component renders correctly
#    - Toggle to light mode
#    - Verify component renders correctly

# 3. Check for contrast issues in DevTools
```

---

### Phase 8: Testing (~1 hour)

**Goal**: Write tests for theme system.

**Files to Create**:
1. `tests/unit/hooks/useTheme.test.ts`
2. `tests/integration/ThemeSwitching.test.tsx`

**Example Unit Test** (`tests/unit/hooks/useTheme.test.ts`):

```typescript
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { useTheme } from '../../../src/hooks/useTheme';

describe('useTheme', () => {
  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    
    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });
    
    act(() => {
      result.current.setTheme('dark');
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
  });
});
```

**Run Tests**:
```bash
npm run test:once
```

---

## Common Issues & Solutions

### Issue 1: Theme Flashes on Page Load

**Symptom**: Brief flash of wrong theme before correct theme loads.

**Solution**: Ensure FOIT prevention script is in `index.html` **before** any other scripts.

### Issue 2: CSS Variables Not Applying

**Symptom**: Colors don't change when toggling theme.

**Solution**: 
1. Verify `data-theme` attribute is set on `<html>` element
2. Check CSS imports in `global.css`
3. Clear browser cache

### Issue 3: localStorage Errors in Private Browsing

**Symptom**: Errors when accessing localStorage.

**Solution**: Theme system includes try/catch blocks. Theme will work in-session but not persist.

### Issue 4: TypeScript Errors After Adding Types

**Symptom**: Import errors for new types.

**Solution**: Restart TypeScript server in editor (VS Code: Cmd+Shift+P > "Restart TS Server")

---

## Verification Checklist

Before considering implementation complete, verify:

- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] App runs without console errors (`npm run dev`)
- [ ] Theme toggle appears in settings modal
- [ ] Clicking toggle switches between light and dark themes
- [ ] Theme persists after page reload
- [ ] Theme respects system preference on first visit
- [ ] All components render correctly in both themes
- [ ] Text is readable in both themes (check contrast)
- [ ] No flash of incorrect theme on page load
- [ ] Smooth transitions between themes (no jarring jumps)
- [ ] Tests pass (`npm run test:once`)

---

## Next Steps

After completing implementation:

1. **Accessibility Testing**: Use axe DevTools to verify WCAG compliance
2. **Cross-Browser Testing**: Test in Chrome, Firefox, Safari, Edge
3. **Performance Testing**: Verify theme switching is < 200ms
4. **User Testing**: Collect feedback on color choices and comfort
5. **Documentation**: Update main README with theme feature info

---

## Getting Help

**Debugging Tips**:

```bash
# Check current theme in console
document.documentElement.getAttribute('data-theme')

# Check localStorage
localStorage.getItem('theme-preference')

# Check computed CSS variables
getComputedStyle(document.documentElement).getPropertyValue('--color-background')
```

**Reference Documents**:
- [data-model.md](./data-model.md) - Data structures
- [contracts/useTheme.md](./contracts/useTheme.md) - Hook contract
- [contracts/gruvbox-colors.md](./contracts/gruvbox-colors.md) - Color palette
- [research.md](./research.md) - Technical decisions

---

**Quickstart Status**: ✅ Complete  
**Estimated Time**: 4-6 hours  
**Difficulty**: Intermediate

