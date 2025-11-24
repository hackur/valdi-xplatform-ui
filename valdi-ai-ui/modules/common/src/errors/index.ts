/**
 * Error Handling Module
 *
 * Comprehensive error handling system for Valdi AI UI.
 * Exports error types, handlers, and recovery strategies.
 */

// Error Types
export {
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

// Error Handler
export {
  ErrorHandler,
  errorHandler,
  handleError,
  logError,
  shouldRetry,
  getErrorSeverity,
  formatErrorForUI,
  type ErrorLogEntry,
  type ErrorHandlerOptions,
} from './ErrorHandler';

// Error Recovery
export {
  retryWithBackoff,
  fallbackToCache,
  gracefulDegradation,
  CircuitBreaker,
  CircuitState,
  withTimeout,
  batchRetry,
  debounceRetry,
  withErrorRecovery,
  type RetryOptions,
  type CircuitBreakerOptions,
  type CacheFallbackOptions,
} from './ErrorRecovery';
