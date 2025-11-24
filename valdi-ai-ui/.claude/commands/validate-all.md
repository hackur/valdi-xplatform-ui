# Validate All Command

Run comprehensive validation suite across the entire codebase.

## Task

Execute all validation checks in sequence and provide a unified health report:

1. **TypeScript Type Check**
   - Run `npx tsc --noEmit`
   - Count and categorize errors

2. **ESLint Code Quality**
   - Run `npx eslint . --ext .ts,.tsx`
   - Count warnings and errors

3. **Unit Tests**
   - Run `npm test -- --coverage --passWithNoTests`
   - Check coverage percentages
   - Identify failing tests

4. **Dependency Audit**
   - Run `npm audit --json`
   - Check for security vulnerabilities

5. **Build Check**
   - Run `npm run build` or equivalent
   - Verify successful compilation

## Output Format

```
🏥 Project Health Report
========================

✅ PASSING | ⚠️  WARNINGS | ❌ FAILING

1. TypeScript: [status] - X errors
2. ESLint: [status] - Y warnings, Z errors
3. Tests: [status] - Pass: A/B, Coverage: C%
4. Security: [status] - High: D, Moderate: E
5. Build: [status]

📊 Overall Score: [score]/100

🎯 Critical Actions:
1. [Highest priority fix]
2. [Second priority]
3. [Third priority]

💡 Recommendations:
- [Suggestions for improvement]
```

Provide a clear, actionable summary that gives a complete picture of project health.
