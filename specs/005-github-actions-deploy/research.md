# Research: GitHub Actions Deployment

**Feature**: `005-github-actions-deploy`  
**Date**: December 19, 2025  
**Purpose**: Document technology decisions and best practices for GitHub Actions CI/CD workflow

---

## 1. GitHub Actions Workflow Best Practices

### Decision: Use Multi-Job Workflow with Dependencies

**Chosen Approach**: 
- **Job 1**: `quality-checks` - runs lint, typecheck, tests in parallel steps
- **Job 2**: `build` - builds application (depends on quality-checks)
- **Job 3**: `deploy` - deploys to GitHub Pages (depends on build, only on main)

**Rationale**:
- Fail fast: Quality checks run first, prevent unnecessary builds
- Job dependencies ensure proper ordering (checks → build → deploy)
- Parallel steps within jobs optimize execution time
- Clear separation of concerns (validate → build → deploy)

**Alternatives Considered**:
- **Single job with sequential steps**: Simpler but slower (no parallelization), harder to debug
- **All parallel jobs**: Would allow build/deploy without passing quality checks
- **Separate workflows**: More complex, harder to manage dependencies

**Best Practices Applied**:
- Use `needs` keyword for job dependencies
- Use `continue-on-error: false` to fail fast
- Use `if` conditions for conditional job execution (deploy only on main)
- Use concurrency groups to prevent duplicate deployments

**References**:
- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Using jobs in workflows](https://docs.github.com/en/actions/using-jobs/using-jobs-in-a-workflow)

---

## 2. GitHub Pages Deployment Patterns

### Decision: Use `actions/deploy-pages@v4` Official Action

**Chosen Approach**:
```yaml
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

**Rationale**:
- Official GitHub action, well-maintained and documented
- Automatic artifact handling (uploads build output)
- Proper permissions handling (GITHUB_TOKEN, id-token)
- Supports Pages configuration (branch, custom domain if added later)
- Simplest and most reliable approach

**Alternatives Considered**:
- **peaceiris/actions-gh-pages@v3**: Popular third-party action, but official action is preferred
- **Manual git push to gh-pages branch**: More complex, error-prone, requires git configuration
- **actions/upload-pages-artifact + deploy-pages**: More explicit but verbose, same underlying mechanism

**Configuration Requirements**:
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions" (not branch-based)
3. Ensure `GITHUB_TOKEN` has pages write permissions
4. Set workflow permissions: `pages: write`, `id-token: write`

**Best Practices Applied**:
- Use `actions/upload-pages-artifact@v3` to prepare artifact
- Use `actions/deploy-pages@v4` to deploy prepared artifact
- Set proper concurrency to prevent simultaneous deployments
- Include environment URL for easy access to deployed site

**References**:
- [Deploying with GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
- [actions/deploy-pages documentation](https://github.com/actions/deploy-pages)

---

## 3. Dependency Caching Strategies

### Decision: Use `actions/cache@v4` with npm Cache

**Chosen Approach**:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # Built-in caching
```

**Rationale**:
- `actions/setup-node` includes built-in npm caching (simplest)
- Automatic cache key generation based on package-lock.json
- Restores cache before `npm ci` for faster installs
- No manual cache configuration needed

**Alternatives Considered**:
- **Manual actions/cache configuration**: More control but unnecessary complexity
- **No caching**: Slower builds, wastes free tier minutes
- **Yarn/pnpm caching**: Not applicable (project uses npm)

**Cache Behavior**:
- **Cache key**: Hash of `package-lock.json`
- **Cache hit**: Restores `~/.npm` cache, `npm ci` skips downloads
- **Cache miss**: Downloads packages, saves to cache for next run
- **Expected speedup**: 50-70% reduction in dependency install time

**Best Practices Applied**:
- Use `npm ci` instead of `npm install` (faster, more reliable)
- Let `setup-node` handle caching automatically
- Don't cache `node_modules` (not recommended for CI)
- Cache invalidates automatically on dependency changes

**References**:
- [Caching dependencies in GitHub Actions](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [actions/setup-node caching](https://github.com/actions/setup-node#caching-global-packages-data)

---

## 4. Build Artifact Upload and Preservation

### Decision: Use `actions/upload-artifact@v4` for Build Artifacts

**Chosen Approach**:
```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: production-build
    path: dist/
    retention-days: 90
```

**Rationale**:
- Official GitHub action for artifact storage
- 90-day retention meets requirement (FR-009, SC-007)
- Artifacts available via GitHub Actions UI for troubleshooting
- Supports artifact download for rollback/debugging
- Separate from Pages deployment artifact (dual purpose)

**Alternatives Considered**:
- **No artifact upload**: Loses troubleshooting capability
- **Upload only on failure**: Miss successful build artifacts
- **Upload to external storage**: Unnecessary complexity, costs
- **Git tag with release**: Overkill for build artifacts

**Artifact Structure**:
```
production-build.zip
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

**Best Practices Applied**:
- Upload after successful build
- Use descriptive artifact name (`production-build`)
- Set explicit retention period (90 days)
- Upload entire `dist/` directory
- Keep artifacts small (exclude source maps in production)

**References**:
- [Storing workflow data as artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [actions/upload-artifact documentation](https://github.com/actions/upload-artifact)

---

## 5. Quality Check Job Structuring

### Decision: Parallel Steps within Single Job

**Chosen Approach**:
```yaml
jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node
      - npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:once
```

**Rationale**:
- Single job = shared environment (checkout once, install once)
- Steps run sequentially within job (simpler to reason about)
- All checks must pass before job succeeds
- Faster than separate jobs (no redundant setup)
- Clear failure reporting (which check failed)

**Alternatives Considered**:
- **Separate jobs for each check**: 3x setup overhead, slower, wastes minutes
- **Matrix strategy**: Overkill for non-matrix use case
- **Parallel steps via background processes**: Complex, harder to debug

**Execution Order**:
1. Checkout code
2. Setup Node.js with cache
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint`) - fails fast if linting errors
5. Run TypeScript check (`npm run typecheck`) - catches type errors
6. Run Jest tests (`npm run test:once`) - validates functionality

**Best Practices Applied**:
- Use `runs-on: ubuntu-latest` (fastest, cheapest runner)
- Fail entire job if any step fails (`continue-on-error: false` default)
- Use existing npm scripts (no custom commands)
- Clear step names for debugging

**References**:
- [GitHub Actions jobs](https://docs.github.com/en/actions/using-jobs)
- [Running jobs sequentially](https://docs.github.com/en/actions/using-jobs/using-jobs-in-a-workflow#defining-prerequisite-jobs)

---

## 6. Workflow Triggers and Branch Filtering

### Decision: Dual Trigger Strategy (Push + Pull Request)

**Chosen Approach**:
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**Rationale**:
- **Push to main**: Triggers full workflow (quality → build → deploy)
- **Pull request**: Triggers quality checks and build (no deploy)
- Branch filtering prevents workflow on feature branches (saves minutes)
- Clear separation: PRs validate, main deploys

**Behavior**:
| Event | Quality Checks | Build | Deploy |
|-------|----------------|-------|--------|
| Push to main | ✅ | ✅ | ✅ |
| Push to feature branch | ❌ | ❌ | ❌ |
| Pull request to main | ✅ | ✅ | ❌ |
| Pull request update | ✅ | ✅ | ❌ |

**Alternatives Considered**:
- **Push to all branches**: Wastes minutes on feature branches
- **Workflow dispatch only**: Loses automation benefit
- **Pull request only**: Main branch wouldn't auto-deploy
- **Separate workflows**: Duplicates configuration

**Best Practices Applied**:
- Use `if: github.ref == 'refs/heads/main'` for deploy job
- Use `concurrency` group to cancel outdated runs
- Clear branch filtering in trigger configuration

**Concurrency Configuration**:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
- Prevents duplicate deployments
- Cancels outdated runs when new push occurs
- Saves minutes and prevents race conditions

**References**:
- [Triggering workflows](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow)
- [Workflow events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)

---

## 7. GitHub Actions Permissions and GITHUB_TOKEN

### Decision: Minimal Permissions with Explicit Grants

**Chosen Approach**:
```yaml
permissions:
  contents: read       # Checkout code
  pages: write        # Deploy to GitHub Pages
  id-token: write     # OIDC token for Pages deployment
```

**Rationale**:
- Principle of least privilege (security best practice)
- Explicit permissions prevent accidental privilege escalation
- Required for GitHub Pages deployment (pages, id-token)
- `contents: read` sufficient for quality checks and build
- No need for broader permissions

**GITHUB_TOKEN Behavior**:
- Automatically provided by GitHub Actions
- Scoped to repository and workflow run
- Expires after workflow completes
- No manual secret configuration needed

**Alternatives Considered**:
- **Default permissions**: Too broad, security risk
- **Personal Access Token (PAT)**: Unnecessary, security risk, expires
- **GitHub App token**: Overkill for simple deployment

**Permission Requirements by Job**:
| Job | Required Permissions | Reason |
|-----|---------------------|--------|
| quality-checks | `contents: read` | Checkout code |
| build | `contents: read` | Checkout code |
| deploy | `pages: write`, `id-token: write` | Deploy to Pages |

**Best Practices Applied**:
- Set permissions at workflow level
- Use GITHUB_TOKEN (never PAT)
- Explicit permission list (no defaults)
- Document permission requirements

**References**:
- [Automatic token authentication](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Permissions for GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

---

## 8. Vite Build Configuration for GitHub Pages

### Decision: Set `base` Path for Repository Subdirectory

**Investigation**: GitHub Pages URLs follow pattern:
- **User/Org page**: `https://<username>.github.io/` (root)
- **Repository page**: `https://<username>.github.io/<repo>/` (subdirectory)

**Required Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/pomodoro/',  // Repository name
  plugins: [react()],
});
```

**Rationale**:
- Vite defaults to `base: '/'` (root)
- GitHub Pages for repository serves from `/<repo>/` subdirectory
- Without correct `base`, assets fail to load (404 errors)
- Must match repository name exactly

**Alternative for User/Org Pages**:
- If deploying to `<username>.github.io` repository (user page)
- Use `base: '/'` (default)
- Not applicable for this project

**Build-Time Configuration**:
```yaml
# GitHub Actions can set base dynamically
- name: Build
  run: npm run build
  env:
    VITE_BASE_URL: ${{ github.event.repository.name }}
```

**Best Practices Applied**:
- Set `base` in `vite.config.ts` (static, simple)
- Test locally with `npm run preview` after build
- Document in quickstart.md for future reference
- Update README with deployment URL

**References**:
- [Vite base public path](https://vitejs.dev/config/shared-options.html#base)
- [GitHub Pages and Vite](https://vitejs.dev/guide/static-deploy.html#github-pages)

---

## 9. Node.js Version and Runner Selection

### Decision: Node.js 18 LTS on ubuntu-latest

**Chosen Approach**:
```yaml
jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
```

**Rationale**:
- **Node.js 18**: Current LTS, matches local development (package.json engines)
- **ubuntu-latest**: Fastest runner, cheapest (Linux), most common
- **LTS stability**: Long-term support, stable APIs, security updates
- **Consistency**: Same version as local development

**Alternatives Considered**:
- **Node.js 20**: Newer but project uses 18 (avoid unnecessary upgrade)
- **Node.js 16**: Older, approaching EOL (April 2024)
- **windows-latest/macos-latest**: Slower, more expensive, unnecessary (Linux builds suffice)
- **Matrix strategy**: Overkill for single-version project

**Runner Performance**:
| Runner | Relative Speed | Cost (minutes) | Use Case |
|--------|---------------|----------------|----------|
| ubuntu-latest | 1x (fastest) | 1x | Default choice |
| windows-latest | ~2x slower | 2x | Windows-specific builds |
| macos-latest | ~10x slower | 10x | macOS-specific builds |

**Best Practices Applied**:
- Pin major version ('18', not '18.x.x' or 'lts/*')
- Use LTS versions only
- Match local development environment
- Document in quickstart.md

**References**:
- [Node.js release schedule](https://github.com/nodejs/release#release-schedule)
- [GitHub Actions runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)

---

## 10. Error Handling and Notifications

### Decision: Default GitHub Notifications + Clear Error Messages

**Chosen Approach**:
- Rely on GitHub's built-in notifications (email, UI)
- Provide clear step names for easy debugging
- Use `continue-on-error: false` (default) for fail-fast
- No custom notification integrations (Slack, Discord)

**Rationale**:
- GitHub automatically notifies on workflow failure (email + UI)
- PR checks show clear pass/fail status with logs
- Workflow logs provide detailed error messages
- Custom notifications add complexity without significant value

**Error Handling Strategy**:
1. **Quality check fails**: Job fails, PR shows red X, build/deploy skipped
2. **Build fails**: Job fails, PR shows red X, deploy skipped
3. **Deploy fails**: Job fails, GitHub sends notification, build artifacts preserved

**Best Practices Applied**:
- Clear step names: "Run ESLint", "Run TypeScript check", "Run tests"
- Fail fast: Stop workflow on first failure
- Preserve build artifacts even on deploy failure
- Link to workflow run in commit status checks

**Notification Channels**:
- ✅ GitHub Actions UI (workflow run page)
- ✅ GitHub commit status checks (PR page)
- ✅ Email notifications (workflow failure)
- ❌ Slack/Discord (out of scope)
- ❌ Custom webhooks (out of scope)

**References**:
- [Workflow status notifications](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/notifications-for-workflow-runs)

---

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Workflow Structure | Multi-job with dependencies | Fail fast, clear separation |
| Deployment | actions/deploy-pages@v4 | Official, reliable, simple |
| Caching | setup-node built-in cache | Automatic, 50-70% speedup |
| Artifacts | actions/upload-artifact@v4 | 90-day retention, troubleshooting |
| Quality Checks | Sequential steps in single job | Shared setup, faster |
| Triggers | Push (main) + Pull Request | Auto-deploy + PR validation |
| Permissions | Minimal explicit grants | Security, least privilege |
| Vite Config | Set base: '/pomodoro/' | Asset loading on GitHub Pages |
| Node.js | 18 LTS on ubuntu-latest | Consistent, stable, fast |
| Error Handling | Default GitHub notifications | Simple, no custom integrations |

**Status**: All research complete, ready for Phase 1 (Design & Contracts)

