---
description: Quick code review of staged changes
---

## Usage

`/qreview`

Reviews all staged changes for quality and issues.

## Review Roles

| Role | Responsibilities |
|------|-----------------|
| Quality Checker | SOLID/DRY/KISS violations, code smells |
| TypeScript Auditor | Type safety, TS/Valdi patterns compliance |
| Linting Validator | ESLint rules, style-patterns.md compliance |

## Process

1. Analyze all staged changes
2. Check code quality principles (SOLID/DRY/KISS)
3. Verify TypeScript and Valdi pattern compliance
4. Identify issues and improvements
5. Assess commit readiness

## Output

| Section | Details |
|---------|---------|
| Summary | Files changed, lines modified |
| Quality Score | SOLID/DRY/KISS ratings out of 10 |
| Type Safety | TypeScript compliance level |
| Linting | ESLint violations found |
| Issues | Problems with severity levels |
| Recommendations | Improvements before commit |
| Patterns | Reference valdi-patterns.md as needed |
| Status | [READY] or [NEEDS WORK] |
