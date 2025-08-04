import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SEOHead, SimpleSEOHead } from '@/components/SEOHead'
import { pagesSEOData } from '@/lib/seo-config'
import { vi } from 'vitest'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </HelmetProvider>
)

describe('SEO Basic Functionality', () => {
  beforeEach(() => {
    // Reset document head
    document.head.innerHTML = ''
    document.title = ''
  })

  it('should render SEOHead component without errors', () => {
    expect(() => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )
    }).not.toThrow()
  })

  it('should render SimpleSEOHead component without errors', () => {
    expect(() => {
      render(
        <TestWrapper>
          <SimpleSEOHead 
            title="Test Title"
            description="Test description"
          />
        </TestWrapper>
      )
    }).not.toThrow()
  })

  it('should set document title with SEOHead', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    // Check if title is set
    expect(document.title).toContain('Kamlease')
    expect(document.title).toContain('Solutions Mécatroniques')
  })

  it('should set document title with SimpleSEOHead', () => {
    const testTitle = 'Custom Test Title'
    
    render(
      <TestWrapper>
        <SimpleSEOHead 
          title={testTitle}
          description="Test description"
        />
      </TestWrapper>
    )

    expect(document.title).toBe(testTitle)
  })

  it('should create meta description tag', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const descriptionMeta = document.querySelector('meta[name="description"]')
    expect(descriptionMeta).toBeTruthy()
    expect(descriptionMeta?.getAttribute('content')).toContain('mécatronique')
  })

  it('should create meta keywords tag', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    expect(keywordsMeta).toBeTruthy()
    expect(keywordsMeta?.getAttribute('content')).toContain('solutions mécatroniques')
  })

  it('should create Open Graph meta tags', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogType = document.querySelector('meta[property="og:type"]')
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')

    expect(ogTitle).toBeTruthy()
    expect(ogDescription).toBeTruthy()
    expect(ogType).toBeTruthy()
    expect(ogSiteName).toBeTruthy()

    expect(ogType?.getAttribute('content')).toBe('website')
    expect(ogSiteName?.getAttribute('content')).toBe('Kamlease')
  })

  it('should create Twitter Card meta tags', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')

    expect(twitterCard).toBeTruthy()
    expect(twitterTitle).toBeTruthy()
    expect(twitterDescription).toBeTruthy()

    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
  })

  it('should create hreflang links', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const hreflangFr = document.querySelector('link[hreflang="fr"]')
    const hreflangEn = document.querySelector('link[hreflang="en"]')
    const hreflangDefault = document.querySelector('link[hreflang="x-default"]')

    expect(hreflangFr).toBeTruthy()
    expect(hreflangEn).toBeTruthy()
    expect(hreflangDefault).toBeTruthy()
  })

  it('should create canonical link', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const canonicalLink = document.querySelector('link[rel="canonical"]')
    expect(canonicalLink).toBeTruthy()
    expect(canonicalLink?.getAttribute('href')).toContain('kamlease.com')
  })

  it('should handle custom title and description', () => {
    const customTitle = 'Custom Page Title'
    const customDescription = 'Custom page description'

    render(
      <TestWrapper>
        <SEOHead 
          pageData={pagesSEOData.home}
          customTitle={customTitle}
          customDescription={customDescription}
        />
      </TestWrapper>
    )

    expect(document.title).toBe(customTitle)
    
    const descriptionMeta = document.querySelector('meta[name="description"]')
    expect(descriptionMeta?.getAttribute('content')).toBe(customDescription)
  })

  it('should handle noindex and nofollow', () => {
    render(
      <TestWrapper>
        <SEOHead 
          pageData={pagesSEOData.home}
          noindex={true}
          nofollow={true}
        />
      </TestWrapper>
    )

    const robotsMeta = document.querySelector('meta[name="robots"]')
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow')
  })

  it('should set correct language attribute', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    expect(document.documentElement.lang).toBe('fr')
  })
})