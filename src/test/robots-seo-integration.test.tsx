import { describe, it, expect, beforeEach } from 'vitest'
import { robotsManager } from '../lib/robots-config'
import { SEOUtils } from '../lib/seo-utils'
import { seoConfig, pagesSEOData } from '../lib/seo-config'

describe('Robots.txt and SEO Integration', () => {
  beforeEach(() => {
    // Reset robots manager to default state by creating a new instance
    const defaultConfig = {
      comments: [
        'Robots.txt for Kamlease - Solutions Mécatroniques et Électroniques',
        'https://kamlease.com'
      ],
      rules: [
        {
          userAgent: '*',
          allow: ['/'],
          disallow: [
            '/node_modules/',
            '/src/',
            '/dist/',
            '/.git/',
            '/.vscode/',
            '/.kiro/',
            '/scripts/',
            '/*.json$',
            '/*.config.*',
            '/package*.json',
            '/tsconfig*.json',
            '/vite.config.*',
            '/vitest.config.*',
            '/tailwind.config.*',
            '/postcss.config.*',
            '/eslint.config.*',
            '/*test*',
            '/*__tests__*',
            '/*.test.*',
            '/*.spec.*',
            '/docs/',
            '/admin/',
            '/private/',
            '/temp/',
            '/tmp/'
          ]
        },
        {
          userAgent: 'Googlebot',
          allow: ['/'],
          crawlDelay: 1
        },
        {
          userAgent: 'Bingbot',
          allow: ['/'],
          crawlDelay: 1
        },
        {
          userAgent: 'Slurp',
          allow: ['/'],
          crawlDelay: 2
        }
      ],
      sitemaps: [
        'https://kamlease.com/sitemap.xml',
        'https://kamlease.com/sitemap-fr.xml',
        'https://kamlease.com/sitemap-en.xml'
      ],
      host: 'https://kamlease.com'
    }
    robotsManager.updateConfig(defaultConfig)
  })

  describe('Robots.txt Generation', () => {
    it('should generate a complete robots.txt file', () => {
      const robotsTxt = robotsManager.generateRobotsTxt()
      
      // Check basic structure
      expect(robotsTxt).toContain('User-agent: *')
      expect(robotsTxt).toContain('Allow: /')
      expect(robotsTxt).toContain('Sitemap: https://kamlease.com/sitemap.xml')
      
      // Check specific user agents
      expect(robotsTxt).toContain('User-agent: Googlebot')
      expect(robotsTxt).toContain('User-agent: Bingbot')
      expect(robotsTxt).toContain('User-agent: Slurp')
      
      // Check crawl delays
      expect(robotsTxt).toContain('Crawl-delay: 1')
      expect(robotsTxt).toContain('Crawl-delay: 2')
      
      // Check blocked directories
      expect(robotsTxt).toContain('Disallow: /node_modules/')
      expect(robotsTxt).toContain('Disallow: /src/')
      expect(robotsTxt).toContain('Disallow: /.git/')
      expect(robotsTxt).toContain('Disallow: /*test*')
      expect(robotsTxt).toContain('Disallow: /admin/')
      
      // Check multilingual sitemaps
      expect(robotsTxt).toContain('Sitemap: https://kamlease.com/sitemap-fr.xml')
      expect(robotsTxt).toContain('Sitemap: https://kamlease.com/sitemap-en.xml')
    })

    it('should validate generated robots.txt', () => {
      const robotsTxt = robotsManager.generateRobotsTxt()
      const validation = robotsManager.validateRobotsTxt(robotsTxt)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should allow customization of robots.txt', () => {
      // Add custom rule
      robotsManager.addRule({
        userAgent: 'CustomBot',
        allow: ['/api/'],
        disallow: ['/private/'],
        crawlDelay: 5
      })

      // Add custom sitemap
      robotsManager.addSitemap('https://kamlease.com/sitemap-products.xml')

      // Block additional path
      robotsManager.blockPath('/temp/')

      const robotsTxt = robotsManager.generateRobotsTxt()
      
      expect(robotsTxt).toContain('User-agent: CustomBot')
      expect(robotsTxt).toContain('Allow: /api/')
      expect(robotsTxt).toContain('Disallow: /private/')
      expect(robotsTxt).toContain('Crawl-delay: 5')
      expect(robotsTxt).toContain('Sitemap: https://kamlease.com/sitemap-products.xml')
      expect(robotsTxt).toContain('Disallow: /temp/')
    })
  })

  describe('SEO Configuration Integration', () => {
    it('should have valid SEO configuration', () => {
      expect(seoConfig.site.name).toBe('Kamlease')
      expect(seoConfig.site.url).toBe('https://kamlease.com')
      expect(seoConfig.site.defaultLanguage).toBe('fr')
      expect(seoConfig.site.supportedLanguages).toEqual(['fr', 'en'])
      
      // Check keywords
      expect(seoConfig.keywords.primary).toContain('solutions mécatroniques')
      expect(seoConfig.keywords.primary).toContain('électronique industrielle')
      expect(seoConfig.keywords.primary).toContain('auto-staging')
      
      // Check social links
      expect(seoConfig.social.linkedin).toBe('https://linkedin.com/company/kamlease')
      expect(seoConfig.social.twitter).toBe('@kamlease')
    })

    it('should validate all page SEO configurations', () => {
      Object.entries(pagesSEOData).forEach(([pageId, pageData]) => {
        // Validate French version
        const frValidation = SEOUtils.validatePageSEO(pageData, 'fr')
        expect(frValidation.isValid).toBe(true)
        expect(frValidation.score).toBeGreaterThan(70)

        // Validate English version
        const enValidation = SEOUtils.validatePageSEO(pageData, 'en')
        expect(enValidation.isValid).toBe(true)
        expect(enValidation.score).toBeGreaterThan(70)

        // Check canonical URLs are SEO-friendly
        const canonicalCheck = SEOUtils.isSEOFriendlyUrl(pageData.canonicalUrl)
        expect(canonicalCheck.isFriendly).toBe(true)
      })
    })

    it('should generate proper canonical URLs for all pages', () => {
      Object.entries(pagesSEOData).forEach(([pageId, pageData]) => {
        // French canonical URL
        const frCanonical = SEOUtils.generateCanonicalUrl({
          baseUrl: seoConfig.site.url,
          path: pageData.canonicalUrl,
          language: 'fr'
        })
        expect(frCanonical).toMatch(/^https:\/\/kamlease\.com\/[^\/]*$/)

        // English canonical URL
        const enCanonical = SEOUtils.generateCanonicalUrl({
          baseUrl: seoConfig.site.url,
          path: pageData.canonicalUrl,
          language: 'en'
        })
        expect(enCanonical).toMatch(/^https:\/\/kamlease\.com\/en\/[^\/]*$/)
      })
    })

    it('should generate proper robots meta tags', () => {
      Object.entries(pagesSEOData).forEach(([pageId, pageData]) => {
        const robotsMetaTag = SEOUtils.generateRobotsMetaTag(pageData)
        
        if (pageData.noindex) {
          expect(robotsMetaTag).toContain('noindex')
        } else {
          expect(robotsMetaTag).toContain('index')
        }

        if (pageData.nofollow) {
          expect(robotsMetaTag).toContain('nofollow')
        } else {
          expect(robotsMetaTag).toContain('follow')
        }

        // Should always include advanced directives
        expect(robotsMetaTag).toContain('max-snippet:-1')
        expect(robotsMetaTag).toContain('max-image-preview:large')
        expect(robotsMetaTag).toContain('max-video-preview:-1')
      })
    })
  })

  describe('URL and Content Optimization', () => {
    it('should generate SEO-friendly URL slugs', () => {
      const frenchText = 'Solutions Mécatroniques & Électroniques'
      const englishText = 'Mechatronics & Electronics Solutions'

      const frSlug = SEOUtils.generateUrlSlug(frenchText, 'fr')
      const enSlug = SEOUtils.generateUrlSlug(englishText, 'en')

      expect(frSlug).toBe('solutions-mecatroniques-electroniques')
      expect(enSlug).toBe('mechatronics-electronics-solutions')

      // Verify they are SEO-friendly
      const frCheck = SEOUtils.isSEOFriendlyUrl(`/${frSlug}`)
      const enCheck = SEOUtils.isSEOFriendlyUrl(`/${enSlug}`)

      expect(frCheck.isFriendly).toBe(true)
      expect(enCheck.isFriendly).toBe(true)
    })

    it('should extract relevant keywords from content', () => {
      const frenchContent = 'Kamlease propose des solutions mécatroniques innovantes pour l\'industrie automobile et électronique. Notre expertise de 30 ans nous permet de développer des produits sur mesure.'
      const englishContent = 'Kamlease offers innovative mechatronics solutions for automotive and electronics industry. Our 30 years of expertise allows us to develop custom products.'

      const frKeywords = SEOUtils.extractKeywords(frenchContent, 'fr')
      const enKeywords = SEOUtils.extractKeywords(englishContent, 'en')

      // French keywords
      expect(frKeywords).toContain('kamlease')
      expect(frKeywords).toContain('solutions')
      expect(frKeywords).toContain('mécatroniques')
      expect(frKeywords).toContain('innovantes')
      expect(frKeywords).toContain('industrie')
      expect(frKeywords).toContain('automobile')
      expect(frKeywords).toContain('électronique')

      // English keywords
      expect(enKeywords).toContain('kamlease')
      expect(enKeywords).toContain('innovative')
      expect(enKeywords).toContain('mechatronics')
      expect(enKeywords).toContain('solutions')
      expect(enKeywords).toContain('automotive')
      expect(enKeywords).toContain('electronics')
      expect(enKeywords).toContain('industry')
    })

    it('should calculate keyword density correctly', () => {
      const content = 'mécatronique solutions mécatronique innovation mécatronique développement'
      const density = SEOUtils.calculateKeywordDensity(content, 'mécatronique')
      
      // 3 occurrences out of 6 words = 50%
      expect(density).toBeCloseTo(50, 1)
    })

    it('should generate optimized meta descriptions', () => {
      const content = 'Kamlease est une entreprise spécialisée en solutions mécatroniques. Nous développons des produits innovants pour l\'industrie automobile et électronique depuis plus de 30 ans.'
      const keywords = ['mécatroniques', 'solutions', 'automobile']

      const description = SEOUtils.generateMetaDescription(content, keywords)

      expect(description.length).toBeLessThanOrEqual(160)
      expect(description).toContain('mécatroniques')
      expect(description).toContain('Kamlease')
    })
  })

  describe('Multilingual SEO Support', () => {
    it('should handle French and English content properly', () => {
      const homePageData = pagesSEOData.home

      // Check both languages have proper titles and descriptions
      expect(homePageData.title.fr).toContain('Kamlease')
      expect(homePageData.title.fr).toContain('Mécatroniques')
      expect(homePageData.title.en).toContain('Kamlease')
      expect(homePageData.title.en).toContain('Mechatronics')

      expect(homePageData.description.fr).toContain('solutions')
      expect(homePageData.description.fr).toContain('mécatronique')
      expect(homePageData.description.en).toContain('solutions')
      expect(homePageData.description.en).toContain('mechatronics')
    })

    it('should generate proper hreflang URLs', () => {
      const basePath = '/about'
      
      const frCanonical = SEOUtils.generateCanonicalUrl({
        baseUrl: seoConfig.site.url,
        path: basePath,
        language: 'fr'
      })
      
      const enCanonical = SEOUtils.generateCanonicalUrl({
        baseUrl: seoConfig.site.url,
        path: basePath,
        language: 'en'
      })

      expect(frCanonical).toBe('https://kamlease.com/about')
      expect(enCanonical).toBe('https://kamlease.com/en/about')
    })
  })

  describe('SEO Best Practices Compliance', () => {
    it('should have proper keyword distribution', () => {
      const primaryKeywords = seoConfig.keywords.primary
      const secondaryKeywords = seoConfig.keywords.secondary
      const longTailKeywords = seoConfig.keywords.longTail

      // Should have reasonable number of keywords
      expect(primaryKeywords.length).toBeGreaterThan(3)
      expect(primaryKeywords.length).toBeLessThan(10)
      expect(secondaryKeywords.length).toBeGreaterThan(5)
      expect(longTailKeywords.length).toBeGreaterThan(3)

      // Primary keywords should be in both languages
      const frenchKeywords = primaryKeywords.filter(k => k.includes('é') || k.includes('è') || k.includes('à'))
      const englishKeywords = primaryKeywords.filter(k => !k.includes('é') && !k.includes('è') && !k.includes('à'))
      
      expect(frenchKeywords.length).toBeGreaterThan(0)
      expect(englishKeywords.length).toBeGreaterThan(0)
    })

    it('should have proper page hierarchy and structure', () => {
      const pages = Object.keys(pagesSEOData)
      
      // Should have essential pages
      expect(pages).toContain('home')
      expect(pages).toContain('about')
      expect(pages).toContain('contact')
      
      // Legal pages should be noindex
      expect(pagesSEOData['legal-notice']?.noindex).toBe(true)
      expect(pagesSEOData['privacy-policy']?.noindex).toBe(true)
      
      // Main pages should be indexable
      expect(pagesSEOData.home.noindex).toBeFalsy()
      expect(pagesSEOData.about.noindex).toBeFalsy()
      expect(pagesSEOData.contact.noindex).toBeFalsy()
    })

    it('should block sensitive directories in robots.txt', () => {
      const robotsTxt = robotsManager.generateRobotsTxt()
      
      const sensitiveDirs = [
        '/node_modules/',
        '/src/',
        '/.git/',
        '/.vscode/',
        '/.kiro/',
        '/scripts/',
        '/admin/',
        '/private/',
        '/*test*'
      ]

      sensitiveDirs.forEach(dir => {
        expect(robotsTxt).toContain(`Disallow: ${dir}`)
      })
    })

    it('should allow important assets and pages', () => {
      const robotsTxt = robotsManager.generateRobotsTxt()
      
      // Check that main access is allowed
      expect(robotsTxt).toContain('Allow: /')
      
      // Important assets should not be specifically blocked
      expect(robotsTxt).not.toContain('Disallow: /assets/')
      expect(robotsTxt).not.toContain('Disallow: /public/')
      expect(robotsTxt).not.toContain('Disallow: /favicon.svg')
      expect(robotsTxt).not.toContain('Disallow: /Logo/')
      
      // But sensitive directories should be blocked
      expect(robotsTxt).toContain('Disallow: /node_modules/')
      expect(robotsTxt).toContain('Disallow: /src/')
      expect(robotsTxt).toContain('Disallow: /.git/')
    })
  })
})