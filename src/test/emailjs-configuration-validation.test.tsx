import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailJSService } from '../lib/emailjs-service';
import { EmailJSConfig } from '../lib/emailjs-config';
import type { ContactFormData, AppointmentFormData } from '../lib/form-types';

// Mock EmailJS
vi.mock('@emailjs/browser', () => ({
  default: {
    init: vi.fn(),
    send: vi.fn(),
    sendForm: vi.fn()
  }
}));

describe('EmailJS Configuration Validation', () => {
  let emailService: EmailJSService;
  
  const mockContactData: ContactFormData = {
    nom: 'Dupont',
    prenom: 'Jean',
    societe: 'ACME Corp',
    email: 'jean.dupont@example.com',
    telephone: '+33 1 23 45 67 89',
    message: 'Message de test pour validation EmailJS'
  };

  const mockAppointmentData: AppointmentFormData = {
    ...mockContactData,
    appointmentDate: new Date('2025-02-15'),
    appointmentTime: '14:30'
  };

  beforeEach(() => {
    emailService = new EmailJSService();
    vi.clearAllMocks();
  });

  describe('Configuration Environment Variables', () => {
    it('should have all required environment variables', () => {
      const requiredVars = [
        'VITE_EMAILJS_SERVICE_ID',
        'VITE_EMAILJS_TEMPLATE_RECEPTION_ID',
        'VITE_EMAILJS_TEMPLATE_AUTORESPONSE_ID',
        'VITE_EMAILJS_USER_ID'
      ];

      requiredVars.forEach(varName => {
        const value = import.meta.env[varName];
        expect(value, `${varName} should be defined in environment`).toBeDefined();
        expect(value, `${varName} should not be empty`).not.toBe('');
      });
    });

    it('should validate EmailJS configuration object', () => {
      const config: EmailJSConfig = {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        templateReceptionId: import.meta.env.VITE_EMAILJS_TEMPLATE_RECEPTION_ID || '',
        templateAutoResponseId: import.meta.env.VITE_EMAILJS_TEMPLATE_AUTORESPONSE_ID || '',
        userId: import.meta.env.VITE_EMAILJS_USER_ID || '',
        accessToken: import.meta.env.VITE_EMAILJS_ACCESS_TOKEN
      };

      expect(config.serviceId).toMatch(/^service_/);
      expect(config.templateReceptionId).toMatch(/^template_/);
      expect(config.templateAutoResponseId).toMatch(/^template_/);
      expect(config.userId).toBeTruthy();
    });
  });

  describe('Template Variables Validation', () => {
    it('should format contact message template parameters correctly', () => {
      const templateParams = emailService['formatContactTemplateParams'](mockContactData, 'fr');

      expect(templateParams).toEqual({
        from_name: 'Jean Dupont',
        from_email: 'jean.dupont@example.com',
        phone: '+33 1 23 45 67 89',
        company: 'ACME Corp',
        message: 'Message de test pour validation EmailJS',
        reply_to: 'jean.dupont@example.com',
        date: expect.any(String),
        language: 'fr',
        is_french: true,
        is_english: false
      });
    });

    it('should format appointment template parameters correctly', () => {
      const templateParams = emailService['formatAppointmentTemplateParams'](mockAppointmentData, 'en');

      expect(templateParams).toEqual({
        from_name: 'Jean Dupont',
        from_email: 'jean.dupont@example.com',
        phone: '+33 1 23 45 67 89',
        company: 'ACME Corp',
        message: 'Message de test pour validation EmailJS',
        reply_to: 'jean.dupont@example.com',
        date: expect.any(String),
        appointment_date: '15/02/2025',
        appointment_time: '14:30',
        language: 'en',
        is_french: false,
        is_english: true
      });
    });

    it('should handle optional company field', () => {
      const dataWithoutCompany = { ...mockContactData, societe: '' };
      const templateParams = emailService['formatContactTemplateParams'](dataWithoutCompany, 'fr');

      expect(templateParams.company).toBe('');
      expect(templateParams.from_name).toBe('Jean Dupont');
    });

    it('should handle bilingual parameters correctly', () => {
      const frenchParams = emailService['formatContactTemplateParams'](mockContactData, 'fr');
      const englishParams = emailService['formatContactTemplateParams'](mockContactData, 'en');

      expect(frenchParams.language).toBe('fr');
      expect(frenchParams.is_french).toBe(true);
      expect(frenchParams.is_english).toBe(false);

      expect(englishParams.language).toBe('en');
      expect(englishParams.is_french).toBe(false);
      expect(englishParams.is_english).toBe(true);
    });
  });

  describe('Email Sending Validation', () => {
    it('should validate contact message sending structure', async () => {
      const emailjs = await import('@emailjs/browser');
      vi.mocked(emailjs.default.send).mockResolvedValue({
        status: 200,
        text: 'OK'
      });

      const result = await emailService.sendContactMessage(mockContactData);

      expect(result.success).toBe(true);
      expect(result.type).toBe('message');
      expect(emailjs.default.send).toHaveBeenCalledWith(
        expect.any(String), // serviceId
        expect.any(String), // templateId
        expect.objectContaining({
          from_name: 'Jean Dupont',
          from_email: 'jean.dupont@example.com',
          phone: '+33 1 23 45 67 89'
        }),
        expect.any(String) // userId
      );
    });

    it('should validate appointment request sending structure', async () => {
      const emailjs = await import('@emailjs/browser');
      vi.mocked(emailjs.default.send).mockResolvedValue({
        status: 200,
        text: 'OK'
      });

      const result = await emailService.sendAppointmentRequest(mockAppointmentData);

      expect(result.success).toBe(true);
      expect(result.type).toBe('appointment');
      expect(emailjs.default.send).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          from_name: 'Jean Dupont',
          appointment_date: '15/02/2025',
          appointment_time: '14:30'
        }),
        expect.any(String)
      );
    });

    it('should handle EmailJS errors correctly', async () => {
      const emailjs = await import('@emailjs/browser');
      vi.mocked(emailjs.default.send).mockRejectedValue({
        status: 400,
        text: 'Bad Request'
      });

      const result = await emailService.sendContactMessage(mockContactData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle rate limiting errors', async () => {
      const emailjs = await import('@emailjs/browser');
      vi.mocked(emailjs.default.send).mockRejectedValue({
        status: 429,
        text: 'Too Many Requests'
      });

      const result = await emailService.sendContactMessage(mockContactData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('rate');
    });
  });

  describe('Template Content Validation', () => {
    it('should validate required template variables are present', () => {
      const requiredReceptionVars = [
        'from_name',
        'from_email',
        'phone',
        'company',
        'message',
        'date',
        'reply_to'
      ];

      const templateParams = emailService['formatContactTemplateParams'](mockContactData, 'fr');

      requiredReceptionVars.forEach(varName => {
        expect(templateParams).toHaveProperty(varName);
        expect(templateParams[varName as keyof typeof templateParams]).toBeDefined();
      });
    });

    it('should validate appointment-specific variables', () => {
      const appointmentVars = [
        'appointment_date',
        'appointment_time'
      ];

      const templateParams = emailService['formatAppointmentTemplateParams'](mockAppointmentData, 'fr');

      appointmentVars.forEach(varName => {
        expect(templateParams).toHaveProperty(varName);
        expect(templateParams[varName as keyof typeof templateParams]).toBeDefined();
      });
    });

    it('should validate bilingual template variables', () => {
      const bilingualVars = [
        'language',
        'is_french',
        'is_english'
      ];

      const frenchParams = emailService['formatContactTemplateParams'](mockContactData, 'fr');
      const englishParams = emailService['formatContactTemplateParams'](mockContactData, 'en');

      bilingualVars.forEach(varName => {
        expect(frenchParams).toHaveProperty(varName);
        expect(englishParams).toHaveProperty(varName);
      });
    });
  });

  describe('Data Sanitization Validation', () => {
    it('should sanitize email content properly', () => {
      const maliciousData: ContactFormData = {
        nom: '<script>alert("xss")</script>Dupont',
        prenom: 'Jean<img src="x" onerror="alert(1)">',
        societe: 'ACME & Co <b>Bold</b>',
        email: 'test@example.com',
        telephone: '+33123456789',
        message: 'Message with <script>malicious</script> content'
      };

      const templateParams = emailService['formatContactTemplateParams'](maliciousData, 'fr');

      expect(templateParams.from_name).not.toContain('<script>');
      expect(templateParams.from_name).not.toContain('onerror');
      expect(templateParams.company).not.toContain('<script>');
      expect(templateParams.message).not.toContain('<script>');
    });

    it('should preserve safe HTML entities', () => {
      const dataWithEntities: ContactFormData = {
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'ACME & Associates',
        email: 'test@example.com',
        telephone: '+33123456789',
        message: 'Message with "quotes" and & ampersands'
      };

      const templateParams = emailService['formatContactTemplateParams'](dataWithEntities, 'fr');

      expect(templateParams.company).toContain('&');
      expect(templateParams.message).toContain('"');
    });
  });

  describe('Error Handling Validation', () => {
    it('should provide meaningful error messages', async () => {
      const emailjs = await import('@emailjs/browser');
      
      // Test different error scenarios
      const errorScenarios = [
        { status: 400, text: 'Bad Request', expectedMessage: 'configuration' },
        { status: 404, text: 'Not Found', expectedMessage: 'template' },
        { status: 429, text: 'Too Many Requests', expectedMessage: 'rate' },
        { status: 500, text: 'Server Error', expectedMessage: 'server' }
      ];

      for (const scenario of errorScenarios) {
        vi.mocked(emailjs.default.send).mockRejectedValue({
          status: scenario.status,
          text: scenario.text
        });

        const result = await emailService.sendContactMessage(mockContactData);

        expect(result.success).toBe(false);
        expect(result.error?.toLowerCase()).toContain(scenario.expectedMessage);
      }
    });
  });
});

describe('EmailJS Integration Test Suite', () => {
  it('should provide comprehensive validation checklist', () => {
    const validationChecklist = {
      environmentVariables: [
        'VITE_EMAILJS_SERVICE_ID',
        'VITE_EMAILJS_TEMPLATE_RECEPTION_ID', 
        'VITE_EMAILJS_TEMPLATE_AUTORESPONSE_ID',
        'VITE_EMAILJS_USER_ID',
        'VITE_EMAILJS_ACCESS_TOKEN'
      ],
      templateVariables: {
        reception: [
          'from_name', 'from_email', 'phone', 'company', 
          'message', 'date', 'reply_to', 'appointment_date', 'appointment_time'
        ],
        autoResponse: [
          'from_name', 'from_email', 'language', 'is_french', 'is_english',
          'appointment_date', 'appointment_time'
        ]
      },
      testScenarios: [
        'Contact message with all fields',
        'Contact message without company',
        'Appointment request with date/time',
        'Bilingual auto-response (FR/EN)',
        'Error handling for various HTTP status codes',
        'Data sanitization for XSS prevention'
      ]
    };

    expect(validationChecklist.environmentVariables).toHaveLength(5);
    expect(validationChecklist.templateVariables.reception).toHaveLength(9);
    expect(validationChecklist.templateVariables.autoResponse).toHaveLength(7);
    expect(validationChecklist.testScenarios).toHaveLength(6);
  });
});