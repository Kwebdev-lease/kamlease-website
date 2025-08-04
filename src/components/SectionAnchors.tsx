import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { useInternalLinks, SectionAnchor } from '@/lib/internal-links'
import { useLanguage } from '@/contexts/LanguageProvider'
import { Button } from '@/components/ui/button'

interface SectionAnchorsProps {
  page: string
  className?: string
  showBackToTop?: boolean
  position?: 'fixed' | 'sticky' | 'static'
}

/**
 * SectionAnchors component for quick navigation between page sections
 * Improves user experience and internal linking structure
 */
export const SectionAnchors: React.FC<SectionAnchorsProps> = ({
  page,
  className = '',
  showBackToTop = true,
  position = 'fixed'
}) => {
  const { getSectionAnchors } = useInternalLinks()
  const { t } = useLanguage()
  const [activeSection, setActiveSection] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)
  
  const anchors = getSectionAnchors(page)
  
  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for header
      
      // Show/hide navigation based on scroll position
      setIsVisible(scrollPosition > 300)
      
      // Find active section
      let currentSection = ''
      
      for (const anchor of anchors) {
        const element = document.getElementById(anchor.id)
        if (element) {
          const elementTop = element.offsetTop
          const elementBottom = elementTop + element.offsetHeight
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            currentSection = anchor.id
            break
          }
        }
      }
      
      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [anchors])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 100 // Account for fixed header
      const elementPosition = element.offsetTop - headerOffset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (anchors.length === 0) {
    return null
  }

  const positionClasses = {
    fixed: 'fixed right-6 top-1/2 transform -translate-y-1/2 z-40',
    sticky: 'sticky top-24 z-30',
    static: 'relative'
  }

  return (
    <nav
      className={`section-anchors transition-opacity duration-300 ${
        position === 'fixed' ? (isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none') : 'opacity-100'
      } ${positionClasses[position]} ${className}`}
      aria-label={t('nav.sectionNavigation', 'Navigation des sections')}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 max-w-xs">
        {/* Section links */}
        <ul className="space-y-1">
          {anchors.map((anchor) => (
            <li key={anchor.id}>
              <button
                onClick={() => scrollToSection(anchor.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  activeSection === anchor.id
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title={anchor.description}
              >
                {anchor.title}
              </button>
            </li>
          ))}
        </ul>

        {/* Back to top button */}
        {showBackToTop && (
          <>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              {t('nav.backToTop', 'Haut de page')}
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}

/**
 * InPageNavigation component for horizontal section navigation
 */
interface InPageNavigationProps {
  page: string
  className?: string
  variant?: 'tabs' | 'pills' | 'underline'
}

export const InPageNavigation: React.FC<InPageNavigationProps> = ({
  page,
  className = '',
  variant = 'underline'
}) => {
  const { getSectionAnchors } = useInternalLinks()
  const [activeSection, setActiveSection] = useState<string>('')
  
  const anchors = getSectionAnchors(page)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150
      
      let currentSection = ''
      for (const anchor of anchors) {
        const element = document.getElementById(anchor.id)
        if (element) {
          const elementTop = element.offsetTop
          const elementBottom = elementTop + element.offsetHeight
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            currentSection = anchor.id
            break
          }
        }
      }
      
      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [anchors])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.offsetTop - headerOffset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  if (anchors.length === 0) {
    return null
  }

  const variantClasses = {
    tabs: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
    underline: 'border-b border-gray-200 dark:border-gray-700'
  }

  const itemClasses = {
    tabs: (isActive: boolean) => `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
      isActive
        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
    }`,
    pills: (isActive: boolean) => `px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`,
    underline: (isActive: boolean) => `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
      isActive
        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`
  }

  return (
    <nav className={`in-page-navigation ${variantClasses[variant]} ${className}`}>
      <ul className="flex space-x-1 overflow-x-auto">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <button
              onClick={() => scrollToSection(anchor.id)}
              className={itemClasses[variant](activeSection === anchor.id)}
              title={anchor.description}
            >
              {anchor.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * TableOfContents component for displaying page structure
 */
interface TableOfContentsProps {
  page: string
  className?: string
  title?: string
  showTitle?: boolean
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  page,
  className = '',
  title,
  showTitle = true
}) => {
  const { getSectionAnchors } = useInternalLinks()
  const { t } = useLanguage()
  
  const anchors = getSectionAnchors(page)
  
  if (anchors.length === 0) {
    return null
  }

  const displayTitle = title || t('nav.tableOfContents', 'Table des matières')

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.offsetTop - headerOffset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={`table-of-contents ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {displayTitle}
        </h3>
      )}
      
      <ul className="space-y-2">
        {anchors.map((anchor, index) => (
          <li key={anchor.id}>
            <button
              onClick={() => scrollToSection(anchor.id)}
              className="text-left w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
              title={anchor.description}
            >
              <span className="text-gray-400 dark:text-gray-500 mr-2">
                {(index + 1).toString().padStart(2, '0')}.
              </span>
              {anchor.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SectionAnchors