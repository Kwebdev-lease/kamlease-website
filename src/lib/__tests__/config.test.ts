/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager, ConfigurationError, configManager } from '../config';

// Mock environment variables
const mockEnv = {
  VITE_MICROSOFT_TENANT_ID: '00000000-0000-0000-0000-000000000000',
  VITE_MICROSOFT_CLIENT_ID: '11111111-1111-1111-1111-111111111111',
  VITE_MICROSOFT_CLIENT_SECRET: 'fake-client-secret-for-tests',
  VITE_MICROSOFT_SCOPE: 'https://graph.microsoft.com/.default',
  VITE_CALENDAR_EMAIL: 'contact@kamlease.com',
  VITE_BUSINESS_TIMEZONE: 'Europe/Paris',
  VITE_BUSINESS_START_TIME: '14:00',
  VITE_BUSINESS_END_TIME: '16:30',
  VITE_APPOINTMENT_DURATION: '30',
  VITE_ENABLE_CALENDAR_BOOKING: 'true',
  VITE_ENABLE_APPOINTMENT_CONFLICTS: 'true',
  VITE_ENABLE_EMAIL_FALLBACK: 'true'
};

describe('ConfigManager', () => {
  let manager: ConfigManager;

  beforeEach(() => {
    // Reset the singleton instance
    configManager.reset();
    manager = ConfigManager.getInstance();
    
    // Mock import.meta.env
    vi.stubGlobal('import', {
      meta: {
        env: mockEnv
      }
    });
  });

  describe('initialization', () => {
    it('should initialize configuration successfully with valid environment variables', () => {
      const config = manager.initialize();

      expect(config).toBeDefined();
      expect(config.microsoftGraph.tenantId).toBe(mockEnv.VITE_MICROSOFT_TENANT_ID);
      expect(config.microsoftGraph.clientId).toBe(mockEnv.VITE_MICROSOFT_CLIENT_ID);
      expect(config.business.calendarEmail).toBe(mockEnv.VITE_CALENDAR_EMAIL);
      expect(config.features.calendarBooking).toBe(true);
    });

    it('should use default values for optional environment variables', () => {
      const envWithoutOptional = { ...mockEnv };
      delete envWithoutOptional.VITE_MICROSOFT_SCOPE;
      delete envWithoutOptional.VITE_BUSINESS_TIMEZONE;
      delete envWithoutOptional.VITE_APPOINTMENT_DURATION;

      vi.stubGlobal('import', {
        meta: {
          env: envWithoutOptional
        }
      });

      const config = manager.initialize();

      expect(config.microsoftGraph.scope).toBe('https://graph.microsoft.com/.default');
      expect(config.business.timezone).toBe('Europe/Paris');
      expect(config.business.appointmentDuration).toBe(30);
    });

    it('should throw error for missing required environment variables', () => {
      const incompleteEnv = { ...mockEnv };
      delete incompleteEnv.VITE_MICROSOFT_TENANT_ID;

      vi.stubGlobal('import', {
        meta: {
          env: incompleteEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Missing required environment variable: VITE_MICROSOFT_TENANT_ID');
    });

    it('should return same config on subsequent calls', () => {
      const config1 = manager.initialize();
      const config2 = manager.initialize();

      expect(config1).toBe(config2);
    });
  });

  describe('validation', () => {
    it('should validate GUID format for tenant and client IDs', () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_MICROSOFT_TENANT_ID: 'invalid-guid'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Invalid tenant ID format');
    });

    it('should validate email format', () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_CALENDAR_EMAIL: 'invalid-email'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Invalid calendar email format');
    });

    it('should validate time format', () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_BUSINESS_START_TIME: '25:00'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Invalid start time format');
    });

    it('should validate time range (start before end)', () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_BUSINESS_START_TIME: '16:30',
        VITE_BUSINESS_END_TIME: '14:00'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Start time must be before end time');
    });

    it('should validate appointment duration', () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_APPOINTMENT_DURATION: '0'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Appointment duration must be between 1 and 480 minutes');
    });

    it('should validate Microsoft Graph scope format', () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_MICROSOFT_SCOPE: 'invalid-scope'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Invalid scope format');
    });
  });

  describe('getConfig', () => {
    it('should return config after initialization', () => {
      manager.initialize();
      const config = manager.getConfig();

      expect(config).toBeDefined();
      expect(config.microsoftGraph.tenantId).toBe(mockEnv.VITE_MICROSOFT_TENANT_ID);
    });

    it('should throw error if not initialized', () => {
      expect(() => manager.getConfig()).toThrow(ConfigurationError);
      expect(() => manager.getConfig()).toThrow('Configuration not initialized');
    });
  });

  describe('getBusinessHours', () => {
    it('should return business hours configuration', () => {
      manager.initialize();
      const businessHours = manager.getBusinessHours();

      expect(businessHours.timezone).toBe('Europe/Paris');
      expect(businessHours.dailySchedule.startTime).toBe('14:00');
      expect(businessHours.dailySchedule.endTime).toBe('16:30');
      expect(businessHours.dailySchedule.slotDuration).toBe(30);
      expect(businessHours.workingDays.monday).toBe(true);
      expect(businessHours.workingDays.saturday).toBe(false);
    });
  });

  describe('getFeatureFlags', () => {
    it('should return feature flags', () => {
      manager.initialize();
      const flags = manager.getFeatureFlags();

      expect(flags.calendarBooking).toBe(true);
      expect(flags.appointmentConflicts).toBe(true);
      expect(flags.emailFallback).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return correct feature status', () => {
      manager.initialize();

      expect(manager.isFeatureEnabled('calendarBooking')).toBe(true);
      expect(manager.isFeatureEnabled('appointmentConflicts')).toBe(true);
      expect(manager.isFeatureEnabled('emailFallback')).toBe(true);
    });
  });

  describe('boolean environment variables', () => {
    it('should parse boolean values correctly', () => {
      const booleanEnv = {
        ...mockEnv,
        VITE_ENABLE_CALENDAR_BOOKING: 'false',
        VITE_ENABLE_APPOINTMENT_CONFLICTS: '0',
        VITE_ENABLE_EMAIL_FALLBACK: '1'
      };

      vi.stubGlobal('import', {
        meta: {
          env: booleanEnv
        }
      });

      const config = manager.initialize();

      expect(config.features.calendarBooking).toBe(false);
      expect(config.features.appointmentConflicts).toBe(false);
      expect(config.features.emailFallback).toBe(true);
    });

    it('should throw error for invalid boolean values', () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_ENABLE_CALENDAR_BOOKING: 'maybe'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      expect(() => manager.initialize()).toThrow(ConfigurationError);
      expect(() => manager.initialize()).toThrow('Invalid boolean value');
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(manager.isInitialized()).toBe(false);
    });

    it('should return true after initialization', () => {
      manager.initialize();
      expect(manager.isInitialized()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset configuration state', () => {
      manager.initialize();
      expect(manager.isInitialized()).toBe(true);

      manager.reset();
      expect(manager.isInitialized()).toBe(false);
      expect(() => manager.getConfig()).toThrow(ConfigurationError);
    });
  });
});