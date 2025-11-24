---
description: Create a detailed refactoring plan following SOLID/DRY/KISS
---

Create a comprehensive refactoring plan for TypeScript/Valdi code:

## Refactoring Analysis Phases

### 1. Current State Assessment
- Read current code implementation
- Identify code smells and anti-patterns
- Measure metrics: lines, complexity, duplication, cyclomatic complexity
- Document current behavior and dependencies

### 2. SOLID Principles Analysis

| Principle | Issues to Find |
|-----------|----------------|
| **Single Responsibility** | Classes/methods doing too much, mixed concerns |
| **Open/Closed** | Hard-to-extend code, rigid type definitions |
| **Liskov Substitution** | Inheritance issues, broken interface contracts |
| **Interface Segregation** | Fat interfaces with unused methods, bloated types |
| **Dependency Inversion** | Tight coupling, direct instantiation, missing injection |

### 3. DRY (Don't Repeat Yourself) Violations
- Find duplicated code blocks and patterns
- Identify repeated component logic
- Locate copy-paste implementations
- Calculate duplication percentage

### 4. KISS (Keep It Simple, Stupid) Violations
- Find overly complex methods (>20 lines)
- Identify unnecessary abstractions
- Locate convoluted logic and nested callbacks
- Find premature optimizations

### 5. TypeScript/Valdi-Specific Issues
- Missing explicit types (using 'any')
- Non-null assertions instead of guards
- Path alias inconsistencies
- ES2017+ feature usage (breaks ES2015 compilation)
- Missing 'override' keywords on lifecycle methods
- Improper Style definitions or invalid CSS properties
- Unhandled promise chains
- Memory leaks (not unsubscribing in onDestroy)

### 6. Refactoring Strategy
- Prioritize changes by impact (high risk/high reward first)
- Break into phases (small, testable changes)
- Identify design patterns to apply (Factory, Observer, Strategy, etc.)
- Plan migration path for breaking changes
- Consider backward compatibility requirements

### 7. Implementation Plan
- Create 20+ step detailed refactoring plan
- Specify which files to modify or create
- Define new classes/methods needed
- Identify tests to write for each change
- Plan incremental commits for each logical step

### 8. Risk Assessment

| Risk Type | Mitigation |
|-----------|-----------|
| Breaking Changes | Document API changes, plan migration path |
| Affected Code | List all dependent modules and components |
| Memory Leaks | Review lifecycle and subscription cleanup |
| Type Safety | Ensure full TypeScript coverage, check circular dependencies |
| Performance | Measure impact on render performance and bundle size |

### 9. Success Metrics
- Target metrics: lines reduced, complexity lowered, duplication eliminated
- Code quality: ESLint pass rate 100%, zero TypeScript errors
- Type safety: Full explicit typing, no 'any' usage
- Maintainability: Clear single responsibilities, documented patterns
- Performance: No memory leaks, proper cleanup in onDestroy
- Consistency: Follows valdi-patterns.md and lint-prevention.md

## Reference Guides
- **lint-prevention.md** - TypeScript/ESLint compliance
- **es2015-guide.md** - ES2015 constraints for Valdi compilation
- **valdi-patterns.md** - Component and lifecycle best practices

Present plan for review before implementation, or execute with approval.
