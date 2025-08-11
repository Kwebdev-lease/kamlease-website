import { ArrowRight } from 'lucide-react'
import { useLanguage } from "@/contexts/LanguageProvider"
import { AnimatedSection } from './AnimatedSection'
import { BackgroundPattern } from './BackgroundPattern'
import { scrollToElement } from "@/lib/scroll-utils"

export function About() {
  const { language } = useLanguage()

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered content with enhanced animations */}
        <AnimatedSection 
          animation="fadeInUp" 
          delay={0.2}
          duration={0.8}
          className="text-center space-y-12"
        >
          {/* Title with enhanced animation */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold group">
              <span className="bg-gradient-to-r from-brand-neutral-800 via-brand-orange-600 to-brand-neutral-700 dark:from-brand-neutral-100 dark:via-brand-orange-400 dark:to-brand-neutral-50 bg-clip-text text-transparent relative inline-block">
                {language === 'fr' 
                  ? 'Qui sommes nous ?'
                  : 'Who are we?'
                }
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 group-hover:w-full transition-all duration-700 rounded-full shadow-lg shadow-brand-orange-500/50"></div>
              </span>
            </h2>
            
            {/* Decorative elements */}
            <div className="flex justify-center items-center space-x-4 opacity-60">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-brand-orange-500 animate-pulse"></div>
              <div className="w-3 h-3 bg-brand-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-brand-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-brand-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-brand-orange-500 animate-pulse"></div>
            </div>
          </div>
          
          {/* Enhanced text content with staggered animations */}
          <div className="space-y-8 max-w-3xl mx-auto">
            <AnimatedSection 
              animation="slideInUp" 
              delay={0.4}
              duration={0.6}
              className="relative"
            >
              <p className="text-xl md:text-2xl text-brand-neutral-600 dark:text-brand-neutral-300 leading-relaxed relative group">
                <span className="relative z-10 inline-block">
                  {language === 'fr'
                    ? (
                      <>
                        <span className="font-semibold text-brand-orange-600 dark:text-brand-orange-400">Kamlease</span> intervient dans les secteurs{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/20 to-brand-orange-400/20 px-2 py-1 rounded-lg">automobile et non-automobile</span>
                        </span>, en se concentrant sur la{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">mécatronique</span>,{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">l'électronique</span> et la{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">mécanique</span>. Grâce à notre expertise en{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/30 to-brand-orange-400/30 px-2 py-1 rounded-lg font-semibold">auto-staging</span>
                        </span>, nous adaptons les produits automobiles aux besoins variés d'autres industries.
                      </>
                    )
                    : (
                      <>
                        <span className="font-semibold text-brand-orange-600 dark:text-brand-orange-400">Kamlease</span> operates in{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/20 to-brand-orange-400/20 px-2 py-1 rounded-lg">automotive and non-automotive</span>
                        </span> sectors, focusing on{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">mechatronics</span>,{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">electronics</span> and{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">mechanics</span>. Thanks to our{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/30 to-brand-orange-400/30 px-2 py-1 rounded-lg font-semibold">auto-staging</span>
                        </span> expertise, we adapt automotive products to the varied needs of other industries.
                      </>
                    )
                  }
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl -mx-4 -my-2"></div>
              </p>
            </AnimatedSection>

            <AnimatedSection 
              animation="slideInUp" 
              delay={0.6}
              duration={0.6}
              className="relative"
            >
              <p className="text-xl md:text-2xl text-brand-neutral-600 dark:text-brand-neutral-300 leading-relaxed relative group">
                <span className="relative z-10 inline-block">
                  {language === 'fr'
                    ? (
                      <>
                        Grâce à notre expertise en{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/30 to-brand-orange-400/30 px-2 py-1 rounded-lg font-semibold">"auto-staging"</span>
                        </span>, nous adaptons des produits issus du secteur automobile pour répondre aux{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">besoins variés</span> de diverses industries. Cette{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/20 to-brand-orange-400/20 px-2 py-1 rounded-lg">polyvalence</span>
                        </span> nous permet d'offrir des{' '}
                        <span className="font-semibold text-brand-orange-600 dark:text-brand-orange-400">solutions parfaitement adaptées</span> à vos exigences.
                      </>
                    )
                    : (
                      <>
                        Thanks to our{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/30 to-brand-orange-400/30 px-2 py-1 rounded-lg font-semibold">"auto-staging"</span>
                        </span> expertise, we adapt products from the automotive sector to meet the{' '}
                        <span className="font-semibold text-brand-neutral-800 dark:text-brand-neutral-200">varied needs</span> of various industries. This{' '}
                        <span className="relative">
                          <span className="bg-gradient-to-r from-brand-orange-500/20 to-brand-orange-400/20 px-2 py-1 rounded-lg">versatility</span>
                        </span> allows us to offer{' '}
                        <span className="font-semibold text-brand-orange-600 dark:text-brand-orange-400">perfectly adapted solutions</span> to your requirements.
                      </>
                    )
                  }
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl -mx-4 -my-2"></div>
              </p>
            </AnimatedSection>

            {/* Enhanced call-to-action */}
            <AnimatedSection 
              animation="fadeInUp" 
              delay={0.8}
              duration={0.6}
              className="pt-8"
            >
              <div className="flex justify-center">
                <button
                  onClick={() => scrollToElement('expertise', 100)}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brand-orange-500/25"
                >
                  <span className="mr-2">
                    {language === 'fr' ? 'Découvrir notre expertise' : 'Discover our expertise'}
                  </span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}