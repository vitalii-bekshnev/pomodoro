# Research & Technical Decisions

**Feature**: Fix Auto-Start Timers
**Date**: 2025-01-22

## Research Questions & Findings

### Q1: Browser Timer APIs for 100ms Precision Auto-Start

**Context**: Need to ensure auto-start transitions happen within 100ms of timer completion.

**Research Findings**:
- `setTimeout` has minimum 4ms delay in modern browsers, but can achieve ~1ms precision
- `requestAnimationFrame` provides ~16ms intervals but not suitable for immediate actions
- For immediate execution, direct function calls work reliably
- React's `useEffect` runs synchronously after render, suitable for auto-start logic

**Decision**: Use direct function calls in React effects for auto-start logic. The 100ms requirement is achievable with standard browser APIs.

### Q2: localStorage Behavior During App Restart

**Context**: Auto-start settings must persist and resume correctly when app is restarted during active timer.

**Research Findings**:
- localStorage persists across browser sessions and page refreshes
- Data is immediately available on page load
- No async behavior needed for reading stored preferences
- Current codebase already handles timer state restoration on app start

**Decision**: Leverage existing localStorage restoration logic. No additional research needed.

### Q3: React State Updates and Auto-Start Timing

**Context**: Need to ensure auto-start happens immediately after timer completion without user-visible delays.

**Research Findings**:
- React state updates are synchronous within the same execution context
- Multiple `setState` calls in sequence are batched but execute immediately
- `useEffect` with timer status dependencies triggers synchronously after state changes
- Current timer completion flow already uses this pattern successfully

**Decision**: Use existing React patterns. Auto-start logic can be added to existing `useEffect` hooks that monitor timer completion.

### Q4: Browser Tab Focus Impact on Auto-Start

**Context**: Auto-start should work regardless of browser tab focus state.

**Research Findings**:
- `setTimeout` and `setInterval` continue running when tab is not focused (though may be throttled)
- For immediate auto-start, tab focus state is irrelevant
- Current timer implementation already works in background tabs
- No additional handling needed for focus/blur events

**Decision**: No special handling required. Auto-start will work in background tabs as designed.

## Technical Decisions

### Decision 1: Auto-Start Implementation Location
**Chosen**: Modify `handleTimerComplete` in App.tsx to conditionally auto-start
**Rationale**: Centralizes timer completion logic and maintains single source of truth
**Alternatives Considered**:
- Modify useTimer hook directly (rejected: would break separation of concerns)
- Create separate auto-start hook (rejected: over-engineering for simple conditional logic)

### Decision 2: Notification Banner Suppression
**Chosen**: Conditionally call `showBanner()` based on auto-start preferences
**Rationale**: Simple boolean check prevents unnecessary UI clutter
**Alternatives Considered**:
- Always show banner but auto-click it (rejected: hacky, causes UI flicker)
- Modify NotificationBanner component (rejected: unnecessary complexity)

### Decision 3: Manual Action Override
**Chosen**: Check for pending auto-start before executing manual actions
**Rationale**: Ensures user intent takes precedence over automation
**Alternatives Considered**:
- Disable manual controls during auto-start (rejected: poor UX, confusing)
- Queue manual actions (rejected: complex state management not needed)

## Implementation Approach

1. **Timer Completion Logic**: Modify `handleTimerComplete` to check auto-start preferences immediately
2. **Conditional Auto-Start**: If enabled, call `timer.start()` directly instead of showing banner
3. **Banner Suppression**: Skip `showBanner()` call when auto-start breaks is enabled
4. **Setting Changes**: Apply new auto-start settings only to subsequent transitions
5. **App Restart**: Leverage existing timer state restoration logic

**Risk Assessment**: Low - builds on existing patterns, minimal new code paths.
