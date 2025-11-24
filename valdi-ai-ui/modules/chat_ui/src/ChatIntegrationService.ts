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
import { Message, Conversation } from '@common';
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
      const conversation =
        this.conversationStore.getConversation(conversationId);
      if (!conversation) {
        throw new Error(`Conversation not found: ${conversationId}`);
      }

      // Create user message
      const now = new Date();
      const userMessage: Message = {
        id: this.generateMessageId(),
        conversationId,
        role: 'user',
        content,
        createdAt: now,
        updatedAt: now,
        status: 'completed',
      };

      // Add to store
      this.messageStore.addMessage(userMessage);

      // Create assistant message placeholder
      const assistantNow = new Date();
      const assistantMessage: Message = {
        id: this.generateMessageId(),
        conversationId,
        role: 'assistant',
        content: '',
        createdAt: assistantNow,
        updatedAt: assistantNow,
        status: 'sending',
      };

      this.messageStore.addMessage(assistantMessage);

      // Get conversation messages
      const messages = this.messageStore.getMessages(conversationId);

      // Stream response
      let fullResponse = '';

      await this.chatService.sendMessageStreaming(
        {
          conversationId,
          message: content,
          modelConfig: conversation.modelConfig,
          systemPrompt: conversation.systemPrompt,
        },
        (event) => {
          if (event.type === 'chunk') {
            fullResponse += event.delta;

            // Update message
            this.messageStore.updateMessage(conversationId, assistantMessage.id, {
              content: fullResponse,
            });

            // Progress callback
            if (onProgress) {
              onProgress(event.delta, fullResponse);
            }
          } else if (event.type === 'complete') {
            // Mark as completed
            this.messageStore.updateMessage(conversationId, assistantMessage.id, {
              status: 'completed',
            });
          } else if (event.type === 'error') {
            // Mark as error
            this.messageStore.updateMessage(conversationId, assistantMessage.id, {
              status: 'error',
              error: event.error,
            });
          }
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
    const now = new Date();
    const conversation: Conversation = {
      id: this.generateConversationId(),
      title,
      createdAt: now,
      updatedAt: now,
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
    return this.messageStore.getMessages(conversationId);
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
          c.tags?.some((tag) => tag.toLowerCase().includes(query)),
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
