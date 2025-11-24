/**
 * MessageStore Tests
 *
 * Comprehensive unit tests for MessageStore service.
 * Tests message state management, persistence, and observable subscriptions.
 */

import { MessageStore } from '../MessageStore';
import { MessagePersistence } from '../MessagePersistence';
import { MemoryStorageProvider } from '../StorageProvider';
import { Message, MessageRole, MessageStatus } from '@common/types';

// Mock console methods to reduce test noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('MessageStore', () => {
  let store: MessageStore;
  let mockPersistence: MessagePersistence;
  let mockStorage: MemoryStorageProvider;

  beforeEach(() => {
    // Create fresh storage and persistence for each test
    mockStorage = new MemoryStorageProvider('test_');
    mockPersistence = new MessagePersistence({
      storage: mockStorage,
      autoPersist: true,
      debounceMs: 0, // No debounce for tests
      debug: false,
    });

    // Create store with mock persistence
    store = new MessageStore(true, mockPersistence);

    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(async () => {
    // Clean up
    await store.reset();
    await mockStorage.clear();

    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const state = store.getState();
      expect(state.messagesByConversation).toEqual({});
      expect(state.streamingStatus).toBe('idle');
      expect(state.streamingMessageId).toBeUndefined();
    });

    it('should load persisted messages on init', async () => {
      // Create a message and persist it directly
      const message = createMockMessage('conv-1', 'msg-1');
      await mockPersistence.saveMessage(message);

      // Create new store and initialize
      const newStore = new MessageStore(true, mockPersistence);
      await newStore.init();

      const messages = newStore.getMessages('conv-1');
      expect(messages).toHaveLength(1);
      expect(messages[0]?.id).toBe('msg-1');
    });

    it('should not load messages when persistence is disabled', async () => {
      const message = createMockMessage('conv-1', 'msg-1');
      await mockPersistence.saveMessage(message);

      const newStore = new MessageStore(false, mockPersistence);
      await newStore.init();

      const messages = newStore.getMessages('conv-1');
      expect(messages).toHaveLength(0);
    });

    it('should handle initialization errors gracefully', async () => {
      const errorPersistence = new MessagePersistence({
        storage: {
          getItem: jest.fn().mockResolvedValue(null),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
          getAllKeys: jest.fn().mockRejectedValue(new Error('Storage error')),
        },
        debug: false,
      });

      const newStore = new MessageStore(true, errorPersistence);
      await expect(newStore.init()).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Message CRUD Operations', () => {
    describe('addMessage', () => {
      it('should add a message to conversation', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        const messages = store.getMessages('conv-1');
        expect(messages).toHaveLength(1);
        expect(messages[0]).toEqual(message);
      });

      it('should add multiple messages to same conversation', async () => {
        const message1 = createMockMessage('conv-1', 'msg-1');
        const message2 = createMockMessage('conv-1', 'msg-2');

        await store.addMessage(message1);
        await store.addMessage(message2);

        const messages = store.getMessages('conv-1');
        expect(messages).toHaveLength(2);
        expect(messages[0]?.id).toBe('msg-1');
        expect(messages[1]?.id).toBe('msg-2');
      });

      it('should add messages to different conversations', async () => {
        const message1 = createMockMessage('conv-1', 'msg-1');
        const message2 = createMockMessage('conv-2', 'msg-2');

        await store.addMessage(message1);
        await store.addMessage(message2);

        expect(store.getMessages('conv-1')).toHaveLength(1);
        expect(store.getMessages('conv-2')).toHaveLength(1);
      });

      it('should persist message when persistence is enabled', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        // Flush any pending saves
        await store.flushPersistence();

        // Load from persistence
        const persisted = await mockPersistence.loadMessages('conv-1');
        expect(persisted).toHaveLength(1);
        expect(persisted[0]?.id).toBe('msg-1');
      });

      it('should not persist message when persistence is disabled', async () => {
        store.setPersistence(false);
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        const persisted = await mockPersistence.loadMessages('conv-1');
        expect(persisted).toHaveLength(0);
      });

      it('should notify subscribers when message is added', async () => {
        const listener = jest.fn();
        store.subscribe(listener);

        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            messagesByConversation: expect.objectContaining({
              'conv-1': expect.arrayContaining([message]),
            }),
          })
        );
      });
    });

    describe('updateMessage', () => {
      it('should update an existing message', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        await store.updateMessage('conv-1', 'msg-1', {
          content: 'Updated content',
          status: 'completed' as MessageStatus,
        });

        const updated = store.getMessage('conv-1', 'msg-1');
        expect(updated?.content).toBe('Updated content');
        expect(updated?.status).toBe('completed');
      });

      it('should update message timestamp', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        const originalUpdatedAt = message.updatedAt;

        // Wait a bit to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 10));

        await store.updateMessage('conv-1', 'msg-1', {
          content: 'Updated',
        });

        const updated = store.getMessage('conv-1', 'msg-1');
        expect(updated?.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );
      });

      it('should warn when updating non-existent message', async () => {
        await store.updateMessage('conv-1', 'non-existent', {
          content: 'Updated',
        });

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('not found')
        );
      });

      it('should persist message update', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        await store.updateMessage('conv-1', 'msg-1', {
          content: 'Updated content',
        });

        await store.flushPersistence();

        const persisted = await mockPersistence.loadMessages('conv-1');
        expect(persisted[0]?.content).toBe('Updated content');
      });

      it('should notify subscribers when message is updated', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        const listener = jest.fn();
        store.subscribe(listener);

        await store.updateMessage('conv-1', 'msg-1', {
          content: 'Updated',
        });

        expect(listener).toHaveBeenCalled();
      });
    });

    describe('deleteMessage', () => {
      it('should delete a message', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        await store.deleteMessage('conv-1', 'msg-1');

        const messages = store.getMessages('conv-1');
        expect(messages).toHaveLength(0);
      });

      it('should only delete specified message', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.addMessage(createMockMessage('conv-1', 'msg-2'));

        await store.deleteMessage('conv-1', 'msg-1');

        const messages = store.getMessages('conv-1');
        expect(messages).toHaveLength(1);
        expect(messages[0]?.id).toBe('msg-2');
      });

      it('should persist message deletion', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.flushPersistence();

        await store.deleteMessage('conv-1', 'msg-1');
        await store.flushPersistence();

        const persisted = await mockPersistence.loadMessages('conv-1');
        expect(persisted).toHaveLength(0);
      });

      it('should notify subscribers when message is deleted', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));

        const listener = jest.fn();
        store.subscribe(listener);

        await store.deleteMessage('conv-1', 'msg-1');

        expect(listener).toHaveBeenCalled();
      });
    });

    describe('getMessage', () => {
      it('should retrieve a specific message', async () => {
        const message = createMockMessage('conv-1', 'msg-1');
        await store.addMessage(message);

        const retrieved = store.getMessage('conv-1', 'msg-1');
        expect(retrieved).toEqual(message);
      });

      it('should return undefined for non-existent message', () => {
        const retrieved = store.getMessage('conv-1', 'non-existent');
        expect(retrieved).toBeUndefined();
      });

      it('should return undefined for non-existent conversation', () => {
        const retrieved = store.getMessage('non-existent', 'msg-1');
        expect(retrieved).toBeUndefined();
      });
    });
  });

  describe('Conversation Operations', () => {
    describe('clearConversation', () => {
      it('should clear all messages for a conversation', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.addMessage(createMockMessage('conv-1', 'msg-2'));

        await store.clearConversation('conv-1');

        const messages = store.getMessages('conv-1');
        expect(messages).toHaveLength(0);
      });

      it('should not affect other conversations', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.addMessage(createMockMessage('conv-2', 'msg-2'));

        await store.clearConversation('conv-1');

        expect(store.getMessages('conv-1')).toHaveLength(0);
        expect(store.getMessages('conv-2')).toHaveLength(1);
      });

      it('should persist conversation clear', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.flushPersistence();

        await store.clearConversation('conv-1');
        await store.flushPersistence();

        const persisted = await mockPersistence.loadMessages('conv-1');
        expect(persisted).toHaveLength(0);
      });
    });

    describe('getLastMessage', () => {
      it('should return the last message in conversation', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.addMessage(createMockMessage('conv-1', 'msg-2'));
        await store.addMessage(createMockMessage('conv-1', 'msg-3'));

        const last = store.getLastMessage('conv-1');
        expect(last?.id).toBe('msg-3');
      });

      it('should return undefined for empty conversation', () => {
        const last = store.getLastMessage('conv-1');
        expect(last).toBeUndefined();
      });
    });

    describe('getMessageCount', () => {
      it('should return correct message count', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.addMessage(createMockMessage('conv-1', 'msg-2'));

        const count = store.getMessageCount('conv-1');
        expect(count).toBe(2);
      });

      it('should return 0 for empty conversation', () => {
        const count = store.getMessageCount('conv-1');
        expect(count).toBe(0);
      });
    });
  });

  describe('Streaming Operations', () => {
    describe('appendContent', () => {
      it('should append content to message', async () => {
        const message = createMockMessage('conv-1', 'msg-1', 'Initial');
        await store.addMessage(message);

        store.appendContent('conv-1', 'msg-1', ' appended');

        const updated = store.getMessage('conv-1', 'msg-1');
        expect(updated?.content).toBe('Initial appended');
      });

      it('should handle multiple appends', async () => {
        const message = createMockMessage('conv-1', 'msg-1', 'Start');
        await store.addMessage(message);

        store.appendContent('conv-1', 'msg-1', ' middle');
        store.appendContent('conv-1', 'msg-1', ' end');

        const updated = store.getMessage('conv-1', 'msg-1');
        expect(updated?.content).toBe('Start middle end');
      });

      it('should warn when appending to non-existent message', () => {
        store.appendContent('conv-1', 'non-existent', 'content');
        expect(console.warn).toHaveBeenCalled();
      });
    });

    describe('setStreamingStatus', () => {
      it('should set streaming status', () => {
        store.setStreamingStatus('streaming', 'msg-1');

        expect(store.getStreamingStatus()).toBe('streaming');
        expect(store.isStreaming()).toBe(true);
      });

      it('should notify subscribers when streaming status changes', () => {
        const listener = jest.fn();
        store.subscribe(listener);

        store.setStreamingStatus('streaming', 'msg-1');

        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            streamingStatus: 'streaming',
            streamingMessageId: 'msg-1',
          })
        );
      });
    });

    describe('isStreaming', () => {
      it('should return true when streaming', () => {
        store.setStreamingStatus('streaming');
        expect(store.isStreaming()).toBe(true);
      });

      it('should return false when idle', () => {
        store.setStreamingStatus('idle');
        expect(store.isStreaming()).toBe(false);
      });

      it('should return false when completed', () => {
        store.setStreamingStatus('completed');
        expect(store.isStreaming()).toBe(false);
      });
    });
  });

  describe('Observable Pattern', () => {
    describe('subscribe', () => {
      it('should add listener and return unsubscribe function', () => {
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);

        expect(typeof unsubscribe).toBe('function');
      });

      it('should notify listener on state change', async () => {
        const listener = jest.fn();
        store.subscribe(listener);

        await store.addMessage(createMockMessage('conv-1', 'msg-1'));

        expect(listener).toHaveBeenCalled();
      });

      it('should notify multiple listeners', async () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        store.subscribe(listener1);
        store.subscribe(listener2);

        await store.addMessage(createMockMessage('conv-1', 'msg-1'));

        expect(listener1).toHaveBeenCalled();
        expect(listener2).toHaveBeenCalled();
      });

      it('should stop notifying after unsubscribe', async () => {
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);

        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();

        await store.addMessage(createMockMessage('conv-1', 'msg-2'));
        expect(listener).toHaveBeenCalledTimes(1); // Not called again
      });
    });

    describe('getState', () => {
      it('should return current state', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        store.setStreamingStatus('streaming', 'msg-1');

        const state = store.getState();

        expect(state.messagesByConversation['conv-1']).toHaveLength(1);
        expect(state.streamingStatus).toBe('streaming');
        expect(state.streamingMessageId).toBe('msg-1');
      });
    });
  });

  describe('Persistence Management', () => {
    describe('setPersistence', () => {
      it('should enable persistence', () => {
        store.setPersistence(true);
        expect(store.isPersistenceEnabled()).toBe(true);
      });

      it('should disable persistence', () => {
        store.setPersistence(false);
        expect(store.isPersistenceEnabled()).toBe(false);
      });
    });

    describe('flushPersistence', () => {
      it('should flush pending persistence operations', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.flushPersistence();

        const persisted = await mockPersistence.loadMessages('conv-1');
        expect(persisted).toHaveLength(1);
      });

      it('should not throw when persistence is disabled', async () => {
        store.setPersistence(false);
        await expect(store.flushPersistence()).resolves.not.toThrow();
      });
    });

    describe('reset', () => {
      it('should reset store to initial state', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        store.setStreamingStatus('streaming', 'msg-1');

        await store.reset();

        const state = store.getState();
        expect(state.messagesByConversation).toEqual({});
        expect(state.streamingStatus).toBe('idle');
        expect(state.streamingMessageId).toBeUndefined();
      });

      it('should clear persistence', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));
        await store.flushPersistence();

        await store.reset();

        const persisted = await mockPersistence.loadMessages('conv-1');
        expect(persisted).toHaveLength(0);
      });

      it('should notify subscribers', async () => {
        await store.addMessage(createMockMessage('conv-1', 'msg-1'));

        const listener = jest.fn();
        store.subscribe(listener);

        await store.reset();

        expect(listener).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle persistence errors on add', async () => {
      const errorPersistence = new MessagePersistence({
        storage: {
          getItem: jest.fn().mockResolvedValue(null),
          setItem: jest.fn().mockRejectedValue(new Error('Storage error')),
          removeItem: jest.fn(),
          clear: jest.fn(),
          getAllKeys: jest.fn().mockResolvedValue([]),
        },
      });

      const errorStore = new MessageStore(true, errorPersistence);
      const message = createMockMessage('conv-1', 'msg-1');

      await expect(errorStore.addMessage(message)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle persistence errors on update', async () => {
      await store.addMessage(createMockMessage('conv-1', 'msg-1'));

      const errorPersistence = new MessagePersistence({
        storage: {
          getItem: jest.fn().mockResolvedValue('[]'),
          setItem: jest.fn().mockRejectedValue(new Error('Storage error')),
          removeItem: jest.fn(),
          clear: jest.fn(),
          getAllKeys: jest.fn().mockResolvedValue([]),
        },
      });

      const errorStore = new MessageStore(true, errorPersistence);
      await errorStore.addMessage(createMockMessage('conv-1', 'msg-1'));

      await expect(
        errorStore.updateMessage('conv-1', 'msg-1', { content: 'Updated' })
      ).resolves.not.toThrow();
    });

    it('should handle persistence errors on delete', async () => {
      await store.addMessage(createMockMessage('conv-1', 'msg-1'));

      const errorPersistence = new MessagePersistence({
        storage: {
          getItem: jest.fn().mockResolvedValue('[]'),
          setItem: jest.fn(),
          removeItem: jest.fn().mockRejectedValue(new Error('Storage error')),
          clear: jest.fn(),
          getAllKeys: jest.fn().mockResolvedValue([]),
        },
      });

      const errorStore = new MessageStore(true, errorPersistence);
      await errorStore.addMessage(createMockMessage('conv-1', 'msg-1'));

      await expect(
        errorStore.deleteMessage('conv-1', 'msg-1')
      ).resolves.not.toThrow();
    });
  });
});

// Test Helper Functions

function createMockMessage(
  conversationId: string,
  messageId: string,
  content: string = 'Test message'
): Message {
  return {
    id: messageId,
    conversationId,
    role: 'user' as MessageRole,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'sent' as MessageStatus,
  };
}
