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
    <section id="expertise" className="relative py-20 overflow-hidden">
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
        
        {/* Staggered expertise cards */}
        <AnimatedSection
          animation="staggerChildren"
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          threshold={0.1}
        >
          {expertiseAreas.map((area, index) => {
            const Icon = area.icon
            return (
              <AnimatedItem key={index}>
                <EnhancedCard
                  variant="expertise"
                  hoverEffect="glow"
                  interactive={true}
                  focusable={true}
                  className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-8 border-gray-200/50 dark:border-gray-800/50 h-full"
                >
                  {/* Icon with micro-animations */}
                  <EnhancedIconContainer
                    size="xl"
                    variant="default"
                    glowColor="orange"
                    className="bg-orange-100 dark:bg-orange-900/30 mb-6"
                  >
                    <Icon className="h-8 w-8 text-orange-500" />
                  </EnhancedIconContainer>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {area.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {area.description}
                  </p>
                </EnhancedCard>
              </AnimatedItem>
            )
          })}
        </AnimatedSection>
      </div>
    </section>
  )
}