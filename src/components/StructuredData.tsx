import React from 'react'
import { 
  StructuredDataService, 
  StructuredDataConfig, 
  StructuredDataType,
  OrganizationData,
  LocalBusinessData,
  ServiceData,
  BreadcrumbData
} from '../lib/structured-data-service'
import { Language } from '../lib/translations'

interface StructuredDataProps {
  type?: StructuredDataType
  data?: any
  language?: Language
  multiple?: StructuredDataConfig[]
  className?: string
}

/**
 * StructuredData component for injecting JSON-LD structured data into the DOM
 * Supports single or multiple structured data types
 */
export const StructuredData: React.FC<StructuredDataProps> = ({
  type,
  data,
  language = 'fr',
  multiple,
  className
}) => {
  const structuredDataService = StructuredDataService.getInstance()

  // Generate structured data
  const generateStructuredData = (): string[] => {
    if (multiple) {
      return structuredDataService.generateMultiple(multiple)
    }

    if (!type) {
      console.warn('StructuredData: No type or multiple configs provided')
      return []
    }

    try {
      let jsonLd: string

      switch (type) {
        case 'Organization':
          jsonLd = structuredDataService.generateOrganization(data as OrganizationData, language)
          break
        case 'LocalBusiness':
          jsonLd = structuredDataService.generateLocalBusiness(data as LocalBusinessData, language)
          break
        case 'WebSite':
          jsonLd = structuredDataService.generateWebSite(language)
          break
        case 'Service':
          jsonLd = structuredDataService.generateService(data as ServiceData, language)
          break
        case 'BreadcrumbList':
          jsonLd = structuredDataService.generateBreadcrumbList(data as BreadcrumbData)
          break
        default:
          console.warn(`StructuredData: Unsupported type ${type}`)
          return []
      }

      return [jsonLd]
    } catch (error) {
      console.error('StructuredData: Error generating structured data:', error)
      return []
    }
  }

  const structuredDataArray = generateStructuredData()

  // Don't render if no structured data
  if (structuredDataArray.length === 0) {
    return null
  }

  return (
    <>
      {structuredDataArray.map((jsonLd, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          className={className}
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ))}
    </>
  )
}

/**
 * Predefined StructuredData components for common use cases
 */

interface KamleaseOrganizationProps {
  language?: Language
  contactInfo?: {
    telephone?: string
    email?: string
  }
  address?: {
    streetAddress: string
    addressLocality: string
    postalCode: string
    addressCountry: string
  }
}

export const KamleaseOrganization: React.FC<KamleaseOrganizationProps> = ({
  language = 'fr',
  contactInfo,
  address
}) => {
  const organizationData: Partial<OrganizationData> = {
    ...(contactInfo && {
      contactPoint: {
        contactType: 'customer service',
        availableLanguage: ['French', 'English'],
        ...contactInfo
      }
    }),
    ...(address && { address })
  }

  return (
    <StructuredData
      type="Organization"
      data={organizationData}
      language={language}
    />
  )
}

interface KamleaseLocalBusinessProps extends KamleaseOrganizationProps {
  priceRange?: string
  openingHours?: string[]
  geo?: {
    latitude: number
    longitude: number
  }
}

export const KamleaseLocalBusiness: React.FC<KamleaseLocalBusinessProps> = ({
  language = 'fr',
  contactInfo,
  address,
  priceRange,
  openingHours,
  geo
}) => {
  const businessData: Partial<LocalBusinessData> = {
    ...(contactInfo && {
      contactPoint: {
        contactType: 'customer service',
        availableLanguage: ['French', 'English'],
        ...contactInfo
      }
    }),
    ...(address && { address }),
    ...(priceRange && { priceRange }),
    ...(openingHours && { openingHours }),
    ...(geo && { geo })
  }

  return (
    <StructuredData
      type="LocalBusiness"
      data={businessData}
      language={language}
    />
  )
}

interface KamleaseWebSiteProps {
  language?: Language
}

export const KamleaseWebSite: React.FC<KamleaseWebSiteProps> = ({
  language = 'fr'
}) => {
  return (
    <StructuredData
      type="WebSite"
      language={language}
    />
  )
}

interface KamleaseServicesProps {
  language?: Language
  customServices?: ServiceData[]
}

export const KamleaseServices: React.FC<KamleaseServicesProps> = ({
  language = 'fr',
  customServices
}) => {
  const structuredDataService = StructuredDataService.getInstance()
  const services = customServices || structuredDataService.getKamleaseServices(language)

  const serviceConfigs: StructuredDataConfig[] = services.map(service => ({
    type: 'Service' as StructuredDataType,
    data: service,
    language
  }))

  return (
    <StructuredData
      multiple={serviceConfigs}
    />
  )
}

interface BreadcrumbProps {
  items: Array<{
    name: string
    url: string
  }>
}

export const BreadcrumbStructuredData: React.FC<BreadcrumbProps> = ({
  items
}) => {
  const breadcrumbData: BreadcrumbData = {
    items: items.map((item, index) => ({
      ...item,
      position: index + 1
    }))
  }

  return (
    <StructuredData
      type="BreadcrumbList"
      data={breadcrumbData}
    />
  )
}

/**
 * Complete Kamlease structured data for homepage
 */
interface KamleaseCompleteStructuredDataProps {
  language?: Language
  includeServices?: boolean
  contactInfo?: {
    telephone?: string
    email?: string
  }
  address?: {
    streetAddress: string
    addressLocality: string
    postalCode: string
    addressCountry: string
  }
}

export const KamleaseCompleteStructuredData: React.FC<KamleaseCompleteStructuredDataProps> = ({
  language = 'fr',
  includeServices = true,
  contactInfo,
  address
}) => {
  const structuredDataService = StructuredDataService.getInstance()
  
  const configs: StructuredDataConfig[] = [
    {
      type: 'Organization',
      data: {
        ...(contactInfo && {
          contactPoint: {
            contactType: 'customer service',
            availableLanguage: ['French', 'English'],
            ...contactInfo
          }
        }),
        ...(address && { address })
      },
      language
    },
    {
      type: 'WebSite',
      language
    }
  ]

  if (includeServices) {
    const services = structuredDataService.getKamleaseServices(language)
    services.forEach(service => {
      configs.push({
        type: 'Service',
        data: service,
        language
      })
    })
  }

  return (
    <StructuredData
      multiple={configs}
    />
  )
}

export default StructuredData