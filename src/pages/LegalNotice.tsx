import { useLanguage } from '@/contexts/LanguageProvider'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { SEOHead } from '@/components/SEOHead'
import { StructuredData } from '@/components/StructuredData'
import { pagesSEOData, seoConfig } from '@/lib/seo-config'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SectionAnchors, TableOfContents } from '@/components/SectionAnchors'

export function LegalNotice() {
  const { t, language } = useLanguage()

  const goBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <SEOHead pageData={pagesSEOData['legal-notice']} />
      
      {/* Structured Data for Legal Notice */}
      <StructuredData
        type="WebPage"
        data={{
          name: pagesSEOData['legal-notice'].title[language],
          description: pagesSEOData['legal-notice'].description[language],
          url: seoConfig.site.url + pagesSEOData['legal-notice'].canonicalUrl,
          isPartOf: {
            name: seoConfig.site.name,
            url: seoConfig.site.url
          }
        }}
        language={language}
      />
      
      {/* Section Navigation */}
      <SectionAnchors page="legal-notice" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { name: t('legal.notice.title'), url: '/mentions-legales', isCurrentPage: true }
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
              <TableOfContents page="legal-notice" />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <h1 id="legal-notice" className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              {t('legal.notice.title')}
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section id="publisher" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.notice.publisher.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.notice.publisher.content')}
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>{t('legal.notice.company')}:</strong> Kamlease</li>
              <li><strong>{t('legal.notice.address')}:</strong> 123 Rue de l'Innovation, 75001 Paris, France</li>
              <li><strong>{t('legal.notice.phone')}:</strong> +33 1 23 45 67 89</li>
              <li><strong>{t('legal.notice.email')}:</strong> contact@kamlease.com</li>
            </ul>
          </section>

              <section id="hosting" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.notice.hosting.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.hosting.content')}
            </p>
          </section>

              <section id="intellectual" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.notice.intellectual.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.intellectual.content')}
            </p>
          </section>

              <section id="liability" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.notice.liability.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.liability.content')}
            </p>
          </section>

              <section id="applicable" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('legal.notice.applicable.title')}
                </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.applicable.content')}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}