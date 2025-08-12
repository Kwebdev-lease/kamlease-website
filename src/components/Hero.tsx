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
    scrollToElement('contact', 65)
  }

  // Generate SEO-optimized content
  const optimizedTitle = contentOptimizer.generateOptimizedTitle(t('hero.title'), language, 'hero')
  const internalLinks = contentOptimizer.generateInternalLinks('hero', language)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Image de fond avec marges spécifiques */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ 
          top: '10%', 
          bottom: '10%', 
          left: '10%', 
          right: '0%' 
        }}>
          <img 
            src="/images/gallery/Fondhero.png" 
            alt="Background" 
            className="w-full h-full object-contain opacity-60"
          />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Contenu à gauche */}
        <div className="text-center lg:text-left">
        <AnimatedSection 
          animation="staggerChildren" 
          className="max-w-4xl mx-auto space-y-8"
          staggerDelay={0.2}
          threshold={0.2}
        >
          <AnimatedItem delay={0}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-12">
              <span className="block">
                <span className="bg-gradient-to-r from-brand-neutral-800 via-brand-orange-600 to-brand-neutral-700 dark:from-brand-neutral-100 dark:via-brand-orange-400 dark:to-brand-neutral-50 bg-clip-text text-transparent">
                  {language === 'fr' ? (
                    <>
                      Innovons Ensemble<br />
                      Perfectionnons vos produits
                    </>
                  ) : (
                    <>
                      Let's Innovate Together<br />
                      Perfect your products
                    </>
                  )}
                </span>
              </span>
            </h1>
          </AnimatedItem>
          
          <AnimatedItem delay={0.2}>
            <div className="flex flex-col items-center lg:items-start space-y-6 mb-16">
              <div className="relative">
                {/* Button background glow */}
                <div className="absolute -inset-3 bg-orange-500/25 rounded-3xl blur-xl"></div>
                
                {/* Main liquid glass container for hero button */}
                <div className="absolute inset-0 bg-white/12 dark:bg-white/8 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4),_inset_0_1px_0_0_rgba(255,255,255,0.2)]"></div>
                
                {/* Liquid glass gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent dark:from-white/15 dark:via-white/5 dark:to-transparent rounded-2xl"></div>
                
                <EnhancedButton 
                  variant="primary"
                  size="xl" 
                  hoverEffect="glow"
                  ripple={true}
                  focusRing={true}
                  className="relative z-10 px-10 py-5 text-lg font-semibold rounded-2xl group !bg-orange-500/90 hover:!bg-orange-600/90 !border-transparent backdrop-blur-sm"
                  onClick={handleButtonClick}
                  style={{
                    backgroundColor: 'rgba(249, 115, 22, 0.9)',
                    borderColor: 'transparent'
                  }}
                >
                  {language === 'fr' ? 'Démarrer un projet' : 'Start a project'}
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
                </EnhancedButton>
              </div>
            </div>
          </AnimatedItem>
        </AnimatedSection>
        </div>
        
        {/* Espace pour l'objet de l'image à droite */}
        <div className="hidden lg:block"></div>
      </div>
    </section>
  )
}