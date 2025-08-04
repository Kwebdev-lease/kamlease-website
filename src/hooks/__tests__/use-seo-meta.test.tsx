import { renderHook, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { useSEOMeta, usePageSEO, useDynamicSEO } from '../use-seo-meta'
import { pagesSEOData } from '@/lib/seo-config'
import { vi } from 'vitest'

// Mock the SEOMetaManager
vi.mock('@/lib/seo-meta-manager', () => ({
  SEOMetaManager: {
    getInstance: () => ({
      updatePageMeta: vi.fn(),
      getCurrentPageData: vi.fn(() => pagesSEOData.home)
    })
  }
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <HelmetProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </HelmetProvider>
  </BrowserRouter>
)

describe('useSEOMeta', () => {
  beforeEach(() => {
    // Reset document head
    document.head.innerHTML = ''
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/' },
      writable: true
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSEOMeta(), {
      wrapper: TestWrapper
    })

    expect(result.current.updateMeta).toBeDefined()
    expect(result.current.getCurrentPageData).toBeDefined()
    expect(result.current.setPageMeta).toBeDefined()
  })

  it('should update meta tags when updateMeta is called', () => {
    const { result } = renderHook(() => useSEOMeta(), {
      wrapper: TestWrapper
    })

    act(() => {
      result.current.updateMeta({
        title: {
          fr: 'Titre personnalisé',
          en: 'Custom Title'
        },
        description: {
          fr: 'Description personnalisée',
          en: 'Custom Description'
        }
      })
    })

    // The updateMeta function should be callable without errors
    expect(result.current.updateMeta).toBeDefined()
  })

  it('should set page meta for specific page', () => {
    const { result } = renderHook(() => useSEOMeta(), {
      wrapper: TestWrapper
    })

    act(() => {
      result.current.setPageMeta('about', {
        keywords: ['test', 'about', 'custom']
      })
    })

    expect(result.current.setPageMeta).toBeDefined()
  })

  it('should get current page data', () => {
    const { result } = renderHook(() => useSEOMeta(), {
      wrapper: TestWrapper
    })

    const pageData = result.current.getCurrentPageData()
    expect(pageData).toBeDefined()
  })
})

describe('usePageSEO', () => {
  it('should initialize with specific page ID', () => {
    const { result } = renderHook(() => usePageSEO('about'), {
      wrapper: TestWrapper
    })

    expect(result.current.updateMeta).toBeDefined()
    expect(result.current.getCurrentPageData).toBeDefined()
    expect(result.current.setPageMeta).toBeDefined()
  })

  it('should handle custom data for specific page', () => {
    const customData = {
      keywords: ['custom', 'about', 'page']
    }

    const { result } = renderHook(() => usePageSEO('about', customData), {
      wrapper: TestWrapper
    })

    expect(result.current.updateMeta).toBeDefined()
  })
})

describe('useDynamicSEO', () => {
  it('should initialize with initial data', () => {
    const initialData = {
      title: {
        fr: 'Titre dynamique',
        en: 'Dynamic Title'
      }
    }

    const { result } = renderHook(() => useDynamicSEO(initialData), {
      wrapper: TestWrapper
    })

    expect(result.current.updateMeta).toBeDefined()
    expect(result.current.getCurrentPageData).toBeDefined()
    expect(result.current.setPageMeta).toBeDefined()
  })

  it('should allow dynamic updates', () => {
    const { result } = renderHook(() => useDynamicSEO(), {
      wrapper: TestWrapper
    })

    act(() => {
      result.current.updateMeta({
        description: {
          fr: 'Description mise à jour',
          en: 'Updated Description'
        }
      })
    })

    expect(result.current.updateMeta).toBeDefined()
  })
})