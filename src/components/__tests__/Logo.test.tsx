import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Logo } from '../Logo'
import { ThemeProvider } from '../ThemeProvider'

// Mock the useTheme hook
const mockUseTheme = vi.fn()
vi.mock('../ThemeProvider', async () => {
  const actual = await vi.importActual('../ThemeProvider')
  return {
    ...actual,
    useTheme: () => mockUseTheme(),
  }
})

describe('Logo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light' })
    
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveClass('h-10', 'w-auto')
  })

  it('uses light theme logo when resolvedTheme is light', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light' })
    
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    expect(logo).toHaveAttribute('src', '/assets/logos/Logo Black for white background.svg')
  })

  it('uses dark theme logo when resolvedTheme is dark', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'dark' })
    
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    expect(logo).toHaveAttribute('src', '/assets/logos/Logo White for black background.svg')
  })

  it('accepts custom className', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light' })
    
    render(<Logo className="h-8 w-8" />)
    
    const logo = screen.getByAltText('Kamlease')
    expect(logo).toHaveClass('h-8', 'w-8')
  })

  it('accepts custom alt text', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light' })
    
    render(<Logo alt="Custom Alt Text" />)
    
    const logo = screen.getByAltText('Custom Alt Text')
    expect(logo).toBeInTheDocument()
  })

  it('falls back to PNG when SVG fails to load', async () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light' })
    
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    
    // Initially should use SVG
    expect(logo).toHaveAttribute('src', '/assets/logos/Logo Black for white background.svg')
    
    // Simulate error loading SVG
    await act(async () => {
      logo.dispatchEvent(new Event('error'))
    })
    
    // Should fallback to PNG
    await waitFor(() => {
      expect(logo).toHaveAttribute('src', '/assets/logos/Logo Black for white background.png')
    })
  })

  it('falls back to dark PNG when dark SVG fails to load', async () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'dark' })
    
    render(<Logo />)
    
    const logo = screen.getByAltText('Kamlease')
    
    // Initially should use dark SVG
    expect(logo).toHaveAttribute('src', '/assets/logos/Logo White for black background.svg')
    
    // Simulate error loading SVG
    await act(async () => {
      logo.dispatchEvent(new Event('error'))
    })
    
    // Should fallback to dark PNG
    await waitFor(() => {
      expect(logo).toHaveAttribute('src', '/assets/logos/Logo White for black background.png')
    })
  })
})