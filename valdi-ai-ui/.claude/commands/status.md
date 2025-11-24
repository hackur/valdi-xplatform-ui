# Check Project Status

View the current project status, including git state, build health, and task progress.

## Git Status
```bash
git status
```

## Recent Commits
```bash
git log --oneline -10
```

## TypeScript Health
```bash
npm run type-check 2>&1 | tail -20
```

Count TypeScript errors:
```bash
npm run type-check 2>&1 | grep "error TS" | wc -l
```

## Test Status
```bash
npm test -- --passWithNoTests
```

## Build Status
```bash
bazel build //:valdi_ai_ui 2>&1 | tail -20
```

## Module Status
List all modules:
```bash
ls -la modules/
```

Check module dependencies:
```bash
cat modules/*/module.yaml
```

## Quick Health Check
```bash
echo "=== TypeScript Errors ===" && \
npm run type-check 2>&1 | grep "error TS" | wc -l && \
echo "=== Test Files ===" && \
find modules -name "*.test.ts" -o -name "*.test.tsx" | wc -l && \
echo "=== Source Files ===" && \
find modules -name "*.ts" -o -name "*.tsx" | grep -v test | wc -l
```
