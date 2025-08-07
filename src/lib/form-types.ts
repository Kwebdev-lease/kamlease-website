/**
 * Form validation types for contact form enhancement
 * Defines TypeScript types for form data validation
 */

// Email validation types
export interface EmailValidation {
  isValid: boolean;
  error?: string;
}

// Phone validation types  
export interface PhoneValidation {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
}

// Form field validation result
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

// Enhanced validation rules for new fields
export interface EnhancedValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  emailFormat?: boolean;
  phoneFormat?: boolean;
  custom?: (value: string) => string | null;
}

// Enhanced validation rules collection
export interface EnhancedValidationRules {
  [key: string]: EnhancedValidationRule;
}

// Form validation context
export interface FormValidationContext {
  fieldName: string;
  value: string;
  language: 'fr' | 'en';
  isRequired: boolean;
}

// Email service result types
export interface EmailResult {
  success: boolean;
  message: string;
  type: 'message' | 'appointment' | 'email_fallback';
  error?: string;
  emailId?: string;
}

// Appointment form data extending contact form
export interface AppointmentFormData extends EnhancedContactFormData {
  appointmentDate: Date;
  appointmentTime: string;
}

// Enhanced contact form data
export interface EnhancedContactFormData {
  prenom: string;
  nom: string;
  societe?: string;
  email: string;
  telephone: string;
  message: string;
  captchaToken?: string;
}

// Validation error messages
export interface ValidationErrorMessages {
  required: string;
  minLength: string;
  maxLength: string;
  emailInvalid: string;
  phoneInvalid: string;
  patternMismatch: string;
}

// Email format validation patterns
export const EMAIL_PATTERNS = {
  standard: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  strict: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
} as const;

// Phone format validation patterns
export const PHONE_PATTERNS = {
  french: /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
  international: /^(\+\d{1,3}[- ]?)?\d{8,15}$/,
  flexible: /^[+]?[0-9\s\-()]{10,}$/
} as const;

// Form field types
export type FormFieldType = 'text' | 'email' | 'tel' | 'textarea';

// Enhanced form data interface (extends existing ContactFormData)
export interface EnhancedContactFormData {
  nom: string;
  prenom: string;
  societe?: string;
  email: string;
  telephone: string;
  message: string;
}

// Form validation state
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string | null>;
  touchedFields: Set<string>;
  isSubmitting: boolean;
}