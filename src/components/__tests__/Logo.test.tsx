import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from '../Logo'

describe('Logo Component', () => {
  it('renders with default props', () => {
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/assets/logos/Logo couleur.svg')
  })

  it('uses color logo', () => {
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    expect(logo).toHaveAttribute('src', '/assets/logos/Logo couleur.svg')
  })

  it('accepts custom className', () => {
    render(<Logo className="h-8 w-8" />)
    
    const logoContainer = screen.getByAltText('Kamlease').parentElement
    expect(logoContainer).toHaveClass('h-8', 'w-8')
  })

  it('accepts custom alt text', () => {
    render(<Logo alt="Custom Alt Text" />)
    
    const logo = screen.getByAltText('Custom Alt Text')
    expect(logo).toBeInTheDocument()
  })

  it('has proper styling for object-contain', () => {
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    expect(logo).toHaveClass('object-contain')
  })
})