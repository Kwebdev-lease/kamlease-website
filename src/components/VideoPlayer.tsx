import { useState, useRef, useEffect } from 'react'
import { Play } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageProvider'

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
}

export function VideoPlayer({ src, title, className = '' }: VideoPlayerProps) {
  const { language } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

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

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
      setHasStarted(true)
    }
  }

  const handleVideoClick = () => {
    if (!isPlaying) {
      handlePlay()
    } else {
      // Si la vidéo joue, on peut la mettre en pause
      videoRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setHasStarted(false)
  }

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-2xl font-heading font-bold text-center mb-6 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-auto cursor-pointer"
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={handleVideoClick}
          muted
          playsInline
        />

        {/* Overlay avec bouton play - visible seulement si pas encore démarrée */}
        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={handlePlay}
              className="bg-white/90 hover:bg-white text-gray-900 rounded-full p-6 transition-all duration-300 hover:scale-110 shadow-xl backdrop-blur-sm group"
              aria-label={language === 'fr' ? 'Lire la vidéo' : 'Play video'}
            >
              <Play className="h-12 w-12 ml-1 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        )}

        {/* Indicateur de lecture discret */}
        {hasStarted && (
          <div className="absolute bottom-4 right-4">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
          </div>
        )}

        {/* Message subtil pour indiquer qu'on peut cliquer */}
        {hasStarted && (
          <div className="absolute bottom-4 left-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="text-white/70 text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
              {isPlaying 
                ? (language === 'fr' ? 'Cliquer pour pause' : 'Click to pause')
                : (language === 'fr' ? 'Cliquer pour reprendre' : 'Click to resume')
              }
            </span>
          </div>
        )}
      </div>
    </div>
  )
}