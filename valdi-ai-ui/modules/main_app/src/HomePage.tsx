/**
 * HomePage - Main Landing Page
 *
 * The main landing page of the application.
 * Displays navigation options to different features.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemFont } from 'valdi_core/src/SystemFont';
import type { SimpleNavigationController } from './SimpleNavigationController';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  BorderRadius,
  Card,
} from '../../common/src/index';

// Screen Imports
import { ChatView } from '../../chat_ui/src/ChatView';
import { ConversationList } from '../../chat_ui/src/ConversationList';
// import { ToolsDemoScreen } from '../../tools_demo/src/ToolsDemoScreen'; // Excluded from build
import { WorkflowDemoScreen } from '../../workflow_demo/src/WorkflowDemoScreen';
import { SettingsScreen } from '../../settings/src/SettingsScreen';

// Store Imports
import { conversationStore } from '../../chat_core/src/ConversationStore';

/**
 * HomePage Props
 */
export interface HomePageProps {
  navigationController: SimpleNavigationController;
}

/**
 * Feature Card Data
 */
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
}

/**
 * HomePage Component
 */
export class HomePage extends Component<HomePageProps> {
  // Cache handlers for feature card taps (per Valdi best practices)
  private readonly featureTapHandlers = new Map<string, () => Promise<void>>();

  private readonly features: FeatureCard[] = [
    {
      id: 'chat',
      title: 'New Chat',
      description: 'Start a conversation with AI',
      icon: '💬',
      route: '/chat',
    },
    {
      id: 'conversations',
      title: 'Conversations',
      description: 'View and manage your chat history',
      icon: '📝',
      route: '/conversations',
    },
    {
      id: 'agents',
      title: 'AI Agents',
      description: 'Explore different AI agent workflows',
      icon: '🤖',
      route: '/agents',
    },
    {
      id: 'tools',
      title: 'Tool Calling',
      description: 'See AI tools in action',
      icon: '🔧',
      route: '/tools',
    },
    {
      id: 'workflows',
      title: 'Workflows',
      description: 'Advanced workflow patterns',
      icon: '⚡',
      route: '/workflows',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure models and preferences',
      icon: '⚙️',
      route: '/settings',
    },
  ];

  // Cached handler getter (per Valdi best practices)
  private getFeatureTapHandler(feature: FeatureCard): () => Promise<void> {
    let handler = this.featureTapHandlers.get(feature.id);
    if (!handler) {
      handler = async () => { await this.handleFeatureTap(feature); };
      this.featureTapHandlers.set(feature.id, handler);
    }
    return handler;
  }

  private readonly handleFeatureTap = async (feature: FeatureCard): Promise<void> => {
    console.log(`Navigate to: ${feature.route}`);

    switch (feature.id) {
      case 'chat':
        // Create a new conversation and navigate to ChatView
        await this.navigateToNewChat();
        break;

      case 'conversations':
        // Navigate to ConversationList
        await this.navigateToConversationList();
        break;

      case 'tools':
        // Navigate to ToolsDemoScreen
        this.navigateToToolsDemo();
        break;

      case 'workflows':
        // Navigate to WorkflowDemoScreen
        this.navigateToWorkflowsDemo();
        break;

      case 'settings':
        // Navigate to SettingsScreen
        this.navigateToSettings();
        break;

      case 'agents':
        // Navigate to WorkflowDemoScreen (demonstrates AI agent workflows)
        this.navigateToWorkflowsDemo();
        break;

      default:
        console.warn(`Unknown feature: ${feature.id}`);
    }
  };

  /**
   * Navigate to a new chat conversation
   */
  private readonly navigateToNewChat = async (): Promise<void> => {
    try {
      // Create a new conversation
      const conversation = await conversationStore.createConversation({
        title: 'New Conversation',
        modelConfig: {
          provider: 'openai',
          modelId: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4096,
        },
      });

      // Navigate to ChatView with the new conversation ID
      this.viewModel.navigationController.push(ChatView, {
        navigationController: this.viewModel.navigationController,
        conversationId: conversation.id,
      }, {});
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  /**
   * Navigate to ConversationList
   */
  private readonly navigateToConversationList = async (): Promise<void> => {
    try {
      // Get all conversations from the store
      const conversations = conversationStore.getAllConversations();

      // Navigate to ConversationList with conversations
      this.viewModel.navigationController.push(ConversationList, {
        conversations,
        onConversationPress: (conversationId: string) => {
          // Navigate to ChatView when a conversation is selected
          this.viewModel.navigationController.push(ChatView, {
            navigationController: this.viewModel.navigationController,
            conversationId,
          }, {});
        },
      }, {});
    } catch (error) {
      console.error('Failed to navigate to conversation list:', error);
    }
  };

  /**
   * Navigate to ToolsDemoScreen
   */
  private readonly navigateToToolsDemo = (): void => {
    // ToolsDemoScreen excluded from build - requires 'ai' and 'zod' dependencies
    console.log('Tools demo temporarily unavailable');
    // this.viewModel.navigationController.push(ToolsDemoScreen, {}, {});
  };

  /**
   * Navigate to WorkflowDemoScreen
   */
  private readonly navigateToWorkflowsDemo = (): void => {
    this.viewModel.navigationController.push(WorkflowDemoScreen, {}, {});
  };

  /**
   * Navigate to SettingsScreen
   */
  private readonly navigateToSettings = (): void => {
    this.viewModel.navigationController.push(SettingsScreen, {
      navigationController: this.viewModel.navigationController,
    }, {});
  };

  private readonly renderFeatureCard = (feature: FeatureCard) => {
    return (
      <Card
        key={feature.id}
        elevation="sm"
        onTap={this.getFeatureTapHandler(feature)}
        style={styles.featureCard}
      >
        <view style={styles.featureContent}>
          {/* Icon */}
          <view style={styles.featureIcon}>
            <label
              value={feature.icon}
              style={styles.featureIconLabel}
            />
          </view>

          {/* Content */}
          <view style={styles.featureText}>
            <label
              value={feature.title}
              style={styles.featureTitle}
            />
            <label
              value={feature.description}
              style={styles.featureDescription}
            />
          </view>
        </view>
      </Card>
    );
  };

  override onRender() {
    return (
      <view style={styles.container}>
        {/* Header Section */}
        <view style={styles.header}>
          <label value="Valdi AI" style={styles.headerTitle} />
          <label
            value="Open Source AI Chat Client"
            style={styles.headerSubtitle}
          />
        </view>

        {/* Welcome Card */}
        <Card elevation="sm" style={styles.welcomeCard}>
          <label value="Welcome! 👋" style={styles.welcomeTitle} />
          <label
            value="Explore AI capabilities with multiple providers, advanced workflows, and intelligent agents."
            style={styles.welcomeMessage}
          />
        </Card>

        {/* Features Section */}
        <view style={styles.featuresSection}>
          <label value="Features" style={styles.featuresTitle} />
          <view style={styles.featuresGrid}>
            {this.features.map((feature) => this.renderFeatureCard(feature))}
          </view>
        </view>

        {/* Footer */}
        <view style={styles.footer}>
          <label
            value="Built with Valdi Framework"
            style={styles.footerText}
          />
        </view>
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: Colors.background,
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: SemanticSpacing.screenPaddingVertical,
    paddingBottom: SemanticSpacing.screenPaddingVertical,
  }),

  header: new Style<View>({
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xl,
  }),

  headerTitle: new Style<Label>({
    ...Fonts.h1,
    color: Colors.textPrimary,
  }),

  headerSubtitle: new Style<Label>({
    ...Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  }),

  welcomeCard: new Style<View>({
    marginBottom: Spacing.xxl,
  }),

  welcomeTitle: new Style<Label>({
    ...Fonts.h3,
    color: Colors.textPrimary,
  }),

  welcomeMessage: new Style<Label>({
    ...Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 1.5,
  }),

  featuresSection: new Style<View>({
    flexGrow: 1,
  }),

  featuresTitle: new Style<Label>({
    ...Fonts.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  }),

  featuresGrid: new Style<View>({
    flexDirection: 'column',
  }),

  featureCard: new Style<View>({
    width: '100%',
  }),

  featureContent: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
  }),

  featureIcon: new Style<View>({
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLighter,
    borderRadius: BorderRadius.md,
  }),

  featureIconLabel: new Style<Label>({
    font: systemFont(32),
  }),

  featureText: new Style<View>({
    flexGrow: 1,
  }),

  featureTitle: new Style<Label>({
    ...Fonts.h4,
    color: Colors.textPrimary,
  }),

  featureDescription: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  }),

  footer: new Style<View>({
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  }),

  footerText: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  }),
};
