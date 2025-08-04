import { describe, it, expect, beforeEach } from 'vitest'
import { SitemapGenerator, type RouteConfig, type SitemapEntry } from '../sitemap-generator'

describe('SitemapGenerator', () => {
  let generator: SitemapGenerator

  beforeEach(() => {
    generator = new SitemapGenerator()
  })

  describe('Route Discovery', () => {
    it('should discover default routes', () => {
      const routes = generator.getRoutes()
      
      expect(routes).toHaveLength(3) // Home, about, contact (excluding noindex pages)
      
      // Check home page
      const homePage = routes.find(r => r.path === '/')
      expect(homePage).toBeDefined()
      expect(homePage?.priority).toBe(1.0)
      expect(homePage?.changefreq).toBe('weekly')
      expect(homePage?.multilingual).toBe(true)
      
      // Check about page
      const aboutPage = routes.find(r => r.path === '/about')
      expect(aboutPage).toBeDefined()
      expect(aboutPage?.priority).toBe(0.8)
      expect(aboutPage?.changefreq).toBe('monthly')
      expect(aboutPage?.multilingual).toBe(true)
      
      // Check contact page
      const contactPage = routes.find(r => r.path === '/contact')
      expect(contactPage).toBeDefined()
      expect(contactPage?.priority).toBe(0.8)
      expect(contactPage?.changefreq).toBe('monthly')
      expect(contactPage?.multilingual).toBe(true)
    })

    it('should filter out noindex pages from routes', () => {
      const routes = generator.getRoutes()
      
      // Legal pages should not be included
      expect(routes.find(r => r.path === '/mentions-legales')).toBeUndefined()
      expect(routes.find(r => r.path === '/politique-confidentialite')).toBeUndefined()
    })
  })

  describe('Adding Pages', () => {
    it('should add a single page', () => {
      const initialCount = generator.getRoutes().length
      
      generator.addPage('/new-page', 0.7, 'monthly', false)
      
      const routes = generator.getRoutes()
      expect(routes).toHaveLength(initialCount + 1)
      
      const newPage = routes.find(r => r.path === '/new-page')
      expect(newPage).toBeDefined()
      expect(newPage?.priority).toBe(0.7)
      expect(newPage?.changefreq).toBe('monthly')
      expect(newPage?.multilingual).toBe(false)
    })

    it('should add a multilingual page', () => {
      const initialCount = generator.getRoutes().length
      
      generator.addMultilingualPage('/services', ['fr', 'en'], 0.9, 'weekly')
      
      const routes = generator.getRoutes()
      expect(routes).toHaveLength(initialCount + 1)
      
      const servicesPage = routes.find(r => r.path === '/services')
      expect(servicesPage).toBeDefined()
      expect(servicesPage?.priority).toBe(0.9)
      expect(servicesPage?.changefreq).toBe('weekly')
      expect(servicesPage?.multilingual).toBe(true)
    })
  })

  describe('Sitemap Entry Generation', () => {
    it('should generate correct sitemap entries for multilingual pages', () => {
      const entries = generator.getSitemapEntries()
      
      // Should have entries for both French and English versions
      const homeEntries = entries.filter(e => 
        e.url === 'https://kamlease.com' || e.url === 'https://kamlease.com/en'
      )
      expect(homeEntries.length).toBeGreaterThanOrEqual(2) // At least FR and EN
      
      // Check French version (default)
      const frHome = entries.find(e => e.url === 'https://kamlease.com')
      expect(frHome).toBeDefined()
      expect(frHome?.alternates).toBeDefined()
      expect(frHome?.alternates?.length).toBeGreaterThan(0)
      
      // Check English version
      const enHome = entries.find(e => e.url === 'https://kamlease.com/en')
      expect(enHome).toBeDefined()
      expect(enHome?.alternates).toBeDefined()
    })

    it('should generate correct alternate links', () => {
      const entries = generator.getSitemapEntries()
      const homeEntry = entries.find(e => e.url === 'https://kamlease.com')
      
      expect(homeEntry?.alternates).toBeDefined()
      const alternates = homeEntry?.alternates || []
      
      // Should have French, English, and x-default
      expect(alternates.find(a => a.hreflang === 'fr')).toBeDefined()
      expect(alternates.find(a => a.hreflang === 'en')).toBeDefined()
      expect(alternates.find(a => a.hreflang === 'x-default')).toBeDefined()
      
      // Check URLs are correct
      const frAlternate = alternates.find(a => a.hreflang === 'fr')
      expect(frAlternate?.href).toBe('https://kamlease.com')
      
      const enAlternate = alternates.find(a => a.hreflang === 'en')
      expect(enAlternate?.href).toBe('https://kamlease.com/en')
      
      const defaultAlternate = alternates.find(a => a.hreflang === 'x-default')
      expect(defaultAlternate?.href).toBe('https://kamlease.com')
    })

    it('should set correct lastmod timestamp', () => {
      const entries = generator.getSitemapEntries()
      const now = new Date()
      
      entries.forEach(entry => {
        const lastmod = new Date(entry.lastmod)
        expect(lastmod).toBeInstanceOf(Date)
        expect(lastmod.getTime()).toBeLessThanOrEqual(now.getTime())
        // Should be recent (within last minute)
        expect(now.getTime() - lastmod.getTime()).toBeLessThan(60000)
      })
    })
  })

  describe('XML Generation', () => {
    it('should generate valid XML structure', () => {
      const xml = generator.generateSitemap()
      
      // Check XML declaration
      expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
      
      // Check urlset element with namespaces
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml">')
      
      // Check closing tag
      expect(xml).toContain('</urlset>')
      
      // Check URL entries
      expect(xml).toContain('<url>')
      expect(xml).toContain('</url>')
      expect(xml).toContain('<loc>')
      expect(xml).toContain('<lastmod>')
      expect(xml).toContain('<changefreq>')
      expect(xml).toContain('<priority>')
    })

    it('should include hreflang alternate links', () => {
      const xml = generator.generateSitemap()
      
      // Check for xhtml:link elements
      expect(xml).toContain('<xhtml:link rel="alternate"')
      expect(xml).toContain('hreflang="fr"')
      expect(xml).toContain('hreflang="en"')
      expect(xml).toContain('hreflang="x-default"')
    })

    it('should escape XML special characters', () => {
      // Add a page with special characters
      generator.addPage('/test&page<with>quotes"and\'apostrophes', 0.5, 'monthly')
      
      const xml = generator.generateSitemap()
      
      // Should not contain unescaped special characters in URLs
      expect(xml).not.toContain('test&page<with>quotes"and\'apostrophes')
      
      // Should contain escaped versions
      expect(xml).toContain('&amp;')
      expect(xml).toContain('&lt;')
      expect(xml).toContain('&gt;')
      expect(xml).toContain('&quot;')
      expect(xml).toContain('&#39;')
    })

    it('should generate well-formed XML', () => {
      const xml = generator.generateSitemap()
      
      // Basic XML structure validation
      const urlMatches = xml.match(/<url>/g)
      const urlCloseMatches = xml.match(/<\/url>/g)
      expect(urlMatches?.length).toBe(urlCloseMatches?.length)
      
      const locMatches = xml.match(/<loc>/g)
      const locCloseMatches = xml.match(/<\/loc>/g)
      expect(locMatches?.length).toBe(locCloseMatches?.length)
    })
  })

  describe('Validation', () => {
    it('should validate a correct sitemap', () => {
      const validation = generator.validateSitemap()
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect invalid priorities', () => {
      // Add page with invalid priority
      generator.addPage('/invalid-priority', 1.5, 'monthly') // Priority > 1
      
      const validation = generator.validateSitemap()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(error => error.includes('Priority must be between 0 and 1'))).toBe(true)
    })

    it('should detect invalid changefreq values', () => {
      // Manually create a generator with invalid changefreq
      const testGenerator = new SitemapGenerator()
      // @ts-expect-error - Testing invalid value
      testGenerator.addPage('/invalid-changefreq', 0.5, 'invalid')
      
      const validation = testGenerator.validateSitemap()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(error => error.includes('Invalid changefreq value'))).toBe(true)
    })

    it('should validate URL formats', () => {
      const entries = generator.getSitemapEntries()
      
      entries.forEach(entry => {
        expect(entry.url).toMatch(/^https?:\/\//)
      })
    })
  })

  describe('Multilingual Support', () => {
    it('should handle French as default language', () => {
      const entries = generator.getSitemapEntries()
      const frHome = entries.find(e => e.url === 'https://kamlease.com')
      
      expect(frHome).toBeDefined()
      expect(frHome?.alternates?.find(a => a.hreflang === 'fr')?.href).toBe('https://kamlease.com')
    })

    it('should generate correct English URLs', () => {
      const entries = generator.getSitemapEntries()
      const enHome = entries.find(e => e.url === 'https://kamlease.com/en')
      const enAbout = entries.find(e => e.url === 'https://kamlease.com/en/about')
      
      expect(enHome).toBeDefined()
      expect(enAbout).toBeDefined()
    })

    it('should include x-default for international targeting', () => {
      const entries = generator.getSitemapEntries()
      
      entries.forEach(entry => {
        if (entry.alternates) {
          const xDefault = entry.alternates.find(a => a.hreflang === 'x-default')
          expect(xDefault).toBeDefined()
          expect(xDefault?.href).toMatch(/^https:\/\/kamlease\.com/)
        }
      })
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle empty routes gracefully', () => {
      const emptyGenerator = new SitemapGenerator()
      // Clear all routes
      emptyGenerator.getRoutes().length = 0
      
      const xml = emptyGenerator.generateSitemap()
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<urlset')
      expect(xml).toContain('</urlset>')
    })

    it('should handle large number of routes', () => {
      // Add many routes
      for (let i = 0; i < 1000; i++) {
        generator.addPage(`/page-${i}`, 0.5, 'monthly')
      }
      
      const xml = generator.generateSitemap()
      expect(xml).toBeTruthy()
      expect(xml.length).toBeGreaterThan(1000) // Should be substantial
      
      const validation = generator.validateSitemap()
      expect(validation.isValid).toBe(true)
    })

    it('should maintain consistent ordering', () => {
      const xml1 = generator.generateSitemap()
      const xml2 = generator.generateSitemap()
      
      // Should generate identical XML for same routes
      expect(xml1).toBe(xml2)
    })
  })
})