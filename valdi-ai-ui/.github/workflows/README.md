# GitHub Actions CI/CD Workflows

This directory contains comprehensive GitHub Actions workflows for the valdi-ai-ui project. All workflows are production-ready with proper caching, error handling, and status notifications.

## Workflows Overview

### 1. CI (Continuous Integration) - `ci.yml`

**Trigger:** Push to `main`/`develop`, Pull Requests to `main`/`develop`

**Purpose:** Automated code quality checks and testing on every push and pull request.

**Features:**
- Multi-version Node.js testing (18.x, 20.x)
- TypeScript type checking
- ESLint code quality checks
- Prettier formatting validation
- Jest unit tests with coverage
- Coverage report upload to Codecov
- PR comments with test results
- Concurrent job execution with fail-fast strategy

**Key Steps:**
1. Checkout code with full history
2. Setup Node.js with npm cache
3. Install dependencies (npm ci)
4. Run TypeScript compiler
5. Run ESLint linter
6. Run Prettier format check
7. Run Jest tests (CI mode with coverage)
8. Upload coverage to Codecov
9. Post coverage summary as PR comment

**Status Checks:**
- All type checks must pass
- All linting rules must pass
- All formatting must be correct
- All unit tests must pass
- Coverage thresholds: 60% (branches, functions, lines, statements)

**Caching:**
- npm dependencies cached by Node.js action
- Automatically restored on cache hit

---

### 2. Build Verification - `build.yml`

**Trigger:** Push to `main`/`develop`, Pull Requests to `main`/`develop`, Daily schedule (2 AM UTC)

**Purpose:** Verify that the application builds successfully with Bazel and in standalone mode.

**Features:**
- Bazel build verification
- Bazel test execution
- Standalone build verification
- Intelligent Bazel caching with multi-level restore keys
- 45-minute timeout for comprehensive builds
- Automatic Bazel cache cleanup
- Daily scheduled runs to catch regressions
- PR notifications on build failure

**Jobs:**

#### Bazel Build
- Builds the main application using Bazel
- Caches Bazel artifacts for faster subsequent builds
- Includes Bazel version check

#### Bazel Unit Tests
- Runs Bazel test suite
- Tests all modules and components
- Separate cache from build job to prevent conflicts

#### Standalone Build
- Verifies standalone build without Bazel dependencies
- Runs full type checking and linting
- Validates build artifacts

**Caching Strategy:**
- Multi-level cache restore keys for maximum hit rate
- Separate caches for build and test jobs
- Automatic cleanup after builds to save space

**Cache Paths:**
- `~/.bazel` - Bazel repository cache
- `~/.cache/bazel` - Bazel build cache

---

### 3. Release Automation - `release.yml`

**Trigger:** Manual workflow dispatch from GitHub UI

**Purpose:** Automate version bumping, changelog generation, and GitHub release creation.

**Features:**
- Manual version control with validation
- Release type selection (major, minor, patch)
- Version format validation (semver)
- Duplicate tag detection
- Automatic package.json version update
- Changelog generation with timestamp
- Pre-release quality checks (type-check, lint, tests)
- Git tagging and pushing
- GitHub release creation (draft status)
- PR and commit notifications

**Release Process:**

1. **Validation Job**
   - Validates version format (X.Y.Z)
   - Checks if tag already exists
   - Prevents duplicate releases

2. **Prepare Release Job**
   - Updates package.json version
   - Runs full test suite to ensure quality
   - Generates changelog entry with current date
   - Commits version bump and changelog
   - Creates annotated git tag
   - Pushes tag to remote
   - Creates GitHub release (draft)

3. **Notify Job**
   - Posts release summary
   - Notifies PR (if triggered from PR)
   - Provides links to release page

**How to Use:**

1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Release" workflow
4. Click "Run workflow"
5. Enter version number (e.g., 1.1.0)
6. Select release type (major/minor/patch)
7. Click "Run workflow"

**Release Status:**
- Releases are created in **DRAFT** status
- Review changelog and details before publishing
- Publish from GitHub releases page

---

## Workflow Configuration

### Concurrency Settings

All workflows use concurrency groups to prevent redundant runs:
- CI and Build workflows cancel previous runs when a new push/PR arrives
- Release workflow is serialized (no concurrent releases)

### Job Strategy

- **Fail-fast:** CI workflow stops on first failure
- **Continue-on-error:** Build workflow logs failures but continues for visibility
- **Always-run:** Status check jobs run regardless of previous failures

### Environment Variables

- `CI=true` - Enables CI mode for npm scripts
- Git config set for automated commits in release workflow

### Permissions

Release workflow requests:
- `contents: write` - Create tags and releases
- `pull-requests: write` - Comment on PRs

---

## Performance Optimizations

### 1. Caching Strategy
- npm dependencies cached per Node.js version
- Bazel artifacts cached with multi-level restore keys
- Cache keys include branch, run number for fresh builds

### 2. Parallel Execution
- Multiple Node.js versions run in parallel
- Multiple build jobs run concurrently in Build workflow
- Status check jobs run after all checks complete

### 3. Early Termination
- TypeScript check runs before linting (faster feedback)
- ESLint runs before tests
- Prettier check runs before full test suite

### 4. Smart Cleanup
- Bazel cache cleaned after build to save artifact space
- Coverage reports only uploaded on Node.js 20.x
- PR comments only posted once

---

## Status Badges

Add these badges to your README.md for workflow status:

```markdown
[![CI](https://github.com/[owner]/[repo]/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/[owner]/[repo]/actions/workflows/ci.yml)
[![Build](https://github.com/[owner]/[repo]/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/[owner]/[repo]/actions/workflows/build.yml)
[![Release](https://github.com/[owner]/[repo]/actions/workflows/release.yml/badge.svg)](https://github.com/[owner]/[repo]/actions/workflows/release.yml)
```

Replace `[owner]` and `[repo]` with your GitHub username/organization and repository name.

---

## Troubleshooting

### CI Workflow Issues

**Problem:** Type checking fails
- Solution: Run `npm run type-check` locally, fix errors, and commit

**Problem:** ESLint fails
- Solution: Run `npm run lint:fix` to auto-fix issues, or `npm run lint` to see errors

**Problem:** Tests fail
- Solution: Run `npm run test:watch` locally to debug failing tests

**Problem:** Coverage below threshold
- Solution: Write tests for uncovered code or adjust threshold in `jest.config.js`

### Build Workflow Issues

**Problem:** Bazel build fails
- Solution: Run `npm run build` locally, check Bazel version compatibility

**Problem:** Bazel cache not working
- Solution: Bazel cache is per-branch; first run will be slower

**Problem:** Build timeout
- Solution: Increase timeout in workflow or optimize build process

### Release Workflow Issues

**Problem:** Version validation fails
- Solution: Ensure version format is X.Y.Z (e.g., 1.2.3)

**Problem:** Tag already exists
- Solution: Use a different version number or delete tag before retrying

**Problem:** Release not published
- Solution: Releases are created in draft status; manually publish from releases page

---

## Best Practices

1. **Before Pushing:**
   - Run `npm run validate` locally (runs type-check, lint, and test)
   - Ensure your code passes all quality checks

2. **PR Reviews:**
   - Check CI status before merging
   - Review coverage reports
   - Look for linting warnings

3. **Releases:**
   - Always validate version number before triggering
   - Review generated changelog before publishing
   - Tag format: `v{version}` (e.g., v1.2.3)

4. **Caching:**
   - Cache invalidation happens automatically
   - First run after branch switch will be slower
   - Manual cache clearing available in GitHub Actions settings

---

## GitHub Secrets (Optional)

For enhanced functionality, consider adding these secrets:

- `CODECOV_TOKEN` - For Codecov integration (if private repo)
- `SLACK_WEBHOOK` - For Slack notifications on failures
- `GITHUB_TOKEN` - Automatically provided by GitHub

---

## Extending the Workflows

### Adding New Checks

Add new steps to the CI workflow:

```yaml
- name: Run custom check
  run: npm run my-custom-check
  continue-on-error: false
```

### Adding Notifications

Use third-party actions for additional notifications:

```yaml
- name: Notify on failure
  if: failure()
  uses: custom-action/notify@v1
  with:
    webhook-url: ${{ secrets.WEBHOOK_URL }}
```

### Adding Platform-Specific Builds

Extend the Build workflow with macOS and Windows runners:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]

runs-on: ${{ matrix.os }}
```

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions - Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [GitHub Actions - Concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)
- [Codecov Documentation](https://docs.codecov.io/)
- [Bazel Documentation](https://bazel.build/docs)

---

## Support

For issues or questions about the workflows:
1. Check the troubleshooting section
2. Review workflow logs in GitHub Actions tab
3. Check latest commits for recent changes
4. Open an issue with workflow logs attached
