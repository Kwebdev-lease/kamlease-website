import { Facebook, Linkedin, Twitter } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageProvider'
import { Logo } from './Logo'
import { scrollToElement } from '@/lib/scroll-utils'

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img 
                src="/assets/logos/Logo couleur.svg"
                alt="Kamlease"
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  // Fallback to PNG if SVG fails
                  e.currentTarget.src = "/assets/logos/Logo couleur.png"
                }}
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('nav.navigation')}</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToElement('about', 100)}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToElement('expertise', 100)}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {t('nav.work')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToElement('process', 100)}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {t('nav.process')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToElement('contact', 100)}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>contact@kamlease.com</li>
              <li>+33 6 73 71 05 86</li>
              <li>
                109 Rue Maréchal Joffre<br />
                45240 La Ferté-Saint-Aubin, France
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/mentions-legales" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
              {t('footer.legalNotice')}
            </a>
            <a href="/politique-confidentialite" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
              {t('footer.privacyPolicy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}