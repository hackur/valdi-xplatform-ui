# Persistence Layer - Quick Start Guide

## Installation & Setup

### 1. Initialize Stores on App Start

```typescript
import { messageStore, conversationStore } from '@chat_core';

// In your app initialization (e.g., App.tsx, main.ts)
async function initApp() {
  await Promise.all([
    conversationStore.init(),
    messageStore.init(),
  ]);
}
```

### 2. Basic Usage (Automatic Persistence)

```typescript
// Everything persists automatically!
const conversation = await conversationStore.createConversation({
  title: 'My Chat',
  modelConfig: defaultModelConfig,
});

await messageStore.addMessage(userMessage);
await messageStore.addMessage(assistantMessage);
```

## Common Operations

### Export Conversation as Markdown

```typescript
import { exportService } from '@chat_core';

const result = await exportService.exportConversation(conversationId, {
  format: 'markdown',
  includeTimestamps: true,
});

await exportService.downloadExport(result);
```

### Export as JSON

```typescript
const result = await exportService.exportConversation(conversationId, {
  format: 'json',
  prettyPrint: true,
});

await exportService.copyToClipboard(result);
```

### Import Conversation

```typescript
const importResult = await exportService.importConversation(jsonData);
console.log(`Imported ${importResult.conversationCount} conversations`);
```

### Get Storage Statistics

```typescript
const stats = await conversationStore.getStorageStats();
console.log(`Total: ${stats.conversationCount}`);
console.log(`Active: ${stats.activeConversations}`);
console.log(`Messages: ${stats.totalMessageCount}`);
```

### Clear All Data

```typescript
await conversationStore.reset();
await messageStore.reset();
```

## Configuration Options

### Disable Persistence (Testing/Demo Mode)

```typescript
// Disable
messageStore.setPersistence(false);
conversationStore.setPersistence(false);

// Re-enable
messageStore.setPersistence(true);
conversationStore.setPersistence(true);
```

### Custom Storage Provider

```typescript
import {
  MessagePersistence,
  ConversationPersistence,
  MemoryStorageProvider
} from '@chat_core';

const memoryStorage = new MemoryStorageProvider();

const messagePersistence = new MessagePersistence({
  storage: memoryStorage,
  debug: true,
});
```

### Custom Debounce Timing

```typescript
const persistence = new MessagePersistence({
  debounceMs: 1000, // Wait 1 second before saving
});
```

## Export Formats

### JSON (Full Data)
- Complete data structure
- Metadata included
- Machine-readable
- Can be imported back

### Markdown (Human-Readable)
- Formatted text
- Easy to read
- Good for sharing
- Cannot be imported

### Text (Plain)
- Simple text format
- Maximum compatibility
- No formatting
- Cannot be imported

## Storage Keys

All data stored with `valdi_` prefix:
- `valdi_conversations` - All conversations
- `valdi_messages_${conversationId}` - Messages per conversation

## API Reference

### MessageStore

```typescript
// Initialization
await messageStore.init();

// CRUD Operations (all async now)
await messageStore.addMessage(message);
await messageStore.updateMessage(convId, msgId, updates);
await messageStore.deleteMessage(convId, msgId);
await messageStore.clearConversation(convId);

// Persistence Control
messageStore.setPersistence(enabled);
messageStore.isPersistenceEnabled();
await messageStore.flushPersistence();
await messageStore.reset();
```

### ConversationStore

```typescript
// Initialization
await conversationStore.init();

// CRUD Operations (all async now)
const conv = await conversationStore.createConversation(input);
await conversationStore.updateConversation(id, updates);
await conversationStore.deleteConversation(id);
await conversationStore.bulkDeleteConversations(ids);

// Statistics
const stats = await conversationStore.getStorageStats();

// Persistence Control
conversationStore.setPersistence(enabled);
conversationStore.isPersistenceEnabled();
await conversationStore.flushPersistence();
await conversationStore.reset();
```

### ExportService

```typescript
// Export single conversation
const result = await exportService.exportConversation(id, {
  format: 'json' | 'markdown' | 'text',
  includeMetadata: true,
  includeTimestamps: true,
  includeModelConfig: true,
  includeSystemPrompt: true,
  prettyPrint: true,
});

// Export multiple conversations
const result = await exportService.exportConversations([id1, id2], options);

// Import
const importResult = await exportService.importConversation(jsonData);

// Browser operations
await exportService.downloadExport(result);
await exportService.copyToClipboard(result);
```

## Error Handling

All persistence operations have built-in error handling:

```typescript
try {
  await messageStore.addMessage(message);
} catch (error) {
  // Storage errors are logged but don't crash the app
  // Data operations continue in-memory
  console.error('Failed to persist:', error);
}
```

## Migration from Non-Persisted Stores

If you have existing stores without persistence:

1. **Update imports**: No changes needed, same exports
2. **Add init() calls**: Call `await store.init()` on app start
3. **Update to async**: Change CRUD operations to use `await`
4. **Test**: Verify data persists across page refreshes

### Before (Synchronous)
```typescript
messageStore.addMessage(message);
conversationStore.createConversation(input);
```

### After (Asynchronous)
```typescript
await messageStore.addMessage(message);
await conversationStore.createConversation(input);
```

## Best Practices

1. **Initialize Early**: Call `init()` before rendering UI
2. **Handle Async**: Always await store operations
3. **Flush Before Exit**: Call `flushPersistence()` before app close
4. **Test Storage**: Check `LocalStorageProvider.isAvailable()`
5. **Clear on Logout**: Call `reset()` when user logs out
6. **Export Regularly**: Encourage users to export important chats
7. **Validate Imports**: Check `importResult.errors` after import

## Troubleshooting

### Data not persisting?
```typescript
console.log(messageStore.isPersistenceEnabled());
await messageStore.flushPersistence();
```

### localStorage full?
Automatically falls back to memory storage. Clear old data:
```typescript
await conversationStore.reset();
await messageStore.reset();
```

### Import failing?
```typescript
const result = await exportService.importConversation(jsonData);
if (result.errors.length > 0) {
  console.error('Import errors:', result.errors);
}
```

## Performance Tips

- **Debouncing**: Automatic (500ms default) - no action needed
- **Batch Operations**: Use bulk methods when possible
- **Lazy Loading**: Messages loaded per-conversation only
- **Flush Manually**: Call `flushPersistence()` before critical operations

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Automatic fallback for older browsers

## Size Limits

- localStorage: ~5-10MB per domain
- Memory storage: Limited by device RAM
- Consider clearing old conversations regularly

## What's Persisted?

### Conversations
- ✅ Title, system prompt
- ✅ Model configuration
- ✅ Timestamps (created, updated, last message)
- ✅ Status, tags, pin state
- ✅ Message count, token count
- ✅ Custom metadata

### Messages
- ✅ Content (text or structured)
- ✅ Role (user, assistant, system, tool)
- ✅ Timestamps (created, updated)
- ✅ Status
- ✅ Tool calls and results
- ✅ Error messages
- ✅ Token usage metadata

## What's NOT Persisted?

- ❌ Streaming state (transient)
- ❌ Loading indicators (UI state)
- ❌ Active conversation (session state)
- ❌ API keys (security)

## Support

For issues or questions:
1. Check the full documentation: `PERSISTENCE_IMPLEMENTATION.md`
2. Review error logs in console
3. Verify localStorage availability
4. Test with memory storage for debugging
