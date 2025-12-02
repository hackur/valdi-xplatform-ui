/**
 * MessagePersistence
 *
 * Handles persistence of messages to storage.
 * Manages serialization, deserialization, and storage operations for messages.
 */

import type {
  Message,
  MessageRole,
  MessageStatus,
  MessageContentPart,
  ToolCall,
} from '../../common/src';
import type { StorageProvider} from './StorageProvider';
import { defaultStorage } from './StorageProvider';

/**
 * Serialized Message
 *
 * Message with Date objects converted to ISO strings for storage.
 */
interface SerializedMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string | MessageContentPart[];
  createdAt: string;
  updatedAt: string;
  status: MessageStatus;
  toolCalls?: ToolCall[];
  error?: string;
  metadata?: Message['metadata'];
}

/**
 * Persistence Configuration
 */
export interface MessagePersistenceConfig {
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
 * Message Persistence Class
 *
 * Manages message persistence to storage.
 * Handles serialization/deserialization and batch operations.
 */
export class MessagePersistence {
  private readonly storage: StorageProvider;
  private readonly debounceMs: number;
  private readonly debug: boolean;
  private readonly debounceTimers: Map<string, ReturnType<typeof setTimeout>> =
    new Map();

  constructor(config: MessagePersistenceConfig = {}) {
    this.storage = config.storage || defaultStorage;
    this.debounceMs = config.debounceMs ?? 500;
    this.debug = config.debug ?? false;
  }

  /**
   * Get storage key for conversation messages
   */
  private getStorageKey(conversationId: string): string {
    return `messages_${conversationId}`;
  }

  /**
   * Serialize a message for storage
   */
  private serializeMessage(message: Message): SerializedMessage {
    return {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      status: message.status,
      toolCalls: message.toolCalls,
      error: message.error,
      metadata: message.metadata,
    };
  }

  /**
   * Deserialize a message from storage
   */
  private deserializeMessage(serialized: SerializedMessage): Message {
    return {
      id: serialized.id,
      conversationId: serialized.conversationId,
      role: serialized.role,
      content: serialized.content,
      createdAt: new Date(serialized.createdAt),
      updatedAt: new Date(serialized.updatedAt),
      status: serialized.status,
      toolCalls: serialized.toolCalls,
      error: serialized.error,
      metadata: serialized.metadata,
    };
  }

  /**
   * Save a single message
   */
  async saveMessage(message: Message): Promise<void> {
    try {
      const messages = await this.loadMessages(message.conversationId);
      const existingIndex = messages.findIndex((m) => m.id === message.id);

      if (existingIndex >= 0) {
        // Update existing message
        messages[existingIndex] = message;
      } else {
        // Add new message
        messages.push(message);
      }

      await this.saveMessages(message.conversationId, messages);

      if (this.debug) {
        console.log(
          `[MessagePersistence] Saved message ${message.id} for conversation ${message.conversationId}`,
        );
      }
    } catch (error) {
      console.error('[MessagePersistence] Error saving message:', error);
      throw new Error(
        `Failed to save message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Save multiple messages for a conversation
   */
  async saveMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    try {
      const key = this.getStorageKey(conversationId);
      const serialized = messages.map((m) => this.serializeMessage(m));
      const data = JSON.stringify(serialized);

      await this.storage.setItem(key, data);

      if (this.debug) {
        console.log(
          `[MessagePersistence] Saved ${messages.length} messages for conversation ${conversationId}`,
        );
      }
    } catch (error) {
      console.error('[MessagePersistence] Error saving messages:', error);
      throw new Error(
        `Failed to save messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Save messages with debouncing (for auto-persist)
   */
  async saveMessagesDebounced(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(conversationId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          await this.saveMessages(conversationId, messages);
          this.debounceTimers.delete(conversationId);
          resolve();
        } catch (error) {
          this.debounceTimers.delete(conversationId);
          reject(error);
        }
      }, this.debounceMs);

      this.debounceTimers.set(conversationId, timer);
    });
  }

  /**
   * Load messages for a conversation
   */
  async loadMessages(conversationId: string): Promise<Message[]> {
    try {
      const key = this.getStorageKey(conversationId);
      const data = await this.storage.getItem(key);

      if (!data) {
        if (this.debug) {
          console.log(
            `[MessagePersistence] No messages found for conversation ${conversationId}`,
          );
        }
        return [];
      }

      const serialized: SerializedMessage[] = JSON.parse(data);
      const messages = serialized.map((m) => this.deserializeMessage(m));

      if (this.debug) {
        console.log(
          `[MessagePersistence] Loaded ${messages.length} messages for conversation ${conversationId}`,
        );
      }

      return messages;
    } catch (error) {
      console.error('[MessagePersistence] Error loading messages:', error);
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  /**
   * Delete a single message
   */
  async deleteMessage(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    try {
      const messages = await this.loadMessages(conversationId);
      const filtered = messages.filter((m) => m.id !== messageId);

      if (filtered.length === messages.length) {
        if (this.debug) {
          console.log(
            `[MessagePersistence] Message ${messageId} not found in conversation ${conversationId}`,
          );
        }
        return;
      }

      await this.saveMessages(conversationId, filtered);

      if (this.debug) {
        console.log(
          `[MessagePersistence] Deleted message ${messageId} from conversation ${conversationId}`,
        );
      }
    } catch (error) {
      console.error('[MessagePersistence] Error deleting message:', error);
      throw new Error(
        `Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete all messages for a conversation
   */
  async deleteMessages(conversationId: string): Promise<void> {
    try {
      const key = this.getStorageKey(conversationId);
      await this.storage.removeItem(key);

      if (this.debug) {
        console.log(
          `[MessagePersistence] Deleted all messages for conversation ${conversationId}`,
        );
      }
    } catch (error) {
      console.error('[MessagePersistence] Error deleting messages:', error);
      throw new Error(
        `Failed to delete messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Load all messages for all conversations
   */
  async loadAllMessages(): Promise<Record<string, Message[]>> {
    try {
      const keys = await this.storage.getAllKeys();
      const messageKeys = keys.filter((key) => key.startsWith('messages_'));

      const result: Record<string, Message[]> = {};

      for (const key of messageKeys) {
        const conversationId = key.replace('messages_', '');
        const messages = await this.loadMessages(conversationId);
        if (messages.length > 0) {
          result[conversationId] = messages;
        }
      }

      if (this.debug) {
        console.log(
          `[MessagePersistence] Loaded messages for ${Object.keys(result).length} conversations`,
        );
      }

      return result;
    } catch (error) {
      console.error('[MessagePersistence] Error loading all messages:', error);
      return {};
    }
  }

  /**
   * Clear all persisted messages
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await this.storage.getAllKeys();
      const messageKeys = keys.filter((key) => key.startsWith('messages_'));

      for (const key of messageKeys) {
        await this.storage.removeItem(key);
      }

      if (this.debug) {
        console.log(`[MessagePersistence] Cleared all persisted messages`);
      }
    } catch (error) {
      console.error('[MessagePersistence] Error clearing all messages:', error);
      throw new Error(
        `Failed to clear messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get message count for a conversation
   */
  async getMessageCount(conversationId: string): Promise<number> {
    try {
      const messages = await this.loadMessages(conversationId);
      return messages.length;
    } catch (error) {
      console.error('[MessagePersistence] Error getting message count:', error);
      return 0;
    }
  }

  /**
   * Check if messages exist for a conversation
   */
  async hasMessages(conversationId: string): Promise<boolean> {
    try {
      const key = this.getStorageKey(conversationId);
      const data = await this.storage.getItem(key);
      return data !== null;
    } catch (error) {
      console.error('[MessagePersistence] Error checking messages:', error);
      return false;
    }
  }

  /**
   * Export messages to JSON
   */
  async exportMessages(conversationId: string): Promise<string> {
    try {
      const messages = await this.loadMessages(conversationId);
      const serialized = messages.map((m) => this.serializeMessage(m));
      return JSON.stringify(serialized, null, 2);
    } catch (error) {
      console.error('[MessagePersistence] Error exporting messages:', error);
      throw new Error(
        `Failed to export messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Import messages from JSON
   */
  async importMessages(
    conversationId: string,
    jsonData: string,
    merge: boolean = false,
  ): Promise<number> {
    try {
      const serialized: SerializedMessage[] = JSON.parse(jsonData);
      const messages = serialized.map((m) => this.deserializeMessage(m));

      if (merge) {
        const existing = await this.loadMessages(conversationId);
        const existingIds = new Set(existing.map((m) => m.id));
        const newMessages = messages.filter((m) => !existingIds.has(m.id));
        const combined = [...existing, ...newMessages];
        await this.saveMessages(conversationId, combined);
        return newMessages.length;
      } else {
        await this.saveMessages(conversationId, messages);
        return messages.length;
      }
    } catch (error) {
      console.error('[MessagePersistence] Error importing messages:', error);
      throw new Error(
        `Failed to import messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Flush any pending debounced saves
   */
  async flush(): Promise<void> {
    const promises: Array<Promise<void>> = [];

    this.debounceTimers.forEach((timer, conversationId) => {
      clearTimeout(timer);
      this.debounceTimers.delete(conversationId);
    });

    await Promise.all(promises);
  }
}

/**
 * Global message persistence instance
 */
export const messagePersistence = new MessagePersistence();
