/**
 * ChatView
 *
 * Main chat interface component.
 * Displays messages and handles user input.
 */

import { NavigationPageComponent, StatefulComponent, Style, View } from '@valdi/valdi_core';
import { NavigationController } from '@valdi/valdi_navigation';
import { Colors, Spacing, SemanticSpacing, Message } from '@common';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';

/**
 * ChatView Props
 */
export interface ChatViewProps {
  navigationController: NavigationController;
  conversationId: string;
}

/**
 * ChatView State
 */
interface ChatViewState {
  messages: Message[];
  isLoading: boolean;
}

/**
 * ChatView Component
 *
 * TODO: Integrate with ChatService and MessageStore
 */
export class ChatView extends NavigationPageComponent<ChatViewProps, ChatViewState> {
  state: ChatViewState = {
    messages: [],
    isLoading: false,
  };

  onCreate() {
    // TODO: Load messages from MessageStore
    // TODO: Subscribe to message updates
  }

  onDestroy() {
    // TODO: Unsubscribe from MessageStore
  }

  private handleSendMessage = (text: string): void => {
    console.log('Send message:', text);
    // TODO: Use ChatService to send message
    // const chatService = new ChatService(config, messageStore);
    // chatService.sendMessageStreaming({ conversationId, message: text }, callback);
  };

  private renderMessage = (message: Message) => {
    return (
      <MessageBubble
        key={message.id}
        message={message}
      />
    );
  };

  onRender() {
    const { messages, isLoading } = this.state;

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
        </view>

        {/* Messages List */}
        <scrollview style={styles.messagesList}>
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
        </scrollview>

        {/* Input Bar */}
        <InputBar
          onSend={this.handleSendMessage}
          disabled={isLoading}
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
