/**
 * ConversationList
 *
 * Displays a scrollable list of conversations with filtering,
 * search, and pull-to-refresh functionality.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label, EditTextEvent } from 'valdi_tsx/src/NativeTemplateElements';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  BorderRadius,
  Conversation,
  LoadingSpinner,
} from 'common/src';
import { ConversationListItem } from './ConversationListItem';

/**
 * Conversation Filter Type
 */
export type ConversationFilter = 'all' | 'pinned' | 'archived';

/**
 * ConversationList Props
 */
export interface ConversationListProps {
  /** List of conversations */
  conversations: Conversation[];

  /** Last message previews (keyed by conversation ID) */
  lastMessagePreviews?: Record<string, string>;

  /** Unread counts (keyed by conversation ID) */
  unreadCounts?: Record<string, number>;

  /** Initial filter */
  initialFilter?: ConversationFilter;

  /** Is loading */
  isLoading?: boolean;

  /** Is refreshing */
  isRefreshing?: boolean;

  /** Conversation tap handler */
  onConversationPress?: (conversationId: string) => void;

  /** Conversation long press handler */
  onConversationLongPress?: (conversationId: string) => void;

  /** Filter change handler */
  onFilterChange?: (filter: ConversationFilter) => void;

  /** Search query change handler */
  onSearchChange?: (query: string) => void;

  /** Refresh handler */
  onRefresh?: () => void;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * ConversationList State
 */
interface ConversationListState {
  filter: ConversationFilter;
  searchQuery: string;
  filteredConversations: Conversation[];
}

/**
 * ConversationList Component
 */
export class ConversationList extends StatefulComponent<
  ConversationListProps,
  ConversationListState
> {
  static defaultProps: Partial<ConversationListProps> = {
    initialFilter: 'all',
    isLoading: false,
    isRefreshing: false,
    lastMessagePreviews: {},
    unreadCounts: {},
  };

  override state: ConversationListState = {
    filter: this.viewModel.initialFilter || 'all',
    searchQuery: '',
    filteredConversations: [],
  };

  override onCreate() {
    this.updateFilteredConversations();
  }

  override onViewModelUpdate(prevProps?: ConversationListProps) {
    // Update filtered list when conversations or filter changes
    if (
      prevProps &&
      (prevProps.conversations !== this.viewModel.conversations ||
        prevProps.initialFilter !== this.viewModel.initialFilter)
    ) {
      this.updateFilteredConversations();
    }
  }

  private updateFilteredConversations(): void {
    const { conversations } = this.viewModel;
    const { filter, searchQuery } = this.state;

    let filtered = [...conversations];

    // Apply filter
    switch (filter) {
      case 'pinned':
        filtered = filtered.filter((conv) => conv.isPinned);
        break;
      case 'archived':
        filtered = filtered.filter((conv) => conv.status === 'archived');
        break;
      case 'all':
      default:
        filtered = filtered.filter((conv) => conv.status !== 'archived');
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.title.toLowerCase().includes(query) ||
          conv.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Sort: pinned first, then by lastMessageAt/updatedAt
    filtered.sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then by most recent
      const aDate = a.lastMessageAt || a.updatedAt;
      const bDate = b.lastMessageAt || b.updatedAt;
      return bDate.getTime() - aDate.getTime();
    });

    this.setState({ filteredConversations: filtered });
  }

  private handleFilterChange = (filter: ConversationFilter): void => {
    this.setState({ filter });
    this.updateFilteredConversations();
    const { onFilterChange } = this.viewModel;
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  private handleSearchChange = (event: EditTextEvent): void => {
    const query = event.text;
    this.setState({ searchQuery: query });
    this.updateFilteredConversations();
    const { onSearchChange } = this.viewModel;
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  private handleRefresh = (): void => {
    const { onRefresh } = this.viewModel;
    if (onRefresh) {
      onRefresh();
    }
  };

  private getFilterButtonStyle(isActive: boolean) {
    return new Style<View>({
      ...styles.filterButton,
      backgroundColor: isActive ? Colors.primary : Colors.surface,
      borderColor: isActive ? Colors.primary : Colors.border,
    });
  }

  private getFilterButtonLabelStyle(isActive: boolean) {
    return new Style<Label>({
      ...Fonts.bodySemibold,
      
      color: isActive ? Colors.textInverse : Colors.textPrimary,
    });
  }

  private renderFilterButton(
    filterType: ConversationFilter,
    label: string,
    count?: number,
  ) {
    const { filter } = this.state;
    const isActive = filter === filterType;

    return (
      <view
        style={this.getFilterButtonStyle(isActive)}
        onTap={() => this.handleFilterChange(filterType)}
      >
        <label
          value={count !== undefined ? `${label} (${count})` : label}
          style={this.getFilterButtonLabelStyle(isActive)}
        />
      </view>
    );
  }

  private renderEmptyState(): unknown {
    const { filter, searchQuery } = this.state;

    let message = 'No conversations';
    if (searchQuery.trim()) {
      message = 'No conversations found';
    } else if (filter === 'pinned') {
      message = 'No pinned conversations';
    } else if (filter === 'archived') {
      message = 'No archived conversations';
    }

    return (
      <view style={styles.emptyState}>
        <label
          value={message}
          style={styles.emptyStateMessage}
        />
        <label
          value={
            searchQuery.trim()
              ? 'Try a different search term'
              : 'Start a new conversation to get started'
          }
          style={styles.emptyStateSubtext}
        />
      </view>
    );
  }

  override onRender() {
    const {
      conversations,
      lastMessagePreviews,
      unreadCounts,
      isLoading,
      isRefreshing,
      onConversationPress,
      onConversationLongPress,
      style: customStyle,
    } = this.viewModel;

    const { searchQuery, filteredConversations } = this.state;

    // Calculate filter counts
    const pinnedCount = conversations.filter((c) => c.isPinned).length;
    const archivedCount = conversations.filter(
      (c) => c.status === 'archived',
    ).length;
    const allCount = conversations.filter(
      (c) => c.status !== 'archived',
    ).length;

    return (
      <view
        style={styles.container}
      >
        {/* Search Bar */}
        <view style={styles.searchContainer}>
          <textfield
            value={searchQuery}
            placeholder="Search conversations..."
            onChange={this.handleSearchChange}
            style={styles.searchInput}
          />
        </view>

        {/* Filter Tabs */}
        <view style={styles.filterContainer}>
          {this.renderFilterButton('all', 'All', allCount)}
          {this.renderFilterButton('pinned', 'Pinned', pinnedCount)}
          {this.renderFilterButton('archived', 'Archived', archivedCount)}
        </view>

        {/* Conversations List */}
        {isLoading && filteredConversations.length === 0 ? (
          <view style={styles.loadingContainer}>
            <LoadingSpinner size="large" showText={true} text="Loading" />
          </view>
        ) : (
          <scroll
            style={styles.scrollView}
            refreshControl={
              isRefreshing !== undefined
                ? {
                    refreshing: isRefreshing,
                    onRefresh: this.handleRefresh,
                  }
                : undefined
            }
          >
            {/* Refresh Indicator */}
            {isRefreshing && (
              <view style={styles.refreshingIndicator}>
                <LoadingSpinner size="small" />
              </view>
            )}

            {/* Conversation Items */}
            {filteredConversations.length > 0 ? (
              <view style={styles.listContent}>
                {filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    lastMessagePreview={lastMessagePreviews?.[conversation.id]}
                    unreadCount={unreadCounts?.[conversation.id]}
                    onPress={onConversationPress}
                    onLongPress={onConversationLongPress}
                  />
                ))}
              </view>
            ) : (
              this.renderEmptyState()
            )}
          </scroll>
        )}
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: Colors.background,
  }),

  searchContainer: new Style<View>({
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  searchInput: new Style<View>({
    width: '100%',
    height: 40,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.base,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Fonts.body,
    color: Colors.textPrimary,
  }),

  filterContainer: new Style<View>({
    flexDirection: 'row',
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  filterButton: new Style<View>({
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  scrollView: new Style<View>({
    flexGrow: 1,
  }),

  listContent: new Style<View>({
    flexDirection: 'column',
  }),

  loadingContainer: new Style<View>({
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.massive,
    paddingBottom: Spacing.massive,
  }),

  refreshingIndicator: new Style<View>({
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  emptyState: new Style<View>({
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.massive,
    paddingBottom: Spacing.massive,
  }),

  emptyStateMessage: new Style<Label>({
    ...Fonts.body,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  }),

  emptyStateSubtext: new Style<Label>({
    ...Fonts.body,
    
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  }),
};
