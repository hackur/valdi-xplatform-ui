# Custom Commands for Valdi AI UI

Custom slash commands for the Valdi AI UI TypeScript cross-platform project.

## Quick Commands (Fast & Focused)

| Command | Purpose | Example |
|---------|---------|---------|
| `/qfix` | Rapidly debug and fix errors | `/qfix TypeError in ChatService` |
| `/qrefactor` | Refactor following SOLID/DRY/KISS | `/qrefactor MessageStore` |
| `/qtest` | Create or run Jest tests | `/qtest ChatService` |
| `/qsearch` | Search codebase with context | `/qsearch "useMessage"` |
| `/qdocs` | Quick documentation updates | `/qdocs update` |
| `/qplan` | Plan features or refactoring | `/qplan add message filtering` |
| `/qcommit` | Generate conventional commit | `/qcommit` |
| `/qreview` | Review staged changes | `/qreview` |

## Comprehensive Commands (Detailed Workflows)

| Command | Purpose | Best For |
|---------|---------|----------|
| `/session-summary` | Document current work session | End-of-session recap |
| `/review-staged` | Deep review of staged changes | Pre-commit validation |
| `/update-docs` | Update docs after code changes | Documentation maintenance |
| `/refactor-plan` | Detailed refactoring blueprint | Large refactoring projects |
| `/commit-msg` | Comprehensive commit message | Complex changeset documentation |
| `/code-quality` | SOLID/DRY/KISS analysis | Code quality verification |
| `/search-pattern` | Find code patterns/terminology | Codebase research |
| `/test-suite` | Run full Jest suite with report | Pre-deployment testing |
| `/quick-fix` | Analyze and fix specific error | Error investigation |
| `/deploy-check` | Pre-deployment validation | Release preparation |
| `/ultrathink` | Deep multi-agent analysis | Complex problem solving |

## Build & Validation Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/validate` | TypeScript and ESLint validation | Type/lint errors |
| `/type-check` | Full TypeScript type checking | Type errors only |
| `/lint` | ESLint checking | Linting issues |
| `/validate-all` | Comprehensive validation suite | Full report |
| `/build` | Build project | Build artifacts/errors |
| `/validated-build` | Build with pre-validation | Success/fail report |
| `/test` | Run Jest test suite | Test results |
| `/test-writer` | Generate test files | Test code |

## Platform-Specific Commands

| Command | Purpose | Platform |
|---------|---------|----------|
| `/ios` | iOS-specific builds/checks | iOS |
| `/android` | Android-specific builds/checks | Android |
| `/component-gen` | Generate component with tests | Cross-platform |

## Utility Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `/clean` | Clean build artifacts | `/clean` |
| `/status` | Project status check | `/status` |
| `/debug` | Debug mode for issues | `/debug [target]` |
| `/setup-git-hooks` | Configure Git hooks | `/setup-git-hooks` |
| `/release-prep` | Prepare for release | `/release-prep` |
| `/performance-test` | Performance testing | `/performance-test` |
| `/module-test` | Test single module | `/module-test [module]` |

## Reference & Pattern Commands

These commands provide guidance and pattern documentation:

| Command | Topic |
|---------|-------|
| `/valdi-patterns.md` | Valdi-specific patterns |
| `/valdi-testing.md` | Jest setup and test patterns (60% coverage) |
| `/path-conventions.md` | Module path conventions |
| `/api-patterns.md` | HTTP client and API patterns |
| `/style-patterns.md` | Styling patterns |
| `/es2015-guide.md` | ES2015+ feature guidance |
| `/lint-prevention.md` | Linting rules and avoidance |
| `/build-config.md` | Build configuration reference |
| `/no-emoji-policy.md` | Project emoji policy |

---

## Command Categories

### Development Workflow
Quick iteration commands for daily development:
- `/qfix` - Fast error fixing
- `/qrefactor` - Code improvement
- `/qplan` - Feature planning
- `/ultrathink` - Complex problem solving

### Testing
Jest-based testing with 60% coverage requirement:
- `/qtest` - Quick test operations
- `/test` - Run full Jest suite
- `/test-writer` - Generate test files
- `/test-suite` - Comprehensive test report
- `/module-test` - Test single module
- Reference: `/valdi-testing.md`

### Code Analysis & Review
- `/qsearch` - Codebase search
- `/qreview` - Code review
- `/code-quality` - Quality analysis
- `/search-pattern` - Pattern search
- `/review-staged` - Detailed review

### Documentation
- `/qdocs` - Quick updates
- `/update-docs` - Comprehensive update
- `/session-summary` - Work session recap

### Build & Validation
- `/validate` - TypeScript + ESLint check
- `/type-check` - Type validation only
- `/lint` - Linting only
- `/validate-all` - Full validation
- `/build` - Build project
- `/validated-build` - Safe build
- Reference: `/build-config.md`

### Platform-Specific
- `/ios` - iOS development
- `/android` - Android development
- `/component-gen` - Component generation

### Git & Deployment
- `/qcommit` - Quick commit message
- `/commit-msg` - Detailed message
- `/deploy-check` - Pre-deployment check
- `/release-prep` - Release preparation

### Utilities & Setup
- `/clean` - Clean artifacts
- `/status` - Project status
- `/debug` - Debug assistance
- `/setup-git-hooks` - Configure hooks
- `/performance-test` - Performance analysis

---

## Usage Guide

### Quick Commands (q*)
Fast, focused commands for common tasks:
- Designed for speed
- Use when you know exactly what you want
- Minimal output, maximum action
- Examples:
  - `/qfix TypeError in ChatService`
  - `/qtest MessageStore`
  - `/qsearch "conversationId"`

### Comprehensive Commands
Detailed workflows for complex tasks:
- Multi-step analysis and execution
- Thorough documentation
- Verification and validation
- Examples:
  - `/test-suite` - Full test run with coverage report
  - `/review-staged` - Detailed change analysis
  - `/refactor-plan` - Detailed refactoring blueprint

### UltraThink
Complex problem solving with specialist agents:
- Use for unclear/ambiguous problems
- Multiple agent coordination
- Iterative refinement
- Example: `/ultrathink redesign component architecture`

### Command Arguments
Most commands accept additional context:
```bash
/qfix <error description>
/qtest <target|--coverage>
/qrefactor <file|pattern>
/qsearch <pattern|@file>
/qplan <feature|refactoring>
```

---

## Best Practices

### Before Committing
1. `/qreview` - Check quality of changes
2. `/qcommit` - Generate commit message
3. `/validate` - Run validation suite

### Testing Workflow
1. `/qtest <target>` - Create/run tests
2. `/test-suite` - Run full suite
3. Verify 60% coverage threshold
4. Reference: `/valdi-testing.md`

### Major Refactoring
1. `/qplan <refactoring>` - Plan approach
2. `/refactor-plan` - Detailed blueprint
3. `/qrefactor <target>` - Execute changes
4. `/validate-all` - Full validation

### Pre-Release
1. `/deploy-check` - Pre-deployment check
2. `/release-prep` - Release preparation
3. `/validate-all` - Final validation
4. Create release commit

---

## Creating New Commands

Add new `.md` files to `.claude/commands/` directory:

```markdown
---
description: Brief description shown in command list
---

## Usage
/commandname <ARGUMENTS>

## Context
- Argument: $ARGUMENTS

## Role
What this command does

## Process
1. Step 1
2. Step 2

## Output
- Result description
```

---

## Key Resources

- **Jest Testing**: See `/valdi-testing.md` (60% coverage requirement)
- **Valdi Patterns**: See `/valdi-patterns.md`
- **Build Config**: See `/build-config.md`
- **Path Conventions**: See `/path-conventions.md`
- **API Patterns**: See `/api-patterns.md`
- **Style Patterns**: See `/style-patterns.md`

**Project**: Valdi AI UI
**Stack**: TypeScript, Jest, Cross-platform
**Validation**: Type checking, ESLint, Test coverage (60% minimum)
