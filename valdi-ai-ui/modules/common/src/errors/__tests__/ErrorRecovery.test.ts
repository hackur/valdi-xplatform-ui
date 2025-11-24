/**
 * ErrorRecovery Tests
 *
 * Unit tests for error recovery strategies.
 */

import { describe, it, expect, beforeEach } from 'valdi_testing';
import {
  retryWithBackoff,
  fallbackToCache,
  gracefulDegradation,
  CircuitBreaker,
  CircuitState,
  withTimeout,
  batchRetry,
} from '../ErrorRecovery';
import { APIError, ErrorCode } from '../ErrorTypes';

describe('ErrorRecovery', () => {
  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        return 'success';
      };

      const result = await retryWithBackoff(fn);

      expect(result).toBe('success');
      expect(attempts).toBe(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new APIError('Temporary error', ErrorCode.API_TIMEOUT);
        }
        return 'success';
      };

      const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should fail after max retries', async () => {
      const fn = async () => {
        throw new APIError('Persistent error', ErrorCode.API_TIMEOUT);
      };

      await expect(
        retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10 })
      ).rejects.toThrow('Persistent error');
    });

    it('should not retry non-retryable errors', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error('Non-retryable');
      };

      await expect(
        retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 })
      ).rejects.toThrow('Non-retryable');

      expect(attempts).toBe(1); // Should not retry
    });

    it('should call onRetry callback', async () => {
      let retryCount = 0;
      let attempts = 0;

      const fn = async () => {
        attempts++;
        if (attempts < 2) {
          throw new APIError('Error', ErrorCode.API_TIMEOUT);
        }
        return 'success';
      };

      await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 10,
        onRetry: () => {
          retryCount++;
        },
      });

      expect(retryCount).toBe(1);
    });

    it('should use custom shouldRetry function', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error('Custom error');
      };

      await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 10,
        shouldRetry: () => true, // Always retry
      }).catch(() => {});

      expect(attempts).toBe(4); // 1 initial + 3 retries
    });
  });

  describe('fallbackToCache', () => {
    it('should return fresh data and cache it', async () => {
      const cache = new Map();
      const fn = async () => 'fresh data';

      const result = await fallbackToCache(fn, { key: 'test', cache });

      expect(result).toBe('fresh data');
      expect(cache.has('test')).toBe(true);
    });

    it('should use cache on error', async () => {
      const cache = new Map();
      cache.set('test', { value: 'cached data', timestamp: Date.now() });

      const fn = async () => {
        throw new Error('Network error');
      };

      const result = await fallbackToCache(fn, {
        key: 'test',
        cache,
        ttl: 60000,
      });

      expect(result).toBe('cached data');
    });

    it('should not use stale cache if disabled', async () => {
      const cache = new Map();
      cache.set('test', { value: 'stale data', timestamp: Date.now() - 100000 });

      const fn = async () => {
        throw new Error('Network error');
      };

      await expect(
        fallbackToCache(fn, {
          key: 'test',
          cache,
          ttl: 60000,
          useStaleOnError: false,
        })
      ).rejects.toThrow('Network error');
    });

    it('should throw if no cache available', async () => {
      const cache = new Map();
      const fn = async () => {
        throw new Error('Network error');
      };

      await expect(
        fallbackToCache(fn, { key: 'missing', cache })
      ).rejects.toThrow('Network error');
    });
  });

  describe('gracefulDegradation', () => {
    it('should use primary function on success', async () => {
      const primary = async () => 'primary';
      const degraded = async () => 'degraded';

      const result = await gracefulDegradation(primary, degraded);

      expect(result).toBe('primary');
    });

    it('should fall back to degraded on failure', async () => {
      const primary = async () => {
        throw new Error('Primary failed');
      };
      const degraded = async () => 'degraded';

      const result = await gracefulDegradation(primary, degraded, {
        maxRetries: 1,
        initialDelay: 10,
      });

      expect(result).toBe('degraded');
    });
  });

  describe('CircuitBreaker', () => {
    let breaker: CircuitBreaker;

    beforeEach(() => {
      breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        resetTimeout: 100,
        timeWindow: 1000,
      });
    });

    it('should start in closed state', () => {
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should execute function successfully', async () => {
      const fn = async () => 'success';
      const result = await breaker.execute(fn);

      expect(result).toBe('success');
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should open circuit after threshold failures', async () => {
      const fn = async () => {
        throw new Error('Failure');
      };

      // Trigger failures to open circuit
      for (let i = 0; i < 3; i++) {
        await breaker.execute(fn).catch(() => {});
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);
      expect(breaker.getFailureCount()).toBe(3);
    });

    it('should reject calls when circuit is open', async () => {
      const fn = async () => {
        throw new Error('Failure');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await breaker.execute(fn).catch(() => {});
      }

      // Should reject without calling function
      await expect(breaker.execute(async () => 'test')).rejects.toThrow(
        'Circuit breaker is open'
      );
    });

    it('should transition to half-open after timeout', async () => {
      const fn = async () => {
        throw new Error('Failure');
      };

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await breaker.execute(fn).catch(() => {});
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);
    });

    it('should close circuit after successful half-open calls', async () => {
      const failFn = async () => {
        throw new Error('Failure');
      };
      const successFn = async () => 'success';

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await breaker.execute(failFn).catch(() => {});
      }

      // Wait for half-open
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Execute successful calls
      await breaker.execute(successFn);
      await breaker.execute(successFn);

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reset circuit', () => {
      breaker.forceOpen();
      expect(breaker.getState()).toBe(CircuitState.OPEN);

      breaker.reset();
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
      expect(breaker.getFailureCount()).toBe(0);
    });

    it('should provide statistics', async () => {
      const fn = async () => {
        throw new Error('Failure');
      };

      await breaker.execute(fn).catch(() => {});
      await breaker.execute(fn).catch(() => {});

      const stats = breaker.getStats();

      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failureCount).toBe(2);
      expect(stats.threshold).toBe(3);
    });
  });

  describe('withTimeout', () => {
    it('should return result if completed within timeout', async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'success';
      };

      const result = await withTimeout(fn, 100);

      expect(result).toBe('success');
    });

    it('should throw timeout error if exceeded', async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'success';
      };

      await expect(withTimeout(fn, 50)).rejects.toThrow('timed out');
    });
  });

  describe('batchRetry', () => {
    it('should retry all operations and collect results', async () => {
      const ops = [
        async () => 'result1',
        async () => 'result2',
        async () => 'result3',
      ];

      const { successes, failures } = await batchRetry(ops, {
        maxRetries: 2,
        initialDelay: 10,
      });

      expect(successes.length).toBe(3);
      expect(failures.length).toBe(0);
    });

    it('should collect failures', async () => {
      const ops = [
        async () => 'success',
        async () => {
          throw new Error('Failure');
        },
        async () => 'success',
      ];

      const { successes, failures } = await batchRetry(ops, {
        maxRetries: 1,
        initialDelay: 10,
      });

      expect(successes.length).toBe(2);
      expect(failures.length).toBe(1);
      expect(failures[0].index).toBe(1);
    });

    it('should retry failing operations', async () => {
      let attempt = 0;
      const ops = [
        async () => {
          attempt++;
          if (attempt < 2) {
            throw new APIError('Retry me', ErrorCode.API_TIMEOUT);
          }
          return 'success';
        },
      ];

      const { successes } = await batchRetry(ops, {
        maxRetries: 2,
        initialDelay: 10,
      });

      expect(successes.length).toBe(1);
      expect(attempt).toBe(2);
    });
  });
});
