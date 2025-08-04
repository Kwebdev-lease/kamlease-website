import { seoConfig } from './seo-config'
import { Language } from './translations'

export type StructuredDataType = 
  | 'Organization'
  | 'LocalBusiness' 
  | 'WebSite'
  | 'Service'
  | 'BreadcrumbList'
  | 'Person'

export interface StructuredDataConfig {
  type: StructuredDataType
  data: any
  language?: Language
}

export interface OrganizationData {
  name: string
  description: string
  url: string
  logo: string
  contactPoint?: {
    telephone?: string
    email?: string
    contactType: string
    availableLanguage: string[]
  }
  address?: {
    streetAddress: string
    addressLocality: string
    postalCode: string
    addressCountry: string
  }
  sameAs?: string[]
  foundingDate?: string
  numberOfEmployees?: string
}

export interface LocalBusinessData extends OrganizationData {
  priceRange?: string
  openingHours?: string[]
  geo?: {
    latitude: number
    longitude: number
  }
  areaServed?: string[]
}

export interface WebSiteData {
  name: string
  url: string
  description: string
  publisher: {
    name: string
    logo: string
  }
  potentialAction?: {
    target: string
    queryInput: string
  }
  inLanguage: string[]
}

export interface ServiceData {
  name: string
  description: string
  provider: {
    name: string
    url: string
  }
  serviceType: string
  areaServed?: string[]
  category?: string
}

export interface BreadcrumbData {
  items: Array<{
    name: string
    url: string
    position: number
  }>
}

export class StructuredDataService {
  private static instance: StructuredDataService
  
  public static getInstance(): StructuredDataService {
    if (!StructuredDataService.instance) {
      StructuredDataService.instance = new StructuredDataService()
    }
    return StructuredDataService.instance
  }

  /**
   * Generate Organization structured data
   */
  generateOrganization(data?: Partial<OrganizationData>, language: Language = 'fr'): string {
    const orgData: OrganizationData = {
      name: seoConfig.site.name,
      description: seoConfig.site.description[language],
      url: seoConfig.site.url,
      logo: `${seoConfig.site.url}${seoConfig.site.logo}`,
      contactPoint: {
        contactType: 'customer service',
        availableLanguage: ['French', 'English'],
        ...data?.contactPoint
      },
      sameAs: [
        seoConfig.social.linkedin,
        ...(seoConfig.social.twitter ? [`https://twitter.com/${seoConfig.social.twitter.replace('@', '')}`] : []),
        ...(seoConfig.social.facebook ? [seoConfig.social.facebook] : [])
      ].filter(Boolean),
      foundingDate: '1990',
      numberOfEmployees: '10-50',
      ...data
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      ...orgData
    }

    return JSON.stringify(structuredData, null, 2)
  }

  /**
   * Generate LocalBusiness structured data
   */
  generateLocalBusiness(data?: Partial<LocalBusinessData>, language: Language = 'fr'): string {
    const businessData: LocalBusinessData = {
      name: seoConfig.site.name,
      description: seoConfig.site.description[language],
      url: seoConfig.site.url,
      logo: `${seoConfig.site.url}${seoConfig.site.logo}`,
      priceRange: '€€€',
      areaServed: ['France', 'Europe'],
      contactPoint: {
        contactType: 'customer service',
        availableLanguage: ['French', 'English']
      },
      sameAs: [
        seoConfig.social.linkedin,
        ...(seoConfig.social.twitter ? [`https://twitter.com/${seoConfig.social.twitter.replace('@', '')}`] : [])
      ].filter(Boolean),
      ...data
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      ...businessData
    }

    return JSON.stringify(structuredData, null, 2)
  }

  /**
   * Generate WebSite structured data
   */
  generateWebSite(language: Language = 'fr'): string {
    const websiteData: WebSiteData = {
      name: seoConfig.site.name,
      url: seoConfig.site.url,
      description: seoConfig.site.description[language],
      publisher: {
        name: seoConfig.site.name,
        logo: `${seoConfig.site.url}${seoConfig.site.logo}`
      },
      potentialAction: {
        target: `${seoConfig.site.url}/search?q={search_term_string}`,
        queryInput: 'required name=search_term_string'
      },
      inLanguage: seoConfig.site.supportedLanguages
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      ...websiteData,
      potentialAction: {
        '@type': 'SearchAction',
        ...websiteData.potentialAction
      }
    }

    return JSON.stringify(structuredData, null, 2)
  }

  /**
   * Generate Service structured data
   */
  generateService(serviceData: ServiceData, language: Language = 'fr'): string {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: serviceData.name,
      description: serviceData.description,
      provider: {
        '@type': 'Organization',
        name: serviceData.provider.name,
        url: serviceData.provider.url
      },
      serviceType: serviceData.serviceType,
      areaServed: serviceData.areaServed || ['France', 'Europe'],
      category: serviceData.category
    }

    return JSON.stringify(structuredData, null, 2)
  }

  /**
   * Generate BreadcrumbList structured data
   */
  generateBreadcrumbList(breadcrumbData: BreadcrumbData): string {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbData.items.map(item => ({
        '@type': 'ListItem',
        position: item.position,
        name: item.name,
        item: `${seoConfig.site.url}${item.url}`
      }))
    }

    return JSON.stringify(structuredData, null, 2)
  }

  /**
   * Generate multiple structured data types
   */
  generateMultiple(configs: StructuredDataConfig[]): string[] {
    return configs.map(config => {
      switch (config.type) {
        case 'Organization':
          return this.generateOrganization(config.data, config.language)
        case 'LocalBusiness':
          return this.generateLocalBusiness(config.data, config.language)
        case 'WebSite':
          return this.generateWebSite(config.language || 'fr')
        case 'Service':
          return this.generateService(config.data, config.language)
        case 'BreadcrumbList':
          return this.generateBreadcrumbList(config.data)
        default:
          throw new Error(`Unsupported structured data type: ${config.type}`)
      }
    })
  }

  /**
   * Validate JSON-LD structure
   */
  validateStructuredData(jsonLd: string): boolean {
    try {
      const parsed = JSON.parse(jsonLd)
      
      // Basic validation
      if (!parsed['@context'] || !parsed['@type']) {
        return false
      }

      // Ensure @context is schema.org
      if (parsed['@context'] !== 'https://schema.org') {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get predefined services data for Kamlease
   */
  getKamleaseServices(language: Language = 'fr'): ServiceData[] {
    const services = {
      fr: [
        {
          name: 'Solutions Mécatroniques',
          description: 'Conception et développement de solutions mécatroniques innovantes pour l\'industrie',
          serviceType: 'Ingénierie Mécatronique',
          category: 'Mécatronique'
        },
        {
          name: 'Électronique Industrielle',
          description: 'Développement de systèmes électroniques pour applications industrielles',
          serviceType: 'Conception Électronique',
          category: 'Électronique'
        },
        {
          name: 'Auto-staging',
          description: 'Adaptation de produits automobiles pour diverses applications industrielles',
          serviceType: 'Adaptation Produits',
          category: 'Automobile'
        }
      ],
      en: [
        {
          name: 'Mechatronics Solutions',
          description: 'Design and development of innovative mechatronics solutions for industry',
          serviceType: 'Mechatronics Engineering',
          category: 'Mechatronics'
        },
        {
          name: 'Industrial Electronics',
          description: 'Development of electronic systems for industrial applications',
          serviceType: 'Electronic Design',
          category: 'Electronics'
        },
        {
          name: 'Auto-staging',
          description: 'Adaptation of automotive products for various industrial applications',
          serviceType: 'Product Adaptation',
          category: 'Automotive'
        }
      ]
    }

    return services[language].map(service => ({
      ...service,
      provider: {
        name: seoConfig.site.name,
        url: seoConfig.site.url
      },
      areaServed: ['France', 'Europe']
    }))
  }
}

export const structuredDataService = StructuredDataService.getInstance()