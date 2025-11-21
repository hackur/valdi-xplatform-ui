/**
 * ConversationStore
 *
 * Manages conversation state and metadata.
 * Provides reactive state management for conversations with CRUD operations.
 */

import {
  Conversation,
  ConversationCreateInput,
  ConversationUpdateInput,
  ConversationFilterOptions,
  ConversationSortOptions,
  ConversationListOptions,
  ConversationUtils,
  ConversationTypeGuards,
  ConversationStatus,
} from '@common';

/**
 * Conversation Store State
 */
export interface ConversationStoreState {
  /** All conversations by ID */
  conversations: Record<string, Conversation>;

  /** Currently active conversation ID */
  activeConversationId?: string;

  /** Loading state for async operations */
  isLoading: boolean;

  /** Error state */
  error?: string;
}

/**
 * ConversationStore Class
 *
 * Centralized store for managing conversations.
 * Uses observer pattern for reactive updates.
 */
export class ConversationStore {
  private state: ConversationStoreState = {
    conversations: {},
    activeConversationId: undefined,
    isLoading: false,
    error: undefined,
  };

  private listeners: Set<(state: ConversationStoreState) => void> = new Set();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: ConversationStoreState) => void): () => void {
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
  getState(): ConversationStoreState {
    return this.state;
  }

  /**
   * Create a new conversation
   */
  createConversation(input: ConversationCreateInput): Conversation {
    const conversation = ConversationUtils.create(input);

    this.state = {
      ...this.state,
      conversations: {
        ...this.state.conversations,
        [conversation.id]: conversation,
      },
      activeConversationId: conversation.id,
    };

    this.notify();
    return conversation;
  }

  /**
   * Get a conversation by ID
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.state.conversations[conversationId];
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    return Object.values(this.state.conversations);
  }

  /**
   * Update an existing conversation
   */
  updateConversation(conversationId: string, updates: ConversationUpdateInput): void {
    const conversation = this.getConversation(conversationId);

    if (!conversation) {
      console.warn(`Conversation ${conversationId} not found`);
      return;
    }

    const updatedConversation = ConversationUtils.update(conversation, updates);

    this.state = {
      ...this.state,
      conversations: {
        ...this.state.conversations,
        [conversationId]: updatedConversation,
      },
    };

    this.notify();
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): void {
    const { [conversationId]: _, ...remaining } = this.state.conversations;

    this.state = {
      ...this.state,
      conversations: remaining,
      activeConversationId:
        this.state.activeConversationId === conversationId
          ? undefined
          : this.state.activeConversationId,
    };

    this.notify();
  }

  /**
   * List conversations with filtering and sorting
   */
  listConversations(options: ConversationListOptions = {}): Conversation[] {
    let conversations = this.getAllConversations();

    // Apply filters
    if (options.filter) {
      conversations = this.filterConversations(conversations, options.filter);
    }

    // Apply sorting
    if (options.sort) {
      conversations = this.sortConversations(conversations, options.sort);
    }

    // Apply pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit;
      conversations = limit
        ? conversations.slice(offset, offset + limit)
        : conversations.slice(offset);
    }

    return conversations;
  }

  /**
   * Filter conversations based on criteria
   */
  private filterConversations(
    conversations: Conversation[],
    filter: ConversationFilterOptions
  ): Conversation[] {
    return conversations.filter((conv) => {
      // Filter by status
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(conv.status)) {
          return false;
        }
      }

      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some((tag) => conv.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Filter by pinned status
      if (filter.isPinned !== undefined) {
        if (conv.isPinned !== filter.isPinned) {
          return false;
        }
      }

      // Filter by provider
      if (filter.provider && filter.provider.length > 0) {
        if (!filter.provider.includes(conv.modelConfig.provider)) {
          return false;
        }
      }

      // Filter by search query (title or system prompt)
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesTitle = conv.title.toLowerCase().includes(query);
        const matchesPrompt = conv.systemPrompt?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesPrompt) {
          return false;
        }
      }

      // Filter by date range
      if (filter.dateFrom) {
        const dateToCompare = conv.lastMessageAt || conv.updatedAt;
        if (dateToCompare < filter.dateFrom) {
          return false;
        }
      }

      if (filter.dateTo) {
        const dateToCompare = conv.lastMessageAt || conv.updatedAt;
        if (dateToCompare > filter.dateTo) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort conversations based on criteria
   */
  private sortConversations(
    conversations: Conversation[],
    sort: ConversationSortOptions
  ): Conversation[] {
    return [...conversations].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'lastMessageAt':
          const aTime = a.lastMessageAt?.getTime() || a.updatedAt.getTime();
          const bTime = b.lastMessageAt?.getTime() || b.updatedAt.getTime();
          comparison = aTime - bTime;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'messageCount':
          comparison = a.messageCount - b.messageCount;
          break;
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Set active conversation
   */
  setActiveConversation(conversationId: string): void {
    if (!this.getConversation(conversationId)) {
      console.warn(`Cannot set active conversation: ${conversationId} not found`);
      return;
    }

    this.state = {
      ...this.state,
      activeConversationId: conversationId,
    };

    this.notify();
  }

  /**
   * Get active conversation
   */
  getActiveConversation(): Conversation | undefined {
    return this.state.activeConversationId
      ? this.getConversation(this.state.activeConversationId)
      : undefined;
  }

  /**
   * Clear active conversation
   */
  clearActiveConversation(): void {
    this.state = {
      ...this.state,
      activeConversationId: undefined,
    };

    this.notify();
  }

  /**
   * Archive a conversation
   */
  archiveConversation(conversationId: string): void {
    this.updateConversation(conversationId, { status: 'archived' });
  }

  /**
   * Activate (unarchive) a conversation
   */
  activateConversation(conversationId: string): void {
    this.updateConversation(conversationId, { status: 'active' });
  }

  /**
   * Toggle pin status of a conversation
   */
  togglePin(conversationId: string): void {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      this.updateConversation(conversationId, { isPinned: !conversation.isPinned });
    }
  }

  /**
   * Add tag to conversation
   */
  addTag(conversationId: string, tag: string): void {
    const conversation = this.getConversation(conversationId);
    if (conversation && !conversation.tags.includes(tag)) {
      this.updateConversation(conversationId, {
        tags: [...conversation.tags, tag],
      });
    }
  }

  /**
   * Remove tag from conversation
   */
  removeTag(conversationId: string, tag: string): void {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      this.updateConversation(conversationId, {
        tags: conversation.tags.filter((t) => t !== tag),
      });
    }
  }

  /**
   * Increment message count for a conversation
   */
  incrementMessageCount(conversationId: string): void {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      const updatedConversation = ConversationUtils.incrementMessageCount(conversation);
      this.state = {
        ...this.state,
        conversations: {
          ...this.state.conversations,
          [conversationId]: updatedConversation,
        },
      };
      this.notify();
    }
  }

  /**
   * Search conversations by query
   */
  searchConversations(query: string): Conversation[] {
    return this.listConversations({
      filter: { searchQuery: query },
      sort: { field: 'lastMessageAt', order: 'desc' },
    });
  }

  /**
   * Get pinned conversations
   */
  getPinnedConversations(): Conversation[] {
    return this.listConversations({
      filter: { isPinned: true },
      sort: { field: 'lastMessageAt', order: 'desc' },
    });
  }

  /**
   * Get conversations by status
   */
  getConversationsByStatus(status: ConversationStatus): Conversation[] {
    return this.listConversations({
      filter: { status: [status] },
      sort: { field: 'lastMessageAt', order: 'desc' },
    });
  }

  /**
   * Get conversation count
   */
  getConversationCount(): number {
    return Object.keys(this.state.conversations).length;
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.state = {
      ...this.state,
      isLoading,
    };

    this.notify();
  }

  /**
   * Set error state
   */
  setError(error?: string): void {
    this.state = {
      ...this.state,
      error,
    };

    this.notify();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.setError(undefined);
  }

  /**
   * Reset entire store
   */
  reset(): void {
    this.state = {
      conversations: {},
      activeConversationId: undefined,
      isLoading: false,
      error: undefined,
    };

    this.notify();
  }

  /**
   * Bulk import conversations
   */
  importConversations(conversations: Conversation[]): void {
    const conversationsMap = conversations.reduce(
      (acc, conv) => {
        acc[conv.id] = conv;
        return acc;
      },
      {} as Record<string, Conversation>
    );

    this.state = {
      ...this.state,
      conversations: {
        ...this.state.conversations,
        ...conversationsMap,
      },
    };

    this.notify();
  }

  /**
   * Bulk delete conversations
   */
  bulkDeleteConversations(conversationIds: string[]): void {
    const conversations = { ...this.state.conversations };
    conversationIds.forEach((id) => {
      delete conversations[id];
    });

    this.state = {
      ...this.state,
      conversations,
      activeConversationId:
        this.state.activeConversationId &&
        conversationIds.includes(this.state.activeConversationId)
          ? undefined
          : this.state.activeConversationId,
    };

    this.notify();
  }
}

/**
 * Global conversation store instance
 */
export const conversationStore = new ConversationStore();
