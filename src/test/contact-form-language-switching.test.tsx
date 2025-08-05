import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '../contexts/LanguageProvider'
import { getTranslation } from '../lib/translations'

// Mock component to test language switching
const TestComponent = () => {
  return (
    <div>
      <div data-testid="email-label-fr">{getTranslation('fr', 'contact.form.email')}</div>
      <div data-testid="email-label-en">{getTranslation('en', 'contact.form.email')}</div>
      <div data-testid="telephone-label-fr">{getTranslation('fr', 'contact.form.telephone')}</div>
      <div data-testid="telephone-label-en">{getTranslation('en', 'contact.form.telephone')}</div>
      <div data-testid="email-placeholder-fr">{getTranslation('fr', 'contact.form.emailPlaceholder')}</div>
      <div data-testid="email-placeholder-en">{getTranslation('en', 'contact.form.emailPlaceholder')}</div>
      <div data-testid="telephone-placeholder-fr">{getTranslation('fr', 'contact.form.telephonePlaceholder')}</div>
      <div data-testid="telephone-placeholder-en">{getTranslation('en', 'contact.form.telephonePlaceholder')}</div>
      <div data-testid="email-required-fr">{getTranslation('fr', 'contact.form.validation.emailRequired')}</div>
      <div data-testid="email-required-en">{getTranslation('en', 'contact.form.validation.emailRequired')}</div>
      <div data-testid="email-invalid-fr">{getTranslation('fr', 'contact.form.validation.emailInvalid')}</div>
      <div data-testid="email-invalid-en">{getTranslation('en', 'contact.form.validation.emailInvalid')}</div>
      <div data-testid="telephone-required-fr">{getTranslation('fr', 'contact.form.validation.telephoneRequired')}</div>
      <div data-testid="telephone-required-en">{getTranslation('en', 'contact.form.validation.telephoneRequired')}</div>
      <div data-testid="telephone-invalid-fr">{getTranslation('fr', 'contact.form.validation.telephoneInvalid')}</div>
      <div data-testid="telephone-invalid-en">{getTranslation('en', 'contact.form.validation.telephoneInvalid')}</div>
    </div>
  )
}

describe('Contact Form Language Switching Integration', () => {
  it('should render all new translation keys correctly', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    // Test French labels
    expect(screen.getByTestId('email-label-fr')).toHaveTextContent('Adresse email')
    expect(screen.getByTestId('telephone-label-fr')).toHaveTextContent('Numéro de téléphone')

    // Test English labels
    expect(screen.getByTestId('email-label-en')).toHaveTextContent('Email Address')
    expect(screen.getByTestId('telephone-label-en')).toHaveTextContent('Phone Number')

    // Test French placeholders
    expect(screen.getByTestId('email-placeholder-fr')).toHaveTextContent('votre.email@exemple.com')
    expect(screen.getByTestId('telephone-placeholder-fr')).toHaveTextContent('+33 1 23 45 67 89')

    // Test English placeholders
    expect(screen.getByTestId('email-placeholder-en')).toHaveTextContent('your.email@example.com')
    expect(screen.getByTestId('telephone-placeholder-en')).toHaveTextContent('+33 1 23 45 67 89')

    // Test French validation messages
    expect(screen.getByTestId('email-required-fr')).toHaveTextContent('L\'adresse email est obligatoire')
    expect(screen.getByTestId('email-invalid-fr')).toHaveTextContent('Format d\'email invalide')
    expect(screen.getByTestId('telephone-required-fr')).toHaveTextContent('Le numéro de téléphone est obligatoire')
    expect(screen.getByTestId('telephone-invalid-fr')).toHaveTextContent('Format de téléphone invalide (ex: +33 1 23 45 67 89)')

    // Test English validation messages
    expect(screen.getByTestId('email-required-en')).toHaveTextContent('Email address is required')
    expect(screen.getByTestId('email-invalid-en')).toHaveTextContent('Invalid email format')
    expect(screen.getByTestId('telephone-required-en')).toHaveTextContent('Phone number is required')
    expect(screen.getByTestId('telephone-invalid-en')).toHaveTextContent('Invalid phone format (ex: +33 1 23 45 67 89)')
  })

  it('should have consistent translation structure', () => {
    const frKeys = [
      'contact.form.email',
      'contact.form.telephone',
      'contact.form.emailPlaceholder',
      'contact.form.telephonePlaceholder',
      'contact.form.validation.emailRequired',
      'contact.form.validation.emailInvalid',
      'contact.form.validation.telephoneRequired',
      'contact.form.validation.telephoneInvalid'
    ]

    const enKeys = [
      'contact.form.email',
      'contact.form.telephone',
      'contact.form.emailPlaceholder',
      'contact.form.telephonePlaceholder',
      'contact.form.validation.emailRequired',
      'contact.form.validation.emailInvalid',
      'contact.form.validation.telephoneRequired',
      'contact.form.validation.telephoneInvalid'
    ]

    // Verify all keys exist in both languages
    frKeys.forEach(key => {
      const frTranslation = getTranslation('fr', key)
      expect(frTranslation).not.toBe(key) // Should not return the key itself
      expect(frTranslation.length).toBeGreaterThan(0)
    })

    enKeys.forEach(key => {
      const enTranslation = getTranslation('en', key)
      expect(enTranslation).not.toBe(key) // Should not return the key itself
      expect(enTranslation.length).toBeGreaterThan(0)
    })
  })

  it('should have different translations for French and English', () => {
    const testKeys = [
      'contact.form.email',
      'contact.form.telephone',
      'contact.form.emailPlaceholder',
      'contact.form.validation.emailRequired',
      'contact.form.validation.telephoneRequired'
    ]

    testKeys.forEach(key => {
      const frTranslation = getTranslation('fr', key)
      const enTranslation = getTranslation('en', key)
      
      expect(frTranslation).not.toBe(enTranslation)
      expect(frTranslation.length).toBeGreaterThan(0)
      expect(enTranslation.length).toBeGreaterThan(0)
    })
  })
})