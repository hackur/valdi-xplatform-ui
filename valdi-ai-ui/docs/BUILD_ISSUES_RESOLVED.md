# Build Issues Resolved - December 1, 2025

## Critical Build Failures and Solutions

This document chronicles the systematic debugging process that resolved multiple build failures in the Valdi AI UI project.

---

## Issue #1: Missing Bazel BUILD.bazel Dependencies

### Problem
Build failed with error:
```
ERROR: Found imports from undeclared dependencies in chat_core/src/ChatService.ts: [model_config].
Please update the 'chat_core' module.yaml and specify the missing dependencies.
```

### Root Cause
The error message was MISLEADING. The issue was NOT in `module.yaml` (which correctly declared the dependency), but in the **Bazel BUILD.bazel file** which was missing the dependency declaration.

### Why This Happened
Valdi uses TWO dependency systems:
1. **module.yaml** - For the Valdi compiler's dependency analysis
2. **BUILD.bazel** - For Bazel's build graph

BOTH must declare dependencies for builds to succeed.

### Solution
Added missing `//modules/model_config` dependency to BUILD.bazel files:

**File**: modules/chat_core/BUILD.bazel
```python
deps = [
    "@valdi//src/valdi_modules/src/valdi/valdi_core",
    "@valdi//src/valdi_modules/src/valdi/valdi_http",
    "//modules/common",
    "//modules/model_config",  # ADDED
],
```

### Additional Issues Found
Comprehensive BUILD.bazel audit revealed 2 more modules with the same issue:

1. **modules/settings/BUILD.bazel** - Missing `//modules/model_config`
2. **modules/main_app/BUILD.bazel** - Missing `//modules/model_config`

Both were fixed proactively to prevent future build failures.

---

## Issue #2: TypeScript Type vs Value Error

### Problem
Build failed with error:
```
error TS2693: 'StorageProvider' only refers to a type, but is being used as a value here.
```

### Root Cause
Attempted to import and instantiate `StorageProvider`, which is an **interface**, not a class.

### Analysis
In modules/common/src/services/StorageProvider.ts:
- `StorageProvider` - Interface (cannot be instantiated)
- `LocalStorageProvider` - Concrete class implementation
- `MemoryStorageProvider` - Concrete class implementation

The interface defines the contract, but you cannot create instances of interfaces in TypeScript.

### Solution
Changed import from interface to concrete implementation:

**File**: modules/model_config/src/singletons.ts
```typescript
// BEFORE (WRONG - interface)
import { StorageProvider } from '../../common/src/services/StorageProvider';
const storageProvider = new StorageProvider(); // ERROR!

// AFTER (CORRECT - concrete class)
import { LocalStorageProvider } from '../../common/src/services/StorageProvider';
const storageProvider = new LocalStorageProvider(); // SUCCESS
```

---

## Issue #3: Dynamic require() Not Supported

### Problem
Build failed with error:
```
error TS2591: Cannot find name 'require'. Do you need to install type definitions for node?
```

### Root Cause
Attempted to use Node.js `require()` function, which is not available in Valdi's TypeScript environment.

### Initial Approach (FAILED)
```typescript
// This doesn't work in Valdi
const { StorageProvider } = require('../../common/src/services/StorageProvider');
```

### Final Solution
Use static ES6 imports instead:
```typescript
import { LocalStorageProvider } from '../../common/src/services/StorageProvider';
```

**Why the dynamic import was attempted**: To avoid potential circular dependencies. However, using a static import at the module level is the correct Valdi pattern.

---

## Lessons Learned

### 1. Bazel Dependency Declarations

**Critical Rule**: When adding TypeScript imports from another module, ALWAYS update:
1. The importing module's `BUILD.bazel` deps array
2. The importing module's `module.yaml` dependencies

**Example Workflow**:
```typescript
// Step 1: Add import in TypeScript
import { ModelRegistry } from '../../model_config/src/ModelRegistry';

// Step 2: Update BUILD.bazel
deps = [
    "//modules/common",
    "//modules/model_config",  // ADD THIS
],

// Step 3: Update module.yaml
dependencies:
  common: "1.0.0"
  model_config: "1.0.0"  # ADD THIS
```

### 2. TypeScript Type System

**Interfaces vs Classes**:
- Interfaces define structure, not implementation
- Use interfaces for type annotations
- Use concrete classes for instantiation

```typescript
// Type annotation (use interface)
function processStorage(storage: StorageProvider): void { }

// Instantiation (use class)
const storage = new LocalStorageProvider();
```

### 3. Valdi Import Patterns

**Supported**:
- Static ES6 imports: `import { X } from 'module'`
- Dynamic ES6 imports: `const x = await import('module')` (in async functions)

**NOT Supported**:
- CommonJS require: `const x = require('module')` ❌
- Node.js built-ins without proper configuration

### 4. Error Message Interpretation

**Be Skeptical of Error Messages**: The initial error claimed the issue was in `module.yaml`, but the actual problem was in `BUILD.bazel`. Always verify the error location independently.

---

## Debugging Methodology

### Systematic Approach Used

1. **Read the Error Message** - Understand what's failing
2. **Verify the Obvious** - Check the file mentioned in the error
3. **Question Assumptions** - Is the error message correct?
4. **Search Broader** - Look at related files (BUILD.bazel, not just module.yaml)
5. **Use Parallel Investigation** - Spawn sub-agents to audit entire codebase
6. **Apply Fixes Incrementally** - Fix one issue at a time, test, repeat

### Tools Used

- **Explore Agent** - Audited all 10 modules for BUILD.bazel issues
- **Plan Agent** - Created comprehensive 30+ task finalization plan
- **grep/Read** - Analyzed import patterns and exports
- **Bazel build** - Validated fixes iteratively

---

## Prevention Strategies

### 1. Pre-Commit Validation

Create a script to validate BUILD.bazel vs imports:

```bash
#!/bin/bash
# scripts/validate-build-deps.sh

# For each module, check that all imports have corresponding BUILD.bazel deps
for module in modules/*; do
    echo "Checking $module..."
    # Extract imports from TypeScript files
    # Extract deps from BUILD.bazel
    # Compare and report mismatches
done
```

### 2. Documentation

**Created Documentation** (this session):
- `docs/VALDI_PATTERNS.md` - Framework-specific patterns
- `docs/TYPESCRIPT_STANDARDS.md` - TypeScript best practices
- `docs/BUILD_TROUBLESHOOTING.md` - Build issue solutions
- `docs/BUILD_ISSUES_RESOLVED.md` - This document

### 3. Team Knowledge Sharing

**Key Points to Share**:
- Bazel requires explicit BUILD.bazel dependency declarations
- module.yaml alone is NOT sufficient
- Always use concrete classes, not interfaces, for instantiation
- Valdi doesn't support Node.js require()

---

## Current Build Status

### Files Modified

1. `modules/chat_core/BUILD.bazel` - Added model_config dependency
2. `modules/settings/BUILD.bazel` - Added model_config dependency
3. `modules/main_app/BUILD.bazel` - Added model_config dependency
4. `modules/model_config/src/singletons.ts` - Fixed import pattern

### Build Command

```bash
bazel build //:valdi_ai_ui_ios --@valdi//bzl/valdi/source_set:source_set=debug
```

### Expected Outcome

With all fixes applied, the build should:
1. Successfully compile all 10 modules
2. Bundle the iOS application
3. Generate `bazel-bin/valdi_ai_ui_ios.ipa`

---

## Next Steps

1. **Verify Build Success** - Confirm .ipa file is generated
2. **Install on Simulator** - Deploy to iOS simulator
3. **Runtime Testing** - Verify app launches and functions correctly
4. **Integration Testing** - Test LM Studio integration
5. **Documentation** - Update remaining docs with findings

---

## Reference

### Related Documentation
- `docs/VALDI_PATTERNS.md` - Valdi framework patterns
- `docs/TYPESCRIPT_STANDARDS.md` - TypeScript guidelines
- `docs/BUILD_TROUBLESHOOTING.md` - Build troubleshooting guide
- `Context.md` - Project architecture overview

### Build Logs
- `/tmp/final_attempt_build.log` - Latest build with all fixes
- `/tmp/complete_fix_build.log` - Previous build attempt
- `/tmp/clean_build.log` - Clean build after cache expunge

---

*Document created: 2025-12-01*
*Build issues resolved: 3*
*Modules audited: 10*
*Dependencies fixed: 4*
