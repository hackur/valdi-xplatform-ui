/**
 * Message Types
 *
 * Defines the structure for chat messages, including user messages,
 * AI responses, tool calls, and system messages.
 */

/**
 * Message Role
 * Identifies who sent the message
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Message Status
 * Tracks the state of a message
 */
export type MessageStatus =
  | 'pending'      // Message created, not yet sent
  | 'sending'      // Message being sent to API
  | 'streaming'    // Response streaming in
  | 'completed'    // Message fully received
  | 'error'        // Error occurred
  | 'cancelled';   // Request cancelled

/**
 * Tool Call
 * Represents a function call made by the AI
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
 * Allows for mixed content (text, images, etc.)
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
    finishReason?: 'stop' | 'length' | 'tool-calls' | 'content-filter' | 'error';

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
 */
export const MessageTypeGuards = {
  /**
   * Check if message is from user
   */
  isUserMessage(message: Message): boolean {
    return message.role === 'user';
  },

  /**
   * Check if message is from assistant
   */
  isAssistantMessage(message: Message): boolean {
    return message.role === 'assistant';
  },

  /**
   * Check if message is a system message
   */
  isSystemMessage(message: Message): boolean {
    return message.role === 'system';
  },

  /**
   * Check if message has tool calls
   */
  hasToolCalls(message: Message): boolean {
    return (message.toolCalls?.length ?? 0) > 0;
  },

  /**
   * Check if message is streaming
   */
  isStreaming(message: Message): boolean {
    return message.status === 'streaming';
  },

  /**
   * Check if message is completed
   */
  isCompleted(message: Message): boolean {
    return message.status === 'completed';
  },

  /**
   * Check if message has error
   */
  hasError(message: Message): boolean {
    return message.status === 'error' || !!message.error;
  },

  /**
   * Check if content is structured (parts)
   */
  hasStructuredContent(message: Message): message is Message & { content: MessageContentPart[] } {
    return Array.isArray(message.content);
  },
};

/**
 * Message Utility Functions
 */
export const MessageUtils = {
  /**
   * Create a new message ID
   */
  generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get text content from message
   */
  getTextContent(message: Message): string {
    if (typeof message.content === 'string') {
      return message.content;
    }

    return message.content
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('\n');
  },

  /**
   * Create a user message
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
   * Create an assistant message stub (for streaming)
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
   * Append content to message
   */
  appendContent(message: Message, delta: string): Message {
    const content = typeof message.content === 'string' ? message.content + delta : message.content;
    return {
      ...message,
      content,
      updatedAt: new Date(),
    };
  },

  /**
   * Mark message as completed
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
