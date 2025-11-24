---
description: Search for code patterns, terminology, or references across the project
---

Search comprehensively for code patterns, terminology, or references:

## Search Strategy

### 1. Pattern Identification

| Item | Description |
|------|-------------|
| What | Pattern, term, or reference to search |
| Where | Specific directories or entire project |
| File types | `.ts`, `.tsx`, `.json`, `.md`, etc. |

### 2. Multi-Tool Search Approach

**Use Grep for**:
- Code patterns in TypeScript/React
- Component/function references
- String literals and imports
- JSDoc tags and comments

**Use Glob for**:
- File name patterns (e.g., `**/*.tsx`)
- Directory structures
- Component organization

**Use Read for**:
- Examining specific files
- Verifying context
- Detailed analysis

### 3. Search Patterns to Check

**For Terminology Updates**:
- Old term (case-insensitive)
- Variations (plural, past tense)
- Comments and documentation
- Variable/function names
- String literals

**For Refactoring**:
- All usages of component/function
- Import statements
- Test references
- Documentation mentions

**For Deprecation**:
- Find all usage sites
- Check for replacement availability
- Identify migration path

### 4. Organized Results

Present findings grouped by:
- **Components**: TypeScript/React files (`.ts`, `.tsx`)
- **Documentation**: References in `.md` files
- **Tests**: Usage in test files (`.test.ts`, `.test.tsx`)
- **Configuration**: Config files (`.json`, `.config.ts`)
- **Styles**: CSS/styles (`.css`, `.scss`)

### 5. Impact Analysis

For each finding:
- File path and line number
- Context (surrounding code)
- Impact (critical, moderate, low)
- Suggested action

### 6. Summary Report

- Total matches found
- Files affected
- Breakdown by category
- Priority order for updates
- Estimated effort

## Reference

- See `docs/path-conventions.md` for file organization
- See `docs/valdi-patterns.md` for component patterns

Provide a comprehensive search report with specific line numbers and context.
