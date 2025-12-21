# Data Model: Timer State Bug Fixes

**Feature**: `007-fix-timer-state-bugs`  
**Date**: December 19, 2025  
**Purpose**: Define data structures for bug fixes (completion tracking, session IDs)

---

## TimerSession Entity (Enhanced)

The core timer state structure with added sessionId for completion tracking.

### Structure

```typescript
interface TimerSession {
  /** Current timer mode */
  mode: TimerMode;
  
  /** Total session duration in milliseconds */
  duration: number;
  
  /** Remaining time in milliseconds */
  remaining: number;
  
  /** Current status of the timer */
  status: TimerStatus;
  
  /** Timestamp when timer was last started (for drift compensation and restore) */
  startedAt: number | null;
  
  /** Unique identifier for this timer session (for completion tracking) */
  sessionId: string;  // NEW FIELD
}
```

### Field Changes

**New Field**: `sessionId`

| Field | Type | Nullable | Description | Format |
|-------|------|----------|-------------|--------|
| `sessionId` | `string` | No | Unique ID for completion tracking | `"${timestamp}-${mode}"` e.g. "1703012345678-focus" |

**Purpose**: Prevents duplicate `onComplete` calls when refreshing page after timer completion.

**Generation**: Created when timer starts:
```typescript
const sessionId = `${Date.now()}-${mode}`;
```

**Uniqueness**: Timestamp ensures uniqueness across sessions. Mode suffix adds context for debugging.

---

## CompletionRecord Entity (New)

Tracks the last completed timer session to prevent duplicate session count increments.

### Structure

```typescript
interface CompletionRecord {
  /** Session ID that completed */
  sessionId: string;
  
  /** Timestamp when completion was processed */
  completedAt: number;
  
  /** Mode that completed */
  mode: TimerMode;
}
```

### Field Definitions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessionId` | `string` | Matches TimerSession.sessionId | `"1703012345678-focus"` |
| `completedAt` | `number` | Unix timestamp (ms) when onComplete fired | `1703012945678` |
| `mode` | `TimerMode` | Which mode completed | `"focus"` |

### Usage

**localStorage Key**: `pomodoro_last_completion`

**Storage Pattern**:
```typescript
// On completion (first time only)
setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
  sessionId: session.sessionId,
  completedAt: Date.now(),
  mode: session.mode
});

// On restore/mount
const lastCompletion = getStorageItem<CompletionRecord>(
  STORAGE_KEYS.LAST_COMPLETION,
  null
);

const isAlreadyProcessed = 
  lastCompletion && 
  lastCompletion.sessionId === session.sessionId;

if (!isAlreadyProcessed) {
  onComplete(session.mode);
  // Save completion record...
}
```

**Storage Size**: ~60 bytes per record (single record, overwritten)

---

## localStorage Keys (Updated)

```typescript
const STORAGE_KEYS = {
  TIMER_STATE: 'pomodoro_timer_state',          // Existing
  LAST_COMPLETION: 'pomodoro_last_completion',  // NEW
  SESSION_PROGRESS: 'pomodoro_session_progress', // Existing
  USER_PREFERENCES: 'pomodoro_preferences'       // Existing
};
```

---

## State Transitions (Updated)

### Timer Lifecycle with Session IDs

```
[Idle]
  |
  | start() → sessionId generated
  v
[Running: sessionId="T1-focus"]
  |
  | Timer reaches 0
  v
[Completed: sessionId="T1-focus"]
  |
  | onComplete() called → CompletionRecord saved
  | (sessionId="T1-focus" recorded)
  |
  | Page refresh/reload
  v
[Completed: sessionId="T1-focus" (restored)]
  |
  | Check: is sessionId="T1-focus" in lastCompletion?
  | YES → Skip onComplete() (already processed)
  |
  | User starts break
  v
[Idle: new mode, new sessionId]
```

### Completion Tracking Flow

```
Session 1:
  1. Start timer → sessionId = "T1-focus"
  2. Complete → onComplete() → save CompletionRecord{sessionId: "T1-focus"}
  3. Refresh → load CompletionRecord → check sessionId → match found → skip onComplete()
  4. Refresh again → same check → skip onComplete()

Session 2:
  5. Start new timer → sessionId = "T2-focus" (different!)
  6. Complete → onComplete() → save CompletionRecord{sessionId: "T2-focus"}
  7. Refresh → load CompletionRecord → check sessionId → match found → skip onComplete()
```

---

## Validation Rules

### Session ID Validation

```typescript
function isValidSessionId(sessionId: string): boolean {
  // Format: "{timestamp}-{mode}"
  const pattern = /^\d+-(?:focus|short-break|long-break)$/;
  return pattern.test(sessionId);
}
```

### Completion Record Validation

```typescript
function isValidCompletionRecord(record: any): boolean {
  return (
    record &&
    typeof record.sessionId === 'string' &&
    typeof record.completedAt === 'number' &&
    ['focus', 'short-break', 'long-break'].includes(record.mode)
  );
}
```

---

## Migration Strategy

### Backwards Compatibility

**Existing TimerSession without sessionId**:
```typescript
// On restore, if sessionId missing, generate one
if (!saved.sessionId) {
  saved.sessionId = `${Date.now()}-${saved.mode}-migrated`;
}
```

**No CompletionRecord**:
```typescript
// If LAST_COMPLETION doesn't exist, getStorageItem returns null
// First completion creates the record
const lastCompletion = getStorageItem<CompletionRecord>(
  STORAGE_KEYS.LAST_COMPLETION,
  null
);
// No error, graceful handling
```

**Default Values**:
```typescript
export const DEFAULT_TIMER_SESSION: TimerSession = {
  mode: 'focus',
  duration: 25 * 60 * 1000,
  remaining: 25 * 60 * 1000,
  status: 'idle',
  startedAt: null,
  sessionId: `${Date.now()}-focus`,  // NEW: Default session ID
};
```

---

## Storage Size Impact

**Before Bug Fixes**:
- TimerSession: ~150 bytes

**After Bug Fixes**:
- TimerSession: ~170 bytes (+20 bytes for sessionId)
- CompletionRecord: ~60 bytes (new, single record)
- **Total Impact**: +80 bytes

**localStorage Quota**: 5-10MB (browser dependent)  
**Impact**: <0.001% of quota (negligible)

---

**Status**: Data model complete, ready for contracts and quickstart

