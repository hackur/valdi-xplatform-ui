# GitHub Actions CI/CD - Quick Start Guide

## Overview

Three production-ready workflows have been created for automated testing, building, and releasing.

## Workflows at a Glance

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push, PR | Type check, lint, test, coverage |
| **Build** | Push, PR, Daily | Build verification with Bazel caching |
| **Release** | Manual trigger | Automated version bump & GitHub release |

## Getting Started

### 1. First Push

```bash
# Push your changes to GitHub
git add .
git commit -m "feat: Add GitHub Actions workflows"
git push origin main
```

Workflows automatically run on push. Check status at: **Actions tab in GitHub**

### 2. Make a Pull Request

Create a PR to main/develop. Workflows automatically run with status checks visible.

### 3. Test Locally Before Push

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test

# Or run all validation
npm run validate
```

### 4. Create a Release

Go to: **Actions → Release → Run workflow**

1. Enter version (e.g., `1.0.1`)
2. Select release type (`patch`, `minor`, or `major`)
3. Click "Run workflow"
4. Visit releases page to review and publish

## Workflow Details

### CI Workflow (`ci.yml`)

**Runs on:** Every push and PR to main/develop

**Checks:**
- TypeScript compilation
- ESLint linting
- Prettier formatting
- Jest tests (Node 18.x and 20.x)
- Coverage reports

**Status:** Shows in PR checks

```
CI / Lint, Type Check, and Test (18.x)
CI / Lint, Type Check, and Test (20.x)
CI / Status Check
```

**Time:** ~10-20 minutes

---

### Build Workflow (`build.yml`)

**Runs on:** Push, PR, Daily at 2 AM UTC

**Checks:**
- Bazel build
- Bazel tests
- Standalone build verification

**Caching:** Automatic Bazel artifact caching

**Time:** ~30-45 minutes

---

### Release Workflow (`release.yml`)

**Runs on:** Manual trigger from Actions tab

**Steps:**
1. Validates version format (X.Y.Z)
2. Checks for duplicate tags
3. Updates package.json
4. Generates changelog
5. Runs quality checks
6. Creates git tag
7. Creates GitHub release (draft)

**Time:** ~5-15 minutes (includes test run)

## Status Badges

Add to your README.md:

```markdown
[![CI](https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/ci.yml)
[![Build](https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/YOUR_ORG/valdi-ai-ui/actions/workflows/build.yml)
```

Replace `YOUR_ORG` with your GitHub organization/username.

## Common Tasks

### Fix TypeScript Errors

```bash
npm run type-check  # See errors
# Fix errors in code
git add . && git commit -m "fix: resolve type errors"
```

### Fix Linting Issues

```bash
npm run lint:fix    # Auto-fix most issues
git add . && git commit -m "style: lint fixes"
```

### Fix Formatting Issues

```bash
npm run format      # Auto-format code
git add . && git commit -m "style: prettier formatting"
```

### Run Tests Locally

```bash
npm run test:watch  # Watch mode for development
npm run test        # Single run
npm run test:coverage  # With coverage report
```

### Troubleshoot Failed Workflow

1. Click on failed workflow in Actions tab
2. Click on failed job
3. Look for red X marks or error messages
4. Common fixes:
   - Missing dependencies: `npm ci`
   - Type errors: `npm run type-check`
   - Lint errors: `npm run lint:fix`
   - Test failures: Check test files for issues

## Configuration Defaults

**Node.js Versions Tested:** 18.x, 20.x

**Test Coverage Threshold:** 60%

**Timeout Limits:**
- CI: 30 minutes
- Build: 45 minutes
- Release: 15 minutes

**Caching:**
- npm dependencies: Automatic per Node version
- Bazel artifacts: Automatic per branch

## What's Included

### Workflow Files
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/build.yml` - Build verification
- `.github/workflows/release.yml` - Release automation

### Documentation
- `.github/workflows/README.md` - Full documentation
- `.github/CICD_IMPLEMENTATION.md` - Implementation details
- `.github/WORKFLOW_BADGES.md` - Badge configuration
- `.github/QUICK_START.md` - This file

## Next Steps

1. **Push to GitHub** - Triggers first CI run
2. **Monitor Actions tab** - Watch workflow results
3. **Add badges** - Copy from WORKFLOW_BADGES.md to README
4. **Create PR** - Test PR workflow
5. **Create release** - Test release workflow

## Help & Documentation

- **Full docs:** See `.github/workflows/README.md`
- **Implementation:** See `.github/CICD_IMPLEMENTATION.md`
- **Badges:** See `.github/WORKFLOW_BADGES.md`
- **GitHub Actions:** https://docs.github.com/en/actions

## Pro Tips

1. **Before pushing:** Run `npm run validate` locally
2. **PR workflow:** All checks must pass before merging
3. **Cache speed:** First run slow, subsequent runs fast
4. **Coverage:** Maintain >60% test coverage
5. **Releases:** Always use semantic versioning

## File Locations

```
.github/
├── workflows/
│   ├── ci.yml                    # CI pipeline
│   ├── build.yml                 # Build verification
│   ├── release.yml               # Release automation
│   └── README.md                 # Workflow documentation
├── CICD_IMPLEMENTATION.md        # Implementation guide
├── WORKFLOW_BADGES.md            # Badge configuration
└── QUICK_START.md               # This file
```

## Getting Help

### Check workflow logs:
1. Go to repository
2. Click "Actions" tab
3. Click on failed workflow
4. Click on failed job
5. Review error messages

### Common Issues:

**❌ Workflow not running**
- Check Actions is enabled in Settings
- Push to main or develop branch

**❌ Tests fail locally**
- Run `npm ci` to ensure dependencies
- Check test files for issues
- Run `npm run test:watch` for details

**❌ TypeScript errors**
- Run `npm run type-check`
- Fix errors in code
- Commit and push

**❌ Build fails**
- Run `npm run build` locally
- Check Bazel compatibility
- Review error logs

## Quick Reference Commands

```bash
# Validate code locally (runs before push)
npm run validate

# Run all checks individually
npm run type-check      # TypeScript
npm run lint           # ESLint
npm run format:check   # Prettier
npm run test           # Jest
npm run test:coverage  # With coverage

# Fix issues automatically
npm run lint:fix       # Auto-fix lint issues
npm run format         # Auto-format code
npm run clean          # Clean build artifacts

# Build locally
npm run build          # Bazel build
npm run test:bazel     # Bazel tests

# Release
# Use GitHub UI: Actions > Release > Run workflow
```

---

**Created:** 2025-11-23
**Workflows Version:** 1.0
**Status:** Production Ready
