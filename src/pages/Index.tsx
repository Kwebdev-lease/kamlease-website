import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Experience } from '@/components/Experience'
import { Expertise } from '@/components/Expertise'
import { Process } from '@/components/Process'

import { Stats } from '@/components/Stats'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { SEOHead } from '@/components/SEOHead'
import { StructuredData } from '@/components/StructuredData'
import { pagesSEOData, seoConfig } from '@/lib/seo-config'

import { useLanguage } from '@/contexts/LanguageProvider'

export default function Index() {
  const { language } = useLanguage()
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <SEOHead pageData={pagesSEOData.home} />
      
      {/* Structured Data for SEO */}
      <StructuredData
        multiple={[
          {
            type: 'Organization',
            data: {
              name: seoConfig.site.name,
              description: seoConfig.site.description[language],
              url: seoConfig.site.url,
              logo: seoConfig.site.url + seoConfig.site.logo,
              contactPoint: {
                telephone: '+33-6-73-71-05-86',
                contactType: 'customer service',
                availableLanguage: ['French', 'English']
              },
              sameAs: [
                seoConfig.social.linkedin || ''
              ].filter(Boolean)
            },
            language
          },
          {
            type: 'LocalBusiness',
            data: {
              name: seoConfig.site.name,
              description: seoConfig.site.description[language],
              url: seoConfig.site.url,
              telephone: '+33-6-73-71-05-86',
              address: {
                streetAddress: '109 Rue Maréchal Joffre',
                addressLocality: 'La Ferté-Saint-Aubin',
                postalCode: '45240',
                addressCountry: 'FR'
              },
              openingHours: ['Mo-Fr 09:00-18:00'],
              priceRange: '€€€'
            },
            language
          },
          {
            type: 'WebSite',
            data: {
              name: seoConfig.site.name,
              url: seoConfig.site.url,
              description: seoConfig.site.description[language],
              potentialAction: {
                target: seoConfig.site.url + '/search?q={search_term_string}',
                queryInput: 'required name=search_term_string'
              }
            },
            language
          }
        ]}
        language={language}
      />
      

      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <About />
        <Experience />
        <Expertise />
        <Process />
        
        {/* Section Vidéo Process - Placeholder temporaire */}
        <section className="py-20 bg-gradient-to-br from-brand-neutral-50 to-brand-neutral-100 dark:from-brand-neutral-900 dark:to-brand-neutral-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
                {language === 'fr' ? 'Notre processus en vidéo' : 'Our process in video'}
              </h3>
              
              {/* Placeholder pour la vidéo */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {language === 'fr' ? 'Vidéo bientôt disponible' : 'Video coming soon'}
                  </p>
                  <p className="text-sm text-gray-300">
                    {language === 'fr' 
                      ? 'Une vidéo explicative de notre processus sera ajoutée prochainement'
                      : 'An explanatory video of our process will be added soon'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Stats />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
