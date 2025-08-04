import { useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageProvider'
import { useLocation } from 'react-router-dom'
import { SEOMetaManager } from '@/lib/seo-meta-manager'
import { PageSEOData, pagesSEOData } from '@/lib/seo-config'
import { Language } from '@/lib/translations'

export interface UseSEOMetaOptions {
  pageId?: string
  customData?: Partial<PageSEOData>
  overrideLanguage?: Language
}

export interface UseSEOMetaReturn {
  updateMeta: (data: Partial<PageSEOData>) => void
  getCurrentPageData: () => PageSEOData | null
  setPageMeta: (pageId: string, customData?: Partial<PageSEOData>) => void
}

/**
 * Custom hook for managing SEO meta tags
 * Automatically updates meta tags based on current page and language
 */
export function useSEOMeta(options: UseSEOMetaOptions = {}): UseSEOMetaReturn {
  const { language } = useLanguage()
  const location = useLocation()
  const seoManager = SEOMetaManager.getInstance()

  const { pageId, customData, overrideLanguage } = options
  const currentLanguage = overrideLanguage || language

  /**
   * Get page ID from current route
   */
  const getPageIdFromRoute = useCallback((pathname: string): string => {
    // Remove language prefix if present
    const cleanPath = pathname.replace(/^\/en/, '')
    
    switch (cleanPath) {
      case '/':
        return 'home'
      case '/about':
        return 'about'
      case '/contact':
        return 'contact'
      case '/mentions-legales':
        return 'legal-notice'
      case '/politique-confidentialite':
        return 'privacy-policy'
      default:
        return 'home' // fallback
    }
  }, [])

  /**
   * Set meta tags for a specific page
   */
  const setPageMeta = useCallback((targetPageId: string, targetCustomData?: Partial<PageSEOData>) => {
    const basePageData = pagesSEOData[targetPageId]
    
    if (!basePageData) {
      console.warn(`SEO data not found for page: ${targetPageId}`)
      return
    }

    // Merge base data with custom data
    const finalPageData: PageSEOData = {
      ...basePageData,
      ...targetCustomData,
      // Ensure language is set correctly
      language: currentLanguage,
      // Merge keywords if both exist
      keywords: targetCustomData?.keywords 
        ? [...basePageData.keywords, ...targetCustomData.keywords]
        : basePageData.keywords
    }

    // Update meta tags
    seoManager.updatePageMeta(finalPageData, currentLanguage)
  }, [currentLanguage, seoManager])

  /**
   * Update current page meta tags
   */
  const updateMeta = useCallback((data: Partial<PageSEOData>) => {
    const currentPageId = pageId || getPageIdFromRoute(location.pathname)
    setPageMeta(currentPageId, { ...customData, ...data })
  }, [pageId, customData, location.pathname, getPageIdFromRoute, setPageMeta])

  /**
   * Get current page data
   */
  const getCurrentPageData = useCallback(() => {
    return seoManager.getCurrentPageData()
  }, [seoManager])

  // Auto-update meta tags when route or language changes
  useEffect(() => {
    const currentPageId = pageId || getPageIdFromRoute(location.pathname)
    setPageMeta(currentPageId, customData)
  }, [location.pathname, currentLanguage, pageId, customData, getPageIdFromRoute, setPageMeta])

  return {
    updateMeta,
    getCurrentPageData,
    setPageMeta
  }
}

/**
 * Hook for setting meta tags for a specific page type
 * Useful for components that always represent the same page
 */
export function usePageSEO(pageId: string, customData?: Partial<PageSEOData>): UseSEOMetaReturn {
  return useSEOMeta({ pageId, customData })
}

/**
 * Hook for dynamic meta tag updates
 * Useful for pages with dynamic content
 */
export function useDynamicSEO(initialData?: Partial<PageSEOData>): UseSEOMetaReturn {
  const { updateMeta, getCurrentPageData, setPageMeta } = useSEOMeta({ customData: initialData })

  return {
    updateMeta,
    getCurrentPageData,
    setPageMeta
  }
}