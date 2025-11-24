/**
 * Chat Core Types
 *
 * Additional types specific to the chat core module.
 * Extends the common Message and Conversation types.
 */

import { Message, ModelConfig } from '../../common/src';

/**
 * Chat Request Options
 */
export interface ChatRequestOptions {
  /** Conversation ID */
  conversationId: string;

  /** User message content */
  message: string;

  /** Model configuration (optional override) */
  modelConfig?: Partial<ModelConfig>;

  /** System prompt (optional override) */
  systemPrompt?: string;

  /** Enable tool calling */
  toolsEnabled?: boolean;

  /** Available tools */
  tools?: Record<string, unknown>;

  /** Max steps for agentic loops */
  maxSteps?: number;

  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;
}

/**
 * Chat Response
 */
export interface ChatResponse {
  /** Generated message */
  message: Message;

  /** Tool calls made (if any) */
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result: unknown;
  }>;

  /** Finish reason */
  finishReason?: 'stop' | 'length' | 'tool-calls' | 'content-filter' | 'error';

  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Streaming Status
 */
export type StreamingStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'completed'
  | 'error';

/**
 * Stream Event Types
 */
export type StreamEvent =
  | { type: 'start'; messageId: string }
  | { type: 'chunk'; messageId: string; content: string; delta: string }
  | { type: 'tool-call'; messageId: string; toolCall: unknown }
  | { type: 'complete'; messageId: string; message: Message }
  | { type: 'error'; messageId: string; error: string };

/**
 * Stream Callback
 */
export type StreamCallback = (event: StreamEvent) => void;

/**
 * Message Store State
 */
export interface MessageStoreState {
  /** All messages by conversation ID */
  messagesByConversation: Record<string, Message[]>;

  /** Current streaming status */
  streamingStatus: StreamingStatus;

  /** Current streaming message ID */
  streamingMessageId?: string;
}

/**
 * Chat Service Configuration
 */
export interface ChatServiceConfig {
  /** API keys by provider */
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
    xai?: string;
    custom?: string;
  };

  /** Default model configuration */
  defaultModelConfig?: ModelConfig;

  /** Enable debug logging */
  debug?: boolean;
}
