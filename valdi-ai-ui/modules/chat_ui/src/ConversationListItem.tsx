/**
 * ConversationListItem
 *
 * Individual conversation list item component.
 * Displays conversation title, preview, timestamp, and status indicators.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import type { Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemFont } from 'valdi_core/src/SystemFont';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Conversation,
} from 'common/src';

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

  private getContainerStyle(hasUnread: boolean): Style<View> {
    return new Style<View>({
      width: '100%',
      paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
      paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: hasUnread ? Colors.surface : Colors.background,
    });
  }

  private getPreviewStyle(hasUnread: boolean): Style<Label> {
    return new Style<Label>({
      ...Fonts.body,
      color: hasUnread ? Colors.textSecondary : Colors.textTertiary,
      flexGrow: 1,
    });
  }

  override onRender() {
    const { conversation, unreadCount } = this.viewModel;

    const previewText = this.getPreviewText();
    const timeDisplay = this.getTimeDisplay();
    const providerIcon = this.getProviderIcon();
    const hasUnread = (unreadCount ?? 0) > 0;

    return (
      <view
        style={this.getContainerStyle(hasUnread)}
        onTap={this.handlePress}
        onLongPress={this.handleLongPress}
      >
        {/* Main Content */}
        <view style={styles.mainContent}>
          {/* Left: Provider Icon */}
          <view style={styles.providerIconContainer}>
            <view style={styles.providerIconWithBg}>
              <label value={providerIcon} style={styles.providerIconText} />
            </view>
          </view>

          {/* Center: Title and Preview */}
          <view style={styles.centerContent}>
            {/* Title Row */}
            <view style={styles.titleRow}>
              {/* Pinned Indicator */}
              {conversation.isPinned && (
                <view style={styles.pinnedIndicator}>
                  <label value="📌" style={styles.pinnedIcon} />
                </view>
              )}

              {/* Title */}
              <label
                value={conversation.title}
                numberOfLines={1}
                style={styles.titleText}
              />
            </view>

            {/* Preview Row */}
            <view style={styles.previewRow}>
              <label
                value={previewText}
                numberOfLines={1}
                style={this.getPreviewStyle(hasUnread)}
              />
            </view>

            {/* Tags Row */}
            {conversation.tags.length > 0 && (
              <view style={styles.tagsRow}>
                {conversation.tags.slice(0, 2).map((tag) => (
                  <view key={tag} style={styles.tag}>
                    <label value={tag} style={styles.tagText} />
                  </view>
                ))}
                {conversation.tags.length > 2 && (
                  <label
                    value={`+${conversation.tags.length - 2}`}
                    style={styles.moreTagsText}
                  />
                )}
              </view>
            )}
          </view>

          {/* Right: Timestamp and Badge */}
          <view style={styles.rightContent}>
            {/* Timestamp */}
            <label value={timeDisplay} style={styles.timestampText} />

            {/* Unread Badge */}
            {hasUnread && (
              <view style={styles.unreadBadge}>
                <label
                  value={unreadCount! > 99 ? '99+' : unreadCount!.toString()}
                  style={styles.unreadBadgeText}
                />
              </view>
            )}

            {/* Message Count (if no unread) */}
            {!hasUnread && conversation.messageCount > 0 && (
              <label
                value={`${conversation.messageCount}`}
                style={styles.messageCountText}
              />
            )}
          </view>
        </view>

        {/* Archived Indicator */}
        {conversation.status === 'archived' && (
          <view style={styles.archivedBanner}>
            <label value="Archived" style={styles.archivedText} />
          </view>
        )}
      </view>
    );
  }
}

const styles = {
  mainContent: new Style<View>({
    flexDirection: 'row',
    alignItems: 'flex-start',
  }),

  providerIconContainer: new Style<View>({
    paddingTop: Spacing.xs / 2,
    marginRight: Spacing.sm,
  }),

  providerIconWithBg: new Style<View>({
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  }),

  providerIconText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textInverse,
  }),

  centerContent: new Style<View>({
    flexGrow: 1,
  }),

  titleRow: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
  }),

  pinnedIndicator: new Style<View>({
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  }),

  pinnedIcon: new Style<Label>({
    font: systemFont(12),
  }),

  titleText: new Style<Label>({
    ...Fonts.bodySemibold,
    color: Colors.textPrimary,
    flexGrow: 1,
  }),

  previewRow: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  }),

  tagsRow: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  }),

  tag: new Style<View>({
    backgroundColor: Colors.primaryLight,
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.xs,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  }),

  tagText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.primary,
  }),

  moreTagsText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
  }),

  rightContent: new Style<View>({
    alignItems: 'flex-end',
    minWidth: 50,
    marginLeft: Spacing.sm,
  }),

  timestampText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
  }),

  unreadBadge: new Style<View>({
    backgroundColor: Colors.primary,
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  }),

  unreadBadgeText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textInverse,
  }),

  messageCountText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  }),

  archivedBanner: new Style<View>({
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  archivedText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
  }),
};
