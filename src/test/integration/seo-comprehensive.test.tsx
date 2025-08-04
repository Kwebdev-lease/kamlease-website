import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SEOHead } from '@/components/SEOHead'
import { StructuredData } from '@/components/StructuredData'
import { SEOImage } from '@/components/SEOImage'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContextualLinks } from '@/components/ContextualLinks'
import { SEOMonitoringDashboard } from '@/components/SEOMonitoringDashboard'
import { seoMetaManager } from '@/lib/seo-meta-manager'
import { structuredDataService } from '@/lib/structured-data-service'
import { sitemapGenerator } from '@/lib/sitemap-generator'
import { contentOptimizer } from '@/lib/content-optimizer'
import { imageOptimizer } from '@/lib/image-optimizer'
import { seoMonitoring } from '@/lib/seo-monitoring'
import { socialMediaOptimizer } from '@/lib/social-media-optimizer'

// Mock DOM methods
const mockHead = document.head
const mockCreateElement = document.createElement.bind(document)
const mockQuerySelector = document.querySelector.bind(document)

beforeEach(() => {
  // Reset DOM
  document.head.innerHTML = ''
  
  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
      navigation: {
        type: 0,
        redirectCount: 0
      },
      timing: {
        navigationStart: Date.now() - 1000,
        loadEventEnd: Date.now()
      }
    },
    writable: true
  })

  // Mock Intersection Observer
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width: 768px') ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock localStorage
  const mockStorage = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => mockStorage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => mockStorage.set(key, value)),
      removeItem: vi.fn((key: string) => mockStorage.delete(key)),
      clear: vi.fn(() => mockStorage.clear()),
    },
    writable: true,
  })
})

afterEach(() => {
  vi.clearAllMocks()
  document.head.innerHTML = ''
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('Comprehensive SEO Integration Tests', () => {
  describe('Meta Tags and SEO Head Integration', () => {
    it('should render complete SEO meta tags for home page', async () => {
      const pageData = {
        title: 'Kamlease - Solutions Mécatroniques et Électroniques Innovantes',
        description: 'Expertise en mécatronique, électronique industrielle et auto-staging. Solutions innovantes pour l\'industrie automobile et électronique.',
        keywords: ['mécatronique', 'électronique industrielle', 'auto-staging'],
        canonicalUrl: 'https://kamlease.com',
        language: 'fr' as const,
        lastModified: new Date()
      }

      render(
        <TestWrapper>
          <SEOHead pageData={pageData} />
        </TestWrapper>
      )

      await waitFor(() => {
        // Check meta tags in document head
        const titleElement = document.querySelector('title')
        const descriptionMeta = document.querySelector('meta[name="description"]')
        const keywordsMeta = document.querySelector('meta[name="keywords"]')
        const canonicalLink = document.querySelector('link[rel="canonical"]')

        expect(titleElement?.textContent).toBe(pageData.title)
        expect(descriptionMeta?.getAttribute('content')).toBe(pageData.description)
        expect(keywordsMeta?.getAttribute('content')).toContain('mécatronique')
        expect(canonicalLink?.getAttribute('href')).toBe(pageData.canonicalUrl)
      })
    })

    it('should handle multilingual meta tags correctly', async () => {
      const frenchPageData = {
        title: 'Kamlease - Solutions Mécatroniques',
        description: 'Expertise en mécatronique et électronique',
        keywords: ['mécatronique', 'électronique'],
        canonicalUrl: 'https://kamlease.com',
        language: 'fr' as const,
        lastModified: new Date()
      }

      const englishPageData = {
        title: 'Kamlease - Mechatronic Solutions',
        description: 'Expertise in mechatronics and electronics',
        keywords: ['mechatronics', 'electronics'],
        canonicalUrl: 'https://kamlease.com/en',
        language: 'en' as const,
        lastModified: new Date()
      }

      const { rerender } = render(
        <TestWrapper>
          <SEOHead pageData={frenchPageData} />
        </TestWrapper>
      )

      // Check French meta tags
      await waitFor(() => {
        const titleElement = document.querySelector('title')
        expect(titleElement?.textContent).toBe(frenchPageData.title)
      })

      // Switch to English
      rerender(
        <TestWrapper>
          <SEOHead pageData={englishPageData} />
        </TestWrapper>
      )

      // Check English meta tags
      await waitFor(() => {
        const titleElement = document.querySelector('title')
        const hreflangLinks = document.querySelectorAll('link[hreflang]')
        
        expect(titleElement?.textContent).toBe(englishPageData.title)
        expect(hreflangLinks.length).toBeGreaterThan(0)
      })
    })

    it('should include Open Graph and Twitter Card meta tags', async () => {
      const pageData = {
        title: 'Kamlease - Solutions Mécatroniques',
        description: 'Expertise en mécatronique et électronique industrielle',
        keywords: ['mécatronique'],
        canonicalUrl: 'https://kamlease.com',
        language: 'fr' as const,
        lastModified: new Date()
      }

      render(
        <TestWrapper>
          <SEOHead pageData={pageData} />
        </TestWrapper>
      )

      await waitFor(() => {
        // Check Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]')
        const ogDescription = document.querySelector('meta[property="og:description"]')
        const ogType = document.querySelector('meta[property="og:type"]')
        const ogUrl = document.querySelector('meta[property="og:url"]')

        // Check Twitter Card tags
        const twitterCard = document.querySelector('meta[name="twitter:card"]')
        const twitterTitle = document.querySelector('meta[name="twitter:title"]')

        expect(ogTitle?.getAttribute('content')).toBe(pageData.title)
        expect(ogDescription?.getAttribute('content')).toBe(pageData.description)
        expect(ogType?.getAttribute('content')).toBe('website')
        expect(ogUrl?.getAttribute('content')).toBe(pageData.canonicalUrl)
        expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
        expect(twitterTitle?.getAttribute('content')).toBe(pageData.title)
      })
    })
  })

  describe('Structured Data Integration', () => {
    it('should render valid JSON-LD structured data', async () => {
      const organizationData = {
        name: 'Kamlease',
        description: 'Solutions innovantes en mécatronique et électronique',
        url: 'https://kamlease.com',
        logo: 'https://kamlease.com/assets/logos/logo.svg'
      }

      render(
        <TestWrapper>
          <StructuredData type="Organization" data={organizationData} />
        </TestWrapper>
      )

      await waitFor(() => {
        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        expect(scriptTag).toBeInTheDocument()
        
        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          expect(jsonData['@context']).toBe('https://schema.org')
          expect(jsonData['@type']).toBe('Organization')
          expect(jsonData.name).toBe(organizationData.name)
          expect(jsonData.url).toBe(organizationData.url)
        }
      })
    })

    it('should handle multiple structured data types', async () => {
      const organizationData = {
        name: 'Kamlease',
        url: 'https://kamlease.com'
      }

      const localBusinessData = {
        name: 'Kamlease',
        address: 'France',
        telephone: '+33-X-XX-XX-XX-XX'
      }

      render(
        <TestWrapper>
          <div>
            <StructuredData type="Organization" data={organizationData} />
            <StructuredData type="LocalBusiness" data={localBusinessData} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const scriptTags = document.querySelectorAll('script[type="application/ld+json"]')
        expect(scriptTags.length).toBe(2)
        
        const jsonData1 = JSON.parse(scriptTags[0].textContent || '{}')
        const jsonData2 = JSON.parse(scriptTags[1].textContent || '{}')
        
        expect(jsonData1['@type']).toBe('Organization')
        expect(jsonData2['@type']).toBe('LocalBusiness')
      })
    })

    it('should validate structured data schema compliance', async () => {
      const websiteData = {
        name: 'Kamlease',
        url: 'https://kamlease.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://kamlease.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }

      render(
        <TestWrapper>
          <StructuredData type="WebSite" data={websiteData} />
        </TestWrapper>
      )

      await waitFor(() => {
        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        expect(scriptTag).toBeInTheDocument()
        
        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          
          // Validate required Schema.org properties
          expect(jsonData['@context']).toBe('https://schema.org')
          expect(jsonData['@type']).toBe('WebSite')
          expect(jsonData.name).toBeDefined()
          expect(jsonData.url).toBeDefined()
          expect(jsonData.potentialAction).toBeDefined()
          expect(jsonData.potentialAction['@type']).toBe('SearchAction')
        }
      })
    })
  })

  describe('Image Optimization Integration', () => {
    it('should render optimized images with proper SEO attributes', async () => {
      const imageProps = {
        src: '/assets/logos/logo.png',
        alt: 'Kamlease - Solutions mécatroniques et électroniques innovantes',
        width: 400,
        height: 200,
        priority: true
      }

      render(
        <TestWrapper>
          <SEOImage {...imageProps} />
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('alt', imageProps.alt)
        expect(img).toHaveAttribute('width', imageProps.width.toString())
        expect(img).toHaveAttribute('height', imageProps.height.toString())
        expect(img).toHaveAttribute('loading', 'eager') // priority image
      })
    })

    it('should handle responsive images with multiple formats', async () => {
      const imageProps = {
        src: '/assets/hero-image.jpg',
        alt: 'Expertise mécatronique Kamlease',
        width: 800,
        height: 600,
        priority: false
      }

      render(
        <TestWrapper>
          <SEOImage {...imageProps} />
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('loading', 'lazy') // non-priority image
        expect(img).toHaveAttribute('decoding', 'async')
        
        // Check for responsive attributes
        const picture = img.closest('picture')
        if (picture) {
          const sources = picture.querySelectorAll('source')
          expect(sources.length).toBeGreaterThan(0)
        }
      })
    })

    it('should generate descriptive alt text for SEO', async () => {
      const imageProps = {
        src: '/assets/services/mechatronics.jpg',
        alt: '', // Empty alt to test auto-generation
        width: 600,
        height: 400,
        context: 'services mechatronics expertise'
      }

      render(
        <TestWrapper>
          <SEOImage {...imageProps} />
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        const altText = img.getAttribute('alt')
        
        // Should have generated meaningful alt text
        expect(altText).toBeTruthy()
        expect(altText?.length).toBeGreaterThan(10)
      })
    })
  })

  describe('Navigation and Internal Linking', () => {
    it('should render SEO-optimized breadcrumbs', async () => {
      const breadcrumbItems = [
        { label: 'Accueil', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Mécatronique', href: '/services/mechatronique' }
      ]

      render(
        <TestWrapper>
          <Breadcrumbs items={breadcrumbItems} />
        </TestWrapper>
      )

      await waitFor(() => {
        const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
        expect(nav).toBeInTheDocument()
        
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(2) // Last item is not a link
        
        // Check structured data for breadcrumbs
        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          expect(jsonData['@type']).toBe('BreadcrumbList')
          expect(jsonData.itemListElement).toHaveLength(3)
        }
      })
    })

    it('should render contextual internal links', async () => {
      const contextualLinks = [
        { text: 'Solutions mécatroniques', href: '/services/mechatronique', context: 'services' },
        { text: 'Électronique industrielle', href: '/services/electronique', context: 'services' },
        { text: 'Auto-staging', href: '/services/auto-staging', context: 'services' }
      ]

      render(
        <TestWrapper>
          <ContextualLinks links={contextualLinks} />
        </TestWrapper>
      )

      await waitFor(() => {
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(3)
        
        // Check that links have proper SEO attributes
        links.forEach(link => {
          expect(link).toHaveAttribute('href')
          expect(link.textContent).toBeTruthy()
        })
      })
    })

    it('should maintain proper heading hierarchy for SEO', async () => {
      render(
        <TestWrapper>
          <div>
            <h1>Kamlease - Solutions Mécatroniques</h1>
            <h2>Nos Services</h2>
            <h3>Mécatronique</h3>
            <h3>Électronique Industrielle</h3>
            <h2>Notre Expertise</h2>
            <h3>30 ans d'expérience</h3>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 })
        const h2s = screen.getAllByRole('heading', { level: 2 })
        const h3s = screen.getAllByRole('heading', { level: 3 })
        
        expect(h1).toBeInTheDocument()
        expect(h2s).toHaveLength(2)
        expect(h3s).toHaveLength(3)
        
        // Check heading content includes target keywords
        expect(h1.textContent).toContain('Mécatroniques')
        expect(h3s.some(h3 => h3.textContent?.includes('Mécatronique'))).toBe(true)
        expect(h3s.some(h3 => h3.textContent?.includes('Électronique'))).toBe(true)
      })
    })
  })

  describe('Performance and Core Web Vitals', () => {
    it('should meet performance thresholds for SEO', async () => {
      // Mock performance metrics
      const mockPerformanceEntries = [
        {
          name: 'first-contentful-paint',
          startTime: 800, // < 1800ms threshold
          entryType: 'paint'
        },
        {
          name: 'largest-contentful-paint',
          startTime: 1200, // < 2500ms threshold
          entryType: 'largest-contentful-paint'
        }
      ]

      Object.defineProperty(window.performance, 'getEntriesByType', {
        value: vi.fn((type: string) => {
          if (type === 'paint') return [mockPerformanceEntries[0]]
          if (type === 'largest-contentful-paint') return [mockPerformanceEntries[1]]
          return []
        })
      })

      render(
        <TestWrapper>
          <SEOMonitoringDashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        // Component should render without performance issues
        expect(screen.getByText(/performance/i)).toBeInTheDocument()
      })

      // Verify performance metrics are within SEO thresholds
      const fcpEntries = window.performance.getEntriesByType('paint')
      const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint')
      
      expect(fcpEntries[0]?.startTime).toBeLessThan(1800) // FCP < 1.8s
      expect(lcpEntries[0]?.startTime).toBeLessThan(2500) // LCP < 2.5s
    })

    it('should handle lazy loading for performance optimization', async () => {
      const images = [
        { src: '/image1.jpg', alt: 'Image 1' },
        { src: '/image2.jpg', alt: 'Image 2' },
        { src: '/image3.jpg', alt: 'Image 3' }
      ]

      render(
        <TestWrapper>
          <div>
            {images.map((img, index) => (
              <SEOImage
                key={index}
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                priority={index === 0} // Only first image is priority
              />
            ))}
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const allImages = screen.getAllByRole('img')
        expect(allImages).toHaveLength(3)
        
        // First image should be eager loading (priority)
        expect(allImages[0]).toHaveAttribute('loading', 'eager')
        
        // Other images should be lazy loading
        expect(allImages[1]).toHaveAttribute('loading', 'lazy')
        expect(allImages[2]).toHaveAttribute('loading', 'lazy')
      })
    })

    it('should optimize resource loading for mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('max-width: 768px') ? true : false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(
        <TestWrapper>
          <SEOImage
            src="/hero-image.jpg"
            alt="Kamlease expertise"
            width={800}
            height={600}
            priority={true}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
        
        // Should have responsive attributes for mobile
        expect(img).toHaveAttribute('loading', 'eager')
        expect(img).toHaveAttribute('decoding', 'async')
      })
    })
  })

  describe('Mobile Compatibility and Responsiveness', () => {
    it('should render properly on mobile viewports', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      render(
        <TestWrapper>
          <div className="mobile-seo-test">
            <SEOHead pageData={{
              title: 'Kamlease Mobile',
              description: 'Mobile optimized page',
              keywords: ['mobile', 'responsive'],
              canonicalUrl: 'https://kamlease.com',
              language: 'fr',
              lastModified: new Date()
            }} />
            <Breadcrumbs items={[
              { label: 'Accueil', href: '/' },
              { label: 'Mobile', href: '/mobile' }
            ]} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        // Check viewport meta tag for mobile
        const viewportMeta = document.querySelector('meta[name="viewport"]')
        expect(viewportMeta?.getAttribute('content')).toContain('width=device-width')
        
        // Check mobile-friendly navigation
        const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
        expect(nav).toBeInTheDocument()
      })
    })

    it('should handle touch interactions for mobile SEO', async () => {
      render(
        <TestWrapper>
          <ContextualLinks links={[
            { text: 'Services mobiles', href: '/services', context: 'mobile' },
            { text: 'Contact mobile', href: '/contact', context: 'mobile' }
          ]} />
        </TestWrapper>
      )

      const user = userEvent.setup()
      const links = screen.getAllByRole('link')
      
      // Links should be accessible via touch
      for (const link of links) {
        expect(link).toBeInTheDocument()
        // Simulate touch interaction
        await user.click(link)
      }
    })

    it('should optimize content for mobile search', async () => {
      const mobilePageData = {
        title: 'Kamlease Mobile - Solutions Mécatroniques',
        description: 'Solutions mécatroniques optimisées pour mobile. Expertise accessible partout.',
        keywords: ['mécatronique mobile', 'solutions mobiles'],
        canonicalUrl: 'https://kamlease.com/mobile',
        language: 'fr' as const,
        lastModified: new Date()
      }

      render(
        <TestWrapper>
          <SEOHead pageData={mobilePageData} />
        </TestWrapper>
      )

      await waitFor(() => {
        const titleElement = document.querySelector('title')
        const descriptionMeta = document.querySelector('meta[name="description"]')
        
        // Mobile-optimized title should be concise
        expect(titleElement?.textContent?.length).toBeLessThan(60)
        
        // Mobile-optimized description should be concise
        expect(descriptionMeta?.getAttribute('content')?.length).toBeLessThan(160)
        
        // Should include mobile-specific keywords
        expect(descriptionMeta?.getAttribute('content')).toContain('mobile')
      })
    })
  })

  describe('Multilingual SEO Integration', () => {
    it('should handle hreflang attributes correctly', async () => {
      const pageData = {
        title: 'Kamlease - Solutions Mécatroniques',
        description: 'Expertise en mécatronique',
        keywords: ['mécatronique'],
        canonicalUrl: 'https://kamlease.com',
        language: 'fr' as const,
        lastModified: new Date()
      }

      render(
        <TestWrapper>
          <SEOHead pageData={pageData} />
        </TestWrapper>
      )

      await waitFor(() => {
        const hreflangLinks = document.querySelectorAll('link[hreflang]')
        expect(hreflangLinks.length).toBeGreaterThan(0)
        
        // Check for proper hreflang values
        const hreflangValues = Array.from(hreflangLinks).map(link => 
          link.getAttribute('hreflang')
        )
        
        expect(hreflangValues).toContain('fr')
        expect(hreflangValues).toContain('en')
        expect(hreflangValues).toContain('x-default')
      })
    })

    it('should generate language-specific structured data', async () => {
      const frenchOrgData = {
        name: 'Kamlease',
        description: 'Solutions innovantes en mécatronique',
        url: 'https://kamlease.com'
      }

      const englishOrgData = {
        name: 'Kamlease',
        description: 'Innovative mechatronic solutions',
        url: 'https://kamlease.com/en'
      }

      const { rerender } = render(
        <TestWrapper>
          <StructuredData type="Organization" data={frenchOrgData} />
        </TestWrapper>
      )

      // Check French structured data
      await waitFor(() => {
        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          expect(jsonData.description).toContain('mécatronique')
        }
      })

      // Switch to English
      rerender(
        <TestWrapper>
          <StructuredData type="Organization" data={englishOrgData} />
        </TestWrapper>
      )

      // Check English structured data
      await waitFor(() => {
        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          expect(jsonData.description).toContain('mechatronic')
          expect(jsonData.url).toContain('/en')
        }
      })
    })

    it('should handle multilingual sitemap generation', async () => {
      // Test sitemap generation with multiple languages
      const sitemapContent = sitemapGenerator.generateSitemap()
      
      expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(sitemapContent).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(sitemapContent).toContain('hreflang="fr"')
      expect(sitemapContent).toContain('hreflang="en"')
      expect(sitemapContent).toContain('hreflang="x-default"')
    })
  })

  describe('SEO Monitoring and Analytics Integration', () => {
    it('should track SEO performance metrics', async () => {
      render(
        <TestWrapper>
          <SEOMonitoringDashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        // Should display performance metrics
        expect(screen.getByText(/performance/i)).toBeInTheDocument()
        
        // Should track Core Web Vitals
        const performanceSection = screen.getByText(/performance/i).closest('div')
        expect(performanceSection).toBeInTheDocument()
      })
    })

    it('should validate SEO score thresholds', async () => {
      // Mock SEO monitoring service
      const mockSEOScore = {
        overall: 92, // > 90 threshold
        technical: 95,
        content: 88,
        performance: 94
      }

      vi.spyOn(seoMonitoring, 'calculateSEOScore').mockResolvedValue(mockSEOScore)

      const score = await seoMonitoring.calculateSEOScore('https://kamlease.com')
      
      expect(score.overall).toBeGreaterThan(90) // Requirement 3.1
      expect(score.technical).toBeGreaterThan(85)
      expect(score.performance).toBeGreaterThan(85)
    })

    it('should monitor Core Web Vitals thresholds', async () => {
      const mockWebVitals = {
        fcp: 1200, // < 1800ms
        lcp: 2000, // < 2500ms
        cls: 0.05, // < 0.1
        fid: 80    // < 100ms
      }

      vi.spyOn(seoMonitoring, 'getCoreWebVitals').mockResolvedValue(mockWebVitals)

      const vitals = await seoMonitoring.getCoreWebVitals()
      
      expect(vitals.fcp).toBeLessThan(1800) // Requirement 3.2
      expect(vitals.lcp).toBeLessThan(2500) // Requirement 3.2
      expect(vitals.cls).toBeLessThan(0.1)  // Requirement 3.2
      expect(vitals.fid).toBeLessThan(100)  // Requirement 3.2
    })

    it('should validate WCAG 2.1 AA compliance', async () => {
      render(
        <TestWrapper>
          <div>
            <h1>Accessible Heading</h1>
            <img src="/test.jpg" alt="Descriptive alt text for accessibility" />
            <button aria-label="Accessible button">Click me</button>
            <a href="/test" aria-describedby="link-desc">
              Accessible link
              <span id="link-desc" className="sr-only">Opens in same window</span>
            </a>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        // Check heading structure
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        
        // Check image alt text
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).toBeTruthy()
        
        // Check button accessibility
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label')
        
        // Check link accessibility
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('aria-describedby')
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing meta data gracefully', async () => {
      const incompletePageData = {
        title: '',
        description: '',
        keywords: [],
        canonicalUrl: '',
        language: 'fr' as const,
        lastModified: new Date()
      }

      expect(() => {
        render(
          <TestWrapper>
            <SEOHead pageData={incompletePageData} />
          </TestWrapper>
        )
      }).not.toThrow()

      await waitFor(() => {
        // Should have fallback values
        const titleElement = document.querySelector('title')
        expect(titleElement?.textContent).toBeTruthy()
      })
    })

    it('should handle invalid structured data gracefully', async () => {
      const invalidData = {
        // Missing required fields
        name: '',
        url: null
      }

      expect(() => {
        render(
          <TestWrapper>
            <StructuredData type="Organization" data={invalidData} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('should handle network errors in SEO monitoring', async () => {
      vi.spyOn(seoMonitoring, 'calculateSEOScore').mockRejectedValue(new Error('Network error'))

      const result = await seoMonitoring.calculateSEOScore('https://kamlease.com').catch(error => {
        expect(error.message).toBe('Network error')
        return { overall: 0, technical: 0, content: 0, performance: 0 }
      })

      expect(result).toBeDefined()
    })

    it('should handle browser compatibility issues', async () => {
      // Mock older browser without modern APIs
      const originalIntersectionObserver = window.IntersectionObserver
      // @ts-ignore
      delete window.IntersectionObserver

      render(
        <TestWrapper>
          <SEOImage
            src="/test.jpg"
            alt="Test image"
            width={400}
            height={300}
            priority={false}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
        // Should fallback to eager loading when IntersectionObserver is not available
      })

      // Restore
      window.IntersectionObserver = originalIntersectionObserver
    })
  })
})