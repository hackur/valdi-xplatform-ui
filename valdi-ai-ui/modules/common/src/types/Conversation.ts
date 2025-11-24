/**
 * Conversation Types
 *
 * Defines the structure for conversations/chat threads,
 * including metadata, settings, and management utilities.
 */

import { Message } from './Message';

/**
 * AI Model Provider
 */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'xai' | 'custom';

/**
 * AI Model Configuration
 */
export interface ModelConfig {
  /** Provider name */
  provider: AIProvider;

  /** Model identifier (e.g., 'gpt-4-turbo', 'claude-3-5-sonnet') */
  modelId: string;

  /** Display name */
  displayName?: string;

  /** Generation parameters */
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  /** Tool calling enabled */
  toolsEnabled?: boolean;

  /** Custom API endpoint (for 'custom' provider) */
  apiEndpoint?: string;
}

/**
 * Conversation Status
 */
export type ConversationStatus = 'active' | 'archived' | 'deleted';

/**
 * Core Conversation Interface
 */
export interface Conversation {
  /** Unique conversation identifier */
  id: string;

  /** Conversation title */
  title: string;

  /** System prompt/instructions */
  systemPrompt?: string;

  /** Model configuration for this conversation */
  modelConfig: ModelConfig;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Last message timestamp (for sorting) */
  lastMessageAt?: Date;

  /** Conversation status */
  status: ConversationStatus;

  /** Is conversation pinned */
  isPinned: boolean;

  /** Tags for organization */
  tags: string[];

  /** Message count */
  messageCount: number;

  /** Total token count (approximate) */
  tokenCount?: number;

  /** Tools enabled for this conversation */
  toolsEnabled?: boolean;

  /** Additional metadata */
  metadata?: {
    /** Agent workflow type (if any) */
    workflowType?:
      | 'sequential'
      | 'routing'
      | 'parallel'
      | 'evaluator'
      | 'orchestrator';

    /** Custom agents used */
    agents?: string[];

    /** Tools used in this conversation */
    tools?: string[];

    /** Tags for organization and filtering */
    tags?: string[];

    /** Custom user metadata */
    [key: string]: unknown;
  };
}

/**
 * Conversation with Messages
 * Extended type that includes the full message list
 */
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

/**
 * Conversation Create Input
 */
export interface ConversationCreateInput {
  title?: string;
  systemPrompt?: string;
  modelConfig: ModelConfig;
  tags?: string[];
  metadata?: Conversation['metadata'];
}

/**
 * Conversation Update Input
 */
export interface ConversationUpdateInput {
  title?: string;
  systemPrompt?: string;
  modelConfig?: Partial<ModelConfig>;
  status?: ConversationStatus;
  isPinned?: boolean;
  tags?: string[];
  metadata?: Partial<Conversation['metadata']>;
}

/**
 * Conversation Filter Options
 */
export interface ConversationFilterOptions {
  status?: ConversationStatus[];
  tags?: string[];
  isPinned?: boolean;
  provider?: AIProvider[];
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Conversation Sort Options
 */
export type ConversationSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'lastMessageAt'
  | 'title'
  | 'messageCount';
export type ConversationSortOrder = 'asc' | 'desc';

export interface ConversationSortOptions {
  field: ConversationSortField;
  order: ConversationSortOrder;
}

/**
 * Conversation List Options
 */
export interface ConversationListOptions {
  filter?: ConversationFilterOptions;
  sort?: ConversationSortOptions;
  limit?: number;
  offset?: number;
}

/**
 * Conversation Export Format
 */
export type ConversationExportFormat = 'json' | 'markdown' | 'text' | 'csv';

/**
 * Type Guards
 */
export const ConversationTypeGuards = {
  /**
   * Check if conversation is active
   */
  isActive(conversation: Conversation): boolean {
    return conversation.status === 'active';
  },

  /**
   * Check if conversation is archived
   */
  isArchived(conversation: Conversation): boolean {
    return conversation.status === 'archived';
  },

  /**
   * Check if conversation is pinned
   */
  isPinned(conversation: Conversation): boolean {
    return conversation.isPinned;
  },

  /**
   * Check if conversation has messages
   */
  hasMessages(conversation: Conversation): boolean {
    return conversation.messageCount > 0;
  },

  /**
   * Check if conversation uses specific provider
   */
  usesProvider(conversation: Conversation, provider: AIProvider): boolean {
    return conversation.modelConfig.provider === provider;
  },
};

/**
 * Conversation Utility Functions
 *
 * Collection of utility functions for creating and manipulating conversations.
 */
export const ConversationUtils = {
  /**
   * Generate a unique conversation ID
   *
   * Creates a unique identifier using timestamp and random string.
   *
   * @returns A unique conversation ID in the format 'conv_timestamp_random'
   *
   * @example
   * ```typescript
   * const id = ConversationUtils.generateId();
   * console.log(id); // 'conv_1234567890_abc123def'
   * ```
   */
  generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a conversation title from the first message
   *
   * Cleans and truncates the first message to create a readable title.
   * Removes extra whitespace and adds ellipsis if truncated.
   *
   * @param firstMessage - The first message content to generate title from
   * @param maxLength - Maximum length of the title (default: 50)
   * @returns A cleaned and truncated title string
   *
   * @example
   * ```typescript
   * const title = ConversationUtils.generateTitle(
   *   'How do I implement a REST API in Node.js?'
   * );
   * console.log(title); // 'How do I implement a REST API in Node.js?'
   *
   * const longTitle = ConversationUtils.generateTitle(
   *   'This is a very long message that exceeds the maximum length',
   *   20
   * );
   * console.log(longTitle); // 'This is a very lon...'
   * ```
   */
  generateTitle(firstMessage: string, maxLength: number = 50): string {
    const cleaned = firstMessage.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    return cleaned.substring(0, maxLength - 3) + '...';
  },

  /**
   * Create a new conversation
   *
   * Creates a complete Conversation object with generated ID and default values.
   *
   * @param input - Conversation creation parameters
   * @returns A complete Conversation object
   *
   * @example
   * ```typescript
   * const conversation = ConversationUtils.create({
   *   title: 'My Chat',
   *   modelConfig: DefaultModels.anthropic,
   *   systemPrompt: 'You are a helpful assistant',
   *   tags: ['work', 'research']
   * });
   * console.log(conversation.id); // 'conv_1234567890_abc123def'
   * console.log(conversation.status); // 'active'
   * ```
   *
   * @see {@link ConversationCreateInput}
   */
  create(input: ConversationCreateInput): Conversation {
    const now = new Date();
    return {
      id: ConversationUtils.generateId(),
      title: input.title || 'New Conversation',
      systemPrompt: input.systemPrompt,
      modelConfig: input.modelConfig,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      isPinned: false,
      tags: input.tags || [],
      messageCount: 0,
      metadata: input.metadata,
    };
  },

  /**
   * Update conversation with new data
   *
   * Merges updates into existing conversation, preserving unchanged fields.
   * Automatically updates the updatedAt timestamp.
   *
   * @param conversation - The conversation to update
   * @param updates - Partial updates to apply
   * @returns A new conversation object with updates applied
   *
   * @example
   * ```typescript
   * const updated = ConversationUtils.update(conversation, {
   *   title: 'Updated Title',
   *   isPinned: true,
   *   tags: ['important']
   * });
   * console.log(updated.title); // 'Updated Title'
   * console.log(updated.isPinned); // true
   * ```
   */
  update(
    conversation: Conversation,
    updates: ConversationUpdateInput,
  ): Conversation {
    return {
      ...conversation,
      ...updates,
      modelConfig: updates.modelConfig
        ? { ...conversation.modelConfig, ...updates.modelConfig }
        : conversation.modelConfig,
      metadata: updates.metadata
        ? { ...conversation.metadata, ...updates.metadata }
        : conversation.metadata,
      updatedAt: new Date(),
    };
  },

  /**
   * Mark conversation as archived
   */
  archive(conversation: Conversation): Conversation {
    return {
      ...conversation,
      status: 'archived',
      updatedAt: new Date(),
    };
  },

  /**
   * Mark conversation as active (unarchive)
   */
  activate(conversation: Conversation): Conversation {
    return {
      ...conversation,
      status: 'active',
      updatedAt: new Date(),
    };
  },

  /**
   * Toggle pin status
   */
  togglePin(conversation: Conversation): Conversation {
    return {
      ...conversation,
      isPinned: !conversation.isPinned,
      updatedAt: new Date(),
    };
  },

  /**
   * Add tag to conversation
   */
  addTag(conversation: Conversation, tag: string): Conversation {
    if (conversation.tags.includes(tag)) {
      return conversation;
    }
    return {
      ...conversation,
      tags: [...conversation.tags, tag],
      updatedAt: new Date(),
    };
  },

  /**
   * Remove tag from conversation
   */
  removeTag(conversation: Conversation, tag: string): Conversation {
    return {
      ...conversation,
      tags: conversation.tags.filter((t) => t !== tag),
      updatedAt: new Date(),
    };
  },

  /**
   * Increment message count
   */
  incrementMessageCount(conversation: Conversation): Conversation {
    return {
      ...conversation,
      messageCount: conversation.messageCount + 1,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Get formatted date string
   */
  getFormattedDate(conversation: Conversation): string {
    const date = conversation.lastMessageAt || conversation.updatedAt;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  },
};

/**
 * Default Model Configurations
 */
export const DefaultModels: Record<AIProvider, ModelConfig> = {
  openai: {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    temperature: 0.7,
    maxTokens: 4096,
    toolsEnabled: true,
  },
  anthropic: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet',
    temperature: 0.7,
    maxTokens: 4096,
    toolsEnabled: true,
  },
  google: {
    provider: 'google',
    modelId: 'gemini-2.0-flash-exp',
    displayName: 'Gemini 2.0 Flash',
    temperature: 0.7,
    maxTokens: 8192,
    toolsEnabled: true,
  },
  xai: {
    provider: 'xai',
    modelId: 'grok-beta',
    displayName: 'Grok',
    temperature: 0.7,
    maxTokens: 4096,
    toolsEnabled: true,
  },
  custom: {
    provider: 'custom',
    modelId: 'custom-model',
    displayName: 'Custom Model',
    temperature: 0.7,
    maxTokens: 4096,
    toolsEnabled: false,
  },
};
