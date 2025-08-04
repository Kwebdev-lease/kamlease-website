/**
 * Image optimization service for SEO
 * Handles responsive images, WebP support, and SEO-optimized alt text generation
 */

export interface ResponsiveImageSet {
  webp: {
    srcSet: string
    sizes: string
  }
  fallback: {
    srcSet: string
    sizes: string
  }
  placeholder: string
}

export interface ImageSEOData {
  src: string
  context: string
  keywords: string[]
  language: 'fr' | 'en'
}

export interface OptimizedImage {
  src: string
  alt: string
  responsive: ResponsiveImageSet
  loading: 'lazy' | 'eager'
  priority: boolean
}

export interface ImageOptimizationConfig {
  breakpoints: number[]
  formats: string[]
  quality: number
  placeholder: {
    width: number
    height: number
    blur: number
  }
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  breakpoints: [320, 640, 768, 1024, 1280, 1536],
  formats: ['webp', 'jpg', 'png'],
  quality: 85,
  placeholder: {
    width: 20,
    height: 20,
    blur: 10
  }
}

/**
 * SEO-focused keywords for different contexts
 */
const SEO_KEYWORDS = {
  fr: {
    company: ['Kamlease', 'mécatronique', 'électronique', 'innovation'],
    services: ['solutions', 'développement', 'expertise', 'industriel'],
    technology: ['technologie', 'ingénierie', 'conception', 'optimisation'],
    automotive: ['automobile', 'auto-staging', 'adaptation', 'véhicule']
  },
  en: {
    company: ['Kamlease', 'mechatronics', 'electronics', 'innovation'],
    services: ['solutions', 'development', 'expertise', 'industrial'],
    technology: ['technology', 'engineering', 'design', 'optimization'],
    automotive: ['automotive', 'auto-staging', 'adaptation', 'vehicle']
  }
}

export class ImageOptimizer {
  private config: ImageOptimizationConfig

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Generate responsive image sets with WebP support
   */
  generateResponsiveImages(src: string): ResponsiveImageSet {
    const baseName = this.getBaseName(src)
    const extension = this.getExtension(src)
    
    // Generate WebP srcSet
    const webpSrcSet = this.config.breakpoints
      .map(width => `${baseName}-${width}w.webp ${width}w`)
      .join(', ')
    
    // Generate fallback srcSet
    const fallbackSrcSet = this.config.breakpoints
      .map(width => `${baseName}-${width}w.${extension} ${width}w`)
      .join(', ')
    
    // Generate sizes attribute for responsive behavior
    const sizes = this.generateSizesAttribute()
    
    // Generate placeholder (low-quality image placeholder)
    const placeholder = this.generatePlaceholder(src)

    return {
      webp: {
        srcSet: webpSrcSet,
        sizes
      },
      fallback: {
        srcSet: fallbackSrcSet,
        sizes
      },
      placeholder
    }
  }

  /**
   * Generate SEO-optimized alt text based on context and keywords
   */
  generateAltText(context: string, language: 'fr' | 'en', customKeywords: string[] = []): string {
    const keywords = SEO_KEYWORDS[language]
    const contextKeywords = this.getContextKeywords(context, keywords)
    const allKeywords = [...customKeywords, ...contextKeywords]
    
    // Generate descriptive alt text based on context
    switch (context.toLowerCase()) {
      case 'logo':
        return language === 'fr' 
          ? `Logo Kamlease - Solutions mécatroniques et électroniques innovantes`
          : `Kamlease Logo - Innovative mechatronics and electronics solutions`
      
      case 'hero':
        return language === 'fr'
          ? `Équipe Kamlease développant des solutions mécatroniques avancées pour l'industrie`
          : `Kamlease team developing advanced mechatronics solutions for industry`
      
      case 'services':
        return language === 'fr'
          ? `Services d'ingénierie mécatronique et électronique industrielle Kamlease`
          : `Kamlease mechatronics and industrial electronics engineering services`
      
      case 'expertise':
        return language === 'fr'
          ? `Expertise technique en développement de solutions mécatroniques innovantes`
          : `Technical expertise in innovative mechatronics solutions development`
      
      case 'contact':
        return language === 'fr'
          ? `Bureau Kamlease - Contact pour solutions mécatroniques et électroniques`
          : `Kamlease office - Contact for mechatronics and electronics solutions`
      
      default:
        // Generic alt text with SEO keywords
        const keywordPhrase = allKeywords.slice(0, 3).join(' ')
        return language === 'fr'
          ? `Image Kamlease - ${keywordPhrase} - Solutions industrielles`
          : `Kamlease image - ${keywordPhrase} - Industrial solutions`
    }
  }

  /**
   * Optimize image for SEO with all enhancements
   */
  optimizeForSEO(imageData: ImageSEOData): OptimizedImage {
    const responsive = this.generateResponsiveImages(imageData.src)
    const alt = this.generateAltText(imageData.context, imageData.language, imageData.keywords)
    
    // Determine loading strategy based on context
    const loading = this.determineLoadingStrategy(imageData.context)
    const priority = this.determinePriority(imageData.context)

    return {
      src: imageData.src,
      alt,
      responsive,
      loading,
      priority
    }
  }

  /**
   * Check if WebP is supported by the browser
   */
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  /**
   * Generate optimized image sizes for different screen sizes
   */
  private generateSizesAttribute(): string {
    return [
      '(max-width: 320px) 280px',
      '(max-width: 640px) 600px',
      '(max-width: 768px) 720px',
      '(max-width: 1024px) 980px',
      '(max-width: 1280px) 1200px',
      '1400px'
    ].join(', ')
  }

  /**
   * Generate low-quality placeholder for progressive loading
   */
  private generatePlaceholder(src: string): string {
    const baseName = this.getBaseName(src)
    const { width, height, blur } = this.config.placeholder
    
    // In a real implementation, this would generate a tiny, blurred version
    // For now, we'll use a data URL placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="8">Loading</text>
      </svg>
    `)}`
  }

  /**
   * Extract base name from image path
   */
  private getBaseName(src: string): string {
    const lastSlash = src.lastIndexOf('/')
    const lastDot = src.lastIndexOf('.')
    return src.substring(0, lastDot)
  }

  /**
   * Extract file extension from image path
   */
  private getExtension(src: string): string {
    const lastDot = src.lastIndexOf('.')
    return src.substring(lastDot + 1).toLowerCase()
  }

  /**
   * Get relevant keywords based on context
   */
  private getContextKeywords(context: string, keywords: typeof SEO_KEYWORDS.fr): string[] {
    const contextLower = context.toLowerCase()
    
    if (contextLower.includes('logo') || contextLower.includes('brand')) {
      return keywords.company
    }
    if (contextLower.includes('service') || contextLower.includes('expertise')) {
      return keywords.services
    }
    if (contextLower.includes('tech') || contextLower.includes('engineering')) {
      return keywords.technology
    }
    if (contextLower.includes('auto') || contextLower.includes('car')) {
      return keywords.automotive
    }
    
    return keywords.company // Default fallback
  }

  /**
   * Determine loading strategy based on image context
   */
  private determineLoadingStrategy(context: string): 'lazy' | 'eager' {
    const eagerContexts = ['logo', 'hero', 'above-fold']
    return eagerContexts.some(ctx => context.toLowerCase().includes(ctx)) ? 'eager' : 'lazy'
  }

  /**
   * Determine if image should be prioritized for loading
   */
  private determinePriority(context: string): boolean {
    const priorityContexts = ['logo', 'hero', 'main', 'above-fold']
    return priorityContexts.some(ctx => context.toLowerCase().includes(ctx))
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer()