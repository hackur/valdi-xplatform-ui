/**
 * App - Root Component
 * Simplified navigation with explicit conditional rendering (required by Valdi)
 *
 * Note: Valdi compiles TSX to native views at compile time, so we cannot
 * use dynamic component references. Instead, we must explicitly render
 * each screen based on a string identifier.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import { Colors } from '../../common/src/index';
import type { SimpleNavigationController, ScreenId } from '../../common/src/index';
import { SettingsScreen } from '../../settings/src/SettingsScreen';
import { WorkflowDemoScreen } from '../../workflow_demo/src/WorkflowDemoScreen';
import { ConversationListView } from '../../conversation_manager/src/ConversationListView';
import { ChatView } from '../../chat_ui/src/ChatView';

const baseStyles = {
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  }),
  scroll: new Style<ScrollView>({
    flexGrow: 1,
    paddingTop: 60,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
  }),
  title: new Style<Label>({
    font: systemBoldFont(32),
    color: '#000000',
  }),
  subtitle: new Style<Label>({
    font: systemFont(16),
    color: '#666666',
    marginTop: 8,
  }),
  welcomeCard: new Style<View>({
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  }),
  welcomeText: new Style<Label>({
    font: systemBoldFont(20),
    color: '#000000',
  }),
  // Buttons with background colors baked in
  buttonPrimary: new Style<View>({
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#007AFF', // Primary blue
  }),
  buttonSecondary: new Style<View>({
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#5856D6', // Secondary purple
  }),
  buttonSuccess: new Style<View>({
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#34C759', // Success green
  }),
  buttonWarning: new Style<View>({
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FF9500', // Warning orange
  }),
  buttonTitle: new Style<Label>({
    font: systemBoldFont(18),
    color: '#FFFFFF',
  }),
  buttonSubtitle: new Style<Label>({
    font: systemFont(14),
    color: '#E0E7FF',
    marginTop: 4,
  }),
  pageContainer: new Style<View>({
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  }),
  headerBar: new Style<View>({
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  }),
  backButton: new Style<View>({
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 0,
    paddingRight: 16,
  }),
  backLabel: new Style<Label>({
    font: systemBoldFont(17),
    color: '#007AFF',
  }),
  pageTitle: new Style<Label>({
    font: systemBoldFont(17),
    color: '#000000',
    flexGrow: 1,
    textAlign: 'center',
    marginRight: 60, // Balance for back button
  }),
};

interface AppState {
  currentScreen: ScreenId;
}

// Re-export for backward compatibility
export type { SimpleNavigationController as NavigationController } from '../../common/src/index';

export class App extends StatefulComponent<Record<string, never>, AppState> {
  override state: AppState = {
    currentScreen: 'home',
  };

  // Event handlers - must be defined BEFORE navigationController (Valdi best practice)
  private readonly handleBackTap = (): void => {
    this.setState({ currentScreen: 'home' });
  };

  private readonly handleNavigate = (screen: ScreenId): void => {
    this.setState({ currentScreen: screen });
  };

  private readonly handleSettingsTap = (): void => {
    this.setState({ currentScreen: 'settings' });
  };

  private readonly handleWorkflowsTap = (): void => {
    this.setState({ currentScreen: 'workflows' });
  };

  private readonly handleConversationsTap = (): void => {
    this.setState({ currentScreen: 'conversations' });
  };

  private readonly handleNewChatTap = (): void => {
    this.setState({ currentScreen: 'chat' });
  };

  // Navigation controller passed to child screens (defined after handlers)
  private readonly navigationController: SimpleNavigationController = {
    goBack: this.handleBackTap,
    navigateTo: this.handleNavigate,
  };

  private getScreenTitle(): string {
    switch (this.state.currentScreen) {
      case 'settings':
        return 'Settings';
      case 'workflows':
        return 'Workflows';
      case 'conversations':
        return 'Conversations';
      case 'chat':
        return 'Chat';
      default:
        return '';
    }
  }

  override onRender() {
    const { currentScreen } = this.state;

    // Home screen
    if (currentScreen === 'home') {
      return (
        <view style={baseStyles.container}>
          <scroll style={baseStyles.scroll}>
            <label value="Valdi AI" style={baseStyles.title} />
            <label value="Open Source AI Chat Client" style={baseStyles.subtitle} />

            <view style={baseStyles.welcomeCard}>
              <label value="Welcome!" style={baseStyles.welcomeText} />
            </view>

            <view onTap={this.handleSettingsTap} style={baseStyles.buttonPrimary}>
              <label value="Settings" style={baseStyles.buttonTitle} />
              <label value="Configure models and preferences" style={baseStyles.buttonSubtitle} />
            </view>

            <view onTap={this.handleWorkflowsTap} style={baseStyles.buttonSecondary}>
              <label value="Workflows" style={baseStyles.buttonTitle} />
              <label value="AI workflow patterns demo" style={baseStyles.buttonSubtitle} />
            </view>

            <view onTap={this.handleConversationsTap} style={baseStyles.buttonSuccess}>
              <label value="Conversations" style={baseStyles.buttonTitle} />
              <label value="View chat history" style={baseStyles.buttonSubtitle} />
            </view>

            <view onTap={this.handleNewChatTap} style={baseStyles.buttonWarning}>
              <label value="New Chat" style={baseStyles.buttonTitle} />
              <label value="Start a new AI conversation" style={baseStyles.buttonSubtitle} />
            </view>
          </scroll>
        </view>
      );
    }

    // All other screens share the same container with header
    return (
      <view style={baseStyles.pageContainer}>
        <view style={baseStyles.headerBar}>
          <view onTap={this.handleBackTap} style={baseStyles.backButton}>
            <label value="← Back" style={baseStyles.backLabel} />
          </view>
          <label value={this.getScreenTitle()} style={baseStyles.pageTitle} />
        </view>

        {/* Explicit conditional rendering for each screen (required by Valdi) */}
        {currentScreen === 'settings' && (
          <SettingsScreen navigationController={this.navigationController} />
        )}
        {currentScreen === 'workflows' && (
          <WorkflowDemoScreen navigationController={this.navigationController} />
        )}
        {currentScreen === 'conversations' && (
          <ConversationListView navigationController={this.navigationController} />
        )}
        {currentScreen === 'chat' && (
          <ChatView navigationController={this.navigationController} />
        )}
      </view>
    );
  }
}
