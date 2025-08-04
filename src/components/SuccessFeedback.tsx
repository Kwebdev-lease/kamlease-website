/**
 * Success feedback component for appointment booking and message submissions
 * Provides detailed confirmation with appointment details and next steps
 */

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Calendar, Mail, Clock, MapPin, User, Building, MessageSquare, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface AppointmentDetails {
  date: Date
  time: string
  duration: number // in minutes
  eventId?: string
  confirmationNumber?: string
}

export interface ContactDetails {
  prenom: string
  nom: string
  societe?: string
  message: string
}

export interface SuccessFeedbackProps {
  isVisible: boolean
  type: 'message' | 'appointment' | 'email_fallback'
  message: string
  contactDetails: ContactDetails
  appointmentDetails?: AppointmentDetails
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number // in milliseconds
  className?: string
}

export function SuccessFeedback({
  isVisible,
  type,
  message,
  contactDetails,
  appointmentDetails,
  onClose,
  autoClose = true,
  autoCloseDelay = 8000,
  className
}: SuccessFeedbackProps) {
  // Auto close functionality
  React.useEffect(() => {
    if (isVisible && autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose])

  const getIcon = () => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-6 h-6 text-green-500" />
      case 'email_fallback':
        return <Mail className="w-6 h-6 text-blue-500" />
      default:
        return <MessageSquare className="w-6 h-6 text-green-500" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'appointment':
        return 'Rendez-vous confirmé !'
      case 'email_fallback':
        return 'Demande envoyée par email'
      default:
        return 'Message envoyé avec succès !'
    }
  }

  const formatAppointmentDate = (date: Date, time: string) => {
    const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr })
    return `${formattedDate} à ${time}`
  }

  const getEndTime = (time: string, duration: number) => {
    const [hours, minutes] = time.split(':').map(Number)
    const endDate = new Date()
    endDate.setHours(hours, minutes + duration, 0, 0)
    return endDate.toTimeString().slice(0, 5)
  }

  const renderAppointmentDetails = () => {
    if (type !== 'appointment' || !appointmentDetails) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
      >
        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Détails du rendez-vous
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start text-green-700 dark:text-green-300">
            <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">
                {formatAppointmentDate(appointmentDetails.date, appointmentDetails.time)}
              </div>
              {appointmentDetails.duration && (
                <div className="text-green-600 dark:text-green-400 text-xs mt-1">
                  Durée: {appointmentDetails.duration} minutes (jusqu'à {getEndTime(appointmentDetails.time, appointmentDetails.duration)})
                </div>
              )}
            </div>
          </div>
          <div className="flex items-start text-green-700 dark:text-green-300">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Kamlease - Bureau principal</div>
              <div className="text-green-600 dark:text-green-400 text-xs mt-1">
                123 Rue de l'Innovation, 75001 Paris
              </div>
            </div>
          </div>
          {appointmentDetails.confirmationNumber && (
            <div className="flex items-center text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <span className="font-medium">Référence: </span>
                <span className="font-mono text-green-600 dark:text-green-400">
                  {appointmentDetails.confirmationNumber}
                </span>
              </div>
            </div>
          )}
          {appointmentDetails.eventId && (
            <div className="flex items-center text-green-700 dark:text-green-300">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-medium">Événement ajouté à votre calendrier Outlook</span>
                <div className="text-green-600 dark:text-green-400 mt-1">
                  ID: {appointmentDetails.eventId.slice(0, 8)}...
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const renderContactSummary = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
        <User className="w-4 h-4 mr-2" />
        Vos informations
      </h4>
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <span className="font-medium">Nom:</span> {contactDetails.prenom} {contactDetails.nom}
        </div>
        {contactDetails.societe && (
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 flex-shrink-0" />
            <span><span className="font-medium">Société:</span> {contactDetails.societe}</span>
          </div>
        )}
        <div>
          <span className="font-medium">Message:</span>
          <p className="mt-1 text-gray-600 dark:text-gray-400 italic">
            "{contactDetails.message.length > 100 
              ? contactDetails.message.substring(0, 100) + '...' 
              : contactDetails.message}"
          </p>
        </div>
      </div>
    </motion.div>
  )

  const renderNextSteps = () => {
    const steps = []

    if (type === 'appointment') {
      steps.push(
        {
          text: 'Un email de confirmation a été envoyé avec tous les détails',
          icon: <Mail className="w-4 h-4 text-blue-500" />
        },
        {
          text: 'L\'événement a été ajouté à votre calendrier Outlook',
          icon: <Calendar className="w-4 h-4 text-green-500" />
        },
        {
          text: 'Un rappel automatique vous sera envoyé 24h avant',
          icon: <Clock className="w-4 h-4 text-orange-500" />
        },
        {
          text: 'Pour modifier ou annuler: +33 1 23 45 67 89',
          icon: <CheckCircle className="w-4 h-4 text-gray-500" />
        }
      )
    } else if (type === 'email_fallback') {
      steps.push(
        {
          text: 'Votre demande de rendez-vous a été envoyée par email',
          icon: <Mail className="w-4 h-4 text-blue-500" />
        },
        {
          text: 'Notre équipe vous contactera sous 2-4 heures ouvrées',
          icon: <Clock className="w-4 h-4 text-orange-500" />
        },
        {
          text: 'Nous confirmerons le créneau et ajouterons l\'événement',
          icon: <Calendar className="w-4 h-4 text-green-500" />
        },
        {
          text: 'Contact direct: +33 1 23 45 67 89',
          icon: <CheckCircle className="w-4 h-4 text-gray-500" />
        }
      )
    } else {
      steps.push(
        {
          text: 'Votre message a été reçu et traité',
          icon: <CheckCircle className="w-4 h-4 text-green-500" />
        },
        {
          text: 'Notre équipe vous répondra sous 24-48 heures',
          icon: <Clock className="w-4 h-4 text-orange-500" />
        },
        {
          text: 'Vous recevrez une réponse personnalisée par email',
          icon: <Mail className="w-4 h-4 text-blue-500" />
        }
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4"
      >
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Prochaines étapes
        </h4>
        <ul className="space-y-3">
          {steps.map((step, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="mr-3 mt-0.5 flex-shrink-0">
                {step.icon}
              </div>
              <span>{step.text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            'relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6',
            className
          )}
        >
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mr-3"
            >
              {getIcon()}
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getTitle()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {message}
              </p>
            </div>
          </motion.div>

          {/* Appointment details */}
          {renderAppointmentDetails()}

          {/* Contact summary */}
          {renderContactSummary()}

          {/* Next steps */}
          {renderNextSteps()}

          {/* Auto-close progress bar */}
          {autoClose && autoCloseDelay > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6"
            >
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <motion.div
                  className="bg-orange-500 h-1 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Cette notification se fermera automatiquement dans {Math.ceil(autoCloseDelay / 1000)} secondes
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Preset configurations for common success scenarios
export const SuccessPresets = {
  appointmentSuccess: (
    contactDetails: ContactDetails,
    appointmentDetails: AppointmentDetails,
    onClose?: () => void
  ): SuccessFeedbackProps => ({
    isVisible: true,
    type: 'appointment',
    message: 'Votre rendez-vous a été programmé avec succès. Vous recevrez une confirmation par email.',
    contactDetails,
    appointmentDetails,
    onClose,
    autoClose: true,
    autoCloseDelay: 10000
  }),

  messageSuccess: (
    contactDetails: ContactDetails,
    onClose?: () => void
  ): SuccessFeedbackProps => ({
    isVisible: true,
    type: 'message',
    message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    contactDetails,
    onClose,
    autoClose: true,
    autoCloseDelay: 6000
  }),

  emailFallbackSuccess: (
    contactDetails: ContactDetails,
    appointmentDetails: AppointmentDetails,
    onClose?: () => void
  ): SuccessFeedbackProps => ({
    isVisible: true,
    type: 'email_fallback',
    message: 'Votre demande de rendez-vous a été envoyée par email. Nous vous contacterons pour confirmer le créneau.',
    contactDetails,
    appointmentDetails,
    onClose,
    autoClose: true,
    autoCloseDelay: 8000
  })
}

// Import React for useEffect
import React from 'react'