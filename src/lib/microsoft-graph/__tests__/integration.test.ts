import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GraphConfig, TokenManager } from '../index';

// Mock environment variables
const mockEnv = {
  VITE_MICROSOFT_TENANT_ID: '00000000-0000-0000-0000-000000000000',
  VITE_MICROSOFT_CLIENT_ID: '11111111-1111-1111-1111-111111111111',
  VITE_MICROSOFT_CLIENT_SECRET: 'test-secret',
  VITE_MICROSOFT_SCOPE: 'https://graph.microsoft.com/.default'
};

vi.stubGlobal('import.meta', {
  env: mockEnv
});

Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true
});

describe('Microsoft Graph Integration', () => {
  beforeEach(() => {
    // Reset environment
    Object.assign(mockEnv, {
      VITE_MICROSOFT_TENANT_ID: '00000000-0000-0000-0000-000000000000',
      VITE_MICROSOFT_CLIENT_ID: '11111111-1111-1111-1111-111111111111',
      VITE_MICROSOFT_CLIENT_SECRET: 'test-secret',
      VITE_MICROSOFT_SCOPE: 'https://graph.microsoft.com/.default'
    });
    Object.assign(process.env, mockEnv);
  });

  it('should initialize configuration successfully', () => {
    const config = GraphConfig.getInstance();
    config.reset();
    
    const result = config.initialize();
    
    expect(result).toEqual({
      tenantId: '00000000-0000-0000-0000-000000000000',
      clientId: '11111111-1111-1111-1111-111111111111',
      clientSecret: 'test-secret',
      scope: 'https://graph.microsoft.com/.default'
    });
  });

  it('should create token manager instance', () => {
    const tokenManager = TokenManager.getInstance();
    
    expect(tokenManager).toBeDefined();
    expect(tokenManager.isTokenValid()).toBe(false);
    expect(tokenManager.getTokenInfo()).toBeNull();
  });

  it('should handle configuration errors gracefully', () => {
    const config = GraphConfig.getInstance();
    config.reset();
    
    delete mockEnv.VITE_MICROSOFT_TENANT_ID;
    delete process.env.VITE_MICROSOFT_TENANT_ID;
    
    expect(() => config.initialize()).toThrow('Missing required environment variable');
  });

  it('should provide singleton instances', () => {
    const config1 = GraphConfig.getInstance();
    const config2 = GraphConfig.getInstance();
    const tokenManager1 = TokenManager.getInstance();
    const tokenManager2 = TokenManager.getInstance();
    
    expect(config1).toBe(config2);
    expect(tokenManager1).toBe(tokenManager2);
  });
});