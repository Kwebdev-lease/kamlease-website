/**
 * Form validation utilities for email and phone validation
 * Implements validation regex for email and phone formats
 */

import { 
  EmailValidation, 
  PhoneValidation, 
  EMAIL_PATTERNS, 
  PHONE_PATTERNS,
  FieldValidationResult
} from './form-types';

export type { FormValidationContext } from './form-types';

/**
 * Validate email format using standard regex pattern
 * Requirements: 1.3, 1.4
 */
export function validateEmail(email: string, language: 'fr' | 'en' = 'fr'): EmailValidation {
  // Check if email is empty
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: language === 'fr' 
        ? 'L\'adresse email est obligatoire'
        : 'Email address is required'
    };
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Check email format using standard pattern
  if (!EMAIL_PATTERNS.standard.test(trimmedEmail)) {
    return {
      isValid: false,
      error: language === 'fr'
        ? 'Format d\'email invalide'
        : 'Invalid email format'
    };
  }

  // Additional validation for common issues
  if (trimmedEmail.length > 100) {
    return {
      isValid: false,
      error: language === 'fr'
        ? 'L\'adresse email est trop longue (maximum 100 caractères)'
        : 'Email address is too long (maximum 100 characters)'
    };
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return {
      isValid: false,
      error: language === 'fr'
        ? 'Format d\'email invalide'
        : 'Invalid email format'
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number format (French and international)
 * Requirements: 1.3, 1.4, 1.5
 */
export function validatePhone(phone: string, language: 'fr' | 'en' = 'fr'): PhoneValidation {
  // Check if phone is empty
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: language === 'fr'
        ? 'Le numéro de téléphone est obligatoire'
        : 'Phone number is required'
    };
  }

  // Clean phone number (remove spaces, dashes, parentheses)
  const cleanedPhone = phone.replace(/[\s\-().]/g, '');

  // Check length constraints
  if (cleanedPhone.length > 20) {
    return {
      isValid: false,
      error: language === 'fr'
        ? 'Le numéro de téléphone est trop long (maximum 20 caractères)'
        : 'Phone number is too long (maximum 20 characters)'
    };
  }

  // Validate French phone format first
  if (PHONE_PATTERNS.french.test(cleanedPhone)) {
    return { 
      isValid: true, 
      formattedNumber: formatFrenchPhone(cleanedPhone)
    };
  }

  // Validate international format (more flexible)
  if (cleanedPhone.startsWith('+') && cleanedPhone.length >= 10 && cleanedPhone.length <= 15) {
    const digitsOnly = cleanedPhone.slice(1); // Remove +
    if (/^\d+$/.test(digitsOnly)) {
      return { 
        isValid: true, 
        formattedNumber: cleanedPhone
      };
    }
  }

  // If neither pattern matches, return error
  return {
    isValid: false,
    error: language === 'fr'
      ? 'Format de téléphone invalide (ex: +33 1 23 45 67 89 ou 01 23 45 67 89)'
      : 'Invalid phone format (ex: +33 1 23 45 67 89 or 01 23 45 67 89)'
  };
}

/**
 * Format French phone number for display
 */
function formatFrenchPhone(cleanedPhone: string): string {
  // Convert +33 to 0 if present
  let formatted = cleanedPhone.replace(/^\+33/, '0');
  
  // Add spaces every 2 digits after the first digit
  if (formatted.length === 10) {
    formatted = formatted.replace(/(\d{2})(?=\d)/g, '$1 ');
  }
  
  return formatted;
}

/**
 * Enhanced field validation that combines existing rules with new email/phone validation
 * Requirements: 1.3, 1.4, 1.5
 */
export function validateFormField(context: FormValidationContext): FieldValidationResult {
  const { fieldName, value, language, isRequired } = context;

  // Email field validation (has its own required logic)
  if (fieldName === 'email') {
    const emailValidation = validateEmail(value, language);
    return {
      isValid: emailValidation.isValid,
      error: emailValidation.error,
      sanitizedValue: value.trim().toLowerCase()
    };
  }

  // Phone field validation (has its own required logic)
  if (fieldName === 'telephone') {
    const phoneValidation = validatePhone(value, language);
    return {
      isValid: phoneValidation.isValid,
      error: phoneValidation.error,
      sanitizedValue: phoneValidation.formattedNumber || value
    };
  }

  // Required field validation for other fields
  if (isRequired && (!value || value.trim() === '')) {
    return {
      isValid: false,
      error: language === 'fr' ? 'Ce champ est requis' : 'This field is required'
    };
  }

  // Skip validation if field is empty and not required
  if (!value || value.trim() === '') {
    return { isValid: true, sanitizedValue: '' };
  }

  // Default validation for other fields
  return { isValid: true, sanitizedValue: value.trim() };
}

/**
 * Get validation error message for a specific field and error type
 */
export function getValidationErrorMessage(
  fieldName: string, 
  errorType: string, 
  language: 'fr' | 'en' = 'fr',
  params?: Record<string, string | number>
): string {
  const messages = {
    fr: {
      required: 'Ce champ est requis',
      emailInvalid: 'Format d\'email invalide',
      phoneInvalid: 'Format de téléphone invalide (ex: +33 1 23 45 67 89)',
      minLength: `Minimum ${params?.minLength || 2} caractères requis`,
      maxLength: `Maximum ${params?.maxLength || 100} caractères autorisés`,
      patternMismatch: 'Format invalide'
    },
    en: {
      required: 'This field is required',
      emailInvalid: 'Invalid email format',
      phoneInvalid: 'Invalid phone format (ex: +33 1 23 45 67 89)',
      minLength: `Minimum ${params?.minLength || 2} characters required`,
      maxLength: `Maximum ${params?.maxLength || 100} characters allowed`,
      patternMismatch: 'Invalid format'
    }
  };

  return messages[language][errorType as keyof typeof messages.fr] || messages[language].patternMismatch;
}

/**
 * Validate all form fields at once
 */
export function validateAllFormFields(
  formData: Record<string, string>,
  requiredFields: string[],
  language: 'fr' | 'en' = 'fr'
): Record<string, string | null> {
  const errors: Record<string, string | null> = {};

  Object.keys(formData).forEach(fieldName => {
    const context: FormValidationContext = {
      fieldName,
      value: formData[fieldName],
      language,
      isRequired: requiredFields.includes(fieldName)
    };

    const result = validateFormField(context);
    if (!result.isValid) {
      errors[fieldName] = result.error || null;
    } else {
      errors[fieldName] = null;
    }
  });

  return errors;
}