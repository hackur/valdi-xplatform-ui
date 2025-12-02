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

import type { ChatService } from '../../chat_core/src/ChatService';
import type { MessageStore } from '../../chat_core/src/MessageStore';
import type { ConversationStore } from '../../chat_core/src/ConversationStore';
import type { Message, Conversation } from '../../common/src/index';
import type { NavigationController } from 'valdi_navigation/src/NavigationController';

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
  private readonly chatService: ChatService;
  private readonly messageStore: MessageStore;
  private readonly conversationStore: ConversationStore;
  private readonly navigationController: NavigationController;

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
      // Get conversation to retrieve model config and system prompt
      // Fails early if conversation doesn't exist
      const conversation =
        this.conversationStore.getConversation(conversationId);
      if (!conversation) {
        throw new Error(`Conversation not found: ${conversationId}`);
      }

      /*
       * Message creation and storage pattern
       * 1. Create user message immediately (synchronous)
       * 2. Create assistant placeholder (status: 'sending')
       * 3. Stream response and update placeholder
       * This provides instant UI feedback while waiting for API
       */

      // Create user message with completed status
      // User messages are always complete on creation
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

      // Add to store for immediate UI display
      this.messageStore.addMessage(userMessage);

      // Create assistant message placeholder
      // Placeholder shows loading state in UI
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

      /*
       * Streaming response handler
       * Updates message store in real-time as chunks arrive
       * Event types:
       * - chunk: Incremental content update
       * - complete: Stream finished successfully
       * - error: Stream failed
       */
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
            // Accumulate delta into full response
            fullResponse += event.delta;

            // Update message store for reactive UI updates
            // This triggers subscriptions and re-renders
            this.messageStore.updateMessage(conversationId, assistantMessage.id, {
              content: fullResponse,
            });

            // Progress callback for additional UI updates
            // Allows components to react to streaming progress
            if (onProgress) {
              onProgress(event.delta, fullResponse);
            }
          } else if (event.type === 'complete') {
            // Mark as completed to remove loading state
            this.messageStore.updateMessage(conversationId, assistantMessage.id, {
              status: 'completed',
            });
          } else if (event.type === 'error') {
            // Mark as error to show error state in UI
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
    this.navigationController.push(
      ChatViewComponent,
      { conversationId, navigationController: this.navigationController },
      {},
    );
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
      lastMessageAt: now,
      messageCount: 0,
      status: 'active',
      modelConfig: {
        provider: 'openai',
        modelId: 'gpt-4-turbo',
        temperature: 0.7,
        maxTokens: 4096,
      },
      isPinned: false,
      tags: [],
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

    /*
     * Multi-criteria filtering with progressive refinement
     * Each filter reduces the result set sequentially
     * Order matters: status filter first (cheaper) then text search
     */

    // Filter by status (simple equality check)
    if (filter.status) {
      conversations = conversations.filter((c) => c.status === filter.status);
    }

    // Filter by search query (fuzzy text search)
    // Searches in title and tags for flexibility
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
    /*
     * Observer pattern implementation for reactive data flow
     * Store notifies subscribers on any change
     * Subscribers receive fresh data snapshot
     * Returns unsubscribe function for cleanup
     *
     * Usage pattern:
     * const unsubscribe = service.subscribeToConversations(handleUpdate);
     * // Later: unsubscribe() to prevent memory leaks
     */
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
    /*
     * Message-level subscription for conversation-specific updates
     * Filters messages by conversationId before callback
     * Enables efficient UI updates for single conversation view
     */
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
