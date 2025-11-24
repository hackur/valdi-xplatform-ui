---
description: Quick codebase search with context
---

## Usage

`/qsearch <PATTERN>`

### Examples

- `/qsearch submitForm` - Find function usage
- `/qsearch "old term"` - Find terminology to update
- `/qsearch interface PaymentState` - Find type definition

## Context

- Pattern: $ARGUMENTS
- Reference: `docs/path-conventions.md`, `docs/valdi-patterns.md`

## Role

Search Coordinator performing:
1. **Search** - Find matches using Grep/Glob for `.ts`, `.tsx`, `.json`, `.md`
2. **Categorize** - Group results by file type and context
3. **Report** - Provide findings with context and suggestions

## Process

1. Search codebase with appropriate tools
2. Categorize results (components, docs, tests, config)
3. Provide context for each match
4. Suggest actions

## Output

- **Matches**: Count and categories
- **Results**: Grouped by file type with line numbers
- **Context**: Code surrounding matches
- **Actions**: What to do with findings
