/**
 * ConversationCard Component
 *
 * Displays a single conversation in the list.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label, Image } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Fonts, Spacing, Shadows } from '@common';
import { ConversationListItemData } from './types';

/**
 * ConversationCard Props
 */
export interface ConversationCardProps {
  /** Conversation data */
  conversation: ConversationListItemData;

  /** On tap handler */
  onTap?: () => void;

  /** On long press handler (for context menu) */
  onLongPress?: () => void;

  /** Is selected */
  isSelected?: boolean;
}

/**
 * ConversationCard Component
 *
 * Card component for displaying conversation in a list.
 */
export class ConversationCard extends Component<ConversationCardProps> {
  onRender() {
    const { conversation, onTap, onLongPress, isSelected } = this.props;

    // Format time
    const timeStr = conversation.lastMessageTime
      ? this.formatTime(conversation.lastMessageTime)
      : '';

    // Get status color
    const statusColor = this.getStatusColor(conversation.status);

    return (
      <view
        style={isSelected ? styles.cardSelected : styles.card}
        onTap={onTap}
        onLongPress={onLongPress}
      >
        {/* Left: Avatar/Icon */}
        <view style={styles.leftSection}>
          <view style={styles.avatar}>
            <label value={this.getInitials(conversation.title)} style={styles.avatarText} />
          </view>
          {conversation.isPinned && (
            <view style={styles.pinIndicator}>
              <label value="📌" style={styles.pinIcon} />
            </view>
          )}
        </view>

        {/* Center: Content */}
        <view style={styles.centerSection}>
          <view style={styles.header}>
            <label value={conversation.title} style={styles.title} numberOfLines={1} />
            {timeStr && <label value={timeStr} style={styles.time} />}
          </view>

          {conversation.lastMessagePreview && (
            <label
              value={conversation.lastMessagePreview}
              style={styles.preview}
              numberOfLines={2}
            />
          )}

          <view style={styles.footer}>
            {conversation.model && (
              <label value={`Model: ${conversation.model}`} style={styles.metadata} />
            )}
            <label value={`${conversation.participantCount} participants`} style={styles.metadata} />
          </view>
        </view>

        {/* Right: Status & Unread */}
        <view style={styles.rightSection}>
          <view style={{ ...styles.statusDot, backgroundColor: statusColor }} />
          {conversation.unreadCount > 0 && (
            <view style={styles.unreadBadge}>
              <label
                value={String(conversation.unreadCount)}
                style={styles.unreadText}
              />
            </view>
          )}
        </view>
      </view>
    );
  }

  /**
   * Get initials from title
   */
  private getInitials(title: string): string {
    const words = title.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  }

  /**
   * Format timestamp
   */
  private formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get status color
   */
  private getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'archived':
        return Colors.warning;
      case 'deleted':
        return Colors.error;
      default:
        return Colors.gray400;
    }
  }
}

const styles = {
  card: new Style<View>({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
  }),

  cardSelected: new Style<View>({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    backgroundColor: Colors.primary50,
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    minHeight: 80,
  }),

  leftSection: new Style<View>({
    marginRight: Spacing.sm,
    alignItems: 'center',
  }),

  avatar: new Style<View>({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  }),

  avatarText: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.primary,
  }),

  pinIndicator: new Style<View>({
    position: 'absolute',
    top: -4,
    right: -4,
  }),

  pinIcon: new Style<Label>({
    fontSize: 12,
  }),

  centerSection: new Style<View>({
    flex: 1,
    justifyContent: 'space-between',
  }),

  header: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  }),

  title: new Style<Label>({
    ...Fonts.bodyLargeMedium,
    color: Colors.textPrimary,
    flex: 1,
  }),

  time: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  }),

  preview: new Style<Label>({
    ...Fonts.bodyRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  }),

  footer: new Style<View>({
    flexDirection: 'row',
    gap: Spacing.sm,
  }),

  metadata: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
  }),

  rightSection: new Style<View>({
    alignItems: 'flex-end',
    gap: Spacing.xs,
  }),

  statusDot: new Style<View>({
    width: 8,
    height: 8,
    borderRadius: 4,
  }),

  unreadBadge: new Style<View>({
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  }),

  unreadText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.white,
    fontWeight: '600',
  }),
};
