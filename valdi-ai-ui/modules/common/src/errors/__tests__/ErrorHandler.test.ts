/**
 * ErrorHandler Tests
 *
 * Unit tests for error handling utilities.
 */

import { describe, it, expect, beforeEach } from 'valdi_testing';
import {
  ErrorHandler,
  handleError,
  shouldRetry,
  getErrorSeverity,
  formatErrorForUI,
} from '../ErrorHandler';
import {
  AppError,
  APIError,
  ValidationError,
  StorageError,
  ErrorCode,
  ErrorSeverity,
} from '../ErrorTypes';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = new ErrorHandler({ enableLogging: false });
  });

  describe('handleError', () => {
    it('should handle AppError', () => {
      const error = new APIError('Network error', ErrorCode.API_NETWORK_ERROR, {
        statusCode: 500,
      });

      const result = handler.handleError(error);

      expect(result.code).toBe(ErrorCode.API_NETWORK_ERROR);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.retryable).toBe(true);
      expect(result.userMessage).toContain('Network error');
    });

    it('should handle native Error', () => {
      const error = new Error('Something went wrong');

      const result = handler.handleError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.retryable).toBe(false);
    });

    it('should handle unknown error types', () => {
      const error = 'string error';

      const result = handler.handleError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.message).toBe('string error');
    });

    it('should add context to error', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      handler.handleError(error, context);

      // Verify context is logged (check error log)
      const log = handler.getErrorLog();
      expect(log.length).toBeGreaterThan(0);
      expect(log[0].context).toEqual(context);
    });
  });

  describe('shouldRetry', () => {
    it('should retry retryable errors', () => {
      const error = new APIError('Timeout', ErrorCode.API_TIMEOUT);

      expect(handler.shouldRetry(error, 0, 3)).toBe(true);
      expect(handler.shouldRetry(error, 1, 3)).toBe(true);
      expect(handler.shouldRetry(error, 2, 3)).toBe(true);
    });

    it('should not retry after max attempts', () => {
      const error = new APIError('Timeout', ErrorCode.API_TIMEOUT);

      expect(handler.shouldRetry(error, 3, 3)).toBe(false);
    });

    it('should not retry non-retryable errors', () => {
      const error = new ValidationError('Invalid input', ErrorCode.VALIDATION_REQUIRED);

      expect(handler.shouldRetry(error, 0, 3)).toBe(false);
    });

    it('should retry network errors', () => {
      const error = new Error('Network request failed');

      expect(handler.shouldRetry(error, 0, 3)).toBe(true);
    });
  });

  describe('getErrorSeverity', () => {
    it('should return severity for AppError', () => {
      const error = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.HIGH);

      expect(handler.getErrorSeverity(error)).toBe(ErrorSeverity.HIGH);
    });

    it('should return default severity for unknown errors', () => {
      const error = new Error('Test');

      expect(handler.getErrorSeverity(error)).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('formatErrorForUI', () => {
    it('should format API errors', () => {
      const error = new APIError('Request failed', ErrorCode.API_TIMEOUT);

      const message = handler.formatErrorForUI(error);

      expect(message).toContain('timed out');
    });

    it('should format validation errors', () => {
      const error = new ValidationError('Invalid email', ErrorCode.VALIDATION_FORMAT, {
        field: 'email',
      });

      const message = handler.formatErrorForUI(error);

      expect(message).toContain('email');
      expect(message).toContain('Invalid');
    });

    it('should format storage errors', () => {
      const error = new StorageError('Quota exceeded', ErrorCode.STORAGE_QUOTA_EXCEEDED);

      const message = handler.formatErrorForUI(error);

      expect(message).toContain('quota');
    });

    it('should use userMessage if provided', () => {
      const error = new AppError('Technical error', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM, {
        userMessage: 'Please try again later',
      });

      const message = handler.formatErrorForUI(error);

      expect(message).toBe('Please try again later');
    });

    it('should provide fallback for unknown errors', () => {
      const error = new Error('Unknown error');

      const message = handler.formatErrorForUI(error);

      expect(message).toContain('unexpected error');
    });
  });

  describe('Error Logging', () => {
    it('should log errors when enabled', () => {
      const loggingHandler = new ErrorHandler({ enableLogging: true });
      const error = new APIError('Test error', ErrorCode.API_NETWORK_ERROR);

      loggingHandler.handleError(error);

      const log = loggingHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].code).toBe(ErrorCode.API_NETWORK_ERROR);
    });

    it('should maintain error log limit', () => {
      const loggingHandler = new ErrorHandler({ enableLogging: true });

      // Log 150 errors
      for (let i = 0; i < 150; i++) {
        loggingHandler.handleError(new Error(`Error ${i}`));
      }

      const log = loggingHandler.getErrorLog();
      expect(log.length).toBe(100); // Should keep only last 100
    });

    it('should clear error log', () => {
      const loggingHandler = new ErrorHandler({ enableLogging: true });

      loggingHandler.handleError(new Error('Test'));
      expect(loggingHandler.getErrorLog().length).toBe(1);

      loggingHandler.clearErrorLog();
      expect(loggingHandler.getErrorLog().length).toBe(0);
    });
  });

  describe('Error Statistics', () => {
    it('should provide error statistics', () => {
      const loggingHandler = new ErrorHandler({ enableLogging: true });

      loggingHandler.handleError(new APIError('Error 1', ErrorCode.API_TIMEOUT));
      loggingHandler.handleError(new APIError('Error 2', ErrorCode.API_TIMEOUT));
      loggingHandler.handleError(new ValidationError('Error 3', ErrorCode.VALIDATION_REQUIRED));

      const stats = loggingHandler.getErrorStats();

      expect(stats.total).toBe(3);
      expect(stats.byCode[ErrorCode.API_TIMEOUT]).toBe(2);
      expect(stats.byCode[ErrorCode.VALIDATION_REQUIRED]).toBe(1);
    });
  });

  describe('Global helpers', () => {
    it('should handle error using global handler', () => {
      const error = new APIError('Test', ErrorCode.API_NETWORK_ERROR);
      const result = handleError(error);

      expect(result.code).toBe(ErrorCode.API_NETWORK_ERROR);
    });

    it('should check retry using global handler', () => {
      const error = new APIError('Test', ErrorCode.API_TIMEOUT);

      expect(shouldRetry(error, 0, 3)).toBe(true);
    });

    it('should get severity using global handler', () => {
      const error = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.HIGH);

      expect(getErrorSeverity(error)).toBe(ErrorSeverity.HIGH);
    });

    it('should format error using global handler', () => {
      const error = new APIError('Test', ErrorCode.API_TIMEOUT);
      const message = formatErrorForUI(error);

      expect(message).toContain('timed out');
    });
  });
});
