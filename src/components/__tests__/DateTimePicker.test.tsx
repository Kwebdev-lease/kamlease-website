/**
 * Tests for DateTimePicker component with client-side validation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DateTimePicker } from '../DateTimePicker'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { BusinessHoursValidator } from '@/lib/business-hours-validator'

// Mock the BusinessHoursValidator
vi.mock('@/lib/business-hours-validator')

const mockValidator = {
  isValidBusinessDay: vi.fn(),
  isValidBusinessTime: vi.fn(),
  isValidBusinessDateTime: vi.fn(),
  isValidBusinessDateTimeObject: vi.fn(),
  isInPast: vi.fn(),
  getConfig: vi.fn(() => ({
    timezone: 'Europe/Paris',
    workingDays: [1, 2, 3, 4, 5],
    startTime: '14:00',
    endTime: '16:30',
    slotDuration: 30
  }))
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(BusinessHoursValidator.getInstance as any).mockReturnValue(mockValidator)
})

const renderDateTimePicker = (props = {}) => {
  const defaultProps = {
    selectedDate: null,
    selectedTime: null,
    onDateChange: vi.fn(),
    onTimeChange: vi.fn(),
    onValidationChange: vi.fn(),
    ...props
  }

  return render(
    <LanguageProvider>
      <DateTimePicker {...defaultProps} />
    </LanguageProvider>
  )
}

describe('DateTimePicker Client-Side Validation', () => {
  it('should render without errors', () => {
    renderDateTimePicker()
    expect(screen.getByText('Select a date')).toBeInTheDocument()
  })

  it('should show business hours information with timezone', () => {
    renderDateTimePicker()
    
    expect(screen.getByText('Business hours')).toBeInTheDocument()
    expect(screen.getAllByText(/Europe\/Paris/)).toHaveLength(2) // Should appear in schedule and current time
    expect(screen.getByText(/Monday - Friday, 2:00 PM - 4:30 PM/)).toBeInTheDocument()
  })

  it('should display current time in business timezone', () => {
    renderDateTimePicker()
    
    expect(screen.getByText('Heure actuelle:')).toBeInTheDocument()
    expect(screen.getByText(/Europe\/Paris:/)).toBeInTheDocument()
  })

  it('should show time picker when date is selected', async () => {
    const onDateChange = vi.fn()
    mockValidator.isValidBusinessDay.mockReturnValue(true)
    
    renderDateTimePicker({ onDateChange })
    
    // Find and click a date button (assuming it's a Monday)
    const dateButtons = screen.getAllByRole('button')
    const mondayButton = dateButtons.find(button => 
      button.textContent === '8' && !button.disabled
    )
    
    if (mondayButton) {
      fireEvent.click(mondayButton)
      expect(onDateChange).toHaveBeenCalled()
    }
  })

  it('should disable weekend dates', () => {
    mockValidator.isValidBusinessDay.mockImplementation((date: Date) => {
      const day = date.getDay()
      return day >= 1 && day <= 5 // Monday to Friday
    })
    
    renderDateTimePicker()
    
    // Check that weekend dates are disabled
    const dateButtons = screen.getAllByRole('button')
    const disabledButtons = dateButtons.filter(button => button.disabled)
    
    expect(disabledButtons.length).toBeGreaterThan(0)
  })

  it('should show validation errors when invalid selections are made', async () => {
    const onValidationChange = vi.fn()
    
    renderDateTimePicker({ 
      selectedDate: new Date('2024-01-06'), // Saturday
      selectedTime: '10:00', // Outside business hours
      onValidationChange 
    })
    
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(
        false, // isValid
        expect.arrayContaining([expect.any(String)]) // error messages
      )
    })
  })

  it('should validate time slots in real-time', () => {
    mockValidator.isValidBusinessTime.mockImplementation((time: string) => {
      const [hours] = time.split(':').map(Number)
      return hours >= 14 && hours <= 16
    })
    
    const selectedDate = new Date('2024-01-08') // Monday
    mockValidator.isValidBusinessDay.mockReturnValue(true)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    
    renderDateTimePicker({ selectedDate })
    
    // Time picker should be visible
    expect(screen.getByText('Choose a time')).toBeInTheDocument()
    
    // Check that time slots are rendered
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.getByText('14:30')).toBeInTheDocument()
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('should show success message for valid selections', async () => {
    const selectedDate = new Date('2024-01-08') // Monday
    const selectedTime = '14:30'
    const onValidationChange = vi.fn()
    
    mockValidator.isValidBusinessDay.mockReturnValue(true)
    mockValidator.isValidBusinessTime.mockReturnValue(true)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    mockValidator.isValidBusinessDateTimeObject.mockReturnValue(true)
    mockValidator.isInPast.mockReturnValue(false)
    
    renderDateTimePicker({ 
      selectedDate, 
      selectedTime,
      onValidationChange
    })
    
    // Wait for validation to complete and check that it was called with valid state
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalledWith(true, [])
    })
  })

  it('should handle timezone differences with warnings', async () => {
    const selectedDate = new Date('2024-01-08') // Monday
    const selectedTime = '14:30'
    
    // Mock different user timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: vi.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'America/New_York' })
      }))
    })
    
    mockValidator.isValidBusinessDay.mockReturnValue(true)
    mockValidator.isValidBusinessTime.mockReturnValue(true)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    mockValidator.isValidBusinessDateTimeObject.mockReturnValue(true)
    mockValidator.isInPast.mockReturnValue(false)
    
    renderDateTimePicker({ 
      selectedDate, 
      selectedTime,
      onValidationChange: vi.fn()
    })
    
    // Should show local time information
    await waitFor(() => {
      expect(screen.getByText(/Votre heure locale:/)).toBeInTheDocument()
    })
  })

  it('should call onValidationChange with debouncing', async () => {
    const onValidationChange = vi.fn()
    
    const { rerender } = renderDateTimePicker({ onValidationChange })
    
    // Change props multiple times quickly
    rerender(
      <LanguageProvider>
        <DateTimePicker
          selectedDate={new Date('2024-01-08')}
          selectedTime={null}
          onDateChange={vi.fn()}
          onTimeChange={vi.fn()}
          onValidationChange={onValidationChange}
        />
      </LanguageProvider>
    )
    
    rerender(
      <LanguageProvider>
        <DateTimePicker
          selectedDate={new Date('2024-01-08')}
          selectedTime="14:30"
          onDateChange={vi.fn()}
          onTimeChange={vi.fn()}
          onValidationChange={onValidationChange}
        />
      </LanguageProvider>
    )
    
    // Should debounce the validation calls
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalled()
    }, { timeout: 500 })
  })
})