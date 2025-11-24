# Type Check Command

Run comprehensive TypeScript type checking on the entire codebase.

## Task

1. Navigate to the valdi-ai-ui directory
2. Run `npx tsc --noEmit` to check all TypeScript files
3. If errors are found:
   - Count the total number of errors
   - Group errors by file and error type
   - Identify the most common error patterns
   - Provide a summary of critical errors that need immediate attention
4. Output results in a clear, organized format
5. If no errors, confirm the codebase is type-safe

## Output Format

```
📊 TypeScript Type Check Results
================================

Total Errors: X
Files with Errors: Y

🔴 Critical Errors (blocking):
- file.ts:line - error message

⚠️  Common Patterns:
- Pattern 1: N occurrences
- Pattern 2: M occurrences

✅ Next Steps:
- Priority fixes needed in: [files]
```

Keep the output concise and actionable.
