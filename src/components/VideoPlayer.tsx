import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
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
  const [showControls, setShowControls] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [progress, setProgress] = useState(0)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>()

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

  // Gestion de l'auto-hide des contrôles
  useEffect(() => {
    if (isPlaying && !isHovered) {
      // Masquer les contrôles après 3 secondes si la vidéo joue
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    } else {
      // Annuler le timer si on hover ou si la vidéo est en pause
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
      setShowControls(true)
    }

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [isPlaying, isHovered])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleVideoClick = () => {
    togglePlay()
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowControls(true)
    setProgress(0)
  }

  const updateProgress = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const duration = videoRef.current.duration
      setProgress(duration > 0 ? (currentTime / duration) * 100 : 0)
    }
  }

  // Mettre à jour la progression
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('timeupdate', updateProgress)
      return () => video.removeEventListener('timeupdate', updateProgress)
    }
  }, [])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleMouseMove = () => {
    if (isPlaying) {
      setShowControls(true)
      // Redémarrer le timer d'auto-hide
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
      hideControlsTimeoutRef.current = setTimeout(() => {
        if (!isHovered) {
          setShowControls(false)
        }
      }, 3000)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-2xl font-heading font-bold text-center mb-6 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-black cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-auto"
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted
          playsInline
        />

        {/* Overlay avec contrôles qui disparaissent */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          showControls || !isPlaying 
            ? 'bg-black/20 opacity-100' 
            : 'bg-transparent opacity-0 pointer-events-none'
        }`}>
          {/* Bouton play/pause central */}
          <div className={`transition-all duration-300 ${
            showControls || !isPlaying 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-75'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="bg-white/90 hover:bg-white text-gray-900 rounded-full p-4 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
              aria-label={isPlaying ?
                (language === 'fr' ? 'Mettre en pause' : 'Pause') :
                (language === 'fr' ? 'Lire la vidéo' : 'Play video')
              }
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Indicateur de lecture discret */}
        <div className={`absolute bottom-4 right-4 transition-opacity duration-300 ${
          isPlaying && !showControls ? 'opacity-60' : 'opacity-100'
        }`}>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
        </div>

        {/* Barre de progression subtile */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-black/20 transition-opacity duration-300 ${
          showControls && isPlaying ? 'opacity-100' : 'opacity-0'
        }`}>
          <div 
            className="h-full bg-orange-500/80 transition-all duration-100" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}