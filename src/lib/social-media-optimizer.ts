import { Language } from './translations'
import { PageSEOData, OpenGraphData, TwitterCardData, seoConfig } from './seo-config'
import { SocialImageGenerator } from './social-image-generator'

export interface SocialMediaOptimization {
  openGraph: OpenGraphData
  twitter: TwitterCardData
  linkedin: LinkedInData
  facebook: FacebookData
  images: SocialMediaImages
}

export interface LinkedInData {
  title: string
  description: string
  image: string
  url: string
}

export interface FacebookData {
  title: string
  description: string
  image: string
  url: string
  appId?: string
}

export interface SocialMediaImages {
  openGraph: string
  twitter: string
  linkedin: string
  facebook: string
}

export interface SocialMediaValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

/**
 * Service for optimizing social media sharing across all platforms
 */
export class SocialMediaOptimizer {
  private static instance: SocialMediaOptimizer
  private imageGenerator: SocialImageGenerator

  private constructor() {
    this.imageGenerator = SocialImageGenerator.getInstance()
  }

  static getInstance(): SocialMediaOptimizer {
    if (!SocialMediaOptimizer.instance) {
      SocialMediaOptimizer.instance = new SocialMediaOptimizer()
    }
    return SocialMediaOptimizer.instance
  }

  /**
   * Generate comprehensive social media optimization for a page
   */
  async optimizeForAllPlatforms(
    pageData: PageSEOData,
    language: Language
  ): Promise<SocialMediaOptimization> {
    const baseUrl = seoConfig.site.url
    const languagePrefix = language === 'en' ? '/en' : ''
    const pageUrl = `${baseUrl}${languagePrefix}${pageData.canonicalUrl}`

    // Generate optimized images for all platforms
    const images = await this.generateOptimizedImages(pageData, language)

    // Generate Open Graph data
    const openGraph = this.generateOpenGraphData(pageData, language, pageUrl, images.openGraph)

    // Generate Twitter Card data
    const twitter = this.generateTwitterCardData(pageData, language, images.twitter)

    // Generate LinkedIn data
    const linkedin = this.generateLinkedInData(pageData, language, pageUrl, images.linkedin)

    // Generate Facebook data
    const facebook = this.generateFacebookData(pageData, language, pageUrl, images.facebook)

    return {
      openGraph,
      twitter,
      linkedin,
      facebook,
      images
    }
  }

  /**
   * Generate optimized images for all social media platforms
   */
  private async generateOptimizedImages(
    pageData: PageSEOData,
    language: Language
  ): Promise<SocialMediaImages> {
    const baseUrl = seoConfig.site.url

    // Use existing social images if available
    if (pageData.socialImages) {
      return {
        openGraph: pageData.socialImages.openGraph 
          ? `${baseUrl}${pageData.socialImages.openGraph}`
          : `${baseUrl}${seoConfig.socialMedia.openGraph.defaultImage}`,
        twitter: pageData.socialImages.twitter
          ? `${baseUrl}${pageData.socialImages.twitter}`
          : `${baseUrl}${seoConfig.socialMedia.openGraph.defaultImage}`,
        linkedin: pageData.socialImages.linkedin
          ? `${baseUrl}${pageData.socialImages.linkedin}`
          : `${baseUrl}${seoConfig.socialMedia.openGraph.defaultImage}`,
        facebook: pageData.socialImages.openGraph
          ? `${baseUrl}${pageData.socialImages.openGraph}`
          : `${baseUrl}${seoConfig.socialMedia.openGraph.defaultImage}`
      }
    }

    // Generate dynamic images if no static images are available
    try {
      const config = {
        title: pageData.title[language],
        description: pageData.description[language],
        language,
        type: this.getPageType(pageData.canonicalUrl)
      }

      const generatedImages = await this.imageGenerator.generateMultipleSocialImages(config)

      return {
        openGraph: generatedImages.openGraph.url,
        twitter: generatedImages.twitter.url,
        linkedin: generatedImages.linkedin.url,
        facebook: generatedImages.openGraph.url // Facebook uses same as Open Graph
      }
    } catch (error) {
      console.warn('Failed to generate social images, using defaults:', error)
      
      // Fallback to default images
      const defaultImage = `${baseUrl}${seoConfig.socialMedia.openGraph.defaultImage}`
      return {
        openGraph: defaultImage,
        twitter: defaultImage,
        linkedin: defaultImage,
        facebook: defaultImage
      }
    }
  }

  /**
   * Generate Open Graph data with enhanced properties
   */
  private generateOpenGraphData(
    pageData: PageSEOData,
    language: Language,
    pageUrl: string,
    imageUrl: string
  ): OpenGraphData {
    return {
      title: this.optimizeTitle(pageData.title[language], 95),
      description: this.optimizeDescription(pageData.description[language], 300),
      image: imageUrl,
      url: pageUrl,
      type: pageData.openGraph?.type || pageData.type || seoConfig.socialMedia.openGraph.defaultType,
      siteName: seoConfig.site.name,
      locale: language === 'fr' ? 'fr_FR' : 'en_US',
      imageAlt: pageData.openGraph?.imageAlt || pageData.imageAlt || seoConfig.socialMedia.openGraph.defaultImageAlt,
      imageWidth: pageData.openGraph?.imageWidth || seoConfig.socialMedia.openGraph.imageWidth,
      imageHeight: pageData.openGraph?.imageHeight || seoConfig.socialMedia.openGraph.imageHeight,
      imageType: 'image/png',
      article: pageData.openGraph?.article
    }
  }

  /**
   * Generate Twitter Card data with platform-specific optimizations
   */
  private generateTwitterCardData(
    pageData: PageSEOData,
    language: Language,
    imageUrl: string
  ): TwitterCardData {
    return {
      card: pageData.twitter?.card || seoConfig.socialMedia.twitter.defaultCard,
      title: this.optimizeTitle(pageData.title[language], 70),
      description: this.optimizeDescription(pageData.description[language], 200),
      image: imageUrl,
      imageAlt: pageData.twitter?.imageAlt || pageData.imageAlt || seoConfig.socialMedia.openGraph.defaultImageAlt,
      site: pageData.twitter?.site || seoConfig.socialMedia.twitter.site,
      creator: pageData.twitter?.creator || seoConfig.socialMedia.twitter.creator
    }
  }

  /**
   * Generate LinkedIn-specific data
   */
  private generateLinkedInData(
    pageData: PageSEOData,
    language: Language,
    pageUrl: string,
    imageUrl: string
  ): LinkedInData {
    return {
      title: this.optimizeTitle(pageData.title[language], 200),
      description: this.optimizeDescription(pageData.description[language], 256),
      image: imageUrl,
      url: pageUrl
    }
  }

  /**
   * Generate Facebook-specific data
   */
  private generateFacebookData(
    pageData: PageSEOData,
    language: Language,
    pageUrl: string,
    imageUrl: string
  ): FacebookData {
    return {
      title: this.optimizeTitle(pageData.title[language], 95),
      description: this.optimizeDescription(pageData.description[language], 300),
      image: imageUrl,
      url: pageUrl,
      appId: seoConfig.socialMedia.facebook.appId
    }
  }

  /**
   * Validate social media optimization
   */
  validateSocialMediaOptimization(optimization: SocialMediaOptimization): SocialMediaValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    // Validate Open Graph
    if (!optimization.openGraph.title) {
      errors.push('Open Graph title is required')
    } else if (optimization.openGraph.title.length > 95) {
      warnings.push('Open Graph title exceeds recommended 95 characters')
    }

    if (!optimization.openGraph.description) {
      errors.push('Open Graph description is required')
    } else if (optimization.openGraph.description.length > 300) {
      warnings.push('Open Graph description exceeds recommended 300 characters')
    }

    if (!optimization.openGraph.image) {
      errors.push('Open Graph image is required')
    } else if (!optimization.openGraph.image.startsWith('http')) {
      errors.push('Open Graph image must be an absolute URL')
    }

    // Validate Twitter Card
    if (!optimization.twitter.title) {
      errors.push('Twitter Card title is required')
    } else if (optimization.twitter.title.length > 70) {
      warnings.push('Twitter Card title exceeds recommended 70 characters')
    }

    if (!optimization.twitter.description) {
      errors.push('Twitter Card description is required')
    } else if (optimization.twitter.description.length > 200) {
      warnings.push('Twitter Card description exceeds recommended 200 characters')
    }

    // Recommendations
    if (!optimization.openGraph.imageAlt || optimization.openGraph.imageAlt === seoConfig.socialMedia.openGraph.defaultImageAlt) {
      recommendations.push('Add alt text for better accessibility')
    }

    if (optimization.openGraph.imageWidth !== 1200 || optimization.openGraph.imageHeight !== 630) {
      recommendations.push('Use 1200x630px images for optimal Open Graph display')
    }

    if (!optimization.twitter.site) {
      recommendations.push('Add Twitter site handle for better attribution')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    }
  }

  /**
   * Generate meta tags HTML for all platforms
   */
  generateMetaTagsHTML(optimization: SocialMediaOptimization): string {
    const tags: string[] = []

    // Open Graph tags
    tags.push(`<meta property="og:title" content="${this.escapeHtml(optimization.openGraph.title)}" />`)
    tags.push(`<meta property="og:description" content="${this.escapeHtml(optimization.openGraph.description)}" />`)
    tags.push(`<meta property="og:image" content="${optimization.openGraph.image}" />`)
    tags.push(`<meta property="og:url" content="${optimization.openGraph.url}" />`)
    tags.push(`<meta property="og:type" content="${optimization.openGraph.type}" />`)
    tags.push(`<meta property="og:site_name" content="${optimization.openGraph.siteName}" />`)
    tags.push(`<meta property="og:locale" content="${optimization.openGraph.locale}" />`)

    if (optimization.openGraph.imageAlt) {
      tags.push(`<meta property="og:image:alt" content="${this.escapeHtml(optimization.openGraph.imageAlt)}" />`)
    }
    if (optimization.openGraph.imageWidth) {
      tags.push(`<meta property="og:image:width" content="${optimization.openGraph.imageWidth}" />`)
    }
    if (optimization.openGraph.imageHeight) {
      tags.push(`<meta property="og:image:height" content="${optimization.openGraph.imageHeight}" />`)
    }

    // Twitter Card tags
    tags.push(`<meta name="twitter:card" content="${optimization.twitter.card}" />`)
    tags.push(`<meta name="twitter:title" content="${this.escapeHtml(optimization.twitter.title)}" />`)
    tags.push(`<meta name="twitter:description" content="${this.escapeHtml(optimization.twitter.description)}" />`)
    tags.push(`<meta name="twitter:image" content="${optimization.twitter.image}" />`)

    if (optimization.twitter.imageAlt) {
      tags.push(`<meta name="twitter:image:alt" content="${this.escapeHtml(optimization.twitter.imageAlt)}" />`)
    }
    if (optimization.twitter.site) {
      tags.push(`<meta name="twitter:site" content="${optimization.twitter.site}" />`)
    }
    if (optimization.twitter.creator) {
      tags.push(`<meta name="twitter:creator" content="${optimization.twitter.creator}" />`)
    }

    // Facebook specific tags
    if (optimization.facebook.appId) {
      tags.push(`<meta property="fb:app_id" content="${optimization.facebook.appId}" />`)
    }

    return tags.join('\n')
  }

  /**
   * Get page type based on URL
   */
  private getPageType(canonicalUrl: string): 'default' | 'article' | 'service' | 'contact' {
    if (canonicalUrl.includes('contact')) return 'contact'
    if (canonicalUrl.includes('about') || canonicalUrl.includes('service')) return 'service'
    if (canonicalUrl.includes('article') || canonicalUrl.includes('blog')) return 'article'
    return 'default'
  }

  /**
   * Optimize title for specific character limit
   */
  private optimizeTitle(title: string, maxLength: number): string {
    if (title.length <= maxLength) return title
    
    // Try to cut at word boundary
    const truncated = title.substring(0, maxLength - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }

  /**
   * Optimize description for specific character limit
   */
  private optimizeDescription(description: string, maxLength: number): string {
    if (description.length <= maxLength) return description
    
    // Try to cut at sentence boundary
    const truncated = description.substring(0, maxLength - 3)
    const lastPeriod = truncated.lastIndexOf('.')
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastPeriod > maxLength * 0.7) {
      return truncated.substring(0, lastPeriod + 1)
    }
    
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    if (typeof document === 'undefined') {
      // Server-side or test environment fallback
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }
    
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Test social media sharing URLs
   */
  generateSharingUrls(pageUrl: string, title: string, description?: string): {
    facebook: string
    twitter: string
    linkedin: string
    pinterest: string
    reddit: string
  } {
    const encodedUrl = encodeURIComponent(pageUrl)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = description ? encodeURIComponent(description) : ''

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
    }
  }
}

/**
 * Hook for using social media optimization in React components
 */
export function useSocialMediaOptimizer() {
  const optimizer = SocialMediaOptimizer.getInstance()

  const optimizeForAllPlatforms = async (pageData: PageSEOData, language: Language) => {
    return optimizer.optimizeForAllPlatforms(pageData, language)
  }

  const validateOptimization = (optimization: SocialMediaOptimization) => {
    return optimizer.validateSocialMediaOptimization(optimization)
  }

  const generateMetaTags = (optimization: SocialMediaOptimization) => {
    return optimizer.generateMetaTagsHTML(optimization)
  }

  const generateSharingUrls = (pageUrl: string, title: string, description?: string) => {
    return optimizer.generateSharingUrls(pageUrl, title, description)
  }

  return {
    optimizeForAllPlatforms,
    validateOptimization,
    generateMetaTags,
    generateSharingUrls
  }
}