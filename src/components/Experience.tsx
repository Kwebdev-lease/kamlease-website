import { useLanguage } from "@/contexts/LanguageProvider"
import { BackgroundPattern } from './BackgroundPattern'

export function Experience() {
  const { language } = useLanguage()

  return (
    <section id="experience" className="py-20 bg-gradient-to-br from-brand-neutral-100 to-brand-neutral-200 dark:from-brand-neutral-800 dark:to-brand-neutral-900 relative overflow-hidden">
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Grande card d'expérience avec liquid glass */}
        <div className="relative">
          {/* Background lighting for orange card */}
          <div className="absolute inset-0 -m-4">
            <div 
              className="absolute top-1/3 left-1/3 w-48 h-48 bg-red-600/12 rounded-full blur-3xl"
              style={{
                animation: 'float 8s ease-in-out infinite'
              }}
            ></div>
            <div 
              className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-yellow-500/10 rounded-full blur-3xl"
              style={{
                animation: 'float 10s ease-in-out infinite 2s'
              }}
            ></div>
          </div>
          
          {/* Card principale avec liquid glass effect */}
          <div className="relative">
            {/* Card background glow - darker for orange background */}
            <div className="absolute -inset-2 bg-red-600/10 rounded-3xl blur-xl"></div>
            
            {/* Main liquid glass container - adapted for orange background */}
            <div className="absolute inset-0 bg-black/8 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-red-600/25 dark:border-yellow-400/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.4)]"></div>
            
            {/* Liquid glass gradient overlay for orange background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/8 to-transparent dark:from-black/10 dark:via-black/4 dark:to-transparent rounded-3xl"></div>
            
            <div className="relative z-10 bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
            {/* Éléments décoratifs subtils */}
            <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full opacity-30"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/15 rounded-lg rotate-45 opacity-25"></div>
            <div className="absolute top-1/2 left-8 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-12 w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/3 right-8 w-2 h-2 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
              {/* Texte principal */}
              <div className="lg:col-span-1 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
                  30+ ANS
                </h2>
                <p className="text-xl md:text-2xl text-white/90 font-medium">
                  {language === 'fr' 
                    ? "D'EXPÉRIENCE"
                    : "OF EXPERIENCE"
                  }
                </p>
                <p className="text-lg text-white/80 mt-2">
                  {language === 'fr' 
                    ? "en ingénierie et innovation"
                    : "in engineering and innovation"
                  }
                </p>
              </div>
              
              {/* Frames pour les photos */}
              <div className="lg:col-span-2 flex justify-center lg:justify-end space-x-6">
                {/* Frame 1 - Forme hexagonale */}
                <div className="relative">
                  <div 
                    className="w-32 h-32 md:w-40 md:h-40 bg-brand-neutral-300 dark:bg-brand-neutral-600 flex items-center justify-center text-brand-neutral-500 dark:text-brand-neutral-400 shadow-lg"
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">👤</div>
                      <p className="text-xs font-medium">
                        {language === 'fr' ? 'Photo à venir' : 'Photo coming'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Frame 2 - Forme diamant arrondi */}
                <div className="relative">
                  <div 
                    className="w-32 h-32 md:w-40 md:h-40 bg-brand-orange-300 dark:bg-brand-orange-700 flex items-center justify-center text-brand-orange-600 dark:text-brand-orange-300 shadow-lg"
                    style={{
                      clipPath: 'polygon(50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%, 0% 50%, 15% 15%)',
                      borderRadius: '10%'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">👤</div>
                      <p className="text-xs font-medium">
                        {language === 'fr' ? 'Photo à venir' : 'Photo coming'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
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
        </div>
      </div>
    </section>
  )
}