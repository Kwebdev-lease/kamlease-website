import React from 'react'
import { SEOImage, SEOLogo, SEOHeroImage } from './SEOImage'

/**
 * Demo component showcasing the SEO Image optimization system
 */
export function SEOImageDemo() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">SEO Image Optimization Demo</h1>
      
      {/* Logo Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">SEO Logo Component</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <SEOLogo className="h-16 w-auto" />
        </div>
        <p className="text-sm text-gray-600">
          Automatically optimized logo with SEO-friendly alt text, WebP support, and priority loading.
        </p>
      </section>

      {/* Hero Image Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">SEO Hero Image</h2>
        <div className="bg-gray-100 p-4 rounded-lg shadow h-64">
          <SEOHeroImage 
            src="/assets/logos/Logo couleur.svg"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-sm text-gray-600">
          Hero image with priority loading, responsive srcsets, and contextual alt text.
        </p>
      </section>

      {/* Generic SEO Image Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Context-Specific SEO Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Services Context */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Services Context</h3>
            <SEOImage
              src="/assets/logos/Logo couleur.svg"
              context="services"
              keywords={['ingénierie', 'mécatronique', 'solutions']}
              className="w-full h-32"
            />
            <p className="text-xs text-gray-500 mt-2">
              Lazy loaded with services-specific SEO optimization
            </p>
          </div>

          {/* Expertise Context */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Expertise Context</h3>
            <SEOImage
              src="/assets/logos/Logo couleur.svg"
              context="expertise"
              keywords={['expertise', 'technique', 'innovation']}
              className="w-full h-32"
            />
            <p className="text-xs text-gray-500 mt-2">
              Optimized for expertise-related content
            </p>
          </div>

          {/* Contact Context */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Contact Context</h3>
            <SEOImage
              src="/assets/logos/Logo couleur.svg"
              context="contact"
              keywords={['contact', 'bureau', 'équipe']}
              className="w-full h-32"
            />
            <p className="text-xs text-gray-500 mt-2">
              Contact page optimized imagery
            </p>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">SEO Image Features</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Automatic WebP format support with fallbacks
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Responsive image sets for different screen sizes
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Context-aware SEO-optimized alt text generation
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Lazy loading with intersection observer
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Priority loading for above-the-fold content
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Multilingual support (French/English)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Structured data attributes for SEO
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Progressive loading with placeholders
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}