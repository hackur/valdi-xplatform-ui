/**
 * ConversationList Connected
 *
 * Connected version of ConversationList that integrates with ConversationStore.
 * Follows SOLID principles with clean separation of concerns.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import type { NavigationController } from 'valdi_navigation/src/NavigationController';
import { Colors, Fonts, Spacing, BorderRadius } from '../../common/src/index';
import type { Conversation } from '../../common/src/index';
import { LoadingSpinner } from '../../common/src/index';
import { Card } from '../../common/src/index';
import { Button } from '../../common/src/index';
import { systemFont } from 'valdi_core/src/SystemFont';
import type { ChatIntegrationService } from './ChatIntegrationService';
import { ChatView } from './ChatView';

/**
 * ConversationListConnected Props
 */
export interface ConversationListConnectedProps {
  navigationController: NavigationController;
  integrationService: ChatIntegrationService;
}

/**
 * ConversationListConnected State
 */
export interface ConversationListConnectedState {
  conversations: Conversation[];
  isLoading: boolean;
  filter: 'all' | 'active' | 'archived';
  searchQuery: string;
}

/**
 * ConversationListConnected Component
 *
 * Reactive component that subscribes to ConversationStore updates.
 */
export class ConversationListConnected extends StatefulComponent<
  ConversationListConnectedProps,
  ConversationListConnectedState
> {
  private unsubscribe?: () => void;
  // Cache handlers for conversation taps (per Valdi best practices - avoid creating new functions on render)
  private readonly conversationTapHandlers = new Map<string, () => void>();

  override state: ConversationListConnectedState = {
    conversations: [],
    isLoading: true,
    filter: 'all',
    searchQuery: '',
  };

  async componentDidMount(): Promise<void> {
    await this.loadConversations();

    // Subscribe to updates
    this.unsubscribe = this.viewModel.integrationService.subscribeToConversations(
      (conversations) => {
        this.setState({
          conversations: this.filterConversations(conversations),
          isLoading: false,
        });
      },
    );
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  override onRender() {
    const { conversations, isLoading, filter } = this.state;

    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Conversations" style={styles.headerTitle} />

          {/* New Conversation Button */}
          <Button
            title="+ New"
            onTap={this.handleNewConversation}
            variant="primary"
            size="small"
          />
        </view>

        {/* Filter Tabs */}
        <view style={styles.tabs}>
          <view
            style={filter === 'all' ? styles.tabActive : styles.tab}
            onTap={this.handleFilterAll}
          >
            <label
              value="All"
              style={filter === 'all' ? styles.tabTextActive : styles.tabText}
            />
          </view>

          <view
            style={filter === 'active' ? styles.tabActive : styles.tab}
            onTap={this.handleFilterActive}
          >
            <label
              value="Active"
              style={
                filter === 'active' ? styles.tabTextActive : styles.tabText
              }
            />
          </view>

          <view
            style={filter === 'archived' ? styles.tabActive : styles.tab}
            onTap={this.handleFilterArchived}
          >
            <label
              value="Archived"
              style={
                filter === 'archived' ? styles.tabTextActive : styles.tabText
              }
            />
          </view>
        </view>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner size="medium" text="Loading conversations..." />
        ) : conversations.length === 0 ? (
          <view style={styles.emptyContainer}>
            <label value="💬" style={styles.emptyIcon} />
            <label value="No conversations yet" style={styles.emptyText} />
            <label
              value="Tap 'New' to start a conversation"
              style={styles.emptySubtext}
            />
          </view>
        ) : (
          <scroll style={styles.scrollView}>
            <view style={styles.list}>
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  style={styles.conversationCard as unknown as Record<string, unknown>}
                  onTap={this.getConversationTapHandler(conversation.id)}
                >
                  <view style={styles.conversationContent}>
                    <label
                      value={conversation.title || 'Untitled'}
                      style={styles.title}
                    />
                    <label
                      value={this.formatDate(conversation.updatedAt)}
                      style={styles.date}
                    />
                    {conversation.messageCount !== undefined && (
                      <label
                        value={`${conversation.messageCount} messages`}
                        style={styles.messageCount}
                      />
                    )}
                  </view>
                </Card>
              ))}
            </view>
          </scroll>
        )}
      </view>
    );
  }

  /**
   * Load conversations
   */
  private async loadConversations(): Promise<void> {
    this.setState({ isLoading: true });

    const conversations =
      this.viewModel.integrationService.loadConversationsFiltered({
        status: this.state.filter === 'all' ? undefined : this.state.filter,
        searchQuery: this.state.searchQuery || undefined,
      });

    this.setState({
      conversations,
      isLoading: false,
    });
  }

  /**
   * Filter conversations
   */
  private filterConversations(conversations: Conversation[]): Conversation[] {
    const { filter, searchQuery } = this.state;

    let filtered = conversations;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter((c) => c.status === filter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.metadata?.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Sort by updated date (most recent first)
    return filtered.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  /**
   * Handle filter change
   */
  private readonly handleFilterChange = async (
    filter: 'all' | 'active' | 'archived',
  ): Promise<void> => {
    this.setState({ filter });
    await this.loadConversations();
  };

  // Pre-bound handlers for each filter type (per Valdi best practices - no inline functions)
  private readonly handleFilterAll = async () => { await this.handleFilterChange('all'); };
  private readonly handleFilterActive = async () => { await this.handleFilterChange('active'); };
  private readonly handleFilterArchived = async () => { await this.handleFilterChange('archived'); };

  /**
   * Handle conversation tap
   */
  private readonly handleConversationTap = (conversationId: string): void => {
    this.viewModel.integrationService.navigateToConversation(
      conversationId,
      ChatView,
    );
  };

  /**
   * Get cached handler for conversation tap (per Valdi best practices)
   */
  private getConversationTapHandler(conversationId: string): () => void {
    let handler = this.conversationTapHandlers.get(conversationId);
    if (!handler) {
      handler = () => { this.handleConversationTap(conversationId); };
      this.conversationTapHandlers.set(conversationId, handler);
    }
    return handler;
  }

  /**
   * Handle new conversation
   */
  private readonly handleNewConversation = async (): Promise<void> => {
    await this.viewModel.integrationService.createAndNavigateToConversation(
      'New Conversation',
      ChatView,
    );
  };

  /**
   * Format date
   */
  private formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  }
}

const styles = {
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  headerTitle: new Style<Label>({
    ...Fonts.h2,
    color: Colors.textPrimary,
  }),

  tabs: new Style<View>({
    flexDirection: 'row',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
  }),

  tab: new Style<View>({
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
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

  scrollView: new Style<View>({
    flexGrow: 1,
  }),

  list: new Style<View>({
    padding: Spacing.base,
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

  conversationCard: new Style<View>({
    marginBottom: Spacing.sm,
  }),

  conversationContent: new Style<View>({
    padding: Spacing.sm,
  }),

  title: new Style<Label>({
    ...Fonts.bodyLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  }),

  date: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  }),

  messageCount: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
  }),
};
