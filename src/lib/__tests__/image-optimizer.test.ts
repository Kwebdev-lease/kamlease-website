import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ImageOptimizer, imageOptimizer } from '../image-optimizer'

describe('ImageOptimizer', () => {
  let optimizer: ImageOptimizer

  beforeEach(() => {
    optimizer = new ImageOptimizer()
  })

  describe('generateResponsiveImages', () => {
    it('should generate WebP and fallback srcSets', () => {
      const src = '/assets/images/hero.jpg'
      const result = optimizer.generateResponsiveImages(src)

      expect(result.webp.srcSet).toContain('320w.webp')
      expect(result.webp.srcSet).toContain('640w.webp')
      expect(result.webp.srcSet).toContain('1280w.webp')
      
      expect(result.fallback.srcSet).toContain('320w.jpg')
      expect(result.fallback.srcSet).toContain('640w.jpg')
      expect(result.fallback.srcSet).toContain('1280w.jpg')
    })

    it('should generate proper sizes attribute', () => {
      const src = '/assets/images/hero.jpg'
      const result = optimizer.generateResponsiveImages(src)

      expect(result.webp.sizes).toContain('(max-width: 320px) 280px')
      expect(result.webp.sizes).toContain('(max-width: 640px) 600px')
      expect(result.fallback.sizes).toBe(result.webp.sizes)
    })

    it('should generate placeholder image', () => {
      const src = '/assets/images/hero.jpg'
      const result = optimizer.generateResponsiveImages(src)

      expect(result.placeholder).toMatch(/^data:image\/svg\+xml;base64,/)
    })

    it('should handle different image formats', () => {
      const pngSrc = '/assets/images/logo.png'
      const jpgSrc = '/assets/images/hero.jpg'
      const svgSrc = '/assets/images/icon.svg'

      const pngResult = optimizer.generateResponsiveImages(pngSrc)
      const jpgResult = optimizer.generateResponsiveImages(jpgSrc)
      const svgResult = optimizer.generateResponsiveImages(svgSrc)

      expect(pngResult.fallback.srcSet).toContain('.png')
      expect(jpgResult.fallback.srcSet).toContain('.jpg')
      expect(svgResult.fallback.srcSet).toContain('.svg')
    })
  })

  describe('generateAltText', () => {
    it('should generate SEO-optimized alt text for logo context in French', () => {
      const altText = optimizer.generateAltText('logo', 'fr')
      
      expect(altText).toContain('Kamlease')
      expect(altText).toContain('mécatronique')
      expect(altText).toContain('électronique')
    })

    it('should generate SEO-optimized alt text for logo context in English', () => {
      const altText = optimizer.generateAltText('logo', 'en')
      
      expect(altText).toContain('Kamlease')
      expect(altText).toContain('mechatronics')
      expect(altText).toContain('electronics')
    })

    it('should generate context-specific alt text for hero images', () => {
      const frenchAlt = optimizer.generateAltText('hero', 'fr')
      const englishAlt = optimizer.generateAltText('hero', 'en')
      
      expect(frenchAlt).toContain('Équipe')
      expect(frenchAlt).toContain('solutions')
      expect(englishAlt).toContain('team')
      expect(englishAlt).toContain('solutions')
    })

    it('should generate context-specific alt text for services', () => {
      const frenchAlt = optimizer.generateAltText('services', 'fr')
      const englishAlt = optimizer.generateAltText('services', 'en')
      
      expect(frenchAlt).toContain('Services')
      expect(frenchAlt).toContain('ingénierie')
      expect(englishAlt).toContain('services')
      expect(englishAlt).toContain('engineering')
    })

    it('should generate context-specific alt text for expertise', () => {
      const frenchAlt = optimizer.generateAltText('expertise', 'fr')
      const englishAlt = optimizer.generateAltText('expertise', 'en')
      
      expect(frenchAlt).toContain('Expertise')
      expect(frenchAlt).toContain('technique')
      expect(englishAlt).toContain('expertise')
      expect(englishAlt).toContain('Technical')
    })

    it('should generate context-specific alt text for contact', () => {
      const frenchAlt = optimizer.generateAltText('contact', 'fr')
      const englishAlt = optimizer.generateAltText('contact', 'en')
      
      expect(frenchAlt).toContain('Bureau')
      expect(frenchAlt).toContain('Contact')
      expect(englishAlt).toContain('office')
      expect(englishAlt).toContain('Contact')
    })

    it('should handle generic context with fallback', () => {
      const frenchAlt = optimizer.generateAltText('unknown', 'fr')
      const englishAlt = optimizer.generateAltText('unknown', 'en')
      
      expect(frenchAlt).toContain('Kamlease')
      expect(frenchAlt).toContain('Solutions industrielles')
      expect(englishAlt).toContain('Kamlease')
      expect(englishAlt).toContain('Industrial solutions')
    })

    it('should incorporate custom keywords', () => {
      const customKeywords = ['innovation', 'développement']
      const altText = optimizer.generateAltText('unknown-context', 'fr', customKeywords)
      
      // The custom keywords should be included in the keyword phrase for generic contexts
      expect(altText).toContain('innovation')
    })
  })

  describe('optimizeForSEO', () => {
    it('should return complete optimized image data', () => {
      const imageData = {
        src: '/assets/images/hero.jpg',
        context: 'hero',
        keywords: ['innovation', 'technologie'],
        language: 'fr' as const
      }

      const result = optimizer.optimizeForSEO(imageData)

      expect(result.src).toBe(imageData.src)
      expect(result.alt).toContain('Kamlease')
      expect(result.responsive.webp.srcSet).toBeDefined()
      expect(result.responsive.fallback.srcSet).toBeDefined()
      expect(result.loading).toBe('eager') // Hero images should be eager
      expect(result.priority).toBe(true) // Hero images should be priority
    })

    it('should set lazy loading for non-priority contexts', () => {
      const imageData = {
        src: '/assets/images/service.jpg',
        context: 'services',
        keywords: [],
        language: 'fr' as const
      }

      const result = optimizer.optimizeForSEO(imageData)

      expect(result.loading).toBe('lazy')
      expect(result.priority).toBe(false)
    })

    it('should set eager loading for priority contexts', () => {
      const contexts = ['logo', 'hero', 'above-fold']
      
      contexts.forEach(context => {
        const imageData = {
          src: '/assets/images/test.jpg',
          context,
          keywords: [],
          language: 'fr' as const
        }

        const result = optimizer.optimizeForSEO(imageData)
        expect(result.loading).toBe('eager')
        expect(result.priority).toBe(true)
      })
    })
  })

  describe('WebP support detection', () => {
    it('should detect WebP support', async () => {
      // Mock Image constructor
      const mockImage = {
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        height: 2,
        src: ''
      }

      vi.stubGlobal('Image', vi.fn(() => mockImage))

      const supportPromise = ImageOptimizer.supportsWebP()
      
      // Simulate successful WebP load
      if (mockImage.onload) {
        mockImage.onload()
      }

      const isSupported = await supportPromise
      expect(isSupported).toBe(true)

      vi.unstubAllGlobals()
    })

    it('should handle WebP not supported', async () => {
      // Mock Image constructor
      const mockImage = {
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        height: 0, // Indicates WebP not supported
        src: ''
      }

      vi.stubGlobal('Image', vi.fn(() => mockImage))

      const supportPromise = ImageOptimizer.supportsWebP()
      
      // Simulate failed WebP load
      if (mockImage.onload) {
        mockImage.onload()
      }

      const isSupported = await supportPromise
      expect(isSupported).toBe(false)

      vi.unstubAllGlobals()
    })
  })

  describe('configuration', () => {
    it('should use custom configuration', () => {
      const customConfig = {
        breakpoints: [480, 768, 1024],
        quality: 90
      }

      const customOptimizer = new ImageOptimizer(customConfig)
      const result = customOptimizer.generateResponsiveImages('/test.jpg')

      expect(result.webp.srcSet).toContain('480w.webp')
      expect(result.webp.srcSet).toContain('768w.webp')
      expect(result.webp.srcSet).toContain('1024w.webp')
      expect(result.webp.srcSet).not.toContain('320w.webp')
    })

    it('should merge with default configuration', () => {
      const customConfig = {
        quality: 95
      }

      const customOptimizer = new ImageOptimizer(customConfig)
      const result = customOptimizer.generateResponsiveImages('/test.jpg')

      // Should still have default breakpoints
      expect(result.webp.srcSet).toContain('320w.webp')
      expect(result.webp.srcSet).toContain('640w.webp')
    })
  })

  describe('edge cases', () => {
    it('should handle images without extensions', () => {
      const src = '/assets/images/hero'
      const result = optimizer.generateResponsiveImages(src)

      expect(result.fallback.srcSet).toBeDefined()
      expect(result.webp.srcSet).toBeDefined()
    })

    it('should handle images with query parameters', () => {
      const src = '/assets/images/hero.jpg?v=123'
      const result = optimizer.generateResponsiveImages(src)

      expect(result.fallback.srcSet).toContain('hero-320w.jpg')
      expect(result.webp.srcSet).toContain('hero-320w.webp')
    })

    it('should handle empty context gracefully', () => {
      const altText = optimizer.generateAltText('', 'fr')
      
      expect(altText).toContain('Kamlease')
      expect(altText).toBeDefined()
      expect(altText.length).toBeGreaterThan(0)
    })

    it('should handle empty keywords array', () => {
      const imageData = {
        src: '/test.jpg',
        context: 'test',
        keywords: [],
        language: 'fr' as const
      }

      const result = optimizer.optimizeForSEO(imageData)
      expect(result.alt).toBeDefined()
      expect(result.alt.length).toBeGreaterThan(0)
    })
  })
})

describe('imageOptimizer singleton', () => {
  it('should export a singleton instance', () => {
    expect(imageOptimizer).toBeInstanceOf(ImageOptimizer)
  })

  it('should maintain state across calls', () => {
    const result1 = imageOptimizer.generateResponsiveImages('/test1.jpg')
    const result2 = imageOptimizer.generateResponsiveImages('/test2.jpg')

    expect(result1).toBeDefined()
    expect(result2).toBeDefined()
    expect(result1.webp.sizes).toBe(result2.webp.sizes) // Same configuration
  })
})