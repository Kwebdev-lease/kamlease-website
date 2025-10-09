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

      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
        <video
          className="w-full h-auto"
          controls
          playsInline
          preload="metadata"
          poster={posterImage}
          style={{ maxHeight: '70vh' }}
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
      </div>
    </div>
  )
}