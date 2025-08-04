import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Expertise } from '../Expertise'
import { LanguageProvider } from '../../contexts/LanguageProvider'
import { ThemeProvider } from '../ThemeProvider'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock hooks
vi.mock('../../hooks/use-scroll-animation', () => ({
  useScrollAnimation: () => ({
    ref: { current: null },
    isInView: true,
    hasAnimated: false,
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('Expertise Component', () => {
  it('renders with enhanced animations and background', () => {
    render(
      <TestWrapper>
        <Expertise />
      </TestWrapper>
    )

    // Check if the section is rendered
    const section = document.querySelector('#expertise')
    expect(section).toBeInTheDocument()

    // Check if the main heading is rendered
    const heading = screen.getByRole('heading', { name: /notre expertise/i })
    expect(heading).toBeInTheDocument()

    // Check if expertise cards are rendered
    const collaborationCard = screen.getByRole('heading', { name: /collaboration/i })
    const innovationCard = screen.getByRole('heading', { name: /innovation/i })
    const optimizationCard = screen.getByRole('heading', { name: /optimisation/i })
    
    expect(collaborationCard).toBeInTheDocument()
    expect(innovationCard).toBeInTheDocument()
    expect(optimizationCard).toBeInTheDocument()
  })

  it('has proper structure for animations', () => {
    render(
      <TestWrapper>
        <Expertise />
      </TestWrapper>
    )

    // Check if the section has relative positioning for background
    const section = document.querySelector('#expertise')
    expect(section).toHaveClass('relative')
    expect(section).toHaveClass('overflow-hidden')
  })
})