/**
 * ConversationList Connected
 *
 * Connected version of ConversationList that integrates with ConversationStore.
 * Follows SOLID principles with clean separation of concerns.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, ScrollView, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import { Colors, Fonts, Spacing } from '../common/src';
import { Conversation } from '../common/src';
import { LoadingSpinner } from '../common/src';
import { Card } from '../common/src';
import { Button } from '../common/src';
import { ChatIntegrationService } from './ChatIntegrationService';
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

  state: ConversationListConnectedState = {
    conversations: [],
    isLoading: true,
    filter: 'all',
    searchQuery: '',
  };

  async componentDidMount(): Promise<void> {
    await this.loadConversations();

    // Subscribe to updates
    this.unsubscribe = this.props.integrationService.subscribeToConversations(
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

  onRender() {
    const { conversations, isLoading, filter, searchQuery } = this.state;

    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Conversations" style={styles.headerTitle} />

          {/* New Conversation Button */}
          <Button
            title="+ New"
            onPress={this.handleNewConversation}
            variant="primary"
            size="small"
          />
        </view>

        {/* Filter Tabs */}
        <view style={styles.tabs}>
          <view
            style={filter === 'all' ? styles.tabActive : styles.tab}
            onTap={() => this.handleFilterChange('all')}
          >
            <label
              value="All"
              style={filter === 'all' ? styles.tabTextActive : styles.tabText}
            />
          </view>

          <view
            style={filter === 'active' ? styles.tabActive : styles.tab}
            onTap={() => this.handleFilterChange('active')}
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
            onTap={() => this.handleFilterChange('archived')}
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
          <scrollView style={styles.scrollView}>
            <view style={styles.list}>
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  style={styles.conversationCard}
                  onTap={() => this.handleConversationTap(conversation.id)}
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
          </scrollView>
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
      this.props.integrationService.loadConversationsFiltered({
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
  private handleFilterChange = async (
    filter: 'all' | 'active' | 'archived',
  ): Promise<void> => {
    this.setState({ filter });
    await this.loadConversations();
  };

  /**
   * Handle conversation tap
   */
  private handleConversationTap = (conversationId: string): void => {
    this.props.integrationService.navigateToConversation(
      conversationId,
      ChatView,
    );
  };

  /**
   * Handle new conversation
   */
  private handleNewConversation = async (): Promise<void> => {
    await this.props.integrationService.createAndNavigateToConversation(
      'New Conversation',
      ChatView,
    );
  };

  /**
   * Format date
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

const styles = {
  container: new Style<View>({
    flex: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  }),

  headerTitle: new Style<Label>({
    ...Fonts.h2,
    color: Colors.textPrimary,
  }),

  tabs: new Style<View>({
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  }),

  tab: new Style<View>({
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusMd,
  }),

  tabActive: new Style<View>({
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.primary100,
  }),

  tabText: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.textSecondary,
  }),

  tabTextActive: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  }),

  scrollView: new Style<ScrollView>({
    flex: 1,
  }),

  list: new Style<View>({
    padding: Spacing.base,
  }),

  emptyContainer: new Style<View>({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  }),

  emptyIcon: new Style<Label>({
    fontSize: 64,
    marginBottom: Spacing.base,
  }),

  emptyText: new Style<Label>({
    ...Fonts.h3,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  }),

  emptySubtext: new Style<Label>({
    ...Fonts.bodyRegular,
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
    fontWeight: '600',
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
