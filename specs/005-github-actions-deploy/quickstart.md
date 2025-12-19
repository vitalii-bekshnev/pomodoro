# Quickstart Guide: GitHub Actions Deployment

**Feature**: `005-github-actions-deploy`  
**Date**: December 19, 2025  
**Purpose**: Setup and testing instructions for GitHub Actions CI/CD workflow

---

## Prerequisites

Before setting up the workflow, ensure you have:

- ✅ GitHub repository with Pomodoro Timer code
- ✅ Repository is public OR GitHub Actions enabled (for private repos)
- ✅ Admin or maintain access to repository settings
- ✅ Local development environment with Node.js 18+
- ✅ Git configured with push access to repository

---

## Initial Setup

### Step 1: Update Vite Configuration

**Required**: Set the base path for GitHub Pages subdirectory deployment.

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/pomodoro/',  // ⚠️ Must match your repository name exactly
  plugins: [react()],
});
```

**Important**: Replace `/pomodoro/` with `/YOUR-REPO-NAME/` if your repository name is different.

**Why**: GitHub Pages serves repository pages from `https://<username>.github.io/<repo>/`, not root.

**Verify locally**:
```bash
npm run build
npm run preview
# Open http://localhost:4173/pomodoro/
# Assets should load correctly
```

---

### Step 2: Enable GitHub Pages

**Location**: Repository Settings → Pages

**Steps**:
1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select **GitHub Actions** (not "Deploy from a branch")
4. Save settings

**Screenshot reference**:
```
┌─────────────────────────────────────────┐
│ Source                                  │
│ ┌─────────────────────────────────────┐ │
│ │ GitHub Actions              ▼       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Note**: First deployment may take a few minutes to provision the Pages site.

---

### Step 3: Create Workflow File

**File**: `.github/workflows/deploy.yml`

**Location**: Create `.github/workflows/` directory in repository root if it doesn't exist.

```bash
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
```

**Content**: See implementation tasks for complete workflow YAML.

**Initial workflow structure**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality-checks:
    # ... (see data-model.md)
  
  build:
    # ... (see data-model.md)
  
  deploy:
    # ... (see data-model.md)
```

---

### Step 4: Commit and Push Workflow

```bash
git add .github/workflows/deploy.yml
git add vite.config.ts  # If modified
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

**What happens next**:
1. Push triggers workflow automatically
2. GitHub Actions starts running (check Actions tab)
3. Workflow runs quality checks, builds, and deploys
4. Site deploys to `https://<username>.github.io/<repo>/`

---

## Testing the Workflow

### Test 1: Verify Workflow Triggered

**Steps**:
1. Go to repository on GitHub
2. Click **Actions** tab
3. Look for "Deploy to GitHub Pages" workflow run
4. Click on the run to see details

**Expected**:
- Workflow status: 🟡 In progress or ✅ Success
- Jobs: `quality-checks` → `build` → `deploy`
- All jobs show green checkmarks when complete

**Timeline**: ~1-3 minutes for complete workflow

---

### Test 2: Check Deployment URL

**After workflow completes**:

1. Go to workflow run page
2. Look for **deploy** job
3. Find "Deploy to GitHub Pages" step
4. Copy deployment URL from logs or environment section

**Deployment URL format**:
```
https://<username>.github.io/<repository>/
```

**Example**: `https://vitaliibekshnev.github.io/pomodoro/`

**Verify**:
- Open URL in browser
- Pomodoro Timer should load and function correctly
- Check browser console for errors (should be none)
- Test timer functionality (start, pause, reset)

---

### Test 3: Test Pull Request Validation

**Steps**:
1. Create a new branch:
   ```bash
   git checkout -b test-workflow
   ```

2. Make a change (e.g., add a comment):
   ```bash
   echo "// Test comment" >> src/main.tsx
   git add src/main.tsx
   git commit -m "Test workflow on PR"
   git push origin test-workflow
   ```

3. Create pull request on GitHub

**Expected**:
- PR shows "Some checks haven't completed yet" (yellow dot)
- After ~1-2 minutes:
  - ✅ quality-checks / build — Success
  - Deploy job is skipped (PR doesn't deploy)
- PR shows green checkmark when checks pass

**Test failure scenario**:
1. Introduce a lint error:
   ```typescript
   // src/main.tsx
   const unusedVariable = 123;  // Lint error: unused variable
   ```

2. Push change, create/update PR

3. **Expected**:
   - ❌ quality-checks — Failed
   - Build and deploy skipped
   - PR shows red X
   - Logs show specific ESLint error

4. Fix error, push again, verify PR shows green checkmark

---

### Test 4: Verify Build Artifacts

**After successful workflow run**:

1. Go to workflow run page
2. Scroll to **Artifacts** section (bottom)
3. Look for `production-build` artifact

**Expected**:
- Artifact name: `production-build`
- Size: ~1-5 MB
- Retention: 90 days
- Download link available

**Download and inspect**:
```bash
# Download artifact from GitHub UI
unzip production-build.zip -d downloaded-build
ls downloaded-build/
# Should see: index.html, assets/, etc.
```

**Verify contents**:
- `index.html` exists
- `assets/` directory with hashed JS/CSS files
- Asset paths reference `/pomodoro/assets/...`

---

### Test 5: Verify Caching

**First run** (cache miss):
1. Check workflow run logs
2. Find "Install dependencies" step
3. Note duration (~60-90 seconds)

**Second run** (cache hit):
1. Make a trivial change (e.g., update README)
2. Push to trigger workflow
3. Check "Install dependencies" step duration

**Expected**:
- First run: ~60-90s install time
- Subsequent runs: ~10-15s install time (cache hit)
- Logs show "Cache restored from key: ..."

**Cache invalidation test**:
1. Update `package.json` (add/update dependency)
2. Run `npm install` locally
3. Commit `package-lock.json`
4. Push to trigger workflow

**Expected**:
- Cache miss (key changed)
- Install takes ~60-90s again
- New cache saved for future runs

---

## Troubleshooting

### Issue 1: Workflow doesn't trigger

**Symptoms**: Push to main, but no workflow run in Actions tab

**Possible causes**:
- Workflow file not in `.github/workflows/` directory
- Workflow file has syntax errors (invalid YAML)
- Branch name is not `main` (check branch filter in workflow)
- Workflows disabled in repository settings

**Solutions**:
1. Verify file path: `.github/workflows/deploy.yml` (exact path)
2. Validate YAML syntax: https://yamllint.com/
3. Check branch name: `git branch` (should show `* main`)
4. Enable workflows: Settings → Actions → Allow all actions

---

### Issue 2: Quality checks fail

**Symptoms**: ❌ quality-checks job fails

**Possible causes**:
- ESLint errors in code
- TypeScript type errors
- Failing Jest tests
- Missing npm scripts in package.json

**Solutions**:
1. Run checks locally:
   ```bash
   npm run lint        # Check for lint errors
   npm run typecheck   # Check for type errors
   npm run test:once   # Run tests
   ```

2. Fix errors identified by local checks

3. Verify npm scripts exist in `package.json`:
   ```json
   {
     "scripts": {
       "lint": "eslint . --ext ts,tsx",
       "typecheck": "tsc --noEmit",
       "test:once": "jest"
     }
   }
   ```

4. Push fixes, verify workflow passes

---

### Issue 3: Build fails

**Symptoms**: ❌ build job fails (quality checks passed)

**Possible causes**:
- Vite build errors
- Missing dependencies
- TypeScript errors not caught by typecheck
- Out of memory (rare)

**Solutions**:
1. Run build locally:
   ```bash
   npm run build
   ```

2. Check Vite configuration:
   ```typescript
   // vite.config.ts
   base: '/pomodoro/',  // Verify correct base path
   ```

3. Verify all imports are correct (case-sensitive on Linux)

4. Check workflow logs for specific error message

5. If out of memory, consider:
   - Reducing bundle size
   - Optimizing dependencies
   - Lazy loading components

---

### Issue 4: Deployment fails

**Symptoms**: ❌ deploy job fails (quality checks and build passed)

**Possible causes**:
- GitHub Pages not enabled
- GitHub Pages source not set to "GitHub Actions"
- Insufficient workflow permissions
- GitHub Pages quota exceeded (rare)

**Solutions**:
1. Verify Pages settings: Settings → Pages → Source = "GitHub Actions"

2. Check workflow permissions (in `deploy.yml`):
   ```yaml
   permissions:
     contents: read
     pages: write       # Required
     id-token: write    # Required
   ```

3. Check GitHub Pages status: https://www.githubstatus.com/

4. Retry workflow: Actions → Failed run → Re-run failed jobs

5. If persistent, check workflow logs for specific error

---

### Issue 5: Site loads but assets 404

**Symptoms**: Deployed site loads blank page, browser console shows 404 errors for assets

**Possible cause**: Incorrect `base` path in Vite configuration

**Solution**:
1. Check `vite.config.ts`:
   ```typescript
   base: '/pomodoro/',  // Must match repository name
   ```

2. Verify repository name:
   - Go to repository Settings → General
   - Copy exact repository name (case-sensitive)

3. Update `vite.config.ts`:
   ```typescript
   base: '/<exact-repo-name>/',
   ```

4. Rebuild and redeploy:
   ```bash
   npm run build
   npm run preview  # Test locally first
   git add vite.config.ts
   git commit -m "Fix base path for GitHub Pages"
   git push origin main
   ```

5. Wait for workflow to complete, verify deployed site

---

### Issue 6: Slow workflow execution

**Symptoms**: Workflow takes >5 minutes, approaching timeout

**Possible causes**:
- Cache not working (missed)
- Large number of dependencies
- Slow runner allocation (GitHub infrastructure)
- Inefficient npm scripts

**Solutions**:
1. Verify caching is enabled:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: '18'
       cache: 'npm'  # Ensure this is set
   ```

2. Check cache hit rate in logs:
   - Look for "Cache restored from key: ..."
   - If always "Cache miss", investigate cache key

3. Optimize dependencies:
   - Remove unused packages
   - Use lighter alternatives
   - Consider code splitting

4. Check GitHub Actions status for outages

5. If persistent, consider:
   - Optimizing test execution
   - Parallelizing quality checks (future enhancement)

---

## Accessing Deployed Application

### Primary URL

**Format**: `https://<username>.github.io/<repository>/`

**Example**: `https://vitaliibekshnev.github.io/pomodoro/`

**How to find**:
1. Go to repository on GitHub
2. Click **Settings** → **Pages**
3. Look for "Your site is live at..." (after first deployment)
4. Or check workflow run → deploy job → environment URL

### Alternative Access Methods

**From workflow run**:
1. Go to Actions tab
2. Click on successful workflow run
3. Look for **github-pages** environment (right sidebar)
4. Click "View deployment" button

**From commit status**:
1. Go to recent commit on main branch
2. Look for "deployments" section
3. Click deployment URL

---

## Maintenance

### Updating Workflow

**To modify workflow**:
1. Edit `.github/workflows/deploy.yml`
2. Commit and push changes
3. Workflow applies automatically on next run

**Best practices**:
- Test workflow changes in PR first
- Don't modify workflow during active deployment
- Document changes in commit message

### Updating Dependencies

**Node.js version**:
```yaml
# In deploy.yml
- uses: actions/setup-node@v4
  with:
    node-version: '18'  # Update when upgrading Node.js
```

**Action versions**:
- Pin to major version (e.g., `v4`, not `v4.1.0`)
- GitHub auto-updates minor/patch versions
- Test major version upgrades in PR first

### Monitoring Workflow Health

**Check workflow runs**:
- Go to Actions tab
- Review recent runs for failures
- Investigate patterns (e.g., "always fails on Friday")

**Review artifacts**:
- Periodically download build artifacts
- Verify contents match expectations
- Check artifact size growth over time

**Monitor quota usage**:
- Settings → Billing → Actions minutes
- Free tier: 2000 minutes/month
- Estimated usage: ~80-100 minutes/month (typical)

---

## Quick Reference

### Common Commands

```bash
# Local development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript check
npm run test:once        # Run tests (CI mode)

# Git workflow
git checkout main
git pull origin main
git checkout -b feature-branch
# ... make changes ...
git add .
git commit -m "Description"
git push origin feature-branch
# Create PR on GitHub

# Force workflow re-run
# (GitHub UI only - no CLI command)
# Actions → Failed run → Re-run failed jobs
```

### Useful Links

- **Workflow runs**: `https://github.com/<username>/<repo>/actions`
- **Deployed site**: `https://<username>.github.io/<repo>/`
- **Pages settings**: `https://github.com/<username>/<repo>/settings/pages`
- **GitHub Actions docs**: https://docs.github.com/actions
- **Vite deployment docs**: https://vitejs.dev/guide/static-deploy.html#github-pages

---

## Next Steps

After successful setup:

1. ✅ Verify deployment workflow runs automatically
2. ✅ Test PR validation with a feature branch
3. ✅ Confirm deployed site is accessible
4. ✅ Update README with deployment URL
5. ✅ Document workflow for team members
6. ⏭️ (Optional) Set up branch protection rules
7. ⏭️ (Optional) Add deployment notifications (Slack, Discord)

---

**Status**: Quickstart guide complete, ready for implementation

