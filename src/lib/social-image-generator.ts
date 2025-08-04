import { Language } from './translations'
import { seoConfig } from './seo-config'

export interface SocialImageConfig {
  title: string
  description?: string
  language: Language
  type: 'default' | 'article' | 'service' | 'contact'
  customBackground?: string
  customLogo?: string
}

export interface SocialImageDimensions {
  width: number
  height: number
  format: 'png' | 'jpg' | 'webp'
}

export interface GeneratedSocialImage {
  url: string
  alt: string
  width: number
  height: number
  type: string
}

/**
 * Service for generating optimized social media sharing images
 */
export class SocialImageGenerator {
  private static instance: SocialImageGenerator
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  // Standard social media image dimensions
  static readonly DIMENSIONS = {
    OPEN_GRAPH: { width: 1200, height: 630, format: 'png' as const },
    TWITTER_CARD: { width: 1200, height: 600, format: 'png' as const },
    LINKEDIN: { width: 1200, height: 627, format: 'png' as const },
    FACEBOOK: { width: 1200, height: 630, format: 'png' as const }
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }

  static getInstance(): SocialImageGenerator {
    if (!SocialImageGenerator.instance) {
      SocialImageGenerator.instance = new SocialImageGenerator()
    }
    return SocialImageGenerator.instance
  }

  /**
   * Generate a social media image for the given configuration
   */
  async generateSocialImage(
    config: SocialImageConfig,
    dimensions: SocialImageDimensions = SocialImageGenerator.DIMENSIONS.OPEN_GRAPH
  ): Promise<GeneratedSocialImage> {
    // In test environment or when canvas is not available, return default image
    if (typeof window === 'undefined' || !this.canvas || !this.ctx) {
      return this.getDefaultSocialImage(config, dimensions)
    }

    try {
      // Set canvas dimensions
      this.canvas.width = dimensions.width
      this.canvas.height = dimensions.height

      // Clear canvas
      this.ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      // Draw background
      await this.drawBackground(config, dimensions)

      // Draw logo
      await this.drawLogo(config, dimensions)

      // Draw text content
      this.drawTextContent(config, dimensions)

      // Draw branding elements
      this.drawBrandingElements(config, dimensions)

      // Convert to data URL
      const dataUrl = this.canvas.toDataURL(`image/${dimensions.format}`, 0.9)

      return {
        url: dataUrl,
        alt: this.generateAltText(config),
        width: dimensions.width,
        height: dimensions.height,
        type: `image/${dimensions.format}`
      }
    } catch (error) {
      console.warn('Failed to generate social image, falling back to default:', error)
      return this.getDefaultSocialImage(config, dimensions)
    }
  }

  /**
   * Generate multiple social media images for different platforms
   */
  async generateMultipleSocialImages(config: SocialImageConfig): Promise<{
    openGraph: GeneratedSocialImage
    twitter: GeneratedSocialImage
    linkedin: GeneratedSocialImage
  }> {
    const [openGraph, twitter, linkedin] = await Promise.all([
      this.generateSocialImage(config, SocialImageGenerator.DIMENSIONS.OPEN_GRAPH),
      this.generateSocialImage(config, SocialImageGenerator.DIMENSIONS.TWITTER_CARD),
      this.generateSocialImage(config, SocialImageGenerator.DIMENSIONS.LINKEDIN)
    ])

    return { openGraph, twitter, linkedin }
  }

  /**
   * Get optimized social image URL for a page
   */
  getOptimizedSocialImageUrl(pageId: string, language: Language, platform: 'og' | 'twitter' | 'linkedin' = 'og'): string {
    const baseUrl = seoConfig.site.url
    const languagePrefix = language === 'en' ? '/en' : ''
    
    // In a real implementation, these would be pre-generated images
    // For now, return the default logo with query parameters for identification
    return `${baseUrl}${seoConfig.site.logo}?page=${pageId}&lang=${language}&platform=${platform}`
  }

  /**
   * Draw background gradient or image
   */
  private async drawBackground(config: SocialImageConfig, dimensions: SocialImageDimensions): Promise<void> {
    if (!this.ctx) return

    // Create gradient background based on type
    const gradient = this.ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height)
    
    switch (config.type) {
      case 'article':
        gradient.addColorStop(0, '#1e3a8a') // Blue
        gradient.addColorStop(1, '#1e40af')
        break
      case 'service':
        gradient.addColorStop(0, '#059669') // Green
        gradient.addColorStop(1, '#047857')
        break
      case 'contact':
        gradient.addColorStop(0, '#dc2626') // Red
        gradient.addColorStop(1, '#b91c1c')
        break
      default:
        gradient.addColorStop(0, '#111827') // Dark gray
        gradient.addColorStop(1, '#374151')
    }

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Add subtle pattern overlay
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    for (let i = 0; i < dimensions.width; i += 40) {
      for (let j = 0; j < dimensions.height; j += 40) {
        if ((i + j) % 80 === 0) {
          this.ctx.fillRect(i, j, 20, 20)
        }
      }
    }
  }

  /**
   * Draw company logo
   */
  private async drawLogo(config: SocialImageConfig, dimensions: SocialImageDimensions): Promise<void> {
    if (!this.ctx) return

    try {
      const logoUrl = config.customLogo || `${seoConfig.site.url}/assets/logos/Logo White for black background.svg`
      const img = new Image()
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject()
        img.src = logoUrl
      })

      // Draw logo in top-right corner
      const logoSize = Math.min(dimensions.width * 0.15, 120)
      const logoX = dimensions.width - logoSize - 40
      const logoY = 40

      this.ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
    } catch (error) {
      // Fallback: draw text logo
      this.ctx.fillStyle = '#ffffff'
      this.ctx.font = 'bold 32px Arial, sans-serif'
      this.ctx.textAlign = 'right'
      this.ctx.fillText(seoConfig.site.name, dimensions.width - 40, 80)
    }
  }

  /**
   * Draw text content (title and description)
   */
  private drawTextContent(config: SocialImageConfig, dimensions: SocialImageDimensions): void {
    if (!this.ctx) return

    const padding = 60
    const maxWidth = dimensions.width - (padding * 2) - 200 // Leave space for logo

    // Draw title
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px Arial, sans-serif'
    this.ctx.textAlign = 'left'
    
    const titleLines = this.wrapText(config.title, maxWidth, 48)
    let currentY = dimensions.height * 0.4

    titleLines.forEach((line, index) => {
      this.ctx!.fillText(line, padding, currentY + (index * 60))
    })

    // Draw description if provided
    if (config.description) {
      currentY += titleLines.length * 60 + 30
      this.ctx.fillStyle = '#e5e7eb'
      this.ctx.font = '28px Arial, sans-serif'
      
      const descriptionLines = this.wrapText(config.description, maxWidth, 28)
      descriptionLines.slice(0, 2).forEach((line, index) => { // Max 2 lines for description
        this.ctx!.fillText(line, padding, currentY + (index * 36))
      })
    }
  }

  /**
   * Draw branding elements
   */
  private drawBrandingElements(config: SocialImageConfig, dimensions: SocialImageDimensions): void {
    if (!this.ctx) return

    // Draw bottom border
    this.ctx.fillStyle = '#3b82f6'
    this.ctx.fillRect(0, dimensions.height - 8, dimensions.width, 8)

    // Draw website URL
    this.ctx.fillStyle = '#9ca3af'
    this.ctx.font = '20px Arial, sans-serif'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(seoConfig.site.url.replace('https://', ''), 60, dimensions.height - 30)

    // Draw language indicator
    const languageText = config.language === 'fr' ? 'Français' : 'English'
    this.ctx.textAlign = 'right'
    this.ctx.fillText(languageText, dimensions.width - 60, dimensions.height - 30)
  }

  /**
   * Wrap text to fit within specified width
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    if (!this.ctx) return [text]

    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    this.ctx.font = `${fontSize}px Arial, sans-serif`

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = this.ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  /**
   * Generate alt text for social image
   */
  private generateAltText(config: SocialImageConfig): string {
    const baseAlt = config.language === 'fr' 
      ? `Image de partage social pour "${config.title}" - ${seoConfig.site.name}`
      : `Social sharing image for "${config.title}" - ${seoConfig.site.name}`
    
    return baseAlt
  }

  /**
   * Get default social image when generation is not available
   */
  private getDefaultSocialImage(config: SocialImageConfig, dimensions: SocialImageDimensions): GeneratedSocialImage {
    const baseUrl = seoConfig.site.url
    const logoUrl = `${baseUrl}${seoConfig.site.logo}`

    return {
      url: logoUrl,
      alt: this.generateAltText(config),
      width: dimensions.width,
      height: dimensions.height,
      type: `image/${dimensions.format}`
    }
  }

  /**
   * Preload social images for better performance
   */
  static preloadSocialImages(pageIds: string[], language: Language): void {
    const generator = SocialImageGenerator.getInstance()
    
    pageIds.forEach(pageId => {
      const img = new Image()
      img.src = generator.getOptimizedSocialImageUrl(pageId, language, 'og')
      // Preload but don't wait for completion
    })
  }

  /**
   * Generate social image configuration from page data
   */
  static createConfigFromPageData(
    title: string,
    description: string,
    language: Language,
    pageType: 'default' | 'article' | 'service' | 'contact' = 'default'
  ): SocialImageConfig {
    return {
      title,
      description,
      language,
      type: pageType
    }
  }
}

/**
 * Hook for using social image generation in React components
 */
export function useSocialImageGenerator() {
  const generator = SocialImageGenerator.getInstance()

  const generateImage = async (config: SocialImageConfig, platform: 'og' | 'twitter' | 'linkedin' = 'og') => {
    const dimensions = platform === 'twitter' 
      ? SocialImageGenerator.DIMENSIONS.TWITTER_CARD
      : platform === 'linkedin'
      ? SocialImageGenerator.DIMENSIONS.LINKEDIN
      : SocialImageGenerator.DIMENSIONS.OPEN_GRAPH

    return generator.generateSocialImage(config, dimensions)
  }

  const getOptimizedUrl = (pageId: string, language: Language, platform: 'og' | 'twitter' | 'linkedin' = 'og') => {
    return generator.getOptimizedSocialImageUrl(pageId, language, platform)
  }

  return {
    generateImage,
    getOptimizedUrl,
    preloadImages: SocialImageGenerator.preloadSocialImages,
    createConfig: SocialImageGenerator.createConfigFromPageData
  }
}