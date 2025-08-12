import { Users, Lightbulb, DollarSign, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageProvider'
import { AnimatedSection, AnimatedItem } from './AnimatedSection'
import { BackgroundPattern } from './BackgroundPattern'
import { EnhancedCard } from './ui/enhanced-card'
import { EnhancedIconContainer } from './HoverEffects'
import { contentOptimizer } from '@/lib/content-optimizer'
import { scrollToElement } from '@/lib/scroll-utils'
import { ContextualLinks } from './ContextualLinks'

export function Expertise() {
  const { t, language } = useLanguage()
  
  // Generate SEO-optimized content
  const internalLinks = contentOptimizer.generateInternalLinks('expertise', language)
  
  const expertiseAreas = [
    {
      icon: Users,
      title: language === 'fr' ? 'Collaboration sur mesure' : 'Tailor-made Collaboration',
      description: language === 'fr'
        ? 'Nous croyons en une collaboration étroite avec nos clients pour concevoir des solutions techniques adaptées à leurs besoins spécifiques, de l\'idée initiale jusqu\'à l\'industrialisation.'
        : 'We believe in close collaboration with our clients to design technical solutions adapted to their specific needs, from initial idea to industrialization.',
      subtitle: language === 'fr' ? 'Développement Électronique Industriel' : 'Industrial Electronic Development'
    },
    {
      icon: Lightbulb,
      title: language === 'fr' ? 'Innovation et qualité' : 'Innovation and Quality',
      description: language === 'fr'
        ? 'L\'innovation est au cœur de notre démarche. Nous explorons constamment de nouvelles technologies pour vous offrir des produits plus performants et durables, tout en garantissant une qualité irréprochable.'
        : 'Innovation is at the heart of our approach. We constantly explore new technologies to offer you more efficient and durable products, while guaranteeing impeccable quality.',
      subtitle: language === 'fr' ? 'Solutions Auto-staging' : 'Auto-staging Solutions'
    },
    {
      icon: DollarSign,
      title: language === 'fr' ? 'Optimisation des coûts' : 'Cost Optimization',
      description: language === 'fr'
        ? 'Nous nous engageons à offrir des solutions de haute technicité à des coûts maîtrisés, répondant à vos contraintes budgétaires sans compromis sur la qualité.'
        : 'We are committed to offering high-tech solutions at controlled costs, meeting your budget constraints without compromising on quality.',
      subtitle: language === 'fr' ? 'Optimisation Processus Industriels' : 'Industrial Process Optimization'
    }
  ]

  return (
    <section id="expertise" className="relative py-20 overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      {/* Professional gradient background with discrete patterns */}
      <BackgroundPattern
        config={{
          type: 'combined',
          intensity: 'medium',
          animated: true,
          section: 'expertise'
        }}
        className="absolute inset-0"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated header section */}
        <AnimatedSection
          animation="fadeInUp"
          className="text-center mb-16"
          threshold={0.2}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'fr' ? 'Notre expertise' : 'Our expertise'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6">
            {language === 'fr'
              ? 'Nous allions collaboration sur mesure, excellence technologique et optimisation des coûts pour concevoir des solutions adaptées à vos enjeux. Grâce à notre approche multidisciplinaire, nous vous accompagnons de l\'idée à l\'industrialisation, avec un engagement constant pour la qualité et la performance.'
              : 'We combine tailor-made collaboration, technological excellence and cost optimization to design solutions adapted to your challenges. Thanks to our multidisciplinary approach, we support you from idea to industrialization, with a constant commitment to quality and performance.'
            }
          </p>
          
          {/* Strategic internal links */}
          <div className="flex justify-center">
            <ContextualLinks 
              context="expertise" 
              variant="compact" 
              maxLinks={2}
              showTitle={false}
              className="text-center"
            />
          </div>
        </AnimatedSection>
        


        {/* Apple-style Liquid Glass Cards */}
        <div className="relative">
          {/* Enhanced orange background lighting with parallax */}
          <div className="absolute inset-0 -m-8">
            <div 
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"
              style={{
                animation: 'float 8s ease-in-out infinite'
              }}
            ></div>
            <div 
              className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-400/18 rounded-full blur-3xl"
              style={{
                animation: 'float 10s ease-in-out infinite 2s'
              }}
            ></div>
            <div 
              className="absolute top-2/3 left-2/3 w-48 h-48 bg-orange-600/15 rounded-full blur-3xl"
              style={{
                animation: 'float 12s ease-in-out infinite 4s'
              }}
            ></div>
          </div>
          
          {/* CSS Animation Styles */}
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              25% { transform: translateY(-20px) translateX(10px); }
              50% { transform: translateY(-10px) translateX(-15px); }
              75% { transform: translateY(-30px) translateX(5px); }
            }
          `}</style>
          
          <AnimatedSection
            animation="staggerChildren"
            staggerDelay={0.15}
            className="relative grid grid-cols-1 md:grid-cols-3 gap-8"
            threshold={0.1}
          >
            {expertiseAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <AnimatedItem key={index}>
                  <div className="relative p-8 h-full group">
                    {/* Enhanced card background glow */}
                    <div className="absolute -inset-3 bg-orange-500/8 rounded-3xl blur-2xl group-hover:bg-orange-500/12 transition-all duration-700"></div>
                    
                    {/* Main liquid glass container */}
                    <div className="absolute inset-0 bg-white/8 dark:bg-white/4 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.05)] group-hover:bg-white/12 dark:group-hover:bg-white/6 group-hover:border-orange-500/20 transition-all duration-700 ease-out"></div>
                    
                    {/* Liquid glass gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/3 to-transparent dark:from-white/8 dark:via-white/2 dark:to-transparent rounded-3xl"></div>
                    
                    {/* Subtle inner highlight */}
                    <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/10 rounded-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Icon with liquid glass container */}
                      <div className="mb-6 inline-flex p-4 bg-white/15 dark:bg-white/8 backdrop-blur-xl rounded-2xl border border-white/25 dark:border-white/15 shadow-[0_4px_16px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.3)] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.2),_inset_0_1px_0_0_rgba(255,255,255,0.1)] group-hover:bg-orange-500/15 dark:group-hover:bg-orange-500/8 group-hover:border-orange-500/30 transition-all duration-700 w-fit">
                        <Icon className="h-8 w-8 text-orange-500 group-hover:text-orange-400 transition-colors duration-300" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">
                        {area.title}
                      </h3>
                      
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-grow">
                        {area.description}
                      </p>
                    </div>
                    
                    {/* Enhanced hover glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                  </div>
                </AnimatedItem>
              )
            })}
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}