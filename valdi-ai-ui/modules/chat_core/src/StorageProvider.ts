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
 */
export interface StorageProvider {
  /**
   * Get an item from storage
   * @param key Storage key
   * @returns The stored value or null if not found
   */
  getItem: (key: string) => Promise<string | null>;

  /**
   * Set an item in storage
   * @param key Storage key
   * @param value Value to store (as string)
   */
  setItem: (key: string, value: string) => Promise<void>;

  /**
   * Remove an item from storage
   * @param key Storage key
   */
  removeItem: (key: string) => Promise<void>;

  /**
   * Clear all items from storage
   */
  clear: () => Promise<void>;

  /**
   * Get all keys in storage
   * @returns Array of storage keys
   */
  getAllKeys: () => Promise<string[]>;
}

/**
 * LocalStorage Provider
 *
 * Browser localStorage implementation.
 * Uses synchronous localStorage API wrapped in Promises for consistency.
 */
export class LocalStorageProvider implements StorageProvider {
  private readonly prefix: string;

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
 * In-memory storage implementation for testing or fallback.
 * Data is lost when the application is closed/refreshed.
 */
export class MemoryStorageProvider implements StorageProvider {
  private readonly storage: Map<string, string> = new Map();
  private readonly prefix: string;

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
 * Creates appropriate storage provider based on environment.
 */
export class StorageFactory {
  /**
   * Create storage provider with automatic fallback
   * @param prefix Key prefix for namespacing
   * @param preferredType Preferred storage type
   * @returns Storage provider instance
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
   * @throws Error if localStorage is not available
   */
  static createLocalStorage(prefix: string = 'valdi_'): LocalStorageProvider {
    if (!LocalStorageProvider.isAvailable()) {
      throw new Error('localStorage is not available');
    }
    return new LocalStorageProvider(prefix);
  }

  /**
   * Create memory storage provider
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
