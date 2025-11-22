/**
 * Chat UI Module
 *
 * Chat interface components and integration services.
 */

// Legacy components
export * from './ChatView';
export * from './MessageBubble';
export * from './InputBar';
export * from './ConversationList';
export * from './ConversationListItem';

// Integration layer
export * from './ChatIntegrationService';

// Connected components with streaming support
export * from './ConversationListConnected';
export * from './ChatViewStreaming';
