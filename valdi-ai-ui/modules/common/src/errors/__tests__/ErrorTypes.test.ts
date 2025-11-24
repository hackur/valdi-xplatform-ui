/**
 * ErrorTypes Tests
 *
 * Unit tests for custom error classes.
 */

import { describe, it, expect } from 'valdi_testing';
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
} from '../ErrorTypes';

describe('ErrorTypes', () => {
  describe('AppError', () => {
    it('should create a basic AppError', () => {
      const error = new AppError('Test error', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.retryable).toBe(false);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should accept optional parameters', () => {
      const context = { userId: '123' };
      const cause = new Error('Original error');
      const userMessage = 'Something went wrong';

      const error = new AppError('Test error', ErrorCode.UNKNOWN, ErrorSeverity.HIGH, {
        context,
        retryable: true,
        cause,
        userMessage,
      });

      expect(error.context).toEqual(context);
      expect(error.retryable).toBe(true);
      expect(error.cause).toBe(cause);
      expect(error.userMessage).toBe(userMessage);
    });

    it('should convert to JSON', () => {
      const error = new AppError('Test error', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM, {
        context: { test: 'data' },
      });

      const json = error.toJSON();

      expect(json.name).toBe('AppError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe(ErrorCode.UNKNOWN);
      expect(json.severity).toBe(ErrorSeverity.MEDIUM);
      expect(json.context).toEqual({ test: 'data' });
    });
  });

  describe('APIError', () => {
    it('should create an APIError with status code', () => {
      const error = new APIError('API request failed', ErrorCode.API_NETWORK_ERROR, {
        statusCode: 500,
        provider: 'openai',
        url: 'https://api.openai.com/v1/chat',
      });

      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.provider).toBe('openai');
      expect(error.url).toBe('https://api.openai.com/v1/chat');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should mark rate limit errors as retryable', () => {
      const error = new APIError('Rate limit exceeded', ErrorCode.API_RATE_LIMIT, {
        statusCode: 429,
      });

      expect(error.retryable).toBe(true);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should mark timeout errors as retryable', () => {
      const error = new APIError('Request timeout', ErrorCode.API_TIMEOUT, {
        statusCode: 408,
      });

      expect(error.retryable).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with field info', () => {
      const error = new ValidationError('Invalid email', ErrorCode.VALIDATION_FORMAT, {
        field: 'email',
        expected: 'valid email format',
        received: 'not-an-email',
        constraints: { format: 'email' },
      });

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.field).toBe('email');
      expect(error.expected).toBe('valid email format');
      expect(error.received).toBe('not-an-email');
      expect(error.constraints).toEqual({ format: 'email' });
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.retryable).toBe(false);
    });
  });

  describe('StorageError', () => {
    it('should create a StorageError with operation info', () => {
      const error = new StorageError('Failed to write', ErrorCode.STORAGE_WRITE_ERROR, {
        key: 'conversations',
        operation: 'write',
        storageType: 'localStorage',
      });

      expect(error).toBeInstanceOf(StorageError);
      expect(error.key).toBe('conversations');
      expect(error.operation).toBe('write');
      expect(error.storageType).toBe('localStorage');
    });

    it('should mark read operations as retryable', () => {
      const error = new StorageError('Failed to read', ErrorCode.STORAGE_READ_ERROR, {
        operation: 'read',
      });

      expect(error.retryable).toBe(true);
    });

    it('should set high severity for corruption', () => {
      const error = new StorageError('Data corrupted', ErrorCode.STORAGE_CORRUPTION);

      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('StreamError', () => {
    it('should create a StreamError with connection info', () => {
      const error = new StreamError('Connection failed', ErrorCode.STREAM_CONNECTION, {
        streamId: 'stream-123',
        connectionState: 'connecting',
        bytesReceived: 1024,
      });

      expect(error).toBeInstanceOf(StreamError);
      expect(error.streamId).toBe('stream-123');
      expect(error.connectionState).toBe('connecting');
      expect(error.bytesReceived).toBe(1024);
    });

    it('should mark connection errors as retryable', () => {
      const error = new StreamError('Connection failed', ErrorCode.STREAM_CONNECTION);

      expect(error.retryable).toBe(true);
    });
  });

  describe('WorkflowError', () => {
    it('should create a WorkflowError with step info', () => {
      const error = new WorkflowError('Step failed', ErrorCode.WORKFLOW_STEP_FAILED, {
        workflowId: 'wf-123',
        stepId: 'step-1',
        stepName: 'Data Processing',
        attempt: 2,
      });

      expect(error).toBeInstanceOf(WorkflowError);
      expect(error.workflowId).toBe('wf-123');
      expect(error.stepId).toBe('step-1');
      expect(error.stepName).toBe('Data Processing');
      expect(error.attempt).toBe(2);
    });

    it('should not mark cancelled workflows as retryable', () => {
      const error = new WorkflowError('Workflow cancelled', ErrorCode.WORKFLOW_CANCELLED);

      expect(error.retryable).toBe(false);
    });

    it('should mark other workflow errors as retryable', () => {
      const error = new WorkflowError('Execution failed', ErrorCode.WORKFLOW_EXECUTION);

      expect(error.retryable).toBe(true);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('Type Guards', () => {
    it('should identify AppError', () => {
      const error = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM);
      const normalError = new Error('Test');

      expect(isAppError(error)).toBe(true);
      expect(isAppError(normalError)).toBe(false);
    });

    it('should identify APIError', () => {
      const error = new APIError('Test', ErrorCode.API_NETWORK_ERROR);
      const appError = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM);

      expect(isAPIError(error)).toBe(true);
      expect(isAPIError(appError)).toBe(false);
    });

    it('should identify ValidationError', () => {
      const error = new ValidationError('Test', ErrorCode.VALIDATION_REQUIRED);
      const appError = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM);

      expect(isValidationError(error)).toBe(true);
      expect(isValidationError(appError)).toBe(false);
    });

    it('should identify StorageError', () => {
      const error = new StorageError('Test', ErrorCode.STORAGE_WRITE_ERROR);
      const appError = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM);

      expect(isStorageError(error)).toBe(true);
      expect(isStorageError(appError)).toBe(false);
    });

    it('should identify StreamError', () => {
      const error = new StreamError('Test', ErrorCode.STREAM_CONNECTION);
      const appError = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM);

      expect(isStreamError(error)).toBe(true);
      expect(isStreamError(appError)).toBe(false);
    });

    it('should identify WorkflowError', () => {
      const error = new WorkflowError('Test', ErrorCode.WORKFLOW_EXECUTION);
      const appError = new AppError('Test', ErrorCode.UNKNOWN, ErrorSeverity.MEDIUM);

      expect(isWorkflowError(error)).toBe(true);
      expect(isWorkflowError(appError)).toBe(false);
    });
  });
});
