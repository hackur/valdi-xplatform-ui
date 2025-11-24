---
description: Comprehensive code quality check (SOLID/DRY/KISS analysis)
---

Perform a comprehensive code quality analysis on specified files or recent changes:

## Code Quality Analysis

### 1. SOLID Principles Check

| Principle | TypeScript Checks | Valdi Context |
|-----------|------------------|---------------|
| **Single Responsibility** | Identify functions/classes doing multiple things | Components should handle UI only, stores for state |
| | Check for mixed concerns (logic + presentation) | Business logic in services, rendering in components |
| | Look for "God classes" or "God functions" | Module size <300 lines, function length <20 lines |
| **Open/Closed** | Find hardcoded values that should be configurable | Use environment config, constants files |
| | Identify switch statements that should be polymorphic | Use strategy pattern, component composition |
| | Look for modification-prone code | Abstract interfaces for extensibility |
| **Liskov Substitution** | Check type hierarchies and interfaces | Verify interface implementations don't break contracts |
| | Look for type assertions (as keyword) - code smell | Proper typing reduces LSP violations |
| **Interface Segregation** | Find "fat interfaces" with too many methods | Keep interfaces focused and composable |
| | Check if implementations use all methods | Split large types into smaller, specific ones |
| **Dependency Inversion** | Check for tight coupling in imports | Use dependency injection, avoid circular imports |
| | Look for direct instantiation | Use factory functions or DI containers |

### 2. DRY (Don't Repeat Yourself)

- Search for duplicate code blocks across .ts, .tsx files
- Identify copy-pasted functions and components
- Find repeated patterns and utility opportunities
- Calculate duplication percentage
- Suggest extraction to shared utilities or composables

### 3. KISS (Keep It Simple, Stupid)

- Identify overly complex functions (cyclomatic complexity >10)
- Find unnecessary abstractions and over-engineering
- Look for premature optimizations
- Check for convoluted conditional logic
- Suggest simplification through composition

### 4. Code Smells

| Smell | Threshold | Valdi Action |
|-------|-----------|-------------|
| Long functions | >50 lines | Extract helpers, use composition |
| Large files | >300 lines | Split into modules, separate concerns |
| Long parameter lists | >4 params | Use object parameters or context |
| Magic numbers/strings | Hardcoded values | Move to constants, config files |
| Commented-out code | Any | Remove, rely on git history |
| TODO/FIXME comments | Track urgency | File issue, document decision |

### 5. TypeScript/Valdi Best Practices

- Verify proper type annotations throughout
- Check for Valdi store patterns (reactive state)
- Ensure component lifecycle hooks usage
- Look for proper error handling patterns
- Verify view model integration

### 6. Documentation Quality

- JSDoc/TSDoc coverage percentage
- Missing @param or @returns tags
- Outdated documentation and examples
- Missing inline comments on complex logic
- TypeScript type clarity without extra comments

### 7. ESLint Compliance

Reference: lint-prevention.md, style-patterns.md

- Run ESLint checks on all staged files
- Review specific rule violations
- Suggest fixes aligned with project standards
- Check for TypeScript-specific linting rules

### 8. Metrics Summary

Provide overall scores:
- SOLID Compliance: X/10
- DRY Score: X/10 (100% - duplication%)
- KISS Score: X/10 (based on average complexity)
- Documentation Coverage: X%
- ESLint Pass Rate: X%
- Overall Code Quality Grade: A-F

### 9. Recommendations

- Prioritized list of improvements
- Specific refactoring suggestions
- Reference to valdi-patterns.md for patterns
- Estimated effort for each fix

Output a detailed report with specific line numbers and actionable recommendations.
