import { Language } from './translations'
import { PageSEOData, OpenGraphData, TwitterCardData, seoConfig } from './seo-config'

export interface MetaTag {
  name?: string
  property?: string
  content: string
  httpEquiv?: string
}

export class SEOMetaManager {
  private static instance: SEOMetaManager
  private currentPageData: PageSEOData | null = null

  private constructor() {}

  static getInstance(): SEOMetaManager {
    if (!SEOMetaManager.instance) {
      SEOMetaManager.instance = new SEOMetaManager()
    }
    return SEOMetaManager.instance
  }

  /**
   * Update page meta tags based on page data and current language
   */
  updatePageMeta(pageData: PageSEOData, language: Language): void {
    this.currentPageData = pageData
    
    // Update document title
    const title = pageData.title[language]
    document.title = title

    // Clear existing meta tags that we manage
    this.clearManagedMetaTags()

    // Set basic meta tags
    this.setMetaTag('description', pageData.description[language])
    this.setMetaTag('keywords', pageData.keywords.join(', '))
    this.setMetaTag('author', seoConfig.site.name)
    
    // Set language and locale
    document.documentElement.lang = language
    this.setMetaTag('language', language)
    
    // Set canonical URL
    this.setCanonicalUrl(pageData.canonicalUrl, language)
    
    // Set robots meta tag
    const robotsContent = this.generateRobotsContent(pageData)
    if (robotsContent) {
      this.setMetaTag('robots', robotsContent)
    }

    // Set last modified if available
    if (pageData.lastModified) {
      this.setMetaTag('last-modified', pageData.lastModified.toISOString())
    }

    // Generate and set Open Graph tags
    const ogData = this.generateOpenGraphData(pageData, language)
    this.updateOpenGraphTags(ogData)

    // Generate and set Twitter Card tags
    const twitterData = this.generateTwitterCardData(pageData, language)
    this.updateTwitterCardTags(twitterData)

    // Set hreflang tags for multilingual support
    this.setHreflangTags(pageData.canonicalUrl)
  }

  /**
   * Generate Open Graph data from page data
   */
  private generateOpenGraphData(pageData: PageSEOData, language: Language): OpenGraphData {
    const baseUrl = seoConfig.site.url
    const languagePrefix = language === 'en' ? '/en' : ''
    
    // Use social-specific image if available, otherwise fall back to page image or default
    const socialImage = pageData.socialImages?.openGraph || pageData.image || `${baseUrl}${seoConfig.socialMedia.openGraph.defaultImage}`
    const imageUrl = socialImage.startsWith('http') ? socialImage : `${baseUrl}${socialImage}`
    
    return {
      title: pageData.title[language],
      description: pageData.description[language],
      image: imageUrl,
      url: `${baseUrl}${languagePrefix}${pageData.canonicalUrl}`,
      type: pageData.openGraph?.type || pageData.type || seoConfig.socialMedia.openGraph.defaultType,
      siteName: seoConfig.site.name,
      locale: language === 'fr' ? 'fr_FR' : 'en_US',
      imageAlt: pageData.imageAlt || pageData.openGraph?.imageAlt || seoConfig.socialMedia.openGraph.defaultImageAlt,
      imageWidth: pageData.openGraph?.imageWidth || seoConfig.socialMedia.openGraph.imageWidth,
      imageHeight: pageData.openGraph?.imageHeight || seoConfig.socialMedia.openGraph.imageHeight,
      imageType: 'image/png'
    }
  }

  /**
   * Generate Twitter Card data from page data
   */
  private generateTwitterCardData(pageData: PageSEOData, language: Language): TwitterCardData {
    const baseUrl = seoConfig.site.url
    
    // Use Twitter-specific image if available, otherwise fall back to page image or default
    const socialImage = pageData.socialImages?.twitter || pageData.image || `${baseUrl}${seoConfig.socialMedia.openGraph.defaultImage}`
    const imageUrl = socialImage.startsWith('http') ? socialImage : `${baseUrl}${socialImage}`
    
    return {
      card: pageData.twitter?.card || seoConfig.socialMedia.twitter.defaultCard,
      title: pageData.title[language],
      description: pageData.description[language],
      image: imageUrl,
      imageAlt: pageData.imageAlt || pageData.twitter?.imageAlt || seoConfig.socialMedia.openGraph.defaultImageAlt,
      site: pageData.twitter?.site || seoConfig.socialMedia.twitter.site,
      creator: pageData.twitter?.creator || seoConfig.socialMedia.twitter.creator
    }
  }

  /**
   * Update Open Graph meta tags
   */
  updateOpenGraphTags(ogData: OpenGraphData): void {
    this.setMetaTag('og:title', ogData.title, 'property')
    this.setMetaTag('og:description', ogData.description, 'property')
    this.setMetaTag('og:image', ogData.image, 'property')
    this.setMetaTag('og:url', ogData.url, 'property')
    this.setMetaTag('og:type', ogData.type, 'property')
    this.setMetaTag('og:site_name', ogData.siteName, 'property')
    this.setMetaTag('og:locale', ogData.locale, 'property')
    
    // Enhanced image properties
    if (ogData.imageAlt) {
      this.setMetaTag('og:image:alt', ogData.imageAlt, 'property')
    }
    if (ogData.imageWidth) {
      this.setMetaTag('og:image:width', ogData.imageWidth.toString(), 'property')
    }
    if (ogData.imageHeight) {
      this.setMetaTag('og:image:height', ogData.imageHeight.toString(), 'property')
    }
    if (ogData.imageType) {
      this.setMetaTag('og:image:type', ogData.imageType, 'property')
    }
    
    // Article-specific properties
    if (ogData.article) {
      if (ogData.article.author) {
        this.setMetaTag('article:author', ogData.article.author, 'property')
      }
      if (ogData.article.publishedTime) {
        this.setMetaTag('article:published_time', ogData.article.publishedTime, 'property')
      }
      if (ogData.article.modifiedTime) {
        this.setMetaTag('article:modified_time', ogData.article.modifiedTime, 'property')
      }
      if (ogData.article.section) {
        this.setMetaTag('article:section', ogData.article.section, 'property')
      }
      if (ogData.article.tags) {
        ogData.article.tags.forEach(tag => {
          this.setMetaTag('article:tag', tag, 'property')
        })
      }
    }
    
    // Add alternate locales
    const alternateLocale = ogData.locale === 'fr_FR' ? 'en_US' : 'fr_FR'
    this.setMetaTag('og:locale:alternate', alternateLocale, 'property')
  }

  /**
   * Update Twitter Card meta tags
   */
  updateTwitterCardTags(twitterData: TwitterCardData): void {
    this.setMetaTag('twitter:card', twitterData.card, 'name')
    this.setMetaTag('twitter:title', twitterData.title, 'name')
    this.setMetaTag('twitter:description', twitterData.description, 'name')
    this.setMetaTag('twitter:image', twitterData.image, 'name')
    
    if (twitterData.imageAlt) {
      this.setMetaTag('twitter:image:alt', twitterData.imageAlt, 'name')
    }
    
    if (twitterData.site) {
      this.setMetaTag('twitter:site', twitterData.site, 'name')
    }
    
    if (twitterData.creator) {
      this.setMetaTag('twitter:creator', twitterData.creator, 'name')
    }
    
    // App-specific properties for Twitter App Cards
    if (twitterData.app) {
      if (twitterData.app.name) {
        this.setMetaTag('twitter:app:name:iphone', twitterData.app.name, 'name')
        this.setMetaTag('twitter:app:name:ipad', twitterData.app.name, 'name')
        this.setMetaTag('twitter:app:name:googleplay', twitterData.app.name, 'name')
      }
      if (twitterData.app.id) {
        this.setMetaTag('twitter:app:id:iphone', twitterData.app.id, 'name')
        this.setMetaTag('twitter:app:id:ipad', twitterData.app.id, 'name')
        this.setMetaTag('twitter:app:id:googleplay', twitterData.app.id, 'name')
      }
      if (twitterData.app.url) {
        this.setMetaTag('twitter:app:url:iphone', twitterData.app.url, 'name')
        this.setMetaTag('twitter:app:url:ipad', twitterData.app.url, 'name')
        this.setMetaTag('twitter:app:url:googleplay', twitterData.app.url, 'name')
      }
    }
  }

  /**
   * Set canonical URL with proper normalization
   */
  private setCanonicalUrl(canonicalUrl: string, language: Language): void {
    const baseUrl = seoConfig.site.url
    const normalizedPath = this.normalizeUrl(canonicalUrl)
    const languagePrefix = language === 'en' ? '/en' : ''
    const fullCanonicalUrl = `${baseUrl}${languagePrefix}${normalizedPath}`
    
    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]')
    if (existingCanonical) {
      existingCanonical.remove()
    }
    
    this.setLinkTag('canonical', fullCanonicalUrl)
  }

  /**
   * Normalize URL path
   */
  private normalizeUrl(path: string): string {
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
   * Set hreflang tags for multilingual support
   */
  private setHreflangTags(canonicalUrl: string): void {
    const baseUrl = seoConfig.site.url
    
    // Remove existing hreflang tags
    const existingHreflangTags = document.querySelectorAll('link[hreflang]')
    existingHreflangTags.forEach(tag => tag.remove())
    
    // Add hreflang for each supported language
    seoConfig.site.supportedLanguages.forEach(lang => {
      const href = lang === 'fr' 
        ? `${baseUrl}${canonicalUrl}`
        : `${baseUrl}/en${canonicalUrl}`
      
      this.setLinkTag('alternate', href, { hreflang: lang })
    })
    
    // Add x-default hreflang
    this.setLinkTag('alternate', `${baseUrl}${canonicalUrl}`, { hreflang: 'x-default' })
  }

  /**
   * Generate robots meta content
   */
  private generateRobotsContent(pageData: PageSEOData): string | null {
    const directives: string[] = []
    
    if (pageData.noindex) {
      directives.push('noindex')
    } else {
      directives.push('index')
    }
    
    if (pageData.nofollow) {
      directives.push('nofollow')
    } else {
      directives.push('follow')
    }
    
    return directives.length > 0 ? directives.join(', ') : null
  }

  /**
   * Set a meta tag in the document head
   */
  private setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
    // Remove existing tag if it exists
    const existingTag = document.querySelector(`meta[${attribute}="${name}"]`)
    if (existingTag) {
      existingTag.remove()
    }

    // Create and append new tag
    const metaTag = document.createElement('meta')
    metaTag.setAttribute(attribute, name)
    metaTag.setAttribute('content', content)
    metaTag.setAttribute('data-managed-by', 'seo-manager')
    document.head.appendChild(metaTag)
  }

  /**
   * Set a link tag in the document head
   */
  private setLinkTag(rel: string, href: string, additionalAttributes?: Record<string, string>): void {
    const linkTag = document.createElement('link')
    linkTag.setAttribute('rel', rel)
    linkTag.setAttribute('href', href)
    linkTag.setAttribute('data-managed-by', 'seo-manager')
    
    if (additionalAttributes) {
      Object.entries(additionalAttributes).forEach(([key, value]) => {
        linkTag.setAttribute(key, value)
      })
    }
    
    document.head.appendChild(linkTag)
  }

  /**
   * Clear all meta tags managed by this SEO manager
   */
  private clearManagedMetaTags(): void {
    const managedTags = document.querySelectorAll('[data-managed-by="seo-manager"]')
    managedTags.forEach(tag => tag.remove())
  }

  /**
   * Get current page data
   */
  getCurrentPageData(): PageSEOData | null {
    return this.currentPageData
  }

  /**
   * Generate optimized title with keyword placement
   */
  static generateOptimizedTitle(baseTitle: string, keywords: string[], language: Language): string {
    const siteName = seoConfig.site.name
    const separator = language === 'fr' ? ' | ' : ' | '
    
    // Ensure title is not too long (recommended max 60 characters)
    const maxLength = 60 - siteName.length - separator.length
    let optimizedTitle = baseTitle
    
    if (optimizedTitle.length > maxLength) {
      optimizedTitle = optimizedTitle.substring(0, maxLength - 3) + '...'
    }
    
    return `${optimizedTitle}${separator}${siteName}`
  }

  /**
   * Generate optimized description with keyword placement
   */
  static generateOptimizedDescription(baseDescription: string, keywords: string[]): string {
    const maxLength = 160
    let optimizedDescription = baseDescription
    
    // Ensure description is not too long
    if (optimizedDescription.length > maxLength) {
      optimizedDescription = optimizedDescription.substring(0, maxLength - 3) + '...'
    }
    
    return optimizedDescription
  }
}