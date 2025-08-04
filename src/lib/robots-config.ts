import { seoConfig } from './seo-config'

export interface RobotsRule {
  userAgent: string
  allow?: string[]
  disallow?: string[]
  crawlDelay?: number
}

export interface RobotsConfig {
  rules: RobotsRule[]
  sitemaps: string[]
  host?: string
  comments?: string[]
}

export class RobotsManager {
  private static instance: RobotsManager
  private config: RobotsConfig

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): RobotsManager {
    if (!RobotsManager.instance) {
      RobotsManager.instance = new RobotsManager()
    }
    return RobotsManager.instance
  }

  /**
   * Get default robots.txt configuration
   */
  private getDefaultConfig(): RobotsConfig {
    const baseUrl = seoConfig.site.url

    return {
      comments: [
        'Robots.txt for Kamlease - Solutions Mécatroniques et Électroniques',
        baseUrl
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
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap-fr.xml`,
        `${baseUrl}/sitemap-en.xml`
      ],
      host: baseUrl
    }
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    const lines: string[] = []

    // Add comments
    if (this.config.comments) {
      this.config.comments.forEach(comment => {
        lines.push(`# ${comment}`)
      })
      lines.push('')
    }

    // Add rules for each user agent
    this.config.rules.forEach((rule, index) => {
      if (index > 0) {
        lines.push('')
      }

      lines.push(`User-agent: ${rule.userAgent}`)

      // Add allow rules
      if (rule.allow) {
        rule.allow.forEach(path => {
          lines.push(`Allow: ${path}`)
        })
      }

      // Add disallow rules
      if (rule.disallow) {
        rule.disallow.forEach(path => {
          lines.push(`Disallow: ${path}`)
        })
      }

      // Add crawl delay
      if (rule.crawlDelay) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`)
      }
    })

    // Add host if specified
    if (this.config.host) {
      lines.push('')
      lines.push(`Host: ${this.config.host}`)
    }

    // Add sitemaps
    if (this.config.sitemaps && this.config.sitemaps.length > 0) {
      lines.push('')
      this.config.sitemaps.forEach(sitemap => {
        lines.push(`Sitemap: ${sitemap}`)
      })
    }

    return lines.join('\n')
  }

  /**
   * Add a custom rule
   */
  addRule(rule: RobotsRule): void {
    this.config.rules.push(rule)
  }

  /**
   * Add a sitemap URL
   */
  addSitemap(sitemapUrl: string): void {
    if (!this.config.sitemaps.includes(sitemapUrl)) {
      this.config.sitemaps.push(sitemapUrl)
    }
  }

  /**
   * Block a specific path for all user agents
   */
  blockPath(path: string): void {
    const globalRule = this.config.rules.find(rule => rule.userAgent === '*')
    if (globalRule) {
      if (!globalRule.disallow) {
        globalRule.disallow = []
      }
      if (!globalRule.disallow.includes(path)) {
        globalRule.disallow.push(path)
      }
    }
  }

  /**
   * Allow a specific path for all user agents
   */
  allowPath(path: string): void {
    const globalRule = this.config.rules.find(rule => rule.userAgent === '*')
    if (globalRule) {
      if (!globalRule.allow) {
        globalRule.allow = []
      }
      if (!globalRule.allow.includes(path)) {
        globalRule.allow.push(path)
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RobotsConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RobotsConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Validate robots.txt syntax
   */
  validateRobotsTxt(content: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const lines = content.split('\n')
    let currentUserAgent: string | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        continue
      }

      const [directive, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()

      switch (directive.toLowerCase()) {
        case 'user-agent':
          if (!value) {
            errors.push(`Line ${i + 1}: User-agent directive requires a value`)
          }
          currentUserAgent = value
          break

        case 'allow':
        case 'disallow':
          if (!currentUserAgent) {
            errors.push(`Line ${i + 1}: ${directive} directive must follow a User-agent directive`)
          }
          if (!value) {
            errors.push(`Line ${i + 1}: ${directive} directive requires a path value`)
          }
          break

        case 'crawl-delay':
          if (!currentUserAgent) {
            errors.push(`Line ${i + 1}: Crawl-delay directive must follow a User-agent directive`)
          }
          if (!value || isNaN(Number(value))) {
            errors.push(`Line ${i + 1}: Crawl-delay directive requires a numeric value`)
          }
          break

        case 'sitemap':
          if (!value || !this.isValidUrl(value)) {
            errors.push(`Line ${i + 1}: Sitemap directive requires a valid URL`)
          }
          break

        case 'host':
          if (!value || !this.isValidUrl(value)) {
            errors.push(`Line ${i + 1}: Host directive requires a valid URL`)
          }
          break

        default:
          errors.push(`Line ${i + 1}: Unknown directive '${directive}'`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if a URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const robotsManager = RobotsManager.getInstance()