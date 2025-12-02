/**
 * ChatView
 *
 * Main chat interface component.
 * Displays messages and handles user input.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import type {
  Message} from '../../common/src/index';
import {
  Colors,
  Spacing,
  SemanticSpacing,
  ErrorBoundary,
  ErrorScreen,
} from '../../common/src/index';
import type { SimpleNavigationController } from '../../common/src/index';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { ChatService } from '../../chat_core/src/ChatService';
import type { MessageStore} from '../../chat_core/src/MessageStore';
import { messageStore } from '../../chat_core/src/MessageStore';
import type {
  ConversationStore} from '../../chat_core/src/ConversationStore';
import {
  conversationStore,
} from '../../chat_core/src/ConversationStore';
import type {
  MessageStoreState,
  StreamEvent,
  ChatServiceConfig,
} from '../../chat_core/src/types';

/**
 * ChatView Props
 */
export interface ChatViewProps {
  navigationController: SimpleNavigationController;
  conversationId?: string; // Optional - creates new conversation if not provided
  chatService?: ChatService; // Optional override for testing
}

/**
 * ChatView State
 */
interface ChatViewState {
  conversationId: string;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error?: string;
}

/**
 * ChatView Component
 *
 * Main chat interface component providing full-featured messaging capabilities with
 * real-time updates, streaming support, error handling, and state management.
 * Integrates with ChatService for AI interactions and MessageStore for reactive
 * message updates. Supports message history, loading states, and error recovery.
 *
 * @example
 * ```tsx
 * <ChatView
 *   navigationController={navController}
 *   conversationId="conv_123"
 *   chatService={chatService}
 * />
 * ```
 */
export class ChatView extends StatefulComponent<
  ChatViewProps,
  ChatViewState
> {
  // Stores and Services
  private messageStore!: MessageStore;
  private conversationStore!: ConversationStore;
  private chatService!: ChatService;
  private unsubscribeMessageStore?: () => void;

  override state: ChatViewState = {
    conversationId: '',
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: undefined,
  };

  override onCreate() {
    // Initialize stores
    this.messageStore = messageStore;
    this.conversationStore = conversationStore;

    // Initialize ChatService (use provided or create new one)
    if (this.viewModel.chatService) {
      this.chatService = this.viewModel.chatService;
    } else {
      // Default configuration - in production, this should come from settings
      const config: ChatServiceConfig = {
        apiKeys: {
          openai: '',
          anthropic: '',
          google: '',
        },
        defaultModelConfig: {
          provider: 'openai',
          modelId: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4096,
        },
        debug: false,
      };
      this.chatService = new ChatService(config, this.messageStore);
    }

    // Subscribe to message store updates
    this.unsubscribeMessageStore = this.messageStore.subscribe(
      (state: MessageStoreState) => {
        this.handleMessageStoreUpdate(state);
      },
    );

    // Initialize conversation (async)
    void this.initializeConversation();
  }

  /**
   * Initialize or create conversation
   */
  private readonly initializeConversation = async (): Promise<void> => {
    let convId = this.viewModel.conversationId;

    if (!convId) {
      // Create a new conversation with default model config
      const newConv = await this.conversationStore.createConversation({
        title: 'New Chat',
        modelConfig: {
          provider: 'openai',
          modelId: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4096,
        },
      });
      convId = newConv.id;
    }

    this.setState({ conversationId: convId });

    // Load initial messages from store
    this.loadMessages();
  };

  override onDestroy() {
    // Unsubscribe from message store
    if (this.unsubscribeMessageStore) {
      this.unsubscribeMessageStore();
      this.unsubscribeMessageStore = undefined;
    }
  }

  /**
   * Get the current conversation ID
   */
  private getConversationId(): string {
    return this.state.conversationId || this.viewModel.conversationId || '';
  }

  /**
   * Load messages from store
   */
  private loadMessages(): void {
    const convId = this.getConversationId();
    if (!convId) return;

    const messages = this.messageStore.getMessages(convId);
    this.setState({
      messages,
      isStreaming: this.messageStore.isStreaming(),
    });
  }

  /**
   * Handle message store updates
   */
  private handleMessageStoreUpdate(state: MessageStoreState): void {
    const convId = this.getConversationId();
    const messages = state.messagesByConversation[convId] || [];
    const isStreaming = state.streamingStatus === 'streaming';

    this.setState({
      messages,
      isStreaming,
      isLoading: false,
    });
  }

  /**
   * Handle sending a message
   */
  private readonly handleSendMessage = async (text: string): Promise<void> => {
    if (!text.trim()) {
      return;
    }

    // Get conversation to get system prompt and model config
    const convId = this.getConversationId();
    const conversation = this.conversationStore.getConversation(convId);

    // Set loading state
    this.setState({
      isLoading: true,
      error: undefined,
    });

    try {
      // Send message with streaming
      await this.chatService.sendMessageStreaming(
        {
          conversationId: convId,
          message: text,
          modelConfig: conversation?.modelConfig,
          systemPrompt: conversation?.systemPrompt,
          toolsEnabled: conversation?.toolsEnabled || false,
          maxSteps: 5,
        },
        this.handleStreamEvent,
      );

      // Update conversation message count
      this.conversationStore.incrementMessageCount(convId);

      // Clear loading state (streaming state is managed by store)
      this.setState({
        isLoading: false,
        error: undefined,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      this.setState({
        isLoading: false,
        isStreaming: false,
        error:
          error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  };

  /**
   * Handle streaming events
   */
  private readonly handleStreamEvent = (event: StreamEvent): void => {
    switch (event.type) {
      case 'start':
        console.log('Stream started:', event.messageId);
        this.setState({ isStreaming: true });
        break;

      case 'chunk':
        // Message updates are handled by the message store subscription
        // No need to manually update state here
        break;

      case 'tool-call':
        console.log('Tool call:', event.toolCall);
        break;

      case 'complete':
        console.log('Stream completed:', event.messageId);
        this.setState({ isStreaming: false });
        break;

      case 'error':
        console.error('Stream error:', event.error);
        this.setState({
          isStreaming: false,
          error: event.error,
        });
        break;
    }
  };

  private readonly renderMessage = (message: Message) => {
    return <MessageBubble key={message.id} message={message} />;
  };

  /**
   * Handle chat-specific errors
   */
  private readonly handleChatError = (error: Error): void => {
    console.error('Chat error:', error);
    // Could send to monitoring service
  };

  override onRender() {
    const { messages, isLoading, isStreaming, error } = this.state;

    return (
      <ErrorBoundary
        fallback={(error: Error) => (
          <ErrorScreen
            error={error}
            title="Chat Error"
            message="An error occurred while loading the chat. Please try again."
            showDetails={false}
            onRetry={() => void 0}
          />
        )}
        onError={this.handleChatError}
      >
        <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label
            value="AI Chat"
            style={styles.headerTitle}
          />
          {isStreaming && (
            <label
              value="AI is typing..."
              style={styles.headerSubtitle}
            />
          )}
        </view>

        {/* Error Message */}
        {error && (
          <view style={styles.errorContainer}>
            <label
              value={`Error: ${error}`}
              style={styles.errorText}
            />
          </view>
        )}

        {/* Messages List */}
        <scroll style={styles.messagesList}>
          <view style={styles.messagesContent}>
            {messages.length === 0 ? (
              <view style={styles.emptyState}>
                <label
                  value="Start a conversation"
                  style={styles.emptyText}
                />
              </view>
            ) : (
              messages.map((message) => this.renderMessage(message))
            )}
          </view>
        </scroll>

        {/* Input Bar */}
        <InputBar
          onSend={this.handleSendMessage}
          disabled={isLoading || isStreaming}
        />
      </view>
      </ErrorBoundary>
    );
  }
}

const styles = {
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  }),

  errorContainer: new Style<View>({
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.errorBackground || '#ffebee',
  }),

  messagesList: new Style<View>({
    flexGrow: 1,
  }),

  messagesContent: new Style<View>({
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  }),

  emptyState: new Style<View>({
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.massive,
    paddingBottom: Spacing.massive,
  }),

  headerTitle: new Style<Label>({
    font: systemBoldFont(18),
    color: Colors.textPrimary,
  }),

  headerSubtitle: new Style<Label>({
    font: systemFont(12),
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  }),

  errorText: new Style<Label>({
    font: systemFont(14),
    color: Colors.error,
  }),

  emptyText: new Style<Label>({
    font: systemFont(16),
    color: Colors.textSecondary,
  }),
};
