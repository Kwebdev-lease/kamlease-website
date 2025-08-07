/**
 * Tests pour le composant PhoneInput avec validation numérique stricte
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhoneInput from '../components/PhoneInput'

describe('PhoneInput - Validation numérique', () => {
  it('should only allow numeric characters and spaces', async () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Test avec des chiffres - devrait fonctionner
    fireEvent.change(input, { target: { value: '673710586' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 673710586')
    
    // Test avec des lettres - devrait être filtré
    fireEvent.change(input, { target: { value: '67abc37def10586' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 673710586')
    
    // Test avec des caractères spéciaux - devrait être filtré
    fireEvent.change(input, { target: { value: '67@37#10$586' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 673710586')
  })

  it('should have numeric input mode and pattern', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Vérifier que l'input a les bons attributs pour la validation numérique
    expect(input).toHaveAttribute('inputMode', 'numeric')
    expect(input).toHaveAttribute('pattern', '[0-9\\s]*')
    expect(input).toHaveAttribute('type', 'tel')
  })

  it('should filter out non-numeric characters on paste', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Simuler un collage de texte avec des caractères mixtes
    fireEvent.change(input, { target: { value: 'abc123def456ghi' } })
    
    // Vérifier que seuls les chiffres sont conservés
    expect(mockOnChange).toHaveBeenCalledWith('+33 123456')
  })

  it('should format phone number with country code', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    fireEvent.change(input, { target: { value: '6 73 71 05 86' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 6 73 71 05 86')
  })

  it('should display France as default country', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="6 73 71 05 86"
      />
    )

    // Vérifier que le drapeau français et +33 sont affichés
    expect(screen.getByText('🇫🇷')).toBeInTheDocument()
    expect(screen.getByText('+33')).toBeInTheDocument()
  })

  it('should open country dropdown when clicked', async () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="6 73 71 05 86"
      />
    )

    const countryButton = screen.getByRole('button')
    fireEvent.click(countryButton)
    
    // Vérifier que la liste des pays s'ouvre
    await waitFor(() => {
      expect(screen.getByText('États-Unis / Canada')).toBeInTheDocument()
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
        placeholder="6 73 71 05 86"
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
    expect(screen.getByText('+49')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪')).toBeInTheDocument()
  })

  it('should parse existing phone number with country code', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value="+49 123 456 789"
        onChange={mockOnChange}
        placeholder="6 73 71 05 86"
      />
    )

    // Vérifier que l'Allemagne est sélectionnée
    expect(screen.getByText('+49')).toBeInTheDocument()
    expect(screen.getByText('🇩🇪')).toBeInTheDocument()
    
    // Vérifier que le numéro est affiché sans l'indicatif
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('123 456 789')
  })
})