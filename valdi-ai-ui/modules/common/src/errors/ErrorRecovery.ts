/**
 * ErrorRecovery
 *
 * Error recovery strategies for the Valdi AI UI application.
 * Includes retry with exponential backoff, cache fallback,
 * graceful degradation, and circuit breaker pattern.
 */

import { AppError, ErrorCode, ErrorSeverity, isAppError } from './ErrorTypes';
import { shouldRetry as shouldRetryError } from './ErrorHandler';

/**
 * Retry Options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;

  /** Initial delay in milliseconds */
  initialDelay?: number;

  /** Maximum delay in milliseconds */
  maxDelay?: number;

  /** Backoff multiplier */
  backoffMultiplier?: number;

  /** Jitter factor (0-1) to add randomness */
  jitterFactor?: number;

  /** Custom retry condition */
  shouldRetry?: (error: unknown, attempt: number) => boolean;

  /** Callback on retry */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/**
 * Circuit Breaker State
 */
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * Circuit Breaker Options
 */
export interface CircuitBreakerOptions {
  /** Failure threshold before opening circuit */
  failureThreshold?: number;

  /** Success threshold to close circuit from half-open */
  successThreshold?: number;

  /** Time in ms to wait before trying half-open */
  resetTimeout?: number;

  /** Time window in ms for counting failures */
  timeWindow?: number;

  /** Callback when circuit opens */
  onOpen?: () => void;

  /** Callback when circuit closes */
  onClose?: () => void;

  /** Callback when circuit half-opens */
  onHalfOpen?: () => void;
}

/**
 * Cache Fallback Options
 */
export interface CacheFallbackOptions<T> {
  /** Cache key */
  key: string;

  /** Cache provider */
  cache?: Map<string, { value: T; timestamp: number }>;

  /** Cache TTL in milliseconds */
  ttl?: number;

  /** Whether to use stale cache on error */
  useStaleOnError?: boolean;
}

/**
 * Retry with exponential backoff
 *
 * Retries an async operation with exponential backoff delay.
 *
 * @param fn - The async function to retry
 * @param options - Retry options
 * @returns The result of the function
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetchData(),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     backoffMultiplier: 2,
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitterFactor = 0.1,
    shouldRetry = shouldRetryError,
    onRetry,
  } = options;

  let lastError: unknown;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      // Check if we should retry
      if (attempt > maxRetries || !shouldRetry(error, attempt - 1)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const baseDelay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay,
      );

      // Add jitter to prevent thundering herd
      const jitter = baseDelay * jitterFactor * (Math.random() * 2 - 1);
      const delay = Math.max(0, baseDelay + jitter);

      // Call retry callback if provided
      if (onRetry) {
        onRetry(error, attempt, delay);
      }

      // Wait before retry
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Fallback to cache on error
 *
 * Attempts to execute a function, falling back to cached value on error.
 *
 * @param fn - The async function to execute
 * @param options - Cache fallback options
 * @returns The result or cached value
 * @throws Error if no cache available
 *
 * @example
 * ```typescript
 * const cache = new Map();
 * const data = await fallbackToCache(
 *   () => fetchData(),
 *   { key: 'data', cache, ttl: 60000 }
 * );
 * ```
 */
export async function fallbackToCache<T>(
  fn: () => Promise<T>,
  options: CacheFallbackOptions<T>,
): Promise<T> {
  const {
    key,
    cache = new Map(),
    ttl = 60000,
    useStaleOnError = true,
  } = options;

  try {
    // Try to execute function
    const result = await fn();

    // Cache the result
    cache.set(key, {
      value: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    // Check if we have a cached value
    const cached = cache.get(key);

    if (cached) {
      const age = Date.now() - cached.timestamp;

      // Use cache if within TTL or if stale is allowed on error
      if (age <= ttl || useStaleOnError) {
        console.warn(
          `[ErrorRecovery] Using cached value for "${key}" (age: ${age}ms)`,
          error,
        );
        return cached.value;
      }
    }

    // No cache available, throw error
    throw error;
  }
}

/**
 * Graceful degradation
 *
 * Attempts primary function, falling back to degraded function on error.
 *
 * @param primaryFn - Primary function to execute
 * @param degradedFn - Degraded function to fall back to
 * @param options - Retry options for primary function
 * @returns Result from primary or degraded function
 *
 * @example
 * ```typescript
 * const result = await gracefulDegradation(
 *   () => fetchFullData(),
 *   () => fetchBasicData(),
 *   { maxRetries: 2 }
 * );
 * ```
 */
export async function gracefulDegradation<T>(
  primaryFn: () => Promise<T>,
  degradedFn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  try {
    // Try primary function with retry
    return await retryWithBackoff(primaryFn, options);
  } catch (error) {
    console.warn(
      '[ErrorRecovery] Primary function failed, using degraded fallback',
      error,
    );

    // Fall back to degraded function
    return await degradedFn();
  }
}

/**
 * Circuit Breaker Class
 *
 * Implements the circuit breaker pattern to prevent cascading failures.
 * Monitors operation failures and opens circuit when threshold is exceeded.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number[] = []; // Timestamps of failures
  private consecutiveSuccesses = 0;
  private options: Required<CircuitBreakerOptions>;
  private resetTimer?: ReturnType<typeof setTimeout>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      resetTimeout: options.resetTimeout ?? 60000,
      timeWindow: options.timeWindow ?? 60000,
      onOpen: options.onOpen ?? (() => {}),
      onClose: options.onClose ?? (() => {}),
      onHalfOpen: options.onHalfOpen ?? (() => {}),
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      throw new AppError(
        'Circuit breaker is open',
        ErrorCode.API_SERVER_ERROR,
        ErrorSeverity.HIGH,
        {
          retryable: false,
          userMessage:
            'Service temporarily unavailable. Please try again later.',
        },
      );
    }

    try {
      const result = await fn();

      // Record success
      this.onSuccess();

      return result;
    } catch (error) {
      // Record failure
      this.onFailure();

      throw error;
    }
  }

  /**
   * Record successful execution
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.consecutiveSuccesses++;

      // Close circuit if success threshold reached
      if (this.consecutiveSuccesses >= this.options.successThreshold) {
        this.close();
      }
    }
  }

  /**
   * Record failed execution
   */
  private onFailure(): void {
    const now = Date.now();

    // Add failure timestamp
    this.failures.push(now);

    // Remove old failures outside time window
    this.failures = this.failures.filter(
      (timestamp) => now - timestamp <= this.options.timeWindow,
    );

    // Check if we should open circuit
    if (this.failures.length >= this.options.failureThreshold) {
      this.open();
    }

    // Reset consecutive successes
    this.consecutiveSuccesses = 0;
  }

  /**
   * Open the circuit
   */
  private open(): void {
    if (this.state === CircuitState.OPEN) {
      return;
    }

    this.state = CircuitState.OPEN;
    this.options.onOpen();

    console.warn(
      `[CircuitBreaker] Circuit opened after ${this.failures.length} failures`,
    );

    // Schedule half-open attempt
    this.resetTimer = setTimeout(() => {
      this.halfOpen();
    }, this.options.resetTimeout);
  }

  /**
   * Half-open the circuit
   */
  private halfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.consecutiveSuccesses = 0;
    this.options.onHalfOpen();

    console.info('[CircuitBreaker] Circuit half-opened, testing recovery');
  }

  /**
   * Close the circuit
   */
  private close(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.consecutiveSuccesses = 0;
    this.options.onClose();

    // Clear reset timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = undefined;
    }

    console.info('[CircuitBreaker] Circuit closed, service recovered');
  }

  /**
   * Get circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures.length;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.close();
  }

  /**
   * Manually open circuit
   */
  forceOpen(): void {
    this.open();
  }

  /**
   * Get statistics
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    consecutiveSuccesses: number;
    threshold: number;
  } {
    return {
      state: this.state,
      failureCount: this.failures.length,
      consecutiveSuccesses: this.consecutiveSuccesses,
      threshold: this.options.failureThreshold,
    };
  }
}

/**
 * Timeout wrapper
 *
 * Wraps an async function with a timeout.
 *
 * @param fn - The async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @returns The result of the function
 * @throws Timeout error if execution exceeds timeout
 *
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   () => longRunningOperation(),
 *   5000
 * );
 * ```
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new AppError(
              `Operation timed out after ${timeoutMs}ms`,
              ErrorCode.API_TIMEOUT,
              ErrorSeverity.MEDIUM,
              {
                retryable: true,
                userMessage: 'Request timed out. Please try again.',
              },
            ),
          ),
        timeoutMs,
      ),
    ),
  ]);
}

/**
 * Batch retry
 *
 * Retries a batch of operations, collecting successes and failures.
 *
 * @param operations - Array of async operations
 * @param options - Retry options
 * @returns Object with successes and failures
 *
 * @example
 * ```typescript
 * const { successes, failures } = await batchRetry(
 *   [() => op1(), () => op2(), () => op3()],
 *   { maxRetries: 2 }
 * );
 * ```
 */
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {},
): Promise<{
  successes: T[];
  failures: Array<{ index: number; error: unknown }>;
}> {
  const successes: T[] = [];
  const failures: Array<{ index: number; error: unknown }> = [];

  // Use Promise.all with wrapped promises that never reject
  await Promise.all(
    operations.map(async (op, index) => {
      try {
        const result = await retryWithBackoff(op, options);
        successes.push(result);
      } catch (error) {
        failures.push({ index, error });
      }
    }),
  );

  return { successes, failures };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounced error recovery
 *
 * Debounces retries to prevent rapid repeated attempts.
 *
 * @param fn - Function to execute
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounceRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 1000,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastPromise: Promise<ReturnType<T>> | undefined;

  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Return existing promise if still pending
    if (lastPromise) {
      return lastPromise;
    }

    // Create new promise after delay
    lastPromise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          lastPromise = undefined;
        }
      }, delay);
    });

    return lastPromise;
  };
}

/**
 * Error recovery decorator
 *
 * Decorator to add error recovery to a method.
 *
 * @param options - Retry options
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * class Service {
 *   @withErrorRecovery({ maxRetries: 3 })
 *   async fetchData() {
 *     // ...
 *   }
 * }
 * ```
 */
export function withErrorRecovery(options: RetryOptions = {}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return retryWithBackoff(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}
