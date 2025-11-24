/**
 * MessageBubble
 *
 * Individual message bubble component.
 * Displays user or AI messages with appropriate styling.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  ChatBorderRadius,
  SemanticShadows,
  Message,
  MessageTypeGuards,
  Avatar,
} from '@common';

/**
 * MessageBubble Props
 */
export interface MessageBubbleProps {
  message: Message;
}

/**
 * MessageBubble Component
 */
export class MessageBubble extends Component<MessageBubbleProps> {
  private getMessageText(): string {
    const { message } = this.viewModel;
    return typeof message.content === 'string' ? message.content : '';
  }

  onRender() {
    const { message } = this.viewModel;
    const isUser = MessageTypeGuards.isUserMessage(message);
    const text = this.getMessageText();

    return (
      <view
        style={{
          ...styles.container,
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <view
          style={{
            ...styles.messageRow,
            flexDirection: isUser ? 'row-reverse' : 'row',
          }}
        >
          {/* Avatar */}
          <Avatar type={isUser ? 'user' : 'ai'} size="small" />

          {/* Message Bubble */}
          <view
            style={{
              ...styles.bubble,
              backgroundColor: isUser
                ? Colors.userMessageBg
                : Colors.aiMessageBg,
              borderRadius: ChatBorderRadius.messageBubble,
              ...SemanticShadows.messageBubble,
            }}
          >
            <label
              value={text}
              style={{
                ...Fonts.chatMessage,
                color: isUser ? Colors.userMessageText : Colors.aiMessageText,
              }}
            />

            {/* Timestamp */}
            {message.createdAt && (
              <view style={styles.timestampContainer}>
                <label
                  value={this.formatTime(message.createdAt)}
                  style={{
                    ...Fonts.chatTimestamp,
                    color: isUser
                      ? Colors.userMessageText
                      : Colors.textTertiary,
                    opacity: 0.7,
                  }}
                />
              </view>
            )}
          </view>
        </view>

        {/* Status indicator */}
        {message.status === 'streaming' && (
          <view style={styles.statusContainer}>
            <label
              value="..."
              style={{
                ...Fonts.caption,
                color: Colors.textTertiary,
              }}
            />
          </view>
        )}

        {message.status === 'error' && (
          <view style={styles.statusContainer}>
            <label
              value={`Error: ${message.error || 'Unknown error'}`}
              style={{
                ...Fonts.caption,
                color: Colors.error,
              }}
            />
          </view>
        )}
      </view>
    );
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }
}

const styles = {
  container: new Style<View>({
    width: '100%',
    marginBottom: SemanticSpacing.messageBubbleGap,
  }),

  messageRow: new Style<View>({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    maxWidth: '80%',
  }),

  bubble: new Style<View>({
    padding: SemanticSpacing.messageBubblePadding,
    maxWidth: '100%',
  }),

  timestampContainer: new Style<View>({
    marginTop: Spacing.xs,
  }),

  statusContainer: new Style<View>({
    marginTop: Spacing.xs,
    marginLeft: 40, // Account for avatar width + gap
  }),
};
