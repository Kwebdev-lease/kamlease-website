/**
 * Tests for Monitoring Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MonitoringService } from '../monitoring-service'
import { LogLevel } from '../logger'

// Mock the individual monitoring services
vi.mock('../logger')
vi.mock('../performance-monitor')
vi.mock('../error-tracker')
vi.mock('../analytics')

describe('MonitoringService', () => {
  let monitoringService: MonitoringService

  beforeEach(() => {
    vi.clearAllMocks()
    monitoringService = MonitoringService.getInstance()
  })

  describe('initialization', () => {
    it('should initialize with default configuration', async () => {
      await expect(monitoringService.initialize()).resolves.not.toThrow()
    })

    it('should initialize with custom configuration', async () => {
      const customConfig = {
        logging: {
          enabled: true,
          level: LogLevel.DEBUG,
          enableConsole: false,
          enableStorage: true,
          enableRemote: true,
          remoteEndpoint: 'https://api.example.com/logs'
        }
      }

      await expect(monitoringService.initialize(customConfig)).resolves.not.toThrow()
    })
  })

  describe('status monitoring', () => {
    it('should return monitoring status', () => {
      const status = monitoringService.getStatus()

      expect(status).toHaveProperty('isHealthy')
      expect(status).toHaveProperty('services')
      expect(status).toHaveProperty('metrics')
      expect(status.services).toHaveProperty('logging')
      expect(status.services).toHaveProperty('performance')
      expect(status.services).toHaveProperty('errorTracking')
      expect(status.services).toHaveProperty('analytics')
    })

    it('should return comprehensive dashboard data', () => {
      const dashboard = monitoringService.getDashboard()

      expect(dashboard).toHaveProperty('overview')
      expect(dashboard).toHaveProperty('performance')
      expect(dashboard).toHaveProperty('errors')
      expect(dashboard).toHaveProperty('analytics')
      expect(dashboard.overview).toHaveProperty('status')
      expect(dashboard.overview).toHaveProperty('recentActivity')
    })
  })

  describe('tracking methods', () => {
    it('should track calendar API calls', () => {
      expect(() => {
        monitoringService.trackCalendarApiCall(
          'calendar-events',
          'POST',
          1500,
          201,
          true
        )
      }).not.toThrow()
    })

    it('should track calendar API failures', () => {
      const error = new Error('API call failed')
      
      expect(() => {
        monitoringService.trackCalendarApiCall(
          'calendar-events',
          'POST',
          3000,
          500,
          false,
          error
        )
      }).not.toThrow()
    })

    it('should track form submissions', () => {
      expect(() => {
        monitoringService.trackFormSubmission('appointment', 2500, true)
      }).not.toThrow()
    })

    it('should track form submission failures', () => {
      expect(() => {
        monitoringService.trackFormSubmission('message', 1200, false, ['Validation error'])
      }).not.toThrow()
    })

    it('should track security events', () => {
      expect(() => {
        monitoringService.trackSecurityEvent('csrf_validation_failed', 'high', {
          userAgent: 'test-agent',
          ip: '127.0.0.1'
        })
      }).not.toThrow()
    })
  })

  describe('data management', () => {
    it('should export monitoring data', () => {
      const exportedData = monitoringService.exportData()
      
      expect(exportedData).toBeTypeOf('string')
      expect(() => JSON.parse(exportedData)).not.toThrow()
      
      const parsed = JSON.parse(exportedData)
      expect(parsed).toHaveProperty('logs')
      expect(parsed).toHaveProperty('errors')
      expect(parsed).toHaveProperty('performance')
      expect(parsed).toHaveProperty('analytics')
      expect(parsed).toHaveProperty('status')
      expect(parsed).toHaveProperty('timestamp')
    })

    it('should clear all monitoring data', () => {
      expect(() => {
        monitoringService.clearData()
      }).not.toThrow()
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MonitoringService.getInstance()
      const instance2 = MonitoringService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })
})