/**
 * StorageProvider
 *
 * Abstract storage interface and implementations for persisting data.
 * Supports multiple storage backends (localStorage, memory, etc.)
 */

/**
 * Storage Provider Interface
 *
 * Abstract interface for key-value storage operations.
 * Implementations can use localStorage, AsyncStorage, memory, etc.
 * All methods return Promises for consistency across sync and async backends.
 *
 * @example
 * ```typescript
 * // Using with localStorage
 * const storage: StorageProvider = new LocalStorageProvider('myapp_');
 * await storage.setItem('user', JSON.stringify({ name: 'Alice' }));
 * const user = await storage.getItem('user');
 *
 * // Using with memory storage
 * const memStorage: StorageProvider = new MemoryStorageProvider();
 * await memStorage.setItem('temp', 'value');
 * ```
 */
export interface StorageProvider {
  /**
   * Get an item from storage
   *
   * @param key - The storage key to retrieve
   * @returns A promise resolving to the stored value or null if not found
   *
   * @example
   * ```typescript
   * const value = await storage.getItem('settings');
   * if (value) {
   *   const settings = JSON.parse(value);
   * }
   * ```
   */
  getItem: (key: string) => Promise<string | null>;

  /**
   * Set an item in storage
   *
   * @param key - The storage key
   * @param value - The value to store (must be a string; use JSON.stringify for objects)
   * @returns A promise that resolves when the item is stored
   *
   * @throws {Error} If storage quota is exceeded or storage is unavailable
   *
   * @example
   * ```typescript
   * await storage.setItem('config', JSON.stringify({ theme: 'dark' }));
   * ```
   */
  setItem: (key: string, value: string) => Promise<void>;

  /**
   * Remove an item from storage
   *
   * @param key - The storage key to remove
   * @returns A promise that resolves when the item is removed
   *
   * @example
   * ```typescript
   * await storage.removeItem('cache');
   * ```
   */
  removeItem: (key: string) => Promise<void>;

  /**
   * Clear all items from storage
   *
   * @returns A promise that resolves when all items are cleared
   *
   * @example
   * ```typescript
   * await storage.clear(); // Removes all items with the configured prefix
   * ```
   */
  clear: () => Promise<void>;

  /**
   * Get all keys in storage
   *
   * @returns A promise resolving to an array of all storage keys (without prefix)
   *
   * @example
   * ```typescript
   * const keys = await storage.getAllKeys();
   * console.log('Stored keys:', keys); // ['settings', 'user', 'cache']
   * ```
   */
  getAllKeys: () => Promise<string[]>;
}

/**
 * LocalStorage Provider
 *
 * Browser localStorage implementation for persistent client-side storage.
 * Uses synchronous localStorage API wrapped in Promises for API consistency.
 * Automatically prefixes all keys to avoid collisions with other applications.
 *
 * @example
 * ```typescript
 * const storage = new LocalStorageProvider('myapp_');
 * await storage.setItem('user', JSON.stringify({ id: 1 }));
 * const userData = await storage.getItem('user');
 * // Actually stored as 'myapp_user' in localStorage
 * ```
 */
export class LocalStorageProvider implements StorageProvider {
  private readonly prefix: string;

  /**
   * Create a new LocalStorageProvider instance
   *
   * @param prefix - Key prefix for namespacing (default: 'valdi_')
   *
   * @example
   * ```typescript
   * const storage = new LocalStorageProvider('myapp_');
   * ```
   */
  constructor(prefix: string = 'valdi_') {
    this.prefix = prefix;
  }

  /**
   * Get prefixed key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available');
      }
      return window.localStorage.getItem(this.getKey(key));
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available');
      }
      window.localStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available');
      }
      window.localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('LocalStorage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available');
      }
      // Only clear items with our prefix
      const keys = await this.getAllKeys();
      keys.forEach((key) => {
        window.localStorage.removeItem(this.getKey(key));
      });
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available');
      }
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.error('LocalStorage getAllKeys error:', error);
      return [];
    }
  }

  /**
   * Check if localStorage is available
   *
   * Tests whether localStorage is available and functional in the current environment.
   * Useful for feature detection before attempting to use localStorage.
   *
   * @returns True if localStorage is available and writable
   *
   * @example
   * ```typescript
   * if (LocalStorageProvider.isAvailable()) {
   *   const storage = new LocalStorageProvider();
   *   await storage.setItem('key', 'value');
   * } else {
   *   console.warn('localStorage not available, using fallback');
   *   const storage = new MemoryStorageProvider();
   * }
   * ```
   */
  static isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__valdi_storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Memory Storage Provider
 *
 * In-memory storage implementation using a Map for temporary data storage.
 * Useful for testing, server-side rendering, or as a fallback when localStorage
 * is unavailable. Data is lost when the application is closed/refreshed.
 *
 * @example
 * ```typescript
 * const storage = new MemoryStorageProvider('test_');
 * await storage.setItem('temp', 'value');
 * const value = await storage.getItem('temp'); // 'value'
 * // Refresh page -> data is gone
 * ```
 */
export class MemoryStorageProvider implements StorageProvider {
  private readonly storage: Map<string, string> = new Map();
  private readonly prefix: string;

  /**
   * Create a new MemoryStorageProvider instance
   *
   * @param prefix - Key prefix for namespacing (default: 'valdi_')
   *
   * @example
   * ```typescript
   * const storage = new MemoryStorageProvider('app_');
   * ```
   */
  constructor(prefix: string = 'valdi_') {
    this.prefix = prefix;
  }

  /**
   * Get prefixed key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.get(this.getKey(key)) || null;
    } catch (error) {
      console.error('MemoryStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.set(this.getKey(key), value);
    } catch (error) {
      console.error('MemoryStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.delete(this.getKey(key));
    } catch (error) {
      console.error('MemoryStorage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      // Only clear items with our prefix
      const keys = Array.from(this.storage.keys()).filter((key) =>
        key.startsWith(this.prefix),
      );
      keys.forEach((key) => this.storage.delete(key));
    } catch (error) {
      console.error('MemoryStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Array.from(this.storage.keys())
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.substring(this.prefix.length));
    } catch (error) {
      console.error('MemoryStorage getAllKeys error:', error);
      return [];
    }
  }

  /**
   * Get storage size (for testing/debugging)
   */
  getSize(): number {
    return this.storage.size;
  }

  /**
   * Get all entries (for debugging)
   */
  getAllEntries(): Record<string, string> {
    const entries: Record<string, string> = {};
    this.storage.forEach((value, key) => {
      if (key.startsWith(this.prefix)) {
        entries[key.substring(this.prefix.length)] = value;
      }
    });
    return entries;
  }
}

/**
 * Storage Factory
 *
 * Factory class for creating storage providers with automatic fallback support.
 * Simplifies storage initialization by handling environment detection and fallbacks.
 *
 * @example
 * ```typescript
 * // Automatic selection with fallback
 * const storage = StorageFactory.create('myapp_', 'local');
 * // Uses localStorage if available, falls back to memory
 *
 * // Force localStorage (throws if unavailable)
 * const localStorage = StorageFactory.createLocalStorage('myapp_');
 *
 * // Always use memory storage
 * const memStorage = StorageFactory.createMemoryStorage('test_');
 * ```
 */
export class StorageFactory {
  /**
   * Create storage provider with automatic fallback
   *
   * Attempts to create the preferred storage type, automatically falling back
   * to memory storage if the preferred type is unavailable.
   *
   * @param prefix - Key prefix for namespacing (default: 'valdi_')
   * @param preferredType - Preferred storage type (default: 'local')
   * @returns A StorageProvider instance (LocalStorage or Memory)
   *
   * @example
   * ```typescript
   * // Try localStorage, fallback to memory
   * const storage = StorageFactory.create('app_', 'local');
   *
   * // Always use memory
   * const testStorage = StorageFactory.create('test_', 'memory');
   * ```
   */
  static create(
    prefix: string = 'valdi_',
    preferredType: 'local' | 'memory' = 'local',
  ): StorageProvider {
    // Try localStorage if preferred and available
    if (preferredType === 'local' && LocalStorageProvider.isAvailable()) {
      console.log('[Storage] Using LocalStorage');
      return new LocalStorageProvider(prefix);
    }

    // Fallback to memory storage
    console.log('[Storage] Using MemoryStorage (fallback)');
    return new MemoryStorageProvider(prefix);
  }

  /**
   * Create localStorage provider
   *
   * Creates a LocalStorageProvider instance, throwing an error if
   * localStorage is not available in the current environment.
   *
   * @param prefix - Key prefix for namespacing (default: 'valdi_')
   * @returns A LocalStorageProvider instance
   * @throws {Error} If localStorage is not available
   *
   * @example
   * ```typescript
   * try {
   *   const storage = StorageFactory.createLocalStorage('app_');
   *   await storage.setItem('key', 'value');
   * } catch (error) {
   *   console.error('localStorage not available:', error);
   * }
   * ```
   */
  static createLocalStorage(prefix: string = 'valdi_'): LocalStorageProvider {
    if (!LocalStorageProvider.isAvailable()) {
      throw new Error('localStorage is not available');
    }
    return new LocalStorageProvider(prefix);
  }

  /**
   * Create memory storage provider
   *
   * Creates a MemoryStorageProvider instance for temporary in-memory storage.
   * Useful for testing or when persistent storage is not needed.
   *
   * @param prefix - Key prefix for namespacing (default: 'valdi_')
   * @returns A MemoryStorageProvider instance
   *
   * @example
   * ```typescript
   * const storage = StorageFactory.createMemoryStorage('test_');
   * await storage.setItem('temp', 'value');
   * // Data lost on page refresh
   * ```
   */
  static createMemoryStorage(prefix: string = 'valdi_'): MemoryStorageProvider {
    return new MemoryStorageProvider(prefix);
  }
}

/**
 * Default storage instance
 * Uses localStorage with fallback to memory
 */
export const defaultStorage = StorageFactory.create();
