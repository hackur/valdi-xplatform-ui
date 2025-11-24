# Troubleshooting Guide

Common issues and solutions for the Valdi AI UI project.

---

## Table of Contents

1. [Build Issues](#build-issues)
2. [TypeScript Errors](#typescript-errors)
3. [Module Resolution](#module-resolution)
4. [Bazel Problems](#bazel-problems)
5. [iOS Build Issues](#ios-build-issues)
6. [Android Build Issues](#android-build-issues)
7. [Development Environment](#development-environment)

---

## Build Issues

### Bazel Build Fails with "no such file or directory"

**Symptom:**
```
ERROR: no such package 'apps/valdi_ai_ui/modules/common'
```

**Solution:**
The project was migrated to use `//modules/...` paths instead of `//apps/valdi_ai_ui/modules/...`.

Update any custom BUILD.bazel files:
```python
# ❌ Old
deps = ["//apps/valdi_ai_ui/modules/common"]

# ✅ New
deps = ["//modules/common"]
```

### Bazel Cache Corruption

**Symptom:**
```
ERROR: corrupt installation
```

**Solution:**
Clean Bazel cache and rebuild:
```bash
bazel clean --expunge
bazel build //:valdi_ai_ui
```

### Out of Disk Space

**Symptom:**
```
ERROR: no space left on device
```

**Solution:**
```bash
# Check Bazel cache size
du -sh ~/.cache/bazel

# Clean old build artifacts
bazel clean
npm run clean:full

# If still needed, expunge all Bazel caches
bazel clean --expunge
```

---

## TypeScript Errors

### Cannot find module 'common/src/types'

**Symptom:**
```
error TS2307: Cannot find module 'common/src/types'
```

**Solution:**
Use path aliases from tsconfig.json:
```typescript
# ❌ Old bare import
import { Message } from 'common/src/types';

# ✅ New path alias
import { Message } from '@common/types';
```

### Property 'setState' does not exist

**Symptom:**
```
error TS2339: Property 'setState' does not exist on type 'MyComponent'
```

**Solution:**
Ensure your component extends the correct Valdi base class:
```typescript
// ✅ For stateful components
import { StatefulComponent } from 'valdi_core/src/Component';

export class MyComponent extends StatefulComponent<Props, State> {
  state: State = { /* initial state */ };
  
  // setState is now available
  handleClick = () => {
    this.setState({ /* updates */ });
  };
}
```

### JSX element implicitly has type 'any'

**Symptom:**
```
error TS7026: JSX element implicitly has type 'any'
```

**Solution:**
Import Valdi JSX elements:
```typescript
import { $createElement, $Fragment } from 'valdi_tsx/src/createElement';
import { View, Text } from 'valdi_tsx/src/NativeTemplateElements';
```

---

## Module Resolution

### Module not found after npm install

**Symptom:**
```
Cannot find module '@ai-sdk/openai'
```

**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm list @ai-sdk/openai
```

### Path alias not working

**Symptom:**
TypeScript can't resolve `@common/*` imports

**Solution:**
1. Check tsconfig.json has path mappings:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@common/*": ["./modules/common/src/*"]
    }
  }
}
```

2. Restart TypeScript server:
   - VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
   - Other editors: Restart editor

---

## Bazel Problems

### Bazel version mismatch

**Symptom:**
```
ERROR: This version of Bazel requires version 7.0.0
```

**Solution:**
```bash
# Check current version
bazel version

# Install correct version via Bazelisk
npm install -g @bazel/bazelisk

# Or use .bazelversion file
cat .bazelversion
```

### Missing Bazel dependencies

**Symptom:**
```
ERROR: no such target '//vendor/valdi/...'
```

**Solution:**
Ensure vendor directory exists with Valdi framework:
```bash
# Check vendor directory
ls -la vendor/valdi/

# If missing, clone or symlink Valdi framework
# (See STANDALONE_BUILD.md for setup instructions)
```

---

## iOS Build Issues

### Xcode not found

**Symptom:**
```
ERROR: Xcode version must be specified to use an Apple CROSSTOOL
```

**Solution:**
```bash
# Ensure Xcode is installed
xcode-select --install

# Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app

# Verify
xcodebuild -version
```

### iOS Simulator not running

**Symptom:**
```
No devices available
```

**Solution:**
```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator
xcrun simctl boot "iPhone 15 Pro"

# Or open Simulator.app
open -a Simulator
```

### Code signing issues

**Symptom:**
```
Signing for "ValdiAIUI" requires a development team
```

**Solution:**
Update ios_bundle_id in BUILD.bazel with your team ID or use automatic signing in Xcode.

---

## Android Build Issues

### Android SDK not found

**Symptom:**
```
ERROR: ANDROID_HOME not set
```

**Solution:**
```bash
# Set environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk

# Add to ~/.zshrc or ~/.bashrc
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc

# Verify
echo $ANDROID_HOME
```

### Gradle build fails

**Symptom:**
```
FAILURE: Build failed with an exception
```

**Solution:**
```bash
# Clean Android build cache
cd android
./gradlew clean

# Or full clean
bazel clean
npm run clean:full
```

### ADB device offline

**Symptom:**
```
error: device offline
```

**Solution:**
```bash
# Restart ADB
adb kill-server
adb start-server

# List devices
adb devices

# If still offline, disconnect/reconnect USB or restart emulator
```

---

## Development Environment

### npm install fails

**Symptom:**
```
npm ERR! peer dependency errors
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete lock file and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript language server slow

**Symptom:**
Editor becomes unresponsive during type checking

**Solution:**
1. Exclude large directories in tsconfig.json:
```json
{
  "exclude": [
    "node_modules",
    "bazel-*",
    "vendor",
    "**/dist",
    "**/build"
  ]
}
```

2. Increase memory limit:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Git conflicts in BUILD.bazel

**Symptom:**
Merge conflicts after pulling latest changes

**Solution:**
The BUILD.bazel path migration may conflict with your local changes.

Accept incoming changes if on `//modules/...` paths:
```bash
git checkout --theirs BUILD.bazel modules/*/BUILD.bazel
```

Or manually update:
```bash
# Replace old paths with new
sed -i '' 's|//apps/valdi_ai_ui/modules/|//modules/|g' BUILD.bazel
```

---

## Common Error Messages

### Error: Cannot find module 'valdi_http/src/HTTPClient'

**Issue**: Valdi framework modules use different import pattern

**Fix**: This is a Valdi framework module, not a project module. Ensure vendor/valdi is properly set up.

### Error: Expected 1 arguments, but got 3

**Issue**: Function signature mismatch

**Fix**: Check the function definition and ensure you're passing correct number of arguments. May indicate version mismatch or incorrect import.

### Error: Type 'ChatResponse' is missing properties

**Issue**: Type incompatibility between AI SDK response and internal Message type

**Fix**: Add mapping function to convert between types:
```typescript
function toMessage(response: ChatResponse): Message {
  return {
    id: generateId(),
    role: response.role,
    content: response.content,
    // ... map other properties
  };
}
```

---

## Getting More Help

### 1. Check Documentation
- README.md - Project overview
- PROJECT_PLAN.md - Implementation roadmap
- ARCHITECTURE.md - System design
- STABILIZATION_STATUS.md - Current project state

### 2. Search Issues
Check if your issue is already reported:
```bash
# Search GitHub issues (replace with actual repo URL)
open "https://github.com/your-org/valdi-ai-ui/issues"
```

### 3. Enable Verbose Logging

For Bazel:
```bash
bazel build //:valdi_ai_ui --verbose_failures
```

For npm scripts:
```bash
npm run build --verbose
```

For TypeScript:
```bash
npm run type-check -- --extendedDiagnostics
```

### 4. Create Minimal Reproduction

If filing a bug report, include:
- Error message (full stack trace)
- Steps to reproduce
- Environment info:
  ```bash
  node --version
  npm --version
  bazel version
  sw_vers  # macOS
  ```

---

## Quick Diagnostic Commands

Run these to gather information for bug reports:

```bash
# System info
echo "=== System Info ===" && \
sw_vers && \
node --version && \
npm --version && \
bazel version

# Project health
echo "=== Project Health ===" && \
npm run type-check 2>&1 | grep "error TS" | wc -l && \
echo "TypeScript errors" && \
find modules -name "*.test.ts" -o -name "*.test.tsx" | wc -l && \
echo "Test files"

# Git status
echo "=== Git Status ===" && \
git status --short && \
git log --oneline -5
```

---

**Last Updated**: November 23, 2025

For additional help, consult the [Valdi Documentation](https://valdi.dev) or [AI SDK Documentation](https://sdk.vercel.ai).
