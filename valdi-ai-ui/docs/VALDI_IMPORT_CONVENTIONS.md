# Valdi Import Conventions - Master Reference

> **🚨 CRITICAL:** This document explains the **#1 most common mistake** in Valdi projects and how to avoid it.

## The Problem

**Valdi's compiler uses different import syntax than standard TypeScript projects.**

TypeScript path aliases (the `@` prefix) configured in `tsconfig.json` **DO NOT WORK** in Valdi builds, even though they work in your IDE.

## Quick Reference

### ❌ WRONG (TypeScript Path Mapping - DO NOT USE)

```typescript
// These will FAIL in Valdi builds:
import { Button, Card } from '@common';
import { Colors } from '@common/theme';
import { ChatService } from '@chat_core/ChatService';
import { ChatView } from '@chat_ui';
```

### ✅ CORRECT (Valdi Format - ALWAYS USE)

```typescript
// These WILL WORK in Valdi builds:
import { Button, Card } from 'common/src/components';
import { Colors } from 'common/src/theme';
import { ChatService } from 'chat_core/src/ChatService';
import { ChatView } from 'chat_ui/src/ChatView';
```

## The Rule

**Always use `module_name/src/path` format for cross-module imports.**

```
[module_name]/src/[path/to/file]
```

Examples:
- `common/src/components/Button`
- `chat_core/src/ChatService`
- `valdi_core/src/Component`
- `valdi_tsx/src/NativeTemplateElements`

## Why This Happens

1. **tsconfig.json paths** are for IDE tooling only (autocomplete, go-to-definition)
2. **Valdi compiler** uses Bazel, which has its own module resolution
3. **Bazel doesn't respect** TypeScript path mappings
4. **vendor/valdi** uses `module_name/src/path` format throughout (our source of truth)

## Evidence from vendor/valdi Codebase

All Valdi framework modules use this format:

```typescript
// From vendor/valdi/src/valdi_modules/src/valdi/drawing/src/ManagedContextFactory.ts
import { ValdiRuntime } from 'valdi_core/src/ValdiRuntime';
import { IRenderer } from 'valdi_core/src/IRenderer';
import { jsx } from 'valdi_core/src/JSXBootstrap';

// From vendor/valdi/src/valdi_modules/src/valdi/valdi_navigation/src/NavigationController.ts
import { Component } from 'valdi_core/src/Component';
import { IComponent } from 'valdi_core/src/IComponent';

// From vendor/valdi/src/valdi_modules/src/valdi/drawing/test/ManagedContextFactory.spec.tsx
import { ElementRef } from 'valdi_core/src/ElementRef';
import { Layout, View } from 'valdi_tsx/src/NativeTemplateElements';
```

**Pattern:** `module_name/src/path` - ALWAYS, no exceptions.

## Module Import Quick Reference

### common (UI Components, Theme, Utils)

```typescript
// Components
import { Button } from 'common/src/components/Button';
import { Card } from 'common/src/components/Card';
import { Avatar } from 'common/src/components/Avatar';

// Theme
import { Colors } from 'common/src/theme/Colors';
import { Fonts } from 'common/src/theme/Fonts';
import { Spacing, BorderRadius } from 'common/src/theme';

// Types
import type { Message } from 'common/src/types';
import type { Conversation } from 'common/src/types';

// Utils
import { validateEmail } from 'common/src/utils/validation';
import { ErrorBoundary } from 'common/src/components/ErrorBoundary';
```

### chat_core (AI Chat Core)

```typescript
// Stores
import { MessageStore } from 'chat_core/src/MessageStore';
import { ConversationStore } from 'chat_core/src/ConversationStore';

// Services
import { ChatService } from 'chat_core/src/ChatService';
import { ExportService } from 'chat_core/src/ExportService';

// Types
import type { AgentContext } from 'chat_core/src/types';

// Workflows
import { SequentialWorkflow } from 'chat_core/src/SequentialWorkflow';
```

### chat_ui (Chat UI Components)

```typescript
import { ChatView } from 'chat_ui/src/ChatView';
import { MessageBubble } from 'chat_ui/src/MessageBubble';
import { InputBar } from 'chat_ui/src/InputBar';
```

### Other Modules

```typescript
// agent_manager
import { AgentExecutor } from 'agent_manager/src/AgentExecutor';

// conversation_manager
import { HistoryManager } from 'conversation_manager/src/HistoryManager';

// model_config
import { ModelConfigStore } from 'model_config/src/ModelConfigStore';

// settings
import { ApiKeyStore } from 'settings/src/ApiKeyStore';
```

## Valdi Framework Modules

All Valdi framework imports follow the same pattern:

```typescript
// Core
import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont } from 'valdi_core/src/SystemFont';

// TSX (UI Elements)
import { View, Label, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';

// Navigation
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import { NavigationPage } from 'valdi_navigation/src/NavigationPage';

// HTTP
import { HttpClient } from 'valdi_http/src/HttpClient';
```

## Build System Integration

### BUILD.bazel Configuration

Module dependencies MUST be listed in `deps`:

```python
valdi_module(
    name = "chat_ui",
    srcs = glob(["src/**/*.ts", "src/**/*.tsx"]),
    visibility = ["//visibility:public"],
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_tsx",
        "//modules/common",      # Enables: from 'common/src/...'
        "//modules/chat_core",   # Enables: from 'chat_core/src/...'
    ],
)
```

### module.yaml Configuration

Dependencies should also be listed in `module.yaml`:

```yaml
name: chat_ui
version: 1.0.0

dependencies:
  valdi_core: "^1.0.0"
  common: "1.0.0"
  chat_core: "1.0.0"
```

## Common Migration Patterns

### Pattern 1: Default imports from index

❌ Before:
```typescript
import { Button, Card, Colors, Spacing } from '@common';
```

✅ After:
```typescript
import { Button, Card } from 'common/src/components';
import { Colors, Spacing } from 'common/src/theme';
```

### Pattern 2: Subpath imports

❌ Before:
```typescript
import { validateEmail } from '@common/utils';
import { Message } from '@common/types';
```

✅ After:
```typescript
import { validateEmail } from 'common/src/utils/validation';
import type { Message } from 'common/src/types';
```

### Pattern 3: Component imports

❌ Before:
```typescript
import { ChatService } from '@chat_core/ChatService';
import { ChatView } from '@chat_ui/ChatView';
```

✅ After:
```typescript
import { ChatService } from 'chat_core/src/ChatService';
import { ChatView } from 'chat_ui/src/ChatView';
```

## Tooling & Automation

### Quick Fix

```bash
# Automatically fix all imports
npm run fix:imports

# Verify all imports are correct
npm run verify:imports

# Lint imports
npm run lint:imports
```

### Manual Search & Replace

```bash
# Find all incorrect imports
grep -rn "from ['\"]@common" modules/

# Example sed command to fix
sed -i '' -E "s/from ['\"]@common\/([^'\"]+)['\"]/from 'common\/src\/\1'/g" file.ts
sed -i '' -E "s/from ['\"]@common['\"]/from 'common\/src'/g" file.ts
```

### Pre-commit Hook

The repository has a pre-commit hook that prevents committing files with `@` imports:

```bash
# If you see this error:
❌ ERROR: modules/chat_ui/src/ChatView.tsx contains invalid @ imports
   Valdi requires module_name/src/path format
   Run: npm run fix:imports

# Fix it:
npm run fix:imports
git add .
git commit -m "fix: use correct Valdi import format"
```

## IDE Configuration

### VS Code

The `@` aliases will still work in VS Code for autocomplete and navigation (thanks to tsconfig.json), but **you must manually type the correct format** when writing imports.

**Pro tip:** Use VS Code snippets for correct imports:
- `imp-common` → `import { Component } from 'common/src/components/Component';`
- `imp-chat-core` → `import { ChatService } from 'chat_core/src/ChatService';`
- `imp-valdi` → `import { Component } from 'valdi_core/src/Component';`

### ESLint

ESLint is configured to catch `@` imports:

```javascript
// .eslintrc.js
'no-restricted-imports': ['error', {
  patterns: [{
    group: ['@common', '@common/*', '@chat_core', '@chat_core/*', /* ... */],
    message: 'Use module_name/src/path format instead. See docs/VALDI_IMPORT_CONVENTIONS.md'
  }]
}]
```

## Debugging Import Issues

### Error: "File '@common' does not exist"

**Cause:** Using TypeScript path alias instead of Valdi format.

**Fix:**
```typescript
// Change this:
import { Button } from '@common';

// To this:
import { Button } from 'common/src/components/Button';
```

### Error: "Cannot find module 'common'"

**Cause:** Module not listed in BUILD.bazel deps or module.yaml.

**Fix:** Add to `BUILD.bazel`:
```python
deps = [
    "//modules/common",  # Add this
]
```

### Error: "Found imports from undeclared dependencies"

**Cause:** Importing from a module that's not in deps.

**Fix:** Update both `BUILD.bazel` and `module.yaml` to include the dependency.

## Migration Checklist

When migrating existing code:

- [ ] Run `npm run fix:imports` to auto-fix all imports
- [ ] Run `npm run verify:imports` to check for violations
- [ ] Build each module: `bazel build //modules/MODULE:MODULE`
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Update any documentation examples
- [ ] Commit changes

## References

- [Valdi GitHub Repository](https://github.com/Snapchat/Valdi)
- [Valdi Documentation](https://github.com/Snapchat/Valdi/tree/main/docs)
- [Bazel Build System](https://bazel.build/)
- [vendor/valdi Examples](../vendor/valdi/src/valdi_modules/src/valdi/)

## Sources & Further Reading

- [Snapchat's Valdi Framework on GitHub](https://github.com/Snapchat/Valdi)
- [Valdi: A high-performance, declarative, cross-platform UI framework | Medium](https://medium.com/@shouke.wei/valdi-a-high-performance-declarative-cross-platform-ui-framework-77fc8a1a1cad)
- [Valdi FAQ](https://github.com/Snapchat/Valdi/blob/main/docs/docs/faq.md)
- [Valdi Installation Guide](https://github.com/Snapchat/Valdi/blob/main/docs/INSTALL.md)

---

**Last Updated:** 2025-01-25
**Maintainer:** Development Team
**Status:** Active Reference Document
