/**
 * ErrorHandler
 *
 * Central error handling utilities for the Valdi AI UI application.
 * Provides consistent error handling, logging, and user-friendly message formatting.
 */

import {
  AppError,
  APIError,
  ValidationError,
  StorageError,
  StreamError,
  WorkflowError,
  ErrorCode,
  ErrorSeverity,
  isAppError,
  isAPIError,
  isValidationError,
  isStorageError,
  isStreamError,
  isWorkflowError,
} from './ErrorTypes';

/**
 * Error Log Entry
 */
export interface ErrorLogEntry {
  /** Error ID for tracking */
  id: string;

  /** Timestamp */
  timestamp: string;

  /** Error code */
  code: string;

  /** Severity level */
  severity: ErrorSeverity;

  /** Error message */
  message: string;

  /** User-friendly message */
  userMessage?: string;

  /** Stack trace */
  stack?: string;

  /** Context data */
  context?: Record<string, unknown>;

  /** Whether error is retryable */
  retryable: boolean;
}

/**
 * Error Handler Options
 */
export interface ErrorHandlerOptions {
  /** Enable console logging */
  enableLogging?: boolean;

  /** Enable error tracking/reporting */
  enableTracking?: boolean;

  /** Custom error logger function */
  logger?: (entry: ErrorLogEntry) => void;

  /** Custom error tracker function (e.g., Sentry, Bugsnag) */
  tracker?: (error: AppError) => void;
}

/**
 * Error Handler Class
 *
 * Central error handler for the application.
 */
export class ErrorHandler {
  private options: Required<ErrorHandlerOptions>;
  private errorLog: ErrorLogEntry[] = [];
  private errorCount = 0;

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableLogging: options.enableLogging ?? true,
      enableTracking: options.enableTracking ?? false,
      logger: options.logger ?? this.defaultLogger.bind(this),
      tracker: options.tracker ?? this.defaultTracker.bind(this),
    };
  }

  /**
   * Handle an error
   *
   * Central error handling function. Logs the error, tracks it if enabled,
   * and returns a user-friendly error object.
   *
   * @param error - The error to handle
   * @param context - Additional context data
   * @returns User-friendly error information
   */
  handleError(
    error: unknown,
    context?: Record<string, unknown>,
  ): {
    code: string;
    message: string;
    userMessage: string;
    severity: ErrorSeverity;
    retryable: boolean;
  } {
    // Convert to AppError if not already
    const appError = this.normalizeError(error, context);

    // Log the error
    if (this.options.enableLogging) {
      this.logError(appError);
    }

    // Track the error if enabled
    if (this.options.enableTracking) {
      this.options.tracker(appError);
    }

    // Return user-friendly error info
    return {
      code: appError.code,
      message: appError.message,
      userMessage: appError.userMessage || this.formatErrorForUI(appError),
      severity: appError.severity,
      retryable: appError.retryable,
    };
  }

  /**
   * Log an error
   *
   * Logs error details to console and internal error log.
   *
   * @param error - The error to log
   */
  logError(error: AppError): void {
    const entry: ErrorLogEntry = {
      id: this.generateErrorId(),
      timestamp: error.timestamp.toISOString(),
      code: error.code,
      severity: error.severity,
      message: error.message,
      userMessage: error.userMessage,
      stack: error.stack,
      context: error.context,
      retryable: error.retryable,
    };

    // Add to internal log (keep last 100 errors)
    this.errorLog.push(entry);
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Call custom logger
    this.options.logger(entry);
  }

  /**
   * Default logger implementation
   */
  private defaultLogger(entry: ErrorLogEntry): void {
    const prefix = `[${entry.severity.toUpperCase()}] ${entry.code}`;

    switch (entry.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(prefix, entry.message, entry);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(prefix, entry.message, entry);
        break;
      case ErrorSeverity.LOW:
        console.info(prefix, entry.message, entry);
        break;
    }
  }

  /**
   * Default tracker implementation (no-op)
   */
  private defaultTracker(_error: AppError): void {
    // Override with external tracking service (Sentry, Bugsnag, etc.)
  }

  /**
   * Normalize any error to AppError
   */
  private normalizeError(
    error: unknown,
    context?: Record<string, unknown>,
  ): AppError {
    if (isAppError(error)) {
      // Add additional context if provided
      if (context) {
        return new AppError(error.message, error.code, error.severity, {
          context: { ...error.context, ...context },
          retryable: error.retryable,
          cause: error.cause,
          userMessage: error.userMessage,
        });
      }
      return error;
    }

    if (error instanceof Error) {
      // Convert native Error to AppError
      return new AppError(
        error.message,
        ErrorCode.UNKNOWN,
        ErrorSeverity.MEDIUM,
        {
          cause: error,
          context,
          retryable: false,
        },
      );
    }

    // Unknown error type
    return new AppError(
      String(error),
      ErrorCode.UNKNOWN,
      ErrorSeverity.MEDIUM,
      {
        context,
        retryable: false,
      },
    );
  }

  /**
   * Determine if an error should be retried
   *
   * Checks if an error is retryable based on error type and properties.
   *
   * @param error - The error to check
   * @param attemptNumber - Current retry attempt number
   * @param maxRetries - Maximum number of retries allowed
   * @returns Whether to retry the operation
   */
  shouldRetry(
    error: unknown,
    attemptNumber: number = 0,
    maxRetries: number = 3,
  ): boolean {
    // Don't retry if max retries exceeded
    if (attemptNumber >= maxRetries) {
      return false;
    }

    // Check if error is retryable
    if (isAppError(error)) {
      return error.retryable;
    }

    // For unknown errors, check error message
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Retry network and timeout errors
      if (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('econnrefused') ||
        message.includes('econnreset')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get error severity
   *
   * Determines the severity level of an error.
   *
   * @param error - The error to evaluate
   * @returns Severity level
   */
  getErrorSeverity(error: unknown): ErrorSeverity {
    if (isAppError(error)) {
      return error.severity;
    }

    // Default to medium for unknown errors
    return ErrorSeverity.MEDIUM;
  }

  /**
   * Format error for UI display
   *
   * Converts an error into a user-friendly message.
   *
   * @param error - The error to format
   * @returns User-friendly error message
   */
  formatErrorForUI(error: unknown): string {
    if (isAPIError(error)) {
      return this.formatAPIError(error);
    }

    if (isValidationError(error)) {
      return this.formatValidationError(error);
    }

    if (isStorageError(error)) {
      return this.formatStorageError(error);
    }

    if (isStreamError(error)) {
      return this.formatStreamError(error);
    }

    if (isWorkflowError(error)) {
      return this.formatWorkflowError(error);
    }

    if (isAppError(error)) {
      return error.userMessage || error.message;
    }

    if (error instanceof Error) {
      return 'An unexpected error occurred. Please try again.';
    }

    return 'An unknown error occurred. Please try again.';
  }

  /**
   * Format API error for UI
   */
  private formatAPIError(error: APIError): string {
    switch (error.code) {
      case ErrorCode.API_NETWORK_ERROR:
        return 'Network error. Please check your internet connection and try again.';

      case ErrorCode.API_TIMEOUT:
        return 'Request timed out. Please try again.';

      case ErrorCode.API_RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';

      case ErrorCode.API_AUTHENTICATION:
        return 'Authentication failed. Please check your API key in settings.';

      case ErrorCode.API_AUTHORIZATION:
        return 'You do not have permission to access this resource.';

      case ErrorCode.API_QUOTA_EXCEEDED:
        return 'API quota exceeded. Please check your provider dashboard.';

      case ErrorCode.API_SERVER_ERROR:
        return 'Server error. Please try again later.';

      case ErrorCode.API_NOT_FOUND:
        return 'Resource not found.';

      default:
        return `API error: ${error.message}`;
    }
  }

  /**
   * Format validation error for UI
   */
  private formatValidationError(error: ValidationError): string {
    if (error.field) {
      return `Invalid ${error.field}: ${error.message}`;
    }
    return `Validation error: ${error.message}`;
  }

  /**
   * Format storage error for UI
   */
  private formatStorageError(error: StorageError): string {
    switch (error.code) {
      case ErrorCode.STORAGE_QUOTA_EXCEEDED:
        return 'Storage quota exceeded. Please delete some conversations to free up space.';

      case ErrorCode.STORAGE_READ_ERROR:
        return 'Failed to load data. Please try again.';

      case ErrorCode.STORAGE_WRITE_ERROR:
        return 'Failed to save data. Please try again.';

      case ErrorCode.STORAGE_CORRUPTION:
        return 'Data corruption detected. Some data may be lost.';

      default:
        return `Storage error: ${error.message}`;
    }
  }

  /**
   * Format stream error for UI
   */
  private formatStreamError(error: StreamError): string {
    switch (error.code) {
      case ErrorCode.STREAM_CONNECTION:
        return 'Failed to establish streaming connection. Please try again.';

      case ErrorCode.STREAM_TIMEOUT:
        return 'Streaming request timed out. Please try again.';

      case ErrorCode.STREAM_INTERRUPTED:
        return 'Stream was interrupted. Please try again.';

      default:
        return `Streaming error: ${error.message}`;
    }
  }

  /**
   * Format workflow error for UI
   */
  private formatWorkflowError(error: WorkflowError): string {
    if (error.stepName) {
      return `Workflow failed at step "${error.stepName}": ${error.message}`;
    }
    return `Workflow error: ${error.message}`;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    this.errorCount++;
    return `err_${Date.now()}_${this.errorCount}`;
  }

  /**
   * Get error log
   */
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCode: Record<string, number>;
  } {
    const bySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    const byCode: Record<string, number> = {};

    this.errorLog.forEach((entry) => {
      bySeverity[entry.severity]++;
      byCode[entry.code] = (byCode[entry.code] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      bySeverity,
      byCode,
    };
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Handle error helper function
 *
 * Convenience function for handling errors using the global error handler.
 *
 * @param error - The error to handle
 * @param context - Additional context data
 * @returns User-friendly error information
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const errorInfo = handleError(error, { operation: 'riskyOperation' });
 *   showErrorToUser(errorInfo.userMessage);
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>,
): ReturnType<ErrorHandler['handleError']> {
  return errorHandler.handleError(error, context);
}

/**
 * Log error helper function
 *
 * Convenience function for logging errors using the global error handler.
 *
 * @param error - The error to log
 *
 * @example
 * ```typescript
 * logError(new APIError('Request failed', ErrorCode.API_TIMEOUT));
 * ```
 */
export function logError(error: AppError): void {
  errorHandler.logError(error);
}

/**
 * Should retry helper function
 *
 * Convenience function for checking if an error should be retried.
 *
 * @param error - The error to check
 * @param attemptNumber - Current retry attempt number
 * @param maxRetries - Maximum number of retries allowed
 * @returns Whether to retry the operation
 *
 * @example
 * ```typescript
 * let attempt = 0;
 * while (shouldRetry(lastError, attempt, 3)) {
 *   try {
 *     await operation();
 *     break;
 *   } catch (error) {
 *     lastError = error;
 *     attempt++;
 *   }
 * }
 * ```
 */
export function shouldRetry(
  error: unknown,
  attemptNumber: number = 0,
  maxRetries: number = 3,
): boolean {
  return errorHandler.shouldRetry(error, attemptNumber, maxRetries);
}

/**
 * Get error severity helper function
 *
 * Convenience function for getting error severity.
 *
 * @param error - The error to evaluate
 * @returns Severity level
 *
 * @example
 * ```typescript
 * const severity = getErrorSeverity(error);
 * if (severity === ErrorSeverity.CRITICAL) {
 *   notifyAdmin();
 * }
 * ```
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  return errorHandler.getErrorSeverity(error);
}

/**
 * Format error for UI helper function
 *
 * Convenience function for formatting errors for display.
 *
 * @param error - The error to format
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * const userMessage = formatErrorForUI(error);
 * showToast(userMessage);
 * ```
 */
export function formatErrorForUI(error: unknown): string {
  return errorHandler.formatErrorForUI(error);
}
