# Lint Command

Run ESLint code quality checks on the codebase.

## Task

1. Navigate to the valdi-ai-ui directory
2. Run `npx eslint . --ext .ts,.tsx --format=compact` to check all TypeScript files
3. If issues are found:
   - Count total warnings and errors
   - Group by rule type
   - Identify files with the most issues
   - Suggest auto-fixable issues
4. Output results in a clear, organized format

## Output Format

```
[STYLE] ESLint Code Quality Report
==============================

Errors: X | Warnings: Y
Files Checked: Z

🔴 Errors by Rule:
- rule-name: N files affected
  └─ Example: file.ts:line

[WARN]  Warnings by Rule:
- rule-name: M files affected

🔧 Auto-fixable: K issues
Run: npx eslint . --fix

[PASS] Next Steps:
- [Priority actions]
```

Keep the output actionable and focused on high-impact issues.
