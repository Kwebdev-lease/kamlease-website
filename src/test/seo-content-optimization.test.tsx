import { describe, it, expect } from 'vitest'
import { contentOptimizer } from '@/lib/content-optimizer'

describe('SEO Content Optimization', () => {
  describe('Keyword Targeting Strategy', () => {
    it('should include all primary keywords for French', () => {
      const primaryKeywords = ['solutions mécatroniques', 'électronique industrielle', 'auto-staging', 'ingénierie mécatronique']
      
      primaryKeywords.forEach(keyword => {
        const analysis = contentOptimizer.analyzeContent(`Test content with ${keyword}`, 'fr')
        const keywordAnalysis = analysis.keywordAnalysis.find(k => k.keyword === keyword)
        expect(keywordAnalysis).toBeDefined()
        expect(keywordAnalysis!.count).toBeGreaterThan(0)
      })
    })

    it('should include all primary keywords for English', () => {
      const primaryKeywords = ['mechatronic solutions', 'industrial electronics', 'auto-staging', 'mechatronic engineering']
      
      primaryKeywords.forEach(keyword => {
        const analysis = contentOptimizer.analyzeContent(`Test content with ${keyword}`, 'en')
        const keywordAnalysis = analysis.keywordAnalysis.find(k => k.keyword === keyword)
        expect(keywordAnalysis).toBeDefined()
        expect(keywordAnalysis!.count).toBeGreaterThan(0)
      })
    })

    it('should detect keywords in headings', () => {
      const content = '<h1>Solutions mécatroniques innovantes</h1><h2>Électronique industrielle</h2><p>Content about auto-staging</p>'
      const analysis = contentOptimizer.analyzeContent(content, 'fr')
      
      const solutionsKeyword = analysis.keywordAnalysis.find(k => k.keyword === 'solutions mécatroniques')
      const electronicsKeyword = analysis.keywordAnalysis.find(k => k.keyword === 'électronique industrielle')
      
      expect(solutionsKeyword!.inHeadings).toBe(true)
      expect(electronicsKeyword!.inHeadings).toBe(true)
    })
  })

  describe('Heading Hierarchy Optimization', () => {
    it('should generate proper heading structure for hero section', () => {
      const headings = contentOptimizer.generateOptimizedHeadings('hero', 'fr')
      
      expect(headings.h1).toContain('Solutions Mécatroniques Innovantes | Kamlease')
      expect(headings.h2).toContain('Expertise en Auto-staging et Électronique Industrielle')
      expect(headings.h3).toContain('Développement Produits Industriels Sur Mesure')
    })

    it('should generate proper heading structure for about section', () => {
      const headings = contentOptimizer.generateOptimizedHeadings('about', 'fr')
      
      expect(headings.h2).toContain('Expertise Mécatronique et Auto-staging - 30 ans d\'expérience')
      expect(headings.h3).toContain('Innovation en Électronique Industrielle')
      expect(headings.h3).toContain('Qualité et Performance')
      expect(headings.h3).toContain('Partenariat Stratégique')
    })

    it('should generate proper heading structure for expertise section', () => {
      const headings = contentOptimizer.generateOptimizedHeadings('expertise', 'fr')
      
      expect(headings.h2).toContain('Ingénierie Mécatronique Avancée')
      expect(headings.h3).toContain('Collaboration Sur Mesure')
      expect(headings.h3).toContain('Innovation et Qualité')
      expect(headings.h3).toContain('Optimisation des Coûts')
    })

    it('should include long-tail keywords in H4 headings', () => {
      const headings = contentOptimizer.generateOptimizedHeadings('expertise', 'fr')
      
      expect(headings.h4).toContain('Développement Électronique Industriel')
      expect(headings.h4).toContain('Solutions Auto-staging')
    })
  })

  describe('Internal Links Strategy', () => {
    it('should generate strategic internal links for hero section', () => {
      const links = contentOptimizer.generateInternalLinks('hero', 'fr')
      
      expect(links.length).toBeGreaterThan(0)
      expect(links.some(link => link.href === '#about')).toBe(true)
      expect(links.some(link => link.href === '#expertise')).toBe(true)
      expect(links.some(link => link.isKeywordRich)).toBe(true)
    })

    it('should generate strategic internal links for about section', () => {
      const links = contentOptimizer.generateInternalLinks('about', 'fr')
      
      expect(links.length).toBeGreaterThan(0)
      expect(links.some(link => link.href === '#expertise')).toBe(true)
      expect(links.some(link => link.href === '#contact')).toBe(true)
    })

    it('should generate strategic internal links for expertise section', () => {
      const links = contentOptimizer.generateInternalLinks('expertise', 'fr')
      
      expect(links.length).toBeGreaterThan(0)
      expect(links.some(link => link.href === '#about')).toBe(true)
      expect(links.some(link => link.href === '#contact')).toBe(true)
    })

    it('should include keyword-rich anchor text', () => {
      const heroLinks = contentOptimizer.generateInternalLinks('hero', 'fr')
      const keywordRichLinks = heroLinks.filter(link => link.isKeywordRich)
      
      expect(keywordRichLinks.length).toBeGreaterThan(0)
      expect(keywordRichLinks.some(link => 
        link.text.toLowerCase().includes('mécatronique')
      )).toBe(true)
    })
  })

  describe('Content Analysis and Validation', () => {
    it('should analyze keyword density correctly', () => {
      const content = 'Solutions mécatroniques innovantes. Nos solutions mécatroniques sont excellentes. Solutions mécatroniques pour tous.'
      const analysis = contentOptimizer.analyzeContent(content, 'fr')
      
      const keywordAnalysis = analysis.keywordAnalysis.find(k => k.keyword === 'solutions mécatroniques')
      expect(keywordAnalysis).toBeDefined()
      expect(keywordAnalysis!.count).toBe(3)
      expect(keywordAnalysis!.density).toBeGreaterThan(0)
    })

    it('should validate keyword density recommendations', () => {
      const lowDensityContent = 'word '.repeat(1000) + 'solutions mécatroniques'
      const analysis = contentOptimizer.analyzeContent(lowDensityContent, 'fr')
      const validation = contentOptimizer.validateKeywordDensity(analysis)
      
      expect(validation.isValid).toBe(false)
      expect(validation.recommendations.length).toBeGreaterThan(0)
      expect(validation.recommendations.some(rec => rec.includes('Increase density'))).toBe(true)
    })

    it('should recommend reducing density for high keyword usage', () => {
      const highDensityContent = 'solutions mécatroniques '.repeat(50)
      const analysis = contentOptimizer.analyzeContent(highDensityContent, 'fr')
      const validation = contentOptimizer.validateKeywordDensity(analysis)
      
      expect(validation.isValid).toBe(false)
      expect(validation.recommendations.some(rec => rec.includes('Reduce density'))).toBe(true)
    })

    it('should calculate SEO score based on multiple factors', () => {
      const optimizedContent = `
        <h1>Solutions Mécatroniques Innovantes</h1>
        <h2>Expertise en Auto-staging et Électronique Industrielle</h2>
        <h3>Ingénierie Mécatronique Avancée</h3>
        <p>Nos solutions mécatroniques offrent une expertise unique en électronique industrielle et auto-staging. L'ingénierie mécatronique est au cœur de notre approche pour développer des solutions innovantes. Notre expertise en auto-staging permet d'adapter les produits automobiles aux besoins industriels.</p>
        <p>Grâce à notre approche d'ingénierie mécatronique avancée, nous développons des solutions personnalisées qui répondent aux exigences spécifiques de chaque client en électronique industrielle.</p>
      `
      
      const analysis = contentOptimizer.analyzeContent(optimizedContent, 'fr', 'Solutions Mécatroniques | Kamlease', 'Découvrez nos solutions mécatroniques')
      
      // Should have a reasonable SEO score
      expect(analysis.seoScore).toBeGreaterThan(25)
      expect(analysis.wordCount).toBeGreaterThan(50)
      
      // Check that primary keywords are detected
      const primaryKeyword = analysis.keywordAnalysis.find(k => k.keyword === 'solutions mécatroniques')
      expect(primaryKeyword!.inHeadings).toBe(true)
      expect(primaryKeyword!.inTitle).toBe(true)
    })
  })

  describe('Title and Description Optimization', () => {
    it('should generate optimized titles for all sections', () => {
      const heroTitle = contentOptimizer.generateOptimizedTitle('Accueil', 'fr', 'hero')
      const aboutTitle = contentOptimizer.generateOptimizedTitle('À propos', 'fr', 'about')
      const expertiseTitle = contentOptimizer.generateOptimizedTitle('Expertise', 'fr', 'expertise')
      
      expect(heroTitle).toContain('Solutions Mécatroniques Innovantes')
      expect(aboutTitle).toContain('Expertise Mécatronique et Auto-staging')
      expect(expertiseTitle).toContain('Ingénierie Mécatronique Avancée')
      
      // All should contain Kamlease brand
      expect(heroTitle).toContain('Kamlease')
      expect(aboutTitle).toContain('Kamlease')
      expect(expertiseTitle).toContain('Kamlease')
    })

    it('should generate optimized descriptions with keywords', () => {
      const description = contentOptimizer.generateOptimizedDescription('Great company', 'fr')
      expect(description.toLowerCase()).toContain('solutions mécatroniques')
    })

    it('should respect maximum description length', () => {
      const longDescription = 'A'.repeat(200)
      const optimizedDescription = contentOptimizer.generateOptimizedDescription(longDescription, 'fr')
      expect(optimizedDescription.length).toBeLessThanOrEqual(155)
    })
  })

  describe('Multilingual Optimization', () => {
    it('should optimize for French market keywords', () => {
      const frenchKeywords = ['solutions mécatroniques', 'électronique industrielle', 'auto-staging', 'ingénierie mécatronique']
      
      frenchKeywords.forEach(keyword => {
        const analysis = contentOptimizer.analyzeContent(`Content about ${keyword}`, 'fr')
        const keywordData = analysis.keywordAnalysis.find(k => k.keyword === keyword)
        expect(keywordData).toBeDefined()
      })
    })

    it('should optimize for English market keywords', () => {
      const englishKeywords = ['mechatronic solutions', 'industrial electronics', 'auto-staging', 'mechatronic engineering']
      
      englishKeywords.forEach(keyword => {
        const analysis = contentOptimizer.analyzeContent(`Content about ${keyword}`, 'en')
        const keywordData = analysis.keywordAnalysis.find(k => k.keyword === keyword)
        expect(keywordData).toBeDefined()
      })
    })

    it('should generate language-specific headings', () => {
      const frenchHeadings = contentOptimizer.generateOptimizedHeadings('hero', 'fr')
      const englishHeadings = contentOptimizer.generateOptimizedHeadings('hero', 'en')
      
      expect(frenchHeadings.h1[0]).toContain('Solutions Mécatroniques Innovantes')
      expect(englishHeadings.h1[0]).toContain('Innovative Mechatronic Solutions')
    })

    it('should generate language-specific internal links', () => {
      const frenchLinks = contentOptimizer.generateInternalLinks('hero', 'fr')
      const englishLinks = contentOptimizer.generateInternalLinks('hero', 'en')
      
      expect(frenchLinks.some(link => link.text.includes('mécatronique'))).toBe(true)
      expect(englishLinks.some(link => link.text.includes('mechatronic'))).toBe(true)
    })
  })
})