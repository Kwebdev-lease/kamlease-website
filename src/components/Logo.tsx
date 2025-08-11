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
  const [hasError, setHasError] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/assets/logos/Logo couleur.svg')

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setLogoSrc('/assets/logos/Logo couleur.png')
    }
  }

  return (
    <img 
      src={logoSrc}
      alt={alt}
      className={`${className} object-contain`}
      style={{ maxHeight: '100%', width: 'auto' }}
      onError={handleError}
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