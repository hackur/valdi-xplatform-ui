/**
 * Model Config Types
 *
 * Type definitions for model configuration, providers, and custom APIs.
 */

/**
 * Supported AI providers
 */
export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'custom-openai-compatible';

/**
 * Model capability flags
 */
export interface ModelCapabilities {
  /** Supports streaming responses */
  streaming: boolean;

  /** Supports function/tool calling */
  functionCalling: boolean;

  /** Supports vision/image inputs */
  vision: boolean;

  /** Maximum context window in tokens */
  maxTokens: number;

  /** Supports JSON mode */
  jsonMode: boolean;
}

/**
 * Model definition
 */
export interface ModelDefinition {
  /** Unique model ID */
  id: string;

  /** Display name */
  name: string;

  /** Provider type */
  provider: ProviderType;

  /** Model capabilities */
  capabilities: ModelCapabilities;

  /** Default temperature */
  defaultTemperature?: number;

  /** Maximum output tokens */
  maxOutputTokens?: number;

  /** Cost per 1K input tokens (USD) */
  costPerInputToken?: number;

  /** Cost per 1K output tokens (USD) */
  costPerOutputToken?: number;

  /** Is this model available */
  isAvailable: boolean;

  /** Custom provider ID (for custom providers) */
  customProviderId?: string;
}

/**
 * Built-in provider configuration
 */
export interface BuiltInProviderConfig {
  /** Provider type */
  type: Exclude<ProviderType, 'custom-openai-compatible'>;

  /** Display name */
  name: string;

  /** API key */
  apiKey: string;

  /** Available models */
  models: ModelDefinition[];

  /** Is provider enabled */
  isEnabled: boolean;
}

/**
 * Custom OpenAI-compatible provider configuration
 */
export interface CustomProviderConfig {
  /** Unique ID for this custom provider */
  id: string;

  /** Provider type (always 'custom-openai-compatible') */
  type: 'custom-openai-compatible';

  /** User-defined name (e.g., "My Local Ollama", "Azure GPT-4") */
  name: string;

  /** Base URL for the API endpoint */
  baseUrl: string;

  /** API key (optional for local providers) */
  apiKey?: string;

  /** Model ID to use */
  modelId: string;

  /** Display name for the model */
  modelName?: string;

  /** Default temperature (0-2) */
  defaultTemperature?: number;

  /** Maximum output tokens */
  maxOutputTokens?: number;

  /** Maximum context window */
  maxContextTokens?: number;

  /** Supports streaming */
  supportsStreaming?: boolean;

  /** Supports function calling */
  supportsFunctionCalling?: boolean;

  /** Additional headers */
  headers?: Record<string, string>;

  /** Is this provider enabled */
  isEnabled: boolean;

  /** Created timestamp */
  createdAt: Date;

  /** Last modified timestamp */
  updatedAt: Date;
}

/**
 * Provider configuration (built-in or custom)
 */
export type ProviderConfig = BuiltInProviderConfig | CustomProviderConfig;

/**
 * Model selection
 */
export interface ModelSelection {
  /** Selected provider type */
  providerType: ProviderType;

  /** Selected model ID */
  modelId: string;

  /** Custom provider ID (if using custom provider) */
  customProviderId?: string;

  /** Override temperature */
  temperature?: number;

  /** Override max tokens */
  maxTokens?: number;
}

/**
 * Provider test result
 */
export interface ProviderTestResult {
  /** Was the test successful */
  success: boolean;

  /** Response time in ms */
  responseTime?: number;

  /** Error message if failed */
  error?: string;

  /** Model information returned by provider */
  modelInfo?: {
    id: string;
    name?: string;
    capabilities?: string[];
  };
}

/**
 * Model registry statistics
 */
export interface ModelRegistryStats {
  /** Total number of providers */
  totalProviders: number;

  /** Number of enabled providers */
  enabledProviders: number;

  /** Number of custom providers */
  customProviders: number;

  /** Total number of models */
  totalModels: number;

  /** Number of available models */
  availableModels: number;
}

/**
 * Custom provider validation result
 */
export interface ValidationResult {
  /** Is the configuration valid */
  isValid: boolean;

  /** Validation errors */
  errors: Array<{
    field: keyof CustomProviderConfig;
    message: string;
  }>;

  /** Validation warnings */
  warnings: Array<{
    field: keyof CustomProviderConfig;
    message: string;
  }>;
}

/**
 * Export format for provider configurations
 */
export interface ExportedProviders {
  /** Version of the export format */
  version: string;

  /** Export timestamp */
  exportedAt: Date;

  /** Custom provider configurations */
  customProviders: CustomProviderConfig[];
}
