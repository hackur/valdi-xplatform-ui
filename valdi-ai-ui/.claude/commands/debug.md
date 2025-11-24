# Debug Command

Troubleshoot build, runtime, and configuration issues.

## Task

Run comprehensive diagnostics to identify and help resolve issues.

## Diagnostic Steps

1. **Environment Check**
   ```bash
   node --version
   npm --version
   npx tsc --version
   npx react-native --version
   ```

2. **Dependencies Check**
   ```bash
   npm list --depth=0          # Check installed packages
   npm outdated                # Check for updates
   npm audit                   # Security vulnerabilities
   ```

3. **TypeScript Configuration**
   - Verify tsconfig.json exists and is valid
   - Check compiler options
   - Verify path mappings

4. **Build Diagnostics**
   ```bash
   # Clear caches
   rm -rf node_modules
   rm -rf ios/build
   rm -rf android/build
   rm -rf .metro-cache

   # Reinstall
   npm install
   ```

5. **Metro Bundler**
   ```bash
   npx react-native start --reset-cache
   ```

6. **Platform-Specific**

   **iOS:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

   **Android:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

7. **Check Logs**
   - TypeScript errors: `npx tsc --noEmit`
   - ESLint issues: `npx eslint . --ext .ts,.tsx`
   - Test failures: `npm test`
   - Build logs: `npm run build 2>&1 | tee build.log`

## Common Issues & Fixes

### Issue: "Cannot find module '@valdi/core'"
**Fix:**
```bash
# Check if workspace setup is correct
npm list @valdi/core
# May need to rebuild or link workspace packages
npm run bootstrap
```

### Issue: TypeScript errors in node_modules
**Fix:**
```bash
# Add skipLibCheck to tsconfig.json
# Or update @types packages
npm update @types/*
```

### Issue: Metro bundler hanging
**Fix:**
```bash
# Clear watchman cache
watchman watch-del-all
# Clear metro cache
rm -rf .metro-cache
npx react-native start --reset-cache
```

### Issue: Tests failing with module resolution
**Fix:**
```bash
# Check jest.config.js moduleNameMapper
# Ensure mocks are properly configured
```

### Issue: Build failing on native modules
**Fix:**
```bash
# iOS
cd ios && pod install && cd ..
npx react-native run-ios --clean

# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## Output Format

```
Debug Report
===============

Environment:
  PASS: Node: v18.x.x
  PASS: npm: v9.x.x
  PASS: TypeScript: v5.x.x
  WARN: React Native: v0.x.x (update available)

Dependencies:
  PASS: All required packages installed
  WARN: 3 packages have security vulnerabilities
  INFO: Run: npm audit fix

Configuration:
  PASS: tsconfig.json valid
  PASS: jest.config.js found
  WARN: ESLint config has warnings

Build Status:
  FAIL: TypeScript: 242 errors
  WARN: ESLint: 12 warnings
  PASS: Tests: All passing
  FAIL: Metro: Not running

Recommended Actions:
  1. Fix critical TypeScript errors (Priority: High)
  2. Update React Native to latest stable
  3. Run npm audit fix for security patches
  4. Start Metro bundler: npm start

Detailed Logs:
  - TypeScript: /tmp/tsc-errors.log
  - Build: /tmp/build.log
  - Tests: /tmp/test-results.log
```

Provide actionable diagnostics and clear next steps to resolve issues.
