# Contract: useTheme Hook

**Feature**: 013-gruvbox-theme  
**Component**: Theme Management Hook  
**Type**: Custom React Hook  
**Purpose**: Provide theme state and controls to components

---

## Interface Definition

### Hook Signature

```typescript
function useTheme(): ThemeContextValue
```

### Return Type

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

### Supporting Types

```typescript
type ThemeMode = 'light' | 'dark';
```

---

## Behavior Contract

### 1. Initialization

**On First Call**:
1. Check localStorage for saved `ThemePreference`
2. If found with `source='user'`, use that mode
3. Else, check system preference via `window.matchMedia('(prefers-color-scheme: dark)')`
4. If system preference unavailable, default to `'light'`
5. Apply theme to DOM immediately (set `data-theme` attribute)
6. Return initialized context value

**DOM Side Effect**:
```typescript
document.documentElement.setAttribute('data-theme', mode);
```

### 2. setTheme(mode)

**Purpose**: Explicitly set theme to a specific mode.

**Parameters**:
- `mode: ThemeMode` - The theme to apply ('light' or 'dark')

**Behavior**:
1. Validate `mode` is valid `ThemeMode` (runtime check)
2. Update internal state with new mode
3. Set `source` to `'user'` (highest priority)
4. Update `updatedAt` timestamp
5. Save to localStorage as `ThemePreference`
6. Apply to DOM (set `data-theme` attribute)
7. Trigger React re-render

**Side Effects**:
- Writes to localStorage
- Modifies DOM attribute
- Triggers component re-renders

**Error Handling**:
- If localStorage unavailable: Log warning, continue with in-memory state
- If invalid mode provided: Throw TypeError

**Example**:
```typescript
const { setTheme } = useTheme();

// User clicks "Dark Mode" button
setTheme('dark');
```

### 3. toggleTheme()

**Purpose**: Switch between light and dark modes.

**Behavior**:
1. Calculate opposite of current theme: `theme === 'light' ? 'dark' : 'light'`
2. Call `setTheme(oppositeMode)` internally

**Equivalent To**:
```typescript
setTheme(theme === 'light' ? 'dark' : 'light')
```

**Example**:
```typescript
const { theme, toggleTheme } = useTheme();

// User clicks toggle switch
<button onClick={toggleTheme}>
  Current: {theme}, Click to toggle
</button>
```

### 4. isUserPreference

**Purpose**: Indicate whether theme was manually set by user.

**Returns**:
- `true`: User explicitly called `setTheme()` or `toggleTheme()`
- `false`: Theme is from system preference or default

**Usage**:
```typescript
const { isUserPreference, systemPreference } = useTheme();

// Show indicator in settings
{!isUserPreference && (
  <span>Using system preference: {systemPreference}</span>
)}
```

### 5. systemPreference

**Purpose**: Expose current OS theme preference.

**Returns**:
- `'light'`: OS is in light mode
- `'dark'`: OS is in dark mode
- `null`: System preference unavailable (old browser or API not supported)

**Reactivity**: Updates automatically when OS theme changes (via `matchMedia` listener).

**Usage**:
```typescript
const { systemPreference } = useTheme();

// Show system theme info
<p>Your system is set to: {systemPreference ?? 'unknown'}</p>
```

---

## Usage Requirements

### 1. Provider Requirement

**MUST** be used within `ThemeProvider`:

```typescript
// ✅ Correct
function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}

function MyComponent() {
  const { theme } = useTheme(); // ✅ Works
  return <div>Theme: {theme}</div>;
}

// ❌ Error
function MyComponent() {
  const { theme } = useTheme(); // ❌ Throws error
  return <div>Theme: {theme}</div>;
}
```

**Error Message**: "useTheme must be used within ThemeProvider"

### 2. Call Location

**MUST** be called at component top level (React rules of hooks):

```typescript
// ✅ Correct
function MyComponent() {
  const { theme } = useTheme();
  // ...
}

// ❌ Error - conditional hook call
function MyComponent() {
  if (condition) {
    const { theme } = useTheme(); // ❌ Violates rules of hooks
  }
}
```

### 3. Re-render Behavior

**Triggers re-render when**:
- `theme` changes (user toggle or system change)
- `isUserPreference` changes (user sets theme for first time)
- `systemPreference` changes (OS theme changes)

**Does NOT trigger re-render when**:
- Functions are called (`setTheme`, `toggleTheme` are stable references)

---

## Performance Characteristics

### Initialization Performance

- **First call**: ~5ms (includes localStorage read + DOM manipulation)
- **Subsequent calls**: ~0ms (returns cached context value)

### Theme Switch Performance

- **setTheme/toggleTheme**: < 10ms total
  - State update: < 1ms
  - localStorage write: < 3ms
  - DOM attribute set: < 1ms
  - Re-render cascade: < 5ms

**Optimization**: All functions are memoized with `useCallback` to prevent unnecessary re-renders.

---

## Testing Contract

### Unit Test Requirements

1. **Initialization Tests**:
   - Loads saved preference from localStorage
   - Falls back to system preference if no saved preference
   - Falls back to 'light' if no system preference
   - Applies theme to DOM on load

2. **setTheme Tests**:
   - Updates theme state correctly
   - Persists to localStorage
   - Sets source to 'user'
   - Applies to DOM attribute

3. **toggleTheme Tests**:
   - Toggles from light to dark
   - Toggles from dark to light

4. **System Preference Tests**:
   - Detects initial system preference
   - Responds to system preference changes (when no user preference)
   - Ignores system changes when user has set preference

5. **Error Handling Tests**:
   - Handles localStorage unavailable gracefully
   - Handles invalid mode parameter

### Mock Requirements

For testing, provide mock implementation:

```typescript
// Test helper
export function MockThemeProvider({ 
  children, 
  initialTheme = 'light' 
}: { 
  children: React.ReactNode; 
  initialTheme?: ThemeMode;
}) {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  
  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
    isUserPreference: false,
    systemPreference: null,
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

---

## Examples

### Basic Usage

```typescript
function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

### Advanced Usage with System Preference

```typescript
function ThemeSettings() {
  const { theme, setTheme, isUserPreference, systemPreference } = useTheme();
  
  return (
    <div>
      <h3>Theme Settings</h3>
      
      <label>
        <input 
          type="radio" 
          checked={theme === 'light'}
          onChange={() => setTheme('light')}
        />
        Light Mode
      </label>
      
      <label>
        <input 
          type="radio" 
          checked={theme === 'dark'}
          onChange={() => setTheme('dark')}
        />
        Dark Mode
      </label>
      
      {!isUserPreference && (
        <p className="hint">
          Currently using system preference: {systemPreference}
        </p>
      )}
    </div>
  );
}
```

### Styled Component Integration

```typescript
function ThemedCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <div 
      className="card"
      data-theme={theme}
      style={{
        // Use CSS variables that change with theme
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
      }}
    >
      {children}
    </div>
  );
}
```

---

## Breaking Changes Policy

### Backward Compatibility

**Guaranteed Stable**:
- Hook name: `useTheme`
- Return fields: `theme`, `setTheme`, `toggleTheme`
- Theme values: `'light'`, `'dark'`

**May Change in Future Versions**:
- Additional fields in return type (backward compatible additions)
- localStorage schema (with migration support)

**Will NOT Change**:
- Function signatures (`setTheme`, `toggleTheme`)
- Core behavior (theme persistence, system detection)

---

## Dependencies

**Required Imports**:
```typescript
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
```

**Runtime Dependencies**:
- React 18.2+
- Browser APIs: `localStorage`, `window.matchMedia`

**No External Libraries Required**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Initial contract definition |

---

**Contract Status**: ✅ Final  
**Implementation Required**: Yes  
**Breaking Changes**: None (new feature)

