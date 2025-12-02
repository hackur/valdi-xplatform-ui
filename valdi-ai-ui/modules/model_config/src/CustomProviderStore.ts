/**
 * Custom Provider Store
 *
 * Manages custom OpenAI-compatible provider configurations with persistence.
 */

import type { StorageProvider } from 'common/src/services/StorageProvider';
import type {
  CustomProviderConfig,
  ProviderTestResult,
  ValidationResult,
  ExportedProviders,
} from './types';

/**
 * Storage key for custom providers
 */
const STORAGE_KEY = 'custom_providers';

/**
 * Export format version
 */
const EXPORT_VERSION = '1.0.0';

/**
 * Custom Provider Store
 *
 * Manages the lifecycle of custom OpenAI-compatible provider configurations.
 */
export class CustomProviderStore {
  private readonly providers: Map<string, CustomProviderConfig> = new Map();
  private readonly storageProvider: StorageProvider;
  private isInitialized = false;

  constructor(storageProvider: StorageProvider) {
    this.storageProvider = storageProvider;
  }

  /**
   * Initialize the store by loading from storage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const jsonData = await this.storageProvider.getItem(STORAGE_KEY);

      if (jsonData) {
        const data: CustomProviderConfig[] = JSON.parse(jsonData);
        data.forEach((provider) => {
          // Convert date strings back to Date objects
          provider.createdAt = new Date(provider.createdAt);
          provider.updatedAt = new Date(provider.updatedAt);
          this.providers.set(provider.id, provider);
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load custom providers:', error);
      throw new Error('Failed to initialize custom provider store');
    }
  }

  /**
   * Add a new custom provider
   */
  async addProvider(
    config: Omit<
      CustomProviderConfig,
      'id' | 'type' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<CustomProviderConfig> {
    // Validate configuration
    const validationResult = this.validateProvider({
      ...config,
      id: '', // Temporary ID for validation
      type: 'custom-openai-compatible',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!validationResult.isValid) {
      throw new Error(
        `Invalid provider configuration: ${validationResult.errors.map((e) => e.message).join(', ')}`,
      );
    }

    // Generate unique ID
    const id = this.generateId();

    // Create provider config
    const provider: CustomProviderConfig = {
      ...config,
      id,
      type: 'custom-openai-compatible',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to store
    this.providers.set(id, provider);

    // Save to storage
    await this.save();

    return provider;
  }

  /**
   * Update an existing custom provider
   */
  async updateProvider(
    id: string,
    updates: Partial<
      Omit<CustomProviderConfig, 'id' | 'type' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<CustomProviderConfig> {
    const existing = this.providers.get(id);

    if (!existing) {
      throw new Error(`Provider with ID "${id}" not found`);
    }

    // Create updated config
    const updated: CustomProviderConfig = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated config
    const validationResult = this.validateProvider(updated);

    if (!validationResult.isValid) {
      throw new Error(
        `Invalid provider configuration: ${validationResult.errors.map((e) => e.message).join(', ')}`,
      );
    }

    // Update in store
    this.providers.set(id, updated);

    // Save to storage
    await this.save();

    return updated;
  }

  /**
   * Delete a custom provider
   */
  async deleteProvider(id: string): Promise<void> {
    if (!this.providers.has(id)) {
      throw new Error(`Provider with ID "${id}" not found`);
    }

    this.providers.delete(id);
    await this.save();
  }

  /**
   * Get a custom provider by ID
   */
  getProvider(id: string): CustomProviderConfig | undefined {
    return this.providers.get(id);
  }

  /**
   * Get all custom providers
   */
  getAllProviders(): CustomProviderConfig[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get enabled custom providers
   */
  getEnabledProviders(): CustomProviderConfig[] {
    return this.getAllProviders().filter((p) => p.isEnabled);
  }

  /**
   * Test a custom provider connection
   */
  async testProvider(id: string): Promise<ProviderTestResult> {
    const provider = this.providers.get(id);

    if (!provider) {
      throw new Error(`Provider with ID "${id}" not found`);
    }

    return this.testProviderConfig(provider);
  }

  /**
   * Test a provider configuration (without saving)
   */
  async testProviderConfig(
    config: CustomProviderConfig,
  ): Promise<ProviderTestResult> {
    const startTime = Date.now();

    try {
      // Create a test request to the provider
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers,
      };

      if (config.apiKey) {
        headers.Authorization = `Bearer ${config.apiKey}`;
      }

      // Try to list models or make a simple completion request
      const response = await fetch(`${config.baseUrl}/models`, {
        method: 'GET',
        headers,
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        responseTime,
        modelInfo: {
          id: config.modelId,
          name: config.modelName || config.modelId,
          capabilities: data.data ? data.data.map((m: any) => m.id) : [],
        },
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate a provider configuration
   */
  validateProvider(config: CustomProviderConfig): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Validate name
    if (!config.name || config.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Provider name is required',
      });
    }

    // Validate base URL
    if (!config.baseUrl || config.baseUrl.trim().length === 0) {
      errors.push({
        field: 'baseUrl',
        message: 'Base URL is required',
      });
    } else {
      try {
        const url = new URL(config.baseUrl);
        if (url.protocol === 'http:' && !url.hostname.includes('localhost')) {
          warnings.push({
            field: 'baseUrl',
            message: 'Using HTTP for non-localhost URLs is insecure',
          });
        }
      } catch {
        errors.push({
          field: 'baseUrl',
          message: 'Invalid URL format',
        });
      }
    }

    // Validate model ID
    if (!config.modelId || config.modelId.trim().length === 0) {
      errors.push({
        field: 'modelId',
        message: 'Model ID is required',
      });
    }

    // Validate temperature
    if (
      config.defaultTemperature !== undefined &&
      (config.defaultTemperature < 0 || config.defaultTemperature > 2)
    ) {
      errors.push({
        field: 'defaultTemperature',
        message: 'Temperature must be between 0 and 2',
      });
    }

    // Validate max tokens
    if (config.maxOutputTokens !== undefined && config.maxOutputTokens < 1) {
      errors.push({
        field: 'maxOutputTokens',
        message: 'Max output tokens must be greater than 0',
      });
    }

    if (config.maxContextTokens !== undefined && config.maxContextTokens < 1) {
      errors.push({
        field: 'maxContextTokens',
        message: 'Max context tokens must be greater than 0',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Export custom providers to JSON
   */
  exportProviders(): ExportedProviders {
    return {
      version: EXPORT_VERSION,
      exportedAt: new Date(),
      customProviders: this.getAllProviders(),
    };
  }

  /**
   * Import custom providers from JSON
   */
  async importProviders(
    exported: ExportedProviders,
    options: { overwrite?: boolean; skipExisting?: boolean } = {},
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const provider of exported.customProviders) {
      try {
        const existing = this.providers.get(provider.id);

        if (existing) {
          if (options.overwrite) {
            await this.updateProvider(provider.id, provider);
            results.imported++;
          } else if (options.skipExisting) {
            results.skipped++;
          } else {
            // Create as new provider with new ID
            await this.addProvider(provider);
            results.imported++;
          }
        } else {
          // Restore with original ID
          this.providers.set(provider.id, {
            ...provider,
            createdAt: new Date(provider.createdAt),
            updatedAt: new Date(provider.updatedAt),
          });
          results.imported++;
        }
      } catch (error) {
        results.errors.push(
          `Failed to import provider "${provider.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    if (results.imported > 0) {
      await this.save();
    }

    return results;
  }

  /**
   * Clear all custom providers
   */
  async clearAll(): Promise<void> {
    this.providers.clear();
    await this.save();
  }

  /**
   * Save to storage
   */
  private async save(): Promise<void> {
    const data = Array.from(this.providers.values());
    const jsonData = JSON.stringify(data);
    await this.storageProvider.setItem(STORAGE_KEY, jsonData);
  }

  /**
   * Generate unique ID for a provider
   */
  private generateId(): string {
    return `custom_provider_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
