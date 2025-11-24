---
description: Update all documentation after code changes
---

Update all relevant documentation after code changes:

## Documentation Update Process

1. **Identify Affected Documentation**

   Search for references to changed code in:
   - CLAUDE.md (primary project guide)
   - docs/valdi-patterns.md (Valdi component patterns)
   - docs/path-conventions.md (file organization)
   - docs/development/*.md (development guides)
   - docs/features/*.md (feature documentation)
   - README files in affected directories

2. **Update Primary Documentation**

   Update CLAUDE.md if:
   - New commands added
   - Workflow changes
   - New patterns introduced
   - Architecture changes

   Keep the streamlined format (high-level + references)

3. **Update Comprehensive Guides**

   Update detailed guides in docs/ if:
   - API changes
   - New features added
   - Behavior modifications
   - Configuration changes

4. **Update Inline Documentation**

   Add/update JSDoc comments for:
   - New components/classes
   - New functions/methods
   - Changed function signatures
   - Complex business logic

   Add inline comments for:
   - Non-obvious code
   - Complex algorithms
   - Performance optimizations
   - Workarounds and edge cases

5. **Verify Examples**

   - Test all code examples in documentation
   - Update command examples if syntax changed
   - Verify file paths are correct
   - Verify TypeScript types are accurate

6. **Cross-Reference Check**

   - Search for outdated terminology
   - Update deprecated references
   - Fix broken internal links
   - Verify external links still work

## Output

Provide a summary of:
- Files updated
- Sections modified
- New documentation created
- Examples verified
