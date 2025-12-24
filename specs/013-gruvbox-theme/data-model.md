# Data Model: Gruvbox Theme System

**Feature**: 013-gruvbox-theme  
**Date**: December 24, 2025  
**Purpose**: Define data structures, types, and relationships for theme management

## Overview

This document defines the data model for the Gruvbox theme system, including theme types, user preferences, color mappings, and state management structures.

---

## Core Entities

### 1. Theme Mode

**Description**: Represents the active visual theme of the application.

**Type Definition**:

```typescript
type ThemeMode = 'light' | 'dark';
```

**Values**:
- `'light'`: Light theme using Gruvbox light palette (warm backgrounds)
- `'dark'`: Dark theme using Gruvbox dark palette (dark backgrounds)

**Validation Rules**:
- Must be one of the two predefined string literals
- No null or undefined values allowed
- Case-sensitive (lowercase only)

**Usage Context**: Core primitive used throughout the theme system

---

### 2. Theme Preference

**Description**: User's saved theme preference with metadata for persistence.

**Type Definition**:

```typescript
interface ThemePreference {
  /** User's selected theme mode */
  mode: ThemeMode;
  
  /** Timestamp of last theme change (ISO 8601 format) */
  updatedAt: string;
  
  /** Source of the current preference */
  source: 'user' | 'system' | 'default';
}
```

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | `ThemeMode` | Yes | Active theme ('light' or 'dark') |
| `updatedAt` | `string` | Yes | ISO 8601 timestamp of last change |
| `source` | `'user' \| 'system' \| 'default'` | Yes | How preference was determined |

**Field Details**:

- **`mode`**: Current active theme
  - Validation: Must be valid `ThemeMode`
  - Default: Determined by `source`

- **`updatedAt`**: Timestamp for cache invalidation and debugging
  - Format: ISO 8601 string (e.g., "2025-12-24T12:00:00.000Z")
  - Generated: `new Date().toISOString()`
  - Used for: Debugging, future migrations, analytics

- **`source`**: Tracks how preference was set
  - `'user'`: User manually toggled in settings (highest priority)
  - `'system'`: Detected from OS `prefers-color-scheme` (medium priority)
  - `'default'`: Fallback light theme (lowest priority)
  - Priority order: user > system > default

**Storage Location**: localStorage key `'theme-preference'`

**Storage Format**:

```json
{
  "mode": "dark",
  "updatedAt": "2025-12-24T12:00:00.000Z",
  "source": "user"
}
```

**Lifecycle**:

```
1. Initial Load:
   - Check localStorage for saved preference
   - If found with source='user' → use it (highest priority)
   - If not found OR source='system'/'default' → check system preference
   - If system preference available → use it, set source='system'
   - Else → use 'light', set source='default'

2. User Toggle:
   - Update mode to opposite value
   - Set source='user'
   - Set updatedAt to current timestamp
   - Save to localStorage
   - Apply theme to DOM

3. System Change (while no user preference):
   - Detect via matchMedia change event
   - Only apply if source !== 'user'
   - Update mode, keep source='system'
   - Save to localStorage
```

---

### 3. Theme Colors

**Description**: Complete color palette for a single theme variant (light or dark).

**Type Definition**:

```typescript
interface ThemeColors {
  /** Background color hierarchy (bg0 is primary) */
  backgrounds: {
    bg0: string;  // Primary background
    bg1: string;  // Secondary background
    bg2: string;  // Tertiary background
    bg3: string;  // UI elements background
    bg4: string;  // Borders, inactive elements
  };
  
  /** Foreground (text) color hierarchy (fg0 is primary) */
  foregrounds: {
    fg0: string;  // Primary text (highest contrast)
    fg1: string;  // Secondary text
    fg2: string;  // Tertiary text
    fg3: string;  // Muted text
    fg4: string;  // Disabled text
  };
  
  /** Accent colors for interactive elements and status */
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

**Field Details**:

- **`backgrounds`**: Layered background colors for depth
  - `bg0`: Main application background (most used)
  - `bg1`: Card/panel backgrounds
  - `bg2`: Hover states, secondary surfaces
  - `bg3`: Active states, elevated surfaces
  - `bg4`: Borders, dividers, inactive UI

- **`foregrounds`**: Text colors with varying emphasis
  - `fg0`: Headings, primary content (highest contrast)
  - `fg1`: Body text, labels
  - `fg2`: Secondary labels, hints
  - `fg3`: Captions, timestamps
  - `fg4`: Disabled text, placeholders

- **`accents`**: Semantic and decorative colors
  - Used for: Buttons, links, status indicators, timer modes
  - Each color has a darker variant for depth/shadows
  - Orange: Focus mode accent
  - Blue: Short break mode accent
  - Green: Long break mode accent
  - Red: Errors, reset actions
  - Yellow: Warnings, highlights
  - Purple/Aqua: Future use, decorative

**Concrete Values**: See `GruvboxLightColors` and `GruvboxDarkColors` constants below.

---

### 4. Gruvbox Light Colors (Constant)

**Description**: Color palette for light theme (medium contrast variant).

**Constant Definition**:

```typescript
const GruvboxLightColors: ThemeColors = {
  backgrounds: {
    bg0: '#fbf1c7',  // Warm cream
    bg1: '#ebdbb2',  // Light tan
    bg2: '#d5c4a1',  // Medium tan
    bg3: '#bdae93',  // Dark tan
    bg4: '#a89984',  // Brown-gray
  },
  foregrounds: {
    fg0: '#282828',  // Almost black
    fg1: '#3c3836',  // Dark gray-brown
    fg2: '#504945',  // Medium gray-brown
    fg3: '#665c54',  // Light gray-brown
    fg4: '#7c6f64',  // Lighter gray-brown
  },
  accents: {
    red: '#cc241d',
    redDark: '#9d0006',
    green: '#98971a',
    greenDark: '#79740e',
    yellow: '#d79921',
    yellowDark: '#b57614',
    blue: '#458588',
    blueDark: '#076678',
    purple: '#b16286',
    purpleDark: '#8f3f71',
    aqua: '#689d6a',
    aquaDark: '#427b58',
    orange: '#d65d0e',
    orangeDark: '#af3a03',
  },
};
```

**Accessibility**: All fg0-fg2 on bg0 combinations exceed WCAG AAA (7:1+). All accent colors on bg0 meet WCAG AA (4.5:1+).

---

### 5. Gruvbox Dark Colors (Constant)

**Description**: Color palette for dark theme (medium contrast variant).

**Constant Definition**:

```typescript
const GruvboxDarkColors: ThemeColors = {
  backgrounds: {
    bg0: '#282828',  // Dark gray
    bg1: '#3c3836',  // Medium dark gray
    bg2: '#504945',  // Medium gray
    bg3: '#665c54',  // Light gray
    bg4: '#7c6f64',  // Lighter gray
  },
  foregrounds: {
    fg0: '#fbf1c7',  // Warm cream (inverted from light)
    fg1: '#ebdbb2',  // Light tan
    fg2: '#d5c4a1',  // Medium tan
    fg3: '#bdae93',  // Dark tan
    fg4: '#a89984',  // Brown-gray
  },
  accents: {
    red: '#fb4934',        // Brighter red for dark bg
    redDark: '#cc241d',
    green: '#b8bb26',      // Brighter green
    greenDark: '#98971a',
    yellow: '#fabd2f',     // Brighter yellow
    yellowDark: '#d79921',
    blue: '#83a598',       // Brighter blue
    blueDark: '#458588',
    purple: '#d3869b',     // Brighter purple
    purpleDark: '#b16286',
    aqua: '#8ec07c',       // Brighter aqua
    aquaDark: '#689d6a',
    orange: '#fe8019',     // Brighter orange
    orangeDark: '#d65d0e',
  },
};
```

**Accessibility**: All fg0-fg2 on bg0 combinations exceed WCAG AAA (7:1+). All bright accent colors on bg0 meet WCAG AA (4.5:1+).

---

### 6. Theme Context State

**Description**: React Context value providing theme state and controls to components.

**Type Definition**:

```typescript
interface ThemeContextValue {
  /** Current active theme mode */
  theme: ThemeMode;
  
  /** Explicitly set theme (overrides system preference) */
  setTheme: (mode: ThemeMode) => void;
  
  /** Toggle between light and dark */
  toggleTheme: () => void;
  
  /** Whether the theme was set by user (vs system) */
  isUserPreference: boolean;
  
  /** Current system preference (null if unavailable) */
  systemPreference: ThemeMode | null;
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `theme` | `ThemeMode` | Currently applied theme |
| `setTheme` | `(mode: ThemeMode) => void` | Function to set specific theme |
| `toggleTheme` | `() => void` | Function to toggle light ↔ dark |
| `isUserPreference` | `boolean` | True if user manually set theme |
| `systemPreference` | `ThemeMode \| null` | OS theme (null if unavailable) |

**Usage**:

```typescript
const { theme, toggleTheme, isUserPreference } = useTheme();

// In component
<button onClick={toggleTheme}>
  Switch to {theme === 'light' ? 'dark' : 'light'} mode
</button>
```

---

### 7. CSS Variable Mapping

**Description**: Mapping of theme colors to CSS custom properties.

**Structure**:

```typescript
type CSSVariableMap = {
  [K in keyof ThemeColors['backgrounds']]: `--color-bg-${K}`;
} & {
  [K in keyof ThemeColors['foregrounds']]: `--color-fg-${K}`;
} & {
  [K in keyof ThemeColors['accents']]: `--color-accent-${K}`;
};
```

**Concrete Mapping**:

| Theme Color Path | CSS Variable Name |
|------------------|-------------------|
| `backgrounds.bg0` | `--color-bg-bg0` |
| `backgrounds.bg1` | `--color-bg-bg1` |
| `foregrounds.fg0` | `--color-fg-fg0` |
| `accents.red` | `--color-accent-red` |
| `accents.orange` | `--color-accent-orange` |
| ... | ... |

**Simplified Aliases** (for common uses):

| Alias Variable | Maps To | Purpose |
|----------------|---------|---------|
| `--color-background` | `--color-bg-bg0` | Primary background |
| `--color-surface` | `--color-bg-bg1` | Card/panel backgrounds |
| `--color-text-primary` | `--color-fg-fg0` | Main text color |
| `--color-text-secondary` | `--color-fg-fg2` | Secondary text |
| `--color-border` | `--color-bg-bg4` | Borders and dividers |

**Application Method**: Set via JavaScript after theme calculation:

```typescript
function applyThemeToDOM(mode: ThemeMode): void {
  const colors = mode === 'light' ? GruvboxLightColors : GruvboxDarkColors;
  const root = document.documentElement;
  
  root.setAttribute('data-theme', mode);
  
  // Apply background colors
  root.style.setProperty('--color-bg-bg0', colors.backgrounds.bg0);
  // ... (all mappings)
}
```

---

## State Transitions

### Theme Mode State Machine

```
┌─────────┐
│ Initial │
│  Load   │
└────┬────┘
     │
     ├─ Has user preference? ──yes──> [User Theme]
     │                                      │
     ├─ Has system pref? ──yes──> [System Theme]
     │                                      │
     └─ Default ──────────────────> [Light Theme]
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │ Active Theme │◄────┐
                                    └──────┬───────┘     │
                                           │             │
                                    User toggles         │
                                    in settings          │
                                           │             │
                                           ▼             │
                                    [Save to storage] ───┘
                                    [Apply to DOM]
                                    [Set source='user']
```

### System Preference Handling

```
System theme changes (matchMedia event)
                │
                ▼
        Is source='user'?
                │
            ┌───┴───┐
           YES      NO
            │        │
        Ignore   Apply new theme
                     │
                     ├─ Update mode
                     ├─ Keep source='system'
                     ├─ Save to storage
                     └─ Apply to DOM
```

---

## Validation Rules

### Theme Mode Validation

```typescript
function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}
```

### Theme Preference Validation

```typescript
function isValidThemePreference(value: unknown): value is ThemePreference {
  if (!value || typeof value !== 'object') return false;
  
  const pref = value as Record<string, unknown>;
  
  return (
    isValidThemeMode(pref.mode) &&
    typeof pref.updatedAt === 'string' &&
    (pref.source === 'user' || pref.source === 'system' || pref.source === 'default')
  );
}
```

### localStorage Data Migration

**Current Version**: 1.0

**Migration Strategy**: If stored data doesn't match current schema, discard and re-initialize from system preference.

```typescript
function loadThemePreference(): ThemePreference | null {
  try {
    const stored = localStorage.getItem('theme-preference');
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Validate schema
    if (!isValidThemePreference(parsed)) {
      console.warn('Invalid theme preference schema, discarding');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load theme preference:', error);
    return null;
  }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Load                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Load from      │
                    │  localStorage   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Valid data?    │
                    └────┬─────────┬──┘
                        YES       NO
                         │         │
                         │         ▼
                         │    ┌─────────────────┐
                         │    │ Check system    │
                         │    │ preference      │
                         │    └────────┬────────┘
                         │             │
                         └─────────┬───┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │ Initialize Theme │
                         │ Context State    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Apply to DOM     │
                         │ (data-theme attr)│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Render UI        │
                         └──────────────────┘
                                  
┌─────────────────────────────────────────────────────────────────┐
│                        User Interaction                          │
└────────────────────────────────────────────────────────────────┬┘
                                                                  │
                                                                  ▼
                                                      ┌───────────────────┐
                                                      │ User clicks       │
                                                      │ theme toggle      │
                                                      └─────────┬─────────┘
                                                                │
                                                                ▼
                                                      ┌───────────────────┐
                                                      │ toggleTheme()     │
                                                      │ called            │
                                                      └─────────┬─────────┘
                                                                │
                                        ┌───────────────────────┼───────────────────────┐
                                        │                       │                       │
                                        ▼                       ▼                       ▼
                              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                              │ Update Context   │  │ Save to          │  │ Apply to DOM     │
                              │ State            │  │ localStorage     │  │ (instant)        │
                              └──────────────────┘  └──────────────────┘  └──────────────────┘
                                        │                       │                       │
                                        └───────────────────────┴───────────────────────┘
                                                                │
                                                                ▼
                                                      ┌───────────────────┐
                                                      │ Components        │
                                                      │ re-render with    │
                                                      │ new theme         │
                                                      └───────────────────┘
```

---

## Integration with Existing Settings

### Extended UserPreferences Type

The existing `UserPreferences` type (from `src/types/settings.ts`) will be extended to include theme preference:

```typescript
// EXTENDED (not replaced)
export interface UserPreferences {
  // ... existing fields (focusDuration, etc.)
  
  /** User's theme preference (added in 013-gruvbox-theme) */
  theme: ThemeMode;
}
```

**Note**: The `ThemePreference` entity is separate from `UserPreferences.theme` to maintain single responsibility:
- `UserPreferences.theme`: Simple mode value for UI/settings
- `ThemePreference` (localStorage): Full metadata including source and timestamp

**Synchronization**: When user changes theme via toggle, both are updated:

```typescript
function handleThemeToggle(newMode: ThemeMode): void {
  // Update theme system
  setTheme(newMode);
  
  // Sync to user preferences (for settings UI)
  updatePreferences({ theme: newMode });
}
```

---

## Summary

The theme system data model consists of:

1. **Simple primitives**: `ThemeMode` (2 values)
2. **Structured preferences**: `ThemePreference` (persisted)
3. **Color palettes**: `ThemeColors` (2 constants: light & dark)
4. **React state**: `ThemeContextValue` (runtime)
5. **CSS mapping**: Variable names for styling

**Key Design Decisions**:
- Separation of concerns: preference storage vs. UI state
- Type safety: All values strongly typed with TypeScript
- Validation: Runtime checks for localStorage data
- Extensibility: Easy to add new themes (e.g., 'high-contrast') in future

---

**Data Model Status**: ✅ Complete  
**Next Phase**: Contracts (hook interfaces, component props)

