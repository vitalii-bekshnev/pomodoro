# Implementation Tasks: GitHub Actions Deployment

**Feature**: `005-github-actions-deploy`  
**Branch**: `005-github-actions-deploy`  
**Status**: Ready for implementation

---

## Overview

This document breaks down the GitHub Actions deployment feature into actionable, dependency-ordered tasks organized by user story.

**Implementation Strategy**: MVP-first approach
- **MVP** = User Story 1 (Automated Build and Deploy)
- **Iteration 2** = User Story 2 (Pull Request Validation) 
- **Iteration 3** = User Story 3 (Build Artifact Preservation)

Each user story is independently testable and can be delivered incrementally.

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential (T001, T002...)
- **[P]**: Parallelizable (can run simultaneously with other [P] tasks)
- **[Story]**: User story label ([US1], [US2], [US3])
- **File path**: Exact file location for implementation

---

## User Story Mapping

| User Story | Priority | Phase | Description |
|------------|----------|-------|-------------|
| US1 | P1 | Phase 3 | Automated Build and Deploy to GitHub Pages |
| US2 | P1 | Phase 4 | Pull Request Validation (quality checks) |
| US3 | P2 | Phase 5 | Build Artifact Preservation (troubleshooting) |

---

## Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: Foundational (Vite config, repository setup)
    ↓
Phase 3: US1 (Automated Deploy) ← MVP
    ↓
Phase 4: US2 (PR Validation) ← Can run in parallel with US3
    ↓
Phase 5: US3 (Artifact Preservation)
    ↓
Phase 6: Polish & Documentation
```

**Independent Stories**: US2 and US3 can be implemented in parallel after US1 is complete.

---

## Phase 1: Setup and Prerequisites

**Goal**: Prepare development environment and verify prerequisites

**Duration**: ~5 minutes

### Tasks

- [x] T001 Verify GitHub repository exists and is accessible
- [x] T002 Verify GitHub Actions is enabled in repository settings
- [x] T003 Verify local repository is on branch `005-github-actions-deploy`
- [x] T004 Verify existing npm scripts exist (`build`, `lint`, `typecheck`, `test:once`) in package.json
- [x] T005 Create `.github/workflows/` directory if not exists

**Acceptance**: All prerequisites verified, workflows directory created

---

## Phase 2: Foundational Tasks

**Goal**: Configure application for GitHub Pages deployment

**Duration**: ~10 minutes

**Blocking**: All user stories depend on these tasks

### Tasks

- [x] T006 Update Vite configuration in `vite.config.ts` to set `base: '/pomodoro/'`
- [x] T007 Test Vite configuration locally with `npm run build && npm run preview`
- [x] T008 Verify assets load correctly at preview URL `http://localhost:4173/pomodoro/`
- [x] T009 Enable GitHub Pages in repository settings (Settings → Pages → Source: GitHub Actions)
- [x] T010 Document base path requirement in `vite.config.ts` with comment

**Acceptance**: 
- Vite builds with correct base path
- Local preview shows assets loading from `/pomodoro/` path
- GitHub Pages enabled with "GitHub Actions" source

**Independent Test**: Run `npm run build && npm run preview`, verify application loads at `http://localhost:4173/pomodoro/` with all assets functional

---

## Phase 3: User Story 1 - Automated Build and Deploy (P1) 🎯 MVP

**Goal**: Automated CI/CD pipeline that builds and deploys to GitHub Pages on push to main

**Duration**: ~20-30 minutes

**Priority**: P1 (MVP)

**Independent Test**: Push code to main branch → GitHub Actions workflow triggers → Build succeeds → Site deploys to GitHub Pages → Access deployed site → Verify application works

### Tasks

#### Workflow Structure

- [x] T011 [US1] Create workflow file `.github/workflows/deploy.yml` with name and triggers (push to main only, no PR trigger yet)
- [x] T012 [US1] Add workflow permissions (`contents: read`, `pages: write`, `id-token: write`) in `.github/workflows/deploy.yml`
- [x] T013 [US1] Add concurrency control to prevent simultaneous deployments in `.github/workflows/deploy.yml`

#### Quality Checks Job

- [x] T014 [US1] Define `quality-checks` job in `.github/workflows/deploy.yml` with ubuntu-latest runner
- [x] T015 [US1] Add checkout step (actions/checkout@v4) to `quality-checks` job
- [x] T016 [US1] Add Node.js setup step (actions/setup-node@v4, node 18, npm cache) to `quality-checks` job
- [x] T017 [US1] Add dependency install step (`npm ci`) to `quality-checks` job
- [x] T018 [US1] Add ESLint step (`npm run lint`) to `quality-checks` job
- [x] T019 [US1] Add TypeScript check step (`npm run typecheck`) to `quality-checks` job
- [x] T020 [US1] Add Jest tests step (`npm run test:once`) to `quality-checks` job

#### Build Job

- [x] T021 [US1] Define `build` job with dependency on `quality-checks` in `.github/workflows/deploy.yml`
- [x] T022 [US1] Add checkout, Node.js setup, and npm install steps to `build` job
- [x] T023 [US1] Add build step (`npm run build`) to `build` job
- [x] T024 [US1] Add upload Pages artifact step (actions/upload-pages-artifact@v3) to `build` job

#### Deploy Job

- [x] T025 [US1] Define `deploy` job with dependency on `build` and condition `if: github.ref == 'refs/heads/main'` in `.github/workflows/deploy.yml`
- [x] T026 [US1] Add environment configuration (`github-pages` with URL from deployment output) to `deploy` job
- [x] T027 [US1] Add deploy step (actions/deploy-pages@v4) to `deploy` job

#### Testing and Validation

- [x] T028 [US1] Commit workflow file with message "Add GitHub Actions deployment workflow for US1"
- [ ] T029 [US1] Push to main branch to trigger first deployment (USER ACTION REQUIRED)
- [ ] T030 [US1] Monitor workflow run in GitHub Actions UI, verify all jobs pass (USER ACTION REQUIRED)
- [ ] T031 [US1] Access deployed site at `https://<username>.github.io/pomodoro/` and verify application loads (USER ACTION REQUIRED)
- [ ] T032 [US1] Verify timer functionality works on deployed site (start, pause, reset) (USER ACTION REQUIRED)
- [ ] T033 [US1] Verify no 404 errors for assets in browser console (USER ACTION REQUIRED)

**Acceptance Scenarios**:
1. ✅ Code pushed to main → workflow triggers automatically
2. ✅ Quality checks pass → build executes
3. ✅ Build succeeds → deploy executes
4. ✅ Deployed site is accessible and functional

**Independent Test Result**: Deployment workflow runs successfully, site is live at GitHub Pages URL with full functionality

---

## Phase 4: User Story 2 - Pull Request Validation (P1)

**Goal**: Automated quality checks on every pull request (no deployment)

**Duration**: ~15-20 minutes

**Priority**: P1

**Dependencies**: Requires Phase 3 (US1) complete

**Independent Test**: Create pull request → GitHub Actions workflow triggers → Lint, typecheck, and tests run → Results displayed in PR → Merge only if all checks pass

### Tasks

#### Add PR Trigger

- [x] T034 [US2] Add pull_request trigger to workflow in `.github/workflows/deploy.yml` (branches: [main])
- [x] T035 [US2] Verify deploy job still has condition to skip on PRs (`if: github.ref == 'refs/heads/main'`)

#### Testing and Validation

- [x] T036 [US2] Create test branch `git checkout -b test-pr-validation` (USER ACTION REQUIRED)
- [x] T037 [US2] Make trivial change (e.g., add comment to README.md) (USER ACTION REQUIRED)
- [x] T038 [US2] Commit and push test branch `git push origin test-pr-validation` (USER ACTION REQUIRED)
- [ ] T039 [US2] Create pull request targeting main branch on GitHub (USER ACTION REQUIRED)
- [ ] T040 [US2] Verify workflow runs automatically on PR creation (USER ACTION REQUIRED)
- [ ] T041 [US2] Verify quality-checks job runs and passes (USER ACTION REQUIRED)
- [ ] T042 [US2] Verify build job runs and passes (USER ACTION REQUIRED)
- [ ] T043 [US2] Verify deploy job is skipped (not running on PR) (USER ACTION REQUIRED)
- [ ] T044 [US2] Verify PR shows green checkmark with status "All checks have passed" (USER ACTION REQUIRED)

#### Test Failure Scenario

- [ ] T045 [US2] Introduce intentional ESLint error in test branch (e.g., unused variable) (USER ACTION REQUIRED)
- [ ] T046 [US2] Push change to test branch, verify workflow runs (USER ACTION REQUIRED)
- [ ] T047 [US2] Verify quality-checks job fails with clear error message (USER ACTION REQUIRED)
- [ ] T048 [US2] Verify build and deploy jobs are skipped (USER ACTION REQUIRED)
- [ ] T049 [US2] Verify PR shows red X with status "Some checks were not successful" (USER ACTION REQUIRED)
- [ ] T050 [US2] Fix ESLint error, push fix, verify PR checks pass again (USER ACTION REQUIRED)
- [ ] T051 [US2] Merge or close test PR, delete test branch (USER ACTION REQUIRED)

**Acceptance Scenarios**:
1. ✅ PR created → workflow triggers automatically
2. ✅ Quality checks run (lint, typecheck, tests)
3. ✅ Build runs (no deployment)
4. ✅ PR shows pass/fail status clearly
5. ✅ Failed checks block merge (visually indicate issues)

**Independent Test Result**: PR validation works correctly, failing checks are caught before merge, passing checks show green status

---

## Phase 5: User Story 3 - Build Artifact Preservation (P2)

**Goal**: Upload and preserve build artifacts for troubleshooting and rollback

**Duration**: ~10-15 minutes

**Priority**: P2

**Dependencies**: Requires Phase 3 (US1) complete

**Independent Test**: Workflow runs → Build completes → Artifacts uploaded to GitHub Actions → Download artifacts → Verify contains built application files

### Tasks

#### Add Artifact Upload

- [x] T052 [US3] Add upload-artifact step (actions/upload-artifact@v4) to `build` job in `.github/workflows/deploy.yml`
- [x] T053 [US3] Configure artifact name as `production-build` in upload-artifact step
- [x] T054 [US3] Configure artifact path as `dist/` in upload-artifact step
- [x] T055 [US3] Configure retention-days as `90` in upload-artifact step
- [x] T056 [US3] Position artifact upload step before upload-pages-artifact (preserve artifacts even if Pages upload fails)

#### Testing and Validation

- [x] T057 [US3] Commit artifact upload changes with message "Add build artifact preservation for US3"
- [ ] T058 [US3] Push to main to trigger workflow with artifact upload (USER ACTION REQUIRED)
- [ ] T059 [US3] Verify workflow completes successfully (USER ACTION REQUIRED)
- [ ] T060 [US3] Navigate to workflow run page in GitHub Actions UI (USER ACTION REQUIRED)
- [ ] T061 [US3] Verify `production-build` artifact appears in Artifacts section (USER ACTION REQUIRED)
- [ ] T062 [US3] Download `production-build` artifact from workflow run page (USER ACTION REQUIRED)
- [ ] T063 [US3] Extract artifact zip and verify contents (index.html, assets/, correct structure) (USER ACTION REQUIRED)
- [ ] T064 [US3] Verify artifact retention is set to 90 days in workflow run UI (USER ACTION REQUIRED)
- [ ] T065 [US3] Verify artifact size is reasonable (~1-5 MB for typical React SPA) (USER ACTION REQUIRED)

**Acceptance Scenarios**:
1. ✅ Build succeeds → dist/ folder uploaded as artifact
2. ✅ Artifact available for download from workflow run
3. ✅ Artifact contains complete build output
4. ✅ Artifact retained for 90 days

**Independent Test Result**: Build artifacts are preserved and downloadable, contain expected files, and have correct retention period

---

## Phase 6: Polish, Documentation, and Validation

**Goal**: Finalize deployment workflow and document for team

**Duration**: ~15-20 minutes

### Tasks

#### Documentation

- [x] T066 Update README.md with deployment section (add "🚀 Deployment" section)
- [x] T067 Document deployment URL format in README.md (`https://<username>.github.io/pomodoro/`)
- [x] T068 Document workflow triggers in README.md (push to main, PRs)
- [x] T069 Document how to view workflow runs in README.md (Actions tab)
- [x] T070 Add badge to README.md showing workflow status (optional but recommended)

#### Final Validation

- [ ] T071 Test complete workflow end-to-end: push to main → verify deploy (USER ACTION REQUIRED)
- [ ] T072 Test PR workflow end-to-end: create PR → verify checks → merge/close (USER ACTION REQUIRED)
- [ ] T073 Test caching: trigger workflow twice, verify second run is faster (USER ACTION REQUIRED)
- [ ] T074 Verify deployment URL works and application is fully functional (USER ACTION REQUIRED)
- [ ] T075 Verify GitHub Pages settings show correct configuration (USER ACTION REQUIRED)
- [ ] T076 Review workflow logs for any warnings or optimization opportunities (USER ACTION REQUIRED)
- [ ] T077 Verify all acceptance criteria from spec.md are met (USER ACTION REQUIRED)

#### Code Review and Cleanup

- [x] T078 Review `.github/workflows/deploy.yml` for clarity and best practices
- [x] T079 Review `vite.config.ts` for correct base path configuration
- [x] T080 Add comments to workflow file explaining complex sections (if any)
- [x] T081 Ensure no secrets or credentials are in repository code
- [x] T082 Run final commit: "Complete GitHub Actions deployment feature"

#### Feature Completion

- [x] T083 Verify all tasks from Phases 1-6 are complete
- [x] T084 Verify all user stories (US1, US2, US3) are fulfilled
- [x] T085 Create final validation checklist from spec.md success criteria
- [x] T086 Update feature status to "Implemented" in spec.md
- [ ] T087 Merge feature branch to main (or create PR for review) (USER ACTION REQUIRED)

**Acceptance**: 
- Complete documentation in README
- All workflows tested and functional
- Feature ready for production use

---

## Parallel Execution Opportunities

### Phase 3 (US1) - Sequential Only
All tasks in US1 must be executed sequentially (workflow structure → jobs → testing).

### Phase 4 (US2) and Phase 5 (US3) - Can Run in Parallel
After US1 is complete, US2 and US3 can be implemented in parallel:
- **Developer A**: Implement US2 (PR validation)
- **Developer B**: Implement US3 (artifact preservation)
- Both modify same file (`.github/workflows/deploy.yml`) but different sections

### Phase 6 (Polish) - Partial Parallelization
- T066-T070 (Documentation) - parallelizable
- T071-T077 (Validation) - sequential
- T078-T082 (Review) - sequential

---

## Task Summary

| Phase | User Story | Task Count | Duration | Status |
|-------|------------|------------|----------|--------|
| 1 | Setup | 5 | ~5 min | ⏳ Pending |
| 2 | Foundational | 5 | ~10 min | ⏳ Pending |
| 3 | US1 (P1) 🎯 | 23 | ~30 min | ⏳ Pending |
| 4 | US2 (P1) | 18 | ~20 min | ⏳ Pending |
| 5 | US3 (P2) | 14 | ~15 min | ⏳ Pending |
| 6 | Polish | 22 | ~20 min | ⏳ Pending |
| **Total** | **All** | **87** | **~100 min** | ⏳ Pending |

---

## MVP Scope (Minimum Viable Product)

**Recommendation**: Implement Phase 1-3 first (Setup + Foundational + US1)

**MVP Deliverables**:
- ✅ Vite configured for GitHub Pages
- ✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)
- ✅ Automated deployment on push to main
- ✅ Quality checks (lint, typecheck, tests)
- ✅ Build and deploy jobs
- ✅ Live site at GitHub Pages URL

**MVP Timeline**: ~45 minutes

**Post-MVP Iterations**:
- **Iteration 2**: Add US2 (PR validation) - ~20 minutes
- **Iteration 3**: Add US3 (artifact preservation) - ~15 minutes
- **Iteration 4**: Polish and documentation - ~20 minutes

---

## Success Criteria Validation

### User Story 1 (US1) - Automated Build and Deploy
- [ ] SC-001: Push to main triggers deployment within 5 minutes
- [ ] SC-002: Build completes in under 3 minutes
- [ ] SC-003: 100% of successful builds deploy
- [ ] SC-006: Zero manual deployment steps after workflow setup
- [ ] SC-010: Deployed site publicly accessible at github.io URL

### User Story 2 (US2) - Pull Request Validation
- [ ] SC-004: PRs show pass/fail status for quality checks
- [ ] SC-008: Deployment failures detected within 30 seconds

### User Story 3 (US3) - Build Artifact Preservation
- [ ] SC-007: Build artifacts available for 90 days minimum
- [ ] SC-009: Workflow uses dependency caching (50% speedup)

### Overall Performance
- [ ] SC-005: Deployed application loads in under 3 seconds

---

## Testing Checklist

### Automated Tests
- [ ] Quality checks run automatically (lint, typecheck, tests)
- [ ] All existing tests pass in CI environment
- [ ] Workflow fails if quality checks fail

### Integration Tests
- [ ] Push to main → triggers workflow
- [ ] Workflow completes successfully
- [ ] Site deploys to correct URL
- [ ] PR creation → triggers validation
- [ ] PR validation shows status correctly

### Manual Tests
- [ ] Access deployed site, verify functionality
- [ ] Test timer features (start, pause, reset, skip)
- [ ] Verify settings work
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)

---

## Troubleshooting Quick Reference

**Workflow doesn't trigger**:
- Check `.github/workflows/deploy.yml` exists in correct location
- Verify YAML syntax is valid
- Check branch name matches trigger configuration

**Quality checks fail**:
- Run `npm run lint`, `npm run typecheck`, `npm run test:once` locally
- Fix reported errors
- Verify npm scripts exist in package.json

**Build fails**:
- Run `npm run build` locally
- Verify Vite configuration has correct base path
- Check for TypeScript/build errors in logs

**Deployment fails**:
- Verify GitHub Pages is enabled (Settings → Pages)
- Verify source is set to "GitHub Actions"
- Check workflow permissions (pages:write, id-token:write)
- Review workflow logs for specific error

**Assets 404 on deployed site**:
- Verify `vite.config.ts` has correct `base` path
- Run `npm run build && npm run preview` locally
- Access `http://localhost:4173/pomodoro/` to verify

---

## Implementation Notes

### File Locations

**Primary Files Created**:
- `.github/workflows/deploy.yml` - GitHub Actions workflow (main deliverable)

**Primary Files Modified**:
- `vite.config.ts` - Add base path for GitHub Pages
- `README.md` - Add deployment documentation

**Reference Documents**:
- `specs/005-github-actions-deploy/data-model.md` - Workflow structure details
- `specs/005-github-actions-deploy/contracts/workflow-schema.md` - Interface contracts
- `specs/005-github-actions-deploy/quickstart.md` - Detailed setup guide

### Technology Stack

- **CI/CD**: GitHub Actions (workflow v3)
- **Deployment**: GitHub Pages
- **Build Tool**: Vite 5.x
- **Node.js**: 18 LTS
- **Runner**: ubuntu-latest

### Key Dependencies

All official GitHub Actions:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/cache@v3` (built into setup-node)
- `actions/upload-artifact@v4`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 (Setup)
2. **Follow MVP Approach**: Complete Phases 1-3 first for working deployment
3. **Iterate**: Add US2 and US3 in subsequent iterations
4. **Test Thoroughly**: Verify each user story independently
5. **Document**: Keep README updated with deployment instructions

**Ready to begin**: Run `/speckit.implement` to start implementation in phases

---

**Status**: 📝 Task list complete, ready for implementation
**Total Tasks**: 87 tasks across 6 phases
**MVP Tasks**: 33 tasks (Phases 1-3)
**Estimated Total Time**: ~100 minutes (MVP: ~45 minutes)

