/**
 * Persistence Layer - Usage Examples
 *
 * This file demonstrates how to use the persistence layer
 * in various scenarios.
 */

import { messageStore, conversationStore } from './src/MessageStore';
import { exportService } from './src/ExportService';
import { MessagePersistence, ConversationPersistence } from './src';
import { StorageFactory, MemoryStorageProvider } from './src/StorageProvider';
import { DefaultModels } from '@common';

// ============================================================================
// Example 1: Basic App Initialization
// ============================================================================

export async function initializeApp() {
  console.log('Initializing app with persistence...');

  try {
    // Load persisted data from storage
    await Promise.all([
      conversationStore.init(),
      messageStore.init(),
    ]);

    // Check what was loaded
    const stats = await conversationStore.getStorageStats();
    console.log(`Loaded ${stats.conversationCount} conversations`);
    console.log(`Total messages: ${stats.totalMessageCount}`);
    console.log(`Active conversations: ${stats.activeConversations}`);

    return true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    return false;
  }
}

// ============================================================================
// Example 2: Creating and Using Conversations
// ============================================================================

export async function createNewChat() {
  // Create a new conversation
  const conversation = await conversationStore.createConversation({
    title: 'AI Discussion',
    systemPrompt: 'You are a helpful AI assistant.',
    modelConfig: DefaultModels.anthropic,
    tags: ['work', 'ai'],
  });

  console.log('Created conversation:', conversation.id);

  // Add user message
  const userMessage = {
    id: `msg_${Date.now()}_1`,
    conversationId: conversation.id,
    role: 'user' as const,
    content: 'Hello! How are you?',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed' as const,
  };

  await messageStore.addMessage(userMessage);

  // Add assistant message
  const assistantMessage = {
    id: `msg_${Date.now()}_2`,
    conversationId: conversation.id,
    role: 'assistant' as const,
    content: 'Hello! I am doing well, thank you for asking.',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed' as const,
  };

  await messageStore.addMessage(assistantMessage);

  console.log('Added 2 messages to conversation');

  // All data is automatically persisted!
  // Refresh the page and it will still be there

  return conversation.id;
}

// ============================================================================
// Example 3: Export Conversation as Markdown
// ============================================================================

export async function exportConversationAsMarkdown(conversationId: string) {
  const result = await exportService.exportConversation(conversationId, {
    format: 'markdown',
    includeTimestamps: true,
    includeMetadata: true,
    includeModelConfig: true,
    includeSystemPrompt: true,
  });

  console.log('Export Result:');
  console.log('- Filename:', result.filename);
  console.log('- Size:', result.size, 'bytes');
  console.log('- MIME type:', result.mimeType);
  console.log('\nContent preview:');
  console.log(result.data.substring(0, 500) + '...');

  // Download in browser
  if (typeof window !== 'undefined') {
    await exportService.downloadExport(result);
  }

  return result;
}

// ============================================================================
// Example 4: Export Conversation as JSON
// ============================================================================

export async function exportConversationAsJSON(conversationId: string) {
  const result = await exportService.exportConversation(conversationId, {
    format: 'json',
    includeMetadata: true,
    includeTimestamps: true,
    prettyPrint: true,
  });

  console.log('Exported as JSON');
  console.log('Size:', result.size, 'bytes');

  // Copy to clipboard (browser only)
  if (typeof window !== 'undefined' && navigator.clipboard) {
    await exportService.copyToClipboard(result);
    console.log('Copied to clipboard!');
  }

  return result.data;
}

// ============================================================================
// Example 5: Import Conversation from JSON
// ============================================================================

export async function importConversationFromJSON(jsonData: string) {
  const result = await exportService.importConversation(jsonData);

  console.log('Import Result:');
  console.log('- Conversations imported:', result.conversationCount);
  console.log('- Messages imported:', result.messageCount);

  if (result.errors.length > 0) {
    console.error('Import errors:');
    result.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
  }

  return result;
}

// ============================================================================
// Example 6: Export Multiple Conversations
// ============================================================================

export async function exportAllConversations() {
  // Get all conversation IDs
  const conversations = conversationStore.getAllConversations();
  const conversationIds = conversations.map(c => c.id);

  console.log(`Exporting ${conversationIds.length} conversations...`);

  const result = await exportService.exportConversations(conversationIds, {
    format: 'json',
    includeMetadata: true,
    prettyPrint: true,
  });

  console.log('Exported all conversations');
  console.log('Size:', result.size, 'bytes');

  return result;
}

// ============================================================================
// Example 7: Search and Filter Conversations
// ============================================================================

export async function searchConversations(query: string) {
  // Search in-memory
  const results = conversationStore.searchConversations(query);

  console.log(`Found ${results.length} conversations matching "${query}"`);

  results.forEach(conv => {
    console.log(`- ${conv.title} (${conv.messageCount} messages)`);
  });

  return results;
}

export async function getActiveConversations() {
  const active = conversationStore.getConversationsByStatus('active');
  console.log(`Active conversations: ${active.length}`);
  return active;
}

export async function getPinnedConversations() {
  const pinned = conversationStore.getPinnedConversations();
  console.log(`Pinned conversations: ${pinned.length}`);
  return pinned;
}

// ============================================================================
// Example 8: Update Conversation Metadata
// ============================================================================

export async function updateConversationMetadata(conversationId: string) {
  // Update title
  await conversationStore.updateConversation(conversationId, {
    title: 'Updated Title',
  });

  // Add tags
  await conversationStore.addTag(conversationId, 'important');
  await conversationStore.addTag(conversationId, 'archived');

  // Pin conversation
  await conversationStore.togglePin(conversationId);

  console.log('Updated conversation metadata');
}

// ============================================================================
// Example 9: Message Operations
// ============================================================================

export async function updateMessage(conversationId: string, messageId: string) {
  // Update message content
  await messageStore.updateMessage(conversationId, messageId, {
    content: 'Updated content',
  });

  // Update message status
  await messageStore.updateMessage(conversationId, messageId, {
    status: 'completed',
  });

  console.log('Updated message');
}

export async function deleteMessage(conversationId: string, messageId: string) {
  await messageStore.deleteMessage(conversationId, messageId);
  console.log('Deleted message');
}

export async function clearConversation(conversationId: string) {
  await messageStore.clearConversation(conversationId);
  console.log('Cleared all messages from conversation');
}

// ============================================================================
// Example 10: Statistics and Analytics
// ============================================================================

export async function getStorageStatistics() {
  const stats = await conversationStore.getStorageStats();

  console.log('\n=== Storage Statistics ===');
  console.log(`Total Conversations: ${stats.conversationCount}`);
  console.log(`Active: ${stats.activeConversations}`);
  console.log(`Archived: ${stats.archivedConversations}`);
  console.log(`Pinned: ${stats.pinnedConversations}`);
  console.log(`Total Messages: ${stats.totalMessageCount}`);

  // Calculate average messages per conversation
  const avgMessages = stats.totalMessageCount / stats.conversationCount;
  console.log(`Average Messages per Conversation: ${avgMessages.toFixed(2)}`);

  return stats;
}

// ============================================================================
// Example 11: Custom Storage Provider (Testing)
// ============================================================================

export function createTestEnvironment() {
  // Create in-memory storage for testing
  const memoryStorage = new MemoryStorageProvider('test_');

  const messagePersistence = new MessagePersistence({
    storage: memoryStorage,
    debug: true,
  });

  const conversationPersistence = new ConversationPersistence({
    storage: memoryStorage,
    debug: true,
  });

  console.log('Created test environment with memory storage');

  return {
    messagePersistence,
    conversationPersistence,
    memoryStorage,
  };
}

// ============================================================================
// Example 12: Disable Persistence Temporarily
// ============================================================================

export function togglePersistence(enabled: boolean) {
  messageStore.setPersistence(enabled);
  conversationStore.setPersistence(enabled);

  console.log(`Persistence ${enabled ? 'enabled' : 'disabled'}`);
}

export function checkPersistenceStatus() {
  console.log('Message Store Persistence:', messageStore.isPersistenceEnabled());
  console.log('Conversation Store Persistence:', conversationStore.isPersistenceEnabled());
}

// ============================================================================
// Example 13: Flush Pending Operations
// ============================================================================

export async function flushAllPendingOperations() {
  console.log('Flushing pending persistence operations...');

  await Promise.all([
    messageStore.flushPersistence(),
    conversationStore.flushPersistence(),
  ]);

  console.log('All pending operations flushed');
}

// ============================================================================
// Example 14: Clear All Data
// ============================================================================

export async function clearAllData() {
  const confirmed = confirm('Are you sure you want to clear all data?');

  if (!confirmed) {
    console.log('Clear operation cancelled');
    return false;
  }

  console.log('Clearing all data...');

  await Promise.all([
    messageStore.reset(),
    conversationStore.reset(),
  ]);

  console.log('All data cleared');
  return true;
}

// ============================================================================
// Example 15: Batch Operations
// ============================================================================

export async function bulkDeleteConversations(conversationIds: string[]) {
  console.log(`Deleting ${conversationIds.length} conversations...`);

  await conversationStore.bulkDeleteConversations(conversationIds);

  console.log('Bulk delete completed');
}

export async function archiveOldConversations(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const conversations = conversationStore.getAllConversations();

  for (const conv of conversations) {
    const lastActivity = conv.lastMessageAt || conv.updatedAt;

    if (lastActivity < cutoffDate && conv.status === 'active') {
      await conversationStore.archiveConversation(conv.id);
      console.log(`Archived: ${conv.title}`);
    }
  }

  console.log('Finished archiving old conversations');
}

// ============================================================================
// Example 16: React Component Integration
// ============================================================================

export const ReactComponentExample = `
// In your React component:

import { useEffect, useState } from 'react';
import { conversationStore, messageStore } from '@chat_core';

function ChatApp() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize stores on mount
    const init = async () => {
      await Promise.all([
        conversationStore.init(),
        messageStore.init(),
      ]);

      setConversations(conversationStore.getAllConversations());
      setLoading(false);
    };

    init();

    // Subscribe to changes
    const unsubscribe = conversationStore.subscribe((state) => {
      setConversations(Object.values(state.conversations));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const createNewChat = async () => {
    const conv = await conversationStore.createConversation({
      title: 'New Chat',
      modelConfig: defaultModelConfig,
    });

    // Conversation is automatically persisted!
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={createNewChat}>New Chat</button>
      {conversations.map(conv => (
        <div key={conv.id}>{conv.title}</div>
      ))}
    </div>
  );
}
`;

// ============================================================================
// Example 17: Error Handling
// ============================================================================

export async function robustOperation() {
  try {
    // Try to create conversation
    const conv = await conversationStore.createConversation({
      title: 'Test',
      modelConfig: DefaultModels.anthropic,
    });

    console.log('Success:', conv.id);
  } catch (error) {
    // Handle errors gracefully
    console.error('Failed to create conversation:', error);

    // Persistence errors don't crash the app
    // Data continues to work in-memory
  }
}

// ============================================================================
// Example 18: Migration from Old Code
// ============================================================================

export const MigrationExample = `
// BEFORE (Synchronous, no persistence):
const conversation = conversationStore.createConversation(input);
messageStore.addMessage(message);
conversationStore.updateConversation(id, updates);

// AFTER (Asynchronous, with persistence):
const conversation = await conversationStore.createConversation(input);
await messageStore.addMessage(message);
await conversationStore.updateConversation(id, updates);

// That's it! Just add 'await' and call init() on app start
`;

// ============================================================================
// Example 19: Complete Usage Flow
// ============================================================================

export async function completeUsageExample() {
  console.log('\n=== Complete Persistence Layer Example ===\n');

  // 1. Initialize
  console.log('1. Initializing...');
  await initializeApp();

  // 2. Create conversation
  console.log('\n2. Creating new chat...');
  const conversationId = await createNewChat();

  // 3. Get statistics
  console.log('\n3. Getting statistics...');
  await getStorageStatistics();

  // 4. Export as Markdown
  console.log('\n4. Exporting as Markdown...');
  const mdResult = await exportConversationAsMarkdown(conversationId);

  // 5. Export as JSON
  console.log('\n5. Exporting as JSON...');
  const jsonData = await exportConversationAsJSON(conversationId);

  // 6. Search
  console.log('\n6. Searching conversations...');
  await searchConversations('AI');

  // 7. Update metadata
  console.log('\n7. Updating metadata...');
  await updateConversationMetadata(conversationId);

  // 8. Flush pending operations
  console.log('\n8. Flushing pending operations...');
  await flushAllPendingOperations();

  console.log('\n=== Example Complete ===\n');
}

// ============================================================================
// Export all examples
// ============================================================================

export const PersistenceExamples = {
  // Initialization
  initializeApp,

  // Conversation Operations
  createNewChat,
  updateConversationMetadata,
  searchConversations,
  getActiveConversations,
  getPinnedConversations,

  // Message Operations
  updateMessage,
  deleteMessage,
  clearConversation,

  // Export/Import
  exportConversationAsMarkdown,
  exportConversationAsJSON,
  exportAllConversations,
  importConversationFromJSON,

  // Statistics
  getStorageStatistics,

  // Configuration
  togglePersistence,
  checkPersistenceStatus,
  createTestEnvironment,

  // Maintenance
  flushAllPendingOperations,
  clearAllData,
  bulkDeleteConversations,
  archiveOldConversations,

  // Complete Example
  completeUsageExample,
};
