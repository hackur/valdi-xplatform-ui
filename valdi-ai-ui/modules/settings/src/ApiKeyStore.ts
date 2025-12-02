/**
 * ApiKeyStore - Secure Storage for API Keys
 *
 * Manages secure storage and retrieval of API keys for different AI providers.
 * Provides validation and secure handling of sensitive data.
 */

import { Logger } from '../../common/src/services/Logger';

/**
 * Supported AI Providers
 */
export type AIProvider = 'openai' | 'anthropic' | 'google';

/**
 * API Key validation patterns
 */
const API_KEY_PATTERNS: Record<AIProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{48,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
  google: /^AIza[a-zA-Z0-9_\-]{35}$/,
};

/**
 * Storage keys for API keys
 */
const STORAGE_KEYS: Record<AIProvider, string> = {
  openai: 'valdi_ai_openai_key',
  anthropic: 'valdi_ai_anthropic_key',
  google: 'valdi_ai_google_key',
};

/**
 * ApiKeyStore Class
 *
 * Handles secure storage, retrieval, and validation of API keys.
 */
export class ApiKeyStore {
  private readonly logger = new Logger({ module: 'ApiKeyStore' });

  /**
   * Validate API key format
   */
  validateKey(provider: AIProvider, key: string): boolean {
    if (!key || key.trim() === '') {
      return false;
    }

    const pattern = API_KEY_PATTERNS[provider];
    return pattern.test(key);
  }

  /**
   * Get API key for a provider
   */
  async getApiKey(provider: AIProvider): Promise<string | null> {
    try {
      const storageKey = STORAGE_KEYS[provider];

      // In a real implementation, this would use secure storage
      // For now, using localStorage as a placeholder
      if (typeof window !== 'undefined' && window.localStorage) {
        const key = window.localStorage.getItem(storageKey);
        return key;
      }

      // Fallback for non-browser environments
      return null;
    } catch (error) {
      this.logger.error(`Failed to get API key for ${provider}`, error);
      return null;
    }
  }

  /**
   * Set API key for a provider
   */
  async setApiKey(provider: AIProvider, key: string): Promise<void> {
    // Validate key format
    if (!this.validateKey(provider, key)) {
      throw new Error(`Invalid API key format for ${provider}`);
    }

    try {
      const storageKey = STORAGE_KEYS[provider];

      // In a real implementation, this would use secure storage
      // For now, using localStorage as a placeholder
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(storageKey, key);
      }

      this.logger.info(`API key stored successfully for ${provider}`);
    } catch (error) {
      this.logger.error(`Failed to set API key for ${provider}`, error);
      throw error;
    }
  }

  /**
   * Clear API key for a provider
   */
  async clearApiKey(provider: AIProvider): Promise<void> {
    try {
      const storageKey = STORAGE_KEYS[provider];

      // Remove from storage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(storageKey);
      }

      this.logger.info(`API key cleared for ${provider}`);
    } catch (error) {
      this.logger.error(`Failed to clear API key for ${provider}`, error);
      throw error;
    }
  }

  /**
   * Clear all API keys
   */
  async clearAllKeys(): Promise<void> {
    const providers: AIProvider[] = ['openai', 'anthropic', 'google'];

    for (const provider of providers) {
      await this.clearApiKey(provider);
    }

    this.logger.info('All API keys cleared');
  }

  /**
   * Check if API key exists for a provider
   */
  async hasApiKey(provider: AIProvider): Promise<boolean> {
    const key = await this.getApiKey(provider);
    return key !== null && key.trim() !== '';
  }

  /**
   * Get masked version of API key for display
   */
  getMaskedKey(key: string): string {
    if (!key || key.length < 8) {
      return '••••••••';
    }

    // Show first 4 and last 4 characters
    const start = key.substring(0, 4);
    const end = key.substring(key.length - 4);
    const masked = '•'.repeat(Math.min(key.length - 8, 20));

    return `${start}${masked}${end}`;
  }

  /**
   * Export configuration with API keys
   * WARNING: This exposes sensitive data - use carefully
   */
  async exportConfig(): Promise<Record<AIProvider, string | null>> {
    const config: Record<string, string | null> = {};

    for (const provider of Object.keys(STORAGE_KEYS) as AIProvider[]) {
      config[provider] = await this.getApiKey(provider);
    }

    return config as Record<AIProvider, string | null>;
  }

  /**
   * Import configuration with API keys
   */
  async importConfig(
    config: Partial<Record<AIProvider, string>>,
  ): Promise<void> {
    for (const [provider, key] of Object.entries(config)) {
      if (key && this.validateKey(provider as AIProvider, key)) {
        await this.setApiKey(provider as AIProvider, key);
      }
    }
  }
}

/**
 * Singleton instance
 */
let apiKeyStoreInstance: ApiKeyStore | null = null;

/**
 * Get singleton instance of ApiKeyStore
 */
export function getApiKeyStore(): ApiKeyStore {
  if (!apiKeyStoreInstance) {
    apiKeyStoreInstance = new ApiKeyStore();
  }
  return apiKeyStoreInstance;
}
