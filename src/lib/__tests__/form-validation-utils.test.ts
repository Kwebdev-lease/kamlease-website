/**
 * Unit tests for form validation utilities
 * Tests email and phone validation functions
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

describe('validateEmail', () => {
  describe('valid emails', () => {
    it('should validate standard email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@company.org',
        'email@123.123.123.123', // IP address
        'user@domain-name.com',
        'user_name@domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('invalid emails', () => {
    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('L\'adresse email est obligatoire');
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain',
        'spaces @domain.com',
        'email@domain..com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Format d\'email invalide');
      });
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(90) + '@example.com'; // > 100 chars
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('L\'adresse email est trop longue (maximum 100 caractères)');
    });

    it('should reject emails with consecutive dots', () => {
      const result = validateEmail('user..name@domain.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Format d\'email invalide');
    });
  });

  describe('language support', () => {
    it('should return English error messages when language is en', () => {
      const result = validateEmail('', 'en');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email address is required');
    });

    it('should return French error messages by default', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('L\'adresse email est obligatoire');
    });
  });
});

describe('validatePhone', () => {
  describe('valid phone numbers', () => {
    it('should validate French phone formats', () => {
      const validFrenchPhones = [
        '01 23 45 67 89',
        '0123456789',
        '+33123456789',
        '+33 1 23 45 67 89',
        '06.12.34.56.78',
        '07-12-34-56-78'
      ];

      validFrenchPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.formattedNumber).toBeDefined();
      });
    });

    it('should validate international phone formats', () => {
      const validInternationalPhones = [
        '+1234567890',
        '+442079460958',
        '+493012345678'
      ];

      validInternationalPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('invalid phone numbers', () => {
    it('should reject empty phone number', () => {
      const result = validatePhone('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Le numéro de téléphone est obligatoire');
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '123',
        'abc123def',
        '00 12 34 56 78' // Invalid French format (starts with 00)
      ];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Format de téléphone invalide');
      });
    });

    it('should reject phone numbers that are too long', () => {
      const longPhone = '1'.repeat(25);
      const result = validatePhone(longPhone);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Le numéro de téléphone est trop long (maximum 20 caractères)');
    });
  });

  describe('phone formatting', () => {
    it('should format French phone numbers correctly', () => {
      const result = validatePhone('0123456789');
      expect(result.isValid).toBe(true);
      expect(result.formattedNumber).toBe('01 23 45 67 89');
    });

    it('should convert +33 to 0 in formatted number', () => {
      const result = validatePhone('+33123456789');
      expect(result.isValid).toBe(true);
      expect(result.formattedNumber).toBe('01 23 45 67 89');
    });
  });

  describe('language support', () => {
    it('should return English error messages when language is en', () => {
      const result = validatePhone('', 'en');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });
  });
});

describe('validateFormField', () => {
  it('should validate email fields using email validation', () => {
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

  it('should validate phone fields using phone validation', () => {
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

  it('should handle required field validation', () => {
    const context: FormValidationContext = {
      fieldName: 'email',
      value: '',
      language: 'fr',
      isRequired: true
    };

    const result = validateFormField(context);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('L\'adresse email est obligatoire');
  });

  it('should allow empty values for non-required fields', () => {
    const context: FormValidationContext = {
      fieldName: 'societe',
      value: '',
      language: 'fr',
      isRequired: false
    };

    const result = validateFormField(context);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedValue).toBe('');
  });
});

describe('validateAllFormFields', () => {
  it('should validate all form fields and return errors', () => {
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'invalid-email',
      telephone: '123',
      message: 'Test message'
    };

    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'message'];
    const errors = validateAllFormFields(formData, requiredFields, 'fr');

    expect(errors.nom).toBeNull();
    expect(errors.prenom).toBeNull();
    expect(errors.email).toBe('Format d\'email invalide');
    expect(errors.telephone).toContain('Format de téléphone invalide');
    expect(errors.message).toBeNull();
  });

  it('should return no errors for valid form data', () => {
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      telephone: '01 23 45 67 89',
      message: 'Test message'
    };

    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'message'];
    const errors = validateAllFormFields(formData, requiredFields, 'fr');

    Object.values(errors).forEach(error => {
      expect(error).toBeNull();
    });
  });
});

describe('getValidationErrorMessage', () => {
  it('should return French error messages by default', () => {
    const message = getValidationErrorMessage('email', 'required');
    expect(message).toBe('Ce champ est requis');
  });

  it('should return English error messages when specified', () => {
    const message = getValidationErrorMessage('email', 'required', 'en');
    expect(message).toBe('This field is required');
  });

  it('should handle parameterized messages', () => {
    const message = getValidationErrorMessage('nom', 'minLength', 'fr', { minLength: 3 });
    expect(message).toBe('Minimum 3 caractères requis');
  });

  it('should return default message for unknown error types', () => {
    const message = getValidationErrorMessage('field', 'unknown', 'fr');
    expect(message).toBe('Format invalide');
  });
});