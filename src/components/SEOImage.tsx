import React, { useState, useRef, useEffect } from 'react'
import { imageOptimizer, type ImageSEOData, type OptimizedImage } from '@/lib/image-optimizer'
import { useLanguage } from '@/contexts/LanguageProvider'

export interface SEOImageProps {
  src: string
  context: string
  keywords?: string[]
  className?: string
  width?: number
  height?: number
  priority?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * SEO-optimized image component with lazy loading, WebP support, and automatic alt text generation
 */
export function SEOImage({
  src,
  context,
  keywords = [],
  className = '',
  width,
  height,
  priority = false,
  onLoad,
  onError
}: SEOImageProps) {
  const { language } = useLanguage()
  const [optimizedImage, setOptimizedImage] = useState<OptimizedImage | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // If priority, load immediately
  const [hasError, setHasError] = useState(false)
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Check WebP support on mount
  useEffect(() => {
    imageOptimizer.constructor.supportsWebP().then(setWebpSupported)
  }, [])

  // Generate optimized image data
  useEffect(() => {
    const imageData: ImageSEOData = {
      src,
      context,
      keywords,
      language
    }

    const optimized = imageOptimizer.optimizeForSEO(imageData)
    setOptimizedImage(optimized)
  }, [src, context, keywords, language])

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before the image comes into view
      }
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [priority])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setHasError(true)
    const error = new Error(`Failed to load SEO image: ${src}`)
    onError?.(error)
    console.error('SEO Image loading failed:', { src, context, error })
  }

  // Don't render anything until we have optimized image data and WebP support info
  if (!optimizedImage || webpSupported === null) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`}
        style={{ width, height }}
        aria-label="Loading image"
      />
    )
  }

  // Error state
  if (hasError) {
    return (
      <div 
        className={`${className} bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400`}
        style={{ width, height }}
        aria-label="Image failed to load"
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    )
  }

  // Placeholder while not in view (for lazy loading)
  if (!isInView && !priority) {
    return (
      <div 
        ref={imgRef}
        className={`${className} bg-gray-200 dark:bg-gray-700`}
        style={{ width, height }}
        aria-label="Image loading"
      >
        <img
          src={optimizedImage.responsive.placeholder}
          alt=""
          className="w-full h-full object-cover opacity-50"
          aria-hidden="true"
        />
      </div>
    )
  }

  // Determine which image source to use
  const shouldUseWebP = webpSupported && optimizedImage.responsive.webp.srcSet
  const srcSet = shouldUseWebP 
    ? optimizedImage.responsive.webp.srcSet 
    : optimizedImage.responsive.fallback.srcSet
  const sizes = shouldUseWebP 
    ? optimizedImage.responsive.webp.sizes 
    : optimizedImage.responsive.fallback.sizes

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Placeholder shown while loading */}
      {!isLoaded && (
        <img
          src={optimizedImage.responsive.placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          aria-hidden="true"
        />
      )}
      
      {/* Main optimized image */}
      <picture>
        {/* WebP source if supported */}
        {webpSupported && optimizedImage.responsive.webp.srcSet && (
          <source
            srcSet={optimizedImage.responsive.webp.srcSet}
            sizes={optimizedImage.responsive.webp.sizes}
            type="image/webp"
          />
        )}
        
        {/* Fallback source */}
        <img
          ref={imgRef}
          src={optimizedImage.src}
          srcSet={srcSet}
          sizes={sizes}
          alt={optimizedImage.alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={optimizedImage.loading}
          onLoad={handleLoad}
          onError={handleError}
          width={width}
          height={height}
          // Add structured data attributes for SEO
          itemProp="image"
          data-context={context}
          data-keywords={keywords.join(',')}
        />
      </picture>
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

/**
 * Specialized SEO image component for logos
 */
export function SEOLogo({ 
  className = 'h-12 w-auto', 
  alt,
  ...props 
}: Omit<SEOImageProps, 'context' | 'src'> & { 
  src?: string
  alt?: string 
}) {
  const { language } = useLanguage()
  
  // Use the existing logo paths from the Logo component
  const logoSrc = props.src || '/assets/logos/logo-color.svg'
  
  return (
    <SEOImage
      {...props}
      src={logoSrc}
      context="logo"
      className={className}
      priority={true} // Logos should always load with priority
      keywords={['Kamlease', 'logo', 'mécatronique', 'électronique']}
    />
  )
}

/**
 * Specialized SEO image component for hero sections
 */
export function SEOHeroImage({ 
  className = 'w-full h-full object-cover',
  ...props 
}: Omit<SEOImageProps, 'context'>) {
  return (
    <SEOImage
      {...props}
      context="hero"
      className={className}
      priority={true} // Hero images should load with priority
      keywords={['innovation', 'technologie', 'équipe', 'développement']}
    />
  )
}

/**
 * Hook for preloading critical images
 */
export function useImagePreloader() {
  const preloadImage = async (src: string, context: string = 'generic') => {
    try {
      const imageData: ImageSEOData = {
        src,
        context,
        keywords: [],
        language: 'fr' // Default language for preloading
      }
      
      const optimized = imageOptimizer.optimizeForSEO(imageData)
      
      // Preload the main image
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = optimized.src
      })
      
      return optimized
    } catch (error) {
      console.error('Image preloading failed:', error)
      throw error
    }
  }

  return { preloadImage }
}