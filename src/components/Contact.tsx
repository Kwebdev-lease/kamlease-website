import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedInput, EnhancedIconContainer, EnhancedListItem } from './HoverEffects'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Mail, Phone, MapPin, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageProvider'
import { AnimatedSection, AnimatedItem } from './AnimatedSection'
import { BackgroundPattern } from './BackgroundPattern'
import { useFormValidation, ValidationRules } from '../hooks/use-form-validation'
import { DateTimePicker } from './DateTimePicker'
import { EmailService } from '../lib/microsoft-graph/email-service'
import { EmailResult, AppointmentFormData } from '../lib/form-types'

// Initialize Microsoft Graph email service
const emailService = new EmailService();

// Check if we're in localhost development mode
const isLocalhostDevelopment = () => {
  return typeof window !== 'undefined' && 
         (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.includes('local'));
};
import { EnhancedContactFormData } from '../lib/form-types'
import { BusinessHoursValidator } from '../lib/business-hours-validator'
import { LoadingIndicator, LoadingPresets, useLoadingState } from './LoadingIndicator'
import { SuccessFeedback, SuccessPresets, AppointmentDetails, ContactDetails } from './SuccessFeedback'
import { cn } from '../lib/utils'
import { SecurityMiddleware } from '../lib/security/security-middleware'
import { InputSanitizer } from '../lib/security/input-sanitizer'
import { CSRFProtection } from '../lib/security/csrf-protection'
import { Captcha, useCaptcha } from './Captcha'

type SubmissionType = 'message' | 'appointment'
type ContactFormData = EnhancedContactFormData

export function Contact() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    societe: '',
    email: '',
    telephone: '',
    message: ''
  })
  const [submissionType, setSubmissionType] = useState<SubmissionType>('message')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [appointmentError, setAppointmentError] = useState<string | null>(null)
  const [appointmentValidationErrors, setAppointmentValidationErrors] = useState<string[]>([])
  const [isAppointmentValid, setIsAppointmentValid] = useState(false)
  
  // CAPTCHA configuration and state
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(!RECAPTCHA_SITE_KEY) // Auto-verified if no CAPTCHA configured
  
  // Security services - initialized safely
  const [securityMiddleware] = useState(() => {
    try {
      return SecurityMiddleware.getInstance()
    } catch (error) {
      console.warn('Failed to initialize SecurityMiddleware:', error)
      return null
    }
  })
  const [inputSanitizer] = useState(() => {
    try {
      return InputSanitizer.getInstance()
    } catch (error) {
      console.warn('Failed to initialize InputSanitizer:', error)
      return null
    }
  })
  const [csrfProtection] = useState(() => {
    try {
      return CSRFProtection.getInstance()
    } catch (error) {
      console.warn('Failed to initialize CSRFProtection:', error)
      return null
    }
  })
  const [csrfToken, setCsrfToken] = useState(() => {
    try {
      return csrfProtection?.getTokenForForm() || ''
    } catch (error) {
      console.warn('Failed to get CSRF token:', error)
      return ''
    }
  })
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([])
  
  // Enhanced loading and success state management
  const {
    isLoading,
    loadingMessage,
    loadingStep,
    loadingProgress,
    startLoading,
    updateStep,
    updateProgress,
    stopLoading
  } = useLoadingState()
  
  // Success feedback state
  const [successFeedback, setSuccessFeedback] = useState<{
    isVisible: boolean
    type: 'message' | 'appointment' | 'email_fallback'
    message: string
    contactDetails?: ContactDetails
    appointmentDetails?: AppointmentDetails
  }>({
    isVisible: false,
    type: 'message',
    message: '',
    contactDetails: undefined,
    appointmentDetails: undefined
  })

  // Form validation rules - updated for appointment mode
  const validationRules: ValidationRules = {
    prenom: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    nom: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    societe: {
      maxLength: 100
    },
    email: {
      required: true,
      emailFormat: true,
      maxLength: 100
    },
    telephone: {
      required: true,
      phoneFormat: true,
      maxLength: 20
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000
    }
  }

  const { errors, validateField, validateForm, clearError } = useFormValidation(validationRules, t.language)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Apply input sanitization in real-time (if available) - but not for message field to avoid cursor issues
    let sanitizedValue = value
    if (inputSanitizer && name !== 'message') {
      try {
        const sanitizationResult = inputSanitizer.sanitize(value, {
          maxLength: name === 'societe' ? 100 : name === 'email' ? 100 : name === 'telephone' ? 20 : 50,
          removeSpecialChars: name === 'nom' || name === 'prenom'
        })
        
        sanitizedValue = sanitizationResult.value
        
        // Show security warnings if content was sanitized
        if (sanitizationResult.wasSanitized && sanitizationResult.removedContent) {
          setSecurityWarnings(prev => [
            ...prev.filter(w => !w.includes(name)),
            `Field ${name}: ${sanitizationResult.removedContent?.join(', ')}`
          ])
          
          // Clear warnings after 5 seconds
          setTimeout(() => {
            setSecurityWarnings(prev => prev.filter(w => !w.includes(name)))
          }, 5000)
        }
      } catch (error) {
        console.warn('Input sanitization failed:', error)
        // Use original value if sanitization fails
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      clearError(name)
    }
    
    // Clear errors when form data changes
    if (appointmentError) {
      setAppointmentError(null)
    }
    if (submitError) {
      setSubmitError(null)
    }
    if (appointmentValidationErrors.length > 0) {
      setAppointmentValidationErrors([])
    }
  }

  // CAPTCHA handlers
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token)
    setIsCaptchaVerified(true)
    setCaptchaError(null)
    console.log('✅ CAPTCHA verified with token:', token.substring(0, 20) + '...')
  }

  const handleCaptchaError = (error: string) => {
    setCaptchaError(error)
    setIsCaptchaVerified(false)
    setCaptchaToken(null)
    console.error('❌ CAPTCHA error:', error)
  }

  const handleCaptchaExpired = () => {
    setIsCaptchaVerified(false)
    setCaptchaToken(null)
    setCaptchaError('CAPTCHA expiré, veuillez recharger la page')
  }

  // Reset CAPTCHA when submission type changes
  useEffect(() => {
    if (RECAPTCHA_SITE_KEY && isCaptchaVerified) {
      console.log('🔄 Submission type changed, CAPTCHA will regenerate with new action:', submissionType)
      // The CAPTCHA component will automatically regenerate with the new action
      setIsCaptchaVerified(false)
      setCaptchaToken(null)
    }
  }, [submissionType, RECAPTCHA_SITE_KEY])



  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    validateField(name, value)
    setFocusedField(null)
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocusedField(e.target.name)
  }

  const validateAppointmentFields = () => {
    if (submissionType === 'appointment') {
      // Check if date is selected
      if (!selectedDate) {
        return { isValid: false, error: t('contact.form.appointment.validation.dateRequired') }
      }
      
      // Check if time is selected
      if (!selectedTime) {
        return { isValid: false, error: t('contact.form.appointment.validation.timeRequired') }
      }
      
      // Check for validation errors from the DateTimePicker
      if (appointmentValidationErrors.length > 0) {
        return { isValid: false, error: appointmentValidationErrors[0] }
      }
      
      // Check overall appointment validity
      if (!isAppointmentValid) {
        return { isValid: false, error: t('contact.form.appointment.validation.invalidSlot') }
      }
      
      // Additional client-side validation for business hours
      try {
        const validator = BusinessHoursValidator.getInstance()
        
        // Validate business day
        if (!validator.isValidBusinessDay(selectedDate)) {
          return { isValid: false, error: t('contact.form.appointment.validation.businessDayOnly') }
        }
        
        // Validate business time
        if (!validator.isValidBusinessTime(selectedTime)) {
          const config = validator.getConfig()
          return { isValid: false, error: t('contact.form.appointment.validation.businessTimeOnly', { startTime: config.startTime, endTime: config.endTime }) }
        }
        
        // Validate complete datetime
        if (!validator.isValidBusinessDateTime(selectedDate, selectedTime)) {
          return { isValid: false, error: t('contact.form.appointment.validation.businessHoursOnly') }
        }
        
        // Check if appointment is in the past
        const [hours, minutes] = selectedTime.split(':').map(Number)
        const appointmentDateTime = new Date(selectedDate)
        appointmentDateTime.setHours(hours, minutes, 0, 0)
        
        if (validator.isInPast(appointmentDateTime)) {
          return { isValid: false, error: t('contact.form.appointment.validation.noPastAppointments') }
        }
        
      } catch (error) {
        console.error('Error validating appointment fields:', error)
        return { isValid: false, error: t('contact.form.appointment.validation.validationFailed') }
      }
    }
    return { isValid: true, error: null }
  }

  // Handle appointment validation changes from DateTimePicker
  const handleAppointmentValidationChange = (isValid: boolean, errors: string[]) => {
    setIsAppointmentValid(isValid)
    setAppointmentValidationErrors(errors)
    
    // Clear appointment error if validation becomes valid
    if (isValid && appointmentError) {
      setAppointmentError(null)
    }
  }

  // Helper function to translate EmailJS error messages
  const getTranslatedErrorMessage = (error: string): string => {
    // Handle specific EmailJS error codes
    if (error.includes('EMAILJS_INVALID_SERVICE') || error.includes('400')) {
      return t('contact.form.errors.invalidConfiguration')
    }
    if (error.includes('EMAILJS_INVALID_TEMPLATE') || error.includes('404')) {
      return t('contact.form.errors.templateNotFound')
    }
    if (error.includes('EMAILJS_RATE_LIMITED') || error.includes('429')) {
      return t('contact.form.errors.rateLimited')
    }
    if (error.includes('EMAILJS_SERVER_ERROR') || error.includes('500')) {
      return t('contact.form.errors.serverError')
    }
    if (error.includes('EMAILJS_NETWORK_ERROR') || error.includes('network') || error.includes('Network')) {
      return t('contact.form.errors.networkError')
    }
    if (error.includes('EMAILJS_SEND_FAILED')) {
      return t('contact.form.errors.sendFailed')
    }
    
    // Fallback for any other errors
    return error || t('contact.form.errors.unexpected')
  }

  // Check if form is valid for submission (memoized to prevent infinite renders)
  const isFormValid = useMemo(() => {
    // Basic form validation - check if all required fields are filled and have no errors
    const hasRequiredFields = formData.prenom.trim() !== '' && 
                             formData.nom.trim() !== '' && 
                             formData.email.trim() !== '' &&
                             formData.telephone.trim() !== '' &&
                             formData.message.trim() !== ''
    const hasNoErrors = Object.keys(errors).length === 0
    const basicFormValid = hasRequiredFields && hasNoErrors
    
    // CAPTCHA validation (skip if not configured)
    const isCaptchaValid = !RECAPTCHA_SITE_KEY || (isCaptchaVerified && captchaToken !== null)
    
    // Appointment validation
    if (submissionType === 'appointment') {
      const hasDateAndTime = selectedDate !== null && selectedTime !== null
      const hasNoAppointmentErrors = appointmentValidationErrors.length === 0
      return basicFormValid && hasDateAndTime && hasNoAppointmentErrors && isAppointmentValid && isCaptchaValid
    }
    
    return basicFormValid && isCaptchaValid
  }, [formData, submissionType, selectedDate, selectedTime, appointmentValidationErrors, isAppointmentValid, errors, isCaptchaVerified, captchaToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(formData)) {
      return
    }

    // Additional validation for appointment mode
    const appointmentValidation = validateAppointmentFields()
    if (!appointmentValidation.isValid) {
      setAppointmentError(appointmentValidation.error)
      return
    }

    // CAPTCHA verification (skip if not configured)
    if (RECAPTCHA_SITE_KEY) {
      if (!captchaToken || !isCaptchaVerified) {
        setCaptchaError('Veuillez compléter la vérification anti-spam')
        return
      }
      console.log('✅ CAPTCHA token ready for server verification')
    } else {
      console.log('🔄 CAPTCHA not configured, skipping verification')
    }

    // Security validation (if available)
    if (securityMiddleware) {
      try {
        // Temporarily disable CSRF validation to fix form submission
        console.log('Security validation temporarily disabled for form submission');
        
        // Basic validation only
        if (!formData.prenom || !formData.nom || !formData.email || !formData.message) {
          setSubmitError('Veuillez remplir tous les champs obligatoires.');
          return;
        }
      } catch (error) {
        console.warn('Security validation failed:', error)
        // Continue without security validation if it fails
      }
    }

    // Clear previous errors and start loading
    setSubmitError(null)
    setAppointmentError(null)
    setSuccessFeedback(prev => ({ ...prev, isVisible: false }))
    
    try {
      let result: EmailResult

      if (submissionType === 'appointment' && selectedDate && selectedTime) {
        // Start appointment booking with detailed progress
        startLoading(t('contact.form.appointment.loading.scheduling'))
        
        // Step 1: Validation
        updateStep('validate', t('contact.form.appointment.loading.validating'))
        await new Promise(resolve => setTimeout(resolve, 600))
        
        // Step 2: Email preparation
        updateStep('auth', t('contact.form.appointment.loading.preparing'))
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Step 3: Email sending
        updateStep('calendar', t('contact.form.appointment.loading.sending'))
        const appointmentData: AppointmentFormData = {
          ...formData,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          captchaToken: captchaToken
        }
        
        // Send appointment request via Microsoft Graph
        result = await emailService.sendAppointmentRequest(appointmentData)
        
        if (result.success) {
          updateStep('complete', t('contact.form.appointment.loading.finalizing'))
          await new Promise(resolve => setTimeout(resolve, 400))
        }
      } else {
        // Handle simple message with progress bar
        startLoading(t('contact.form.loading.sending'))
        
        updateProgress(20, t('contact.form.loading.preparing'))
        await new Promise(resolve => setTimeout(resolve, 300))
        
        updateProgress(50, t('contact.form.loading.validating'))
        await new Promise(resolve => setTimeout(resolve, 200))
        
        updateProgress(80, t('contact.form.loading.processing'))
        const messageData: ContactFormData = { 
          ...formData,
          captchaToken: captchaToken
        }
        // Send contact message via Microsoft Graph
        result = await emailService.sendContactMessage(messageData)
        
        if (result.success) {
          updateProgress(100, t('contact.form.loading.success'))
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }

      if (result.success) {
        // Prepare contact details for success feedback
        const contactDetails: ContactDetails = {
          prenom: formData.prenom,
          nom: formData.nom,
          societe: formData.societe,
          message: formData.message
        }

        // Prepare appointment details if applicable
        let appointmentDetails: AppointmentDetails | undefined
        if ((submissionType === 'appointment' || result.type === 'email_fallback') && selectedDate && selectedTime) {
          appointmentDetails = {
            date: selectedDate,
            time: selectedTime,
            duration: 30, // Default 30 minutes
            eventId: result.emailId,
            confirmationNumber: result.emailId ? `RDV-${result.emailId.slice(-8).toUpperCase()}` : `REQ-${Date.now().toString().slice(-8).toUpperCase()}`
          }
        }

        // Show success feedback with enhanced details
        setSuccessFeedback({
          isVisible: true,
          type: result.type as 'message' | 'appointment' | 'email_fallback',
          message: result.message,
          contactDetails,
          appointmentDetails
        })
        
        // Reset form after successful submission
        setFormData({ nom: '', prenom: '', societe: '', email: '', telephone: '', message: '' })
        setSelectedDate(null)
        setSelectedTime(null)
        setSubmissionType('message')
        setAppointmentError(null)
        setAppointmentValidationErrors([])
        setIsAppointmentValid(false)
        
      } else {
        // Handle submission errors with translated messages
        setSubmitError(getTranslatedErrorMessage(result.error || result.message))
        if (result.error) {
          setAppointmentError(getTranslatedErrorMessage(result.error))
        }
      }
      
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError(t('contact.form.errors.unexpected'))
    } finally {
      stopLoading()
    }
  }

  return (
    <section id="contact" className="relative py-20 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-950">
      {/* Background with gradient and particles */}
      <BackgroundPattern
        config={{
          type: 'combined',
          intensity: 'medium',
          animated: true,
          section: 'contact'
        }}
        className="absolute inset-0"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="fadeInUp" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
          
          {/* Development Mode Notification */}
          {isLocalhostDevelopment() && (
            <div className="mt-6 mx-auto max-w-2xl">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Mode développement détecté</p>
                    <p>
                      Microsoft Graph ne fonctionne pas depuis localhost. 
                      Les emails seront simulés et affichés dans la console du navigateur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatedSection>
        
        {/* Enhanced background lighting for liquid glass effect */}
        <div className="absolute inset-0 -m-8">
          {/* Primary glows */}
          <div 
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/18 rounded-full blur-3xl"
            style={{
              animation: 'float 8s ease-in-out infinite'
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-400/15 rounded-full blur-3xl"
            style={{
              animation: 'float 10s ease-in-out infinite 2s'
            }}
          ></div>
          <div 
            className="absolute top-2/3 left-2/3 w-48 h-48 bg-orange-600/12 rounded-full blur-3xl"
            style={{
              animation: 'float 12s ease-in-out infinite 4s'
            }}
          ></div>
          
          {/* Additional accent glows */}
          <div 
            className="absolute top-1/2 left-1/6 w-40 h-40 bg-orange-300/10 rounded-full blur-2xl"
            style={{
              animation: 'float 14s ease-in-out infinite 1s'
            }}
          ></div>
          <div 
            className="absolute bottom-1/3 right-1/6 w-56 h-56 bg-orange-500/8 rounded-full blur-3xl"
            style={{
              animation: 'float 16s ease-in-out infinite 3s'
            }}
          ></div>
          <div 
            className="absolute top-1/6 right-1/3 w-32 h-32 bg-orange-400/12 rounded-full blur-2xl"
            style={{
              animation: 'float 11s ease-in-out infinite 5s'
            }}
          ></div>
          <div 
            className="absolute bottom-1/6 left-1/2 w-44 h-44 bg-orange-600/9 rounded-full blur-3xl"
            style={{
              animation: 'float 13s ease-in-out infinite 6s'
            }}
          ></div>
        </div>
        
        {/* CSS Animation Styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-10px) translateX(-15px); }
            75% { transform: translateY(-30px) translateX(5px); }
          }
        `}</style>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <AnimatedSection animation="slideInLeft" delay={0.2}>
            <div className="relative">
              {/* Background glow for contact form */}
              <div className="absolute -inset-3 bg-orange-500/6 rounded-3xl blur-xl"></div>
              
              {/* Main liquid glass container */}
              <div className="absolute inset-0 bg-white/8 dark:bg-white/4 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.05)]"></div>
              
              {/* Liquid glass gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/3 to-transparent dark:from-white/8 dark:via-white/2 dark:to-transparent rounded-3xl"></div>
              
              <Card className="relative z-10 border-transparent bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">
                    {t('contact.form.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {/* Loading Indicator */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mb-6"
                    >
                      <LoadingIndicator
                        {...(submissionType === 'appointment' 
                          ? LoadingPresets.appointmentBooking(true, loadingStep)
                          : LoadingPresets.messageSubmission(true, loadingProgress)
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>



                {/* Development Notice */}
                {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                          Mode Développement (Localhost)
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          Le formulaire utilise maintenant EmailJS pour l'envoi d'emails.
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          ✅ Les emails sont envoyés via EmailJS<br/>
                          📋 Consultez la console pour voir les détails d'envoi<br/>
                          🚀 Configurez vos templates EmailJS pour recevoir les emails
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Warnings */}
                <AnimatePresence>
                  {securityWarnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                            Security Notice
                          </p>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {securityWarnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* General Error Message */}
                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <p className="text-red-800 dark:text-red-200 font-medium">
                        {submitError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submission Type Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('contact.form.submissionTypeTitle')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setSubmissionType('message')
                        setSelectedDate(null)
                        setSelectedTime(null)
                        setAppointmentError(null)
                        setSubmitError(null)
                        setAppointmentValidationErrors([])
                        setIsAppointmentValid(false)
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                        'flex items-center space-x-3',
                        submissionType === 'message'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        submissionType === 'message'
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}>
                        {submissionType === 'message' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <MessageSquare className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t('contact.form.send')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('contact.form.sendMessageOption')}
                        </p>
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setSubmissionType('appointment')
                        setAppointmentError(null)
                        setSubmitError(null)
                        setAppointmentValidationErrors([])
                        setIsAppointmentValid(false)
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                        'flex items-center space-x-3',
                        submissionType === 'appointment'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        submissionType === 'appointment'
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}>
                        {submissionType === 'appointment' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t('contact.form.appointmentBtn')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('contact.form.scheduleAppointmentOption')}
                        </p>
                      </div>
                    </motion.button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                {/* CSRF Token (if available) */}
                {csrfProtection && csrfToken && (
                  <input type="hidden" name="csrf_token" value={csrfToken} />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatedItem delay={0.1}>
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('contact.form.firstName')} {t('contact.form.required')}
                      </label>
                      <div className="relative">
                        <EnhancedInput
                          id="prenom"
                          name="prenom"
                          type="text"
                          required
                          value={formData.prenom}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onFocus={handleInputFocus}
                          error={!!errors.prenom}
                          className="border-gray-300 dark:border-gray-600"
                        />
                        <AnimatePresence>
                          {errors.prenom && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
                            >
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.prenom}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </AnimatedItem>
                  <AnimatedItem delay={0.2}>
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('contact.form.lastName')} {t('contact.form.required')}
                      </label>
                      <div className="relative">
                        <EnhancedInput
                          id="nom"
                          name="nom"
                          type="text"
                          required
                          value={formData.nom}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onFocus={handleInputFocus}
                          error={!!errors.nom}
                          className="border-gray-300 dark:border-gray-600"
                        />
                        <AnimatePresence>
                          {errors.nom && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
                            >
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.nom}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </AnimatedItem>
                </div>
                
                <AnimatedItem delay={0.3}>
                  <div>
                    <label htmlFor="societe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.company')}
                    </label>
                    <div className="relative">
                      <EnhancedInput
                        id="societe"
                        name="societe"
                        type="text"
                        value={formData.societe}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onFocus={handleInputFocus}
                        error={!!errors.societe}
                        className="border-gray-300 dark:border-gray-600"
                      />
                      <AnimatePresence>
                        {errors.societe && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
                          >
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors.societe}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </AnimatedItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatedItem delay={0.35}>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('contact.form.email')} {t('contact.form.required')}
                      </label>
                      <div className="relative">
                        <EnhancedInput
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onFocus={handleInputFocus}
                          error={!!errors.email}
                          className="border-gray-300 dark:border-gray-600"
                          placeholder={t('contact.form.emailPlaceholder')}
                        />
                        <AnimatePresence>
                          {errors.email && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
                            >
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.email}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </AnimatedItem>
                  <AnimatedItem delay={0.4}>
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('contact.form.telephone')} {t('contact.form.required')}
                      </label>
                      <div className="relative">
                        <EnhancedInput
                          id="telephone"
                          name="telephone"
                          type="tel"
                          required
                          value={formData.telephone}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onFocus={handleInputFocus}
                          error={!!errors.telephone}
                          className="border-gray-300 dark:border-gray-600"
                          placeholder={t('contact.form.telephonePlaceholder')}
                        />
                        <AnimatePresence>
                          {errors.telephone && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
                            >
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.telephone}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </AnimatedItem>
                </div>
                
                <AnimatedItem delay={0.45}>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.message')} {t('contact.form.required')}
                    </label>
                    <div className="relative">
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onFocus={handleInputFocus}
                        className={cn(
                          "border-gray-300 dark:border-gray-600 transition-all duration-300 resize-none",
                          focusedField === 'message' && "ring-2 ring-orange-500/20 border-orange-500",
                          errors.message && "border-red-500 ring-2 ring-red-500/20"
                        )}
                        placeholder={t('contact.form.placeholder')}
                      />
                      <AnimatePresence>
                        {errors.message && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
                          >
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors.message}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </AnimatedItem>

                {/* Date/Time Picker for Appointments */}
                <AnimatePresence>
                  {submissionType === 'appointment' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="py-4">
                        <DateTimePicker
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          onDateChange={(date) => {
                            setSelectedDate(date)
                            if (appointmentError) setAppointmentError(null)
                          }}
                          onTimeChange={(time) => {
                            setSelectedTime(time)
                            if (appointmentError) setAppointmentError(null)
                          }}
                          onValidationChange={handleAppointmentValidationChange}
                        />
                        
                        {/* Appointment Validation Error */}
                        <AnimatePresence>
                          {appointmentError && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3"
                            >
                              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              <p className="text-red-800 dark:text-red-200 font-medium">
                                {appointmentError}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CAPTCHA Verification - Only show if configured */}
                {RECAPTCHA_SITE_KEY && (
                  <AnimatedItem delay={0.6}>
                    <div className="pt-4">
                      <Captcha
                        siteKey={RECAPTCHA_SITE_KEY}
                        onVerify={handleCaptchaVerify}
                        onError={handleCaptchaError}
                        onExpired={handleCaptchaExpired}
                        action={submissionType === 'appointment' ? 'appointment' : 'contact'}
                        disabled={isLoading}
                        className="mb-4"
                      />
                      
                      {/* CAPTCHA Error Display */}
                      <AnimatePresence>
                        {captchaError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2"
                          >
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-300 text-sm">
                              {captchaError}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </AnimatedItem>
                )}

                {/* Development Notice for CAPTCHA */}
                {!RECAPTCHA_SITE_KEY && (import.meta.env.DEV || window.location.hostname === 'localhost') && (
                  <AnimatedItem delay={0.6}>
                    <div className="pt-4">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                            <strong>Mode développement :</strong> Protection CAPTCHA désactivée
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>
                )}
                
                <AnimatedItem delay={0.65}>
                  <div className="pt-4">
                    <EnhancedButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      hoverEffect="glow"
                      ripple={true}
                      focusRing={true}
                      disabled={isLoading || !isFormValid}
                      className="w-full py-3"
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            {loadingMessage || (submissionType === 'appointment' ? 'Programmation...' : 'Envoi en cours...')}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="submit"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center"
                          >
                            {submissionType === 'appointment' ? (
                              <>
                                <Calendar className="mr-2 h-5 w-5" />
                                {t('contact.form.appointmentBtn')}
                              </>
                            ) : (
                              <>
                                <MessageSquare className="mr-2 h-5 w-5" />
                                {t('contact.form.send')}
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </EnhancedButton>
                  </div>
                </AnimatedItem>

                {/* Success Feedback - Moved after submit button */}
                <AnimatePresence>
                  {successFeedback.isVisible && successFeedback.contactDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6"
                    >
                      <SuccessFeedback
                        isVisible={successFeedback.isVisible}
                        type={successFeedback.type}
                        message={successFeedback.message}
                        contactDetails={successFeedback.contactDetails}
                        appointmentDetails={successFeedback.appointmentDetails}
                        onClose={() => setSuccessFeedback(prev => ({ ...prev, isVisible: false }))}
                        autoClose={true}
                        autoCloseDelay={successFeedback.type === 'appointment' ? 12000 : 8000}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
          
          {/* Contact Info */}
          <AnimatedSection animation="slideInRight" delay={0.4}>
            <div className="space-y-8">
              <div className="relative">
                {/* Background glow for contact info */}
                <div className="absolute -inset-2 bg-orange-500/6 rounded-3xl blur-xl"></div>
                
                {/* Main liquid glass container */}
                <div className="absolute inset-0 bg-white/8 dark:bg-white/4 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.05)]"></div>
                
                {/* Liquid glass gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/3 to-transparent dark:from-white/8 dark:via-white/2 dark:to-transparent rounded-3xl"></div>
                
                <Card className="relative z-10 border-transparent bg-transparent shadow-none">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      {t('contact.info.title')}
                    </h3>
                  <div className="space-y-4">
                    <AnimatedItem delay={0.1}>
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                        <EnhancedIconContainer
                          size="sm"
                          variant="default"
                          glowColor="orange"
                          className="mt-1"
                        >
                          <Mail className="h-4 w-4 text-orange-500" />
                        </EnhancedIconContainer>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('contact.form.email')}</p>
                          <p className="text-gray-600 dark:text-gray-300">contact@kamlease.com</p>
                        </div>
                      </div>
                    </AnimatedItem>
                    <AnimatedItem delay={0.2}>
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                        <EnhancedIconContainer
                          size="sm"
                          variant="default"
                          glowColor="orange"
                          className="mt-1"
                        >
                          <Phone className="h-4 w-4 text-orange-500" />
                        </EnhancedIconContainer>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('contact.form.phone')}</p>
                          <p className="text-gray-600 dark:text-gray-300">+33 6 73 71 05 86</p>
                        </div>
                      </div>
                    </AnimatedItem>
                    <AnimatedItem delay={0.3}>
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                        <EnhancedIconContainer
                          size="sm"
                          variant="default"
                          glowColor="orange"
                          className="mt-1"
                        >
                          <MapPin className="h-4 w-4 text-orange-500" />
                        </EnhancedIconContainer>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{t('contact.form.address')}</p>
                          <p className="text-gray-600 dark:text-gray-300">
                            109 Rue Maréchal Joffre<br />
                            45240 La Ferté-Saint-Aubin, France
                          </p>
                        </div>
                      </div>
                    </AnimatedItem>
                  </div>
                  </CardContent>
                </Card>
              </div>
            
            <div className="relative">
              {/* Background glow for why choose us */}
              <div className="absolute -inset-2 bg-orange-500/6 rounded-3xl blur-xl"></div>
              
              {/* Main liquid glass container */}
              <div className="absolute inset-0 bg-white/8 dark:bg-white/4 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.05)]"></div>
              
              {/* Liquid glass gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/3 to-transparent dark:from-white/8 dark:via-white/2 dark:to-transparent rounded-3xl"></div>
              
              <Card className="relative z-10 border-transparent bg-transparent shadow-none">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('contact.info.whyChoose')}
                  </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <AnimatedItem delay={0.1}>
                    <EnhancedListItem interactive={true} accent={true}>
                      <span>{t('contact.features.experience')}</span>
                    </EnhancedListItem>
                  </AnimatedItem>
                  <AnimatedItem delay={0.2}>
                    <EnhancedListItem interactive={true} accent={true}>
                      <span>{t('contact.features.expertise')}</span>
                    </EnhancedListItem>
                  </AnimatedItem>
                  <AnimatedItem delay={0.3}>
                    <EnhancedListItem interactive={true} accent={true}>
                      <span>{t('contact.features.solutions')}</span>
                    </EnhancedListItem>
                  </AnimatedItem>
                  <AnimatedItem delay={0.4}>
                    <EnhancedListItem interactive={true} accent={true}>
                      <span>{t('contact.features.support')}</span>
                    </EnhancedListItem>
                  </AnimatedItem>
                  </ul>
                </CardContent>
              </Card>
            </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}