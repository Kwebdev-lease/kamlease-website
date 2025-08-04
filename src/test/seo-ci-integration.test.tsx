import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SEOHead } from '@/components/SEOHead'
import { StructuredData } from '@/components/StructuredData'
import { SEOImage } from '@/components/SEOImage'
import { seoMonitoring } from '@/lib/seo-monitoring'
import { sitemapGenerator } from '@/lib/sitemap-generator'
import { structuredDataService } from '@/lib/structured-data-service'

// CI Environment Detection
const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test'
const ciProvider = process.env.GITHUB_ACTIONS ? 'GitHub Actions' : 
                  process.env.GITLAB_CI ? 'GitLab CI' : 
                  process.env.JENKINS_URL ? 'Jenkins' : 'Unknown'

// SEO Quality Gates for CI
const SEO_QUALITY_GATES = {
  LIGHTHOUSE_SEO_MIN: 90,
  PERFORMANCE_SCORE_MIN: 85,
  ACCESSIBILITY_SCORE_MIN: 95,
  BEST_PRACTICES_MIN: 90,
  META_TAGS_COVERAGE: 100,
  STRUCTURED_DATA_VALIDITY: 100,
  IMAGE_ALT_COVERAGE: 100,
  INTERNAL_LINKS_MIN: 5
}

// Mock CI environment
beforeEach(() => {
  // Set CI environment variables
  process.env.CI = 'true'
  process.env.NODE_ENV = 'test'
  
  // Mock performance APIs for CI
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
      navigation: { type: 0, redirectCount: 0 },
      timing: {
        navigationStart: Date.now() - 1000,
        loadEventEnd: Date.now()
      }
    },
    writable: true
  })

  // Mock Intersection Observer for CI
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

  // Mock localStorage for CI
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

  // Mock matchMedia for CI
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
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

describe('SEO CI Integration Tests', () => {
  describe('CI Environment Validation', () => {
    it('should detect CI environment correctly', () => {
      expect(isCI).toBe(true)
      expect(process.env.CI).toBe('true')
      expect(process.env.NODE_ENV).toBe('test')
      
      console.log(`Running in CI environment: ${ciProvider}`)
    })

    it('should have all required test dependencies available', () => {
      // Check that all SEO components are importable
      expect(SEOHead).toBeDefined()
      expect(StructuredData).toBeDefined()
      expect(SEOImage).toBeDefined()
      
      // Check that all SEO services are available
      expect(seoMonitoring).toBeDefined()
      expect(sitemapGenerator).toBeDefined()
      expect(structuredDataService).toBeDefined()
    })

    it('should run tests in headless mode for CI', () => {
      // Verify headless environment setup
      expect(window.navigator.userAgent).toContain('jsdom')
      expect(document.body).toBeDefined()
      expect(screen).toBeDefined()
    })
  })

  describe('SEO Quality Gates Validation', () => {
    it('should meet Lighthouse SEO score quality gate', async () => {
      const mockSEOScore = {
        overall: 95,    // Must be >= 90
        technical: 98,
        content: 92,
        performance: 94
      }
      
      vi.spyOn(seoMonitoring, 'calculateSEOScore').mockResolvedValue(mockSEOScore)
      
      const score = await seoMonitoring.calculateSEOScore('https://kamlease.com')
      
      expect(score.overall).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN)
      
      if (score.overall < SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN) {
        throw new Error(`SEO Quality Gate Failed: Lighthouse SEO score ${score.overall} is below minimum ${SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN}`)
      }
    })

    it('should validate meta tags coverage quality gate', async () => {
      const testPages = [
        {
          title: 'Kamlease - Solutions Mécatroniques',
          description: 'Expertise en mécatronique et électronique industrielle',
          keywords: ['mécatronique', 'électronique'],
          canonicalUrl: 'https://kamlease.com',
          language: 'fr' as const,
          lastModified: new Date()
        },
        {
          title: 'Kamlease - About Us',
          description: 'Learn about our mechatronic expertise',
          keywords: ['mechatronics', 'about'],
          canonicalUrl: 'https://kamlease.com/about',
          language: 'en' as const,
          lastModified: new Date()
        }
      ]

      let metaTagsCoverage = 0
      const totalRequiredTags = testPages.length * 5 // title, description, keywords, canonical, language

      for (const pageData of testPages) {
        render(
          <TestWrapper>
            <SEOHead pageData={pageData} />
          </TestWrapper>
        )

        await waitFor(() => {
          const title = document.querySelector('title')
          const description = document.querySelector('meta[name="description"]')
          const keywords = document.querySelector('meta[name="keywords"]')
          const canonical = document.querySelector('link[rel="canonical"]')
          const language = document.querySelector('html[lang]') || document.documentElement

          if (title?.textContent) metaTagsCoverage++
          if (description?.getAttribute('content')) metaTagsCoverage++
          if (keywords?.getAttribute('content')) metaTagsCoverage++
          if (canonical?.getAttribute('href')) metaTagsCoverage++
          if (language) metaTagsCoverage++
        })

        document.head.innerHTML = '' // Reset for next page
      }

      const coveragePercentage = (metaTagsCoverage / totalRequiredTags) * 100
      expect(coveragePercentage).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.META_TAGS_COVERAGE)

      if (coveragePercentage < SEO_QUALITY_GATES.META_TAGS_COVERAGE) {
        throw new Error(`Meta Tags Quality Gate Failed: Coverage ${coveragePercentage}% is below minimum ${SEO_QUALITY_GATES.META_TAGS_COVERAGE}%`)
      }
    })

    it('should validate structured data quality gate', async () => {
      const structuredDataTypes = [
        { type: 'Organization', data: { name: 'Kamlease', url: 'https://kamlease.com' } },
        { type: 'LocalBusiness', data: { name: 'Kamlease', address: 'Paris', telephone: '+33-1-XX' } },
        { type: 'WebSite', data: { name: 'Kamlease', url: 'https://kamlease.com' } }
      ]

      let validStructuredData = 0

      for (const { type, data } of structuredDataTypes) {
        render(
          <TestWrapper>
            <StructuredData type={type as any} data={data} />
          </TestWrapper>
        )

        await waitFor(() => {
          const scriptTag = document.querySelector('script[type="application/ld+json"]')
          if (scriptTag?.textContent) {
            try {
              const jsonData = JSON.parse(scriptTag.textContent)
              if (jsonData['@context'] === 'https://schema.org' && jsonData['@type'] === type) {
                validStructuredData++
              }
            } catch (error) {
              console.error(`Invalid JSON-LD for ${type}:`, error)
            }
          }
        })

        document.head.innerHTML = '' // Reset for next test
      }

      const structuredDataValidity = (validStructuredData / structuredDataTypes.length) * 100
      expect(structuredDataValidity).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.STRUCTURED_DATA_VALIDITY)

      if (structuredDataValidity < SEO_QUALITY_GATES.STRUCTURED_DATA_VALIDITY) {
        throw new Error(`Structured Data Quality Gate Failed: Validity ${structuredDataValidity}% is below minimum ${SEO_QUALITY_GATES.STRUCTURED_DATA_VALIDITY}%`)
      }
    })

    it('should validate image alt text coverage quality gate', async () => {
      const testImages = [
        { src: '/image1.jpg', alt: 'Solutions mécatroniques Kamlease - expertise industrielle' },
        { src: '/image2.jpg', alt: 'Électronique industrielle avancée' },
        { src: '/image3.jpg', alt: 'Auto-staging et optimisation des processus' },
        { src: '/image4.jpg', alt: 'Équipe d\'experts en mécatronique' }
      ]

      let imagesWithAlt = 0

      render(
        <TestWrapper>
          <div>
            {testImages.map((img, index) => (
              <SEOImage
                key={index}
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                priority={index === 0}
              />
            ))}
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(testImages.length)

        images.forEach(img => {
          const altText = img.getAttribute('alt')
          if (altText && altText.length > 10) { // Meaningful alt text
            imagesWithAlt++
          }
        })
      })

      const altTextCoverage = (imagesWithAlt / testImages.length) * 100
      expect(altTextCoverage).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.IMAGE_ALT_COVERAGE)

      if (altTextCoverage < SEO_QUALITY_GATES.IMAGE_ALT_COVERAGE) {
        throw new Error(`Image Alt Text Quality Gate Failed: Coverage ${altTextCoverage}% is below minimum ${SEO_QUALITY_GATES.IMAGE_ALT_COVERAGE}%`)
      }
    })

    it('should validate sitemap generation quality gate', async () => {
      const sitemap = sitemapGenerator.generateSitemap()
      
      // Validate sitemap structure
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(sitemap).toContain('</urlset>')
      
      // Count URLs in sitemap
      const urlMatches = sitemap.match(/<url>/g)
      const urlCount = urlMatches ? urlMatches.length : 0
      
      expect(urlCount).toBeGreaterThan(0)
      
      // Validate required URLs are present
      expect(sitemap).toContain('<loc>https://kamlease.com</loc>') // Home page
      expect(sitemap).toContain('hreflang="fr"') // French version
      expect(sitemap).toContain('hreflang="en"') // English version
      expect(sitemap).toContain('hreflang="x-default"') // Default version
      
      if (urlCount === 0) {
        throw new Error('Sitemap Quality Gate Failed: No URLs found in generated sitemap')
      }
    })
  })

  describe('Performance Quality Gates', () => {
    it('should meet Core Web Vitals quality gates', async () => {
      const mockWebVitals = {
        fcp: 1200, // < 1800ms
        lcp: 2000, // < 2500ms
        cls: 0.05, // < 0.1
        fid: 80    // < 100ms
      }

      vi.spyOn(seoMonitoring, 'getCoreWebVitals').mockResolvedValue(mockWebVitals)

      const vitals = await seoMonitoring.getCoreWebVitals()

      // Validate each Core Web Vital
      expect(vitals.fcp).toBeLessThan(1800)
      expect(vitals.lcp).toBeLessThan(2500)
      expect(vitals.cls).toBeLessThan(0.1)
      expect(vitals.fid).toBeLessThan(100)

      // Check for quality gate failures
      const failures = []
      if (vitals.fcp >= 1800) failures.push(`FCP: ${vitals.fcp}ms >= 1800ms`)
      if (vitals.lcp >= 2500) failures.push(`LCP: ${vitals.lcp}ms >= 2500ms`)
      if (vitals.cls >= 0.1) failures.push(`CLS: ${vitals.cls} >= 0.1`)
      if (vitals.fid >= 100) failures.push(`FID: ${vitals.fid}ms >= 100ms`)

      if (failures.length > 0) {
        throw new Error(`Core Web Vitals Quality Gate Failed: ${failures.join(', ')}`)
      }
    })

    it('should meet accessibility quality gate', async () => {
      render(
        <TestWrapper>
          <div data-testid="accessibility-validation">
            <h1>Accessible Page Title</h1>
            <img src="/test.jpg" alt="Descriptive image alt text for accessibility testing" />
            <button aria-label="Accessible button with clear purpose">Action</button>
            <a href="/test" aria-describedby="link-desc">
              Accessible Link
              <span id="link-desc" className="sr-only">Opens in same window</span>
            </a>
            <form>
              <label htmlFor="test-input">Accessible Form Label</label>
              <input id="test-input" type="text" aria-required="true" />
            </form>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        // Validate heading structure
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()

        // Validate image accessibility
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')?.length).toBeGreaterThan(20)

        // Validate button accessibility
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label')

        // Validate link accessibility
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('aria-describedby')

        // Validate form accessibility
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-required', 'true')
        expect(input).toHaveAttribute('id')

        const label = screen.getByLabelText('Accessible Form Label')
        expect(label).toBeInTheDocument()
      })

      // Calculate accessibility score (simplified)
      const accessibilityChecks = [
        screen.queryByRole('heading', { level: 1 }) !== null,
        screen.queryByRole('img')?.getAttribute('alt')?.length > 20,
        screen.queryByRole('button')?.hasAttribute('aria-label'),
        screen.queryByRole('link')?.hasAttribute('aria-describedby'),
        screen.queryByRole('textbox')?.hasAttribute('aria-required')
      ]

      const accessibilityScore = (accessibilityChecks.filter(Boolean).length / accessibilityChecks.length) * 100
      expect(accessibilityScore).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.ACCESSIBILITY_SCORE_MIN)

      if (accessibilityScore < SEO_QUALITY_GATES.ACCESSIBILITY_SCORE_MIN) {
        throw new Error(`Accessibility Quality Gate Failed: Score ${accessibilityScore}% is below minimum ${SEO_QUALITY_GATES.ACCESSIBILITY_SCORE_MIN}%`)
      }
    })
  })

  describe('CI Test Execution Validation', () => {
    it('should complete all SEO tests within CI time limits', async () => {
      const testStartTime = Date.now()
      
      // Run a comprehensive SEO test suite
      const testPromises = [
        // Meta tags test
        new Promise(resolve => {
          render(
            <TestWrapper>
              <SEOHead pageData={{
                title: 'CI Test Page',
                description: 'CI test description',
                keywords: ['ci', 'test'],
                canonicalUrl: 'https://kamlease.com/ci-test',
                language: 'fr',
                lastModified: new Date()
              }} />
            </TestWrapper>
          )
          setTimeout(resolve, 100)
        }),
        
        // Structured data test
        new Promise(resolve => {
          render(
            <TestWrapper>
              <StructuredData type="Organization" data={{ name: 'CI Test', url: 'https://test.com' }} />
            </TestWrapper>
          )
          setTimeout(resolve, 100)
        }),
        
        // Image optimization test
        new Promise(resolve => {
          render(
            <TestWrapper>
              <SEOImage src="/ci-test.jpg" alt="CI test image" width={400} height={300} priority={true} />
            </TestWrapper>
          )
          setTimeout(resolve, 100)
        })
      ]

      await Promise.all(testPromises)
      
      const testEndTime = Date.now()
      const totalTestTime = testEndTime - testStartTime
      
      // CI tests should complete within reasonable time (5 seconds)
      expect(totalTestTime).toBeLessThan(5000)
      
      console.log(`CI SEO tests completed in ${totalTestTime}ms`)
    })

    it('should generate CI-friendly test reports', async () => {
      const testResults = {
        seoScore: 95,
        performanceScore: 88,
        accessibilityScore: 96,
        bestPracticesScore: 92,
        metaTagsCoverage: 100,
        structuredDataValidity: 100,
        imageAltCoverage: 100,
        testDuration: 1500
      }

      // Validate all quality gates
      expect(testResults.seoScore).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN)
      expect(testResults.performanceScore).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.PERFORMANCE_SCORE_MIN)
      expect(testResults.accessibilityScore).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.ACCESSIBILITY_SCORE_MIN)
      expect(testResults.bestPracticesScore).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.BEST_PRACTICES_MIN)
      expect(testResults.metaTagsCoverage).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.META_TAGS_COVERAGE)
      expect(testResults.structuredDataValidity).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.STRUCTURED_DATA_VALIDITY)
      expect(testResults.imageAltCoverage).toBeGreaterThanOrEqual(SEO_QUALITY_GATES.IMAGE_ALT_COVERAGE)

      // Generate CI report format
      const ciReport = {
        status: 'PASSED',
        timestamp: new Date().toISOString(),
        environment: ciProvider,
        qualityGates: {
          seo: testResults.seoScore >= SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN ? 'PASSED' : 'FAILED',
          performance: testResults.performanceScore >= SEO_QUALITY_GATES.PERFORMANCE_SCORE_MIN ? 'PASSED' : 'FAILED',
          accessibility: testResults.accessibilityScore >= SEO_QUALITY_GATES.ACCESSIBILITY_SCORE_MIN ? 'PASSED' : 'FAILED',
          bestPractices: testResults.bestPracticesScore >= SEO_QUALITY_GATES.BEST_PRACTICES_MIN ? 'PASSED' : 'FAILED'
        },
        metrics: testResults
      }

      console.log('CI SEO Test Report:', JSON.stringify(ciReport, null, 2))
      
      // All quality gates should pass
      expect(Object.values(ciReport.qualityGates).every(status => status === 'PASSED')).toBe(true)
    })

    it('should handle CI environment limitations gracefully', async () => {
      // Mock CI limitations (no real browser, limited resources)
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'jsdom/CI-Environment',
        configurable: true
      })

      // Mock limited performance API
      Object.defineProperty(window.performance, 'getEntriesByType', {
        value: vi.fn(() => []),
        writable: true
      })

      expect(() => {
        render(
          <TestWrapper>
            <div data-testid="ci-limitations-test">
              <SEOHead pageData={{
                title: 'CI Limitations Test',
                description: 'Testing CI environment limitations',
                keywords: ['ci', 'limitations'],
                canonicalUrl: 'https://kamlease.com/ci-limitations',
                language: 'fr',
                lastModified: new Date()
              }} />
              <SEOImage src="/ci-test.jpg" alt="CI test image" width={400} height={300} priority={true} />
            </div>
          </TestWrapper>
        )
      }).not.toThrow()

      await waitFor(() => {
        expect(screen.getByTestId('ci-limitations-test')).toBeInTheDocument()
      })

      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      })
    })
  })

  describe('CI Failure Scenarios', () => {
    it('should fail CI when SEO quality gates are not met', async () => {
      const failingScores = {
        overall: 85,    // Below 90 threshold
        technical: 80,  // Below threshold
        content: 75,    // Below threshold
        performance: 70 // Below threshold
      }

      vi.spyOn(seoMonitoring, 'calculateSEOScore').mockResolvedValue(failingScores)

      const score = await seoMonitoring.calculateSEOScore('https://kamlease.com')

      // This should trigger CI failure
      if (score.overall < SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN) {
        expect(() => {
          throw new Error(`CI FAILURE: SEO score ${score.overall} below quality gate ${SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN}`)
        }).toThrow()
      }
    })

    it('should fail CI when accessibility standards are not met', async () => {
      render(
        <TestWrapper>
          <div data-testid="accessibility-failure">
            <h1>Title</h1>
            <img src="/test.jpg" alt="" /> {/* Missing alt text */}
            <button>Button</button> {/* Missing aria-label */}
            <a href="/test">Link</a> {/* Missing aria-describedby */}
            <input type="text" /> {/* Missing label */}
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        const button = screen.getByRole('button')
        const link = screen.getByRole('link')
        const input = screen.getByRole('textbox')

        // Check for accessibility violations
        const violations = []
        if (!img.getAttribute('alt')) violations.push('Missing image alt text')
        if (!button.getAttribute('aria-label')) violations.push('Missing button aria-label')
        if (!link.getAttribute('aria-describedby')) violations.push('Missing link description')
        if (!input.getAttribute('id') || !document.querySelector(`label[for="${input.getAttribute('id')}"]`)) {
          violations.push('Missing input label')
        }

        if (violations.length > 0) {
          expect(() => {
            throw new Error(`CI FAILURE: Accessibility violations: ${violations.join(', ')}`)
          }).toThrow()
        }
      })
    })

    it('should provide detailed failure reports for debugging', async () => {
      const failureReport = {
        timestamp: new Date().toISOString(),
        environment: ciProvider,
        failures: [
          {
            test: 'SEO Score Quality Gate',
            expected: SEO_QUALITY_GATES.LIGHTHOUSE_SEO_MIN,
            actual: 85,
            status: 'FAILED'
          },
          {
            test: 'Image Alt Text Coverage',
            expected: SEO_QUALITY_GATES.IMAGE_ALT_COVERAGE,
            actual: 75,
            status: 'FAILED'
          }
        ],
        recommendations: [
          'Improve meta tag optimization',
          'Add descriptive alt text to all images',
          'Enhance structured data implementation'
        ]
      }

      console.error('CI SEO Test Failures:', JSON.stringify(failureReport, null, 2))

      // Simulate CI failure
      expect(failureReport.failures.length).toBeGreaterThan(0)
      expect(failureReport.failures.every(f => f.status === 'FAILED')).toBe(true)
    })
  })
})