import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Breadcrumbs, useBreadcrumbs } from '../Breadcrumbs'
import { LanguageProvider } from '@/contexts/LanguageProvider'

// Mock the StructuredData component
vi.mock('../StructuredData', () => ({
  BreadcrumbStructuredData: ({ items }: { items: any[] }) => (
    <script type="application/ld+json" data-testid="structured-data">
      {JSON.stringify({ items })}
    </script>
  )
}))

const renderWithLanguage = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('Breadcrumbs', () => {
  const mockItems = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
    { name: 'Current Page', url: '/about/current', isCurrentPage: true }
  ]

  it('should render breadcrumb items correctly', () => {
    renderWithLanguage(<Breadcrumbs items={mockItems} />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Current Page')).toBeInTheDocument()
  })

  it('should render structured data', () => {
    renderWithLanguage(<Breadcrumbs items={mockItems} />)
    
    const structuredData = screen.getByTestId('structured-data')
    expect(structuredData).toBeInTheDocument()
    expect(structuredData).toHaveAttribute('type', 'application/ld+json')
  })

  it('should mark current page correctly', () => {
    renderWithLanguage(<Breadcrumbs items={mockItems} />)
    
    const currentPage = screen.getByText('Current Page')
    expect(currentPage).toHaveAttribute('aria-current', 'page')
  })

  it('should include home link when showHome is true', () => {
    const itemsWithoutHome = [
      { name: 'About', url: '/about' },
      { name: 'Current Page', url: '/about/current', isCurrentPage: true }
    ]
    
    renderWithLanguage(<Breadcrumbs items={itemsWithoutHome} showHome={true} />)
    
    expect(screen.getByText('Accueil')).toBeInTheDocument() // French default
  })

  it('should not render when no items provided and showHome is false', () => {
    const { container } = renderWithLanguage(<Breadcrumbs items={[]} showHome={false} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should render custom separator', () => {
    const customSeparator = <span data-testid="custom-separator">→</span>
    
    renderWithLanguage(
      <Breadcrumbs items={mockItems} separator={customSeparator} />
    )
    
    const separators = screen.getAllByTestId('custom-separator')
    // Should have separators between items (including home link when showHome is true)
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should have proper accessibility attributes', () => {
    renderWithLanguage(<Breadcrumbs items={mockItems} />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Fil d\'Ariane')
    
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('itemScope')
    expect(list).toHaveAttribute('itemType', 'https://schema.org/BreadcrumbList')
  })
})

describe('useBreadcrumbs', () => {
  // Mock window.location
  const mockLocation = (pathname: string) => {
    Object.defineProperty(window, 'location', {
      value: { pathname },
      writable: true
    })
  }

  it('should return empty array for home page', () => {
    mockLocation('/')
    
    const TestComponent = () => {
      const breadcrumbs = useBreadcrumbs()
      return <div data-testid="breadcrumbs-count">{breadcrumbs.length}</div>
    }
    
    renderWithLanguage(<TestComponent />)
    
    expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('0')
  })

  it('should generate breadcrumbs for legal notice page', () => {
    mockLocation('/mentions-legales')
    
    const TestComponent = () => {
      const breadcrumbs = useBreadcrumbs()
      return (
        <div>
          <div data-testid="breadcrumbs-count">{breadcrumbs.length}</div>
          {breadcrumbs.map((item, index) => (
            <div key={index} data-testid={`breadcrumb-${index}`}>
              {item.name}
            </div>
          ))}
        </div>
      )
    }
    
    renderWithLanguage(<TestComponent />)
    
    expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1')
    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Mentions légales')
  })

  it('should generate breadcrumbs for privacy policy page', () => {
    mockLocation('/politique-confidentialite')
    
    const TestComponent = () => {
      const breadcrumbs = useBreadcrumbs()
      return (
        <div>
          <div data-testid="breadcrumbs-count">{breadcrumbs.length}</div>
          {breadcrumbs.map((item, index) => (
            <div key={index} data-testid={`breadcrumb-${index}`}>
              {item.name}
            </div>
          ))}
        </div>
      )
    }
    
    renderWithLanguage(<TestComponent />)
    
    expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1')
    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Politique de confidentialité')
  })

  it('should use custom items when provided', () => {
    const customItems = [
      { name: 'Custom', url: '/custom', isCurrentPage: true }
    ]
    
    const TestComponent = () => {
      const breadcrumbs = useBreadcrumbs(customItems)
      return (
        <div>
          <div data-testid="breadcrumbs-count">{breadcrumbs.length}</div>
          <div data-testid="breadcrumb-0">{breadcrumbs[0]?.name}</div>
        </div>
      )
    }
    
    renderWithLanguage(<TestComponent />)
    
    expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1')
    expect(screen.getByTestId('breadcrumb-0')).toHaveTextContent('Custom')
  })
})