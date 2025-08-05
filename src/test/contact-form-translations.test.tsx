import { describe, it, expect } from 'vitest'
import { getTranslation } from '../lib/translations'

describe('Contact Form Translations', () => {
  describe('French translations', () => {
    it('should have email field translations', () => {
      expect(getTranslation('fr', 'contact.form.email')).toBe('Adresse email')
      expect(getTranslation('fr', 'contact.form.emailPlaceholder')).toBe('votre.email@exemple.com')
    })

    it('should have telephone field translations', () => {
      expect(getTranslation('fr', 'contact.form.telephone')).toBe('Numéro de téléphone')
      expect(getTranslation('fr', 'contact.form.telephonePlaceholder')).toBe('+33 1 23 45 67 89')
    })

    it('should have validation messages for email', () => {
      expect(getTranslation('fr', 'contact.form.validation.emailRequired')).toBe('L\'adresse email est obligatoire')
      expect(getTranslation('fr', 'contact.form.validation.emailInvalid')).toBe('Format d\'email invalide')
    })

    it('should have validation messages for telephone', () => {
      expect(getTranslation('fr', 'contact.form.validation.telephoneRequired')).toBe('Le numéro de téléphone est obligatoire')
      expect(getTranslation('fr', 'contact.form.validation.telephoneInvalid')).toBe('Format de téléphone invalide (ex: +33 1 23 45 67 89)')
    })
  })

  describe('English translations', () => {
    it('should have email field translations', () => {
      expect(getTranslation('en', 'contact.form.email')).toBe('Email Address')
      expect(getTranslation('en', 'contact.form.emailPlaceholder')).toBe('your.email@example.com')
    })

    it('should have telephone field translations', () => {
      expect(getTranslation('en', 'contact.form.telephone')).toBe('Phone Number')
      expect(getTranslation('en', 'contact.form.telephonePlaceholder')).toBe('+33 1 23 45 67 89')
    })

    it('should have validation messages for email', () => {
      expect(getTranslation('en', 'contact.form.validation.emailRequired')).toBe('Email address is required')
      expect(getTranslation('en', 'contact.form.validation.emailInvalid')).toBe('Invalid email format')
    })

    it('should have validation messages for telephone', () => {
      expect(getTranslation('en', 'contact.form.validation.telephoneRequired')).toBe('Phone number is required')
      expect(getTranslation('en', 'contact.form.validation.telephoneInvalid')).toBe('Invalid phone format (ex: +33 1 23 45 67 89)')
    })
  })

  describe('Language switching', () => {
    it('should return different values for different languages', () => {
      const frEmail = getTranslation('fr', 'contact.form.email')
      const enEmail = getTranslation('en', 'contact.form.email')
      
      expect(frEmail).toBe('Adresse email')
      expect(enEmail).toBe('Email Address')
      expect(frEmail).not.toBe(enEmail)
    })

    it('should return different validation messages for different languages', () => {
      const frValidation = getTranslation('fr', 'contact.form.validation.emailRequired')
      const enValidation = getTranslation('en', 'contact.form.validation.emailRequired')
      
      expect(frValidation).toBe('L\'adresse email est obligatoire')
      expect(enValidation).toBe('Email address is required')
      expect(frValidation).not.toBe(enValidation)
    })

    it('should return different placeholders for different languages', () => {
      const frPlaceholder = getTranslation('fr', 'contact.form.emailPlaceholder')
      const enPlaceholder = getTranslation('en', 'contact.form.emailPlaceholder')
      
      expect(frPlaceholder).toBe('votre.email@exemple.com')
      expect(enPlaceholder).toBe('your.email@example.com')
      expect(frPlaceholder).not.toBe(enPlaceholder)
    })
  })

  describe('Missing translations fallback', () => {
    it('should return the key if translation is missing', () => {
      expect(getTranslation('fr', 'contact.form.nonexistent')).toBe('contact.form.nonexistent')
      expect(getTranslation('en', 'contact.form.nonexistent')).toBe('contact.form.nonexistent')
    })
  })
})