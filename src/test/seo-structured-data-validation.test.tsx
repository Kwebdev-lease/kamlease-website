import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { StructuredData } from '@/components/StructuredData'
import { structuredDataService } from '@/lib/structured-data-service'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'

// Schema.org validation helpers
const validateSchemaOrgStructure = (jsonData: any, expectedType: string) => {
  expect(jsonData).toHaveProperty('@context', 'https://schema.org')
  expect(jsonData).toHaveProperty('@type', expectedType)
  return true
}

const validateOrganizationSchema = (jsonData: any) => {
  expect(jsonData).toHaveProperty('name')
  expect(jsonData).toHaveProperty('url')
  expect(typeof jsonData.name).toBe('string')
  expect(typeof jsonData.url).toBe('string')
  expect(jsonData.url).toMatch(/^https?:\/\//)
  return true
}

const validateLocalBusinessSchema = (jsonData: any) => {
  expect(jsonData).toHaveProperty('name')
  expect(jsonData).toHaveProperty('address')
  if (jsonData.telephone) {
    expect(typeof jsonData.telephone).toBe('string')
  }
  if (jsonData.geo) {
    expect(jsonData.geo).toHaveProperty('@type', 'GeoCoordinates')
    expect(jsonData.geo).toHaveProperty('latitude')
    expect(jsonData.geo).toHaveProperty('longitude')
  }
  return true
}

const validateWebSiteSchema = (jsonData: any) => {
  expect(jsonData).toHaveProperty('name')
  expect(jsonData).toHaveProperty('url')
  if (jsonData.potentialAction) {
    expect(jsonData.potentialAction).toHaveProperty('@type', 'SearchAction')
    expect(jsonData.potentialAction).toHaveProperty('target')
    expect(jsonData.potentialAction).toHaveProperty('query-input')
  }
  return true
}

const validateBreadcrumbListSchema = (jsonData: any) => {
  expect(jsonData).toHaveProperty('itemListElement')
  expect(Array.isArray(jsonData.itemListElement)).toBe(true)
  
  jsonData.itemListElement.forEach((item: any, index: number) => {
    expect(item).toHaveProperty('@type', 'ListItem')
    expect(item).toHaveProperty('position', index + 1)
    expect(item).toHaveProperty('name')
    if (index < jsonData.itemListElement.length - 1) {
      expect(item).toHaveProperty('item')
    }
  })
  return true
}

const validateServiceSchema = (jsonData: any) => {
  expect(jsonData).toHaveProperty('name')
  expect(jsonData).toHaveProperty('description')
  expect(jsonData).toHaveProperty('provider')
  if (jsonData.provider) {
    expect(jsonData.provider).toHaveProperty('@type', 'Organization')
    expect(jsonData.provider).toHaveProperty('name')
  }
  return true
}

beforeEach(() => {
  document.head.innerHTML = ''
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

describe('SEO Structured Data Validation Tests', () => {
  describe('Organization Schema Validation', () => {
    it('should generate valid Organization schema', () => {
      const organizationData = {
        name: 'Kamlease',
        description: 'Solutions innovantes en mécatronique, électronique et auto-staging',
        url: 'https://kamlease.com',
        logo: 'https://kamlease.com/assets/logos/logo.svg',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+33-X-XX-XX-XX-XX',
          contactType: 'customer service',
          availableLanguage: ['French', 'English']
        },
        sameAs: [
          'https://linkedin.com/company/kamlease'
        ]
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
        
        // Validate basic Schema.org structure
        validateSchemaOrgStructure(jsonData, 'Organization')
        
        // Validate Organization-specific fields
        validateOrganizationSchema(jsonData)
        
        // Validate additional Organization fields
        expect(jsonData.description).toBe(organizationData.description)
        expect(jsonData.logo).toBe(organizationData.logo)
        expect(jsonData.contactPoint).toEqual(organizationData.contactPoint)
        expect(jsonData.sameAs).toEqual(organizationData.sameAs)
      }
    })

    it('should handle minimal Organization data', () => {
      const minimalOrgData = {
        name: 'Kamlease',
        url: 'https://kamlease.com'
      }

      render(
        <TestWrapper>
          <StructuredData type="Organization" data={minimalOrgData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        validateSchemaOrgStructure(jsonData, 'Organization')
        validateOrganizationSchema(jsonData)
      }
    })

    it('should validate Organization with complex contact information', () => {
      const complexOrgData = {
        name: 'Kamlease',
        url: 'https://kamlease.com',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+33-1-XX-XX-XX-XX',
            contactType: 'customer service',
            availableLanguage: 'French',
            areaServed: 'FR'
          },
          {
            '@type': 'ContactPoint',
            telephone: '+33-2-XX-XX-XX-XX',
            contactType: 'technical support',
            availableLanguage: ['French', 'English'],
            areaServed: ['FR', 'EU']
          }
        ]
      }

      render(
        <TestWrapper>
          <StructuredData type="Organization" data={complexOrgData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        validateSchemaOrgStructure(jsonData, 'Organization')
        
        expect(Array.isArray(jsonData.contactPoint)).toBe(true)
        expect(jsonData.contactPoint).toHaveLength(2)
        
        jsonData.contactPoint.forEach((contact: any) => {
          expect(contact).toHaveProperty('@type', 'ContactPoint')
          expect(contact).toHaveProperty('telephone')
          expect(contact).toHaveProperty('contactType')
        })
      }
    })
  })

  describe('LocalBusiness Schema Validation', () => {
    it('should generate valid LocalBusiness schema', () => {
      const localBusinessData = {
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
        },
        openingHours: [
          'Mo-Fr 09:00-18:00'
        ],
        priceRange: '€€€'
      }

      render(
        <TestWrapper>
          <StructuredData type="LocalBusiness" data={localBusinessData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        validateSchemaOrgStructure(jsonData, 'LocalBusiness')
        validateLocalBusinessSchema(jsonData)
        
        // Validate address structure
        expect(jsonData.address).toHaveProperty('@type', 'PostalAddress')
        expect(jsonData.address).toHaveProperty('streetAddress')
        expect(jsonData.address).toHaveProperty('addressLocality')
        expect(jsonData.address).toHaveProperty('postalCode')
        expect(jsonData.address).toHaveProperty('addressCountry')
        
        // Validate geo coordinates
        expect(jsonData.geo).toHaveProperty('@type', 'GeoCoordinates')
        expect(typeof jsonData.geo.latitude).toBe('number')
        expect(typeof jsonData.geo.longitude).toBe('number')
        
        // Validate opening hours
        expect(Array.isArray(jsonData.openingHours)).toBe(true)
        expect(jsonData.openingHours[0]).toMatch(/^[A-Za-z-]+ \d{2}:\d{2}-\d{2}:\d{2}$/)
      }
    })

    it('should handle LocalBusiness without geo coordinates', () => {
      const businessData = {
        name: 'Kamlease',
        address: 'Paris, France',
        telephone: '+33-1-XX-XX-XX-XX'
      }

      render(
        <TestWrapper>
          <StructuredData type="LocalBusiness" data={businessData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        validateSchemaOrgStructure(jsonData, 'LocalBusiness')
        validateLocalBusinessSchema(jsonData)
      }
    })
  })

  describe('WebSite Schema Validation', () => {
    it('should generate valid WebSite schema with SearchAction', () => {
      const websiteData = {
        name: 'Kamlease',
        description: 'Solutions mécatroniques et électroniques innovantes',
        url: 'https://kamlease.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://kamlease.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Kamlease',
          logo: {
            '@type': 'ImageObject',
            url: 'https://kamlease.com/assets/logos/logo.svg'
          }
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
        
        validateSchemaOrgStructure(jsonData, 'WebSite')
        validateWebSiteSchema(jsonData)
        
        // Validate SearchAction
        expect(jsonData.potentialAction).toHaveProperty('@type', 'SearchAction')
        expect(jsonData.potentialAction.target).toContain('{search_term_string}')
        expect(jsonData.potentialAction['query-input']).toContain('required')
        
        // Validate publisher
        expect(jsonData.publisher).toHaveProperty('@type', 'Organization')
        expect(jsonData.publisher.logo).toHaveProperty('@type', 'ImageObject')
      }
    })

    it('should handle WebSite schema without SearchAction', () => {
      const simpleWebsiteData = {
        name: 'Kamlease',
        url: 'https://kamlease.com',
        description: 'Solutions mécatroniques'
      }

      render(
        <TestWrapper>
          <StructuredData type="WebSite" data={simpleWebsiteData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        validateSchemaOrgStructure(jsonData, 'WebSite')
        validateWebSiteSchema(jsonData)
      }
    })
  })

  describe('BreadcrumbList Schema Validation', () => {
    it('should generate valid BreadcrumbList schema', () => {
      const breadcrumbData = {
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: 'https://kamlease.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: 'https://kamlease.com/services'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Mécatronique',
            item: 'https://kamlease.com/services/mechatronique'
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Solutions Avancées'
          }
        ]
      }

      render(
        <TestWrapper>
          <StructuredData type="BreadcrumbList" data={breadcrumbData} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        
        validateSchemaOrgStructure(jsonData, 'BreadcrumbList')
        validateBreadcrumbListSchema(jsonData)
        
        // Validate that last item doesn't have 'item' property
        const lastItem = jsonData.itemListElement[jsonData.itemListElement.length - 1]
        expect(lastItem).not.toHaveProperty('item')
        expect(lastItem.name).toBe('Solutions Avancées')
      }
    })

    it('should handle single-item breadcrumb', () => {
      const singleBreadcrumb = {
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil'
          }
        ]
      }

      render(
        <TestWrapper>
          <StructuredData type="BreadcrumbList" data={singleBreadcrumb} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        validateSchemaOrgStructure(jsonData, 'BreadcrumbList')
        validateBreadcrumbListSchema(jsonData)
        expect(jsonData.itemListElement).toHaveLength(1)
      }
    })
  })

  describe('Service Schema Validation', () => {
    it('should generate valid Service schema', () => {
      const serviceData = {
        name: 'Solutions Mécatroniques',
        description: 'Développement de solutions mécatroniques innovantes pour l\'industrie automobile et électronique',
        provider: {
          '@type': 'Organization',
          name: 'Kamlease',
          url: 'https://kamlease.com'
        },
        serviceType: 'Mécatronique',
        areaServed: {
          '@type': 'Country',
          name: 'France'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services Mécatroniques',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Conception mécatronique'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Prototypage électronique'
              }
            }
          ]
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
        
        validateSchemaOrgStructure(jsonData, 'Service')
        validateServiceSchema(jsonData)
        
        // Validate service-specific fields
        expect(jsonData.serviceType).toBe('Mécatronique')
        expect(jsonData.areaServed).toHaveProperty('@type', 'Country')
        expect(jsonData.hasOfferCatalog).toHaveProperty('@type', 'OfferCatalog')
        expect(Array.isArray(jsonData.hasOfferCatalog.itemListElement)).toBe(true)
        
        // Validate offers
        jsonData.hasOfferCatalog.itemListElement.forEach((offer: any) => {
          expect(offer).toHaveProperty('@type', 'Offer')
          expect(offer.itemOffered).toHaveProperty('@type', 'Service')
          expect(offer.itemOffered).toHaveProperty('name')
        })
      }
    })

    it('should handle minimal Service schema', () => {
      const minimalService = {
        name: 'Électronique Industrielle',
        description: 'Services d\'électronique industrielle',
        provider: {
          '@type': 'Organization',
          name: 'Kamlease'
        }
      }

      render(
        <TestWrapper>
          <StructuredData type="Service" data={minimalService} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        validateSchemaOrgStructure(jsonData, 'Service')
        validateServiceSchema(jsonData)
      }
    })
  })

  describe('Multiple Structured Data Validation', () => {
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

    it('should validate structured data service methods', () => {
      // Test Organization generation
      const orgData = { name: 'Kamlease', url: 'https://kamlease.com' }
      const orgJson = structuredDataService.generateOrganization(orgData)
      const orgParsed = JSON.parse(orgJson)
      
      validateSchemaOrgStructure(orgParsed, 'Organization')
      validateOrganizationSchema(orgParsed)

      // Test LocalBusiness generation
      const businessData = { name: 'Kamlease', address: 'Paris', telephone: '+33-1-XX' }
      const businessJson = structuredDataService.generateLocalBusiness(businessData)
      const businessParsed = JSON.parse(businessJson)
      
      validateSchemaOrgStructure(businessParsed, 'LocalBusiness')
      validateLocalBusinessSchema(businessParsed)

      // Test WebSite generation
      const websiteData = { name: 'Kamlease', url: 'https://kamlease.com' }
      const websiteJson = structuredDataService.generateWebSite(websiteData)
      const websiteParsed = JSON.parse(websiteJson)
      
      validateSchemaOrgStructure(websiteParsed, 'WebSite')
      validateWebSiteSchema(websiteParsed)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty data gracefully', () => {
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
    })

    it('should validate required fields for each schema type', () => {
      // Organization requires name and url
      const incompleteOrg = { description: 'Test' }
      
      render(
        <TestWrapper>
          <StructuredData type="Organization" data={incompleteOrg} />
        </TestWrapper>
      )

      const scriptTag = document.querySelector('script[type="application/ld+json"]')
      if (scriptTag?.textContent) {
        const jsonData = JSON.parse(scriptTag.textContent)
        // Should have fallback values or handle missing required fields
        expect(jsonData['@type']).toBe('Organization')
      }
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
        
        // Should properly escape special characters
        expect(jsonData.name).toBe('Kamlease™')
        expect(jsonData.description).toContain('"innovantes"')
        expect(jsonData.description).toContain('&')
        expect(jsonData.description).toContain('<avancées>')
      }
    })

    it('should validate URL formats in structured data', () => {
      const dataWithUrls = {
        name: 'Kamlease',
        url: 'https://kamlease.com',
        logo: 'https://kamlease.com/logo.svg',
        sameAs: [
          'https://linkedin.com/company/kamlease',
          'https://twitter.com/kamlease',
          'invalid-url'
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
        
        // Valid URLs should be preserved
        expect(jsonData.url).toMatch(/^https:\/\//)
        expect(jsonData.logo).toMatch(/^https:\/\//)
        
        // Should handle array of URLs
        expect(Array.isArray(jsonData.sameAs)).toBe(true)
        jsonData.sameAs.forEach((url: string) => {
          if (url !== 'invalid-url') {
            expect(url).toMatch(/^https:\/\//)
          }
        })
      }
    })
  })
})