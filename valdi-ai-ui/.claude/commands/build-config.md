# Bazel BUILD Configuration for Valdi

This command provides comprehensive guidance on configuring BUILD.bazel files for Valdi modules, including proper use of `valdi_module()`, glob patterns, test exclusion, and dependency management.

## Table of Contents
1. [Basic Structure](#basic-structure)
2. [valdi_module() Function](#valdi_module-function)
3. [Glob Patterns](#glob-patterns)
4. [Test File Exclusion](#test-file-exclusion)
5. [Dependency Management](#dependency-management)
6. [Module Visibility](#module-visibility)
7. [Common Patterns](#common-patterns)

## Basic Structure

Every Valdi module requires a `BUILD.bazel` file that defines how to build and package the module:

```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "module_name",
    srcs = glob([
        "src/**/*.ts",
        "src/**/*.tsx",
    ]),
    visibility = ["//visibility:public"],
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "//apps/valdi_ai_ui/modules/common",
    ],
)
```

## valdi_module() Function

### Purpose
`valdi_module()` is the primary build rule for Valdi TypeScript modules. It compiles TypeScript to native code for iOS/Android.

### Required Parameters

#### name
The name of the module (used for dependencies and target references):
```python
valdi_module(
    name = "chat_core",  # Module name
    # ...
)
```

Referenced in other BUILD files as:
```python
deps = ["//apps/valdi_ai_ui/modules/chat_core"]
```

#### srcs
Source files to include in the module. Use `glob()` to match patterns:
```python
valdi_module(
    name = "chat_core",
    srcs = glob([
        "src/**/*.ts",   # All TypeScript files
        "src/**/*.tsx",  # All TSX files
    ]),
    # ...
)
```

### Optional Parameters

#### visibility
Controls which other modules can depend on this module:
```python
# Public - any module can depend on this
visibility = ["//visibility:public"]

# Private - only current package can use
visibility = ["//visibility:private"]

# Specific packages only
visibility = [
    "//apps/valdi_ai_ui/modules/chat_ui:__pkg__",
    "//apps/valdi_ai_ui/modules/main_app:__pkg__",
]
```

#### deps
List of dependencies this module requires:
```python
deps = [
    # Valdi core modules (from vendor)
    "@valdi//src/valdi_modules/src/valdi/valdi_core",
    "@valdi//src/valdi_modules/src/valdi/valdi_http",
    "@valdi//src/valdi_modules/src/valdi/valdi_tsx",

    # Project modules
    "//apps/valdi_ai_ui/modules/common",
    "//apps/valdi_ai_ui/modules/chat_core",
]
```

## Glob Patterns

### Basic Usage

`glob()` matches files using wildcard patterns:

```python
# Match all TypeScript files in src/
glob(["src/*.ts"])

# Match all files recursively
glob(["src/**/*.ts"])

# Match multiple patterns
glob([
    "src/**/*.ts",
    "src/**/*.tsx",
])
```

### Wildcard Syntax

- `*` - Matches any characters within a single directory level
- `**` - Matches any number of directory levels
- `?` - Matches any single character
- `[abc]` - Matches any character in the brackets

Examples:
```python
"src/*.ts"           # Only .ts files directly in src/
"src/**/*.ts"        # All .ts files in src/ and subdirectories
"src/**/test*.ts"    # All test*.ts files anywhere under src/
"src/[abc]*.ts"      # Files starting with a, b, or c in src/
```

### Common Pitfall: Including All Files

```python
# [FAIL] WRONG - Includes test files, breaking compilation
valdi_module(
    name = "chat_core",
    srcs = glob(["src/**/*.ts"]),
    # ...
)

# [PASS] CORRECT - Explicitly excludes test files
valdi_module(
    name = "chat_core",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = [
            "**/__tests__/**",
            "**/*.test.ts",
            "**/*.spec.ts",
        ],
    ),
    # ...
)
```

## Test File Exclusion

### Why Exclude Tests?

**Critical:** Test files MUST be excluded from production builds because:
1. They use Jest globals (`describe`, `it`, `expect`) not available in Valdi
2. They import test-specific modules like `@testing-library/jest-dom`
3. Valdi compiles to native code - no Jest runtime exists

### Standard Exclusion Pattern

```python
valdi_module(
    name = "chat_core",
    srcs = glob(
        ["src/**/*.ts", "src/**/*.tsx"],
        exclude = [
            # Exclude test directories
            "**/__tests__/**",

            # Exclude test files by naming convention
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
        ],
    ),
    # ...
)
```

### Excluding Specific Files

Sometimes you need to exclude specific files beyond tests:

```python
valdi_module(
    name = "chat_core",
    srcs = glob(
        ["src/**/*.ts", "src/**/*.tsx"],
        exclude = [
            # Standard test exclusions
            "**/__tests__/**",
            "**/*.test.ts",
            "**/*.spec.ts",

            # Files with uncompilable dependencies
            "src/ToolDefinitions.ts",        # Uses external library
            "src/workflows/test-utils.ts",   # Test utility functions
            "src/experimental/*.ts",          # Experimental code
        ],
    ),
    # ...
)
```

### What Happens Without Exclusion?

```
Error: Cannot find name 'describe'
Error: Cannot find name 'it'
Error: Cannot find name 'expect'
Error: Cannot find module 'jest' or its corresponding type declarations
```

These errors occur because Bazel tries to compile test files as production code.

## Dependency Management

### Valdi Core Modules

Reference Valdi's built-in modules from the vendor directory:

```python
deps = [
    # Core framework
    "@valdi//src/valdi_modules/src/valdi/valdi_core",

    # UI components
    "@valdi//src/valdi_modules/src/valdi/valdi_tsx",

    # HTTP client
    "@valdi//src/valdi_modules/src/valdi/valdi_http",

    # Navigation
    "@valdi//src/valdi_modules/src/valdi/valdi_navigation",

    # RxJS reactive extensions
    "@valdi//src/valdi_modules/src/valdi/valdi_rxjs",
]
```

### Project Modules

Reference other modules in your project:

```python
deps = [
    # Absolute path from workspace root
    "//apps/valdi_ai_ui/modules/common",
    "//apps/valdi_ai_ui/modules/chat_core",
    "//apps/valdi_ai_ui/modules/chat_ui",
]
```

### Dependency Resolution

Module paths in code must match BUILD.bazel structure:

```typescript
// In chat_ui/src/ChatScreen.ts

// [FAIL] WRONG - path aliases don't work in production
import { Message } from '@common';

// [PASS] CORRECT - full module path matching deps
import { Message } from 'common/src/types';

// [PASS] CORRECT - import from dependency
import { ChatService } from 'chat_core/src/ChatService';
```

BUILD.bazel dependency:
```python
deps = [
    "//apps/valdi_ai_ui/modules/common",      # Enables: 'common/src/*'
    "//apps/valdi_ai_ui/modules/chat_core",   # Enables: 'chat_core/src/*'
]
```

### Circular Dependencies

Avoid circular dependencies between modules:

```python
# [FAIL] WRONG - circular dependency
# Module A depends on B
deps = ["//modules/B"]

# Module B depends on A
deps = ["//modules/A"]

# [PASS] CORRECT - extract shared code to new module
# Module A depends on Common
deps = ["//modules/common"]

# Module B depends on Common
deps = ["//modules/common"]

# Common has no dependencies on A or B
```

### Minimal Dependencies

Only include necessary dependencies:

```python
# [FAIL] WRONG - includes unused dependencies
deps = [
    "@valdi//src/valdi_modules/src/valdi/valdi_core",
    "@valdi//src/valdi_modules/src/valdi/valdi_http",
    "@valdi//src/valdi_modules/src/valdi/valdi_navigation",  # Not used!
    "//apps/valdi_ai_ui/modules/common",
    "//apps/valdi_ai_ui/modules/settings",  # Not imported!
]

# [PASS] CORRECT - only required dependencies
deps = [
    "@valdi//src/valdi_modules/src/valdi/valdi_core",
    "@valdi//src/valdi_modules/src/valdi/valdi_http",
    "//apps/valdi_ai_ui/modules/common",
]
```

## Module Visibility

### Public Modules

Most modules should be public for flexibility:

```python
valdi_module(
    name = "common",
    srcs = glob(["src/**/*.ts"]),
    visibility = ["//visibility:public"],  # Any module can depend on this
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
    ],
)
```

Use public visibility for:
- Shared utilities (`common`)
- Core business logic (`chat_core`)
- Reusable UI components (`chat_ui`)

### Private Modules

Use private visibility for internal implementation details:

```python
valdi_module(
    name = "internal_utils",
    srcs = glob(["src/**/*.ts"]),
    visibility = ["//visibility:private"],  # Only current package
    deps = [],
)
```

### Package-Specific Visibility

Restrict to specific packages:

```python
valdi_module(
    name = "chat_internal",
    srcs = glob(["src/**/*.ts"]),
    visibility = [
        "//apps/valdi_ai_ui/modules/chat_ui:__pkg__",
        "//apps/valdi_ai_ui/modules/chat_core:__pkg__",
    ],
    deps = ["//apps/valdi_ai_ui/modules/common"],
)
```

## Common Patterns

### Pattern 1: Simple Module (No Tests)

Minimal module with no test files:

```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "common",
    srcs = glob([
        "src/**/*.ts",
        "src/**/*.tsx",
    ]),
    visibility = ["//visibility:public"],
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_tsx",
    ],
)
```

### Pattern 2: Module with Tests

Module with comprehensive test exclusions:

```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "chat_core",
    srcs = glob(
        [
            "src/**/*.ts",
            "src/**/*.tsx",
        ],
        exclude = [
            # Test directories
            "**/__tests__/**",

            # Test files
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",

            # Test utilities
            "src/test-utils.ts",
            "src/**/test-helpers.ts",
        ],
    ),
    visibility = ["//visibility:public"],
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_http",
        "//apps/valdi_ai_ui/modules/common",
    ],
)
```

### Pattern 3: UI Module with Navigation

UI module with navigation and multiple dependencies:

```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "chat_ui",
    srcs = glob(
        [
            "src/**/*.ts",
            "src/**/*.tsx",
        ],
        exclude = [
            "**/__tests__/**",
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
        ],
    ),
    visibility = ["//visibility:public"],
    deps = [
        # Valdi core
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_tsx",
        "@valdi//src/valdi_modules/src/valdi/valdi_navigation",

        # Project modules
        "//apps/valdi_ai_ui/modules/common",
        "//apps/valdi_ai_ui/modules/chat_core",
    ],
)
```

### Pattern 4: Main App Module

Entry point module that depends on all feature modules:

```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "main_app",
    srcs = glob(
        [
            "src/**/*.ts",
            "src/**/*.tsx",
        ],
        exclude = [
            "**/__tests__/**",
            "**/*.test.ts",
            "**/*.spec.ts",
        ],
    ),
    visibility = ["//visibility:public"],
    deps = [
        # Valdi core
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_tsx",
        "@valdi//src/valdi_modules/src/valdi/valdi_navigation",

        # All feature modules
        "//apps/valdi_ai_ui/modules/common",
        "//apps/valdi_ai_ui/modules/chat_ui",
        "//apps/valdi_ai_ui/modules/settings",
        "//apps/valdi_ai_ui/modules/tools_demo",
        "//apps/valdi_ai_ui/modules/workflow_demo",
    ],
)
```

## Verification Checklist

Before committing BUILD.bazel changes:

- [ ] Test files excluded with glob `exclude` parameter
- [ ] All source files included (`.ts` and `.tsx`)
- [ ] All imported modules listed in `deps`
- [ ] No circular dependencies
- [ ] Appropriate visibility setting
- [ ] Module name matches directory name
- [ ] Valdi modules use `@valdi//` prefix
- [ ] Project modules use `//apps/valdi_ai_ui/modules/` prefix

## Troubleshooting

### Error: "Cannot find name 'describe'"
**Cause:** Test file not excluded from BUILD.bazel
**Fix:** Add test patterns to `exclude` parameter

### Error: "Cannot find module 'common/src/types'"
**Cause:** Missing dependency in BUILD.bazel
**Fix:** Add `"//apps/valdi_ai_ui/modules/common"` to `deps`

### Error: "Circular dependency detected"
**Cause:** Two modules depend on each other
**Fix:** Extract shared code to a third module

### Error: "Target not found"
**Cause:** Incorrect dependency path
**Fix:** Verify path from workspace root: `//apps/valdi_ai_ui/modules/module_name`

### No matching files for glob pattern
**Cause:** Incorrect glob pattern or path
**Fix:** Verify file locations and adjust pattern

## Reference Examples

Complete BUILD.bazel examples from the project:

### chat_core Module
Location: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/modules/chat_core/BUILD.bazel`
```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "chat_core",
    srcs = glob(
        [
            "src/**/*.ts",
            "src/**/*.tsx",
        ],
        exclude = [
            "**/__tests__/**",
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "src/ToolDefinitions.ts",
            "src/ToolExecutor.ts",
            "src/ToolDefinitions.test.example.ts",
            "src/workflows/test-utils.ts",
        ],
    ),
    visibility = ["//visibility:public"],
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_http",
        "//apps/valdi_ai_ui/modules/common",
    ],
)
```

### common Module
Location: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/modules/common/BUILD.bazel`
```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "common",
    srcs = glob([
        "src/**/*.ts",
        "src/**/*.tsx",
    ]),
    visibility = ["//visibility:public"],
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_tsx",
    ],
)
```

## Additional Resources

- Valdi lessons learned: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/VALDI_LESSONS_LEARNED.md`
- Bazel documentation: https://bazel.build/
- Example BUILD files: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/modules/*/BUILD.bazel`
