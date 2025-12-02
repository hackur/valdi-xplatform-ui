/**
 * Model Config Singletons
 *
 * Global singleton instances for CustomProviderStore and ModelRegistry
 */

import { CustomProviderStore } from './CustomProviderStore';
import { ModelRegistry } from './ModelRegistry';
import { StorageFactory } from '../../common/src/services/StorageProvider';

/**
 * Global CustomProviderStore instance
 */
let customProviderStoreInstance: CustomProviderStore | null = null;

/**
 * Global ModelRegistry instance
 */
let modelRegistryInstance: ModelRegistry | null = null;

/**
 * Get or create CustomProviderStore singleton
 */
export function getCustomProviderStore(): CustomProviderStore {
  if (!customProviderStoreInstance) {
    try {
      // Use StorageFactory to automatically select appropriate storage for platform
      // On iOS: falls back to MemoryStorageProvider (no localStorage)
      // On Web: uses LocalStorageProvider
      const storageProvider = StorageFactory.create('valdi_model_config_', 'local');
      console.log('[ModelConfig] Storage provider created');

      customProviderStoreInstance = new CustomProviderStore(storageProvider);
      // Initialize asynchronously
      customProviderStoreInstance.initialize().catch((error: unknown) => {
        console.error('[ModelConfig] Failed to initialize CustomProviderStore:', error);
      });
    } catch (error) {
      console.error('[ModelConfig] CRITICAL: Failed to create CustomProviderStore:', error);
      throw new Error(`CustomProviderStore creation failed: ${error}`);
    }
  }
  return customProviderStoreInstance;
}

/**
 * Get or create ModelRegistry singleton
 */
export function getModelRegistry(): ModelRegistry {
  if (!modelRegistryInstance) {
    const customProviderStore = getCustomProviderStore();
    modelRegistryInstance = new ModelRegistry(customProviderStore);
  }
  return modelRegistryInstance;
}

/**
 * Reset all singletons (for testing)
 */
export function resetModelConfigSingletons(): void {
  customProviderStoreInstance = null;
  modelRegistryInstance = null;
}
