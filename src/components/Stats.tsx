import { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLanguage } from '@/contexts/LanguageProvider'
import { RollingNumber } from './RollingNumber'

// Configuration des statistiques avec animation
const getStatsConfig = () => [
  {
    key: 'timeSaved',
    baseValue: 1300, // 1,3k jours
    incrementSpeed: 10, // 10 jours par incrémentation
    incrementInterval: 10000, // toutes les 10 secondes
    suffix: ' jours',
    shouldIncrement: true
  },
  {
    key: 'financialGains',
    baseValue: 2500000, // 2,5M€
    incrementSpeed: 10000, // 0,01M = 10000€ par incrémentation
    incrementInterval: 3000, // toutes les 3 secondes
    prefix: '',
    suffix: ' €',
    shouldIncrement: true
  },
  {
    key: 'projects',
    baseValue: 76, // Inversé : maintenant 76 projets
    suffix: '',
    shouldIncrement: false // Nombre fixe de projets
  },
  {
    key: 'co2Saved',
    baseValue: 1.00,
    incrementSpeed: 0.01, // 0,01 Ktonnes par incrémentation
    incrementInterval: 2000, // toutes les 2 secondes
    prefix: '',
    suffix: ' Ktonnes de CO2',
    shouldIncrement: true
  },
  {
    key: 'clients',
    baseValue: 42, // Inversé : maintenant 42 clients
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
      // Pour les chiffres qui s'incrémentent, afficher 2 décimales pour CO2, 1 pour les autres
      if (stat.key === 'co2Saved') {
        return num.toFixed(2).replace('.', ',')
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(2).replace('.', ',') + ' M'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(2).replace('.', ',') + ' k'
      }
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

        <div className={`grid ${gridCols} gap-6 md:gap-8`}>
          {stats.map((stat, index) => (
            <TooltipProvider key={index}>
              <div className="text-center px-2">
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