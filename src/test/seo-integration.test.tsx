import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import Index from '@/pages/Index'
import { vi } from 'vitest'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
  MotionConfig: ({ children }: any) => children,
  useInView: () => true,
  useAnimation: () => ({
    start: vi.fn(),
    set: vi.fn(),
  }),
}))

// Mock intersection observer
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          {children}
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  </BrowserRouter>
)

describe('SEO Integration', () => {
  beforeEach(() => {
    // Reset document head
    document.head.innerHTML = ''
    document.title = ''
  })

  it('should render Index page with SEO meta tags', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    )

    // Wait for the component to render
    await screen.findByText('Innovons Ensemble')

    // Check if basic meta tags are present
    const titleElement = document.querySelector('title')
    const descriptionMeta = document.querySelector('meta[name="description"]')
    const keywordsMeta = document.querySelector('meta[name="keywords"]')

    expect(titleElement).toBeTruthy()
    expect(descriptionMeta).toBeTruthy()
    expect(keywordsMeta).toBeTruthy()

    // Check if Open Graph tags are present
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')

    expect(ogTitle).toBeTruthy()
    expect(ogDescription).toBeTruthy()
    expect(ogImage).toBeTruthy()

    // Check if Twitter Card tags are present
    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')

    expect(twitterCard).toBeTruthy()
    expect(twitterTitle).toBeTruthy()

    // Check if hreflang links are present
    const hreflangFr = document.querySelector('link[hreflang="fr"]')
    const hreflangEn = document.querySelector('link[hreflang="en"]')
    const hreflangDefault = document.querySelector('link[hreflang="x-default"]')

    expect(hreflangFr).toBeTruthy()
    expect(hreflangEn).toBeTruthy()
    expect(hreflangDefault).toBeTruthy()

    // Check if canonical link is present
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    expect(canonicalLink).toBeTruthy()
  })

  it('should have correct meta tag content for home page', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    )

    await screen.findByText('Innovons Ensemble')

    const titleElement = document.querySelector('title')
    const descriptionMeta = document.querySelector('meta[name="description"]')
    const keywordsMeta = document.querySelector('meta[name="keywords"]')

    expect(titleElement?.textContent).toContain('Kamlease')
    expect(titleElement?.textContent).toContain('Solutions Mécatroniques')
    
    expect(descriptionMeta?.getAttribute('content')).toContain('mécatronique')
    expect(descriptionMeta?.getAttribute('content')).toContain('électronique')
    
    expect(keywordsMeta?.getAttribute('content')).toContain('solutions mécatroniques')
    expect(keywordsMeta?.getAttribute('content')).toContain('électronique industrielle')
  })

  it('should set correct language attribute', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    )

    await screen.findByText('Innovons Ensemble')

    expect(document.documentElement.lang).toBe('fr')
  })

  it('should have proper Open Graph structure', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    )

    await screen.findByText('Innovons Ensemble')

    const ogType = document.querySelector('meta[property="og:type"]')
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')
    const ogLocale = document.querySelector('meta[property="og:locale"]')

    expect(ogType?.getAttribute('content')).toBe('website')
    expect(ogSiteName?.getAttribute('content')).toBe('Kamlease')
    expect(ogLocale?.getAttribute('content')).toBe('fr_FR')
  })

  it('should have proper Twitter Card structure', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    )

    await screen.findByText('Innovons Ensemble')

    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
  })
})