import { seoConfig, pagesSEOData } from './seo-config'
import { Language } from './translations'

export interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  alternates?: AlternateLink[]
}

export interface AlternateLink {
  hreflang: string
  href: string
}

export interface RouteConfig {
  path: string
  priority: number
  changefreq: SitemapEntry['changefreq']
  multilingual: boolean
  noindex?: boolean
}

export class SitemapGenerator {
  private baseUrl: string
  private supportedLanguages: Language[]
  private defaultLanguage: Language
  private routes: RouteConfig[]

  constructor() {
    this.baseUrl = seoConfig.site.url
    this.supportedLanguages = seoConfig.site.supportedLanguages
    this.defaultLanguage = seoConfig.site.defaultLanguage
    this.routes = this.discoverRoutes()
  }

  /**
   * Automatically discover routes from the application
   */
  private discoverRoutes(): RouteConfig[] {
    // Define known routes with their SEO configuration
    const knownRoutes: RouteConfig[] = [
      {
        path: '/',
        priority: 1.0,
        changefreq: 'weekly',
        multilingual: true
      },
      {
        path: '/about',
        priority: 0.8,
        changefreq: 'monthly',
        multilingual: true
      },
      {
        path: '/contact',
        priority: 0.8,
        changefreq: 'monthly',
        multilingual: true
      },
      {
        path: '/mentions-legales',
        priority: 0.3,
        changefreq: 'yearly',
        multilingual: true,
        noindex: true
      },
      {
        path: '/politique-confidentialite',
        priority: 0.3,
        changefreq: 'yearly',
        multilingual: true,
        noindex: true
      }
    ]

    // Filter out noindex pages from sitemap
    return knownRoutes.filter(route => !route.noindex)
  }

  /**
   * Add a new page to the sitemap
   */
  addPage(url: string, priority: number, changefreq: SitemapEntry['changefreq'], multilingual: boolean = false): void {
    const route: RouteConfig = {
      path: url,
      priority,
      changefreq,
      multilingual
    }
    
    this.routes.push(route)
  }

  /**
   * Add a multilingual page with alternate language versions
   */
  addMultilingualPage(basePath: string, priority: number = 0.8, changefreq: SitemapEntry['changefreq'] = 'monthly'): void {
    const route: RouteConfig = {
      path: basePath,
      priority,
      changefreq,
      multilingual: true
    }
    
    this.routes.push(route)
  }

  /**
   * Generate alternate language links for a given path
   */
  private generateAlternateLinks(path: string): AlternateLink[] {
    const alternates: AlternateLink[] = []

    // Add all supported languages with proper URL mapping
    this.supportedLanguages.forEach(lang => {
      let href: string
      
      if (lang === this.defaultLanguage) {
        // Default language uses the base path
        href = `${this.baseUrl}${path === '/' ? '' : this.getLocalizedPath(path, lang)}`
      } else {
        // Other languages are prefixed
        const langPath = path === '/' ? `/${lang}` : `/${lang}${this.getLocalizedPath(path, lang)}`
        href = `${this.baseUrl}${langPath}`
      }
      
      alternates.push({
        hreflang: lang,
        href
      })
    })

    // Add x-default for international targeting (points to default language)
    alternates.push({
      hreflang: 'x-default',
      href: `${this.baseUrl}${path === '/' ? '' : this.getLocalizedPath(path, this.defaultLanguage)}`
    })

    return alternates
  }

  /**
   * Get localized path for a given route and language
   */
  private getLocalizedPath(path: string, language: Language): string {
    // Map paths to their localized versions
    const pathMappings: Record<string, Record<Language, string>> = {
      '/mentions-legales': {
        fr: '/mentions-legales',
        en: '/legal-notice'
      },
      '/politique-confidentialite': {
        fr: '/politique-confidentialite',
        en: '/privacy-policy'
      }
    }

    return pathMappings[path]?.[language] || path
  }

  /**
   * Generate sitemap entries from routes
   */
  private generateSitemapEntries(): SitemapEntry[] {
    const entries: SitemapEntry[] = []
    const now = new Date().toISOString()

    this.routes.forEach(route => {
      if (route.multilingual) {
        // Generate entries for each language
        this.supportedLanguages.forEach(lang => {
          let url: string
          const localizedPath = this.getLocalizedPath(route.path, lang)
          
          if (lang === this.defaultLanguage) {
            // Default language uses the base path
            url = `${this.baseUrl}${localizedPath === '/' ? '' : localizedPath}`
          } else {
            // Other languages are prefixed
            const langPath = localizedPath === '/' ? `/${lang}` : `/${lang}${localizedPath}`
            url = `${this.baseUrl}${langPath}`
          }

          entries.push({
            url,
            lastmod: now,
            changefreq: route.changefreq,
            priority: route.priority,
            alternates: this.generateAlternateLinks(route.path)
          })
        })
      } else {
        // Single language entry
        entries.push({
          url: `${this.baseUrl}${route.path === '/' ? '' : route.path}`,
          lastmod: now,
          changefreq: route.changefreq,
          priority: route.priority
        })
      }
    })

    return entries
  }

  /**
   * Generate the complete XML sitemap
   */
  generateSitemap(): string {
    const entries = this.generateSitemapEntries()
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

    entries.forEach(entry => {
      xml += '  <url>\n'
      xml += `    <loc>${this.escapeXml(entry.url)}</loc>\n`
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`
      xml += `    <priority>${entry.priority}</priority>\n`
      
      // Add alternate language links if present
      if (entry.alternates && entry.alternates.length > 0) {
        entry.alternates.forEach(alternate => {
          xml += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${this.escapeXml(alternate.href)}" />\n`
        })
      }
      
      xml += '  </url>\n'
    })

    xml += '</urlset>'
    
    return xml
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
   * Get all discovered routes
   */
  getRoutes(): RouteConfig[] {
    return [...this.routes]
  }

  /**
   * Get sitemap entries for inspection
   */
  getSitemapEntries(): SitemapEntry[] {
    return this.generateSitemapEntries()
  }

  /**
   * Validate the generated sitemap XML
   */
  validateSitemap(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      const xml = this.generateSitemap()
      
      // Basic XML validation
      if (!xml.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
        errors.push('Missing XML declaration')
      }
      
      if (!xml.includes('<urlset')) {
        errors.push('Missing urlset element')
      }
      
      if (!xml.includes('</urlset>')) {
        errors.push('Missing closing urlset tag')
      }
      
      // Validate entries
      const entries = this.generateSitemapEntries()
      entries.forEach((entry, index) => {
        if (!entry.url.startsWith('http')) {
          errors.push(`Entry ${index}: Invalid URL format`)
        }
        
        if (entry.priority < 0 || entry.priority > 1) {
          errors.push(`Entry ${index}: Priority must be between 0 and 1`)
        }
        
        const validChangefreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
        if (!validChangefreq.includes(entry.changefreq)) {
          errors.push(`Entry ${index}: Invalid changefreq value`)
        }
      })
      
    } catch (error) {
      errors.push(`XML generation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Export a default instance
export const sitemapGenerator = new SitemapGenerator()