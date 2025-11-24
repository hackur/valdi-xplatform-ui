# Validated Build Command

Run comprehensive validation before building the application.

## Task

Perform pre-build checks to ensure code quality and prevent build failures.

## Build Process

1. **Pre-Build Validation**

   ```bash
   echo "[Validation] Running pre-build validation..."

   # Type Check
   echo "[Type-check] Type checking..."
   npx tsc --noEmit || {
     echo "[Error] TypeScript errors found. Build aborted."
     exit 1
   }

   # Lint
   echo "[Linting] Linting..."
   npx eslint . --ext .ts,.tsx --max-warnings 10 || {
     echo "[Warning] Too many ESLint warnings. Please fix critical issues."
     exit 1
   }

   # Tests
   echo "[Testing] Running tests..."
   npm test -- --passWithNoTests --coverage || {
     echo "[Error] Tests failed. Build aborted."
     exit 1
   }

   # Check coverage
   COVERAGE=$(npm test -- --coverage --silent 2>&1 | grep "Lines" | awk '{print $3}' | tr -d '%')
   if [ "$COVERAGE" -lt 70 ]; then
     echo "[Warning] Test coverage below 70% (${COVERAGE}%)"
   fi

   # Security Audit
   echo "[Security] Security audit..."
   npm audit --audit-level=high || {
     echo "[Warning] High severity vulnerabilities found"
   }
   ```

2. **Build**

   Depending on platform:

   **iOS:**
   ```bash
   echo "[Build] Building iOS..."
   cd ios
   pod install
   cd ..
   npx react-native bundle --platform ios --entry-file index.js --bundle-output ./ios/main.jsbundle
   # Or use Xcode build
   ```

   **Android:**
   ```bash
   echo "[Build] Building Android..."
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   cd ..
   ```

   **Web/Bundle:**
   ```bash
   echo "[Build] Building bundle..."
   npx react-native bundle --entry-file index.js --platform ios --bundle-output bundle.js
   ```

3. **Post-Build Verification**

   ```bash
   echo "[Verification] Verifying build artifacts..."

   # Check bundle size
   if [ -f "bundle.js" ]; then
     SIZE=$(wc -c < bundle.js)
     SIZE_MB=$((SIZE / 1024 / 1024))
     echo "[Artifacts] Bundle size: ${SIZE_MB}MB"

     if [ "$SIZE_MB" -gt 10 ]; then
       echo "[Warning] Large bundle size (${SIZE_MB}MB)"
       echo "[Suggestion] Consider code splitting or reducing dependencies"
     fi
   fi
   ```

4. **Build Report**

   ```bash
   echo "[Report] Build completed successfully!"
   echo "================================"
   echo "Platform: [platform]"
   echo "Build Time: [duration]"
   echo "Bundle Size: [size]"
   echo "Test Coverage: [coverage]%"
   echo "================================"
   ```

## Validation Thresholds

- TypeScript: 0 errors (PASS)
- ESLint: 10 warnings or fewer (WARN)
- Tests: 100% pass (PASS)
- Coverage: 70% or greater (WARN)
- Security: No high/critical vulnerabilities (PASS)

## Output Format

```
Validated Build Report
==========================

Pre-Build Validation:
  PASS: TypeScript: 0 errors
  PASS: ESLint: 3 warnings
  PASS: Tests: 143/143 passed
  PASS: Coverage: 85.2%
  PASS: Security: No high vulnerabilities

Build Process:
  PASS: Dependencies installed
  PASS: Bundle created successfully
  PASS: Platform build completed

Build Artifacts:
  iOS: main.jsbundle (8.2MB)
  Android: app-release.apk (12.5MB)

Total Time: 3m 42s

Status: Build Ready for Deployment
```

## Quick Flags

- `--skip-tests`: Skip test execution (not recommended)
- `--skip-lint`: Skip linting (not recommended)
- `--platform ios|android|web`: Specify platform
- `--release`: Build release version

Use validation to catch issues early and ensure high-quality builds.
