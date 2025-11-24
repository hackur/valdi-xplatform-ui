# Valdi AI UI - API Reference

Comprehensive API documentation for the Valdi AI UI project. This reference covers core modules, components, services, and type definitions used throughout the application.

## Table of Contents

1. [Overview](#overview)
2. [Common Module API](#common-module-api)
3. [Chat Core Module API](#chat-core-module-api)
4. [Agent Manager Module API](#agent-manager-module-api)
5. [Code Examples](#code-examples)
6. [Type Definitions](#type-definitions)

---

## Overview

The Valdi AI UI project is structured around modular components with clear separation of concerns:

- **Common Module**: Reusable UI components, theme system, and shared types
- **Chat Core Module**: Core chat functionality, state management, and persistence
- **Agent Manager Module**: Multi-agent orchestration, workflow execution, and loop control
- **Chat UI Module**: React components for chat interface
- **Model Config Module**: Model provider configuration and selection
- **Settings Module**: Application settings and preferences
- **Conversation Manager Module**: Conversation history and management
- **Workflow Demo**: Workflow execution demonstrations

---

## Common Module API

The Common module provides foundational components, theming, types, and utilities shared across the application.

### Components

#### Button Component

Basic button component with variant support.

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

#### Card Component

Container component for content organization.

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onClick?: () => void;
  elevation?: 'low' | 'medium' | 'high';
  padding?: number;
}
```

#### Avatar Component

User/agent avatar display component.

```typescript
interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  initials?: string;
  backgroundColor?: string;
}
```

#### LoadingSpinner Component

Loading indicator component.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
}
```

### Theme System

#### Color Palette

| Category | Variable | Value | Usage |
|----------|----------|-------|-------|
| Primary | `Colors.primary` | `#3B82F6` | Main brand color |
| Primary | `Colors.primaryDark` | `#2563EB` | Active states |
| Primary | `Colors.primaryLight` | `#60A5FA` | Hover states |
| Secondary | `Colors.secondary` | `#8B5CF6` | Accent color |
| Success | `Colors.success` | `#10B981` | Success states |
| Warning | `Colors.warning` | `#F59E0B` | Warning states |
| Error | `Colors.error` | `#EF4444` | Error states |
| Grayscale | `Colors.gray100-900` | Various | UI backgrounds |

**Usage:**
```typescript
import { Colors, ColorUtils } from '@common/theme';

const accentColor = Colors.primary;
const rgbaColor = ColorUtils.hexToRgba(Colors.primary, 0.5);
const contrastText = ColorUtils.getContrastText(Colors.primary);
```

#### Spacing System

Based on a 4px grid system for consistent spacing.

| Token | Value | Use Case |
|-------|-------|----------|
| `Spacing.xs` | 4px | Small gaps between elements |
| `Spacing.sm` | 8px | Component internal spacing |
| `Spacing.md` | 12px | Element gaps within components |
| `Spacing.base` | 16px | Default padding/margins |
| `Spacing.lg` | 20px | Large spacing |
| `Spacing.xl` | 24px | Extra large spacing |
| `Spacing.xxl` | 32px | 2X large spacing |

**Semantic Spacing Examples:**
```typescript
import { SemanticSpacing, SpacingUtils } from '@common/theme';

// Component internal spacing
const componentPadding = SemanticSpacing.componentPadding; // 16px

// Chat message bubbles
const messageBubblePadding = SemanticSpacing.messageBubblePadding; // 12px

// Create custom spacing
const padding = SpacingUtils.padding(16);
const horizontalPadding = SpacingUtils.paddingHorizontal(20);
```

#### Border Radius

```typescript
import { BorderRadius, ChatBorderRadius } from '@common/theme';

const cardRadius = BorderRadius.base; // 8px
const messageBubbleRadius = ChatBorderRadius.messageBubble; // 16px
```

#### Fonts

```typescript
import { Fonts } from '@common/theme';

interface FontConfig {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

const headingFont = Fonts.heading1;
const bodyFont = Fonts.body;
```

#### Shadows

```typescript
import { Shadows } from '@common/theme';

interface ShadowConfig {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android elevation
}

const lowElevationShadow = Shadows.low;
const highElevationShadow = Shadows.high;
```

### Common Types

#### Message Type

Represents a single message in a conversation.

```typescript
interface Message {
  id: string;                           // Unique message ID
  conversationId: string;               // Parent conversation ID
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | MessageContentPart[];  // Text or structured content
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'sending' | 'streaming' | 'completed' | 'error' | 'cancelled';
  toolCalls?: ToolCall[];              // Tool calls made by assistant
  error?: string;                       // Error message if status === 'error'
  metadata?: {
    model?: string;
    tokens?: { prompt?: number; completion?: number; total?: number };
    temperature?: number;
    maxTokens?: number;
    finishReason?: 'stop' | 'length' | 'tool-calls' | 'content-filter' | 'error';
    [key: string]: unknown;
  };
}

// Message Content Parts
type MessageContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; imageUrl: string; alt?: string }
  | { type: 'tool-call'; toolCall: ToolCall }
  | { type: 'tool-result'; toolCallId: string; result: unknown };

// Tool Call
interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: 'pending' | 'executing' | 'completed' | 'error';
}
```

**Message Utilities:**
```typescript
import { MessageUtils, MessageTypeGuards } from '@common/types';

// Create messages
const userMsg = MessageUtils.createUserMessage(convId, 'Hello');
const assistantStub = MessageUtils.createAssistantMessageStub(convId);

// Manipulate messages
const updated = MessageUtils.appendContent(message, ' more text');
const completed = MessageUtils.markCompleted(message);
const errorMsg = MessageUtils.markError(message, 'API Error');

// Type guards
if (MessageTypeGuards.isUserMessage(message)) { }
if (MessageTypeGuards.isAssistantMessage(message)) { }
if (MessageTypeGuards.hasToolCalls(message)) { }
if (MessageTypeGuards.isStreaming(message)) { }
```

#### Conversation Type

Represents a chat conversation/thread.

```typescript
interface Conversation {
  id: string;                          // Unique conversation ID
  title: string;                        // Display title
  systemPrompt?: string;                // System instructions
  modelConfig: ModelConfig;             // AI model configuration
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  status: 'active' | 'archived' | 'deleted';
  isPinned: boolean;
  tags: string[];                       // Organization tags
  messageCount: number;
  tokenCount?: number;                  // Approximate token usage
  metadata?: {
    workflowType?: 'sequential' | 'routing' | 'parallel' | 'evaluator' | 'orchestrator';
    agents?: string[];
    tools?: string[];
    [key: string]: unknown;
  };
}

// Model Configuration
interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'custom';
  modelId: string;
  displayName?: string;
  temperature?: number;               // 0 to 2
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  toolsEnabled?: boolean;
  apiEndpoint?: string;               // Custom provider endpoint
}
```

**Conversation Utilities:**
```typescript
import { ConversationUtils, ConversationTypeGuards } from '@common/types';

// Create conversation
const conv = ConversationUtils.create({
  title: 'My Chat',
  modelConfig: { provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
});

// Update conversation
const updated = ConversationUtils.update(conv, { title: 'Updated Title' });

// Utility functions
const title = ConversationUtils.generateTitle('Long first message...', 50);
const formatted = ConversationUtils.getFormattedDate(conv);

// Type guards
if (ConversationTypeGuards.isActive(conv)) { }
if (ConversationTypeGuards.isPinned(conv)) { }
if (ConversationTypeGuards.hasMessages(conv)) { }
```

---

## Chat Core Module API

Core chat functionality including message management, conversation storage, and AI service integration.

### ChatService

Main service for AI chat interactions.

```typescript
interface ChatServiceConfig {
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
    xai?: string;
    custom?: string;
  };
  defaultModelConfig?: ModelConfig;
  debug?: boolean;
}

class ChatService {
  constructor(config: ChatServiceConfig, messageStore: MessageStore);

  /**
   * Send a message (non-streaming)
   */
  async sendMessage(options: ChatRequestOptions): Promise<ChatResponse>;

  /**
   * Send message with simulated streaming
   */
  async sendMessageStreaming(
    options: ChatRequestOptions,
    callback: StreamCallback,
  ): Promise<Message>;
}

interface ChatRequestOptions {
  conversationId: string;
  message: string;
  modelConfig?: Partial<ModelConfig>;
  systemPrompt?: string;
  toolsEnabled?: boolean;
  tools?: Record<string, unknown>;
  maxSteps?: number;
  abortSignal?: AbortSignal;
}

interface ChatResponse {
  message: Message;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result: unknown;
  }>;
  finishReason?: 'stop' | 'length' | 'tool-calls' | 'content-filter' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**Usage Example:**
```typescript
import { ChatService } from '@chat_core/ChatService';
import { MessageStore } from '@chat_core/MessageStore';

const messageStore = new MessageStore();
const chatService = new ChatService(
  {
    apiKeys: { anthropic: process.env.ANTHROPIC_API_KEY },
    defaultModelConfig: {
      provider: 'anthropic',
      modelId: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 4096,
    },
  },
  messageStore,
);

// Send message
const response = await chatService.sendMessage({
  conversationId: 'conv-123',
  message: 'Hello, how are you?',
});

console.log(response.message.content);

// Send with streaming
await chatService.sendMessageStreaming(
  {
    conversationId: 'conv-123',
    message: 'What is AI?',
  },
  (event) => {
    if (event.type === 'chunk') {
      console.log(`Received: ${event.delta}`);
    } else if (event.type === 'complete') {
      console.log(`Complete: ${event.message.content}`);
    }
  },
);
```

### MessageStore

Manages message state with persistence support.

```typescript
interface MessageStoreState {
  messagesByConversation: Record<string, Message[]>;
  streamingStatus: 'idle' | 'connecting' | 'streaming' | 'completed' | 'error';
  streamingMessageId?: string;
}

class MessageStore {
  constructor(enablePersistence?: boolean, persistence?: MessagePersistence);

  // Initialization
  async init(): Promise<void>;

  // Subscription
  subscribe(listener: (state: MessageStoreState) => void): () => void;
  getState(): MessageStoreState;

  // CRUD Operations
  async addMessage(message: Message): Promise<void>;
  async updateMessage(conversationId: string, messageId: string, updates: MessageUpdateInput): Promise<void>;
  async deleteMessage(conversationId: string, messageId: string): Promise<void>;

  // Queries
  getMessages(conversationId: string): Message[];
  getMessage(conversationId: string, messageId: string): Message | undefined;
  getLastMessage(conversationId: string): Message | undefined;
  getMessageCount(conversationId: string): number;

  // Streaming
  appendContent(conversationId: string, messageId: string, delta: string): void;
  setStreamingStatus(status: StreamingStatus, messageId?: string): void;
  getStreamingStatus(): StreamingStatus;
  isStreaming(): boolean;

  // Batch Operations
  async clearConversation(conversationId: string): Promise<void>;
  async reset(): Promise<void>;

  // Persistence Control
  setPersistence(enabled: boolean): void;
  isPersistenceEnabled(): boolean;
  async flushPersistence(): Promise<void>;
}
```

**Usage Example:**
```typescript
import { MessageStore } from '@chat_core/MessageStore';
import { MessageUtils } from '@common/types';

const store = new MessageStore();
await store.init();

// Subscribe to changes
const unsubscribe = store.subscribe((state) => {
  console.log('Message store updated:', state);
});

// Add message
const userMessage = MessageUtils.createUserMessage(convId, 'Hello');
await store.addMessage(userMessage);

// Append streaming content
store.appendContent(convId, messageId, 'Hello');
store.appendContent(convId, messageId, ' world');

// Listen to streaming
store.setStreamingStatus('streaming', messageId);
store.setStreamingStatus('completed', messageId);
```

### ConversationStore

Manages conversation metadata and state.

```typescript
interface ConversationStoreState {
  conversations: Record<string, Conversation>;
  activeConversationId?: string;
  isLoading: boolean;
  error?: string;
}

class ConversationStore {
  constructor(enablePersistence?: boolean, persistence?: ConversationPersistence);

  // Initialization
  async init(): Promise<void>;

  // Subscription
  subscribe(listener: (state: ConversationStoreState) => void): () => void;
  getState(): ConversationStoreState;

  // CRUD Operations
  async createConversation(input: ConversationCreateInput): Promise<Conversation>;
  async updateConversation(conversationId: string, updates: ConversationUpdateInput): Promise<void>;
  async deleteConversation(conversationId: string): Promise<void>;

  // Queries
  getConversation(conversationId: string): Conversation | undefined;
  getAllConversations(): Conversation[];
  listConversations(options?: ConversationListOptions): Conversation[];
  getConversationCount(): number;

  // Filtering & Search
  searchConversations(query: string): Conversation[];
  getConversationsByStatus(status: ConversationStatus): Conversation[];
  getPinnedConversations(): Conversation[];

  // Active Conversation
  setActiveConversation(conversationId: string): void;
  getActiveConversation(): Conversation | undefined;
  clearActiveConversation(): void;

  // Tag Management
  addTag(conversationId: string, tag: string): void;
  removeTag(conversationId: string, tag: string): void;

  // Pin Management
  togglePin(conversationId: string): void;

  // Archive Management
  archiveConversation(conversationId: string): void;
  activateConversation(conversationId: string): void;

  // Batch Operations
  importConversations(conversations: Conversation[]): void;
  async bulkDeleteConversations(conversationIds: string[]): Promise<void>;
  async reset(): Promise<void>;

  // Statistics
  async getStorageStats(): Promise<{
    conversationCount: number;
    totalMessageCount: number;
    activeConversations: number;
    archivedConversations: number;
    pinnedConversations: number;
  }>;
}

interface ConversationListOptions {
  filter?: ConversationFilterOptions;
  sort?: ConversationSortOptions;
  limit?: number;
  offset?: number;
}
```

**Usage Example:**
```typescript
import { ConversationStore } from '@chat_core/ConversationStore';

const convStore = new ConversationStore();
await convStore.init();

// Create conversation
const conv = await convStore.createConversation({
  title: 'My Conversation',
  modelConfig: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
  },
});

// Subscribe to changes
convStore.subscribe((state) => {
  console.log(`Active: ${state.activeConversationId}`);
});

// List with filters
const active = convStore.listConversations({
  filter: { status: ['active'] },
  sort: { field: 'lastMessageAt', order: 'desc' },
  limit: 20,
});

// Search
const results = convStore.searchConversations('machine learning');

// Manage pinned
convStore.togglePin(conv.id);
const pinned = convStore.getPinnedConversations();
```

### StreamHandler

Utility class for managing streaming responses.

```typescript
type StreamingStatus = 'idle' | 'connecting' | 'streaming' | 'completed' | 'error';

type StreamEvent =
  | { type: 'start'; messageId: string }
  | { type: 'chunk'; messageId: string; content: string; delta: string }
  | { type: 'tool-call'; messageId: string; toolCall: unknown }
  | { type: 'complete'; messageId: string; message: Message }
  | { type: 'error'; messageId: string; error: string };

type StreamCallback = (event: StreamEvent) => void;

class StreamHandler {
  onEvent(callback: StreamCallback): () => void;

  start(messageId: string): void;
  processChunk(messageId: string, delta: string): void;
  complete(messageId: string, message: Message): void;
  error(messageId: string, error: string): void;

  getStatus(): StreamingStatus;
  isStreaming(): boolean;
  getCurrentMessageId(): string | undefined;
  getContent(): string;
  reset(): void;
  clearCallbacks(): void;
}

// Stream utilities
const StreamUtils = {
  createDebouncedProcessor(
    callback: (content: string, delta: string) => void,
    delay?: number,
  ): (delta: string) => void;

  *wordSplitter(text: string): Generator<string>;

  calculateStats(
    startTime: Date,
    endTime: Date,
    tokenCount: number,
  ): { duration: number; tokensPerSecond: number };
};
```

**Usage Example:**
```typescript
import { StreamHandler, StreamUtils } from '@chat_core/StreamHandler';

const handler = new StreamHandler();

// Register for stream events
const unsubscribe = handler.onEvent((event) => {
  switch (event.type) {
    case 'start':
      console.log('Stream started:', event.messageId);
      break;
    case 'chunk':
      console.log('Chunk received:', event.delta);
      break;
    case 'complete':
      console.log('Stream complete:', event.message);
      break;
    case 'error':
      console.error('Stream error:', event.error);
      break;
  }
});

// Simulate streaming
handler.start('msg-123');
handler.processChunk('msg-123', 'Hello');
handler.processChunk('msg-123', ' world');
handler.complete('msg-123', message);

// Debounced processing
const processor = StreamUtils.createDebouncedProcessor(
  (content, delta) => console.log(content),
  16, // ~60fps
);
processor('Hello');
processor(' world');
```

---

## Agent Manager Module API

Multi-agent orchestration, workflow execution, and loop control.

### AgentRegistry

Registry for managing agent definitions.

```typescript
interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model?: {
    provider: 'openai' | 'anthropic' | 'google';
    modelId: string;
    temperature?: number;
    maxTokens?: number;
  };
  tools?: string[];
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

class AgentRegistry {
  register(agent: AgentDefinition): void;
  unregister(agentId: string): boolean;
  get(agentId: string): AgentDefinition | undefined;
  getAll(): AgentDefinition[];
  findByCapability(capability: string): AgentDefinition[];
  has(agentId: string): boolean;
  count(): number;
  clear(): void;

  export(): string;                    // Export to JSON
  import(json: string, replace?: boolean): void;
}

// Register default agents
function registerDefaultAgents(registry?: AgentRegistry): void;
```

**Usage Example:**
```typescript
import { AgentRegistry, registerDefaultAgents } from '@agent_manager/AgentRegistry';

const registry = new AgentRegistry();

// Register custom agent
registry.register({
  id: 'my-research-agent',
  name: 'My Research Agent',
  description: 'Gathers and analyzes information',
  systemPrompt: 'You are a research specialist...',
  capabilities: ['research', 'analysis'],
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
    maxTokens: 4096,
  },
  tools: ['searchWeb', 'fetchUrl'],
});

// Find agents by capability
const researchAgents = registry.findByCapability('research');

// Register defaults
registerDefaultAgents(registry);

// Export/Import
const json = registry.export();
registry.import(json, true); // Replace existing
```

### WorkflowEngine

Orchestrates multi-agent workflows.

```typescript
interface WorkflowConfig {
  name: string;
  type: 'sequential' | 'parallel' | 'routing' | 'evaluator-optimizer';
  agents: string[];                     // Agent IDs
  maxSteps?: number;
  timeout?: number;
  stopWhen?: (results: AgentExecutionResult[]) => boolean;
  config?: Record<string, unknown>;
}

type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'stopped';

interface WorkflowExecutionState {
  id: string;
  config: WorkflowConfig;
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  currentStep: number;
  results: AgentExecutionResult[];
  error?: string;
}

interface AgentContext {
  conversationId: string;
  messages: Message[];
  sharedData?: Record<string, unknown>;
  maxSteps?: number;
  timeout?: number;
}

interface AgentExecutionResult {
  agentId: string;
  messages: Message[];
  output?: unknown;
  metadata?: {
    steps: number;
    toolCalls?: number;
    tokens?: { prompt: number; completion: number; total: number };
    executionTime: number;
    finishReason?: 'completed' | 'max_steps' | 'timeout' | 'error';
  };
  error?: string;
}

class WorkflowEngine {
  constructor(registry: AgentRegistry, chatService: ChatService);

  async execute(
    config: WorkflowConfig,
    context: AgentContext,
  ): Promise<WorkflowExecutionState>;

  getActiveWorkflows(): WorkflowExecutionState[];
  cancelWorkflow(workflowId: string): boolean;
}
```

**Usage Example:**
```typescript
import { WorkflowEngine } from '@agent_manager/WorkflowEngine';

const engine = new WorkflowEngine(registry, chatService);

// Sequential workflow
const result = await engine.execute(
  {
    name: 'Research and Analysis',
    type: 'sequential',
    agents: ['research-agent', 'analyst-agent'],
    maxSteps: 10,
  },
  {
    conversationId: 'conv-123',
    messages: [initialMessage],
  },
);

// Parallel workflow
const parallelResult = await engine.execute(
  {
    name: 'Multi-perspective Analysis',
    type: 'parallel',
    agents: ['analyst-agent', 'creative-agent', 'code-agent'],
  },
  {
    conversationId: 'conv-123',
    messages: [initialMessage],
  },
);

// Routing workflow
const routingResult = await engine.execute(
  {
    name: 'Intelligent Routing',
    type: 'routing',
    agents: ['router-agent', 'specialist-agent'],
  },
  {
    conversationId: 'conv-123',
    messages: [initialMessage],
  },
);

// Evaluator-Optimizer loop
const optimizationResult = await engine.execute(
  {
    name: 'Optimization Loop',
    type: 'evaluator-optimizer',
    agents: ['generator-agent', 'evaluator-agent'],
    maxSteps: 5,
    stopWhen: (results) => {
      // Custom stop condition
      return results.length > 0;
    },
  },
  {
    conversationId: 'conv-123',
    messages: [initialMessage],
  },
);
```

### LoopController

Controls iterative agent loops with stop conditions.

```typescript
interface LoopControlConfig {
  maxIterations: number;
  minIterations?: number;
  iterationTimeout?: number;            // Per iteration
  totalTimeout?: number;                 // Total loop time
  stopWhen?: (iteration: number, results: AgentExecutionResult[]) => boolean;
  onIteration?: (iteration: number, result: AgentExecutionResult) => void;
  onComplete?: (results: AgentExecutionResult[]) => void;
  onError?: (error: Error) => void;
}

interface LoopExecutionState {
  iteration: number;
  startTime: Date;
  isRunning: boolean;
  isStopped: boolean;
  iterationResults: AgentExecutionResult[];
  totalTime: number;
}

class LoopController {
  constructor(registry: AgentRegistry, workflowEngine: WorkflowEngine);

  async executeLoop(
    agentId: string,
    context: AgentContext,
    config: LoopControlConfig,
  ): Promise<LoopExecutionState>;

  stop(): void;
  getState(): LoopExecutionState | null;
}

// Stop condition helpers
function createKeywordStopCondition(keyword: string): (iteration: number, results: AgentExecutionResult[]) => boolean;
function createIterationStopCondition(maxIterations: number): (iteration: number, results: AgentExecutionResult[]) => boolean;
function createSuccessStopCondition(evaluator: (result: AgentExecutionResult) => boolean): (iteration: number, results: AgentExecutionResult[]) => boolean;
```

**Usage Example:**
```typescript
import { LoopController, createKeywordStopCondition } from '@agent_manager/LoopController';

const loopController = new LoopController(registry, engine);

// Execute with iteration tracking
const state = await loopController.executeLoop(
  'research-agent',
  {
    conversationId: 'conv-123',
    messages: [initialMessage],
  },
  {
    maxIterations: 10,
    minIterations: 2,
    iterationTimeout: 30000,      // 30 seconds per iteration
    totalTimeout: 300000,          // 5 minutes total
    stopWhen: createKeywordStopCondition('COMPLETE'),
    onIteration: (iteration, result) => {
      console.log(`Iteration ${iteration} completed`);
    },
    onComplete: (results) => {
      console.log(`Loop completed with ${results.length} iterations`);
    },
    onError: (error) => {
      console.error('Loop error:', error);
    },
  },
);

// Can stop externally
loopController.stop();
```

---

## Code Examples

### Example 1: Basic Chat Conversation

```typescript
import { ChatService } from '@chat_core/ChatService';
import { MessageStore } from '@chat_core/MessageStore';
import { ConversationStore } from '@chat_core/ConversationStore';
import { MessageUtils } from '@common/types';

// Initialize stores
const messageStore = new MessageStore();
const conversationStore = new ConversationStore();

// Initialize chat service
const chatService = new ChatService(
  {
    apiKeys: {
      anthropic: process.env.ANTHROPIC_API_KEY,
    },
    defaultModelConfig: {
      provider: 'anthropic',
      modelId: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 4096,
    },
  },
  messageStore,
);

// Create conversation
const conversation = await conversationStore.createConversation({
  title: 'My First Conversation',
  modelConfig: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
  },
});

// Send message
const response = await chatService.sendMessage({
  conversationId: conversation.id,
  message: 'What is machine learning?',
});

console.log('Assistant:', response.message.content);
```

### Example 2: Streaming Chat Response

```typescript
// Send with streaming
const streamingMessage = await chatService.sendMessageStreaming(
  {
    conversationId: conversation.id,
    message: 'Explain quantum computing in simple terms',
  },
  (event) => {
    switch (event.type) {
      case 'start':
        console.log('Starting stream...');
        break;
      case 'chunk':
        process.stdout.write(event.delta);
        break;
      case 'complete':
        console.log('\nStream complete!');
        break;
      case 'error':
        console.error('Stream error:', event.error);
        break;
    }
  },
);
```

### Example 3: Multi-Agent Workflow

```typescript
import { AgentRegistry, registerDefaultAgents } from '@agent_manager/AgentRegistry';
import { WorkflowEngine } from '@agent_manager/WorkflowEngine';

// Setup agents
const registry = new AgentRegistry();
registerDefaultAgents(registry);

// Create workflow engine
const engine = new WorkflowEngine(registry, chatService);

// Execute research and analysis workflow
const workflowResult = await engine.execute(
  {
    name: 'Research & Analysis Pipeline',
    type: 'sequential',
    agents: ['research-agent', 'analyst-agent'],
    maxSteps: 10,
  },
  {
    conversationId: conversation.id,
    messages: [MessageUtils.createUserMessage(conversation.id, 'Analyze AI trends in 2024')],
  },
);

if (workflowResult.status === 'completed') {
  console.log('Workflow completed successfully');
  workflowResult.results.forEach((result, index) => {
    console.log(`Agent ${index + 1} (${result.agentId}):`);
    result.messages.forEach((msg) => {
      console.log(msg.content);
    });
  });
}
```

### Example 4: Iterative Loop with Stop Condition

```typescript
import { LoopController } from '@agent_manager/LoopController';

const loopController = new LoopController(registry, engine);

// Run agent in a loop until a condition is met
const loopState = await loopController.executeLoop(
  'research-agent',
  {
    conversationId: conversation.id,
    messages: [
      MessageUtils.createUserMessage(
        conversation.id,
        'Find 5 interesting facts about AI. Stop when you have found them all.',
      ),
    ],
  },
  {
    maxIterations: 20,
    minIterations: 1,
    iterationTimeout: 60000,
    totalTimeout: 600000,
    stopWhen: (iteration, results) => {
      // Check if we have enough facts
      const lastResult = results[results.length - 1];
      if (lastResult.messages.length === 0) return false;

      const content = MessageUtils.getTextContent(lastResult.messages[0]);
      const factCount = (content.match(/^\d+\./gm) || []).length;
      return factCount >= 5;
    },
    onIteration: (iteration, result) => {
      console.log(`Iteration ${iteration}: Status = ${result.metadata?.finishReason}`);
    },
  },
);

console.log(`Completed in ${loopState.iteration} iterations`);
```

### Example 5: Conversation Management

```typescript
// List all active conversations
const activeConvs = conversationStore.listConversations({
  filter: { status: ['active'] },
  sort: { field: 'lastMessageAt', order: 'desc' },
  limit: 10,
});

// Search conversations
const searchResults = conversationStore.searchConversations('python');

// Get pinned conversations
const pinnedConvs = conversationStore.getPinnedConversations();

// Pin a conversation
conversationStore.togglePin(conversation.id);

// Archive a conversation
conversationStore.archiveConversation(conversation.id);

// Add tags for organization
conversationStore.addTag(conversation.id, 'machine-learning');
conversationStore.addTag(conversation.id, 'research');

// Get statistics
const stats = await conversationStore.getStorageStats();
console.log(`Total conversations: ${stats.conversationCount}`);
console.log(`Total messages: ${stats.totalMessageCount}`);
```

---

## Type Definitions

### Core Message Types

```typescript
// Message interface
interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string | MessageContentPart[];
  createdAt: Date;
  updatedAt: Date;
  status: MessageStatus;
  toolCalls?: ToolCall[];
  error?: string;
  metadata?: Record<string, unknown>;
}

// Message creation/update
interface MessageCreateInput {
  conversationId: string;
  role: MessageRole;
  content: string | MessageContentPart[];
  metadata?: Message['metadata'];
}

interface MessageUpdateInput {
  content?: string | MessageContentPart[];
  status?: MessageStatus;
  toolCalls?: ToolCall[];
  error?: string;
  metadata?: Partial<Message['metadata']>;
}

// Enums
type MessageRole = 'user' | 'assistant' | 'system' | 'tool';
type MessageStatus = 'pending' | 'sending' | 'streaming' | 'completed' | 'error' | 'cancelled';

// Tool call representation
interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: 'pending' | 'executing' | 'completed' | 'error';
}
```

### Core Conversation Types

```typescript
interface Conversation {
  id: string;
  title: string;
  systemPrompt?: string;
  modelConfig: ModelConfig;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  status: ConversationStatus;
  isPinned: boolean;
  tags: string[];
  messageCount: number;
  tokenCount?: number;
  metadata?: Record<string, unknown>;
}

interface ConversationCreateInput {
  title?: string;
  systemPrompt?: string;
  modelConfig: ModelConfig;
  tags?: string[];
  metadata?: Conversation['metadata'];
}

interface ConversationUpdateInput {
  title?: string;
  systemPrompt?: string;
  modelConfig?: Partial<ModelConfig>;
  status?: ConversationStatus;
  isPinned?: boolean;
  tags?: string[];
  metadata?: Partial<Conversation['metadata']>;
}

interface ModelConfig {
  provider: AIProvider;
  modelId: string;
  displayName?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  toolsEnabled?: boolean;
  apiEndpoint?: string;
}

type AIProvider = 'openai' | 'anthropic' | 'google' | 'xai' | 'custom';
type ConversationStatus = 'active' | 'archived' | 'deleted';
```

### Agent & Workflow Types

```typescript
interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model?: {
    provider: 'openai' | 'anthropic' | 'google';
    modelId: string;
    temperature?: number;
    maxTokens?: number;
  };
  tools?: string[];
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

interface AgentContext {
  conversationId: string;
  messages: Message[];
  sharedData?: Record<string, unknown>;
  maxSteps?: number;
  timeout?: number;
}

interface AgentExecutionResult {
  agentId: string;
  messages: Message[];
  output?: unknown;
  metadata?: {
    steps: number;
    toolCalls?: number;
    tokens?: { prompt: number; completion: number; total: number };
    executionTime: number;
    finishReason?: 'completed' | 'max_steps' | 'timeout' | 'error';
  };
  error?: string;
}

interface WorkflowConfig {
  name: string;
  type: 'sequential' | 'parallel' | 'routing' | 'evaluator-optimizer';
  agents: string[];
  maxSteps?: number;
  timeout?: number;
  stopWhen?: (results: AgentExecutionResult[]) => boolean;
  config?: Record<string, unknown>;
}

type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'stopped';

interface WorkflowExecutionState {
  id: string;
  config: WorkflowConfig;
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  currentStep: number;
  results: AgentExecutionResult[];
  error?: string;
}
```

### Storage & Persistence Types

```typescript
interface ConversationStoreState {
  conversations: Record<string, Conversation>;
  activeConversationId?: string;
  isLoading: boolean;
  error?: string;
}

interface MessageStoreState {
  messagesByConversation: Record<string, Message[]>;
  streamingStatus: StreamingStatus;
  streamingMessageId?: string;
}

type StreamingStatus = 'idle' | 'connecting' | 'streaming' | 'completed' | 'error';
```

---

## Related Documentation

- **Storage System**: Implements `StorageProvider` interface for flexible persistence (LocalStorage, MemoryStorage, etc.)
- **Tool Definitions**: Define and manage tools available to agents for function calling
- **Export Service**: Export conversations in multiple formats (JSON, Markdown, CSV)
- **Persistence Examples**: See `PERSISTENCE_EXAMPLES.ts` for detailed storage implementation patterns

---

**Last Updated**: November 2024
**API Version**: 1.0.0
**Maintainer**: Valdi AI UI Team
