import { describe, it, expect, beforeEach } from 'vitest'
import { RobotsManager, RobotsRule } from '../robots-config'

describe('RobotsManager', () => {
  let robotsManager: RobotsManager

  beforeEach(() => {
    robotsManager = RobotsManager.getInstance()
  })

  describe('generateRobotsTxt', () => {
    it('should generate valid robots.txt content', () => {
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain('User-agent: *')
      expect(content).toContain('Allow: /')
      expect(content).toContain('Sitemap: https://kamlease.com/sitemap.xml')
      expect(content).toContain('# Robots.txt for Kamlease')
    })

    it('should include specific user agent rules', () => {
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain('User-agent: Googlebot')
      expect(content).toContain('User-agent: Bingbot')
      expect(content).toContain('User-agent: Slurp')
      expect(content).toContain('Crawl-delay: 1')
      expect(content).toContain('Crawl-delay: 2')
    })

    it('should include disallow rules for sensitive directories', () => {
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain('Disallow: /node_modules/')
      expect(content).toContain('Disallow: /src/')
      expect(content).toContain('Disallow: /.git/')
      expect(content).toContain('Disallow: /*test*')
      expect(content).toContain('Disallow: /admin/')
    })

    it('should include multiple sitemap URLs', () => {
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain('Sitemap: https://kamlease.com/sitemap.xml')
      expect(content).toContain('Sitemap: https://kamlease.com/sitemap-fr.xml')
      expect(content).toContain('Sitemap: https://kamlease.com/sitemap-en.xml')
    })
  })

  describe('addRule', () => {
    it('should add a custom rule', () => {
      const customRule: RobotsRule = {
        userAgent: 'CustomBot',
        allow: ['/api/'],
        crawlDelay: 5
      }

      robotsManager.addRule(customRule)
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain('User-agent: CustomBot')
      expect(content).toContain('Allow: /api/')
      expect(content).toContain('Crawl-delay: 5')
    })
  })

  describe('addSitemap', () => {
    it('should add a new sitemap URL', () => {
      const newSitemapUrl = 'https://kamlease.com/sitemap-products.xml'
      
      robotsManager.addSitemap(newSitemapUrl)
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain(`Sitemap: ${newSitemapUrl}`)
    })

    it('should not add duplicate sitemap URLs', () => {
      const existingSitemapUrl = 'https://kamlease.com/sitemap.xml'
      
      robotsManager.addSitemap(existingSitemapUrl)
      const content = robotsManager.generateRobotsTxt()
      
      // Count occurrences of the sitemap URL
      const matches = content.match(new RegExp(existingSitemapUrl, 'g'))
      expect(matches?.length).toBe(1)
    })
  })

  describe('blockPath', () => {
    it('should block a specific path', () => {
      robotsManager.blockPath('/private-area/')
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain('Disallow: /private-area/')
    })
  })

  describe('allowPath', () => {
    it('should allow a specific path', () => {
      robotsManager.allowPath('/public-api/')
      const content = robotsManager.generateRobotsTxt()
      
      expect(content).toContain('Allow: /public-api/')
    })
  })

  describe('validateRobotsTxt', () => {
    it('should validate correct robots.txt content', () => {
      const validContent = `
User-agent: *
Allow: /
Disallow: /admin/
Crawl-delay: 1

Sitemap: https://example.com/sitemap.xml
      `.trim()

      const result = robotsManager.validateRobotsTxt(validContent)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing user-agent directive', () => {
      const invalidContent = `
Allow: /
Disallow: /admin/
      `.trim()

      const result = robotsManager.validateRobotsTxt(invalidContent)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Line 1: Allow directive must follow a User-agent directive')
      expect(result.errors).toContain('Line 2: Disallow directive must follow a User-agent directive')
    })

    it('should detect invalid crawl-delay value', () => {
      const invalidContent = `
User-agent: *
Crawl-delay: invalid
      `.trim()

      const result = robotsManager.validateRobotsTxt(invalidContent)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Line 2: Crawl-delay directive requires a numeric value')
    })

    it('should detect invalid sitemap URL', () => {
      const invalidContent = `
User-agent: *
Allow: /
Sitemap: not-a-valid-url
      `.trim()

      const result = robotsManager.validateRobotsTxt(invalidContent)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Line 3: Sitemap directive requires a valid URL')
    })

    it('should detect unknown directives', () => {
      const invalidContent = `
User-agent: *
Allow: /
UnknownDirective: value
      `.trim()

      const result = robotsManager.validateRobotsTxt(invalidContent)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Line 3: Unknown directive \'UnknownDirective\'')
    })

    it('should ignore comments and empty lines', () => {
      const validContent = `
# This is a comment
User-agent: *

Allow: /
# Another comment
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
      `.trim()

      const result = robotsManager.validateRobotsTxt(validContent)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = robotsManager.getConfig()
      
      expect(config).toHaveProperty('rules')
      expect(config).toHaveProperty('sitemaps')
      expect(config.rules).toBeInstanceOf(Array)
      expect(config.sitemaps).toBeInstanceOf(Array)
    })
  })

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const newConfig = {
        host: 'https://new-domain.com'
      }

      robotsManager.updateConfig(newConfig)
      const config = robotsManager.getConfig()
      
      expect(config.host).toBe('https://new-domain.com')
    })
  })
})