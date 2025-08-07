import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Expertise } from '@/components/Expertise'
import { Process } from '@/components/Process'
import { Stats } from '@/components/Stats'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { SEOHead } from '@/components/SEOHead'
import { StructuredData } from '@/components/StructuredData'
import { pagesSEOData, seoConfig } from '@/lib/seo-config'
import { SectionAnchors } from '@/components/SectionAnchors'
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
      
      {/* Section Navigation */}
      <SectionAnchors page="home" />
      
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <About />
        <Expertise />
        <Process />
        <Stats />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
