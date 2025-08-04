import { Shield, Zap, Users, ArrowRight } from 'lucide-react'
import { useLanguage } from "@/contexts/LanguageProvider"
import { AnimatedSection } from './AnimatedSection'
import { BackgroundPattern } from './BackgroundPattern'
import { EnhancedCard } from './ui/enhanced-card'
import { EnhancedIconContainer, EnhancedText } from './HoverEffects'
import { contentOptimizer } from "@/lib/content-optimizer"
import { scrollToElement } from "@/lib/scroll-utils"
import { ContextualLinks } from './ContextualLinks'

export function About() {
  const { t, language } = useLanguage()
  
  // Generate SEO-optimized content
  const internalLinks = contentOptimizer.generateInternalLinks('about', language)

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-brand-neutral-50 to-brand-neutral-100 dark:from-brand-neutral-900 dark:to-brand-neutral-950 relative overflow-hidden">
      {/* Enhanced technical background patterns with about-specific configuration */}
      <BackgroundPattern 
        config={{
          type: 'combined',
          intensity: 'subtle',
          animated: true,
          section: 'about'
        }}
        className="absolute inset-0"
      />
      
      {/* Additional subtle technical motifs with enhanced animations */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-brand-orange-500/30 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-brand-orange-400/40 rounded-lg rotate-45 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-brand-orange-300/25 rounded-full opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 border-2 border-brand-orange-400/35 rotate-12 opacity-40 animate-float-delayed"></div>
        
        {/* Additional technical elements for enhanced visual appeal */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 border border-brand-orange-500/20 rounded-full animate-pattern-pulse"></div>
        <div className="absolute bottom-1/3 left-1/5 w-12 h-12 border-2 border-brand-orange-300/30 rotate-45 animate-float"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content with enhanced slide-in from left animation */}
          <AnimatedSection 
            animation="slideInLeft" 
            delay={0.2}
            duration={0.8}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 group">
              <span className="bg-gradient-to-r from-brand-neutral-800 via-brand-orange-600 to-brand-neutral-700 dark:from-brand-neutral-100 dark:via-brand-orange-400 dark:to-brand-neutral-50 bg-clip-text text-transparent relative">
                {language === 'fr' 
                  ? 'Expertise Mécatronique et Auto-staging - 30 ans d\'expérience'
                  : 'Mechatronic and Auto-staging Expertise - 30 years experience'
                }
                <div className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 group-hover:w-full transition-all duration-700 rounded-full shadow-lg shadow-brand-orange-500/50"></div>
              </span>
            </h2>
            
            <div className="space-y-6 text-lg">
              <p className="text-brand-neutral-600 dark:text-brand-neutral-300 relative group hover:text-brand-neutral-700 dark:hover:text-brand-neutral-200 transition-all duration-300 leading-relaxed">
                <span className="relative z-10">
                  {language === 'fr'
                    ? 'Kamlease intervient dans les secteurs automobile et industriel, en se concentrant sur les solutions mécatroniques, l\'électronique industrielle et la mécanique. Notre expertise unique en auto-staging nous permet d\'adapter les produits automobiles aux besoins variés d\'autres industries.'
                    : 'Kamlease operates in the automotive and industrial sectors, focusing on mechatronic solutions, industrial electronics and mechanics. Our unique auto-staging expertise allows us to adapt automotive products to the varied needs of other industries.'
                  }
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -mx-2 -my-1"></div>
              </p>
              
              <p className="text-brand-neutral-600 dark:text-brand-neutral-300 relative group hover:text-brand-neutral-700 dark:hover:text-brand-neutral-200 transition-all duration-300 leading-relaxed">
                <span className="relative z-10">
                  {language === 'fr'
                    ? 'Grâce à notre approche d\'ingénierie mécatronique avancée et à notre expertise en développement de produits industriels, nous offrons des solutions personnalisées qui répondent parfaitement aux exigences spécifiques de chaque client.'
                    : 'Thanks to our advanced mechatronic engineering approach and our expertise in industrial product development, we offer personalized solutions that perfectly meet the specific requirements of each client.'
                  }
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -mx-2 -my-1"></div>
              </p>

              {/* Strategic internal links */}
              <div className="pt-4">
                <ContextualLinks 
                  context="about" 
                  variant="compact" 
                  maxLinks={2}
                  showTitle={false}
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Value cards with enhanced slide-in from right animation and improved hover effects */}
          <AnimatedSection 
            animation="slideInRight" 
            delay={0.4}
            duration={0.8}
            className="grid grid-cols-1 gap-6"
          >
            {[
              { 
                icon: Shield, 
                key: 'innovation',
                title: language === 'fr' ? 'Innovation en Électronique Industrielle' : 'Industrial Electronics Innovation',
                description: language === 'fr' 
                  ? 'Nous explorons constamment de nouvelles technologies mécatroniques et méthodes pour créer des solutions avant-gardistes adaptées aux défis industriels.'
                  : 'We constantly explore new mechatronic technologies and methods to create cutting-edge solutions adapted to industrial challenges.'
              },
              { 
                icon: Zap, 
                key: 'quality',
                title: language === 'fr' ? 'Qualité et Performance' : 'Quality and Performance',
                description: language === 'fr'
                  ? 'Chaque projet d\'ingénierie mécatronique est réalisé selon les plus hauts standards de qualité pour garantir des résultats durables et performants.'
                  : 'Each mechatronic engineering project is carried out according to the highest quality standards to guarantee lasting and efficient results.'
              },
              { 
                icon: Users, 
                key: 'partnership',
                title: language === 'fr' ? 'Partenariat Stratégique' : 'Strategic Partnership',
                description: language === 'fr'
                  ? 'Nous travaillons en étroite collaboration avec nos clients pour comprendre leurs besoins spécifiques en solutions mécatroniques et auto-staging.'
                  : 'We work closely with our clients to understand their specific needs in mechatronic solutions and auto-staging.'
              }
            ].map(({ icon: Icon, key, title, description }, index) => (
              <EnhancedCard 
                key={key}
                variant="value"
                hoverEffect="glow"
                interactive={true}
                focusable={true}
                className="p-6 bg-white/90 dark:bg-brand-neutral-800/90 backdrop-blur-sm border-brand-neutral-200 dark:border-brand-neutral-700"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <EnhancedIconContainer
                      size="lg"
                      variant="default"
                      glowColor="orange"
                      className="bg-brand-orange-100 dark:bg-brand-orange-900/30"
                    >
                      <Icon className="h-8 w-8 text-brand-orange-500" />
                    </EnhancedIconContainer>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-neutral-800 dark:text-brand-neutral-100 mb-2 group-hover:text-brand-orange-600 dark:group-hover:text-brand-orange-400 transition-colors duration-300">
                      {title}
                    </h3>
                    <EnhancedText 
                      className="text-brand-neutral-600 dark:text-brand-neutral-300 leading-relaxed"
                      highlight={true}
                      interactive={false}
                    >
                      {description}
                    </EnhancedText>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}