/**
 * Network Retry Utility
 *
 * Provides automatic retry logic for network requests with exponential backoff.
 * Handles offline detection and connection quality monitoring.
 */

/**
 * Retry Configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries?: number;

  /** Initial delay in ms */
  initialDelay?: number;

  /** Maximum delay in ms */
  maxDelay?: number;

  /** Backoff multiplier */
  backoffMultiplier?: number;

  /** Retry on these status codes */
  retryStatusCodes?: number[];

  /** Should retry on network errors */
  retryOnNetworkError?: boolean;

  /** Timeout in ms */
  timeout?: number;

  /** On retry callback */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Network Status
 */
export interface NetworkStatus {
  /** Is online */
  isOnline: boolean;

  /** Connection type */
  type?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';

  /** Effective bandwidth (Mbps) */
  effectiveBandwidth?: number;

  /** Last check timestamp */
  lastCheck: Date;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  retryOnNetworkError: true,
  timeout: 30000,
  onRetry: () => {},
};

/**
 * Network Retry Class
 *
 * Handles network request retries with exponential backoff.
 */
export class NetworkRetry {
  private config: Required<RetryConfig>;
  private networkStatus: NetworkStatus = {
    isOnline: true,
    lastCheck: new Date(),
  };

  constructor(config: RetryConfig = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.initializeNetworkMonitoring();
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Check network status
        if (!this.networkStatus.isOnline) {
          throw new Error('Network offline');
        }

        // Execute with timeout
        const result = await this.withTimeout(fn(), this.config.timeout);
        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry
        if (
          attempt < this.config.maxRetries &&
          this.shouldRetry(error as Error)
        ) {
          const delay = this.calculateDelay(attempt);

          // Call retry callback
          this.config.onRetry(attempt + 1, error as Error);

          console.log(
            `[NetworkRetry] Retry attempt ${attempt + 1}/${this.config.maxRetries} after ${delay}ms`,
          );

          // Wait before retry
          await this.delay(delay);
        } else {
          // No more retries or non-retryable error
          break;
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Execute fetch with retry
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    return this.execute(async () => {
      const response = await fetch(url, options);

      if (
        !response.ok &&
        this.config.retryStatusCodes.includes(response.status)
      ) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    });
  }

  /**
   * Check if error is retryable
   */
  private shouldRetry(error: Error): boolean {
    // Network errors
    if (
      this.config.retryOnNetworkError &&
      (error.message.includes('Network') ||
        error.message.includes('fetch') ||
        error.message.includes('offline'))
    ) {
      return true;
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return true;
    }

    // HTTP status codes are handled in fetch method
    return false;
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay =
      this.config.initialDelay *
      Math.pow(this.config.backoffMultiplier, attempt);
    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute with timeout
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs),
      ),
    ]);
  }

  /**
   * Initialize network monitoring
   */
  private initializeNetworkMonitoring(): void {
    // Check if running in browser/mobile environment
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // Listen to online/offline events
      window.addEventListener('online', () => {
        this.updateNetworkStatus({ isOnline: true });
      });

      window.addEventListener('offline', () => {
        this.updateNetworkStatus({ isOnline: false });
      });

      // Initial status
      this.updateNetworkStatus({ isOnline: navigator.onLine });
    }
  }

  /**
   * Update network status
   */
  private updateNetworkStatus(status: Partial<NetworkStatus>): void {
    this.networkStatus = {
      ...this.networkStatus,
      ...status,
      lastCheck: new Date(),
    };

    console.log('[NetworkRetry] Network status updated:', this.networkStatus);
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  /**
   * Force online check
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch a small resource
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      const isOnline = response.ok;
      this.updateNetworkStatus({ isOnline });
      return isOnline;
    } catch {
      this.updateNetworkStatus({ isOnline: false });
      return false;
    }
  }
}

/**
 * Create network retry instance
 */
export function createNetworkRetry(config?: RetryConfig): NetworkRetry {
  return new NetworkRetry(config);
}

/**
 * Global network retry instance
 */
export const networkRetry = createNetworkRetry();

/**
 * Retry decorator for methods
 */
export function withRetry(config?: RetryConfig) {
  const retry = createNetworkRetry(config);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return retry.execute(() => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
