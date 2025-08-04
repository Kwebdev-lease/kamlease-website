import { describe, it, expect, beforeEach } from 'vitest'
import { SitemapGenerator } from '../lib/sitemap-generator'
import { seoConfig } from '../lib/seo-config'

describe('Sitemap Integration Tests', () => {
  let generator: SitemapGenerator

  beforeEach(() => {
    generator = new SitemapGenerator()
  })

  describe('SEO Configuration Integration', () => {
    it('should use correct base URL from SEO config', () => {
      const entries = generator.getSitemapEntries()
      
      entries.forEach(entry => {
        expect(entry.url.startsWith(seoConfig.site.url)).toBe(true)
      })
    })

    it('should support all configured languages', () => {
      const entries = generator.getSitemapEntries()
      const languages = seoConfig.site.supportedLanguages
      
      // Check that we have entries for each supported language
      languages.forEach(lang => {
        if (lang === seoConfig.site.defaultLanguage) {
          // Default language should have base URLs
          const defaultLangEntries = entries.filter(e => 
            !e.url.includes(`/${lang}/`) && e.url.startsWith(seoConfig.site.url)
          )
          expect(defaultLangEntries.length).toBeGreaterThan(0)
        } else {
          // Other languages should have prefixed URLs
          const langEntries = entries.filter(e => e.url.includes(`/${lang}/`))
          expect(langEntries.length).toBeGreaterThan(0)
        }
      })
    })

    it('should include correct hreflang alternates for all languages', () => {
      const entries = generator.getSitemapEntries()
      const supportedLanguages = seoConfig.site.supportedLanguages
      
      entries.forEach(entry => {
        if (entry.alternates) {
          // Should have alternates for all supported languages plus x-default
          expect(entry.alternates.length).toBe(supportedLanguages.length + 1)
          
          // Check each supported language is present
          supportedLanguages.forEach(lang => {
            const langAlternate = entry.alternates?.find(a => a.hreflang === lang)
            expect(langAlternate).toBeDefined()
            expect(langAlternate?.href.startsWith(seoConfig.site.url)).toBe(true)
          })
          
          // Check x-default is present
          const xDefault = entry.alternates.find(a => a.hreflang === 'x-default')
          expect(xDefault).toBeDefined()
          expect(xDefault?.href.startsWith(seoConfig.site.url)).toBe(true)
        }
      })
    })
  })

  describe('XML Structure Validation', () => {
    it('should generate valid XML with proper namespaces', () => {
      const xml = generator.generateSitemap()
      
      // Check XML declaration
      expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
      
      // Check sitemap namespace
      expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
      
      // Check xhtml namespace for hreflang
      expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
      
      // Check proper structure
      expect(xml).toContain('<urlset')
      expect(xml).toContain('</urlset>')
    })

    it('should include all required sitemap elements', () => {
      const xml = generator.generateSitemap()
      
      // Check required elements are present
      expect(xml).toContain('<loc>')
      expect(xml).toContain('<lastmod>')
      expect(xml).toContain('<changefreq>')
      expect(xml).toContain('<priority>')
      
      // Check hreflang elements
      expect(xml).toContain('<xhtml:link rel="alternate"')
      expect(xml).toContain('hreflang=')
    })

    it('should properly escape XML characters', () => {
      // Add a route with special characters to test escaping
      generator.addPage('/test?param=value&other=test', 0.5, 'monthly')
      
      const xml = generator.generateSitemap()
      
      // Should contain escaped ampersand
      expect(xml).toContain('&amp;')
      // Should not contain unescaped ampersand in URLs
      expect(xml).not.toMatch(/<loc>[^<]*[^&]&[^a][^m][^p]/)
    })
  })

  describe('Multilingual URL Generation', () => {
    it('should generate correct French URLs (default language)', () => {
      const entries = generator.getSitemapEntries()
      
      // French URLs should not have language prefix
      const frenchEntries = entries.filter(e => 
        !e.url.includes('/en/') && e.url.startsWith('https://kamlease.com')
      )
      
      expect(frenchEntries.length).toBeGreaterThan(0)
      
      // Check specific French URLs
      expect(frenchEntries.some(e => e.url === 'https://kamlease.com')).toBe(true)
      expect(frenchEntries.some(e => e.url === 'https://kamlease.com/about')).toBe(true)
      expect(frenchEntries.some(e => e.url === 'https://kamlease.com/contact')).toBe(true)
    })

    it('should generate correct English URLs', () => {
      const entries = generator.getSitemapEntries()
      
      // English URLs should have /en/ prefix
      const englishEntries = entries.filter(e => e.url.includes('/en'))
      
      expect(englishEntries.length).toBeGreaterThan(0)
      
      // Check specific English URLs
      expect(englishEntries.some(e => e.url === 'https://kamlease.com/en')).toBe(true)
      expect(englishEntries.some(e => e.url === 'https://kamlease.com/en/about')).toBe(true)
      expect(englishEntries.some(e => e.url === 'https://kamlease.com/en/contact')).toBe(true)
    })

    it('should maintain consistent priority and changefreq across languages', () => {
      const entries = generator.getSitemapEntries()
      
      // Find corresponding French and English entries
      const frHome = entries.find(e => e.url === 'https://kamlease.com')
      const enHome = entries.find(e => e.url === 'https://kamlease.com/en')
      
      expect(frHome).toBeDefined()
      expect(enHome).toBeDefined()
      
      // Should have same priority and changefreq
      expect(frHome?.priority).toBe(enHome?.priority)
      expect(frHome?.changefreq).toBe(enHome?.changefreq)
    })
  })

  describe('SEO Best Practices', () => {
    it('should set appropriate priorities for different page types', () => {
      const entries = generator.getSitemapEntries()
      
      // Home page should have highest priority
      const homeEntries = entries.filter(e => 
        e.url === 'https://kamlease.com' || e.url === 'https://kamlease.com/en'
      )
      homeEntries.forEach(entry => {
        expect(entry.priority).toBe(1.0)
      })
      
      // Other pages should have lower or equal priority
      const otherEntries = entries.filter(e => 
        !e.url.endsWith('/') && !e.url.endsWith('/en')
      )
      otherEntries.forEach(entry => {
        expect(entry.priority).toBeLessThanOrEqual(1.0)
      })
    })

    it('should set reasonable changefreq values', () => {
      const entries = generator.getSitemapEntries()
      const validChangefreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
      
      entries.forEach(entry => {
        expect(validChangefreq).toContain(entry.changefreq)
      })
    })

    it('should include recent lastmod timestamps', () => {
      const entries = generator.getSitemapEntries()
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      entries.forEach(entry => {
        const lastmod = new Date(entry.lastmod)
        expect(lastmod).toBeInstanceOf(Date)
        expect(lastmod.getTime()).toBeGreaterThan(oneHourAgo.getTime())
        expect(lastmod.getTime()).toBeLessThanOrEqual(now.getTime())
      })
    })
  })

  describe('Validation and Error Handling', () => {
    it('should pass sitemap validation', () => {
      const validation = generator.validateSitemap()
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should handle missing or invalid data gracefully', () => {
      // Test with invalid priority
      generator.addPage('/invalid-priority', 2.0, 'monthly')
      
      const validation = generator.validateSitemap()
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.includes('Priority must be between 0 and 1'))).toBe(true)
    })

    it('should generate consistent output', () => {
      const xml1 = generator.generateSitemap()
      const xml2 = generator.generateSitemap()
      
      // Should generate identical XML (except for timestamps)
      const xml1WithoutTimestamp = xml1.replace(/<lastmod>.*?<\/lastmod>/g, '<lastmod>TIMESTAMP</lastmod>')
      const xml2WithoutTimestamp = xml2.replace(/<lastmod>.*?<\/lastmod>/g, '<lastmod>TIMESTAMP</lastmod>')
      
      expect(xml1WithoutTimestamp).toBe(xml2WithoutTimestamp)
    })
  })

  describe('Performance Considerations', () => {
    it('should handle reasonable number of URLs efficiently', () => {
      const startTime = Date.now()
      
      // Add many routes to test performance
      for (let i = 0; i < 100; i++) {
        generator.addMultilingualPage(`/page-${i}`, ['fr', 'en'], 0.5, 'monthly')
      }
      
      const xml = generator.generateSitemap()
      const endTime = Date.now()
      
      expect(xml).toBeTruthy()
      expect(xml.length).toBeGreaterThan(1000)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should generate compact but readable XML', () => {
      const xml = generator.generateSitemap()
      
      // Should be properly formatted but not excessively verbose
      expect(xml).toContain('\n') // Should have line breaks
      expect(xml).toContain('  ') // Should have indentation
      
      // Should not have excessive whitespace
      expect(xml).not.toMatch(/\n\s{10,}/) // No excessive indentation
    })
  })
})