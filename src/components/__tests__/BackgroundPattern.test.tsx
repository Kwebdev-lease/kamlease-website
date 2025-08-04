import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BackgroundPattern from '../BackgroundPattern'
import { ThemeProvider } from '../ThemeProvider'

// Mock du hook useTheme
const mockUseTheme = vi.fn()
vi.mock('../ThemeProvider', async () => {
  const actual = await vi.importActual('../ThemeProvider')
  return {
    ...actual,
    useTheme: () => mockUseTheme()
  }
})

// Wrapper avec ThemeProvider pour les tests
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider defaultTheme="light">
    {children}
  </ThemeProvider>
)

describe('BackgroundPattern', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: vi.fn()
    })
  })

  it('renders with gradient background', () => {
    const { container } = render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'gradient', 
            intensity: 'medium' 
          }} 
        />
      </ThemeWrapper>
    )

    const gradientElement = container.querySelector('.bg-gradient-to-br')
    expect(gradientElement).toBeInTheDocument()
  })

  it('renders with pattern background', () => {
    const { container } = render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'pattern', 
            intensity: 'medium' 
          }} 
        />
      </ThemeWrapper>
    )

    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })

  it('renders with particles when animated', () => {
    const { container } = render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'particles', 
            intensity: 'medium',
            animated: true
          }} 
        />
      </ThemeWrapper>
    )

    const particleContainer = container.querySelector('.overflow-hidden')
    expect(particleContainer).toBeInTheDocument()
  })

  it('renders combined background with all elements', () => {
    const { container } = render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'combined', 
            intensity: 'strong',
            animated: true,
            section: 'hero'
          }} 
        />
      </ThemeWrapper>
    )

    // Vérifie la présence du gradient
    const gradientElement = container.querySelector('.bg-gradient-to-br')
    expect(gradientElement).toBeInTheDocument()

    // Vérifie la présence du SVG
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()

    // Vérifie la présence des particules
    const particleContainer = container.querySelector('.overflow-hidden')
    expect(particleContainer).toBeInTheDocument()
  })

  it('adapts to dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: vi.fn()
    })

    const { container } = render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'combined', 
            intensity: 'medium',
            animated: true
          }} 
        />
      </ThemeWrapper>
    )

    // Le composant devrait s'adapter au thème sombre
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'gradient', 
            intensity: 'medium' 
          }}
        >
          <div data-testid="child-content">Test Content</div>
        </BackgroundPattern>
      </ThemeWrapper>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'gradient', 
            intensity: 'medium' 
          }}
          className="custom-class"
        />
      </ThemeWrapper>
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders different patterns for different sections', () => {
    const sections = ['hero', 'about', 'expertise', 'process', 'contact']
    
    sections.forEach(section => {
      const { container } = render(
        <ThemeWrapper>
          <BackgroundPattern 
            config={{ 
              type: 'pattern', 
              intensity: 'medium',
              section: section as any
            }}
          />
        </ThemeWrapper>
      )

      const svgElement = container.querySelector('svg')
      expect(svgElement).toBeInTheDocument()
      
      // Vérifie que les patterns ont des IDs uniques par section
      const patternElement = container.querySelector(`#grid-${section}`)
      expect(patternElement).toBeInTheDocument()
    })
  })

  it('adjusts particle count based on intensity', () => {
    const intensities: Array<'subtle' | 'medium' | 'strong'> = ['subtle', 'medium', 'strong']
    
    intensities.forEach(intensity => {
      const { container } = render(
        <ThemeWrapper>
          <BackgroundPattern 
            config={{ 
              type: 'particles', 
              intensity,
              animated: true
            }}
          />
        </ThemeWrapper>
      )

      const particles = container.querySelectorAll('.animate-float')
      const expectedCount = intensity === 'subtle' ? 8 : intensity === 'medium' ? 12 : 16
      expect(particles).toHaveLength(expectedCount)
    })
  })

  it('does not render particles when not animated', () => {
    const { container } = render(
      <ThemeWrapper>
        <BackgroundPattern 
          config={{ 
            type: 'particles', 
            intensity: 'medium',
            animated: false
          }} 
        />
      </ThemeWrapper>
    )

    const particleContainer = container.querySelector('.overflow-hidden')
    expect(particleContainer).not.toBeInTheDocument()
  })
})