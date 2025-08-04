import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  prevResetKeys: Array<string | number>
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      prevResetKeys: props.resetKeys || []
    }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    const { resetKeys = [] } = props
    const { prevResetKeys } = state
    
    // Reset error state if resetKeys have changed
    if (resetKeys.length > 0 && 
        (resetKeys.length !== prevResetKeys.length || 
         resetKeys.some((key, idx) => key !== prevResetKeys[idx]))) {
      return {
        hasError: false,
        error: null,
        errorInfo: null,
        prevResetKeys: resetKeys
      }
    }
    
    return null
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // This would typically send to a service like Sentry
      console.error('Production error caught by ErrorBoundary:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              An error occurred while rendering this component.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 text-xs text-red-800 dark:text-red-200 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different use cases

export function ThemeErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <p className="text-gray-600 dark:text-gray-400">
            Theme system unavailable. Using default styling.
          </p>
        </div>
      }
      onError={(error) => {
        console.error('Theme system error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function LanguageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-yellow-800 dark:text-yellow-200">
            Translation system unavailable. Displaying raw text.
          </p>
        </div>
      }
      onError={(error) => {
        console.error('Language system error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function AssetErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Content unavailable
          </span>
        </div>
      }
      onError={(error) => {
        console.error('Asset loading error:', error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}