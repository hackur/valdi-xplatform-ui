# Claude Code Configuration

This directory contains custom commands, hooks, and configuration for the Valdi AI UI project.

## Directory Structure

```
.claude/
├── commands/              # Custom slash commands
│   ├── README.md         # Command usage guide
│   ├── valdi-patterns.md # Valdi framework patterns (REFERENCE)
│   ├── lint-prevention.md # ESLint rules guide (REFERENCE)
│   ├── path-conventions.md # Import path rules (REFERENCE)
│   ├── api-patterns.md   # OpenAI API integration (REFERENCE)
│   ├── style-patterns.md # Native-first styling (REFERENCE)
│   ├── es2015-guide.md   # ES2015 constraints (REFERENCE)
│   ├── valdi-testing.md  # Jest testing patterns (REFERENCE)
│   ├── build-config.md   # Bazel BUILD patterns (REFERENCE)
│   ├── no-emoji-policy.md # No emoji policy (REFERENCE)
│   └── ... (see below for full listing)
├── hooks.json            # Automated validation hooks
├── settings.json         # Project settings
├── DEPENDENCIES.md       # Dependency documentation
└── README.md            # This file
```

## Reference Guides (CRITICAL)

These specialized guides contain essential patterns and rules for Valdi development:

| Guide | Purpose | When to Reference |
|-------|---------|------------------|
| valdi-patterns.md | Valdi component lifecycle, navigation, stores | Writing components, managing state |
| lint-prevention.md | ESLint rules, type safety, common errors | Before committing code |
| path-conventions.md | Import paths, module structure | Every import statement |
| api-patterns.md | OpenAI API integration with valdi_http | Implementing AI features |
| style-patterns.md | Native-first styling, design tokens | Creating UI components |
| es2015-guide.md | ES2015 constraints, forbidden features | Using JavaScript features |
| valdi-testing.md | Jest configuration, mocking, testing | Writing tests |
| build-config.md | Bazel BUILD.bazel configuration | Creating/modifying modules |
| no-emoji-policy.md | Documentation standards | Writing any documentation |

## Command Categories

### Quick Commands
Fast, single-purpose operations for common tasks.

| Command | Description |
|---------|-------------|
| /qplan | Quick feature planning |
| /qfix | Quick error/issue fixing |
| /qrefactor | Quick code refactoring |
| /qreview | Quick staged changes review |
| /qcommit | Quick commit message generation |
| /qtest | Quick test creation/running |
| /qdocs | Quick documentation update |
| /qsearch | Quick codebase search |

### Comprehensive Commands
In-depth, multi-step operations with detailed analysis.

| Command | Description |
|---------|-------------|
| /ultrathink | Deep multi-agent analysis for complex tasks |
| /code-quality | SOLID/DRY/KISS analysis with metrics |
| /refactor-plan | Detailed refactoring plan with risk assessment |
| /review-staged | Comprehensive review of all staged changes |
| /commit-msg | Comprehensive commit message with co-author |
| /session-summary | Complete session documentation |
| /update-docs | Update all project documentation |

### Build & Validation
Commands for building, testing, and validating code.

| Command | Description |
|---------|-------------|
| /build | Bazel build for all platforms |
| /test | Run Jest test suite with coverage |
| /validate | Run type-check + lint + test |
| /validate-all | Comprehensive validation with audit |
| /validated-build | Pre-build validation + build |
| /type-check | TypeScript type checking |
| /lint | ESLint code quality check |
| /clean | Clean build artifacts |

### Platform-Specific
Commands for iOS and Android builds.

| Command | Description |
|---------|-------------|
| /ios | Build and install iOS app |
| /android | Build and install Android app |

### Development Tools
Commands for debugging, performance, and status.

| Command | Description |
|---------|-------------|
| /status | Project health check |
| /debug | Debugging and diagnostics |
| /performance-test | Performance profiling |
| /release-prep | Release preparation checklist |

### Utilities
Helper commands for search, documentation, and git operations.

| Command | Description |
|---------|-------------|
| /search-pattern | Search for code patterns with context |
| /quick-fix | Fix specific errors or issues |
| /component-gen | Generate Valdi component from template |
| /setup-git-hooks | Setup git hooks for validation |

## Hooks Configuration

The `hooks.json` file configures automated validations that run before/after tool usage.

### Post-Edit Hooks
After editing TypeScript files:
- [Type-check] TypeScript validation
- [Linting] ESLint validation
- [Backup] Automatic .backup file creation

### Post-Write Hooks
After creating new files:
- [Type-check] TypeScript validation
- [Linting] ESLint validation
- [Validation] JSON syntax validation
- [Doc-check] JSDoc completeness check
- [Security] Dependency audit (package.json)
- [Build] Bazel syntax validation (BUILD.bazel)

### Pre-Edit Hooks
Before editing:
- [Backup] Create .backup file for TypeScript files

### Destructive Command Warnings
- [Warning] Alerts on rm, rmdir, mv to /dev/null

## Common Workflows

### Starting a New Feature
```
1. /qplan - Plan the feature implementation
2. Write code, referencing:
   - /valdi-patterns for component structure
   - /path-conventions for imports
   - /style-patterns for styling
3. /validate - Run full validation
4. /qtest - Create tests
5. /qreview - Review changes
6. /qcommit - Generate commit message
```

### Fixing an Error
```
1. /quick-fix - Analyze and fix the error
2. Reference /lint-prevention or /es2015-guide as needed
3. /validate - Ensure fix is correct
4. /qcommit - Commit the fix
```

### Refactoring Code
```
1. /refactor-plan - Create detailed refactoring plan
2. Implement changes, following SOLID/DRY/KISS principles
3. /code-quality - Verify improvements
4. /test - Run full test suite
5. /review-staged - Comprehensive review
6. /commit-msg - Document refactoring
```

### Pre-Commit Workflow
```
1. /review-staged - Review all staged changes
2. /validate - Run full validation suite
3. /qcommit or /commit-msg - Generate commit message
4. git commit with generated message
```

### Release Preparation
```
1. /release-prep - Run release checklist
2. /validate-all - Comprehensive validation
3. /test - Full test suite with coverage
4. /build - Build all platform targets
5. /session-summary - Document release changes
```

## Key Principles

### No Emoji Policy
- Never use emojis in code, documentation, or commit messages
- Use lists, tables, and structured formatting instead
- See no-emoji-policy.md for details

### No Attribution
- No author names in files
- No "Generated by..." statements
- No company/product/model names
- Professional, attribution-free format

### Valdi Constraints
- Path aliases (@common) do NOT work in Valdi builds
- AI SDK cannot be used (no JavaScript runtime)
- ES2015 only (no ES2017+ features)
- Native-first styling (no React Native shorthands)
- Always reference guide files when in doubt

### TypeScript Standards
- Strict type checking (no 'any')
- Explicit function return types
- Type-only imports (import type)
- Proper naming conventions
- Promise handling (no floating promises)

## File Naming Conventions

### Command Files
- Lowercase with hyphens: `valdi-patterns.md`
- Prefix with 'q' for quick commands: `qfix.md`
- Descriptive names: `lint-prevention.md` not `lint.md`

### Status Indicators
Use text-based status instead of emojis:
- [PASS] - Operation succeeded
- [FAIL] - Operation failed
- [WARN] - Warning or caution
- [INFO] - Information
- [TEST] - Test related
- [BUILD] - Build related

## Updating Commands

### When to Update
- New Valdi patterns discovered
- ESLint rules changed
- Project structure modified
- New dependencies added
- Framework constraints identified

### Update Process
1. Modify the command file
2. Test with sample scenarios
3. Update this README if categories change
4. Update DEPENDENCIES.md if dependencies affected
5. Commit with descriptive message

## Resources

### Internal Documentation
- VALDI_LESSONS_LEARNED.md - Critical lessons from development
- PROJECT_PLAN.md - Project architecture and roadmap
- DEPENDENCIES.md - Dependency constraints and versions
- .claude/DEPENDENCIES.md - Detailed dependency documentation

### External Resources
- TypeScript 5.7 docs: https://www.typescriptlang.org/docs/
- ESLint TypeScript: https://typescript-eslint.io/
- Jest: https://jestjs.io/
- Bazel: https://bazel.build/

## Troubleshooting

### Hooks Not Running
- Check hooks.json syntax with `jq . .claude/hooks.json`
- Ensure commands have proper permissions
- Check file paths match regex patterns

### Commands Not Found
- Verify command file exists in .claude/commands/
- Check file has .md extension
- Ensure command name matches file name

### Build Failures
- Reference /build-config for Bazel patterns
- Check test file exclusion in BUILD.bazel
- Verify dependencies in DEPENDENCIES.md

### Lint Errors
- Reference /lint-prevention for all ESLint rules
- Check for path alias usage (use full module paths)
- Verify ES2015 compatibility (no ES2017+ features)

### Type Errors
- Reference /path-conventions for import paths
- Check /es2015-guide for feature compatibility
- Ensure override keyword on lifecycle methods

### Style Errors
- Reference /style-patterns for native properties
- Use individual properties (no paddingVertical)
- Always use design tokens from common/src/theme
- NEVER use Style<T> type parameters - use plain Style (TypeScript infers type)
- Run `./scripts/fix-style-types.sh` to auto-fix Style<T> violations

## Maintenance

### Regular Tasks
- Review and update reference guides monthly
- Check for new ESLint rules quarterly
- Update dependency versions as needed
- Archive outdated commands
- Document new patterns discovered

### Version History
This configuration is maintained for:
- Valdi Framework (latest)
- TypeScript 5.7.2
- Node.js >=18.0.0
- Jest 29.7.0
- ESLint 8.57.1

## Contributing

### Adding New Commands
1. Create .md file in .claude/commands/
2. Follow existing command structure
3. Add to appropriate category in this README
4. Test command thoroughly
5. Update relevant reference guides

### Command Template
```markdown
# Command Name

## Usage
Brief description of when to use this command.

## Context
Relevant context about the command purpose.

## Task
Detailed instructions for what the command should do.

## Reference
Links to relevant guide files or documentation.
```

## Support

For issues or questions about this configuration:
1. Check relevant reference guide first
2. Review VALDI_LESSONS_LEARNED.md
3. Search .claude/commands/ for similar patterns
4. Consult project documentation

## Summary

This Claude Code configuration provides:
- 40+ specialized commands for Valdi development
- 10 reference guides for critical patterns
- Automated validation hooks
- Comprehensive documentation
- No emoji, professional formatting
- Valdi-specific best practices

All commands and guides follow the no-emoji policy and Valdi framework constraints.
