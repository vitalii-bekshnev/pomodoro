# Centiseconds Display Fix

**Date**: December 24, 2025  
**Issue**: Centiseconds appeared to show only 1 digit (e.g., `24:56.1`) instead of 2 digits (e.g., `24:56.10`) when timer was running
**Status**: ✅ Fixed

## Root Cause

The centiseconds were actually being rendered with 2 digits (correctly padded with `padStart(2, '0')`), but the CSS animation was causing visual issues:

1. **Animation Rate**: Centiseconds update at 100Hz (every 10ms)
2. **Animation Duration**: The digit animation lasted 150ms with opacity fade from 0 → 1
3. **Result**: Since new digits appeared faster than the animation completed, digits were constantly fading in/out, making the second digit appear transparent or invisible

## Solution

Disabled animations specifically for centiseconds digits while keeping smooth animations for minutes and seconds digits:

### Files Modified

#### 1. `TimerDigit.tsx`
Added `isCentisecond` prop to identify centiseconds digits:

```typescript
export interface TimerDigitProps {
  digit: string;
  position: string;
  isSeparator?: boolean;
  isCentisecond?: boolean; // NEW
}

// In component:
<span
  data-cs={isCentisecond ? 'true' : undefined} // NEW attribute
>
```

#### 2. `TimerDisplay.tsx`
Pass `isCentisecond={true}` to the last two digits:

```typescript
<TimerDigit digit={centiseconds![0]} position="cs-tens" isCentisecond />
<TimerDigit digit={centiseconds![1]} position="cs-ones" isCentisecond />
```

#### 3. `TimerDigit.css`
Added CSS rule to disable animation for centiseconds:

```css
/* Disable animation for centiseconds digits (too fast, 100Hz) */
.timer-digit[data-digit]:is([data-cs="true"]) {
  animation: none;
}
```

Also improved animation for other digits:
- Reduced duration: 150ms → 80ms
- Reduced opacity fade: 0 → 0.5 (less dramatic)
- Reduced transform: -20% → -10% (smaller movement)

## Validation

### Before Fix
- Centiseconds appeared as `24:56.1` (with fading second digit)
- Second digit was semi-transparent or invisible during countdown
- Visual "flickering" effect

### After Fix
- Centiseconds always show as `24:56.10` (both digits solid)
- No fading or transparency issues
- Smooth, consistent display

### Test Results

```javascript
// DOM inspection confirmed:
{
  index: 6, // First centiseconds digit
  text: "8",
  dataCsAttr: "true", ✅
  hasAnimation: false   ✅
},
{
  index: 7, // Second centiseconds digit
  text: "9",
  dataCsAttr: "true", ✅
  hasAnimation: false   ✅
}
```

## Visual Evidence

Screenshots confirm both centiseconds digits are always visible:
- `22:27.89` (timer running)
- Both `.8` and `9` are fully opaque
- No visual artifacts or fading

## Technical Details

### Why This Works

1. **Selective Animation**: Minutes and seconds change slowly (every 1000ms), so 80ms animation looks smooth
2. **No Animation for CS**: Centiseconds change every 10ms, too fast for animation
3. **Performance**: Reduced animation work improves rendering performance
4. **Accessibility**: `prefers-reduced-motion` still respected for all digits

### Update Rates by Digit Type

| Digit Type | Update Frequency | Animation |
|------------|------------------|-----------|
| Minutes    | ~60,000ms        | ✅ 80ms   |
| Seconds    | 1,000ms          | ✅ 80ms   |
| Centiseconds | 10ms           | ❌ None   |

## Conclusion

The centiseconds are now displayed correctly with both digits always visible and solid. The fix maintains smooth animations for slower-changing digits while ensuring high-frequency centiseconds remain crisp and readable.

