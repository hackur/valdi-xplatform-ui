# Release Preparation Command

Complete pre-release validation and preparation checklist.

## Task

Execute comprehensive checks before releasing a new version.

## Release Checklist

### 1. Code Quality ✅
```bash
# Type check
npx tsc --noEmit
# Must have 0 errors

# Lint
npx eslint . --ext .ts,.tsx --max-warnings 0
# Should have 0 errors, minimal warnings

# Format check
npx prettier --check "**/*.{ts,tsx,js,jsx,json}"
```

### 2. Testing ✅
```bash
# Run all tests
npm test -- --coverage --passWithNoTests

# Coverage thresholds:
# - Lines: >80%
# - Branches: >75%
# - Functions: >80%
# - Statements: >80%

# Integration tests (if available)
npm run test:integration
```

### 3. Build Verification ✅
```bash
# iOS build
cd ios && pod install && cd ..
npx react-native bundle --platform ios --entry-file index.js --bundle-output ./ios/main.jsbundle --dev false

# Android build
cd android && ./gradlew clean assembleRelease && cd ..

# Verify build artifacts
ls -lh ios/main.jsbundle
ls -lh android/app/build/outputs/apk/release/
```

### 4. Security Audit ✅
```bash
# Dependency audit
npm audit --audit-level=moderate

# Check for secrets
git grep -iE '(password|api[_-]?key|secret|token|credential).*=.*["\047]'

# License check
npm run license-check || npx license-checker --summary
```

### 5. Documentation ✅
- [ ] CHANGELOG.md updated with release notes
- [ ] README.md reflects current state
- [ ] API documentation up to date
- [ ] Breaking changes documented
- [ ] Migration guide (if needed)

### 6. Version Bump ✅
```bash
# Update version in package.json
npm version [major|minor|patch]

# Update iOS version
# Edit ios/ValdiAI/Info.plist - CFBundleShortVersionString

# Update Android version
# Edit android/app/build.gradle - versionName, versionCode
```

### 7. Git Status ✅
```bash
# Ensure clean working directory
git status

# All changes committed
# No untracked files (except intentional)

# Create release branch
git checkout -b release/v1.x.x

# Tag release
git tag -a v1.x.x -m "Release v1.x.x"
```

### 8. Performance Check ✅
```bash
# Bundle size check
ls -lh ios/main.jsbundle
# Should be <10MB

# Startup time profiling
# Memory leak check
# Performance profiling
```

### 9. Final Validations ✅
```bash
# Dependencies up to date
npm outdated

# No beta/alpha dependencies in production

# Environment variables set correctly

# API endpoints point to production

# Debug flags disabled
```

### 10. Release Notes ✅
```markdown
## v1.x.x - YYYY-MM-DD

### Features
- New feature 1
- New feature 2

### Improvements
- Enhanced performance
- Better error handling

### Bug Fixes
- Fixed issue #123
- Resolved crash on startup

### Breaking Changes
- Migration required for X

### Dependencies
- Updated react-native to vX.Y.Z
```

## Release Script

Create `scripts/release-prep.sh`:
```bash
#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release-prep.sh <version>"
  exit 1
fi

echo "🚀 Preparing Release: v$VERSION"
echo "================================"

# 1. Code quality
echo "✓ Running type check..."
npx tsc --noEmit

echo "✓ Running linter..."
npx eslint . --ext .ts,.tsx --max-warnings 0

# 2. Tests
echo "✓ Running tests..."
npm test -- --coverage --passWithNoTests

# 3. Security
echo "✓ Security audit..."
npm audit --audit-level=high

# 4. Build
echo "✓ Creating production bundle..."
npx react-native bundle --platform ios --entry-file index.js --bundle-output /tmp/bundle.js --dev false

# 5. Version bump
echo "✓ Updating version..."
npm version $VERSION --no-git-tag-version

# 6. Generate changelog
echo "✓ Update CHANGELOG.md manually"

echo ""
echo "✅ Release preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review and commit changes"
echo "2. Create release branch: git checkout -b release/v$VERSION"
echo "3. Push and create PR"
echo "4. After merge, tag: git tag -a v$VERSION -m 'Release v$VERSION'"
echo "5. Push tag: git push origin v$VERSION"
```

## Output Format

```
🚀 Release Preparation Report
==============================

Version: v1.2.3
Date: 2024-11-24

✅ Code Quality
   ├─ TypeScript: 0 errors
   ├─ ESLint: 0 errors, 0 warnings
   └─ Formatting: Compliant

✅ Testing
   ├─ Unit Tests: 143/143 passed
   ├─ Coverage: 87.5%
   └─ Integration: All passed

✅ Build
   ├─ iOS Bundle: 8.2MB
   ├─ Android APK: 12.5MB
   └─ Build Time: 3m 42s

✅ Security
   ├─ Vulnerabilities: 0 high, 2 moderate
   ├─ Secrets Check: Clean
   └─ Licenses: Compliant

✅ Documentation
   ├─ CHANGELOG: Updated
   ├─ README: Current
   └─ API Docs: Up to date

⚠️  Actions Required:
   1. Review CHANGELOG.md
   2. Update iOS Info.plist version
   3. Update Android build.gradle version

📋 Release Checklist: 9/10 Complete

🎯 Ready for Release: ✅
```

Execute this command before every release to ensure quality and completeness.
