import { useLanguage } from '@/contexts/LanguageProvider'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { SEOHead } from '@/components/SEOHead'
import { StructuredData } from '@/components/StructuredData'
import { pagesSEOData, seoConfig } from '@/lib/seo-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SectionAnchors, TableOfContents } from '@/components/SectionAnchors'

export function PrivacyPolicy() {
  const { t, language } = useLanguage()

  const goBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <SEOHead pageData={pagesSEOData['privacy-policy']} />
      
      {/* Structured Data for Privacy Policy */}
      <StructuredData
        type="WebPage"
        data={{
          name: pagesSEOData['privacy-policy'].title[language],
          description: pagesSEOData['privacy-policy'].description[language],
          url: seoConfig.site.url + pagesSEOData['privacy-policy'].canonicalUrl,
          isPartOf: {
            name: seoConfig.site.name,
            url: seoConfig.site.url
          }
        }}
        language={language}
      />
      
      {/* Section Navigation */}
      <SectionAnchors page="privacy-policy" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { name: t('legal.privacy.title'), url: '/politique-confidentialite', isCurrentPage: true }
          ]}
          className="mb-6"
        />
        
        <Button
          onClick={goBack}
          variant="outline"
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('legal.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TableOfContents page="privacy-policy" />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <h1 id="privacy-policy" className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              {t('legal.privacy.title')}
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section id="intro" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.privacy.intro.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.privacy.intro.content')}
            </p>
          </section>

              <section id="collection" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.privacy.collection.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.collection.content')}
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2 list-disc pl-6">
              <li>{t('legal.privacy.collection.personal')}</li>
              <li>{t('legal.privacy.collection.contact')}</li>
              <li>{t('legal.privacy.collection.technical')}</li>
            </ul>
          </section>

              <section id="usage" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.privacy.usage.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.usage.content')}
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2 list-disc pl-6">
              <li>{t('legal.privacy.usage.respond')}</li>
              <li>{t('legal.privacy.usage.improve')}</li>
              <li>{t('legal.privacy.usage.legal')}</li>
            </ul>
          </section>

              <section id="sharing" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.privacy.sharing.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.privacy.sharing.content')}
            </p>
          </section>

              <section id="rights" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.privacy.rights.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.rights.content')}
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2 list-disc pl-6">
              <li>{t('legal.privacy.rights.access')}</li>
              <li>{t('legal.privacy.rights.rectification')}</li>
              <li>{t('legal.privacy.rights.deletion')}</li>
              <li>{t('legal.privacy.rights.portability')}</li>
            </ul>
          </section>

              <section id="contact" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.privacy.contact.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.privacy.contact.content')} <a href="mailto:contact@kamlease.com" className="text-orange-500 hover:text-orange-600">contact@kamlease.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}