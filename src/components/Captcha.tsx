/**
 * Google reCAPTCHA v3 component for spam protection
 * Provides invisible CAPTCHA verification for forms
 */

import { useEffect, useRef, useState } from 'react'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window {
    grecaptcha: any
    onRecaptchaLoad: () => void
  }
}

export interface CaptchaProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: (error: string) => void
  onExpired?: () => void
  action?: string
  className?: string
  disabled?: boolean
}

export interface CaptchaRef {
  execute: () => Promise<string | null>
  reset: () => void
  getResponse: () => string | null
}

export function Captcha({
  siteKey,
  onVerify,
  onError,
  onExpired,
  action = 'submit',
  className = '',
  disabled = false
}: CaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load reCAPTCHA script
  useEffect(() => {
    // Skip if no site key or already loaded
    if (!siteKey || window.grecaptcha) {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true)
        })
      }
      return
    }

    // Create script element for reCAPTCHA v3
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          console.log('✅ reCAPTCHA v3 loaded successfully')
          setIsLoaded(true)
        })
      }
    }

    script.onerror = () => {
      console.error('❌ Failed to load reCAPTCHA script')
      setError('Impossible de charger la protection anti-spam')
      onError?.('Failed to load reCAPTCHA')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [siteKey, onError])

  // Execute reCAPTCHA verification
  const executeRecaptcha = async (): Promise<string | null> => {
    if (!isLoaded || !window.grecaptcha || disabled || !siteKey) {
      console.warn('⚠️ reCAPTCHA not ready:', { isLoaded, hasGrecaptcha: !!window.grecaptcha, disabled, siteKey: !!siteKey })
      return null
    }

    setIsVerifying(true)
    setError(null)

    try {
      console.log('🔍 Executing reCAPTCHA with action:', action)
      
      // Execute reCAPTCHA v3
      const token = await window.grecaptcha.execute(siteKey, { action })
      
      if (token && token.length > 0) {
        console.log('✅ reCAPTCHA token received:', token.substring(0, 20) + '...')
        setIsVerified(true)
        onVerify(token)
        return token
      } else {
        throw new Error('Token vide reçu de reCAPTCHA')
      }
    } catch (err) {
      console.error('❌ reCAPTCHA execution failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Échec de la vérification anti-spam'
      setError(errorMessage)
      onError?.(errorMessage)
      return null
    } finally {
      setIsVerifying(false)
    }
  }

  // Reset verification state
  const reset = () => {
    setIsVerified(false)
    setError(null)
    setIsVerifying(false)
  }

  // Auto-execute on load if enabled, and re-execute when action changes
  useEffect(() => {
    if (isLoaded && !disabled && siteKey) {
      // Reset state when action changes
      setIsVerified(false)
      setError(null)
      
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        console.log('🔄 Generating new CAPTCHA token for action:', action)
        executeRecaptcha()
      }, 1000) // Increased delay for better reliability
      return () => clearTimeout(timer)
    } else if (!siteKey) {
      // Fallback mode - simulate verification for development
      console.warn('⚠️ No reCAPTCHA site key provided, using fallback mode')
      setError('Mode développement - CAPTCHA simulé')
      setIsVerified(true)
      onVerify('dev-mode-token-' + Date.now())
    }
  }, [isLoaded, disabled, siteKey, action]) // Added action as dependency

  const getStatusIcon = () => {
    if (isVerifying) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-4 h-4 text-blue-500" />
        </motion.div>
      )
    }
    
    if (error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    
    if (isVerified) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    
    return <Shield className="w-4 h-4 text-gray-400" />
  }

  const getStatusText = () => {
    if (isVerifying) return 'Vérification en cours...'
    if (error) return 'Erreur de vérification'
    if (isVerified) return 'Vérifié par reCAPTCHA'
    if (!isLoaded) return 'Chargement de la protection...'
    return 'Protection anti-spam active'
  }

  const getStatusColor = () => {
    if (isVerifying) return 'text-blue-600 dark:text-blue-400'
    if (error) return 'text-red-600 dark:text-red-400'
    if (isVerified) return 'text-green-600 dark:text-green-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className={`${className}`} ref={containerRef}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {isVerified && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Score de confiance élevé
              </p>
            )}
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Manual verification button if needed */}
        {(error || !isVerified) && isLoaded && (
          <motion.button
            type="button"
            onClick={executeRecaptcha}
            disabled={isVerifying || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Vérification...' : 'Vérifier'}
          </motion.button>
        )}
      </motion.div>

      {/* reCAPTCHA branding (required by Google) */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Ce site est protégé par reCAPTCHA et les{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Règles de confidentialité
        </a>{' '}
        et{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Conditions d'utilisation
        </a>{' '}
        de Google s'appliquent.
      </div>
    </div>
  )
}

// Hook for easier CAPTCHA integration
export function useCaptcha(siteKey: string, action: string = 'submit') {
  const [token, setToken] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const verify = async (): Promise<string | null> => {
    if (!window.grecaptcha || !siteKey) {
      setError('reCAPTCHA not available')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const newToken = await window.grecaptcha.execute(siteKey, { action })
      setToken(newToken)
      setIsVerified(true)
      return newToken
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setToken(null)
    setIsVerified(false)
    setError(null)
    setIsLoading(false)
  }

  return {
    token,
    isVerified,
    error,
    isLoading,
    verify,
    reset
  }
}

export default Captcha