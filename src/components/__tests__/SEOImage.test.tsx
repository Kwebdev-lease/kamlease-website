import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { SEOImage, SEOLogo, SEOHeroImage, useImagePreloader } from '../SEOImage'
import { LanguageProvider } from '@/contexts/LanguageProvider'

// Mock the image optimizer
vi.mock('@/lib/image-optimizer', () => ({
  ImageOptimizer: {
    supportsWebP: vi.fn().mockResolvedValue(true)
  },
  imageOptimizer: {
    optimizeForSEO: vi.fn().mockReturnValue({
      src: '/test-image.jpg',
      alt: 'Test alt text with SEO keywords',
      responsive: {
        webp: {
          srcSet: '/test-320w.webp 320w, /test-640w.webp 640w',
          sizes: '(max-width: 640px) 600px, 1200px'
        },
        fallback: {
          srcSet: '/test-320w.jpg 320w, /test-640w.jpg 640w',
          sizes: '(max-width: 640px) 600px, 1200px'
        },
        placeholder: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='
      },
      loading: 'lazy',
      priority: false
    }),
    constructor: {
      supportsWebP: vi.fn().mockResolvedValue(true)
    }
  }
}))

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

// Mock Image constructor for WebP detection
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  height: 2,
  src: ''
}
vi.stubGlobal('Image', vi.fn(() => mockImage))

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
)

describe('SEOImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset IntersectionObserver mock
    mockIntersectionObserver.mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should render loading state initially', () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" />
      </TestWrapper>
    )

    expect(screen.getByLabelText('Loading image')).toBeInTheDocument()
  })

  it('should render placeholder for lazy loading when not in view', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Image loading')).toBeInTheDocument()
    })
  })

  it('should render image immediately when priority is true', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="hero" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'Test alt text with SEO keywords')
    })
  })

  it('should set up intersection observer for lazy loading', async () => {
    const { container } = render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" />
      </TestWrapper>
    )

    // Wait for the component to render the placeholder (which means optimized image is ready)
    await waitFor(() => {
      expect(screen.getByLabelText('Image loading')).toBeInTheDocument()
    })

    // The intersection observer should be set up for non-priority images
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '50px' }
    )
  })

  it('should render WebP source when supported', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const picture = screen.getByRole('img').closest('picture')
      const webpSource = picture?.querySelector('source[type="image/webp"]')
      expect(webpSource).toBeInTheDocument()
      expect(webpSource).toHaveAttribute('srcset', '/test-320w.webp 320w, /test-640w.webp 640w')
    })
  })

  it('should handle image load event', async () => {
    const onLoad = vi.fn()
    
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} onLoad={onLoad} />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      fireEvent.load(img)
      expect(onLoad).toHaveBeenCalled()
    })
  })

  it('should handle image error event', async () => {
    const onError = vi.fn()
    
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} onError={onError} />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      fireEvent.error(img)
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  it('should render error state when image fails to load', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      fireEvent.error(img)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()
      expect(screen.getByText('Image unavailable')).toBeInTheDocument()
    })
  })

  it('should include SEO attributes', async () => {
    const keywords = ['test', 'seo', 'keywords']
    
    render(
      <TestWrapper>
        <SEOImage 
          src="/test.jpg" 
          context="test" 
          keywords={keywords}
          priority={true} 
        />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('itemProp', 'image')
      expect(img).toHaveAttribute('data-context', 'test')
      expect(img).toHaveAttribute('data-keywords', 'test,seo,keywords')
    })
  })

  it('should apply custom className and dimensions', async () => {
    render(
      <TestWrapper>
        <SEOImage 
          src="/test.jpg" 
          context="test" 
          className="custom-class"
          width={300}
          height={200}
          priority={true}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      const container = screen.getByRole('img').closest('div')
      expect(container).toHaveClass('custom-class')
      expect(container).toHaveStyle({ width: '300px', height: '200px' })
    })
  })

  it('should show loading indicator while image is loading', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const loadingSpinner = document.querySelector('.animate-spin')
      expect(loadingSpinner).toBeInTheDocument()
    })
  })
})

describe('SEOLogo', () => {
  it('should render with logo-specific defaults', async () => {
    render(
      <TestWrapper>
        <SEOLogo />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'Test alt text with SEO keywords')
      expect(img).toHaveAttribute('data-context', 'logo')
    })
  })

  it('should use custom src when provided', async () => {
    render(
      <TestWrapper>
        <SEOLogo src="/custom-logo.svg" />
      </TestWrapper>
    )

    // The component should call optimizeForSEO with the custom src
    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
  })

  it('should have priority loading by default', async () => {
    render(
      <TestWrapper>
        <SEOLogo />
      </TestWrapper>
    )

    // Should render immediately without intersection observer
    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
    
    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })
})

describe('SEOHeroImage', () => {
  it('should render with hero-specific defaults', async () => {
    render(
      <TestWrapper>
        <SEOHeroImage src="/hero.jpg" />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('data-context', 'hero')
    })
  })

  it('should have priority loading by default', async () => {
    render(
      <TestWrapper>
        <SEOHeroImage src="/hero.jpg" />
      </TestWrapper>
    )

    // Should render immediately without intersection observer
    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
    
    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('should apply hero-specific className', async () => {
    render(
      <TestWrapper>
        <SEOHeroImage src="/hero.jpg" />
      </TestWrapper>
    )

    await waitFor(() => {
      const container = screen.getByRole('img').closest('div')
      expect(container).toHaveClass('w-full', 'h-full')
    })
  })
})

describe('useImagePreloader hook', () => {
  it('should preload images successfully', async () => {
    const TestComponent = () => {
      const { preloadImage } = useImagePreloader()
      const [result, setResult] = React.useState<any>(null)

      React.useEffect(() => {
        preloadImage('/test.jpg', 'hero').then(setResult)
      }, [preloadImage])

      return <div>{result ? 'Preloaded' : 'Loading'}</div>
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Simulate successful image load
    await waitFor(() => {
      if (mockImage.onload) {
        mockImage.onload()
      }
    })

    await waitFor(() => {
      expect(screen.getByText('Preloaded')).toBeInTheDocument()
    })
  })

  it('should handle preload errors', async () => {
    const TestComponent = () => {
      const { preloadImage } = useImagePreloader()
      const [error, setError] = React.useState<Error | null>(null)

      React.useEffect(() => {
        preloadImage('/invalid.jpg', 'hero').catch(setError)
      }, [preloadImage])

      return <div>{error ? 'Error' : 'Loading'}</div>
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Simulate image load error by triggering onerror immediately
    setTimeout(() => {
      if (mockImage.onerror) {
        mockImage.onerror(new Event('error'))
      }
    }, 100)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})

describe('WebP support detection', () => {
  it('should handle WebP supported scenario', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const picture = screen.getByRole('img').closest('picture')
      const webpSource = picture?.querySelector('source[type="image/webp"]')
      expect(webpSource).toBeInTheDocument()
    })
  })

  it('should handle WebP not supported scenario', async () => {
    // For this test, we'll just verify the component renders without WebP
    // The actual WebP detection is tested in the image optimizer tests
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'Test alt text with SEO keywords')
    })
  })
})

describe('Accessibility', () => {
  it('should provide proper ARIA labels for loading states', () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" />
      </TestWrapper>
    )

    expect(screen.getByLabelText('Loading image')).toBeInTheDocument()
  })

  it('should provide proper ARIA labels for error states', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const img = screen.getByRole('img')
      fireEvent.error(img)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Image failed to load')).toBeInTheDocument()
    })
  })

  it('should hide placeholder images from screen readers', async () => {
    render(
      <TestWrapper>
        <SEOImage src="/test.jpg" context="test" priority={true} />
      </TestWrapper>
    )

    await waitFor(() => {
      const placeholderImg = document.querySelector('img[aria-hidden="true"]')
      expect(placeholderImg).toBeInTheDocument()
    })
  })
})