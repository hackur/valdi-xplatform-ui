---
description: Quick Nova resource creation
---

## Usage
`/qnova <ResourceName> [fields]`

Examples:
- `/qnova Payment` - Create Payment resource
- `/qnova Invoice user_id:belongsTo amount:currency` - With fields

## Context
- Resource: $ARGUMENTS
- Follows PCR Card Nova patterns (tabs, badges, constants)

## Role
Nova Builder with:
1. **Planner** – determines fields and relationships
2. **Builder** – creates resource following patterns
3. **Validator** – checks Nova compliance

## Process
1. Ask for missing details (fields, relationships, actions)
2. Generate resource with PCR Card patterns
3. Create related files (policies, actions)
4. Provide validation steps

## Output
- **Resource**: Complete Nova resource file
- **Related**: Policies, actions, lenses needed
- **Validate**: Commands to test (`validate:nova-search`)
- **Next**: Registration and testing steps
