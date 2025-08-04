/**
 * User Interaction Analytics Service
 * Tracks anonymized user interactions and behavior patterns
 */

import { Logger } from './logger'

export interface UserInteraction {
  id: string
  timestamp: number
  sessionId: string
  type: 'click' | 'input' | 'scroll' | 'navigation' | 'form_submission' | 'error' | 'custom'
  component: string
  action: string
  data?: any
  duration?: number
  success?: boolean
}

export interface UserSession {
  id: string
  startTime: number
  endTime?: number
  interactions: UserInteraction[]
  userAgent: string
  viewport: {
    width: number
    height: number
  }
  referrer?: string
  exitPage?: string
}

export interface AnalyticsReport {
  period: {
    start: number
    end: number
  }
  sessions: {
    total: number
    averageDuration: number
    bounceRate: number
  }
  interactions: {
    total: number
    byType: Record<string, number>
    byComponent: Record<string, number>
    mostCommon: Array<{
      component: string
      action: string
      count: number
    }>
  }
  forms: {
    submissions: number
    successRate: number
    averageCompletionTime: number
    abandonmentRate: number
  }
  errors: {
    total: number
    byComponent: Record<string, number>
    userImpact: number
  }
}

export interface ConversionFunnel {
  steps: Array<{
    name: string
    component: string
    action: string
    users: number
    conversionRate: number
  }>
  dropoffPoints: Array<{
    step: string
    dropoffRate: number
    commonExitActions: string[]
  }>
}

export class Analytics {
  private static instance: Analytics
  private logger: Logger
  private currentSession: UserSession | null = null
  private interactions: UserInteraction[] = []
  private sessions: UserSession[] = []
  private maxStoredSessions = 100
  private maxStoredInteractions = 1000
  private trackingEnabled = true

  private constructor() {
    this.logger = Logger.getInstance()
    this.initializeSession()
    this.setupEventListeners()
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  /**
   * Enable or disable tracking
   */
  public setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled
    
    if (!enabled) {
      this.logger.info('analytics', 'User interaction tracking disabled')
    } else {
      this.logger.info('analytics', 'User interaction tracking enabled')
    }
  }

  /**
   * Track a user interaction
   */
  public trackInteraction(
    type: UserInteraction['type'],
    component: string,
    action: string,
    data?: any,
    duration?: number,
    success?: boolean
  ): string {
    if (!this.trackingEnabled || !this.currentSession) {
      return ''
    }

    const interaction: UserInteraction = {
      id: this.generateInteractionId(),
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      type,
      component,
      action,
      data: this.anonymizeData(data),
      duration,
      success
    }

    // Add to current session
    this.currentSession.interactions.push(interaction)
    
    // Add to global interactions
    this.interactions.push(interaction)
    
    // Maintain storage limits
    if (this.interactions.length > this.maxStoredInteractions) {
      this.interactions = this.interactions.slice(-this.maxStoredInteractions)
    }

    // Log the interaction
    this.logger.logUserInteraction(action, component, {
      type,
      duration,
      success,
      sessionId: this.currentSession.id
    })

    return interaction.id
  }

  /**
   * Track click interaction
   */
  public trackClick(
    component: string,
    element: string,
    data?: any
  ): string {
    return this.trackInteraction('click', component, `click_${element}`, data)
  }

  /**
   * Track input interaction
   */
  public trackInput(
    component: string,
    field: string,
    inputType: string,
    duration?: number
  ): string {
    return this.trackInteraction('input', component, `input_${field}`, {
      inputType,
      fieldName: field
    }, duration)
  }

  /**
   * Track form submission
   */
  public trackFormSubmission(
    formType: string,
    success: boolean,
    duration: number,
    errors?: string[]
  ): string {
    return this.trackInteraction('form_submission', 'contact-form', `submit_${formType}`, {
      formType,
      errors: errors?.length || 0,
      errorTypes: errors
    }, duration, success)
  }

  /**
   * Track navigation
   */
  public trackNavigation(
    from: string,
    to: string,
    method: 'click' | 'browser' | 'programmatic' = 'click'
  ): string {
    return this.trackInteraction('navigation', 'router', 'navigate', {
      from,
      to,
      method
    })
  }

  /**
   * Track scroll behavior
   */
  public trackScroll(
    component: string,
    scrollDepth: number,
    maxScroll: number
  ): string {
    const scrollPercentage = Math.round((scrollDepth / maxScroll) * 100)
    
    return this.trackInteraction('scroll', component, 'scroll', {
      scrollDepth,
      maxScroll,
      scrollPercentage
    })
  }

  /**
   * Track error occurrence
   */
  public trackError(
    component: string,
    errorType: string,
    errorMessage: string,
    userAction?: string
  ): string {
    return this.trackInteraction('error', component, `error_${errorType}`, {
      errorType,
      errorMessage: this.anonymizeErrorMessage(errorMessage),
      userAction
    }, undefined, false)
  }

  /**
   * Track custom event
   */
  public trackCustomEvent(
    component: string,
    eventName: string,
    data?: any,
    duration?: number,
    success?: boolean
  ): string {
    return this.trackInteraction('custom', component, eventName, data, duration, success)
  }

  /**
   * Start timing an interaction
   */
  public startTiming(component: string, action: string): () => string {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      return this.trackInteraction('custom', component, action, undefined, duration)
    }
  }

  /**
   * End current session
   */
  public endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now()
      
      // Store completed session
      this.sessions.push(this.currentSession)
      
      // Maintain storage limit
      if (this.sessions.length > this.maxStoredSessions) {
        this.sessions = this.sessions.slice(-this.maxStoredSessions)
      }

      this.logger.info('analytics', 'User session ended', {
        sessionId: this.currentSession.id,
        duration: this.currentSession.endTime - this.currentSession.startTime,
        interactions: this.currentSession.interactions.length
      })

      this.currentSession = null
    }
  }

  /**
   * Get current session
   */
  public getCurrentSession(): UserSession | null {
    return this.currentSession
  }

  /**
   * Get analytics report for a time period
   */
  public getAnalyticsReport(startTime?: number, endTime?: number): AnalyticsReport {
    const start = startTime || (Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    const end = endTime || Date.now()

    const periodSessions = this.sessions.filter(
      session => session.startTime >= start && session.startTime <= end
    )

    const periodInteractions = this.interactions.filter(
      interaction => interaction.timestamp >= start && interaction.timestamp <= end
    )

    // Session analytics
    const totalSessions = periodSessions.length
    const averageSessionDuration = totalSessions > 0
      ? periodSessions.reduce((sum, session) => {
          const duration = (session.endTime || Date.now()) - session.startTime
          return sum + duration
        }, 0) / totalSessions
      : 0

    const bounceSessions = periodSessions.filter(session => session.interactions.length <= 1)
    const bounceRate = totalSessions > 0 ? (bounceSessions.length / totalSessions) * 100 : 0

    // Interaction analytics
    const interactionsByType: Record<string, number> = {}
    const interactionsByComponent: Record<string, number> = {}
    
    periodInteractions.forEach(interaction => {
      interactionsByType[interaction.type] = (interactionsByType[interaction.type] || 0) + 1
      interactionsByComponent[interaction.component] = (interactionsByComponent[interaction.component] || 0) + 1
    })

    // Most common interactions
    const interactionCounts = new Map<string, number>()
    periodInteractions.forEach(interaction => {
      const key = `${interaction.component}:${interaction.action}`
      interactionCounts.set(key, (interactionCounts.get(key) || 0) + 1)
    })

    const mostCommon = Array.from(interactionCounts.entries())
      .map(([key, count]) => {
        const [component, action] = key.split(':')
        return { component, action, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Form analytics
    const formSubmissions = periodInteractions.filter(i => i.type === 'form_submission')
    const successfulSubmissions = formSubmissions.filter(i => i.success === true)
    const formSuccessRate = formSubmissions.length > 0 
      ? (successfulSubmissions.length / formSubmissions.length) * 100 
      : 0

    const averageCompletionTime = formSubmissions.length > 0
      ? formSubmissions.reduce((sum, submission) => sum + (submission.duration || 0), 0) / formSubmissions.length
      : 0

    // Error analytics
    const errorInteractions = periodInteractions.filter(i => i.type === 'error')
    const errorsByComponent: Record<string, number> = {}
    errorInteractions.forEach(error => {
      errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1
    })

    const sessionsWithErrors = new Set(errorInteractions.map(e => e.sessionId)).size
    const userImpact = totalSessions > 0 ? (sessionsWithErrors / totalSessions) * 100 : 0

    return {
      period: { start, end },
      sessions: {
        total: totalSessions,
        averageDuration: averageSessionDuration,
        bounceRate
      },
      interactions: {
        total: periodInteractions.length,
        byType: interactionsByType,
        byComponent: interactionsByComponent,
        mostCommon
      },
      forms: {
        submissions: formSubmissions.length,
        successRate: formSuccessRate,
        averageCompletionTime,
        abandonmentRate: 100 - formSuccessRate // Simplified calculation
      },
      errors: {
        total: errorInteractions.length,
        byComponent: errorsByComponent,
        userImpact
      }
    }
  }

  /**
   * Get conversion funnel analysis
   */
  public getConversionFunnel(steps: Array<{ name: string; component: string; action: string }>): ConversionFunnel {
    const funnelSteps = steps.map((step, index) => {
      const stepInteractions = this.interactions.filter(
        i => i.component === step.component && i.action === step.action
      )
      
      const uniqueUsers = new Set(stepInteractions.map(i => i.sessionId)).size
      const conversionRate = index === 0 ? 100 : 
        (uniqueUsers / new Set(this.interactions.filter(
          i => i.component === steps[0].component && i.action === steps[0].action
        ).map(i => i.sessionId)).size) * 100

      return {
        name: step.name,
        component: step.component,
        action: step.action,
        users: uniqueUsers,
        conversionRate
      }
    })

    // Calculate dropoff points
    const dropoffPoints = funnelSteps.slice(1).map((step, index) => {
      const previousStep = funnelSteps[index]
      const dropoffRate = previousStep.conversionRate - step.conversionRate

      return {
        step: step.name,
        dropoffRate,
        commonExitActions: [] // TODO: Implement exit action analysis
      }
    })

    return {
      steps: funnelSteps,
      dropoffPoints
    }
  }

  /**
   * Export analytics data
   */
  public exportData(): string {
    return JSON.stringify({
      sessions: this.sessions,
      interactions: this.interactions,
      currentSession: this.currentSession,
      timestamp: Date.now()
    }, null, 2)
  }

  /**
   * Clear all analytics data
   */
  public clearData(): void {
    this.interactions = []
    this.sessions = []
    this.endSession()
    this.initializeSession()
  }

  /**
   * Initialize a new session
   */
  private initializeSession(): void {
    if (!this.trackingEnabled) {
      return
    }

    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      interactions: [],
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      viewport: {
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
      },
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    }

    this.logger.info('analytics', 'New user session started', {
      sessionId: this.currentSession.id,
      viewport: this.currentSession.viewport
    })
  }

  /**
   * Setup event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackInteraction('custom', 'page', 'visibility_hidden')
      } else {
        this.trackInteraction('custom', 'page', 'visibility_visible')
      }
    })

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })

    // Track viewport changes
    window.addEventListener('resize', () => {
      if (this.currentSession) {
        this.currentSession.viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
      this.trackInteraction('custom', 'viewport', 'resize', {
        width: window.innerWidth,
        height: window.innerHeight
      })
    })
  }

  /**
   * Generate unique interaction ID
   */
  private generateInteractionId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Anonymize sensitive data
   */
  private anonymizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    const anonymized = { ...data }
    const sensitiveFields = ['email', 'phone', 'nom', 'prenom', 'name', 'address']
    
    for (const field of sensitiveFields) {
      if (field in anonymized) {
        if (typeof anonymized[field] === 'string') {
          // Keep only length and first character for analysis
          anonymized[field] = {
            length: anonymized[field].length,
            firstChar: anonymized[field].charAt(0),
            type: 'anonymized'
          }
        } else {
          anonymized[field] = '[ANONYMIZED]'
        }
      }
    }

    return anonymized
  }

  /**
   * Anonymize error messages
   */
  private anonymizeErrorMessage(message: string): string {
    // Remove potential PII from error messages
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[PHONE]')
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')
  }
}