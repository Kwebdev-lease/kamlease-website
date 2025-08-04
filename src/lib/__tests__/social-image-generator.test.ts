import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SocialImageGenerator } from '../social-image-generator'
import { seoConfig } from '../seo-config'

// Mock canvas and context
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  toDataURL: vi.fn()
}

const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(),
  createLinearGradient: vi.fn(),
  addColorStop: vi.fn(),
  set fillStyle(value: string) {},
  set font(value: string) {},
  set textAlign(value: string) {}
}

// Mock document.createElement
Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas
    }
    return {}
  })
})

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src: string = ''
  
  constructor() {
    // Simulate successful image load after a short delay
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 10)
  }
} as any

describe('SocialImageGenerator', () => {
  let generator: SocialImageGenerator

  beforeEach(() => {
    generator = SocialImageGenerator.getInstance()
    
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup canvas mock
    mockCanvas.getContext.mockReturnValue(mockContext)
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock-image-data')
    
    // Setup gradient mock
    const mockGradient = {
      addColorStop: jest.fn()
    }
    mockContext.createLinearGradient.mockReturnValue(mockGradient)
    
    // Setup text measurement mock
    mockContext.measureText.mockReturnValue({ width: 100 })
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = SocialImageGenerator.getInstance()
      const instance2 = SocialImageGenerator.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('generateSocialImage', () => {
    const mockConfig = {
      title: 'Test Title',
      description: 'Test Description',
      language: 'fr' as const,
      type: 'default' as const
    }

    it('should generate social image with default dimensions', async () => {
      const result = await generator.generateSocialImage(mockConfig)
      
      expect(result.url).toBe('data:image/png;base64,mock-image-data')
      expect(result.width).toBe(1200)
      expect(result.height).toBe(630)
      expect(result.type).toBe('image/png')
      expect(result.alt).toContain('Test Title')
      expect(result.alt).toContain(seoConfig.site.name)
    })

    it('should generate social image with custom dimensions', async () => {
      const customDimensions = {
        width: 800,
        height: 400,
        format: 'jpg' as const
      }
      
      const result = await generator.generateSocialImage(mockConfig, customDimensions)
      
      expect(result.width).toBe(800)
      expect(result.height).toBe(400)
      expect(result.type).toBe('image/jpg')
    })

    it('should set canvas dimensions correctly', async () => {
      await generator.generateSocialImage(mockConfig)
      
      expect(mockCanvas.width).toBe(1200)
      expect(mockCanvas.height).toBe(630)
    })

    it('should clear canvas before drawing', async () => {
      await generator.generateSocialImage(mockConfig)
      
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 1200, 630)
    })

    it('should generate different backgrounds for different types', async () => {
      const configs = [
        { ...mockConfig, type: 'default' as const },
        { ...mockConfig, type: 'article' as const },
        { ...mockConfig, type: 'service' as const },
        { ...mockConfig, type: 'contact' as const }
      ]
      
      for (const config of configs) {
        await generator.generateSocialImage(config)
      }
      
      // Should create gradient for each type
      expect(mockContext.createLinearGradient).toHaveBeenCalledTimes(configs.length)
    })

    it('should handle image loading failure gracefully', async () => {
      // Mock image loading failure
      global.Image = class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        src: string = ''
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror()
            }
          }, 10)
        }
      } as any
      
      const result = await generator.generateSocialImage(mockConfig)
      
      // Should still generate image even if logo fails to load
      expect(result.url).toBe('data:image/png;base64,mock-image-data')
    })
  })

  describe('generateMultipleSocialImages', () => {
    const mockConfig = {
      title: 'Test Title',
      description: 'Test Description',
      language: 'fr' as const,
      type: 'default' as const
    }

    it('should generate images for all platforms', async () => {
      const result = await generator.generateMultipleSocialImages(mockConfig)
      
      expect(result.openGraph).toBeDefined()
      expect(result.twitter).toBeDefined()
      expect(result.linkedin).toBeDefined()
      
      expect(result.openGraph.width).toBe(1200)
      expect(result.openGraph.height).toBe(630)
      
      expect(result.twitter.width).toBe(1200)
      expect(result.twitter.height).toBe(600)
      
      expect(result.linkedin.width).toBe(1200)
      expect(result.linkedin.height).toBe(627)
    })
  })

  describe('getOptimizedSocialImageUrl', () => {
    it('should generate URL with correct parameters', () => {
      const url = generator.getOptimizedSocialImageUrl('home', 'fr', 'og')
      
      expect(url).toContain(seoConfig.site.url)
      expect(url).toContain('page=home')
      expect(url).toContain('lang=fr')
      expect(url).toContain('platform=og')
    })

    it('should handle different platforms', () => {
      const ogUrl = generator.getOptimizedSocialImageUrl('home', 'fr', 'og')
      const twitterUrl = generator.getOptimizedSocialImageUrl('home', 'fr', 'twitter')
      const linkedinUrl = generator.getOptimizedSocialImageUrl('home', 'fr', 'linkedin')
      
      expect(ogUrl).toContain('platform=og')
      expect(twitterUrl).toContain('platform=twitter')
      expect(linkedinUrl).toContain('platform=linkedin')
    })

    it('should handle different languages', () => {
      const frUrl = generator.getOptimizedSocialImageUrl('home', 'fr', 'og')
      const enUrl = generator.getOptimizedSocialImageUrl('home', 'en', 'og')
      
      expect(frUrl).toContain('lang=fr')
      expect(enUrl).toContain('lang=en')
    })
  })

  describe('DIMENSIONS constants', () => {
    it('should have correct Open Graph dimensions', () => {
      const dimensions = SocialImageGenerator.DIMENSIONS.OPEN_GRAPH
      
      expect(dimensions.width).toBe(1200)
      expect(dimensions.height).toBe(630)
      expect(dimensions.format).toBe('png')
    })

    it('should have correct Twitter Card dimensions', () => {
      const dimensions = SocialImageGenerator.DIMENSIONS.TWITTER_CARD
      
      expect(dimensions.width).toBe(1200)
      expect(dimensions.height).toBe(600)
      expect(dimensions.format).toBe('png')
    })

    it('should have correct LinkedIn dimensions', () => {
      const dimensions = SocialImageGenerator.DIMENSIONS.LINKEDIN
      
      expect(dimensions.width).toBe(1200)
      expect(dimensions.height).toBe(627)
      expect(dimensions.format).toBe('png')
    })

    it('should have correct Facebook dimensions', () => {
      const dimensions = SocialImageGenerator.DIMENSIONS.FACEBOOK
      
      expect(dimensions.width).toBe(1200)
      expect(dimensions.height).toBe(630)
      expect(dimensions.format).toBe('png')
    })
  })

  describe('preloadSocialImages', () => {
    it('should preload images for given page IDs', () => {
      const pageIds = ['home', 'about', 'contact']
      
      // Mock Image constructor to track created instances
      const imageInstances: any[] = []
      global.Image = class {
        src: string = ''
        constructor() {
          imageInstances.push(this)
        }
      } as any
      
      SocialImageGenerator.preloadSocialImages(pageIds, 'fr')
      
      expect(imageInstances).toHaveLength(pageIds.length)
      imageInstances.forEach((img, index) => {
        expect(img.src).toContain(`page=${pageIds[index]}`)
        expect(img.src).toContain('lang=fr')
      })
    })
  })

  describe('createConfigFromPageData', () => {
    it('should create config with correct properties', () => {
      const config = SocialImageGenerator.createConfigFromPageData(
        'Test Title',
        'Test Description',
        'fr',
        'service'
      )
      
      expect(config.title).toBe('Test Title')
      expect(config.description).toBe('Test Description')
      expect(config.language).toBe('fr')
      expect(config.type).toBe('service')
    })

    it('should handle default page type', () => {
      const config = SocialImageGenerator.createConfigFromPageData(
        'Test Title',
        'Test Description',
        'en'
      )
      
      expect(config.type).toBe('default')
    })
  })

  describe('fallback behavior', () => {
    it('should return default image when canvas is not available', async () => {
      // Create generator instance without canvas support
      const generatorWithoutCanvas = new (SocialImageGenerator as any)()
      generatorWithoutCanvas.canvas = null
      generatorWithoutCanvas.ctx = null
      
      const mockConfig = {
        title: 'Test Title',
        description: 'Test Description',
        language: 'fr' as const,
        type: 'default' as const
      }
      
      const result = await generatorWithoutCanvas.generateSocialImage(mockConfig)
      
      expect(result.url).toContain(seoConfig.site.logo)
      expect(result.alt).toContain('Test Title')
    })
  })

  describe('text wrapping', () => {
    it('should wrap long titles correctly', async () => {
      const longTitleConfig = {
        title: 'This is a very long title that should be wrapped across multiple lines to fit within the image boundaries',
        description: 'Short description',
        language: 'fr' as const,
        type: 'default' as const
      }
      
      // Mock measureText to return different widths
      let callCount = 0
      mockContext.measureText.mockImplementation(() => {
        callCount++
        return { width: callCount > 5 ? 1300 : 100 } // Simulate text getting too wide
      })
      
      await generator.generateSocialImage(longTitleConfig)
      
      // Should call fillText multiple times for wrapped text
      expect(mockContext.fillText).toHaveBeenCalled()
    })
  })

  describe('alt text generation', () => {
    it('should generate appropriate alt text in French', async () => {
      const config = {
        title: 'Solutions Mécatroniques',
        language: 'fr' as const,
        type: 'default' as const
      }
      
      const result = await generator.generateSocialImage(config)
      
      expect(result.alt).toContain('Image de partage social')
      expect(result.alt).toContain('Solutions Mécatroniques')
      expect(result.alt).toContain(seoConfig.site.name)
    })

    it('should generate appropriate alt text in English', async () => {
      const config = {
        title: 'Mechatronics Solutions',
        language: 'en' as const,
        type: 'default' as const
      }
      
      const result = await generator.generateSocialImage(config)
      
      expect(result.alt).toContain('Social sharing image')
      expect(result.alt).toContain('Mechatronics Solutions')
      expect(result.alt).toContain(seoConfig.site.name)
    })
  })
})