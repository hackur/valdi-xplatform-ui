/**
 * ConversationListView Component
 *
 * Main view for displaying and managing conversations.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Fonts, Spacing, BorderRadius, LoadingSpinner, ConfirmDialog } from '../../common/src/index';
import type { SimpleNavigationController } from '../../common/src/index';
import { systemFont } from 'valdi_core/src/SystemFont';
import type { ConversationListItemData } from './types';
import type { HistoryManager } from './HistoryManager';
import { ConversationCard } from './ConversationCard';
import { SearchBar } from './SearchBar';
import { conversationStore } from '../../chat_core/src/ConversationStore';

/**
 * ConversationListView Props
 */
export interface ConversationListViewProps {
  /** Navigation controller */
  navigationController: SimpleNavigationController;

  /** History manager instance (optional - will use conversationStore directly if not provided) */
  historyManager?: HistoryManager;

  /** On conversation selected */
  onConversationSelected?: (conversationId: string) => void;
}

/**
 * ConversationListView State
 */
export interface ConversationListViewState {
  /** List of conversations */
  conversations: ConversationListItemData[];

  /** Is loading */
  isLoading: boolean;

  /** Error message */
  error?: string;

  /** Search query */
  searchQuery: string;

  /** Selected conversation IDs */
  selectedIds: Set<string>;

  /** View mode */
  viewMode: 'all' | 'active' | 'archived';

  /** Show delete confirmation dialog */
  showDeleteConfirm: boolean;
}

/**
 * ConversationListView Component
 *
 * Full-screen view for managing conversations.
 * Includes search, filtering, and conversation cards.
 */
export class ConversationListView extends StatefulComponent<
  ConversationListViewProps,
  ConversationListViewState
> {
  // Cache handlers for conversation actions (per Valdi best practices - avoid creating new functions on render)
  private readonly conversationTapHandlers = new Map<string, () => void>();
  private readonly conversationLongPressHandlers = new Map<string, () => void>();

  override state: ConversationListViewState = {
    conversations: [],
    isLoading: true,
    error: undefined,
    searchQuery: '',
    selectedIds: new Set(),
    viewMode: 'all',
    showDeleteConfirm: false,
  };

  async componentDidMount(): Promise<void> {
    await this.loadConversations();
  }

  override onRender() {
    const {
      conversations,
      isLoading,
      error,
      searchQuery,
      selectedIds,
      viewMode,
    } = this.state;

    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Conversations" style={styles.headerTitle} />

          {/* View mode tabs */}
          <view style={styles.tabs}>
            <view
              style={viewMode === 'all' ? styles.tabActive : styles.tab}
              onTap={this.handleViewModeAll}
            >
              <label
                value="All"
                style={
                  viewMode === 'all' ? styles.tabTextActive : styles.tabText
                }
              />
            </view>

            <view
              style={viewMode === 'active' ? styles.tabActive : styles.tab}
              onTap={this.handleViewModeActive}
            >
              <label
                value="Active"
                style={
                  viewMode === 'active' ? styles.tabTextActive : styles.tabText
                }
              />
            </view>

            <view
              style={viewMode === 'archived' ? styles.tabActive : styles.tab}
              onTap={this.handleViewModeArchived}
            >
              <label
                value="Archived"
                style={
                  viewMode === 'archived'
                    ? styles.tabTextActive
                    : styles.tabText
                }
              />
            </view>
          </view>
        </view>

        {/* Search Bar */}
        <view style={styles.searchContainer}>
          <SearchBar
            onSearch={this.handleSearch}
            onClear={this.handleClearSearch}
          />
        </view>

        {/* Content */}
        <view style={styles.content}>
          {isLoading ? (
            <LoadingSpinner size="medium" text="Loading conversations..." />
          ) : error ? (
            <view style={styles.errorContainer}>
              <label value="❌" style={styles.errorIcon} />
              <label value={error} style={styles.errorText} />
            </view>
          ) : conversations.length === 0 ? (
            <view style={styles.emptyContainer}>
              <label value="💬" style={styles.emptyIcon} />
              <label
                value={
                  searchQuery
                    ? 'No conversations found'
                    : 'No conversations yet'
                }
                style={styles.emptyText}
              />
              <label
                value={
                  searchQuery
                    ? 'Try a different search term'
                    : 'Start a new conversation to get started'
                }
                style={styles.emptySubtext}
              />
            </view>
          ) : (
            <scroll style={styles.scrollView}>
              <view style={styles.list}>
                {conversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onTap={this.getConversationTapHandler(conversation.id)}
                    onLongPress={this.getConversationLongPressHandler(conversation.id)}
                    isSelected={selectedIds.has(conversation.id)}
                  />
                ))}
              </view>
            </scroll>
          )}
        </view>

        {/* Selection Actions (if any selected) */}
        {selectedIds.size > 0 && (
          <view style={styles.selectionBar}>
            <label
              value={`${selectedIds.size} selected`}
              style={styles.selectionText}
            />

            <view style={styles.selectionActions}>
              <view
                style={styles.actionButton}
                onTap={this.handleArchiveSelected}
              >
                <label value="Archive" style={styles.actionButtonText} />
              </view>

              <view
                style={styles.actionButton}
                onTap={this.handleDeleteSelected}
              >
                <label value="Delete" style={styles.actionButtonText} />
              </view>

              <view
                style={styles.actionButton}
                onTap={this.handleClearSelection}
              >
                <label value="Cancel" style={styles.actionButtonText} />
              </view>
            </view>
          </view>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isVisible={this.state.showDeleteConfirm}
          title="Delete Conversations"
          message={`Are you sure you want to delete ${this.state.selectedIds.size} conversation${this.state.selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="danger"
          onConfirm={this.confirmDeleteSelected}
          onCancel={this.cancelDeleteConfirmation}
        />
      </view>
    );
  }

  /**
   * Load conversations
   */
  private async loadConversations(): Promise<void> {
    this.setState({ isLoading: true, error: undefined });

    try {
      const { historyManager } = this.viewModel;
      const { viewMode, searchQuery } = this.state;

      let conversations: ConversationListItemData[];

      if (historyManager) {
        // Use historyManager if provided
        if (searchQuery) {
          conversations = await historyManager.search({
            query: searchQuery,
            status: viewMode === 'all' ? undefined : [viewMode],
          });
        } else {
          conversations = await historyManager.getConversations({
            statuses: viewMode === 'all' ? ['active', 'archived'] : [viewMode],
          });
        }
      } else {
        // Fall back to using conversationStore directly
        const allConversations = conversationStore.getAllConversations();
        conversations = allConversations
          .filter((conv) => {
            // Filter by view mode
            if (viewMode !== 'all') {
              if (conv.status !== viewMode) return false;
            }
            // Filter by search query (title only in fallback mode)
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return conv.title.toLowerCase().includes(query);
            }
            return true;
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((conv): ConversationListItemData => ({
            id: conv.id,
            title: conv.title || 'Untitled',
            lastMessagePreview: undefined, // Message preview not available in fallback mode
            lastMessageTime: conv.lastMessageAt ? new Date(conv.lastMessageAt) : new Date(conv.updatedAt),
            isPinned: conv.isPinned,
            status: conv.status,
            unreadCount: 0,
            participantCount: 1,
            model: conv.modelConfig?.modelId,
          }));
      }

      this.setState({ conversations, isLoading: false });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      this.setState({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load conversations',
        isLoading: false,
      });
    }
  }

  /**
   * Handle conversation tap
   */
  private readonly handleConversationTap = (conversationId: string): void => {
    if (this.state.selectedIds.size > 0) {
      // Selection mode - toggle selection
      this.toggleSelection(conversationId);
    } else {
      // Normal mode - navigate to conversation
      if (this.viewModel.onConversationSelected) {
        this.viewModel.onConversationSelected(conversationId);
      }
    }
  };

  /**
   * Handle conversation long press
   */
  private readonly handleConversationLongPress = (conversationId: string): void => {
    this.toggleSelection(conversationId);
  };

  /**
   * Toggle selection
   */
  private toggleSelection(conversationId: string): void {
    const selectedIds = new Set(this.state.selectedIds);

    if (selectedIds.has(conversationId)) {
      selectedIds.delete(conversationId);
    } else {
      selectedIds.add(conversationId);
    }

    this.setState({ selectedIds });
  }

  /**
   * Handle search
   */
  private readonly handleSearch = async (query: string): Promise<void> => {
    this.setState({ searchQuery: query });
    await this.loadConversations();
  };

  /**
   * Handle clear search
   */
  private readonly handleClearSearch = async (): Promise<void> => {
    this.setState({ searchQuery: '' });
    await this.loadConversations();
  };

  /**
   * Handle view mode change
   */
  private readonly handleViewModeChange = async (
    viewMode: 'all' | 'active' | 'archived',
  ): Promise<void> => {
    this.setState({ viewMode });
    await this.loadConversations();
  };

  // Pre-bound handlers for view modes (per Valdi best practices - no inline functions)
  private readonly handleViewModeAll = async () => { await this.handleViewModeChange('all'); };
  private readonly handleViewModeActive = async () => { await this.handleViewModeChange('active'); };
  private readonly handleViewModeArchived = async () => { await this.handleViewModeChange('archived'); };

  // Cached handler getters (per Valdi best practices)
  private getConversationTapHandler(conversationId: string): () => void {
    let handler = this.conversationTapHandlers.get(conversationId);
    if (!handler) {
      handler = () => { this.handleConversationTap(conversationId); };
      this.conversationTapHandlers.set(conversationId, handler);
    }
    return handler;
  }

  private getConversationLongPressHandler(conversationId: string): () => void {
    let handler = this.conversationLongPressHandlers.get(conversationId);
    if (!handler) {
      handler = () => { this.handleConversationLongPress(conversationId); };
      this.conversationLongPressHandlers.set(conversationId, handler);
    }
    return handler;
  }

  /**
   * Handle archive selected
   */
  private readonly handleArchiveSelected = async (): Promise<void> => {
    const { historyManager } = this.viewModel;
    const ids = Array.from(this.state.selectedIds);

    if (historyManager) {
      await historyManager.archiveConversations(ids);
    } else {
      // Fallback: archive each conversation individually via conversationStore
      for (const id of ids) {
        conversationStore.archiveConversation(id);
      }
    }
    this.setState({ selectedIds: new Set() });
    await this.loadConversations();
  };

  /**
   * Handle delete selected
   */
  private readonly handleDeleteSelected = (): void => {
    // Show confirmation dialog before deleting
    this.setState({ showDeleteConfirm: true });
  };

  /**
   * Confirm delete selected conversations
   */
  private readonly confirmDeleteSelected = async (): Promise<void> => {
    const { historyManager } = this.viewModel;
    const ids = Array.from(this.state.selectedIds);

    this.setState({ showDeleteConfirm: false });
    if (historyManager) {
      await historyManager.deleteConversations(ids);
    } else {
      // Fallback: bulk delete via conversationStore
      await conversationStore.bulkDeleteConversations(ids);
    }
    this.setState({ selectedIds: new Set() });
    await this.loadConversations();
  };

  /**
   * Cancel delete confirmation
   */
  private readonly cancelDeleteConfirmation = (): void => {
    this.setState({ showDeleteConfirm: false });
  };

  /**
   * Handle clear selection
   */
  private readonly handleClearSelection = (): void => {
    this.setState({ selectedIds: new Set() });
  };
}

const styles = {
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  headerTitle: new Style<Label>({
    ...Fonts.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  }),

  tabs: new Style<View>({
    flexDirection: 'row',
  }),

  tab: new Style<View>({
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
  }),

  tabActive: new Style<View>({
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLighter,
  }),

  tabText: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.textSecondary,
  }),

  tabTextActive: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.primary,
  }),

  searchContainer: new Style<View>({
    padding: Spacing.base,
    backgroundColor: Colors.background,
  }),

  content: new Style<View>({
    flexGrow: 1,
  }),

  scrollView: new Style<View>({
    flexGrow: 1,
  }),

  list: new Style<View>({
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
    ...Fonts.bodyLarge,
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
    ...Fonts.h3,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  }),

  emptySubtext: new Style<Label>({
    ...Fonts.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  }),

  selectionBar: new Style<View>({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  selectionText: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.textInverse,
  }),

  selectionActions: new Style<View>({
    flexDirection: 'row',
  }),

  actionButton: new Style<View>({
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.sm,
  }),

  actionButtonText: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.textInverse,
  }),
};
