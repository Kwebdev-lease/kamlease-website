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
  // Utiliser directement le logo couleur SVG
  const logoSrc = '/assets/logos/Logo couleur.svg'

  return (
    <img 
      src={logoSrc}
      alt={alt}
      className={`${className} object-contain`}
      style={{ maxHeight: '100%', width: 'auto' }}
      onError={(e) => {
        // Fallback vers PNG si SVG échoue
        e.currentTarget.src = '/assets/logos/Logo couleur.png'
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