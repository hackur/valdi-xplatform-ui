/**
 * ConversationListItem
 *
 * Individual conversation list item component.
 * Displays conversation title, preview, timestamp, and status indicators.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  SemanticShadows,
  Conversation,
  ConversationUtils,
  MessageUtils,
} from '@common';

/**
 * ConversationListItem Props
 */
export interface ConversationListItemProps {
  /** Conversation data */
  conversation: Conversation;

  /** Last message preview text */
  lastMessagePreview?: string;

  /** Unread message count */
  unreadCount?: number;

  /** Tap handler */
  onPress?: (conversationId: string) => void;

  /** Long press handler */
  onLongPress?: (conversationId: string) => void;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * ConversationListItem Component
 */
export class ConversationListItem extends Component<ConversationListItemProps> {
  static defaultProps: Partial<ConversationListItemProps> = {
    unreadCount: 0,
  };

  private handlePress = (): void => {
    const { conversation, onPress } = this.viewModel;
    if (onPress) {
      onPress(conversation.id);
    }
  };

  private handleLongPress = (): void => {
    const { conversation, onLongPress } = this.viewModel;
    if (onLongPress) {
      onLongPress(conversation.id);
    }
  };

  private getPreviewText(): string {
    const { lastMessagePreview } = this.viewModel;
    if (lastMessagePreview) {
      // Truncate to 60 characters
      return lastMessagePreview.length > 60
        ? lastMessagePreview.substring(0, 60) + '...'
        : lastMessagePreview;
    }
    return 'No messages yet';
  }

  private getTimeDisplay(): string {
    const { conversation } = this.viewModel;
    const date = conversation.lastMessageAt || conversation.updatedAt;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    }
  }

  private getProviderIcon(): string {
    const { conversation } = this.viewModel;
    const provider = conversation.modelConfig.provider;

    switch (provider) {
      case 'openai':
        return 'O';
      case 'anthropic':
        return 'C';
      case 'google':
        return 'G';
      case 'xai':
        return 'X';
      default:
        return 'AI';
    }
  }

  override onRender() {
    const { conversation, unreadCount, style: customStyle } = this.viewModel;

    const previewText = this.getPreviewText();
    const timeDisplay = this.getTimeDisplay();
    const providerIcon = this.getProviderIcon();
    const hasUnread = (unreadCount ?? 0) > 0;

    return (
      <view
        style={{
          ...styles.container,
          backgroundColor: hasUnread ? Colors.surface : Colors.background,
          ...customStyle,
        }}
        onTap={this.handlePress}
        onLongPress={this.handleLongPress}
      >
        {/* Main Content */}
        <view style={styles.mainContent}>
          {/* Left: Provider Icon */}
          <view style={styles.providerIconContainer}>
            <view
              style={{
                ...styles.providerIcon,
                backgroundColor: Colors.secondary,
              }}
            >
              <label
                value={providerIcon}
                style={{
                  ...Fonts.caption,
                  fontSize: 12,
                  color: Colors.textInverse,
                  fontWeight: '600',
                }}
              />
            </view>
          </view>

          {/* Center: Title and Preview */}
          <view style={styles.centerContent}>
            {/* Title Row */}
            <view style={styles.titleRow}>
              {/* Pinned Indicator */}
              {conversation.isPinned && (
                <view style={styles.pinnedIndicator}>
                  <label
                    value="📌"
                    style={{
                      fontSize: 12,
                    }}
                  />
                </view>
              )}

              {/* Title */}
              <label
                value={conversation.title}
                numberOfLines={1}
                style={{
                  ...Fonts.bodySemibold,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  flex: 1,
                }}
              />
            </view>

            {/* Preview Row */}
            <view style={styles.previewRow}>
              <label
                value={previewText}
                numberOfLines={1}
                style={{
                  ...Fonts.body,
                  fontSize: 14,
                  color: hasUnread ? Colors.textSecondary : Colors.textTertiary,
                  flex: 1,
                }}
              />
            </view>

            {/* Tags Row */}
            {conversation.tags.length > 0 && (
              <view style={styles.tagsRow}>
                {conversation.tags.slice(0, 2).map((tag) => (
                  <view key={tag} style={styles.tag}>
                    <label
                      value={tag}
                      style={{
                        ...Fonts.caption,
                        fontSize: 11,
                        color: Colors.primary,
                      }}
                    />
                  </view>
                ))}
                {conversation.tags.length > 2 && (
                  <label
                    value={`+${conversation.tags.length - 2}`}
                    style={{
                      ...Fonts.caption,
                      fontSize: 11,
                      color: Colors.textTertiary,
                    }}
                  />
                )}
              </view>
            )}
          </view>

          {/* Right: Timestamp and Badge */}
          <view style={styles.rightContent}>
            {/* Timestamp */}
            <label
              value={timeDisplay}
              style={{
                ...Fonts.caption,
                fontSize: 12,
                color: Colors.textTertiary,
              }}
            />

            {/* Unread Badge */}
            {hasUnread && (
              <view style={styles.unreadBadge}>
                <label
                  value={unreadCount! > 99 ? '99+' : unreadCount!.toString()}
                  style={{
                    ...Fonts.caption,
                    fontSize: 11,
                    fontWeight: '600',
                    color: Colors.textInverse,
                  }}
                />
              </view>
            )}

            {/* Message Count (if no unread) */}
            {!hasUnread && conversation.messageCount > 0 && (
              <label
                value={`${conversation.messageCount}`}
                style={{
                  ...Fonts.caption,
                  fontSize: 11,
                  color: Colors.textTertiary,
                }}
              />
            )}
          </view>
        </view>

        {/* Archived Indicator */}
        {conversation.status === 'archived' && (
          <view style={styles.archivedBanner}>
            <label
              value="Archived"
              style={{
                ...Fonts.caption,
                fontSize: 11,
                color: Colors.textTertiary,
              }}
            />
          </view>
        )}
      </view>
    );
  }
}

const styles = {
  container: new Style({
    width: '100%',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  }),

  mainContent: new Style({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  }),

  providerIconContainer: new Style({
    paddingTop: Spacing.xs / 2,
  }),

  providerIcon: new Style({
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  centerContent: new Style({
    flex: 1,
    gap: Spacing.xs,
  }),

  titleRow: new Style({
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  }),

  pinnedIndicator: new Style({
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  previewRow: new Style({
    flexDirection: 'row',
    alignItems: 'center',
  }),

  tagsRow: new Style({
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  }),

  tag: new Style({
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  }),

  rightContent: new Style({
    alignItems: 'flex-end',
    gap: Spacing.xs,
    minWidth: 50,
  }),

  unreadBadge: new Style({
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  archivedBanner: new Style({
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  }),
};
