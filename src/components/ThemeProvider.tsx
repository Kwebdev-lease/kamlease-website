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
  // Force dark theme always
  const [theme, setTheme] = useState<Theme>('dark')

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    // Force dark theme always
    root.classList.add('dark')
    setResolvedTheme('dark')
  }, [])

  const value = {
    theme: 'dark' as Theme,
    resolvedTheme: 'dark' as const,
    setTheme: () => {
      // Do nothing - theme is locked to dark
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