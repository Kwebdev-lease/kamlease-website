/**
 * EmailJS Integration Tests
 * Tests email sending with new email and phone fields, error handling, and appointment compatibility
 * Requirements: 3.1, 3.2, 3.3, 3.5, 3.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailJSService, EmailJSErrorCodes, type EmailResult, type AppointmentFormData } from '../emailjs-service';
import { EnhancedContactFormData } from '../form-types';
import { getEmailJSConfig, type EmailJSConfig } from '../emailjs-config';
import { emailTemplateFormatter } from '../emailjs-template-formatter';

// Mock fetch globally
global.fetch = vi.fn();

// Mock console methods to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('EmailJS Integration Tests', () => {
  let service: EmailJSService;
  let mockConfig: EmailJSConfig;

  beforeEach(() => {
    mockConfig = {
      serviceId: 'service_kamlease',
      templateId: 'template_contact',
      userId: 'lwGUqh3EWS-EkkziA',
      accessToken: '5ngYFFOOSo6xm-bHhMykD'
    };

    service = new EmailJSService(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Email sending with new fields', () => {
    const completeFormData: EnhancedContactFormData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      telephone: '+33 1 23 45 67 89',
      societe: 'Entreprise Test',
      message: 'Ceci est un message de test avec les nouveaux champs email et téléphone.'
    };

    it('should send email with all new fields included', async () => {
      // Mock successful EmailJS response
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        text: () => Promise.resolve('email_12345')
      });

      const result = await service.sendContactMessage(completeFormData);

      expect(result.success).toBe(true);
      expect(result.type).toBe('message');
      expect(result.emailId).toBe('email_12345');

      // Verify the request was made with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'https://api.emailjs.com/api/v1.0/email/send',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"from_email":"jean.dupont@example.com"')
        })
      );

      // Verify phone number is included
      const callArgs = (fetch as any).mock.calls[0][1];
      const requestBody = JSON.parse(callArgs.body);
      expect(requestBody.template_params.phone).toBe('+33 1 23 45 67 89');
      expect(requestBody.template_params.from_email).toBe('jean.dupont@example.com');
      expect(requestBody.template_params.reply_to).toBe('jean.dupont@example.com');
    });

    it('should format email field correctly in template parameters', async () => {
      const params = service.getFormattedParams(completeFormData);

      expect(params.from_email).toBe('jean.dupont@example.com');
      expect(params.reply_to).toBe('jean.dupont@example.com');
      expect(params.phone).toBe('+33 1 23 45 67 89');
      expect(params.from_name).toBe('Jean Dupont');
      expect(params.company).toBe('Entreprise Test');
      expect(params.to_email).toBe('contact@kamlease.com');
    });

    it('should handle email field with different formats', async () => {
      const testCases = [
        { email: 'test@example.com', expected: 'test@example.com' },
        { email: '  TEST@EXAMPLE.COM  ', expected: '  TEST@EXAMPLE.COM  ' }, // No sanitization in formatter
        { email: 'user.name+tag@domain.co.uk', expected: 'user.name+tag@domain.co.uk' }
      ];

      for (const testCase of testCases) {
        const formData = { ...completeFormData, email: testCase.email };
        const params = service.getFormattedParams(formData);
        
        expect(params.from_email).toBe(testCase.expected);
        expect(params.reply_to).toBe(testCase.expected);
      }
    });

    it('should handle phone field with different formats', async () => {
      const testCases = [
        { phone: '01 23 45 67 89', expected: '01 23 45 67 89' }, // Already formatted
        { phone: '0123456789', expected: '01 23 45 67 89' }, // Gets formatted
        { phone: '+33123456789', expected: '+33 1 23 45 67 89' }, // International format
        { phone: '+1234567890', expected: '+1234567890' } // Non-French international
      ];

      for (const testCase of testCases) {
        const formData = { ...completeFormData, telephone: testCase.phone };
        const params = service.getFormattedParams(formData);
        
        expect(params.phone).toBe(testCase.expected);
      }
    });

    it('should handle optional company field', async () => {
      const formDataWithoutCompany = { ...completeFormData, societe: '' };
      const params = service.getFormattedParams(formDataWithoutCompany);

      expect(params.company).toBe('');
      expect(params.from_email).toBe('jean.dupont@example.com');
      expect(params.phone).toBe('+33 1 23 45 67 89');
    });
  });

  describe('EmailJS error handling', () => {
    const testFormData: EnhancedContactFormData = {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      telephone: '+33123456789',
      societe: 'Test Co',
      message: 'Test message'
    };

    it('should handle invalid service configuration (400)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 400,
        text: () => Promise.resolve('Invalid service ID')
      });

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_INVALID_SERVICE');
      expect(result.error).toContain('Invalid service ID');
    });

    it('should handle template not found (404)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 404,
        text: () => Promise.resolve('Template not found')
      });

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_INVALID_TEMPLATE');
      expect(result.error).toContain('Template not found');
    });

    it('should handle rate limiting (429)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 429,
        text: () => Promise.resolve('Rate limit exceeded')
      });

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_RATE_LIMITED');
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should handle server errors (500)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 500,
        text: () => Promise.resolve('Internal server error')
      });

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_SERVER_ERROR');
      expect(result.error).toContain('Internal server error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network connection failed'));

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_NETWORK_ERROR');
      expect(result.error).toBe('EMAILJS_NETWORK_ERROR: Network connection failed');
    });

    it('should handle unknown error codes', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 418, // I'm a teapot
        text: () => Promise.resolve('Unknown error')
      });

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_SEND_FAILED');
      expect(result.error).toContain('Unknown error');
    });
  });

  describe('Appointment compatibility', () => {
    const appointmentData: AppointmentFormData = {
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@example.com',
      telephone: '+33 6 12 34 56 78',
      societe: 'Cabinet Martin',
      message: 'Je souhaite prendre rendez-vous pour discuter de mon projet.',
      appointmentDate: new Date('2024-12-15T14:30:00'),
      appointmentTime: '14:30'
    };

    it('should send appointment request with new fields', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        text: () => Promise.resolve('appointment_email_789')
      });

      const result = await service.sendAppointmentRequest(appointmentData);

      expect(result.success).toBe(true);
      expect(result.type).toBe('appointment');
      expect(result.emailId).toBe('appointment_email_789');

      // Verify appointment-specific parameters are included
      const callArgs = (fetch as any).mock.calls[0][1];
      const requestBody = JSON.parse(callArgs.body);
      const params = requestBody.template_params;

      expect(params.from_email).toBe('sophie.martin@example.com');
      expect(params.phone).toBe('+33 6 12 34 56 78');
      expect(params.appointment_date).toBeDefined();
      expect(params.appointment_time).toBe('14:30');
    });

    it('should format appointment parameters correctly', async () => {
      const params = service.getFormattedAppointmentParams(appointmentData);

      expect(params.from_email).toBe('sophie.martin@example.com');
      expect(params.phone).toBe('+33 6 12 34 56 78');
      expect(params.reply_to).toBe('sophie.martin@example.com');
      expect(params.appointment_date).toBe('15/12/2024');
      expect(params.appointment_time).toBe('14:30');
      expect(params.from_name).toBe('Sophie Martin');
    });

    it('should handle appointment errors correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 400,
        text: () => Promise.resolve('Invalid appointment data')
      });

      const result = await service.sendAppointmentRequest(appointmentData);

      expect(result.success).toBe(false);
      expect(result.type).toBe('appointment');
      expect(result.message).toBe('EMAILJS_INVALID_SERVICE');
    });
  });

  describe('Configuration testing', () => {
    it('should test configuration with sample data', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        text: () => Promise.resolve('test_config_email')
      });

      const result = await service.testConfiguration();

      expect(result.success).toBe(true);
      expect(result.type).toBe('message');
      expect(result.emailId).toBe('test_config_email');

      // Verify test data includes new fields
      const callArgs = (fetch as any).mock.calls[0][1];
      const requestBody = JSON.parse(callArgs.body);
      const params = requestBody.template_params;

      expect(params.from_email).toBe('test@example.com');
      expect(params.phone).toBe('+33 1 23 45 67 89');
    });

    it('should handle configuration test failures', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 400,
        text: () => Promise.resolve('Configuration test failed')
      });

      const result = await service.testConfiguration();

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_INVALID_SERVICE');
    });
  });

  describe('Template parameter validation', () => {
    it('should include all required template parameters', async () => {
      const formData: EnhancedContactFormData = {
        nom: 'Durand',
        prenom: 'Pierre',
        email: 'pierre.durand@test.fr',
        telephone: '06 98 76 54 32',
        societe: 'SARL Durand',
        message: 'Message de test complet'
      };

      const params = service.getFormattedParams(formData);

      // Verify all required parameters are present
      expect(params.from_name).toBeDefined();
      expect(params.from_email).toBeDefined();
      expect(params.phone).toBeDefined();
      expect(params.company).toBeDefined();
      expect(params.message).toBeDefined();
      expect(params.to_email).toBeDefined();
      expect(params.reply_to).toBeDefined();
      expect(params.date).toBeDefined();

      // Verify parameter values
      expect(params.from_name).toBe('Pierre Durand');
      expect(params.from_email).toBe('pierre.durand@test.fr');
      expect(params.phone).toBe('06 98 76 54 32');
      expect(params.company).toBe('SARL Durand');
      expect(params.reply_to).toBe('pierre.durand@test.fr');
      expect(params.to_email).toBe('contact@kamlease.com');
    });

    it('should handle missing optional fields gracefully', async () => {
      const minimalFormData: EnhancedContactFormData = {
        nom: 'Test',
        prenom: 'User',
        email: 'user@test.com',
        telephone: '0123456789',
        societe: '', // Optional field empty
        message: 'Minimal test message'
      };

      const params = service.getFormattedParams(minimalFormData);

      expect(params.company).toBe('');
      expect(params.from_email).toBe('user@test.com');
      expect(params.phone).toBe('01 23 45 67 89');
      expect(params.from_name).toBe('User Test');
    });
  });

  describe('Mock scenarios for automated testing', () => {
    it('should create mock for successful email sending', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        text: () => Promise.resolve('mock_email_id')
      });
      global.fetch = mockFetch;

      const testData: EnhancedContactFormData = {
        nom: 'Mock',
        prenom: 'Test',
        email: 'mock@test.com',
        telephone: '+33123456789',
        societe: 'Mock Company',
        message: 'Mock test message'
      };

      const result = await service.sendContactMessage(testData);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should create mock for email sending failure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 400,
        text: () => Promise.resolve('Mock error')
      });
      global.fetch = mockFetch;

      const testData: EnhancedContactFormData = {
        nom: 'Mock',
        prenom: 'Test',
        email: 'mock@test.com',
        telephone: '+33123456789',
        societe: 'Mock Company',
        message: 'Mock test message'
      };

      const result = await service.sendContactMessage(testData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('EMAILJS_INVALID_SERVICE');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should create mock for network error', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Mock network error'));
      global.fetch = mockFetch;

      const testData: EnhancedContactFormData = {
        nom: 'Mock',
        prenom: 'Test',
        email: 'mock@test.com',
        telephone: '+33123456789',
        societe: 'Mock Company',
        message: 'Mock test message'
      };

      const result = await service.sendContactMessage(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('EMAILJS_NETWORK_ERROR: Mock network error');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real EmailJS configuration integration', () => {
    it('should work with actual EmailJS configuration', () => {
      // Test that the service can be instantiated with real config
      const realConfig = {
        serviceId: 'service_kamlease',
        templateId: 'template_contact',
        userId: 'lwGUqh3EWS-EkkziA',
        accessToken: '5ngYFFOOSo6xm-bHhMykD'
      };

      const realService = new EmailJSService(realConfig);
      expect(realService).toBeInstanceOf(EmailJSService);

      // Test parameter formatting with real service
      const testData: EnhancedContactFormData = {
        nom: 'Real',
        prenom: 'Test',
        email: 'real@test.com',
        telephone: '+33123456789',
        societe: 'Real Company',
        message: 'Real test message'
      };

      const params = realService.getFormattedParams(testData);
      expect(params.from_email).toBe('real@test.com');
      expect(params.phone).toBe('+33 1 23 45 67 89');
    });

    it('should handle configuration loading from environment', () => {
      // Mock environment variables
      const originalEnv = import.meta.env;
      
      // This test verifies the configuration loading mechanism
      // In a real scenario, environment variables would be set
      expect(() => {
        const config = getEmailJSConfig();
        return config;
      }).not.toThrow();
    });
  });
});