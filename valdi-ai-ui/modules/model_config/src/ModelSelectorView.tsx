/**
 * Model Selector View
 *
 * UI for selecting AI models from built-in and custom providers.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import { Colors, Fonts, Spacing } from 'common/src';
import { Card } from 'common/src';
import { LoadingSpinner } from 'common/src';
import { ModelRegistry } from './ModelRegistry';
import { ModelDefinition, ModelSelection, ProviderType } from './types';

/**
 * ModelSelectorView Props
 */
export interface ModelSelectorViewProps {
  /** Navigation controller */
  navigationController: NavigationController;

  /** Model registry */
  modelRegistry: ModelRegistry;

  /** Currently selected model */
  currentSelection?: ModelSelection;

  /** Callback when model is selected */
  onModelSelected?: (selection: ModelSelection) => void;
}

/**
 * ModelSelectorView State
 */
export interface ModelSelectorViewState {
  /** Available models */
  models: ModelDefinition[];

  /** Grouped by provider */
  modelsByProvider: Map<string, ModelDefinition[]>;

  /** Is loading */
  isLoading: boolean;

  /** Selected model ID */
  selectedModelId?: string;

  /** Selected custom provider ID */
  selectedCustomProviderId?: string;
}

/**
 * Model Selector View
 *
 * Displays all available models grouped by provider.
 */
export class ModelSelectorView extends StatefulComponent<
  ModelSelectorViewProps,
  ModelSelectorViewState
> {
  override state: ModelSelectorViewState = {
    models: [],
    modelsByProvider: new Map(),
    isLoading: true,
    selectedModelId: undefined,
    selectedCustomProviderId: undefined,
  };

  async componentDidMount(): Promise<void> {
    // Initialize selection from props
    const { currentSelection } = this.viewModel;
    if (currentSelection) {
      this.setState({
        selectedModelId: currentSelection.modelId,
        selectedCustomProviderId: currentSelection.customProviderId,
      });
    }

    await this.loadModels();
  }

  override onRender() {
    const {
      models,
      modelsByProvider,
      isLoading,
      selectedModelId,
      selectedCustomProviderId,
    } = this.state;

    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Select Model" style={styles.headerTitle} />
          <label
            value={`${models.length} models available`}
            style={styles.headerSubtitle}
          />
        </view>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner size="medium" text="Loading models..." />
        ) : models.length === 0 ? (
          <view style={styles.emptyContainer}>
            <label value="🤖" style={styles.emptyIcon} />
            <label value="No models available" style={styles.emptyText} />
            <label
              value="Configure your API keys in Settings to enable models"
              style={styles.emptySubtext}
            />
          </view>
        ) : (
          <scroll style={styles.scrollView}>
            <view style={styles.content}>
              {Array.from(modelsByProvider.entries()).map(
                ([providerName, providerModels]) => (
                  <view key={providerName} style={styles.providerSection}>
                    {/* Provider Header */}
                    <label value={providerName} style={styles.providerTitle} />

                    {/* Models */}
                    {providerModels.map((model) => {
                      const isSelected =
                        model.id === selectedModelId &&
                        model.customProviderId === selectedCustomProviderId;

                      return (
                        <view
                          key={`${model.id}_${model.customProviderId || 'builtin'}`}
                          onTap={() => this.handleModelSelect(model)}
                        >
                          <Card
                            style={
                              isSelected
                                ? styles.modelCardSelected
                                : styles.modelCard
                            }
                          >
                            <view style={styles.modelContent}>
                              {/* Model Name */}
                              <view style={styles.modelHeader}>
                                <label
                                  value={model.name}
                                  style={styles.modelName}
                                />
                                {isSelected && (
                                  <label
                                    value="✓"
                                    style={styles.selectedIcon}
                                  />
                                )}
                              </view>

                              {/* Model ID (for custom providers) */}
                              {model.customProviderId && (
                                <label
                                  value={`Model ID: ${model.id}`}
                                  style={styles.modelId}
                                />
                              )}

                              {/* Capabilities */}
                              <view style={styles.capabilities}>
                                {model.capabilities.streaming && (
                                  <view style={styles.badge}>
                                    <label
                                      value="Streaming"
                                      style={styles.badgeText}
                                    />
                                  </view>
                                )}
                                {model.capabilities.functionCalling && (
                                  <view style={styles.badge}>
                                    <label
                                      value="Tools"
                                      style={styles.badgeText}
                                    />
                                  </view>
                                )}
                                {model.capabilities.vision && (
                                  <view style={styles.badge}>
                                    <label
                                      value="Vision"
                                      style={styles.badgeText}
                                    />
                                  </view>
                                )}
                                {model.capabilities.jsonMode && (
                                  <view style={styles.badge}>
                                    <label
                                      value="JSON"
                                      style={styles.badgeText}
                                    />
                                  </view>
                                )}
                              </view>

                              {/* Model Stats */}
                              <view style={styles.stats}>
                                <label
                                  value={`Context: ${this.formatTokens(model.capabilities.maxTokens)}`}
                                  style={styles.statText}
                                />
                                {model.maxOutputTokens && (
                                  <label
                                    value="•"
                                    style={styles.statSeparator}
                                  />
                                )}
                                {model.maxOutputTokens && (
                                  <label
                                    value={`Output: ${this.formatTokens(model.maxOutputTokens)}`}
                                    style={styles.statText}
                                  />
                                )}
                              </view>

                              {/* Pricing (for built-in models) */}
                              {model.costPerInputToken !== undefined &&
                                model.costPerOutputToken !== undefined && (
                                  <view style={styles.pricing}>
                                    <label
                                      value={`$${model.costPerInputToken}/1K in • $${model.costPerOutputToken}/1K out`}
                                      style={styles.pricingText}
                                    />
                                  </view>
                                )}
                            </view>
                          </Card>
                        </view>
                      );
                    })}
                  </view>
                ),
              )}
            </view>
          </scroll>
        )}
      </view>
    );
  }

  /**
   * Load models
   */
  private async loadModels(): Promise<void> {
    this.setState({ isLoading: true });

    try {
      const models = this.viewModel.modelRegistry.getAllModels();

      // Group by provider
      const modelsByProvider = new Map<string, ModelDefinition[]>();

      for (const model of models) {
        let providerName: string;

        if (model.provider === 'custom-openai-compatible') {
          // Get custom provider name
          const provider = this.viewModel.modelRegistry.getProvider(
            'custom-openai-compatible',
            model.customProviderId,
          );
          providerName = provider?.name || 'Custom Provider';
        } else {
          // Built-in provider
          const providerNames: Record<
            Exclude<ProviderType, 'custom-openai-compatible'>,
            string
          > = {
            openai: 'OpenAI',
            anthropic: 'Anthropic',
            google: 'Google AI',
          };
          providerName = providerNames[model.provider];
        }

        if (!modelsByProvider.has(providerName)) {
          modelsByProvider.set(providerName, []);
        }

        modelsByProvider.get(providerName)!.push(model);
      }

      this.setState({ models, modelsByProvider, isLoading: false });
    } catch (error) {
      console.error('Failed to load models:', error);
      this.setState({ isLoading: false });
    }
  }

  /**
   * Handle model select
   */
  private handleModelSelect = (model: ModelDefinition): void => {
    this.setState({
      selectedModelId: model.id,
      selectedCustomProviderId: model.customProviderId,
    });

    // Callback
    if (this.viewModel.onModelSelected) {
      const selection: ModelSelection = {
        providerType: model.provider,
        modelId: model.id,
        customProviderId: model.customProviderId,
        temperature: model.defaultTemperature,
        maxTokens: model.maxOutputTokens,
      };

      this.viewModel.onModelSelected(selection);
    }

    // Navigate back
    this.viewModel.navigationController.pop();
  };

  /**
   * Format token count
   */
  private formatTokens(tokens: number): string {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  }
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
    marginBottom: Spacing.xs,
  }),

  headerSubtitle: new Style<Label>({
    ...Fonts.bodyRegular,
    color: Colors.textSecondary,
  }),

  scrollView: new Style<View>({
    flexGrow: 1,
  }),

  content: new Style<View>({
    padding: Spacing.base,
  }),

  emptyContainer: new Style<View>({
    flexGrow: 1,
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

  providerSection: new Style<View>({
    marginBottom: Spacing.lg,
  }),

  providerTitle: new Style<Label>({
    ...Fonts.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  }),

  modelCard: new Style<View>({
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  modelCardSelected: new Style<View>({
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primary100,
    borderWidth: 2,
    borderColor: Colors.primary,
  }),

  modelContent: new Style<View>({
    padding: Spacing.sm,
  }),

  modelHeader: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  }),

  modelName: new Style<Label>({
    ...Fonts.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '600',
  }),

  selectedIcon: new Style<Label>({
    fontSize: 20,
    color: Colors.primary,
  }),

  modelId: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  }),

  capabilities: new Style<View>({
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
  }),

  badge: new Style<View>({
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.xs,
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: Colors.primary200,
    borderRadius: Spacing.radiusSm,
  }),

  badgeText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.primary,
    fontSize: 10,
  }),

  stats: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  }),

  statText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
  }),

  statSeparator: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
  }),

  pricing: new Style<View>({
    marginTop: Spacing.xs,
  }),

  pricingText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
  }),
};
