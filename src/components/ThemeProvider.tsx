import React, { createContext, useContext, useEffect, useState } from 'react'
import { safeStorage } from '@/lib/storage'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function isValidTheme(value: string | null): value is Theme {
  return value === 'dark' || value === 'light' || value === 'system'
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'kamlease-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = safeStorage.get(storageKey)
        if (stored && isValidTheme(stored)) {
          return stored
        }
      } catch (error) {
        console.warn('Failed to load theme from storage, using default', error)
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let effectiveTheme: 'dark' | 'light'

    if (theme === 'system') {
      try {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light'
        effectiveTheme = systemTheme
      } catch (error) {
        console.warn('Failed to detect system theme, defaulting to dark', error)
        effectiveTheme = 'dark'
      }
    } else {
      effectiveTheme = theme
    }

    root.classList.add(effectiveTheme)
    setResolvedTheme(effectiveTheme)
  }, [theme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => {
      if (!isValidTheme(newTheme)) {
        console.error('Invalid theme value:', newTheme)
        return
      }
      
      try {
        const success = safeStorage.set(storageKey, newTheme)
        if (!success) {
          console.warn('Failed to persist theme to storage, theme will not persist across sessions')
        }
      } catch (error) {
        console.warn('Error saving theme to storage:', error)
      }
      
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}