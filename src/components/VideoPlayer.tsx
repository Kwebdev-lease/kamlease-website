import { useLanguage } from '@/contexts/LanguageProvider'

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
  poster?: string
}

export function VideoPlayer({ src, title, className = '' }: VideoPlayerProps) {
  const { language } = useLanguage()

  // Générer une image poster par défaut
  const posterImage = `data:image/svg+xml;base64,${btoa(`
    <svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#374151;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="playBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Decorative elements -->
      <circle cx="200" cy="150" r="80" fill="#374151" opacity="0.3"/>
      <circle cx="1000" cy="500" r="120" fill="#374151" opacity="0.2"/>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" opacity="0.8"/>
      
      <!-- Play button -->
      <circle cx="600" cy="337.5" r="60" fill="url(#playBg)" opacity="0.9"/>
      <circle cx="600" cy="337.5" r="45" fill="white" opacity="0.1"/>
      <polygon points="580,317.5 580,357.5 620,337.5" fill="white"/>
      
      <!-- Title -->
      <text x="600" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#f3f4f6" text-anchor="middle">
        ${title || 'Vidéo de présentation'}
      </text>
      <text x="600" y="480" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle">
        Cliquez pour lancer la lecture
      </text>
      
      <!-- Kamlease branding -->
      <text x="600" y="520" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f97316" text-anchor="middle">
        KAMLEASE
      </text>
    </svg>
  `)}`

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-2xl font-heading font-bold text-center mb-6 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      {/* Container avec protection contre les overlays d'antivirus */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
        {/* Couche de protection contre les overlays invisibles */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ 
            background: 'transparent',
            mixBlendMode: 'normal'
          }}
        ></div>
        
        <video
          className="w-full h-auto relative z-0"
          controls
          controlsList="nodownload noremoteplayback"
          playsInline
          preload="metadata"
          poster={posterImage}
          style={{ 
            maxHeight: '70vh',
            position: 'relative',
            zIndex: 1
          }}
          // Attributs pour contourner les bloqueurs
          data-setup="{}"
          webkit-playsinline="true"
          x5-playsinline="true"
          // Force le focus sur le lecteur
          tabIndex={0}
        >
          <source src={src} type="video/mp4" />
          
          {/* Fallback pour navigateurs très anciens */}
          <p className="text-white p-4">
            {language === 'fr' 
              ? 'Votre navigateur ne supporte pas la lecture vidéo. '
              : 'Your browser does not support video playback. '
            }
            <a href={src} className="text-orange-500 underline">
              {language === 'fr' ? 'Télécharger la vidéo' : 'Download video'}
            </a>
          </p>
        </video>

        {/* Message d'aide pour les utilisateurs avec des problèmes */}
        <div className="absolute bottom-2 right-2 z-20">
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded opacity-75 hover:opacity-100 transition-opacity">
            {language === 'fr' 
              ? 'Problème de lecture ? Clic droit → Ouvrir dans un nouvel onglet'
              : 'Playback issue? Right-click → Open in new tab'
            }
          </div>
        </div>
      </div>

      {/* Lecteur alternatif en cas de problème */}
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {language === 'fr' 
            ? 'Le lecteur ne fonctionne pas ? Essayez ces alternatives :'
            : 'Player not working? Try these alternatives:'
          }
        </p>
        <div className="flex flex-wrap gap-2">
          <a 
            href={src} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
          >
            {language === 'fr' ? '🎬 Ouvrir dans un nouvel onglet' : '🎬 Open in new tab'}
          </a>
          <a 
            href={src} 
            download
            className="inline-flex items-center px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            {language === 'fr' ? '📥 Télécharger' : '📥 Download'}
          </a>
        </div>
      </div>
    </div>
  )
}