import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import { AssetLoadError } from '@/lib/asset-loader'
import { AssetErrorBoundary } from './ErrorBoundary'

interface LogoProps {
  className?: string
  alt?: string
}

const LOGO_CONFIG = {
  light: {
    primary: '/assets/logos/Logo couleur.svg',
    fallback: '/assets/logos/Logo couleur.png'
  },
  dark: {
    primary: '/assets/logos/Logo couleur.svg',
    fallback: '/assets/logos/Logo couleur.png'
  }
}

function LogoComponent({ className = 'h-12 w-auto', alt = 'Kamlease' }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [logoSrc, setLogoSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const loadLogo = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const config = LOGO_CONFIG[resolvedTheme]
        
        // Try to load primary SVG
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = config.primary
        })
        
        if (isMounted) {
          setLogoSrc(config.primary)
        }
      } catch (primaryError) {
        console.warn(`Primary logo failed to load for ${resolvedTheme} theme:`, primaryError)
        
        try {
          // Try fallback PNG
          const config = LOGO_CONFIG[resolvedTheme]
          const img = new Image()
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = config.fallback
          })
          
          if (isMounted) {
            setLogoSrc(config.fallback)
            console.info(`Using fallback logo for ${resolvedTheme} theme`)
          }
        } catch (fallbackError) {
          const assetError = new AssetLoadError(
            `Failed to load both primary and fallback logos for ${resolvedTheme} theme`,
            LOGO_CONFIG[resolvedTheme].primary,
            'image'
          )
          
          console.error('Logo loading failed completely:', assetError)
          
          if (isMounted) {
            setError('Failed to load logo')
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLogo()
    
    return () => {
      isMounted = false
    }
  }, [resolvedTheme])

  if (isLoading) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded`}
        aria-label="Loading logo"
      />
    )
  }

  if (error || !logoSrc) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500`}
        aria-label="Logo unavailable"
      >
        Logo
      </div>
    )
  }

  return (
    <img 
      src={logoSrc}
      alt={alt}
      className={`${className} object-contain`}
      style={{ maxHeight: '100%', width: 'auto' }}
      onError={() => {
        console.error('Logo image failed to render after successful preload')
        setError('Logo render failed')
      }}
    />
  )
}

export function Logo(props: LogoProps) {
  return (
    <AssetErrorBoundary>
      <LogoComponent {...props} />
    </AssetErrorBoundary>
  )
}