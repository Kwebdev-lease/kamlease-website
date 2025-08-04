import React from 'react'
import { SEOHead } from './SEOHead'
import { 
  StructuredData, 
  KamleaseCompleteStructuredData,
  KamleaseServices,
  BreadcrumbStructuredData 
} from './StructuredData'
import { pagesSEOData } from '../lib/seo-config'
import { structuredDataService } from '../lib/structured-data-service'

export const SEODemo: React.FC = () => {
  // Example breadcrumb data
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'À propos', url: '/about' },
    { name: 'SEO Demo', url: '/seo-demo' }
  ]

  // Example custom structured data
  const customStructuredData = [
    {
      type: 'Service' as const,
      data: {
        name: 'Consultation SEO',
        description: 'Service de consultation pour optimiser votre référencement naturel',
        provider: {
          name: 'Kamlease',
          url: 'https://kamlease.com'
        },
        serviceType: 'Consultation',
        category: 'SEO'
      },
      language: 'fr' as const
    }
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SEO & Structured Data Demo</h1>
      
      {/* SEO Head with structured data */}
      <SEOHead 
        pageData={pagesSEOData.home} 
        structuredData={customStructuredData}
      />
      
      {/* Additional structured data components */}
      <KamleaseCompleteStructuredData 
        language="fr"
        includeServices={true}
        contactInfo={{
          telephone: '+33123456789',
          email: 'contact@kamlease.com'
        }}
      />
      
      <BreadcrumbStructuredData items={breadcrumbItems} />
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">SEO Features Implemented</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Meta Tags</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Dynamic title and description</li>
                <li>• Keywords optimization</li>
                <li>• Canonical URLs</li>
                <li>• Language attributes</li>
                <li>• Robots directives</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Social Media</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Open Graph tags</li>
                <li>• Twitter Cards</li>
                <li>• Optimized images</li>
                <li>• Social sharing ready</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Structured Data</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Schema.org Organization</li>
                <li>• LocalBusiness data</li>
                <li>• Service descriptions</li>
                <li>• Breadcrumb navigation</li>
                <li>• WebSite search action</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Internationalization</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Hreflang attributes</li>
                <li>• Multi-language support</li>
                <li>• Localized structured data</li>
                <li>• Regional targeting</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Structured Data Examples</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Organization Schema</h3>
              <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
                <code>{structuredDataService.generateOrganization({}, 'fr')}</code>
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">WebSite Schema</h3>
              <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
                <code>{structuredDataService.generateWebSite('fr')}</code>
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Service Schema</h3>
              <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
                <code>{structuredDataService.generateService({
                  name: 'Solutions Mécatroniques',
                  description: 'Conception et développement de solutions mécatroniques innovantes',
                  provider: {
                    name: 'Kamlease',
                    url: 'https://kamlease.com'
                  },
                  serviceType: 'Ingénierie Mécatronique',
                  category: 'Mécatronique'
                }, 'fr')}</code>
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Implementation Examples</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Basic SEO Head with Structured Data</h3>
              <pre className="text-sm overflow-x-auto bg-white p-3 rounded border">
                <code>{`import { SEOHead } from './components/SEOHead'
import { pagesSEOData } from './lib/seo-config'

function HomePage() {
  const customStructuredData = [
    {
      type: 'Service',
      data: {
        name: 'Custom Service',
        description: 'Service description',
        provider: { name: 'Kamlease', url: 'https://kamlease.com' },
        serviceType: 'Consultation'
      },
      language: 'fr'
    }
  ]

  return (
    <>
      <SEOHead 
        pageData={pagesSEOData.home}
        structuredData={customStructuredData}
      />
      <main>{/* Page content */}</main>
    </>
  )
}`}</code>
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Complete Kamlease Structured Data</h3>
              <pre className="text-sm overflow-x-auto bg-white p-3 rounded border">
                <code>{`import { KamleaseCompleteStructuredData } from './components/StructuredData'

function HomePage() {
  return (
    <>
      <KamleaseCompleteStructuredData 
        language="fr"
        includeServices={true}
        contactInfo={{
          telephone: '+33123456789',
          email: 'contact@kamlease.com'
        }}
        address={{
          streetAddress: '123 Rue de la Tech',
          addressLocality: 'Paris',
          postalCode: '75001',
          addressCountry: 'FR'
        }}
      />
      <main>{/* Page content */}</main>
    </>
  )
}`}</code>
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Breadcrumb Structured Data</h3>
              <pre className="text-sm overflow-x-auto bg-white p-3 rounded border">
                <code>{`import { BreadcrumbStructuredData } from './components/StructuredData'

function AboutPage() {
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'À propos', url: '/about' }
  ]

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbs} />
      <main>{/* Page content */}</main>
    </>
  )
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Validation & Testing</h2>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Recommended Tools</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <a href="https://search.google.com/test/rich-results" className="underline" target="_blank" rel="noopener noreferrer">Google Rich Results Test</a></li>
              <li>• <a href="https://validator.schema.org/" className="underline" target="_blank" rel="noopener noreferrer">Schema.org Validator</a></li>
              <li>• <a href="https://developers.google.com/speed/pagespeed/insights/" className="underline" target="_blank" rel="noopener noreferrer">PageSpeed Insights</a></li>
              <li>• <a href="https://search.google.com/search-console" className="underline" target="_blank" rel="noopener noreferrer">Google Search Console</a></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}