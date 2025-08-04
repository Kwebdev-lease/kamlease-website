import { seoConfig, PageSEOData } from './seo-config'
import { robotsManager } from './robots-config'
import { Language } from './translations'

export interface SEOValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number
}

export interface CanonicalUrlConfig {
  baseUrl: string
  path: string
  language: Language
  parameters?: Record<string, string>
}

export class SEOUtils {
  /**
   * Generate canonical URL with proper formatting
   */
  static generateCanonicalUrl(config: CanonicalUrlConfig): string {
    const { baseUrl, path, language, parameters } = config
    
    // Normalize the path
    let normalizedPath = path
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath
    }
    // Remove double slashes first
    normalizedPath = normalizedPath.replace(/\/+/g, '/')
    // Remove trailing slash except for root
    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1)
    }
    
    // Add language prefix for non-default languages
    const languagePrefix = language === 'en' ? '/en' : ''
    
    // Build the URL
    let canonicalUrl = `${baseUrl}${languagePrefix}${normalizedPath}`
    
    // Add parameters if provided
    if (parameters && Object.keys(parameters).length > 0) {
      const searchParams = new URLSearchParams(parameters)
      canonicalUrl += `?${searchParams.toString()}`
    }
    
    return canonicalUrl
  }

  /**
   * Validate page SEO configuration
   */
  static validatePageSEO(pageData: PageSEOData, language: Language): SEOValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let score = 100

    // Validate title
    const title = pageData.title[language]
    if (!title) {
      errors.push('Title is required')
      score -= 20
    } else {
      if (title.length < 30) {
        warnings.push('Title is too short (recommended: 30-60 characters)')
        score -= 5
      }
      if (title.length > 60) {
        warnings.push('Title is too long (recommended: 30-60 characters)')
        score -= 10
      }
    }

    // Validate description
    const description = pageData.description[language]
    if (!description) {
      errors.push('Description is required')
      score -= 20
    } else {
      if (description.length < 120) {
        warnings.push('Description is too short (recommended: 120-160 characters)')
        score -= 5
      }
      if (description.length > 160) {
        warnings.push('Description is too long (recommended: 120-160 characters)')
        score -= 10
      }
    }

    // Validate keywords
    if (!pageData.keywords || pageData.keywords.length === 0) {
      warnings.push('No keywords specified')
      score -= 10
    } else if (pageData.keywords.length > 10) {
      warnings.push('Too many keywords (recommended: 3-7 keywords)')
      score -= 5
    }

    // Validate canonical URL
    if (!pageData.canonicalUrl) {
      errors.push('Canonical URL is required')
      score -= 15
    }

    // Check for keyword stuffing in title
    if (title) {
      const titleWords = title.toLowerCase().split(/\s+/)
      const wordCount = titleWords.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const repeatedWords = Object.entries(wordCount).filter(([, count]) => count > 2)
      if (repeatedWords.length > 0) {
        warnings.push('Possible keyword stuffing in title')
        score -= 5
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    }
  }

  /**
   * Generate robots meta tag content
   */
  static generateRobotsMetaTag(pageData: PageSEOData): string {
    const directives: string[] = []
    
    // Index directive
    if (pageData.noindex) {
      directives.push('noindex')
    } else {
      directives.push('index')
    }
    
    // Follow directive
    if (pageData.nofollow) {
      directives.push('nofollow')
    } else {
      directives.push('follow')
    }
    
    // Additional directives for better SEO
    directives.push('max-snippet:-1')
    directives.push('max-image-preview:large')
    directives.push('max-video-preview:-1')
    
    return directives.join(', ')
  }

  /**
   * Extract keywords from content
   */
  static extractKeywords(content: string, language: Language): string[] {
    // Common stop words to filter out
    const stopWords = language === 'fr' 
      ? ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or', 'pour', 'avec', 'dans', 'sur', 'par', 'sans', 'sous', 'vers', 'chez', 'entre', 'depuis', 'pendant', 'avant', 'après', 'contre', 'selon', 'malgré', 'sauf', 'hormis', 'excepté', 'outre', 'parmi', 'moyennant', 'nonobstant', 'suivant', 'touchant', 'concernant', 'durant', 'moyennant']
      : ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'from', 'into', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once']
    
    // Extract words and filter (preserve accented characters for French)
    const words = content
      .toLowerCase()
      .replace(/[^\w\sàáâãäåèéêëìíîïòóôõöùúûüýÿçñ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
    
    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }

  /**
   * Calculate keyword density
   */
  static calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    const keywordLower = keyword.toLowerCase()
    const keywordOccurrences = words.filter(word => 
      word.replace(/[^\wàáâãäåèéêëìíîïòóôõöùúûüýÿçñ]/g, '') === keywordLower
    ).length
    
    return words.length > 0 ? (keywordOccurrences / words.length) * 100 : 0
  }

  /**
   * Generate structured data for breadcrumbs
   */
  static generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': crumb.url
      }))
    }
  }

  /**
   * Validate robots.txt content
   */
  static validateRobotsTxt(content: string): SEOValidationResult {
    return robotsManager.validateRobotsTxt(content)
  }

  /**
   * Generate optimized URL slug
   */
  static generateUrlSlug(text: string, language: Language): string {
    // Character replacements for French
    const frenchReplacements: Record<string, string> = {
      'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
      'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
      'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
      'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
      'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
      'ý': 'y', 'ÿ': 'y',
      'ç': 'c', 'ñ': 'n'
    }
    
    let slug = text.toLowerCase()
    
    // Replace accented characters
    if (language === 'fr') {
      Object.entries(frenchReplacements).forEach(([accented, replacement]) => {
        slug = slug.replace(new RegExp(accented, 'g'), replacement)
      })
    }
    
    // Replace spaces and special characters with hyphens
    slug = slug
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    
    return slug
  }

  /**
   * Check if URL is SEO-friendly
   */
  static isSEOFriendlyUrl(url: string): { isFriendly: boolean; suggestions: string[] } {
    const suggestions: string[] = []
    let isFriendly = true
    
    // Check length
    if (url.length > 100) {
      suggestions.push('URL is too long (recommended: under 100 characters)')
      isFriendly = false
    }
    
    // Check for special characters
    if (/[^a-zA-Z0-9\-\/]/.test(url)) {
      suggestions.push('URL contains special characters (use only letters, numbers, and hyphens)')
      isFriendly = false
    }
    
    // Check for uppercase letters
    if (/[A-Z]/.test(url)) {
      suggestions.push('URL contains uppercase letters (use lowercase only)')
      isFriendly = false
    }
    
    // Check for underscores
    if (url.includes('_')) {
      suggestions.push('URL contains underscores (use hyphens instead)')
      isFriendly = false
    }
    
    // Check for multiple consecutive hyphens
    if (url.includes('--')) {
      suggestions.push('URL contains multiple consecutive hyphens')
      isFriendly = false
    }
    
    // Check for trailing slash (except root)
    if (url.length > 1 && url.endsWith('/')) {
      suggestions.push('URL has trailing slash (remove for consistency)')
      isFriendly = false
    }
    
    return { isFriendly, suggestions }
  }

  /**
   * Generate meta description from content
   */
  static generateMetaDescription(content: string, keywords: string[] = []): string {
    // Remove HTML tags and extra whitespace
    const cleanContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Try to include primary keywords in the description
    let description = ''
    const sentences = cleanContent.split(/[.!?]+/)
    
    // Find sentences that contain keywords
    const keywordSentences = sentences.filter(sentence => 
      keywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    
    if (keywordSentences.length > 0) {
      description = keywordSentences[0].trim()
    } else {
      description = sentences[0]?.trim() || cleanContent
    }
    
    // Ensure description is within optimal length
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
    
    return description
  }
}

// Export utility functions
export const {
  generateCanonicalUrl,
  validatePageSEO,
  generateRobotsMetaTag,
  extractKeywords,
  calculateKeywordDensity,
  generateBreadcrumbStructuredData,
  validateRobotsTxt,
  generateUrlSlug,
  isSEOFriendlyUrl,
  generateMetaDescription
} = SEOUtils