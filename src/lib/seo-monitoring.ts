/**
 * Service de monitoring des performances SEO
 * Suit les métriques SEO, Core Web Vitals et performances générales
 */

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface SEOMetrics {
  pageTitle: string;
  metaDescription: string;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesWithAlt: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  keywordDensity: Record<string, number>;
  structuredDataPresent: boolean;
  canonicalUrl: string | null;
  metaRobots: string | null;
}

export interface LighthouseMetrics {
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  pwaScore: number;
}

export interface SEOAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  page: string;
  timestamp: Date;
  resolved: boolean;
}

export interface SEOMonitoringData {
  url: string;
  timestamp: Date;
  coreWebVitals: CoreWebVitals;
  seoMetrics: SEOMetrics;
  lighthouseMetrics?: LighthouseMetrics;
  alerts: SEOAlert[];
}

class SEOMonitoringService {
  private data: SEOMonitoringData[] = [];
  private alerts: SEOAlert[] = [];
  private thresholds = {
    lcp: 2500, // ms
    fid: 100, // ms
    cls: 0.1,
    fcp: 1800, // ms
    ttfb: 600, // ms
    seoScore: 90,
    performanceScore: 90
  };

  /**
   * Mesure les Core Web Vitals de la page courante
   */
  async measureCoreWebVitals(): Promise<CoreWebVitals> {
    return new Promise((resolve) => {
      const vitals: Partial<CoreWebVitals> = {};

      // Mesure LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Mesure FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Mesure CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Mesure FCP et TTFB via Navigation Timing
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            vitals.ttfb = navigation.responseStart - navigation.requestStart;
          }

          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            vitals.fcp = fcpEntry.startTime;
          }

          resolve({
            lcp: vitals.lcp || 0,
            fid: vitals.fid || 0,
            cls: vitals.cls || 0,
            fcp: vitals.fcp || 0,
            ttfb: vitals.ttfb || 0
          });
        }, 1000);
      } else {
        // Fallback pour les navigateurs non supportés
        resolve({
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0,
          ttfb: 0
        });
      }
    });
  }

  /**
   * Analyse les métriques SEO de la page courante
   */
  analyzeSEOMetrics(): SEOMetrics {
    const pageTitle = document.title;
    const metaDescription = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '';
    
    const h1Elements = document.querySelectorAll('h1');
    const h2Elements = document.querySelectorAll('h2');
    const images = document.querySelectorAll('img');
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    
    const textContent = document.body.textContent || '';
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    const metaRobots = (document.querySelector('meta[name="robots"]') as HTMLMetaElement)?.content || null;
    
    const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    return {
      pageTitle,
      metaDescription,
      h1Count: h1Elements.length,
      h2Count: h2Elements.length,
      imageCount: images.length,
      imagesWithAlt: imagesWithAlt.length,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      wordCount,
      keywordDensity: this.calculateKeywordDensity(textContent),
      structuredDataPresent: structuredDataScripts.length > 0,
      canonicalUrl: canonicalLink?.href || null,
      metaRobots
    };
  }

  /**
   * Calcule la densité des mots-clés principaux
   */
  private calculateKeywordDensity(text: string): Record<string, number> {
    const keywords = [
      'mécatronique', 'électronique', 'auto-staging', 'industrielle',
      'solutions', 'innovation', 'développement', 'expertise'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    const density: Record<string, number> = {};
    
    keywords.forEach(keyword => {
      const count = words.filter(word => word.includes(keyword.toLowerCase())).length;
      density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
    });
    
    return density;
  }

  /**
   * Vérifie les seuils et génère des alertes
   */
  checkThresholds(data: SEOMonitoringData): SEOAlert[] {
    const alerts: SEOAlert[] = [];
    const { coreWebVitals, seoMetrics, lighthouseMetrics } = data;

    // Vérification Core Web Vitals
    if (coreWebVitals.lcp > this.thresholds.lcp) {
      alerts.push({
        id: `lcp-${Date.now()}`,
        type: 'warning',
        message: `LCP trop élevé: ${coreWebVitals.lcp}ms (seuil: ${this.thresholds.lcp}ms)`,
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (coreWebVitals.fid > this.thresholds.fid) {
      alerts.push({
        id: `fid-${Date.now()}`,
        type: 'warning',
        message: `FID trop élevé: ${coreWebVitals.fid}ms (seuil: ${this.thresholds.fid}ms)`,
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (coreWebVitals.cls > this.thresholds.cls) {
      alerts.push({
        id: `cls-${Date.now()}`,
        type: 'warning',
        message: `CLS trop élevé: ${coreWebVitals.cls} (seuil: ${this.thresholds.cls})`,
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Vérification SEO
    if (!seoMetrics.pageTitle) {
      alerts.push({
        id: `title-${Date.now()}`,
        type: 'error',
        message: 'Titre de page manquant',
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (!seoMetrics.metaDescription) {
      alerts.push({
        id: `desc-${Date.now()}`,
        type: 'error',
        message: 'Meta description manquante',
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (seoMetrics.h1Count === 0) {
      alerts.push({
        id: `h1-${Date.now()}`,
        type: 'error',
        message: 'Aucun titre H1 trouvé',
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (seoMetrics.h1Count > 1) {
      alerts.push({
        id: `h1-multiple-${Date.now()}`,
        type: 'warning',
        message: `Plusieurs titres H1 trouvés: ${seoMetrics.h1Count}`,
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (seoMetrics.imageCount > 0 && seoMetrics.imagesWithAlt / seoMetrics.imageCount < 0.9) {
      alerts.push({
        id: `alt-${Date.now()}`,
        type: 'warning',
        message: `${seoMetrics.imageCount - seoMetrics.imagesWithAlt} images sans attribut alt`,
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Vérification Lighthouse
    if (lighthouseMetrics && lighthouseMetrics.seoScore < this.thresholds.seoScore) {
      alerts.push({
        id: `lighthouse-seo-${Date.now()}`,
        type: 'warning',
        message: `Score SEO Lighthouse faible: ${lighthouseMetrics.seoScore} (seuil: ${this.thresholds.seoScore})`,
        page: data.url,
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  /**
   * Collecte toutes les données de monitoring
   */
  async collectMonitoringData(url: string = window.location.href): Promise<SEOMonitoringData> {
    const coreWebVitals = await this.measureCoreWebVitals();
    const seoMetrics = this.analyzeSEOMetrics();
    
    const data: SEOMonitoringData = {
      url,
      timestamp: new Date(),
      coreWebVitals,
      seoMetrics,
      alerts: []
    };

    const alerts = this.checkThresholds(data);
    data.alerts = alerts;
    
    this.data.push(data);
    this.alerts.push(...alerts);
    
    return data;
  }

  /**
   * Récupère l'historique des données
   */
  getHistoricalData(limit?: number): SEOMonitoringData[] {
    return limit ? this.data.slice(-limit) : this.data;
  }

  /**
   * Récupère les alertes actives
   */
  getActiveAlerts(): SEOAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Marque une alerte comme résolue
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Génère un rapport de performance
   */
  generatePerformanceReport(): {
    summary: {
      totalPages: number;
      averageLCP: number;
      averageFID: number;
      averageCLS: number;
      activeAlerts: number;
    };
    trends: {
      lcpTrend: number[];
      fidTrend: number[];
      clsTrend: number[];
    };
    recommendations: string[];
  } {
    const recentData = this.data.slice(-10);
    
    const summary = {
      totalPages: this.data.length,
      averageLCP: recentData.reduce((sum, d) => sum + d.coreWebVitals.lcp, 0) / recentData.length,
      averageFID: recentData.reduce((sum, d) => sum + d.coreWebVitals.fid, 0) / recentData.length,
      averageCLS: recentData.reduce((sum, d) => sum + d.coreWebVitals.cls, 0) / recentData.length,
      activeAlerts: this.getActiveAlerts().length
    };

    const trends = {
      lcpTrend: recentData.map(d => d.coreWebVitals.lcp),
      fidTrend: recentData.map(d => d.coreWebVitals.fid),
      clsTrend: recentData.map(d => d.coreWebVitals.cls)
    };

    const recommendations: string[] = [];
    
    if (summary.averageLCP > this.thresholds.lcp) {
      recommendations.push('Optimiser le temps de chargement du contenu principal (LCP)');
    }
    
    if (summary.averageFID > this.thresholds.fid) {
      recommendations.push('Réduire le délai de première interaction (FID)');
    }
    
    if (summary.averageCLS > this.thresholds.cls) {
      recommendations.push('Stabiliser la mise en page pour réduire le CLS');
    }

    return { summary, trends, recommendations };
  }
}

export const seoMonitoring = new SEOMonitoringService();