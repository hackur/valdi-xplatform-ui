# Valdi AI UI - Project Plan

**Open Source Valdi Chat AI Client with Vercel AI SDK v5**

Version: 1.0.0
Status: Planning Phase
Last Updated: November 21, 2025

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Vision & Goals](#vision--goals)
3. [Technology Stack](#technology-stack)
4. [Architecture Design](#architecture-design)
5. [Module Structure](#module-structure)
6. [Key Features](#key-features)
7. [Implementation Phases](#implementation-phases)
8. [AI SDK v5 Integration](#ai-sdk-v5-integration)
9. [Agent Workflows](#agent-workflows)
10. [Technical Specifications](#technical-specifications)
11. [Resources & Documentation](#resources--documentation)
12. [Development Workflow](#development-workflow)
13. [Testing Strategy](#testing-strategy)
14. [Deployment & Distribution](#deployment--distribution)

---

## Project Overview

**Valdi AI UI** is an open-source, cross-platform AI chat client built with the Valdi framework and powered by Vercel's AI SDK v5. This project demonstrates how to build sophisticated AI-powered conversational interfaces that run natively on iOS and Android using Valdi's TypeScript-to-native compilation.

### Project Structure

```
valdi-ai-ui/
├── PROJECT_PLAN.md              # This file
├── README.md                    # Project documentation
├── ARCHITECTURE.md              # Detailed architecture
├── MODULE.bazel                 # Bazel module definition
├── BUILD.bazel                  # Root build configuration
├── package.json                 # NPM dependencies
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.js                 # ESLint configuration
└── modules/
    ├── common/                  # Shared design system & components
    │   └── src/
    │       ├── theme/          # Colors, fonts, spacing
    │       ├── components/     # Reusable UI components
    │       └── types/          # Shared TypeScript types
    ├── main_app/               # Root app with navigation
    │   └── src/
    │       ├── App.tsx         # Root component
    │       └── HomePage.tsx    # Main landing/menu
    ├── chat_core/              # Core chat functionality
    │   └── src/
    │       ├── ChatService.ts  # AI SDK integration
    │       ├── MessageStore.ts # Message state management
    │       └── StreamHandler.ts # Streaming utilities
    ├── chat_ui/                # Chat interface components
    │   └── src/
    │       ├── ChatView.tsx    # Main chat interface
    │       ├── MessageList.tsx # Message display
    │       ├── MessageBubble.tsx # Individual message
    │       └── InputBar.tsx    # Message input
    ├── agent_manager/          # Agent orchestration
    │   └── src/
    │       ├── AgentRegistry.ts # Agent definitions
    │       ├── WorkflowEngine.ts # Workflow execution
    │       └── ToolExecutor.ts  # Tool calling
    ├── conversation_manager/   # Conversation management
    │   └── src/
    │       ├── ConversationStore.ts # Conversation persistence
    │       ├── HistoryManager.ts    # Chat history
    │       └── ExportService.ts     # Export functionality
    ├── model_config/           # AI model configuration
    │   └── src/
    │       ├── ModelRegistry.ts # Available models
    │       ├── ProviderConfig.ts # Provider settings
    │       └── ConfigUI.tsx     # Settings UI
    ├── tools_demo/             # Tool calling demonstrations
    │   └── src/
    │       ├── ToolsPage.tsx   # Tools showcase
    │       └── tools/          # Individual tool implementations
    ├── workflow_demo/          # Workflow pattern demonstrations
    │   └── src/
    │       ├── SequentialDemo.tsx
    │       ├── RoutingDemo.tsx
    │       ├── ParallelDemo.tsx
    │       └── EvaluatorDemo.tsx
    └── settings/               # App settings & preferences
        └── src/
            ├── SettingsPage.tsx
            └── PreferencesStore.ts
```

---

## Vision & Goals

### Primary Vision

Create a production-quality, open-source AI chat client that showcases:
- Native mobile AI chat experiences using Valdi
- Vercel AI SDK v5 integration in non-web environments
- Advanced agent workflows and multi-agent orchestration
- Best practices for building conversational AI interfaces

### Goals

1. **Educational**: Teach developers how to integrate AI SDK v5 with Valdi
2. **Practical**: Provide a functional chat client for real-world use
3. **Extensible**: Create a framework for building custom AI agents
4. **Cross-platform**: Run identically on iOS and Android
5. **Open Source**: Foster community contributions and learning

### Target Audience

- Valdi developers exploring AI integration
- AI engineers interested in native mobile experiences
- Open-source contributors building conversational AI
- Developers learning agent orchestration patterns

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Valdi** | Latest | Cross-platform UI framework (TypeScript → Native) |
| **Vercel AI SDK** | v5.x | AI model integration, streaming, tool calling |
| **TypeScript** | 5.x | Type-safe development |
| **Bazel** | Latest | Build system and dependency management |

### AI SDK Components

- **@ai-sdk/core**: Core AI functionality, tool calling, agents
- **@ai-sdk/openai**: OpenAI provider integration
- **@ai-sdk/anthropic**: Anthropic (Claude) provider integration
- **@ai-sdk/google**: Google (Gemini) provider integration
- **zod**: Schema validation for tool parameters

### Valdi Modules

- **valdi_core**: Component system, state management, styling
- **valdi_tsx**: JSX/TSX support, native elements
- **valdi_navigation**: Page navigation and routing

### State Management

- Custom message store using Valdi's StatefulComponent
- Persistent storage for conversation history
- Real-time streaming state management

### Additional Dependencies

- **date-fns**: Date formatting and manipulation
- **uuid**: Unique ID generation for messages
- **async**: Async utilities for workflows
- **zod**: Runtime type validation

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Valdi UI Layer                       │
│  (Native iOS/Android Components via TypeScript/TSX)     │
└────────────┬──────────────────────────────┬─────────────┘
             │                              │
             ▼                              ▼
┌────────────────────────┐    ┌────────────────────────────┐
│   Chat UI Module       │    │  Settings & Config Module   │
│  - Message Display     │    │  - Model Selection          │
│  - Input Handling      │    │  - Provider Configuration   │
│  - Streaming Updates   │    │  - User Preferences         │
└────────────┬───────────┘    └──────────────┬─────────────┘
             │                               │
             └───────────┬───────────────────┘
                         ▼
             ┌───────────────────────┐
             │  Chat Core Module     │
             │  - Message Store      │
             │  - Stream Handler     │
             │  - AI SDK Integration │
             └───────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌────────────┐ ┌──────────────────┐
│ Agent Manager  │ │ Tool       │ │ Conversation     │
│ - Workflows    │ │ Executor   │ │ Manager          │
│ - Orchestration│ │ - Function │ │ - History        │
│ - Loop Control │ │   Calling  │ │ - Persistence    │
└────────┬───────┘ └──────┬─────┘ └────────┬─────────┘
         │                │                │
         └────────────────┼────────────────┘
                          ▼
              ┌───────────────────────┐
              │  Vercel AI SDK v5     │
              │  - streamText         │
              │  - generateText       │
              │  - Agent class        │
              │  - Tool definitions   │
              └───────────┬───────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌────────────────┐ ┌──────────────┐ ┌────────────────┐
│  OpenAI        │ │  Anthropic   │ │  Google        │
│  (GPT-4, etc)  │ │  (Claude)    │ │  (Gemini)      │
└────────────────┘ └──────────────┘ └────────────────┘
```

### Data Flow

1. **User Input** → Valdi Chat UI captures text input
2. **Message Creation** → New message added to local store
3. **AI SDK Call** → Chat Core sends request via AI SDK with streaming
4. **Stream Processing** → Real-time chunks processed and displayed
5. **Tool Execution** → If tools called, execute and feed back to model
6. **State Updates** → UI automatically updates via reactive state
7. **Persistence** → Messages saved to conversation history

### Component Communication

- **Props Down**: Parent components pass data via props
- **Events Up**: Child components emit events to parents
- **Shared State**: Message store accessible across components
- **Navigation**: NavigationController for page transitions

---

## Module Structure

### 1. Common Module (`modules/common`)

**Purpose**: Shared design system, reusable components, types

**Components**:
- `Button` - Primary, secondary, ghost, outline variants
- `Card` - Elevation-based container component
- `Avatar` - User/AI avatar display
- `LoadingSpinner` - Activity indicator
- `EmptyState` - No data placeholder
- `ErrorBoundary` - Error handling wrapper

**Theme**:
- Color palette (primary, secondary, semantic colors)
- Typography scale (fonts, sizes, weights)
- Spacing system (4px base grid)
- Shadow definitions (elevation system)
- Border radius values

**Types**:
- `Message` - Chat message interface
- `Conversation` - Conversation metadata
- `Agent` - Agent definition
- `Tool` - Tool specification

### 2. Main App Module (`modules/main_app`)

**Purpose**: Application root, navigation, main menu

**Components**:
- `App.tsx` - Root component with NavigationRoot
- `HomePage.tsx` - Landing page with feature cards
- `AboutPage.tsx` - App information

**Features**:
- Navigation setup
- Deep linking (future)
- App lifecycle management

### 3. Chat Core Module (`modules/chat_core`)

**Purpose**: Core chat functionality, AI SDK integration

**Services**:
- `ChatService` - AI SDK wrapper, message sending
- `MessageStore` - Reactive message state management
- `StreamHandler` - Streaming response processing
- `ProviderManager` - Multi-provider support

**Key Features**:
- Message streaming with real-time updates
- Error handling and retry logic
- Provider switching (OpenAI, Anthropic, Google)
- Conversation context management
- Token counting and limits

### 4. Chat UI Module (`modules/chat_ui`)

**Purpose**: User interface for chat conversations

**Components**:
- `ChatView` - Main chat screen
- `MessageList` - Scrollable message display
- `MessageBubble` - Individual message rendering
- `InputBar` - Text input with send button
- `TypingIndicator` - "AI is typing..." animation
- `RegenerateButton` - Regenerate last response

**Features**:
- Auto-scroll to latest message
- Copy message text
- Markdown rendering (bold, italic, code blocks)
- Code syntax highlighting
- Message timestamps
- Error message display

### 5. Agent Manager Module (`modules/agent_manager`)

**Purpose**: Agent orchestration, workflow execution

**Components**:
- `AgentRegistry` - Agent definitions and metadata
- `WorkflowEngine` - Execute workflow patterns
- `ToolExecutor` - Handle tool calling
- `LoopController` - Manage agentic loops

**Workflows Supported**:
- Sequential (chain of steps)
- Routing (decision-based paths)
- Parallel (concurrent execution)
- Evaluator-Optimizer (quality control)
- Orchestrator-Worker (specialized agents)

**Agent Types**:
- General Assistant
- Code Expert (tool: execute code)
- Research Agent (tool: web search)
- Data Analyst (tool: query data)
- Creative Writer
- Custom user-defined agents

### 6. Conversation Manager Module (`modules/conversation_manager`)

**Purpose**: Conversation persistence and management

**Components**:
- `ConversationStore` - CRUD operations for conversations
- `HistoryManager` - Message history with pagination
- `SearchService` - Search across conversations
- `ExportService` - Export to JSON, Markdown, TXT

**Features**:
- Create/read/update/delete conversations
- Tag conversations
- Pin important conversations
- Archive old conversations
- Full-text search
- Export/import functionality

### 7. Model Config Module (`modules/model_config`)

**Purpose**: AI model and provider configuration

**Components**:
- `ModelRegistry` - Available models list
- `ProviderConfig` - API key management
- `ConfigUI` - Settings interface
- `ModelSelector` - Model picker component

**Supported Providers**:
- OpenAI (GPT-4, GPT-4 Turbo, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus, Haiku)
- Google (Gemini 2.0, Gemini 1.5 Pro)
- xAI (Grok)
- Custom endpoint support

**Configuration Options**:
- API keys (securely stored)
- Model selection
- Temperature, top_p, max_tokens
- System prompts
- Streaming on/off
- Tool calling enabled/disabled

### 8. Tools Demo Module (`modules/tools_demo`)

**Purpose**: Showcase tool calling capabilities

**Demo Tools**:
- `weatherTool` - Get weather information
- `calculatorTool` - Perform calculations
- `webSearchTool` - Search the web (mock)
- `codeExecutorTool` - Run code snippets (sandboxed)
- `databaseQueryTool` - Query sample data
- `imageGeneratorTool` - Generate images (mock)

**Components**:
- `ToolsPage` - Tools showcase and demo
- `ToolCard` - Individual tool display
- `ToolExecutionLog` - Execution history

### 9. Workflow Demo Module (`modules/workflow_demo`)

**Purpose**: Demonstrate AI agent workflow patterns

**Components**:
- `SequentialDemo` - Chain of steps example
- `RoutingDemo` - Decision-based routing
- `ParallelDemo` - Concurrent execution
- `EvaluatorDemo` - Quality control loop

**Examples**:
- Content generation pipeline
- Customer support routing
- Multi-perspective code review
- Translation with evaluation

### 10. Settings Module (`modules/settings`)

**Purpose**: App configuration and user preferences

**Settings Sections**:
- Model & Provider
- Appearance (theme, font size)
- Behavior (auto-save, notifications)
- Privacy & Data
- About & Feedback

---

## Key Features

### Core Features

#### 1. Multi-Model Chat Interface
- Support for multiple AI providers (OpenAI, Anthropic, Google)
- Real-time streaming responses
- Message history with conversation management
- Markdown and code block rendering

#### 2. Agent Workflows
- Sequential workflow execution
- Intelligent routing based on context
- Parallel task processing
- Evaluator-optimizer patterns
- Orchestrator-worker coordination

#### 3. Tool Calling
- Define custom tools with Zod schemas
- Automatic tool execution during conversations
- Tool result visualization
- Error handling and retry mechanisms

#### 4. Conversation Management
- Multiple conversation threads
- Persistent storage of chat history
- Search across conversations
- Export conversations (JSON, Markdown)
- Tag and organize conversations

#### 5. Model Configuration
- Switch between different AI models
- Configure provider settings (API keys)
- Adjust model parameters (temperature, max tokens)
- Custom system prompts per conversation

### Advanced Features

#### 6. Agentic Loop Control
- `stopWhen` conditions (step count, specific tool call)
- `prepareStep` parameter adjustment per step
- Context compression for long conversations
- Dynamic tool enabling/disabling

#### 7. Multi-Agent Orchestration
- Define specialized agents with unique tools
- Hand off between agents during conversation
- Maintain context across agent switches
- Agent performance monitoring

#### 8. Streaming Enhancements
- Real-time token streaming
- Partial tool input streaming
- Status indicators (submitted, streaming, ready)
- Streaming error recovery

#### 9. Type-Safe Development
- Full TypeScript support throughout
- Zod schema validation for tool parameters
- Type-safe message and state management
- Generic types for custom message structures

#### 10. Cross-Platform Native UI
- Native iOS and Android rendering (no WebView)
- Smooth animations and gestures
- Native scrolling performance
- Platform-specific UI adaptations

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Set up project structure and basic infrastructure

**Tasks**:
1. Initialize Valdi workspace
   - Create MODULE.bazel and BUILD.bazel
   - Set up directory structure
   - Configure TypeScript and ESLint
   - Install dependencies

2. Create common module
   - Define design system (colors, fonts, spacing)
   - Build reusable components (Button, Card, etc.)
   - Set up theme configuration
   - Create shared TypeScript types

3. Set up main app module
   - Create root App component with NavigationRoot
   - Build HomePage with navigation
   - Implement basic routing

4. Documentation
   - Write README with setup instructions
   - Document module structure
   - Create contribution guidelines

**Deliverables**:
- Working Valdi project structure
- Reusable design system
- Basic navigation flow
- Development environment documentation

---

### Phase 2: Chat Core (Weeks 3-4)

**Goal**: Implement core chat functionality with AI SDK integration

**Tasks**:
1. AI SDK Integration
   - Install and configure @ai-sdk/core
   - Set up provider integrations (OpenAI, Anthropic)
   - Create ChatService wrapper
   - Implement streaming handler

2. Message Management
   - Build MessageStore for state management
   - Implement message CRUD operations
   - Add conversation context handling
   - Create persistence layer (local storage)

3. Basic Chat UI
   - Build ChatView component
   - Create MessageList with auto-scroll
   - Implement MessageBubble rendering
   - Add InputBar with send functionality

4. Testing
   - Unit tests for ChatService
   - Integration tests for message flow
   - UI component tests

**Deliverables**:
- Functional chat interface
- Working AI SDK integration
- Message streaming capability
- Test coverage for core functionality

---

### Phase 3: Agent System (Weeks 5-6)

**Goal**: Implement agent workflows and tool calling

**Tasks**:
1. Tool Calling Infrastructure
   - Define tool schema with Zod
   - Build ToolExecutor service
   - Implement tool registration system
   - Create example tools (calculator, weather, etc.)

2. Agent Framework
   - Build AgentRegistry for agent definitions
   - Create WorkflowEngine for executing patterns
   - Implement LoopController for agentic loops
   - Add stopWhen and prepareStep support

3. Workflow Patterns
   - Implement sequential workflow
   - Build routing workflow
   - Create parallel execution workflow
   - Add evaluator-optimizer pattern

4. Agent UI
   - Build agent selection interface
   - Create tool execution visualizer
   - Add workflow progress indicators

**Deliverables**:
- Working tool calling system
- Agent workflow execution engine
- Example agents with tools
- Workflow demonstration UI

---

### Phase 4: Advanced Features (Weeks 7-8)

**Goal**: Add conversation management and configuration

**Tasks**:
1. Conversation Management
   - Build ConversationStore with CRUD operations
   - Implement conversation list UI
   - Add search functionality
   - Create export service (JSON, Markdown)

2. Model Configuration
   - Build model selection UI
   - Implement provider configuration
   - Add parameter adjustment (temperature, tokens)
   - Create system prompt editor

3. Multi-Agent Orchestration
   - Implement agent handoff mechanism
   - Build orchestrator-worker pattern
   - Add agent coordination UI
   - Create agent performance metrics

4. Settings & Preferences
   - Build settings page
   - Implement preference storage
   - Add appearance customization
   - Create about page

**Deliverables**:
- Full conversation management system
- Configurable model settings
- Multi-agent coordination
- Complete settings interface

---

### Phase 5: Polish & Demo (Weeks 9-10)

**Goal**: Polish UI, add demos, prepare for release

**Tasks**:
1. UI Polish
   - Refine animations and transitions
   - Improve error states and loading indicators
   - Add haptic feedback
   - Optimize scrolling performance

2. Demo Modules
   - Create tools demo showcase
   - Build workflow demo examples
   - Add tutorial/onboarding flow
   - Create sample conversations

3. Documentation
   - Write comprehensive README
   - Create architecture documentation
   - Add inline code comments
   - Build API reference

4. Testing & QA
   - End-to-end testing
   - Performance testing
   - Cross-platform testing (iOS & Android)
   - User acceptance testing

5. Release Preparation
   - Set up CI/CD pipeline
   - Prepare app store assets
   - Create release notes
   - Plan launch strategy

**Deliverables**:
- Production-ready app
- Comprehensive documentation
- Demo content and tutorials
- Release-ready builds for iOS & Android

---

## AI SDK v5 Integration

### Core Integration Points

#### 1. Text Generation with Streaming

```typescript
import { streamText } from '@ai-sdk/core';
import { openai } from '@ai-sdk/openai';

// In ChatService.ts
async sendMessage(message: string, conversationId: string) {
  const conversation = this.getConversation(conversationId);

  const stream = streamText({
    model: openai('gpt-4-turbo'),
    messages: conversation.messages,
    system: conversation.systemPrompt,
    onChunk: (chunk) => {
      // Update UI with streaming chunk
      this.messageStore.appendToLastMessage(chunk.text);
    },
    onFinish: (result) => {
      // Mark message as complete
      this.messageStore.markMessageComplete(result);
    },
  });

  return stream;
}
```

#### 2. Tool Calling Implementation

```typescript
import { tool } from '@ai-sdk/core';
import { z } from 'zod';

// Define tools with Zod schemas
const weatherTool = tool({
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name or coordinates'),
    unit: z.enum(['celsius', 'fahrenheit']).optional(),
  }),
  execute: async ({ location, unit = 'celsius' }) => {
    // Call weather API
    const weather = await getWeather(location, unit);
    return weather;
  },
});

// Use tools in conversation
const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages: conversation.messages,
  tools: { weather: weatherTool },
  maxSteps: 5, // Allow up to 5 tool calling steps
});
```

#### 3. Agent with Loop Control

```typescript
import { Agent } from '@ai-sdk/core';
import { stepCountIs, hasToolCall } from '@ai-sdk/core/utils';

// Create agent with loop control
const researchAgent = new Agent({
  model: openai('gpt-4-turbo'),
  system: 'You are a research assistant...',
  tools: { search: searchTool, summarize: summarizeTool },
  stopWhen: [
    stepCountIs(10), // Max 10 steps
    hasToolCall('finalAnswer'), // Stop when final answer provided
  ],
  prepareStep: ({ stepNumber, messages }) => {
    // Compress context after 5 steps
    if (stepNumber > 5) {
      return {
        messages: compressMessages(messages),
      };
    }
    return {};
  },
});

// Execute agent
const result = await researchAgent.generateText({
  prompt: 'Research the latest developments in quantum computing',
});
```

#### 4. Workflow Patterns

**Sequential Workflow**:
```typescript
// Generate → Evaluate → Regenerate if needed
const content = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write marketing copy for product X',
});

const evaluation = await generateText({
  model: openai('gpt-4-turbo'),
  prompt: `Evaluate this marketing copy: ${content.text}`,
});

if (evaluation.score < 0.8) {
  // Regenerate with feedback
  const improvedContent = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: `Improve this copy based on feedback: ${evaluation.feedback}`,
  });
}
```

**Parallel Workflow**:
```typescript
// Execute multiple analyses concurrently
const [security, performance, maintainability] = await Promise.all([
  generateText({
    model: openai('gpt-4-turbo'),
    prompt: 'Analyze code for security issues',
    tools: { checkVulnerability: securityTool },
  }),
  generateText({
    model: openai('gpt-4-turbo'),
    prompt: 'Analyze code for performance',
    tools: { profileCode: performanceTool },
  }),
  generateText({
    model: openai('gpt-4-turbo'),
    prompt: 'Analyze code for maintainability',
    tools: { checkComplexity: maintainabilityTool },
  }),
]);
```

#### 5. Provider Management

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// Provider registry
const providers = {
  openai: {
    'gpt-4-turbo': openai('gpt-4-turbo'),
    'gpt-4': openai('gpt-4'),
    'gpt-3.5-turbo': openai('gpt-3.5-turbo'),
  },
  anthropic: {
    'claude-3-5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
    'claude-3-opus': anthropic('claude-3-opus-20240229'),
    'claude-3-haiku': anthropic('claude-3-haiku-20240307'),
  },
  google: {
    'gemini-2.0-flash': google('gemini-2.0-flash-exp'),
    'gemini-1.5-pro': google('gemini-1.5-pro'),
  },
};

// Dynamic model selection
function getModel(provider: string, modelName: string) {
  return providers[provider][modelName];
}
```

---

## Agent Workflows

### Workflow Patterns Implementation

#### 1. Sequential Workflow (Content Pipeline)

**Use Case**: Generate blog post → Evaluate quality → Improve if needed

```typescript
class SequentialWorkflow {
  async execute(prompt: string) {
    // Step 1: Generate initial content
    const generation = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: prompt,
      system: 'You are a professional content writer.',
    });

    // Step 2: Evaluate quality
    const evaluation = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `Evaluate this content on a scale of 0-10: ${generation.text}`,
      system: 'You are a content quality evaluator.',
    });

    const score = parseFloat(evaluation.text);

    // Step 3: Regenerate if score < 8
    if (score < 8) {
      const improved = await generateText({
        model: openai('gpt-4-turbo'),
        prompt: `Improve this content: ${generation.text}`,
        system: 'You are an expert content editor.',
      });
      return improved.text;
    }

    return generation.text;
  }
}
```

#### 2. Routing Workflow (Customer Support)

**Use Case**: Classify query type → Route to appropriate handler

```typescript
class RoutingWorkflow {
  async execute(userQuery: string) {
    // Step 1: Classify the query
    const classification = await generateText({
      model: openai('gpt-3.5-turbo'), // Fast, cheap model
      prompt: `Classify this customer query as one of: general, refund, technical\n\nQuery: ${userQuery}`,
      system: 'You are a query classifier. Respond with only one word.',
    });

    const category = classification.text.trim().toLowerCase();

    // Step 2: Route to appropriate agent
    switch (category) {
      case 'refund':
        return this.handleRefund(userQuery);
      case 'technical':
        return this.handleTechnical(userQuery);
      default:
        return this.handleGeneral(userQuery);
    }
  }

  private async handleRefund(query: string) {
    return generateText({
      model: openai('gpt-4-turbo'), // Larger model for complex issues
      prompt: query,
      system: 'You are a refund specialist...',
      tools: { checkOrder: orderTool, processRefund: refundTool },
    });
  }

  // ... other handlers
}
```

#### 3. Parallel Workflow (Code Review)

**Use Case**: Run multiple code analyses simultaneously

```typescript
class ParallelWorkflow {
  async execute(code: string) {
    // Execute all analyses in parallel
    const [securityReview, performanceReview, styleReview] = await Promise.all([
      generateText({
        model: openai('gpt-4-turbo'),
        prompt: `Review this code for security vulnerabilities:\n\n${code}`,
        system: 'You are a security expert.',
      }),
      generateText({
        model: openai('gpt-4-turbo'),
        prompt: `Review this code for performance issues:\n\n${code}`,
        system: 'You are a performance optimization expert.',
      }),
      generateText({
        model: openai('gpt-4-turbo'),
        prompt: `Review this code for style and best practices:\n\n${code}`,
        system: 'You are a code style expert.',
      }),
    ]);

    // Aggregate results
    return {
      security: securityReview.text,
      performance: performanceReview.text,
      style: styleReview.text,
    };
  }
}
```

#### 4. Evaluator-Optimizer Workflow (Translation)

**Use Case**: Translate text → Evaluate translation → Improve iteratively

```typescript
class EvaluatorOptimizerWorkflow {
  async execute(text: string, targetLang: string, maxIterations = 3) {
    let translation = '';
    let iteration = 0;

    while (iteration < maxIterations) {
      // Generate translation
      const result = await generateText({
        model: openai('gpt-3.5-turbo'), // Smaller model for generation
        prompt: iteration === 0
          ? `Translate to ${targetLang}: ${text}`
          : `Improve this translation based on feedback:\n\nOriginal: ${text}\nTranslation: ${translation}\nFeedback: ${feedback}`,
      });

      translation = result.text;

      // Evaluate quality
      const evaluation = await generateText({
        model: openai('gpt-4-turbo'), // Larger model for evaluation
        prompt: `Evaluate this translation quality (0-10):\n\nOriginal: ${text}\nTranslation: ${translation}`,
      });

      const score = parseFloat(evaluation.text);

      // Stop if quality is good enough
      if (score >= 9) {
        break;
      }

      iteration++;
    }

    return translation;
  }
}
```

#### 5. Orchestrator-Worker Pattern (Research Project)

**Use Case**: Central orchestrator delegates tasks to specialized workers

```typescript
class OrchestratorWorkerWorkflow {
  private workers = {
    researcher: new Agent({
      model: openai('gpt-4-turbo'),
      system: 'You are a research specialist.',
      tools: { search: searchTool, readPaper: paperTool },
    }),
    writer: new Agent({
      model: openai('gpt-4-turbo'),
      system: 'You are a technical writer.',
      tools: { formatText: formatTool },
    }),
    reviewer: new Agent({
      model: openai('gpt-4-turbo'),
      system: 'You are a peer reviewer.',
      tools: { checkFacts: factCheckTool },
    }),
  };

  async execute(topic: string) {
    const orchestrator = new Agent({
      model: openai('gpt-4-turbo'),
      system: 'You are a research project manager. Coordinate the team to produce a comprehensive report.',
      tools: {
        assignResearch: tool({
          description: 'Assign research task to researcher',
          inputSchema: z.object({ query: z.string() }),
          execute: async ({ query }) => {
            return this.workers.researcher.generateText({ prompt: query });
          },
        }),
        assignWriting: tool({
          description: 'Assign writing task to writer',
          inputSchema: z.object({ content: z.string() }),
          execute: async ({ content }) => {
            return this.workers.writer.generateText({ prompt: `Write a report section: ${content}` });
          },
        }),
        assignReview: tool({
          description: 'Assign review task to reviewer',
          inputSchema: z.object({ draft: z.string() }),
          execute: async ({ draft }) => {
            return this.workers.reviewer.generateText({ prompt: `Review this draft: ${draft}` });
          },
        }),
      },
      maxSteps: 20,
    });

    // Orchestrator coordinates the workflow
    const result = await orchestrator.generateText({
      prompt: `Create a comprehensive research report on: ${topic}`,
    });

    return result.text;
  }
}
```

---

## Technical Specifications

### Platform Requirements

**iOS**:
- Minimum version: iOS 14.0+
- Target devices: iPhone, iPad
- Xcode 15.0+

**Android**:
- Minimum SDK: API 24 (Android 7.0)
- Target SDK: API 35 (Android 15)
- Android Studio: Latest stable

### Performance Targets

- **Message Rendering**: < 16ms per frame (60 FPS)
- **Stream Processing**: < 50ms latency for chunk display
- **Message Load**: < 200ms for 100 messages
- **Navigation**: < 300ms page transitions
- **Tool Execution**: Depends on tool complexity, non-blocking UI

### Security & Privacy

**API Key Storage**:
- Secure keychain storage (iOS Keychain, Android Keystore)
- No plaintext storage in app bundle or file system
- Optional: User-provided keys stored securely

**Data Privacy**:
- Conversations stored locally by default
- Optional cloud sync (user-controlled)
- No telemetry without user consent
- Export/delete data functionality

**Network Security**:
- HTTPS only for all API calls
- Certificate pinning for sensitive operations
- Timeout and retry policies

### Memory Management

- Message pagination (load 50 messages at a time)
- Image caching with size limits
- Stream buffer management
- Conversation history limits (configurable)

### Error Handling

**Network Errors**:
- Automatic retry with exponential backoff
- Offline mode detection
- User-friendly error messages

**API Errors**:
- Rate limit handling with user notification
- Invalid API key detection
- Model unavailability fallback

**Tool Execution Errors**:
- Sandboxed tool execution
- Timeout protection
- Error reporting to model for self-correction

---

## Resources & Documentation

### Official Documentation

#### Vercel AI SDK v5

| Resource | URL | Description |
|----------|-----|-------------|
| **AI SDK Documentation** | https://ai-sdk.dev/docs/introduction | Official AI SDK v5 docs |
| **AI SDK Core** | https://ai-sdk.dev/docs/ai-sdk-core | Core functionality, tools, agents |
| **AI SDK UI** | https://ai-sdk.dev/docs/ai-sdk-ui | UI integration patterns |
| **Tool Calling** | https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling | Tool definition and execution |
| **Agent Workflows** | https://ai-sdk.dev/docs/agents/workflows | Workflow patterns documentation |
| **AI SDK 5 Announcement** | https://vercel.com/blog/ai-sdk-5 | Release blog post with features |
| **GitHub Repository** | https://github.com/vercel/ai | Source code and examples |
| **Vercel Academy** | https://vercel.com/academy/ai-sdk | Video tutorials and courses |

#### Valdi Framework

| Resource | URL | Description |
|----------|-----|-------------|
| **Valdi Docs** | ../Valdi/docs/README.md | Main documentation |
| **Getting Started** | ../Valdi/docs/start-install.md | Installation and setup |
| **API Reference** | ../Valdi/docs/api/api-reference-elements.md | Element and API reference |
| **Style Guide** | ../Valdi/docs/workflow-style-guide.md | Best practices and patterns |

### Example Projects

| Project | URL | Description |
|---------|-----|-------------|
| **Vercel AI Chatbot** | https://github.com/vercel/ai-chatbot | Full Next.js chatbot example |
| **AI SDK Examples** | https://github.com/vercel/ai/tree/main/examples | Official examples collection |
| **Kitchen Sink** | ../valdi-kitchen-sink | Valdi demo app (this repo) |

### Additional Resources

#### AI Providers

- **OpenAI API**: https://platform.openai.com/docs
- **Anthropic API**: https://docs.anthropic.com
- **Google AI**: https://ai.google.dev/docs

#### Related Technologies

- **Zod Documentation**: https://zod.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Bazel Documentation**: https://bazel.build/docs

### Community & Support

- **Valdi Community**: (TBD - Discord/Slack)
- **Vercel AI SDK Discord**: https://discord.gg/vercel
- **GitHub Discussions**: Create discussions in this repo
- **Issue Tracker**: Report bugs and feature requests

---

## Development Workflow

### Local Development Setup

1. **Clone Repository**:
```bash
cd /Users/sarda/valdi-xplatform-ui/valdi-ai-ui
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Configure Valdi**:
```bash
cd ../Valdi
valdi dev_setup
```

4. **Set Environment Variables**:
```bash
# Create .env file (not committed to git)
echo "OPENAI_API_KEY=your_key_here" > .env
echo "ANTHROPIC_API_KEY=your_key_here" >> .env
```

5. **Build Project**:
```bash
# From Valdi directory
bazel build //apps/valdi-ai-ui:valdi_ai_ui
```

6. **Run on iOS**:
```bash
valdi install ios --app=//apps/valdi-ai-ui:valdi_ai_ui
open bazel-bin/apps/valdi-ai-ui/valdi_ai_ui.xcodeproj
```

7. **Run on Android**:
```bash
valdi install android --app=//apps/valdi-ai-ui:valdi_ai_ui
adb install -r bazel-bin/apps/valdi-ai-ui/valdi_ai_ui.apk
```

### Hot Reload Development

```bash
# Start hot reload server
valdi hotreload

# Make changes to .tsx/.ts files
# Changes appear instantly in running app
```

### Code Style

**TypeScript**:
- Use TypeScript strict mode
- Prefer interfaces over types
- Use explicit return types for functions
- Avoid `any` types

**Naming Conventions**:
- PascalCase for components and classes
- camelCase for variables and functions
- UPPER_SNAKE_CASE for constants
- Descriptive names (no abbreviations)

**File Organization**:
- One component per file
- Co-locate styles with components
- Group related files in directories
- Index files for clean imports

**Comments**:
- JSDoc for public APIs
- Inline comments for complex logic
- TODO comments with owner and date

### Git Workflow

**Branches**:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/feature-name` - Feature branches
- `bugfix/bug-name` - Bug fix branches

**Commit Messages**:
- Use conventional commits format
- `feat: Add tool calling support`
- `fix: Resolve streaming issue`
- `docs: Update architecture documentation`
- `refactor: Simplify message store logic`

**Pull Requests**:
- Create PR from feature branch to develop
- Include description of changes
- Link related issues
- Request review from maintainers
- Ensure CI passes before merge

---

## Testing Strategy

### Unit Tests

**Target Coverage**: 80%+

**Test Files**: Co-located with source files (`*.test.ts`)

**Example**:
```typescript
// ChatService.test.ts
describe('ChatService', () => {
  it('should send message and stream response', async () => {
    const service = new ChatService();
    const stream = await service.sendMessage('Hello', 'conv-1');
    // Assert streaming behavior
  });
});
```

**Run Tests**:
```bash
npm test
# or
valdi test --target //modules/chat_core:test
```

### Integration Tests

**Scope**: Test module interactions

**Example**:
- ChatService + MessageStore
- Agent workflows end-to-end
- Tool execution flow

### UI Component Tests

**Framework**: Valdi testing utilities

**Example**:
```typescript
// MessageBubble.test.tsx
describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    const message = { role: 'user', content: 'Hello' };
    const bubble = render(<MessageBubble message={message} />);
    expect(bubble.getText()).toContain('Hello');
  });
});
```

### End-to-End Tests

**Scope**: Complete user flows

**Scenarios**:
- Send message and receive response
- Execute tool during conversation
- Switch between models
- Export conversation
- Create new conversation

### Performance Tests

**Metrics**:
- Message rendering time
- Stream processing latency
- Memory usage over time
- Conversation load time

**Tools**:
- iOS: Xcode Instruments
- Android: Android Studio Profiler

---

## Deployment & Distribution

### Build Configurations

**Development**:
```bash
bazel build //apps/valdi-ai-ui:valdi_ai_ui
```

**Release (Optimized)**:
```bash
bazel build -c opt //apps/valdi-ai-ui:valdi_ai_ui
```

### iOS Deployment

1. **Code Signing**:
   - Set up Apple Developer account
   - Create provisioning profiles
   - Configure signing in Xcode

2. **Build Archive**:
```bash
xcodebuild -project bazel-bin/apps/valdi-ai-ui/valdi_ai_ui.xcodeproj \
  -scheme valdi_ai_ui \
  -configuration Release \
  archive -archivePath build/VaidiAIUI.xcarchive
```

3. **Export IPA**:
```bash
xcodebuild -exportArchive \
  -archivePath build/VaidiAIUI.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

4. **Submit to App Store**:
   - Use Xcode or Transporter
   - Provide app metadata, screenshots
   - Submit for review

### Android Deployment

1. **Generate Signing Key**:
```bash
keytool -genkey -v -keystore release.keystore \
  -alias valdi-ai-ui -keyalg RSA -keysize 2048 -validity 10000
```

2. **Build Release APK**:
```bash
bazel build -c opt //apps/valdi-ai-ui:valdi_ai_ui_android
```

3. **Sign APK**:
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore release.keystore \
  bazel-bin/apps/valdi-ai-ui/valdi_ai_ui.apk valdi-ai-ui
```

4. **Upload to Google Play**:
   - Create app listing
   - Upload APK/AAB
   - Provide store listing details
   - Submit for review

### Open Source Distribution

**GitHub Release**:
- Tag versions (v1.0.0, v1.1.0, etc.)
- Create release notes
- Attach compiled binaries
- Update changelog

**Documentation**:
- Keep README up to date
- Maintain API documentation
- Provide contribution guidelines
- Include code of conduct

**Community**:
- Respond to issues promptly
- Review pull requests
- Foster contributor community
- Acknowledge contributors

---

## Next Steps

### Immediate Actions

1. ✅ Complete this comprehensive plan document
2. ⬜ Set up initial workspace structure
3. ⬜ Create MODULE.bazel and BUILD.bazel files
4. ⬜ Initialize common module with design system
5. ⬜ Install AI SDK dependencies

### Week 1 Goals

- Complete Phase 1: Foundation
- Working Valdi project structure
- Basic navigation implemented
- Design system documented

### Success Metrics

**Technical**:
- All modules build successfully
- Test coverage > 80%
- No critical bugs in production
- Performance targets met

**User Experience**:
- Smooth, responsive UI
- Fast message streaming
- Intuitive navigation
- Clear error messages

**Community**:
- GitHub stars and forks
- Active contributors
- Positive feedback
- Tutorial completions

---

## Conclusion

This comprehensive plan provides a complete roadmap for building **Valdi AI UI**, an open-source, cross-platform AI chat client. By combining Valdi's native UI framework with Vercel's AI SDK v5, we'll create a production-quality application that demonstrates the power of AI-powered conversational interfaces on mobile devices.

The phased approach ensures steady progress from foundation through advanced features, with clear deliverables at each stage. The modular architecture enables easy extension and customization, while the comprehensive documentation ensures the project serves as both a functional app and an educational resource.

**Key Takeaways**:
- Native mobile AI experiences using Valdi
- Full AI SDK v5 integration with agents and tools
- Production-ready architecture and patterns
- Comprehensive documentation and examples
- Open-source foundation for community building

Ready to build the future of mobile AI chat! 🚀
