---
description: Quick commit message generation
---

## Usage

`/qcommit`

Analyzes staged changes and generates a commit message quickly.

## Role

Commit analysis and message generation with:

- **Analyzer** – reviews staged changes
- **Categorizer** – determines type and scope
- **Writer** – crafts conventional commit message

## Process

1. Run `git diff --staged --stat`
2. Identify primary type (feat/fix/refactor/docs/etc)
3. Determine scope from Valdi TypeScript project areas
4. Write commit message following conventions

## Supported Scopes

- valdi, components, stores, navigation
- api, types, theme
- bazel, jest, build
- ci-cd, docs

## Output Format

```
<type>(<scope>): <description>

<detailed explanation>

Changes:
- <specific changes>

Files: X changed, +Y -Z
Breaking: <if any>
```

Ready to copy and use with `git commit -m "..."`
