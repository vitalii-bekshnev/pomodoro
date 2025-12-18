# Phase 0: Research & Technology Decisions

**Feature**: Pomodoro Timer  
**Date**: December 18, 2025  
**Context**: Single-page React + TypeScript web application with no backend

---

## Research Tasks Completed

### 1. Timer Implementation Strategies

**Question**: What's the best approach for implementing a countdown timer in React that updates every second and can be paused/resumed?

**Research Findings**:

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| setInterval with useState | Simple, familiar pattern | Can drift over time, cleanup required | ❌ Not chosen |
| setInterval with useRef | No re-renders, precise control | Slightly more complex | ✅ **CHOSEN** |
| requestAnimationFrame | Most accurate, 60fps | Overkill for 1-second updates | ❌ Not chosen |
| Web Workers | Perfect accuracy, non-blocking | Complex setup, message passing overhead | ❌ Not chosen |

**Decision**: **setInterval with useRef**

**Rationale**:
- Store timer ID in useRef to avoid re-renders on every interval
- Track remaining time in state for UI updates
- Calculate time delta on each tick to compensate for drift
- Clear interval on unmount and state changes
- Balance of accuracy and simplicity for 1-second granularity

**Implementation Pattern**:
```typescript
const useTimer = (duration: number) => {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current!;
      const newRemaining = duration - elapsed;
      if (newRemaining <= 0) {
        clearInterval(intervalRef.current!);
        setRemaining(0);
      } else {
        setRemaining(newRemaining);
      }
    }, 100); // Check every 100ms for smoother updates
  };

  useEffect(() => () => clearInterval(intervalRef.current!), []);
  
  return { remaining, start, pause, reset };
};
```

**Alternatives Considered & Rejected**:
- **requestAnimationFrame**: Too precise for 1-second updates, wastes CPU
- **Web Workers**: Adds complexity without meaningful benefit for this scale
- **External libraries (react-countdown)**: Adds dependency for simple functionality

---

### 2. State Management Solution

**Question**: Do we need Redux/Zustand/Context API, or are React Hooks sufficient?

**Research Findings**:

| Solution | Use Case | Complexity | Decision |
|----------|----------|------------|----------|
| React Hooks (useState, useReducer) | Local state, simple apps | Low | ✅ **CHOSEN** |
| Context API | Avoid prop drilling, shared state | Medium | ❌ Not needed |
| Redux Toolkit | Complex state, time-travel debugging | High | ❌ Overkill |
| Zustand | Medium complexity, good DX | Medium | ❌ Not needed |

**Decision**: **React Hooks only (useState, useReducer)**

**Rationale**:
- App has simple state: timer, settings, session count
- No deep prop drilling (shallow component tree: 3 levels max)
- All state mutations are straightforward (no complex async logic)
- localStorage persistence is simple with custom hooks
- useReducer for timer state machine (idle/running/paused/completed)
- Fewer dependencies = smaller bundle, faster load

**State Distribution**:
- **Timer state**: useReducer in useTimer hook (mode, duration, remaining, status)
- **Settings state**: useState in useSettings hook (durations, auto-start flags, sounds)
- **Session tracking**: useState in useSessionTracking hook (date, count, cycle position)

**Alternatives Considered & Rejected**:
- **Context API**: Only 1-2 levels of prop passing, not worth the boilerplate
- **Redux**: Massive overkill for this scope, adds 100KB+ to bundle
- **Zustand**: Nice DX but unnecessary dependency for this simple state

---

### 3. Progress Ring Animation

**Question**: How to create a smooth circular progress indicator that updates every second?

**Research Findings**:

| Approach | Performance | Browser Support | Complexity | Decision |
|----------|-------------|-----------------|------------|----------|
| SVG stroke-dashoffset | 60fps (GPU) | Excellent | Low | ✅ **CHOSEN** |
| Canvas 2D API | 60fps | Excellent | Medium | ❌ More code |
| CSS conic-gradient | 60fps | Good (Safari 12.1+) | Low | ❌ Limited styling |
| HTML5 Progress element | N/A | Excellent | Very Low | ❌ No circular support |

**Decision**: **SVG circle with animated stroke-dashoffset**

**Rationale**:
- Hardware-accelerated via CSS transitions
- Declarative (just update one CSS property)
- Fully customizable (colors, stroke width, radius)
- Excellent browser support (IE11+ if needed)
- Small code footprint (~30 lines)

**Implementation Pattern**:
```typescript
// ProgressRing.tsx
const ProgressRing = ({ percent, radius, stroke }: Props) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={radius * 2} height={radius * 2}>
      <circle
        cx={radius}
        cy={radius}
        r={radius - stroke / 2}
        fill="transparent"
        stroke="#e0e0e0"
        strokeWidth={stroke}
      />
      <circle
        cx={radius}
        cy={radius}
        r={radius - stroke / 2}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${radius} ${radius})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
};
```

**Alternatives Considered & Rejected**:
- **Canvas**: More imperative code, harder to maintain, no declarative benefits
- **conic-gradient**: Limited styling options, Safari requirement too high
- **External library (react-circular-progressbar)**: Adds 15KB for 30 lines of code

---

### 4. Audio Notification System

**Question**: How to reliably play notification sounds on session completion?

**Research Findings**:

**Browser Autoplay Policies** (Critical Constraint):
- Chrome/Edge: Requires user interaction before audio playback
- Firefox: Requires user interaction (stricter than Chrome)
- Safari: Requires user interaction (strictest policy)

**Solution**: Pre-load audio on first user interaction (Start button click)

**Decision**: **HTML5 Audio API with pre-loaded buffers**

**Rationale**:
- Native browser API, no dependencies
- Pre-load on mount (ready when needed)
- Distinct sounds for focus vs break (FR-008)
- Fallback: silent if audio fails (doesn't block functionality)

**Implementation Pattern**:
```typescript
const useNotifications = (soundsEnabled: boolean) => {
  const focusAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    focusAudioRef.current = new Audio('/sounds/focus-complete.mp3');
    breakAudioRef.current = new Audio('/sounds/break-complete.mp3');
    
    // Pre-load
    focusAudioRef.current.load();
    breakAudioRef.current.load();
  }, []);

  const playFocusComplete = () => {
    if (soundsEnabled && focusAudioRef.current) {
      focusAudioRef.current.play().catch(err => 
        console.warn('Audio playback failed:', err)
      );
    }
  };

  const playBreakComplete = () => {
    if (soundsEnabled && breakAudioRef.current) {
      breakAudioRef.current.play().catch(err => 
        console.warn('Audio playback failed:', err)
      );
    }
  };

  return { playFocusComplete, playBreakComplete };
};
```

**Sound File Requirements**:
- Format: MP3 (universal browser support)
- Duration: 1-3 seconds (brief, non-intrusive)
- Focus complete: Gentle chime (celebratory, energizing)
- Break complete: Softer tone (calming, inviting rest)
- File size: <50KB each

**Alternatives Considered & Rejected**:
- **Web Audio API**: Overkill for simple playback, complex setup
- **External library (howler.js)**: Adds 25KB for simple use case
- **OS notifications with sound**: Requires permission, spec clarifies in-app only

---

### 5. localStorage Persistence Strategy

**Question**: How to persist settings and timer state across browser sessions?

**Research Findings**:

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| localStorage (JSON) | Simple, synchronous, 5-10MB limit | No encryption, string-only | ✅ **CHOSEN** |
| IndexedDB | Large storage, structured | Async, complex API | ❌ Overkill |
| sessionStorage | Simple | Clears on tab close | ❌ Wrong scope |
| Cookies | Universal | 4KB limit, sent with requests | ❌ Too small |

**Decision**: **localStorage with JSON serialization**

**Rationale**:
- Storage needs: <1KB (settings + timer state)
- Synchronous API fits React state updates
- Available in all target browsers
- Simple error handling (quota exceeded unlikely)

**Storage Keys**:
```typescript
const STORAGE_KEYS = {
  PREFERENCES: 'pomodoro_preferences',
  TIMER_STATE: 'pomodoro_timer_state',
  DAILY_PROGRESS: 'pomodoro_daily_progress'
};
```

**Implementation Pattern**:
```typescript
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue] as const;
};
```

**Data Validation**:
- Validate structure on read (check for required fields)
- Use default values if validation fails
- Clear corrupted data gracefully

**Alternatives Considered & Rejected**:
- **IndexedDB**: Complex async API for <1KB of data
- **sessionStorage**: Doesn't persist across browser restarts (fails FR-012)
- **URL state**: Settings in URL would be ugly and expose user preferences

---

### 6. Date/Time Utilities

**Question**: Should we use a date library or native JavaScript Date?

**Research Findings**:

| Library | Size | Pros | Cons | Decision |
|---------|------|------|------|----------|
| Native Date | 0KB | Built-in, fast | Verbose, timezone quirks | ❌ Too much boilerplate |
| date-fns | ~15KB (tree-shakeable) | Functional, immutable, modular | Larger than needed | ✅ **CHOSEN** |
| moment.js | 67KB | Feature-rich | Huge bundle, deprecated | ❌ Too large |
| dayjs | 2KB | Tiny, moment-like API | Less mature | ⚠️ Acceptable alternative |

**Decision**: **date-fns (tree-shaken imports)**

**Rationale**:
- Only import what we need: `format`, `isToday`, `startOfDay`
- Final bundle impact: ~5KB (3 functions)
- Immutable, no timezone surprises
- Excellent TypeScript support
- Active maintenance

**Functions Used**:
```typescript
import { format, isToday, startOfDay } from 'date-fns';

// Format timer display: MM:SS
const formatTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Check if daily progress is from today
const isDailyProgressCurrent = (dateString: string) => {
  return isToday(new Date(dateString));
};

// Get midnight boundary for daily reset
const getMidnight = () => startOfDay(new Date()).toISOString();
```

**Alternatives Considered & Rejected**:
- **Native Date only**: Too verbose for format operations, error-prone
- **moment.js**: Deprecated, bundle size unacceptable
- **dayjs**: Good alternative if bundle size is critical (<2KB)

---

### 7. Testing Strategy

**Question**: What testing approach balances coverage with development speed?

**Research Findings**:

**Decision**: **Jest + React Testing Library**

**Rationale**:
- Jest: Industry standard, built into Create React App
- RTL: Tests user behavior, not implementation details
- No need for E2E tools (Cypress/Playwright) - single-page app without backend

**Test Coverage Targets**:
- **Hooks**: 90%+ coverage (core business logic)
  - useTimer: All state transitions (idle → running → paused → completed)
  - useSessionTracking: Cycle counting, daily reset
  - useSettings: Persistence, validation
- **Components**: 70%+ coverage (critical paths only)
  - Timer controls: Start/pause/reset/skip flows
  - Settings panel: Save/cancel, validation
- **Integration**: Key user journeys
  - Complete Pomodoro cycle (focus → break)
  - 4-session → long break trigger
  - Settings persistence across app reload

**Testing Utilities**:
```typescript
// Mock timers for fast tests
jest.useFakeTimers();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn()
}));
```

**Alternatives Considered & Rejected**:
- **Enzyme**: Deprecated in favor of RTL
- **Cypress/Playwright**: Overkill for no-backend SPA, adds CI complexity

---

## Technology Stack Summary

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "date-fns": "^2.30.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

**Total Bundle Size Estimate**: ~150KB gzipped (React 18 + date-fns + app code)

### Browser API Usage

- **localStorage**: Settings and state persistence
- **Audio API**: Notification sounds
- **setInterval**: Timer countdown
- **CSS Transitions**: Progress ring animation

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Browser autoplay blocks audio | High | Low | Graceful fallback, visual-only notifications |
| localStorage quota exceeded | Very Low | Low | Validation, error handling, very small data |
| Timer drift over long durations | Medium | Low | Calculate elapsed time, not intervals |
| React re-render performance | Low | Medium | Use React.memo, useMemo, useCallback |
| Cross-browser inconsistencies | Low | Low | Test in Chrome, Firefox, Safari |

---

## Next Steps

All technology decisions finalized. Proceed to Phase 1:
- Generate data-model.md (TypeScript interfaces)
- Generate contracts/ (Component and hook signatures)
- Generate quickstart.md (Setup instructions)

**Status**: ✅ Research Complete

