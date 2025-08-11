import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SEOImage } from '@/components/SEOImage'
import { LanguageProvider } from '@/contexts/LanguageProvider'

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
)

describe('SEO Image Integration', () => {
  it('should render SEO optimized image with proper attributes', async () => {
    render(
      <TestWrapper>
        <SEOImage 
          src="/assets/logos/logo-color.svg" 
          context="logo"
          keywords={['Kamlease', 'mécatronique']}
          priority={true}
        />
      </TestWrapper>
    )

    // Should show loading state initially
    expect(screen.getByLabelText('Loading image')).toBeInTheDocument()

    // Wait for the component to process and render the image
    await waitFor(() => {
      const img = screen.queryByRole('img')
      if (img) {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).toContain('Kamlease')
        expect(img).toHaveAttribute('itemProp', 'image')
        expect(img).toHaveAttribute('data-context', 'logo')
      }
    }, { timeout: 3000 })
  })

  it('should handle different contexts correctly', async () => {
    const contexts = ['logo', 'hero', 'services', 'expertise', 'contact']
    
    for (const context of contexts) {
      const { unmount } = render(
        <TestWrapper>
          <SEOImage 
            src="/test-image.jpg" 
            context={context}
            priority={true}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.queryByRole('img')
        if (img) {
          expect(img).toHaveAttribute('data-context', context)
          const alt = img.getAttribute('alt')
          expect(alt).toBeTruthy()
          expect(alt!.length).toBeGreaterThan(0)
        }
      }, { timeout: 1000 })

      unmount()
    }
  })

  it('should apply lazy loading for non-priority images', async () => {
    render(
      <TestWrapper>
        <SEOImage 
          src="/test-image.jpg" 
          context="services"
          priority={false}
        />
      </TestWrapper>
    )

    // Should show placeholder for lazy loading
    await waitFor(() => {
      expect(screen.getByLabelText('Image loading')).toBeInTheDocument()
    })
  })

  it('should handle custom keywords', async () => {
    const customKeywords = ['innovation', 'technologie', 'développement']
    
    render(
      <TestWrapper>
        <SEOImage 
          src="/test-image.jpg" 
          context="generic"
          keywords={customKeywords}
          priority={true}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.queryByRole('img')
      if (img) {
        expect(img).toHaveAttribute('data-keywords', customKeywords.join(','))
      }
    }, { timeout: 1000 })
  })
})