import { useEffect, useState, useCallback, useMemo } from 'react'

interface CounterAnimationProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function CounterAnimation({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  className = ''
}: CounterAnimationProps) {
  const [count, setCount] = useState(0)

  // Memoize the easing function for better performance
  const easeOutQuart = useCallback((progress: number) => {
    return 1 - Math.pow(1 - progress, 4)
  }, [])

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setCount(end)
      return
    }

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Use memoized easing function
      const easedProgress = easeOutQuart(progress)
      const currentCount = Math.floor(easedProgress * end)
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, easeOutQuart])

  const formatNumber = (num: number) => {
    // Utiliser le format français pour les nombres
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.', ',') + ' M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.', ',') + ' k'
    }
    // Formater les nombres avec séparateur d'espace pour les milliers (format français)
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  return (
    <span className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}