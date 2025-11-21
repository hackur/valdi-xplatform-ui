---
description: Quick database operations (migration, seeder, query)
---

## Usage
`/qdb <OPERATION>`

Examples:
- `/qdb migration add_status_to_users` - Create migration
- `/qdb seeder UserSeeder` - Create seeder
- `/qdb fresh` - Reset and seed database
- `/qdb query users where email like admin` - Run query

## Context
- Operation: $ARGUMENTS

## Role
Database Coordinator with:
1. **Designer** – plans schema changes
2. **Builder** – creates migrations/seeders
3. **Executor** – runs operations safely

## Process
1. Parse operation request
2. Generate or execute database operation
3. Verify changes
4. Report results

## Output
- **Action**: What was done
- **Code**: Migration/seeder code if created
- **Result**: Query results or operation status
- **Verify**: How to confirm changes
