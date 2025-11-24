# Pre-Commit Hooks - Quick Start Guide

## Installation

```bash
npm install
```

That's it! The hooks are automatically installed via the `prepare` script.

## What Happens When You Commit

When you run `git commit`, the pre-commit hook automatically:

1. Checks for TODO/FIXME comments (warning)
2. Fixes formatting with Prettier
3. Fixes linting with ESLint
4. Checks TypeScript types

If type checking fails, the commit is blocked. Otherwise, it goes through.

## Common Scenarios

### Scenario 1: Making a Normal Commit

```bash
git add .
git commit -m "Fix button styling"

# Output:
# Running pre-commit hooks...
# Checking for TODO/FIXME comments...
# Running Prettier...
# Running ESLint on TypeScript files...
# Running TypeScript type checking...
# All pre-commit checks passed!
```

### Scenario 2: Type Error Blocks Commit

```bash
# You accidentally added: let x: string = 123;
git commit -m "Add feature"

# Output:
# ...TypeScript type checking...
# error TS2322: Type 'number' is not assignable to type 'string'.
# TypeScript type checking failed!
```

Fix the error and commit again.

### Scenario 3: Prettier Fixes Your Code

```bash
# You committed with non-standard formatting
git add src/component.ts
git commit -m "Add component"

# Output:
# Running Prettier...
# Fixed formatting automatically
# Added files to staging
# All checks passed!
```

### Scenario 4: TODO Comment Reminder

```bash
# You added: // TODO: Fix this later
git commit -m "Add temporary code"

# Output:
# Checking for TODO/FIXME comments...
# ⚠️ Found TODO/FIXME in src/file.ts
# Warning: Please review TODO/FIXME comments before committing
# (But commit still goes through)
```

## Quick Commands

```bash
# Format all code
npm run format

# Fix linting errors
npm run lint:fix

# Check types
npm run type-check

# Run all quality checks
npm run validate

# Skip hooks (emergency only)
git commit --no-verify
```

## Troubleshooting

### "hooks not running"
```bash
npm install
```

### "command not found"
```bash
npm install
```

### "TypeScript checking is slow"
This is normal. Use `--skipLibCheck` optimization is enabled.

## Need More Details?

See `.husky/README.md` for comprehensive documentation.
