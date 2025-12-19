# Implementation Tasks: Fix Persistent Break Start Option (US3)

**Feature**: `007-fix-timer-state-bugs`  
**Branch**: `007-fix-timer-state-bugs`  
**Status**: Ready for implementation  
**Scope**: Bug 3 only - Add persistent break start option

---

## Overview

This document contains tasks for fixing Bug 3 (P2): After notification is dismissed, no UI element exists to start the break, leaving users stuck.

**Root Cause**: Notification is transient (dismissible, timeout), but break start action is critical to Pomodoro flow. Once notification disappears, there's no way to start break.

**Fix**: Add persistent UI element (button/banner) that shows when timer status is 'completed' and mode is 'focus', providing always-available break start option.

**Impact**: 
- New UI component in App.tsx (persistent break actions)
- CSS styling for break pending state
- Logic to determine next break type (short vs long)
- Integration with existing switchMode() and session tracking

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential (T001, T002...)
- **[P]**: Parallelizable
- **[Story]**: User story label ([US3])
- **File path**: Exact file location

---

## User Story Mapping

| User Story | Priority | Phase | Description |
|------------|----------|-------|-------------|
| US3 | P2 | Phase 2 | Add persistent break start option (UI component) |

---

## Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: US3 - Add Persistent Break Start UI ← ONLY BUG TO FIX
    ↓
Phase 3: Verification & Testing
```

---

## Phase 1: Setup & Prerequisites

**Purpose**: Review existing components and identify integration points

**Duration**: ~5 minutes

- [ ] T001 Review App.tsx component structure and timer state usage
- [ ] T002 Review existing NotificationBanner component for UI patterns
- [ ] T003 Review useSessionTracking hook to understand cycle position logic
- [ ] T004 Review research.md Bug 3 section for UI design pattern
- [ ] T005 Review App.css for existing styling patterns

**Checkpoint**: Understand current UI structure and notification flow

---

## Phase 2: User Story 3 - Add Persistent Break Start Option (Priority: P2) 🎯

**Goal**: Provide persistent UI element to start break when timer completes, even after notification is dismissed

**Independent Test**: Complete focus session → Dismiss notification → Verify "Start Break" button visible → Click button → Break timer starts correctly

### Step 2.1: Implement Helper Logic

- [ ] T006 [P] [US3] Create helper function to determine next break type (short vs long) based on cycle position in src/components/App.tsx
- [ ] T007 [P] [US3] Create handleStartBreak function to switch to appropriate break mode in src/components/App.tsx

**Checkpoint**: Helper functions ready for UI integration

### Step 2.2: Add Persistent UI Component

- [ ] T008 [US3] Add conditional rendering for break-pending state (status='completed' && mode='focus') in src/components/App.tsx
- [ ] T009 [US3] Add "Start Break" button with handleStartBreak click handler in src/components/App.tsx
- [ ] T010 [US3] Add "Skip Break - Start Focus" button (placeholder for Bug 4) in src/components/App.tsx
- [ ] T011 [US3] Add descriptive text explaining focus session is complete in src/components/App.tsx

**Checkpoint**: Persistent break actions UI added to App component

### Step 2.3: Add CSS Styling

- [ ] T012 [P] [US3] Create .break-pending-actions class in src/components/App.css
- [ ] T013 [P] [US3] Style buttons to match existing design system (warm, friendly aesthetic) in src/components/App.css
- [ ] T014 [P] [US3] Add responsive layout for break pending actions in src/components/App.css
- [ ] T015 [P] [US3] Add visual distinction for break pending state (border, background) in src/components/App.css

**Checkpoint**: Break pending UI styled consistently with app design

### Step 2.4: Integration & Edge Cases

- [ ] T016 [US3] Verify break start option persists across page refresh (status/mode restored from localStorage)
- [ ] T017 [US3] Verify break start option disappears after break is started (status changes to 'running')
- [ ] T018 [US3] Verify correct break type (short/long) based on cycle position
- [ ] T019 [US3] Test interaction with existing notification system (both should work)

**Checkpoint**: Break start UI integrates seamlessly with existing timer flow

---

## Phase 3: Verification & Testing

**Purpose**: Validate Bug 3 fix with manual testing and acceptance criteria

**Duration**: ~10 minutes

### Manual Testing

- [ ] T020 Test basic break start: Complete focus → Dismiss notification → Verify "Start Break" button visible
- [ ] T021 Test button click: Click "Start Break" → Verify appropriate break timer starts
- [ ] T022 Test notification timeout: Complete focus → Wait for notification auto-dismiss → Verify button still visible
- [ ] T023 Test page refresh: Complete focus → Refresh page → Verify button persists and works
- [ ] T024 Test short break: Complete 1st Pomodoro → Click "Start Break" → Verify short break (5 min) starts
- [ ] T025 Test long break: Complete 4th Pomodoro → Click "Start Break" → Verify long break (15 min) starts

### UI/UX Verification

- [ ] T026 Verify button is prominent and discoverable (clear call-to-action)
- [ ] T027 Verify text clearly explains state ("Focus session complete")
- [ ] T028 Verify styling matches app design (warm colors, friendly tone)
- [ ] T029 Verify button disappears after break starts (no lingering UI)
- [ ] T030 Verify responsive layout on different screen sizes

### Edge Case Testing

- [ ] T031 Test with notification dismissed immediately: Dismiss notification instantly → Button should appear
- [ ] T032 Test rapid completion: Complete timer → Immediately click "Start Break" → Should work without delay
- [ ] T033 Test concurrent notification + button: Both notification and button should show, either can start break
- [ ] T034 Test break complete → focus pending: Complete break timer → Verify no button (only for focus → break)

### Regression Testing

- [ ] T035 Test existing notification still works: Complete focus → Click notification "Start Break" → Verify works
- [ ] T036 Test timer accuracy preserved: Bug 1 fix not affected by new UI
- [ ] T037 Test session tracking: Bug 2 fix not affected by new UI
- [ ] T038 Test all timer controls: Pause, resume, reset, skip still work correctly

### Acceptance Criteria Validation

- [ ] T039 Verify SC-006: "User Story 3 acceptance scenarios pass" → All 4 scenarios from spec.md validated
- [ ] T040 Verify break start persists across refreshes, dismissals, timeouts

**Checkpoint**: Bug 3 completely fixed and validated

---

## Phase 4: Documentation & Cleanup

**Purpose**: Update documentation and commit changes

**Duration**: ~5 minutes

- [ ] T041 Update spec.md status for User Story 3 to "Implemented"
- [ ] T042 Mark Bug 3 tasks complete in tasks.md (this file)
- [ ] T043 Verify no linter errors in modified files
- [ ] T044 Verify TypeScript compilation succeeds
- [ ] T045 Commit changes with message format: "007-fix-timer-state-bugs: Add persistent break start option (Bug 3)"

**Checkpoint**: Bug 3 implementation complete and documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **US3 Fix (Phase 2)**: Depends on Setup completion
  - Step 2.1 (Helper Logic) must complete before Step 2.2
  - Step 2.2 (UI Component) must complete before Step 2.3
  - Step 2.3 (CSS Styling) can run in parallel [P]
  - Step 2.4 (Integration) depends on Steps 2.2 and 2.3
- **Verification (Phase 3)**: Depends on Phase 2 completion
  - Manual tests can run in parallel (different scenarios)
  - UI/UX checks can run in parallel with manual tests
  - Edge case tests should run after manual tests
  - Regression tests should run last
- **Documentation (Phase 4)**: Depends on Phase 3 completion

### Within Phase 2

```
T006, T007 (Helper Logic) - Can run in parallel [P]
    ↓
T008, T009, T010, T011 (UI Component) - Sequential (same file, same component)
    ↓
T012, T013, T014, T015 (CSS) - Can run in parallel [P]
    ↓
T016, T017, T018, T019 (Integration) - Sequential (testing integration points)
```

### Parallel Opportunities

**Phase 2, Step 2.1** (Different functions, can implement simultaneously):
```bash
Task T006: "Create helper function to determine next break type"
Task T007: "Create handleStartBreak function"
```

**Phase 2, Step 2.3** (Different CSS classes, can style simultaneously):
```bash
Task T012: "Create .break-pending-actions class"
Task T013: "Style buttons"
Task T014: "Add responsive layout"
Task T015: "Add visual distinction"
```

**Phase 3, Manual Testing** (Independent scenarios):
```bash
Task T020: "Test basic break start"
Task T021: "Test button click"
Task T022: "Test notification timeout"
# Can all run in parallel
```

---

## Implementation Strategy

### Core Fix (Must Complete)

1. **Phase 1**: Setup & Prerequisites (~5 min)
2. **Phase 2, Step 2.1**: Implement Helper Logic (~5 min)
3. **Phase 2, Step 2.2**: Add Persistent UI Component (~10 min)
4. **Phase 2, Step 2.3**: Add CSS Styling (~5 min)
5. **Phase 2, Step 2.4**: Integration & Edge Cases (~5 min)
6. **Phase 3**: Verification & Testing (~10 min)
7. **Phase 4**: Documentation & Cleanup (~5 min)

**Total Estimated Time**: ~45 minutes

### Incremental Validation

- After Step 2.1: Verify helper functions return correct values
- After Step 2.2: Verify UI appears when timer completes
- After Step 2.3: Verify styling looks good and matches design
- After Step 2.4: Test all integration points
- After Phase 3: Full acceptance validation

---

## Key Implementation Details

### Helper Function - Determine Next Break Type

```typescript
// In App.tsx
const getNextBreakType = (): 'short-break' | 'long-break' => {
  // After 4th Pomodoro (cyclePosition === 0 after completion) → long break
  // Otherwise → short break
  return sessionProgress.cyclePosition === 0 ? 'long-break' : 'short-break';
};
```

### UI Component Pattern

```tsx
{/* Show break pending actions when focus timer completes */}
{timer.status === 'completed' && timer.mode === 'focus' && (
  <div className="break-pending-actions">
    <p className="break-pending-message">
      🎉 Focus session complete! Time for a break.
    </p>
    <div className="break-pending-buttons">
      <button 
        className="btn-primary"
        onClick={handleStartBreak}
      >
        Start {getNextBreakType() === 'long-break' ? 'Long' : 'Short'} Break
      </button>
      <button 
        className="btn-secondary"
        onClick={handleSkipBreak}
      >
        Skip Break - Start Focus
      </button>
    </div>
  </div>
)}
```

### CSS Styling Pattern

```css
.break-pending-actions {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  background: var(--color-background-secondary);
  text-align: center;
}

.break-pending-message {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.break-pending-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
```

### Integration with Session Tracking

```typescript
const handleStartBreak = () => {
  const breakType = getNextBreakType();
  timer.switchMode(breakType); // Switch to break mode (idle state)
  timer.start(); // Start the break timer
};
```

---

## Success Criteria (from spec.md)

- ✅ **SC-006**: User Story 3 acceptance scenarios pass (4 scenarios)
- ✅ **FR-005**: Persistent "Start Break" UI element visible when timer completes
- ✅ **FR-006**: Break start persists across refreshes, dismissals, timeouts

---

## Notes

- **Complexity**: Low-Medium - UI component with CSS styling and helper logic
- **Risk**: Low - additive UI, no breaking changes to existing components
- **Files Modified**: 2 files (App.tsx, App.css)
- **Breaking Changes**: None - pure addition
- **Testing**: Primarily manual (UI/UX testing)
- **Estimated LOC**: ~40-50 lines added (UI + CSS)

---

**Status**: Ready for implementation via `/speckit.implement bug 3`

