import { SEOMetaManager } from '../seo-meta-manager'
import { pagesSEOData } from '../seo-config'

import { vi } from 'vitest'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

// Mock document methods
const mockMetaTag = {
  setAttribute: vi.fn(),
  remove: vi.fn()
}

const mockLinkTag = {
  setAttribute: vi.fn(),
  remove: vi.fn()
}

const mockQuerySelector = vi.fn()
const mockQuerySelectorAll = vi.fn()
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()

// Setup DOM mocks
Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true
})

Object.defineProperty(document, 'querySelectorAll', {
  value: mockQuerySelectorAll,
  writable: true
})

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
})

Object.defineProperty(document.head, 'appendChild', {
  value: mockAppendChild,
  writable: true
})

Object.defineProperty(document, 'title', {
  value: '',
  writable: true
})

Object.defineProperty(document.documentElement, 'lang', {
  value: 'fr',
  writable: true
})

describe('SEOMetaManager', () => {
  let seoManager: SEOMetaManager

  beforeEach(() => {
    seoManager = SEOMetaManager.getInstance()
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup default mock returns
    mockQuerySelector.mockReturnValue(null)
    mockQuerySelectorAll.mockReturnValue([])
    mockCreateElement.mockImplementation((tagName) => {
      if (tagName === 'meta') return mockMetaTag
      if (tagName === 'link') return mockLinkTag
      return {}
    })
  })

  it('should be a singleton', () => {
    const instance1 = SEOMetaManager.getInstance()
    const instance2 = SEOMetaManager.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should update page meta tags', () => {
    const pageData = pagesSEOData.home
    const language = 'fr'

    seoManager.updatePageMeta(pageData, language)

    // Check if document title was set
    expect(document.title).toBe(pageData.title[language])
    
    // Check if document language was set
    expect(document.documentElement.lang).toBe(language)
    
    // Check if meta tags were created
    expect(mockCreateElement).toHaveBeenCalledWith('meta')
    expect(mockCreateElement).toHaveBeenCalledWith('link')
    
    // Check if meta tags were appended to head
    expect(mockAppendChild).toHaveBeenCalled()
  })

  it('should generate optimized title', () => {
    const baseTitle = 'Test Page'
    const keywords = ['test', 'seo', 'optimization']
    const language = 'fr'

    const optimizedTitle = SEOMetaManager.generateOptimizedTitle(baseTitle, keywords, language)
    
    expect(optimizedTitle).toContain(baseTitle)
    expect(optimizedTitle).toContain('Kamlease')
    expect(optimizedTitle).toContain('|')
  })

  it('should generate optimized description', () => {
    const baseDescription = 'This is a test description for SEO optimization'
    const keywords = ['test', 'seo', 'optimization']

    const optimizedDescription = SEOMetaManager.generateOptimizedDescription(baseDescription, keywords)
    
    expect(optimizedDescription).toBe(baseDescription)
    expect(optimizedDescription.length).toBeLessThanOrEqual(160)
  })

  it('should truncate long titles', () => {
    const longTitle = 'This is a very long title that exceeds the recommended length for SEO optimization and should be truncated'
    const keywords = ['test']
    const language = 'fr'

    const optimizedTitle = SEOMetaManager.generateOptimizedTitle(longTitle, keywords, language)
    
    expect(optimizedTitle.length).toBeLessThanOrEqual(60)
    expect(optimizedTitle).toContain('...')
  })

  it('should truncate long descriptions', () => {
    const longDescription = 'This is a very long description that exceeds the recommended length for SEO meta descriptions and should be truncated to ensure optimal display in search engine results pages'
    const keywords = ['test']

    const optimizedDescription = SEOMetaManager.generateOptimizedDescription(longDescription, keywords)
    
    expect(optimizedDescription.length).toBeLessThanOrEqual(160)
    expect(optimizedDescription).toContain('...')
  })

  it('should handle English language', () => {
    const pageData = pagesSEOData.home
    const language = 'en'

    seoManager.updatePageMeta(pageData, language)

    expect(document.title).toBe(pageData.title[language])
    expect(document.documentElement.lang).toBe(language)
  })

  it('should clear managed meta tags', () => {
    const managedTags = [
      { remove: vi.fn() },
      { remove: vi.fn() }
    ]
    
    mockQuerySelectorAll.mockReturnValue(managedTags)
    
    const pageData = pagesSEOData.home
    seoManager.updatePageMeta(pageData, 'fr')

    expect(mockQuerySelectorAll).toHaveBeenCalledWith('[data-managed-by="seo-manager"]')
    managedTags.forEach(tag => {
      expect(tag.remove).toHaveBeenCalled()
    })
  })

  it('should get current page data', () => {
    const pageData = pagesSEOData.home
    seoManager.updatePageMeta(pageData, 'fr')

    const currentData = seoManager.getCurrentPageData()
    expect(currentData).toBe(pageData)
  })

  it('should handle missing page data gracefully', () => {
    const currentData = seoManager.getCurrentPageData()
    expect(currentData).toBeNull()
  })
})