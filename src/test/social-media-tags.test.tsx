import { render } from '@testing-library/react'
import { HelmetProvider, HelmetData } from 'react-helmet-async'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SEOHead } from '@/components/SEOHead'
import { SEOMetaManager } from '@/lib/seo-meta-manager'
import { pagesSEOData, seoConfig } from '@/lib/seo-config'
import { SocialImageGenerator } from '@/lib/social-image-generator'

let helmetContext: { helmet?: HelmetData }

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  helmetContext = {}
  return (
    <HelmetProvider context={helmetContext}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </HelmetProvider>
  )
}

// Helper function to get meta tag content from helmet context
const getMetaContent = (property: string, attribute: 'property' | 'name' = 'property'): string | null => {
  if (!helmetContext.helmet) return null
  
  const metaTags = helmetContext.helmet.meta.toString()
  // Try different regex patterns to match the meta tags
  const patterns = [
    new RegExp(`<meta\\s+${attribute}="${property}"\\s+content="([^"]*)"`, 'i'),
    new RegExp(`<meta\\s+content="([^"]*)"\\s+${attribute}="${property}"`, 'i'),
    new RegExp(`${attribute}="${property}"[^>]*content="([^"]*)"`, 'i')
  ]
  
  for (const regex of patterns) {
    const match = metaTags.match(regex)
    if (match) return match[1]
  }
  
  return null
}

// Helper function to check if meta tag exists
const hasMetaTag = (property: string, attribute: 'property' | 'name' = 'property'): boolean => {
  if (!helmetContext.helmet) return false
  
  const metaTags = helmetContext.helmet.meta.toString()
  return metaTags.includes(`${attribute}="${property}"`)
}

describe('Social Media Tags Integration', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    helmetContext = {}
  })

  describe('Open Graph Tags', () => {
    it('should render all required Open Graph meta tags', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      // Debug: log the helmet context
      console.log('Helmet context:', helmetContext.helmet?.meta.toString())

      // Basic Open Graph tags
      expect(hasMetaTag('og:title')).toBeTruthy()
      expect(hasMetaTag('og:description')).toBeTruthy()
      expect(hasMetaTag('og:image')).toBeTruthy()
      expect(hasMetaTag('og:url')).toBeTruthy()
      expect(hasMetaTag('og:type')).toBeTruthy()
      expect(hasMetaTag('og:site_name')).toBeTruthy()
      expect(hasMetaTag('og:locale')).toBeTruthy()
      expect(hasMetaTag('og:locale:alternate')).toBeTruthy()
    })

    it('should render enhanced Open Graph image properties', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(hasMetaTag('og:image:alt')).toBeTruthy()
      expect(hasMetaTag('og:image:width')).toBeTruthy()
      expect(hasMetaTag('og:image:height')).toBeTruthy()
      expect(hasMetaTag('og:image:type')).toBeTruthy()

      expect(getMetaContent('og:image:width')).toBe('1200')
      expect(getMetaContent('og:image:height')).toBe('630')
      expect(getMetaContent('og:image:type')).toBe('image/png')
    })

    it('should use business.business type for home page', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(getMetaContent('og:type')).toBe('business.business')
    })

    it('should render correct locale and alternate locale', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(getMetaContent('og:locale')).toBe('fr_FR')
      expect(getMetaContent('og:locale:alternate')).toBe('en_US')
    })

    it('should use social-specific image when available', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      const ogImageContent = getMetaContent('og:image')
      expect(ogImageContent).toContain('/assets/social/home-og.png')
    })
  })

  describe('Twitter Cards', () => {
    it('should render all required Twitter Card meta tags', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(hasMetaTag('twitter:card', 'name')).toBeTruthy()
      expect(hasMetaTag('twitter:title', 'name')).toBeTruthy()
      expect(hasMetaTag('twitter:description', 'name')).toBeTruthy()
      expect(hasMetaTag('twitter:image', 'name')).toBeTruthy()
      expect(hasMetaTag('twitter:image:alt', 'name')).toBeTruthy()
      expect(hasMetaTag('twitter:site', 'name')).toBeTruthy()
      expect(hasMetaTag('twitter:creator', 'name')).toBeTruthy()
    })

    it('should use summary_large_image card type by default', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(getMetaContent('twitter:card', 'name')).toBe('summary_large_image')
    })

    it('should use Twitter-specific image when available', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      const twitterImageContent = getMetaContent('twitter:image', 'name')
      expect(twitterImageContent).toContain('/assets/social/home-twitter.png')
    })

    it('should include Twitter site and creator from config', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(getMetaContent('twitter:site', 'name')).toBe('@kamlease')
      expect(getMetaContent('twitter:creator', 'name')).toBe('@kamlease')
    })
  })

  describe('LinkedIn and Facebook Tags', () => {
    it('should render LinkedIn-specific article author tag', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(getMetaContent('article:author')).toBe(seoConfig.site.name)
    })

    it('should render Facebook app ID when configured', () => {
      // Mock Facebook app ID
      const originalConfig = seoConfig.socialMedia.facebook.appId
      seoConfig.socialMedia.facebook.appId = '123456789'

      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      expect(getMetaContent('fb:app_id')).toBe('123456789')

      // Restore original config
      seoConfig.socialMedia.facebook.appId = originalConfig
    })
  })

  describe('Custom Social Media Properties', () => {
    it('should handle custom Open Graph properties', () => {
      const customPageData = {
        ...pagesSEOData.home,
        openGraph: {
          type: 'article' as const,
          imageWidth: 800,
          imageHeight: 600,
          imageAlt: 'Custom alt text',
          article: {
            author: 'John Doe',
            publishedTime: '2023-01-01T00:00:00Z',
            section: 'Technology',
            tags: ['mechatronics', 'innovation']
          }
        }
      }

      render(
        <TestWrapper>
          <SEOHead pageData={customPageData} />
        </TestWrapper>
      )

      expect(getMetaContent('og:type')).toBe('article')
      expect(getMetaContent('og:image:width')).toBe('800')
      expect(getMetaContent('og:image:height')).toBe('600')
      expect(getMetaContent('article:author')).toBe('John Doe')
      expect(getMetaContent('article:published_time')).toBe('2023-01-01T00:00:00Z')
      expect(getMetaContent('article:section')).toBe('Technology')
    })

    it('should handle custom Twitter Card properties', () => {
      const customPageData = {
        ...pagesSEOData.home,
        twitter: {
          card: 'summary' as const,
          site: '@custom_site',
          creator: '@custom_creator',
          imageAlt: 'Custom Twitter alt text'
        }
      }

      render(
        <TestWrapper>
          <SEOHead pageData={customPageData} />
        </TestWrapper>
      )

      expect(getMetaContent('twitter:card', 'name')).toBe('summary')
      expect(getMetaContent('twitter:site', 'name')).toBe('@custom_site')
      expect(getMetaContent('twitter:creator', 'name')).toBe('@custom_creator')
      expect(getMetaContent('twitter:image:alt', 'name')).toBe('Custom Twitter alt text')
    })
  })

  describe('SEOMetaManager Social Media Integration', () => {
    let seoManager: SEOMetaManager

    beforeEach(() => {
      seoManager = SEOMetaManager.getInstance()
    })

    it('should generate correct Open Graph data', () => {
      seoManager.updatePageMeta(pagesSEOData.home, 'fr')

      const ogTitle = document.querySelector('meta[property="og:title"]')
      const ogDescription = document.querySelector('meta[property="og:description"]')
      const ogImage = document.querySelector('meta[property="og:image"]')
      const ogType = document.querySelector('meta[property="og:type"]')

      expect(ogTitle?.getAttribute('content')).toBe(pagesSEOData.home.title.fr)
      expect(ogDescription?.getAttribute('content')).toBe(pagesSEOData.home.description.fr)
      expect(ogImage?.getAttribute('content')).toContain('kamlease.com')
      expect(ogType?.getAttribute('content')).toBe('business.business')
    })

    it('should generate correct Twitter Card data', () => {
      seoManager.updatePageMeta(pagesSEOData.home, 'fr')

      const twitterCard = document.querySelector('meta[name="twitter:card"]')
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')
      const twitterDescription = document.querySelector('meta[name="twitter:description"]')
      const twitterImage = document.querySelector('meta[name="twitter:image"]')

      expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
      expect(twitterTitle?.getAttribute('content')).toBe(pagesSEOData.home.title.fr)
      expect(twitterDescription?.getAttribute('content')).toBe(pagesSEOData.home.description.fr)
      expect(twitterImage?.getAttribute('content')).toContain('kamlease.com')
    })

    it('should handle language switching for social media tags', () => {
      // Test French
      seoManager.updatePageMeta(pagesSEOData.home, 'fr')
      let ogTitle = document.querySelector('meta[property="og:title"]')
      let ogLocale = document.querySelector('meta[property="og:locale"]')
      
      expect(ogTitle?.getAttribute('content')).toBe(pagesSEOData.home.title.fr)
      expect(ogLocale?.getAttribute('content')).toBe('fr_FR')

      // Test English
      seoManager.updatePageMeta(pagesSEOData.home, 'en')
      ogTitle = document.querySelector('meta[property="og:title"]')
      ogLocale = document.querySelector('meta[property="og:locale"]')
      
      expect(ogTitle?.getAttribute('content')).toBe(pagesSEOData.home.title.en)
      expect(ogLocale?.getAttribute('content')).toBe('en_US')
    })
  })

  describe('Social Image Generator', () => {
    let generator: SocialImageGenerator

    beforeEach(() => {
      generator = SocialImageGenerator.getInstance()
    })

    it('should generate optimized social image URLs', () => {
      const ogUrl = generator.getOptimizedSocialImageUrl('home', 'fr', 'og')
      const twitterUrl = generator.getOptimizedSocialImageUrl('home', 'fr', 'twitter')
      const linkedinUrl = generator.getOptimizedSocialImageUrl('home', 'fr', 'linkedin')

      expect(ogUrl).toContain('page=home')
      expect(ogUrl).toContain('lang=fr')
      expect(ogUrl).toContain('platform=og')
      
      expect(twitterUrl).toContain('platform=twitter')
      expect(linkedinUrl).toContain('platform=linkedin')
    })

    it('should create config from page data', () => {
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

    it('should have correct dimensions for different platforms', () => {
      const ogDimensions = SocialImageGenerator.DIMENSIONS.OPEN_GRAPH
      const twitterDimensions = SocialImageGenerator.DIMENSIONS.TWITTER_CARD
      const linkedinDimensions = SocialImageGenerator.DIMENSIONS.LINKEDIN

      expect(ogDimensions.width).toBe(1200)
      expect(ogDimensions.height).toBe(630)
      
      expect(twitterDimensions.width).toBe(1200)
      expect(twitterDimensions.height).toBe(600)
      
      expect(linkedinDimensions.width).toBe(1200)
      expect(linkedinDimensions.height).toBe(627)
    })
  })

  describe('Social Media Validation', () => {
    it('should validate Open Graph required properties', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      // Required Open Graph properties according to specification
      const requiredProperties = [
        'og:title',
        'og:type',
        'og:image',
        'og:url'
      ]

      requiredProperties.forEach(property => {
        expect(hasMetaTag(property)).toBeTruthy()
        const content = getMetaContent(property)
        expect(content).toBeTruthy()
        expect(content?.length).toBeGreaterThan(0)
      })
    })

    it('should validate Twitter Card required properties', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      // Required Twitter Card properties
      const requiredProperties = [
        'twitter:card',
        'twitter:title',
        'twitter:description',
        'twitter:image'
      ]

      requiredProperties.forEach(property => {
        expect(hasMetaTag(property, 'name')).toBeTruthy()
        const content = getMetaContent(property, 'name')
        expect(content).toBeTruthy()
        expect(content?.length).toBeGreaterThan(0)
      })
    })

    it('should validate image URLs are absolute', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      const ogImageUrl = getMetaContent('og:image')
      const twitterImageUrl = getMetaContent('twitter:image', 'name')

      expect(ogImageUrl).toMatch(/^https?:\/\//)
      expect(twitterImageUrl).toMatch(/^https?:\/\//)
    })

    it('should validate title and description lengths', () => {
      render(
        <TestWrapper>
          <SEOHead pageData={pagesSEOData.home} />
        </TestWrapper>
      )

      const ogTitle = getMetaContent('og:title')
      const ogDescription = getMetaContent('og:description')
      const twitterTitle = getMetaContent('twitter:title', 'name')
      const twitterDescription = getMetaContent('twitter:description', 'name')

      // Open Graph recommendations
      expect(ogTitle?.length).toBeLessThanOrEqual(95)
      expect(ogDescription?.length).toBeLessThanOrEqual(300)

      // Twitter Card recommendations
      expect(twitterTitle?.length).toBeLessThanOrEqual(70)
      expect(twitterDescription?.length).toBeLessThanOrEqual(200)
    })
  })
})