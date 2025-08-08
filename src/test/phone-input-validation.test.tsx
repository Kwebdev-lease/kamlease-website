/**
 * Tests pour le composant PhoneInput avec format strict
 * Dropdown pays + 0 fixe + 9 chiffres maximum
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhoneInput from '../components/PhoneInput'

describe('PhoneInput - Format strict avec dropdown', () => {
  it('should limit input to 9 digits maximum', async () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Test avec 9 chiffres - devrait fonctionner
    fireEvent.change(input, { target: { value: '737105867' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 0737105867')
    
    // Test avec plus de 9 chiffres - devrait être tronqué
    fireEvent.change(input, { target: { value: '73710586789' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 0737105867')
  })

  it('should filter out non-numeric characters', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Test avec des lettres et caractères spéciaux - devrait être filtré
    fireEvent.change(input, { target: { value: '73abc71@05#86' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 073710586')
  })

  it('should have correct input attributes', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Vérifier les attributs HTML
    expect(input).toHaveAttribute('inputMode', 'numeric')
    expect(input).toHaveAttribute('pattern', '[0-9]*')
    expect(input).toHaveAttribute('type', 'tel')
    expect(input).toHaveAttribute('maxLength', '9')
  })

  it('should display fixed 0 and digit counter', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    // Vérifier que le 0 fixe est affiché
    expect(screen.getByText('0')).toBeInTheDocument()
    
    // Vérifier le compteur initial
    expect(screen.getByText('0/9')).toBeInTheDocument()
  })

  it('should update digit counter as user types', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Saisir 5 chiffres
    fireEvent.change(input, { target: { value: '73710' } })
    
    // Vérifier que le compteur est mis à jour
    expect(screen.getByText('5/9')).toBeInTheDocument()
  })

  it('should display France as default country with correct format', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    // Vérifier que le drapeau français et le format sont affichés
    expect(screen.getByText('🇫🇷')).toBeInTheDocument()
    expect(screen.getByText('France +33')).toBeInTheDocument()
  })

  it('should open country dropdown when clicked', async () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    const countryButton = screen.getByRole('button')
    fireEvent.click(countryButton)
    
    // Vérifier que la liste des pays s'ouvre
    await waitFor(() => {
      expect(screen.getByText('États-Unis')).toBeInTheDocument()
      expect(screen.getByText('Royaume-Uni')).toBeInTheDocument()
      expect(screen.getByText('Allemagne')).toBeInTheDocument()
    })
  })

  it('should change country code when different country is selected', async () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    // Ouvrir la dropdown
    const countryButton = screen.getByRole('button')
    fireEvent.click(countryButton)
    
    // Sélectionner l'Allemagne
    await waitFor(() => {
      const germanyOption = screen.getByText('Allemagne')
      fireEvent.click(germanyOption)
    })
    
    // Vérifier que l'indicatif a changé
    expect(screen.getByText('Allemagne +49')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪')).toBeInTheDocument()
  })

  it('should parse existing phone number correctly', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value="+49 0123456789"
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    // Vérifier que l'Allemagne est sélectionnée
    expect(screen.getByText('Allemagne +49')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪')).toBeInTheDocument()
    
    // Vérifier que les 9 chiffres sont affichés (sans le 0 initial)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('123456789')
    
    // Vérifier le compteur
    expect(screen.getByText('9/9')).toBeInTheDocument()
  })

  it('should format output correctly with country code and fixed 0', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Saisir des chiffres
    fireEvent.change(input, { target: { value: '737105867' } })
    
    // Vérifier le format de sortie : +33 0737105867
    expect(mockOnChange).toHaveBeenCalledWith('+33 0737105867')
  })
})