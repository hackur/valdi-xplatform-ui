---
description: Comprehensive review of all staged git changes
---

Perform a comprehensive review of all staged changes and provide:

## Review Checklist

1. **Git Status**
   - Run `git status` to see all staged files
   - Run `git diff --staged --stat` for change summary
   - List all modified, added, and deleted files

2. **Code Quality Review**
   - Check for PHPDoc comments on all new methods
   - Verify SOLID/DRY/KISS principles applied
   - Look for code duplication
   - Check inline comments for complex logic

3. **Standards Compliance**
   - Verify PSR-12 coding standards (Laravel/PHP)
   - Check for proper namespace usage
   - Validate import statements
   - Confirm proper type hints and return types

4. **Documentation Review**
   - Ensure all code changes have corresponding doc updates
   - Check CLAUDE.md if workflow changes made
   - Verify README updates if public API changed
   - Validate inline documentation accuracy

5. **Breaking Changes Check**
   - Identify any breaking changes
   - Check backward compatibility
   - Look for deprecated method usage
   - Verify migration paths exist

6. **Testing Verification**
   - List affected test files
   - Identify tests that should be updated
   - Check for new test coverage needs

7. **Commit Readiness**
   - Summarize total changes (files, lines)
   - Suggest commit message
   - Flag any concerns or missing pieces

Provide a final "Ready to Commit" status with any action items if not ready.
