import { useCallback, useState } from 'react'

export interface ErrorState {
  error: Error | null
  hasError: boolean
  errorId: string | null
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
    errorId: null
  })

  const handleError = useCallback((error: Error, context?: string) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.error(`Error in ${context || 'component'}:`, error)
    
    setErrorState({
      error,
      hasError: true,
      errorId
    })

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Production error:', {
        errorId,
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false,
      errorId: null
    })
  }, [])

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    context?: string
  ) => {
    return (...args: T): R | undefined => {
      try {
        return fn(...args)
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error(String(error)),
          context
        )
        return undefined
      }
    }
  }, [handleError])

  const asyncWithErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args)
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error(String(error)),
          context
        )
        return undefined
      }
    }
  }, [handleError])

  return {
    errorState,
    handleError,
    clearError,
    withErrorHandling,
    asyncWithErrorHandling
  }
}