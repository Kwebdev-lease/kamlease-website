import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageProvider'
import { BreadcrumbStructuredData } from './StructuredData'

export interface BreadcrumbItem {
  name: string
  url: string
  isCurrentPage?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  homeUrl?: string
  separator?: React.ReactNode
}

/**
 * SEO-optimized Breadcrumbs component with structured data support
 * Provides navigation context and improves internal linking
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  showHome = true,
  homeUrl = '/',
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />
}) => {
  const { t } = useLanguage()

  // Prepare breadcrumb items with home if needed
  const breadcrumbItems = showHome 
    ? [{ name: t('nav.home', 'Accueil'), url: homeUrl }, ...items]
    : items

  // Filter out empty items and ensure we have valid breadcrumbs
  const validItems = breadcrumbItems.filter(item => item.name && item.url)

  if (validItems.length === 0) {
    return null
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <BreadcrumbStructuredData items={validItems} />
      
      {/* Visual Breadcrumbs */}
      <nav 
        aria-label={t('nav.breadcrumbs', 'Fil d\'Ariane')}
        className={`flex items-center space-x-2 text-sm ${className}`}
        role="navigation"
      >
        <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
          {validItems.map((item, index) => {
            const isLast = index === validItems.length - 1
            const isHome = index === 0 && showHome

            return (
              <li 
                key={`${item.url}-${index}`}
                className="flex items-center"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {/* Home icon for first item if showHome is true */}
                {isHome && (
                  <Home className="h-4 w-4 mr-1 text-gray-500" aria-hidden="true" />
                )}

                {/* Breadcrumb link or text */}
                {isLast || item.isCurrentPage ? (
                  <span 
                    className="text-gray-900 dark:text-gray-100 font-medium"
                    itemProp="name"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <a
                    href={item.url}
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.name}</span>
                  </a>
                )}

                {/* Hidden structured data properties */}
                <meta itemProp="position" content={String(index + 1)} />
                {!isLast && !item.isCurrentPage && (
                  <link itemProp="item" href={item.url} />
                )}

                {/* Separator */}
                {!isLast && (
                  <span className="mx-2" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

/**
 * Hook to generate breadcrumbs based on current route
 */
export const useBreadcrumbs = (customItems?: BreadcrumbItem[]) => {
  const { t } = useLanguage()
  
  // Get current path
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  
  // Generate breadcrumbs based on path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems
    }

    const pathSegments = currentPath.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Handle specific routes
    switch (currentPath) {
      case '/':
        return [] // No breadcrumbs for home page
      
      case '/mentions-legales':
        return [
          { name: t('legal.notice.title', 'Mentions légales'), url: '/mentions-legales', isCurrentPage: true }
        ]
      
      case '/politique-confidentialite':
        return [
          { name: t('legal.privacy.title', 'Politique de confidentialité'), url: '/politique-confidentialite', isCurrentPage: true }
        ]
      
      default:
        // Generate breadcrumbs from path segments
        let currentUrl = ''
        pathSegments.forEach((segment, index) => {
          currentUrl += `/${segment}`
          const isLast = index === pathSegments.length - 1
          
          breadcrumbs.push({
            name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            url: currentUrl,
            isCurrentPage: isLast
          })
        })
        
        return breadcrumbs
    }
  }

  return generateBreadcrumbs()
}

export default Breadcrumbs