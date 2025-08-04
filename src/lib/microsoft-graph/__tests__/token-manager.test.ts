import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TokenManager } from '../token-manager';
import { GraphApiError } from '../types';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock environment variables
const mockEnv = {
  VITE_MICROSOFT_TENANT_ID: 'test-tenant-id',
  VITE_MICROSOFT_CLIENT_ID: 'test-client-id',
  VITE_MICROSOFT_CLIENT_SECRET: 'test-client-secret',
  VITE_MICROSOFT_SCOPE: 'https://graph.microsoft.com/.default'
};

vi.stubGlobal('import.meta', {
  env: mockEnv
});

Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true
});

describe('TokenManager', () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    tokenManager = TokenManager.getInstance();
    tokenManager.clearToken();
    mockFetch.mockClear();
    
    // Reset environment
    Object.assign(mockEnv, {
      VITE_MICROSOFT_TENANT_ID: 'test-tenant-id',
      VITE_MICROSOFT_CLIENT_ID: 'test-client-id',
      VITE_MICROSOFT_CLIENT_SECRET: 'test-client-secret',
      VITE_MICROSOFT_SCOPE: 'https://graph.microsoft.com/.default'
    });
    Object.assign(process.env, mockEnv);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return cached token if valid', async () => {
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      // First call should fetch token
      const token1 = await tokenManager.getAccessToken();
      expect(token1).toBe('test-token');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cached token
      const token2 = await tokenManager.getAccessToken();
      expect(token2).toBe('test-token');
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional fetch
    });

    it('should handle concurrent token refresh requests', async () => {
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      // Make multiple concurrent requests
      const promises = [
        tokenManager.getAccessToken(),
        tokenManager.getAccessToken(),
        tokenManager.getAccessToken()
      ];

      const tokens = await Promise.all(promises);
      
      // All should return the same token
      expect(tokens).toEqual(['test-token', 'test-token', 'test-token']);
      // But only one fetch should have been made
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockTokenResponse = {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      const token = await tokenManager.refreshToken();
      
      expect(token).toBe('new-access-token');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })
      );
    });

    it('should handle token request failure', async () => {
      const errorResponse = {
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve(errorResponse)
      });

      await expect(tokenManager.refreshToken()).rejects.toThrow(GraphApiError);
      await expect(tokenManager.refreshToken()).rejects.toThrow('Invalid client credentials');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(tokenManager.refreshToken()).rejects.toThrow(GraphApiError);
      await expect(tokenManager.refreshToken()).rejects.toThrow('Network error during token request');
    });

    it('should clear token info on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      await expect(tokenManager.refreshToken()).rejects.toThrow();
      expect(tokenManager.getTokenInfo()).toBeNull();
    });

    it('should handle invalid_grant error (expired refresh token)', async () => {
      const errorResponse = {
        error: 'invalid_grant',
        error_description: 'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(errorResponse)
      });

      await expect(tokenManager.refreshToken()).rejects.toThrow(GraphApiError);
      await expect(tokenManager.refreshToken()).rejects.toThrow('invalid, expired, revoked');
    });

    it('should handle server errors with retry logic', async () => {
      const errorResponse = {
        error: 'server_error',
        error_description: 'The authorization server encountered an unexpected condition that prevented it from fulfilling the request.'
      };

      // First attempt fails with server error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve(errorResponse)
      });

      // Second attempt succeeds
      const successResponse = {
        access_token: 'retry-success-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(successResponse)
      });

      const token = await tokenManager.refreshToken();
      expect(token).toBe('retry-success-token');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle malformed token response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          // Missing required fields
          token_type: 'Bearer'
        })
      });

      await expect(tokenManager.refreshToken()).rejects.toThrow(GraphApiError);
      await expect(tokenManager.refreshToken()).rejects.toThrow('Invalid token response');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token'))
      });

      await expect(tokenManager.refreshToken()).rejects.toThrow(GraphApiError);
      await expect(tokenManager.refreshToken()).rejects.toThrow('Failed to parse token response');
    });

    it('should handle timeout scenarios', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      
      mockFetch.mockRejectedValueOnce(timeoutError);

      await expect(tokenManager.refreshToken()).rejects.toThrow(GraphApiError);
      await expect(tokenManager.refreshToken()).rejects.toThrow('Request timeout during token refresh');
    });

    it('should validate token response format', async () => {
      const invalidResponses = [
        { access_token: '', expires_in: 3600 }, // Empty token
        { access_token: 'valid-token', expires_in: -1 }, // Negative expiry
        { access_token: 'valid-token', expires_in: 'invalid' }, // Non-numeric expiry
        null, // Null response
        undefined // Undefined response
      ];

      for (const response of invalidResponses) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response)
        });

        await expect(tokenManager.refreshToken()).rejects.toThrow(GraphApiError);
        tokenManager.clearToken();
      }
    });
  });

  describe('isTokenValid', () => {
    it('should return false when no token', () => {
      expect(tokenManager.isTokenValid()).toBe(false);
    });

    it('should return true for valid non-expired token', async () => {
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      await tokenManager.getAccessToken();
      expect(tokenManager.isTokenValid()).toBe(true);
    });

    it('should return false for expired token', async () => {
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 0, // Expires immediately
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      await tokenManager.getAccessToken();
      
      // Wait a bit to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(tokenManager.isTokenValid()).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should clear token', () => {
      tokenManager.clearToken();
      expect(tokenManager.getTokenInfo()).toBeNull();
      expect(tokenManager.isTokenValid()).toBe(false);
    });

    it('should return token info', async () => {
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      await tokenManager.getAccessToken();
      const tokenInfo = tokenManager.getTokenInfo();
      
      expect(tokenInfo).toMatchObject({
        accessToken: 'test-token',
        isValid: true
      });
      expect(tokenInfo?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should calculate time until expiry', async () => {
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      await tokenManager.getAccessToken();
      const timeUntilExpiry = tokenManager.getTimeUntilExpiry();
      
      expect(timeUntilExpiry).toBeGreaterThan(0);
      expect(timeUntilExpiry).toBeLessThanOrEqual(3600 * 1000);
    });

    it('should detect if token will expire soon', async () => {
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 60, // 1 minute
        scope: 'https://graph.microsoft.com/.default'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      await tokenManager.getAccessToken();
      
      expect(tokenManager.willExpireSoon(5)).toBe(true); // Within 5 minutes
      expect(tokenManager.willExpireSoon(0.5)).toBe(false); // Not within 30 seconds
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = TokenManager.getInstance();
      const instance2 = TokenManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});