# API Reference

Complete API reference for Valdi AI UI core modules and services.

---

## Table of Contents

- [ChatService](#chatservice)
- [MessageStore](#messagestore)
- [ConversationStore](#conversationstore)
- [AgentExecutor](#agentexecutor)
- [Workflow System](#workflow-system)
- [Component Props](#component-props)
- [Type Definitions](#type-definitions)

---

## ChatService

Multi-provider AI chat service that handles communication with OpenAI, Anthropic, and Google.

### Constructor

```typescript
constructor(config: ChatServiceConfig, messageStore: MessageStore)
```

**Parameters:**
- `config: ChatServiceConfig` - Service configuration
- `messageStore: MessageStore` - Message store instance

**Example:**

```typescript
import { ChatService } from '@chat_core/ChatService';
import { messageStore } from '@chat_core/MessageStore';

const config: ChatServiceConfig = {
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  defaultModelConfig: {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  },
};

const chatService = new ChatService(config, messageStore);
```

### Methods

#### sendMessage()

Send a message and get a complete response.

```typescript
async sendMessage(options: ChatRequestOptions): Promise<ChatResponse>
```

**Parameters:**

```typescript
interface ChatRequestOptions {
  conversationId: string;
  message: string;
  modelConfig?: Partial<ModelConfig>;
  systemPrompt?: string;
  toolsEnabled?: boolean;
  maxSteps?: number;
}
```

**Returns:**

```typescript
interface ChatResponse {
  message: Message;
  finishReason: 'stop' | 'length' | 'tool-calls' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: ToolCall[];
}
```

**Example:**

```typescript
const response = await chatService.sendMessage({
  conversationId: 'conv_123',
  message: 'What is the weather in San Francisco?',
  modelConfig: {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    temperature: 0.7,
  },
  toolsEnabled: true,
});

console.log(response.message.content);
// "The current weather in San Francisco is 68°F and sunny."
```

#### sendMessageStreaming()

Send a message with streaming response.

```typescript
async sendMessageStreaming(
  options: ChatRequestOptions,
  callback: StreamCallback
): Promise<Message>
```

**Parameters:**
- `options: ChatRequestOptions` - Request options
- `callback: StreamCallback` - Streaming callback

**StreamCallback Type:**

```typescript
type StreamCallback = (event: StreamEvent) => void;

type StreamEvent =
  | { type: 'start'; messageId: string }
  | { type: 'chunk'; messageId: string; content: string; delta: string }
  | { type: 'complete'; messageId: string; message: Message }
  | { type: 'error'; messageId: string; error: string };
```

**Example:**

```typescript
const message = await chatService.sendMessageStreaming(
  {
    conversationId: 'conv_123',
    message: 'Tell me a story',
  },
  (event) => {
    switch (event.type) {
      case 'start':
        console.log('Stream started:', event.messageId);
        break;
      case 'chunk':
        console.log('Chunk received:', event.delta);
        // Update UI with accumulated content
        updateUI(event.content);
        break;
      case 'complete':
        console.log('Stream complete');
        break;
      case 'error':
        console.error('Stream error:', event.error);
        break;
    }
  }
);
```

---

## MessageStore

Reactive state management for conversation messages.

### Constructor

```typescript
constructor(
  enablePersistence: boolean = true,
  persistence?: MessagePersistence
)
```

**Example:**

```typescript
import { MessageStore } from '@chat_core/MessageStore';

const messageStore = new MessageStore(true);
await messageStore.init();
```

### Methods

#### subscribe()

Subscribe to state changes.

```typescript
subscribe(listener: (state: MessageStoreState) => void): () => void
```

**Example:**

```typescript
const unsubscribe = messageStore.subscribe((state) => {
  console.log('Messages updated:', state.messagesByConversation);
  updateUI(state);
});

// Later, unsubscribe
unsubscribe();
```

#### addMessage()

Add a new message to a conversation.

```typescript
async addMessage(message: Message): Promise<void>
```

**Example:**

```typescript
import { MessageUtils } from '@common';

const message = MessageUtils.createUserMessage(
  'conv_123',
  'Hello, AI!'
);

await messageStore.addMessage(message);
```

#### updateMessage()

Update an existing message.

```typescript
async updateMessage(
  conversationId: string,
  messageId: string,
  updates: MessageUpdateInput
): Promise<void>
```

**Example:**

```typescript
await messageStore.updateMessage('conv_123', 'msg_456', {
  content: 'Updated message content',
  status: 'completed',
});
```

#### getMessages()

Get all messages for a conversation.

```typescript
getMessages(conversationId: string): Message[]
```

**Example:**

```typescript
const messages = messageStore.getMessages('conv_123');
console.log(`Found ${messages.length} messages`);
```

#### deleteMessage()

Delete a message.

```typescript
async deleteMessage(conversationId: string, messageId: string): Promise<void>
```

**Example:**

```typescript
await messageStore.deleteMessage('conv_123', 'msg_456');
```

#### clearConversation()

Clear all messages for a conversation.

```typescript
async clearConversation(conversationId: string): Promise<void>
```

**Example:**

```typescript
await messageStore.clearConversation('conv_123');
```

---

## ConversationStore

Reactive state management for conversations.

### Constructor

```typescript
constructor(
  enablePersistence: boolean = true,
  persistence?: ConversationPersistence
)
```

**Example:**

```typescript
import { ConversationStore } from '@chat_core/ConversationStore';

const conversationStore = new ConversationStore(true);
await conversationStore.init();
```

### Methods

#### createConversation()

Create a new conversation.

```typescript
async createConversation(input: ConversationCreateInput): Promise<Conversation>
```

**Example:**

```typescript
const conversation = await conversationStore.createConversation({
  title: 'My AI Chat',
  modelConfig: {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  },
  systemPrompt: 'You are a helpful assistant.',
  tags: ['work', 'important'],
});
```

#### getConversation()

Get a conversation by ID.

```typescript
getConversation(conversationId: string): Conversation | undefined
```

**Example:**

```typescript
const conversation = conversationStore.getConversation('conv_123');
if (conversation) {
  console.log(conversation.title);
}
```

#### listConversations()

List conversations with filtering and sorting.

```typescript
listConversations(options?: ConversationListOptions): Conversation[]
```

**Example:**

```typescript
// Get recent conversations
const recent = conversationStore.listConversations({
  sort: { field: 'lastMessageAt', order: 'desc' },
  limit: 10,
});

// Search conversations
const results = conversationStore.listConversations({
  filter: { searchQuery: 'machine learning' },
  sort: { field: 'updatedAt', order: 'desc' },
});

// Filter by status and provider
const filtered = conversationStore.listConversations({
  filter: {
    status: ['active'],
    provider: ['openai'],
  },
});
```

#### updateConversation()

Update a conversation.

```typescript
async updateConversation(
  conversationId: string,
  updates: ConversationUpdateInput
): Promise<void>
```

**Example:**

```typescript
await conversationStore.updateConversation('conv_123', {
  title: 'Updated Title',
  tags: ['work', 'urgent'],
  isPinned: true,
});
```

#### deleteConversation()

Delete a conversation.

```typescript
async deleteConversation(conversationId: string): Promise<void>
```

**Example:**

```typescript
await conversationStore.deleteConversation('conv_123');
```

#### searchConversations()

Search conversations by query.

```typescript
searchConversations(query: string): Conversation[]
```

**Example:**

```typescript
const results = conversationStore.searchConversations('machine learning');
```

---

## AgentExecutor

Execute AI agents with proper integration to ChatService.

### Constructor

```typescript
constructor(config: AgentExecutorConfig)
```

**Example:**

```typescript
import { AgentExecutor } from '@agent_manager/AgentExecutor';

const executor = new AgentExecutor({
  chatService,
  defaultTimeout: 60000,
  debug: true,
});
```

### Methods

#### execute()

Execute a single agent.

```typescript
async execute(
  agent: AgentDefinition,
  context: AgentContext,
  options?: {
    timeout?: number;
    abortSignal?: AbortSignal;
    onProgress?: (step: number, total: number) => void;
  }
): Promise<AgentExecutionResult>
```

**Example:**

```typescript
const agent: AgentDefinition = {
  id: 'researcher',
  name: 'Research Agent',
  description: 'Conducts research on topics',
  systemPrompt: 'You are a research assistant.',
  model: {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    temperature: 0.3,
  },
  tools: ['web_search', 'calculator'],
};

const context: AgentContext = {
  conversationId: 'conv_123',
  messages: [
    MessageUtils.createUserMessage('conv_123', 'Research quantum computing'),
  ],
  maxSteps: 10,
  timeout: 60000,
};

const result = await executor.execute(agent, context, {
  onProgress: (step, total) => {
    console.log(`Progress: ${step}/${total}`);
  },
});

console.log('Output:', result.output);
console.log('Steps:', result.metadata.steps);
console.log('Tokens:', result.metadata.tokens);
```

#### executeParallel()

Execute multiple agents in parallel.

```typescript
async executeParallel(
  agents: AgentDefinition[],
  context: AgentContext,
  options?: {
    timeout?: number;
    abortSignal?: AbortSignal;
    maxConcurrency?: number;
  }
): Promise<AgentExecutionResult[]>
```

**Example:**

```typescript
const agents = [researchAgent, summaryAgent, analysisAgent];

const results = await executor.executeParallel(agents, context, {
  maxConcurrency: 2, // Run 2 agents at a time
});

results.forEach((result, i) => {
  console.log(`Agent ${i + 1} output:`, result.output);
});
```

---

## Workflow System

Advanced multi-agent orchestration patterns.

### Sequential Workflow

Execute agents one after another, passing outputs forward.

```typescript
import { SequentialWorkflow } from '@chat_core/SequentialWorkflow';

const workflow = new SequentialWorkflow({
  agents: [
    researchAgent,
    summaryAgent,
    reportAgent,
  ],
  chatService,
});

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Research climate change',
});

console.log('Final output:', result.output);
```

### Parallel Workflow

Execute multiple agents simultaneously.

```typescript
import { ParallelWorkflow } from '@chat_core/ParallelWorkflow';

const workflow = new ParallelWorkflow({
  agents: [
    dataAgent,
    analysisAgent,
    visualizationAgent,
  ],
  chatService,
  maxConcurrency: 2,
});

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Analyze sales data',
});

result.agentResults.forEach((agentResult) => {
  console.log(`${agentResult.agentId}:`, agentResult.output);
});
```

### Routing Workflow

Intelligently route tasks to specialized agents.

```typescript
import { RoutingWorkflow } from '@chat_core/RoutingWorkflow';

const workflow = new RoutingWorkflow({
  agents: [
    codeAgent,
    mathAgent,
    writingAgent,
  ],
  chatService,
  routingStrategy: 'semantic', // or 'rule-based'
});

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Calculate the area of a circle with radius 5',
});

console.log('Selected agent:', result.selectedAgentId);
console.log('Output:', result.output);
```

### Evaluator-Optimizer Workflow

Iterative refinement with evaluation and optimization.

```typescript
import { EvaluatorOptimizerWorkflow } from '@chat_core/EvaluatorOptimizerWorkflow';

const workflow = new EvaluatorOptimizerWorkflow({
  generatorAgent: writerAgent,
  evaluatorAgent: editorAgent,
  chatService,
  maxIterations: 3,
  targetQuality: 0.9,
});

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Write a blog post about AI',
});

console.log('Iterations:', result.iterations);
console.log('Final quality:', result.finalQuality);
console.log('Output:', result.output);
```

---

## Component Props

### Button

```typescript
interface ButtonProps {
  /** Button text */
  label: string;

  /** Click handler */
  onPress: () => void;

  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

  /** Button size */
  size?: 'sm' | 'md' | 'lg';

  /** Disabled state */
  disabled?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Full width */
  fullWidth?: boolean;
}
```

**Example:**

```tsx
import { Button } from '@common/components/Button';

<Button
  label="Send Message"
  onPress={handleSend}
  variant="primary"
  size="md"
  disabled={!canSend}
  loading={isSending}
/>
```

### Card

```typescript
interface CardProps {
  /** Card content */
  children: React.ReactNode;

  /** Elevation level */
  elevation?: 1 | 2 | 3 | 4;

  /** Press handler */
  onPress?: () => void;

  /** Padding */
  padding?: number;

  /** Background color */
  backgroundColor?: string;
}
```

**Example:**

```tsx
import { Card } from '@common/components/Card';

<Card
  elevation={2}
  onPress={() => navigate('details')}
  padding={16}
>
  <Text>Card content</Text>
</Card>
```

### Avatar

```typescript
interface AvatarProps {
  /** Avatar type */
  type: 'user' | 'assistant' | 'system' | 'tool';

  /** Size */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Custom image URL */
  imageUrl?: string;

  /** Fallback text */
  fallbackText?: string;
}
```

**Example:**

```tsx
import { Avatar } from '@common/components/Avatar';

<Avatar
  type="assistant"
  size="md"
/>
```

### LoadingSpinner

```typescript
interface LoadingSpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';

  /** Color */
  color?: string;

  /** Show fullscreen overlay */
  fullscreen?: boolean;

  /** Loading message */
  message?: string;
}
```

**Example:**

```tsx
import { LoadingSpinner } from '@common/components/LoadingSpinner';

<LoadingSpinner
  size="md"
  message="Sending message..."
/>
```

---

## Type Definitions

### Message

```typescript
interface Message {
  /** Unique message ID */
  id: string;

  /** Parent conversation ID */
  conversationId: string;

  /** Message role */
  role: 'user' | 'assistant' | 'system';

  /** Message content */
  content: string | ContentPart[];

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Message status */
  status: 'pending' | 'streaming' | 'completed' | 'error';

  /** Error message if status is error */
  error?: string;

  /** Tool calls made in this message */
  toolCalls?: ToolCall[];

  /** Metadata */
  metadata?: Record<string, unknown>;
}
```

### Conversation

```typescript
interface Conversation {
  /** Unique conversation ID */
  id: string;

  /** Conversation title */
  title: string;

  /** Model configuration */
  modelConfig: ModelConfig;

  /** System prompt */
  systemPrompt?: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Last message timestamp */
  lastMessageAt?: Date;

  /** Number of messages */
  messageCount: number;

  /** Conversation status */
  status: 'active' | 'archived';

  /** Is pinned */
  isPinned: boolean;

  /** Tags */
  tags: string[];

  /** Metadata */
  metadata?: Record<string, unknown>;
}
```

### ModelConfig

```typescript
interface ModelConfig {
  /** AI provider */
  provider: 'openai' | 'anthropic' | 'google';

  /** Model identifier */
  modelId: string;

  /** Temperature (0-2) */
  temperature?: number;

  /** Max tokens */
  maxTokens?: number;

  /** Top P */
  topP?: number;

  /** Frequency penalty */
  frequencyPenalty?: number;

  /** Presence penalty */
  presencePenalty?: number;
}
```

### AgentDefinition

```typescript
interface AgentDefinition {
  /** Unique agent ID */
  id: string;

  /** Agent name */
  name: string;

  /** Description */
  description: string;

  /** System prompt */
  systemPrompt?: string;

  /** Model configuration */
  model?: ModelConfig;

  /** Available tools */
  tools?: string[];

  /** Agent metadata */
  metadata?: Record<string, unknown>;
}
```

### ToolDefinition

```typescript
interface ToolDefinition {
  /** Tool name */
  name: string;

  /** Tool description */
  description: string;

  /** Parameter schema */
  parameters: z.ZodSchema;

  /** Execution function */
  execute: (params: unknown) => Promise<unknown>;
}
```

---

## Error Handling

### Error Types

```typescript
// API errors
class APIError extends Error {
  code: ErrorCode;
  statusCode?: number;
  provider?: string;
  userMessage?: string;
}

// Storage errors
class StorageError extends Error {
  code: ErrorCode;
  operation: 'read' | 'write' | 'delete';
  storageType: string;
}

// Validation errors
class ValidationError extends Error {
  code: ErrorCode;
  field?: string;
  value?: unknown;
}
```

### Error Handling Example

```typescript
import { handleError, APIError, ErrorCode } from '@common/errors';

try {
  const response = await chatService.sendMessage(options);
} catch (error) {
  const errorInfo = handleError(error, {
    operation: 'sendMessage',
    conversationId: 'conv_123',
  });

  if (error instanceof APIError) {
    if (error.code === ErrorCode.API_AUTHENTICATION) {
      // Show API key configuration prompt
      showAPIKeyDialog();
    } else if (error.code === ErrorCode.API_RATE_LIMIT) {
      // Show rate limit message
      showRateLimitMessage();
    }
  }

  // Show user-friendly error message
  showError(errorInfo.userMessage);
}
```

---

## Utility Functions

### MessageUtils

```typescript
// Create messages
MessageUtils.createUserMessage(conversationId, content);
MessageUtils.createAssistantMessage(conversationId, content);
MessageUtils.createSystemMessage(conversationId, content);

// Get content
MessageUtils.getTextContent(message);

// Generate IDs
MessageUtils.generateId();

// Format messages
MessageUtils.formatForDisplay(message);
```

### ConversationUtils

```typescript
// Create conversation
ConversationUtils.create(input);

// Update conversation
ConversationUtils.update(conversation, updates);

// Generate title
ConversationUtils.generateTitle(messages);

// Increment message count
ConversationUtils.incrementMessageCount(conversation);
```

---

## Additional Resources

- [Architecture Guide](ARCHITECTURE.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

**Questions?** Open an issue on [GitHub](https://github.com/your-org/valdi-ai-ui/issues).
