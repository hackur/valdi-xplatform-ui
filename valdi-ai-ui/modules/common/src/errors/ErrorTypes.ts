/**
 * ErrorTypes
 *
 * Custom error classes for the Valdi AI UI application.
 * Provides structured error handling with error codes, severity levels,
 * and contextual information for better error tracking and recovery.
 */

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  /** Low severity - informational errors that don't affect functionality */
  LOW = 'low',

  /** Medium severity - errors that affect some functionality but allow graceful degradation */
  MEDIUM = 'medium',

  /** High severity - critical errors that prevent core functionality */
  HIGH = 'high',

  /** Critical severity - system-wide failures */
  CRITICAL = 'critical',
}

/**
 * Error Codes
 *
 * Structured error codes for categorization and tracking
 */
export enum ErrorCode {
  // API Errors (1000-1999)
  API_NETWORK_ERROR = 'API_1000',
  API_TIMEOUT = 'API_1001',
  API_RATE_LIMIT = 'API_1002',
  API_AUTHENTICATION = 'API_1003',
  API_AUTHORIZATION = 'API_1004',
  API_INVALID_RESPONSE = 'API_1005',
  API_SERVER_ERROR = 'API_1006',
  API_NOT_FOUND = 'API_1007',
  API_QUOTA_EXCEEDED = 'API_1008',
  API_INVALID_REQUEST = 'API_1009',

  // Validation Errors (2000-2999)
  VALIDATION_REQUIRED = 'VAL_2000',
  VALIDATION_FORMAT = 'VAL_2001',
  VALIDATION_RANGE = 'VAL_2002',
  VALIDATION_TYPE = 'VAL_2003',
  VALIDATION_SCHEMA = 'VAL_2004',
  VALIDATION_CUSTOM = 'VAL_2005',

  // Storage Errors (3000-3999)
  STORAGE_READ_ERROR = 'STOR_3000',
  STORAGE_WRITE_ERROR = 'STOR_3001',
  STORAGE_DELETE_ERROR = 'STOR_3002',
  STORAGE_QUOTA_EXCEEDED = 'STOR_3003',
  STORAGE_NOT_FOUND = 'STOR_3004',
  STORAGE_CORRUPTION = 'STOR_3005',
  STORAGE_PERMISSION = 'STOR_3006',

  // Stream Errors (4000-4999)
  STREAM_CONNECTION = 'STRM_4000',
  STREAM_TIMEOUT = 'STRM_4001',
  STREAM_INTERRUPTED = 'STRM_4002',
  STREAM_INVALID_DATA = 'STRM_4003',
  STREAM_CLOSED = 'STRM_4004',

  // Workflow Errors (5000-5999)
  WORKFLOW_EXECUTION = 'WF_5000',
  WORKFLOW_VALIDATION = 'WF_5001',
  WORKFLOW_TIMEOUT = 'WF_5002',
  WORKFLOW_STEP_FAILED = 'WF_5003',
  WORKFLOW_CANCELLED = 'WF_5004',
  WORKFLOW_NOT_FOUND = 'WF_5005',

  // Unknown/Generic Errors (9000-9999)
  UNKNOWN = 'ERR_9000',
}

/**
 * Base Application Error
 *
 * Base class for all application errors. Extends native Error class
 * with additional metadata for structured error handling.
 */
export class AppError extends Error {
  /** Error code for categorization */
  public readonly code: ErrorCode;

  /** Severity level */
  public readonly severity: ErrorSeverity;

  /** Timestamp when error occurred */
  public readonly timestamp: Date;

  /** Additional context data */
  public readonly context?: Record<string, unknown>;

  /** Whether error is retryable */
  public readonly retryable: boolean;

  /** Original error if this wraps another error */
  public override readonly cause?: Error;

  /** User-friendly message */
  public readonly userMessage?: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options?: {
      context?: Record<string, unknown>;
      retryable?: boolean;
      cause?: Error;
      userMessage?: string;
    },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.timestamp = new Date();
    this.context = options?.context;
    this.retryable = options?.retryable ?? false;
    this.cause = options?.cause;
    this.userMessage = options?.userMessage;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    const ErrorConstructor = Error as unknown as {
      captureStackTrace?: (target: object, constructor: Function) => void;
    };
    if (typeof ErrorConstructor.captureStackTrace === 'function') {
      ErrorConstructor.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      retryable: this.retryable,
      userMessage: this.userMessage,
      stack: this.stack,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
          }
        : undefined,
    };
  }
}

/**
 * API Error
 *
 * Errors related to API calls and network requests.
 * Includes HTTP status codes and provider information.
 */
export class APIError extends AppError {
  /** HTTP status code */
  public readonly statusCode?: number;

  /** Provider that generated the error */
  public readonly provider?: string;

  /** Request URL */
  public readonly url?: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.API_NETWORK_ERROR,
    options?: {
      statusCode?: number;
      provider?: string;
      url?: string;
      context?: Record<string, unknown>;
      cause?: Error;
      userMessage?: string;
    },
  ) {
    // Determine severity based on status code
    let severity = ErrorSeverity.MEDIUM;
    if (options?.statusCode) {
      if (options.statusCode >= 500) {
        severity = ErrorSeverity.HIGH;
      } else if (options.statusCode === 429) {
        severity = ErrorSeverity.MEDIUM;
      }
    }

    // Determine if retryable
    const retryable =
      options?.statusCode === 408 || // Timeout
      options?.statusCode === 429 || // Rate limit
      options?.statusCode === 503 || // Service unavailable
      options?.statusCode === 504 || // Gateway timeout
      code === ErrorCode.API_TIMEOUT ||
      code === ErrorCode.API_NETWORK_ERROR;

    super(message, code, severity, {
      ...options,
      retryable,
    });

    this.statusCode = options?.statusCode;
    this.provider = options?.provider;
    this.url = options?.url;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      provider: this.provider,
      url: this.url,
    };
  }
}

/**
 * Validation Error
 *
 * Errors related to input validation and schema validation.
 * Includes field-specific error information.
 */
export class ValidationError extends AppError {
  /** Field that failed validation */
  public readonly field?: string;

  /** Validation constraints that were violated */
  public readonly constraints?: Record<string, string>;

  /** Expected value or format */
  public readonly expected?: string;

  /** Actual value received */
  public readonly received?: unknown;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.VALIDATION_CUSTOM,
    options?: {
      field?: string;
      constraints?: Record<string, string>;
      expected?: string;
      received?: unknown;
      context?: Record<string, unknown>;
      userMessage?: string;
    },
  ) {
    super(message, code, ErrorSeverity.LOW, {
      ...options,
      retryable: false, // Validation errors are not retryable
    });

    this.field = options?.field;
    this.constraints = options?.constraints;
    this.expected = options?.expected;
    this.received = options?.received;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      constraints: this.constraints,
      expected: this.expected,
      received: this.received,
    };
  }
}

/**
 * Storage Error
 *
 * Errors related to data persistence and storage operations.
 * Includes storage key and operation type information.
 */
export class StorageError extends AppError {
  /** Storage key that caused the error */
  public readonly key?: string;

  /** Operation that failed (read, write, delete) */
  public readonly operation?: 'read' | 'write' | 'delete' | 'clear';

  /** Storage type (local, session, memory) */
  public readonly storageType?: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.STORAGE_WRITE_ERROR,
    options?: {
      key?: string;
      operation?: 'read' | 'write' | 'delete' | 'clear';
      storageType?: string;
      context?: Record<string, unknown>;
      cause?: Error;
      userMessage?: string;
    },
  ) {
    // Determine severity based on operation
    let severity = ErrorSeverity.MEDIUM;
    if (code === ErrorCode.STORAGE_CORRUPTION) {
      severity = ErrorSeverity.HIGH;
    } else if (code === ErrorCode.STORAGE_QUOTA_EXCEEDED) {
      severity = ErrorSeverity.MEDIUM;
    }

    // Read operations might be retryable
    const retryable =
      options?.operation === 'read' || code === ErrorCode.STORAGE_READ_ERROR;

    super(message, code, severity, {
      ...options,
      retryable,
    });

    this.key = options?.key;
    this.operation = options?.operation;
    this.storageType = options?.storageType;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      key: this.key,
      operation: this.operation,
      storageType: this.storageType,
    };
  }
}

/**
 * Stream Error
 *
 * Errors related to streaming operations (SSE, WebSocket, etc.).
 * Includes connection state and stream metadata.
 */
export class StreamError extends AppError {
  /** Stream ID */
  public readonly streamId?: string;

  /** Connection state when error occurred */
  public readonly connectionState?:
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error';

  /** Bytes received before error */
  public readonly bytesReceived?: number;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.STREAM_CONNECTION,
    options?: {
      streamId?: string;
      connectionState?: 'connecting' | 'connected' | 'disconnected' | 'error';
      bytesReceived?: number;
      context?: Record<string, unknown>;
      cause?: Error;
      userMessage?: string;
    },
  ) {
    // Connection and timeout errors are retryable
    const retryable =
      code === ErrorCode.STREAM_CONNECTION ||
      code === ErrorCode.STREAM_TIMEOUT ||
      code === ErrorCode.STREAM_INTERRUPTED;

    super(message, code, ErrorSeverity.MEDIUM, {
      ...options,
      retryable,
    });

    this.streamId = options?.streamId;
    this.connectionState = options?.connectionState;
    this.bytesReceived = options?.bytesReceived;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      streamId: this.streamId,
      connectionState: this.connectionState,
      bytesReceived: this.bytesReceived,
    };
  }
}

/**
 * Workflow Error
 *
 * Errors related to agent workflow execution.
 * Includes workflow step and execution state information.
 */
export class WorkflowError extends AppError {
  /** Workflow ID */
  public readonly workflowId?: string;

  /** Step that failed */
  public readonly stepId?: string;

  /** Step name that failed */
  public readonly stepName?: string;

  /** Execution attempt number */
  public readonly attempt?: number;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.WORKFLOW_EXECUTION,
    options?: {
      workflowId?: string;
      stepId?: string;
      stepName?: string;
      attempt?: number;
      context?: Record<string, unknown>;
      cause?: Error;
      userMessage?: string;
    },
  ) {
    // Workflow errors are generally retryable unless cancelled
    const retryable = code !== ErrorCode.WORKFLOW_CANCELLED;

    let severity = ErrorSeverity.MEDIUM;
    if (code === ErrorCode.WORKFLOW_EXECUTION) {
      severity = ErrorSeverity.HIGH;
    }

    super(message, code, severity, {
      ...options,
      retryable,
    });

    this.workflowId = options?.workflowId;
    this.stepId = options?.stepId;
    this.stepName = options?.stepName;
    this.attempt = options?.attempt;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      workflowId: this.workflowId,
      stepId: this.stepId,
      stepName: this.stepName,
      attempt: this.attempt,
    };
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard to check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if error is a StorageError
 */
export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

/**
 * Type guard to check if error is a StreamError
 */
export function isStreamError(error: unknown): error is StreamError {
  return error instanceof StreamError;
}

/**
 * Type guard to check if error is a WorkflowError
 */
export function isWorkflowError(error: unknown): error is WorkflowError {
  return error instanceof WorkflowError;
}
