/**
 * Tests pour le composant PhoneInput simple
 * Chiffres uniquement, 18 caractères maximum
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhoneInput from '../components/PhoneInput'

describe('PhoneInput - Version simple', () => {
  it('should allow only numbers, spaces, + and - characters', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="+33 6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Test avec des chiffres et caractères autorisés
    fireEvent.change(input, { target: { value: '+33 6 73 71 05 86' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 6 73 71 05 86')
    
    // Test avec des lettres - devrait être filtré
    fireEvent.change(input, { target: { value: '+33abc6def73' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33673')
  })

  it('should limit input to 18 characters maximum', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="+33 6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    // Test avec plus de 18 caractères
    fireEvent.change(input, { target: { value: '+33 6 73 71 05 86 123456789' } })
    expect(mockOnChange).toHaveBeenCalledWith('+33 6 73 71 05 86 ')
  })

  it('should have correct input attributes', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="+33 6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    
    expect(input).toHaveAttribute('inputMode', 'numeric')
    expect(input).toHaveAttribute('type', 'tel')
    expect(input).toHaveAttribute('maxLength', '18')
  })

  it('should display phone icon', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value=""
        onChange={mockOnChange}
        placeholder="+33 6 73 71 05 86"
      />
    )

    // Vérifier que l'icône téléphone est présente
    const phoneIcon = document.querySelector('.lucide-phone')
    expect(phoneIcon).toBeInTheDocument()
  })

  it('should accept the value prop correctly', () => {
    const mockOnChange = vi.fn()
    
    render(
      <PhoneInput
        value="+33 6 73 71 05 86"
        onChange={mockOnChange}
        placeholder="+33 6 73 71 05 86"
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('+33 6 73 71 05 86')
  })
})