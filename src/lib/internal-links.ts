import { Language } from './translations'

export interface InternalLink {
  url: string
  text: string
  title?: string
  context: string
  keywords: string[]
  priority: number // 1-10, higher is more important
}

export interface SectionAnchor {
  id: string
  title: string
  url: string
  keywords: string[]
  description?: string
}

/**
 * Service for managing internal links and navigation anchors
 * Optimizes internal linking for SEO and user experience
 */
export class InternalLinksService {
  private static instance: InternalLinksService
  private links: Map<string, InternalLink[]> = new Map()
  private anchors: Map<string, SectionAnchor[]> = new Map()

  private constructor() {
    this.initializeLinks()
    this.initializeAnchors()
  }

  static getInstance(): InternalLinksService {
    if (!InternalLinksService.instance) {
      InternalLinksService.instance = new InternalLinksService()
    }
    return InternalLinksService.instance
  }

  /**
   * Initialize contextual internal links
   */
  private initializeLinks(): void {
    // Homepage contextual links
    this.links.set('home', [
      {
        url: '#about',
        text: 'notre expertise en mécatronique',
        title: 'Découvrir notre expertise',
        context: 'hero-section',
        keywords: ['mécatronique', 'expertise', 'solutions'],
        priority: 9
      },
      {
        url: '#expertise',
        text: 'nos solutions innovantes',
        title: 'Voir nos domaines d\'expertise',
        context: 'about-section',
        keywords: ['solutions', 'innovation', 'électronique'],
        priority: 8
      },
      {
        url: '#process',
        text: 'notre processus de développement',
        title: 'Comprendre notre méthodologie',
        context: 'expertise-section',
        keywords: ['processus', 'développement', 'méthodologie'],
        priority: 7
      },
      {
        url: '#contact',
        text: 'contactez notre équipe',
        title: 'Démarrer votre projet',
        context: 'process-section',
        keywords: ['contact', 'projet', 'devis'],
        priority: 10
      }
    ])

    // About section contextual links
    this.links.set('about', [
      {
        url: '#expertise',
        text: 'découvrir nos domaines d\'expertise',
        title: 'Nos compétences techniques',
        context: 'about-description',
        keywords: ['expertise', 'compétences', 'techniques'],
        priority: 8
      },
      {
        url: '#process',
        text: 'notre approche méthodologique',
        title: 'Comment nous travaillons',
        context: 'about-values',
        keywords: ['méthodologie', 'approche', 'collaboration'],
        priority: 7
      }
    ])

    // Expertise section contextual links
    this.links.set('expertise', [
      {
        url: '#process',
        text: 'notre processus de réalisation',
        title: 'De l\'idée à l\'industrialisation',
        context: 'expertise-areas',
        keywords: ['processus', 'réalisation', 'industrialisation'],
        priority: 8
      },
      {
        url: '#contact',
        text: 'discuter de votre projet',
        title: 'Obtenir un devis personnalisé',
        context: 'expertise-optimization',
        keywords: ['projet', 'devis', 'consultation'],
        priority: 9
      }
    ])

    // Process section contextual links
    this.links.set('process', [
      {
        url: '#contact',
        text: 'commencer votre projet',
        title: 'Première consultation gratuite',
        context: 'process-steps',
        keywords: ['projet', 'consultation', 'démarrage'],
        priority: 10
      },
      {
        url: '#about',
        text: 'en savoir plus sur notre équipe',
        title: 'Qui sommes-nous',
        context: 'process-methodology',
        keywords: ['équipe', 'expérience', 'expertise'],
        priority: 6
      }
    ])

    // Legal pages links
    this.links.set('legal', [
      {
        url: '/',
        text: 'retour à l\'accueil',
        title: 'Découvrir nos services',
        context: 'legal-navigation',
        keywords: ['accueil', 'services', 'solutions'],
        priority: 8
      },
      {
        url: '/#contact',
        text: 'nous contacter',
        title: 'Poser une question',
        context: 'legal-contact',
        keywords: ['contact', 'question', 'support'],
        priority: 7
      }
    ])
  }

  /**
   * Initialize section anchors for navigation
   */
  private initializeAnchors(): void {
    // Homepage anchors
    this.anchors.set('home', [
      {
        id: 'hero',
        title: 'Accueil',
        url: '#hero',
        keywords: ['kamlease', 'mécatronique', 'innovation'],
        description: 'Solutions innovantes en mécatronique et électronique'
      },
      {
        id: 'about',
        title: 'À propos',
        url: '#about',
        keywords: ['expertise', 'auto-staging', 'collaboration'],
        description: 'Notre expertise en mécatronique et auto-staging'
      },
      {
        id: 'expertise',
        title: 'Expertise',
        url: '#expertise',
        keywords: ['solutions', 'innovation', 'optimisation'],
        description: 'Nos domaines d\'expertise et solutions techniques'
      },
      {
        id: 'process',
        title: 'Processus',
        url: '#process',
        keywords: ['méthodologie', 'développement', 'industrialisation'],
        description: 'Notre processus de développement de l\'idée à l\'industrialisation'
      },
      {
        id: 'stats',
        title: 'Résultats',
        url: '#stats',
        keywords: ['gains', 'économies', 'performance'],
        description: 'Nos résultats et gains réalisés pour nos clients'
      },
      {
        id: 'contact',
        title: 'Contact',
        url: '#contact',
        keywords: ['contact', 'projet', 'devis'],
        description: 'Contactez-nous pour démarrer votre projet'
      }
    ])

    // Legal pages anchors
    this.anchors.set('legal-notice', [
      {
        id: 'publisher',
        title: 'Éditeur',
        url: '#publisher',
        keywords: ['éditeur', 'kamlease', 'informations'],
        description: 'Informations sur l\'éditeur du site'
      },
      {
        id: 'hosting',
        title: 'Hébergement',
        url: '#hosting',
        keywords: ['hébergement', 'serveur', 'technique'],
        description: 'Informations sur l\'hébergement du site'
      }
    ])

    this.anchors.set('privacy-policy', [
      {
        id: 'collection',
        title: 'Collecte des données',
        url: '#collection',
        keywords: ['données', 'collecte', 'rgpd'],
        description: 'Comment nous collectons vos données personnelles'
      },
      {
        id: 'usage',
        title: 'Utilisation',
        url: '#usage',
        keywords: ['utilisation', 'traitement', 'finalité'],
        description: 'Comment nous utilisons vos données'
      },
      {
        id: 'rights',
        title: 'Vos droits',
        url: '#rights',
        keywords: ['droits', 'rgpd', 'protection'],
        description: 'Vos droits concernant vos données personnelles'
      }
    ])
  }

  /**
   * Get contextual internal links for a specific section
   */
  getContextualLinks(context: string, maxLinks: number = 3): InternalLink[] {
    const links = this.links.get(context) || []
    return links
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxLinks)
  }

  /**
   * Get section anchors for navigation
   */
  getSectionAnchors(page: string): SectionAnchor[] {
    return this.anchors.get(page) || []
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
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  /**
   * Get related links based on keywords
   */
  getRelatedLinks(keywords: string[], currentUrl: string, maxLinks: number = 5): InternalLink[] {
    const allLinks: InternalLink[] = []
    
    // Collect all links from all contexts
    for (const contextLinks of this.links.values()) {
      allLinks.push(...contextLinks)
    }

    // Filter out current page and score by keyword relevance
    const scoredLinks = allLinks
      .filter(link => link.url !== currentUrl)
      .map(link => {
        const score = keywords.reduce((acc, keyword) => {
          const keywordLower = keyword.toLowerCase()
          const matchCount = link.keywords.filter(linkKeyword => 
            linkKeyword.toLowerCase().includes(keywordLower) ||
            keywordLower.includes(linkKeyword.toLowerCase())
          ).length
          return acc + matchCount
        }, 0)
        
        return { ...link, relevanceScore: score > 0 ? score + link.priority : 0 }
      })
      .filter(link => link.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)

    return scoredLinks.slice(0, maxLinks)
  }

  /**
   * Add custom internal link
   */
  addContextualLink(context: string, link: InternalLink): void {
    const existingLinks = this.links.get(context) || []
    existingLinks.push(link)
    this.links.set(context, existingLinks)
  }

  /**
   * Add section anchor
   */
  addSectionAnchor(page: string, anchor: SectionAnchor): void {
    const existingAnchors = this.anchors.get(page) || []
    existingAnchors.push(anchor)
    this.anchors.set(page, existingAnchors)
  }

  /**
   * Get all internal links for sitemap generation
   */
  getAllInternalUrls(): string[] {
    const urls = new Set<string>()
    
    // Add anchor URLs
    for (const anchors of this.anchors.values()) {
      anchors.forEach(anchor => {
        if (!anchor.url.startsWith('#')) {
          urls.add(anchor.url)
        }
      })
    }

    // Add link URLs
    for (const links of this.links.values()) {
      links.forEach(link => {
        if (!link.url.startsWith('#')) {
          urls.add(link.url)
        }
      })
    }

    return Array.from(urls)
  }
}

/**
 * React hook for using internal links service
 */
export const useInternalLinks = () => {
  const service = InternalLinksService.getInstance()
  
  return {
    getContextualLinks: (context: string, maxLinks?: number) => 
      service.getContextualLinks(context, maxLinks),
    getSectionAnchors: (page: string) => 
      service.getSectionAnchors(page),
    getRelatedLinks: (keywords: string[], currentUrl: string, maxLinks?: number) => 
      service.getRelatedLinks(keywords, currentUrl, maxLinks),
    generateUrlSlug: (text: string) => 
      service.generateUrlSlug(text)
  }
}

export default InternalLinksService