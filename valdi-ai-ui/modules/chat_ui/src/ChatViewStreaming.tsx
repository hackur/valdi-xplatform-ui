/**
 * ChatViewStreaming
 *
 * Enhanced ChatView with real-time streaming AI responses.
 * Fully integrated with ChatIntegrationService.
 */

import { NavigationPageComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, ScrollView, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import { Colors, Spacing } from '@common/theme';
import { Message } from '@common/types';
import { LoadingSpinner } from '@common/components/LoadingSpinner';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { ChatIntegrationService } from './ChatIntegrationService';

/**
 * ChatViewStreaming Props
 */
export interface ChatViewStreamingProps {
  navigationController: NavigationController;
  conversationId: string;
  integrationService: ChatIntegrationService;
}

/**
 * ChatViewStreaming State
 */
export interface ChatViewStreamingState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error?: string;
}

/**
 * ChatViewStreaming Component
 *
 * Real-time chat with streaming AI responses.
 * Follows KISS principle - simple, focused on chat functionality.
 */
export class ChatViewStreaming extends NavigationPageComponent<
  ChatViewStreamingProps,
  ChatViewStreamingState
> {
  private unsubscribeMessages?: () => void;
  private scrollViewRef?: ScrollView;

  state: ChatViewStreamingState = {
    messages: [],
    isLoading: true,
    isStreaming: false,
    error: undefined,
  };

  async componentDidMount(): Promise<void> {
    await this.loadMessages();

    // Subscribe to message updates
    this.unsubscribeMessages = this.props.integrationService.subscribeToMessages(
      this.props.conversationId,
      (messages) => {
        this.setState({ messages, isLoading: false });
        this.scrollToBottom();
      },
    );
  }

  componentWillUnmount(): void {
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
    }
  }

  onRender() {
    const { messages, isLoading, isStreaming, error } = this.state;

    return (
      <view style={styles.container}>
        {/* Messages */}
        {isLoading ? (
          <LoadingSpinner size="medium" text="Loading messages..." />
        ) : error ? (
          <view style={styles.errorContainer}>
            <label value="❌" style={styles.errorIcon} />
            <label value={error} style={styles.errorText} />
          </view>
        ) : messages.length === 0 ? (
          <view style={styles.emptyContainer}>
            <label value="💬" style={styles.emptyIcon} />
            <label value="No messages yet" style={styles.emptyText} />
            <label
              value="Start the conversation below"
              style={styles.emptySubtext}
            />
          </view>
        ) : (
          <scrollView
            ref={(ref: ScrollView) => (this.scrollViewRef = ref)}
            style={styles.scrollView}
          >
            <view style={styles.messageList}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </view>
          </scrollView>
        )}

        {/* Input Bar */}
        <InputBar
          onSend={this.handleSend}
          disabled={isStreaming}
          placeholder={isStreaming ? 'AI is responding...' : 'Type a message...'}
        />
      </view>
    );
  }

  /**
   * Load messages
   */
  private async loadMessages(): Promise<void> {
    this.setState({ isLoading: true, error: undefined });

    try {
      const messages = this.props.integrationService.loadConversationMessages(
        this.props.conversationId,
      );

      this.setState({
        messages,
        isLoading: false,
      });

      this.scrollToBottom();
    } catch (error) {
      console.error('[ChatViewStreaming] Load messages error:', error);
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
      });
    }
  }

  /**
   * Handle send message
   */
  private handleSend = async (content: string): Promise<void> => {
    if (!content.trim() || this.state.isStreaming) {
      return;
    }

    this.setState({ isStreaming: true, error: undefined });

    try {
      await this.props.integrationService.sendMessage(
        this.props.conversationId,
        content,
        (delta: string, fullText: string) => {
          // Stream progress - messages are automatically updated via subscription
          this.scrollToBottom();
        },
      );

      this.setState({ isStreaming: false });
      this.scrollToBottom();
    } catch (error) {
      console.error('[ChatViewStreaming] Send message error:', error);
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to send message',
        isStreaming: false,
      });
    }
  };

  /**
   * Scroll to bottom
   */
  private scrollToBottom(): void {
    if (this.scrollViewRef) {
      // Scroll to end (implementation depends on Valdi's ScrollView API)
      // this.scrollViewRef.scrollToEnd({ animated: true });
    }
  }
}

const styles = {
  container: new Style<View>({
    flex: 1,
    backgroundColor: Colors.background,
  }),

  scrollView: new Style<ScrollView>({
    flex: 1,
  }),

  messageList: new Style<View>({
    padding: Spacing.base,
  }),

  errorContainer: new Style<View>({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  }),

  errorIcon: new Style<Label>({
    fontSize: 48,
    marginBottom: Spacing.base,
  }),

  errorText: new Style<Label>({
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  }),

  emptyContainer: new Style<View>({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  }),

  emptyIcon: new Style<Label>({
    fontSize: 64,
    marginBottom: Spacing.base,
  }),

  emptyText: new Style<Label>({
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  }),

  emptySubtext: new Style<Label>({
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
  }),
};
