import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SEOHead } from '@/components/SEOHead'
import { SEOImage } from '@/components/SEOImage'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContextualLinks } from '@/components/ContextualLinks'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'

// Mobile viewport configurations
const MOBILE_VIEWPORTS = {
  iPhone_SE: { width: 375, height: 667 },
  iPhone_12: { width: 390, height: 844 },
  iPhone_12_Pro_Max: { width: 428, height: 926 },
  Samsung_Galaxy_S21: { width: 360, height: 800 },
  iPad_Mini: { width: 768, height: 1024 },
  iPad_Pro: { width: 1024, height: 1366 }
}

// Touch target minimum sizes (WCAG guidelines)
const TOUCH_TARGET_MIN_SIZE = 44 // 44px minimum for accessibility

const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })

  // Mock matchMedia for responsive queries
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const isMobile = width <= 768
      const isTablet = width > 768 && width <= 1024
      const isDesktop = width > 1024

      let matches = false
      if (query.includes('max-width: 768px')) matches = isMobile
      if (query.includes('max-width: 1024px')) matches = isMobile || isTablet
      if (query.includes('min-width: 769px')) matches = isTablet || isDesktop
      if (query.includes('min-width: 1025px')) matches = isDesktop

      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    }),
  })

  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
}

beforeEach(() => {
  // Mock touch support
  Object.defineProperty(window, 'ontouchstart', {
    value: {},
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

describe('Mobile Compatibility Tests', () => {
  describe('Viewport and Responsive Design', () => {
    it('should render properly on iPhone SE (smallest mobile)', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_SE.width, MOBILE_VIEWPORTS.iPhone_SE.height)

      render(
        <TestWrapper>
          <div data-testid="mobile-content">
            <SEOHead pageData={{
              title: 'Kamlease Mobile - Solutions Mécatroniques',
              description: 'Solutions mécatroniques optimisées pour mobile',
              keywords: ['mécatronique', 'mobile'],
              canonicalUrl: 'https://kamlease.com',
              language: 'fr',
              lastModified: new Date()
            }} />
            <h1>Kamlease Mobile</h1>
            <p>Contenu optimisé pour mobile</p>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        // Check viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]')
        expect(viewportMeta?.getAttribute('content')).toContain('width=device-width')
        expect(viewportMeta?.getAttribute('content')).toContain('initial-scale=1')

        // Check content renders
        expect(screen.getByTestId('mobile-content')).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })

    it('should render properly on iPhone 12 Pro Max (large mobile)', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12_Pro_Max.width, MOBILE_VIEWPORTS.iPhone_12_Pro_Max.height)

      render(
        <TestWrapper>
          <div data-testid="large-mobile-content">
            <SEOImage
              src="/hero-mobile.jpg"
              alt="Kamlease solutions mécatroniques"
              width={428}
              height={300}
              priority={true}
            />
            <Breadcrumbs items={[
              { label: 'Accueil', href: '/' },
              { label: 'Services', href: '/services' },
              { label: 'Mobile', href: '/services/mobile' }
            ]} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
        
        expect(img).toBeInTheDocument()
        expect(nav).toBeInTheDocument()
        expect(screen.getByTestId('large-mobile-content')).toBeInTheDocument()
      })
    })

    it('should render properly on tablet (iPad)', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPad_Mini.width, MOBILE_VIEWPORTS.iPad_Mini.height)

      render(
        <TestWrapper>
          <div data-testid="tablet-content">
            <ContextualLinks links={[
              { text: 'Solutions mécatroniques', href: '/services/mechatronique', context: 'tablet' },
              { text: 'Électronique industrielle', href: '/services/electronique', context: 'tablet' },
              { text: 'Auto-staging', href: '/services/auto-staging', context: 'tablet' }
            ]} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(3)
        expect(screen.getByTestId('tablet-content')).toBeInTheDocument()
      })
    })

    it('should handle orientation changes', async () => {
      // Start in portrait
      mockViewport(375, 667)

      const { rerender } = render(
        <TestWrapper>
          <div data-testid="orientation-test">
            <SEOImage
              src="/responsive-image.jpg"
              alt="Responsive test image"
              width={375}
              height={200}
              priority={true}
            />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('orientation-test')).toBeInTheDocument()
      })

      // Switch to landscape
      mockViewport(667, 375)

      rerender(
        <TestWrapper>
          <div data-testid="orientation-test">
            <SEOImage
              src="/responsive-image.jpg"
              alt="Responsive test image"
              width={667}
              height={200}
              priority={true}
            />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
        expect(screen.getByTestId('orientation-test')).toBeInTheDocument()
      })
    })
  })

  describe('Touch Interactions and Accessibility', () => {
    it('should have touch targets meeting minimum size requirements', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      render(
        <TestWrapper>
          <div data-testid="touch-targets">
            <ThemeToggle />
            <LanguageToggle />
            <button style={{ minWidth: '44px', minHeight: '44px' }}>
              Mobile Button
            </button>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
        const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
        const englishButton = screen.getByRole('button', { name: '🇬🇧' })
        const mobileButton = screen.getByRole('button', { name: 'Mobile Button' })

        // All touch targets should be accessible
        expect(themeToggle).toBeInTheDocument()
        expect(frenchButton).toBeInTheDocument()
        expect(englishButton).toBeInTheDocument()
        expect(mobileButton).toBeInTheDocument()

        // Check that buttons are not disabled
        expect(themeToggle).not.toHaveAttribute('disabled')
        expect(frenchButton).not.toHaveAttribute('disabled')
        expect(englishButton).not.toHaveAttribute('disabled')
        expect(mobileButton).not.toHaveAttribute('disabled')
      })
    })

    it('should handle touch events properly', async () => {
      mockViewport(MOBILE_VIEWPORTS.Samsung_Galaxy_S21.width, MOBILE_VIEWPORTS.Samsung_Galaxy_S21.height)

      render(
        <TestWrapper>
          <div data-testid="touch-events">
            <LanguageToggle />
            <ContextualLinks links={[
              { text: 'Touch Link 1', href: '/touch1', context: 'mobile' },
              { text: 'Touch Link 2', href: '/touch2', context: 'mobile' }
            ]} />
          </div>
        </TestWrapper>
      )

      const user = userEvent.setup()

      await waitFor(() => {
        const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
        const englishButton = screen.getByRole('button', { name: '🇬🇧' })
        const links = screen.getAllByRole('link')

        expect(frenchButton).toBeInTheDocument()
        expect(englishButton).toBeInTheDocument()
        expect(links).toHaveLength(2)
      })

      // Simulate touch interactions
      const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
      const englishButton = screen.getByRole('button', { name: '🇬🇧' })

      await user.click(englishButton)
      await user.click(frenchButton)

      // Should handle rapid touch interactions
      for (let i = 0; i < 3; i++) {
        await user.click(englishButton)
        await user.click(frenchButton)
      }

      // Components should remain functional
      expect(frenchButton).toBeInTheDocument()
      expect(englishButton).toBeInTheDocument()
    })

    it('should support swipe gestures for navigation', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      render(
        <TestWrapper>
          <div data-testid="swipe-navigation">
            <Breadcrumbs items={[
              { label: 'Accueil', href: '/' },
              { label: 'Services', href: '/services' },
              { label: 'Mécatronique', href: '/services/mechatronique' },
              { label: 'Solutions', href: '/services/mechatronique/solutions' }
            ]} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
        const links = screen.getAllByRole('link')
        
        expect(nav).toBeInTheDocument()
        expect(links.length).toBeGreaterThan(0)
      })

      // Navigation should be scrollable on mobile
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
      expect(nav).toBeInTheDocument()
    })

    it('should handle pinch-to-zoom for images', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      render(
        <TestWrapper>
          <div data-testid="zoomable-content">
            <SEOImage
              src="/detailed-diagram.jpg"
              alt="Schéma technique détaillé des solutions mécatroniques Kamlease"
              width={800}
              height={600}
              priority={false}
            />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
        
        // Image should be responsive
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')?.length).toBeGreaterThan(20) // Descriptive alt text
      })

      // Check viewport meta allows zooming
      const viewportMeta = document.querySelector('meta[name="viewport"]')
      expect(viewportMeta?.getAttribute('content')).not.toContain('user-scalable=no')
      expect(viewportMeta?.getAttribute('content')).not.toContain('maximum-scale=1')
    })
  })

  describe('Mobile SEO Optimization', () => {
    it('should optimize meta tags for mobile search', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_SE.width, MOBILE_VIEWPORTS.iPhone_SE.height)

      const mobilePageData = {
        title: 'Kamlease Mobile - Solutions Mécatroniques Compactes',
        description: 'Solutions mécatroniques optimisées pour mobile. Expertise accessible partout, consultation rapide.',
        keywords: ['mécatronique mobile', 'solutions compactes', 'consultation mobile'],
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
        const viewportMeta = document.querySelector('meta[name="viewport"]')

        // Mobile-optimized title (concise)
        expect(titleElement?.textContent?.length).toBeLessThan(60)
        expect(titleElement?.textContent).toContain('Mobile')

        // Mobile-optimized description (concise but descriptive)
        expect(descriptionMeta?.getAttribute('content')?.length).toBeLessThan(160)
        expect(descriptionMeta?.getAttribute('content')).toContain('mobile')

        // Proper viewport configuration
        expect(viewportMeta?.getAttribute('content')).toContain('width=device-width')
        expect(viewportMeta?.getAttribute('content')).toContain('initial-scale=1')
      })
    })

    it('should optimize images for mobile bandwidth', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_SE.width, MOBILE_VIEWPORTS.iPhone_SE.height)

      render(
        <TestWrapper>
          <div data-testid="mobile-images">
            <SEOImage
              src="/hero-mobile.jpg"
              alt="Solutions mécatroniques Kamlease - optimisées pour mobile"
              width={375}
              height={250}
              priority={true}
            />
            <SEOImage
              src="/service1-mobile.jpg"
              alt="Service mécatronique 1"
              width={375}
              height={200}
              priority={false}
            />
            <SEOImage
              src="/service2-mobile.jpg"
              alt="Service mécatronique 2"
              width={375}
              height={200}
              priority={false}
            />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)

        // First image should be priority (eager loading)
        expect(images[0]).toHaveAttribute('loading', 'eager')
        expect(images[0]).toHaveAttribute('decoding', 'async')

        // Other images should be lazy loaded
        expect(images[1]).toHaveAttribute('loading', 'lazy')
        expect(images[2]).toHaveAttribute('loading', 'lazy')

        // All images should have proper alt text
        images.forEach(img => {
          expect(img).toHaveAttribute('alt')
          expect(img.getAttribute('alt')).toBeTruthy()
        })
      })
    })

    it('should handle mobile-specific structured data', async () => {
      mockViewport(MOBILE_VIEWPORTS.Samsung_Galaxy_S21.width, MOBILE_VIEWPORTS.Samsung_Galaxy_S21.height)

      const mobileOrgData = {
        name: 'Kamlease',
        description: 'Solutions mécatroniques mobiles et accessibles',
        url: 'https://kamlease.com',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+33-X-XX-XX-XX-XX',
          contactType: 'customer service',
          availableLanguage: ['French', 'English'],
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00'
          }
        }
      }

      render(
        <TestWrapper>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                ...mobileOrgData
              })
            }}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        expect(scriptTag).toBeInTheDocument()

        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          expect(jsonData['@type']).toBe('Organization')
          expect(jsonData.contactPoint.telephone).toBeTruthy()
          expect(jsonData.contactPoint.hoursAvailable).toBeDefined()
        }
      })
    })

    it('should optimize breadcrumbs for mobile navigation', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      const mobileBreadcrumbs = [
        { label: 'Accueil', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Mécatronique', href: '/services/mechatronique' },
        { label: 'Solutions Mobiles', href: '/services/mechatronique/mobile' }
      ]

      render(
        <TestWrapper>
          <Breadcrumbs items={mobileBreadcrumbs} />
        </TestWrapper>
      )

      await waitFor(() => {
        const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
        const links = screen.getAllByRole('link')

        expect(nav).toBeInTheDocument()
        expect(links).toHaveLength(3) // Last item is not a link

        // Check structured data for mobile breadcrumbs
        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          expect(jsonData['@type']).toBe('BreadcrumbList')
          expect(jsonData.itemListElement).toHaveLength(4)
        }
      })
    })
  })

  describe('Mobile Performance Optimization', () => {
    it('should load quickly on mobile networks', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      const loadStart = performance.now()

      render(
        <TestWrapper>
          <div data-testid="mobile-performance">
            <SEOHead pageData={{
              title: 'Kamlease Mobile Performance',
              description: 'Test de performance mobile',
              keywords: ['performance', 'mobile'],
              canonicalUrl: 'https://kamlease.com/mobile-perf',
              language: 'fr',
              lastModified: new Date()
            }} />
            <SEOImage
              src="/mobile-hero.jpg"
              alt="Performance mobile"
              width={390}
              height={200}
              priority={true}
            />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('mobile-performance')).toBeInTheDocument()
        expect(screen.getByRole('img')).toBeInTheDocument()
      })

      const loadEnd = performance.now()
      const loadTime = loadEnd - loadStart

      // Should load quickly on mobile (< 1 second for initial render)
      expect(loadTime).toBeLessThan(1000)
    })

    it('should minimize layout shifts on mobile', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_SE.width, MOBILE_VIEWPORTS.iPhone_SE.height)

      render(
        <TestWrapper>
          <div data-testid="layout-stability">
            <SEOImage
              src="/stable-image.jpg"
              alt="Image with stable layout"
              width={375}
              height={200}
              priority={true}
            />
            <div style={{ height: '100px' }}>
              <p>Contenu avec hauteur fixe</p>
            </div>
            <SEOImage
              src="/lazy-image.jpg"
              alt="Image lazy loaded"
              width={375}
              height={150}
              priority={false}
            />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(2)

        // Images should have explicit dimensions to prevent layout shift
        images.forEach(img => {
          expect(img).toHaveAttribute('width')
          expect(img).toHaveAttribute('height')
        })
      })
    })

    it('should handle slow mobile connections gracefully', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_SE.width, MOBILE_VIEWPORTS.iPhone_SE.height)

      // Mock slow connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '3g',
          downlink: 1.5,
          rtt: 300
        },
        writable: true
      })

      render(
        <TestWrapper>
          <div data-testid="slow-connection">
            <SEOImage
              src="/optimized-mobile.jpg"
              alt="Image optimisée pour connexion lente"
              width={375}
              height={200}
              priority={true}
            />
            <ContextualLinks links={[
              { text: 'Lien léger 1', href: '/light1', context: 'mobile-slow' },
              { text: 'Lien léger 2', href: '/light2', context: 'mobile-slow' }
            ]} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        const links = screen.getAllByRole('link')

        expect(img).toBeInTheDocument()
        expect(links).toHaveLength(2)

        // Should still be functional on slow connections
        expect(screen.getByTestId('slow-connection')).toBeInTheDocument()
      })
    })
  })

  describe('Cross-Device Compatibility', () => {
    it('should work across different mobile browsers', async () => {
      const browsers = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
      ]

      for (const userAgent of browsers) {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true
        })

        mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

        const { unmount } = render(
          <TestWrapper>
            <div data-testid={`browser-test-${browsers.indexOf(userAgent)}`}>
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </TestWrapper>
        )

        await waitFor(() => {
          const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
          const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
          const englishButton = screen.getByRole('button', { name: '🇬🇧' })

          expect(themeToggle).toBeInTheDocument()
          expect(frenchButton).toBeInTheDocument()
          expect(englishButton).toBeInTheDocument()
        })

        unmount()
      }
    })

    it('should handle different screen densities', async () => {
      const densities = [1, 2, 3] // 1x, 2x, 3x pixel density

      for (const density of densities) {
        Object.defineProperty(window, 'devicePixelRatio', {
          value: density,
          configurable: true
        })

        mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

        const { unmount } = render(
          <TestWrapper>
            <div data-testid={`density-test-${density}`}>
              <SEOImage
                src="/high-res-image.jpg"
                alt={`Image pour densité ${density}x`}
                width={390}
                height={200}
                priority={true}
              />
            </div>
          </TestWrapper>
        )

        await waitFor(() => {
          const img = screen.getByRole('img')
          expect(img).toBeInTheDocument()
          expect(img).toHaveAttribute('alt', `Image pour densité ${density}x`)
        })

        unmount()
      }
    })

    it('should support both portrait and landscape orientations', async () => {
      // Test portrait
      mockViewport(375, 667)

      const { rerender } = render(
        <TestWrapper>
          <div data-testid="orientation-responsive">
            <SEOImage
              src="/responsive-hero.jpg"
              alt="Image responsive pour orientation"
              width={375}
              height={200}
              priority={true}
            />
            <Breadcrumbs items={[
              { label: 'Accueil', href: '/' },
              { label: 'Responsive', href: '/responsive' }
            ]} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('orientation-responsive')).toBeInTheDocument()
        expect(screen.getByRole('img')).toBeInTheDocument()
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      })

      // Test landscape
      mockViewport(667, 375)

      rerender(
        <TestWrapper>
          <div data-testid="orientation-responsive">
            <SEOImage
              src="/responsive-hero.jpg"
              alt="Image responsive pour orientation"
              width={667}
              height={200}
              priority={true}
            />
            <Breadcrumbs items={[
              { label: 'Accueil', href: '/' },
              { label: 'Responsive', href: '/responsive' }
            ]} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('orientation-responsive')).toBeInTheDocument()
        expect(screen.getByRole('img')).toBeInTheDocument()
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      })
    })
  })

  describe('Mobile Accessibility', () => {
    it('should support screen readers on mobile', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      render(
        <TestWrapper>
          <div data-testid="mobile-accessibility">
            <h1>Titre Principal Accessible</h1>
            <img 
              src="/accessible-image.jpg" 
              alt="Description détaillée de l'image pour lecteurs d'écran mobiles"
            />
            <button aria-label="Bouton accessible avec description claire">
              Action Mobile
            </button>
            <a 
              href="/accessible-link" 
              aria-describedby="link-description"
            >
              Lien Accessible
              <span id="link-description" className="sr-only">
                Ouvre la page dans le même onglet
              </span>
            </a>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        const img = screen.getByRole('img')
        const button = screen.getByRole('button')
        const link = screen.getByRole('link')

        expect(heading).toBeInTheDocument()
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')?.length).toBeGreaterThan(20)
        expect(button).toHaveAttribute('aria-label')
        expect(link).toHaveAttribute('aria-describedby')
      })
    })

    it('should support voice control on mobile', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      render(
        <TestWrapper>
          <div data-testid="voice-control">
            <button aria-label="Activer le thème sombre">
              <ThemeToggle />
            </button>
            <div role="group" aria-label="Sélection de langue">
              <LanguageToggle />
            </div>
            <nav aria-label="Navigation principale">
              <ContextualLinks links={[
                { text: 'Accueil', href: '/', context: 'voice' },
                { text: 'Services', href: '/services', context: 'voice' },
                { text: 'Contact', href: '/contact', context: 'voice' }
              ]} />
            </nav>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const themeButton = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
        const languageGroup = screen.getByRole('group', { name: 'Sélection de langue' })
        const nav = screen.getByRole('navigation', { name: 'Navigation principale' })

        expect(themeButton).toBeInTheDocument()
        expect(languageGroup).toBeInTheDocument()
        expect(nav).toBeInTheDocument()
      })
    })

    it('should handle reduced motion preferences on mobile', async () => {
      mockViewport(MOBILE_VIEWPORTS.iPhone_12.width, MOBILE_VIEWPORTS.iPhone_12.height)

      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('prefers-reduced-motion: reduce') ? true : false,
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
          <div data-testid="reduced-motion">
            <SEOImage
              src="/static-image.jpg"
              alt="Image statique respectant les préférences de mouvement réduit"
              width={390}
              height={200}
              priority={true}
            />
            <ThemeToggle />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        const button = screen.getByRole('button')

        expect(img).toBeInTheDocument()
        expect(button).toBeInTheDocument()
        expect(screen.getByTestId('reduced-motion')).toBeInTheDocument()
      })
    })
  })
})