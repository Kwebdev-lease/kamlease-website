/**
 * Tests for LoadingIndicator component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LoadingIndicator, LoadingPresets, useLoadingState } from '../LoadingIndicator'
import { renderHook, act } from '@testing-library/react'

describe('LoadingIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Spinner Type', () => {
    it('should render spinner loading indicator when visible', () => {
      render(
        <LoadingIndicator
          isVisible={true}
          type="spinner"
          message="Loading..."
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should not render when not visible', () => {
      render(
        <LoadingIndicator
          isVisible={false}
          type="spinner"
          message="Loading..."
        />
      )

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('should use default message for appointment type', () => {
      render(
        <LoadingIndicator
          isVisible={true}
          type="spinner"
          submissionType="appointment"
        />
      )

      expect(screen.getByText('Programmation de votre rendez-vous...')).toBeInTheDocument()
    })

    it('should use default message for message type', () => {
      render(
        <LoadingIndicator
          isVisible={true}
          type="spinner"
          submissionType="message"
        />
      )

      expect(screen.getByText('Envoi de votre message...')).toBeInTheDocument()
    })
  })

  describe('Progress Type', () => {
    it('should render progress bar with percentage', () => {
      render(
        <LoadingIndicator
          isVisible={true}
          type="progress"
          progress={75}
          message="Processing..."
        />
      )

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should animate progress bar width', () => {
      const { rerender } = render(
        <LoadingIndicator
          isVisible={true}
          type="progress"
          progress={25}
        />
      )

      expect(screen.getByText('25%')).toBeInTheDocument()

      rerender(
        <LoadingIndicator
          isVisible={true}
          type="progress"
          progress={75}
        />
      )

      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  describe('Steps Type', () => {
    const mockSteps = [
      {
        id: 'step1',
        label: 'Step 1',
        status: 'completed' as const,
        description: 'First step completed'
      },
      {
        id: 'step2',
        label: 'Step 2',
        status: 'active' as const,
        description: 'Second step in progress'
      },
      {
        id: 'step3',
        label: 'Step 3',
        status: 'pending' as const,
        description: 'Third step pending'
      }
    ]

    it('should render all steps with correct status', () => {
      render(
        <LoadingIndicator
          isVisible={true}
          type="steps"
          steps={mockSteps}
          message="Processing steps..."
        />
      )

      expect(screen.getByText('Processing steps...')).toBeInTheDocument()
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
      expect(screen.getByText('First step completed')).toBeInTheDocument()
      expect(screen.getByText('Second step in progress')).toBeInTheDocument()
      expect(screen.getByText('Third step pending')).toBeInTheDocument()
    })

    it('should show error step correctly', () => {
      const errorSteps = [
        {
          id: 'step1',
          label: 'Failed Step',
          status: 'error' as const,
          description: 'This step failed'
        }
      ]

      render(
        <LoadingIndicator
          isVisible={true}
          type="steps"
          steps={errorSteps}
        />
      )

      expect(screen.getByText('Failed Step')).toBeInTheDocument()
      expect(screen.getByText('This step failed')).toBeInTheDocument()
    })
  })

  describe('LoadingPresets', () => {
    it('should create appointment booking preset correctly', () => {
      const preset = LoadingPresets.appointmentBooking(true, 'auth')

      expect(preset.isVisible).toBe(true)
      expect(preset.type).toBe('steps')
      expect(preset.submissionType).toBe('appointment')
      expect(preset.steps).toHaveLength(4)
      expect(preset.steps?.[1].status).toBe('active') // auth step should be active
    })

    it('should create message submission preset correctly', () => {
      const preset = LoadingPresets.messageSubmission(true, 50)

      expect(preset.isVisible).toBe(true)
      expect(preset.type).toBe('progress')
      expect(preset.submissionType).toBe('message')
      expect(preset.progress).toBe(50)
    })

    it('should create simple spinner preset correctly', () => {
      const preset = LoadingPresets.simpleSpinner(true, 'Custom message')

      expect(preset.isVisible).toBe(true)
      expect(preset.type).toBe('spinner')
      expect(preset.message).toBe('Custom message')
    })
  })

  describe('Size Variants', () => {
    it('should apply correct size classes', () => {
      const { container } = render(
        <LoadingIndicator
          isVisible={true}
          type="spinner"
          size="lg"
          message="Large spinner"
        />
      )

      // Check if large size classes are applied (this is a basic check)
      expect(container.firstChild).toHaveClass('p-6')
    })
  })
})

describe('useLoadingState', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useLoadingState())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.loadingMessage).toBe('')
    expect(result.current.loadingStep).toBe('')
    expect(result.current.loadingProgress).toBe(0)
  })

  it('should start loading correctly', () => {
    const { result } = renderHook(() => useLoadingState())

    act(() => {
      result.current.startLoading('Test message')
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.loadingMessage).toBe('Test message')
    expect(result.current.loadingStep).toBe('')
    expect(result.current.loadingProgress).toBe(0)
  })

  it('should update step correctly', () => {
    const { result } = renderHook(() => useLoadingState())

    act(() => {
      result.current.startLoading()
      result.current.updateStep('auth', 'Authenticating...')
    })

    expect(result.current.loadingStep).toBe('auth')
    expect(result.current.loadingMessage).toBe('Authenticating...')
  })

  it('should update progress correctly', () => {
    const { result } = renderHook(() => useLoadingState())

    act(() => {
      result.current.startLoading()
      result.current.updateProgress(75, 'Almost done...')
    })

    expect(result.current.loadingProgress).toBe(75)
    expect(result.current.loadingMessage).toBe('Almost done...')
  })

  it('should clamp progress between 0 and 100', () => {
    const { result } = renderHook(() => useLoadingState())

    act(() => {
      result.current.startLoading()
      result.current.updateProgress(-10)
    })

    expect(result.current.loadingProgress).toBe(0)

    act(() => {
      result.current.updateProgress(150)
    })

    expect(result.current.loadingProgress).toBe(100)
  })

  it('should stop loading and reset state', () => {
    const { result } = renderHook(() => useLoadingState())

    act(() => {
      result.current.startLoading('Test')
      result.current.updateStep('test-step')
      result.current.updateProgress(50)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.stopLoading()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.loadingMessage).toBe('')
    expect(result.current.loadingStep).toBe('')
    expect(result.current.loadingProgress).toBe(0)
  })
})