/**
 * SettingsScreen - Application Settings
 *
 * Comprehensive settings screen with sections for:
 * - AI Provider selection (OpenAI, Anthropic, Google)
 * - API key management (secure input fields)
 * - Default model selection per provider
 * - App preferences (theme, notifications)
 * - About section
 */

import { NavigationPageStatefulComponent } from 'valdi_core/src/Component';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  Button,
  Card,
  ErrorBoundary,
  ErrorScreen,
} from 'common/src';
import { ApiKeyStore, AIProvider } from './ApiKeyStore';
import { PreferencesStore } from './PreferencesStore';
import { TextInput } from './components/TextInput';
import { Switch } from './components/Switch';
import { Dropdown } from './components/Dropdown';

/**
 * SettingsScreen Props
 */
export interface SettingsScreenProps {
  navigationController: NavigationController;
}

/**
 * SettingsScreen State
 */
interface SettingsScreenState {
  // AI Provider Settings
  selectedProvider: AIProvider;

  // API Keys
  openAiKey: string;
  anthropicKey: string;
  googleKey: string;

  // Show/Hide API Keys
  showOpenAiKey: boolean;
  showAnthropicKey: boolean;
  showGoogleKey: boolean;

  // Default Models
  openAiModel: string;
  anthropicModel: string;
  googleModel: string;

  // App Preferences
  darkMode: boolean;
  enableNotifications: boolean;
  enableSoundEffects: boolean;

  // UI State
  isSaving: boolean;
  saveMessage: string;
}

/**
 * SettingsScreen Component
 */
export class SettingsScreen extends NavigationPageStatefulComponent<
  SettingsScreenProps,
  SettingsScreenState
> {
  private apiKeyStore: ApiKeyStore;
  private preferencesStore: PreferencesStore;

  constructor(props: SettingsScreenProps) {
    super(props);

    this.apiKeyStore = new ApiKeyStore();
    this.preferencesStore = new PreferencesStore();

    // Initialize state
    this.state = {
      selectedProvider: 'openai',
      openAiKey: '',
      anthropicKey: '',
      googleKey: '',
      showOpenAiKey: false,
      showAnthropicKey: false,
      showGoogleKey: false,
      openAiModel: 'gpt-4-turbo-preview',
      anthropicModel: 'claude-3-opus-20240229',
      googleModel: 'gemini-pro',
      darkMode: false,
      enableNotifications: true,
      enableSoundEffects: true,
      isSaving: false,
      saveMessage: '',
    };
  }

  override async onMount() {
    await this.loadSettings();
  }

  private loadSettings = async (): Promise<void> => {
    try {
      // Load API keys
      const openAiKey = await this.apiKeyStore.getApiKey('openai');
      const anthropicKey = await this.apiKeyStore.getApiKey('anthropic');
      const googleKey = await this.apiKeyStore.getApiKey('google');

      // Load preferences
      const preferences = await this.preferencesStore.getPreferences();

      this.setState({
        openAiKey: openAiKey || '',
        anthropicKey: anthropicKey || '',
        googleKey: googleKey || '',
        selectedProvider: preferences.selectedProvider || 'openai',
        openAiModel: preferences.openAiModel || 'gpt-4-turbo-preview',
        anthropicModel: preferences.anthropicModel || 'claude-3-opus-20240229',
        googleModel: preferences.googleModel || 'gemini-pro',
        darkMode: preferences.darkMode ?? false,
        enableNotifications: preferences.enableNotifications ?? true,
        enableSoundEffects: preferences.enableSoundEffects ?? true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  private handleProviderChange = (provider: AIProvider): void => {
    this.setState({ selectedProvider: provider });
  };

  private handleApiKeyChange = (provider: AIProvider, value: string): void => {
    switch (provider) {
      case 'openai':
        this.setState({ openAiKey: value });
        break;
      case 'anthropic':
        this.setState({ anthropicKey: value });
        break;
      case 'google':
        this.setState({ googleKey: value });
        break;
    }
  };

  private toggleKeyVisibility = (provider: AIProvider): void => {
    switch (provider) {
      case 'openai':
        this.setState({ showOpenAiKey: !this.state.showOpenAiKey });
        break;
      case 'anthropic':
        this.setState({ showAnthropicKey: !this.state.showAnthropicKey });
        break;
      case 'google':
        this.setState({ showGoogleKey: !this.state.showGoogleKey });
        break;
    }
  };

  private handleModelChange = (provider: AIProvider, model: string): void => {
    switch (provider) {
      case 'openai':
        this.setState({ openAiModel: model });
        break;
      case 'anthropic':
        this.setState({ anthropicModel: model });
        break;
      case 'google':
        this.setState({ googleModel: model });
        break;
    }
  };

  private handleSaveSettings = async (): Promise<void> => {
    this.setState({ isSaving: true, saveMessage: '' });

    try {
      // Save API keys
      if (this.state.openAiKey) {
        await this.apiKeyStore.setApiKey('openai', this.state.openAiKey);
      }
      if (this.state.anthropicKey) {
        await this.apiKeyStore.setApiKey('anthropic', this.state.anthropicKey);
      }
      if (this.state.googleKey) {
        await this.apiKeyStore.setApiKey('google', this.state.googleKey);
      }

      // Save preferences to persistent storage
      await this.preferencesStore.savePreferences({
        selectedProvider: this.state.selectedProvider,
        openAiModel: this.state.openAiModel,
        anthropicModel: this.state.anthropicModel,
        googleModel: this.state.googleModel,
        darkMode: this.state.darkMode,
        enableNotifications: this.state.enableNotifications,
        enableSoundEffects: this.state.enableSoundEffects,
      });

      this.setState({
        isSaving: false,
        saveMessage: 'Settings saved successfully!',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.setState({ saveMessage: '' });
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.setState({
        isSaving: false,
        saveMessage: 'Failed to save settings',
      });
    }
  };

  private handleClearApiKey = async (provider: AIProvider): Promise<void> => {
    try {
      await this.apiKeyStore.clearApiKey(provider);

      switch (provider) {
        case 'openai':
          this.setState({ openAiKey: '' });
          break;
        case 'anthropic':
          this.setState({ anthropicKey: '' });
          break;
        case 'google':
          this.setState({ googleKey: '' });
          break;
      }
    } catch (error) {
      console.error(`Failed to clear ${provider} API key:`, error);
    }
  };

  private renderProviderSection = () => {
    const providers: Array<{ id: AIProvider; name: string; icon: string }> = [
      { id: 'openai', name: 'OpenAI', icon: '🤖' },
      { id: 'anthropic', name: 'Anthropic', icon: '🧠' },
      { id: 'google', name: 'Google AI', icon: '🔍' },
    ];

    return (
      <view style={styles.section}>
        <label
          value="AI Provider"
          style={{
            ...Fonts.h3,
            color: Colors.textPrimary,
            marginBottom: Spacing.base,
          }}
        />

        <view style={styles.providerGrid}>
          {providers.map((provider) => (
            <Card
              key={provider.id}
              elevation={
                this.state.selectedProvider === provider.id ? 'md' : 'sm'
              }
              onTap={() => this.handleProviderChange(provider.id)}
              style={{
                ...styles.providerCard,
                borderWidth: 2,
                borderColor:
                  this.state.selectedProvider === provider.id
                    ? Colors.primary
                    : Colors.transparent,
              }}
            >
              <view style={styles.providerContent}>
                <label value={provider.icon} style={{ fontSize: 24 }} />
                <label
                  value={provider.name}
                  style={{
                    ...Fonts.bodyBold,
                    color: Colors.textPrimary,
                    marginTop: Spacing.xs,
                  }}
                />
              </view>
            </Card>
          ))}
        </view>
      </view>
    );
  };

  private renderApiKeySection = () => {
    return (
      <view style={styles.section}>
        <label
          value="API Keys"
          style={{
            ...Fonts.h3,
            color: Colors.textPrimary,
            marginBottom: Spacing.sm,
          }}
        />

        <label
          value="Securely store your API keys for each provider"
          style={{
            ...Fonts.bodySmall,
            color: Colors.textSecondary,
            marginBottom: Spacing.base,
          }}
        />

        {/* OpenAI API Key */}
        <Card elevation="sm" style={styles.apiKeyCard}>
          <view>
            <view style={styles.apiKeyHeader}>
              <label
                value="OpenAI API Key"
                style={{
                  ...Fonts.bodyBold,
                  color: Colors.textPrimary,
                }}
              />
              {this.state.openAiKey && (
                <Button
                  title="Clear"
                  variant="ghost"
                  size="small"
                  onTap={() => this.handleClearApiKey('openai')}
                />
              )}
            </view>

            <TextInput
              value={this.state.openAiKey}
              placeholder="sk-..."
              secureTextEntry={!this.state.showOpenAiKey}
              onChangeText={(value: string) => this.handleApiKeyChange('openai', value)}
              style={{ marginTop: Spacing.sm }}
            />

            <Button
              title={this.state.showOpenAiKey ? 'Hide' : 'Show'}
              variant="outline"
              size="small"
              onTap={() => this.toggleKeyVisibility('openai')}
              style={{ marginTop: Spacing.sm }}
            />
          </view>
        </Card>

        {/* Anthropic API Key */}
        <Card elevation="sm" style={styles.apiKeyCard}>
          <view>
            <view style={styles.apiKeyHeader}>
              <label
                value="Anthropic API Key"
                style={{
                  ...Fonts.bodyBold,
                  color: Colors.textPrimary,
                }}
              />
              {this.state.anthropicKey && (
                <Button
                  title="Clear"
                  variant="ghost"
                  size="small"
                  onTap={() => this.handleClearApiKey('anthropic')}
                />
              )}
            </view>

            <TextInput
              value={this.state.anthropicKey}
              placeholder="sk-ant-..."
              secureTextEntry={!this.state.showAnthropicKey}
              onChangeText={(value: string) =>
                this.handleApiKeyChange('anthropic', value)
              }
              style={{ marginTop: Spacing.sm }}
            />

            <Button
              title={this.state.showAnthropicKey ? 'Hide' : 'Show'}
              variant="outline"
              size="small"
              onTap={() => this.toggleKeyVisibility('anthropic')}
              style={{ marginTop: Spacing.sm }}
            />
          </view>
        </Card>

        {/* Google API Key */}
        <Card elevation="sm" style={styles.apiKeyCard}>
          <view>
            <view style={styles.apiKeyHeader}>
              <label
                value="Google AI API Key"
                style={{
                  ...Fonts.bodyBold,
                  color: Colors.textPrimary,
                }}
              />
              {this.state.googleKey && (
                <Button
                  title="Clear"
                  variant="ghost"
                  size="small"
                  onTap={() => this.handleClearApiKey('google')}
                />
              )}
            </view>

            <TextInput
              value={this.state.googleKey}
              placeholder="AIza..."
              secureTextEntry={!this.state.showGoogleKey}
              onChangeText={(value: string) => this.handleApiKeyChange('google', value)}
              style={{ marginTop: Spacing.sm }}
            />

            <Button
              title={this.state.showGoogleKey ? 'Hide' : 'Show'}
              variant="outline"
              size="small"
              onTap={() => this.toggleKeyVisibility('google')}
              style={{ marginTop: Spacing.sm }}
            />
          </view>
        </Card>
      </view>
    );
  };

  private renderModelSection = () => {
    const openAiModels = [
      { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
      { label: 'GPT-4', value: 'gpt-4' },
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    ];

    const anthropicModels = [
      { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
      { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
      { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
    ];

    const googleModels = [
      { label: 'Gemini Pro', value: 'gemini-pro' },
      { label: 'Gemini Pro Vision', value: 'gemini-pro-vision' },
    ];

    return (
      <view style={styles.section}>
        <label
          value="Default Models"
          style={{
            ...Fonts.h3,
            color: Colors.textPrimary,
            marginBottom: Spacing.sm,
          }}
        />

        <label
          value="Select the default model for each provider"
          style={{
            ...Fonts.bodySmall,
            color: Colors.textSecondary,
            marginBottom: Spacing.base,
          }}
        />

        <Card elevation="sm" style={styles.modelCard}>
          <view>
            <label
              value="OpenAI Model"
              style={{
                ...Fonts.bodyBold,
                color: Colors.textPrimary,
                marginBottom: Spacing.sm,
              }}
            />
            <Dropdown
              options={openAiModels}
              selectedValue={this.state.openAiModel}
              onValueChange={(value) => this.handleModelChange('openai', value)}
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.modelCard}>
          <view>
            <label
              value="Anthropic Model"
              style={{
                ...Fonts.bodyBold,
                color: Colors.textPrimary,
                marginBottom: Spacing.sm,
              }}
            />
            <Dropdown
              options={anthropicModels}
              selectedValue={this.state.anthropicModel}
              onValueChange={(value) =>
                this.handleModelChange('anthropic', value)
              }
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.modelCard}>
          <view>
            <label
              value="Google AI Model"
              style={{
                ...Fonts.bodyBold,
                color: Colors.textPrimary,
                marginBottom: Spacing.sm,
              }}
            />
            <Dropdown
              options={googleModels}
              selectedValue={this.state.googleModel}
              onValueChange={(value) => this.handleModelChange('google', value)}
            />
          </view>
        </Card>
      </view>
    );
  };

  private renderPreferencesSection = () => {
    return (
      <view style={styles.section}>
        <label
          value="App Preferences"
          style={{
            ...Fonts.h3,
            color: Colors.textPrimary,
            marginBottom: Spacing.base,
          }}
        />

        <Card elevation="sm" style={styles.preferenceCard}>
          <view style={styles.preferenceRow}>
            <view style={styles.preferenceText}>
              <label
                value="Dark Mode"
                style={{
                  ...Fonts.bodyBold,
                  color: Colors.textPrimary,
                }}
              />
              <label
                value="Use dark theme across the app"
                style={{
                  ...Fonts.caption,
                  color: Colors.textSecondary,
                  marginTop: Spacing.xxs,
                }}
              />
            </view>
            <Switch
              value={this.state.darkMode}
              onValueChange={(value) => this.setState({ darkMode: value })}
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.preferenceCard}>
          <view style={styles.preferenceRow}>
            <view style={styles.preferenceText}>
              <label
                value="Notifications"
                style={{
                  ...Fonts.bodyBold,
                  color: Colors.textPrimary,
                }}
              />
              <label
                value="Enable push notifications"
                style={{
                  ...Fonts.caption,
                  color: Colors.textSecondary,
                  marginTop: Spacing.xxs,
                }}
              />
            </view>
            <Switch
              value={this.state.enableNotifications}
              onValueChange={(value) =>
                this.setState({ enableNotifications: value })
              }
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.preferenceCard}>
          <view style={styles.preferenceRow}>
            <view style={styles.preferenceText}>
              <label
                value="Sound Effects"
                style={{
                  ...Fonts.bodyBold,
                  color: Colors.textPrimary,
                }}
              />
              <label
                value="Play sounds for actions"
                style={{
                  ...Fonts.caption,
                  color: Colors.textSecondary,
                  marginTop: Spacing.xxs,
                }}
              />
            </view>
            <Switch
              value={this.state.enableSoundEffects}
              onValueChange={(value) =>
                this.setState({ enableSoundEffects: value })
              }
            />
          </view>
        </Card>
      </view>
    );
  };

  private renderAboutSection = () => {
    return (
      <view style={styles.section}>
        <label
          value="About"
          style={{
            ...Fonts.h3,
            color: Colors.textPrimary,
            marginBottom: Spacing.base,
          }}
        />

        <Card elevation="sm">
          <view>
            <label
              value="Valdi AI"
              style={{
                ...Fonts.h4,
                color: Colors.textPrimary,
              }}
            />
            <label
              value="Version 1.0.0"
              style={{
                ...Fonts.body,
                color: Colors.textSecondary,
                marginTop: Spacing.xs,
              }}
            />
            <label
              value="An open-source AI chat client built with Valdi and AI SDK v5. Supports multiple AI providers including OpenAI, Anthropic, and Google AI."
              style={{
                ...Fonts.bodySmall,
                color: Colors.textSecondary,
                marginTop: Spacing.base,
                lineHeight: 1.5,
              }}
            />

            <view style={styles.aboutLinks}>
              <Button
                title="GitHub"
                variant="outline"
                size="small"
                onTap={() => console.log('Open GitHub')}
              />
              <Button
                title="Documentation"
                variant="outline"
                size="small"
                onTap={() => console.log('Open docs')}
              />
              <Button
                title="License"
                variant="outline"
                size="small"
                onTap={() => console.log('Open license')}
              />
            </view>
          </view>
        </Card>
      </view>
    );
  };

  /**
   * Handle settings configuration errors
   */
  private handleSettingsError = (error: Error): void => {
    console.error('Settings error:', error);
  };

  override onRender() {
    return (
      <ErrorBoundary
        fallback={(error: Error) => (
          <ErrorScreen
            error={error}
            title="Settings Error"
            message="An error occurred while loading settings. Please try again."
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )}
        onError={this.handleSettingsError}
      >
        <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label
            value="Settings"
            style={{
              ...Fonts.h1,
              color: Colors.textPrimary,
            }}
          />
          <label
            value="Configure your AI providers and preferences"
            style={{
              ...Fonts.body,
              color: Colors.textSecondary,
              marginTop: Spacing.xs,
            }}
          />
        </view>

        {/* Scrollable Content */}
        <view style={styles.content}>
          {/* AI Provider Selection */}
          {this.renderProviderSection()}

          {/* API Keys */}
          {this.renderApiKeySection()}

          {/* Model Selection */}
          {this.renderModelSection()}

          {/* Preferences */}
          {this.renderPreferencesSection()}

          {/* About */}
          {this.renderAboutSection()}

          {/* Save Button */}
          <view style={styles.saveSection}>
            <Button
              title="Save Settings"
              variant="primary"
              size="large"
              fullWidth={true}
              loading={this.state.isSaving}
              onTap={this.handleSaveSettings}
            />

            {this.state.saveMessage && (
              <label
                value={this.state.saveMessage}
                style={{
                  ...Fonts.body,
                  color: this.state.saveMessage.includes('successfully')
                    ? Colors.success
                    : Colors.error,
                  textAlign: 'center',
                  marginTop: Spacing.base,
                }}
              />
            )}
          </view>
        </view>
      </view>
      </ErrorBoundary>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as Record<string, unknown>,

  header: {
    paddingHorizontal: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as Record<string, unknown>,

  content: {
    flex: 1,
    paddingHorizontal: SemanticSpacing.screenPaddingHorizontal,
    paddingVertical: Spacing.base,
  } as Record<string, unknown>,

  section: {
    marginBottom: Spacing.xxl,
  } as Record<string, unknown>,

  providerGrid: {
    flexDirection: 'row',
    gap: Spacing.base,
  } as Record<string, unknown>,

  providerCard: {
    flex: 1,
    aspectRatio: 1,
  } as Record<string, unknown>,

  providerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as Record<string, unknown>,

  apiKeyCard: {
    marginBottom: Spacing.base,
  } as Record<string, unknown>,

  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as Record<string, unknown>,

  modelCard: {
    marginBottom: Spacing.base,
  } as Record<string, unknown>,

  preferenceCard: {
    marginBottom: Spacing.base,
  } as Record<string, unknown>,

  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as Record<string, unknown>,

  preferenceText: {
    flex: 1,
    marginRight: Spacing.base,
  } as Record<string, unknown>,

  aboutLinks: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  } as Record<string, unknown>,

  saveSection: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  } as Record<string, unknown>,
};
