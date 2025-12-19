# Implementation Tasks: Fix Duplicate Session Count Bug (US2)

**Feature**: `007-fix-timer-state-bugs`  
**Branch**: `007-fix-timer-state-bugs`  
**Status**: Ready for implementation  
**Scope**: Bug 2 only - Fix duplicate session count on refresh

---

## Overview

This document contains tasks for fixing Bug 2 (P1): After timer completes, refreshing page increments Pomodoro count by 2 each time.

**Root Cause**: No completion tracking - `onComplete()` fires on every mount when timer status is 'completed', with no mechanism to detect if this completion was already processed.

**Fix**: Add unique `sessionId` to `TimerSession`, create `CompletionRecord` interface to track completed sessions in localStorage, and check completion record before calling `onComplete()`.

**Impact**: 
- Type changes: `TimerSession` interface (+1 field)
- New type: `CompletionRecord` interface
- New storage key: `STORAGE_KEYS.LAST_COMPLETION`
- Logic changes in `useTimer.ts`: session ID generation, completion tracking

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential (T001, T002...)
- **[P]**: Parallelizable
- **[Story]**: User story label ([US2])
- **File path**: Exact file location

---

## User Story Mapping

| User Story | Priority | Phase | Description |
|------------|----------|-------|-------------|
| US2 | P1 | Phase 2 | Fix duplicate session count (completion tracking) |

---

## Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: US2 - Add Completion Tracking ← ONLY BUG TO FIX
    ↓
Phase 3: Verification & Testing
```

---

## Phase 1: Setup & Prerequisites

**Purpose**: Verify environment and review existing implementation

**Duration**: ~5 minutes

- [X] T001 Review current TimerSession interface in src/types/timer.ts
- [X] T002 Review current STORAGE_KEYS in src/constants/defaults.ts
- [X] T003 Review useTimer hook completion logic in src/hooks/useTimer.ts (lines 103-109)
- [X] T004 Review data-model.md for CompletionRecord interface definition
- [X] T005 Review research.md Bug 2 section for implementation pattern

**Checkpoint**: ✅ Understand current completion flow and localStorage structure

---

## Phase 2: User Story 2 - Fix Duplicate Session Count (Priority: P1) 🎯

**Goal**: Prevent duplicate session count increments on page refresh by tracking completed sessions with unique IDs

**Independent Test**: Complete 1 Pomodoro (count = 1) → Wait on notification screen → Refresh page 5 times → Count still shows 1

### Step 2.1: Enhance Data Types

- [X] T006 [P] [US2] Add sessionId field to TimerSession interface in src/types/timer.ts
- [X] T007 [P] [US2] Create CompletionRecord interface in src/types/timer.ts
- [X] T008 [US2] Add LAST_COMPLETION to STORAGE_KEYS in src/constants/defaults.ts

**Checkpoint**: ✅ Type changes complete, ready for logic implementation

### Step 2.2: Implement Session ID Generation

- [X] T009 [US2] Generate unique sessionId when start() is called in src/hooks/useTimer.ts
- [X] T010 [US2] Include sessionId in TimerSession state initialization in src/hooks/useTimer.ts
- [X] T011 [US2] Ensure sessionId persists to localStorage with timer state in src/hooks/useTimer.ts

**Checkpoint**: ✅ Every timer session now has unique identifier

### Step 2.3: Implement Completion Tracking

- [X] T012 [US2] Load CompletionRecord from localStorage on hook initialization in src/hooks/useTimer.ts
- [X] T013 [US2] Check if current session.sessionId matches lastCompletion.sessionId in completion useEffect in src/hooks/useTimer.ts (lines 103-109)
- [X] T014 [US2] Skip onComplete() call if session already processed in src/hooks/useTimer.ts
- [X] T015 [US2] Save CompletionRecord to localStorage when onComplete() is called (first time only) in src/hooks/useTimer.ts

**Checkpoint**: ✅ Completion tracking prevents duplicate onComplete() calls

### Step 2.4: Handle Edge Cases

- [X] T016 [US2] Handle missing sessionId on restored sessions (backwards compatibility) in src/hooks/useTimer.ts
- [X] T017 [US2] Handle missing LAST_COMPLETION record (first-time users) in src/hooks/useTimer.ts
- [X] T018 [US2] Ensure new timer sessions generate fresh sessionId (not reused) in src/hooks/useTimer.ts

**Checkpoint**: ✅ Edge cases handled gracefully

### Step 2.5: Verify Type Exports

- [X] T019 [US2] Ensure CompletionRecord is exported from src/types/timer.ts
- [X] T020 [US2] Verify sessionId is exposed in useTimer return type (optional, for debugging)

**Checkpoint**: ✅ Types properly exported and available

---

## Phase 3: Verification & Testing

**Purpose**: Validate Bug 2 fix with manual testing and regression checks

**Duration**: ~15 minutes

### Manual Testing

- [ ] T021 Test completion tracking: Start focus timer → Let it complete (count = 1) → Verify count = 1
- [ ] T022 Test single refresh: After completion, refresh page once → Verify count still = 1 (not 2)
- [ ] T023 Test multiple refreshes: Refresh page 5 times → Verify count still = 1 (not 3/5/7)
- [ ] T024 Test new session: Start new focus timer → Complete it → Verify count = 2 (correctly incremented)
- [ ] T025 Test session sequence: Complete 2 Pomodoros with refreshes between → Verify final count = 2 (not 4+)

### Browser Console Verification

- [ ] T026 Open browser console → Check localStorage for pomodoro_last_completion key
- [ ] T027 Verify CompletionRecord structure: {sessionId, completedAt, mode}
- [ ] T028 After completion, verify sessionId in timer state matches sessionId in last completion
- [ ] T029 After refresh, check console for NO duplicate onComplete logs

### Edge Case Testing

- [ ] T030 Test first-time user: Clear localStorage → Complete timer → Verify count = 1 and CompletionRecord saved
- [ ] T031 Test missing sessionId: Manually remove sessionId from stored timer state → Refresh → Verify graceful handling
- [ ] T032 Test completion + start break: Complete focus → Start break → Verify completion record preserved
- [ ] T033 Test mode switching: Complete focus → Switch to short-break → Complete → Verify separate completion tracking

### Regression Testing

- [ ] T034 Test timer accuracy: Start timer → Pause → Resume → Complete → Verify time accurate
- [ ] T035 Test timer restoration: Start timer → Refresh during countdown → Verify time restored correctly (Bug 1 not reintroduced)
- [ ] T036 Test skip functionality: Start timer → Skip → Verify onComplete called once only
- [ ] T037 Test reset functionality: Start timer → Reset → Start again → Complete → Verify count incremented once

### Acceptance Criteria Validation

- [ ] T038 Verify SC-002: "0% of page refreshes cause duplicate session count increments" → Test 20 refreshes, count stays same
- [ ] T039 Verify SC-004: "User Story 2 acceptance scenarios pass" → All 4 scenarios from spec.md validated
- [ ] T040 Verify completion tracking persists across app restarts: Close tab → Reopen → Verify last completion record preserved

**Checkpoint**: Bug 2 completely fixed and validated

---

## Phase 4: Documentation & Cleanup

**Purpose**: Update documentation and commit changes

**Duration**: ~5 minutes

- [ ] T041 Update spec.md status for User Story 2 to "Implemented"
- [ ] T042 Mark Bug 2 tasks complete in tasks.md (this file)
- [ ] T043 Verify no linter errors in modified files
- [ ] T044 Verify TypeScript compilation succeeds
- [ ] T045 Commit changes with message format: "007-fix-timer-state-bugs: Fix duplicate session count on refresh (Bug 2)"

**Checkpoint**: Bug 2 implementation complete and documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **US2 Fix (Phase 2)**: Depends on Setup completion
  - Step 2.1 (Types) must complete before Steps 2.2-2.5
  - Steps 2.2-2.3 can proceed sequentially
  - Step 2.4 (Edge Cases) depends on Step 2.3
  - Step 2.5 (Exports) can run in parallel with Step 2.4
- **Verification (Phase 3)**: Depends on Phase 2 completion
  - Manual tests can run in parallel (different scenarios)
  - Browser console checks can run in parallel with manual tests
  - Edge case tests should run after manual tests
  - Regression tests should run last
- **Documentation (Phase 4)**: Depends on Phase 3 completion

### Within Phase 2

```
T006, T007, T008 (Types) - Can run in parallel [P]
    ↓
T009, T010, T011 (Session ID) - Sequential (same file, same function)
    ↓
T012, T013, T014, T015 (Completion Tracking) - Sequential (same logic block)
    ↓
T016, T017, T018 (Edge Cases) - Sequential (builds on completion logic)
    ↓
T019, T020 (Exports) - Can run in parallel with edge cases [P]
```

### Parallel Opportunities

**Phase 2, Step 2.1** (Different files):
```bash
Task T006: "Add sessionId field to TimerSession in src/types/timer.ts"
Task T007: "Create CompletionRecord interface in src/types/timer.ts"
Task T008: "Add LAST_COMPLETION to STORAGE_KEYS in src/constants/defaults.ts"
```

**Phase 3, Manual Testing** (Independent scenarios):
```bash
Task T021: "Test completion tracking"
Task T022: "Test single refresh"
Task T023: "Test multiple refreshes"
# Can all run in parallel
```

---

## Implementation Strategy

### Core Fix (Must Complete)

1. **Phase 1**: Setup & Prerequisites (~5 min)
2. **Phase 2, Step 2.1**: Enhance Data Types (~3 min)
3. **Phase 2, Steps 2.2-2.4**: Implement Completion Tracking (~15 min)
4. **Phase 3**: Verification & Testing (~15 min)
5. **Phase 4**: Documentation & Cleanup (~5 min)

**Total Estimated Time**: ~45 minutes

### Testing-First Approach (If Desired)

While this is primarily a bug fix, you can validate the bug exists before fixing:

1. **Phase 1**: Setup & Prerequisites
2. **Phase 3, T021-T023**: Reproduce bug (count increments on each refresh)
3. **Phase 2**: Implement fix
4. **Phase 3, T021-T040**: Verify bug is fixed

### Incremental Validation

- After Step 2.1: Verify types compile without errors
- After Step 2.2: Verify sessionId is generated and logged
- After Step 2.3: Verify CompletionRecord is saved
- After Step 2.4: Test edge cases one by one
- After Phase 3: Full acceptance validation

---

## Key Implementation Details

### Session ID Format

```typescript
// Generate unique ID when timer starts
const sessionId = `${Date.now()}-${mode}`;
// Example: "1703012345678-focus"
```

### Completion Tracking Pattern

```typescript
// On mount/restore
const lastCompletion = getStorageItem<CompletionRecord>(
  STORAGE_KEYS.LAST_COMPLETION,
  null
);

const isAlreadyProcessed = 
  lastCompletion && 
  lastCompletion.sessionId === session.sessionId;

if (session.status === 'completed' && !isAlreadyProcessed) {
  onComplete(session.mode);
  setStorageItem(STORAGE_KEYS.LAST_COMPLETION, {
    sessionId: session.sessionId,
    completedAt: Date.now(),
    mode: session.mode
  });
}
```

### Backwards Compatibility

```typescript
// Handle old sessions without sessionId
if (!saved.sessionId) {
  saved.sessionId = `${Date.now()}-${saved.mode}-migrated`;
}
```

---

## Success Criteria (from spec.md)

- ✅ **SC-002**: 0% of page refreshes cause duplicate session count increments
- ✅ **SC-004**: User Story 2 acceptance scenarios pass (4 scenarios)
- ✅ **SC-005**: Count remains accurate across 20+ refresh scenarios

---

## Notes

- **Complexity**: Medium - requires type changes, localStorage management, and edge case handling
- **Risk**: Low - additive changes, backwards compatible
- **Files Modified**: 3 files (types, constants, useTimer hook)
- **Breaking Changes**: None - sessionId is optional with fallback
- **Testing**: Primarily manual (refresh-based scenarios)
- **Estimated LOC**: ~30-40 lines added/modified

---

**Status**: Ready for implementation via `/speckit.implement bug 2`

