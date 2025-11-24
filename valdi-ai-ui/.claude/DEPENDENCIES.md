# Project Dependencies and Versions

## Overview
This document describes the dependencies, versions, and constraints for the Valdi AI UI project.

## Runtime Dependencies

### AI SDK Integration
```json
"@ai-sdk/openai": "^1.0.0"
"@ai-sdk/anthropic": "^1.0.0"
"@ai-sdk/google": "^1.0.0"
"ai": "^5.0.0"
```

**CRITICAL**: These packages are for development/testing ONLY. They cannot be used in Valdi production builds.

**Reason**: Valdi compiles TypeScript to native code without JavaScript runtime. AI SDK requires Node.js/browser APIs.

**Production Alternative**: Use `valdi_http` module for direct HTTP API calls to OpenAI/Anthropic/Google.

### Validation
```json
"zod": "^3.24.1"
```

**NOTE**: Zod is for testing/development only. Cannot be used in Valdi production builds (requires JavaScript runtime).

**Production Alternative**: Implement TypeScript interfaces with manual runtime validation.

### Utilities
```json
"date-fns": "^4.1.0"
"uuid": "^11.0.3"
```

**Status**: Evaluate if these can be used in Valdi builds. May need native alternatives.

## Development Dependencies

### TypeScript
```json
"typescript": "^5.7.2"
```

**Configuration**: ES2022 target for IDE, ES2015 for Valdi builds
- tsconfig.json: IDE/testing configuration
- Valdi compiles to ES2015 only

### Testing
```json
"jest": "^29.7.0"
"ts-jest": "^29.1.1"
"jest-environment-node": "^29.7.0"
"@types/jest": "^29.5.11"
```

**Coverage Thresholds**: 60% (branches, functions, lines, statements)

**Test Exclusion**: All test files must be excluded from Bazel builds:
```python
glob(
  ["src/**/*.ts", "src/**/*.tsx"],
  exclude = ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"]
)
```

### Linting and Formatting
```json
"eslint": "^8.57.1"
"@typescript-eslint/eslint-plugin": "^8.16.0"
"@typescript-eslint/parser": "^8.16.0"
"eslint-config-prettier": "^9.1.0"
"eslint-plugin-import": "^2.29.1"
"eslint-plugin-jest": "^28.8.3"
"prettier": "^3.1.1"
```

**Configuration**: Strict TypeScript rules, 2025 best practices
- See .eslintrc.js for complete rules
- Prettier: 2 spaces, single quotes, trailing commas

### Git Hooks
```json
"husky": "^9.1.5"
"lint-staged": "^15.2.10"
```

**Pre-commit**: Format and lint staged files
**Integration**: TypeScript validation hooks in .claude/hooks.json

### Type Definitions
```json
"@types/node": "^22.10.0"
"@types/uuid": "^10.0.0"
```

## Valdi Framework

### Core Modules (Not in package.json)
```
@valdi//src/valdi_modules/src/valdi/valdi_core
@valdi//src/valdi_modules/src/valdi/valdi_tsx
@valdi//src/valdi_modules/src/valdi/valdi_http
@valdi//src/valdi_modules/src/valdi/valdi_navigation
```

**Note**: These are provided by Valdi framework, not npm packages.

## Build System

### Bazel
- Version: Managed by Valdi framework
- Configuration: MODULE.bazel, BUILD.bazel files
- Build command: `bazel build //:valdi_ai_ui`

### Platform Targets
- iOS: `bazel build //:valdi_ai_ui && valdi install ios`
- Android: `bazel build //:valdi_ai_ui_android && valdi install android`

## Node.js Runtime

### Required Versions
```json
"node": ">=18.0.0"
"npm": ">=9.0.0"
```

**Note**: Node.js is for development/testing only. Valdi builds do not include Node.js runtime.

## Constraints and Limitations

### JavaScript Runtime Features
**NOT AVAILABLE in Valdi Production:**
- Promise.allSettled (ES2020)
- Object.entries/values (ES2017)
- Optional chaining (?.) (ES2020)
- Nullish coalescing (??) (ES2020)
- Async iteration (ES2018)
- npm packages requiring JavaScript runtime

**Available (ES2015):**
- Promise, async/await
- Classes, arrow functions
- Template literals
- Destructuring
- Modules (import/export)
- Map, Set, WeakMap, WeakSet

### Path Aliases
**NOT SUPPORTED in Valdi Production:**
```typescript
import { Message } from '@common';  // FAIL
```

**REQUIRED Pattern:**
```typescript
import { Message } from 'common/src/types';  // PASS
```

Path aliases (@common, @chat_core, etc.) work in:
- VS Code / IDE (autocomplete)
- Jest tests (moduleNameMapper)
- NOT in Valdi builds

### Style Properties
**NOT SUPPORTED:**
- gap, paddingVertical, paddingHorizontal (React Native shorthands)
- CSS-style units (px, rem, em)

**REQUIRED:**
- Individual properties (paddingTop, paddingBottom, paddingLeft, paddingRight)
- Native UIView/View properties only

## Security

### Dependency Auditing
Run regularly:
```bash
npm audit
npm audit fix
```

**Automated**: Hooks check package.json changes for vulnerabilities

### Package Updates
Check for updates:
```bash
npm outdated
npm update
```

**Strategy**: Conservative updates, test thoroughly before upgrading

## Documentation References

- VALDI_LESSONS_LEARNED.md - Critical Valdi constraints
- .claude/commands/es2015-guide.md - ES2015 compatibility
- .claude/commands/path-conventions.md - Import path rules
- .claude/commands/valdi-patterns.md - Framework patterns
- .claude/commands/valdi-testing.md - Testing setup
- .claude/commands/build-config.md - Bazel configuration

## Verification Commands

### Check All Dependencies Installed
```bash
npm install
npm list --depth=0
```

### Verify TypeScript Configuration
```bash
npx tsc --noEmit
```

### Run Full Validation
```bash
npm run validate  # type-check + lint + test
```

### Check for Security Issues
```bash
npm audit
```

### Verify Bazel Configuration
```bash
bazel query //...
```

## Adding New Dependencies

### Before Adding npm Package
1. Check if it requires JavaScript runtime (Node.js/browser APIs)
2. If yes, it CANNOT be used in Valdi production code
3. Search for Valdi-native alternatives in valdi_modules
4. If needed for tests only, mark as devDependency

### Safe to Add
- Pure TypeScript type definitions
- Development tools (linters, formatters)
- Testing utilities
- Build tools

### Cannot Add for Production
- Packages requiring fetch, streams, DOM APIs
- Packages with JavaScript runtime dependencies
- Validation libraries (Zod, Yup, Joi)
- Most React/React Native libraries

### Installation
```bash
npm install <package>           # Production dependency
npm install -D <package>        # Development dependency
```

### After Installation
1. Run `npm audit` to check security
2. Update this document if it's a significant dependency
3. Test that Valdi build still works
4. Commit package.json and package-lock.json together
