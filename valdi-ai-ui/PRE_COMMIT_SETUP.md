# Pre-Commit Hooks Setup - valdi-ai-ui

## Overview

This document summarizes the pre-commit hooks configuration that has been set up for the valdi-ai-ui project to ensure code quality and maintain consistent code standards.

## Files Created and Modified

### New Files Created

1. **`.husky/pre-commit`** - Main pre-commit hook script
   - Executable shell script that runs all quality checks
   - Returns error code 1 if type checking fails (blocking)
   - Auto-fixes Prettier and ESLint issues

2. **`.husky/README.md`** - Comprehensive hook documentation
   - Explains what each hook does
   - Provides troubleshooting guide
   - Shows manual check commands

3. **`.husky/_/husky.sh`** - Husky framework helper script
   - Provides hook environment setup
   - Do not modify directly

4. **`.husky/_/.gitignore`** - Gitignore for husky internals
   - Prevents node_modules from husky from being committed

5. **`.lintstagedrc.json`** - Lint-staged configuration
   - Defines which linting tools run on specific file types
   - Alternative to inline configuration in package.json

### Modified Files

1. **`package.json`**
   - Added `"prepare": "husky install"` script
   - Added `"lint:staged": "lint-staged"` script
   - Added `husky` (v9.1.5) to devDependencies
   - Added `lint-staged` (v15.2.10) to devDependencies
   - Added `lint-staged` configuration object

## What Each Hook Does

### 1. Prettier Formatting (Auto-Fix)
```
Runs on: All staged files
Action: Automatically fixes formatting
Files affected: *.ts, *.tsx, *.json, *.md, *.yaml, *.yml
Blocks commit: No (auto-fixes)
```

### 2. ESLint Linting (Auto-Fix)
```
Runs on: Staged TypeScript files only
Action: Automatically fixes fixable linting errors
Files affected: *.ts, *.tsx
Blocks commit: No (auto-fixes)
```

### 3. TypeScript Type Checking
```
Runs on: All files in codebase
Action: Checks for TypeScript type errors
Blocks commit: YES (fails if errors found)
Performance: Uses --skipLibCheck for speed (~2-10s)
```

### 4. TODO/FIXME Detection
```
Runs on: All staged files
Checks for: TODO: or FIXME: comments
Blocks commit: No (warning only)
Purpose: Reminds developers to resolve before merging
```

## How to Use

### Automatic Setup (After npm install)

The hooks are automatically installed via the `prepare` script:
```bash
npm install
```

### Manual Setup

If needed, manually install hooks:
```bash
npm run prepare
# or
npx husky install
```

### Making a Commit

Simply commit normally - hooks will run automatically:
```bash
git add .
git commit -m "Your commit message"
```

The pre-commit hook will:
1. Check for TODO/FIXME comments
2. Run Prettier (auto-fix)
3. Run ESLint (auto-fix)
4. Run TypeScript type checking
5. If all checks pass, commit goes through
6. If type checking fails, commit is blocked

### Running Checks Manually

```bash
# Format code with Prettier
npm run format

# Check formatting without fixing
npm run format:check

# Lint code with ESLint
npm run lint

# Fix linting errors
npm run lint:fix

# Type check entire codebase
npm run type-check

# Watch mode for type checking
npm run type-check:watch

# Run lint-staged manually
npm run lint:staged
```

### Skipping Hooks (Emergency Only)

Use only when absolutely necessary:
```bash
git commit --no-verify
```

## Hook Behavior Details

### Prettier Formatting
- Formats all staged files matching the configured patterns
- Uses `.prettierrc` configuration
- Auto-stages fixed files
- Non-blocking: does not prevent commits

### ESLint Linting
- Runs only on staged `.ts` and `.tsx` files
- Uses `.eslintrc.js` configuration
- Fixes all automatically fixable issues
- Auto-stages fixed files
- Non-blocking: does not prevent commits

### TypeScript Type Checking
- Runs against entire codebase using `tsc --noEmit --skipLibCheck`
- Checks for type errors throughout the project
- Blocks commit if type errors are found
- Uses `--skipLibCheck` to improve performance by skipping node_modules type checking

### TODO/FIXME Detection
- Scans staged files for `TODO:` or `FIXME:` comments
- Displays warning with file names
- Does not block commits
- Helps catch temporary code that needs resolution

## Performance

Typical pre-commit hook execution time: **2-10 seconds**

Factors affecting speed:
- Number of staged files
- Project size (TypeScript checking)
- System performance

The hooks are optimized for speed:
- Only relevant files are linted (not entire codebase)
- Type checking uses `--skipLibCheck` for faster compilation
- No full builds are run

## Configuration Details

### .prettierrc
- `semi`: true
- `singleQuote`: true
- `trailingComma`: all
- `printWidth`: 80
- `tabWidth`: 2
- See `.prettierrc` for complete configuration

### .eslintrc.js
- Configured for TypeScript
- Strict type checking rules
- Includes 2025 best practices
- Jest test overrides
- See `.eslintrc.js` for complete configuration

### tsconfig.json
- Used by both TypeScript compiler and ESLint parser
- Configured for Node environment
- Module resolution for ES modules

## Troubleshooting

### Hooks not running?
1. Verify `.husky/pre-commit` is executable: `chmod +x .husky/pre-commit`
2. Run `npm install` to install all dependencies
3. Ensure you're in the project root directory

### Getting "command not found" errors?
- Run `npm install` to ensure all dev dependencies are installed
- Check that `node_modules/.bin` is in your PATH

### Type checking is too slow?
- The hook uses `--skipLibCheck` by default for speed
- For full type checking, run `npm run type-check` manually before committing
- In CI/CD, full validation runs with `npm run validate`

### Prettier/ESLint not fixing issues?
- Some issues cannot be auto-fixed
- Run `npm run lint:fix` and `npm run format` manually
- Review and fix remaining issues manually
- Commit the changes

### Need to disable hooks temporarily?
Remove `.husky` directory:
```bash
rm -rf .husky
```

To re-enable:
```bash
npm install
```

## Next Steps

1. Run `npm install` to install husky and lint-staged
2. Make a test commit to verify hooks are working
3. Review the output and follow any suggestions
4. Commit regularly - the hooks will run automatically

## References

- Husky: https://typicode.github.io/husky/
- lint-staged: https://github.com/okonet/lint-staged
- Prettier: https://prettier.io/docs/en/configuration.html
- ESLint: https://eslint.org/docs/user-guide/configuring/
- TypeScript: https://www.typescriptlang.org/docs/

## Support

For detailed information about each component, see:
- `.husky/README.md` - Comprehensive hook documentation
- `.eslintrc.js` - ESLint configuration and rules
- `.prettierrc` - Prettier configuration
- `package.json` - Dependencies and lint-staged configuration
