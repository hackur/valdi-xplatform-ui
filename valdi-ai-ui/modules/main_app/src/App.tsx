/**
 * App - Root Component
 *
 * Main application with simplified navigation system
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemFont } from 'valdi_core/src/SystemFont';
import { SimpleNavigationController, NavigationState } from './SimpleNavigationController';
import { Colors, Fonts, Spacing, SemanticSpacing, BorderRadius, Card } from 'common/src';
import { ChatView } from 'chat_ui/src/ChatView';
import { ConversationList } from 'chat_ui/src/ConversationList';
import { WorkflowDemoScreen } from 'workflow_demo/src/WorkflowDemoScreen';
import { SettingsScreen } from 'settings/src/SettingsScreen';
import { conversationStore } from 'chat_core/src/ConversationStore';

interface AppState {
  navigationState: NavigationState;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export class App extends StatefulComponent<Record<string, never>, AppState> {
  private navigationController = new SimpleNavigationController();

  private features: FeatureCard[] = [
    { id: 'chat', title: 'New Chat', description: 'Start a conversation with AI', icon: '💬' },
    { id: 'conversations', title: 'Conversations', description: 'View and manage your chat history', icon: '📝' },
    { id: 'agents', title: 'AI Agents', description: 'Explore different AI agent workflows', icon: '🤖' },
    { id: 'workflows', title: 'Workflows', description: 'Advanced workflow patterns', icon: '⚡' },
    { id: 'settings', title: 'Settings', description: 'Configure models and preferences', icon: '⚙️' },
  ];

  override state: AppState = (() => {
    this.navigationController.setUpdateCallback((navigationState) => {
      this.setState({ navigationState });
    });
    return {
      navigationState: this.navigationController.getState(),
    };
  })();

  private handleFeatureTap = async (featureId: string): Promise<void> => {
    console.log(`Navigate to: ${featureId}`);

    switch (featureId) {
      case 'chat':
        try {
          const conversation = await conversationStore.createConversation({
            title: 'New Conversation',
            modelConfig: {
              provider: 'openai',
              modelId: 'gpt-4-turbo',
              temperature: 0.7,
              maxTokens: 4096,
            },
          });
          this.navigationController.push(ChatView, {
            navigationController: this.navigationController,
            conversationId: conversation.id,
          }, {});
        } catch (error) {
          console.error('Failed to create conversation:', error);
        }
        break;

      case 'conversations':
        try {
          const conversations = conversationStore.getAllConversations();
          this.navigationController.push(ConversationList, {
            conversations,
            onConversationPress: (conversationId: string) => {
              this.navigationController.push(ChatView, {
                navigationController: this.navigationController,
                conversationId,
              }, {});
            },
          }, {});
        } catch (error) {
          console.error('Failed to navigate to conversation list:', error);
        }
        break;

      case 'workflows':
      case 'agents':
        this.navigationController.push(WorkflowDemoScreen, {}, {});
        break;

      case 'settings':
        this.navigationController.push(SettingsScreen, {
          navigationController: this.navigationController,
        }, {});
        break;

      default:
        console.warn(`Unknown feature: ${featureId}`);
    }
  };

  override onRender() {
    const { currentPage: CurrentPage, pageProps } = this.state.navigationState;

    // Render HomePage inline with feature buttons
    if (!CurrentPage) {
      return (
        <view style={new Style<View>({
          flexGrow: 1,
          backgroundColor: '#F9FAFB',
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 40,
        })}>
          {/* Header */}
          <label value="Valdi AI" style={new Style<Label>({ font: systemFont(32), color: '#111827' })} />
          <label value="Open Source AI Chat Client" style={new Style<Label>({ font: systemFont(16), color: '#6B7280', marginTop: 8 })} />

          {/* Welcome */}
          <view style={new Style<View>({ marginTop: 24, marginBottom: 24, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8 })}>
            <label value="Welcome! 👋" style={new Style<Label>({ font: systemFont(20), color: '#111827' })} />
            <label value="Explore AI with multiple providers and workflows" style={new Style<Label>({ font: systemFont(14), color: '#6B7280', marginTop: 8 })} />
          </view>

          <label value="Features" style={new Style<Label>({ font: systemFont(20), color: '#111827', marginBottom: 12 })} />

          {/* New Chat Button */}
          <view
            onTap={() => this.handleFeatureTap('chat')}
            style={new Style<View>({ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 12 })}
          >
            <label value="💬  New Chat" style={new Style<Label>({ font: systemFont(18), color: '#111827' })} />
            <label value="Start a conversation with AI" style={new Style<Label>({ font: systemFont(14), color: '#6B7280', marginTop: 4 })} />
          </view>

          {/* Conversations Button */}
          <view
            onTap={() => this.handleFeatureTap('conversations')}
            style={new Style<View>({ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 12 })}
          >
            <label value="📝  Conversations" style={new Style<Label>({ font: systemFont(18), color: '#111827' })} />
            <label value="View and manage your chat history" style={new Style<Label>({ font: systemFont(14), color: '#6B7280', marginTop: 4 })} />
          </view>

          {/* Workflows Button */}
          <view
            onTap={() => this.handleFeatureTap('workflows')}
            style={new Style<View>({ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 12 })}
          >
            <label value="⚡  Workflows" style={new Style<Label>({ font: systemFont(18), color: '#111827' })} />
            <label value="Advanced workflow patterns" style={new Style<Label>({ font: systemFont(14), color: '#6B7280', marginTop: 4 })} />
          </view>

          {/* Settings Button */}
          <view
            onTap={() => this.handleFeatureTap('settings')}
            style={new Style<View>({ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 12 })}
          >
            <label value="⚙️  Settings" style={new Style<Label>({ font: systemFont(18), color: '#111827' })} />
            <label value="Configure models and preferences" style={new Style<Label>({ font: systemFont(14), color: '#6B7280', marginTop: 4 })} />
          </view>
        </view>
      );
    }

    // Render navigated page with back button
    return (
      <view style={new Style<View>({ flexGrow: 1, backgroundColor: Colors.background })}>
        {/* Back Button Header */}
        <view style={new Style<View>({
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 50,
          paddingBottom: 16,
          backgroundColor: '#FFFFFF',
        })}>
          <view
            onTap={() => this.navigationController.pop()}
            style={new Style<View>({ flexDirection: 'row', alignItems: 'center' })}
          >
            <label value="← Back" style={new Style<Label>({ font: systemFont(18), color: '#3B82F6' })} />
          </view>
        </view>

        {/* Page Content */}
        <CurrentPage {...pageProps} />
      </view>
    );
  }
}
