import { useState, useRef, useEffect } from 'react'
import { Play, Pause, AlertCircle, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageProvider'

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
  poster?: string // Image de prévisualisation
}

export function VideoPlayer({ src, title, className = '', poster }: VideoPlayerProps) {
  const { language } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const [userAgent, setUserAgent] = useState('')
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null)

  // Détecter le type d'appareil et navigateur
  useEffect(() => {
    setUserAgent(navigator.userAgent)
  }, [src])

  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
  const isAndroid = /Android/.test(userAgent)
  const isMobile = isIOS || isAndroid || /Mobile/.test(userAgent)

  // Observer pour détecter quand la vidéo entre dans le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current && isPlaying) {
          // Pause quand la vidéo sort du viewport
          videoRef.current.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.3 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [isPlaying])

  // Fonction pour ajouter des infos de debug
  const addDebugInfo = (info: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const message = `${timestamp}: ${info}`
    setDebugInfo(prev => [...prev.slice(-4), message])
    
    // Log to console for debugging
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    consoleMethod(`[VideoPlayer] ${info}`, {
      src,
      isIOS,
      isSafari,
      isMobile,
      canPlay,
      hasError,
      isLoading
    })
  }

  // Gestion des événements vidéo avec debugging amélioré
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    addDebugInfo('Video element initialized')

    const handleLoadStart = () => {
      addDebugInfo('Load started')
      setIsLoading(true)
      setHasError(false)
      
      // Timeout de sécurité pour éviter le chargement infini
      const timeout = setTimeout(() => {
        addDebugInfo('Load timeout - switching to fallback', 'warn')
        setIsLoading(false)
        setHasError(true)
      }, 15000) // 15 secondes max
      
      setLoadTimeout(timeout)
    }

    const handleCanPlay = () => {
      addDebugInfo('Can play - video ready')
      setIsLoading(false)
      setCanPlay(true)
      setHasError(false)
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        setLoadTimeout(null)
      }
    }

    const handleError = (e: Event) => {
      const error = video.error
      const errorMsg = error ? `Error ${error.code}: ${error.message}` : 'Unknown error'
      addDebugInfo(`Video error: ${errorMsg}`, 'error')
      console.error('Video error:', e, error)
      setIsLoading(false)
      setHasError(true)
      setCanPlay(false)
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        setLoadTimeout(null)
      }
    }

    const handleLoadedData = () => {
      addDebugInfo('Data loaded successfully')
      setIsLoading(false)
      setCanPlay(true)
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        setLoadTimeout(null)
      }
    }

    const handleLoadedMetadata = () => {
      addDebugInfo(`Metadata loaded: ${video.videoWidth}x${video.videoHeight}, ${video.duration}s`)
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = (video.buffered.end(0) / video.duration) * 100
        addDebugInfo(`Buffered: ${buffered.toFixed(1)}%`)
      }
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('progress', handleProgress)

    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('progress', handleProgress)
    }
  }, [])

  const handlePlay = async () => {
    if (!videoRef.current || !canPlay) return

    try {
      setIsLoading(true)
      await videoRef.current.play()
      setIsPlaying(true)
      setHasStarted(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Play error:', error)
      setHasError(true)
      setIsLoading(false)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleVideoClick = () => {
    if (hasError) {
      handleRetry()
      return
    }

    if (!hasStarted || !canPlay) {
      handlePlay()
    } else if (isPlaying) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    // Ne pas remettre hasStarted à false pour garder les contrôles
  }

  const handleRetry = () => {
    setHasError(false)
    setIsLoading(true)
    if (videoRef.current) {
      videoRef.current.load() // Recharge la vidéo
    }
  }

  // Générer une image poster par défaut si pas fournie
  const posterImage = poster || `data:image/svg+xml;base64,${btoa(`
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
          ref={videoRef}
          className="w-full h-auto cursor-pointer"
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={handleVideoClick}
          poster={posterImage}
          muted
          playsInline
          preload={isMobile ? "none" : "metadata"}
          controls={false}
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          crossOrigin="anonymous"
        >
          {/* Source principale */}
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

        {/* Overlay principal */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* État de chargement */}
          {isLoading && (
            <div className="bg-black/50 rounded-full p-6 backdrop-blur-sm">
              <RefreshCw className="h-12 w-12 text-white animate-spin" />
            </div>
          )}

          {/* État d'erreur */}
          {hasError && (
            <div className="bg-red-500/90 rounded-2xl p-6 backdrop-blur-sm text-center max-w-sm mx-4">
              <AlertCircle className="h-12 w-12 text-white mx-auto mb-4" />
              <p className="text-white font-medium mb-4">
                {language === 'fr' 
                  ? 'Erreur de lecture vidéo'
                  : 'Video playback error'
                }
              </p>
              <button
                onClick={handleRetry}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {language === 'fr' ? 'Réessayer' : 'Retry'}
              </button>
            </div>
          )}

          {/* Bouton play/pause */}
          {!isLoading && !hasError && (
            <button
              onClick={handleVideoClick}
              className="bg-white/90 hover:bg-white text-gray-900 rounded-full p-6 transition-all duration-300 hover:scale-110 shadow-xl backdrop-blur-sm group"
              aria-label={
                !hasStarted 
                  ? (language === 'fr' ? 'Lire la vidéo' : 'Play video')
                  : isPlaying 
                  ? (language === 'fr' ? 'Mettre en pause' : 'Pause video')
                  : (language === 'fr' ? 'Reprendre' : 'Resume video')
              }
              style={{
                opacity: (!hasStarted || !isPlaying) ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onMouseEnter={(e) => {
                if (hasStarted && isPlaying) {
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                if (hasStarted && isPlaying) {
                  e.currentTarget.style.opacity = '0'
                }
              }}
            >
              {isPlaying ? (
                <Pause className="h-12 w-12 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Play className="h-12 w-12 ml-1 group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
          )}
        </div>

        {/* Indicateur de lecture discret */}
        {hasStarted && !hasError && (
          <div className="absolute bottom-4 right-4">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
          </div>
        )}

        {/* Informations de debug en mode développement */}
        {import.meta.env.DEV && (
          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs p-2 rounded backdrop-blur-sm space-y-1">
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>iOS: {isIOS ? 'Yes' : 'No'}</div>
            <div>Safari: {isSafari ? 'Yes' : 'No'}</div>
            <div>Can Play: {canPlay ? 'Yes' : 'No'}</div>
            <div>Error: {hasError ? 'Yes' : 'No'}</div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  console.log('Video debug info:', {
                    src,
                    isIOS,
                    isSafari,
                    isMobile,
                    canPlay,
                    hasError,
                    isLoading,
                    userAgent
                  })
                }}
                className="block w-full bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
              >
                🔍 Log Debug Info
              </button>
            </div>
          </div>
        )}

        {/* Message d'aide pour mobile */}
        {isMobile && !hasStarted && !isLoading && !hasError && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-sm p-3 rounded-lg backdrop-blur-sm max-w-xs">
            <p>
              {language === 'fr' 
                ? '📱 Appuyez sur le bouton pour lancer la vidéo'
                : '📱 Tap the button to start the video'
              }
            </p>
          </div>
        )}

        {/* Debug info pour mobile (visible sur tous les appareils si problème) */}
        {(isMobile || hasError || isLoading) && debugInfo.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-red-900/80 text-white text-xs p-2 rounded backdrop-blur-sm max-w-xs max-h-32 overflow-y-auto">
            <div className="font-bold mb-1">Debug Info:</div>
            {debugInfo.map((info, index) => (
              <div key={index} className="mb-1">{info}</div>
            ))}
            <div className="mt-2 text-yellow-200">
              Device: {isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'} | 
              Browser: {isSafari ? 'Safari' : 'Other'}
            </div>
          </div>
        )}
      </div>

      {/* Contrôles natifs en fallback pour certains appareils */}
      {hasError && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {language === 'fr' 
                ? 'Problème avec le lecteur personnalisé ? Essayez le lecteur natif :'
                : 'Issues with custom player? Try the native player:'
              }
            </p>
            <video
              src={src}
              controls
              className="w-full rounded"
              playsInline
              muted
              poster={posterImage}
            >
              <source src={src} type="video/mp4" />
            </video>
          </div>

          {/* Lecteur alternatif pour iOS */}
          {isIOS && (
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                {language === 'fr' 
                  ? 'Lecteur optimisé iOS :'
                  : 'iOS optimized player:'
                }
              </p>
              <video
                controls
                className="w-full rounded"
                playsInline
                webkit-playsinline="true"
                preload="none"
                poster={posterImage}
              >
                <source src={src} type="video/mp4" />
              </video>
            </div>
          )}

          {/* Lien de téléchargement direct */}
          <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-center">
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
              {language === 'fr' 
                ? 'Toujours des problèmes ? Téléchargez la vidéo :'
                : 'Still having issues? Download the video:'
              }
            </p>
            <a
              href={src}
              download
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {language === 'fr' ? '📥 Télécharger' : '📥 Download'}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}