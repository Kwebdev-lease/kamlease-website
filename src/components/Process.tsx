import { Search, Lightbulb, Cog, Factory, TrendingUp, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageProvider'
import { AnimatedSection } from './AnimatedSection'
import { BackgroundPattern } from './BackgroundPattern'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { ContextualLinks } from './ContextualLinks'

export function Process() {
  const { t } = useLanguage()
  const { prefersReducedMotion } = useAccessibilityPreferences()
  const { ref: sectionRef, isInView } = useScrollAnimation({ threshold: 0.2 })
  
  const processSteps = [
    {
      icon: Search,
      titleKey: 'process.steps.analysis.title',
      descriptionKey: 'process.steps.analysis.description',
      step: '01'
    },
    {
      icon: Lightbulb,
      titleKey: 'process.steps.design.title',
      descriptionKey: 'process.steps.design.description',
      step: '02'
    },
    {
      icon: Cog,
      titleKey: 'process.steps.development.title',
      descriptionKey: 'process.steps.development.description',
      step: '03'
    },
    {
      icon: Factory,
      titleKey: 'process.steps.production.title',
      descriptionKey: 'process.steps.production.description',
      step: '04'
    },
    {
      icon: TrendingUp,
      titleKey: 'process.steps.followUp.title',
      descriptionKey: 'process.steps.followUp.description',
      step: '05'
    }
  ]

  // Animation variants for sequential step animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.2,
        delayChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  }

  const stepVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="process" className="py-20 bg-white dark:bg-black relative overflow-hidden" ref={sectionRef}>
      {/* Background Pattern */}
      <BackgroundPattern 
        config={{
          type: 'pattern',
          theme: 'light',
          intensity: 'subtle',
          animated: true
        }}
        className="absolute inset-0"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection animation="fadeInUp" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('process.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('process.description')}
          </p>
        </AnimatedSection>
        
        <div className="relative">
          {/* Background lighting for liquid glass effect */}
          <div className="absolute inset-0 -m-8">
            <div 
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/18 rounded-full blur-3xl"
              style={{
                animation: 'float 8s ease-in-out infinite'
              }}
            ></div>
            <div 
              className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-400/15 rounded-full blur-3xl"
              style={{
                animation: 'float 10s ease-in-out infinite 2s'
              }}
            ></div>
            <div 
              className="absolute top-2/3 left-2/3 w-48 h-48 bg-orange-600/12 rounded-full blur-3xl"
              style={{
                animation: 'float 12s ease-in-out infinite 4s'
              }}
            ></div>
          </div>
          
          {/* CSS Animation Styles */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes float {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                25% { transform: translateY(-20px) translateX(10px); }
                50% { transform: translateY(-10px) translateX(-15px); }
                75% { transform: translateY(-30px) translateX(5px); }
              }
            `
          }} />
          
          {/* Desktop layout */}
          <div className="hidden lg:block relative z-10">
            <motion.div 
              className="flex items-start relative gap-8"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {processSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-center">
                    <motion.div 
                      className="flex flex-col items-center max-w-xs relative z-10 group cursor-pointer"
                      variants={stepVariants}
                      whileHover={prefersReducedMotion ? {} : {
                        y: -8,
                        transition: { duration: 0.3, ease: "easeOut" }
                      }}
                    >
                      {/* Liquid glass card container */}
                      <div className="relative p-6 rounded-3xl">
                        {/* Card background glow */}
                        <div className="absolute -inset-2 bg-orange-500/6 rounded-3xl blur-xl group-hover:bg-orange-500/10 transition-all duration-700"></div>
                        
                        {/* Main liquid glass container */}
                        <div className="absolute inset-0 bg-white/8 dark:bg-white/4 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.05)] group-hover:bg-white/12 dark:group-hover:bg-white/6 group-hover:border-orange-500/20 transition-all duration-700 ease-out"></div>
                        
                        {/* Liquid glass gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/3 to-transparent dark:from-white/8 dark:via-white/2 dark:to-transparent rounded-3xl"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center">
                          {/* Step circle with liquid glass effect */}
                          <motion.div 
                            className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                            whileHover={prefersReducedMotion ? {} : {
                              scale: 1.1,
                              boxShadow: "0 20px 25px -5px rgba(249, 115, 22, 0.3), 0 10px 10px -5px rgba(249, 115, 22, 0.2)"
                            }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ scale: 0 }}
                              whileHover={prefersReducedMotion ? {} : { scale: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                            <motion.div
                              whileHover={prefersReducedMotion ? {} : { rotate: 360 }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                              <Icon className="h-8 w-8 text-white relative z-10" />
                            </motion.div>
                          </motion.div>
                          
                          {/* Step number with glow effect */}
                          <motion.div 
                            className="text-sm font-bold text-orange-500 mb-2 group-hover:text-orange-400 transition-colors duration-300"
                            whileHover={prefersReducedMotion ? {} : {
                              textShadow: "0 0 8px rgba(249, 115, 22, 0.6)"
                            }}
                          >
                            {step.step}
                          </motion.div>
                          
                          {/* Content with hover effects */}
                          <motion.div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">
                              {t(step.titleKey)}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                              {t(step.descriptionKey)}
                            </p>
                          </motion.div>
                        </div>
                        
                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/0 via-orange-500/8 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                      </div>
                    </motion.div>
                    
                    {/* Arrow between steps */}
                    {index < processSteps.length - 1 && (
                      <motion.div 
                        className="flex items-center justify-center mx-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{
                          duration: prefersReducedMotion ? 0.1 : 0.6,
                          delay: prefersReducedMotion ? 0 : (index * 0.2 + 0.8),
                          ease: "easeOut"
                        }}
                      >
                        <div className="relative">
                          {/* Arrow glow */}
                          <div className="absolute -inset-2 bg-orange-500/20 rounded-full blur-lg"></div>
                          
                          {/* Arrow container with liquid glass */}
                          <div className="relative bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-full p-3 border border-white/20 dark:border-white/10 shadow-lg">
                            <ArrowRight className="w-6 h-6 text-orange-500" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </motion.div>
          </div>
          
          {/* Mobile layout */}
          <motion.div 
            className="lg:hidden space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {processSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-4 group cursor-pointer"
                  variants={stepVariants}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                      whileHover={prefersReducedMotion ? {} : {
                        scale: 1.1,
                        boxShadow: "0 10px 15px -3px rgba(249, 115, 22, 0.3)"
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ scale: 0 }}
                        whileHover={prefersReducedMotion ? {} : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        whileHover={prefersReducedMotion ? {} : { rotate: 180 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <Icon className="h-6 w-6 text-white relative z-10" />
                      </motion.div>
                    </motion.div>
                    {index < processSteps.length - 1 && (
                      <motion.div 
                        className="w-0.5 h-16 bg-orange-200 dark:bg-orange-800 mt-4 origin-top"
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                        transition={{
                          duration: prefersReducedMotion ? 0.1 : 0.6,
                          delay: prefersReducedMotion ? 0 : (index * 0.2 + 0.3),
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </div>
                  <motion.div 
                    className="flex-1 pb-8 relative"
                    whileHover={prefersReducedMotion ? {} : { x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="text-sm font-bold text-orange-500 mb-1 group-hover:text-orange-400 transition-colors duration-300"
                      whileHover={prefersReducedMotion ? {} : {
                        textShadow: "0 0 6px rgba(249, 115, 22, 0.5)"
                      }}
                    >
                      {step.step}
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                      {t(step.descriptionKey)}
                    </p>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
          
          {/* Contextual Links */}
          <AnimatedSection 
            animation="fadeInUp" 
            delay={0.8}
            className="mt-12 flex justify-center"
          >
            <ContextualLinks 
              context="process" 
              variant="default" 
              maxLinks={2}
              className="max-w-md"
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}