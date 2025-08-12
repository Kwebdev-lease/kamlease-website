import { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLanguage } from '@/contexts/LanguageProvider'
import { RollingNumber } from './RollingNumber'

// Configuration des statistiques avec animation
const getStatsConfig = () => [
  {
    key: 'timeSaved',
    baseValue: 1.3, // 1,3 (milliers de jours)
    incrementSpeed: 0.01, // 0,01 milliers par incrémentation
    incrementInterval: 10000, // toutes les 10 secondes
    suffix: '',
    shouldIncrement: true
  },
  {
    key: 'financialGains',
    baseValue: 2.5, // 2,5 (millions d'euros)
    incrementSpeed: 0.01, // 0,01M par incrémentation
    incrementInterval: 3000, // toutes les 3 secondes
    prefix: '',
    suffix: '',
    shouldIncrement: true
  },
  {
    key: 'projects',
    baseValue: 76, // 76 projets
    suffix: '',
    shouldIncrement: false // Nombre fixe de projets
  },
  {
    key: 'co2Saved',
    baseValue: 1.00, // 1,00 (Ktonnes de CO2)
    incrementSpeed: 0.01, // 0,01 Ktonnes par incrémentation
    incrementInterval: 2000, // toutes les 2 secondes
    prefix: '',
    suffix: '',
    shouldIncrement: true
  },
  {
    key: 'clients',
    baseValue: 42, // 42 clients
    suffix: '',
    shouldIncrement: false // Nombre fixe de clients
  },
]

// Composant pour l'animation permanente des compteurs - optimisé
function PermanentCounter({ stat, isVisible }: { stat: ReturnType<typeof getStatsConfig>[0], isVisible: boolean }) {
  const [currentValue, setCurrentValue] = useState(stat.baseValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!stat.shouldIncrement || !isVisible || prefersReducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Use the custom interval for each stat
    intervalRef.current = setInterval(() => {
      setIsAnimating(true)
      setCurrentValue(prev => prev + stat.incrementSpeed!)

      // Reset animation state after animation completes
      setTimeout(() => setIsAnimating(false), 500)
    }, stat.incrementInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [stat.shouldIncrement, stat.incrementSpeed, stat.incrementInterval, isVisible, currentValue])

  const formatNumber = (num: number) => {
    if (stat.shouldIncrement) {
      // Pour les chiffres qui s'incrémentent, afficher 2 décimales
      return num.toFixed(2).replace('.', ',')
    } else {
      // Pour les chiffres fixes, pas de décimales
      return new Intl.NumberFormat('fr-FR').format(Math.floor(num))
    }
  }

  return (
    <RollingNumber
      value={currentValue}
      formatNumber={formatNumber}
      prefix={stat.prefix || ''}
      suffix={stat.suffix}
      isAnimating={isAnimating}
    />
  )
}

export function Stats() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const stats = getStatsConfig()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('stats.title')}
          </h2>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto">
            {t('stats.description')}
          </p>
        </div>

        {/* Background lighting adapted for orange background */}
        <div className="absolute inset-0 -m-8">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-yellow-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/3 left-2/3 w-48 h-48 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className={`grid ${gridCols} gap-6 md:gap-8 relative z-10`}>
          {stats.map((stat, index) => (
            <TooltipProvider key={index}>
              <div className="text-center px-2 group">
                {/* Liquid glass card for orange background */}
                <div className="relative p-6 rounded-3xl">
                  {/* Card background glow - darker for orange background */}
                  <div className="absolute -inset-2 bg-red-600/8 rounded-3xl blur-xl group-hover:bg-red-600/12 transition-all duration-700"></div>
                  
                  {/* Main liquid glass container - adapted for orange background */}
                  <div className="absolute inset-0 bg-black/5 dark:bg-white/3 backdrop-blur-xl rounded-3xl border border-red-600/20 dark:border-yellow-400/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.2),_inset_0_1px_0_0_rgba(255,255,255,0.3)] group-hover:bg-black/8 dark:group-hover:bg-white/5 group-hover:border-red-600/30 dark:group-hover:border-yellow-400/25 transition-all duration-700 ease-out"></div>
                  
                  {/* Liquid glass gradient overlay for orange background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent dark:from-black/8 dark:via-black/3 dark:to-transparent rounded-3xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 cursor-help hover:text-orange-200 transition-colors min-h-[3rem] flex items-center justify-center">
                          {isVisible ? (
                            <PermanentCounter stat={stat} isVisible={isVisible} />
                          ) : (
                            `${stat.prefix || ''}0${stat.suffix}`
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs bg-white text-gray-900 p-3">
                        {t(`stats.items.${stat.key}.tooltip`)}
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-sm md:text-base text-orange-100 font-medium leading-tight px-1">
                      <span className="block">{t(`stats.items.${stat.key}.label`)}</span>
                    </div>
                  </div>
                  
                  {/* Hover glow adapted for orange background */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                </div>
              </div>
            </TooltipProvider>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-orange-100 italic">
            {t('stats.note')}
          </p>
        </div>
      </div>
    </section>
  )
}