/**
 * ConversationStore
 *
 * Manages conversation state and metadata.
 * Provides reactive state management for conversations with CRUD operations.
 */

import type {
  Conversation,
  ConversationCreateInput,
  ConversationUpdateInput,
  ConversationFilterOptions,
  ConversationSortOptions,
  ConversationListOptions,
  ConversationStatus} from '../../common/src';
import {
  ConversationUtils
} from '../../common/src';
import { ConversationPersistence } from './ConversationPersistence';

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
 * Centralized store for managing conversation metadata and state with reactive updates.
 * Implements observer pattern for UI synchronization, provides advanced filtering and
 * sorting capabilities, and integrates with ConversationPersistence for automatic storage.
 * Handles conversation lifecycle including creation, archival, pinning, and tagging.
 *
 * @example
 * ```typescript
 * const store = new ConversationStore(true);
 * await store.init();
 *
 * // Subscribe to changes
 * const unsubscribe = store.subscribe((state) => {
 *   console.log('Active conversations:', state.conversations);
 * });
 *
 * // Create a conversation
 * const conversation = await store.createConversation({
 *   title: 'My Chat',
 *   modelConfig: { provider: 'openai', modelId: 'gpt-4' },
 * });
 *
 * // List with filtering
 * const pinned = store.listConversations({
 *   filter: { isPinned: true },
 *   sort: { field: 'lastMessageAt', order: 'desc' },
 * });
 * ```
 */
export class ConversationStore {
  private state: ConversationStoreState = {
    conversations: {},
    activeConversationId: undefined,
    isLoading: false,
    error: undefined,
  };

  private readonly listeners: Set<(state: ConversationStoreState) => void> = new Set();
  private readonly persistence: ConversationPersistence;
  private enablePersistence: boolean;

  constructor(
    enablePersistence: boolean = true,
    persistence?: ConversationPersistence,
  ) {
    this.enablePersistence = enablePersistence;
    this.persistence = persistence || new ConversationPersistence();
  }

  /**
   * Initialize the store by loading persisted data
   */
  async init(): Promise<void> {
    if (!this.enablePersistence) {
      return;
    }

    this.setLoading(true);

    try {
      const conversations = await this.persistence.loadConversations();
      this.state = {
        ...this.state,
        conversations,
        isLoading: false,
      };
      this.notify();
    } catch (error) {
      console.error(
        '[ConversationStore] Error loading persisted conversations:',
        error,
      );
      this.setError('Failed to load conversations');
      this.setLoading(false);
    }
  }

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
    this.listeners.forEach((listener) => { listener(this.state); });
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
  async createConversation(
    input: ConversationCreateInput,
  ): Promise<Conversation> {
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

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.saveConversationsDebounced(
          this.state.conversations,
        );
      } catch (error) {
        console.error(
          '[ConversationStore] Error persisting conversation:',
          error,
        );
      }
    }

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
  async updateConversation(
    conversationId: string,
    updates: ConversationUpdateInput,
  ): Promise<void> {
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

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.saveConversationsDebounced(
          this.state.conversations,
        );
      } catch (error) {
        console.error(
          '[ConversationStore] Error persisting conversation update:',
          error,
        );
      }
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
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

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.deleteConversation(conversationId);
      } catch (error) {
        console.error(
          '[ConversationStore] Error persisting conversation deletion:',
          error,
        );
      }
    }
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
      const {limit} = options;
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
    filter: ConversationFilterOptions,
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
        const hasMatchingTag = filter.tags.some((tag) =>
          conv.tags.includes(tag),
        );
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
        const matchesPrompt =
          conv.systemPrompt?.toLowerCase().includes(query) || false;
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
    sort: ConversationSortOptions,
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
      console.warn(
        `Cannot set active conversation: ${conversationId} not found`,
      );
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
      this.updateConversation(conversationId, {
        isPinned: !conversation.isPinned,
      });
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
      const updatedConversation =
        ConversationUtils.incrementMessageCount(conversation);
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
   * Bulk import conversations
   */
  importConversations(conversations: Conversation[]): void {
    const conversationsMap = conversations.reduce<Record<string, Conversation>>(
      (acc, conv) => {
        acc[conv.id] = conv;
        return acc;
      },
      {},
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
  async bulkDeleteConversations(conversationIds: string[]): Promise<void> {
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

    // Persist the change
    if (this.enablePersistence) {
      try {
        await this.persistence.deleteConversations(conversationIds);
      } catch (error) {
        console.error(
          '[ConversationStore] Error persisting bulk deletion:',
          error,
        );
      }
    }
  }

  /**
   * Reset entire store
   */
  async reset(): Promise<void> {
    this.state = {
      conversations: {},
      activeConversationId: undefined,
      isLoading: false,
      error: undefined,
    };

    this.notify();

    // Clear persistence
    if (this.enablePersistence) {
      try {
        await this.persistence.clearAll();
      } catch (error) {
        console.error(
          '[ConversationStore] Error clearing persisted conversations:',
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

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    conversationCount: number;
    totalMessageCount: number;
    activeConversations: number;
    archivedConversations: number;
    pinnedConversations: number;
  }> {
    if (this.enablePersistence) {
      return this.persistence.getStorageStats();
    }

    // Return in-memory stats if persistence is disabled
    const conversations = Object.values(this.state.conversations);
    return {
      conversationCount: conversations.length,
      totalMessageCount: conversations.reduce(
        (sum, c) => sum + c.messageCount,
        0,
      ),
      activeConversations: conversations.filter((c) => c.status === 'active')
        .length,
      archivedConversations: conversations.filter(
        (c) => c.status === 'archived',
      ).length,
      pinnedConversations: conversations.filter((c) => c.isPinned).length,
    };
  }
}

/**
 * Global conversation store instance
 */
export const conversationStore = new ConversationStore();
