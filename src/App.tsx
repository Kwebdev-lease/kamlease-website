import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { ErrorBoundary, ThemeErrorBoundary, LanguageErrorBoundary } from '@/components/ErrorBoundary';
// Performance imports - commented out for debugging
// import { initPerformanceMonitoring } from '@/lib/performance';
// import '@/lib/performance-check'; // Auto-runs performance check in dev mode
// import { initializeLazyAnimations } from '@/lib/animation-lazy-loader';
// import { useDevicePerformance } from '@/lib/device-performance';
// import { resourceOptimizer } from '@/lib/resource-optimization';
// import { accessibilityManager } from '@/lib/accessibility-utils';
import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { MultilingualRouter } from './components/MultilingualRouter';
import { SkipToContent } from './components/SkipToContent';
import { GoogleAnalytics } from './components/GoogleAnalytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  // Simplified version for debugging - performance features temporarily disabled
  // const devicePerformance = useDevicePerformance();

  // Initialize performance monitoring, resource optimization, and accessibility features
  useEffect(() => {
    // Simplified initialization for debugging
    console.log('App initialized successfully');
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Root application error:', error, errorInfo)
      }}
    >
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <LanguageErrorBoundary>
          <LanguageProvider>
            <ThemeErrorBoundary>
              <ThemeProvider defaultTheme="dark" storageKey="kamlease-ui-theme">
              <ErrorBoundary
                fallback={
                  <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Application Error
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The application encountered an unexpected error.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Reload Application
                      </button>
                    </div>
                  </div>
                }
              >
                <MotionConfig
                  reducedMotion="user"
                  transition={{
                    type: "tween",
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <TooltipProvider>
                    <SkipToContent />
                    <GoogleAnalytics />
                    <Toaster />
                    <BrowserRouter>
                      <MultilingualRouter />
                    </BrowserRouter>
                  </TooltipProvider>
                </MotionConfig>
              </ErrorBoundary>
            </ThemeProvider>
          </ThemeErrorBoundary>
        </LanguageProvider>
      </LanguageErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  )
}

export default App;
