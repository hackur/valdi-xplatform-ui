/**
 * MessageStore
 *
 * Manages message state for conversations.
 * Provides reactive state management for messages with CRUD operations.
 */

import { Message, MessageUtils, MessageUpdateInput } from '@common/types';
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
      console.error('[MessageStore] Error loading persisted messages:', error);
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
        console.error('[MessageStore] Error persisting message:', error);
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

    const updatedMessage: Message = {
      ...messages[index],
      ...updates,
      updatedAt: new Date(),
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
        console.error('[MessageStore] Error persisting message update:', error);
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
