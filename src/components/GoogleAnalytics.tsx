import { useEffect } from 'react'
import { seoConfig } from '@/lib/seo-config'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function GoogleAnalytics() {
  const { googleAnalyticsId } = seoConfig.analytics

  useEffect(() => {
    if (!googleAnalyticsId) return

    // Load Google Analytics script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`
    document.head.appendChild(script1)

    // Initialize Google Analytics
    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleAnalyticsId}', {
        page_title: document.title,
        page_location: window.location.href,
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
    `
    document.head.appendChild(script2)

    // Set up gtag function
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [googleAnalyticsId])

  return null
}

// Helper function to track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

// Helper function to track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', seoConfig.analytics.googleAnalyticsId, {
      page_path: url,
      page_title: title
    })
  }
}