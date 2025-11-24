# Path Conventions Guide

## Usage
Reference this for correct import paths in Valdi TypeScript project.

## CRITICAL: Valdi Does NOT Support Path Aliases!

**IMPORTANT**: TypeScript path aliases (@common, @chat_core, etc.) defined in `tsconfig.json` are ONLY for IDE autocomplete and Jest tests. Valdi's compiler does NOT support them!

```typescript
// [FAIL] DOES NOT WORK in Valdi (even though IDE shows no error)
import { Message } from '@common';
import { Colors } from '@common/theme';
import { ChatService } from '@chat_core';

// [PASS] WORKS - Use full module paths
import { Message } from 'common/src/types';
import { Colors } from 'common/src/theme';
import { ChatService } from 'chat_core/src/ChatService';
```

## Module Structure
```
modules/
├── common/                 # Shared design system, components, types
│   └── src/
│       ├── index.ts       # Public API barrel export
│       ├── types/         # Shared TypeScript interfaces
│       ├── theme/         # Colors, Spacing, Fonts
│       ├── components/    # Reusable UI components
│       ├── schemas/       # Validation schemas
│       └── utils/         # Helper functions
├── chat_core/             # Core chat logic (no UI)
│   └── src/
│       ├── ChatService.ts
│       ├── MessageStore.ts
│       └── types.ts
├── chat_ui/               # Chat UI components
│   └── src/
│       ├── ChatView.tsx
│       └── MessageList.tsx
├── main_app/              # Root app and navigation
│   └── src/
│       ├── App.tsx
│       └── HomePage.tsx
├── agent_manager/         # AI agent orchestration
├── conversation_manager/  # Conversation state management
├── model_config/          # AI model configuration
├── tools_demo/            # Tool calling demonstrations
├── workflow_demo/         # Workflow pattern demonstrations
└── settings/              # App settings
```

## Import Path Patterns

### Valdi Framework Imports
```typescript
// Valdi core modules - use direct paths
import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import { View, Label, ScrollView, Image } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import { HTTPClient } from 'valdi_http/src/HTTPClient';
```

### Application Module Imports (CRITICAL)
```typescript
// [PASS] CORRECT - Full module paths
import { Colors, Spacing, Fonts, BorderRadius } from 'common/src/theme';
import { Message, Conversation, User } from 'common/src/types';
import { Button, Card, Avatar, LoadingSpinner } from 'common/src/components';
import { MessageStore, messageStore } from 'chat_core/src/MessageStore';
import { ConversationStore } from 'chat_core/src/ConversationStore';
import { ChatService } from 'chat_core/src/ChatService';
import { ChatView } from 'chat_ui/src/ChatView';
import { MessageList } from 'chat_ui/src/MessageList';

// [FAIL] WRONG - Path aliases don't work in Valdi
import { Colors } from '@common/theme';
import { MessageStore } from '@chat_core';
import { ChatView } from '@chat_ui';
```

### Relative Imports (Within Same Module)
```typescript
// Within modules/common/src/components/Button.tsx
import { Colors, Spacing } from '../theme';      // [PASS] OK for same module
import type { ButtonProps } from './types';       // [PASS] OK for same directory
import { Style } from 'valdi_core/src/Style';     // [PASS] External modules always full path
```

### Type-Only Imports
```typescript
// Use 'import type' for better tree-shaking
import type { Message, Conversation } from 'common/src/types';
import { MessageStore, type MessageStoreState } from 'chat_core/src/MessageStore';
```

## Path Aliases (IDE and Tests Only!)

Path aliases in `tsconfig.json` work in:
- [PASS] **VS Code / IDE** - Autocomplete and navigation
- [PASS] **Jest tests** - via jest.config.js moduleNameMapper
- [FAIL] **Valdi builds** - NOT SUPPORTED

```json
// tsconfig.json (IDE only!)
{
  "paths": {
    "@common": ["./modules/common/src/index.ts"],
    "@common/*": ["./modules/common/src/*"],
    "@chat_core": ["./modules/chat_core/src/index.ts"],

    // Valdi mocks for testing
    "valdi_core/src/Component": ["./__mocks__/valdi_core/src/Component.ts"]
  }
}
```

## File Naming Conventions
```
modules/
├── ComponentName.tsx          # PascalCase for components
├── ServiceName.ts             # PascalCase for classes/services
├── types.ts                   # Lowercase for type definitions
├── index.ts                   # Barrel exports
├── utils.ts                   # Lowercase for utilities
└── __tests__/
    └── ComponentName.test.tsx # .test.tsx for tests
```

## Barrel Exports (index.ts)
```typescript
// modules/common/src/index.ts
// Export public API

// Theme
export * from './theme';
export { Colors, Spacing, Fonts, BorderRadius } from './theme';

// Components
export * from './components';
export { Button, Card, Avatar } from './components';

// Types
export * from './types';
export type { Message, Conversation, User } from './types';

// Note: Even with barrel exports, use full paths in Valdi:
// import { Button } from 'common/src/components/Button';
// NOT: import { Button } from 'common';
```

## Common Mistakes

### Mistake 1: Using @alias in Production Code
```typescript
// [FAIL] WRONG - Will fail in Valdi build
import { Colors } from '@common/theme';

// [PASS] CORRECT
import { Colors } from 'common/src/theme';
```

### Mistake 2: Mixing Path Styles
```typescript
// [FAIL] INCONSISTENT
import { Colors } from 'common/src/theme';
import { Button } from '@common/components'; // Different style!

// [PASS] CONSISTENT - Always use full paths
import { Colors } from 'common/src/theme';
import { Button } from 'common/src/components';
```

### Mistake 3: Importing from Barrel When Not Needed
```typescript
// [WARN]  Works but unnecessary indirection
import { Button } from 'common/src/index';

// [PASS] BETTER - Direct import
import { Button } from 'common/src/components/Button';
```

### Mistake 4: Forgetting Type-Only Imports
```typescript
// [WARN]  Works but unnecessary in bundle
import { UserData } from 'common/src/types';

// [PASS] BETTER - Type-only import
import type { UserData } from 'common/src/types';
```

## Quick Reference

### When writing code in module X importing from module Y:
```typescript
// modules/chat_ui/src/ChatView.tsx

// External module [NEXT] Full path
import { Component } from 'valdi_core/src/Component';

// Different app module [NEXT] Full path
import { MessageStore } from 'chat_core/src/MessageStore';
import { Colors } from 'common/src/theme';

// Same module [NEXT] Relative path OK
import { MessageBubble } from './MessageBubble';
import { styles } from './styles';

// Types [NEXT] Use 'import type'
import type { Message } from 'common/src/types';
```

## VSCode Settings
For better path autocomplete, ensure .vscode/settings.json includes:
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.suggest.paths": true
}
```

## Verification Command
```bash
# Grep for incorrect @alias usage in source (excludes tests)
grep -r "@common\|@chat_core\|@chat_ui" modules/*/src/ --include="*.ts" --include="*.tsx" --exclude-dir="__tests__"

# Should return no results!
```

## Remember
- Path aliases = IDE convenience ONLY
- Always use full module paths in Valdi code
- Valdi compiler ignores tsconfig.json paths
- Tests can use aliases via jest.config.js
