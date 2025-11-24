/**
 * MessageStore
 *
 * Manages message state for conversations.
 * Provides reactive state management for messages with CRUD operations.
 */

import { Message, MessageUpdateInput } from '../../common/src';
import { StorageError, ErrorCode, handleError } from '../../common/src';
import { MessageStoreState, StreamingStatus } from './types';
import { MessagePersistence } from './MessagePersistence';

/**
 * MessageStore Class
 *
 * Centralized store for managing conversation messages.
 * Uses observer pattern for reactive updates.
 * Integrates with MessagePersistence for automatic data persistence.
 */
export class MessageStore {
  private state: MessageStoreState = {
    messagesByConversation: {},
    streamingStatus: 'idle',
    streamingMessageId: undefined,
  };

  private listeners: Set<(state: MessageStoreState) => void> = new Set();
  private persistence: MessagePersistence;
  private enablePersistence: boolean;

  constructor(
    enablePersistence: boolean = true,
    persistence?: MessagePersistence,
  ) {
    this.enablePersistence = enablePersistence;
    this.persistence = persistence || new MessagePersistence();
  }

  /**
   * Initialize the store by loading persisted data
   */
  async init(): Promise<void> {
    if (!this.enablePersistence) {
      return;
    }

    try {
      const messagesByConversation = await this.persistence.loadAllMessages();
      this.state = {
        ...this.state,
        messagesByConversation,
      };
      this.notify();
    } catch (error) {
      const errorInfo = handleError(error, {
        operation: 'loadMessages',
        store: 'MessageStore',
      });
      console.error(
        '[MessageStore] Error loading persisted messages:',
        errorInfo.userMessage,
      );

      // Re-throw as StorageError for caller to handle
      throw new StorageError(
        'Failed to load persisted messages',
        ErrorCode.STORAGE_READ_ERROR,
        {
          operation: 'read',
          storageType: 'persistence',
          cause: error instanceof Error ? error : undefined,
          userMessage: errorInfo.userMessage,
        },
      );
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: MessageStoreState) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Get current state
   */
  getState(): MessageStoreState {
    return this.state;
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string): Message[] {
    return this.state.messagesByConversation[conversationId] || [];
  }

  /**
   * Get a specific message
   */
  getMessage(conversationId: string, messageId: string): Message | undefined {
    const messages = this.getMessages(conversationId);
    return messages.find((m) => m.id === messageId);
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(message: Message): Promise<void> {
    const messages = this.getMessages(message.conversationId);

    this.state = {
      ...this.state,
      messagesByConversation: {
        ...this.state.messagesByConversation,
        [message.conversationId]: [...messages, message],
      },
    };

    this.notify();

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.saveMessagesDebounced(
          message.conversationId,
          this.getMessages(message.conversationId),
        );
      } catch (error) {
        const errorInfo = handleError(error, {
          operation: 'saveMessage',
          conversationId: message.conversationId,
          store: 'MessageStore',
        });
        console.error(
          '[MessageStore] Error persisting message:',
          errorInfo.userMessage,
        );

        // Don't throw - allow the operation to continue even if persistence fails
        // The message is already in memory state
      }
    }
  }

  /**
   * Update an existing message
   */
  async updateMessage(
    conversationId: string,
    messageId: string,
    updates: MessageUpdateInput,
  ): Promise<void> {
    const messages = this.getMessages(conversationId);
    const index = messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
      console.warn(
        `Message ${messageId} not found in conversation ${conversationId}`,
      );
      return;
    }

    // Get existing message (index check already done above)
    const existingMessage = messages[index];
    if (!existingMessage) {
      console.error('Unexpected: message at index is undefined');
      return;
    }

    const updatedMessage: Message = {
      ...existingMessage,
      ...updates,
      id: existingMessage.id,
      conversationId: existingMessage.conversationId,
      role: existingMessage.role,
      content: updates.content ?? existingMessage.content,
      createdAt: existingMessage.createdAt,
      updatedAt: new Date(),
      status: updates.status ?? existingMessage.status,
    };

    const updatedMessages = [...messages];
    updatedMessages[index] = updatedMessage;

    this.state = {
      ...this.state,
      messagesByConversation: {
        ...this.state.messagesByConversation,
        [conversationId]: updatedMessages,
      },
    };

    this.notify();

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.saveMessagesDebounced(
          conversationId,
          updatedMessages,
        );
      } catch (error) {
        const errorInfo = handleError(error, {
          operation: 'updateMessage',
          conversationId,
          messageId,
          store: 'MessageStore',
        });
        console.error(
          '[MessageStore] Error persisting message update:',
          errorInfo.userMessage,
        );
      }
    }
  }

  /**
   * Append content to a message (for streaming)
   */
  appendContent(
    conversationId: string,
    messageId: string,
    delta: string,
  ): void {
    const message = this.getMessage(conversationId, messageId);

    if (!message) {
      console.warn(
        `Message ${messageId} not found in conversation ${conversationId}`,
      );
      return;
    }

    const currentContent =
      typeof message.content === 'string' ? message.content : '';
    const newContent = currentContent + delta;

    this.updateMessage(conversationId, messageId, {
      content: newContent,
    });
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    const messages = this.getMessages(conversationId);
    const filteredMessages = messages.filter((m) => m.id !== messageId);

    this.state = {
      ...this.state,
      messagesByConversation: {
        ...this.state.messagesByConversation,
        [conversationId]: filteredMessages,
      },
    };

    this.notify();

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.deleteMessage(conversationId, messageId);
      } catch (error) {
        console.error(
          '[MessageStore] Error persisting message deletion:',
          error,
        );
      }
    }
  }

  /**
   * Clear all messages for a conversation
   */
  async clearConversation(conversationId: string): Promise<void> {
    const { [conversationId]: _, ...remaining } =
      this.state.messagesByConversation;

    this.state = {
      ...this.state,
      messagesByConversation: remaining,
    };

    this.notify();

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.deleteMessages(conversationId);
      } catch (error) {
        console.error(
          '[MessageStore] Error persisting conversation clear:',
          error,
        );
      }
    }
  }

  /**
   * Set streaming status
   */
  setStreamingStatus(status: StreamingStatus, messageId?: string): void {
    this.state = {
      ...this.state,
      streamingStatus: status,
      streamingMessageId: messageId,
    };

    this.notify();
  }

  /**
   * Get streaming status
   */
  getStreamingStatus(): StreamingStatus {
    return this.state.streamingStatus;
  }

  /**
   * Check if currently streaming
   */
  isStreaming(): boolean {
    return this.state.streamingStatus === 'streaming';
  }

  /**
   * Get last message in conversation
   */
  getLastMessage(conversationId: string): Message | undefined {
    const messages = this.getMessages(conversationId);
    return messages[messages.length - 1];
  }

  /**
   * Get message count for conversation
   */
  getMessageCount(conversationId: string): number {
    return this.getMessages(conversationId).length;
  }

  /**
   * Reset entire store
   */
  async reset(): Promise<void> {
    this.state = {
      messagesByConversation: {},
      streamingStatus: 'idle',
      streamingMessageId: undefined,
    };

    this.notify();

    // Clear persistence
    if (this.enablePersistence) {
      try {
        await this.persistence.clearAll();
      } catch (error) {
        console.error(
          '[MessageStore] Error clearing persisted messages:',
          error,
        );
      }
    }
  }

  /**
   * Enable or disable persistence
   */
  setPersistence(enabled: boolean): void {
    this.enablePersistence = enabled;
  }

  /**
   * Get persistence status
   */
  isPersistenceEnabled(): boolean {
    return this.enablePersistence;
  }

  /**
   * Flush any pending persistence operations
   */
  async flushPersistence(): Promise<void> {
    if (this.enablePersistence) {
      await this.persistence.flush();
    }
  }
}

/**
 * Global message store instance
 */
export const messageStore = new MessageStore();
