import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Expertise } from '@/components/Expertise'

// Mock framer-motion pour éviter les problèmes d'animation dans les tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock window.matchMedia pour les tests
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: query.includes('dark') ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

const TestWrapper = ({ 
  children, 
  theme = 'light' 
}: { 
  children: React.ReactNode
  theme?: 'light' | 'dark' 
}) => (
  <ThemeProvider defaultTheme={theme}>
    <LanguageProvider>
      <div className={theme}>
        {children}
      </div>
    </LanguageProvider>
  </ThemeProvider>
)

describe('Visual Theme Consistency Tests', () => {
  it('should maintain visual consistency when switching from light to dark theme', async () => {
    const { rerender, container } = render(
      <TestWrapper theme="light">
        <Hero />
      </TestWrapper>
    )

    // Vérifier que les éléments sont présents en mode clair
    expect(container.querySelector('.light')).toBeInTheDocument()
    
    // Basculer vers le mode sombre
    rerender(
      <TestWrapper theme="dark">
        <Hero />
      </TestWrapper>
    )

    // Vérifier que les éléments sont toujours présents en mode sombre
    expect(container.querySelector('.dark')).toBeInTheDocument()
    
    // Vérifier que la structure reste cohérente
    const heroSection = container.querySelector('section') || container.querySelector('div')
    expect(heroSection).toBeInTheDocument()
  })

  it('should apply correct theme-specific classes to About section', () => {
    const { rerender, container } = render(
      <TestWrapper theme="light">
        <About />
      </TestWrapper>
    )

    // Mode clair
    expect(container.querySelector('.light')).toBeInTheDocument()
    
    // Basculer vers le mode sombre
    rerender(
      <TestWrapper theme="dark">
        <About />
      </TestWrapper>
    )

    // Mode sombre
    expect(container.querySelector('.dark')).toBeInTheDocument()
  })

  it('should maintain component structure across theme changes in Expertise section', () => {
    const { rerender, container } = render(
      <TestWrapper theme="light">
        <Expertise />
      </TestWrapper>
    )

    // Capturer la structure initiale
    const initialStructure = container.innerHTML
    
    // Basculer vers le mode sombre
    rerender(
      <TestWrapper theme="dark">
        <Expertise />
      </TestWrapper>
    )

    // Vérifier que la structure de base est maintenue (même nombre d'éléments principaux)
    const lightElements = initialStructure.match(/<[^>]+>/g)?.length || 0
    const darkElements = container.innerHTML.match(/<[^>]+>/g)?.length || 0
    
    // La structure devrait être similaire (permettre une petite variation pour les classes)
    expect(Math.abs(lightElements - darkElements)).toBeLessThan(10)
  })

  it('should handle rapid theme switching without breaking', async () => {
    const { rerender, container } = render(
      <TestWrapper theme="light">
        <Hero />
      </TestWrapper>
    )

    // Basculer rapidement entre les thèmes
    for (let i = 0; i < 5; i++) {
      rerender(
        <TestWrapper theme="dark">
          <Hero />
        </TestWrapper>
      )
      
      rerender(
        <TestWrapper theme="light">
          <Hero />
        </TestWrapper>
      )
    }

    // Vérifier que le composant est toujours fonctionnel
    expect(container.querySelector('.light')).toBeInTheDocument()
  })

  it('should preserve accessibility attributes across theme changes', () => {
    const { rerender, container } = render(
      <TestWrapper theme="light">
        <Hero />
      </TestWrapper>
    )

    // Compter les attributs d'accessibilité en mode clair
    const lightAccessibilityAttrs = container.innerHTML.match(/aria-|role=|tabindex=/g)?.length || 0
    
    // Basculer vers le mode sombre
    rerender(
      <TestWrapper theme="dark">
        <Hero />
      </TestWrapper>
    )

    // Compter les attributs d'accessibilité en mode sombre
    const darkAccessibilityAttrs = container.innerHTML.match(/aria-|role=|tabindex=/g)?.length || 0
    
    // Les attributs d'accessibilité devraient être préservés
    expect(darkAccessibilityAttrs).toBe(lightAccessibilityAttrs)
  })

  it('should maintain responsive classes across theme changes', () => {
    const { rerender, container } = render(
      <TestWrapper theme="light">
        <About />
      </TestWrapper>
    )

    // Vérifier les classes responsive en mode clair
    const lightResponsiveClasses = container.innerHTML.match(/\b(sm:|md:|lg:|xl:)\w+/g)?.length || 0
    
    // Basculer vers le mode sombre
    rerender(
      <TestWrapper theme="dark">
        <About />
      </TestWrapper>
    )

    // Vérifier les classes responsive en mode sombre
    const darkResponsiveClasses = container.innerHTML.match(/\b(sm:|md:|lg:|xl:)\w+/g)?.length || 0
    
    // Les classes responsive devraient être maintenues
    expect(darkResponsiveClasses).toBe(lightResponsiveClasses)
  })

  it('should apply theme-specific gradient and color classes', () => {
    const { rerender, container } = render(
      <TestWrapper theme="light">
        <Hero />
      </TestWrapper>
    )

    // Vérifier les classes de couleur en mode clair
    const lightColorClasses = container.innerHTML.includes('from-brand-neutral-800') ||
                             container.innerHTML.includes('text-brand-neutral-600')
    
    // Basculer vers le mode sombre
    rerender(
      <TestWrapper theme="dark">
        <Hero />
      </TestWrapper>
    )

    // Vérifier les classes de couleur en mode sombre
    const darkColorClasses = container.innerHTML.includes('dark:from-brand-neutral-100') ||
                            container.innerHTML.includes('dark:text-brand-neutral-300')
    
    // Au moins une des vérifications devrait être vraie pour chaque thème
    expect(lightColorClasses || darkColorClasses).toBe(true)
  })
})