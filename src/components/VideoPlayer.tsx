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
  const [isVisible, setIsVisible] = useState(false)

  // Observer pour détecter quand la vidéo entre dans le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Auto-play quand la vidéo devient visible
          if (videoRef.current) {
            videoRef.current.play()
            setIsPlaying(true)
          }
        } else {
          setIsVisible(false)
          // Pause quand la vidéo sort du viewport
          if (videoRef.current) {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        }
      },
      { threshold: 0.5 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [])

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

  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  return (
    <div className={`relative group ${className}`}>
      {title && (
        <h3 className="text-2xl font-heading font-bold text-center mb-6 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
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
        
        {/* Overlay avec bouton play/pause */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={togglePlay}
            className="bg-white/90 hover:bg-white text-gray-900 rounded-full p-4 transition-all duration-300 hover:scale-110 shadow-lg"
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
        
        {/* Indicateur de lecture en bas à droite */}
        <div className="absolute bottom-4 right-4">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isPlaying ? 'bg-red-500' : 'bg-gray-400'
          }`}></div>
        </div>
      </div>
    </div>
  )
}