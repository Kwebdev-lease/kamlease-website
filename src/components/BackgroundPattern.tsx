import React from 'react'
import { useTheme } from './ThemeProvider'
import { useLanguage } from '@/contexts/LanguageProvider'

interface BackgroundConfig {
  type: 'gradient' | 'pattern' | 'particles' | 'combined'
  theme?: 'light' | 'dark'
  intensity: 'subtle' | 'medium' | 'strong'
  animated?: boolean
  section?: 'hero' | 'about' | 'expertise' | 'process' | 'contact' | 'default'
}

interface BackgroundPatternProps {
  config: BackgroundConfig
  className?: string
  children?: React.ReactNode
}

// Configuration des thèmes d'arrière-plan
const BACKGROUND_THEMES = {
  light: {
    primary: 'from-gray-50 via-white to-gray-100',
    secondary: 'from-orange-50/30 via-white to-orange-100/20',
    accent: 'from-orange-100/40 via-orange-50/20 to-white',
    hero: 'from-orange-50/50 via-white to-orange-100/30',
    about: 'from-gray-50/80 via-white to-gray-100/60',
    expertise: 'from-orange-50/40 via-white to-orange-100/25',
    process: 'from-gray-50/70 via-white to-orange-50/30',
    contact: 'from-orange-100/50 via-orange-50/30 to-white',
    pattern: 'stroke-orange-200/30 fill-orange-100/10',
    patternSecondary: 'stroke-gray-200/40 fill-gray-100/15'
  },
  dark: {
    primary: 'from-gray-900 via-gray-800 to-gray-900',
    secondary: 'from-orange-950/30 via-gray-900 to-orange-900/20',
    accent: 'from-orange-900/40 via-orange-950/20 to-gray-900',
    hero: 'from-orange-950/40 via-gray-900 to-orange-900/25',
    about: 'from-gray-900/90 via-gray-800 to-gray-900/80',
    expertise: 'from-orange-950/35 via-gray-900 to-orange-900/20',
    process: 'from-gray-900/85 via-gray-800 to-orange-950/25',
    contact: 'from-orange-900/45 via-orange-950/25 to-gray-900',
    pattern: 'stroke-orange-800/30 fill-orange-900/10',
    patternSecondary: 'stroke-gray-700/40 fill-gray-800/15'
  }
}

// Motifs SVG géométriques
const GeometricPattern: React.FC<{ theme: 'light' | 'dark'; section: string; animated: boolean }> = ({ 
  theme, 
  section, 
  animated 
}) => {
  const themes = BACKGROUND_THEMES[theme]
  
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-30"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={`grid-${section}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            className={themes.pattern}
            strokeWidth="1"
          />
        </pattern>
        <pattern id={`dots-${section}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle
            cx="20"
            cy="20"
            r="1.5"
            className={themes.pattern}
          />
        </pattern>
      </defs>
      
      {/* Grille de base */}
      <rect width="100%" height="100%" fill={`url(#grid-${section})`} />
      
      {/* Motifs géométriques spécifiques par section */}
      {section === 'hero' && (
        <>
          <circle
            cx="200"
            cy="150"
            r="80"
            fill="none"
            className={`${themes.pattern} ${animated ? 'animate-spin-slow' : ''}`}
            strokeWidth="2"
            style={{ transformOrigin: '200px 150px' }}
          />
          <polygon
            points="800,100 850,50 900,100 850,150"
            className={`${themes.patternSecondary} ${animated ? 'animate-pulse' : ''}`}
          />
          <rect width="100%" height="100%" fill={`url(#dots-${section})`} opacity="0.3" />
        </>
      )}
      
      {section === 'about' && (
        <>
          <path
            d="M100,200 Q200,100 300,200 T500,200"
            fill="none"
            className={themes.pattern}
            strokeWidth="2"
          />
          <circle cx="900" cy="300" r="60" fill="none" className={themes.pattern} strokeWidth="1" />
          <polygon
            points="1000,400 1050,350 1100,400 1050,450"
            className={themes.patternSecondary}
          />
        </>
      )}
      
      {section === 'expertise' && (
        <>
          <g className={animated ? 'animate-spin-slow' : ''} style={{ transformOrigin: '600px 400px' }}>
            <polygon
              points="600,300 650,350 600,400 550,350"
              className={themes.pattern}
            />
          </g>
          <path
            d="M200,500 L400,300 L600,500 L800,300 L1000,500"
            fill="none"
            className={themes.patternSecondary}
            strokeWidth="1"
          />
        </>
      )}
      
      {section === 'process' && (
        <>
          <path
            d="M0,400 Q300,200 600,400 T1200,400"
            fill="none"
            className={themes.pattern}
            strokeWidth="2"
          />
          <circle cx="300" cy="200" r="40" fill="none" className={themes.pattern} strokeWidth="1" />
          <circle cx="600" cy="400" r="40" fill="none" className={themes.pattern} strokeWidth="1" />
          <circle cx="900" cy="200" r="40" fill="none" className={themes.pattern} strokeWidth="1" />
        </>
      )}
      
      {section === 'contact' && (
        <>
          <rect width="100%" height="100%" fill={`url(#dots-${section})`} opacity="0.4" />
          <path
            d="M0,600 Q400,400 800,600 Q1000,500 1200,600"
            fill="none"
            className={themes.pattern}
            strokeWidth="3"
          />
        </>
      )}
    </svg>
  )
}

// Particules animées subtiles avec adaptation de thème améliorée
const AnimatedParticles: React.FC<{ theme: 'light' | 'dark'; intensity: 'subtle' | 'medium' | 'strong' }> = ({ 
  theme, 
  intensity 
}) => {
  const particleCount = intensity === 'subtle' ? 8 : intensity === 'medium' ? 12 : 16
  
  // Couleurs adaptées au thème avec plus de contraste en mode sombre
  const getParticleColors = () => {
    if (theme === 'light') {
      return {
        small: 'bg-orange-300/20',
        large: 'bg-orange-200/15',
        glow: 'shadow-orange-300/30'
      }
    } else {
      return {
        small: 'bg-orange-400/25',
        large: 'bg-orange-500/20',
        glow: 'shadow-orange-400/40'
      }
    }
  }
  
  const colors = getParticleColors()
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${colors.small} animate-float transition-colors duration-500`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            filter: theme === 'dark' ? 'blur(0.5px)' : 'none'
          }}
        />
      ))}
      
      {/* Particules plus grandes pour l'intensité forte avec glow en mode sombre */}
      {intensity === 'strong' && Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`large-${i}`}
          className={`absolute w-2 h-2 rounded-full ${colors.large} animate-float-slow transition-colors duration-500 ${
            theme === 'dark' ? colors.glow : ''
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 3}s`,
            filter: theme === 'dark' ? 'blur(1px)' : 'none'
          }}
        />
      ))}
    </div>
  )
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  config,
  className = '',
  children
}) => {
  const { resolvedTheme } = useTheme()
  const { t } = useLanguage()
  const theme = config.theme || resolvedTheme
  const themes = BACKGROUND_THEMES[theme]
  const section = config.section || 'default'
  
  // Sélection du gradient selon la section et l'intensité
  const getGradientClass = () => {
    const sectionGradient = themes[section as keyof typeof themes] as string
    if (sectionGradient && typeof sectionGradient === 'string' && sectionGradient.includes('from-')) {
      return `bg-gradient-to-br ${sectionGradient}`
    }
    
    // Fallback selon l'intensité
    switch (config.intensity) {
      case 'subtle':
        return `bg-gradient-to-br ${themes.primary}`
      case 'medium':
        return `bg-gradient-to-br ${themes.secondary}`
      case 'strong':
        return `bg-gradient-to-br ${themes.accent}`
      default:
        return `bg-gradient-to-br ${themes.primary}`
    }
  }
  
  return (
    <div 
      className={`relative ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      {/* Arrière-plan gradient de base avec transition fluide */}
      {(config.type === 'gradient' || config.type === 'combined') && (
        <div className={`absolute inset-0 ${getGradientClass()} transition-all duration-500 ease-in-out`} />
      )}
      
      {/* Motifs géométriques avec transition de thème */}
      {(config.type === 'pattern' || config.type === 'combined') && (
        <div className="transition-opacity duration-500 ease-in-out">
          <GeometricPattern 
            theme={theme} 
            section={section} 
            animated={config.animated || false} 
          />
        </div>
      )}
      
      {/* Particules animées avec adaptation de thème */}
      {(config.type === 'particles' || config.type === 'combined') && config.animated && (
        <div className="transition-opacity duration-500 ease-in-out">
          <AnimatedParticles theme={theme} intensity={config.intensity} />
        </div>
      )}
      
      {/* Contenu */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

export default BackgroundPattern