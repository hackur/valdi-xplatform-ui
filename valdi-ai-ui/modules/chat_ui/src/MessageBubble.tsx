/**
 * MessageBubble
 *
 * Individual message bubble component.
 * Displays user or AI messages with appropriate styling.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View } from 'valdi_tsx/src/NativeTemplateElements';
import type { Label } from 'valdi_tsx/src/NativeTemplateElements';
import type {
  Message} from '../../common/src/index';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  ChatBorderRadius,
  SemanticShadows,
  MessageTypeGuards,
  Avatar,
} from '../../common/src/index';

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

  private getContainerStyle(isUser: boolean): Style<View> {
    return new Style<View>({
      width: '100%',
      marginBottom: SemanticSpacing.messageBubbleGap,
      alignItems: isUser ? 'flex-end' : 'flex-start',
    });
  }

  private getMessageRowStyle(isUser: boolean): Style<View> {
    return new Style<View>({
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      maxWidth: '80%',
    });
  }

  private getBubbleStyle(isUser: boolean): Style<View> {
    return new Style<View>({
      padding: SemanticSpacing.messageBubblePadding,
      maxWidth: '100%',
      backgroundColor: isUser ? Colors.userMessageBg : Colors.aiMessageBg,
      borderRadius: ChatBorderRadius.messageBubble,
      ...SemanticShadows.messageBubble,
    });
  }

  private getMessageTextStyle(isUser: boolean): Style<Label> {
    return new Style<Label>({
      ...Fonts.chatMessage,
      color: isUser ? Colors.userMessageText : Colors.aiMessageText,
    });
  }

  private getTimestampStyle(isUser: boolean): Style<Label> {
    return new Style<Label>({
      ...Fonts.chatTimestamp,
      color: isUser ? Colors.userMessageText : Colors.textTertiary,
      opacity: 0.7,
    });
  }

  override onRender() {
    const { message } = this.viewModel;
    const isUser = MessageTypeGuards.isUserMessage(message);
    const text = this.getMessageText();

    return (
      <view style={this.getContainerStyle(isUser)}>
        <view style={this.getMessageRowStyle(isUser)}>
          {/* Avatar */}
          <Avatar type={isUser ? 'user' : 'ai'} size="small" />

          {/* Message Bubble */}
          <view style={this.getBubbleStyle(isUser)}>
            <label value={text} style={this.getMessageTextStyle(isUser)} />

            {/* Timestamp */}
            {message.createdAt && (
              <view style={styles.timestampContainer}>
                <label
                  value={this.formatTime(message.createdAt)}
                  style={this.getTimestampStyle(isUser)}
                />
              </view>
            )}
          </view>
        </view>

        {/* Status indicator */}
        {message.status === 'streaming' && (
          <view style={styles.statusContainer}>
            <label value="..." style={styles.streamingText} />
          </view>
        )}

        {message.status === 'error' && (
          <view style={styles.statusContainer}>
            <label
              value={`Error: ${message.error || 'Unknown error'}`}
              style={styles.errorText}
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

  streamingText: new Style<Label>({
    ...Fonts.chatMessage,
    color: Colors.textTertiary,
  }),

  errorText: new Style<Label>({
    ...Fonts.chatMessage,
    color: Colors.error,
  }),
};
