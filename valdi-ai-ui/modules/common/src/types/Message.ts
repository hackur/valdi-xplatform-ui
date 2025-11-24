/**
 * Message Types
 *
 * Defines the structure for chat messages, including user messages,
 * AI responses, tool calls, and system messages.
 */

/**
 * Message Role
 *
 * Identifies who sent the message in a conversation.
 *
 * - `user`: Message from the end user
 * - `assistant`: Message from the AI assistant
 * - `system`: System-level message (e.g., instructions)
 * - `tool`: Message from a tool execution
 *
 * @example
 * ```typescript
 * const userMessage: Message = {
 *   role: 'user',
 *   content: 'Hello, AI!',
 *   // ... other fields
 * };
 * ```
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Message Status
 *
 * Tracks the current state of a message throughout its lifecycle.
 *
 * @example
 * ```typescript
 * // Creating a new message starts with 'pending'
 * const newMsg = MessageUtils.createUserMessage('conv_1', 'Hi');
 * console.log(newMsg.status); // 'pending'
 *
 * // During API call
 * message.status = 'sending';
 *
 * // While receiving response
 * message.status = 'streaming';
 *
 * // After completion
 * message.status = 'completed';
 * ```
 */
export type MessageStatus =
  | 'pending' // Message created, not yet sent
  | 'sending' // Message being sent to API
  | 'streaming' // Response streaming in
  | 'completed' // Message fully received
  | 'error' // Error occurred
  | 'cancelled'; // Request cancelled

/**
 * Tool Call
 *
 * Represents a function/tool call made by the AI assistant.
 * Used when the AI needs to invoke external tools or functions.
 *
 * @property {string} id - Unique identifier for this tool call
 * @property {string} name - Name of the tool/function being called
 * @property {Record<string, unknown>} arguments - Arguments passed to the tool
 * @property {unknown} [result] - Result returned from tool execution
 * @property {string} [error] - Error message if tool execution failed
 * @property {'pending' | 'executing' | 'completed' | 'error'} status - Current execution status
 *
 * @example
 * ```typescript
 * const toolCall: ToolCall = {
 *   id: 'call_123',
 *   name: 'get_weather',
 *   arguments: { city: 'San Francisco' },
 *   status: 'pending'
 * };
 * ```
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: 'pending' | 'executing' | 'completed' | 'error';
}

/**
 * Message Content Part
 *
 * Represents a single part of structured message content.
 * Allows for mixed content types (text, images, tool calls, etc.).
 *
 * @example
 * ```typescript
 * // Text content
 * const textPart: MessageContentPart = {
 *   type: 'text',
 *   text: 'Hello, world!'
 * };
 *
 * // Image content
 * const imagePart: MessageContentPart = {
 *   type: 'image',
 *   imageUrl: 'https://example.com/image.jpg',
 *   alt: 'Description'
 * };
 *
 * // Tool call
 * const toolCallPart: MessageContentPart = {
 *   type: 'tool-call',
 *   toolCall: { id: 'call_1', name: 'search', arguments: {}, status: 'pending' }
 * };
 * ```
 */
export type MessageContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; imageUrl: string; alt?: string }
  | { type: 'tool-call'; toolCall: ToolCall }
  | { type: 'tool-result'; toolCallId: string; result: unknown };

/**
 * Core Message Interface
 *
 * Represents a single message in a conversation
 */
export interface Message {
  /** Unique message identifier */
  id: string;

  /** Conversation this message belongs to */
  conversationId: string;

  /** Message role (user, assistant, system, tool) */
  role: MessageRole;

  /** Message content - can be string or structured parts */
  content: string | MessageContentPart[];

  /** Message creation timestamp */
  createdAt: Date;

  /** Message update timestamp (for streaming updates) */
  updatedAt: Date;

  /** Message status */
  status: MessageStatus;

  /** Tool calls made by this message (for assistant messages) */
  toolCalls?: ToolCall[];

  /** Error message if status is 'error' */
  error?: string;

  /** Additional metadata */
  metadata?: {
    /** Model used to generate this message */
    model?: string;

    /** Token count (if available) */
    tokens?: {
      prompt?: number;
      completion?: number;
      total?: number;
    };

    /** Generation parameters */
    temperature?: number;
    maxTokens?: number;

    /** Finish reason */
    finishReason?:
      | 'stop'
      | 'length'
      | 'tool-calls'
      | 'content-filter'
      | 'error';

    /** Custom user metadata */
    [key: string]: unknown;
  };
}

/**
 * Message Create Input
 * Used when creating a new message
 */
export interface MessageCreateInput {
  conversationId: string;
  role: MessageRole;
  content: string | MessageContentPart[];
  metadata?: Message['metadata'];
}

/**
 * Message Update Input
 * Used when updating an existing message
 */
export interface MessageUpdateInput {
  content?: string | MessageContentPart[];
  status?: MessageStatus;
  toolCalls?: ToolCall[];
  error?: string;
  metadata?: Partial<Message['metadata']>;
}

/**
 * Streaming Message Chunk
 * Represents a chunk of streaming content
 */
export interface StreamChunk {
  id: string;
  messageId: string;
  content: string;
  delta: string;
  timestamp: Date;
  isComplete: boolean;
}

/**
 * Type Guards
 *
 * Collection of type guard functions for checking message properties.
 */
export const MessageTypeGuards = {
  /**
   * Check if message is from user
   *
   * @param message - The message to check
   * @returns True if the message role is 'user'
   *
   * @example
   * ```typescript
   * if (MessageTypeGuards.isUserMessage(message)) {
   *   console.log('User said:', message.content);
   * }
   * ```
   */
  isUserMessage(message: Message): boolean {
    return message.role === 'user';
  },

  /**
   * Check if message is from assistant
   *
   * @param message - The message to check
   * @returns True if the message role is 'assistant'
   *
   * @example
   * ```typescript
   * if (MessageTypeGuards.isAssistantMessage(message)) {
   *   console.log('AI responded:', message.content);
   * }
   * ```
   */
  isAssistantMessage(message: Message): boolean {
    return message.role === 'assistant';
  },

  /**
   * Check if message is a system message
   *
   * @param message - The message to check
   * @returns True if the message role is 'system'
   */
  isSystemMessage(message: Message): boolean {
    return message.role === 'system';
  },

  /**
   * Check if message has tool calls
   *
   * @param message - The message to check
   * @returns True if the message has one or more tool calls
   *
   * @example
   * ```typescript
   * if (MessageTypeGuards.hasToolCalls(message)) {
   *   message.toolCalls?.forEach(call => {
   *     console.log('Tool:', call.name);
   *   });
   * }
   * ```
   */
  hasToolCalls(message: Message): boolean {
    return (message.toolCalls?.length ?? 0) > 0;
  },

  /**
   * Check if message is streaming
   *
   * @param message - The message to check
   * @returns True if the message status is 'streaming'
   */
  isStreaming(message: Message): boolean {
    return message.status === 'streaming';
  },

  /**
   * Check if message is completed
   *
   * @param message - The message to check
   * @returns True if the message status is 'completed'
   */
  isCompleted(message: Message): boolean {
    return message.status === 'completed';
  },

  /**
   * Check if message has error
   *
   * @param message - The message to check
   * @returns True if the message has an error status or error message
   */
  hasError(message: Message): boolean {
    return message.status === 'error' || !!message.error;
  },

  /**
   * Check if content is structured (parts)
   *
   * Type guard that narrows the message content to MessageContentPart array.
   *
   * @param message - The message to check
   * @returns True if content is an array of MessageContentPart
   *
   * @example
   * ```typescript
   * if (MessageTypeGuards.hasStructuredContent(message)) {
   *   // TypeScript knows message.content is MessageContentPart[]
   *   message.content.forEach(part => {
   *     if (part.type === 'text') console.log(part.text);
   *   });
   * }
   * ```
   */
  hasStructuredContent(
    message: Message,
  ): message is Message & { content: MessageContentPart[] } {
    return Array.isArray(message.content);
  },
};

/**
 * Message Utility Functions
 *
 * Collection of utility functions for creating and manipulating messages.
 */
export const MessageUtils = {
  /**
   * Generate a unique message ID
   *
   * Creates a unique identifier using timestamp and random string.
   *
   * @returns A unique message ID in the format 'msg_timestamp_random'
   *
   * @example
   * ```typescript
   * const id = MessageUtils.generateId();
   * console.log(id); // 'msg_1234567890_abc123def'
   * ```
   */
  generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Extract text content from a message
   *
   * For string content, returns the string directly.
   * For structured content, extracts and joins all text parts.
   *
   * @param message - The message to extract text from
   * @returns The combined text content
   *
   * @example
   * ```typescript
   * const text = MessageUtils.getTextContent(message);
   * console.log(text); // "Hello, world!"
   * ```
   */
  getTextContent(message: Message): string {
    if (typeof message.content === 'string') {
      return message.content;
    }

    return message.content
      .filter(
        (part): part is { type: 'text'; text: string } => part.type === 'text',
      )
      .map((part) => part.text)
      .join('\n');
  },

  /**
   * Create a new user message
   *
   * Creates a complete Message object for user input with generated ID
   * and initial status of 'pending'.
   *
   * @param conversationId - The ID of the conversation this message belongs to
   * @param content - The message text content
   * @returns A complete Message object ready to be added to the conversation
   *
   * @example
   * ```typescript
   * const userMsg = MessageUtils.createUserMessage('conv_123', 'Hello AI!');
   * console.log(userMsg.id); // 'msg_1234567890_abc123def'
   * console.log(userMsg.status); // 'pending'
   * console.log(userMsg.role); // 'user'
   * ```
   */
  createUserMessage(conversationId: string, content: string): Message {
    const now = new Date();
    return {
      id: MessageUtils.generateId(),
      conversationId,
      role: 'user',
      content,
      createdAt: now,
      updatedAt: now,
      status: 'pending',
    };
  },

  /**
   * Create an assistant message stub for streaming
   *
   * Creates an empty assistant message with 'streaming' status.
   * Used to initialize the message before receiving streamed content.
   *
   * @param conversationId - The ID of the conversation
   * @returns An empty assistant message with streaming status
   *
   * @example
   * ```typescript
   * const assistantMsg = MessageUtils.createAssistantMessageStub('conv_123');
   * console.log(assistantMsg.content); // ''
   * console.log(assistantMsg.status); // 'streaming'
   * ```
   *
   * @see {@link appendContent} for adding streamed content
   */
  createAssistantMessageStub(conversationId: string): Message {
    const now = new Date();
    return {
      id: MessageUtils.generateId(),
      conversationId,
      role: 'assistant',
      content: '',
      createdAt: now,
      updatedAt: now,
      status: 'streaming',
    };
  },

  /**
   * Append content to a message
   *
   * Adds delta text to existing message content. Used during streaming
   * to incrementally build the message content.
   *
   * @param message - The message to append to
   * @param delta - The text chunk to append
   * @returns A new message object with appended content
   *
   * @example
   * ```typescript
   * let msg = MessageUtils.createAssistantMessageStub('conv_1');
   * msg = MessageUtils.appendContent(msg, 'Hello');
   * msg = MessageUtils.appendContent(msg, ' world!');
   * console.log(msg.content); // 'Hello world!'
   * ```
   *
   * @see {@link createAssistantMessageStub}
   */
  appendContent(message: Message, delta: string): Message {
    const content =
      typeof message.content === 'string'
        ? message.content + delta
        : message.content;
    return {
      ...message,
      content,
      updatedAt: new Date(),
    };
  },

  /**
   * Mark message as completed
   *
   * Updates message status to 'completed' and sets the updated timestamp.
   *
   * @param message - The message to mark as completed
   * @returns A new message object with completed status
   *
   * @example
   * ```typescript
   * const completedMsg = MessageUtils.markCompleted(streamingMsg);
   * console.log(completedMsg.status); // 'completed'
   * ```
   */
  markCompleted(message: Message): Message {
    return {
      ...message,
      status: 'completed',
      updatedAt: new Date(),
    };
  },

  /**
   * Mark message as error
   *
   * Updates message status to 'error' and sets the error message.
   *
   * @param message - The message to mark as error
   * @param error - The error message describing what went wrong
   * @returns A new message object with error status and message
   *
   * @example
   * ```typescript
   * const errorMsg = MessageUtils.markError(
   *   message,
   *   'Failed to connect to API'
   * );
   * console.log(errorMsg.status); // 'error'
   * console.log(errorMsg.error); // 'Failed to connect to API'
   * ```
   */
  markError(message: Message, error: string): Message {
    return {
      ...message,
      status: 'error',
      error,
      updatedAt: new Date(),
    };
  },
};
