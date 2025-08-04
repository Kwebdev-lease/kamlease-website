import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SEOHead, SimpleSEOHead } from '../SEOHead'
import { pagesSEOData } from '@/lib/seo-config'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </HelmetProvider>
)

describe('SEOHead', () => {
  beforeEach(() => {
    // Reset document head
    document.head.innerHTML = ''
  })

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )
  })

  it('should set basic meta tags', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    // Check if meta tags are present in document head
    const titleElement = document.querySelector('title')
    const descriptionMeta = document.querySelector('meta[name="description"]')
    const keywordsMeta = document.querySelector('meta[name="keywords"]')

    expect(titleElement).toBeTruthy()
    expect(descriptionMeta).toBeTruthy()
    expect(keywordsMeta).toBeTruthy()
  })

  it('should set Open Graph meta tags', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')

    expect(ogTitle).toBeTruthy()
    expect(ogDescription).toBeTruthy()
    expect(ogImage).toBeTruthy()
    expect(ogUrl).toBeTruthy()
  })

  it('should set Twitter Card meta tags', () => {
    render(
      <TestWrapper>
        <SEOHead pageData={pagesSEOData.home} />
      </TestWrapper>
    )

    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    const twitterImage = document.querySelector('meta[name="twitter:image"]')

    expect(twitterCard).toBeTruthy()
    expect(twitterTitle).toBeTruthy()
    expect(twitterDescription).toBeTruthy()
    expect(twitterImage).toBeTruthy()
  })

  it('should set hreflang links', () => {
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

    const titleElement = document.querySelector('title')
    const descriptionMeta = document.querySelector('meta[name="description"]')

    expect(titleElement?.textContent).toBe(customTitle)
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
})

describe('SimpleSEOHead', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('should render with basic props', () => {
    render(
      <TestWrapper>
        <SimpleSEOHead 
          title="Simple Title"
          description="Simple description"
        />
      </TestWrapper>
    )

    const titleElement = document.querySelector('title')
    const descriptionMeta = document.querySelector('meta[name="description"]')

    expect(titleElement?.textContent).toBe('Simple Title')
    expect(descriptionMeta?.getAttribute('content')).toBe('Simple description')
  })

  it('should handle keywords', () => {
    const keywords = ['test', 'simple', 'seo']

    render(
      <TestWrapper>
        <SimpleSEOHead 
          title="Simple Title"
          description="Simple description"
          keywords={keywords}
        />
      </TestWrapper>
    )

    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    expect(keywordsMeta?.getAttribute('content')).toBe(keywords.join(', '))
  })

  it('should handle noindex', () => {
    render(
      <TestWrapper>
        <SimpleSEOHead 
          title="Simple Title"
          description="Simple description"
          noindex={true}
        />
      </TestWrapper>
    )

    const robotsMeta = document.querySelector('meta[name="robots"]')
    expect(robotsMeta?.getAttribute('content')).toContain('noindex')
  })
})