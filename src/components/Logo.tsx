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
  // Utiliser directement le SVG sans fallback pour éviter le spam
  return (
    <img 
      src="/assets/logos/Logo couleur.svg"
      alt={alt}
      className={`${className} object-contain`}
      style={{ maxHeight: '100%', width: 'auto' }}
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