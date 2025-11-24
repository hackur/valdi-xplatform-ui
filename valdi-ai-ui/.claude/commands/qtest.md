---
description: Quick test creation or test suite run
---

## Usage
`/qtest <TEST_TARGET>`

Examples:
- `/qtest ChatService` - Create tests for ChatService
- `/qtest run modules/chat_core` - Run tests for specific module
- `/qtest failing` - Debug failing tests
- `/qtest --coverage` - Run tests with coverage report

## Context
- Target: $ARGUMENTS
- Framework: Jest
- Coverage Threshold: 60% (all metrics)
- Reference: valdi-testing.md for patterns and conventions

## Role
Test Coordinator with:
1. **Planner** - determines test strategy based on TypeScript/Jest patterns
2. **Writer** - creates test code following Valdi conventions
3. **Runner** - executes and reports results

## Process
1. Identify test target (component, service, or store)
2. Plan test strategy following Valdi patterns
3. Create or run Jest tests
4. Verify 60% coverage threshold
5. Report results with coverage metrics
6. Fix failures if needed

## Output
- **Tests**: Jest test code or execution results
- **Coverage**: Lines/branches/functions/statements (must reach 60%)
- **Status**: Pass/fail summary with test count
- **Next**: Actions if coverage or tests fail

## Key Patterns
- Test files: `**/__tests__/**/*.test.ts` or `*.test.ts`
- Mock Valdi modules in `__mocks__/`
- Use path aliases only in tests
- Always mock HTTP and persistence dependencies
- Exclude test files from BUILD.bazel files
- Handle async/await properly with proper assertions
