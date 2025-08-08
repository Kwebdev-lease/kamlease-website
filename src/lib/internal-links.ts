export interface InternalLink {
  title: string
  url: string
  keywords: string[]
  description?: string
  priority: number
  context?: string
  relevanceScore?: number
}

/**
 * Service for managing internal links and navigation anchors
 * Optimizes internal linking for SEO and user experience
 */
export class InternalLinksService {
  private static instance: InternalLinksService
  private links: Map<string, InternalLink[]> = new Map()

  private constructor() {
    this.initializeLinks()
  }

  public static getInstance(): InternalLinksService {
    if (!InternalLinksService.instance) {
      InternalLinksService.instance = new InternalLinksService()
    }
    return InternalLinksService.instance
  }

  /**
   * Initialize default internal links
   */
  private initializeLinks(): void {
    // Home page links
    this.addLink('home', {
      title: 'À propos de Kamlease',
      url: '#about',
      keywords: ['kamlease', 'entreprise', 'présentation'],
      description: 'Découvrez l\'histoire et les valeurs de Kamlease',
      priority: 9
    })

    this.addLink('home', {
      title: 'Nos domaines d\'expertise',
      url: '#expertise',
      keywords: ['expertise', 'mécatronique', 'auto-staging'],
      description: 'Explorez nos domaines d\'expertise technique',
      priority: 10
    })

    this.addLink('home', {
      title: 'Notre processus de travail',
      url: '#process',
      keywords: ['processus', 'méthode', 'collaboration'],
      description: 'Découvrez notre approche collaborative',
      priority: 8
    })

    this.addLink('home', {
      title: 'Nous contacter',
      url: '#contact',
      keywords: ['contact', 'devis', 'projet'],
      description: 'Contactez-nous pour votre projet',
      priority: 7
    })

    // Contextual links
    this.addContextualLink('about-section', {
      title: 'Voir nos domaines d\'expertise',
      url: '#expertise',
      keywords: ['solutions', 'innovation', 'électronique'],
      description: 'Découvrez nos compétences techniques',
      priority: 8
    })

    this.addContextualLink('expertise-section', {
      title: 'Découvrir notre processus',
      url: '#process',
      keywords: ['méthode', 'collaboration', 'développement'],
      description: 'Notre approche de développement',
      priority: 7
    })

    this.addContextualLink('process-section', {
      title: 'Demander un devis',
      url: '#contact',
      keywords: ['devis', 'projet', 'consultation'],
      description: 'Obtenez un devis pour votre projet',
      priority: 9
    })
  }

  /**
   * Add internal link
   */
  addLink(page: string, link: InternalLink): void {
    const existingLinks = this.links.get(page) || []
    existingLinks.push(link)
    this.links.set(page, existingLinks)
  }

  /**
   * Add contextual link
   */
  addContextualLink(context: string, link: InternalLink): void {
    const contextKey = `context:${context}`
    const existingLinks = this.links.get(contextKey) || []
    existingLinks.push({ ...link, context })
    this.links.set(contextKey, existingLinks)
  }

  /**
   * Get internal links for a page
   */
  getInternalLinks(page: string, maxLinks: number = 5): InternalLink[] {
    const links = this.links.get(page) || []
    return links
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxLinks)
  }

  /**
   * Get contextual links
   */
  getContextualLinks(context: string, maxLinks: number = 3): InternalLink[] {
    const contextKey = `context:${context}`
    const links = this.links.get(contextKey) || []
    return links
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxLinks)
  }

  /**
   * Get related links based on keywords
   */
  getRelatedLinks(keywords: string[], currentUrl: string, maxLinks: number = 4): InternalLink[] {
    const allLinks: InternalLink[] = []
    
    // Collect all links from all pages
    for (const [page, links] of this.links.entries()) {
      if (!page.startsWith('context:')) {
        allLinks.push(...links)
      }
    }

    // Filter out current page and calculate relevance
    const relevantLinks = allLinks
      .filter(link => link.url !== currentUrl)
      .map(link => {
        const relevanceScore = this.calculateRelevance(keywords, link.keywords)
        return { ...link, relevanceScore }
      })
      .filter(link => link.relevanceScore > 0)

    return relevantLinks
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, maxLinks)
  }

  /**
   * Calculate relevance score between keywords
   */
  private calculateRelevance(searchKeywords: string[], linkKeywords: string[]): number {
    let score = 0
    const normalizedSearch = searchKeywords.map(k => k.toLowerCase())
    const normalizedLink = linkKeywords.map(k => k.toLowerCase())

    for (const searchKeyword of normalizedSearch) {
      for (const linkKeyword of normalizedLink) {
        if (searchKeyword === linkKeyword) {
          score += 3 // Exact match
        } else if (searchKeyword.includes(linkKeyword) || linkKeyword.includes(searchKeyword)) {
          score += 1 // Partial match
        }
      }
    }

    return score
  }

  /**
   * Generate SEO-friendly URL slug
   */
  generateUrlSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  /**
   * Get all internal links for sitemap generation
   */
  getAllLinks(): Map<string, InternalLink[]> {
    return new Map(this.links)
  }
}

// Create singleton instance
const service = InternalLinksService.getInstance()

// Export hook for React components
export const useInternalLinks = () => {
  return {
    getInternalLinks: (page: string, maxLinks?: number) => 
      service.getInternalLinks(page, maxLinks),
    getContextualLinks: (context: string, maxLinks?: number) => 
      service.getContextualLinks(context, maxLinks),
    getRelatedLinks: (keywords: string[], currentUrl: string, maxLinks?: number) => 
      service.getRelatedLinks(keywords, currentUrl, maxLinks),
    generateUrlSlug: (text: string) => 
      service.generateUrlSlug(text)
  }
}

export default InternalLinksService