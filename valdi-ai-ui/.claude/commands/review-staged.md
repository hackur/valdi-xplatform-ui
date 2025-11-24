---
description: Comprehensive review of all staged git changes
---

Perform a comprehensive review of all staged changes and provide:

## Review Checklist

### 1. Git Status

- Run `git status` to see all staged files
- Run `git diff --staged --stat` for change summary
- List all modified, added, and deleted files

### 2. Code Quality Review

- Check for JSDoc/TSDoc comments on all new functions and methods
- Verify SOLID/DRY/KISS principles applied
- Look for code duplication across files
- Check inline comments for complex logic

### 3. TypeScript/Valdi Standards Compliance

| Standard | Check |
|----------|-------|
| Type Safety | All functions have proper TS type annotations |
| Import/Export | Verify correct relative and absolute imports |
| Component Structure | Components follow Valdi patterns |
| Store Usage | Proper reactive state management with stores |
| Naming Conventions | Reference path-conventions.md |
| ESLint Rules | All files pass ESLint validation |

### 4. Documentation Review

- Ensure code changes have corresponding JSDoc updates
- Check .claude/commands/PATTERNS.md if architecture changes made
- Verify README updates for public API changes
- Validate inline documentation accuracy
- Check for outdated comments that contradict code

### 5. Breaking Changes Check

| Category | Checks |
|----------|--------|
| Type Changes | Type signature modifications affecting consumers |
| API Changes | New parameters, removed parameters, signature changes |
| Component Props | Breaking changes to component interfaces |
| Store Structure | Changes to reactive state shape |
| Dependencies | New dependencies or version constraints |

### 6. Testing Verification

- List affected test files (.test.ts, .spec.ts)
- Identify tests that should be updated
- Check for new test coverage needs
- Verify component snapshot tests updated if needed

### 7. Valdi Pattern Compliance

Reference: valdi-patterns.md

- View model integration and lifecycle hooks
- Component composition and modularity
- Store patterns and reactive state
- Error handling and validation patterns
- API integration and data fetching

### 8. Lint and Validation

Reference: lint-prevention.md, style-patterns.md

- Run ESLint on staged files
- Check TypeScript compilation errors
- Verify no console.log or debug code remains
- Check for proper error handling

### 9. File Organization

- Files have appropriate .ts or .tsx extensions
- Imports use correct paths (relative/absolute)
- Module structure follows conventions
- No circular dependencies

### 10. Commit Readiness

- Summarize total changes (files, lines modified)
- Flag any concerns or missing pieces
- List action items if changes are incomplete

Provide a final "Ready to Commit" status with action items if not ready.
