/**
 * HomePage - Main Landing Page
 *
 * The main landing page of the application.
 * Displays navigation options to different features.
 */

import { NavigationPageComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  BorderRadius,
  Button,
  Card,
} from '@common';

// Screen Imports
import { ChatView } from '@chat_ui/ChatView';
import { ConversationList } from '@chat_ui/ConversationList';
import { ToolsDemoScreen } from '@tools_demo/ToolsDemoScreen';
import { WorkflowDemoScreen } from '@workflow_demo/WorkflowDemoScreen';
import { SettingsScreen } from '@settings/SettingsScreen';

// Store Imports
import { conversationStore } from '@chat_core/ConversationStore';

/**
 * HomePage Props
 */
export interface HomePageProps {
  navigationController: NavigationController;
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
export class HomePage extends NavigationPageComponent<HomePageProps> {
  private features: FeatureCard[] = [
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

  private handleFeatureTap = async (feature: FeatureCard): Promise<void> => {
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
        // TODO: Navigate to AI Agents screen when implemented
        console.log('AI Agents screen not yet implemented');
        break;

      default:
        console.warn(`Unknown feature: ${feature.id}`);
    }
  };

  /**
   * Navigate to a new chat conversation
   */
  private navigateToNewChat = async (): Promise<void> => {
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
      });
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  /**
   * Navigate to ConversationList
   */
  private navigateToConversationList = async (): Promise<void> => {
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
          });
        },
      });
    } catch (error) {
      console.error('Failed to navigate to conversation list:', error);
    }
  };

  /**
   * Navigate to ToolsDemoScreen
   */
  private navigateToToolsDemo = (): void => {
    this.viewModel.navigationController.push(ToolsDemoScreen, {});
  };

  /**
   * Navigate to WorkflowDemoScreen
   */
  private navigateToWorkflowsDemo = (): void => {
    this.viewModel.navigationController.push(WorkflowDemoScreen, {});
  };

  /**
   * Navigate to SettingsScreen
   */
  private navigateToSettings = (): void => {
    this.viewModel.navigationController.push(SettingsScreen, {
      navigationController: this.viewModel.navigationController,
    });
  };

  private renderFeatureCard = (feature: FeatureCard) => {
    return (
      <Card
        key={feature.id}
        elevation="sm"
        onTap={() => this.handleFeatureTap(feature)}
        style={styles.featureCard}
      >
        <view style={styles.featureContent}>
          {/* Icon */}
          <view style={styles.featureIcon}>
            <label
              value={feature.icon}
              style={{
                fontSize: 32,
              }}
            />
          </view>

          {/* Content */}
          <view style={styles.featureText}>
            <label
              value={feature.title}
              style={{
                ...Fonts.h4,
                color: Colors.textPrimary,
              }}
            />
            <label
              value={feature.description}
              style={{
                ...Fonts.bodySmall,
                color: Colors.textSecondary,
                marginTop: Spacing.xs,
              }}
            />
          </view>
        </view>
      </Card>
    );
  };

  onRender() {
    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label
            value="Valdi AI"
            style={{
              ...Fonts.h1,
              color: Colors.textPrimary,
            }}
          />
          <label
            value="Open Source AI Chat Client"
            style={{
              ...Fonts.body,
              color: Colors.textSecondary,
              marginTop: Spacing.xs,
            }}
          />
        </view>

        {/* Welcome Card */}
        <Card elevation="md" style={styles.welcomeCard}>
          <view>
            <label
              value="Welcome! 👋"
              style={{
                ...Fonts.h3,
                color: Colors.textPrimary,
              }}
            />
            <label
              value="Explore the power of AI with multiple providers, agent workflows, and tool calling capabilities."
              style={{
                ...Fonts.body,
                color: Colors.textSecondary,
                marginTop: Spacing.sm,
                lineHeight: 1.5,
              }}
            />
          </view>
        </Card>

        {/* Features Grid */}
        <view style={styles.featuresSection}>
          <label
            value="Features"
            style={{
              ...Fonts.h3,
              color: Colors.textPrimary,
              marginBottom: Spacing.base,
            }}
          />

          <view style={styles.featuresGrid}>
            {this.features.map((feature) => this.renderFeatureCard(feature))}
          </view>
        </view>

        {/* Footer */}
        <view style={styles.footer}>
          <label
            value="Built with Valdi & AI SDK v5"
            style={{
              ...Fonts.caption,
              color: Colors.textTertiary,
              textAlign: 'center',
            }}
          />
        </view>
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: SemanticSpacing.screenPaddingHorizontal,
    paddingVertical: SemanticSpacing.screenPaddingVertical,
  }),

  header: new Style<View>({
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xl,
  }),

  welcomeCard: new Style<View>({
    marginBottom: Spacing.xxl,
  }),

  featuresSection: new Style<View>({
    flex: 1,
  }),

  featuresGrid: new Style<View>({
    flexDirection: 'column',
    gap: Spacing.base,
  }),

  featureCard: new Style<View>({
    width: '100%',
  }),

  featureContent: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  }),

  featureIcon: new Style<View>({
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLighter,
    borderRadius: BorderRadius.md,
  }),

  featureText: new Style<View>({
    flex: 1,
  }),

  footer: new Style<View>({
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  }),
};
