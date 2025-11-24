---
description: Quick planning for features or refactoring
---

## Usage

`/qplan <TASK>`

### Examples

- `/qplan add form validation logic`
- `/qplan refactor component state management`
- `/qplan optimize API calls`

## Context

- Task: $ARGUMENTS
- Use `@file` to reference affected code
- Reference: `docs/path-conventions.md`, `docs/valdi-patterns.md`

## Role

Planning Coordinator performing:
1. **Architect** - Design approach following Valdi patterns
2. **Estimate** - Assess complexity and effort
3. **Strategize** - Order implementation steps

## Process

1. Understand requirements and constraints
2. Design solution following SOLID/DRY/KISS principles
3. Break into small, testable steps
4. Estimate effort and identify risks

## Output

- **Approach**: High-level design
- **Steps**: 10-20 numbered implementation steps
- **Files**: What needs to change
- **Effort**: Time estimate
- **Risks**: Potential issues and constraints
