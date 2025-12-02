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

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemFont } from 'valdi_core/src/SystemFont';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  Button,
  Card,
  ErrorBoundary,
  ErrorScreen,
} from '../../common/src/index';
import type { SimpleNavigationController } from '../../common/src/index';
import type { AIProvider } from './ApiKeyStore';
import { ApiKeyStore } from './ApiKeyStore';
import { PreferencesStore } from './PreferencesStore';
import { TextInput } from './components/TextInput';
import { Switch } from './components/Switch';
import { Dropdown } from './components/Dropdown';
import { getCustomProviderStore } from '../../model_config/src';
import { AddCustomProviderView } from '../../model_config/src/AddCustomProviderView';
import type { CustomProviderConfig } from '../../model_config/src/types';
import { Logger } from '../../common/src/services/Logger';

/**
 * SettingsScreen Props
 */
export interface SettingsScreenProps {
  navigationController: SimpleNavigationController;
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

  // Custom Providers
  customProviders: CustomProviderConfig[];

  // App Preferences
  darkMode: boolean;
  enableNotifications: boolean;
  enableSoundEffects: boolean;

  // UI State
  isSaving: boolean;
  saveMessage: string;

  // Custom Provider Edit Mode
  editingProvider: CustomProviderConfig | null;
  showAddProvider: boolean;
}

/**
 * SettingsScreen Component
 */
export class SettingsScreen extends StatefulComponent<
  SettingsScreenProps,
  SettingsScreenState
> {
  private apiKeyStore!: ApiKeyStore;
  private preferencesStore!: PreferencesStore;
  private readonly logger = new Logger({ module: 'SettingsScreen' });

  // Cache handlers (per Valdi best practices - avoid creating new functions on render)
  private readonly providerChangeHandlers = new Map<string, () => void>();
  private readonly customProviderEditHandlers = new Map<string, () => void>();
  private readonly customProviderDeleteHandlers = new Map<string, () => Promise<void>>();
  private readonly clearApiKeyHandlers = new Map<string, () => Promise<void>>();
  private readonly toggleKeyVisibilityHandlers = new Map<string, () => void>();

  override state: SettingsScreenState = {
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
    customProviders: [],
    darkMode: false,
    enableNotifications: true,
    enableSoundEffects: true,
    isSaving: false,
    saveMessage: '',
    editingProvider: null,
    showAddProvider: false,
  };

  override onCreate() {
    this.apiKeyStore = new ApiKeyStore();
    this.preferencesStore = new PreferencesStore();

    // Load settings asynchronously
    void this.loadSettings();
  }

  private readonly loadSettings = async (): Promise<void> => {
    try {
      // Load API keys
      const openAiKey = await this.apiKeyStore.getApiKey('openai');
      const anthropicKey = await this.apiKeyStore.getApiKey('anthropic');
      const googleKey = await this.apiKeyStore.getApiKey('google');

      // Load custom providers
      const customProviderStore = getCustomProviderStore();
      await customProviderStore.initialize();
      const customProviders = customProviderStore.getAllProviders();

      // Load preferences
      const preferences = await this.preferencesStore.getPreferences();

      this.setState({
        openAiKey: openAiKey || '',
        anthropicKey: anthropicKey || '',
        googleKey: googleKey || '',
        customProviders,
        selectedProvider: preferences.selectedProvider || 'openai',
        openAiModel: preferences.openAiModel || 'gpt-4-turbo-preview',
        anthropicModel: preferences.anthropicModel || 'claude-3-opus-20240229',
        googleModel: preferences.googleModel || 'gemini-pro',
        darkMode: preferences.darkMode ?? false,
        enableNotifications: preferences.enableNotifications ?? true,
        enableSoundEffects: preferences.enableSoundEffects ?? true,
      });
    } catch (error) {
      this.logger.error('Failed to load settings', error);
    }
  };

  private readonly handleProviderChange = (provider: AIProvider): void => {
    this.setState({ selectedProvider: provider });
  };

  private readonly handleApiKeyChange = (provider: AIProvider, value: string): void => {
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

  private readonly toggleKeyVisibility = (provider: AIProvider): void => {
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

  private readonly handleModelChange = (provider: AIProvider, model: string): void => {
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

  private readonly handleSaveSettings = async (): Promise<void> => {
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
      this.logger.error('Failed to save settings', error);
      this.setState({
        isSaving: false,
        saveMessage: 'Failed to save settings',
      });
    }
  };

  private readonly handleClearApiKey = async (provider: AIProvider): Promise<void> => {
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
      this.logger.error(`Failed to clear ${provider} API key`, error);
    }
  };

  private readonly handleAddCustomProvider = (): void => {
    // Show inline add provider form
    this.setState({ showAddProvider: true, editingProvider: null });
  };

  private readonly handleEditCustomProvider = (provider: CustomProviderConfig): void => {
    // Show inline edit provider form
    this.setState({ showAddProvider: true, editingProvider: provider });
  };

  private readonly handleCustomProviderSaved = async (): Promise<void> => {
    // Hide form and reload providers
    this.setState({ showAddProvider: false, editingProvider: null });
    await this.loadSettings();
  };

  private readonly handleCustomProviderCancel = (): void => {
    this.setState({ showAddProvider: false, editingProvider: null });
  };

  private readonly handleDeleteCustomProvider = async (
    provider: CustomProviderConfig
  ): Promise<void> => {
    try {
      const customProviderStore = getCustomProviderStore();
      await customProviderStore.deleteProvider(provider.id);
      this.logger.info('Custom provider deleted', { name: provider.name });
      // Reload custom providers
      await this.loadSettings();
    } catch (error) {
      this.logger.error('Failed to delete custom provider', error);
    }
  };

  // Cached handler getters (per Valdi best practices)
  private getProviderChangeHandler(providerId: AIProvider): () => void {
    let handler = this.providerChangeHandlers.get(providerId);
    if (!handler) {
      handler = () => { this.handleProviderChange(providerId); };
      this.providerChangeHandlers.set(providerId, handler);
    }
    return handler;
  }

  private getCustomProviderEditHandler(provider: CustomProviderConfig): () => void {
    let handler = this.customProviderEditHandlers.get(provider.id);
    if (!handler) {
      handler = () => { this.handleEditCustomProvider(provider); };
      this.customProviderEditHandlers.set(provider.id, handler);
    }
    return handler;
  }

  private getCustomProviderDeleteHandler(provider: CustomProviderConfig): () => Promise<void> {
    let handler = this.customProviderDeleteHandlers.get(provider.id);
    if (!handler) {
      handler = async () => { await this.handleDeleteCustomProvider(provider); };
      this.customProviderDeleteHandlers.set(provider.id, handler);
    }
    return handler;
  }

  private getClearApiKeyHandler(provider: AIProvider): () => Promise<void> {
    let handler = this.clearApiKeyHandlers.get(provider);
    if (!handler) {
      handler = async () => { await this.handleClearApiKey(provider); };
      this.clearApiKeyHandlers.set(provider, handler);
    }
    return handler;
  }

  private getToggleKeyVisibilityHandler(provider: AIProvider): () => void {
    let handler = this.toggleKeyVisibilityHandlers.get(provider);
    if (!handler) {
      handler = () => { this.toggleKeyVisibility(provider); };
      this.toggleKeyVisibilityHandlers.set(provider, handler);
    }
    return handler;
  }

  private getProviderCardStyle(isSelected: boolean) {
    return new Style<View>({
      borderWidth: 2,
      borderColor: isSelected ? Colors.primary : Colors.transparent,
    });
  }

  private getSaveMessageStyle() {
    return new Style<Label>({
      ...Fonts.body,
      color: this.state.saveMessage.includes('successfully')
        ? Colors.success
        : Colors.error,
      textAlign: 'center',
      marginTop: Spacing.base,
    });
  }

  private readonly renderProviderSection = () => {
    const providers: Array<{ id: AIProvider; name: string; icon: string }> = [
      { id: 'openai', name: 'OpenAI', icon: '🤖' },
      { id: 'anthropic', name: 'Anthropic', icon: '🧠' },
      { id: 'google', name: 'Google AI', icon: '🔍' },
    ];

    return (
      <view style={styles.section}>
        <label
          value="AI Provider"
          style={styles.sectionTitle}
        />

        <view style={styles.providerGrid}>
          {providers.map((provider) => (
            <view
              key={provider.id}
              style={this.getProviderCardStyle(this.state.selectedProvider === provider.id)}
            >
            <Card
              elevation={
                this.state.selectedProvider === provider.id ? 'md' : 'sm'
              }
              onTap={this.getProviderChangeHandler(provider.id)}
            >
              <view style={styles.providerContent}>
                <label value={provider.icon} style={styles.providerIcon} />
                <label
                  value={provider.name}
                  style={styles.providerName}
                />
              </view>
            </Card>
            </view>
          ))}
        </view>
      </view>
    );
  };

  private readonly renderCustomProvidersSection = () => {
    return (
      <view style={styles.section}>
        <label value="Custom Providers" style={styles.sectionTitle} />
        <label
          value="Add OpenAI-compatible API endpoints like LM Studio, Ollama, or LocalAI"
          style={styles.sectionDescription}
        />

        <Button
          title="+ Add Custom Provider"
          variant="primary"
          onTap={this.handleAddCustomProvider}
          style={styles.addProviderButton}
        />

        {this.state.customProviders.map((provider) => (
          <Card key={provider.id} elevation="sm" style={styles.customProviderCard}>
            <view>
              <view style={styles.customProviderHeader}>
                <label value={provider.name} style={styles.customProviderName} />
                <label
                  value={provider.isEnabled ? '✓ Enabled' : '✗ Disabled'}
                  style={
                    provider.isEnabled
                      ? styles.customProviderEnabled
                      : styles.customProviderDisabled
                  }
                />
              </view>
              <label
                value={provider.baseUrl}
                style={styles.customProviderUrl}
              />
              <label
                value={`Model: ${provider.modelName || provider.modelId}`}
                style={styles.customProviderModel}
              />
              <view style={styles.customProviderActions}>
                <Button
                  title="Edit"
                  variant="outline"
                  size="small"
                  onTap={this.getCustomProviderEditHandler(provider)}
                />
                <Button
                  title="Delete"
                  variant="ghost"
                  size="small"
                  onTap={this.getCustomProviderDeleteHandler(provider)}
                />
              </view>
            </view>
          </Card>
        ))}

        {this.state.customProviders.length === 0 && (
          <Card elevation="sm" style={styles.emptyStateCard}>
            <label
              value="No custom providers configured yet"
              style={styles.emptyStateText}
            />
            <label
              value="Add a custom provider to connect to LM Studio, Ollama, or other OpenAI-compatible APIs"
              style={styles.emptyStateDescription}
            />
          </Card>
        )}
      </view>
    );
  };

  private readonly renderApiKeySection = () => {
    return (
      <view style={styles.section}>
        <label
          value="API Keys"
          style={styles.sectionTitle}
        />

        <label
          value="Securely store your API keys for each provider"
          style={styles.sectionDescription}
        />

        {/* OpenAI API Key */}
        <Card elevation="sm" style={styles.apiKeyCard}>
          <view>
            <view style={styles.apiKeyHeader}>
              <label
                value="OpenAI API Key"
                style={styles.apiKeyLabel}
              />
              {this.state.openAiKey && (
                <Button
                  title="Clear"
                  variant="ghost"
                  size="small"
                  onTap={this.getClearApiKeyHandler('openai')}
                />
              )}
            </view>

            <TextInput
              value={this.state.openAiKey}
              placeholder="sk-..."
              secureTextEntry={!this.state.showOpenAiKey}
              onChangeText={(value: string) => { this.handleApiKeyChange('openai', value); }}
              style={styles.inputWithMargin}
            />

            <Button
              title={this.state.showOpenAiKey ? 'Hide' : 'Show'}
              variant="outline"
              size="small"
              onTap={this.getToggleKeyVisibilityHandler('openai')}
              style={styles.buttonWithMargin}
            />
          </view>
        </Card>

        {/* Anthropic API Key */}
        <Card elevation="sm" style={styles.apiKeyCard}>
          <view>
            <view style={styles.apiKeyHeader}>
              <label
                value="Anthropic API Key"
                style={styles.apiKeyLabel}
              />
              {this.state.anthropicKey && (
                <Button
                  title="Clear"
                  variant="ghost"
                  size="small"
                  onTap={this.getClearApiKeyHandler('anthropic')}
                />
              )}
            </view>

            <TextInput
              value={this.state.anthropicKey}
              placeholder="sk-ant-..."
              secureTextEntry={!this.state.showAnthropicKey}
              onChangeText={(value: string) =>
                { this.handleApiKeyChange('anthropic', value); }
              }
              style={styles.inputWithMargin}
            />

            <Button
              title={this.state.showAnthropicKey ? 'Hide' : 'Show'}
              variant="outline"
              size="small"
              onTap={this.getToggleKeyVisibilityHandler('anthropic')}
              style={styles.buttonWithMargin}
            />
          </view>
        </Card>

        {/* Google API Key */}
        <Card elevation="sm" style={styles.apiKeyCard}>
          <view>
            <view style={styles.apiKeyHeader}>
              <label
                value="Google AI API Key"
                style={styles.apiKeyLabel}
              />
              {this.state.googleKey && (
                <Button
                  title="Clear"
                  variant="ghost"
                  size="small"
                  onTap={this.getClearApiKeyHandler('google')}
                />
              )}
            </view>

            <TextInput
              value={this.state.googleKey}
              placeholder="AIza..."
              secureTextEntry={!this.state.showGoogleKey}
              onChangeText={(value: string) => { this.handleApiKeyChange('google', value); }}
              style={styles.inputWithMargin}
            />

            <Button
              title={this.state.showGoogleKey ? 'Hide' : 'Show'}
              variant="outline"
              size="small"
              onTap={this.getToggleKeyVisibilityHandler('google')}
              style={styles.buttonWithMargin}
            />
          </view>
        </Card>
      </view>
    );
  };

  private readonly renderModelSection = () => {
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
          style={styles.sectionTitle}
        />

        <label
          value="Select the default model for each provider"
          style={styles.sectionDescription}
        />

        <Card elevation="sm" style={styles.modelCard}>
          <view>
            <label
              value="OpenAI Model"
              style={styles.modelLabel}
            />
            <Dropdown
              options={openAiModels}
              selectedValue={this.state.openAiModel}
              onValueChange={(value) => { this.handleModelChange('openai', value); }}
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.modelCard}>
          <view>
            <label
              value="Anthropic Model"
              style={styles.modelLabel}
            />
            <Dropdown
              options={anthropicModels}
              selectedValue={this.state.anthropicModel}
              onValueChange={(value) =>
                { this.handleModelChange('anthropic', value); }
              }
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.modelCard}>
          <view>
            <label
              value="Google AI Model"
              style={styles.modelLabel}
            />
            <Dropdown
              options={googleModels}
              selectedValue={this.state.googleModel}
              onValueChange={(value) => { this.handleModelChange('google', value); }}
            />
          </view>
        </Card>
      </view>
    );
  };

  private readonly renderPreferencesSection = () => {
    return (
      <view style={styles.section}>
        <label
          value="App Preferences"
          style={styles.sectionTitle}
        />

        <Card elevation="sm" style={styles.preferenceCard}>
          <view style={styles.preferenceRow}>
            <view style={styles.preferenceText}>
              <label
                value="Dark Mode"
                style={styles.preferenceLabel}
              />
              <label
                value="Use dark theme across the app"
                style={styles.preferenceDescription}
              />
            </view>
            <Switch
              value={this.state.darkMode}
              onValueChange={(value) => { this.setState({ darkMode: value }); }}
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.preferenceCard}>
          <view style={styles.preferenceRow}>
            <view style={styles.preferenceText}>
              <label
                value="Notifications"
                style={styles.preferenceLabel}
              />
              <label
                value="Enable push notifications"
                style={styles.preferenceDescription}
              />
            </view>
            <Switch
              value={this.state.enableNotifications}
              onValueChange={(value) =>
                { this.setState({ enableNotifications: value }); }
              }
            />
          </view>
        </Card>

        <Card elevation="sm" style={styles.preferenceCard}>
          <view style={styles.preferenceRow}>
            <view style={styles.preferenceText}>
              <label
                value="Sound Effects"
                style={styles.preferenceLabel}
              />
              <label
                value="Play sounds for actions"
                style={styles.preferenceDescription}
              />
            </view>
            <Switch
              value={this.state.enableSoundEffects}
              onValueChange={(value) =>
                { this.setState({ enableSoundEffects: value }); }
              }
            />
          </view>
        </Card>
      </view>
    );
  };

  private readonly renderAboutSection = () => {
    return (
      <view style={styles.section}>
        <label
          value="About"
          style={styles.sectionTitle}
        />

        <Card elevation="sm">
          <view>
            <label
              value="Valdi AI"
              style={styles.aboutTitle}
            />
            <label
              value="Version 1.0.0"
              style={styles.aboutVersion}
            />
            <label
              value="An open-source AI chat client built with Valdi and AI SDK v5. Supports multiple AI providers including OpenAI, Anthropic, and Google AI."
              style={styles.aboutDescription}
            />

            <view style={styles.aboutLinks}>
              <Button
                title="GitHub"
                variant="outline"
                size="small"
                onTap={() => { this.logger.debug('Open GitHub'); }}
              />
              <Button
                title="Documentation"
                variant="outline"
                size="small"
                onTap={() => { this.logger.debug('Open docs'); }}
              />
              <Button
                title="License"
                variant="outline"
                size="small"
                onTap={() => { this.logger.debug('Open license'); }}
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
  private readonly handleSettingsError = (error: Error): void => {
    this.logger.error('Settings error', error);
  };

  override onRender() {
    return (
      <ErrorBoundary
        fallback={(error: Error) => (
          <ErrorScreen
            error={error}
            title="Settings Error"
            message="An error occurred while loading settings. Please try again."
            showDetails={false}
          />
        )}
        onError={this.handleSettingsError}
      >
        <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label
            value="Settings"
            style={styles.headerTitle}
          />
          <label
            value="Configure your AI providers and preferences"
            style={styles.headerSubtitle}
          />
        </view>

        {/* Scrollable Content */}
        <view style={styles.content}>
          {/* AI Provider Selection */}
          {this.renderProviderSection()}

          {/* API Keys */}
          {this.renderApiKeySection()}

          {/* Custom Providers */}
          {this.renderCustomProvidersSection()}

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
                style={this.getSaveMessageStyle()}
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
  container: new Style<View>({
    flexGrow: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
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

  content: new Style<View>({
    flexGrow: 1,
    paddingLeft: SemanticSpacing.screenPaddingHorizontal,
    paddingRight: SemanticSpacing.screenPaddingHorizontal,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  }),

  section: new Style<View>({
    marginBottom: Spacing.xxl,
  }),

  sectionTitle: new Style<Label>({
    ...Fonts.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  }),

  sectionDescription: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  }),

  providerGrid: new Style<View>({
    flexDirection: 'row',
  }),

  providerCard: new Style<View>({
    flexGrow: 1,
    aspectRatio: 1,
  }),

  providerContent: new Style<View>({
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  providerIcon: new Style<Label>({
    font: systemFont(24),
  }),

  providerName: new Style<Label>({
    ...Fonts.bodyBold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  }),

  apiKeyCard: new Style<View>({
    marginBottom: Spacing.base,
  }),

  apiKeyHeader: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  apiKeyLabel: new Style<Label>({
    ...Fonts.bodyBold,
    color: Colors.textPrimary,
  }),

  modelCard: new Style<View>({
    marginBottom: Spacing.base,
  }),

  modelLabel: new Style<Label>({
    ...Fonts.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  }),

  preferenceCard: new Style<View>({
    marginBottom: Spacing.base,
  }),

  preferenceRow: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  preferenceText: new Style<View>({
    flexGrow: 1,
    marginRight: Spacing.base,
  }),

  preferenceLabel: new Style<Label>({
    ...Fonts.bodyBold,
    color: Colors.textPrimary,
  }),

  preferenceDescription: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  }),

  aboutTitle: new Style<Label>({
    ...Fonts.h4,
    color: Colors.textPrimary,
  }),

  aboutVersion: new Style<Label>({
    ...Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  }),

  aboutDescription: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
    lineHeight: 1.5,
  }),

  aboutLinks: new Style<View>({
    flexDirection: 'row',
    marginTop: Spacing.base,
  }),

  saveSection: new Style<View>({
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  }),

  inputWithMargin: new Style<View>({
    marginTop: Spacing.sm,
  }),

  buttonWithMargin: new Style<View>({
    marginTop: Spacing.sm,
  }),

  // Custom Provider Styles
  addProviderButton: new Style<View>({
    marginBottom: Spacing.base,
  }),

  customProviderCard: new Style<View>({
    marginBottom: Spacing.base,
  }),

  customProviderHeader: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  }),

  customProviderName: new Style<Label>({
    ...Fonts.bodyBold,
    color: Colors.textPrimary,
  }),

  customProviderEnabled: new Style<Label>({
    ...Fonts.caption,
    color: Colors.success,
  }),

  customProviderDisabled: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textTertiary,
  }),

  customProviderUrl: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
  }),

  customProviderModel: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  }),

  customProviderActions: new Style<View>({
    flexDirection: 'row',
  }),

  emptyStateCard: new Style<View>({
    padding: Spacing.lg,
    alignItems: 'center',
  }),

  emptyStateText: new Style<Label>({
    ...Fonts.bodyBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  }),

  emptyStateDescription: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  }),
};
