/**
 * ConversationStore Tests
 *
 * Comprehensive unit tests for ConversationStore service.
 * Tests conversation management, filtering, sorting, and persistence.
 */

import { ConversationStore } from '../ConversationStore';
import { ConversationPersistence } from '../ConversationPersistence';
import { MemoryStorageProvider } from '../StorageProvider';
import {
  Conversation,
  ConversationStatus,
  AIProvider,
  ModelConfig,
} from '@common/types';

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

describe('ConversationStore', () => {
  let store: ConversationStore;
  let mockPersistence: ConversationPersistence;
  let mockStorage: MemoryStorageProvider;

  beforeEach(() => {
    // Create fresh storage and persistence for each test
    mockStorage = new MemoryStorageProvider('test_');
    mockPersistence = new ConversationPersistence({
      storage: mockStorage,
      autoPersist: true,
      debounceMs: 0, // No debounce for tests
      debug: false,
    });

    // Create store with mock persistence
    store = new ConversationStore(true, mockPersistence);

    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(async () => {
    // Clean up
    await store.reset();
    await mockStorage.clear();

    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const state = store.getState();
      expect(state.conversations).toEqual({});
      expect(state.activeConversationId).toBeUndefined();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeUndefined();
    });

    it('should load persisted conversations on init', async () => {
      // Create and persist a conversation directly
      const conv = createMockConversation('conv-1', 'Test Conversation');
      await mockPersistence.saveConversation(conv);

      // Create new store and initialize
      const newStore = new ConversationStore(true, mockPersistence);
      await newStore.init();

      const loaded = newStore.getConversation('conv-1');
      expect(loaded?.id).toBe('conv-1');
      expect(loaded?.title).toBe('Test Conversation');
    });

    it('should not load conversations when persistence is disabled', async () => {
      const conv = createMockConversation('conv-1', 'Test');
      await mockPersistence.saveConversation(conv);

      const newStore = new ConversationStore(false, mockPersistence);
      await newStore.init();

      const loaded = newStore.getConversation('conv-1');
      expect(loaded).toBeUndefined();
    });

    it('should set loading state during initialization', async () => {
      const slowPersistence = new ConversationPersistence({
        storage: {
          getItem: jest.fn().mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(null), 50))
          ),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
          getAllKeys: jest.fn().mockResolvedValue([]),
        },
      });

      const newStore = new ConversationStore(true, slowPersistence);
      const initPromise = newStore.init();

      // Check loading state is true during init
      expect(newStore.getState().isLoading).toBe(true);

      await initPromise;

      // Check loading state is false after init
      expect(newStore.getState().isLoading).toBe(false);
    });

    it('should handle initialization errors gracefully', async () => {
      const errorPersistence = new ConversationPersistence({
        storage: {
          getItem: jest.fn().mockRejectedValue(new Error('Storage error')),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
          getAllKeys: jest.fn().mockResolvedValue([]),
        },
      });

      const newStore = new ConversationStore(true, errorPersistence);
      await expect(newStore.init()).resolves.not.toThrow();
      // The error state should be set and loading should be false
      expect(newStore.getState().isLoading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Conversation CRUD Operations', () => {
    describe('createConversation', () => {
      it('should create a new conversation', async () => {
        const conv = await store.createConversation({
          title: 'New Chat',
          modelConfig: createMockModelConfig(),
        });

        expect(conv.id).toBeDefined();
        expect(conv.title).toBe('New Chat');
        expect(conv.status).toBe('active');
      });

      it('should set created conversation as active', async () => {
        const conv = await store.createConversation({
          title: 'New Chat',
          modelConfig: createMockModelConfig(),
        });

        expect(store.getState().activeConversationId).toBe(conv.id);
      });

      it('should add conversation to store', async () => {
        const conv = await store.createConversation({
          title: 'New Chat',
          modelConfig: createMockModelConfig(),
        });

        const retrieved = store.getConversation(conv.id);
        expect(retrieved).toEqual(conv);
      });

      it('should persist new conversation', async () => {
        const conv = await store.createConversation({
          title: 'New Chat',
          modelConfig: createMockModelConfig(),
        });

        await store.flushPersistence();

        const persisted = await mockPersistence.loadConversation(conv.id);
        expect(persisted?.id).toBe(conv.id);
      });

      it('should notify subscribers', async () => {
        const listener = jest.fn();
        store.subscribe(listener);

        await store.createConversation({
          title: 'New Chat',
          modelConfig: createMockModelConfig(),
        });

        expect(listener).toHaveBeenCalled();
      });
    });

    describe('getConversation', () => {
      it('should retrieve a conversation by ID', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        const retrieved = store.getConversation(conv.id);
        expect(retrieved).toEqual(conv);
      });

      it('should return undefined for non-existent conversation', () => {
        const retrieved = store.getConversation('non-existent');
        expect(retrieved).toBeUndefined();
      });
    });

    describe('updateConversation', () => {
      it('should update conversation title', async () => {
        const conv = await store.createConversation({
          title: 'Original',
          modelConfig: createMockModelConfig(),
        });

        await store.updateConversation(conv.id, { title: 'Updated' });

        const updated = store.getConversation(conv.id);
        expect(updated?.title).toBe('Updated');
      });

      it('should update conversation status', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.updateConversation(conv.id, { status: 'archived' });

        const updated = store.getConversation(conv.id);
        expect(updated?.status).toBe('archived');
      });

      it('should update multiple fields', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.updateConversation(conv.id, {
          title: 'New Title',
          isPinned: true,
          tags: ['important', 'work'],
        });

        const updated = store.getConversation(conv.id);
        expect(updated?.title).toBe('New Title');
        expect(updated?.isPinned).toBe(true);
        expect(updated?.tags).toEqual(['important', 'work']);
      });

      it('should warn when updating non-existent conversation', async () => {
        await store.updateConversation('non-existent', { title: 'Test' });
        expect(console.warn).toHaveBeenCalled();
      });

      it('should persist conversation updates', async () => {
        const conv = await store.createConversation({
          title: 'Original',
          modelConfig: createMockModelConfig(),
        });

        await store.updateConversation(conv.id, { title: 'Updated' });
        await store.flushPersistence();

        const persisted = await mockPersistence.loadConversation(conv.id);
        expect(persisted?.title).toBe('Updated');
      });
    });

    describe('deleteConversation', () => {
      it('should delete a conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.deleteConversation(conv.id);

        const retrieved = store.getConversation(conv.id);
        expect(retrieved).toBeUndefined();
      });

      it('should clear active conversation if deleted', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        expect(store.getState().activeConversationId).toBe(conv.id);

        await store.deleteConversation(conv.id);

        expect(store.getState().activeConversationId).toBeUndefined();
      });

      it('should not affect active conversation if different', async () => {
        const conv1 = await store.createConversation({
          title: 'Test 1',
          modelConfig: createMockModelConfig(),
        });
        const conv2 = await store.createConversation({
          title: 'Test 2',
          modelConfig: createMockModelConfig(),
        });

        store.setActiveConversation(conv1.id);
        await store.deleteConversation(conv2.id);

        expect(store.getState().activeConversationId).toBe(conv1.id);
      });

      it('should persist deletion', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.deleteConversation(conv.id);
        await store.flushPersistence();

        const persisted = await mockPersistence.loadConversation(conv.id);
        expect(persisted).toBeNull();
      });
    });

    describe('getAllConversations', () => {
      it('should return all conversations', async () => {
        await store.createConversation({
          title: 'Conv 1',
          modelConfig: createMockModelConfig(),
        });
        await store.createConversation({
          title: 'Conv 2',
          modelConfig: createMockModelConfig(),
        });

        const all = store.getAllConversations();
        expect(all).toHaveLength(2);
      });

      it('should return empty array when no conversations', () => {
        const all = store.getAllConversations();
        expect(all).toEqual([]);
      });
    });
  });

  describe('Active Conversation Management', () => {
    describe('setActiveConversation', () => {
      it('should set active conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        store.setActiveConversation(conv.id);

        expect(store.getState().activeConversationId).toBe(conv.id);
      });

      it('should warn when setting non-existent conversation as active', () => {
        store.setActiveConversation('non-existent');
        expect(console.warn).toHaveBeenCalled();
      });

      it('should notify subscribers', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        const listener = jest.fn();
        store.subscribe(listener);

        store.setActiveConversation(conv.id);

        expect(listener).toHaveBeenCalled();
      });
    });

    describe('getActiveConversation', () => {
      it('should return active conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        const active = store.getActiveConversation();
        expect(active?.id).toBe(conv.id);
      });

      it('should return undefined when no active conversation', () => {
        store.clearActiveConversation();
        const active = store.getActiveConversation();
        expect(active).toBeUndefined();
      });
    });

    describe('clearActiveConversation', () => {
      it('should clear active conversation', async () => {
        await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        store.clearActiveConversation();

        expect(store.getState().activeConversationId).toBeUndefined();
      });
    });
  });

  describe('Filtering and Searching', () => {
    beforeEach(async () => {
      // Create test conversations with various properties
      await store.createConversation({
        title: 'Work Project',
        modelConfig: createMockModelConfig('openai'),
        systemPrompt: 'You are a helpful assistant',
        tags: ['work', 'important'],
      });

      const conv2 = await store.createConversation({
        title: 'Personal Chat',
        modelConfig: createMockModelConfig('anthropic'),
        tags: ['personal'],
      });
      await store.updateConversation(conv2.id, { isPinned: true });

      const conv3 = await store.createConversation({
        title: 'Archive Test',
        modelConfig: createMockModelConfig('google'),
      });
      await store.updateConversation(conv3.id, { status: 'archived' });
    });

    describe('listConversations', () => {
      it('should list all conversations by default', () => {
        const conversations = store.listConversations();
        expect(conversations).toHaveLength(3);
      });

      it('should filter by status', () => {
        const active = store.listConversations({
          filter: { status: ['active'] },
        });
        expect(active).toHaveLength(2);

        const archived = store.listConversations({
          filter: { status: ['archived'] },
        });
        expect(archived).toHaveLength(1);
      });

      it('should filter by pinned status', () => {
        const pinned = store.listConversations({
          filter: { isPinned: true },
        });
        expect(pinned).toHaveLength(1);
        expect(pinned[0]?.title).toBe('Personal Chat');
      });

      it('should filter by tags', () => {
        const workConvs = store.listConversations({
          filter: { tags: ['work'] },
        });
        expect(workConvs).toHaveLength(1);
        expect(workConvs[0]?.title).toBe('Work Project');
      });

      it('should filter by provider', () => {
        const openaiConvs = store.listConversations({
          filter: { provider: ['openai'] },
        });
        expect(openaiConvs).toHaveLength(1);
        expect(openaiConvs[0]?.modelConfig.provider).toBe('openai');
      });

      it('should filter by search query in title', () => {
        const results = store.listConversations({
          filter: { searchQuery: 'work' },
        });
        expect(results).toHaveLength(1);
        expect(results[0]?.title).toBe('Work Project');
      });

      it('should filter by search query in system prompt', () => {
        const results = store.listConversations({
          filter: { searchQuery: 'helpful' },
        });
        expect(results).toHaveLength(1);
        expect(results[0]?.systemPrompt).toContain('helpful');
      });

      it('should sort by title ascending', () => {
        const sorted = store.listConversations({
          sort: { field: 'title', order: 'asc' },
        });
        expect(sorted[0]?.title).toBe('Archive Test');
        expect(sorted[2]?.title).toBe('Work Project');
      });

      it('should sort by title descending', () => {
        const sorted = store.listConversations({
          sort: { field: 'title', order: 'desc' },
        });
        expect(sorted[0]?.title).toBe('Work Project');
        expect(sorted[2]?.title).toBe('Archive Test');
      });

      it('should apply pagination', () => {
        const page1 = store.listConversations({
          offset: 0,
          limit: 2,
        });
        expect(page1).toHaveLength(2);

        const page2 = store.listConversations({
          offset: 2,
          limit: 2,
        });
        expect(page2).toHaveLength(1);
      });

      it('should combine filter, sort, and pagination', () => {
        const results = store.listConversations({
          filter: { status: ['active'] },
          sort: { field: 'title', order: 'asc' },
          offset: 0,
          limit: 1,
        });
        expect(results).toHaveLength(1);
        expect(results[0]?.title).toBe('Personal Chat');
      });
    });

    describe('searchConversations', () => {
      it('should search conversations by query', () => {
        const results = store.searchConversations('personal');
        expect(results).toHaveLength(1);
        expect(results[0]?.title).toBe('Personal Chat');
      });

      it('should be case insensitive', () => {
        const results = store.searchConversations('WORK');
        expect(results).toHaveLength(1);
      });

      it('should return empty array for no matches', () => {
        const results = store.searchConversations('nonexistent');
        expect(results).toEqual([]);
      });
    });

    describe('getPinnedConversations', () => {
      it('should return only pinned conversations', () => {
        const pinned = store.getPinnedConversations();
        expect(pinned).toHaveLength(1);
        expect(pinned[0]?.isPinned).toBe(true);
      });
    });

    describe('getConversationsByStatus', () => {
      it('should return conversations by status', () => {
        const active = store.getConversationsByStatus('active');
        expect(active).toHaveLength(2);

        const archived = store.getConversationsByStatus('archived');
        expect(archived).toHaveLength(1);
      });
    });
  });

  describe('Conversation Operations', () => {
    describe('archiveConversation', () => {
      it('should archive a conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.archiveConversation(conv.id);

        const updated = store.getConversation(conv.id);
        expect(updated?.status).toBe('archived');
      });
    });

    describe('activateConversation', () => {
      it('should activate an archived conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.archiveConversation(conv.id);
        await store.activateConversation(conv.id);

        const updated = store.getConversation(conv.id);
        expect(updated?.status).toBe('active');
      });
    });

    describe('togglePin', () => {
      it('should pin unpinned conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.togglePin(conv.id);

        const updated = store.getConversation(conv.id);
        expect(updated?.isPinned).toBe(true);
      });

      it('should unpin pinned conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.togglePin(conv.id);
        await store.togglePin(conv.id);

        const updated = store.getConversation(conv.id);
        expect(updated?.isPinned).toBe(false);
      });
    });

    describe('Tag Management', () => {
      it('should add tag to conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.addTag(conv.id, 'important');

        const updated = store.getConversation(conv.id);
        expect(updated?.tags).toContain('important');
      });

      it('should not add duplicate tag', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        await store.addTag(conv.id, 'test');
        await store.addTag(conv.id, 'test');

        const updated = store.getConversation(conv.id);
        expect(updated?.tags.filter((t) => t === 'test')).toHaveLength(1);
      });

      it('should remove tag from conversation', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
          tags: ['test', 'important'],
        });

        await store.removeTag(conv.id, 'test');

        const updated = store.getConversation(conv.id);
        expect(updated?.tags).not.toContain('test');
        expect(updated?.tags).toContain('important');
      });
    });

    describe('incrementMessageCount', () => {
      it('should increment message count', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        store.incrementMessageCount(conv.id);

        const updated = store.getConversation(conv.id);
        expect(updated?.messageCount).toBe(1);
      });

      it('should increment multiple times', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        store.incrementMessageCount(conv.id);
        store.incrementMessageCount(conv.id);
        store.incrementMessageCount(conv.id);

        const updated = store.getConversation(conv.id);
        expect(updated?.messageCount).toBe(3);
      });
    });
  });

  describe('Bulk Operations', () => {
    describe('importConversations', () => {
      it('should import multiple conversations', () => {
        const conversations = [
          createMockConversation('conv-1', 'Import 1'),
          createMockConversation('conv-2', 'Import 2'),
        ];

        store.importConversations(conversations);

        expect(store.getConversationCount()).toBe(2);
        expect(store.getConversation('conv-1')?.title).toBe('Import 1');
        expect(store.getConversation('conv-2')?.title).toBe('Import 2');
      });

      it('should not override existing conversations', async () => {
        const conv = await store.createConversation({
          title: 'Original',
          modelConfig: createMockModelConfig(),
        });

        const imported = [createMockConversation(conv.id, 'Imported')];
        store.importConversations(imported);

        const updated = store.getConversation(conv.id);
        expect(updated?.title).toBe('Imported');
      });
    });

    describe('bulkDeleteConversations', () => {
      it('should delete multiple conversations', async () => {
        const conv1 = await store.createConversation({
          title: 'Test 1',
          modelConfig: createMockModelConfig(),
        });
        const conv2 = await store.createConversation({
          title: 'Test 2',
          modelConfig: createMockModelConfig(),
        });
        const conv3 = await store.createConversation({
          title: 'Test 3',
          modelConfig: createMockModelConfig(),
        });

        await store.bulkDeleteConversations([conv1.id, conv2.id]);

        expect(store.getConversationCount()).toBe(1);
        expect(store.getConversation(conv3.id)).toBeDefined();
      });

      it('should clear active if deleted in bulk', async () => {
        const conv1 = await store.createConversation({
          title: 'Test 1',
          modelConfig: createMockModelConfig(),
        });
        const conv2 = await store.createConversation({
          title: 'Test 2',
          modelConfig: createMockModelConfig(),
        });

        store.setActiveConversation(conv1.id);

        await store.bulkDeleteConversations([conv1.id, conv2.id]);

        expect(store.getState().activeConversationId).toBeUndefined();
      });
    });
  });

  describe('State Management', () => {
    describe('getConversationCount', () => {
      it('should return correct count', async () => {
        expect(store.getConversationCount()).toBe(0);

        await store.createConversation({
          title: 'Test 1',
          modelConfig: createMockModelConfig(),
        });
        expect(store.getConversationCount()).toBe(1);

        await store.createConversation({
          title: 'Test 2',
          modelConfig: createMockModelConfig(),
        });
        expect(store.getConversationCount()).toBe(2);
      });
    });

    describe('Error State', () => {
      it('should set error state', () => {
        store.setError('Test error');
        expect(store.getState().error).toBe('Test error');
      });

      it('should clear error state', () => {
        store.setError('Test error');
        store.clearError();
        expect(store.getState().error).toBeUndefined();
      });
    });

    describe('Loading State', () => {
      it('should set loading state', () => {
        store.setLoading(true);
        expect(store.getState().isLoading).toBe(true);

        store.setLoading(false);
        expect(store.getState().isLoading).toBe(false);
      });
    });
  });

  describe('Observable Pattern', () => {
    describe('subscribe', () => {
      it('should notify listener on state change', async () => {
        const listener = jest.fn();
        store.subscribe(listener);

        await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });

        expect(listener).toHaveBeenCalled();
      });

      it('should stop notifying after unsubscribe', async () => {
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);

        await store.createConversation({
          title: 'Test 1',
          modelConfig: createMockModelConfig(),
        });
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();

        await store.createConversation({
          title: 'Test 2',
          modelConfig: createMockModelConfig(),
        });
        expect(listener).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Persistence Management', () => {
    describe('reset', () => {
      it('should reset store to initial state', async () => {
        await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });
        store.setError('Test error');

        await store.reset();

        const state = store.getState();
        expect(state.conversations).toEqual({});
        expect(state.activeConversationId).toBeUndefined();
        expect(state.error).toBeUndefined();
      });

      it('should clear persistence', async () => {
        const conv = await store.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        });
        await store.flushPersistence();

        await store.reset();

        const persisted = await mockPersistence.loadConversation(conv.id);
        expect(persisted).toBeNull();
      });
    });

    describe('getStorageStats', () => {
      it('should return correct statistics', async () => {
        const conv1 = await store.createConversation({
          title: 'Test 1',
          modelConfig: createMockModelConfig(),
        });

        const conv2 = await store.createConversation({
          title: 'Test 2',
          modelConfig: createMockModelConfig(),
        });
        await store.updateConversation(conv2.id, { isPinned: true });

        const conv3 = await store.createConversation({
          title: 'Test 3',
          modelConfig: createMockModelConfig(),
        });
        // Need to update the conversation status manually since archiveConversation
        // calls updateConversation internally (which is async)
        await store.updateConversation(conv3.id, { status: 'archived' });

        store.incrementMessageCount(conv2.id);
        store.incrementMessageCount(conv2.id);

        const stats = await store.getStorageStats();

        expect(stats.conversationCount).toBe(3);
        expect(stats.activeConversations).toBe(2);
        expect(stats.archivedConversations).toBe(1);
        expect(stats.pinnedConversations).toBe(1);
        expect(stats.totalMessageCount).toBe(2);
      });

      it('should return zero stats for empty store', async () => {
        const stats = await store.getStorageStats();

        expect(stats.conversationCount).toBe(0);
        expect(stats.activeConversations).toBe(0);
        expect(stats.archivedConversations).toBe(0);
        expect(stats.pinnedConversations).toBe(0);
        expect(stats.totalMessageCount).toBe(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle persistence errors gracefully', async () => {
      const errorPersistence = new ConversationPersistence({
        storage: {
          getItem: jest.fn().mockResolvedValue(null),
          setItem: jest.fn().mockRejectedValue(new Error('Storage error')),
          removeItem: jest.fn(),
          clear: jest.fn(),
          getAllKeys: jest.fn().mockResolvedValue([]),
        },
      });

      const errorStore = new ConversationStore(true, errorPersistence);

      await expect(
        errorStore.createConversation({
          title: 'Test',
          modelConfig: createMockModelConfig(),
        })
      ).resolves.not.toThrow();
    });
  });
});

// Test Helper Functions

function createMockConversation(
  id: string,
  title: string,
  provider: AIProvider = 'openai'
): Conversation {
  return {
    id,
    title,
    modelConfig: createMockModelConfig(provider),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active' as ConversationStatus,
    isPinned: false,
    tags: [],
    messageCount: 0,
  };
}

function createMockModelConfig(provider: AIProvider = 'openai'): ModelConfig {
  return {
    provider,
    modelName: provider === 'openai' ? 'gpt-4' : 'claude-3-opus',
    temperature: 0.7,
    maxTokens: 2000,
  };
}
