import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { LanguageToggle } from './LanguageToggle'
import { useTheme } from './ThemeProvider'
import { useLanguage } from '@/contexts/LanguageProvider'
import { Logo } from './Logo'
import { scrollToElement } from '@/lib/scroll-utils'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme } = useTheme()
  const { t } = useLanguage()

  const navigation = [
    { name: t('nav.about'), href: '#about', id: 'about' },
    { name: t('nav.work'), href: '#expertise', id: 'expertise' },
    { name: t('nav.process'), href: '#process', id: 'process' },
    { name: t('nav.contact'), href: '#contact', id: 'contact' },
  ]

  const handleNavClick = (elementId: string) => {
    scrollToElement(elementId, 65) // 65px offset = exact navbar height (py-4 + h-8 + border)
  }



  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav id="main-navigation" className="mx-auto flex max-w-7xl items-center justify-between py-4 px-4 lg:px-8" aria-label="Global" tabIndex={-1}>
        <div className="flex lg:flex-1">
          <a href="https://kamlease.com" className="-m-1.5 p-1.5">
            <Logo className="h-8 w-auto" />
          </a>
        </div>
        <div className="flex lg:hidden gap-2">
          <LanguageToggle />
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300 ml-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">{t('contact.accessibility.openMenu')}</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.id)}
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-all duration-300 hover:scale-110 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
          <LanguageToggle />
          <div className="relative">
            {/* Button background glow */}
            <div className="absolute -inset-1 bg-orange-500/15 rounded-xl blur-sm"></div>
            
            {/* Main liquid glass container for button */}
            <div className="absolute inset-0 bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl border border-white/20 dark:border-white/10 shadow-[0_4px_16px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.2),_inset_0_1px_0_0_rgba(255,255,255,0.05)]"></div>
            
            {/* Liquid glass gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent dark:from-white/8 dark:via-white/2 dark:to-transparent rounded-xl"></div>
            
            <Button 
              className="relative z-10 !bg-orange-500/90 hover:!bg-orange-600/90 text-white !border-transparent backdrop-blur-sm"
              onClick={() => handleNavClick('contact')}
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.9)',
                borderColor: 'transparent'
              }}
            >
              {t('nav.startProject')}
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu - Full screen 100vh avec fond blanc flou */}
      <div className={`fixed inset-0 z-50 h-screen w-full backdrop-blur-md bg-white/90 dark:bg-black/90 transform transition-all duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="h-full flex flex-col justify-center items-center relative">
          {/* Bouton fermer en haut à droite */}
          <button
            type="button"
            className="absolute top-8 right-8 p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">{t('contact.accessibility.closeMenu')}</span>
            <X className="h-6 w-6 text-gray-900 dark:text-gray-100" aria-hidden="true" />
          </button>
          
          {/* Navigation centrée verticalement */}
          <nav className="flex flex-col items-center space-y-12">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleNavClick(item.id)
                }}
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-all duration-300 hover:scale-110 relative group"
              >
                {item.name}
              </button>
            ))}
          </nav>
          
          {/* Bouton CTA en bas avec liquid glass */}
          <div className="absolute bottom-12 left-8 right-8">
            <div className="relative">
              {/* Button background glow */}
              <div className="absolute -inset-2 bg-orange-500/20 rounded-3xl blur-lg"></div>
              
              {/* Main liquid glass container for mobile button */}
              <div className="absolute inset-0 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/25 dark:border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.2),_inset_0_1px_0_0_rgba(255,255,255,0.3)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.1)]"></div>
              
              {/* Liquid glass gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/8 to-transparent dark:from-white/12 dark:via-white/4 dark:to-transparent rounded-2xl"></div>
              
              <Button 
                className="relative z-10 w-full !bg-orange-500/90 hover:!bg-orange-600/90 text-white py-6 text-xl font-semibold rounded-2xl !border-transparent backdrop-blur-sm"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleNavClick('contact')
                }}
                style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.9)',
                  borderColor: 'transparent'
                }}
              >
                {t('nav.startProject')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}