import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/contexts/LanguageProvider'
import { PageSEOData, seoConfig } from '@/lib/seo-config'
import { Language } from '@/lib/translations'
import { StructuredData, StructuredDataConfig } from './StructuredData'

export interface SEOHeadProps {
  pageData: PageSEOData
  customTitle?: string
  customDescription?: string
  customKeywords?: string[]
  customImage?: string
  noindex?: boolean
  nofollow?: boolean
  structuredData?: StructuredDataConfig[]
  includeDefaultStructuredData?: boolean
}

/**
 * SEOHead component that injects dynamic meta tags using react-helmet-async
 * This component provides a declarative way to manage document head
 */
export function SEOHead({
  pageData,
  customTitle,
  customDescription,
  customKeywords,
  customImage,
  noindex,
  nofollow,
  structuredData,
  includeDefaultStructuredData = true
}: SEOHeadProps) {
  const { language } = useLanguage()

  // Merge custom data with page data
  const title = customTitle || pageData.title[language]
  const description = customDescription || pageData.description[language]
  const keywords = customKeywords ? [...pageData.keywords, ...customKeywords] : pageData.keywords
  const image = customImage || pageData.image || `${seoConfig.site.url}${seoConfig.site.logo}`
  const shouldNoindex = noindex ?? pageData.noindex ?? false
  const shouldNofollow = nofollow ?? pageData.nofollow ?? false

  // Generate URLs
  const baseUrl = seoConfig.site.url
  const languagePrefix = language === 'en' ? '/en' : ''
  const canonicalUrl = `${baseUrl}${languagePrefix}${pageData.canonicalUrl}`
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  // Generate robots content
  const robotsContent = generateRobotsContent(shouldNoindex, shouldNofollow)

  // Generate hreflang URLs with proper normalization
  const hreflangUrls = generateHreflangUrls(pageData.canonicalUrl, baseUrl)

  // Generate default structured data if enabled
  const defaultStructuredData: StructuredDataConfig[] = includeDefaultStructuredData ? [
    {
      type: 'Organization',
      data: {},
      language
    },
    {
      type: 'WebSite',
      language
    }
  ] : []

  // Combine default and custom structured data
  const allStructuredData = [...defaultStructuredData, ...(structuredData || [])]

  return (
    <>
      <Helmet>
        {/* Basic meta tags */}
        <html lang={language} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(', ')} />
        <meta name="author" content={seoConfig.site.name} />
        <meta name="language" content={language} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Robots */}
        {robotsContent && <meta name="robots" content={robotsContent} />}
        
        {/* Last modified */}
        {pageData.lastModified && (
          <meta name="last-modified" content={pageData.lastModified.toISOString()} />
        )}

        {/* Open Graph tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content={pageData.openGraph?.type || pageData.type || seoConfig.socialMedia.openGraph.defaultType} />
        <meta property="og:site_name" content={seoConfig.site.name} />
        <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : 'en_US'} />
        <meta property="og:locale:alternate" content={language === 'fr' ? 'en_US' : 'fr_FR'} />
        
        {/* Enhanced Open Graph image properties */}
        {(pageData.imageAlt || pageData.openGraph?.imageAlt) && (
          <meta property="og:image:alt" content={pageData.imageAlt || pageData.openGraph?.imageAlt} />
        )}
        <meta property="og:image:width" content={String(pageData.openGraph?.imageWidth || seoConfig.socialMedia.openGraph.imageWidth)} />
        <meta property="og:image:height" content={String(pageData.openGraph?.imageHeight || seoConfig.socialMedia.openGraph.imageHeight)} />
        <meta property="og:image:type" content="image/png" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content={pageData.twitter?.card || seoConfig.socialMedia.twitter.defaultCard} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        {(pageData.imageAlt || pageData.twitter?.imageAlt) && (
          <meta name="twitter:image:alt" content={pageData.imageAlt || pageData.twitter?.imageAlt} />
        )}
        {(seoConfig.socialMedia.twitter.site || pageData.twitter?.site) && (
          <meta name="twitter:site" content={pageData.twitter?.site || seoConfig.socialMedia.twitter.site} />
        )}
        {(seoConfig.socialMedia.twitter.creator || pageData.twitter?.creator) && (
          <meta name="twitter:creator" content={pageData.twitter?.creator || seoConfig.socialMedia.twitter.creator} />
        )}

        {/* LinkedIn specific tags */}
        <meta property="article:author" content={seoConfig.site.name} />
        
        {/* Facebook specific tags */}
        {seoConfig.socialMedia.facebook.appId && (
          <meta property="fb:app_id" content={seoConfig.socialMedia.facebook.appId} />
        )}

        {/* Hreflang tags */}
        {hreflangUrls.map(({ lang, url }) => (
          <link key={lang} rel="alternate" hreflang={lang} href={url} />
        ))}
        <link rel="alternate" hreflang="x-default" href={`${baseUrl}${pageData.canonicalUrl}`} />

        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </Helmet>
      
      {/* Structured Data */}
      {allStructuredData.length > 0 && (
        <StructuredData multiple={allStructuredData} />
      )}
    </>
  )
}

/**
 * Lightweight SEO component for simple pages
 */
export function SimpleSEOHead({
  title,
  description,
  keywords,
  image,
  noindex = false,
  nofollow = false
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  noindex?: boolean
  nofollow?: boolean
}) {
  const { language } = useLanguage()
  const baseUrl = seoConfig.site.url
  const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}${seoConfig.site.logo}`
  const robotsContent = generateRobotsContent(noindex, nofollow)

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={seoConfig.site.name} />
      {robotsContent && <meta name="robots" content={robotsContent} />}
      
      {/* Basic Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={seoConfig.site.name} />
      
      {/* Basic Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  )
}

/**
 * Generate robots meta content
 */
function generateRobotsContent(noindex: boolean, nofollow: boolean): string | null {
  const directives: string[] = []
  
  if (noindex) {
    directives.push('noindex')
  } else {
    directives.push('index')
  }
  
  if (nofollow) {
    directives.push('nofollow')
  } else {
    directives.push('follow')
  }
  
  return directives.length > 0 ? directives.join(', ') : null
}

/**
 * Generate hreflang URLs for multilingual SEO
 */
export function generateHreflangUrls(canonicalUrl: string, baseUrl: string) {
  const normalizedPath = normalizeUrlPath(canonicalUrl)
  
  return seoConfig.site.supportedLanguages.map(lang => ({
    lang,
    url: lang === 'fr' 
      ? `${baseUrl}${normalizedPath}` 
      : `${baseUrl}/${lang}${normalizedPath}`
  }))
}

/**
 * Normalize URL path for consistent hreflang generation
 */
function normalizeUrlPath(path: string): string {
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  
  // Remove trailing slash except for root
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }
  
  // Remove double slashes
  path = path.replace(/\/+/g, '/')
  
  return path
}

/**
 * Detect user's preferred language from browser and URL
 */
export function detectPreferredLanguage(): Language {
  if (typeof window === 'undefined') {
    return seoConfig.site.defaultLanguage
  }

  // First check URL path for language prefix
  const pathname = window.location.pathname
  const urlLanguage = extractLanguageFromUrl(pathname)
  if (urlLanguage) {
    return urlLanguage
  }

  // Then check browser language preferences
  const browserLanguages = navigator.languages || [navigator.language]
  
  for (const browserLang of browserLanguages) {
    const lang = browserLang.split('-')[0].toLowerCase()
    if (seoConfig.site.supportedLanguages.includes(lang as Language)) {
      return lang as Language
    }
  }

  return seoConfig.site.defaultLanguage
}

/**
 * Extract language from URL path
 */
export function extractLanguageFromUrl(pathname: string): Language | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) {
    const firstSegment = segments[0]
    if (seoConfig.site.supportedLanguages.includes(firstSegment as Language)) {
      return firstSegment as Language
    }
  }
  return null
}

/**
 * Generate SEO-optimized URL for a given language and path
 */
export function generateLocalizedUrl(path: string, language: Language): string {
  const baseUrl = seoConfig.site.url
  const normalizedPath = normalizeUrlPath(path)
  
  if (language === seoConfig.site.defaultLanguage) {
    return `${baseUrl}${normalizedPath}`
  }
  
  // For root path, don't add extra slash
  if (normalizedPath === '/') {
    return `${baseUrl}/${language}`
  }
  
  return `${baseUrl}/${language}${normalizedPath}`
}

/**
 * Hook to dynamically update SEO head
 */
export function useSEOHead(pageData: PageSEOData, customData?: Partial<SEOHeadProps>) {
  const { language } = useLanguage()

  useEffect(() => {
    // This effect can be used for additional side effects when SEO data changes
    // For example, sending analytics events or updating external services
    
    if (typeof window !== 'undefined' && window.gtag) {
      // Update Google Analytics page view
      window.gtag('config', seoConfig.analytics.googleAnalyticsId, {
        page_title: pageData.title[language],
        page_location: window.location.href,
        page_path: window.location.pathname
      })
    }
  }, [pageData, language])

  return {
    title: customData?.customTitle || pageData.title[language],
    description: customData?.customDescription || pageData.description[language],
    keywords: customData?.customKeywords || pageData.keywords,
    canonicalUrl: generateLocalizedUrl(pageData.canonicalUrl, language)
  }
}