import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageProvider'
import { BusinessHoursValidator } from '@/lib/business-hours-validator'
import { useAppointmentValidation, getValidationErrorMessage } from '@/hooks/use-appointment-validation'
import { useAvailability, isTimeSlotAvailable, getAvailableTimesForDate, hasAvailableSlots } from '@/hooks/use-availability'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  selectedDate: Date | null
  selectedTime: string | null
  onDateChange: (date: Date | null) => void
  onTimeChange: (time: string | null) => void
  onValidationChange?: (isValid: boolean, errors: string[]) => void
  className?: string
}

interface BusinessHours {
  days: number[] // 1-5 for Monday-Friday
  startTime: string // "14:00"
  endTime: string // "16:30"
  timezone: string // "Europe/Paris"
}

// Generate time slots with 30-minute intervals
const generateTimeSlots = (startTime: string, endTime: string): string[] => {
  const slots: string[] = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    slots.push(timeString)
    
    currentMinute += 30
    if (currentMinute >= 60) {
      currentMinute = 0
      currentHour += 1
    }
  }
  
  return slots
}

export function DateTimePicker({ 
  selectedDate, 
  selectedTime, 
  onDateChange, 
  onTimeChange, 
  onValidationChange,
  className 
}: DateTimePickerProps) {
  const { t } = useLanguage()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hasError, setHasError] = useState(false)
  
  // Use the new validation hook
  const {
    validateInRealTime,
    clearValidation,
    currentValidation,
    hasErrors,
    hasWarnings
  } = useAppointmentValidation()

  // Use availability checking
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const { availableSlots, loading: availabilityLoading, error: availabilityError } = useAvailability(startOfMonth, endOfMonth);
  // Initialize validator with error handling
  const [validator] = useState(() => {
    try {
      return BusinessHoursValidator.getInstance()
    } catch (error) {
      console.error('Failed to initialize BusinessHoursValidator:', error)
      // Return a fallback validator with default config
      return {
        isValidBusinessDay: () => true,
        isValidBusinessTime: () => true,
        getConfig: () => ({
          timezone: 'Europe/Paris',
          workingDays: [1, 2, 3, 4, 5],
          startTime: '14:00',
          endTime: '16:30',
          slotDuration: 30
        })
      }
    }
  })
  const businessHours = validator.getConfig()

  // Real-time validation when selection changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const validation = validateInRealTime(selectedDate, selectedTime)
      
      // Notify parent component of validation state
      if (onValidationChange) {
        const errorMessages = validation.errors.map(error => getValidationErrorMessage(error, t))
        onValidationChange(validation.isValid, errorMessages)
      }
    }, 300) // 300ms debounce to avoid excessive validation calls

    return () => clearTimeout(timeoutId)
  }, [selectedDate, selectedTime, validateInRealTime, onValidationChange])

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('DateTimePicker error:', error)
      setHasError(true)
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Generate time slots based on business hours configuration
  const allTimeSlots = generateTimeSlots(businessHours.startTime, businessHours.endTime)
  
  // Filter time slots based on availability for the selected date
  const availableTimesForDate = selectedDate ? getAvailableTimesForDate(availableSlots, selectedDate) : []
  const timeSlots = selectedDate ? availableTimesForDate : allTimeSlots

  const handleDateSelect = (date: Date) => {
    onDateChange(date)
    // Validation will be triggered by useEffect
  }

  const handleTimeSelect = (time: string) => {
    onTimeChange(time)
    // Validation will be triggered by useEffect
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1) // Start from Monday
    
    const days: Date[] = []
    const currentDate = new Date(startDate)
    
    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const isDateSelectable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Must be today or future
    if (date < today) return false
    
    // Use business hours validator for consistent validation
    return validator.isValidBusinessDay(date)
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  // Error fallback
  if (hasError) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>Une erreur s'est produite lors du chargement du sélecteur de date.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6 w-full relative z-10', className)} style={{ minHeight: '200px' }}>
      {/* Date Picker */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('contact.form.appointment.selectDate')}
            </h3>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              →
            </Button>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              const selectable = isDateSelectable(date)
              const selected = isDateSelected(date)
              const currentMonthDate = isCurrentMonth(date)
              const hasSlots = hasAvailableSlots(availableSlots, date)
              const isFullyBooked = selectable && currentMonthDate && !hasSlots
              
              return (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => selectable && !isFullyBooked && handleDateSelect(date)}
                  disabled={!selectable || isFullyBooked}
                  whileHover={selectable ? { scale: 1.05 } : {}}
                  whileTap={selectable ? { scale: 0.95 } : {}}
                  className={cn(
                    'h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200',
                    'flex items-center justify-center',
                    {
                      // Current month dates
                      'text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20': 
                        currentMonthDate && selectable && !selected,
                      
                      // Other month dates
                      'text-gray-400 dark:text-gray-600': 
                        !currentMonthDate,
                      
                      // Selected date
                      'bg-orange-500 text-white shadow-lg': 
                        selected,
                      
                      // Disabled dates
                      'text-gray-300 dark:text-gray-700 cursor-not-allowed': 
                        !selectable,
                      
                      // Fully booked dates
                      'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 cursor-not-allowed': 
                        isFullyBooked,
                      
                      // Hover effect for selectable dates
                      'hover:shadow-md': 
                        selectable && !selected
                    }
                  )}
                >
                  {date.getDate()}
                </motion.button>
              )
            })}
          </div>
          
          {/* Business Hours Info with Enhanced Timezone Display */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">{t('contact.form.appointment.businessHours')}</p>
                <p className="mb-1">
                  {t('contact.form.appointment.schedule')} ({businessHours.timezone})
                </p>
                
                {/* Show current time in business timezone */}
                <div className="text-xs mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                  <p className="font-medium mb-1">Heure actuelle:</p>
                  <p>
                    {businessHours.timezone}: {new Date().toLocaleString('fr-FR', {
                      timeZone: businessHours.timezone,
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                  {businessHours.timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone && (
                    <p className="mt-1">
                      Votre heure locale: {new Date().toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
                
                <p className="text-xs mt-2 opacity-75">
                  Sélectionnez d'abord une date, puis choisissez un horaire disponible
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Picker */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('contact.form.appointment.selectTime')}
                  </h3>
                </div>
                
                {availabilityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Vérification des créneaux disponibles...
                    </span>
                  </div>
                ) : availabilityError ? (
                  <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">
                      Erreur lors du chargement des créneaux
                    </span>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-gray-600 dark:text-gray-400">
                    <Info className="h-5 w-5 mr-2" />
                    <span className="text-sm">
                      Aucun créneau disponible pour cette date
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {timeSlots.map(time => {
                    // Validate each time slot in real-time
                    const isTimeValid = validator.isValidBusinessTime(time)
                    const isSlotAvailable = selectedDate ? 
                      validator.isValidBusinessDateTime(selectedDate, time) : false
                    
                    return (
                      <motion.button
                        key={time}
                        type="button"
                        onClick={() => isSlotAvailable && handleTimeSelect(time)}
                        disabled={!isSlotAvailable}
                        whileHover={isSlotAvailable ? { scale: 1.02 } : {}}
                        whileTap={isSlotAvailable ? { scale: 0.98 } : {}}
                        className={cn(
                          'p-3 rounded-lg text-sm font-medium transition-all duration-200',
                          'border border-gray-200 dark:border-gray-700',
                          {
                            // Selected time
                            'bg-orange-500 text-white border-orange-500 shadow-lg': 
                              selectedTime === time && isSlotAvailable,
                            
                            // Available time slots
                            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600': 
                              selectedTime !== time && isSlotAvailable,
                            
                            // Disabled/unavailable time slots
                            'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600': 
                              !isSlotAvailable,
                            
                            // Invalid time format (shouldn't happen but safety check)
                            'bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500 cursor-not-allowed': 
                              !isTimeValid
                          }
                        )}
                        title={
                          !isSlotAvailable 
                            ? 'Créneau non disponible' 
                            : !isTimeValid 
                            ? 'Heure non valide'
                            : `Sélectionner ${time}`
                        }
                      >
                        {time}
                      </motion.button>
                    )
                  })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Messages */}
      <AnimatePresence>
        {(hasErrors || hasWarnings) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {/* Error Messages */}
            {hasErrors && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="space-y-2">
                  {currentValidation.errors.map((error, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                        {getValidationErrorMessage(error, t)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Messages */}
            {hasWarnings && !hasErrors && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="space-y-2">
                  {currentValidation.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                        {warning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {!hasErrors && !hasWarnings && selectedDate && selectedTime && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    Créneau disponible - {selectedDate.toLocaleDateString('fr-FR')} à {selectedTime}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}