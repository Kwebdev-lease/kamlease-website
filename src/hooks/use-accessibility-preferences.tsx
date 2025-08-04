import { useState, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'

interface AccessibilityPreferences {
  prefersReducedMotion: boolean
  theme: 'light' | 'dark'
  highContrast: boolean
  prefersColorScheme: 'light' | 'dark' | 'no-preference'
}

export function useAccessibilityPreferences(): AccessibilityPreferences {
  const { resolvedTheme } = useTheme()
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    theme: resolvedTheme,
    highContrast: false,
    prefersColorScheme: 'no-preference'
  })

  useEffect(() => {
    // Fonction pour vérifier les préférences média
    const checkMediaQueries = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches
      const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : window.matchMedia('(prefers-color-scheme: light)').matches 
          ? 'light' 
          : 'no-preference'

      setPreferences(prev => ({
        ...prev,
        prefersReducedMotion,
        highContrast,
        prefersColorScheme: prefersColorScheme as 'light' | 'dark' | 'no-preference'
      }))
    }

    // Vérification initiale
    checkMediaQueries()

    // Création des media query listeners
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const lightSchemeQuery = window.matchMedia('(prefers-color-scheme: light)')

    // Event listeners pour les changements
    const handleChange = () => checkMediaQueries()
    
    reducedMotionQuery.addEventListener('change', handleChange)
    highContrastQuery.addEventListener('change', handleChange)
    darkSchemeQuery.addEventListener('change', handleChange)
    lightSchemeQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      reducedMotionQuery.removeEventListener('change', handleChange)
      highContrastQuery.removeEventListener('change', handleChange)
      darkSchemeQuery.removeEventListener('change', handleChange)
      lightSchemeQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Mise à jour du thème quand il change
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      theme: resolvedTheme
    }))
  }, [resolvedTheme])

  return preferences
}

export default useAccessibilityPreferences