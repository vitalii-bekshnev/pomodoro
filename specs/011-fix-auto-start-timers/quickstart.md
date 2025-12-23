# Quick Start Guide: Auto-Start Timer Testing

**Feature**: Fix Auto-Start Timers
**Date**: 2025-01-22

## Overview

This guide provides quick test scenarios to verify the auto-start timer functionality works correctly.

## Test Scenarios

### Scenario 1: Auto-Start Breaks Enabled

1. **Setup**: Open settings panel, enable "Auto-start breaks" toggle, disable "Auto-start focus"
2. **Action**: Start a focus session, let it complete naturally
3. **Expected**: Break timer starts automatically within 100ms, no notification banner appears
4. **Verify**: Timer switches to break mode and begins counting down immediately

### Scenario 2: Auto-Start Focus Enabled

1. **Setup**: Open settings panel, disable "Auto-start breaks", enable "Auto-start focus"
2. **Action**: Start a break session, let it complete naturally
3. **Expected**: Focus timer starts automatically within 100ms, no notification banner appears
4. **Verify**: Timer switches to focus mode and begins counting down immediately

### Scenario 3: Both Auto-Start Options Disabled (Default)

1. **Setup**: Ensure both auto-start toggles are disabled (default state)
2. **Action**: Complete any timer session (focus or break)
3. **Expected**: Notification banner appears prompting user to start next session
4. **Verify**: Timer remains in completed state until user clicks banner or manually starts

### Scenario 4: Manual Override During Auto-Start

1. **Setup**: Enable both auto-start options
2. **Action**: Start a focus session, then immediately click "Skip" before completion
3. **Expected**: Manual skip action takes precedence, no auto-start occurs
4. **Verify**: Timer switches to focus mode but does not auto-start

### Scenario 5: Settings Change Mid-Session

1. **Setup**: Start with auto-start breaks disabled
2. **Action**: Begin focus session, then enable auto-start breaks in settings
3. **Expected**: Current session completes normally, next session uses new setting
4. **Verify**: First completion shows banner, subsequent completion auto-starts

### Scenario 6: App Restart with Auto-Start

1. **Setup**: Enable both auto-start options, start a timer session
2. **Action**: Refresh the browser page while timer is running
3. **Expected**: App restarts, timer resumes with auto-start settings preserved
4. **Verify**: Settings panel shows auto-start options still enabled

## Common Issues & Troubleshooting

### Issue: Auto-start not working
- **Check**: Verify toggles are enabled in settings panel
- **Check**: Ensure timer completed naturally (not manually skipped)
- **Check**: Confirm no manual actions occurred during transition

### Issue: Banner still appears with auto-start enabled
- **Check**: Verify "Auto-start breaks" toggle for focus→break transitions
- **Check**: Verify "Auto-start focus" toggle for break→focus transitions
- **Check**: Clear browser cache if settings seem corrupted

### Issue: Settings not persisting
- **Check**: Browser localStorage is enabled (not in private/incognito mode)
- **Check**: No browser extensions blocking localStorage
- **Action**: Try clearing site data and re-enabling settings

## Performance Verification

- **Auto-start timing**: Use browser dev tools to measure time between timer reaching zero and next timer starting
- **Expected**: < 100ms delay for auto-start transitions
- **Fallback**: If > 100ms, verify no blocking operations in completion handler

## Edge Cases to Test

- Browser tab loses focus during timer completion
- Multiple rapid completions (stress test)
- Settings changed during transition window
- Audio notifications still play when banner is suppressed
