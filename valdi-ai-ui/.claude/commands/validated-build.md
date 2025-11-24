# Validated Build Command

Run comprehensive validation before building the application.

## Task

Perform pre-build checks to ensure code quality and prevent build failures.

## Build Process

1. **Pre-Build Validation**

   ```bash
   echo "🔍 Running pre-build validation..."

   # Type Check
   echo "📝 Type checking..."
   npx tsc --noEmit || {
     echo "❌ TypeScript errors found. Build aborted."
     exit 1
   }

   # Lint
   echo "🎨 Linting..."
   npx eslint . --ext .ts,.tsx --max-warnings 10 || {
     echo "⚠️  Too many ESLint warnings. Please fix critical issues."
     exit 1
   }

   # Tests
   echo "🧪 Running tests..."
   npm test -- --passWithNoTests --coverage || {
     echo "❌ Tests failed. Build aborted."
     exit 1
   }

   # Check coverage
   COVERAGE=$(npm test -- --coverage --silent 2>&1 | grep "Lines" | awk '{print $3}' | tr -d '%')
   if [ "$COVERAGE" -lt 70 ]; then
     echo "⚠️  Warning: Test coverage below 70% (${COVERAGE}%)"
   fi

   # Security Audit
   echo "🔒 Security audit..."
   npm audit --audit-level=high || {
     echo "⚠️  High severity vulnerabilities found"
   }
   ```

2. **Build**

   Depending on platform:

   **iOS:**
   ```bash
   echo "📱 Building iOS..."
   cd ios
   pod install
   cd ..
   npx react-native bundle --platform ios --entry-file index.js --bundle-output ./ios/main.jsbundle
   # Or use Xcode build
   ```

   **Android:**
   ```bash
   echo "🤖 Building Android..."
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   cd ..
   ```

   **Web/Bundle:**
   ```bash
   echo "🌐 Building bundle..."
   npx react-native bundle --entry-file index.js --platform ios --bundle-output bundle.js
   ```

3. **Post-Build Verification**

   ```bash
   echo "✅ Verifying build artifacts..."

   # Check bundle size
   if [ -f "bundle.js" ]; then
     SIZE=$(wc -c < bundle.js)
     SIZE_MB=$((SIZE / 1024 / 1024))
     echo "📦 Bundle size: ${SIZE_MB}MB"

     if [ "$SIZE_MB" -gt 10 ]; then
       echo "⚠️  Warning: Large bundle size (${SIZE_MB}MB)"
       echo "💡 Consider code splitting or reducing dependencies"
     fi
   fi
   ```

4. **Build Report**

   ```bash
   echo "📊 Build completed successfully!"
   echo "================================"
   echo "Platform: [platform]"
   echo "Build Time: [duration]"
   echo "Bundle Size: [size]"
   echo "Test Coverage: [coverage]%"
   echo "================================"
   ```

## Validation Thresholds

- TypeScript: 0 errors ✅
- ESLint: ≤10 warnings ⚠️
- Tests: 100% pass ✅
- Coverage: ≥70% ⚠️
- Security: No high/critical vulnerabilities ✅

## Output Format

```
🏗️  Validated Build Report
==========================

Pre-Build Validation:
  ✅ TypeScript: 0 errors
  ✅ ESLint: 3 warnings
  ✅ Tests: 143/143 passed
  ✅ Coverage: 85.2%
  ✅ Security: No high vulnerabilities

Build Process:
  ✅ Dependencies installed
  ✅ Bundle created successfully
  ✅ Platform build completed

Build Artifacts:
  📦 iOS: main.jsbundle (8.2MB)
  📦 Android: app-release.apk (12.5MB)

⏱️  Total Time: 3m 42s

✅ Build Ready for Deployment
```

## Quick Flags

- `--skip-tests`: Skip test execution (not recommended)
- `--skip-lint`: Skip linting (not recommended)
- `--platform ios|android|web`: Specify platform
- `--release`: Build release version

Use validation to catch issues early and ensure high-quality builds.
