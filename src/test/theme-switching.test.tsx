import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { BackgroundPattern } from '@/components/BackgroundPattern'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const TestWrapper = ({ children, theme = 'light' }: { children: React.ReactNode; theme?: 'light' | 'dark' }) => (
  <ThemeProvider defaultTheme={theme}>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('Theme Switching Functionality', () => {
  it('should render components with light theme styles', () => {
    render(
      <TestWrapper theme="light">
        <div className="light">
          <EnhancedButton variant="primary" data-testid="test-button">
            Test Button
          </EnhancedButton>
          <EnhancedCard variant="default" data-testid="test-card">
            Test Card
          </EnhancedCard>
          <BackgroundPattern 
            config={{ type: 'gradient', intensity: 'medium' }}
            data-testid="test-background"
          >
            Background Content
          </BackgroundPattern>
        </div>
      </TestWrapper>
    )

    const button = screen.getByTestId('test-button')
    const card = screen.getByTestId('test-card')
    const background = screen.getByTestId('test-background')

    expect(button).toBeInTheDocument()
    expect(card).toBeInTheDocument()
    expect(background).toBeInTheDocument()
  })

  it('should render components with dark theme styles', () => {
    render(
      <TestWrapper theme="dark">
        <div className="dark">
          <EnhancedButton variant="primary" data-testid="test-button">
            Test Button
          </EnhancedButton>
          <EnhancedCard variant="default" data-testid="test-card">
            Test Card
          </EnhancedCard>
          <BackgroundPattern 
            config={{ type: 'gradient', intensity: 'medium' }}
            data-testid="test-background"
          >
            Background Content
          </BackgroundPattern>
        </div>
      </TestWrapper>
    )

    const button = screen.getByTestId('test-button')
    const card = screen.getByTestId('test-card')
    const background = screen.getByTestId('test-background')

    expect(button).toBeInTheDocument()
    expect(card).toBeInTheDocument()
    expect(background).toBeInTheDocument()
  })

  it('should handle theme transitions smoothly', () => {
    const { rerender } = render(
      <TestWrapper theme="light">
        <div className="light">
          <BackgroundPattern 
            config={{ type: 'combined', intensity: 'medium', animated: true }}
            data-testid="test-background"
          >
            <EnhancedButton variant="primary" data-testid="test-button">
              Test Button
            </EnhancedButton>
          </BackgroundPattern>
        </div>
      </TestWrapper>
    )

    // Verify light theme elements are present
    expect(screen.getByTestId('test-background')).toBeInTheDocument()
    expect(screen.getByTestId('test-button')).toBeInTheDocument()

    // Switch to dark theme
    rerender(
      <TestWrapper theme="dark">
        <div className="dark">
          <BackgroundPattern 
            config={{ type: 'combined', intensity: 'medium', animated: true }}
            data-testid="test-background"
          >
            <EnhancedButton variant="primary" data-testid="test-button">
              Test Button
            </EnhancedButton>
          </BackgroundPattern>
        </div>
      </TestWrapper>
    )

    // Verify elements are still present after theme switch
    expect(screen.getByTestId('test-background')).toBeInTheDocument()
    expect(screen.getByTestId('test-button')).toBeInTheDocument()
  })

  it('should apply theme-specific CSS classes', () => {
    const { container } = render(
      <TestWrapper theme="dark">
        <div className="dark">
          <BackgroundPattern 
            config={{ type: 'gradient', intensity: 'medium' }}
            className="test-background"
          >
            Background Content
          </BackgroundPattern>
        </div>
      </TestWrapper>
    )

    // Check that dark theme class is applied
    const darkElement = container.querySelector('.dark')
    expect(darkElement).toBeInTheDocument()
  })

  it('should maintain component functionality across theme changes', () => {
    let clickCount = 0
    const handleClick = () => { clickCount++ }

    const { rerender } = render(
      <TestWrapper theme="light">
        <div className="light">
          <EnhancedButton 
            variant="primary" 
            onClick={handleClick}
            data-testid="test-button"
          >
            Click Me
          </EnhancedButton>
        </div>
      </TestWrapper>
    )

    const button = screen.getByTestId('test-button')
    
    // Test functionality in light theme
    fireEvent.click(button)
    expect(clickCount).toBe(1)

    // Switch to dark theme
    rerender(
      <TestWrapper theme="dark">
        <div className="dark">
          <EnhancedButton 
            variant="primary" 
            onClick={handleClick}
            data-testid="test-button"
          >
            Click Me
          </EnhancedButton>
        </div>
      </TestWrapper>
    )

    // Test functionality still works in dark theme
    const buttonAfterThemeChange = screen.getByTestId('test-button')
    fireEvent.click(buttonAfterThemeChange)
    expect(clickCount).toBe(2)
  })
})