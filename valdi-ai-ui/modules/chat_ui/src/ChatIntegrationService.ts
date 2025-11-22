/**
 * Chat Integration Service
 *
 * SOLID/DRY/KISS integration layer that wires ChatView, ConversationList,
 * and all services together with clean separation of concerns.
 *
 * Single Responsibility: Coordinate between UI components and services
 * Open/Closed: Extensible for new integrations without modifying existing code
 * Liskov Substitution: Can swap implementations via dependency injection
 * Interface Segregation: Small, focused interfaces
 * Dependency Inversion: Depends on abstractions, not concretions
 */

import { ChatService } from '@chat_core/ChatService';
import { MessageStore } from '@chat_core/MessageStore';
import { ConversationStore } from '@chat_core/ConversationStore';
import { Message, Conversation } from '@common/types';
import { NavigationController } from 'valdi_navigation/src/NavigationController';

/**
 * Chat Integration Configuration
 */
export interface ChatIntegrationConfig {
  chatService: ChatService;
  messageStore: MessageStore;
  conversationStore: ConversationStore;
  navigationController: NavigationController;
}

/**
 * Stream Progress Callback
 */
export type StreamProgressCallback = (delta: string, fullText: string) => void;

/**
 * Chat Integration Service
 *
 * Coordinates chat operations across stores and services.
 * Follows KISS principle - simple, focused methods.
 */
export class ChatIntegrationService {
  private chatService: ChatService;
  private messageStore: MessageStore;
  private conversationStore: ConversationStore;
  private navigationController: NavigationController;

  constructor(config: ChatIntegrationConfig) {
    this.chatService = config.chatService;
    this.messageStore = config.messageStore;
    this.conversationStore = config.conversationStore;
    this.navigationController = config.navigationController;
  }

  /**
   * Send a message with streaming response
   *
   * DRY: Single method handles all send logic
   * KISS: Simple, clear flow
   */
  async sendMessage(
    conversationId: string,
    content: string,
    onProgress?: StreamProgressCallback,
  ): Promise<void> {
    try {
      // Get conversation
      const conversation = this.conversationStore.getConversation(conversationId);
      if (!conversation) {
        throw new Error(`Conversation not found: ${conversationId}`);
      }

      // Create user message
      const userMessage: Message = {
        id: this.generateMessageId(),
        conversationId,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      // Add to store
      this.messageStore.addMessage(userMessage);

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: this.generateMessageId(),
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'sending',
      };

      this.messageStore.addMessage(assistantMessage);

      // Get conversation messages
      const messages = this.messageStore.getConversationMessages(conversationId);

      // Stream response
      let fullResponse = '';

      await this.chatService.sendMessageStreaming(
        messages,
        {
          onToken: (delta: string) => {
            fullResponse += delta;

            // Update message
            this.messageStore.updateMessage(assistantMessage.id, {
              content: fullResponse,
              status: 'sending',
            });

            // Progress callback
            if (onProgress) {
              onProgress(delta, fullResponse);
            }
          },
          onComplete: () => {
            // Mark as sent
            this.messageStore.updateMessage(assistantMessage.id, {
              status: 'sent',
            });

            // Update conversation metadata
            this.conversationStore.updateConversation(conversationId, {
              updatedAt: new Date().toISOString(),
              messageCount: messages.length + 2, // +2 for user and assistant
            });
          },
          onError: (error: Error) => {
            // Mark as error
            this.messageStore.updateMessage(assistantMessage.id, {
              status: 'error',
              error: error.message,
            });
          },
        },
      );
    } catch (error) {
      console.error('[ChatIntegrationService] Send message error:', error);
      throw error;
    }
  }

  /**
   * Navigate to conversation
   *
   * KISS: Simple navigation helper
   */
  navigateToConversation(conversationId: string, ChatViewComponent: any): void {
    this.conversationStore.setActiveConversation(conversationId);
    this.navigationController.push(ChatViewComponent, {
      conversationId,
    });
  }

  /**
   * Create new conversation and navigate
   *
   * DRY: Reusable conversation creation
   */
  async createAndNavigateToConversation(
    title: string,
    ChatViewComponent: any,
  ): Promise<string> {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      status: 'active',
    };

    await this.conversationStore.createConversation(conversation);
    this.navigateToConversation(conversation.id, ChatViewComponent);

    return conversation.id;
  }

  /**
   * Load conversation messages
   *
   * KISS: Simple data loading
   */
  loadConversationMessages(conversationId: string): Message[] {
    return this.messageStore.getConversationMessages(conversationId);
  }

  /**
   * Load all conversations
   *
   * KISS: Simple data loading
   */
  loadAllConversations(): Conversation[] {
    return this.conversationStore.getAllConversations();
  }

  /**
   * Load conversations with filter
   *
   * DRY: Reusable filtering logic
   */
  loadConversationsFiltered(filter: {
    status?: 'active' | 'archived';
    searchQuery?: string;
  }): Conversation[] {
    let conversations = this.loadAllConversations();

    // Filter by status
    if (filter.status) {
      conversations = conversations.filter((c) => c.status === filter.status);
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      conversations = conversations.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.metadata?.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    return conversations;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await this.conversationStore.deleteConversation(conversationId);
    this.messageStore.clearConversation(conversationId);
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    await this.conversationStore.updateConversation(conversationId, {
      status: 'archived',
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Subscribe to conversation updates
   *
   * Follows Observer pattern for reactive updates
   */
  subscribeToConversations(
    callback: (conversations: Conversation[]) => void,
  ): () => void {
    return this.conversationStore.subscribe(() => {
      const conversations = this.loadAllConversations();
      callback(conversations);
    });
  }

  /**
   * Subscribe to message updates for a conversation
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
  ): () => void {
    return this.messageStore.subscribe(() => {
      const messages = this.loadConversationMessages(conversationId);
      callback(messages);
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique conversation ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
