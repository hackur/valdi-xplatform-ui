# Build Troubleshooting Guide

Comprehensive reference for diagnosing and fixing common build issues in the Valdi AI UI project.

---

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Cache-Related Issues](#cache-related-issues)
3. [Module Dependency Errors](#module-dependency-errors)
4. [TypeScript Compilation Errors](#typescript-compilation-errors)
5. [Bazel Build Errors](#bazel-build-errors)
6. [Build Performance Issues](#build-performance-issues)
7. [Quick Fix Reference Table](#quick-fix-reference-table)
8. [Diagnostic Commands](#diagnostic-commands)

---

## Quick Diagnostics

Run this command to get a complete diagnostic report:

```bash
# System and project info
echo "=== SYSTEM INFO ===" && \
sw_vers && \
echo "" && \
echo "Node: $(node --version)" && \
echo "npm: $(npm --version)" && \
echo "Bazel: $(bazel version 2>/dev/null | head -1)" && \
echo "" && \
echo "=== PROJECT STATUS ===" && \
git branch && \
git status --short && \
echo "" && \
echo "=== QUICK CHECKS ===" && \
npm run type-check 2>&1 | grep -c "error TS" && echo "TypeScript errors" && \
npm run lint --silent 2>&1 | grep -c "error" && echo "Lint errors" && \
du -sh node_modules/.cache/bazel 2>/dev/null || echo "Bazel cache size: check ~/.cache/bazel"
```

---

## Cache-Related Issues

### Symptom: Build fails with cryptic errors after code changes

**Diagnosis:**
- Rebuild still fails after fixing the code
- Different errors on subsequent builds
- Old version of code appears to run

### Issue 1: Stale Bazel Cache

**Symptoms:**
- `error: stale file handle`
- `permission denied`
- Rebuild fails with same error
- Changes don't appear in built app

**Solutions (in order of increasing aggression):**

**1. Light clean (fastest, try first):**
```bash
bazel clean
```

**2. Deep clean with expunge (clears all cache):**
```bash
bazel clean --expunge
```

**3. Remove bazel symlinks (sometimes needed on macOS):**
```bash
bazel clean --expunge
rm -rf bazel-*
```

**4. Use dev.sh convenience script:**
```bash
./dev.sh clean        # Light clean
./dev.sh clean:deep   # Deep clean with node_modules
./dev.sh reset        # Complete reset (clean + npm install)
```

**When to use which:**

| Command | Use Case | Time |
|---------|----------|------|
| `./dev.sh clean` | First try for any cache issue | 5-10s |
| `./dev.sh clean:deep` | npm cache or build artifacts corrupted | 15-30s |
| `./dev.sh reset` | Everything broken, start fresh | 1-3 min |
| `bazel clean --expunge` | Only Bazel cache corrupted | 5-10s |

### Issue 2: npm Cache Corruption

**Symptoms:**
- `npm ERR! ETARGET`
- Modules installed but not found
- Import errors for packages that are in node_modules

**Solution:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

Or use the convenience script:
```bash
./dev.sh clean:deep
```

### Issue 3: Xcode Derived Data (iOS builds)

**Symptoms:**
- iOS build fails even after code fixes
- Simulator shows old version of app
- Code signing errors that persist

**Solution:**
```bash
# Remove Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Remove Xcode build artifacts
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# Then rebuild
./dev.sh reset
./dev.sh build
```

### Issue 4: TypeScript Language Server Cache

**Symptoms:**
- Editor shows red squiggles but builds fine
- Type errors that don't exist in actual code
- Autocomplete broken or slow

**Solution (VS Code):**
```
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

Or command line:
```bash
# Restart your editor to clear the TS server cache
```

---

## Module Dependency Errors

### Symptom: "Found imports from undeclared dependencies"

**Error message:**
```
ERROR: //modules/chat_core:chat_core: Found imports from undeclared dependencies:
  //modules/model_config:model_config (imported by chat_core)
  @ai-sdk/openai (imported by chat_core)
```

### Root Cause

The module's `BUILD.bazel` file doesn't declare all its actual dependencies. This happens when:
1. A module imports from another module but doesn't list it in `deps`
2. An external npm package is used but not in `deps`
3. The `module.yaml` file is out of sync with actual imports

### Solution: Fix module.yaml

**Step 1: Identify missing dependency**

From error: `//modules/model_config` is imported but not declared.

**Step 2: Open the module.yaml file:**

```bash
# For chat_core, edit:
vim modules/chat_core/module.yaml
```

**Step 3: Add the dependency to the `dependencies` section:**

**Before (incorrect):**
```yaml
name: chat_core
description: AI Chat Core functionality with Vercel AI SDK integration
version: 1.0.0

dependencies:
  # Valdi core dependencies
  valdi_core: "^1.0.0"
  # Application modules
  common: "1.0.0"
  # External npm dependencies (AI SDK)
  google@ai-sdk: "^1.0.0"
  openai@ai-sdk: "^1.0.0"
  anthropic@ai-sdk: "^1.0.0"
```

**After (correct):**
```yaml
name: chat_core
description: AI Chat Core functionality with Vercel AI SDK integration
version: 1.0.0

dependencies:
  # Valdi core dependencies
  valdi_core: "^1.0.0"
  # Application modules
  common: "1.0.0"
  model_config: "1.0.0"  # ADD THIS LINE
  # External npm dependencies (AI SDK)
  google@ai-sdk: "^1.0.0"
  openai@ai-sdk: "^1.0.0"
  anthropic@ai-sdk: "^1.0.0"
  ai: "^5.0.0"
  zod: "^3.24.1"
```

**Step 4: Validate the fix:**

```bash
# Regenerate BUILD files
./dev.sh validate:deps

# Rebuild to verify
bazel build //:valdi_ai_ui
```

### Common Module Dependencies

Here are the typical dependency relationships:

```yaml
# common (has no app module dependencies)
dependencies:
  valdi_core: "^1.0.0"

# model_config (depends on common)
dependencies:
  valdi_core: "^1.0.0"
  common: "1.0.0"

# chat_core (depends on common and model_config)
dependencies:
  valdi_core: "^1.0.0"
  common: "1.0.0"
  model_config: "1.0.0"
  ai: "^5.0.0"
  @ai-sdk/openai: "^1.0.0"
  @ai-sdk/anthropic: "^1.0.0"
  @ai-sdk/google: "^1.0.0"
  zod: "^3.24.1"

# chat_ui (depends on common and chat_core)
dependencies:
  valdi_core: "^1.0.0"
  common: "1.0.0"
  chat_core: "1.0.0"

# agent_manager, settings, workflow_demo, tools_demo (depend on common and/or others)
# Check actual imports in their source files
```

### Validate All Dependencies

```bash
# Run dependency validation script
./scripts/validate-module-deps.sh

# Or use dev.sh
./dev.sh validate:deps
```

This will show declared vs actual dependencies for each module.

---

## TypeScript Compilation Errors

### Issue 1: Type Mismatch with Style<T>

**Error:**
```
error TS2769: No overload matches this call
error TS2315: Type 'Style' is not generic
```

**Root Cause:**
Style objects must use type parameters: `Style<View>` or `Style<Label>`.

**Example:**
```typescript
// WRONG - Missing type parameter
const containerStyle = new Style({
  flexDirection: 'row',
});

// CORRECT - Add type parameter
const containerStyle = new Style<View>({
  flexDirection: 'row',
});
```

**Fix:**
```bash
# Auto-fix all style type issues
./scripts/fix-style-types.sh

# Then verify
npm run type-check
```

### Issue 2: Property doesn't exist on type

**Error:**
```
error TS2339: Property 'flexDirection' does not exist on type 'StyleOptions'
```

**Root Causes:**

1. **Using non-Valdi properties:**
   ```typescript
   // WRONG
   new Style<View>({
     flex: 1,  // Not supported, use flexGrow/flexShrink
     paddingHorizontal: 16,  // Not supported, use paddingLeft/paddingRight
   })

   // CORRECT
   new Style<View>({
     flexGrow: 1,
     flexShrink: 1,
     paddingLeft: 16,
     paddingRight: 16,
   })
   ```

2. **Using fontSize on Label:**
   ```typescript
   // WRONG
   new Style<Label>({
     fontSize: 16,  // Not supported
     fontWeight: 'bold',  // Not supported
   })

   // CORRECT
   new Style<Label>({
     font: systemBoldFont(16),  // Use font property
   })
   ```

See [VALDI_PATTERNS.md](./VALDI_PATTERNS.md) for comprehensive style property reference.

### Issue 3: Cannot find module

**Error:**
```
error TS2307: Cannot find module 'chat_core/types'
```

**Solutions:**

1. **Check tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@chat_core/*": ["./modules/chat_core/src/*"],
         "@common/*": ["./modules/common/src/*"]
       }
     }
   }
   ```

2. **Use correct import path:**
   ```typescript
   // WRONG - Bare module path
   import { Message } from 'chat_core/types';

   // CORRECT - Use @ alias
   import { Message } from '@chat_core/types';
   ```

3. **Verify tsconfig.json exists and is valid:**
   ```bash
   npm run type-check
   ```

### Issue 4: JSX element type errors

**Error:**
```
error TS7026: JSX element implicitly has type 'any'
error TS17004: Cannot use JSX unless the '--jsx' flag is provided
```

**Solution - Ensure Valdi JSX imports:**

```typescript
// Make sure these imports are at the top of TSX files
import { $createElement, $Fragment } from 'valdi_tsx/src/createElement';

// Or import the JSX components directly
import { view, label, scroll, textfield } from 'valdi_tsx/src/';

// The JSX pragma comment (usually in tsconfig.json):
// "jsx": "react-jsx"  // Configured for Valdi
```

### Issue 5: Circular dependency

**Error:**
```
error TS6202: 'chat_ui' is referenced as an external module but it declared 'none'
```

**Solution:**

Check for circular imports between modules:

```bash
# Find circular dependencies
grep -r "from ['\"]@" modules/ --include="*.ts" --include="*.tsx" | \
  cut -d: -f1 | sort | uniq -c | sort -rn

# Or use the validator
./scripts/validate-module-deps.sh
```

**Common circular dependency pattern:**
```typescript
// chat_core/src/index.ts imports from chat_ui
import { ChatView } from '@chat_ui/ChatView';

// chat_ui/src/index.ts imports from chat_core
import { ChatService } from '@chat_core/ChatService';
```

**Fix:** Break the cycle by using a facade pattern or moving shared code to common.

---

## Bazel Build Errors

### Error 1: "no such package"

**Error:**
```
ERROR: no such package '//modules/chat_core'
No package on path 'modules/chat_core'
```

**Cause:** Missing BUILD.bazel file in module directory.

**Solution:**
```bash
# Check all modules have BUILD.bazel
ls modules/*/BUILD.bazel

# If missing for any module:
cd modules/chat_core
touch BUILD.bazel
# Add basic build rules (copy from another module)
```

### Error 2: "ERROR: corrupt installation"

**Error:**
```
ERROR: Corrupt installation: on-disk format version is 2, but expected at most 1
```

**Solution:**
```bash
# Nuclear option: expunge Bazel
bazel clean --expunge

# Remove all bazel directories
rm -rf bazel-*

# Clear Bazel cache directory
rm -rf ~/.cache/bazel/*

# Rebuild from scratch
bazel build //:valdi_ai_ui
```

### Error 3: "no space left on device"

**Error:**
```
ERROR: no space left on device
```

**Diagnosis:**
```bash
# Check disk space
df -h

# Check Bazel cache size
du -sh ~/.cache/bazel

# Check project size
du -sh .
du -sh node_modules
du -sh bazel-*
```

**Solution (ascending order):**

1. **Clean Bazel cache:**
   ```bash
   bazel clean
   ```

2. **Clean npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Remove old Bazel caches:**
   ```bash
   bazel clean --expunge
   ```

4. **Deep clean everything:**
   ```bash
   ./dev.sh clean:deep
   ```

5. **Full disk cleanup (if desperate):**
   ```bash
   # Remove ALL Bazel caches globally
   rm -rf ~/.cache/bazel/*

   # Remove old Xcode data
   rm -rf ~/Library/Developer/Xcode/DerivedData/*

   # Clean iOS simulator cache
   xcrun simctl delete all

   # Reset project
   ./dev.sh reset
   ```

### Error 4: Valdi framework not found

**Error:**
```
ERROR: no such target '@@valdi//...'
ERROR: failed to load Starlark file '@@bazel_tools//:tools/cpp/toolchain/cc_toolchain_config.bzl'
```

**Cause:** vendor/valdi directory missing or corrupted.

**Solution:**

1. **Check vendor directory:**
   ```bash
   ls -la vendor/valdi/
   ```

2. **If missing, restore from backup:**
   ```bash
   # If you have a backup
   cp -r vendor/valdi.backup/* vendor/valdi/
   ```

3. **If corrupted, re-extract:**
   ```bash
   # If it's in a tar.gz
   cd vendor
   tar xzf valdi.tar.gz
   cd ..
   ```

4. **If completely missing, re-vendor:**
   ```bash
   # Follow STANDALONE_BUILD.md or docs/SELF_CONTAINED_SETUP.md
   ```

---

## Build Performance Issues

### Diagnosis: Identify bottlenecks

```bash
# Run performance benchmarks
./dev.sh bench

# This shows:
# - Type check time
# - ESLint time
# - Import validation time
# - Full validation time
```

### Issue 1: Slow Bazel builds (> 2 minutes)

**Cause:** Cold Bazel cache or heavy computation.

**Solutions:**

1. **Warm up the cache:**
   ```bash
   # Build once (slow)
   bazel build //:valdi_ai_ui

   # Subsequent builds should be faster
   bazel build //:valdi_ai_ui
   ```

2. **Check cache hit rate:**
   ```bash
   # Run build with info
   bazel build //:valdi_ai_ui --verbose_failures 2>&1 | grep -i "cache"
   ```

3. **Use local execution strategy:**
   ```bash
   # In .bazelrc (already configured)
   build:macos --spawn_strategy=local
   ```

4. **Disable workers for slow machines:**
   ```bash
   # In .bazelrc (already configured)
   common --experimental_worker_for_repo_fetching=off
   ```

### Issue 2: Slow TypeScript checking (> 30s)

**Causes:**
- Large vendored Valdi framework
- Too many dependencies analyzed
- Slow disk I/O

**Solutions:**

1. **Exclude vendor from type check:**
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true,
       "exclude": ["vendor", "node_modules", "bazel-*"]
     }
   }
   ```

2. **Run incremental type check:**
   ```bash
   npm run type-check -- --extendedDiagnostics
   ```

3. **Check what's slow:**
   ```bash
   npm run type-check 2>&1 | head -20
   ```

4. **Increase Node memory:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run type-check
   ```

### Issue 3: Slow linting (> 20s)

**Causes:**
- Large codebase
- ESLint plugins slow
- Checking vendor files

**Solutions:**

1. **Skip vendor in eslintignore:**
   ```
   vendor/
   bazel-*
   node_modules/
   coverage/
   dist/
   ```

2. **Run only modified files:**
   ```bash
   # Get changed files
   git diff --name-only

   # Lint only those
   npm run lint -- modules/chat_core/src
   ```

3. **Parallel linting:**
   ```bash
   # ESLint will auto-parallelize if configured
   npm run lint
   ```

### Issue 4: Module builds too slow

**Solution: Use sequential build script**

```bash
# Builds modules one at a time (slower but more reliable)
npm run build:modules

# Check what it does
cat scripts/build-modules-sequential.sh
```

---

## Quick Fix Reference Table

| Error Message | Most Likely Cause | Quick Fix |
|---------------|-------------------|-----------|
| `stale file handle` | Bazel cache corrupted | `bazel clean --expunge` |
| `no such package` | Missing BUILD.bazel | Create file in module dir |
| `Found imports from undeclared dependencies` | module.yaml missing dep | Add to module.yaml, run `./dev.sh validate:deps` |
| `error TS2315: Type 'Style' is not generic` | Missing `<View>` or `<Label>` | `./scripts/fix-style-types.sh` |
| `error TS2339: Property doesn't exist` | Wrong style property (flex vs flexGrow) | Check VALDI_PATTERNS.md |
| `Cannot find module` | Wrong import path (no @) | Use `@module_name/path` |
| `no space left on device` | Disk full with Bazel/npm cache | `./dev.sh clean:deep` or `bazel clean --expunge` |
| `JSX element implicitly has type 'any'` | Missing Valdi JSX imports | Add `import { $createElement } from 'valdi_tsx/src/createElement'` |
| `Corrupt installation` | Bazel binary corrupted | `bazel clean --expunge && rm -rf bazel-*` |
| `No overload matches this call` | Type mismatch (usually Style<T>) | Run `./scripts/fix-style-types.sh` or check VALDI_PATTERNS.md |
| `Permission denied` | File permissions or cache lock | `bazel clean && ./dev.sh reset` |
| `Symbol 'X' has already been exported` | Circular import | Check module dependency graph |
| `Xcode version must be specified` | Xcode tools not set | `sudo xcode-select --switch /Applications/Xcode.app` |
| `iOS Simulator not found` | Simulator not running/installed | `xcrun simctl boot "iPhone 15 Pro"` or `open -a Simulator` |

---

## Diagnostic Commands

### System and Tool Versions

```bash
# Get all relevant versions
echo "=== Versions ===" && \
node --version && \
npm --version && \
bazel version && \
tsc --version && \
xcodebuild -version

# More detailed Xcode info
xcode-select -p
xcrun --show-sdk-path
```

### Project Health Check

```bash
# Type errors
npm run type-check 2>&1 | grep -c "error TS"

# Lint errors
npm run lint --silent 2>&1 | grep -c "error"

# Module dependency issues
./scripts/validate-module-deps.sh

# Import validation
./scripts/verify-valdi-imports.sh

# All checks at once
./dev.sh check
```

### Bazel Diagnostic Commands

```bash
# Show build configuration
bazel info

# Query module structure
bazel query "//modules/..."

# Show what's being built
bazel build //:valdi_ai_ui --verbose_failures 2>&1 | head -50

# Show targets in a module
bazel query "//modules/chat_core:*"

# Analyze dependencies
bazel query 'deps(//modules/chat_core)' | head -20
```

### Cache Diagnostics

```bash
# Bazel cache size
du -sh ~/.cache/bazel

# npm cache size
du -sh ~/.npm

# Project cache size
du -sh ./node_modules
du -sh ./bazel-*
du -sh ./coverage

# Total project size
du -sh .

# Find largest files
find . -name "*.cache" -o -name "*.o" | xargs du -sh | sort -h | tail -20
```

### Git Status for Build Issues

```bash
# Show uncommitted changes
git status --short

# Show untracked files
git status --porcelain | grep "^?"

# Show stashed changes
git stash list

# Show recent commits
git log --oneline -10

# Check branch
git branch -v
```

### Module-Specific Diagnostics

```bash
# List all modules
ls -d modules/*/

# Check BUILD files exist
for dir in modules/*/; do
  if [ ! -f "$dir/BUILD.bazel" ]; then
    echo "Missing: $dir/BUILD.bazel"
  fi
done

# Check module.yaml files
for dir in modules/*/; do
  if [ ! -f "$dir/module.yaml" ]; then
    echo "Missing: $dir/module.yaml"
  fi
done

# Show module dependencies
./scripts/validate-module-deps.sh

# Count files per module
for dir in modules/*/; do
  count=$(find "$dir/src" -name "*.ts" -o -name "*.tsx" | wc -l)
  echo "$(basename $dir): $count files"
done
```

### Build Log Collection

Capture complete build logs for debugging:

```bash
# Full build with diagnostics
bazel build //:valdi_ai_ui --verbose_failures &> build.log
echo "=== Build Log saved to build.log ==="

# Type check with diagnostics
npm run type-check 2>&1 &> typecheck.log
echo "=== Type check log saved to typecheck.log ==="

# Lint with diagnostics
npm run lint 2>&1 &> lint.log
echo "=== Lint log saved to lint.log ==="

# All logs for sharing
tar czf build-diagnostics.tar.gz build.log typecheck.log lint.log
echo "=== All logs saved to build-diagnostics.tar.gz ==="
```

---

## Getting Help

### Before asking for help, collect:

1. **Error message** (full output)
2. **System info:**
   ```bash
   sw_vers
   node --version
   npm --version
   bazel version
   ```

3. **Project state:**
   ```bash
   git status
   git log --oneline -3
   ```

4. **Build logs:**
   ```bash
   bazel build //:valdi_ai_ui --verbose_failures 2>&1 | tail -100
   ```

5. **Recent changes:**
   ```bash
   git diff HEAD~1
   ```

### Common fix: Did you try...

- [ ] `./dev.sh clean` - Light cache clean
- [ ] `./dev.sh clean:deep` - Deep clean
- [ ] `./dev.sh reset` - Full reset
- [ ] `npm run type-check` - Check TypeScript
- [ ] `npm run lint --fix` - Auto-fix lint errors
- [ ] Restarted your editor (TS server cache)
- [ ] `git status` - Checked for uncommitted changes
- [ ] Updated from main: `git pull origin main`

### Resources

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - General troubleshooting
- [IOS_TROUBLESHOOTING.md](./IOS_TROUBLESHOOTING.md) - iOS-specific issues
- [VALDI_PATTERNS.md](./VALDI_PATTERNS.md) - Valdi API patterns
- [VALDI_IMPORT_CONVENTIONS.md](./VALDI_IMPORT_CONVENTIONS.md) - Import rules
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Last Updated:** November 30, 2025

**Quick Commands Cheat Sheet:**
```bash
./dev.sh check              # Full validation before building
./dev.sh clean              # Clear cache (try this first!)
./dev.sh clean:deep         # Deep clean everything
./dev.sh reset              # Start completely fresh
npm run type-check          # TypeScript diagnostics
npm run lint --fix          # Fix lint errors
./scripts/validate-module-deps.sh  # Check module dependencies
bazel clean --expunge       # Nuclear option for Bazel
```
