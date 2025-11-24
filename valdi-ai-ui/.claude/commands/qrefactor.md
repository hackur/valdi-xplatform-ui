---
description: Quick refactor following SOLID/DRY/KISS
---

## Usage
`/qrefactor <FILE_OR_CODE_DESCRIPTION>`

## Context
- Target: $ARGUMENTS
- Use @file to reference specific code
- Reference guides: lint-prevention.md, es2015-guide.md, valdi-patterns.md

## Coordinator Role
Refactor coordinator with:
1. **Analyzer** - finds code smells and violations
2. **Designer** - proposes SOLID/DRY/KISS improvements
3. **Implementer** - shows refactored code

## Process
1. Analyze current code and measure metrics
2. Identify violations: SOLID, DRY, KISS, TypeScript best practices
3. Design improvement with justification
4. Show refactored code with before/after comparison

## Output Format
- **Issues**: Code smells and violations found
- **Design**: Refactoring approach and pattern selection
- **Code**: Refactored implementation ready to use
- **Impact**: Files changed, benefits gained, metrics improved
