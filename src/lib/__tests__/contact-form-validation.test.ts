/**
 * Unit tests for contact form validation with new email and phone fields
 * Tests email and phone validation with various formats and languages
 * Requirements: 1.3, 1.4, 1.5, 2.5
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateFormField,
  validateAllFormFields,
  getValidationErrorMessage
} from '../form-validation-utils';
import { FormValidationContext } from '../form-types';

describe('Contact Form Validation - Email Field', () => {
  describe('valid email formats', () => {
    it('should validate standard email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@company.org',
        'user@domain-name.com',
        'user_name@domain.com',
        'contact@kamlease.com',
        'jean.dupont@entreprise.fr',
        'info@test-domain.net'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email, 'fr');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should handle email case insensitivity', () => {
      const emails = [
        'TEST@EXAMPLE.COM',
        'User.Name@Domain.COM',
        'CONTACT@KAMLEASE.COM'
      ];

      emails.forEach(email => {
        const result = validateEmail(email, 'fr');
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('invalid email formats', () => {
    it('should reject empty email in French', () => {
      const result = validateEmail('', 'fr');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('L\'adresse email est obligatoire');
    });

    it('should reject empty email in English', () => {
      const result = validateEmail('', 'en');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address is required');
    });

    it('should reject invalid email formats with French messages', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'spaces @domain.com',
        'email@',
        '@domain.com',
        'email.domain.com',
        'email@domain.'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email, 'fr');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Format d\'email invalide');
      });
    });

    it('should reject invalid email formats with English messages', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email, 'en');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid email format');
      });
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(90) + '@example.com'; // > 100 chars
      
      const resultFr = validateEmail(longEmail, 'fr');
      expect(resultFr.isValid).toBe(false);
      expect(resultFr.error).toBe('L\'adresse email est trop longue (maximum 100 caractères)');

      const resultEn = validateEmail(longEmail, 'en');
      expect(resultEn.isValid).toBe(false);
      expect(resultEn.error).toBe('Email address is too long (maximum 100 characters)');
    });

    it('should reject emails with consecutive dots', () => {
      const emailsWithConsecutiveDots = [
        'user..name@domain.com',
        'user...test@domain.com',
        'test..@domain.com'
      ];

      emailsWithConsecutiveDots.forEach(email => {
        const result = validateEmail(email, 'fr');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Format d\'email invalide');
      });
    });
  });

  describe('email whitespace handling', () => {
    it('should trim whitespace from emails', () => {
      const emailsWithWhitespace = [
        '  test@example.com  ',
        '\tuser@domain.com\t',
        '\ncontact@kamlease.com\n'
      ];

      emailsWithWhitespace.forEach(email => {
        const result = validateEmail(email, 'fr');
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject emails with only whitespace', () => {
      const whitespaceEmails = ['   ', '\t\t', '\n\n', ''];

      whitespaceEmails.forEach(email => {
        const result = validateEmail(email, 'fr');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('L\'adresse email est obligatoire');
      });
    });
  });
});

describe('Contact Form Validation - Phone Field', () => {
  describe('valid French phone formats', () => {
    it('should validate standard French phone numbers', () => {
      const validFrenchPhones = [
        '01 23 45 67 89',
        '0123456789',
        '06 12 34 56 78',
        '07 98 76 54 32',
        '09 11 22 33 44'
      ];

      validFrenchPhones.forEach(phone => {
        const result = validatePhone(phone, 'fr');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.formattedNumber).toBeDefined();
      });
    });

    it('should validate French phones with different separators', () => {
      const phonesWithSeparators = [
        '01.23.45.67.89',
        '01-23-45-67-89',
        '01 23 45 67 89'
      ];

      phonesWithSeparators.forEach(phone => {
        const result = validatePhone(phone, 'fr');
        expect(result.isValid).toBe(true);
        expect(result.formattedNumber).toBe('01 23 45 67 89');
      });
    });

    it('should format French phone numbers correctly', () => {
      const testCases = [
        { input: '0123456789', expected: '01 23 45 67 89' },
        { input: '06 12 34 56 78', expected: '06 12 34 56 78' },
        { input: '01.23.45.67.89', expected: '01 23 45 67 89' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validatePhone(input, 'fr');
        expect(result.isValid).toBe(true);
        expect(result.formattedNumber).toBe(expected);
      });
    });
  });

  describe('valid international phone formats', () => {
    it('should validate international phone numbers with +33', () => {
      const validInternationalPhones = [
        '+33123456789',
        '+33 1 23 45 67 89',
        '+33612345678',
        '+33 6 12 34 56 78'
      ];

      validInternationalPhones.forEach(phone => {
        const result = validatePhone(phone, 'fr');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should convert +33 to 0 in formatted number', () => {
      const testCases = [
        { input: '+33123456789', expected: '01 23 45 67 89' },
        { input: '+33 1 23 45 67 89', expected: '01 23 45 67 89' },
        { input: '+33612345678', expected: '06 12 34 56 78' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validatePhone(input, 'fr');
        expect(result.isValid).toBe(true);
        expect(result.formattedNumber).toBe(expected);
      });
    });

    it('should validate other international formats', () => {
      const otherInternationalPhones = [
        '+1234567890',
        '+442079460958',
        '+493012345678',
        '+41123456789'
      ];

      otherInternationalPhones.forEach(phone => {
        const result = validatePhone(phone, 'fr');
        expect(result.isValid).toBe(true);
        expect(result.formattedNumber).toBe(phone);
      });
    });
  });

  describe('invalid phone formats', () => {
    it('should reject empty phone in French', () => {
      const result = validatePhone('', 'fr');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Le numéro de téléphone est obligatoire');
    });

    it('should reject empty phone in English', () => {
      const result = validatePhone('', 'en');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('should reject invalid phone formats with French messages', () => {
      const invalidPhones = [
        '123',
        'abc123def',
        '00 12 34 56 78', // Invalid French format (starts with 00)
        '1234',
        '+',
        '+abc',
        '12345',
        '0012345678'
      ];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone, 'fr');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Format de téléphone invalide');
      });
    });

    it('should reject invalid phone formats with English messages', () => {
      const invalidPhones = ['123', 'abc123def'];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone, 'en');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid phone format');
      });
    });

    it('should reject phone numbers that are too long', () => {
      const longPhone = '1'.repeat(25);
      
      const resultFr = validatePhone(longPhone, 'fr');
      expect(resultFr.isValid).toBe(false);
      expect(resultFr.error).toBe('Le numéro de téléphone est trop long (maximum 20 caractères)');

      const resultEn = validatePhone(longPhone, 'en');
      expect(resultEn.isValid).toBe(false);
      expect(resultEn.error).toBe('Phone number is too long (maximum 20 characters)');
    });
  });

  describe('phone whitespace and separator handling', () => {
    it('should handle various separators correctly', () => {
      const phonesWithSeparators = [
        '01 23 45 67 89',
        '01.23.45.67.89',
        '01-23-45-67-89'
      ];

      phonesWithSeparators.forEach(phone => {
        const result = validatePhone(phone, 'fr');
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject phones with only whitespace', () => {
      const whitespacePhones = ['   ', '\t\t', '\n\n', ''];

      whitespacePhones.forEach(phone => {
        const result = validatePhone(phone, 'fr');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Le numéro de téléphone est obligatoire');
      });
    });
  });
});

describe('Contact Form Field Integration', () => {
  describe('validateFormField with email field', () => {
    it('should validate email field using email validation', () => {
      const context: FormValidationContext = {
        fieldName: 'email',
        value: 'test@example.com',
        language: 'fr',
        isRequired: true
      };

      const result = validateFormField(context);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    it('should sanitize email by trimming and lowercasing', () => {
      const context: FormValidationContext = {
        fieldName: 'email',
        value: '  TEST@EXAMPLE.COM  ',
        language: 'fr',
        isRequired: true
      };

      const result = validateFormField(context);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    it('should handle invalid email in form field validation', () => {
      const context: FormValidationContext = {
        fieldName: 'email',
        value: 'invalid-email',
        language: 'fr',
        isRequired: true
      };

      const result = validateFormField(context);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Format d\'email invalide');
    });
  });

  describe('validateFormField with phone field', () => {
    it('should validate phone field using phone validation', () => {
      const context: FormValidationContext = {
        fieldName: 'telephone',
        value: '01 23 45 67 89',
        language: 'fr',
        isRequired: true
      };

      const result = validateFormField(context);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('01 23 45 67 89');
    });

    it('should format phone number in sanitized value', () => {
      const context: FormValidationContext = {
        fieldName: 'telephone',
        value: '0123456789',
        language: 'fr',
        isRequired: true
      };

      const result = validateFormField(context);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('01 23 45 67 89');
    });

    it('should handle invalid phone in form field validation', () => {
      const context: FormValidationContext = {
        fieldName: 'telephone',
        value: '123',
        language: 'fr',
        isRequired: true
      };

      const result = validateFormField(context);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Format de téléphone invalide');
    });
  });
});

describe('Complete Form Validation', () => {
  describe('validateAllFormFields with new fields', () => {
    it('should validate complete contact form with valid data', () => {
      const formData = {
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'Entreprise Test',
        email: 'jean.dupont@example.com',
        telephone: '01 23 45 67 89',
        message: 'Ceci est un message de test pour le formulaire de contact.'
      };

      const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'message'];
      const errors = validateAllFormFields(formData, requiredFields, 'fr');

      Object.values(errors).forEach(error => {
        expect(error).toBeNull();
      });
    });

    it('should return errors for invalid email and phone', () => {
      const formData = {
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'Entreprise Test',
        email: 'invalid-email',
        telephone: '123',
        message: 'Test message'
      };

      const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'message'];
      const errors = validateAllFormFields(formData, requiredFields, 'fr');

      expect(errors.nom).toBeNull();
      expect(errors.prenom).toBeNull();
      expect(errors.societe).toBeNull();
      expect(errors.email).toBe('Format d\'email invalide');
      expect(errors.telephone).toContain('Format de téléphone invalide');
      expect(errors.message).toBeNull();
    });

    it('should handle missing required fields', () => {
      const formData = {
        nom: 'Dupont',
        prenom: '',
        societe: 'Entreprise Test',
        email: '',
        telephone: '',
        message: ''
      };

      const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'message'];
      const errors = validateAllFormFields(formData, requiredFields, 'fr');

      expect(errors.nom).toBeNull();
      expect(errors.prenom).toBe('Ce champ est requis');
      expect(errors.societe).toBeNull(); // Not required
      expect(errors.email).toBe('L\'adresse email est obligatoire');
      expect(errors.telephone).toBe('Le numéro de téléphone est obligatoire');
      expect(errors.message).toBe('Ce champ est requis');
    });

    it('should validate form in English', () => {
      const formData = {
        nom: '',
        prenom: '',
        email: 'invalid-email',
        telephone: '123',
        message: ''
      };

      const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'message'];
      const errors = validateAllFormFields(formData, requiredFields, 'en');

      expect(errors.nom).toBe('This field is required');
      expect(errors.prenom).toBe('This field is required');
      expect(errors.email).toBe('Invalid email format');
      expect(errors.telephone).toContain('Invalid phone format');
      expect(errors.message).toBe('This field is required');
    });
  });
});

describe('Validation Error Messages', () => {
  describe('getValidationErrorMessage for new fields', () => {
    it('should return French error messages for email validation', () => {
      expect(getValidationErrorMessage('email', 'required', 'fr')).toBe('Ce champ est requis');
      expect(getValidationErrorMessage('email', 'emailInvalid', 'fr')).toBe('Format d\'email invalide');
    });

    it('should return English error messages for email validation', () => {
      expect(getValidationErrorMessage('email', 'required', 'en')).toBe('This field is required');
      expect(getValidationErrorMessage('email', 'emailInvalid', 'en')).toBe('Invalid email format');
    });

    it('should return French error messages for phone validation', () => {
      expect(getValidationErrorMessage('telephone', 'required', 'fr')).toBe('Ce champ est requis');
      expect(getValidationErrorMessage('telephone', 'phoneInvalid', 'fr')).toBe('Format de téléphone invalide (ex: +33 1 23 45 67 89)');
    });

    it('should return English error messages for phone validation', () => {
      expect(getValidationErrorMessage('telephone', 'required', 'en')).toBe('This field is required');
      expect(getValidationErrorMessage('telephone', 'phoneInvalid', 'en')).toBe('Invalid phone format (ex: +33 1 23 45 67 89)');
    });

    it('should handle parameterized messages', () => {
      const messageFr = getValidationErrorMessage('email', 'maxLength', 'fr', { maxLength: 100 });
      expect(messageFr).toBe('Maximum 100 caractères autorisés');

      const messageEn = getValidationErrorMessage('email', 'maxLength', 'en', { maxLength: 100 });
      expect(messageEn).toBe('Maximum 100 characters allowed');
    });

    it('should return default message for unknown error types', () => {
      expect(getValidationErrorMessage('email', 'unknown', 'fr')).toBe('Format invalide');
      expect(getValidationErrorMessage('email', 'unknown', 'en')).toBe('Invalid format');
    });
  });
});

describe('Translation Integration', () => {
  describe('validation messages match translation keys', () => {
    it('should use consistent error messages with translations', () => {
      // Test that validation functions return messages that match translation keys
      const emailResult = validateEmail('', 'fr');
      expect(emailResult.error).toBe('L\'adresse email est obligatoire');

      const phoneResult = validatePhone('', 'fr');
      expect(phoneResult.error).toBe('Le numéro de téléphone est obligatoire');

      const emailResultEn = validateEmail('', 'en');
      expect(emailResultEn.error).toBe('Email address is required');

      const phoneResultEn = validatePhone('', 'en');
      expect(phoneResultEn.error).toBe('Phone number is required');
    });

    it('should provide consistent format error messages', () => {
      const emailResult = validateEmail('invalid', 'fr');
      expect(emailResult.error).toBe('Format d\'email invalide');

      const phoneResult = validatePhone('invalid', 'fr');
      expect(phoneResult.error).toContain('Format de téléphone invalide');

      const emailResultEn = validateEmail('invalid', 'en');
      expect(emailResultEn.error).toBe('Invalid email format');

      const phoneResultEn = validatePhone('invalid', 'en');
      expect(phoneResultEn.error).toContain('Invalid phone format');
    });
  });
});