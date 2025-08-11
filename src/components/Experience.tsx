import { useLanguage } from "@/contexts/LanguageProvider"
import { BackgroundPattern } from './BackgroundPattern'

export function Experience() {
  const { language } = useLanguage()

  return (
    <section id="experience" className="py-20 bg-white dark:bg-brand-neutral-900 relative overflow-hidden">
      {/* Background pattern */}
      <BackgroundPattern 
        config={{
          type: 'combined',
          intensity: 'subtle',
          animated: true,
          section: 'experience'
        }}
        className="absolute inset-0"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Grande card avec le texte d'expérience */}
          <div className="order-2 lg:order-1">
            <div className="bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="text-6xl md:text-7xl font-bold font-heading">
                    30+
                  </div>
                  <div className="text-xl md:text-2xl font-semibold uppercase tracking-wider">
                    {language === 'fr' 
                      ? "ANS D'EXPÉRIENCE"
                      : "YEARS OF EXPERIENCE"
                    }
                  </div>
                </div>
                <div className="h-1 w-24 bg-white/30 rounded-full mx-auto"></div>
                <div className="text-lg md:text-xl font-medium">
                  {language === 'fr' 
                    ? "en ingénierie et innovation"
                    : "in engineering and innovation"
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Frames pour les photos des employés */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative w-full h-96 md:h-[500px]">
              {/* Frame 1 - Forme hexagonale */}
              <div className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64">
                <div 
                  className="w-full h-full bg-gradient-to-br from-brand-neutral-200 to-brand-neutral-300 dark:from-brand-neutral-700 dark:to-brand-neutral-800 shadow-lg"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-brand-neutral-500 dark:text-brand-neutral-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <div className="text-sm font-medium">
                        {language === 'fr' ? 'Photo à venir' : 'Photo coming'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame 2 - Forme diamant arrondi */}
              <div className="absolute bottom-0 right-0 w-52 h-52 md:w-72 md:h-72">
                <div 
                  className="w-full h-full bg-gradient-to-br from-brand-orange-100 to-brand-orange-200 dark:from-brand-orange-900/30 dark:to-brand-orange-800/30 shadow-lg"
                  style={{
                    clipPath: 'polygon(50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%, 0% 50%, 15% 15%)'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-brand-orange-600 dark:text-brand-orange-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <div className="text-sm font-medium">
                        {language === 'fr' ? 'Photo à venir' : 'Photo coming'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Éléments décoratifs */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-brand-orange-500 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-brand-orange-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-brand-orange-600 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}