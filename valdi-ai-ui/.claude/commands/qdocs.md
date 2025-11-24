---
description: Quick documentation update
---

## Usage

`/qdocs <TARGET>`

### Examples

- `/qdocs update` - Update docs for recent changes
- `/qdocs PaymentService` - Document PaymentService component
- `/qdocs check` - Find outdated documentation

## Context

- Target: $ARGUMENTS
- Reference: `docs/path-conventions.md`, `docs/valdi-patterns.md`

## Role

Documentation Coordinator performing:
1. **Audit** - Find what needs documenting
2. **Write** - Create/update documentation
3. **Verify** - Ensure accuracy and completeness

## Process

1. Identify documentation needs
2. Update or create docs following Valdi patterns
3. Verify examples work and types are correct
4. Check cross-references

## Output

- **Updated**: Files modified
- **Added**: New documentation
- **Verified**: Examples tested
- **Next**: Additional docs needed
