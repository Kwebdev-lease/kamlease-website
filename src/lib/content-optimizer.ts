import { Language } from './translations'

export interface KeywordAnalysis {
  keyword: string
  density: number
  count: number
  positions: number[]
  inTitle: boolean
  inHeadings: boolean
  inMetaDescription: boolean
}

export interface ContentAnalysis {
  wordCount: number
  keywordAnalysis: KeywordAnalysis[]
  headingStructure: HeadingStructure
  internalLinks: InternalLink[]
  readabilityScore: number
  seoScore: number
}

export interface HeadingStructure {
  h1: string[]
  h2: string[]
  h3: string[]
  h4: string[]
  h5: string[]
  h6: string[]
}

export interface InternalLink {
  text: string
  href: string
  section: string
  isKeywordRich: boolean
}

export interface SEOKeywords {
  primary: string[]
  secondary: string[]
  longTail: string[]
}

export class ContentOptimizer {
  private readonly targetKeywords: Record<Language, SEOKeywords> = {
    fr: {
      primary: [
        'solutions mécatroniques',
        'électronique industrielle',
        'auto-staging',
        'ingénierie mécatronique'
      ],
      secondary: [
        'conception électronique',
        'développement produits industriels',
        'optimisation coûts industriels',
        'innovation mécatronique',
        'expertise automobile'
      ],
      longTail: [
        'adaptation produits automobiles industrie',
        'solutions mécatroniques sur mesure',
        'développement électronique industriel France',
        'optimisation processus industriels'
      ]
    },
    en: {
      primary: [
        'mechatronic solutions',
        'industrial electronics',
        'auto-staging',
        'mechatronic engineering'
      ],
      secondary: [
        'electronic design',
        'industrial product development',
        'industrial cost optimization',
        'mechatronic innovation',
        'automotive expertise'
      ],
      longTail: [
        'automotive products industry adaptation',
        'custom mechatronic solutions',
        'industrial electronic development France',
        'industrial process optimization'
      ]
    }
  }

  /**
   * Analyze content for keyword density and SEO optimization
   */
  analyzeContent(content: string, language: Language, title?: string, metaDescription?: string): ContentAnalysis {
    const words = this.extractWords(content)
    const wordCount = words.length
    const keywords = this.targetKeywords[language]
    const allKeywords = [...keywords.primary, ...keywords.secondary, ...keywords.longTail]
    
    const keywordAnalysis = allKeywords.map(keyword => 
      this.analyzeKeyword(keyword, content, words, title, metaDescription)
    )

    const headingStructure = this.extractHeadingStructure(content)
    const internalLinks = this.extractInternalLinks(content)
    const readabilityScore = this.calculateReadabilityScore(content, language)
    const seoScore = this.calculateSEOScore(keywordAnalysis, headingStructure, wordCount)

    return {
      wordCount,
      keywordAnalysis,
      headingStructure,
      internalLinks,
      readabilityScore,
      seoScore
    }
  }

  /**
   * Generate SEO-optimized title with target keywords
   */
  generateOptimizedTitle(baseTitle: string, language: Language, section?: string): string {
    const keywords = this.targetKeywords[language]
    const primaryKeyword = keywords.primary[0]
    
    // Section-specific optimization
    const sectionKeywords: Record<string, string> = {
      hero: language === 'fr' ? 'Solutions Mécatroniques Innovantes' : 'Innovative Mechatronic Solutions',
      about: language === 'fr' ? 'Expertise Mécatronique et Auto-staging' : 'Mechatronic and Auto-staging Expertise',
      expertise: language === 'fr' ? 'Ingénierie Mécatronique Avancée' : 'Advanced Mechatronic Engineering',
      contact: language === 'fr' ? 'Devis Solutions Mécatroniques' : 'Mechatronic Solutions Quote'
    }

    if (section && sectionKeywords[section]) {
      return `${baseTitle} | ${sectionKeywords[section]} | Kamlease`
    }

    return `${baseTitle} | ${primaryKeyword} | Kamlease`
  }

  /**
   * Generate SEO-optimized meta description
   */
  generateOptimizedDescription(baseDescription: string, language: Language, section?: string): string {
    const keywords = this.targetKeywords[language]
    const maxLength = 155
    
    // Ensure primary keywords are included
    let optimizedDescription = baseDescription
    
    // Add primary keyword if not present
    if (!optimizedDescription.toLowerCase().includes(keywords.primary[0].toLowerCase())) {
      const keywordPhrase = language === 'fr' 
        ? `Découvrez nos ${keywords.primary[0]}`
        : `Discover our ${keywords.primary[0]}`
      optimizedDescription = `${keywordPhrase}. ${optimizedDescription}`
    }

    // Truncate if too long
    if (optimizedDescription.length > maxLength) {
      optimizedDescription = optimizedDescription.substring(0, maxLength - 3) + '...'
    }

    return optimizedDescription
  }

  /**
   * Generate optimized heading hierarchy
   */
  generateOptimizedHeadings(section: string, language: Language): HeadingStructure {
    const keywords = this.targetKeywords[language]
    
    const headingTemplates: Record<string, Record<Language, HeadingStructure>> = {
      hero: {
        fr: {
          h1: ['Solutions Mécatroniques Innovantes | Kamlease'],
          h2: ['Expertise en Auto-staging et Électronique Industrielle'],
          h3: ['Développement Produits Industriels Sur Mesure'],
          h4: [],
          h5: [],
          h6: []
        },
        en: {
          h1: ['Innovative Mechatronic Solutions | Kamlease'],
          h2: ['Auto-staging and Industrial Electronics Expertise'],
          h3: ['Custom Industrial Product Development'],
          h4: [],
          h5: [],
          h6: []
        }
      },
      about: {
        fr: {
          h1: [],
          h2: ['Expertise Mécatronique et Auto-staging - 30 ans d\'expérience'],
          h3: ['Innovation en Électronique Industrielle', 'Qualité et Performance', 'Partenariat Stratégique'],
          h4: ['Solutions Mécatroniques Personnalisées'],
          h5: [],
          h6: []
        },
        en: {
          h1: [],
          h2: ['Mechatronic and Auto-staging Expertise - 30 years experience'],
          h3: ['Industrial Electronics Innovation', 'Quality and Performance', 'Strategic Partnership'],
          h4: ['Personalized Mechatronic Solutions'],
          h5: [],
          h6: []
        }
      },
      expertise: {
        fr: {
          h1: [],
          h2: ['Ingénierie Mécatronique Avancée'],
          h3: ['Collaboration Sur Mesure', 'Innovation et Qualité', 'Optimisation des Coûts'],
          h4: ['Développement Électronique Industriel', 'Solutions Auto-staging'],
          h5: [],
          h6: []
        },
        en: {
          h1: [],
          h2: ['Advanced Mechatronic Engineering'],
          h3: ['Tailor-made Collaboration', 'Innovation and Quality', 'Cost Optimization'],
          h4: ['Industrial Electronic Development', 'Auto-staging Solutions'],
          h5: [],
          h6: []
        }
      }
    }

    return headingTemplates[section]?.[language] || {
      h1: [], h2: [], h3: [], h4: [], h5: [], h6: []
    }
  }

  /**
   * Generate strategic internal links
   */
  generateInternalLinks(section: string, language: Language): InternalLink[] {
    const linkTemplates: Record<string, Record<Language, InternalLink[]>> = {
      hero: {
        fr: [
          {
            text: 'Découvrez notre expertise mécatronique',
            href: '#about',
            section: 'about',
            isKeywordRich: true
          },
          {
            text: 'Nos solutions d\'ingénierie avancée',
            href: '#expertise',
            section: 'expertise',
            isKeywordRich: true
          }
        ],
        en: [
          {
            text: 'Discover our mechatronic expertise',
            href: '#about',
            section: 'about',
            isKeywordRich: true
          },
          {
            text: 'Our advanced engineering solutions',
            href: '#expertise',
            section: 'expertise',
            isKeywordRich: true
          }
        ]
      },
      about: {
        fr: [
          {
            text: 'Explorez nos solutions mécatroniques',
            href: '#expertise',
            section: 'expertise',
            isKeywordRich: true
          },
          {
            text: 'Contactez-nous pour votre projet',
            href: '#contact',
            section: 'contact',
            isKeywordRich: false
          }
        ],
        en: [
          {
            text: 'Explore our mechatronic solutions',
            href: '#expertise',
            section: 'expertise',
            isKeywordRich: true
          },
          {
            text: 'Contact us for your project',
            href: '#contact',
            section: 'contact',
            isKeywordRich: false
          }
        ]
      },
      expertise: {
        fr: [
          {
            text: 'En savoir plus sur notre approche',
            href: '#about',
            section: 'about',
            isKeywordRich: false
          },
          {
            text: 'Démarrer votre projet mécatronique',
            href: '#contact',
            section: 'contact',
            isKeywordRich: true
          }
        ],
        en: [
          {
            text: 'Learn more about our approach',
            href: '#about',
            section: 'about',
            isKeywordRich: false
          },
          {
            text: 'Start your mechatronic project',
            href: '#contact',
            section: 'contact',
            isKeywordRich: true
          }
        ]
      }
    }

    return linkTemplates[section]?.[language] || []
  }

  /**
   * Validate keyword density (should be between 1-3%)
   */
  validateKeywordDensity(analysis: ContentAnalysis): { isValid: boolean; recommendations: string[] } {
    const recommendations: string[] = []
    let isValid = true

    analysis.keywordAnalysis.forEach(keyword => {
      if (keyword.density < 0.01) { // Less than 1%
        recommendations.push(`Increase density of "${keyword.keyword}" (currently ${(keyword.density * 100).toFixed(1)}%)`)
        isValid = false
      } else if (keyword.density > 0.03) { // More than 3%
        recommendations.push(`Reduce density of "${keyword.keyword}" (currently ${(keyword.density * 100).toFixed(1)}%)`)
        isValid = false
      }
    })

    return { isValid, recommendations }
  }

  private analyzeKeyword(
    keyword: string, 
    content: string, 
    words: string[], 
    title?: string, 
    metaDescription?: string
  ): KeywordAnalysis {
    const keywordWords = keyword.toLowerCase().split(' ')
    const contentLower = content.toLowerCase()
    const positions: number[] = []
    let count = 0

    // Find all occurrences
    let index = contentLower.indexOf(keyword.toLowerCase())
    while (index !== -1) {
      positions.push(index)
      count++
      index = contentLower.indexOf(keyword.toLowerCase(), index + 1)
    }

    const density = words.length > 0 ? count / words.length : 0
    const inTitle = title ? title.toLowerCase().includes(keyword.toLowerCase()) : false
    const inMetaDescription = metaDescription ? metaDescription.toLowerCase().includes(keyword.toLowerCase()) : false
    const inHeadings = this.isKeywordInHeadings(keyword, content)

    return {
      keyword,
      density,
      count,
      positions,
      inTitle,
      inHeadings,
      inMetaDescription
    }
  }

  private extractWords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }

  private extractHeadingStructure(content: string): HeadingStructure {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
    const structure: HeadingStructure = {
      h1: [], h2: [], h3: [], h4: [], h5: [], h6: []
    }

    let match
    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]) as 1 | 2 | 3 | 4 | 5 | 6
      const text = match[2].replace(/<[^>]*>/g, '').trim()
      structure[`h${level}`].push(text)
    }

    return structure
  }

  private extractInternalLinks(content: string): InternalLink[] {
    const linkRegex = /<a[^>]*href="(#[^"]*)"[^>]*>(.*?)<\/a>/gi
    const links: InternalLink[] = []

    let match
    while ((match = linkRegex.exec(content)) !== null) {
      const href = match[1]
      const text = match[2].replace(/<[^>]*>/g, '').trim()
      const section = href.substring(1) // Remove #
      const isKeywordRich = this.containsKeywords(text)

      links.push({ text, href, section, isKeywordRich })
    }

    return links
  }

  private isKeywordInHeadings(keyword: string, content: string): boolean {
    const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi
    let match
    while ((match = headingRegex.exec(content)) !== null) {
      const headingText = match[1].replace(/<[^>]*>/g, '').toLowerCase()
      if (headingText.includes(keyword.toLowerCase())) {
        return true
      }
    }
    return false
  }

  private containsKeywords(text: string): boolean {
    const allKeywords = [
      ...this.targetKeywords.fr.primary,
      ...this.targetKeywords.fr.secondary,
      ...this.targetKeywords.en.primary,
      ...this.targetKeywords.en.secondary
    ]

    return allKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  private calculateReadabilityScore(content: string, language: Language): number {
    const words = this.extractWords(content)
    const sentences = content.split(/[.!?]+/).length
    const avgWordsPerSentence = words.length / sentences
    
    // Simple readability score (0-100, higher is better)
    // Based on average sentence length and word complexity
    let score = 100
    
    if (avgWordsPerSentence > 20) score -= 20
    if (avgWordsPerSentence > 25) score -= 20
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateSEOScore(
    keywordAnalysis: KeywordAnalysis[], 
    headingStructure: HeadingStructure, 
    wordCount: number
  ): number {
    let score = 0
    const maxScore = 100

    // Keyword density score (30 points)
    const validKeywords = keywordAnalysis.filter(k => k.density >= 0.01 && k.density <= 0.03)
    score += (validKeywords.length / keywordAnalysis.length) * 30

    // Keywords in headings (25 points)
    const keywordsInHeadings = keywordAnalysis.filter(k => k.inHeadings)
    score += (keywordsInHeadings.length / keywordAnalysis.length) * 25

    // Heading structure (20 points)
    const hasH1 = headingStructure.h1.length > 0
    const hasH2 = headingStructure.h2.length > 0
    const hasH3 = headingStructure.h3.length > 0
    
    if (hasH1) score += 8
    if (hasH2) score += 6
    if (hasH3) score += 6

    // Word count (15 points)
    if (wordCount >= 300) score += 15
    else if (wordCount >= 200) score += 10
    else if (wordCount >= 100) score += 5

    // Keywords in title/meta (10 points)
    const keywordsInTitle = keywordAnalysis.filter(k => k.inTitle)
    score += (keywordsInTitle.length / keywordAnalysis.length) * 10

    return Math.min(maxScore, score)
  }
}

export const contentOptimizer = new ContentOptimizer()