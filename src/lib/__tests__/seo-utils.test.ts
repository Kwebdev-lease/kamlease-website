import { describe, it, expect } from 'vitest'
import { SEOUtils } from '../seo-utils'
import { PageSEOData } from '../seo-config'

describe('SEOUtils', () => {
  describe('generateCanonicalUrl', () => {
    it('should generate canonical URL for French page', () => {
      const config = {
        baseUrl: 'https://kamlease.com',
        path: '/about',
        language: 'fr' as const
      }

      const result = SEOUtils.generateCanonicalUrl(config)
      expect(result).toBe('https://kamlease.com/about')
    })

    it('should generate canonical URL for English page', () => {
      const config = {
        baseUrl: 'https://kamlease.com',
        path: '/about',
        language: 'en' as const
      }

      const result = SEOUtils.generateCanonicalUrl(config)
      expect(result).toBe('https://kamlease.com/en/about')
    })

    it('should normalize URL path', () => {
      const config = {
        baseUrl: 'https://kamlease.com',
        path: '//about//',
        language: 'fr' as const
      }

      const result = SEOUtils.generateCanonicalUrl(config)
      expect(result).toBe('https://kamlease.com/about')
    })

    it('should handle root path', () => {
      const config = {
        baseUrl: 'https://kamlease.com',
        path: '/',
        language: 'fr' as const
      }

      const result = SEOUtils.generateCanonicalUrl(config)
      expect(result).toBe('https://kamlease.com/')
    })

    it('should include parameters', () => {
      const config = {
        baseUrl: 'https://kamlease.com',
        path: '/search',
        language: 'fr' as const,
        parameters: { q: 'mechatronics', page: '1' }
      }

      const result = SEOUtils.generateCanonicalUrl(config)
      expect(result).toBe('https://kamlease.com/search?q=mechatronics&page=1')
    })
  })

  describe('validatePageSEO', () => {
    const validPageData: PageSEOData = {
      title: {
        fr: 'Solutions Mécatroniques - Kamlease',
        en: 'Mechatronics Solutions - Kamlease'
      },
      description: {
        fr: 'Découvrez nos solutions mécatroniques innovantes pour l\'industrie automobile et électronique. Expertise de 30 ans.',
        en: 'Discover our innovative mechatronics solutions for automotive and electronics industry. 30 years of expertise.'
      },
      keywords: ['mécatronique', 'électronique', 'automobile'],
      canonicalUrl: '/solutions',
      language: 'fr'
    }

    it('should validate correct page SEO data', () => {
      const result = SEOUtils.validatePageSEO(validPageData, 'fr')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.score).toBeGreaterThan(80)
    })

    it('should detect missing title', () => {
      const invalidData = {
        ...validPageData,
        title: { fr: '', en: 'English Title' }
      }

      const result = SEOUtils.validatePageSEO(invalidData, 'fr')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Title is required')
    })

    it('should detect missing description', () => {
      const invalidData = {
        ...validPageData,
        description: { fr: '', en: 'English Description' }
      }

      const result = SEOUtils.validatePageSEO(invalidData, 'fr')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Description is required')
    })

    it('should warn about short title', () => {
      const shortTitleData = {
        ...validPageData,
        title: { fr: 'Court', en: 'Short' }
      }

      const result = SEOUtils.validatePageSEO(shortTitleData, 'fr')
      
      expect(result.warnings).toContain('Title is too short (recommended: 30-60 characters)')
    })

    it('should warn about long title', () => {
      const longTitleData = {
        ...validPageData,
        title: { 
          fr: 'Titre très long qui dépasse largement la limite recommandée de 60 caractères pour les titres SEO',
          en: 'Very long title that exceeds the recommended limit'
        }
      }

      const result = SEOUtils.validatePageSEO(longTitleData, 'fr')
      
      expect(result.warnings).toContain('Title is too long (recommended: 30-60 characters)')
    })

    it('should warn about too many keywords', () => {
      const manyKeywordsData = {
        ...validPageData,
        keywords: Array.from({ length: 15 }, (_, i) => `keyword${i}`)
      }

      const result = SEOUtils.validatePageSEO(manyKeywordsData, 'fr')
      
      expect(result.warnings).toContain('Too many keywords (recommended: 3-7 keywords)')
    })
  })

  describe('generateRobotsMetaTag', () => {
    it('should generate default robots meta tag', () => {
      const pageData: PageSEOData = {
        title: { fr: 'Test', en: 'Test' },
        description: { fr: 'Test', en: 'Test' },
        keywords: [],
        canonicalUrl: '/test',
        language: 'fr'
      }

      const result = SEOUtils.generateRobotsMetaTag(pageData)
      
      expect(result).toBe('index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    })

    it('should generate noindex robots meta tag', () => {
      const pageData: PageSEOData = {
        title: { fr: 'Test', en: 'Test' },
        description: { fr: 'Test', en: 'Test' },
        keywords: [],
        canonicalUrl: '/test',
        language: 'fr',
        noindex: true
      }

      const result = SEOUtils.generateRobotsMetaTag(pageData)
      
      expect(result).toContain('noindex')
      expect(result).toContain('follow')
    })

    it('should generate nofollow robots meta tag', () => {
      const pageData: PageSEOData = {
        title: { fr: 'Test', en: 'Test' },
        description: { fr: 'Test', en: 'Test' },
        keywords: [],
        canonicalUrl: '/test',
        language: 'fr',
        nofollow: true
      }

      const result = SEOUtils.generateRobotsMetaTag(pageData)
      
      expect(result).toContain('index')
      expect(result).toContain('nofollow')
    })
  })

  describe('extractKeywords', () => {
    it('should extract keywords from French content', () => {
      const content = 'Solutions mécatroniques innovantes pour l\'industrie automobile et électronique'
      
      const keywords = SEOUtils.extractKeywords(content, 'fr')
      
      expect(keywords).toContain('solutions')
      expect(keywords).toContain('mécatroniques')
      expect(keywords).toContain('innovantes')
      expect(keywords).not.toContain('pour') // stop word
    })

    it('should extract keywords from English content', () => {
      const content = 'Innovative mechatronics solutions for automotive and electronics industry'
      
      const keywords = SEOUtils.extractKeywords(content, 'en')
      
      expect(keywords).toContain('innovative')
      expect(keywords).toContain('mechatronics')
      expect(keywords).toContain('solutions')
      expect(keywords).not.toContain('for') // stop word
    })

    it('should filter out short words', () => {
      const content = 'AI ML IoT big data solutions'
      
      const keywords = SEOUtils.extractKeywords(content, 'en')
      
      expect(keywords).toContain('solutions')
      expect(keywords).not.toContain('AI') // too short
      expect(keywords).not.toContain('ML') // too short
    })
  })

  describe('calculateKeywordDensity', () => {
    it('should calculate keyword density correctly', () => {
      const content = 'mécatronique solutions mécatronique innovation mécatronique'
      const keyword = 'mécatronique'
      
      const density = SEOUtils.calculateKeywordDensity(content, keyword)
      
      expect(density).toBeCloseTo(60, 1) // 3 out of 5 words = 60%
    })

    it('should handle empty content', () => {
      const density = SEOUtils.calculateKeywordDensity('', 'keyword')
      
      expect(density).toBe(0)
    })
  })

  describe('generateUrlSlug', () => {
    it('should generate URL slug from French text', () => {
      const text = 'Solutions Mécatroniques & Électroniques'
      
      const slug = SEOUtils.generateUrlSlug(text, 'fr')
      
      expect(slug).toBe('solutions-mecatroniques-electroniques')
    })

    it('should generate URL slug from English text', () => {
      const text = 'Mechatronics & Electronics Solutions'
      
      const slug = SEOUtils.generateUrlSlug(text, 'en')
      
      expect(slug).toBe('mechatronics-electronics-solutions')
    })

    it('should handle accented characters', () => {
      const text = 'Café à Paris'
      
      const slug = SEOUtils.generateUrlSlug(text, 'fr')
      
      expect(slug).toBe('cafe-a-paris')
    })

    it('should remove multiple hyphens', () => {
      const text = 'Multiple   Spaces & Special!!! Characters'
      
      const slug = SEOUtils.generateUrlSlug(text, 'en')
      
      expect(slug).toBe('multiple-spaces-special-characters')
    })
  })

  describe('isSEOFriendlyUrl', () => {
    it('should validate SEO-friendly URL', () => {
      const url = '/solutions-mecatroniques'
      
      const result = SEOUtils.isSEOFriendlyUrl(url)
      
      expect(result.isFriendly).toBe(true)
      expect(result.suggestions).toHaveLength(0)
    })

    it('should detect uppercase letters', () => {
      const url = '/Solutions-Mecatroniques'
      
      const result = SEOUtils.isSEOFriendlyUrl(url)
      
      expect(result.isFriendly).toBe(false)
      expect(result.suggestions).toContain('URL contains uppercase letters (use lowercase only)')
    })

    it('should detect underscores', () => {
      const url = '/solutions_mecatroniques'
      
      const result = SEOUtils.isSEOFriendlyUrl(url)
      
      expect(result.isFriendly).toBe(false)
      expect(result.suggestions).toContain('URL contains underscores (use hyphens instead)')
    })

    it('should detect special characters', () => {
      const url = '/solutions@mecatroniques'
      
      const result = SEOUtils.isSEOFriendlyUrl(url)
      
      expect(result.isFriendly).toBe(false)
      expect(result.suggestions).toContain('URL contains special characters (use only letters, numbers, and hyphens)')
    })

    it('should detect long URLs', () => {
      const url = '/' + 'a'.repeat(100)
      
      const result = SEOUtils.isSEOFriendlyUrl(url)
      
      expect(result.isFriendly).toBe(false)
      expect(result.suggestions).toContain('URL is too long (recommended: under 100 characters)')
    })
  })

  describe('generateMetaDescription', () => {
    it('should generate meta description from content', () => {
      const content = 'Kamlease propose des solutions mécatroniques innovantes. Nous avons 30 ans d\'expérience dans l\'industrie.'
      const keywords = ['mécatroniques', 'solutions']
      
      const description = SEOUtils.generateMetaDescription(content, keywords)
      
      expect(description).toContain('mécatroniques')
      expect(description.length).toBeLessThanOrEqual(160)
    })

    it('should truncate long descriptions', () => {
      const longContent = 'A'.repeat(200)
      
      const description = SEOUtils.generateMetaDescription(longContent)
      
      expect(description.length).toBeLessThanOrEqual(160)
      expect(description.endsWith('...')).toBe(true)
    })

    it('should remove HTML tags', () => {
      const htmlContent = '<p>Kamlease propose des <strong>solutions mécatroniques</strong> innovantes.</p>'
      
      const description = SEOUtils.generateMetaDescription(htmlContent)
      
      expect(description).not.toContain('<p>')
      expect(description).not.toContain('<strong>')
      expect(description).toContain('solutions mécatroniques')
    })
  })
})