# GitHub Actions CI/CD - Complete Index

Welcome to the valdi-ai-ui GitHub Actions documentation! This page serves as the central hub for all workflow-related information.

## Quick Navigation

### Essential Guides (Start Here)
1. **[QUICK_START.md](./QUICK_START.md)** - 5-minute overview to get started
2. **[workflows/README.md](./workflows/README.md)** - Complete workflow documentation

### Reference Documents
- **[CICD_IMPLEMENTATION.md](./CICD_IMPLEMENTATION.md)** - Implementation details and configuration
- **[WORKFLOW_BADGES.md](./WORKFLOW_BADGES.md)** - Status badge setup for README
- **[INDEX.md](./INDEX.md)** - This file

### Workflow Files
- **[.workflows/ci.yml](./workflows/ci.yml)** - Continuous Integration
- **[.workflows/build.yml](./workflows/build.yml)** - Build Verification
- **[.workflows/release.yml](./workflows/release.yml)** - Release Automation

---

## The 3 Core Workflows

### 1. CI.yml - Continuous Integration
**What it does:** Runs on every push and PR to validate code quality

```
Triggers: Push to main/develop, PRs to main/develop
Duration: 10-20 minutes
Status: Visible in PR checks
Tests: Node 18.x and 20.x
```

**Checks:**
- TypeScript type checking
- ESLint linting (60+ rules)
- Prettier formatting
- Jest unit tests
- Coverage reporting (60% threshold)

**View more:** [workflows/README.md#1-ci-continuous-integration---ciyml](./workflows/README.md#1-ci-continuous-integration---ciyml)

---

### 2. Build.yml - Build Verification
**What it does:** Verifies Bazel and standalone builds work correctly

```
Triggers: Push to main/develop, PRs, Daily at 2 AM UTC
Duration: 30-45 minutes
Status: Visible in PR checks
Tests: Bazel build, tests, and standalone
```

**Features:**
- Bazel build verification
- Bazel unit test execution
- Standalone build verification
- Multi-level caching
- Regression detection (daily schedule)

**View more:** [workflows/README.md#2-build-verification---buildyml](./workflows/README.md#2-build-verification---buildyml)

---

### 3. Release.yml - Release Automation
**What it does:** Automates version bumping, changelog, and release creation

```
Triggers: Manual from GitHub UI
Duration: 5-15 minutes
Status: Draft release created
Process: Validation → Quality checks → Release
```

**Features:**
- Semantic version validation
- Automatic package.json update
- Changelog generation
- Git tag creation
- Draft GitHub release

**View more:** [workflows/README.md#3-release-automation---releaseyml](./workflows/README.md#3-release-automation---releaseyml)

---

## Getting Started

### Step 1: Push Workflows to GitHub
```bash
git add .github/
git commit -m "feat: Add GitHub Actions CI/CD workflows"
git push origin main
```

### Step 2: Watch Workflows Run
- Go to your GitHub repository
- Click "Actions" tab
- See workflows run automatically

### Step 3: Add Status Badges (Optional)
Add to your `README.md`:
```markdown
[![CI](https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/ci.yml/badge.svg?branch=main)](...)
[![Build](https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/build.yml/badge.svg?branch=main)](...)
```

See [WORKFLOW_BADGES.md](./WORKFLOW_BADGES.md) for complete examples.

### Step 4: Test Everything Locally
```bash
npm run validate  # Runs type-check, lint, test
```

---

## Common Tasks

### I need to fix a failing workflow
1. Go to Actions tab
2. Click the failed workflow
3. Click the failed job
4. Scroll to error message
5. Fix locally and push

**Common fixes:**
- Type errors: `npm run type-check` then fix code
- Lint errors: `npm run lint:fix`
- Test failures: `npm run test:watch` to debug
- Format issues: `npm run format`

### I want to create a release
1. Go to Actions tab
2. Select "Release" workflow
3. Click "Run workflow"
4. Enter version (e.g., `1.0.1`)
5. Select release type (`patch`, `minor`, or `major`)
6. Click "Run workflow"
7. Review and publish release

### I want to customize a workflow
See [CICD_IMPLEMENTATION.md#configuration-details](./CICD_IMPLEMENTATION.md#configuration-details) for:
- Changing Node.js versions
- Adjusting coverage thresholds
- Modifying cache strategy
- Updating timeouts

---

## Documentation Structure

```
.github/
├── INDEX.md                          ← You are here
├── QUICK_START.md                    ← 5-min quick start
├── CICD_IMPLEMENTATION.md            ← Deep dive details
├── WORKFLOW_BADGES.md                ← Badge setup
└── workflows/
    ├── README.md                     ← Full workflow docs
    ├── ci.yml                        ← CI pipeline (112 lines)
    ├── build.yml                     ← Build verification (183 lines)
    └── release.yml                   ← Release automation (204 lines)
```

---

## Key Features

### Caching
- npm dependencies cached per Node.js version
- Bazel artifacts cached per branch
- Multi-level restore keys for efficiency

### Performance
- Parallel job execution (3 build jobs simultaneously)
- Matrix testing (Node 18.x and 20.x in parallel)
- Smart concurrency to prevent redundant runs

### Quality
- TypeScript strict mode checking
- ESLint with 60+ rules
- Prettier formatting enforcement
- Jest unit tests with 60% coverage threshold
- Codecov integration

### Notifications
- PR comments with test metrics
- Build failure alerts
- Release summaries

### Security
- Minimal permissions (contents, pull-requests)
- No hardcoded secrets
- Safe git operations

---

## Workflow Statistics

| Metric | Value |
|--------|-------|
| Total Files | 7 |
| Total Lines | 1,662 |
| Total Size | ~47 KB |
| Workflows | 3 |
| Jobs | 9 |
| CI Duration | 10-20 min |
| Build Duration | 30-45 min |
| Release Duration | 5-15 min |

---

## Testing Locally

Before pushing, run these commands locally:

```bash
# Full validation (runs all checks)
npm run validate

# Individual commands:
npm run type-check      # TypeScript
npm run lint           # ESLint
npm run format:check   # Prettier
npm run test           # Jest
npm run test:coverage  # With coverage

# Fix issues automatically:
npm run lint:fix
npm run format

# Build verification:
npm run build          # Bazel build
npm run test:bazel     # Bazel tests
```

---

## Troubleshooting

### Workflow Not Running
- Enable Actions in repository Settings
- Push to main or develop branch
- Check branch protection rules

### Tests Failing
- Run `npm run validate` locally
- Fix errors shown in output
- Commit and push again

### Build Issues
- Run `npm run build` locally
- Check Bazel version compatibility
- Review error messages in Actions log

### Coverage Below Threshold
- Write more tests
- Or adjust threshold in `jest.config.js`
- Or update coverage in CI workflow

**More help:** See [workflows/README.md#troubleshooting](./workflows/README.md#troubleshooting)

---

## Best Practices

### Before Committing
```bash
npm run validate  # Always run this first
```

### Before Merging PR
- All CI checks pass (green checkmarks)
- Coverage metrics visible in PR
- No ESLint warnings
- All tests passing

### Before Releasing
- Main branch CI passing
- Version in semver format (X.Y.Z)
- Review generated changelog
- No duplicate version tags

---

## Configuration Summary

### Node.js Versions Tested
- 18.x (LTS Maintenance)
- 20.x (LTS Active)

### Coverage Thresholds
- Lines: 60%
- Statements: 60%
- Functions: 60%
- Branches: 60%

### TypeScript
- target: ES2022
- strict: true
- Path aliases: @common, @chat_core, @chat_ui, etc.

### ESLint
- Base: eslint:recommended
- Extensions: plugin:@typescript-eslint/strict
- 60+ rules enforced

---

## Next Steps

1. **Push workflows to GitHub**
   ```bash
   git push origin main
   ```

2. **Watch first workflow run**
   - Go to Actions tab
   - Monitor CI workflow

3. **Add status badges** (optional)
   - Copy badge markdown from [WORKFLOW_BADGES.md](./WORKFLOW_BADGES.md)
   - Add to README.md

4. **Create a test PR**
   - Verify CI runs on PR
   - Check PR status checks

5. **Test release workflow**
   - Go to Actions > Release
   - Run with test version

6. **Set up branch protection** (recommended)
   - Require status checks to pass
   - Require PR reviews

---

## Support & Resources

### Documentation
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)
- **Implementation:** [CICD_IMPLEMENTATION.md](./CICD_IMPLEMENTATION.md)
- **Workflows:** [workflows/README.md](./workflows/README.md)
- **Badges:** [WORKFLOW_BADGES.md](./WORKFLOW_BADGES.md)

### External Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Bazel Documentation](https://bazel.build/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Getting Help
1. Check [workflows/README.md#troubleshooting](./workflows/README.md#troubleshooting)
2. Review workflow logs in Actions tab
3. Check recent git commits for breaking changes

---

## File Manifest

### Workflow Files (Executable)
- `workflows/ci.yml` - 112 lines - CI pipeline configuration
- `workflows/build.yml` - 183 lines - Build verification configuration
- `workflows/release.yml` - 204 lines - Release automation configuration

### Documentation Files (Reference)
- `workflows/README.md` - 397 lines - Complete workflow documentation
- `CICD_IMPLEMENTATION.md` - 397 lines - Implementation details
- `QUICK_START.md` - 291 lines - Quick start guide
- `WORKFLOW_BADGES.md` - 78 lines - Badge configuration
- `INDEX.md` - This file - Central navigation hub

---

## Quick Reference

### Workflow URLs
- **CI Workflow:** `https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/ci.yml`
- **Build Workflow:** `https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/build.yml`
- **Release Workflow:** `https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/release.yml`

### Status Badge URLs
- **CI:** `https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/ci.yml/badge.svg?branch=main`
- **Build:** `https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/build.yml/badge.svg?branch=main`
- **Release:** `https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/release.yml/badge.svg`

Replace `YOUR_ORG` with your GitHub organization/username.

---

## Summary

You now have a **production-ready CI/CD pipeline** for valdi-ai-ui with:

✅ Automated testing on every push and PR
✅ Code quality enforcement (TypeScript, ESLint, Prettier)
✅ Build verification with intelligent caching
✅ Automated release management
✅ Coverage reporting and metrics
✅ PR notifications and feedback
✅ Complete documentation

**Start now:** Push workflows to GitHub and watch them run!

---

**Version:** 1.0
**Created:** 2025-11-23
**Status:** Production Ready
