/**
 * MessageStore
 *
 * Manages message state for conversations.
 * Provides reactive state management for messages with CRUD operations.
 */

import { Message, MessageUtils, MessageUpdateInput } from '@common';
import { MessageStoreState, StreamingStatus } from './types';

/**
 * MessageStore Class
 *
 * Centralized store for managing conversation messages.
 * Uses observer pattern for reactive updates.
 */
export class MessageStore {
  private state: MessageStoreState = {
    messagesByConversation: {},
    streamingStatus: 'idle',
    streamingMessageId: undefined,
  };

  private listeners: Set<(state: MessageStoreState) => void> = new Set();

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
  addMessage(message: Message): void {
    const messages = this.getMessages(message.conversationId);

    this.state = {
      ...this.state,
      messagesByConversation: {
        ...this.state.messagesByConversation,
        [message.conversationId]: [...messages, message],
      },
    };

    this.notify();
  }

  /**
   * Update an existing message
   */
  updateMessage(conversationId: string, messageId: string, updates: MessageUpdateInput): void {
    const messages = this.getMessages(conversationId);
    const index = messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
      console.warn(`Message ${messageId} not found in conversation ${conversationId}`);
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
  }

  /**
   * Append content to a message (for streaming)
   */
  appendContent(conversationId: string, messageId: string, delta: string): void {
    const message = this.getMessage(conversationId, messageId);

    if (!message) {
      console.warn(`Message ${messageId} not found in conversation ${conversationId}`);
      return;
    }

    const currentContent = typeof message.content === 'string' ? message.content : '';
    const newContent = currentContent + delta;

    this.updateMessage(conversationId, messageId, {
      content: newContent,
    });
  }

  /**
   * Delete a message
   */
  deleteMessage(conversationId: string, messageId: string): void {
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
  }

  /**
   * Clear all messages for a conversation
   */
  clearConversation(conversationId: string): void {
    const { [conversationId]: _, ...remaining } = this.state.messagesByConversation;

    this.state = {
      ...this.state,
      messagesByConversation: remaining,
    };

    this.notify();
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
  reset(): void {
    this.state = {
      messagesByConversation: {},
      streamingStatus: 'idle',
      streamingMessageId: undefined,
    };

    this.notify();
  }
}

/**
 * Global message store instance
 */
export const messageStore = new MessageStore();
