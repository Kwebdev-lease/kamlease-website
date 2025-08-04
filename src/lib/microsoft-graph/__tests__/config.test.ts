import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GraphConfig } from '../config';
import { GraphApiError } from '../types';

// Mock import.meta.env
const mockEnv = {
  VITE_MICROSOFT_TENANT_ID: '00000000-0000-0000-0000-000000000000',
  VITE_MICROSOFT_CLIENT_ID: '11111111-1111-1111-1111-111111111111',
  VITE_MICROSOFT_CLIENT_SECRET: 'test-secret',
  VITE_MICROSOFT_SCOPE: 'https://graph.microsoft.com/.default'
};

// Mock both import.meta.env and process.env
vi.stubGlobal('import.meta', {
  env: mockEnv
});

Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true
});

describe('GraphConfig', () => {
  let config: GraphConfig;

  beforeEach(() => {
    config = GraphConfig.getInstance();
    config.reset();
    
    // Reset mock environment
    Object.assign(mockEnv, {
      VITE_MICROSOFT_TENANT_ID: '00000000-0000-0000-0000-000000000000',
      VITE_MICROSOFT_CLIENT_ID: '11111111-1111-1111-1111-111111111111',
      VITE_MICROSOFT_CLIENT_SECRET: 'test-secret',
      VITE_MICROSOFT_SCOPE: 'https://graph.microsoft.com/.default'
    });
    
    // Update process.env as well
    Object.assign(process.env, mockEnv);
  });

  describe('initialize', () => {
    it('should initialize configuration with valid environment variables', () => {
      const result = config.initialize();

      expect(result).toEqual({
        tenantId: '00000000-0000-0000-0000-000000000000',
        clientId: '11111111-1111-1111-1111-111111111111',
        clientSecret: 'test-secret',
        scope: 'https://graph.microsoft.com/.default'
      });
    });

    it('should use default scope if not provided', () => {
      delete mockEnv.VITE_MICROSOFT_SCOPE;
      delete process.env.VITE_MICROSOFT_SCOPE;
      
      const result = config.initialize();
      
      expect(result.scope).toBe('https://graph.microsoft.com/.default');
    });

    it('should throw error for missing tenant ID', () => {
      delete mockEnv.VITE_MICROSOFT_TENANT_ID;
      delete process.env.VITE_MICROSOFT_TENANT_ID;
      config.reset();
      
      expect(() => config.initialize()).toThrow(GraphApiError);
      expect(() => config.initialize()).toThrow('Missing required environment variable: VITE_MICROSOFT_TENANT_ID');
    });

    it('should throw error for missing client ID', () => {
      delete mockEnv.VITE_MICROSOFT_CLIENT_ID;
      delete process.env.VITE_MICROSOFT_CLIENT_ID;
      config.reset();
      
      expect(() => config.initialize()).toThrow(GraphApiError);
      expect(() => config.initialize()).toThrow('Missing required environment variable: VITE_MICROSOFT_CLIENT_ID');
    });

    it('should throw error for missing client secret', () => {
      delete mockEnv.VITE_MICROSOFT_CLIENT_SECRET;
      delete process.env.VITE_MICROSOFT_CLIENT_SECRET;
      config.reset();
      
      expect(() => config.initialize()).toThrow(GraphApiError);
      expect(() => config.initialize()).toThrow('Missing required environment variable: VITE_MICROSOFT_CLIENT_SECRET');
    });

    it('should throw error for invalid tenant ID format', () => {
      config.reset();
      mockEnv.VITE_MICROSOFT_TENANT_ID = 'invalid-guid';
      process.env.VITE_MICROSOFT_TENANT_ID = 'invalid-guid';
      
      expect(() => config.initialize()).toThrow(GraphApiError);
      expect(() => config.initialize()).toThrow('Invalid tenant ID format');
    });

    it('should throw error for invalid client ID format', () => {
      config.reset();
      mockEnv.VITE_MICROSOFT_CLIENT_ID = 'invalid-guid';
      process.env.VITE_MICROSOFT_CLIENT_ID = 'invalid-guid';
      
      expect(() => config.initialize()).toThrow(GraphApiError);
      expect(() => config.initialize()).toThrow('Invalid client ID format');
    });

    it('should throw error for invalid scope format', () => {
      config.reset();
      mockEnv.VITE_MICROSOFT_SCOPE = 'invalid-scope';
      process.env.VITE_MICROSOFT_SCOPE = 'invalid-scope';
      
      expect(() => config.initialize()).toThrow(GraphApiError);
      expect(() => config.initialize()).toThrow('Invalid scope format');
    });

    it('should return same config on subsequent calls', () => {
      const first = config.initialize();
      const second = config.initialize();
      
      expect(first).toBe(second);
    });
  });

  describe('getConfig', () => {
    it('should return config after initialization', () => {
      config.initialize();
      const result = config.getConfig();
      
      expect(result.tenantId).toBe('00000000-0000-0000-0000-000000000000');
    });

    it('should throw error if not initialized', () => {
      expect(() => config.getConfig()).toThrow(GraphApiError);
      expect(() => config.getConfig()).toThrow('Graph API configuration not initialized');
    });
  });

  describe('isConfigured', () => {
    it('should return true when properly configured', () => {
      expect(config.isConfigured()).toBe(true);
    });

    it('should return false when missing required variables', () => {
      delete mockEnv.VITE_MICROSOFT_TENANT_ID;
      delete process.env.VITE_MICROSOFT_TENANT_ID;
      config.reset();
      
      expect(config.isConfigured()).toBe(false);
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = GraphConfig.getInstance();
      const instance2 = GraphConfig.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});