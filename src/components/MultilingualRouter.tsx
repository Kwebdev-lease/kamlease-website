import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageProvider'
import { detectPreferredLanguage, extractLanguageFromUrl } from './SEOHead'
import { seoConfig } from '@/lib/seo-config'
import { Language } from '@/lib/translations'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import { LegalNotice } from '@/pages/LegalNotice'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'



/**
 * Remove language prefix from pathname
 */
function removeLanguagePrefix(pathname: string, language: Language): string {
  if (language === seoConfig.site.defaultLanguage) {
    return pathname
  }
  
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && segments[0] === language) {
    return '/' + segments.slice(1).join('/')
  }
  
  return pathname
}

/**
 * Add language prefix to pathname
 */
function addLanguagePrefix(pathname: string, language: Language): string {
  if (language === seoConfig.site.defaultLanguage) {
    return pathname
  }
  
  // Remove any existing language prefix first
  const cleanPath = removeLanguagePrefix(pathname, language)
  return `/${language}${cleanPath === '/' ? '' : cleanPath}`
}

/**
 * Multilingual router that handles language-based routing
 */
export function MultilingualRouter() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguage()

  // Handle language detection and URL synchronization
  useEffect(() => {
    const pathname = location.pathname
    const urlLanguage = extractLanguageFromUrl(pathname)
    
    // If URL has a language prefix
    if (urlLanguage) {
      // Update context language if different
      if (urlLanguage !== language) {
        setLanguage(urlLanguage)
      }
    } else {
      // No language prefix in URL
      const preferredLanguage = detectPreferredLanguage()
      
      // If preferred language is not the default, redirect to localized URL
      if (preferredLanguage !== seoConfig.site.defaultLanguage) {
        const localizedPath = addLanguagePrefix(pathname, preferredLanguage)
        navigate(localizedPath, { replace: true })
        setLanguage(preferredLanguage)
        return
      }
      
      // Update context language to default if different
      if (language !== seoConfig.site.defaultLanguage) {
        setLanguage(seoConfig.site.defaultLanguage)
      }
    }
  }, [location.pathname, language, setLanguage, navigate])

  // Get the clean pathname without language prefix for routing
  const cleanPathname = removeLanguagePrefix(location.pathname, language)

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/en" element={<Index />} />
      <Route path="/en/*" element={<EnglishRoutes />} />
      <Route path="/mentions-legales" element={<LegalNotice />} />
      <Route path="/en/legal-notice" element={<LegalNotice />} />
      <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
      <Route path="/en/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

/**
 * English-specific routes component
 */
function EnglishRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/legal-notice" element={<LegalNotice />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

/**
 * Hook to get localized navigation functions
 */
export function useLocalizedNavigation() {
  const { language } = useLanguage()
  const navigate = useNavigate()

  const navigateToPath = (path: string, options?: { replace?: boolean }) => {
    const localizedPath = addLanguagePrefix(path, language)
    navigate(localizedPath, options)
  }

  const getLocalizedPath = (path: string) => {
    return addLanguagePrefix(path, language)
  }

  const switchLanguage = (newLanguage: Language, currentPath?: string) => {
    const pathToUse = currentPath || window.location.pathname
    const cleanPath = removeLanguagePrefix(pathToUse, language)
    const newLocalizedPath = addLanguagePrefix(cleanPath, newLanguage)
    navigate(newLocalizedPath, { replace: true })
  }

  return {
    navigateToPath,
    getLocalizedPath,
    switchLanguage,
    currentLanguage: language
  }
}

/**
 * Component to handle language switching with proper URL updates
 */
export function LanguageSwitcher() {
  const { switchLanguage, currentLanguage } = useLocalizedNavigation()
  const { setLanguage } = useLanguage()

  const handleLanguageSwitch = (newLanguage: Language) => {
    setLanguage(newLanguage)
    switchLanguage(newLanguage)
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleLanguageSwitch('fr')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLanguage === 'fr'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Français"
      >
        FR
      </button>
      <button
        onClick={() => handleLanguageSwitch('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          currentLanguage === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  )
}