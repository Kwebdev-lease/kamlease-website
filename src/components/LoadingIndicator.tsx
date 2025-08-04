/**
 * Loading indicator component with various styles and progress feedback
 * Used for appointment booking process and form submissions
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MessageSquare, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

export interface LoadingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  description?: string
}

export interface LoadingIndicatorProps {
  isVisible: boolean
  type?: 'spinner' | 'progress' | 'steps'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  submissionType?: 'message' | 'appointment'
  steps?: LoadingStep[]
  progress?: number // 0-100 for progress type
  className?: string
}

export function LoadingIndicator({
  isVisible,
  type = 'spinner',
  size = 'md',
  message,
  submissionType = 'message',
  steps = [],
  progress = 0,
  className
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  }

  const getIcon = () => {
    switch (submissionType) {
      case 'appointment':
        return <Calendar className={cn(sizeClasses[size], 'text-orange-500')} />
      case 'message':
        return <MessageSquare className={cn(sizeClasses[size], 'text-orange-500')} />
      default:
        return <Loader2 className={cn(sizeClasses[size], 'text-orange-500')} />
    }
  }

  const getDefaultMessage = () => {
    switch (submissionType) {
      case 'appointment':
        return 'Programmation de votre rendez-vous...'
      case 'message':
        return 'Envoi de votre message...'
      default:
        return 'Traitement en cours...'
    }
  }

  const renderSpinner = () => (
    <div className="flex items-center justify-center space-x-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={cn(
          'border-2 border-orange-200 border-t-orange-500 rounded-full',
          sizeClasses[size]
        )}
      />
      <span className="text-gray-700 dark:text-gray-300 font-medium">
        {message || getDefaultMessage()}
      </span>
    </div>
  )

  const renderProgress = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {message || getDefaultMessage()}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-orange-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )

  const renderSteps = () => (
    <div className="space-y-4">
      {message && (
        <div className="text-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {message}
          </span>
        </div>
      )}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className="flex-shrink-0">
              {step.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {step.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {step.status === 'active' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-orange-200 border-t-orange-500 rounded-full"
                />
              )}
              {step.status === 'pending' && (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                step.status === 'completed' && 'text-green-700 dark:text-green-300',
                step.status === 'error' && 'text-red-700 dark:text-red-300',
                step.status === 'active' && 'text-orange-700 dark:text-orange-300',
                step.status === 'pending' && 'text-gray-500 dark:text-gray-400'
              )}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (type) {
      case 'progress':
        return renderProgress()
      case 'steps':
        return renderSteps()
      default:
        return renderSpinner()
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg',
            containerSizeClasses[size],
            className
          )}
        >
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Preset configurations for common use cases
export const LoadingPresets = {
  appointmentBooking: (isVisible: boolean, currentStep?: string): LoadingIndicatorProps => ({
    isVisible,
    type: 'steps',
    submissionType: 'appointment',
    message: 'Programmation de votre rendez-vous',
    steps: [
      {
        id: 'validate',
        label: 'Validation des données',
        status: currentStep === 'validate' ? 'active' : 
                currentStep && ['auth', 'calendar', 'complete'].includes(currentStep) ? 'completed' : 'pending',
        description: 'Vérification des informations saisies'
      },
      {
        id: 'auth',
        label: 'Authentification Microsoft Graph',
        status: currentStep === 'auth' ? 'active' : 
                currentStep && ['calendar', 'complete'].includes(currentStep) ? 'completed' : 'pending',
        description: 'Connexion sécurisée au service de calendrier'
      },
      {
        id: 'calendar',
        label: 'Création du rendez-vous',
        status: currentStep === 'calendar' ? 'active' : 
                currentStep === 'complete' ? 'completed' : 'pending',
        description: 'Ajout de l\'événement dans votre calendrier Outlook'
      },
      {
        id: 'complete',
        label: 'Finalisation',
        status: currentStep === 'complete' ? 'completed' : 'pending',
        description: 'Préparation de la confirmation'
      }
    ]
  }),

  messageSubmission: (isVisible: boolean, progress?: number): LoadingIndicatorProps => ({
    isVisible,
    type: progress !== undefined ? 'progress' : 'spinner',
    submissionType: 'message',
    message: 'Envoi de votre message',
    progress
  }),

  emailFallback: (isVisible: boolean, currentStep?: string): LoadingIndicatorProps => ({
    isVisible,
    type: 'steps',
    submissionType: 'appointment',
    message: 'Envoi de votre demande par email',
    steps: [
      {
        id: 'validate',
        label: 'Validation des données',
        status: currentStep === 'validate' ? 'active' : 
                currentStep && ['email', 'complete'].includes(currentStep) ? 'completed' : 'pending',
        description: 'Vérification des informations saisies'
      },
      {
        id: 'email',
        label: 'Envoi par email',
        status: currentStep === 'email' ? 'active' : 
                currentStep === 'complete' ? 'completed' : 'pending',
        description: 'Transmission de votre demande de rendez-vous'
      },
      {
        id: 'complete',
        label: 'Confirmation',
        status: currentStep === 'complete' ? 'completed' : 'pending',
        description: 'Demande envoyée avec succès'
      }
    ]
  }),

  simpleSpinner: (isVisible: boolean, message?: string): LoadingIndicatorProps => ({
    isVisible,
    type: 'spinner',
    size: 'md',
    message
  })
}

// Hook for managing loading states
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string>('')
  const [loadingStep, setLoadingStep] = useState<string>('')
  const [loadingProgress, setLoadingProgress] = useState<number>(0)

  const startLoading = (message?: string) => {
    setIsLoading(true)
    setLoadingMessage(message || '')
    setLoadingStep('')
    setLoadingProgress(0)
  }

  const updateStep = (step: string, message?: string) => {
    setLoadingStep(step)
    if (message) setLoadingMessage(message)
  }

  const updateProgress = (progress: number, message?: string) => {
    setLoadingProgress(Math.max(0, Math.min(100, progress)))
    if (message) setLoadingMessage(message)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingMessage('')
    setLoadingStep('')
    setLoadingProgress(0)
  }

  return {
    isLoading,
    loadingMessage,
    loadingStep,
    loadingProgress,
    startLoading,
    updateStep,
    updateProgress,
    stopLoading
  }
}

// Import useState for the hook
import { useState } from 'react'