# Quickstart Guide: Pomodoro Timer

**Feature**: Pomodoro Timer  
**Tech Stack**: React 18 + TypeScript 5 + Vite  
**Last Updated**: December 18, 2025

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended with ESLint + TypeScript extensions

Verify installations:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

---

## Initial Setup

### 1. Clone Repository (if not already done)

```bash
git clone <repository-url>
cd pomodoro
git checkout 001-pomodoro-timer
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- React 18.2+
- TypeScript 5.3+
- Vite (build tool)
- Jest + React Testing Library
- date-fns
- ESLint + Prettier

**Expected install time**: 30-60 seconds

### 3. Verify Installation

```bash
npm run typecheck  # TypeScript compilation check
npm run lint       # ESLint check
```

Both should complete without errors.

---

## Project Structure

```
pomodoro/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions
│   ├── constants/       # Constants and defaults
│   ├── styles/          # CSS and theme
│   └── index.tsx        # Entry point
├── public/
│   └── sounds/          # Notification audio files
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── specs/
│   └── 001-pomodoro-timer/  # This feature's documentation
├── package.json
├── tsconfig.json
├── vite.config.ts
└── jest.config.js
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

- Opens browser at `http://localhost:5173`
- Hot module replacement (HMR) enabled
- Changes reflect instantly

**Expected startup time**: 2-3 seconds

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all tests in watch mode |
| `npm run test:once` | Run tests once (CI mode) |
| `npm run test:coverage` | Generate coverage report |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix auto-fixable ESLint errors |
| `npm run format` | Format code with Prettier |

### Development Tips

1. **Hot Reload**: Save any file to see changes instantly
2. **TypeScript Errors**: Show in terminal and VS Code problems panel
3. **React DevTools**: Install browser extension for component inspection
4. **Console Logs**: Use `console.log()` freely in development (removed in production build)

---

## Running Tests

### All Tests (Watch Mode)

```bash
npm test
```

- Watches for file changes
- Re-runs affected tests automatically
- Press `a` to run all tests
- Press `q` to quit

### Single Test Run (CI Mode)

```bash
npm run test:once
```

Exits after running all tests once.

### Coverage Report

```bash
npm run test:coverage
```

Generates HTML report in `coverage/` directory.
Open `coverage/index.html` in browser to view.

**Coverage Targets**:
- Hooks: 90%+
- Components: 70%+
- Utils: 90%+

### Running Specific Tests

```bash
# Run tests matching filename pattern
npm test -- Timer

# Run single test file
npm test -- useTimer.test.ts

# Run tests in specific directory
npm test -- tests/unit/hooks
```

---

## Building for Production

### Create Production Build

```bash
npm run build
```

Outputs to `dist/` directory:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Minified app bundle
│   ├── index-[hash].css   # Minified styles
│   └── [audio files]      # Notification sounds
└── [other static assets]
```

**Expected bundle size**: ~150KB gzipped

### Preview Production Build

```bash
npm run preview
```

Opens production build at `http://localhost:4173`

### Build Optimization

Vite automatically:
- Minifies JavaScript and CSS
- Tree-shakes unused code
- Splits vendor chunks
- Generates source maps (in `dist/`)
- Optimizes assets

---

## Environment Configuration

### Development Environment

Create `.env.development`:
```env
# Development settings
VITE_APP_NAME="Pomodoro Timer (Dev)"
```

### Production Environment

Create `.env.production`:
```env
# Production settings
VITE_APP_NAME="Pomodoro Timer"
```

**Access in code**:
```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

---

## Browser Compatibility

### Supported Browsers

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Opera: 76+

### Testing in Multiple Browsers

1. **Chrome** (default): `npm run dev`
2. **Firefox**: Open `http://localhost:5173` manually
3. **Safari**: Open `http://localhost:5173` manually

### Required Browser Features

- ES2020 JavaScript
- CSS Custom Properties
- localStorage API
- Audio API
- SVG support

All features available in target browsers.

---

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug in Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

**Usage**:
1. Run `npm run dev` in terminal
2. Press F5 in VS Code
3. Set breakpoints in code
4. Debug like any Node.js app

### Browser DevTools

**Chrome DevTools**:
- `F12` to open
- Sources tab → Set breakpoints
- Console tab → View logs
- React DevTools → Inspect components

**Common Debug Points**:
- `useTimer` hook: Timer state transitions
- `useSessionTracking` hook: Cycle increment logic
- `localStorage` operations: Settings persistence

### Console Logging

```typescript
// Good: Structured logging
console.log('[Timer] Starting focus session', { duration, mode });

// Good: Error logging
console.error('[Settings] Failed to save:', error);

// Avoid: Excessive logging
// console.log('render'); // Don't log on every render
```

---

## Common Issues & Solutions

### Issue: Port 5173 Already in Use

**Solution**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Issue: TypeScript Errors After Installing Dependencies

**Solution**:
```bash
# Restart TypeScript server (VS Code)
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or rebuild
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tests Failing with "localStorage is not defined"

**Solution**: Already handled in `jest.config.js` with jsdom environment.

If still fails:
```typescript
// In test file
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
});
```

### Issue: Audio Not Playing

**Causes**:
1. Browser autoplay policy (requires user interaction)
2. Missing audio files in `public/sounds/`
3. Incorrect file path

**Solution**:
- Ensure first play happens after user click (Start button)
- Check audio files exist
- Check browser console for 404 errors

### Issue: Timer Drifts Over Time

**Solution**: Already handled in `useTimer` by calculating elapsed time from timestamps, not interval counts.

---

## Performance Monitoring

### Development Performance

```typescript
// Enable React DevTools Profiler
// Components tab → Profiler → Record
// Perform actions
// Stop recording → Analyze renders
```

**Look for**:
- Unnecessary re-renders
- Long component mount times
- Excessive state updates

### Production Performance

```bash
# Build and analyze
npm run build

# Check bundle size
du -sh dist/assets/*.js
```

**Targets**:
- Initial JS: <100KB gzipped
- Initial CSS: <20KB gzipped
- Time to Interactive: <2s on broadband

---

## Next Steps

### Phase 1: Core Timer (P1)

1. Implement `useTimer` hook
2. Create Timer component with ProgressRing
3. Add Start/Pause/Reset controls
4. Test timer countdown and state transitions

### Phase 2: Session Management (P2)

1. Implement `useSessionTracking` hook
2. Add mode switching (focus → break)
3. Implement notifications (banner + sound)
4. Add 4-session cycle logic

### Phase 3: Customization (P3)

1. Implement `useSettings` hook
2. Create Settings panel UI
3. Add duration customization sliders
4. Add auto-start toggles

### Phase 4: Polish

1. Add animations and transitions
2. Implement warm color theme
3. Add keyboard shortcuts (optional)
4. Cross-browser testing

---

## Getting Help

### Documentation

- **Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Contracts**: [contracts/](./contracts/)

### External Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Code Style

- Follow ESLint rules (auto-fix with `npm run lint:fix`)
- Use Prettier for formatting (auto-format on save in VS Code)
- Write TypeScript types for all public APIs
- Add JSDoc comments for complex functions

---

## Checklist: Ready to Code

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Tests run (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Browser DevTools available
- [ ] React DevTools extension installed
- [ ] Reviewed spec.md and data-model.md
- [ ] VS Code with TypeScript extension

✅ All checks passed? **Start coding!**

---

**Status**: ✅ Quickstart Complete

