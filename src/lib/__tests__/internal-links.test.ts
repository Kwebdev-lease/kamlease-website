import { describe, it, expect, beforeEach } from 'vitest'
import { InternalLinksService } from '../internal-links'

describe('InternalLinksService', () => {
  let service: InternalLinksService

  beforeEach(() => {
    service = InternalLinksService.getInstance()
  })

  describe('getContextualLinks', () => {
    it('should return contextual links for home section', () => {
      const links = service.getContextualLinks('home', 3)
      
      expect(links).toHaveLength(3)
      expect(links[0]).toHaveProperty('url')
      expect(links[0]).toHaveProperty('text')
      expect(links[0]).toHaveProperty('priority')
      expect(links[0]).toHaveProperty('keywords')
    })

    it('should return links sorted by priority', () => {
      const links = service.getContextualLinks('home', 5)
      
      // Check that links are sorted by priority (descending)
      for (let i = 0; i < links.length - 1; i++) {
        expect(links[i].priority).toBeGreaterThanOrEqual(links[i + 1].priority)
      }
    })

    it('should limit results to maxLinks parameter', () => {
      const links = service.getContextualLinks('home', 2)
      
      expect(links).toHaveLength(2)
    })

    it('should return empty array for unknown context', () => {
      const links = service.getContextualLinks('unknown-context')
      
      expect(links).toHaveLength(0)
    })
  })

  describe('getSectionAnchors', () => {
    it('should return section anchors for home page', () => {
      const anchors = service.getSectionAnchors('home')
      
      expect(anchors.length).toBeGreaterThan(0)
      expect(anchors[0]).toHaveProperty('id')
      expect(anchors[0]).toHaveProperty('title')
      expect(anchors[0]).toHaveProperty('url')
      expect(anchors[0]).toHaveProperty('keywords')
    })

    it('should return anchors for legal pages', () => {
      const legalAnchors = service.getSectionAnchors('legal-notice')
      const privacyAnchors = service.getSectionAnchors('privacy-policy')
      
      expect(legalAnchors.length).toBeGreaterThan(0)
      expect(privacyAnchors.length).toBeGreaterThan(0)
    })

    it('should return empty array for unknown page', () => {
      const anchors = service.getSectionAnchors('unknown-page')
      
      expect(anchors).toHaveLength(0)
    })
  })

  describe('generateUrlSlug', () => {
    it('should generate SEO-friendly URL slug', () => {
      const slug = service.generateUrlSlug('Solutions Mécatroniques & Électroniques')
      
      expect(slug).toBe('solutions-mecatroniques-electroniques')
    })

    it('should handle accented characters', () => {
      const slug = service.generateUrlSlug('Développement Électronique Avancé')
      
      expect(slug).toBe('developpement-electronique-avance')
    })

    it('should handle special characters', () => {
      const slug = service.generateUrlSlug('Auto-staging & Innovation (2024)')
      
      expect(slug).toBe('auto-staging-innovation-2024')
    })

    it('should handle multiple spaces and hyphens', () => {
      const slug = service.generateUrlSlug('  Multiple   Spaces  --  And   Hyphens  ')
      
      expect(slug).toBe('multiple-spaces-and-hyphens')
    })

    it('should handle empty string', () => {
      const slug = service.generateUrlSlug('')
      
      expect(slug).toBe('')
    })
  })

  describe('getRelatedLinks', () => {
    it('should return related links based on keywords', () => {
      const keywords = ['mécatronique', 'innovation', 'solutions']
      const currentUrl = '#current'
      
      const relatedLinks = service.getRelatedLinks(keywords, currentUrl, 3)
      
      expect(relatedLinks.length).toBeLessThanOrEqual(3)
      
      // Should not include current URL
      relatedLinks.forEach(link => {
        expect(link.url).not.toBe(currentUrl)
      })
    })

    it('should score links by keyword relevance', () => {
      const keywords = ['contact', 'projet']
      const currentUrl = '#test'
      
      const relatedLinks = service.getRelatedLinks(keywords, currentUrl, 5)
      
      // Links should be sorted by relevance score
      for (let i = 0; i < relatedLinks.length - 1; i++) {
        expect(relatedLinks[i].relevanceScore).toBeGreaterThanOrEqual(
          relatedLinks[i + 1].relevanceScore
        )
      }
    })

    it('should return empty array when no relevant links found', () => {
      const keywords = ['xyzneverexists', 'abcnotfound']
      const currentUrl = '#test'
      
      const relatedLinks = service.getRelatedLinks(keywords, currentUrl, 5)
      
      expect(relatedLinks).toHaveLength(0)
    })
  })

  describe('addContextualLink', () => {
    it('should add custom contextual link', () => {
      const customLink = {
        url: '#custom',
        text: 'Custom Link',
        title: 'Custom Title',
        context: 'test',
        keywords: ['custom', 'test'],
        priority: 5
      }

      service.addContextualLink('test-context', customLink)
      const links = service.getContextualLinks('test-context')
      
      expect(links).toContainEqual(customLink)
    })
  })

  describe('addSectionAnchor', () => {
    it('should add custom section anchor', () => {
      const customAnchor = {
        id: 'custom-section',
        title: 'Custom Section',
        url: '#custom-section',
        keywords: ['custom', 'section'],
        description: 'Custom section description'
      }

      service.addSectionAnchor('test-page', customAnchor)
      const anchors = service.getSectionAnchors('test-page')
      
      expect(anchors).toContainEqual(customAnchor)
    })
  })

  describe('getAllInternalUrls', () => {
    it('should return all internal URLs', () => {
      const urls = service.getAllInternalUrls()
      
      expect(Array.isArray(urls)).toBe(true)
      
      // Should not include anchor links (starting with #)
      urls.forEach(url => {
        expect(url).not.toMatch(/^#/)
      })
    })

    it('should return unique URLs', () => {
      const urls = service.getAllInternalUrls()
      const uniqueUrls = [...new Set(urls)]
      
      expect(urls).toHaveLength(uniqueUrls.length)
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = InternalLinksService.getInstance()
      const instance2 = InternalLinksService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })
})