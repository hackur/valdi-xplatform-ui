/**
 * ConversationStore Unit Tests
 *
 * Tests for ConversationStore state management, CRUD operations, and filtering.
 */

import { ConversationStore } from '../ConversationStore';
import { ConversationPersistence } from '../ConversationPersistence';
import { Conversation, ConversationUtils } from '@common';

// Mock ConversationPersistence
jest.mock('../ConversationPersistence');

describe('ConversationStore', () => {
  let conversationStore: ConversationStore;
  let mockPersistence: jest.Mocked<ConversationPersistence>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPersistence = {
      loadConversations: jest.fn().mockResolvedValue({}),
      saveConversationsDebounced: jest.fn().mockResolvedValue(undefined),
      deleteConversation: jest.fn().mockResolvedValue(undefined),
      deleteConversations: jest.fn().mockResolvedValue(undefined),
      clearAll: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      getStorageStats: jest.fn().mockResolvedValue({
        conversationCount: 0,
        totalMessageCount: 0,
        activeConversations: 0,
        archivedConversations: 0,
        pinnedConversations: 0,
      }),
    } as any;

    conversationStore = new ConversationStore(true, mockPersistence);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('State management', () => {
    it('should create conversation', async () => {
      // Arrange
      const input = {
        title: 'Test Conversation',
        modelConfig: {
          provider: 'openai' as const,
          modelId: 'gpt-4',
        },
      };

      // Act
      const conversation = await conversationStore.createConversation(input);

      // Assert
      expect(conversation.title).toBe('Test Conversation');
      expect(conversation.modelConfig.provider).toBe('openai');
      expect(mockPersistence.saveConversationsDebounced).toHaveBeenCalled();
    });

    it('should set created conversation as active', async () => {
      // Arrange
      const input = {
        title: 'Active Conversation',
        modelConfig: {
          provider: 'openai' as const,
          modelId: 'gpt-4',
        },
      };

      // Act
      const conversation = await conversationStore.createConversation(input);

      // Assert
      const state = conversationStore.getState();
      expect(state.activeConversationId).toBe(conversation.id);
    });

    it('should get all conversations', async () => {
      // Arrange
      await conversationStore.createConversation({
        title: 'Conversation 1',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      await conversationStore.createConversation({
        title: 'Conversation 2',
        modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
      });

      // Act
      const conversations = conversationStore.getAllConversations();

      // Assert
      expect(conversations).toHaveLength(2);
      expect(conversations[0]?.title).toBe('Conversation 1');
      expect(conversations[1]?.title).toBe('Conversation 2');
    });

    it('should get conversation by id', async () => {
      // Arrange
      const created = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      const conversation = conversationStore.getConversation(created.id);

      // Assert
      expect(conversation).toEqual(created);
    });

    it('should return undefined for non-existent conversation', () => {
      // Act
      const conversation = conversationStore.getConversation('non-existent');

      // Assert
      expect(conversation).toBeUndefined();
    });

    it('should update conversation', async () => {
      // Arrange
      const created = await conversationStore.createConversation({
        title: 'Original Title',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      await conversationStore.updateConversation(created.id, {
        title: 'Updated Title',
      });

      // Assert
      const updated = conversationStore.getConversation(created.id);
      expect(updated?.title).toBe('Updated Title');
      expect(mockPersistence.saveConversationsDebounced).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should archive conversation', async () => {
      // Arrange
      const created = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      conversationStore.archiveConversation(created.id);

      // Assert
      const conversation = conversationStore.getConversation(created.id);
      expect(conversation?.status).toBe('archived');
    });

    it('should activate conversation', async () => {
      // Arrange
      const created = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      conversationStore.archiveConversation(created.id);

      // Act
      conversationStore.activateConversation(created.id);

      // Assert
      const conversation = conversationStore.getConversation(created.id);
      expect(conversation?.status).toBe('active');
    });

    it('should delete conversation', async () => {
      // Arrange
      const created = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      await conversationStore.deleteConversation(created.id);

      // Assert
      const conversation = conversationStore.getConversation(created.id);
      expect(conversation).toBeUndefined();
      expect(mockPersistence.deleteConversation).toHaveBeenCalledWith(
        created.id,
      );
    });
  });

  describe('Active conversation management', () => {
    it('should set active conversation', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      conversationStore.setActiveConversation(conversation.id);

      // Assert
      const active = conversationStore.getActiveConversation();
      expect(active?.id).toBe(conversation.id);
    });

    it('should clear active conversation', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      conversationStore.setActiveConversation(conversation.id);

      // Act
      conversationStore.clearActiveConversation();

      // Assert
      const active = conversationStore.getActiveConversation();
      expect(active).toBeUndefined();
    });

    it('should clear active conversation on delete', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      conversationStore.setActiveConversation(conversation.id);

      // Act
      await conversationStore.deleteConversation(conversation.id);

      // Assert
      const state = conversationStore.getState();
      expect(state.activeConversationId).toBeUndefined();
    });
  });

  describe('Filtering and searching', () => {
    beforeEach(async () => {
      // Create test conversations
      await conversationStore.createConversation({
        title: 'OpenAI Chat',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
        tags: ['work', 'important'],
      });

      await conversationStore.createConversation({
        title: 'Anthropic Chat',
        modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
        tags: ['personal'],
      });

      const archived = await conversationStore.createConversation({
        title: 'Old Chat',
        modelConfig: { provider: 'google', modelId: 'gemini-pro' },
      });
      conversationStore.archiveConversation(archived.id);
    });

    it('should filter by status', () => {
      // Act
      const activeConversations = conversationStore.listConversations({
        filter: { status: ['active'] },
      });

      // Assert
      expect(activeConversations).toHaveLength(2);
      expect(activeConversations.every((c) => c.status === 'active')).toBe(
        true,
      );
    });

    it('should filter by tags', () => {
      // Act
      const workConversations = conversationStore.listConversations({
        filter: { tags: ['work'] },
      });

      // Assert
      expect(workConversations).toHaveLength(1);
      expect(workConversations[0]?.title).toBe('OpenAI Chat');
    });

    it('should filter by provider', () => {
      // Act
      const openaiConversations = conversationStore.listConversations({
        filter: { provider: ['openai'] },
      });

      // Assert
      expect(openaiConversations).toHaveLength(1);
      expect(openaiConversations[0]?.modelConfig.provider).toBe('openai');
    });

    it('should search by title', () => {
      // Act
      const results = conversationStore.searchConversations('OpenAI');

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0]?.title).toBe('OpenAI Chat');
    });

    it('should search case-insensitively', () => {
      // Act
      const results = conversationStore.searchConversations('openai');

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0]?.title).toBe('OpenAI Chat');
    });

    it('should return empty array for no matches', () => {
      // Act
      const results = conversationStore.searchConversations('nonexistent');

      // Assert
      expect(results).toHaveLength(0);
    });
  });

  describe('Sorting', () => {
    beforeEach(async () => {
      // Create conversations with different timestamps
      await conversationStore.createConversation({
        title: 'First',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await conversationStore.createConversation({
        title: 'Second',
        modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
      });
    });

    it('should sort by createdAt ascending', () => {
      // Act
      const conversations = conversationStore.listConversations({
        sort: { field: 'createdAt', order: 'asc' },
      });

      // Assert
      expect(conversations[0]?.title).toBe('First');
      expect(conversations[1]?.title).toBe('Second');
    });

    it('should sort by createdAt descending', () => {
      // Act
      const conversations = conversationStore.listConversations({
        sort: { field: 'createdAt', order: 'desc' },
      });

      // Assert
      expect(conversations[0]?.title).toBe('Second');
      expect(conversations[1]?.title).toBe('First');
    });

    it('should sort by title', () => {
      // Act
      const conversations = conversationStore.listConversations({
        sort: { field: 'title', order: 'asc' },
      });

      // Assert
      expect(conversations[0]?.title).toBe('First');
      expect(conversations[1]?.title).toBe('Second');
    });
  });

  describe('Tags management', () => {
    it('should add tag to conversation', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      conversationStore.addTag(conversation.id, 'important');

      // Assert
      const updated = conversationStore.getConversation(conversation.id);
      expect(updated?.tags).toContain('important');
    });

    it('should not add duplicate tags', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
        tags: ['existing'],
      });

      // Act
      conversationStore.addTag(conversation.id, 'existing');

      // Assert
      const updated = conversationStore.getConversation(conversation.id);
      expect(updated?.tags.filter((t) => t === 'existing')).toHaveLength(1);
    });

    it('should remove tag from conversation', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
        tags: ['tag1', 'tag2'],
      });

      // Act
      conversationStore.removeTag(conversation.id, 'tag1');

      // Assert
      const updated = conversationStore.getConversation(conversation.id);
      expect(updated?.tags).not.toContain('tag1');
      expect(updated?.tags).toContain('tag2');
    });

    it('should toggle pin status', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      conversationStore.togglePin(conversation.id);

      // Assert
      let updated = conversationStore.getConversation(conversation.id);
      expect(updated?.isPinned).toBe(true);

      // Act again
      conversationStore.togglePin(conversation.id);

      // Assert
      updated = conversationStore.getConversation(conversation.id);
      expect(updated?.isPinned).toBe(false);
    });

    it('should get pinned conversations', async () => {
      // Arrange
      const conv1 = await conversationStore.createConversation({
        title: 'Pinned',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      conversationStore.togglePin(conv1.id);

      await conversationStore.createConversation({
        title: 'Not Pinned',
        modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
      });

      // Act
      const pinned = conversationStore.getPinnedConversations();

      // Assert
      expect(pinned).toHaveLength(1);
      expect(pinned[0]?.title).toBe('Pinned');
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on create', async () => {
      // Arrange
      const listener = jest.fn();
      conversationStore.subscribe(listener);

      // Act
      await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Assert
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          conversations: expect.any(Object),
        }),
      );
    });

    it('should unsubscribe correctly', async () => {
      // Arrange
      const listener = jest.fn();
      const unsubscribe = conversationStore.subscribe(listener);

      // Act
      unsubscribe();
      await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Assert
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Bulk operations', () => {
    it('should bulk delete conversations', async () => {
      // Arrange
      const conv1 = await conversationStore.createConversation({
        title: 'Conv 1',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      const conv2 = await conversationStore.createConversation({
        title: 'Conv 2',
        modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
      });
      const conv3 = await conversationStore.createConversation({
        title: 'Conv 3',
        modelConfig: { provider: 'google', modelId: 'gemini-pro' },
      });

      // Act
      await conversationStore.bulkDeleteConversations([conv1.id, conv2.id]);

      // Assert
      expect(conversationStore.getConversation(conv1.id)).toBeUndefined();
      expect(conversationStore.getConversation(conv2.id)).toBeUndefined();
      expect(conversationStore.getConversation(conv3.id)).toBeDefined();
    });

    it('should import conversations', () => {
      // Arrange
      const conversations: Conversation[] = [
        {
          id: 'imported-1',
          title: 'Imported 1',
          modelConfig: { provider: 'openai', modelId: 'gpt-4' },
          status: 'active',
          messageCount: 0,
          tags: [],
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'imported-2',
          title: 'Imported 2',
          modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
          status: 'active',
          messageCount: 0,
          tags: [],
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Act
      conversationStore.importConversations(conversations);

      // Assert
      const conv1 = conversationStore.getConversation('imported-1');
      const conv2 = conversationStore.getConversation('imported-2');
      expect(conv1?.title).toBe('Imported 1');
      expect(conv2?.title).toBe('Imported 2');
    });
  });

  describe('Utility methods', () => {
    it('should get conversation count', async () => {
      // Arrange
      await conversationStore.createConversation({
        title: 'Conv 1',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      await conversationStore.createConversation({
        title: 'Conv 2',
        modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
      });

      // Act
      const count = conversationStore.getConversationCount();

      // Assert
      expect(count).toBe(2);
    });

    it('should get conversations by status', async () => {
      // Arrange
      await conversationStore.createConversation({
        title: 'Active',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });
      const archived = await conversationStore.createConversation({
        title: 'Archived',
        modelConfig: { provider: 'anthropic', modelId: 'claude-3' },
      });
      conversationStore.archiveConversation(archived.id);

      // Act
      const activeConvs = conversationStore.getConversationsByStatus('active');
      const archivedConvs =
        conversationStore.getConversationsByStatus('archived');

      // Assert
      expect(activeConvs).toHaveLength(1);
      expect(archivedConvs).toHaveLength(1);
    });

    it('should increment message count', async () => {
      // Arrange
      const conversation = await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      conversationStore.incrementMessageCount(conversation.id);

      // Assert
      const updated = conversationStore.getConversation(conversation.id);
      expect(updated?.messageCount).toBe(1);
    });

    it('should reset store', async () => {
      // Arrange
      await conversationStore.createConversation({
        title: 'Test',
        modelConfig: { provider: 'openai', modelId: 'gpt-4' },
      });

      // Act
      await conversationStore.reset();

      // Assert
      const state = conversationStore.getState();
      expect(Object.keys(state.conversations)).toHaveLength(0);
      expect(mockPersistence.clearAll).toHaveBeenCalled();
    });
  });

  describe('Loading and error states', () => {
    it('should set loading state', () => {
      // Act
      conversationStore.setLoading(true);

      // Assert
      const state = conversationStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('should set error state', () => {
      // Act
      conversationStore.setError('Test error');

      // Assert
      const state = conversationStore.getState();
      expect(state.error).toBe('Test error');
    });

    it('should clear error state', () => {
      // Arrange
      conversationStore.setError('Test error');

      // Act
      conversationStore.clearError();

      // Assert
      const state = conversationStore.getState();
      expect(state.error).toBeUndefined();
    });
  });

  describe('Persistence', () => {
    it('should initialize with persisted data', async () => {
      // Arrange
      const persistedData = {
        'conv-1': {
          id: 'conv-1',
          title: 'Persisted',
          modelConfig: { provider: 'openai' as const, modelId: 'gpt-4' },
          status: 'active' as const,
          messageCount: 0,
          tags: [],
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      mockPersistence.loadConversations.mockResolvedValue(persistedData);

      const newStore = new ConversationStore(true, mockPersistence);

      // Act
      await newStore.init();

      // Assert
      const conversation = newStore.getConversation('conv-1');
      expect(conversation?.title).toBe('Persisted');
    });

    it('should get storage stats', async () => {
      // Arrange
      mockPersistence.getStorageStats.mockResolvedValue({
        conversationCount: 5,
        totalMessageCount: 50,
        activeConversations: 4,
        archivedConversations: 1,
        pinnedConversations: 2,
      });

      // Act
      const stats = await conversationStore.getStorageStats();

      // Assert
      expect(stats.conversationCount).toBe(5);
      expect(stats.totalMessageCount).toBe(50);
    });
  });
});
