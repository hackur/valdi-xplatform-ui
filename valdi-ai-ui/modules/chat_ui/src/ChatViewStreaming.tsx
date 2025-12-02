/**
 * ChatViewStreaming
 *
 * Enhanced ChatView with real-time streaming AI responses.
 * Fully integrated with ChatIntegrationService.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import type { NavigationController } from 'valdi_navigation/src/NavigationController';
import { Colors, Spacing } from '../../common/src/index';
import type { Message } from '../../common/src/index';
import { LoadingSpinner } from '../../common/src/index';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import type { ChatIntegrationService } from './ChatIntegrationService';

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
export class ChatViewStreaming extends StatefulComponent<
  ChatViewStreamingProps,
  ChatViewStreamingState
> {
  private unsubscribeMessages?: () => void;

  override state: ChatViewStreamingState = {
    messages: [],
    isLoading: true,
    isStreaming: false,
    error: undefined,
  };

  async componentDidMount(): Promise<void> {
    await this.loadMessages();

    // Subscribe to message updates
    this.unsubscribeMessages =
      this.viewModel.integrationService.subscribeToMessages(
        this.viewModel.conversationId,
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

  override onRender() {
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
          <scroll
            style={styles.scrollView}
          >
            {/* TODO: Implement IRenderedElementHolder pattern for scroll ref */}
            <view style={styles.messageList}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </view>
          </scroll>
        )}

        {/* Input Bar */}
        <InputBar
          onSend={this.handleSend}
          disabled={isStreaming}
          placeholder={
            isStreaming ? 'AI is responding...' : 'Type a message...'
          }
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
      const messages = this.viewModel.integrationService.loadConversationMessages(
        this.viewModel.conversationId,
      );

      this.setState({
        messages,
        isLoading: false,
      });

      this.scrollToBottom();
    } catch (error) {
      console.error('[ChatViewStreaming] Load messages error:', error);
      this.setState({
        error:
          error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
      });
    }
  }

  /**
   * Handle send message
   */
  private readonly handleSend = async (content: string): Promise<void> => {
    if (!content.trim() || this.state.isStreaming) {
      return;
    }

    this.setState({ isStreaming: true, error: undefined });

    try {
      await this.viewModel.integrationService.sendMessage(
        this.viewModel.conversationId,
        content,
        (_delta: string, _fullText: string) => {
          // Stream progress - messages are automatically updated via subscription
          this.scrollToBottom();
        },
      );

      this.setState({ isStreaming: false });
      this.scrollToBottom();
    } catch (error) {
      console.error('[ChatViewStreaming] Send message error:', error);
      this.setState({
        error:
          error instanceof Error ? error.message : 'Failed to send message',
        isStreaming: false,
      });
    }
  };

  /**
   * Scroll to bottom
   * TODO: Implement using IRenderedElementHolder pattern when scroll ref is restored
   */
  private scrollToBottom(): void {
    // Disabled until IRenderedElementHolder pattern is implemented
    // Will need to use proper ref pattern for scroll element
  }
}

const styles = {
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: Colors.background,
  }),

  scrollView: new Style<View>({
    flexGrow: 1,
  }),

  messageList: new Style<View>({
    padding: Spacing.base,
  }),

  errorContainer: new Style<View>({
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  }),

  errorIcon: new Style<Label>({
    font: systemFont(48),
    marginBottom: Spacing.base,
  }),

  errorText: new Style<Label>({
    font: systemFont(16),
    color: Colors.error,
    textAlign: 'center',
  }),

  emptyContainer: new Style<View>({
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  }),

  emptyIcon: new Style<Label>({
    font: systemFont(64),
    marginBottom: Spacing.base,
  }),

  emptyText: new Style<Label>({
    font: systemBoldFont(18),
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  }),

  emptySubtext: new Style<Label>({
    font: systemFont(14),
    color: Colors.textTertiary,
    textAlign: 'center',
  }),
};
