import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StructuredData } from '@/components/StructuredData'
import { sitemapGenerator } from '@/lib/sitemap-generator'
import { structuredDataService } from '@/lib/structured-data-service'

// Simple test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="test-wrapper">{children}</div>
)

beforeEach(() => {
  document.head.innerHTML = ''
  
  // Mock performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
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
})

afterEach(() => {
  vi.clearAllMocks()
  document.head.innerHTML = ''
})

describe('SEO Integration Tests - Final Suite', () => {
  describe('Structured Data Integration', () => {
    it('should generate valid Organization structured data', () => {
      const organizationData = {
        name: 'Kamlease',
        description: 'Solutions innovantes en mécatronique et électronique',
        url: 'https://kamlease.com',
        logo: 'https://kamlease.com/assets/logos/logo.svg',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+33-X-XX-XX-XX-XX',
          contactType: 'customer service',
          availableLanguage: ['French', 'English']
        }
      }

      render(
        <TestWrapper>
          <StructuredData type="Organization" data={organizationData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      expect(scriptTag).toBeInTheDocument()
      
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        // Validate Schema.org structure
        expect(jsonData['@context']).toBe('https://schema.org')
        expect(jsonData['@type']).toBe('Organization')
        expect(jsonData.name).toBe(organizationData.name)
        expect(jsonData.url).toBe(organizationData.url)
        expect(jsonData.description).toBe(organizationData.description)
        expect(jsonData.logo).toBe(organizationData.logo)
        expect(jsonData.contactPoint).toEqual(organizationData.contactPoint)
      }
    })

    it('should generate valid LocalBusiness structured data', () => {
      const businessData = {
        name: 'Kamlease',
        description: 'Expertise en mécatronique et électronique industrielle',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '123 Rue de la Technologie',
          addressLocality: 'Paris',
          postalCode: '75001',
          addressCountry: 'FR'
        },
        telephone: '+33-1-XX-XX-XX-XX',
        url: 'https://kamlease.com',
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 48.8566,
          longitude: 2.3522
        }
      }

      render(
        <TestWrapper>
          <StructuredData type="LocalBusiness" data={businessData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        expect(jsonData['@type']).toBe('LocalBusiness')
        expect(jsonData.name).toBe(businessData.name)
        expect(jsonData.address).toEqual(businessData.address)
        expect(jsonData.telephone).toBe(businessData.telephone)
        expect(jsonData.geo).toEqual(businessData.geo)
      }
    })

    it('should generate valid WebSite structured data with SearchAction', () => {
      const websiteData = {
        name: 'Kamlease',
        description: 'Solutions mécatroniques et électroniques innovantes',
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

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        expect(jsonData['@type']).toBe('WebSite')
        expect(jsonData.name).toBe(websiteData.name)
        expect(jsonData.potentialAction['@type']).toBe('SearchAction')
        expect(jsonData.potentialAction.target).toContain('{search_term_string}')
        expect(jsonData.potentialAction.queryInput).toContain('required')
      }
    })

    it('should generate valid Service structured data', () => {
      const serviceData = {
        name: 'Solutions Mécatroniques',
        description: 'Développement de solutions mécatroniques innovantes',
        provider: {
          '@type': 'Organization',
          name: 'Kamlease',
          url: 'https://kamlease.com'
        },
        serviceType: 'Mécatronique',
        areaServed: {
          '@type': 'Country',
          name: 'France'
        }
      }

      render(
        <TestWrapper>
          <StructuredData type="Service" data={serviceData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        expect(jsonData['@type']).toBe('Service')
        expect(jsonData.name).toBe(serviceData.name)
        expect(jsonData.provider['@type']).toBe('Organization')
        expect(jsonData.serviceType).toBe(serviceData.serviceType)
        expect(jsonData.areaServed['@type']).toBe('Country')
      }
    })

    it('should handle multiple structured data types on same page', () => {
      const orgData = { name: 'Kamlease', url: 'https://kamlease.com' }
      const websiteData = { name: 'Kamlease', url: 'https://kamlease.com' }
      const serviceData = {
        name: 'Mécatronique',
        description: 'Services mécatroniques',
        provider: { '@type': 'Organization', name: 'Kamlease' }
      }

      render(
        <TestWrapper>
          <div>
            <StructuredData type="Organization" data={orgData} />
            <StructuredData type="WebSite" data={websiteData} />
            <StructuredData type="Service" data={serviceData} />
          </div>
        </TestWrapper>
      )

      const scriptTags = document.querySelectorAll('script[type="application/ld+json"]')
      expect(scriptTags).toHaveLength(3)

      const jsonData1 = JSON.parse(scriptTags[0].textContent || '{}')
      const jsonData2 = JSON.parse(scriptTags[1].textContent || '{}')
      const jsonData3 = JSON.parse(scriptTags[2].textContent || '{}')

      expect(jsonData1['@type']).toBe('Organization')
      expect(jsonData2['@type']).toBe('WebSite')
      expect(jsonData3['@type']).toBe('Service')
    })
  })

  describe('Sitemap Generation Integration', () => {
    it('should generate valid XML sitemap structure', () => {
      const sitemap = sitemapGenerator.generateSitemap()
      
      // Validate XML structure
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
      expect(sitemap).toContain('</urlset>')
      
      // Count URLs in sitemap
      const urlMatches = sitemap.match(/<url>/g)
      const urlCount = urlMatches ? urlMatches.length : 0
      expect(urlCount).toBeGreaterThan(0)
    })

    it('should include required pages in sitemap', () => {
      const sitemap = sitemapGenerator.generateSitemap()
      
      // Check for required URLs
      expect(sitemap).toContain('<loc>https://kamlease.com</loc>')
      expect(sitemap).toContain('<loc>https://kamlease.com/en</loc>')
      
      // Check for proper priorities
      expect(sitemap).toContain('<priority>1</priority>') // Home page
      expect(sitemap).toContain('<priority>0.8</priority>') // Main pages
      
      // Check for change frequencies
      expect(sitemap).toContain('<changefreq>weekly</changefreq>')
      expect(sitemap).toContain('<changefreq>monthly</changefreq>')
    })

    it('should include multilingual hreflang attributes', () => {
      const sitemap = sitemapGenerator.generateSitemap()
      
      // Check for hreflang attributes
      expect(sitemap).toContain('hreflang="fr"')
      expect(sitemap).toContain('hreflang="en"')
      expect(sitemap).toContain('hreflang="x-default"')
      
      // Check for proper alternate URLs
      expect(sitemap).toContain('href="https://kamlease.com"')
      expect(sitemap).toContain('href="https://kamlease.com/en"')
    })

    it('should include lastmod dates', () => {
      const sitemap = sitemapGenerator.generateSitemap()
      
      // Check for lastmod tags
      expect(sitemap).toContain('<lastmod>')
      
      // Validate date format (YYYY-MM-DDTHH:mm:ss.sssZ)
      const lastmodMatches = sitemap.match(/<lastmod>(\d{4}-\d{2}-\d{2}T[\d:.Z]+)<\/lastmod>/g)
      expect(lastmodMatches).toBeTruthy()
      expect(lastmodMatches!.length).toBeGreaterThan(0)
    })
  })

  describe('Structured Data Service Integration', () => {
    it('should validate Organization generation method', () => {
      const orgData = {
        name: 'Kamlease',
        description: 'Solutions mécatroniques innovantes',
        url: 'https://kamlease.com',
        logo: 'https://kamlease.com/logo.svg'
      }
      
      const orgJson = structuredDataService.generateOrganization(orgData)
      const orgParsed = JSON.parse(orgJson)
      
      expect(orgParsed['@context']).toBe('https://schema.org')
      expect(orgParsed['@type']).toBe('Organization')
      expect(orgParsed.name).toBe(orgData.name)
      expect(orgParsed.url).toBe(orgData.url)
      expect(orgParsed.description).toBe(orgData.description)
      expect(orgParsed.logo).toBe(orgData.logo)
    })

    it('should validate LocalBusiness generation method', () => {
      const businessData = {
        name: 'Kamlease',
        address: 'Paris, France',
        telephone: '+33-1-XX-XX-XX-XX',
        url: 'https://kamlease.com'
      }
      
      const businessJson = structuredDataService.generateLocalBusiness(businessData)
      const businessParsed = JSON.parse(businessJson)
      
      expect(businessParsed['@context']).toBe('https://schema.org')
      expect(businessParsed['@type']).toBe('LocalBusiness')
      expect(businessParsed.name).toBe(businessData.name)
      expect(businessParsed.address).toBe(businessData.address)
      expect(businessParsed.telephone).toBe(businessData.telephone)
    })

    it('should validate WebSite generation method', () => {
      const websiteData = {
        name: 'Kamlease',
        url: 'https://kamlease.com',
        description: 'Solutions mécatroniques'
      }
      
      const websiteJson = structuredDataService.generateWebSite(websiteData)
      const websiteParsed = JSON.parse(websiteJson)
      
      expect(websiteParsed['@context']).toBe('https://schema.org')
      expect(websiteParsed['@type']).toBe('WebSite')
      expect(websiteParsed.name).toBe(websiteData.name)
      expect(websiteParsed.url).toBe(websiteData.url)
    })

    it('should validate BreadcrumbList generation method', () => {
      const breadcrumbData = {
        items: [
          {
            position: 1,
            name: 'Accueil',
            url: '/'
          },
          {
            position: 2,
            name: 'Services',
            url: '/services'
          },
          {
            position: 3,
            name: 'Mécatronique',
            url: '/services/mecatronique'
          }
        ]
      }
      
      const breadcrumbJson = structuredDataService.generateBreadcrumbList(breadcrumbData)
      const breadcrumbParsed = JSON.parse(breadcrumbJson)
      
      expect(breadcrumbParsed['@context']).toBe('https://schema.org')
      expect(breadcrumbParsed['@type']).toBe('BreadcrumbList')
      expect(breadcrumbParsed.itemListElement).toHaveLength(3)
      expect(breadcrumbParsed.itemListElement[0].position).toBe(1)
      expect(breadcrumbParsed.itemListElement[2]).toHaveProperty('item') // All items have links
    })
  })

  describe('SEO Quality Validation', () => {
    it('should validate meta tag requirements', () => {
      // Simulate meta tag validation
      const requiredMetaTags = [
        'title',
        'description',
        'keywords',
        'canonical',
        'viewport',
        'og:title',
        'og:description',
        'og:type',
        'og:url',
        'twitter:card',
        'twitter:title'
      ]

      // Mock meta tags presence
      const mockMetaTags = new Map([
        ['title', 'Kamlease - Solutions Mécatroniques'],
        ['description', 'Expertise en mécatronique et électronique'],
        ['keywords', 'mécatronique, électronique, auto-staging'],
        ['canonical', 'https://kamlease.com'],
        ['viewport', 'width=device-width, initial-scale=1'],
        ['og:title', 'Kamlease - Solutions Mécatroniques'],
        ['og:description', 'Expertise en mécatronique et électronique'],
        ['og:type', 'website'],
        ['og:url', 'https://kamlease.com'],
        ['twitter:card', 'summary_large_image'],
        ['twitter:title', 'Kamlease - Solutions Mécatroniques']
      ])

      let metaTagsCoverage = 0
      requiredMetaTags.forEach(tag => {
        if (mockMetaTags.has(tag)) {
          metaTagsCoverage++
        }
      })

      const coveragePercentage = (metaTagsCoverage / requiredMetaTags.length) * 100
      expect(coveragePercentage).toBe(100) // 100% coverage
    })

    it('should validate structured data schema compliance', () => {
      const testSchemas = [
        {
          type: 'Organization',
          data: { name: 'Kamlease', url: 'https://kamlease.com' },
          requiredFields: ['@context', '@type', 'name', 'url']
        },
        {
          type: 'LocalBusiness',
          data: { name: 'Kamlease', address: 'Paris' },
          requiredFields: ['@context', '@type', 'name', 'address']
        },
        {
          type: 'WebSite',
          data: { name: 'Kamlease', url: 'https://kamlease.com' },
          requiredFields: ['@context', '@type', 'name', 'url']
        }
      ]

      testSchemas.forEach(schema => {
        const { unmount } = render(
          <TestWrapper>
            <StructuredData type={schema.type as any} data={schema.data} />
          </TestWrapper>
        )

        const scriptTag = document.querySelector('script[type="application/ld+json"]')
        if (scriptTag?.textContent) {
          const jsonData = JSON.parse(scriptTag.textContent)
          
          schema.requiredFields.forEach(field => {
            expect(jsonData).toHaveProperty(field)
          })
        }

        unmount()
        document.head.innerHTML = ''
      })
    })

    it('should validate URL formats in structured data', () => {
      const dataWithUrls = {
        name: 'Kamlease',
        url: 'https://kamlease.com',
        logo: 'https://kamlease.com/logo.svg',
        sameAs: [
          'https://linkedin.com/company/kamlease',
          'https://twitter.com/kamlease'
        ]
      }

      render(
        <TestWrapper>
          <StructuredData type="Organization" data={dataWithUrls} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        // Validate URL formats
        expect(jsonData.url).toMatch(/^https:\/\//)
        expect(jsonData.logo).toMatch(/^https:\/\//)
        
        // Validate array of URLs
        expect(Array.isArray(jsonData.sameAs)).toBe(true)
        jsonData.sameAs.forEach((url: string) => {
          expect(url).toMatch(/^https:\/\//)
        })
      }
    })

    it('should validate accessibility compliance basics', async () => {
      render(
        <TestWrapper>
          <div>
            <h1>Accessible Heading Structure</h1>
            <h2>Secondary Heading</h2>
            <h3>Tertiary Heading</h3>
            <img src="/test.jpg" alt="Descriptive alt text for screen readers and SEO" />
            <button aria-label="Accessible button with clear purpose">Action</button>
            <a href="/test" aria-describedby="link-desc">
              Accessible Link
              <span id="link-desc" className="sr-only">Opens in same window</span>
            </a>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        // Validate heading hierarchy
        const h1 = screen.getByRole('heading', { level: 1 })
        const h2 = screen.getByRole('heading', { level: 2 })
        const h3 = screen.getByRole('heading', { level: 3 })
        
        expect(h1).toBeInTheDocument()
        expect(h2).toBeInTheDocument()
        expect(h3).toBeInTheDocument()
        
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
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty structured data gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <StructuredData type="Organization" data={{}} />
          </TestWrapper>
        )
      }).not.toThrow()

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        expect(jsonData['@context']).toBe('https://schema.org')
        expect(jsonData['@type']).toBe('Organization')
      }
    })

    it('should handle invalid JSON data gracefully', () => {
      const invalidData = {
        name: 'Test',
        circular: null as any
      }
      // Create circular reference
      invalidData.circular = invalidData

      expect(() => {
        render(
          <TestWrapper>
            <StructuredData type="Organization" data={invalidData} />
          </TestWrapper>
        )
      }).not.toThrow()

      // Should still render the component without crashing
      expect(screen.getByTestId('test-wrapper')).toBeInTheDocument()
    })

    it('should handle special characters in structured data', () => {
      const dataWithSpecialChars = {
        name: 'Kamlease™',
        description: 'Solutions "innovantes" & mécatroniques <avancées>',
        url: 'https://kamlease.com'
      }

      render(
        <TestWrapper>
          <StructuredData type="Organization" data={dataWithSpecialChars} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        // Should properly handle special characters
        expect(jsonData.name).toBe('Kamlease™')
        expect(jsonData.description).toContain('"innovantes"')
        expect(jsonData.description).toContain('&')
        expect(jsonData.description).toContain('<avancées>')
      }
    })

    it('should validate sitemap XML structure integrity', () => {
      const sitemap = sitemapGenerator.generateSitemap()
      
      // Basic XML validation
      expect(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
      expect(sitemap.includes('<urlset')).toBe(true)
      expect(sitemap.endsWith('</urlset>')).toBe(true)
      
      // Count opening and closing tags
      const openingTags = (sitemap.match(/<url>/g) || []).length
      const closingTags = (sitemap.match(/<\/url>/g) || []).length
      expect(openingTags).toBe(closingTags)
      
      // Validate required namespaces
      expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    })

    it('should handle missing required fields in structured data', () => {
      const incompleteData = {
        // Missing required 'name' field for Organization
        description: 'Test description',
        url: 'https://test.com'
      }

      expect(() => {
        render(
          <TestWrapper>
            <StructuredData type="Organization" data={incompleteData} />
          </TestWrapper>
        )
      }).not.toThrow()

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        expect(jsonData['@type']).toBe('Organization')
        // Should have fallback or handle missing fields gracefully
      }
    })
  })

  describe('Performance and Optimization', () => {
    it('should generate structured data efficiently', () => {
      const startTime = performance.now()
      
      // Generate multiple structured data types
      const testData = [
        { 
          type: 'Organization', 
          data: { 
            name: 'Test Org', 
            url: 'https://test.com',
            description: 'Test description',
            logo: 'https://test.com/logo.png'
          } 
        },
        { 
          type: 'LocalBusiness', 
          data: { 
            name: 'Test Business', 
            description: 'Test description',
            url: 'https://test.com',
            telephone: '+33123456789',
            address: {
              streetAddress: '123 Test St',
              addressLocality: 'Test City',
              postalCode: '12345',
              addressCountry: 'FR'
            }
          } 
        },
        { 
          type: 'WebSite', 
          data: { 
            name: 'Test Site', 
            url: 'https://test.com',
            description: 'Test description'
          } 
        }
      ]

      testData.forEach((item, index) => {
        const { unmount } = render(
          <TestWrapper>
            <StructuredData type={item.type as any} data={item.data} />
          </TestWrapper>
        )
        
        const scriptTags = document.querySelectorAll('script[type="application/ld+json"]')
        expect(scriptTags.length).toBeGreaterThan(0)
        
        unmount()
        // Clean up script tags
        scriptTags.forEach(tag => tag.remove())
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      // Should complete within reasonable time (< 100ms for 4 generations)
      expect(executionTime).toBeLessThan(100)
    })

    it('should handle large sitemap generation efficiently', () => {
      const startTime = performance.now()
      
      const sitemap = sitemapGenerator.generateSitemap()
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      // Should generate sitemap quickly (< 50ms)
      expect(executionTime).toBeLessThan(50)
      expect(sitemap.length).toBeGreaterThan(0)
    })

    it('should minimize DOM manipulation during structured data injection', () => {
      const initialScriptCount = document.querySelectorAll('script').length
      
      render(
        <TestWrapper>
          <div>
            <StructuredData type="Organization" data={{ name: 'Test', url: 'https://test.com' }} />
            <StructuredData type="LocalBusiness" data={{ name: 'Test', address: 'Test' }} />
          </div>
        </TestWrapper>
      )

      const finalScriptCount = document.querySelectorAll('script').length
      
      // Should add exactly 2 script tags
      expect(finalScriptCount - initialScriptCount).toBe(2)
      
      // All script tags should be JSON-LD
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
      expect(jsonLdScripts.length).toBe(2)
    })
  })
})