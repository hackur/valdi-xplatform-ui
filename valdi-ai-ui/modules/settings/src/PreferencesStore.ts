/**
 * Preferences Store
 *
 * Manages app preferences persistence using StorageProvider.
 * Handles non-sensitive user settings like theme, models, and app preferences.
 */

import { StorageFactory } from '../../chat_core/src/StorageProvider';
import type { StorageProvider } from '../../chat_core/src/StorageProvider';
import type { AIProvider } from './ApiKeyStore';

/**
 * App Preferences Interface
 */
export interface AppPreferences {
  // Provider Settings
  selectedProvider?: AIProvider;

  // Model Selections
  openAiModel?: string;
  anthropicModel?: string;
  googleModel?: string;

  // App Preferences
  darkMode?: boolean;
  enableNotifications?: boolean;
  enableSoundEffects?: boolean;
}

/**
 * Preferences Store
 *
 * Manages application preferences with localStorage persistence.
 */
export class PreferencesStore {
  private storage: StorageProvider;
  private readonly PREFERENCES_KEY = 'app_preferences';

  constructor() {
    // Create storage with 'valdi_settings_' prefix
    this.storage = StorageFactory.create('valdi_settings_');
  }

  /**
   * Get all preferences
   */
  async getPreferences(): Promise<AppPreferences> {
    try {
      const stored = await this.storage.getItem(this.PREFERENCES_KEY);

      if (!stored) {
        return {};
      }

      return JSON.parse(stored) as AppPreferences;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {};
    }
  }

  /**
   * Save all preferences
   */
  async savePreferences(preferences: AppPreferences): Promise<void> {
    try {
      const stored = JSON.stringify(preferences);
      await this.storage.setItem(this.PREFERENCES_KEY, stored);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  /**
   * Update partial preferences (merge with existing)
   */
  async updatePreferences(partial: Partial<AppPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...partial };
      await this.savePreferences(updated);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * Get a specific preference value
   */
  async getPreference<K extends keyof AppPreferences>(
    key: K,
  ): Promise<AppPreferences[K] | undefined> {
    try {
      const preferences = await this.getPreferences();
      return preferences[key];
    } catch (error) {
      console.error(`Failed to get preference ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set a specific preference value
   */
  async setPreference<K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K],
  ): Promise<void> {
    try {
      await this.updatePreferences({ [key]: value } as Partial<AppPreferences>);
    } catch (error) {
      console.error(`Failed to set preference ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all preferences
   */
  async clearPreferences(): Promise<void> {
    try {
      await this.storage.removeItem(this.PREFERENCES_KEY);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
      throw error;
    }
  }

  /**
   * Get selected provider
   */
  async getSelectedProvider(): Promise<AIProvider | undefined> {
    return this.getPreference('selectedProvider');
  }

  /**
   * Set selected provider
   */
  async setSelectedProvider(provider: AIProvider): Promise<void> {
    return this.setPreference('selectedProvider', provider);
  }

  /**
   * Get model for provider
   */
  async getModelForProvider(provider: AIProvider): Promise<string | undefined> {
    const key = `${provider}Model` as keyof AppPreferences;
    const value = await this.getPreference(key);
    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Set model for provider
   */
  async setModelForProvider(
    provider: AIProvider,
    model: string,
  ): Promise<void> {
    const key = `${provider}Model` as keyof AppPreferences;
    return this.setPreference(key, model);
  }

  /**
   * Get dark mode setting
   */
  async getDarkMode(): Promise<boolean> {
    const value = await this.getPreference('darkMode');
    return value ?? false;
  }

  /**
   * Set dark mode setting
   */
  async setDarkMode(enabled: boolean): Promise<void> {
    return this.setPreference('darkMode', enabled);
  }

  /**
   * Get notifications setting
   */
  async getNotificationsEnabled(): Promise<boolean> {
    const value = await this.getPreference('enableNotifications');
    return value ?? true;
  }

  /**
   * Set notifications setting
   */
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    return this.setPreference('enableNotifications', enabled);
  }

  /**
   * Get sound effects setting
   */
  async getSoundEffectsEnabled(): Promise<boolean> {
    const value = await this.getPreference('enableSoundEffects');
    return value ?? true;
  }

  /**
   * Set sound effects setting
   */
  async setSoundEffectsEnabled(enabled: boolean): Promise<void> {
    return this.setPreference('enableSoundEffects', enabled);
  }
}
