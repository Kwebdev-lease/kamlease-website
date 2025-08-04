/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeConfiguration, validateRuntimeConfiguration, getConfigurationSummary } from '../config-init';
import { configManager } from '../config';

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

describe('Configuration Initialization', () => {
  beforeEach(() => {
    configManager.reset();
    vi.stubGlobal('import', {
      meta: {
        env: mockEnv
      }
    });
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('initializeConfiguration', () => {
    it('should initialize successfully with valid configuration', async () => {
      const result = await initializeConfiguration();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(console.log).toHaveBeenCalledWith('✅ Configuration initialized successfully');
    });

    it('should return warnings for problematic feature flag combinations', async () => {
      const problematicEnv = {
        ...mockEnv,
        VITE_ENABLE_CALENDAR_BOOKING: 'false',
        VITE_ENABLE_APPOINTMENT_CONFLICTS: 'true'
      };

      vi.stubGlobal('import', {
        meta: {
          env: problematicEnv
        }
      });

      const result = await initializeConfiguration();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Appointment conflicts feature is enabled but calendar booking is disabled');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn when both calendar booking and email fallback are disabled', async () => {
      const problematicEnv = {
        ...mockEnv,
        VITE_ENABLE_CALENDAR_BOOKING: 'false',
        VITE_ENABLE_EMAIL_FALLBACK: 'false'
      };

      vi.stubGlobal('import', {
        meta: {
          env: problematicEnv
        }
      });

      const result = await initializeConfiguration();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Both calendar booking and email fallback are disabled - users cannot submit appointments');
    });

    it('should warn when business hours window is shorter than appointment duration', async () => {
      const problematicEnv = {
        ...mockEnv,
        VITE_BUSINESS_START_TIME: '14:00',
        VITE_BUSINESS_END_TIME: '14:15',
        VITE_APPOINTMENT_DURATION: '30'
      };

      vi.stubGlobal('import', {
        meta: {
          env: problematicEnv
        }
      });

      const result = await initializeConfiguration();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Business hours window (15 minutes) is shorter than appointment duration (30 minutes)');
    });

    it('should handle configuration errors gracefully', async () => {
      const invalidEnv = {
        ...mockEnv,
        VITE_MICROSOFT_TENANT_ID: 'invalid-guid'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidEnv
        }
      });

      const result = await initializeConfiguration();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Configuration Error');
      expect(result.error).toContain('Invalid tenant ID format');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      // Mock a scenario where an unexpected error occurs
      vi.spyOn(configManager, 'initialize').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await initializeConfiguration();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unexpected error during configuration initialization');
    });
  });

  describe('validateRuntimeConfiguration', () => {
    it('should validate successfully when configuration is initialized', () => {
      configManager.initialize();
      const result = validateRuntimeConfiguration();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail when configuration is not initialized', () => {
      const result = validateRuntimeConfiguration();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Configuration not initialized');
    });

    it('should warn about incomplete Microsoft Graph credentials', () => {
      const incompleteEnv = {
        ...mockEnv,
        VITE_MICROSOFT_CLIENT_SECRET: ''
      };

      vi.stubGlobal('import', {
        meta: {
          env: incompleteEnv
        }
      });

      configManager.initialize();
      const result = validateRuntimeConfiguration();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Calendar booking is enabled but Microsoft Graph credentials are incomplete');
    });

    it('should handle timezone validation errors', () => {
      const invalidTimezoneEnv = {
        ...mockEnv,
        VITE_BUSINESS_TIMEZONE: 'Invalid/Timezone'
      };

      vi.stubGlobal('import', {
        meta: {
          env: invalidTimezoneEnv
        }
      });

      configManager.initialize();
      const result = validateRuntimeConfiguration();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid timezone configuration');
    });

    it('should handle validation errors gracefully', () => {
      configManager.initialize();
      
      // Mock an error in getConfig
      vi.spyOn(configManager, 'getConfig').mockImplementation(() => {
        throw new Error('Mock error');
      });

      const result = validateRuntimeConfiguration();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Mock error');
    });
  });

  describe('getConfigurationSummary', () => {
    it('should return not_initialized status when not initialized', () => {
      const summary = getConfigurationSummary();

      expect(summary.status).toBe('not_initialized');
    });

    it('should return configuration summary when initialized', () => {
      configManager.initialize();
      const summary = getConfigurationSummary();

      expect(summary.status).toBe('initialized');
      expect(summary.features).toEqual({
        calendarBooking: true,
        appointmentConflicts: true,
        emailFallback: true
      });
      expect(summary.business.timezone).toBe('Europe/Paris');
      expect(summary.business.workingDays).toEqual(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
      expect(summary.microsoftGraph.configured).toBe(true);
    });

    it('should handle errors gracefully', () => {
      configManager.initialize();
      
      // Mock an error
      vi.spyOn(configManager, 'getConfig').mockImplementation(() => {
        throw new Error('Mock error');
      });

      const summary = getConfigurationSummary();

      expect(summary.status).toBe('error');
      expect(summary.error).toBe('Mock error');
    });

    it('should show unconfigured Microsoft Graph when credentials are missing', () => {
      const incompleteEnv = {
        ...mockEnv,
        VITE_MICROSOFT_TENANT_ID: '',
        VITE_MICROSOFT_CLIENT_ID: ''
      };

      vi.stubGlobal('import', {
        meta: {
          env: incompleteEnv
        }
      });

      configManager.initialize();
      const summary = getConfigurationSummary();

      expect(summary.microsoftGraph.configured).toBe(false);
    });
  });
});