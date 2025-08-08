import { describe, it, expect, beforeEach } from 'vitest'
import { 
  StructuredDataService, 
  OrganizationData, 
  LocalBusinessData, 
  ServiceData, 
  BreadcrumbData,
  StructuredDataConfig
} from '../structured-data-service'

describe('StructuredDataService', () => {
  let service: StructuredDataService

  beforeEach(() => {
    service = StructuredDataService.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StructuredDataService.getInstance()
      const instance2 = StructuredDataService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('generateOrganization', () => {
    it('should generate valid Organization structured data', () => {
      const result = service.generateOrganization()
      const parsed = JSON.parse(result)

      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('Organization')
      expect(parsed.name).toBe('Kamlease')
      expect(parsed.description).toContain('mécatronique')
      expect(parsed.url).toBe('https://kamlease.com')
      expect(parsed.logo).toContain('Logo Black for white background.svg')
      expect(parsed.contactPoint).toBeDefined()
      expect(parsed.contactPoint.contactType).toBe('customer service')
      expect(parsed.contactPoint.availableLanguage).toContain('French')
      expect(parsed.contactPoint.availableLanguage).toContain('English')
      expect(parsed.sameAs).toContain('https://linkedin.com/company/kamlease')
      expect(parsed.foundingDate).toBe('1990')
      expect(parsed.numberOfEmployees).toBe('10-50')
    })

    it('should generate Organization data in English', () => {
      const result = service.generateOrganization({}, 'en')
      const parsed = JSON.parse(result)

      expect(parsed.description).toContain('mechatronics')
      expect(parsed.description).not.toContain('mécatronique')
    })

    it('should merge custom data with defaults', () => {
      const customData: Partial<OrganizationData> = {
        contactPoint: {
          telephone: '+33123456789',
          email: 'contact@kamlease.com',
          contactType: 'customer service',
          availableLanguage: ['French', 'English']
        },
        address: {
          streetAddress: '109 Rue Maréchal Joffre',
          addressLocality: 'La Ferté-Saint-Aubin',
          postalCode: '45240',
          addressCountry: 'FR'
        }
      }

      const result = service.generateOrganization(customData)
      const parsed = JSON.parse(result)

      expect(parsed.contactPoint.telephone).toBe('+33123456789')
      expect(parsed.contactPoint.email).toBe('contact@kamlease.com')
      expect(parsed.address).toBeDefined()
      expect(parsed.address.streetAddress).toBe('109 Rue Maréchal Joffre')
    })
  })

  describe('generateLocalBusiness', () => {
    it('should generate valid LocalBusiness structured data', () => {
      const result = service.generateLocalBusiness()
      const parsed = JSON.parse(result)

      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('LocalBusiness')
      expect(parsed.name).toBe('Kamlease')
      expect(parsed.priceRange).toBe('€€€')
      expect(parsed.areaServed).toContain('France')
      expect(parsed.areaServed).toContain('Europe')
    })

    it('should include geo coordinates when provided', () => {
      const customData: Partial<LocalBusinessData> = {
        geo: {
          latitude: 48.8566,
          longitude: 2.3522
        }
      }

      const result = service.generateLocalBusiness(customData)
      const parsed = JSON.parse(result)

      expect(parsed.geo).toBeDefined()
      expect(parsed.geo.latitude).toBe(48.8566)
      expect(parsed.geo.longitude).toBe(2.3522)
    })
  })

  describe('generateWebSite', () => {
    it('should generate valid WebSite structured data', () => {
      const result = service.generateWebSite()
      const parsed = JSON.parse(result)

      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('WebSite')
      expect(parsed.name).toBe('Kamlease')
      expect(parsed.url).toBe('https://kamlease.com')
      expect(parsed.publisher).toBeDefined()
      expect(parsed.publisher.name).toBe('Kamlease')
      expect(parsed.potentialAction).toBeDefined()
      expect(parsed.potentialAction['@type']).toBe('SearchAction')
      expect(parsed.potentialAction.target).toContain('/search?q=')
      expect(parsed.inLanguage).toContain('fr')
      expect(parsed.inLanguage).toContain('en')
    })

    it('should generate WebSite data in English', () => {
      const result = service.generateWebSite('en')
      const parsed = JSON.parse(result)

      expect(parsed.description).toContain('mechatronics')
    })
  })

  describe('generateService', () => {
    it('should generate valid Service structured data', () => {
      const serviceData: ServiceData = {
        name: 'Solutions Mécatroniques',
        description: 'Conception et développement de solutions mécatroniques innovantes',
        provider: {
          name: 'Kamlease',
          url: 'https://kamlease.com'
        },
        serviceType: 'Ingénierie Mécatronique',
        category: 'Mécatronique'
      }

      const result = service.generateService(serviceData)
      const parsed = JSON.parse(result)

      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('Service')
      expect(parsed.name).toBe('Solutions Mécatroniques')
      expect(parsed.description).toContain('mécatroniques')
      expect(parsed.provider['@type']).toBe('Organization')
      expect(parsed.provider.name).toBe('Kamlease')
      expect(parsed.serviceType).toBe('Ingénierie Mécatronique')
      expect(parsed.category).toBe('Mécatronique')
      expect(parsed.areaServed).toContain('France')
      expect(parsed.areaServed).toContain('Europe')
    })
  })

  describe('generateBreadcrumbList', () => {
    it('should generate valid BreadcrumbList structured data', () => {
      const breadcrumbData: BreadcrumbData = {
        items: [
          { name: 'Accueil', url: '/', position: 1 },
          { name: 'À propos', url: '/about', position: 2 },
          { name: 'Services', url: '/services', position: 3 }
        ]
      }

      const result = service.generateBreadcrumbList(breadcrumbData)
      const parsed = JSON.parse(result)

      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('BreadcrumbList')
      expect(parsed.itemListElement).toHaveLength(3)
      
      const firstItem = parsed.itemListElement[0]
      expect(firstItem['@type']).toBe('ListItem')
      expect(firstItem.position).toBe(1)
      expect(firstItem.name).toBe('Accueil')
      expect(firstItem.item).toBe('https://kamlease.com/')
    })
  })

  describe('generateMultiple', () => {
    it('should generate multiple structured data types', () => {
      const configs: StructuredDataConfig[] = [
        { type: 'Organization', data: {}, language: 'fr' },
        { type: 'WebSite', language: 'fr' }
      ]

      const results = service.generateMultiple(configs)
      
      expect(results).toHaveLength(2)
      
      const orgData = JSON.parse(results[0])
      const websiteData = JSON.parse(results[1])
      
      expect(orgData['@type']).toBe('Organization')
      expect(websiteData['@type']).toBe('WebSite')
    })

    it('should throw error for unsupported type', () => {
      const configs: StructuredDataConfig[] = [
        { type: 'UnsupportedType' as any, data: {} }
      ]

      expect(() => service.generateMultiple(configs)).toThrow('Unsupported structured data type')
    })
  })

  describe('validateStructuredData', () => {
    it('should validate correct JSON-LD structure', () => {
      const validJsonLd = service.generateOrganization()
      expect(service.validateStructuredData(validJsonLd)).toBe(true)
    })

    it('should reject invalid JSON', () => {
      const invalidJson = '{ invalid json }'
      expect(service.validateStructuredData(invalidJson)).toBe(false)
    })

    it('should reject JSON without @context', () => {
      const invalidStructure = JSON.stringify({
        '@type': 'Organization',
        name: 'Test'
      })
      expect(service.validateStructuredData(invalidStructure)).toBe(false)
    })

    it('should reject JSON without @type', () => {
      const invalidStructure = JSON.stringify({
        '@context': 'https://schema.org',
        name: 'Test'
      })
      expect(service.validateStructuredData(invalidStructure)).toBe(false)
    })

    it('should reject JSON with wrong @context', () => {
      const invalidStructure = JSON.stringify({
        '@context': 'https://example.com',
        '@type': 'Organization',
        name: 'Test'
      })
      expect(service.validateStructuredData(invalidStructure)).toBe(false)
    })
  })

  describe('getKamleaseServices', () => {
    it('should return predefined services in French', () => {
      const services = service.getKamleaseServices('fr')
      
      expect(services).toHaveLength(3)
      expect(services[0].name).toBe('Solutions Mécatroniques')
      expect(services[1].name).toBe('Électronique Industrielle')
      expect(services[2].name).toBe('Auto-staging')
      
      services.forEach(service => {
        expect(service.provider.name).toBe('Kamlease')
        expect(service.provider.url).toBe('https://kamlease.com')
        expect(service.areaServed).toContain('France')
        expect(service.areaServed).toContain('Europe')
      })
    })

    it('should return predefined services in English', () => {
      const services = service.getKamleaseServices('en')
      
      expect(services).toHaveLength(3)
      expect(services[0].name).toBe('Mechatronics Solutions')
      expect(services[1].name).toBe('Industrial Electronics')
      expect(services[2].name).toBe('Auto-staging')
    })
  })

  describe('JSON-LD Schema Validation', () => {
    it('should generate schema-compliant Organization data', () => {
      const result = service.generateOrganization()
      const parsed = JSON.parse(result)

      // Required Organization properties
      expect(parsed.name).toBeDefined()
      expect(parsed.url).toBeDefined()
      
      // Optional but recommended properties
      expect(parsed.description).toBeDefined()
      expect(parsed.logo).toBeDefined()
      expect(parsed.contactPoint).toBeDefined()
      expect(parsed.sameAs).toBeDefined()
    })

    it('should generate schema-compliant LocalBusiness data', () => {
      const result = service.generateLocalBusiness()
      const parsed = JSON.parse(result)

      // LocalBusiness extends Organization
      expect(parsed.name).toBeDefined()
      expect(parsed.url).toBeDefined()
      
      // LocalBusiness specific properties
      expect(parsed.areaServed).toBeDefined()
      expect(parsed.priceRange).toBeDefined()
    })

    it('should generate schema-compliant WebSite data', () => {
      const result = service.generateWebSite()
      const parsed = JSON.parse(result)

      // Required WebSite properties
      expect(parsed.name).toBeDefined()
      expect(parsed.url).toBeDefined()
      
      // Recommended properties
      expect(parsed.description).toBeDefined()
      expect(parsed.publisher).toBeDefined()
      expect(parsed.inLanguage).toBeDefined()
      expect(parsed.potentialAction).toBeDefined()
      expect(parsed.potentialAction['@type']).toBe('SearchAction')
    })

    it('should generate schema-compliant Service data', () => {
      const serviceData: ServiceData = {
        name: 'Test Service',
        description: 'Test Description',
        provider: {
          name: 'Kamlease',
          url: 'https://kamlease.com'
        },
        serviceType: 'Test Type'
      }

      const result = service.generateService(serviceData)
      const parsed = JSON.parse(result)

      // Required Service properties
      expect(parsed.name).toBeDefined()
      expect(parsed.description).toBeDefined()
      expect(parsed.provider).toBeDefined()
      expect(parsed.provider['@type']).toBe('Organization')
      expect(parsed.serviceType).toBeDefined()
    })

    it('should generate schema-compliant BreadcrumbList data', () => {
      const breadcrumbData: BreadcrumbData = {
        items: [
          { name: 'Home', url: '/', position: 1 },
          { name: 'About', url: '/about', position: 2 }
        ]
      }

      const result = service.generateBreadcrumbList(breadcrumbData)
      const parsed = JSON.parse(result)

      // Required BreadcrumbList properties
      expect(parsed.itemListElement).toBeDefined()
      expect(Array.isArray(parsed.itemListElement)).toBe(true)
      
      parsed.itemListElement.forEach((item: any) => {
        expect(item['@type']).toBe('ListItem')
        expect(item.position).toBeDefined()
        expect(item.name).toBeDefined()
        expect(item.item).toBeDefined()
      })
    })
  })
})