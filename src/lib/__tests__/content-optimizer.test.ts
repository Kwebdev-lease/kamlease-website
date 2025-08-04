import { describe, it, expect } from 'vitest'
import { ContentOptimizer } from '../content-optimizer'

describe('ContentOptimizer', () => {
  const optimizer = new ContentOptimizer()

  describe('analyzeContent', () => {
    it('should analyze keyword density correctly', () => {
      const content = 'Solutions mécatroniques innovantes. Nos solutions mécatroniques sont excellentes. Solutions mécatroniques pour tous.'
      const analysis = optimizer.analyzeContent(content, 'fr')
      
      const keywordAnalysis = analysis.keywordAnalysis.find(k => k.keyword === 'solutions mécatroniques')
      expect(keywordAnalysis).toBeDefined()
      expect(keywordAnalysis!.count).toBe(3)
      expect(keywordAnalysis!.density).toBeGreaterThan(0)
    })

    it('should detect keywords in headings', () => {
      const content = '<h1>Solutions mécatroniques</h1><p>Content with solutions mécatroniques</p>'
      const analysis = optimizer.analyzeContent(content, 'fr')
      
      const keywordAnalysis = analysis.keywordAnalysis.find(k => k.keyword === 'solutions mécatroniques')
      expect(keywordAnalysis!.inHeadings).toBe(true)
    })

    it('should extract heading structure', () => {
      const content = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>'
      const analysis = optimizer.analyzeContent(content, 'fr')
      
      expect(analysis.headingStructure.h1).toContain('Title')
      expect(analysis.headingStructure.h2).toContain('Subtitle')
      expect(analysis.headingStructure.h3).toContain('Section')
    })

    it('should calculate SEO score', () => {
      const content = '<h1>Solutions mécatroniques</h1><p>Excellent content about solutions mécatroniques and électronique industrielle with proper keyword density.</p>'
      const analysis = optimizer.analyzeContent(content, 'fr')
      
      expect(analysis.seoScore).toBeGreaterThan(0)
      expect(analysis.seoScore).toBeLessThanOrEqual(100)
    })
  })

  describe('generateOptimizedTitle', () => {
    it('should generate SEO-optimized titles for French', () => {
      const title = optimizer.generateOptimizedTitle('Accueil', 'fr', 'hero')
      expect(title).toContain('Solutions Mécatroniques Innovantes')
      expect(title).toContain('Kamlease')
    })

    it('should generate SEO-optimized titles for English', () => {
      const title = optimizer.generateOptimizedTitle('Home', 'en', 'hero')
      expect(title).toContain('Innovative Mechatronic Solutions')
      expect(title).toContain('Kamlease')
    })

    it('should include section-specific keywords', () => {
      const aboutTitle = optimizer.generateOptimizedTitle('About', 'fr', 'about')
      expect(aboutTitle).toContain('Expertise Mécatronique et Auto-staging')
      
      const expertiseTitle = optimizer.generateOptimizedTitle('Expertise', 'fr', 'expertise')
      expect(expertiseTitle).toContain('Ingénierie Mécatronique Avancée')
    })
  })

  describe('generateOptimizedDescription', () => {
    it('should include primary keywords in description', () => {
      const description = optimizer.generateOptimizedDescription('Great company', 'fr')
      expect(description.toLowerCase()).toContain('solutions mécatroniques')
    })

    it('should respect maximum length', () => {
      const longDescription = 'A'.repeat(200)
      const optimizedDescription = optimizer.generateOptimizedDescription(longDescription, 'fr')
      expect(optimizedDescription.length).toBeLessThanOrEqual(155)
    })
  })

  describe('generateOptimizedHeadings', () => {
    it('should generate proper heading hierarchy for hero section', () => {
      const headings = optimizer.generateOptimizedHeadings('hero', 'fr')
      expect(headings.h1).toContain('Solutions Mécatroniques Innovantes | Kamlease')
      expect(headings.h2).toContain('Expertise en Auto-staging et Électronique Industrielle')
    })

    it('should generate proper heading hierarchy for about section', () => {
      const headings = optimizer.generateOptimizedHeadings('about', 'fr')
      expect(headings.h2).toContain('Expertise Mécatronique et Auto-staging - 30 ans d\'expérience')
      expect(headings.h3).toContain('Innovation en Électronique Industrielle')
    })

    it('should generate proper heading hierarchy for expertise section', () => {
      const headings = optimizer.generateOptimizedHeadings('expertise', 'fr')
      expect(headings.h2).toContain('Ingénierie Mécatronique Avancée')
      expect(headings.h3).toContain('Collaboration Sur Mesure')
    })
  })

  describe('generateInternalLinks', () => {
    it('should generate strategic internal links', () => {
      const links = optimizer.generateInternalLinks('hero', 'fr')
      expect(links.length).toBeGreaterThan(0)
      expect(links[0].href).toMatch(/^#/)
      expect(links.some(link => link.isKeywordRich)).toBe(true)
    })

    it('should generate appropriate links for each section', () => {
      const heroLinks = optimizer.generateInternalLinks('hero', 'fr')
      const aboutLinks = optimizer.generateInternalLinks('about', 'fr')
      const expertiseLinks = optimizer.generateInternalLinks('expertise', 'fr')
      
      expect(heroLinks.some(link => link.section === 'about')).toBe(true)
      expect(aboutLinks.some(link => link.section === 'expertise')).toBe(true)
      expect(expertiseLinks.some(link => link.section === 'contact')).toBe(true)
    })
  })

  describe('validateKeywordDensity', () => {
    it('should validate proper keyword density', () => {
      const content = 'Solutions mécatroniques ' + 'word '.repeat(100) + 'solutions mécatroniques'
      const analysis = optimizer.analyzeContent(content, 'fr')
      const validation = optimizer.validateKeywordDensity(analysis)
      
      expect(validation).toHaveProperty('isValid')
      expect(validation).toHaveProperty('recommendations')
      expect(Array.isArray(validation.recommendations)).toBe(true)
    })

    it('should recommend increasing density for low keyword usage', () => {
      const content = 'word '.repeat(1000) + 'solutions mécatroniques'
      const analysis = optimizer.analyzeContent(content, 'fr')
      const validation = optimizer.validateKeywordDensity(analysis)
      
      expect(validation.isValid).toBe(false)
      expect(validation.recommendations.some(rec => rec.includes('Increase density'))).toBe(true)
    })

    it('should recommend reducing density for high keyword usage', () => {
      const content = 'solutions mécatroniques '.repeat(50)
      const analysis = optimizer.analyzeContent(content, 'fr')
      const validation = optimizer.validateKeywordDensity(analysis)
      
      expect(validation.isValid).toBe(false)
      expect(validation.recommendations.some(rec => rec.includes('Reduce density'))).toBe(true)
    })
  })

  describe('keyword targeting', () => {
    it('should include all primary keywords for French', () => {
      const content = 'Test content'
      const analysis = optimizer.analyzeContent(content, 'fr')
      
      const primaryKeywords = ['solutions mécatroniques', 'électronique industrielle', 'auto-staging', 'ingénierie mécatronique']
      primaryKeywords.forEach(keyword => {
        expect(analysis.keywordAnalysis.some(k => k.keyword === keyword)).toBe(true)
      })
    })

    it('should include all primary keywords for English', () => {
      const content = 'Test content'
      const analysis = optimizer.analyzeContent(content, 'en')
      
      const primaryKeywords = ['mechatronic solutions', 'industrial electronics', 'auto-staging', 'mechatronic engineering']
      primaryKeywords.forEach(keyword => {
        expect(analysis.keywordAnalysis.some(k => k.keyword === keyword)).toBe(true)
      })
    })

    it('should include secondary and long-tail keywords', () => {
      const content = 'Test content'
      const analysis = optimizer.analyzeContent(content, 'fr')
      
      expect(analysis.keywordAnalysis.some(k => k.keyword === 'conception électronique')).toBe(true)
      expect(analysis.keywordAnalysis.some(k => k.keyword === 'solutions mécatroniques sur mesure')).toBe(true)
    })
  })
})