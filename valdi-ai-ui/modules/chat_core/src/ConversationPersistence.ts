/**
 * ConversationPersistence
 *
 * Handles persistence of conversations to storage.
 * Manages serialization, deserialization, and storage operations for conversations.
 */

import {
  Conversation,
  ConversationStatus,
  ModelConfig,
  AIProvider,
} from '../../common/src';
import { StorageProvider, defaultStorage } from './StorageProvider';

/**
 * Serialized Conversation
 *
 * Conversation with Date objects converted to ISO strings for storage.
 */
interface SerializedConversation {
  id: string;
  title: string;
  systemPrompt?: string;
  modelConfig: ModelConfig;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  status: ConversationStatus;
  isPinned: boolean;
  tags: string[];
  messageCount: number;
  tokenCount?: number;
  metadata?: Conversation['metadata'];
}

/**
 * Persistence Configuration
 */
export interface ConversationPersistenceConfig {
  /** Storage provider to use */
  storage?: StorageProvider;

  /** Enable automatic persistence on changes */
  autoPersist?: boolean;

  /** Debounce delay for auto-persist (ms) */
  debounceMs?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Conversation Persistence Class
 *
 * Manages conversation persistence to storage.
 * Handles serialization/deserialization and batch operations.
 */
export class ConversationPersistence {
  private storage: StorageProvider;
  private debounceMs: number;
  private debug: boolean;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  private readonly STORAGE_KEY = 'conversations';

  constructor(config: ConversationPersistenceConfig = {}) {
    this.storage = config.storage || defaultStorage;
    this.debounceMs = config.debounceMs ?? 500;
    this.debug = config.debug ?? false;
  }

  /**
   * Serialize a conversation for storage
   */
  private serializeConversation(
    conversation: Conversation,
  ): SerializedConversation {
    return {
      id: conversation.id,
      title: conversation.title,
      systemPrompt: conversation.systemPrompt,
      modelConfig: conversation.modelConfig,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      lastMessageAt: conversation.lastMessageAt?.toISOString(),
      status: conversation.status,
      isPinned: conversation.isPinned,
      tags: conversation.tags,
      messageCount: conversation.messageCount,
      tokenCount: conversation.tokenCount,
      metadata: conversation.metadata,
    };
  }

  /**
   * Deserialize a conversation from storage
   */
  private deserializeConversation(
    serialized: SerializedConversation,
  ): Conversation {
    return {
      id: serialized.id,
      title: serialized.title,
      systemPrompt: serialized.systemPrompt,
      modelConfig: serialized.modelConfig,
      createdAt: new Date(serialized.createdAt),
      updatedAt: new Date(serialized.updatedAt),
      lastMessageAt: serialized.lastMessageAt
        ? new Date(serialized.lastMessageAt)
        : undefined,
      status: serialized.status,
      isPinned: serialized.isPinned,
      tags: serialized.tags,
      messageCount: serialized.messageCount,
      tokenCount: serialized.tokenCount,
      metadata: serialized.metadata,
    };
  }

  /**
   * Save a single conversation
   */
  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const conversations = await this.loadConversations();
      conversations[conversation.id] = conversation;

      await this.saveConversations(conversations);

      if (this.debug) {
        console.log(
          `[ConversationPersistence] Saved conversation ${conversation.id}`,
        );
      }
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error saving conversation:',
        error,
      );
      throw new Error(
        `Failed to save conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Save all conversations
   */
  async saveConversations(
    conversations: Record<string, Conversation>,
  ): Promise<void> {
    try {
      const serialized: Record<string, SerializedConversation> = {};

      Object.entries(conversations).forEach(([id, conv]) => {
        serialized[id] = this.serializeConversation(conv);
      });

      const data = JSON.stringify(serialized);
      await this.storage.setItem(this.STORAGE_KEY, data);

      if (this.debug) {
        console.log(
          `[ConversationPersistence] Saved ${Object.keys(conversations).length} conversations`,
        );
      }
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error saving conversations:',
        error,
      );
      throw new Error(
        `Failed to save conversations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Save conversations with debouncing (for auto-persist)
   */
  async saveConversationsDebounced(
    conversations: Record<string, Conversation>,
  ): Promise<void> {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    return new Promise((resolve, reject) => {
      this.debounceTimer = setTimeout(async () => {
        try {
          await this.saveConversations(conversations);
          this.debounceTimer = undefined;
          resolve();
        } catch (error) {
          this.debounceTimer = undefined;
          reject(error);
        }
      }, this.debounceMs);
    });
  }

  /**
   * Load all conversations
   */
  async loadConversations(): Promise<Record<string, Conversation>> {
    try {
      const data = await this.storage.getItem(this.STORAGE_KEY);

      if (!data) {
        if (this.debug) {
          console.log(
            '[ConversationPersistence] No conversations found in storage',
          );
        }
        return {};
      }

      const serialized: Record<string, SerializedConversation> =
        JSON.parse(data);
      const conversations: Record<string, Conversation> = {};

      Object.entries(serialized).forEach(([id, conv]) => {
        conversations[id] = this.deserializeConversation(conv);
      });

      if (this.debug) {
        console.log(
          `[ConversationPersistence] Loaded ${Object.keys(conversations).length} conversations`,
        );
      }

      return conversations;
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error loading conversations:',
        error,
      );
      // Return empty object on error to prevent crashes
      return {};
    }
  }

  /**
   * Load a single conversation
   */
  async loadConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversations = await this.loadConversations();
      return conversations[conversationId] || null;
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error loading conversation:',
        error,
      );
      return null;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversations = await this.loadConversations();

      if (!(conversationId in conversations)) {
        if (this.debug) {
          console.log(
            `[ConversationPersistence] Conversation ${conversationId} not found`,
          );
        }
        return;
      }

      delete conversations[conversationId];
      await this.saveConversations(conversations);

      if (this.debug) {
        console.log(
          `[ConversationPersistence] Deleted conversation ${conversationId}`,
        );
      }
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error deleting conversation:',
        error,
      );
      throw new Error(
        `Failed to delete conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete multiple conversations
   */
  async deleteConversations(conversationIds: string[]): Promise<void> {
    try {
      const conversations = await this.loadConversations();

      conversationIds.forEach((id) => {
        delete conversations[id];
      });

      await this.saveConversations(conversations);

      if (this.debug) {
        console.log(
          `[ConversationPersistence] Deleted ${conversationIds.length} conversations`,
        );
      }
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error deleting conversations:',
        error,
      );
      throw new Error(
        `Failed to delete conversations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Clear all persisted conversations
   */
  async clearAll(): Promise<void> {
    try {
      await this.storage.removeItem(this.STORAGE_KEY);

      if (this.debug) {
        console.log(
          '[ConversationPersistence] Cleared all persisted conversations',
        );
      }
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error clearing all conversations:',
        error,
      );
      throw new Error(
        `Failed to clear conversations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get conversation count
   */
  async getConversationCount(): Promise<number> {
    try {
      const conversations = await this.loadConversations();
      return Object.keys(conversations).length;
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error getting conversation count:',
        error,
      );
      return 0;
    }
  }

  /**
   * Check if conversations exist
   */
  async hasConversations(): Promise<boolean> {
    try {
      const data = await this.storage.getItem(this.STORAGE_KEY);
      return data !== null;
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error checking conversations:',
        error,
      );
      return false;
    }
  }

  /**
   * Export conversations to JSON
   */
  async exportConversations(): Promise<string> {
    try {
      const conversations = await this.loadConversations();
      const serialized: Record<string, SerializedConversation> = {};

      Object.entries(conversations).forEach(([id, conv]) => {
        serialized[id] = this.serializeConversation(conv);
      });

      return JSON.stringify(serialized, null, 2);
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error exporting conversations:',
        error,
      );
      throw new Error(
        `Failed to export conversations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Import conversations from JSON
   */
  async importConversations(
    jsonData: string,
    merge: boolean = false,
  ): Promise<number> {
    try {
      const serialized: Record<string, SerializedConversation> =
        JSON.parse(jsonData);
      const conversations: Record<string, Conversation> = {};

      Object.entries(serialized).forEach(([id, conv]) => {
        conversations[id] = this.deserializeConversation(conv);
      });

      if (merge) {
        const existing = await this.loadConversations();
        const combined = { ...existing, ...conversations };
        await this.saveConversations(combined);
        return Object.keys(conversations).length;
      } else {
        await this.saveConversations(conversations);
        return Object.keys(conversations).length;
      }
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error importing conversations:',
        error,
      );
      throw new Error(
        `Failed to import conversations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get conversations by status
   */
  async getConversationsByStatus(
    status: ConversationStatus,
  ): Promise<Conversation[]> {
    try {
      const conversations = await this.loadConversations();
      return Object.values(conversations).filter(
        (conv) => conv.status === status,
      );
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error getting conversations by status:',
        error,
      );
      return [];
    }
  }

  /**
   * Get conversations by provider
   */
  async getConversationsByProvider(
    provider: AIProvider,
  ): Promise<Conversation[]> {
    try {
      const conversations = await this.loadConversations();
      return Object.values(conversations).filter(
        (conv) => conv.modelConfig.provider === provider,
      );
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error getting conversations by provider:',
        error,
      );
      return [];
    }
  }

  /**
   * Get pinned conversations
   */
  async getPinnedConversations(): Promise<Conversation[]> {
    try {
      const conversations = await this.loadConversations();
      return Object.values(conversations)
        .filter((conv) => conv.isPinned)
        .sort((a, b) => {
          const aTime = a.lastMessageAt?.getTime() || a.updatedAt.getTime();
          const bTime = b.lastMessageAt?.getTime() || b.updatedAt.getTime();
          return bTime - aTime;
        });
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error getting pinned conversations:',
        error,
      );
      return [];
    }
  }

  /**
   * Search conversations by title or system prompt
   */
  async searchConversations(query: string): Promise<Conversation[]> {
    try {
      const conversations = await this.loadConversations();
      const lowerQuery = query.toLowerCase();

      return Object.values(conversations).filter((conv) => {
        const matchesTitle = conv.title.toLowerCase().includes(lowerQuery);
        const matchesPrompt =
          conv.systemPrompt?.toLowerCase().includes(lowerQuery) || false;
        return matchesTitle || matchesPrompt;
      });
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error searching conversations:',
        error,
      );
      return [];
    }
  }

  /**
   * Flush any pending debounced saves
   */
  async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
  }

  /**
   * Get storage stats
   */
  async getStorageStats(): Promise<{
    conversationCount: number;
    totalMessageCount: number;
    activeConversations: number;
    archivedConversations: number;
    pinnedConversations: number;
  }> {
    try {
      const conversations = await this.loadConversations();
      const conversationList = Object.values(conversations);

      return {
        conversationCount: conversationList.length,
        totalMessageCount: conversationList.reduce(
          (sum, conv) => sum + conv.messageCount,
          0,
        ),
        activeConversations: conversationList.filter(
          (c) => c.status === 'active',
        ).length,
        archivedConversations: conversationList.filter(
          (c) => c.status === 'archived',
        ).length,
        pinnedConversations: conversationList.filter((c) => c.isPinned).length,
      };
    } catch (error) {
      console.error(
        '[ConversationPersistence] Error getting storage stats:',
        error,
      );
      return {
        conversationCount: 0,
        totalMessageCount: 0,
        activeConversations: 0,
        archivedConversations: 0,
        pinnedConversations: 0,
      };
    }
  }
}

/**
 * Global conversation persistence instance
 */
export const conversationPersistence = new ConversationPersistence();
