/**
 * EmailJS Configuration Tests
 * Tests for EmailJS configuration validation and loading
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEmailJSConfig, sanitizeConfigForLogging } from '../emailjs-config';
import type { EmailJSConfig } from '../emailjs-config';

describe('EmailJS Configuration', () => {
  beforeEach(() => {
    // Clear console mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateEmailJSConfig', () => {
    it('should validate complete configuration', () => {
      const config: EmailJSConfig = {
        serviceId: 'service_test',
        templateId: 'template_test',
        userId: 'user_test',
        accessToken: 'token_test'
      };

      expect(validateEmailJSConfig(config)).toBe(true);
    });

    it('should validate configuration without access token', () => {
      const config = {
        serviceId: 'service_test',
        templateId: 'template_test',
        userId: 'user_test'
      };

      expect(validateEmailJSConfig(config)).toBe(true);
    });

    it('should reject configuration with missing required fields', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const incompleteConfigs = [
        { templateId: 'template_test', userId: 'user_test' }, // missing serviceId
        { serviceId: 'service_test', userId: 'user_test' }, // missing templateId
        { serviceId: 'service_test', templateId: 'template_test' }, // missing userId
        { serviceId: '', templateId: 'template_test', userId: 'user_test' }, // empty serviceId
      ];

      incompleteConfigs.forEach(config => {
        expect(validateEmailJSConfig(config)).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should validate serviceId format', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const config = {
        serviceId: 'invalid_service_id',
        templateId: 'template_test',
        userId: 'user_test'
      };

      expect(validateEmailJSConfig(config)).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('serviceId should start with "service_"')
      );

      consoleSpy.mockRestore();
    });

    it('should validate templateId format', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const config = {
        serviceId: 'service_test',
        templateId: 'invalid_template_id',
        userId: 'user_test'
      };

      expect(validateEmailJSConfig(config)).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('templateId should start with "template_"')
      );

      consoleSpy.mockRestore();
    });
  });

  // Note: loadEmailJSConfig and getEmailJSConfig tests are skipped as they depend on 
  // environment variables which are difficult to mock reliably in tests.
  // These functions are tested through integration tests.

  describe('sanitizeConfigForLogging', () => {
    it('should sanitize sensitive configuration data', () => {
      const config: EmailJSConfig = {
        serviceId: 'service_kamlease',
        templateId: 'template_contact',
        userId: 'user123456789',
        accessToken: 'secret_token'
      };

      const sanitized = sanitizeConfigForLogging(config);

      expect(sanitized.serviceId).toBe('service_kamlease');
      expect(sanitized.templateId).toBe('template_contact');
      expect(sanitized.userId).toBe('user***');
      expect(sanitized).not.toHaveProperty('accessToken');
    });

    it('should handle undefined userId', () => {
      const config = {
        serviceId: 'service_kamlease',
        templateId: 'template_contact',
        userId: undefined as any
      };

      const sanitized = sanitizeConfigForLogging(config);

      expect(sanitized.userId).toBeUndefined();
    });
  });
});