/**
 * Standardized Error Messages
 *
 * Centralized error messages for consistent user experience.
 * Follows DRY principle - single source of truth for all error messages.
 */

/**
 * Error Category
 */
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

/**
 * Error Message Definition
 */
export interface ErrorMessage {
  /** Error code */
  code: string;

  /** User-facing message */
  message: string;

  /** Category */
  category: ErrorCategory;

  /** Suggested action */
  action?: string;

  /** Technical details (not shown to user) */
  technical?: string;
}

/**
 * Standardized Error Messages
 */
export const ErrorMessages = {
  // Network Errors
  NETWORK_OFFLINE: {
    code: 'NET_001',
    message: 'No internet connection',
    category: ErrorCategory.NETWORK,
    action: 'Please check your internet connection and try again',
  },

  NETWORK_TIMEOUT: {
    code: 'NET_002',
    message: 'Request timed out',
    category: ErrorCategory.NETWORK,
    action: 'The server took too long to respond. Please try again',
  },

  NETWORK_ERROR: {
    code: 'NET_003',
    message: 'Network error',
    category: ErrorCategory.NETWORK,
    action: 'A network error occurred. Please try again',
  },

  // API Errors
  API_KEY_MISSING: {
    code: 'API_001',
    message: 'API key not configured',
    category: ErrorCategory.AUTHENTICATION,
    action: 'Please add your API key in Settings',
  },

  API_KEY_INVALID: {
    code: 'API_002',
    message: 'Invalid API key',
    category: ErrorCategory.AUTHENTICATION,
    action: 'Please check your API key in Settings',
  },

  API_RATE_LIMIT: {
    code: 'API_003',
    message: 'Rate limit exceeded',
    category: ErrorCategory.PERMISSION,
    action: 'Too many requests. Please wait a moment and try again',
  },

  API_QUOTA_EXCEEDED: {
    code: 'API_004',
    message: 'API quota exceeded',
    category: ErrorCategory.PERMISSION,
    action: 'Your API quota has been exceeded. Please check your provider dashboard',
  },

  API_FORBIDDEN: {
    code: 'API_005',
    message: 'Permission denied',
    category: ErrorCategory.PERMISSION,
    action: 'You do not have permission to access this resource',
  },

  // Chat Errors
  CHAT_SEND_FAILED: {
    code: 'CHAT_001',
    message: 'Failed to send message',
    category: ErrorCategory.CLIENT,
    action: 'Please try sending your message again',
  },

  CHAT_LOAD_FAILED: {
    code: 'CHAT_002',
    message: 'Failed to load messages',
    category: ErrorCategory.CLIENT,
    action: 'Please refresh and try again',
  },

  CHAT_EMPTY_MESSAGE: {
    code: 'CHAT_003',
    message: 'Message cannot be empty',
    category: ErrorCategory.VALIDATION,
    action: 'Please enter a message before sending',
  },

  CHAT_MESSAGE_TOO_LONG: {
    code: 'CHAT_004',
    message: 'Message too long',
    category: ErrorCategory.VALIDATION,
    action: 'Please shorten your message',
  },

  // Conversation Errors
  CONV_NOT_FOUND: {
    code: 'CONV_001',
    message: 'Conversation not found',
    category: ErrorCategory.NOT_FOUND,
    action: 'This conversation may have been deleted',
  },

  CONV_CREATE_FAILED: {
    code: 'CONV_002',
    message: 'Failed to create conversation',
    category: ErrorCategory.CLIENT,
    action: 'Please try again',
  },

  CONV_DELETE_FAILED: {
    code: 'CONV_003',
    message: 'Failed to delete conversation',
    category: ErrorCategory.CLIENT,
    action: 'Please try again',
  },

  // Storage Errors
  STORAGE_QUOTA_EXCEEDED: {
    code: 'STOR_001',
    message: 'Storage quota exceeded',
    category: ErrorCategory.CLIENT,
    action: 'Please delete some conversations to free up space',
  },

  STORAGE_READ_FAILED: {
    code: 'STOR_002',
    message: 'Failed to read from storage',
    category: ErrorCategory.CLIENT,
    action: 'Please try again',
  },

  STORAGE_WRITE_FAILED: {
    code: 'STOR_003',
    message: 'Failed to save data',
    category: ErrorCategory.CLIENT,
    action: 'Please try again',
  },

  // Provider Errors
  PROVIDER_NOT_CONFIGURED: {
    code: 'PROV_001',
    message: 'Provider not configured',
    category: ErrorCategory.AUTHENTICATION,
    action: 'Please configure your AI provider in Settings',
  },

  PROVIDER_CONNECTION_FAILED: {
    code: 'PROV_002',
    message: 'Failed to connect to provider',
    category: ErrorCategory.NETWORK,
    action: 'Please check your provider settings and try again',
  },

  PROVIDER_INVALID_URL: {
    code: 'PROV_003',
    message: 'Invalid provider URL',
    category: ErrorCategory.VALIDATION,
    action: 'Please check the URL and try again',
  },

  // Model Errors
  MODEL_NOT_FOUND: {
    code: 'MODEL_001',
    message: 'Model not found',
    category: ErrorCategory.NOT_FOUND,
    action: 'Please select a different model',
  },

  MODEL_NOT_AVAILABLE: {
    code: 'MODEL_002',
    message: 'Model not available',
    category: ErrorCategory.PERMISSION,
    action: 'This model is not currently available. Please select a different model',
  },

  // Server Errors
  SERVER_ERROR: {
    code: 'SRV_001',
    message: 'Server error',
    category: ErrorCategory.SERVER,
    action: 'A server error occurred. Please try again later',
  },

  SERVER_UNAVAILABLE: {
    code: 'SRV_002',
    message: 'Service unavailable',
    category: ErrorCategory.SERVER,
    action: 'The service is temporarily unavailable. Please try again later',
  },

  // Validation Errors
  VALIDATION_FAILED: {
    code: 'VAL_001',
    message: 'Validation failed',
    category: ErrorCategory.VALIDATION,
    action: 'Please check your input and try again',
  },

  INVALID_FORMAT: {
    code: 'VAL_002',
    message: 'Invalid format',
    category: ErrorCategory.VALIDATION,
    action: 'Please check the format and try again',
  },

  // Unknown Error
  UNKNOWN_ERROR: {
    code: 'UNK_001',
    message: 'An unexpected error occurred',
    category: ErrorCategory.UNKNOWN,
    action: 'Please try again. If the problem persists, please contact support',
  },
} as const;

/**
 * Error Message Keys
 */
export type ErrorMessageKey = keyof typeof ErrorMessages;

/**
 * Get error message
 */
export function getErrorMessage(key: ErrorMessageKey): ErrorMessage {
  return ErrorMessages[key];
}

/**
 * Format error for user display
 */
export function formatErrorForUser(key: ErrorMessageKey, details?: string): string {
  const error = getErrorMessage(key);
  let message = error.message;

  if (error.action) {
    message += `\n\n${error.action}`;
  }

  if (details) {
    message += `\n\nDetails: ${details}`;
  }

  return message;
}

/**
 * Get error message from HTTP status code
 */
export function getErrorFromHttpStatus(status: number): ErrorMessage {
  switch (status) {
    case 400:
      return ErrorMessages.VALIDATION_FAILED;
    case 401:
      return ErrorMessages.API_KEY_INVALID;
    case 403:
      return ErrorMessages.API_FORBIDDEN;
    case 404:
      return ErrorMessages.CONV_NOT_FOUND;
    case 408:
      return ErrorMessages.NETWORK_TIMEOUT;
    case 429:
      return ErrorMessages.API_RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorMessages.SERVER_ERROR;
    default:
      return ErrorMessages.UNKNOWN_ERROR;
  }
}

/**
 * Create user-friendly error from exception
 */
export function createUserFriendlyError(error: unknown): {
  message: string;
  code: string;
  category: ErrorCategory;
} {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    const err = ErrorMessages.NETWORK_ERROR;
    return {
      message: formatErrorForUser('NETWORK_ERROR'),
      code: err.code,
      category: err.category,
    };
  }

  // Error object
  if (error instanceof Error) {
    // Check for known error messages
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('offline')) {
      const err = ErrorMessages.NETWORK_OFFLINE;
      return {
        message: formatErrorForUser('NETWORK_OFFLINE'),
        code: err.code,
        category: err.category,
      };
    }

    if (message.includes('timeout')) {
      const err = ErrorMessages.NETWORK_TIMEOUT;
      return {
        message: formatErrorForUser('NETWORK_TIMEOUT'),
        code: err.code,
        category: err.category,
      };
    }

    if (message.includes('api key') || message.includes('unauthorized')) {
      const err = ErrorMessages.API_KEY_INVALID;
      return {
        message: formatErrorForUser('API_KEY_INVALID'),
        code: err.code,
        category: err.category,
      };
    }

    if (message.includes('rate limit')) {
      const err = ErrorMessages.API_RATE_LIMIT;
      return {
        message: formatErrorForUser('API_RATE_LIMIT'),
        code: err.code,
        category: err.category,
      };
    }
  }

  // Default unknown error
  const err = ErrorMessages.UNKNOWN_ERROR;
  return {
    message: formatErrorForUser('UNKNOWN_ERROR'),
    code: err.code,
    category: err.category,
  };
}
