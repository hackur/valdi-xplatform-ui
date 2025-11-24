/**
 * Add Custom Provider View
 *
 * UI for adding/editing custom OpenAI-compatible API providers.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import { Colors, Fonts, Spacing } from '../common/src';
import { Button } from '../common/src';
import { LoadingSpinner } from '../common/src';
import { CustomProviderStore } from './CustomProviderStore';
import {
  CustomProviderConfig,
  ProviderTestResult,
  ValidationResult,
} from './types';

/**
 * AddCustomProviderView Props
 */
export interface AddCustomProviderViewProps {
  /** Navigation controller */
  navigationController: NavigationController;

  /** Custom provider store */
  customProviderStore: CustomProviderStore;

  /** Provider to edit (if editing) */
  existingProvider?: CustomProviderConfig;

  /** Callback when provider is saved */
  onSaved?: (provider: CustomProviderConfig) => void;
}

/**
 * AddCustomProviderView State
 */
export interface AddCustomProviderViewState {
  /** Form values */
  name: string;
  baseUrl: string;
  apiKey: string;
  modelId: string;
  modelName: string;
  defaultTemperature: string;
  maxOutputTokens: string;
  maxContextTokens: string;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;

  /** Validation errors */
  errors: Map<string, string>;

  /** Is testing connection */
  isTesting: boolean;

  /** Test result */
  testResult?: ProviderTestResult;

  /** Is saving */
  isSaving: boolean;

  /** Save error */
  saveError?: string;
}

/**
 * Add Custom Provider View
 *
 * Full-screen form for adding/editing custom OpenAI-compatible providers.
 */
export class AddCustomProviderView extends StatefulComponent<
  AddCustomProviderViewProps,
  AddCustomProviderViewState
> {
  state: AddCustomProviderViewState = {
    name: '',
    baseUrl: '',
    apiKey: '',
    modelId: '',
    modelName: '',
    defaultTemperature: '0.7',
    maxOutputTokens: '4096',
    maxContextTokens: '8192',
    supportsStreaming: true,
    supportsFunctionCalling: false,
    errors: new Map(),
    isTesting: false,
    isSaving: false,
  };

  async componentDidMount(): Promise<void> {
    // Initialize from existing provider if editing
    const { existingProvider } = this.viewModel;
    if (existingProvider) {
      this.setState({
        name: existingProvider.name || '',
        baseUrl: existingProvider.baseUrl || '',
        apiKey: existingProvider.apiKey || '',
        modelId: existingProvider.modelId || '',
        modelName: existingProvider.modelName || '',
        defaultTemperature:
          existingProvider.defaultTemperature?.toString() || '0.7',
        maxOutputTokens: existingProvider.maxOutputTokens?.toString() || '4096',
        maxContextTokens:
          existingProvider.maxContextTokens?.toString() || '8192',
        supportsStreaming: existingProvider.supportsStreaming ?? true,
        supportsFunctionCalling:
          existingProvider.supportsFunctionCalling ?? false,
      });
    }
  }

  onRender() {
    const {
      name,
      baseUrl,
      apiKey,
      modelId,
      modelName,
      defaultTemperature,
      maxOutputTokens,
      maxContextTokens,
      supportsStreaming,
      supportsFunctionCalling,
      errors,
      isTesting,
      testResult,
      isSaving,
      saveError,
    } = this.state;

    const { existingProvider } = this.viewModel;
    const isEditing = !!existingProvider;

    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label
            value={isEditing ? 'Edit Custom Provider' : 'Add Custom Provider'}
            style={styles.headerTitle}
          />
          <label
            value="Configure your OpenAI-compatible API endpoint"
            style={styles.headerSubtitle}
          />
        </view>

        {/* Form */}
        <scrollView style={styles.scrollView}>
          <view style={styles.form}>
            {/* Provider Name */}
            <view style={styles.field}>
              <label value="Provider Name *" style={styles.label} />
              <TextInput
                value={name}
                placeholder="e.g., My Local LLM, Azure GPT-4"
                style={errors.has('name') ? styles.inputError : styles.input}
                onChangeText={(text) => this.handleFieldChange('name', text)}
              />
              {errors.has('name') && (
                <label value={errors.get('name')} style={styles.errorText} />
              )}
            </view>

            {/* Base URL */}
            <view style={styles.field}>
              <label value="Base URL *" style={styles.label} />
              <TextInput
                value={baseUrl}
                placeholder="https://api.example.com/v1"
                style={errors.has('baseUrl') ? styles.inputError : styles.input}
                onChangeText={(text) => this.handleFieldChange('baseUrl', text)}
                autoCapitalize="none"
              />
              {errors.has('baseUrl') && (
                <label value={errors.get('baseUrl')} style={styles.errorText} />
              )}
              <label
                value="Examples: http://localhost:11434/v1 (Ollama), http://localhost:1234/v1 (LM Studio)"
                style={styles.helpText}
              />
            </view>

            {/* API Key */}
            <view style={styles.field}>
              <label value="API Key (optional)" style={styles.label} />
              <TextInput
                value={apiKey}
                placeholder="sk-..."
                style={styles.input}
                onChangeText={(text) => this.handleFieldChange('apiKey', text)}
                autoCapitalize="none"
                secureTextEntry={true}
              />
              <label
                value="Leave empty if your endpoint doesn't require authentication"
                style={styles.helpText}
              />
            </view>

            {/* Model ID */}
            <view style={styles.field}>
              <label value="Model ID *" style={styles.label} />
              <TextInput
                value={modelId}
                placeholder="e.g., llama2, gpt-4, mistral"
                style={errors.has('modelId') ? styles.inputError : styles.input}
                onChangeText={(text) => this.handleFieldChange('modelId', text)}
                autoCapitalize="none"
              />
              {errors.has('modelId') && (
                <label value={errors.get('modelId')} style={styles.errorText} />
              )}
            </view>

            {/* Model Display Name */}
            <view style={styles.field}>
              <label value="Display Name (optional)" style={styles.label} />
              <TextInput
                value={modelName}
                placeholder="Friendly name for the model"
                style={styles.input}
                onChangeText={(text) =>
                  this.handleFieldChange('modelName', text)
                }
              />
            </view>

            {/* Advanced Settings Header */}
            <label value="Advanced Settings" style={styles.sectionTitle} />

            {/* Temperature */}
            <view style={styles.field}>
              <label value="Default Temperature" style={styles.label} />
              <TextInput
                value={defaultTemperature}
                placeholder="0.7"
                style={
                  errors.has('defaultTemperature')
                    ? styles.inputError
                    : styles.input
                }
                onChangeText={(text) =>
                  this.handleFieldChange('defaultTemperature', text)
                }
                keyboardType="decimal-pad"
              />
              {errors.has('defaultTemperature') && (
                <label
                  value={errors.get('defaultTemperature')}
                  style={styles.errorText}
                />
              )}
              <label value="Range: 0.0 to 2.0" style={styles.helpText} />
            </view>

            {/* Max Output Tokens */}
            <view style={styles.field}>
              <label value="Max Output Tokens" style={styles.label} />
              <TextInput
                value={maxOutputTokens}
                placeholder="4096"
                style={styles.input}
                onChangeText={(text) =>
                  this.handleFieldChange('maxOutputTokens', text)
                }
                keyboardType="number-pad"
              />
            </view>

            {/* Max Context Tokens */}
            <view style={styles.field}>
              <label value="Max Context Window" style={styles.label} />
              <TextInput
                value={maxContextTokens}
                placeholder="8192"
                style={styles.input}
                onChangeText={(text) =>
                  this.handleFieldChange('maxContextTokens', text)
                }
                keyboardType="number-pad"
              />
            </view>

            {/* Capabilities */}
            <label value="Capabilities" style={styles.sectionTitle} />

            <view
              style={styles.checkbox}
              onTap={() => this.handleToggle('supportsStreaming')}
            >
              <view
                style={
                  supportsStreaming
                    ? styles.checkboxChecked
                    : styles.checkboxUnchecked
                }
              >
                {supportsStreaming && (
                  <label value="✓" style={styles.checkmark} />
                )}
              </view>
              <label value="Supports Streaming" style={styles.checkboxLabel} />
            </view>

            <view
              style={styles.checkbox}
              onTap={() => this.handleToggle('supportsFunctionCalling')}
            >
              <view
                style={
                  supportsFunctionCalling
                    ? styles.checkboxChecked
                    : styles.checkboxUnchecked
                }
              >
                {supportsFunctionCalling && (
                  <label value="✓" style={styles.checkmark} />
                )}
              </view>
              <label
                value="Supports Function Calling"
                style={styles.checkboxLabel}
              />
            </view>

            {/* Test Connection */}
            <view style={styles.testSection}>
              <Button
                title={isTesting ? 'Testing...' : 'Test Connection'}
                onTap={this.handleTestConnection}
                variant="secondary"
                disabled={isTesting || !this.canTest()}
              />

              {testResult && (
                <view style={styles.testResult}>
                  {testResult.success ? (
                    <view>
                      <label
                        value="✅ Connection successful!"
                        style={styles.successText}
                      />
                      <label
                        value={`Response time: ${testResult.responseTime}ms`}
                        style={styles.helpText}
                      />
                    </view>
                  ) : (
                    <view>
                      <label
                        value="❌ Connection failed"
                        style={styles.errorText}
                      />
                      <label
                        value={testResult.error || 'Unknown error'}
                        style={styles.helpText}
                      />
                    </view>
                  )}
                </view>
              )}
            </view>

            {/* Save Error */}
            {saveError && (
              <view style={styles.errorContainer}>
                <label value={`Error: ${saveError}`} style={styles.errorText} />
              </view>
            )}
          </view>
        </scrollView>

        {/* Footer Actions */}
        <view style={styles.footer}>
          <Button
            title="Cancel"
            onTap={this.handleCancel}
            variant="secondary"
            disabled={isSaving}
          />

          <Button
            title={
              isSaving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Add Provider'
            }
            onTap={this.handleSave}
            variant="primary"
            disabled={isSaving || !this.canSave()}
          />
        </view>

        {/* Loading Overlay */}
        {isSaving && (
          <view style={styles.loadingOverlay}>
            <LoadingSpinner size="large" text="Saving provider..." />
          </view>
        )}
      </view>
    );
  }

  /**
   * Handle field change
   */
  private handleFieldChange(
    field: keyof AddCustomProviderViewState,
    value: string,
  ): void {
    this.setState({ [field]: value } as any);

    // Clear error for this field
    const errors = new Map(this.state.errors);
    errors.delete(field);
    this.setState({ errors });
  }

  /**
   * Handle toggle
   */
  private handleToggle(
    field: 'supportsStreaming' | 'supportsFunctionCalling',
  ): void {
    this.setState({ [field]: !this.state[field] } as any);
  }

  /**
   * Can test connection
   */
  private canTest(): boolean {
    const { baseUrl, modelId } = this.state;
    return baseUrl.trim().length > 0 && modelId.trim().length > 0;
  }

  /**
   * Handle test connection
   */
  private handleTestConnection = async (): Promise<void> => {
    this.setState({ isTesting: true, testResult: undefined });

    try {
      const config = this.buildProviderConfig();
      const result =
        await this.viewModel.customProviderStore.testProviderConfig(config);
      this.setState({ testResult: result });
    } catch (error) {
      this.setState({
        testResult: {
          success: false,
          error: error instanceof Error ? error.message : 'Test failed',
        },
      });
    } finally {
      this.setState({ isTesting: false });
    }
  };

  /**
   * Can save
   */
  private canSave(): boolean {
    const { name, baseUrl, modelId } = this.state;
    return (
      name.trim().length > 0 &&
      baseUrl.trim().length > 0 &&
      modelId.trim().length > 0
    );
  }

  /**
   * Handle save
   */
  private handleSave = async (): Promise<void> => {
    const config = this.buildProviderConfig();

    // Validate
    const validation =
      this.viewModel.customProviderStore.validateProvider(config);

    if (!validation.isValid) {
      const errors = new Map<string, string>();
      validation.errors.forEach((error) => {
        errors.set(error.field, error.message);
      });
      this.setState({ errors, saveError: 'Please fix the errors above' });
      return;
    }

    this.setState({ isSaving: true, saveError: undefined });

    try {
      let savedProvider: CustomProviderConfig;

      if (this.viewModel.existingProvider) {
        // Update existing
        savedProvider = await this.viewModel.customProviderStore.updateProvider(
          this.viewModel.existingProvider.id,
          config,
        );
      } else {
        // Add new
        savedProvider =
          await this.viewModel.customProviderStore.addProvider(config);
      }

      // Callback
      if (this.viewModel.onSaved) {
        this.viewModel.onSaved(savedProvider);
      }

      // Navigate back
      this.viewModel.navigationController.pop();
    } catch (error) {
      this.setState({
        saveError:
          error instanceof Error ? error.message : 'Failed to save provider',
        isSaving: false,
      });
    }
  };

  /**
   * Handle cancel
   */
  private handleCancel = (): void => {
    this.viewModel.navigationController.pop();
  };

  /**
   * Build provider config from form state
   */
  private buildProviderConfig(): CustomProviderConfig {
    const {
      name,
      baseUrl,
      apiKey,
      modelId,
      modelName,
      defaultTemperature,
      maxOutputTokens,
      maxContextTokens,
      supportsStreaming,
      supportsFunctionCalling,
    } = this.state;

    return {
      id: this.viewModel.existingProvider?.id || '',
      type: 'custom-openai-compatible',
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim() || undefined,
      modelId: modelId.trim(),
      modelName: modelName.trim() || undefined,
      defaultTemperature: parseFloat(defaultTemperature) || undefined,
      maxOutputTokens: parseInt(maxOutputTokens, 10) || undefined,
      maxContextTokens: parseInt(maxContextTokens, 10) || undefined,
      supportsStreaming,
      supportsFunctionCalling,
      isEnabled: true,
      createdAt: this.viewModel.existingProvider?.createdAt || new Date(),
      updatedAt: new Date(),
    };
  }
}

const styles = {
  container: new Style<View>({
    flex: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  }),

  headerTitle: new Style<Label>({
    ...Fonts.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  }),

  headerSubtitle: new Style<Label>({
    ...Fonts.bodyRegular,
    color: Colors.textSecondary,
  }),

  scrollView: new Style<ScrollView>({
    flex: 1,
  }),

  form: new Style<View>({
    padding: Spacing.base,
  }),

  field: new Style<View>({
    marginBottom: Spacing.base,
  }),

  label: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  }),

  input: new Style<TextInput>({
    ...Fonts.bodyRegular,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.sm,
  }),

  inputError: new Style<TextInput>({
    ...Fonts.bodyRegular,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.error,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.sm,
  }),

  helpText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  }),

  errorText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  }),

  successText: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.success,
  }),

  sectionTitle: new Style<Label>({
    ...Fonts.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
  }),

  checkbox: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
  }),

  checkboxUnchecked: new Style<View>({
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusSm,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  }),

  checkboxChecked: new Style<View>({
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusSm,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  }),

  checkmark: new Style<Label>({
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  }),

  checkboxLabel: new Style<Label>({
    ...Fonts.bodyMedium,
    color: Colors.textPrimary,
  }),

  testSection: new Style<View>({
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
  }),

  testResult: new Style<View>({
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
  }),

  errorContainer: new Style<View>({
    padding: Spacing.sm,
    backgroundColor: Colors.error + '20',
    borderRadius: Spacing.radiusMd,
    marginBottom: Spacing.base,
  }),

  footer: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  }),

  loadingOverlay: new Style<View>({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }),
};
