/**
 * MessageStore Unit Tests
 *
 * Tests for MessageStore CRUD operations, subscriptions, and persistence.
 */

import { MessageStore } from '../MessageStore';
import { MessagePersistence } from '../MessagePersistence';
import { Message, MessageUtils } from 'common/src';

// Mock MessagePersistence
jest.mock('../MessagePersistence');

describe('MessageStore', () => {
  let messageStore: MessageStore;
  let mockPersistence: jest.Mocked<MessagePersistence>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock persistence
    mockPersistence = {
      loadAllMessages: jest.fn().mockResolvedValue({}),
      saveMessagesDebounced: jest.fn().mockResolvedValue(undefined),
      deleteMessage: jest.fn().mockResolvedValue(undefined),
      deleteMessages: jest.fn().mockResolvedValue(undefined),
      clearAll: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Create store with mock persistence
    messageStore = new MessageStore(true, mockPersistence);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CRUD operations', () => {
    it('should create a message', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const message: Message = {
        id: 'msg-1',
        conversationId,
        role: 'user',
        content: 'Hello, world!',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      // Act
      await messageStore.addMessage(message);

      // Assert
      const messages = messageStore.getMessages(conversationId);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
      expect(mockPersistence.saveMessagesDebounced).toHaveBeenCalledWith(
        conversationId,
        [message],
      );
    });

    it('should get message by id', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const message: Message = {
        id: 'msg-1',
        conversationId,
        role: 'user',
        content: 'Test message',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };
      await messageStore.addMessage(message);

      // Act
      const retrievedMessage = messageStore.getMessage(conversationId, 'msg-1');

      // Assert
      expect(retrievedMessage).toEqual(message);
    });

    it('should return undefined for non-existent message', () => {
      // Act
      const message = messageStore.getMessage('conv-123', 'non-existent');

      // Assert
      expect(message).toBeUndefined();
    });

    it('should update message', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const message: Message = {
        id: 'msg-1',
        conversationId,
        role: 'user',
        content: 'Original content',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
      };
      await messageStore.addMessage(message);

      // Act
      await messageStore.updateMessage(conversationId, 'msg-1', {
        content: 'Updated content',
        status: 'completed',
      });

      // Assert
      const updatedMessage = messageStore.getMessage(conversationId, 'msg-1');
      expect(updatedMessage?.content).toBe('Updated content');
      expect(updatedMessage?.status).toBe('completed');
      expect(mockPersistence.saveMessagesDebounced).toHaveBeenCalledTimes(2);
    });

    it('should not update non-existent message', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      await messageStore.updateMessage('conv-123', 'non-existent', {
        content: 'Updated content',
      });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Message non-existent not found'),
      );
      consoleSpy.mockRestore();
    });

    it('should delete message', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const message: Message = {
        id: 'msg-1',
        conversationId,
        role: 'user',
        content: 'Test message',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };
      await messageStore.addMessage(message);

      // Act
      await messageStore.deleteMessage(conversationId, 'msg-1');

      // Assert
      const messages = messageStore.getMessages(conversationId);
      expect(messages).toHaveLength(0);
      expect(mockPersistence.deleteMessage).toHaveBeenCalledWith(
        conversationId,
        'msg-1',
      );
    });

    it('should get messages by conversation', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const messages: Message[] = [
        {
          id: 'msg-1',
          conversationId,
          role: 'user',
          content: 'First message',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
        {
          id: 'msg-2',
          conversationId,
          role: 'assistant',
          content: 'Second message',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ];

      // Act
      for (const message of messages) {
        await messageStore.addMessage(message);
      }

      // Assert
      const retrievedMessages = messageStore.getMessages(conversationId);
      expect(retrievedMessages).toHaveLength(2);
      expect(retrievedMessages[0]?.id).toBe('msg-1');
      expect(retrievedMessages[1]?.id).toBe('msg-2');
    });

    it('should return empty array for conversation with no messages', () => {
      // Act
      const messages = messageStore.getMessages('empty-conv');

      // Assert
      expect(messages).toEqual([]);
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on create', async () => {
      // Arrange
      const listener = jest.fn();
      messageStore.subscribe(listener);

      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      // Act
      await messageStore.addMessage(message);

      // Assert
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          messagesByConversation: expect.objectContaining({
            'conv-123': [message],
          }),
        }),
      );
    });

    it('should notify subscribers on update', async () => {
      // Arrange
      const listener = jest.fn();
      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Original',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
      };
      await messageStore.addMessage(message);

      messageStore.subscribe(listener);

      // Act
      await messageStore.updateMessage('conv-123', 'msg-1', {
        content: 'Updated',
      });

      // Assert
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          messagesByConversation: expect.objectContaining({
            'conv-123': expect.arrayContaining([
              expect.objectContaining({
                id: 'msg-1',
                content: 'Updated',
              }),
            ]),
          }),
        }),
      );
    });

    it('should unsubscribe correctly', async () => {
      // Arrange
      const listener = jest.fn();
      const unsubscribe = messageStore.subscribe(listener);

      // Act
      unsubscribe();

      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };
      await messageStore.addMessage(message);

      // Assert
      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', async () => {
      // Arrange
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      messageStore.subscribe(listener1);
      messageStore.subscribe(listener2);

      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      // Act
      await messageStore.addMessage(message);

      // Assert
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Streaming', () => {
    it('should append content to message', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const message: Message = {
        id: 'msg-1',
        conversationId,
        role: 'assistant',
        content: 'Hello',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'streaming',
      };
      await messageStore.addMessage(message);

      // Act
      messageStore.appendContent(conversationId, 'msg-1', ', world!');

      // Assert
      const updatedMessage = messageStore.getMessage(conversationId, 'msg-1');
      expect(updatedMessage?.content).toBe('Hello, world!');
    });

    it('should set streaming status', () => {
      // Act
      messageStore.setStreamingStatus('streaming', 'msg-123');

      // Assert
      expect(messageStore.getStreamingStatus()).toBe('streaming');
      expect(messageStore.isStreaming()).toBe(true);
    });

    it('should clear streaming status', () => {
      // Arrange
      messageStore.setStreamingStatus('streaming', 'msg-123');

      // Act
      messageStore.setStreamingStatus('idle');

      // Assert
      expect(messageStore.getStreamingStatus()).toBe('idle');
      expect(messageStore.isStreaming()).toBe(false);
    });
  });

  describe('Utility methods', () => {
    it('should get last message', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const messages: Message[] = [
        {
          id: 'msg-1',
          conversationId,
          role: 'user',
          content: 'First',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
        {
          id: 'msg-2',
          conversationId,
          role: 'assistant',
          content: 'Last',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ];

      for (const msg of messages) {
        await messageStore.addMessage(msg);
      }

      // Act
      const lastMessage = messageStore.getLastMessage(conversationId);

      // Assert
      expect(lastMessage?.id).toBe('msg-2');
      expect(lastMessage?.content).toBe('Last');
    });

    it('should get message count', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const messages: Message[] = [
        {
          id: 'msg-1',
          conversationId,
          role: 'user',
          content: 'First',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
        {
          id: 'msg-2',
          conversationId,
          role: 'assistant',
          content: 'Second',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ];

      for (const msg of messages) {
        await messageStore.addMessage(msg);
      }

      // Act
      const count = messageStore.getMessageCount(conversationId);

      // Assert
      expect(count).toBe(2);
    });

    it('should clear conversation messages', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const message: Message = {
        id: 'msg-1',
        conversationId,
        role: 'user',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };
      await messageStore.addMessage(message);

      // Act
      await messageStore.clearConversation(conversationId);

      // Assert
      const messages = messageStore.getMessages(conversationId);
      expect(messages).toHaveLength(0);
      expect(mockPersistence.deleteMessages).toHaveBeenCalledWith(
        conversationId,
      );
    });

    it('should reset entire store', async () => {
      // Arrange
      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };
      await messageStore.addMessage(message);

      // Act
      await messageStore.reset();

      // Assert
      const state = messageStore.getState();
      expect(state.messagesByConversation).toEqual({});
      expect(mockPersistence.clearAll).toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should initialize with persisted data', async () => {
      // Arrange
      const persistedData = {
        'conv-123': [
          {
            id: 'msg-1',
            conversationId: 'conv-123',
            role: 'user',
            content: 'Persisted message',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed',
          },
        ],
      };
      mockPersistence.loadAllMessages.mockResolvedValue(persistedData);

      const newStore = new MessageStore(true, mockPersistence);

      // Act
      await newStore.init();

      // Assert
      const messages = newStore.getMessages('conv-123');
      expect(messages).toHaveLength(1);
      expect(messages[0]?.content).toBe('Persisted message');
    });

    it('should handle persistence errors gracefully', async () => {
      // Arrange
      mockPersistence.saveMessagesDebounced.mockRejectedValue(
        new Error('Persistence error'),
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      // Act
      await messageStore.addMessage(message);

      // Assert - message should still be in memory
      const messages = messageStore.getMessages('conv-123');
      expect(messages).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error persisting message'),
        expect.any(String),
      );

      consoleSpy.mockRestore();
    });

    it('should enable/disable persistence', () => {
      // Act
      messageStore.setPersistence(false);

      // Assert
      expect(messageStore.isPersistenceEnabled()).toBe(false);

      // Act
      messageStore.setPersistence(true);

      // Assert
      expect(messageStore.isPersistenceEnabled()).toBe(true);
    });

    it('should flush pending persistence operations', async () => {
      // Act
      await messageStore.flushPersistence();

      // Assert
      expect(mockPersistence.flush).toHaveBeenCalled();
    });

    it('should not persist when persistence is disabled', async () => {
      // Arrange
      messageStore.setPersistence(false);
      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      // Act
      await messageStore.addMessage(message);

      // Assert
      expect(mockPersistence.saveMessagesDebounced).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle initialization errors', async () => {
      // Arrange
      mockPersistence.loadAllMessages.mockRejectedValue(
        new Error('Load error'),
      );
      const newStore = new MessageStore(true, mockPersistence);

      // Act & Assert
      await expect(newStore.init()).rejects.toThrow();
    });
  });
});
