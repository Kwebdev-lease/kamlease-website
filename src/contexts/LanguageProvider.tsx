import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language, translations } from '@/lib/translations'
import { safeStorage } from '@/lib/storage'
import { seoConfig } from '@/lib/seo-config'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function isValidLanguage(value: string | null): value is Language {
  return value === 'fr' || value === 'en'
}

/**
 * Detect user's preferred language from browser settings
 */
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') {
    return seoConfig.site.defaultLanguage
  }

  const browserLanguages = navigator.languages || [navigator.language]
  
  for (const browserLang of browserLanguages) {
    const lang = browserLang.split('-')[0].toLowerCase()
    if (seoConfig.site.supportedLanguages.includes(lang as Language)) {
      return lang as Language
    }
  }

  return seoConfig.site.defaultLanguage
}

/**
 * Extract language from URL path
 */
function extractLanguageFromUrl(): Language | null {
  if (typeof window === 'undefined') {
    return null
  }

  const pathname = window.location.pathname
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length > 0) {
    const firstSegment = segments[0]
    if (seoConfig.site.supportedLanguages.includes(firstSegment as Language)) {
      return firstSegment as Language
    }
  }
  
  return null
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      // First priority: URL language prefix
      const urlLanguage = extractLanguageFromUrl()
      if (urlLanguage) {
        return urlLanguage
      }

      // Second priority: stored language preference
      try {
        const stored = safeStorage.get('kamlease-language')
        if (stored && isValidLanguage(stored)) {
          return stored
        }
      } catch (error) {
        console.warn('Failed to load language from storage, using browser detection', error)
      }

      // Third priority: browser language detection
      return detectBrowserLanguage()
    }
    
    return seoConfig.site.defaultLanguage
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const success = safeStorage.set('kamlease-language', language)
        if (!success) {
          console.warn('Failed to persist language to storage, language will not persist across sessions')
        }
      } catch (error) {
        console.warn('Error saving language to storage:', error)
      }
    }
  }, [language])

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      const keys = key.split('.')
      let value: Record<string, unknown> = translations[language]
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k] as Record<string, unknown>
        } else {
          return key
        }
      }
      
      let result = (typeof value === 'string' ? value : key)
      
      // Handle parameter substitution
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue)
        })
      }
      
      return result
    } catch (error) {
      console.warn('Translation error for key:', key, error)
      return key
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}