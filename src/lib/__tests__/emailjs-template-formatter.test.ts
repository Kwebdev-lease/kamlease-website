/**
 * EmailJS Template Formatter Tests
 * Tests for the template parameter formatting functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EmailJSTemplateFormatter, createEmailTemplateFormatter } from '../emailjs-template-formatter';
import { EnhancedContactFormData } from '../form-types';
import type { AppointmentFormData } from '../emailjs-service';

describe('EmailJSTemplateFormatter', () => {
  let formatter: EmailJSTemplateFormatter;
  let testFormData: EnhancedContactFormData;
  let testAppointmentData: AppointmentFormData;

  beforeEach(() => {
    formatter = new EmailJSTemplateFormatter();

    testFormData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      telephone: '+33123456789',
      societe: 'Test Company',
      message: 'Test message content'
    };

    testAppointmentData = {
      ...testFormData,
      appointmentDate: new Date('2024-12-15'),
      appointmentTime: '14:30'
    };
  });

  describe('formatContactMessage', () => {
    it('should format contact message with all required fields', () => {
      const result = formatter.formatContactMessage(testFormData);

      expect(result.from_name).toBe('Jean Dupont');
      expect(result.from_email).toBe('jean.dupont@example.com');
      expect(result.phone).toBe('+33 1 23 45 67 89');
      expect(result.company).toBe('Test Company');
      expect(result.message).toBe('Test message content');
      expect(result.to_email).toBe('contact@kamlease.com');
      expect(result.reply_to).toBe('jean.dupont@example.com');
      expect(result.timestamp_iso).toBeDefined();
      expect(result.timestamp_readable).toBeDefined();
    });

    it('should format contact info with emojis by default', () => {
      const result = formatter.formatContactMessage(testFormData);

      expect(result.contact_info_formatted).toContain('👤 Jean Dupont');
      expect(result.contact_info_formatted).toContain('📧 jean.dupont@example.com');
      expect(result.contact_info_formatted).toContain('📞 +33 1 23 45 67 89');
      expect(result.contact_info_formatted).toContain('🏢 Test Company');
    });

    it('should handle missing company field', () => {
      const dataWithoutCompany = { ...testFormData, societe: '' };
      const result = formatter.formatContactMessage(dataWithoutCompany);

      expect(result.company).toBe('');
      expect(result.contact_info_formatted).not.toContain('🏢');
    });
  });

  describe('formatAppointmentRequest', () => {
    it('should format appointment request with all fields', () => {
      const result = formatter.formatAppointmentRequest(testAppointmentData);

      expect(result.from_name).toBe('Jean Dupont');
      expect(result.appointment_date).toBe('15/12/2024');
      expect(result.appointment_time).toBe('14:30');
      expect(result.appointment_info_formatted).toContain('📅 15/12/2024 à 14:30');
      expect(result.message_formatted).toContain('--- DEMANDE DE RENDEZ-VOUS ---');
      expect(result.message_formatted).toContain('Date souhaitée: 15/12/2024');
      expect(result.message_formatted).toContain('Heure souhaitée: 14:30');
    });
  });

  describe('phone number formatting', () => {
    it('should format French phone numbers correctly', () => {
      const testCases = [
        { input: '+33123456789', expected: '+33 1 23 45 67 89' },
        { input: '0123456789', expected: '01 23 45 67 89' },
        { input: '+33 1 23 45 67 89', expected: '+33 1 23 45 67 89' }
      ];

      testCases.forEach(({ input, expected }) => {
        const data = { ...testFormData, telephone: input };
        const result = formatter.formatContactMessage(data);
        expect(result.phone).toBe(expected);
      });
    });

    it('should preserve original format for unrecognized patterns', () => {
      const data = { ...testFormData, telephone: '+1-555-123-4567' };
      const result = formatter.formatContactMessage(data);
      expect(result.phone).toBe('+1-555-123-4567');
    });
  });

  describe('custom formatting options', () => {
    it('should disable emojis when configured', () => {
      const customFormatter = createEmailTemplateFormatter({ includeEmojis: false });
      const result = customFormatter.formatContactMessage(testFormData);

      expect(result.contact_info_formatted).not.toContain('👤');
      expect(result.contact_info_formatted).not.toContain('📧');
      expect(result.contact_info_formatted).not.toContain('📞');
      expect(result.contact_info_formatted).toContain('Jean Dupont');
    });

    it('should use English date format when configured', () => {
      const customFormatter = createEmailTemplateFormatter({ dateFormat: 'en-US' });
      const result = customFormatter.formatAppointmentRequest(testAppointmentData);

      expect(result.appointment_date).toBe('12/15/2024');
    });
  });

  describe('options management', () => {
    it('should update options correctly', () => {
      const initialOptions = formatter.getOptions();
      expect(initialOptions.includeEmojis).toBe(true);

      formatter.updateOptions({ includeEmojis: false });
      const updatedOptions = formatter.getOptions();
      expect(updatedOptions.includeEmojis).toBe(false);
    });
  });
});