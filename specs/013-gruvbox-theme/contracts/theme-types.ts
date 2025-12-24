# Contract: Theme Type Definitions

**Feature**: 013-gruvbox-theme  
**Purpose**: TypeScript type definitions for theme system  
**Location**: `src/types/theme.ts` (to be created)

---

## Type Exports

### 1. ThemeMode

**Description**: Core theme variant identifier.

```typescript
/**
 * Theme mode - light or dark
 */
export type ThemeMode = 'light' | 'dark';
```

**Usage**:
- Function parameters
- State variables
- localStorage values
- DOM attributes

**Validation**:
```typescript
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}
```

---

### 2. ThemePreference

**Description**: User's saved theme preference with metadata.

```typescript
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
```

**Storage Key**: `'theme-preference'`

**Example Value**:
```typescript
const preference: ThemePreference = {
  mode: 'dark',
  updatedAt: '2025-12-24T12:00:00.000Z',
  source: 'user'
};
```

---

### 3. ThemeColors

**Description**: Complete color palette for a theme variant.

```typescript
/**
 * Color palette for a single theme (light or dark)
 * Based on Gruvbox medium contrast variant
 */
export interface ThemeColors {
  /** Background color hierarchy */
  backgrounds: {
    /** Primary background (most common surface) */
    bg0: string;
    /** Secondary background (cards, panels) */
    bg1: string;
    /** Tertiary background (hover states) */
    bg2: string;
    /** Elevated surfaces, active states */
    bg3: string;
    /** Borders, dividers, inactive UI */
    bg4: string;
  };
  
  /** Foreground (text) color hierarchy */
  foregrounds: {
    /** Primary text (highest contrast - headings, body) */
    fg0: string;
    /** Secondary text (labels, captions) */
    fg1: string;
    /** Tertiary text (hints, metadata) */
    fg2: string;
    /** Muted text (timestamps, secondary info) */
    fg3: string;
    /** Disabled text (placeholders, inactive) */
    fg4: string;
  };
  
  /** Accent colors for interactive elements and semantics */
  accents: {
    red: string;
    redDark: string;
    green: string;
    greenDark: string;
    yellow: string;
    yellowDark: string;
    blue: string;
    blueDark: string;
    purple: string;
    purpleDark: string;
    aqua: string;
    aquaDark: string;
    orange: string;
    orangeDark: string;
  };
}
```

**Usage**: Define `GruvboxLightColors` and `GruvboxDarkColors` constants.

---

### 4. ThemeContextValue

**Description**: React Context value for theme provider.

```typescript
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
```

**Usage**: Return type of `useTheme()` hook.

---

### 5. CSSVariableName

**Description**: Type-safe CSS custom property names.

```typescript
/**
 * CSS custom property names for theme colors
 */
export type CSSVariableName =
  // Background variables
  | '--color-bg-bg0'
  | '--color-bg-bg1'
  | '--color-bg-bg2'
  | '--color-bg-bg3'
  | '--color-bg-bg4'
  // Foreground variables
  | '--color-fg-fg0'
  | '--color-fg-fg1'
  | '--color-fg-fg2'
  | '--color-fg-fg3'
  | '--color-fg-fg4'
  // Accent variables
  | '--color-accent-red'
  | '--color-accent-red-dark'
  | '--color-accent-green'
  | '--color-accent-green-dark'
  | '--color-accent-yellow'
  | '--color-accent-yellow-dark'
  | '--color-accent-blue'
  | '--color-accent-blue-dark'
  | '--color-accent-purple'
  | '--color-accent-purple-dark'
  | '--color-accent-aqua'
  | '--color-accent-aqua-dark'
  | '--color-accent-orange'
  | '--color-accent-orange-dark'
  // Convenience aliases
  | '--color-background'
  | '--color-surface'
  | '--color-text-primary'
  | '--color-text-secondary'
  | '--color-border';
```

**Usage**: Type-checking for CSS variable setters.

```typescript
function setCSSVariable(name: CSSVariableName, value: string): void {
  document.documentElement.style.setProperty(name, value);
}
```

---

### 6. GruvboxColorName

**Description**: Named colors from Gruvbox palette.

```typescript
/**
 * Named colors in Gruvbox palette (semantic names)
 */
export type GruvboxColorName =
  | 'bg0' | 'bg1' | 'bg2' | 'bg3' | 'bg4'
  | 'fg0' | 'fg1' | 'fg2' | 'fg3' | 'fg4'
  | 'red' | 'red-dark'
  | 'green' | 'green-dark'
  | 'yellow' | 'yellow-dark'
  | 'blue' | 'blue-dark'
  | 'purple' | 'purple-dark'
  | 'aqua' | 'aqua-dark'
  | 'orange' | 'orange-dark';
```

**Usage**: Documentation, color pickers, debugging.

---

## Type Guards

### isThemeMode

```typescript
/**
 * Type guard for ThemeMode
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}
```

### isThemePreference

```typescript
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
```

---

## Constants

### THEME_STORAGE_KEY

```typescript
/**
 * localStorage key for theme preference
 */
export const THEME_STORAGE_KEY = 'theme-preference' as const;
```

### DEFAULT_THEME

```typescript
/**
 * Default theme when no preference exists
 */
export const DEFAULT_THEME: ThemeMode = 'light';
```

---

## Extended Types (Integration)

### Updated UserPreferences

**File**: `src/types/settings.ts` (extend existing)

```typescript
/**
 * User preference settings
 * EXTENDED in 013-gruvbox-theme to include theme
 */
export interface UserPreferences {
  // ... existing fields (focusDuration, etc.) ...
  
  /**
   * User's theme preference
   * @since 013-gruvbox-theme
   */
  theme: ThemeMode;
}
```

**Updated Default**:

```typescript
export const DEFAULT_PREFERENCES: UserPreferences = {
  // ... existing defaults ...
  theme: 'light', // Added
};
```

---

## Type Usage Examples

### In Components

```typescript
import { ThemeMode } from '../types/theme';

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onToggle: (newTheme: ThemeMode) => void;
}

function ThemeToggle({ currentTheme, onToggle }: ThemeToggleProps) {
  const handleClick = () => {
    const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    onToggle(newTheme);
  };
  
  return <button onClick={handleClick}>Toggle Theme</button>;
}
```

### In Hooks

```typescript
import { ThemeMode, ThemeContextValue } from '../types/theme';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
```

### In Utilities

```typescript
import { ThemePreference, isThemePreference, THEME_STORAGE_KEY } from '../types/theme';

export function loadThemePreference(): ThemePreference | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return isThemePreference(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
```

---

## Import Paths

**Primary Type Module**:
```typescript
// All theme types
import type { 
  ThemeMode, 
  ThemePreference, 
  ThemeColors,
  ThemeContextValue 
} from '@/types/theme';
```

**Type Guards & Constants**:
```typescript
// Runtime utilities
import { 
  isThemeMode, 
  isThemePreference,
  THEME_STORAGE_KEY,
  DEFAULT_THEME 
} from '@/types/theme';
```

**Extended Settings Types**:
```typescript
// Settings integration
import type { UserPreferences } from '@/types/settings';
```

---

## TypeScript Configuration

**Required tsconfig.json settings** (already configured):

```json
{
  "compilerOptions": {
    "strict": true,              // Enforces type safety
    "noImplicitAny": true,       // No implicit any
    "strictNullChecks": true,    // Null safety
    "esModuleInterop": true      // Import compatibility
  }
}
```

---

## Type Safety Checklist

✅ All public APIs are typed (no `any`)  
✅ Type guards provided for runtime validation  
✅ Constants are `as const` for literal types  
✅ Discriminated unions where applicable  
✅ Readonly properties for immutable data  
✅ Strict mode compatible  
✅ JSDoc comments for all exports

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Initial type definitions |

---

**Contract Status**: ✅ Final  
**File Location**: `src/types/theme.ts` (to be created)  
**Dependencies**: None (pure types)

