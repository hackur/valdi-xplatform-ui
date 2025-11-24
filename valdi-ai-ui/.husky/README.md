# Pre-Commit Hooks Configuration

This directory contains Git pre-commit hooks that automatically run code quality checks before commits are made.

## What Hooks Run

### 1. **Prettier Formatting** (Automatic Fix)
- Runs on all staged files
- Automatically fixes formatting issues
- Respects the `.prettierrc` configuration
- Adds fixed files back to staging

### 2. **ESLint** (Automatic Fix)
- Runs on staged `.ts` and `.tsx` files only
- Automatically fixes fixable linting issues
- Respects the `.eslintrc.js` configuration
- Adds fixed files back to staging

### 3. **TypeScript Type Checking** (Blocking)
- Runs full type checking on the entire codebase
- **FAILS and blocks commit** if type errors are found
- Uses `--skipLibCheck` for faster type checking
- Non-blocking: you cannot commit if this fails

### 4. **TODO/FIXME Detection** (Warning Only)
- Scans staged files for `TODO:` or `FIXME:` comments
- Shows warnings but does NOT block commits
- Use this to remember to resolve before merging

## Installation

The hooks are automatically installed when you run `npm install` thanks to the `prepare` script in `package.json`.

If you need to manually set up the hooks:
```bash
npm run prepare
```

Or directly with husky:
```bash
npx husky install
```

## Hook Files

- `.husky/pre-commit` - Main pre-commit hook script that orchestrates all checks
- `.husky/_/husky.sh` - Husky framework script (do not edit)
- `.husky/_/.gitignore` - Gitignore for husky internals

## Configuration Files

- `.lintstagedrc.json` - Configuration for which commands run on which file types
- `.prettierrc` - Prettier formatting configuration
- `.eslintrc.js` - ESLint linting configuration
- `package.json` - Contains `lint-staged` and `prepare` script configuration

## Skipping Hooks (When Necessary)

If you absolutely need to skip pre-commit hooks:

```bash
git commit --no-verify
```

**Use with caution!** Skipping hooks should be rare and only in exceptional circumstances.

## Manual Checks

You can manually run the same checks anytime:

```bash
# Run prettier on all staged files
npm run format

# Run prettier and check (no fix)
npm run format:check

# Run ESLint on TypeScript files
npm run lint

# Run ESLint with fixes
npm run lint:fix

# Run type checking
npm run type-check

# Run lint-staged manually
npm run lint:staged
```

## Troubleshooting

### Hooks not running?
1. Ensure `.husky/pre-commit` is executable: `chmod +x .husky/pre-commit`
2. Verify husky is installed: `npm install`
3. Check that you're in the project root directory

### TypeScript type checking is too slow?
The hooks use `--skipLibCheck` which skips checking of node_modules type definitions. If you need full type checking:
- Edit `.husky/pre-commit` and remove the `--skipLibCheck` flag
- Consider running full validation in CI/CD instead

### Linting issues after commit?
If the auto-fix didn't catch everything:
1. Run `npm run lint:fix` manually
2. Review the changes
3. Stage and commit again

### Want to temporarily disable?
Remove the `.husky` directory to disable all hooks:
```bash
rm -rf .husky
```

To re-enable:
```bash
npm install
```

## Performance Notes

The pre-commit hooks are optimized for speed:
- ESLint runs **only on staged TypeScript files**, not the entire codebase
- Prettier runs on **staged files only**
- TypeScript checking uses `--skipLibCheck` for faster compilation
- Full builds are not run (no Bazel builds)

Typical hook execution time: **2-10 seconds** depending on the number of files changed.

## Further Reading

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
