/**
 * Tests for ErrorHandler service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandler, ErrorType, ErrorSeverity } from '../error-handler';
import { GraphApiError } from '../microsoft-graph/types';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    // Create fresh instance for each test
    errorHandler = ErrorHandler.getInstance({
      enableLogging: false,
      enableMonitoring: false
    });
    errorHandler.clearErrorLog();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Classification', () => {
    it('should classify GraphApiError with 401 status as authentication error', async () => {
      const error = new GraphApiError('Unauthorized', 'Unauthorized', 401);
      const context = { operation: 'test-operation' };

      const errorInfo = await errorHandler.handleError(error, context);

      expect(errorInfo.type).toBe(ErrorType.AUTHENTICATION);
      expect(errorInfo.severity).toBe(ErrorSeverity.HIGH);
      expect(errorInfo.retryable).toBe(false);
      expect(errorInfo.userMessage).toContain('autorisation');
    });

    it('should classify GraphApiError with 429 status as retryable API error', async () => {
      const error = new GraphApiError('Too Many Requests', 'TooManyRequests', 429);
      const context = { operation: 'test-operation' };

      const errorInfo = await errorHandler.handleError(error, context);

      expect(errorInfo.type).toBe(ErrorType.API);
      expect(errorInfo.severity).toBe(ErrorSeverity.MEDIUM);
      expect(errorInfo.retryable).toBe(true);
      expect(errorInfo.userMessage).toContain('demandes simultanées');
    });

    it('should classify GraphApiError with 500 status as critical API error', async () => {
      const error = new GraphApiError('Internal Server Error', 'InternalServerError', 500);
      const context = { operation: 'test-operation' };

      const errorInfo = await errorHandler.handleError(error, context);

      expect(errorInfo.type).toBe(ErrorType.API);
      expect(errorInfo.severity).toBe(ErrorSeverity.CRITICAL);
      expect(errorInfo.retryable).toBe(true);
    });

    it('should classify network errors correctly', async () => {
      const error = new Error('Network request failed');
      const context = { operation: 'test-operation' };

      const errorInfo = await errorHandler.handleError(error, context);

      expect(errorInfo.type).toBe(ErrorType.NETWORK);
      expect(errorInfo.severity).toBe(ErrorSeverity.MEDIUM);
      expect(errorInfo.retryable).toBe(true);
    });

    it('should classify validation errors correctly', async () => {
      const error = new Error('Validation failed: required field missing');
      const context = { operation: 'test-operation' };

      const errorInfo = await errorHandler.handleError(error, context);

      expect(errorInfo.type).toBe(ErrorType.VALIDATION);
      expect(errorInfo.severity).toBe(ErrorSeverity.LOW);
      expect(errorInfo.retryable).toBe(false);
    });

    it('should provide specific user messages for business hours errors', async () => {
      const error = new Error('Outside business hours');
      const context = { operation: 'appointment-booking' };

      const errorInfo = await errorHandler.handleError(error, context);

      expect(errorInfo.userMessage).toContain('14h00 et 16h30');
      expect(errorInfo.userMessage).toContain('lundi au vendredi');
    });

    it('should provide specific user messages for past date errors', async () => {
      const error = new Error('Cannot schedule appointment in the past');
      const context = { operation: 'appointment-booking' };

      const errorInfo = await errorHandler.handleError(error, context);

      expect(errorInfo.userMessage).toContain('passé');
    });
  });

  describe('Retry Logic', () => {
    it('should retry retryable errors up to max attempts', async () => {
      let attemptCount = 0;
      const operation = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network request failed');
        }
        return 'success';
      });

      const result = await errorHandler.withRetry(
        operation,
        { operation: 'test-retry' },
        { maxRetries: 3, baseDelay: 10 }
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Validation failed: invalid input');
      });

      await expect(
        errorHandler.withRetry(
          operation,
          { operation: 'test-no-retry' },
          { maxRetries: 3, baseDelay: 10 }
        )
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries for retryable errors', async () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Network request failed');
      });

      await expect(
        errorHandler.withRetry(
          operation,
          { operation: 'test-max-retries' },
          { maxRetries: 2, baseDelay: 10 }
        )
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should calculate exponential backoff delays correctly', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0); // Execute immediately for test
      });

      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Network request failed');
      });

      try {
        await errorHandler.withRetry(
          operation,
          { operation: 'test-backoff' },
          { maxRetries: 2, baseDelay: 100, backoffMultiplier: 2 }
        );
      } catch {
        // Expected to fail
      }

      expect(delays).toEqual([100, 200]); // 100 * 2^0, 100 * 2^1
      
      global.setTimeout = originalSetTimeout;
    });

    it('should respect max delay in exponential backoff', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      
      global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      });

      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Network request failed');
      });

      try {
        await errorHandler.withRetry(
          operation,
          { operation: 'test-max-delay' },
          { maxRetries: 3, baseDelay: 1000, backoffMultiplier: 10, maxDelay: 2000 }
        );
      } catch {
        // Expected to fail
      }

      expect(delays[0]).toBe(1000); // 1000 * 10^0
      expect(delays[1]).toBe(2000); // min(1000 * 10^1, 2000)
      expect(delays[2]).toBe(2000); // min(1000 * 10^2, 2000)
      
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Error Context and Logging', () => {
    it('should generate unique error IDs', async () => {
      const error1 = await errorHandler.handleError(new Error('Test 1'), { operation: 'test' });
      const error2 = await errorHandler.handleError(new Error('Test 2'), { operation: 'test' });

      expect(error1.id).not.toBe(error2.id);
      expect(error1.id).toMatch(/^err_\d+_[a-z0-9]+$/);
    });

    it('should include context information in error info', async () => {
      const context = {
        operation: 'appointment-booking',
        userId: 'user123',
        sessionId: 'session456',
        additionalData: { formData: { nom: 'Test' } }
      };

      const errorInfo = await errorHandler.handleError(new Error('Test error'), context);

      expect(errorInfo.context.operation).toBe('appointment-booking');
      expect(errorInfo.context.userId).toBe('user123');
      expect(errorInfo.context.sessionId).toBe('session456');
      expect(errorInfo.context.additionalData).toEqual({ formData: { nom: 'Test' } });
      expect(errorInfo.context.timestamp).toBeDefined();
    });

    it('should generate session ID if not provided', async () => {
      const errorInfo = await errorHandler.handleError(new Error('Test'), { operation: 'test' });

      expect(errorInfo.context.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics correctly', async () => {
      // Add various types of errors
      await errorHandler.handleError(new GraphApiError('Auth error', 'Unauthorized', 401), { operation: 'test' });
      await errorHandler.handleError(new Error('Network error'), { operation: 'test' });
      await errorHandler.handleError(new Error('Validation error'), { operation: 'test' });
      await errorHandler.handleError(new Error('Network error'), { operation: 'test' });

      const stats = errorHandler.getErrorStats();

      expect(stats.total).toBe(4);
      expect(stats.byType[ErrorType.AUTHENTICATION]).toBe(1);
      expect(stats.byType[ErrorType.NETWORK]).toBe(2);
      expect(stats.byType[ErrorType.VALIDATION]).toBe(1);
      expect(stats.bySeverity[ErrorSeverity.HIGH]).toBe(1);
      expect(stats.bySeverity[ErrorSeverity.MEDIUM]).toBe(2);
      expect(stats.bySeverity[ErrorSeverity.LOW]).toBe(1);
      expect(stats.recentErrors).toHaveLength(4);
    });

    it('should limit recent errors to last 10', async () => {
      // Add 15 errors
      for (let i = 0; i < 15; i++) {
        await errorHandler.handleError(new Error(`Error ${i}`), { operation: 'test' });
      }

      const stats = errorHandler.getErrorStats();

      expect(stats.total).toBe(15);
      expect(stats.recentErrors).toHaveLength(10);
      expect(stats.recentErrors[0].message).toBe('Error 5'); // Should start from error 5
      expect(stats.recentErrors[9].message).toBe('Error 14'); // Should end at error 14
    });
  });

  describe('Configuration', () => {
    it('should allow configuration updates', () => {
      const newConfig = {
        retryConfig: {
          maxRetries: 5,
          baseDelay: 2000,
          maxDelay: 20000,
          backoffMultiplier: 3,
          retryableErrors: [ErrorType.NETWORK]
        }
      };

      errorHandler.updateConfig(newConfig);

      // Test that new config is applied (indirectly through retry behavior)
      expect(() => errorHandler.updateConfig(newConfig)).not.toThrow();
    });

    it('should use custom user messages', async () => {
      const customMessages = {
        [ErrorType.NETWORK]: 'Connexion internet requise'
      };

      errorHandler.updateConfig({
        userMessages: customMessages
      });

      const errorInfo = await errorHandler.handleError(
        new Error('Network request failed'),
        { operation: 'test' }
      );

      expect(errorInfo.userMessage).toBe('Connexion internet requise');
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-Error objects', async () => {
      const errorInfo = await errorHandler.handleError('String error', { operation: 'test' });

      expect(errorInfo.type).toBe(ErrorType.UNKNOWN);
      expect(errorInfo.message).toBe('String error');
      expect(errorInfo.originalError).toBeUndefined();
    });

    it('should handle null/undefined errors', async () => {
      const errorInfo1 = await errorHandler.handleError(null, { operation: 'test' });
      const errorInfo2 = await errorHandler.handleError(undefined, { operation: 'test' });

      expect(errorInfo1.message).toBe('null');
      expect(errorInfo2.message).toBe('undefined');
    });

    it('should handle errors without context', async () => {
      const errorInfo = await errorHandler.handleError(new Error('Test'), {});

      expect(errorInfo.context.operation).toBe('unknown');
      expect(errorInfo.context.sessionId).toBeDefined();
    });
  });
});