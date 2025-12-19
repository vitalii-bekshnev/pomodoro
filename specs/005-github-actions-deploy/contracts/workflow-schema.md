# Workflow Contract: GitHub Actions CI/CD Pipeline

**Feature**: `005-github-actions-deploy`  
**Date**: December 19, 2025  
**Purpose**: Define the interface contract for the GitHub Actions workflow

---

## Workflow Interface

### Workflow Inputs

**None**: This workflow has no manual inputs. It is automatically triggered by Git events.

### Workflow Outputs

| Output | Type | Source | Description |
|--------|------|--------|-------------|
| `deployment_url` | string | `deploy` job | URL of deployed GitHub Pages site |
| `artifact_id` | string | `build` job | ID of uploaded build artifact |
| `workflow_status` | enum | workflow | `success`, `failure`, `cancelled` |

**Access**:
- `deployment_url`: Available in workflow logs, environment URL in GitHub UI
- `artifact_id`: Available via GitHub Actions API, UI download link
- `workflow_status`: Commit status check, PR checks, workflow run page

---

## Trigger Contract

### Event: Push to Main

**Contract**:
```yaml
on:
  push:
    branches: [main]
```

**Guarantees**:
- Workflow triggers within 30 seconds of push
- Full pipeline executes: quality → build → deploy
- Deploy job runs only if quality and build succeed
- Previous incomplete runs are cancelled (concurrency)

**Requirements**:
- Branch name must be exactly `main`
- Push must be to repository default branch
- Pusher must have write access

### Event: Pull Request

**Contract**:
```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
```

**Guarantees**:
- Workflow triggers on PR creation, update, or reopen
- Quality checks and build execute
- Deploy job is skipped
- PR status checks updated with results

**Requirements**:
- PR target branch must be `main`
- PR must be from same repository or fork (if allowed)

---

## Job Contracts

### Job: quality-checks

**Interface**:
```yaml
job: quality-checks
inputs: 
  - repository code (via checkout)
  - package.json, package-lock.json
outputs:
  - exit code (0 = success, non-zero = failure)
  - logs (lint, typecheck, test results)
```

**Guarantees**:
- Runs on `ubuntu-latest` (Linux)
- Node.js 18 installed
- Dependencies installed from package-lock.json
- ESLint, TypeScript, Jest all execute
- Fails fast on first error

**Requirements**:
- `package.json` must define scripts: `lint`, `typecheck`, `test:once`
- All scripts must exit with code 0 on success
- No interactive prompts (CI mode)

**Exit Codes**:
- `0`: All checks passed
- `1`: Lint/typecheck/test failed
- `2+`: Infrastructure error (npm install failed, etc.)

### Job: build

**Interface**:
```yaml
job: build
inputs:
  - repository code (via checkout)
  - quality-checks success status
outputs:
  - dist/ directory (build artifacts)
  - production-build artifact (zip)
  - github-pages artifact (internal)
```

**Guarantees**:
- Runs only if `quality-checks` succeeds
- Node.js 18 installed
- Vite build executes
- `dist/` directory created
- Artifacts uploaded (production-build, github-pages)
- Build completes in <3 minutes

**Requirements**:
- `package.json` must define `build` script
- `vite.config.ts` must set correct `base` path
- Build must produce static files in `dist/`
- No build errors or warnings (fail build)

**Output Artifact Structure**:
```
dist/
├── index.html          # Entry point
├── assets/             # Hashed assets
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images, fonts, etc.]
└── [favicon, robots.txt, etc.]
```

### Job: deploy

**Interface**:
```yaml
job: deploy
inputs:
  - github-pages artifact (from build job)
  - build success status
  - github.ref (branch name)
outputs:
  - deployment URL (GitHub Pages site)
  - deployment status (success/failure)
```

**Guarantees**:
- Runs only if `build` succeeds
- Runs only on `main` branch push
- Deploys to GitHub Pages
- Returns deployment URL
- Deployment completes in <30 seconds
- Previous site remains live if deployment fails

**Requirements**:
- GitHub Pages enabled in repository settings
- GitHub Pages source set to "GitHub Actions"
- Workflow has `pages: write` and `id-token: write` permissions
- `github-pages` artifact exists from build job

**Output URL Format**:
```
https://<username>.github.io/<repository>/
```

Example: `https://vitaliibekshnev.github.io/pomodoro/`

---

## Permission Requirements

### Required Permissions

```yaml
permissions:
  contents: read      # Checkout code
  pages: write        # Deploy to GitHub Pages
  id-token: write     # OIDC token for Pages
```

**Scope**: Repository-level, workflow-level

**GITHUB_TOKEN**:
- Automatically provided by GitHub
- Scoped to repository and workflow run
- Expires after workflow completes
- No manual configuration required

---

## Caching Contract

### npm Dependency Cache

**Cache Key**: `${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}`

**Cache Paths**: `~/.npm`

**Behavior**:
| Event | Cache Status | Install Time |
|-------|--------------|--------------|
| First run | MISS | ~60-90s |
| Subsequent (no lock change) | HIT | ~10-15s |
| Lock file updated | MISS | ~60-90s |

**Guarantees**:
- Cache restored before `npm ci`
- Cache saved after successful `npm ci`
- Cache invalidated on `package-lock.json` change
- Cache shared across branches (same lock file)

**Requirements**:
- `package-lock.json` must be committed
- `package-lock.json` must be up-to-date

---

## Artifact Contract

### Production Build Artifact

**Name**: `production-build`

**Contents**: `dist/` directory (complete build output)

**Format**: ZIP archive

**Retention**: 90 days

**Size**: ~1-5 MB (typical React SPA)

**Access**:
- Download from workflow run page
- Download via GitHub Actions API
- Attached to workflow run summary

**Use Cases**:
- Troubleshooting deployment issues
- Manual rollback (download + manual deploy)
- Build verification
- Forensic analysis

### GitHub Pages Artifact

**Name**: `github-pages` (default)

**Contents**: `dist/` directory

**Format**: TAR.GZ (internal format)

**Retention**: Temporary (deleted after deployment)

**Access**: Internal only (not downloadable)

**Use Cases**:
- Intermediate artifact for deployment pipeline
- Passed from build job to deploy job

---

## Concurrency Contract

**Concurrency Group**: `${{ github.workflow }}-${{ github.ref }}`

**Behavior**:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Guarantees**:
- Only one workflow run per branch at a time
- New run cancels previous run (if still executing)
- Prevents simultaneous deployments to same environment
- Saves free tier minutes

**Example Scenarios**:
| Scenario | Behavior |
|----------|----------|
| Push 1 to main (running) | Workflow starts |
| Push 2 to main (while 1 running) | Cancels run 1, starts run 2 |
| PR update (while PR workflow running) | Cancels old run, starts new run |
| Push to main + PR update | Two separate groups, both run |

---

## Error Handling Contract

### Quality Check Failure

**Trigger**: ESLint error, TypeScript error, test failure

**Behavior**:
1. Job fails immediately (exit code 1)
2. Workflow stops (build/deploy skipped)
3. Commit status set to "failure"
4. PR shows red X
5. Email notification sent

**Error Output**:
- Logs show specific error (line number, rule, test name)
- PR comment with check results (optional)

### Build Failure

**Trigger**: Vite build error, out of memory, missing file

**Behavior**:
1. Build job fails (exit code 1)
2. Deploy skipped
3. No artifacts uploaded
4. Commit status set to "failure"
5. Email notification sent

**Error Output**:
- Logs show Vite error message
- Stack trace (if applicable)

### Deploy Failure

**Trigger**: Pages API error, network timeout, quota exceeded

**Behavior**:
1. Deploy job fails
2. Build artifacts preserved (already uploaded)
3. Previous deployment remains live (no downtime)
4. Commit status set to "failure"
5. Email notification sent

**Error Output**:
- Logs show deployment error
- API response (if applicable)

**Recovery**:
- Retry workflow manually (Re-run failed jobs)
- Check GitHub Pages settings
- Verify quota not exceeded

---

## Performance Contract

### Build Time Targets

| Metric | Target | SLA |
|--------|--------|-----|
| Quality checks | <60s | <90s |
| Build | <40s | <60s |
| Deploy | <30s | <45s |
| **Total (main)** | **<3 min** | **<5 min** |
| **Total (PR)** | **<2 min** | **<3 min** |

**Guarantees**:
- 90% of runs complete within target
- 99% of runs complete within SLA
- Caching reduces install time by 50-70%

**Failure Modes**:
- Timeout after 60 minutes (GitHub Actions default)
- Out of memory (2GB runner limit)
- Network timeout (retry automatically)

### Resource Limits

| Resource | Limit | Typical Usage |
|----------|-------|---------------|
| CPU | 2 cores | ~50% utilization |
| Memory | 7 GB | ~500 MB (build) |
| Disk | 14 GB | ~2 GB (checkout + build) |
| Network | No limit | ~100 MB (npm packages) |
| Time | 60 min (max) | ~1-3 min (typical) |

---

## Versioning Contract

### Action Versions

All actions use pinned major versions:

| Action | Version | Update Strategy |
|--------|---------|-----------------|
| `actions/checkout` | `v4` | Pin major, auto-update minor |
| `actions/setup-node` | `v4` | Pin major, auto-update minor |
| `actions/cache` | `v3` | Pin major, auto-update minor |
| `actions/upload-artifact` | `v4` | Pin major, auto-update minor |
| `actions/upload-pages-artifact` | `v3` | Pin major, auto-update minor |
| `actions/deploy-pages` | `v4` | Pin major, auto-update minor |

**Rationale**:
- Major version pin = stable API, no breaking changes
- Auto minor/patch updates = security fixes, bug fixes
- GitHub recommends major version pinning

**Update Process**:
- Monitor GitHub Action releases
- Test major version updates in PR first
- Update after verifying compatibility

### Node.js Version

**Current**: 18 (LTS)

**Update Strategy**:
- Stay on LTS versions only
- Update when new LTS released (18 → 20 → 22)
- Test in PR before updating main workflow
- Match local development environment

---

## Security Contract

### Secrets and Credentials

**Guarantees**:
- No secrets required for deployment
- GITHUB_TOKEN auto-generated (no manual config)
- No credentials stored in repository
- No environment variables with sensitive data

**Best Practices**:
- Use GITHUB_TOKEN (not PAT)
- Minimal permissions (read, write pages only)
- No third-party actions (use official actions only)
- No script injection vulnerabilities

### Dependency Security

**Guarantees**:
- Dependencies installed from package-lock.json (integrity checks)
- npm audit runs automatically (optional enhancement)
- No arbitrary code execution from dependencies

**Recommendations**:
- Enable Dependabot (GitHub Security)
- Run `npm audit` in quality-checks job (future enhancement)
- Review dependency updates in PRs

---

## Monitoring and Observability

### Workflow Logs

**Availability**: 90 days (GitHub Actions retention)

**Access**: 
- Workflow run page (GitHub UI)
- GitHub Actions API
- PR checks tab

**Log Levels**:
- Standard output (npm scripts)
- Error output (failures)
- Action debug logs (if enabled)

### Metrics

**Available Metrics**:
- Workflow run duration (per job, total)
- Success/failure rate
- Artifact size
- Cache hit rate
- Deployment URL

**Access**:
- Workflow run summary page
- GitHub Actions API
- Insights → Actions (repository level)

---

## Backward Compatibility

### Breaking Changes

This is an initial deployment feature. No backward compatibility concerns.

**Future Breaking Changes**:
- Major version updates to actions (require testing)
- Node.js LTS upgrades (18 → 20)
- Vite major version upgrades (may require config changes)
- GitHub Pages API changes (rare)

**Mitigation**:
- Pin major versions of actions
- Test updates in PRs before main
- Document breaking changes in CHANGELOG
- Maintain compatibility with existing npm scripts

---

## SLA and Support

### Availability

**GitHub Actions Availability**: 99.9% uptime (GitHub SLA)

**GitHub Pages Availability**: 99.9% uptime (GitHub SLA)

**Deployment SLA**:
- 95% of deployments complete successfully
- 99% of deployments complete within 5 minutes
- 100% of failures notify developer

### Support Channels

**GitHub Actions Issues**:
- Check GitHub Actions status page
- Search GitHub Actions community forum
- Open issue in github/actions repository

**Workflow Issues**:
- Check workflow logs
- Review troubleshooting guide (quickstart.md)
- Consult team documentation

---

## Contract Validation

### How to Verify Contract Compliance

1. **Trigger Contract**:
   - Push to main → verify workflow runs
   - Create PR → verify workflow runs (no deploy)
   - Push to feature branch → verify workflow doesn't run

2. **Job Contract**:
   - Introduce lint error → verify quality-checks fails
   - Fix error → verify build and deploy succeed
   - Check artifact uploaded → verify production-build exists

3. **Performance Contract**:
   - Check workflow run duration
   - Verify cache hit/miss in logs
   - Measure deploy time (from commit to live site)

4. **Output Contract**:
   - Access deployment URL → verify site loads
   - Download build artifact → verify contains dist/ files
   - Check commit status → verify green checkmark

---

**Status**: Workflow contract complete

