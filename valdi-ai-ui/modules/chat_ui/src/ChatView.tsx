/**
 * ChatView
 *
 * Main chat interface component.
 * Displays messages and handles user input.
 */

import { NavigationPageComponent } from 'valdi_core/src/Component';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import {
  Colors,
  Spacing,
  SemanticSpacing,
  Message,
  Conversation,
} from '@common';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { ChatService } from '@chat_core/ChatService';
import { MessageStore, messageStore } from '@chat_core/MessageStore';
import {
  ConversationStore,
  conversationStore,
} from '@chat_core/ConversationStore';
import {
  MessageStoreState,
  StreamEvent,
  ChatServiceConfig,
} from '@chat_core/types';

/**
 * ChatView Props
 */
export interface ChatViewProps {
  navigationController: NavigationController;
  conversationId: string;
  chatService?: ChatService; // Optional override for testing
}

/**
 * ChatView State
 */
interface ChatViewState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error?: string;
}

/**
 * ChatView Component
 *
 * Fully integrated with ChatService and MessageStore for real-time chat functionality.
 */
export class ChatView extends NavigationPageComponent<
  ChatViewProps,
  ChatViewState
> {
  // Stores and Services
  private messageStore: MessageStore;
  private conversationStore: ConversationStore;
  private chatService: ChatService;
  private unsubscribeMessageStore?: () => void;

  state: ChatViewState = {
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: undefined,
  };

  constructor(props: ChatViewProps) {
    super(props);

    // Initialize stores
    this.messageStore = messageStore;
    this.conversationStore = conversationStore;

    // Initialize ChatService (use provided or create new one)
    if (props.chatService) {
      this.chatService = props.chatService;
    } else {
      // Default configuration - in production, this should come from settings
      const config: ChatServiceConfig = {
        apiKeys: {
          openai: process.env.OPENAI_API_KEY || '',
          anthropic: process.env.ANTHROPIC_API_KEY || '',
          google: process.env.GOOGLE_API_KEY || '',
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
  }

  onCreate() {
    // Load initial messages from store
    this.loadMessages();

    // Subscribe to message store updates
    this.unsubscribeMessageStore = this.messageStore.subscribe(
      (state: MessageStoreState) => {
        this.handleMessageStoreUpdate(state);
      },
    );
  }

  onDestroy() {
    // Unsubscribe from message store
    if (this.unsubscribeMessageStore) {
      this.unsubscribeMessageStore();
      this.unsubscribeMessageStore = undefined;
    }
  }

  /**
   * Load messages from store
   */
  private loadMessages(): void {
    const messages = this.messageStore.getMessages(
      this.viewModel.conversationId,
    );
    this.setState({
      messages,
      isStreaming: this.messageStore.isStreaming(),
    });
  }

  /**
   * Handle message store updates
   */
  private handleMessageStoreUpdate(state: MessageStoreState): void {
    const messages =
      state.messagesByConversation[this.viewModel.conversationId] || [];
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
  private handleSendMessage = async (text: string): Promise<void> => {
    if (!text.trim()) {
      return;
    }

    // Get conversation to get system prompt and model config
    const conversation = this.conversationStore.getConversation(
      this.viewModel.conversationId,
    );

    // Set loading state
    this.setState({
      isLoading: true,
      error: undefined,
    });

    try {
      // Send message with streaming
      await this.chatService.sendMessageStreaming(
        {
          conversationId: this.viewModel.conversationId,
          message: text,
          modelConfig: conversation?.modelConfig,
          systemPrompt: conversation?.systemPrompt,
          toolsEnabled: conversation?.toolsEnabled || false,
          maxSteps: 5,
        },
        this.handleStreamEvent,
      );

      // Update conversation message count
      this.conversationStore.incrementMessageCount(
        this.viewModel.conversationId,
      );

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
  private handleStreamEvent = (event: StreamEvent): void => {
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

  private renderMessage = (message: Message) => {
    return <MessageBubble key={message.id} message={message} />;
  };

  onRender() {
    const { messages, isLoading, isStreaming, error } = this.state;

    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label
            value="AI Chat"
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: Colors.textPrimary,
            }}
          />
          {isStreaming && (
            <label
              value="AI is typing..."
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                marginLeft: Spacing.sm,
              }}
            />
          )}
        </view>

        {/* Error Message */}
        {error && (
          <view style={styles.errorContainer}>
            <label
              value={`Error: ${error}`}
              style={{
                fontSize: 14,
                color: Colors.error,
              }}
            />
          </view>
        )}

        {/* Messages List */}
        <ScrollView style={styles.messagesList}>
          <view style={styles.messagesContent}>
            {messages.length === 0 ? (
              <view style={styles.emptyState}>
                <label
                  value="Start a conversation"
                  style={{
                    fontSize: 16,
                    color: Colors.textSecondary,
                  }}
                />
              </view>
            ) : (
              messages.map((message) => this.renderMessage(message))
            )}
          </view>
        </ScrollView>

        {/* Input Bar */}
        <InputBar
          onSend={this.handleSendMessage}
          disabled={isLoading || isStreaming}
        />
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    flex: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    paddingHorizontal: SemanticSpacing.screenPaddingHorizontal,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  }),

  errorContainer: new Style<View>({
    paddingHorizontal: SemanticSpacing.screenPaddingHorizontal,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.errorBackground || '#ffebee',
  }),

  messagesList: new Style<View>({
    flex: 1,
  }),

  messagesContent: new Style<View>({
    paddingHorizontal: SemanticSpacing.screenPaddingHorizontal,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  }),

  emptyState: new Style<View>({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.massive,
  }),
};
