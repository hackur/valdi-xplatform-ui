---
description: Quick fix for errors or issues
---

## Usage
`/qfix <ERROR_OR_ISSUE>`

## Context
- Issue: $ARGUMENTS
- Use @file syntax to reference specific files

## Coordinator Role
Debug coordinator analyzing:
1. **Analyzer** - identifies root cause of error
2. **Fixer** - provides concrete solution
3. **Validator** - suggests verification approach

## Process
1. Read error context
2. Identify root cause
3. Provide immediate fix with before/after code
4. Suggest verification steps

## Output Format
- **Root Cause**: One-line explanation
- **Fix**: Code or command to execute
- **Verify**: Test or manual verification steps
- **Prevent**: Reference to lint-prevention.md, es2015-guide.md, or valdi-patterns.md
