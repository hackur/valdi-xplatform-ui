# Project Context: Valdi AI UI

## Project Overview

- **Version**: ContextKit 0.2.0
- **Setup Date**: 2025-11-28
- **Components**: 10 modules discovered and analyzed
- **Workspace**: None (standalone project)
- **Primary Tech Stack**: TypeScript, TSX, Valdi Framework, Vercel AI SDK v5
- **Development Guidelines**: None (TypeScript/JavaScript guidelines not available in ContextKit templates)

## Component Architecture

**Project Structure**:

```
valdi-ai-ui/
├── modules/
│   ├── common/              # Design system & shared components
│   ├── main_app/            # Root app & navigation
│   ├── chat_core/           # AI SDK integration
│   ├── chat_ui/             # Chat interface
│   ├── agent_manager/       # Agent orchestration
│   ├── conversation_manager/# Chat history & persistence
│   ├── model_config/        # Model settings
│   ├── tools_demo/          # Tool calling examples
│   ├── workflow_demo/       # Workflow patterns
│   └── settings/            # App preferences
├── vendor/valdi/            # Valdi framework (vendored)
├── docs/                    # Project documentation
├── scripts/                 # Build & utility scripts
└── __mocks__/               # Test mocks
```

**Component Summary**:
- **10 TypeScript modules** - TSX components with Valdi framework
- **Build system**: Bazel
- **Testing**: Jest with TypeScript
- **Linting**: ESLint + Prettier
- **AI Integration**: Vercel AI SDK v5 with multiple providers (OpenAI, Anthropic, Google)

---

## Module Details

### common - Design System

**Location**: `./modules/common/`
**Purpose**: Shared design system components and utilities
**Tech Stack**: TypeScript, TSX, Valdi

**File Structure**:
```
common/
└── src/
    └── index.ts
```

---

### main_app - Root Application

**Location**: `./modules/main_app/`
**Purpose**: Root app component and navigation
**Tech Stack**: TypeScript, TSX, Valdi

**Key Files**:
- `src/App.tsx` - Main application component
- `src/HomePage.tsx` - Home page component
- `src/index.ts` - Module exports

---

### chat_core - AI Integration

**Location**: `./modules/chat_core/`
**Purpose**: Vercel AI SDK integration, message handling, workflow patterns
**Tech Stack**: TypeScript, Vercel AI SDK v5, Zod

**Key Files**:
- `src/ChatService.ts` - Core chat service
- `src/MessageStore.ts` - Message state management
- `src/StreamHandler.ts` - Real-time streaming
- `src/ToolDefinitions.ts` - Tool schemas
- `src/ToolExecutor.ts` - Tool execution
- `src/ConversationStore.ts` - Conversation management
- `src/ConversationPersistence.ts` - Persistence layer
- Workflow patterns:
  - `src/AgentWorkflow.ts`
  - `src/SequentialWorkflow.ts`
  - `src/ParallelWorkflow.ts`
  - `src/RoutingWorkflow.ts`
  - `src/EvaluatorOptimizerWorkflow.ts`

---

### chat_ui - Chat Interface

**Location**: `./modules/chat_ui/`
**Purpose**: Chat UI components
**Tech Stack**: TypeScript, TSX, Valdi

**Key Files**:
- `src/ChatView.tsx` - Main chat view
- `src/ChatViewStreaming.tsx` - Streaming chat view
- `src/MessageBubble.tsx` - Message display
- `src/InputBar.tsx` - Message input
- `src/ConversationList.tsx` - Conversation list
- `src/ConversationListItem.tsx` - List item component
- `src/ChatIntegrationService.ts` - Chat-UI integration

---

### agent_manager - Agent Orchestration

**Location**: `./modules/agent_manager/`
**Purpose**: Agent framework and workflow engine
**Tech Stack**: TypeScript, Vercel AI SDK

**Key Files**:
- `src/AgentExecutor.ts` - Agent execution
- `src/AgentRegistry.ts` - Agent registration
- `src/WorkflowEngine.ts` - Workflow orchestration
- `src/LoopController.ts` - Agent loop control
- `src/types.ts` - Type definitions

---

### conversation_manager - Chat History

**Location**: `./modules/conversation_manager/`
**Purpose**: Conversation history and search
**Tech Stack**: TypeScript, TSX, Valdi

**Key Files**:
- `src/HistoryManager.ts` - History management
- `src/ConversationListView.tsx` - List view
- `src/ConversationCard.tsx` - Conversation card
- `src/SearchBar.tsx` - Search component

---

### model_config - Model Settings

**Location**: `./modules/model_config/`
**Purpose**: AI model configuration and provider settings
**Tech Stack**: TypeScript, TSX, Valdi

**Key Files**:
- `src/ModelRegistry.ts` - Model registration
- `src/CustomProviderStore.ts` - Custom provider storage
- `src/ModelSelectorView.tsx` - Model selection UI
- `src/ProviderSettingsView.tsx` - Provider settings
- `src/AddCustomProviderView.tsx` - Custom provider UI

---

### settings - App Preferences

**Location**: `./modules/settings/`
**Purpose**: Application settings and preferences
**Tech Stack**: TypeScript, TSX, Valdi

**Key Files**:
- `src/SettingsScreen.tsx` - Settings UI
- `src/PreferencesStore.ts` - Preferences storage
- `src/ApiKeyStore.ts` - API key management
- `src/components/` - Settings UI components (Dropdown, Switch, TextInput)

---

### tools_demo - Tool Examples

**Location**: `./modules/tools_demo/`
**Purpose**: Tool calling demonstration
**Tech Stack**: TypeScript, TSX, Valdi

**Key Files**:
- `src/ToolsDemoScreen.tsx` - Demo screen
- `src/ToolExecutionCard.tsx` - Execution display

---

### workflow_demo - Workflow Patterns

**Location**: `./modules/workflow_demo/`
**Purpose**: Workflow pattern demonstrations
**Tech Stack**: TypeScript, TSX, Valdi

**Key Files**:
- `src/WorkflowDemoScreen.tsx` - Demo screen
- `src/WorkflowCard.tsx` - Workflow display

---

## Development Commands

**Build Commands**:
```bash
# Bazel build (main)
npm run build                    # bazel build //:valdi_ai_ui

# iOS build
npm run build:ios                # Build and install on iOS
npm run build:ios:debug          # iOS debug build

# Android build
npm run build:android            # Build and install on Android

# Module build
npm run build:modules            # Sequential module build
```

**Test Commands**:
```bash
# Jest tests
npm test                         # Run all tests
npm run test:watch               # Watch mode
npm run test:coverage            # With coverage
npm run test:ci                  # CI mode

# Bazel tests
npm run test:bazel               # bazel test //...
```

**Lint & Format Commands**:
```bash
npm run lint                     # ESLint check
npm run lint:fix                 # ESLint fix
npm run format                   # Prettier format
npm run format:check             # Prettier check
npm run type-check               # TypeScript check
```

**Validation Commands**:
```bash
npm run validate                 # type-check + lint + test
npm run validate:quick           # imports + lint only
npm run validate:full            # Full validation suite
npm run validate:imports         # Valdi import validation
npm run validate:deps            # Module dependency validation
```

**Utility Commands**:
```bash
npm run valdi                    # Valdi CLI
npm run fix:imports              # Fix Valdi imports
npm run clean                    # Bazel clean
npm run clean:full               # Full clean (expunge + node_modules)
```

---

## Development Environment

**Requirements**:
- Node.js >= 18.0.0
- npm >= 9.0.0
- Bazel (for builds)
- Xcode (for iOS builds)
- Android Studio (for Android builds)

**Dependencies** (from package.json):

| Package | Version | Purpose |
|---------|---------|---------|
| `@ai-sdk/openai` | ^1.0.0 | OpenAI provider |
| `@ai-sdk/anthropic` | ^1.0.0 | Anthropic provider |
| `@ai-sdk/google` | ^1.0.0 | Google provider |
| `ai` | ^5.0.0 | Vercel AI SDK |
| `zod` | ^3.24.1 | Schema validation |
| `date-fns` | ^4.1.0 | Date utilities |
| `uuid` | ^11.0.3 | UUID generation |

**Code Style**:
- ESLint with TypeScript rules
- Prettier for formatting
- Husky + lint-staged for pre-commit
- TypeScript strict mode

**Formatters**:
- `.prettierrc` - Prettier configuration
- `.eslintrc.js` - ESLint configuration
- Automatic formatting on save via VS Code settings

---

## Valdi Framework Patterns

**IMPORTANT**: This project uses the Valdi framework with specific patterns:

### Style Requirements
- Always use `Style<View>` or `Style<Label>` type parameters
- Use `font: systemFont(16)` instead of `fontSize`
- Use `flexGrow`/`flexShrink` instead of `flex`
- Use individual padding/margin properties (paddingTop, marginLeft, etc.)

### Element Names
- Use lowercase: `<view>`, `<label>`, `<scroll>`, `<textfield>`, `<textview>`
- NOT: `<View>`, `<Text>`, `<ScrollView>`

### TextField Callbacks
- Use `onChange` with `EditTextEvent.text` property
- Use `editable={false}` instead of `disabled`
- Use `<textview>` for multiline input

See `docs/CLAUDE.md` for complete Valdi API patterns documentation.

---

## Constitutional Principles

**Core Principles**:
- Accessibility-first design (UI supports all assistive technologies)
- Privacy by design (minimal data collection, explicit consent)
- Localizability from day one (externalized strings, cultural adaptation)
- Code maintainability (readable, testable, documented code)
- Platform-appropriate UX (native conventions, platform guidelines)

**Workspace Inheritance**: None - using global defaults

---

## ContextKit Workflow

**Systematic Feature Development**:
- `/ctxk:plan:1-spec` - Create business requirements specification
- `/ctxk:plan:2-research-tech` - Define technical research and architecture
- `/ctxk:plan:3-steps` - Break down into implementation tasks

**Development Execution**:
- `/ctxk:impl:start-working` - Continue development within feature branch
- `/ctxk:impl:commit-changes` - Auto-format and commit changes

**Backlog Management**:
- `/ctxk:bckl:add-idea` - Add feature ideas to backlog
- `/ctxk:bckl:add-bug` - Log bugs with evaluation

**Quality Assurance**: Automated agents validate code quality during development

---

## Configuration Hierarchy

**Inheritance**: None (standalone project)

**Override Precedence**: Module-specific configurations override project defaults

---
*Generated by ContextKit with comprehensive component analysis. Manual edits preserved during updates.*
