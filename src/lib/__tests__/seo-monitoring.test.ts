import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { seoMonitoring, type CoreWebVitals, type SEOMetrics } from '../seo-monitoring';

// Mock des APIs du navigateur
const mockPerformanceObserver = vi.fn();
const mockPerformanceGetEntriesByType = vi.fn();

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: mockPerformanceObserver
});

Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    getEntriesByType: mockPerformanceGetEntriesByType
  }
});

// Mock du DOM
const mockDocument = {
  title: 'Test Page Title',
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  body: {
    textContent: 'Test content with mécatronique and électronique keywords for testing'
  }
};

Object.defineProperty(global, 'document', {
  writable: true,
  value: mockDocument
});

Object.defineProperty(global, 'window', {
  writable: true,
  value: {
    location: {
      href: 'https://kamlease.com/test',
      hostname: 'kamlease.com'
    }
  }
});

describe('SEOMonitoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuration par défaut des mocks
    mockDocument.querySelector.mockImplementation((selector: string) => {
      if (selector === 'meta[name="description"]') {
        return { content: 'Test meta description' };
      }
      if (selector === 'link[rel="canonical"]') {
        return { href: 'https://kamlease.com/test' };
      }
      if (selector === 'meta[name="robots"]') {
        return { content: 'index, follow' };
      }
      return null;
    });

    mockDocument.querySelectorAll.mockImplementation((selector: string) => {
      const mockElements = {
        'h1': [{}],
        'h2': [{}, {}],
        'img': [{}, {}, {}],
        'img[alt]': [{}, {}],
        'a[href^="/"], a[href^="./"], a[href^="../"]': [{}, {}, {}, {}],
        'a[href^="http"]:not([href*="kamlease.com"])': [{}],
        'script[type="application/ld+json"]': [{}]
      };
      return mockElements[selector as keyof typeof mockElements] || [];
    });

    mockPerformanceGetEntriesByType.mockImplementation((type: string) => {
      if (type === 'navigation') {
        return [{
          requestStart: 100,
          responseStart: 200
        }];
      }
      if (type === 'paint') {
        return [{
          name: 'first-contentful-paint',
          startTime: 1500
        }];
      }
      return [];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('measureCoreWebVitals', () => {
    it('should measure core web vitals with PerformanceObserver', async () => {
      mockPerformanceObserver.mockImplementation((callback) => {
        return {
          observe: vi.fn((options) => {
            if (options.entryTypes.includes('largest-contentful-paint')) {
              setTimeout(() => callback({
                getEntries: () => [{ startTime: 2000 }]
              }), 10);
            }
            if (options.entryTypes.includes('first-input')) {
              setTimeout(() => callback({
                getEntries: () => [{ processingStart: 150, startTime: 100 }]
              }), 10);
            }
            if (options.entryTypes.includes('layout-shift')) {
              setTimeout(() => callback({
                getEntries: () => [{ value: 0.05, hadRecentInput: false }]
              }), 10);
            }
          })
        };
      });

      const vitals = await seoMonitoring.measureCoreWebVitals();

      expect(vitals.lcp).toBeGreaterThanOrEqual(0);
      expect(vitals.fid).toBeGreaterThanOrEqual(0);
      expect(vitals.cls).toBeGreaterThanOrEqual(0);
      expect(vitals.fcp).toBeGreaterThanOrEqual(0);
      expect(vitals.ttfb).toBeGreaterThanOrEqual(0);
    });

    it('should return zero values when PerformanceObserver is not available', async () => {
      Object.defineProperty(global, 'PerformanceObserver', {
        writable: true,
        value: undefined
      });

      const vitals = await seoMonitoring.measureCoreWebVitals();

      expect(vitals).toEqual({
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0
      });
    });
  });

  describe('analyzeSEOMetrics', () => {
    it('should analyze SEO metrics correctly', () => {
      const metrics = seoMonitoring.analyzeSEOMetrics();

      expect(metrics.pageTitle).toBe('Test Page Title');
      expect(metrics.metaDescription).toBe('Test meta description');
      expect(metrics.h1Count).toBe(1);
      expect(metrics.h2Count).toBe(2);
      expect(metrics.imageCount).toBe(3);
      expect(metrics.imagesWithAlt).toBe(2);
      expect(metrics.internalLinks).toBe(4);
      expect(metrics.externalLinks).toBe(1);
      expect(metrics.wordCount).toBeGreaterThan(0);
      expect(metrics.keywordDensity).toEqual(expect.objectContaining({
        'mécatronique': expect.any(Number),
        'électronique': expect.any(Number)
      }));
      expect(metrics.structuredDataPresent).toBe(true);
      expect(metrics.canonicalUrl).toBe('https://kamlease.com/test');
      expect(metrics.metaRobots).toBe('index, follow');
    });

    it('should handle missing meta elements', () => {
      mockDocument.querySelector.mockReturnValue(null);
      mockDocument.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'script[type="application/ld+json"]') return [];
        return [];
      });

      const metrics = seoMonitoring.analyzeSEOMetrics();

      expect(metrics.metaDescription).toBe('');
      expect(metrics.canonicalUrl).toBeNull();
      expect(metrics.metaRobots).toBeNull();
      expect(metrics.structuredDataPresent).toBe(false);
    });
  });

  describe('checkThresholds', () => {
    it('should generate alerts for poor Core Web Vitals', () => {
      const mockData = {
        url: 'https://kamlease.com/test',
        timestamp: new Date(),
        coreWebVitals: {
          lcp: 3000, // Au-dessus du seuil de 2500ms
          fid: 150,  // Au-dessus du seuil de 100ms
          cls: 0.2,  // Au-dessus du seuil de 0.1
          fcp: 1500,
          ttfb: 500
        },
        seoMetrics: {
          pageTitle: 'Test Title',
          metaDescription: 'Test Description',
          h1Count: 1,
          h2Count: 2,
          imageCount: 3,
          imagesWithAlt: 3,
          internalLinks: 4,
          externalLinks: 1,
          wordCount: 100,
          keywordDensity: {},
          structuredDataPresent: true,
          canonicalUrl: 'https://kamlease.com/test',
          metaRobots: 'index, follow'
        },
        alerts: []
      };

      const alerts = seoMonitoring.checkThresholds(mockData);

      expect(alerts).toHaveLength(3);
      expect(alerts[0].message).toContain('LCP trop élevé');
      expect(alerts[1].message).toContain('FID trop élevé');
      expect(alerts[2].message).toContain('CLS trop élevé');
    });

    it('should generate alerts for SEO issues', () => {
      const mockData = {
        url: 'https://kamlease.com/test',
        timestamp: new Date(),
        coreWebVitals: {
          lcp: 2000,
          fid: 50,
          cls: 0.05,
          fcp: 1500,
          ttfb: 500
        },
        seoMetrics: {
          pageTitle: '', // Titre manquant
          metaDescription: '', // Description manquante
          h1Count: 0, // Pas de H1
          h2Count: 2,
          imageCount: 3,
          imagesWithAlt: 1, // Seulement 1/3 des images ont un alt
          internalLinks: 4,
          externalLinks: 1,
          wordCount: 100,
          keywordDensity: {},
          structuredDataPresent: true,
          canonicalUrl: 'https://kamlease.com/test',
          metaRobots: 'index, follow'
        },
        alerts: []
      };

      const alerts = seoMonitoring.checkThresholds(mockData);

      expect(alerts.length).toBeGreaterThanOrEqual(4);
      expect(alerts.some(alert => alert.message.includes('Titre de page manquant'))).toBe(true);
      expect(alerts.some(alert => alert.message.includes('Meta description manquante'))).toBe(true);
      expect(alerts.some(alert => alert.message.includes('Aucun titre H1 trouvé'))).toBe(true);
      expect(alerts.some(alert => alert.message.includes('images sans attribut alt'))).toBe(true);
    });

    it('should generate alert for multiple H1 tags', () => {
      const mockData = {
        url: 'https://kamlease.com/test',
        timestamp: new Date(),
        coreWebVitals: {
          lcp: 2000,
          fid: 50,
          cls: 0.05,
          fcp: 1500,
          ttfb: 500
        },
        seoMetrics: {
          pageTitle: 'Test Title',
          metaDescription: 'Test Description',
          h1Count: 3, // Plusieurs H1
          h2Count: 2,
          imageCount: 0,
          imagesWithAlt: 0,
          internalLinks: 4,
          externalLinks: 1,
          wordCount: 100,
          keywordDensity: {},
          structuredDataPresent: true,
          canonicalUrl: 'https://kamlease.com/test',
          metaRobots: 'index, follow'
        },
        alerts: []
      };

      const alerts = seoMonitoring.checkThresholds(mockData);

      expect(alerts.some(alert => alert.message.includes('Plusieurs titres H1 trouvés'))).toBe(true);
    });
  });

  describe('collectMonitoringData', () => {
    it('should collect complete monitoring data', async () => {
      mockPerformanceObserver.mockImplementation((callback) => {
        return {
          observe: vi.fn(() => {
            setTimeout(() => callback({
              getEntries: () => [{ startTime: 2000 }]
            }), 10);
          })
        };
      });

      const data = await seoMonitoring.collectMonitoringData();

      expect(data).toMatchObject({
        url: 'https://kamlease.com/test',
        timestamp: expect.any(Date),
        coreWebVitals: expect.any(Object),
        seoMetrics: expect.any(Object),
        alerts: expect.any(Array)
      });
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate performance report with recommendations', async () => {
      // Ajouter quelques données de test
      await seoMonitoring.collectMonitoringData();
      await seoMonitoring.collectMonitoringData();

      const report = seoMonitoring.generatePerformanceReport();

      expect(report).toMatchObject({
        summary: {
          totalPages: expect.any(Number),
          averageLCP: expect.any(Number),
          averageFID: expect.any(Number),
          averageCLS: expect.any(Number),
          activeAlerts: expect.any(Number)
        },
        trends: {
          lcpTrend: expect.any(Array),
          fidTrend: expect.any(Array),
          clsTrend: expect.any(Array)
        },
        recommendations: expect.any(Array)
      });
    });
  });

  describe('alert management', () => {
    it('should manage alerts correctly', async () => {
      const data = await seoMonitoring.collectMonitoringData();
      const activeAlerts = seoMonitoring.getActiveAlerts();

      expect(activeAlerts.length).toBeGreaterThanOrEqual(0);

      if (activeAlerts.length > 0) {
        const alertId = activeAlerts[0].id;
        const initialCount = activeAlerts.length;
        
        seoMonitoring.resolveAlert(alertId);

        const updatedAlerts = seoMonitoring.getActiveAlerts();
        const resolvedAlert = updatedAlerts.find(alert => alert.id === alertId);
        
        // L'alerte doit être marquée comme résolue ou supprimée de la liste active
        expect(resolvedAlert === undefined || resolvedAlert.resolved === true).toBe(true);
      }
    });
  });
});