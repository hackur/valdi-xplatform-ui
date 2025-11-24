# Validate Code Quality

Run all validation checks: type-checking, linting, and tests.

```bash
npm run validate
```

This command runs:
1. TypeScript type checking (`npm run type-check`)
2. ESLint linting (`npm run lint`)
3. Jest tests (`npm test`)

For individual checks:

Type checking only:
```bash
npm run type-check
```

Linting only:
```bash
npm run lint
```

Formatting check:
```bash
npm run format:check
```

Auto-format code:
```bash
npm run format
```
