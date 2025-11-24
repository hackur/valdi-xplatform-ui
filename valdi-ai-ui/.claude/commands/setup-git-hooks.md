# Setup Git Hooks

Configure automated pre-commit validation hooks.

## Task

1. **Create Pre-Commit Hook**
   - Create `.git/hooks/pre-commit` file
   - Make it executable
   - Add validation checks

2. **Hook Implementation**
   ```bash
   #!/bin/bash
   set -e

   echo "🔍 Running pre-commit checks..."

   # Get staged TypeScript/TSX files
   STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

   if [ -n "$STAGED_TS_FILES" ]; then
     echo "📝 Checking TypeScript files..."

     # Type check
     echo "  ├─ Type checking..."
     npx tsc --noEmit --skipLibCheck || {
       echo "❌ TypeScript errors found. Please fix before committing."
       exit 1
     }

     # Lint
     echo "  ├─ Linting..."
     npx eslint $STAGED_TS_FILES --max-warnings 0 || {
       echo "⚠️  ESLint issues found. Run 'npx eslint --fix' or fix manually."
       exit 1
     }

     echo "  └─ ✅ All checks passed!"
   fi

   # Check for sensitive data
   echo "🔒 Checking for sensitive data..."
   if git diff --cached | grep -iE '(password|api[_-]?key|secret|token|credential).*=.*["\047][^"\047]+["\047]' | grep -v '^[-+].*//'; then
     echo "❌ Potential sensitive data detected in commit!"
     echo "   Please review and remove before committing."
     exit 1
   fi

   echo "✅ Pre-commit checks completed successfully!"
   ```

3. **Install Hook**
   - Write the hook file
   - Make it executable: `chmod +x .git/hooks/pre-commit`
   - Test with a sample commit

4. **Alternative: Use Husky**
   If Husky is available:
   ```bash
   npm install --save-dev husky
   npx husky install
   npx husky add .git/hooks/pre-commit "npx tsc --noEmit && npx eslint . --ext .ts,.tsx"
   ```

## Output

```
🎣 Git Hooks Setup Complete
===========================

✅ Pre-commit hook installed
✅ Type checking enabled
✅ Linting enabled
✅ Sensitive data checks enabled

📝 Test the hook:
   git add [files]
   git commit -m "test"

🔧 To bypass (emergency only):
   git commit --no-verify
```
