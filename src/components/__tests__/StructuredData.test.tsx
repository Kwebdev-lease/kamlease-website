import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  StructuredData,
  KamleaseOrganization,
  KamleaseLocalBusiness,
  KamleaseWebSite,
  KamleaseServices,
  BreadcrumbStructuredData,
  KamleaseCompleteStructuredData
} from '../StructuredData'
import { StructuredDataService } from '../../lib/structured-data-service'

// Mock console methods to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('StructuredData Component', () => {
  beforeEach(() => {
    consoleSpy.mockClear()
    consoleErrorSpy.mockClear()
  })

  describe('StructuredData', () => {
    it('should render Organization structured data', () => {
      const { container } = render(
        <StructuredData type="Organization" language="fr" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('Organization')
      expect(jsonLd.name).toBe('Kamlease')
    })

    it('should render WebSite structured data', () => {
      const { container } = render(
        <StructuredData type="WebSite" language="fr" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('WebSite')
      expect(jsonLd.name).toBe('Kamlease')
      expect(jsonLd.potentialAction['@type']).toBe('SearchAction')
    })

    it('should render Service structured data', () => {
      const serviceData = {
        name: 'Test Service',
        description: 'Test Description',
        provider: {
          name: 'Kamlease',
          url: 'https://kamlease.com'
        },
        serviceType: 'Test Type'
      }

      const { container } = render(
        <StructuredData type="Service" data={serviceData} language="fr" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('Service')
      expect(jsonLd.name).toBe('Test Service')
      expect(jsonLd.provider['@type']).toBe('Organization')
    })

    it('should render BreadcrumbList structured data', () => {
      const breadcrumbData = {
        items: [
          { name: 'Home', url: '/', position: 1 },
          { name: 'About', url: '/about', position: 2 }
        ]
      }

      const { container } = render(
        <StructuredData type="BreadcrumbList" data={breadcrumbData} />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('BreadcrumbList')
      expect(jsonLd.itemListElement).toHaveLength(2)
    })

    it('should render multiple structured data types', () => {
      const multiple = [
        { type: 'Organization' as const, data: {}, language: 'fr' as const },
        { type: 'WebSite' as const, language: 'fr' as const }
      ]

      const { container } = render(
        <StructuredData multiple={multiple} />
      )

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts).toHaveLength(2)
      
      const orgData = JSON.parse(scripts[0]?.innerHTML || '{}')
      const websiteData = JSON.parse(scripts[1]?.innerHTML || '{}')
      
      expect(orgData['@type']).toBe('Organization')
      expect(websiteData['@type']).toBe('WebSite')
    })

    it('should handle unsupported type gracefully', () => {
      const { container } = render(
        <StructuredData type="UnsupportedType" as any />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeFalsy()
      expect(consoleSpy).toHaveBeenCalledWith('StructuredData: Unsupported type UnsupportedType')
    })

    it('should handle missing type gracefully', () => {
      const { container } = render(
        <StructuredData />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeFalsy()
      expect(consoleSpy).toHaveBeenCalledWith('StructuredData: No type or multiple configs provided')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <StructuredData type="Organization" className="custom-structured-data" />
      )

      const script = container.querySelector('script.custom-structured-data')
      expect(script).toBeTruthy()
    })
  })

  describe('KamleaseOrganization', () => {
    it('should render Kamlease Organization data', () => {
      const { container } = render(
        <KamleaseOrganization language="fr" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('Organization')
      expect(jsonLd.name).toBe('Kamlease')
      expect(jsonLd.description).toContain('mécatronique')
    })

    it('should include contact information when provided', () => {
      const contactInfo = {
        telephone: '+33123456789',
        email: 'contact@kamlease.com'
      }

      const { container } = render(
        <KamleaseOrganization contactInfo={contactInfo} />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      
      expect(jsonLd.contactPoint.telephone).toBe('+33123456789')
      expect(jsonLd.contactPoint.email).toBe('contact@kamlease.com')
    })

    it('should include address when provided', () => {
      const address = {
        streetAddress: '109 Rue Maréchal Joffre',
        addressLocality: 'La Ferté-Saint-Aubin',
        postalCode: '45240',
        addressCountry: 'FR'
      }

      const { container } = render(
        <KamleaseOrganization address={address} />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      
      expect(jsonLd.address).toEqual(address)
    })
  })

  describe('KamleaseLocalBusiness', () => {
    it('should render Kamlease LocalBusiness data', () => {
      const { container } = render(
        <KamleaseLocalBusiness language="fr" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('LocalBusiness')
      expect(jsonLd.name).toBe('Kamlease')
      expect(jsonLd.priceRange).toBe('€€€')
    })

    it('should include geo coordinates when provided', () => {
      const geo = {
        latitude: 48.8566,
        longitude: 2.3522
      }

      const { container } = render(
        <KamleaseLocalBusiness geo={geo} />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      
      expect(jsonLd.geo).toEqual(geo)
    })

    it('should include opening hours when provided', () => {
      const openingHours = ['Mo-Fr 09:00-18:00']

      const { container } = render(
        <KamleaseLocalBusiness openingHours={openingHours} />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      
      expect(jsonLd.openingHours).toEqual(openingHours)
    })
  })

  describe('KamleaseWebSite', () => {
    it('should render Kamlease WebSite data', () => {
      const { container } = render(
        <KamleaseWebSite language="fr" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('WebSite')
      expect(jsonLd.name).toBe('Kamlease')
      expect(jsonLd.potentialAction['@type']).toBe('SearchAction')
    })

    it('should render in English when specified', () => {
      const { container } = render(
        <KamleaseWebSite language="en" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      
      expect(jsonLd.description).toContain('mechatronics')
      expect(jsonLd.description).not.toContain('mécatronique')
    })
  })

  describe('KamleaseServices', () => {
    it('should render predefined Kamlease services', () => {
      const { container } = render(
        <KamleaseServices language="fr" />
      )

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts).toHaveLength(3) // 3 predefined services
      
      const firstService = JSON.parse(scripts[0]?.innerHTML || '{}')
      expect(firstService['@type']).toBe('Service')
      expect(firstService.name).toBe('Solutions Mécatroniques')
      expect(firstService.provider.name).toBe('Kamlease')
    })

    it('should render custom services when provided', () => {
      const customServices = [
        {
          name: 'Custom Service',
          description: 'Custom Description',
          provider: {
            name: 'Kamlease',
            url: 'https://kamlease.com'
          },
          serviceType: 'Custom Type'
        }
      ]

      const { container } = render(
        <KamleaseServices customServices={customServices} />
      )

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts).toHaveLength(1)
      
      const service = JSON.parse(scripts[0]?.innerHTML || '{}')
      expect(service.name).toBe('Custom Service')
    })

    it('should render services in English', () => {
      const { container } = render(
        <KamleaseServices language="en" />
      )

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const firstService = JSON.parse(scripts[0]?.innerHTML || '{}')
      
      expect(firstService.name).toBe('Mechatronics Solutions')
      expect(firstService.description).toContain('mechatronics')
    })
  })

  describe('BreadcrumbStructuredData', () => {
    it('should render breadcrumb structured data', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
        { name: 'Services', url: '/services' }
      ]

      const { container } = render(
        <BreadcrumbStructuredData items={items} />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
      
      const jsonLd = JSON.parse(script?.innerHTML || '{}')
      expect(jsonLd['@type']).toBe('BreadcrumbList')
      expect(jsonLd.itemListElement).toHaveLength(3)
      
      const firstItem = jsonLd.itemListElement[0]
      expect(firstItem.position).toBe(1)
      expect(firstItem.name).toBe('Home')
      expect(firstItem.item).toBe('https://kamlease.com/')
    })
  })

  describe('KamleaseCompleteStructuredData', () => {
    it('should render complete structured data with services', () => {
      const { container } = render(
        <KamleaseCompleteStructuredData language="fr" includeServices={true} />
      )

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(2) // Organization + WebSite + Services
      
      const types = Array.from(scripts).map(script => {
        const jsonLd = JSON.parse(script.innerHTML)
        return jsonLd['@type']
      })
      
      expect(types).toContain('Organization')
      expect(types).toContain('WebSite')
      expect(types).toContain('Service')
    })

    it('should render without services when specified', () => {
      const { container } = render(
        <KamleaseCompleteStructuredData includeServices={false} />
      )

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts).toHaveLength(2) // Only Organization + WebSite
      
      const types = Array.from(scripts).map(script => {
        const jsonLd = JSON.parse(script.innerHTML)
        return jsonLd['@type']
      })
      
      expect(types).toContain('Organization')
      expect(types).toContain('WebSite')
      expect(types).not.toContain('Service')
    })

    it('should include contact info and address when provided', () => {
      const contactInfo = {
        telephone: '+33123456789',
        email: 'contact@kamlease.com'
      }
      
      const address = {
        streetAddress: '109 Rue Maréchal Joffre',
        addressLocality: 'La Ferté-Saint-Aubin',
        postalCode: '45240',
        addressCountry: 'FR'
      }

      const { container } = render(
        <KamleaseCompleteStructuredData 
          contactInfo={contactInfo}
          address={address}
          includeServices={false}
        />
      )

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const orgScript = Array.from(scripts).find(script => {
        const jsonLd = JSON.parse(script.innerHTML)
        return jsonLd['@type'] === 'Organization'
      })
      
      expect(orgScript).toBeTruthy()
      const orgData = JSON.parse(orgScript!.innerHTML)
      expect(orgData.contactPoint.telephone).toBe('+33123456789')
      expect(orgData.address).toEqual(address)
    })
  })

  describe('Error Handling', () => {
    it('should handle service generation errors gracefully', () => {
      // Mock the service to throw an error
      const originalService = StructuredDataService.getInstance()
      const mockService = {
        ...originalService,
        generateOrganization: vi.fn().mockImplementation(() => {
          throw new Error('Test error')
        })
      }
      
      // Replace the singleton instance temporarily
      vi.spyOn(StructuredDataService, 'getInstance').mockReturnValue(mockService as any)

      const { container } = render(
        <StructuredData type="Organization" />
      )

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeFalsy()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StructuredData: Error generating structured data:',
        expect.any(Error)
      )

      // Restore the original implementation
      vi.restoreAllMocks()
    })
  })
})