import { EnhancedButton } from "@/components/ui/enhanced-button"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageProvider"
import { scrollToElement } from "@/lib/scroll-utils"
import { AnimatedSection, AnimatedItem } from "./AnimatedSection"
import { contentOptimizer } from "@/lib/content-optimizer"
import { useState } from "react"

export function Hero() {
  const { t, language } = useLanguage()
  const [isRippling, setIsRippling] = useState(false)

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsRippling(true)
    setTimeout(() => setIsRippling(false), 600)
    scrollToElement('contact', 100)
  }

  // Generate SEO-optimized content
  const optimizedTitle = contentOptimizer.generateOptimizedTitle(t('hero.title'), language, 'hero')
  const internalLinks = contentOptimizer.generateInternalLinks('hero', language)

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection 
          animation="staggerChildren" 
          className="max-w-4xl mx-auto space-y-8"
          staggerDelay={0.2}
          threshold={0.2}
        >
          <AnimatedItem delay={0}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6">
              <span className="block relative group">
                <span className="bg-gradient-to-r from-brand-neutral-800 via-brand-orange-600 to-brand-neutral-700 dark:from-brand-neutral-100 dark:via-brand-orange-400 dark:to-brand-neutral-50 bg-clip-text text-transparent bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-700 ease-out">
                  {language === 'fr' ? 'Solutions Mécatroniques Innovantes' : 'Innovative Mechatronic Solutions'}
                </span>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 rounded-full group-hover:w-full transition-all duration-500 ease-out shadow-lg shadow-brand-orange-500/50"></div>
              </span>
            </h1>
          </AnimatedItem>
          
          <AnimatedItem delay={0.2}>
            <h2 className="text-xl md:text-2xl text-brand-neutral-600 dark:text-brand-neutral-300 mb-4 max-w-3xl mx-auto relative group font-semibold">
              <span className="relative z-10">
                {language === 'fr' ? 'Expertise en Auto-staging et Électronique Industrielle' : 'Auto-staging and Industrial Electronics Expertise'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm"></div>
            </h2>
            <p className="text-lg md:text-xl text-brand-neutral-600 dark:text-brand-neutral-300 mb-8 max-w-3xl mx-auto relative group">
              <span className="relative z-10">
                {language === 'fr' 
                  ? 'Développement de produits industriels sur mesure avec 30+ ans d\'expérience en ingénierie mécatronique'
                  : 'Custom industrial product development with 30+ years of mechatronic engineering experience'
                }
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm"></div>
            </p>
          </AnimatedItem>
          
          <AnimatedItem delay={0.4}>
            <div className="flex flex-col items-center space-y-6 mb-16">
              <EnhancedButton 
                variant="primary"
                size="xl" 
                hoverEffect="glow"
                ripple={true}
                focusRing={true}
                className="px-10 py-5 text-lg font-semibold rounded-2xl group"
                onClick={handleButtonClick}
              >
                {t('hero.primaryBtn')}
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
              </EnhancedButton>
              
              {/* Strategic internal links */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {internalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-brand-neutral-600 dark:text-brand-neutral-300 hover:text-brand-orange-600 dark:hover:text-brand-orange-400 transition-colors duration-300 underline decoration-brand-orange-500/30 hover:decoration-brand-orange-500 underline-offset-4"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToElement(link.section, 100)
                    }}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  )
}