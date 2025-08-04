import React, { useState } from 'react'
import BackgroundPattern from './BackgroundPattern'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { useLanguage } from '@/contexts/LanguageProvider'

interface BackgroundConfig {
  type: 'gradient' | 'pattern' | 'particles' | 'combined'
  intensity: 'subtle' | 'medium' | 'strong'
  animated: boolean
  section: 'hero' | 'about' | 'expertise' | 'process' | 'contact' | 'default'
}

const BackgroundPatternDemo: React.FC = () => {
  const { t } = useLanguage();
  const [config, setConfig] = useState<BackgroundConfig>({
    type: 'combined',
    intensity: 'medium',
    animated: true,
    section: 'hero'
  })

  const accessibility = useAccessibilityPreferences()

  const updateConfig = (updates: Partial<BackgroundConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Démonstration BackgroundPattern
        </h1>

        {/* Informations d'accessibilité */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Préférences d'accessibilité détectées :</h2>
          <ul className="space-y-1 text-sm">
            <li>Mouvement réduit : {accessibility.prefersReducedMotion ? 'Oui' : 'Non'}</li>
            <li>Thème : {accessibility.theme}</li>
            <li>Contraste élevé : {accessibility.highContrast ? 'Oui' : 'Non'}</li>
            <li>Préférence de couleur : {accessibility.prefersColorScheme}</li>
          </ul>
        </div>

        {/* Contrôles */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={config.type}
                onChange={(e) => updateConfig({ type: e.target.value as BackgroundConfig['type'] })}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="gradient">Gradient</option>
                <option value="pattern">Pattern</option>
                <option value="particles">Particles</option>
                <option value="combined">Combined</option>
              </select>
            </div>

            {/* Intensité */}
            <div>
              <label className="block text-sm font-medium mb-2">Intensité</label>
              <select
                value={config.intensity}
                onChange={(e) => updateConfig({ intensity: e.target.value as BackgroundConfig['intensity'] })}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="subtle">Subtle</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Section</label>
              <select
                value={config.section}
                onChange={(e) => updateConfig({ section: e.target.value as BackgroundConfig['section'] })}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="hero">Hero</option>
                <option value="about">About</option>
                <option value="expertise">Expertise</option>
                <option value="process">Process</option>
                <option value="contact">Contact</option>
                <option value="default">Default</option>
              </select>
            </div>

            {/* Animation */}
            <div>
              <label className="block text-sm font-medium mb-2">Animation</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.animated && !accessibility.prefersReducedMotion}
                  onChange={(e) => updateConfig({ animated: e.target.checked })}
                  disabled={accessibility.prefersReducedMotion}
                  className="mr-2"
                />
                <span className={accessibility.prefersReducedMotion ? 'text-gray-400' : ''}>
                  Activé {accessibility.prefersReducedMotion && '(désactivé par préférence)'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Aperçu principal */}
          <div className="relative">
            <h3 className="text-lg font-semibold mb-4">Aperçu - Section {config.section}</h3>
            <div className="relative h-64 rounded-lg overflow-hidden border">
              <BackgroundPattern
                config={{
                  ...config,
                  animated: config.animated && !accessibility.prefersReducedMotion
                }}
                className="h-full"
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6 bg-white/80 dark:bg-gray-900/80 rounded-lg backdrop-blur-sm">
                    <h4 className="text-xl font-bold mb-2">Contenu de démonstration</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Type: {config.type} | Intensité: {config.intensity}
                    </p>
                    {config.animated && !accessibility.prefersReducedMotion && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                        ✨ Animations actives
                      </p>
                    )}
                  </div>
                </div>
              </BackgroundPattern>
            </div>
          </div>

          {/* Aperçus des autres sections */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Aperçus des autres sections</h3>
            <div className="space-y-4">
              {(['hero', 'about', 'expertise', 'process', 'contact'] as const).map((section) => (
                <div key={section} className="relative h-20 rounded-md overflow-hidden border">
                  <BackgroundPattern
                    config={{
                      type: 'combined',
                      intensity: 'subtle',
                      animated: !accessibility.prefersReducedMotion,
                      section
                    }}
                    className="h-full"
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="text-sm font-medium bg-white/70 dark:bg-gray-900/70 px-3 py-1 rounded backdrop-blur-sm">
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </span>
                    </div>
                  </BackgroundPattern>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Informations techniques</h3>
          <div className="text-sm space-y-1">
            <p><strong>Configuration actuelle :</strong> {JSON.stringify(config, null, 2)}</p>
            <p><strong>Animations respectent prefers-reduced-motion :</strong> {accessibility.prefersReducedMotion ? 'Oui (désactivées)' : 'Non (actives)'}</p>
            <p><strong>Thème adaptatif :</strong> {accessibility.theme}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackgroundPatternDemo