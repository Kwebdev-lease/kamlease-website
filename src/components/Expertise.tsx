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
        
        {/* Style 1: Current cards */}
        <AnimatedSection
          animation="staggerChildren"
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
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

        {/* Style 2: Gradient cards with inset shadows */}
        <AnimatedSection
          animation="staggerChildren"
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          threshold={0.1}
        >
          {expertiseAreas.map((area, index) => {
            const Icon = area.icon
            const gradients = [
              'from-orange-500 to-red-600',
              'from-blue-500 to-purple-600', 
              'from-green-500 to-teal-600'
            ]
            return (
              <AnimatedItem key={index}>
                <div className="relative p-10 bg-gradient-to-bl from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl shadow-[inset_-2px_2px_rgba(255,255,255,0.3),_-20px_20px_40px_rgba(0,0,0,0.25)] dark:shadow-[inset_-2px_2px_rgba(255,255,255,0.1),_-20px_20px_40px_rgba(0,0,0,0.4)] h-full">
                  {/* Layout grid: title icon / content content / bar bar */}
                  <div className="grid grid-cols-[1fr_auto] grid-rows-[auto_1fr_auto] gap-6 h-full">
                    {/* Title */}
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 uppercase tracking-wide self-end">
                      {area.title}
                    </h3>
                    
                    {/* Icon */}
                    <div className="text-5xl self-end">
                      <Icon className={`h-12 w-12 bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`} />
                    </div>
                    
                    {/* Content spanning both columns */}
                    <div className="col-span-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                      <p className="mb-0">{area.description}</p>
                    </div>
                    
                    {/* Gradient bar spanning both columns */}
                    <div className={`col-span-2 h-0.5 bg-gradient-to-r ${gradients[index]} rounded-full`}></div>
                  </div>
                </div>
              </AnimatedItem>
            )
          })}
        </AnimatedSection>

        {/* Style 3: True Glassmorphism with background lighting */}
        <div className="relative">
          {/* Background lighting to enhance glass effect */}
          <div className="absolute inset-0 -m-8">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/2 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
          
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
                    {/* Background glow for each card */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10 rounded-3xl blur-2xl opacity-50"></div>
                    
                    {/* Main glass container with enhanced effect */}
                    <div className="absolute inset-0 bg-white/15 dark:bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.4),_inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.6),_inset_0_1px_0_0_rgba(255,255,255,0.1)] group-hover:bg-white/20 dark:group-hover:bg-white/12 group-hover:border-orange-500/40 transition-all duration-500"></div>
                    
                    {/* Multiple glass layers for realistic depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent dark:from-white/15 dark:via-white/3 dark:to-transparent rounded-3xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-tl from-white/15 via-transparent to-white/25 dark:from-white/8 dark:to-white/15 rounded-3xl"></div>
                    
                    {/* Enhanced frosted texture */}
                    <div className="absolute inset-0 opacity-40 dark:opacity-25 rounded-3xl" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.6'/%3E%3C/svg%3E")`,
                      backgroundSize: '100px 100px',
                      mixBlendMode: 'overlay'
                    }}></div>
                    
                    {/* Strong inner highlight for glass effect */}
                    <div className="absolute inset-[1px] bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/25 rounded-3xl"></div>
                    
                    {/* Subtle inner shadow */}
                    <div className="absolute inset-[1px] bg-gradient-to-tl from-black/5 via-transparent to-transparent dark:from-black/10 rounded-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Icon with enhanced glass container */}
                      <div className="mb-6 inline-flex p-4 bg-white/25 dark:bg-white/15 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/25 shadow-[0_4px_16px_0_rgba(31,38,135,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.4),_inset_0_1px_0_0_rgba(255,255,255,0.2)] group-hover:bg-orange-500/25 dark:group-hover:bg-orange-500/15 group-hover:border-orange-500/50 group-hover:shadow-orange-500/30 transition-all duration-500 w-fit">
                        <Icon className="h-8 w-8 text-orange-500 group-hover:text-orange-400 transition-colors duration-300 filter drop-shadow-lg" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 filter drop-shadow-sm">
                        {area.title}
                      </h3>
                      
                      <p className="text-gray-800 dark:text-gray-100 leading-relaxed filter drop-shadow-sm flex-grow">
                        {area.description}
                      </p>
                    </div>
                    
                    {/* Enhanced hover glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/0 via-orange-500/15 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                    
                    {/* Reflection effect - always visible */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-1/2 bg-gradient-to-b from-white/50 via-white/20 to-transparent dark:from-white/30 dark:via-white/10 rounded-t-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
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