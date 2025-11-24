/**
 * Model Registry
 *
 * Central registry for all AI models (built-in and custom providers).
 */

import { CustomProviderStore } from './CustomProviderStore';
import {
  ModelDefinition,
  BuiltInProviderConfig,
  CustomProviderConfig,
  ProviderConfig,
  ModelRegistryStats,
  ProviderType,
  ModelCapabilities,
} from './types';

/**
 * Built-in OpenAI models
 */
const OPENAI_MODELS: ModelDefinition[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 128000,
      jsonMode: true,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 16384,
    costPerInputToken: 0.0025,
    costPerOutputToken: 0.01,
    isAvailable: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 128000,
      jsonMode: true,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 16384,
    costPerInputToken: 0.00015,
    costPerOutputToken: 0.0006,
    isAvailable: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 128000,
      jsonMode: true,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 4096,
    costPerInputToken: 0.01,
    costPerOutputToken: 0.03,
    isAvailable: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: false,
      maxTokens: 16385,
      jsonMode: true,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 4096,
    costPerInputToken: 0.0005,
    costPerOutputToken: 0.0015,
    isAvailable: true,
  },
];

/**
 * Built-in Anthropic models
 */
const ANTHROPIC_MODELS: ModelDefinition[] = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 200000,
      jsonMode: false,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 8192,
    costPerInputToken: 0.003,
    costPerOutputToken: 0.015,
    isAvailable: true,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 200000,
      jsonMode: false,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 8192,
    costPerInputToken: 0.0008,
    costPerOutputToken: 0.004,
    isAvailable: true,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 200000,
      jsonMode: false,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 4096,
    costPerInputToken: 0.015,
    costPerOutputToken: 0.075,
    isAvailable: true,
  },
];

/**
 * Built-in Google models
 */
const GOOGLE_MODELS: ModelDefinition[] = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 1000000,
      jsonMode: true,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 8192,
    costPerInputToken: 0,
    costPerOutputToken: 0,
    isAvailable: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 2000000,
      jsonMode: true,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 8192,
    costPerInputToken: 0.00125,
    costPerOutputToken: 0.005,
    isAvailable: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      maxTokens: 1000000,
      jsonMode: true,
    },
    defaultTemperature: 1.0,
    maxOutputTokens: 8192,
    costPerInputToken: 0.000075,
    costPerOutputToken: 0.0003,
    isAvailable: true,
  },
];

/**
 * Model Registry
 *
 * Manages all available models from built-in and custom providers.
 */
export class ModelRegistry {
  private builtInProviders: Map<ProviderType, BuiltInProviderConfig> =
    new Map();
  private customProviderStore: CustomProviderStore;

  constructor(customProviderStore: CustomProviderStore) {
    this.customProviderStore = customProviderStore;
    this.initializeBuiltInProviders();
  }

  /**
   * Initialize built-in providers
   */
  private initializeBuiltInProviders(): void {
    // OpenAI
    this.builtInProviders.set('openai', {
      type: 'openai',
      name: 'OpenAI',
      apiKey: '',
      models: OPENAI_MODELS,
      isEnabled: false,
    });

    // Anthropic
    this.builtInProviders.set('anthropic', {
      type: 'anthropic',
      name: 'Anthropic',
      apiKey: '',
      models: ANTHROPIC_MODELS,
      isEnabled: false,
    });

    // Google
    this.builtInProviders.set('google', {
      type: 'google',
      name: 'Google AI',
      apiKey: '',
      models: GOOGLE_MODELS,
      isEnabled: false,
    });
  }

  /**
   * Set API key for a built-in provider
   */
  setApiKey(
    providerType: Exclude<ProviderType, 'custom-openai-compatible'>,
    apiKey: string,
  ): void {
    const provider = this.builtInProviders.get(providerType);

    if (!provider) {
      throw new Error(`Unknown provider type: ${providerType}`);
    }

    provider.apiKey = apiKey;
    provider.isEnabled = apiKey.trim().length > 0;
  }

  /**
   * Get all providers (built-in + custom)
   */
  getAllProviders(): ProviderConfig[] {
    const builtIn = Array.from(this.builtInProviders.values());
    const custom = this.customProviderStore.getAllProviders();
    return [...builtIn, ...custom];
  }

  /**
   * Get enabled providers
   */
  getEnabledProviders(): ProviderConfig[] {
    return this.getAllProviders().filter((p) => p.isEnabled);
  }

  /**
   * Get a specific provider
   */
  getProvider(
    providerType: ProviderType,
    customProviderId?: string,
  ): ProviderConfig | undefined {
    if (providerType === 'custom-openai-compatible') {
      if (!customProviderId) {
        throw new Error('Custom provider ID is required for custom providers');
      }
      return this.customProviderStore.getProvider(customProviderId);
    }

    return this.builtInProviders.get(providerType);
  }

  /**
   * Get all models
   */
  getAllModels(): ModelDefinition[] {
    const models: ModelDefinition[] = [];

    // Add built-in models
    for (const provider of this.builtInProviders.values()) {
      if (provider.isEnabled) {
        models.push(...provider.models);
      }
    }

    // Add custom provider models
    const customProviders = this.customProviderStore.getEnabledProviders();
    for (const provider of customProviders) {
      models.push(this.customProviderToModel(provider));
    }

    return models;
  }

  /**
   * Get models for a specific provider
   */
  getModelsForProvider(
    providerType: ProviderType,
    customProviderId?: string,
  ): ModelDefinition[] {
    if (providerType === 'custom-openai-compatible') {
      if (!customProviderId) {
        throw new Error('Custom provider ID is required for custom providers');
      }

      const provider = this.customProviderStore.getProvider(customProviderId);
      return provider ? [this.customProviderToModel(provider)] : [];
    }

    const provider = this.builtInProviders.get(providerType);
    return provider ? provider.models : [];
  }

  /**
   * Get a specific model
   */
  getModel(
    modelId: string,
    customProviderId?: string,
  ): ModelDefinition | undefined {
    // Check custom providers first
    if (customProviderId) {
      const provider = this.customProviderStore.getProvider(customProviderId);
      if (provider && provider.modelId === modelId) {
        return this.customProviderToModel(provider);
      }
    }

    // Check built-in models
    for (const provider of this.builtInProviders.values()) {
      const model = provider.models.find((m) => m.id === modelId);
      if (model) {
        return model;
      }
    }

    return undefined;
  }

  /**
   * Search models by capability
   */
  searchByCapability(
    capability: keyof ModelCapabilities,
    value?: boolean,
  ): ModelDefinition[] {
    return this.getAllModels().filter((model) => {
      if (typeof model.capabilities[capability] === 'boolean') {
        return value === undefined || model.capabilities[capability] === value;
      }
      return true;
    });
  }

  /**
   * Get registry statistics
   */
  getStats(): ModelRegistryStats {
    const allProviders = this.getAllProviders();
    const allModels = this.getAllModels();

    return {
      totalProviders: allProviders.length,
      enabledProviders: allProviders.filter((p) => p.isEnabled).length,
      customProviders: this.customProviderStore.getAllProviders().length,
      totalModels: allModels.length,
      availableModels: allModels.filter((m) => m.isAvailable).length,
    };
  }

  /**
   * Convert custom provider to model definition
   */
  private customProviderToModel(
    provider: CustomProviderConfig,
  ): ModelDefinition {
    return {
      id: provider.modelId,
      name: provider.modelName || provider.modelId,
      provider: 'custom-openai-compatible',
      capabilities: {
        streaming: provider.supportsStreaming ?? true,
        functionCalling: provider.supportsFunctionCalling ?? false,
        vision: false,
        maxTokens: provider.maxContextTokens || 4096,
        jsonMode: false,
      },
      defaultTemperature: provider.defaultTemperature,
      maxOutputTokens: provider.maxOutputTokens,
      isAvailable: provider.isEnabled,
      customProviderId: provider.id,
    };
  }
}
