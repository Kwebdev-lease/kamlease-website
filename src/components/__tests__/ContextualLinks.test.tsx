import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ContextualLinks, InlineContextualLink, RelatedLinks } from '../ContextualLinks'
import { LanguageProvider } from '@/contexts/LanguageProvider'

// Mock the internal links service
vi.mock('@/lib/internal-links', () => ({
  useInternalLinks: () => ({
    getContextualLinks: vi.fn((context: string, maxLinks: number = 3) => {
      if (context === 'home') {
        return [
          {
            url: '#about',
            text: 'notre expertise en mécatronique',
            title: 'Découvrir notre expertise',
            context: 'hero-section',
            keywords: ['mécatronique', 'expertise'],
            priority: 9
          },
          {
            url: '#contact',
            text: 'contactez notre équipe',
            title: 'Démarrer votre projet',
            context: 'process-section',
            keywords: ['contact', 'projet'],
            priority: 10
          }
        ].slice(0, maxLinks)
      }
      return []
    }),
    getRelatedLinks: vi.fn((keywords: string[], currentUrl: string, maxLinks: number = 5) => {
      // Return empty array for nonexistent keywords
      if (keywords.includes('nonexistent')) {
        return []
      }
      
      return [
        {
          url: '#expertise',
          text: 'nos solutions innovantes',
          title: 'Voir nos domaines d\'expertise',
          context: 'about-section',
          keywords: ['solutions', 'innovation'],
          priority: 8,
          relevanceScore: 12
        }
      ].slice(0, maxLinks)
    })
  })
}))

const renderWithLanguage = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('ContextualLinks', () => {
  it('should render contextual links for given context', () => {
    renderWithLanguage(<ContextualLinks context="home" />)
    
    expect(screen.getByText('notre expertise en mécatronique')).toBeInTheDocument()
    expect(screen.getByText('contactez notre équipe')).toBeInTheDocument()
  })

  it('should limit links based on maxLinks prop', () => {
    renderWithLanguage(<ContextualLinks context="home" maxLinks={1} />)
    
    expect(screen.getByText('notre expertise en mécatronique')).toBeInTheDocument()
    expect(screen.queryByText('contactez notre équipe')).not.toBeInTheDocument()
  })

  it('should render title when showTitle is true', () => {
    renderWithLanguage(<ContextualLinks context="home" showTitle={true} />)
    
    expect(screen.getByText('Liens connexes')).toBeInTheDocument()
  })

  it('should not render title when showTitle is false', () => {
    renderWithLanguage(<ContextualLinks context="home" showTitle={false} />)
    
    expect(screen.queryByText('Liens connexes')).not.toBeInTheDocument()
  })

  it('should render custom title', () => {
    const customTitle = 'Custom Links Title'
    renderWithLanguage(
      <ContextualLinks context="home" title={customTitle} />
    )
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })

  it('should render different variants correctly', () => {
    const { rerender } = renderWithLanguage(
      <ContextualLinks context="home" variant="default" />
    )
    
    // Default variant should have specific styling
    expect(screen.getByText('notre expertise en mécatronique').closest('a')).toHaveClass('group')
    
    rerender(
      <LanguageProvider>
        <ContextualLinks context="home" variant="compact" />
      </LanguageProvider>
    )
    
    // Compact variant should have different styling
    expect(screen.getByText('notre expertise en mécatronique').closest('a')).toHaveClass('text-sm')
  })

  it('should not render when no links available', () => {
    const { container } = renderWithLanguage(<ContextualLinks context="unknown" />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should handle anchor link clicks', () => {
    // Mock getElementById
    const mockElement = { scrollIntoView: vi.fn() }
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)
    
    renderWithLanguage(<ContextualLinks context="home" />)
    
    const link = screen.getByText('notre expertise en mécatronique')
    fireEvent.click(link)
    
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })
})

describe('InlineContextualLink', () => {
  it('should render inline contextual link', () => {
    renderWithLanguage(
      <InlineContextualLink context="home" linkIndex={0}>
        Custom Text
      </InlineContextualLink>
    )
    
    expect(screen.getByText('Custom Text')).toBeInTheDocument()
    expect(screen.getByText('Custom Text')).toHaveClass('inline-contextual-link')
  })

  it('should render link text when no children provided', () => {
    renderWithLanguage(<InlineContextualLink context="home" linkIndex={0} />)
    
    expect(screen.getByText('notre expertise en mécatronique')).toBeInTheDocument()
  })

  it('should render children when no link available', () => {
    renderWithLanguage(
      <InlineContextualLink context="unknown" linkIndex={0}>
        Fallback Text
      </InlineContextualLink>
    )
    
    expect(screen.getByText('Fallback Text')).toBeInTheDocument()
  })
})

describe('RelatedLinks', () => {
  it('should render related links based on keywords', () => {
    const keywords = ['solutions', 'innovation']
    const currentUrl = '#current'
    
    renderWithLanguage(
      <RelatedLinks keywords={keywords} currentUrl={currentUrl} />
    )
    
    expect(screen.getByText('nos solutions innovantes')).toBeInTheDocument()
    expect(screen.getByText('Contenu connexe')).toBeInTheDocument()
  })

  it('should render custom title', () => {
    const keywords = ['solutions', 'innovation']
    const currentUrl = '#current'
    const customTitle = 'Custom Related Content'
    
    renderWithLanguage(
      <RelatedLinks 
        keywords={keywords} 
        currentUrl={currentUrl} 
        title={customTitle}
      />
    )
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })

  it('should not render when no related links found', () => {
    const keywords = ['nonexistent']
    const currentUrl = '#current'
    
    const { container } = renderWithLanguage(
      <RelatedLinks keywords={keywords} currentUrl={currentUrl} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should handle anchor link clicks', () => {
    const mockElement = { scrollIntoView: vi.fn() }
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)
    
    const keywords = ['solutions', 'innovation']
    const currentUrl = '#current'
    
    renderWithLanguage(
      <RelatedLinks keywords={keywords} currentUrl={currentUrl} />
    )
    
    const link = screen.getByText('nos solutions innovantes')
    fireEvent.click(link)
    
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })
})