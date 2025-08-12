import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

interface SectionTransitionProps {
  variant?: 'default' | 'hero-to-about' | 'about-to-experience' | 'experience-to-expertise' | 'expertise-to-process' | 'process-to-stats' | 'stats-to-contact'
  className?: string
}

export function SectionTransition({ variant = 'default', className = '' }: SectionTransitionProps) {
  const { prefersReducedMotion } = useAccessibilityPreferences()
  const { ref, isInView } = useScrollAnimation({ threshold: 0.3 })

  // Configuration des couleurs selon la transition
  const getTransitionConfig = (variant: string) => {
    switch (variant) {
      case 'hero-to-about':
        return {
          primaryColor: 'orange-500',
          secondaryColor: 'orange-300',
          bubbleCount: 5,
          direction: 'down'
        }
      case 'about-to-experience':
        return {
          primaryColor: 'blue-500',
          secondaryColor: 'blue-300',
          bubbleCount: 4,
          direction: 'up'
        }
      case 'experience-to-expertise':
        return {
          primaryColor: 'purple-500',
          secondaryColor: 'purple-300',
          bubbleCount: 6,
          direction: 'down'
        }
      case 'expertise-to-process':
        return {
          primaryColor: 'green-500',
          secondaryColor: 'green-300',
          bubbleCount: 5,
          direction: 'up'
        }
      case 'process-to-stats':
        return {
          primaryColor: 'orange-500',
          secondaryColor: 'yellow-300',
          bubbleCount: 7,
          direction: 'down'
        }
      case 'stats-to-contact':
        return {
          primaryColor: 'orange-600',
          secondaryColor: 'orange-400',
          bubbleCount: 4,
          direction: 'up'
        }
      default:
        return {
          primaryColor: 'orange-500',
          secondaryColor: 'orange-300',
          bubbleCount: 5,
          direction: 'down'
        }
    }
  }

  const config = getTransitionConfig(variant)

  return (
    <div ref={ref} className={`relative h-32 overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent dark:via-black/5" />
      
      {/* Morphing liquid glass bubbles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: config.bubbleCount }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{ 
              scale: 0,
              opacity: 0,
              x: (index - config.bubbleCount / 2) * 120,
              y: config.direction === 'down' ? -50 : 50
            }}
            animate={isInView ? {
              scale: [0, 1.2, 0.8, 1, 0],
              opacity: [0, 0.6, 0.8, 0.6, 0],
              x: (index - config.bubbleCount / 2) * 120,
              y: config.direction === 'down' ? [50, 0, -20, 0, 50] : [-50, 0, 20, 0, -50],
              rotate: [0, 180, 360, 540, 720]
            } : {}}
            transition={{
              duration: prefersReducedMotion ? 0.5 : 3,
              delay: prefersReducedMotion ? 0 : index * 0.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            {/* Main bubble with liquid glass effect */}
            <div className="relative">
              {/* Outer glow */}
              <div 
                className="absolute -inset-4 rounded-full blur-xl"
                style={{ backgroundColor: `rgb(249 115 22 / 0.2)` }}
              />
              
              {/* Main bubble */}
              <div className="w-16 h-16 rounded-full relative overflow-hidden
                bg-white/10 dark:bg-white/5 
                backdrop-blur-xl 
                border border-white/30 dark:border-white/15
                shadow-[0_8px_32px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.2)]
                dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.05)]
              ">
                {/* Liquid glass gradient overlay */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: `linear-gradient(to bottom right, rgb(249 115 22 / 0.2), transparent, rgb(253 186 116 / 0.1))` 
                  }}
                />
                
                {/* Refraction effect */}
                <div className="absolute top-2 left-2 w-4 h-4 bg-white/40 rounded-full blur-sm" />
                <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/60 rounded-full" />
                
                {/* Inner morphing shape */}
                <motion.div
                  className="absolute inset-2 rounded-full"
                  style={{ backgroundColor: `rgb(249 115 22 / 0.3)` }}
                  animate={isInView ? {
                    scale: [1, 1.3, 0.7, 1.1, 1],
                    borderRadius: ['50%', '30%', '60%', '40%', '50%']
                  } : {}}
                  transition={{
                    duration: prefersReducedMotion ? 0.5 : 2,
                    delay: index * 0.1,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connecting lines between bubbles */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        <defs>
          <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={`rgb(249 115 22 / 0.3)`} stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {Array.from({ length: config.bubbleCount - 1 }).map((_, index) => (
          <motion.line
            key={index}
            x1={`${((index + 1) / config.bubbleCount) * 100}%`}
            y1="50%"
            x2={`${((index + 2) / config.bubbleCount) * 100}%`}
            y2="50%"
            stroke={`url(#gradient-${variant})`}
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { 
              pathLength: [0, 1, 0], 
              opacity: [0, 0.6, 0] 
            } : {}}
            transition={{
              duration: prefersReducedMotion ? 0.5 : 2,
              delay: index * 0.3,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, index) => (
          <motion.div
            key={`particle-${index}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `rgb(249 115 22 / 0.4)`
            }}
            animate={isInView ? {
              y: [0, -20, 0, 10, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 0.8, 0.4, 0.8, 0],
              scale: [0, 1, 0.5, 1, 0]
            } : {}}
            transition={{
              duration: prefersReducedMotion ? 0.5 : 4,
              delay: index * 0.1,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* CSS for dynamic colors */}
      <style jsx>{`
        @keyframes liquidMorph {
          0%, 100% { border-radius: 50%; }
          25% { border-radius: 30% 70% 60% 40%; }
          50% { border-radius: 60% 40% 30% 70%; }
          75% { border-radius: 40% 60% 70% 30%; }
        }
        
        .liquid-morph {
          animation: liquidMorph 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}