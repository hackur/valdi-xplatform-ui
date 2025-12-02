/**
 * Error Boundary Utility
 *
 * Provides error boundary functionality for catching and handling component errors.
 * Follows SOLID principles with clean error handling patterns.
 */

/**
 * Error Info
 */
export interface ErrorInfo {
  /** Error message */
  message: string;

  /** Error stack trace */
  stack?: string;

  /** Component that threw the error */
  component?: string;

  /** Timestamp */
  timestamp: Date;

  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Error Boundary Callback
 */
export type ErrorBoundaryCallback = (error: Error, info: ErrorInfo) => void;

/**
 * Error Recovery Strategy
 */
export type RecoveryStrategy = 'retry' | 'fallback' | 'ignore' | 'escalate';

/**
 * Error Boundary Configuration
 */
export interface ErrorBoundaryConfig {
  /** Component name for logging */
  componentName: string;

  /** Custom error handler */
  onError?: ErrorBoundaryCallback;

  /** Recovery strategy */
  recovery?: RecoveryStrategy;

  /** Max retry attempts */
  maxRetries?: number;

  /** Fallback value/component */
  fallback?: any;

  /** Should log errors */
  logErrors?: boolean;
}

/**
 * Error Boundary Class
 *
 * Wraps components and functions to catch and handle errors gracefully.
 * Provides configurable error recovery strategies and retry logic.
 *
 * @example
 * ```typescript
 * const boundary = new ErrorBoundary({
 *   componentName: 'ChatComponent',
 *   recovery: 'retry',
 *   maxRetries: 3,
 *   onError: (error, info) => {
 *     console.error('Error in chat:', error);
 *   }
 * });
 *
 * const safeFetch = boundary.wrapAsync(async () => {
 *   return await fetchMessages();
 * });
 * ```
 */
export class ErrorBoundary {
  private readonly config: Required<ErrorBoundaryConfig>;
  private errorCount: number = 0;
  private lastError?: Error;

  /**
   * Create a new ErrorBoundary instance
   *
   * @param config - Configuration options for the error boundary
   *
   * @example
   * ```typescript
   * const boundary = new ErrorBoundary({
   *   componentName: 'MyComponent',
   *   recovery: 'fallback',
   *   fallback: null,
   *   logErrors: true
   * });
   * ```
   */
  constructor(config: ErrorBoundaryConfig) {
    this.config = {
      componentName: config.componentName,
      onError: config.onError || this.defaultErrorHandler,
      recovery: config.recovery || 'fallback',
      maxRetries: config.maxRetries || 3,
      fallback: config.fallback || null,
      logErrors: config.logErrors !== false,
    };
  }

  /**
   * Wrap a function with error handling
   *
   * Wraps a synchronous or promise-returning function with error handling.
   * Automatically catches and handles errors according to the recovery strategy.
   *
   * @param fn - The function to wrap with error handling
   * @returns The wrapped function with the same signature
   *
   * @example
   * ```typescript
   * const boundary = new ErrorBoundary({ componentName: 'API' });
   * const safeParse = boundary.wrap((data: string) => JSON.parse(data));
   *
   * const result = safeParse('{"valid": "json"}'); // Works
   * const failed = safeParse('invalid json'); // Returns fallback value
   * ```
   */
  wrap<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);

        // Handle promises
        if (result instanceof Promise) {
          return result.catch((error) => this.handleError(error, fn.name));
        }

        return result;
      } catch (error) {
        return this.handleError(error as Error, fn.name);
      }
    }) as T;
  }

  /**
   * Wrap an async function with error handling
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        return this.handleError(error as Error, fn.name);
      }
    }) as T;
  }

  /**
   * Handle error
   */
  private handleError(error: Error, functionName?: string): any {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      component: this.config.componentName,
      timestamp: new Date(),
      context: {
        function: functionName,
        errorCount: this.errorCount + 1,
      },
    };

    // Log error
    if (this.config.logErrors) {
      console.error(
        `[ErrorBoundary: ${this.config.componentName}]`,
        error,
        errorInfo,
      );
    }

    // Call custom error handler
    this.config.onError(error, errorInfo);

    // Increment error count
    this.errorCount++;
    this.lastError = error;

    // Apply recovery strategy
    return this.applyRecoveryStrategy(error);
  }

  /**
   * Apply recovery strategy
   */
  private applyRecoveryStrategy(error: Error): any {
    switch (this.config.recovery) {
      case 'retry':
        if (this.errorCount <= this.config.maxRetries) {
          console.log(
            `[ErrorBoundary] Retrying... (${this.errorCount}/${this.config.maxRetries})`,
          );
          // Caller should implement retry logic
          return undefined;
        }
        // Fall through to fallback
        return this.config.fallback;

      case 'fallback':
        return this.config.fallback;

      case 'ignore':
        return undefined;

      case 'escalate':
        throw error;

      default:
        return this.config.fallback;
    }
  }

  /**
   * Reset error boundary
   */
  reset(): void {
    this.errorCount = 0;
    this.lastError = undefined;
  }

  /**
   * Get error info
   */
  getErrorInfo(): { count: number; lastError?: Error } {
    return {
      count: this.errorCount,
      lastError: this.lastError,
    };
  }

  /**
   * Default error handler
   */
  private defaultErrorHandler(error: Error, info: ErrorInfo): void {
    // Default: just log
    console.error('[ErrorBoundary] Error occurred:', {
      component: info.component,
      message: error.message,
      timestamp: info.timestamp,
    });
  }
}

/**
 * Create error boundary for a component
 */
export function createErrorBoundary(
  componentName: string,
  options?: Partial<ErrorBoundaryConfig>,
): ErrorBoundary {
  return new ErrorBoundary({
    componentName,
    ...options,
  });
}

/**
 * Error boundary decorator (for methods)
 */
export function withErrorBoundary(
  componentName: string,
  options?: Partial<ErrorBoundaryConfig>,
) {
  const boundary = createErrorBoundary(componentName, options);

  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.catch((error) => {
            boundary.wrap(() => {
              throw error;
            })();
          });
        }

        return result;
      } catch (error) {
        return boundary.wrap(() => {
          throw error;
        })();
      }
    };

    return descriptor;
  };
}
