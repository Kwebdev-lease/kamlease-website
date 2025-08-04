import React from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useInternalLinks, InternalLink } from '@/lib/internal-links'
import { useLanguage } from '@/contexts/LanguageProvider'

interface ContextualLinksProps {
  context: string
  maxLinks?: number
  className?: string
  title?: string
  showTitle?: boolean
  variant?: 'default' | 'compact' | 'inline'
}

/**
 * ContextualLinks component for displaying relevant internal links
 * Improves SEO through strategic internal linking
 */
export const ContextualLinks: React.FC<ContextualLinksProps> = ({
  context,
  maxLinks = 3,
  className = '',
  title,
  showTitle = true,
  variant = 'default'
}) => {
  const { getContextualLinks } = useInternalLinks()
  const { t } = useLanguage()
  
  const links = getContextualLinks(context, maxLinks)
  
  if (links.length === 0) {
    return null
  }

  const defaultTitle = t('nav.relatedLinks', 'Liens connexes')
  const displayTitle = title || defaultTitle

  const renderLink = (link: InternalLink, index: number) => {
    const isExternal = link.url.startsWith('http')
    const isAnchor = link.url.startsWith('#')
    
    const handleClick = (e: React.MouseEvent) => {
      if (isAnchor) {
        e.preventDefault()
        const elementId = link.url.substring(1)
        const element = document.getElementById(elementId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    const linkClasses = {
      default: "group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
      compact: "group flex items-center space-x-2 text-sm hover:text-orange-500 transition-colors duration-200",
      inline: "inline-link text-orange-500 hover:text-orange-600 underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-200"
    }

    const content = (
      <>
        <span className="flex-1">
          {link.text}
        </span>
        {variant === 'default' && (
          <span className="ml-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
            {isExternal ? (
              <ExternalLink className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </span>
        )}
      </>
    )

    return (
      <li key={`${link.url}-${index}`}>
        <a
          href={link.url}
          onClick={handleClick}
          title={link.title}
          className={linkClasses[variant]}
          {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {content}
        </a>
      </li>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={className}>
        {links.map((link, index) => (
          <React.Fragment key={`${link.url}-${index}`}>
            {index > 0 && ', '}
            {renderLink(link, index)}
          </React.Fragment>
        ))}
      </span>
    )
  }

  return (
    <div className={`contextual-links ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {displayTitle}
        </h3>
      )}
      
      <ul className={`space-y-${variant === 'compact' ? '2' : '3'}`}>
        {links.map(renderLink)}
      </ul>
    </div>
  )
}

/**
 * InlineContextualLink component for embedding links within text
 */
interface InlineContextualLinkProps {
  context: string
  linkIndex?: number
  className?: string
  children?: React.ReactNode
}

export const InlineContextualLink: React.FC<InlineContextualLinkProps> = ({
  context,
  linkIndex = 0,
  className = '',
  children
}) => {
  const { getContextualLinks } = useInternalLinks()
  
  const links = getContextualLinks(context, linkIndex + 1)
  const link = links[linkIndex]
  
  if (!link) {
    return <>{children}</>
  }

  const isAnchor = link.url.startsWith('#')
  
  const handleClick = (e: React.MouseEvent) => {
    if (isAnchor) {
      e.preventDefault()
      const elementId = link.url.substring(1)
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <a
      href={link.url}
      onClick={handleClick}
      title={link.title}
      className={`inline-contextual-link text-orange-500 hover:text-orange-600 underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-200 ${className}`}
    >
      {children || link.text}
    </a>
  )
}

/**
 * RelatedLinks component for showing links based on keywords
 */
interface RelatedLinksProps {
  keywords: string[]
  currentUrl: string
  maxLinks?: number
  className?: string
  title?: string
}

export const RelatedLinks: React.FC<RelatedLinksProps> = ({
  keywords,
  currentUrl,
  maxLinks = 5,
  className = '',
  title
}) => {
  const { getRelatedLinks } = useInternalLinks()
  const { t } = useLanguage()
  
  const links = getRelatedLinks(keywords, currentUrl, maxLinks)
  
  if (links.length === 0) {
    return null
  }

  const displayTitle = title || t('nav.relatedContent', 'Contenu connexe')

  return (
    <div className={`related-links ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {displayTitle}
      </h3>
      
      <ul className="space-y-3">
        {links.map((link, index) => {
          const isAnchor = link.url.startsWith('#')
          
          const handleClick = (e: React.MouseEvent) => {
            if (isAnchor) {
              e.preventDefault()
              const elementId = link.url.substring(1)
              const element = document.getElementById(elementId)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }
          }

          return (
            <li key={`${link.url}-${index}`}>
              <a
                href={link.url}
                onClick={handleClick}
                title={link.title}
                className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <span className="flex-1 text-sm">
                  {link.text}
                </span>
                <ArrowRight className="h-4 w-4 ml-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ContextualLinks