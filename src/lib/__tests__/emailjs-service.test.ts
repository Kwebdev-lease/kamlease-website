/**
 * EmailJS Service Tests
 * Tests for the enhanced EmailJS service functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailJSService, EmailJSErrorCodes } from '../emailjs-service';
import { EnhancedContactFormData } from '../form-types';
import type { EmailJSConfig } from '../emailjs-config';

// Mock fetch globally
global.fetch = vi.fn();

describe('EmailJSService', () => {
  let service: EmailJSService;
  let mockConfig: EmailJSConfig;
  let testFormData: EnhancedContactFormData;

  beforeEach(() => {
    mockConfig = {
      serviceId: 'service_test',
      templateId: 'template_test',
      userId: 'test_user_id',
      accessToken: 'test_access_token'
    };

    service = new EmailJSService(mockConfig);

    testFormData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      telephone: '+33123456789',
      societe: 'Test Company',
      message: 'Test message'
    };

    vi.clearAllMocks();
  });

  describe('sendContactMessage', () => {
    it('should send contact message successfully', async () => {
      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        text: () => Promise.resolve('email_sent_id_123')
      });

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(true);
      expect(result.type).toBe('message');
      expect(result.emailId).toBe('email_sent_id_123');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.emailjs.com/api/v1.0/email/send',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should handle EmailJS errors correctly', async () => {
      // Mock error response
      (global.fetch as any).mockResolvedValueOnce({
        status: 400,
        text: () => Promise.resolve('Invalid service ID')
      });

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.type).toBe('message');
      expect(result.error).toContain('EMAILJS_INVALID_SERVICE');
    });

    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.sendContactMessage(testFormData);

      expect(result.success).toBe(false);
      expect(result.type).toBe('message');
      expect(result.error).toBe('EMAILJS_NETWORK_ERROR: Network error');
    });
  });

  describe('sendAppointmentRequest', () => {
    it('should send appointment request successfully', async () => {
      const appointmentData = {
        ...testFormData,
        appointmentDate: new Date('2024-12-15'),
        appointmentTime: '14:30'
      };

      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        text: () => Promise.resolve('appointment_email_id_456')
      });

      const result = await service.sendAppointmentRequest(appointmentData);

      expect(result.success).toBe(true);
      expect(result.type).toBe('appointment');
      expect(result.emailId).toBe('appointment_email_id_456');
    });
  });

  describe('getFormattedParams', () => {
    it('should return formatted template parameters', () => {
      const params = service.getFormattedParams(testFormData);

      expect(params.from_name).toBe('Jean Dupont');
      expect(params.from_email).toBe('jean.dupont@example.com');
      expect(params.phone).toBe('+33 1 23 45 67 89');
      expect(params.company).toBe('Test Company');
      expect(params.reply_to).toBe('jean.dupont@example.com');
      expect(params.to_email).toBe('contact@kamlease.com');
    });
  });

  describe('testConfiguration', () => {
    it('should test configuration with sample data', async () => {
      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        text: () => Promise.resolve('test_email_id')
      });

      const result = await service.testConfiguration();

      expect(result.success).toBe(true);
      expect(result.type).toBe('message');
    });
  });
});