/**
 * Provider Settings View
 *
 * UI for managing custom provider configurations.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import { NavigationController } from 'valdi_navigation/src/NavigationController';
import { Colors, Fonts, Spacing } from '@common/theme';
import { Card } from '@common/components';
import { Button } from '@common/components';
import { LoadingSpinner } from '@common/components';
import { ConfirmDialog } from '@common/components';
import { CustomProviderStore } from './CustomProviderStore';
import { CustomProviderConfig } from './types';
import { AddCustomProviderView } from './AddCustomProviderView';

/**
 * ProviderSettingsView Props
 */
export interface ProviderSettingsViewProps {
  /** Navigation controller */
  navigationController: NavigationController;

  /** Custom provider store */
  customProviderStore: CustomProviderStore;
}

/**
 * ProviderSettingsView State
 */
export interface ProviderSettingsViewState {
  /** Custom providers */
  providers: CustomProviderConfig[];

  /** Is loading */
  isLoading: boolean;

  /** Error message */
  error?: string;

  /** Show delete confirmation dialog */
  showDeleteConfirm: boolean;

  /** Provider ID to delete */
  providerToDelete?: string;
}

/**
 * Provider Settings View
 *
 * Manages custom OpenAI-compatible provider configurations.
 */
export class ProviderSettingsView extends StatefulComponent<
  ProviderSettingsViewProps,
  ProviderSettingsViewState
> {
  state: ProviderSettingsViewState = {
    providers: [],
    isLoading: true,
    showDeleteConfirm: false,
  };

  async componentDidMount(): Promise<void> {
    await this.loadProviders();
  }

  onRender() {
    const { providers, isLoading, error } = this.state;

    return (
      <view style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Custom Providers" style={styles.headerTitle} />
          <label
            value="Manage your OpenAI-compatible API endpoints"
            style={styles.headerSubtitle}
          />
        </view>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner size="medium" text="Loading providers..." />
        ) : error ? (
          <view style={styles.errorContainer}>
            <label value="❌" style={styles.errorIcon} />
            <label value={error} style={styles.errorText} />
          </view>
        ) : (
          <view style={styles.content}>
            {/* Add New Button */}
            <view style={styles.addButtonContainer}>
              <Button
                title="+ Add Custom Provider"
                onTap={this.handleAddProvider}
                variant="primary"
              />
            </view>

            {/* Provider List */}
            {providers.length === 0 ? (
              <view style={styles.emptyContainer}>
                <label value="🔌" style={styles.emptyIcon} />
                <label
                  value="No custom providers yet"
                  style={styles.emptyText}
                />
                <label
                  value="Add a custom provider to use local LLMs, Azure OpenAI, or other compatible APIs"
                  style={styles.emptySubtext}
                />
              </view>
            ) : (
              <scrollView style={styles.scrollView}>
                <view style={styles.list}>
                  {providers.map((provider) => (
                    <Card key={provider.id} style={styles.providerCard}>
                      <view style={styles.providerContent}>
                        {/* Provider Header */}
                        <view style={styles.providerHeader}>
                          <view style={styles.providerInfo}>
                            <label
                              value={provider.name}
                              style={styles.providerName}
                            />
                            <view style={styles.providerMeta}>
                              <label
                                value={provider.baseUrl}
                                style={styles.providerUrl}
                              />
                              {provider.isEnabled ? (
                                <view style={styles.statusBadge}>
                                  <label
                                    value="Enabled"
                                    style={styles.statusText}
                                  />
                                </view>
                              ) : (
                                <view style={styles.statusBadgeDisabled}>
                                  <label
                                    value="Disabled"
                                    style={styles.statusTextDisabled}
                                  />
                                </view>
                              )}
                            </view>
                          </view>
                        </view>

                        {/* Model Info */}
                        <view style={styles.modelInfo}>
                          <label
                            value={`Model: ${provider.modelName || provider.modelId}`}
                            style={styles.modelText}
                          />
                          {provider.defaultTemperature !== undefined && (
                            <label
                              value={`Temperature: ${provider.defaultTemperature}`}
                              style={styles.modelText}
                            />
                          )}
                        </view>

                        {/* Capabilities */}
                        <view style={styles.capabilities}>
                          {provider.supportsStreaming && (
                            <view style={styles.capabilityBadge}>
                              <label
                                value="Streaming"
                                style={styles.capabilityText}
                              />
                            </view>
                          )}
                          {provider.supportsFunctionCalling && (
                            <view style={styles.capabilityBadge}>
                              <label
                                value="Function Calling"
                                style={styles.capabilityText}
                              />
                            </view>
                          )}
                        </view>

                        {/* Actions */}
                        <view style={styles.actions}>
                          <view
                            style={styles.actionButton}
                            onTap={() => this.handleTestProvider(provider.id)}
                          >
                            <label
                              value="Test"
                              style={styles.actionButtonText}
                            />
                          </view>

                          <view
                            style={styles.actionButton}
                            onTap={() => this.handleEditProvider(provider)}
                          >
                            <label
                              value="Edit"
                              style={styles.actionButtonText}
                            />
                          </view>

                          <view
                            style={styles.actionButton}
                            onTap={() =>
                              this.handleToggleEnabled(
                                provider.id,
                                !provider.isEnabled,
                              )
                            }
                          >
                            <label
                              value={provider.isEnabled ? 'Disable' : 'Enable'}
                              style={styles.actionButtonText}
                            />
                          </view>

                          <view
                            style={styles.actionButtonDanger}
                            onTap={() => this.handleDeleteProvider(provider.id)}
                          >
                            <label
                              value="Delete"
                              style={styles.actionButtonTextDanger}
                            />
                          </view>
                        </view>

                        {/* Last Updated */}
                        <label
                          value={`Updated: ${this.formatDate(provider.updatedAt)}`}
                          style={styles.timestamp}
                        />
                      </view>
                    </Card>
                  ))}
                </view>
              </scrollView>
            )}
          </view>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isVisible={this.state.showDeleteConfirm}
          title="Delete Provider"
          message="Are you sure you want to delete this provider? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="danger"
          onConfirm={this.confirmDeleteProvider}
          onCancel={this.cancelDeleteConfirmation}
        />
      </view>
    );
  }

  /**
   * Load providers
   */
  private async loadProviders(): Promise<void> {
    this.setState({ isLoading: true, error: undefined });

    try {
      const providers = this.props.customProviderStore.getAllProviders();
      this.setState({ providers, isLoading: false });
    } catch (error) {
      console.error('Failed to load providers:', error);
      this.setState({
        error:
          error instanceof Error ? error.message : 'Failed to load providers',
        isLoading: false,
      });
    }
  }

  /**
   * Handle add provider
   */
  private handleAddProvider = (): void => {
    this.props.navigationController.push(AddCustomProviderView, {
      customProviderStore: this.props.customProviderStore,
      onSaved: async () => {
        await this.loadProviders();
      },
    });
  };

  /**
   * Handle edit provider
   */
  private handleEditProvider = (provider: CustomProviderConfig): void => {
    this.props.navigationController.push(AddCustomProviderView, {
      customProviderStore: this.props.customProviderStore,
      existingProvider: provider,
      onSaved: async () => {
        await this.loadProviders();
      },
    });
  };

  /**
   * Handle test provider
   */
  private handleTestProvider = async (providerId: string): Promise<void> => {
    try {
      const result =
        await this.props.customProviderStore.testProvider(providerId);

      if (result.success) {
        alert(
          `Connection successful!\nResponse time: ${result.responseTime}ms`,
        );
      } else {
        alert(`Connection failed\n${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(
        `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  /**
   * Handle toggle enabled
   */
  private handleToggleEnabled = async (
    providerId: string,
    enabled: boolean,
  ): Promise<void> => {
    try {
      await this.props.customProviderStore.updateProvider(providerId, {
        isEnabled: enabled,
      });
      await this.loadProviders();
    } catch (error) {
      alert(
        `Failed to update provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  /**
   * Handle delete provider
   */
  private handleDeleteProvider = (providerId: string): void => {
    this.setState({
      showDeleteConfirm: true,
      providerToDelete: providerId,
    });
  };

  /**
   * Confirm delete provider
   */
  private confirmDeleteProvider = async (): Promise<void> => {
    const { providerToDelete } = this.state;

    if (!providerToDelete) {
      return;
    }

    this.setState({ showDeleteConfirm: false, providerToDelete: undefined });

    try {
      await this.props.customProviderStore.deleteProvider(providerToDelete);
      await this.loadProviders();
    } catch (error) {
      alert(
        `Failed to delete provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  /**
   * Cancel delete confirmation
   */
  private cancelDeleteConfirmation = (): void => {
    this.setState({
      showDeleteConfirm: false,
      providerToDelete: undefined,
    });
  };

  /**
   * Format date
   */
  private formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
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

  content: new Style<View>({
    flex: 1,
  }),

  addButtonContainer: new Style<View>({
    padding: Spacing.base,
  }),

  scrollView: new Style<ScrollView>({
    flex: 1,
  }),

  list: new Style<View>({
    padding: Spacing.base,
  }),

  errorContainer: new Style<View>({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  }),

  errorIcon: new Style<Label>({
    fontSize: 48,
    marginBottom: Spacing.base,
  }),

  errorText: new Style<Label>({
    ...Fonts.bodyLarge,
    color: Colors.error,
    textAlign: 'center',
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

  providerCard: new Style<View>({
    marginBottom: Spacing.base,
  }),

  providerContent: new Style<View>({
    padding: Spacing.sm,
  }),

  providerHeader: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  }),

  providerInfo: new Style<View>({
    flex: 1,
  }),

  providerName: new Style<Label>({
    ...Fonts.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  }),

  providerMeta: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  }),

  providerUrl: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
  }),

  statusBadge: new Style<View>({
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.success + '20',
    borderRadius: Spacing.radiusSm,
  }),

  statusText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.success,
    fontSize: 10,
  }),

  statusBadgeDisabled: new Style<View>({
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.textTertiary + '20',
    borderRadius: Spacing.radiusSm,
  }),

  statusTextDisabled: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
    fontSize: 10,
  }),

  modelInfo: new Style<View>({
    marginBottom: Spacing.sm,
  }),

  modelText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textSecondary,
  }),

  capabilities: new Style<View>({
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  }),

  capabilityBadge: new Style<View>({
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.primary200,
    borderRadius: Spacing.radiusSm,
  }),

  capabilityText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.primary,
    fontSize: 10,
  }),

  actions: new Style<View>({
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  }),

  actionButton: new Style<View>({
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary100,
    borderRadius: Spacing.radiusSm,
  }),

  actionButtonText: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.primary,
  }),

  actionButtonDanger: new Style<View>({
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.error + '20',
    borderRadius: Spacing.radiusSm,
  }),

  actionButtonTextDanger: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.error,
  }),

  timestamp: new Style<Label>({
    ...Fonts.bodySmall,
    color: Colors.textTertiary,
  }),
};
