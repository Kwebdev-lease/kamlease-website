import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from '../contexts/LanguageProvider'
import { SEOHead } from '../components/SEOHead'
import { 
  KamleaseCompleteStructuredData,
  BreadcrumbStructuredData,
  KamleaseServices 
} from '../components/StructuredData'
import { pagesSEOData } from '../lib/seo-config'

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HelmetProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </HelmetProvider>
)

describe('Structured Data Integration', () => {
  describe('SEOHead with Structured Data', () => {
    it('should render SEOHead with default structured data', () => {
      const { container } = render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      // Check for structured data scripts
      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(structuredDataScripts.length).toBeGreaterThan(0)

      // Verify Organization structured data
      const organizationScript = Array.from(structuredDataScripts).find(script => {
        const data = JSON.parse(script.innerHTML)
        return data['@type'] === 'Organization'
      })
      expect(organizationScript).toBeTruthy()

      if (organizationScript) {
        const orgData = JSON.parse(organizationScript.innerHTML)
        expect(orgData['@context']).toBe('https://schema.org')
        expect(orgData.name).toBe('Kamlease')
        expect(orgData.url).toBe('https://kamlease.com')
      }

      // Verify WebSite structured data
      const websiteScript = Array.from(structuredDataScripts).find(script => {
        const data = JSON.parse(script.innerHTML)
        return data['@type'] === 'WebSite'
      })
      expect(websiteScript).toBeTruthy()

      if (websiteScript) {
        const websiteData = JSON.parse(websiteScript.innerHTML)
        expect(websiteData['@context']).toBe('https://schema.org')
        expect(websiteData.name).toBe('Kamlease')
        expect(websiteData.potentialAction['@type']).toBe('SearchAction')
      }
    })

    it('should render SEOHead with custom structured data', () => {
      const customStructuredData = [
        {
          type: 'Service' as const,
          data: {
            name: 'Test Service',
            description: 'Test Description',
            provider: {
              name: 'Kamlease',
              url: 'https://kamlease.com'
            },
            serviceType: 'Testing'
          },
          language: 'fr' as const
        }
      ]

      const { container } = render(
        <TestWrapper>
          <SEOHead 
            pageData={pagesSEOData.home} 
            structuredData={customStructuredData}
          />
        </TestWrapper>
      )

      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      // Should have default + custom structured data
      expect(structuredDataScripts.length).toBeGreaterThan(2)

      // Verify custom Service structured data
      const serviceScript = Array.from(structuredDataScripts).find(script => {
        const data = JSON.parse(script.innerHTML)
        return data['@type'] === 'Service' && data.name === 'Test Service'
      })
      expect(serviceScript).toBeTruthy()

      if (serviceScript) {
        const serviceData = JSON.parse(serviceScript.innerHTML)
        expect(serviceData.description).toBe('Test Description')
        expect(serviceData.provider.name).toBe('Kamlease')
      }
    })

    it('should disable default structured data when specified', () => {
      const { container } = render(
        <TestWrapper>
          <SEOHead 
            pageData={pagesSEOData.home} 
            includeDefaultStructuredData={false}
          />
        </TestWrapper>
      )

      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(structuredDataScripts.length).toBe(0)
    })
  })

  describe('Standalone Structured Data Components', () => {
    it('should render KamleaseCompleteStructuredData', () => {
      const { container } = render(
        <TestWrapper>
          <KamleaseCompleteStructuredData 
            language="fr"
            includeServices={true}
            contactInfo={{
              telephone: '+33123456789',
              email: 'contact@kamlease.com'
            }}
          />
        </TestWrapper>
      )

      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(structuredDataScripts.length).toBeGreaterThan(3) // Organization + WebSite + Services

      // Check Organization with contact info
      const organizationScript = Array.from(structuredDataScripts).find(script => {
        const data = JSON.parse(script.innerHTML)
        return data['@type'] === 'Organization'
      })
      expect(organizationScript).toBeTruthy()

      if (organizationScript) {
        const orgData = JSON.parse(organizationScript.innerHTML)
        expect(orgData.contactPoint.telephone).toBe('+33123456789')
        expect(orgData.contactPoint.email).toBe('contact@kamlease.com')
      }

      // Check Services
      const serviceScripts = Array.from(structuredDataScripts).filter(script => {
        const data = JSON.parse(script.innerHTML)
        return data['@type'] === 'Service'
      })
      expect(serviceScripts.length).toBe(3) // 3 predefined services
    })

    it('should render BreadcrumbStructuredData', () => {
      const breadcrumbItems = [
        { name: 'Accueil', url: '/' },
        { name: 'À propos', url: '/about' },
        { name: 'Contact', url: '/contact' }
      ]

      const { container } = render(
        <TestWrapper>
          <BreadcrumbStructuredData items={breadcrumbItems} />
        </TestWrapper>
      )

      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(structuredDataScripts.length).toBe(1)

      const breadcrumbScript = structuredDataScripts[0]
      const breadcrumbData = JSON.parse(breadcrumbScript.innerHTML)
      
      expect(breadcrumbData['@type']).toBe('BreadcrumbList')
      expect(breadcrumbData.itemListElement).toHaveLength(3)
      expect(breadcrumbData.itemListElement[0].name).toBe('Accueil')
      expect(breadcrumbData.itemListElement[0].position).toBe(1)
      expect(breadcrumbData.itemListElement[0].item).toBe('https://kamlease.com/')
    })

    it('should render KamleaseServices', () => {
      const { container } = render(
        <TestWrapper>
          <KamleaseServices language="fr" />
        </TestWrapper>
      )

      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(structuredDataScripts.length).toBe(3) // 3 predefined services

      structuredDataScripts.forEach(script => {
        const serviceData = JSON.parse(script.innerHTML)
        expect(serviceData['@type']).toBe('Service')
        expect(serviceData.provider.name).toBe('Kamlease')
        expect(serviceData.areaServed).toContain('France')
        expect(serviceData.areaServed).toContain('Europe')
      })

      // Check specific services
      const serviceNames = Array.from(structuredDataScripts).map(script => {
        const data = JSON.parse(script.innerHTML)
        return data.name
      })
      
      expect(serviceNames).toContain('Solutions Mécatroniques')
      expect(serviceNames).toContain('Électronique Industrielle')
      expect(serviceNames).toContain('Auto-staging')
    })
  })

  describe('Multi-language Support', () => {
    it('should render structured data in English', () => {
      const { container } = render(
        <TestWrapper>
          <KamleaseCompleteStructuredData 
            language="en"
            includeServices={true}
          />
        </TestWrapper>
      )

      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      // Check Organization description in English
      const organizationScript = Array.from(structuredDataScripts).find(script => {
        const data = JSON.parse(script.innerHTML)
        return data['@type'] === 'Organization'
      })
      
      if (organizationScript) {
        const orgData = JSON.parse(organizationScript.innerHTML)
        expect(orgData.description).toContain('mechatronics')
        expect(orgData.description).not.toContain('mécatronique')
      }

      // Check Services in English
      const serviceScripts = Array.from(structuredDataScripts).filter(script => {
        const data = JSON.parse(script.innerHTML)
        return data['@type'] === 'Service'
      })
      
      const serviceNames = serviceScripts.map(script => {
        const data = JSON.parse(script.innerHTML)
        return data.name
      })
      
      expect(serviceNames).toContain('Mechatronics Solutions')
      expect(serviceNames).toContain('Industrial Electronics')
      expect(serviceNames).toContain('Auto-staging')
    })
  })

  describe('Schema Validation', () => {
    it('should generate valid JSON-LD for all structured data types', () => {
      const { container } = render(
        <TestWrapper>
          <KamleaseCompleteStructuredData 
            language="fr"
            includeServices={true}
          />
          <BreadcrumbStructuredData items={[
            { name: 'Home', url: '/' },
            { name: 'About', url: '/about' }
          ]} />
        </TestWrapper>
      )

      const structuredDataScripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      structuredDataScripts.forEach(script => {
        // Should be valid JSON
        expect(() => JSON.parse(script.innerHTML)).not.toThrow()
        
        const data = JSON.parse(script.innerHTML)
        
        // Should have required Schema.org properties
        expect(data['@context']).toBe('https://schema.org')
        expect(data['@type']).toBeDefined()
        
        // Type-specific validations
        if (data['@type'] === 'Organization') {
          expect(data.name).toBeDefined()
          expect(data.url).toBeDefined()
        } else if (data['@type'] === 'WebSite') {
          expect(data.name).toBeDefined()
          expect(data.url).toBeDefined()
          expect(data.potentialAction).toBeDefined()
        } else if (data['@type'] === 'Service') {
          expect(data.name).toBeDefined()
          expect(data.description).toBeDefined()
          expect(data.provider).toBeDefined()
        } else if (data['@type'] === 'BreadcrumbList') {
          expect(data.itemListElement).toBeDefined()
          expect(Array.isArray(data.itemListElement)).toBe(true)
        }
      })
    })
  })
})