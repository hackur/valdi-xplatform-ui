---
description: Quickly analyze and fix a specific error or issue
---

Analyze and fix a specific TypeScript/Valdi error:

## Quick Fix Process

### 1. Error Analysis

Provide the error:
- Full error message and error code
- Stack trace
- File and line number
- What you were doing when error occurred

### 2. Immediate Investigation

I will:
- Read the failing file at the specified line
- Check surrounding context
- Look for obvious issues
- Search for similar patterns in codebase

### 3. Common TypeScript/Valdi Issues

| Category | Common Problems |
|----------|-----------------|
| **Type Safety** | Missing explicit types, use of 'any', non-null assertions (!), missing return types |
| **Promises** | Floating promises, missing await, promise in conditional |
| **Imports** | Wrong import style, missing 'import type', unused imports, duplicate imports |
| **Lifecycle** | Missing 'override' keyword, not unsubscribing in onDestroy(), memory leaks |
| **Component** | Missing navigationController prop, wrong element names (uppercase), missing styles |
| **Path Aliases** | Invalid paths, missing @ prefix, wrong alias reference, circular imports |
| **ES2015 Constraints** | Using ES2017+ features (Promise.allSettled, Object.entries, optional chaining) |
| **Style Properties** | Invalid CSS properties for Valdi, wrong type for style value, missing Style wrapper |
| **ESLint** | Naming convention violations, console.log in code, non-exhaustive switch, unused variables |
| **Testing** | Missing test setup, incorrect assertions, uninitialized mocks |

### 4. Root Cause Identification

Determine:
- What caused the error?
- Why did it happen?
- Is it a code bug, type error, or environment issue?
- Are there related issues in similar code?

### 5. Fix Implementation

- Provide exact fix needed
- Show before/after code
- Explain why fix works
- Check for similar issues elsewhere

### 6. Verification

- What tests to run?
- How to manually verify the fix?
- What to watch for in edge cases?

### 7. Prevention

- How to prevent this in future?
- What pattern or guide to follow?
- Reference relevant guide: lint-prevention.md, es2015-guide.md, or valdi-patterns.md

Provide immediate fix and clear explanation.
