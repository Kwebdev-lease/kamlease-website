# Configuration du Monitoring SEO - Kamlease

## Vue d'ensemble

Ce document détaille la configuration complète du système de monitoring SEO pour le site Kamlease, incluant les outils, les métriques, et les alertes automatisées.

## 1. Configuration Google Search Console

### Propriétés à Configurer

```javascript
// Configuration des propriétés GSC
const gscProperties = {
  main: 'https://kamlease.com',
  www: 'https://www.kamlease.com', // Si redirection configurée
  mobile: 'https://m.kamlease.com', // Si version mobile séparée
}

// Vérification des propriétés
const verificationMethods = {
  htmlFile: 'google[code].html', // Fichier de vérification
  metaTag: '<meta name="google-site-verification" content="[code]" />',
  dnsRecord: 'TXT google-site-verification=[code]',
  googleAnalytics: 'Utiliser le code GA existant'
}
```

### Sitemaps à Soumettre

```xml
<!-- Sitemaps principaux -->
https://kamlease.com/sitemap.xml
https://kamlease.com/sitemap-fr.xml
https://kamlease.com/sitemap-en.xml

<!-- Sitemaps spécialisés (si applicable) -->
https://kamlease.com/sitemap-images.xml
https://kamlease.com/sitemap-news.xml
```

### Alertes GSC à Configurer

1. **Erreurs d'exploration**
   - Erreurs 404
   - Erreurs de serveur (5xx)
   - Problèmes de robots.txt

2. **Problèmes de sécurité**
   - Malware détecté
   - Contenu piraté
   - Problèmes de certificat SSL

3. **Améliorations**
   - Problèmes d'ergonomie mobile
   - Core Web Vitals
   - Données structurées

## 2. Configuration Google Analytics 4

### Propriétés et Flux de Données

```javascript
// Configuration GA4
const ga4Config = {
  measurementId: 'G-XXXXXXXXXX', // À remplacer par l'ID réel
  dataStreams: {
    web: {
      url: 'https://kamlease.com',
      enhancedMeasurement: true,
      customDimensions: [
        { name: 'user_language', scope: 'USER' },
        { name: 'page_language', scope: 'EVENT' },
        { name: 'device_performance', scope: 'SESSION' }
      ]
    }
  }
}
```

### Événements Personnalisés SEO

```javascript
// Événements SEO à tracker
const seoEvents = {
  // Core Web Vitals
  core_web_vitals: {
    parameters: ['metric_name', 'metric_value', 'metric_rating']
  },
  
  // Interactions SEO
  search_internal: {
    parameters: ['search_term', 'results_count']
  },
  
  // Engagement
  scroll_depth: {
    parameters: ['page_location', 'scroll_percentage']
  },
  
  // Erreurs
  seo_error: {
    parameters: ['error_type', 'error_message', 'page_location']
  }
}
```

### Objectifs et Conversions

```javascript
// Objectifs SEO
const seoGoals = {
  organic_contact: {
    type: 'conversion',
    conditions: [
      { dimension: 'source', operator: 'equals', value: 'google' },
      { dimension: 'medium', operator: 'equals', value: 'organic' },
      { dimension: 'event_name', operator: 'equals', value: 'contact_form_submit' }
    ]
  },
  
  organic_engagement: {
    type: 'conversion',
    conditions: [
      { dimension: 'source', operator: 'equals', value: 'google' },
      { dimension: 'medium', operator: 'equals', value: 'organic' },
      { dimension: 'session_engaged', operator: 'equals', value: 'true' }
    ]
  }
}
```

## 3. Monitoring des Core Web Vitals

### Configuration Web-Vitals

```javascript
// src/lib/web-vitals-monitoring.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export class WebVitalsMonitor {
  private static instance: WebVitalsMonitor
  private metrics: Map<string, number> = new Map()
  
  static getInstance(): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor()
    }
    return WebVitalsMonitor.instance
  }
  
  initialize() {
    // Mesurer les Core Web Vitals
    getCLS(this.handleMetric.bind(this))
    getFID(this.handleMetric.bind(this))
    getFCP(this.handleMetric.bind(this))
    getLCP(this.handleMetric.bind(this))
    getTTFB(this.handleMetric.bind(this))
  }
  
  private handleMetric(metric: any) {
    this.metrics.set(metric.name, metric.value)
    
    // Envoyer à Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'core_web_vitals', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_rating: this.getRating(metric.name, metric.value),
        custom_parameter_1: window.location.pathname
      })
    }
    
    // Alertes pour les métriques critiques
    if (this.isCritical(metric.name, metric.value)) {
      this.sendAlert(metric)
    }
  }
  
  private getRating(name: string, value: number): string {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    }
    
    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return 'unknown'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }
  
  private isCritical(name: string, value: number): boolean {
    const criticalThresholds = {
      CLS: 0.25,
      FID: 300,
      LCP: 4000,
      FCP: 3000,
      TTFB: 1800
    }
    
    return value > (criticalThresholds[name as keyof typeof criticalThresholds] || Infinity)
  }
  
  private async sendAlert(metric: any) {
    // Envoyer une alerte (webhook, email, etc.)
    try {
      await fetch('/api/seo-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'core_web_vitals_critical',
          metric: metric.name,
          value: metric.value,
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to send SEO alert:', error)
    }
  }
}
```

## 4. Monitoring Lighthouse Automatisé

### Configuration Lighthouse CI

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'https://kamlease.com/',
        'https://kamlease.com/en/',
        'https://kamlease.com/mentions-legales',
        'https://kamlease.com/en/legal-notice'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // SEO spécifique
        'meta-description': 'error',
        'document-title': 'error',
        'robots-txt': 'error',
        'canonical': 'error',
        'hreflang': 'error',
        'structured-data': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

### Script de Monitoring Quotidien

```bash
#!/bin/bash
# scripts/daily-lighthouse-check.sh

echo "🚀 Démarrage du contrôle Lighthouse quotidien..."

# Exécuter Lighthouse CI
npx lhci autorun

# Vérifier les résultats
if [ $? -eq 0 ]; then
    echo "✅ Tous les tests Lighthouse sont passés"
else
    echo "❌ Échec des tests Lighthouse - Envoi d'alerte"
    
    # Envoyer une alerte
    curl -X POST "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" \
         -H 'Content-type: application/json' \
         --data '{"text":"🚨 Alerte SEO: Échec des tests Lighthouse sur kamlease.com"}'
fi

# Archiver les résultats
mkdir -p reports/lighthouse/$(date +%Y-%m-%d)
cp .lighthouseci/* reports/lighthouse/$(date +%Y-%m-%d)/

echo "📊 Rapport sauvegardé dans reports/lighthouse/$(date +%Y-%m-%d)/"
```

## 5. Monitoring des Positions et Mots-clés

### Configuration Search Console API

```javascript
// src/lib/search-console-monitor.ts
import { google } from 'googleapis'

export class SearchConsoleMonitor {
  private searchconsole: any
  private siteUrl = 'https://kamlease.com'
  
  constructor(credentials: any) {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    })
    
    this.searchconsole = google.searchconsole({ version: 'v1', auth })
  }
  
  async getKeywordPositions(startDate: string, endDate: string) {
    try {
      const response = await this.searchconsole.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query', 'page'],
          rowLimit: 1000,
          dataState: 'final'
        }
      })
      
      return response.data.rows || []
    } catch (error) {
      console.error('Erreur lors de la récupération des positions:', error)
      throw error
    }
  }
  
  async getTopQueries(days: number = 7) {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    const data = await this.getKeywordPositions(startDate, endDate)
    
    return data
      .sort((a: any, b: any) => b.clicks - a.clicks)
      .slice(0, 50)
  }
  
  async detectPositionChanges(threshold: number = 5) {
    // Comparer les positions actuelles avec celles de la semaine précédente
    const currentWeek = await this.getTopQueries(7)
    const previousWeek = await this.getTopQueries(14) // 7-14 jours
    
    const changes = []
    
    for (const current of currentWeek) {
      const previous = previousWeek.find((p: any) => p.keys[0] === current.keys[0])
      
      if (previous) {
        const positionChange = previous.position - current.position
        
        if (Math.abs(positionChange) >= threshold) {
          changes.push({
            query: current.keys[0],
            currentPosition: current.position,
            previousPosition: previous.position,
            change: positionChange,
            clicks: current.clicks,
            impressions: current.impressions
          })
        }
      }
    }
    
    return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
  }
}
```

## 6. Alertes et Notifications

### Configuration des Webhooks

```javascript
// src/lib/seo-alerts.ts
export class SEOAlertManager {
  private webhooks = {
    slack: process.env.SLACK_WEBHOOK_URL,
    discord: process.env.DISCORD_WEBHOOK_URL,
    email: process.env.EMAIL_WEBHOOK_URL
  }
  
  async sendAlert(alert: SEOAlert) {
    const message = this.formatAlert(alert)
    
    // Envoyer sur tous les canaux configurés
    const promises = []
    
    if (this.webhooks.slack) {
      promises.push(this.sendSlackAlert(message))
    }
    
    if (this.webhooks.discord) {
      promises.push(this.sendDiscordAlert(message))
    }
    
    if (this.webhooks.email) {
      promises.push(this.sendEmailAlert(alert))
    }
    
    await Promise.allSettled(promises)
  }
  
  private formatAlert(alert: SEOAlert): string {
    const icons = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    }
    
    return `${icons[alert.level]} **Alerte SEO Kamlease**
    
**Type:** ${alert.type}
**Niveau:** ${alert.level}
**Message:** ${alert.message}
**Page:** ${alert.page || 'N/A'}
**Timestamp:** ${new Date(alert.timestamp).toLocaleString('fr-FR')}

${alert.details ? `**Détails:** ${alert.details}` : ''}
${alert.action ? `**Action recommandée:** ${alert.action}` : ''}`
  }
  
  private async sendSlackAlert(message: string) {
    try {
      await fetch(this.webhooks.slack!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      })
    } catch (error) {
      console.error('Erreur envoi Slack:', error)
    }
  }
}

interface SEOAlert {
  type: string
  level: 'critical' | 'warning' | 'info' | 'success'
  message: string
  page?: string
  timestamp: string
  details?: string
  action?: string
}
```

## 7. Rapports Automatisés

### Rapport Quotidien

```javascript
// scripts/daily-seo-report.js
import { SearchConsoleMonitor } from '../src/lib/search-console-monitor.js'
import { WebVitalsMonitor } from '../src/lib/web-vitals-monitoring.js'
import { SEOAlertManager } from '../src/lib/seo-alerts.js'

async function generateDailyReport() {
  const alertManager = new SEOAlertManager()
  
  try {
    // 1. Vérifier les Core Web Vitals
    const vitalsReport = await checkCoreWebVitals()
    
    // 2. Vérifier les erreurs GSC
    const gscErrors = await checkSearchConsoleErrors()
    
    // 3. Vérifier l'indexation
    const indexationStatus = await checkIndexationStatus()
    
    // 4. Générer le rapport
    const report = {
      date: new Date().toISOString().split('T')[0],
      coreWebVitals: vitalsReport,
      searchConsoleErrors: gscErrors,
      indexation: indexationStatus,
      summary: generateSummary(vitalsReport, gscErrors, indexationStatus)
    }
    
    // 5. Envoyer les alertes si nécessaire
    if (report.summary.criticalIssues > 0) {
      await alertManager.sendAlert({
        type: 'daily_report_critical',
        level: 'critical',
        message: `${report.summary.criticalIssues} problèmes critiques détectés`,
        timestamp: new Date().toISOString(),
        details: JSON.stringify(report.summary)
      })
    }
    
    // 6. Sauvegarder le rapport
    await saveReport(report)
    
    console.log('✅ Rapport quotidien généré avec succès')
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport:', error)
    
    await alertManager.sendAlert({
      type: 'report_generation_error',
      level: 'critical',
      message: 'Échec de la génération du rapport quotidien',
      timestamp: new Date().toISOString(),
      details: error.message
    })
  }
}

// Exécuter le rapport
generateDailyReport()
```

## 8. Configuration des Cron Jobs

### Crontab Configuration

```bash
# Éditer la crontab
crontab -e

# Ajouter les tâches SEO
# Rapport quotidien à 8h00
0 8 * * * cd /path/to/kamlease && node scripts/daily-seo-report.js

# Vérification Lighthouse à 9h00
0 9 * * * cd /path/to/kamlease && bash scripts/daily-lighthouse-check.sh

# Rapport hebdomadaire le lundi à 10h00
0 10 * * 1 cd /path/to/kamlease && node scripts/weekly-seo-report.js

# Audit mensuel le 1er de chaque mois à 11h00
0 11 1 * * cd /path/to/kamlease && node scripts/monthly-seo-audit.js

# Génération du sitemap après chaque déploiement
@reboot cd /path/to/kamlease && npm run generate:sitemap
```

## 9. Dashboard de Monitoring

### Configuration Grafana/Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'kamlease-seo'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics/seo'
    scrape_interval: 60s

  - job_name: 'lighthouse'
    static_configs:
      - targets: ['localhost:3002']
    metrics_path: '/metrics/lighthouse'
    scrape_interval: 300s
```

### Métriques Personnalisées

```javascript
// src/lib/seo-metrics.ts
import { register, Gauge, Counter, Histogram } from 'prom-client'

export class SEOMetrics {
  private static instance: SEOMetrics
  
  private coreWebVitalsGauge = new Gauge({
    name: 'seo_core_web_vitals',
    help: 'Core Web Vitals metrics',
    labelNames: ['metric', 'page', 'device']
  })
  
  private lighthouseScoreGauge = new Gauge({
    name: 'seo_lighthouse_score',
    help: 'Lighthouse SEO score',
    labelNames: ['category', 'page']
  })
  
  private keywordPositionsGauge = new Gauge({
    name: 'seo_keyword_positions',
    help: 'Keyword positions in search results',
    labelNames: ['keyword', 'page']
  })
  
  private organicTrafficCounter = new Counter({
    name: 'seo_organic_traffic_total',
    help: 'Total organic traffic',
    labelNames: ['page', 'source']
  })
  
  static getInstance(): SEOMetrics {
    if (!SEOMetrics.instance) {
      SEOMetrics.instance = new SEOMetrics()
    }
    return SEOMetrics.instance
  }
  
  updateCoreWebVitals(metric: string, value: number, page: string, device: string) {
    this.coreWebVitalsGauge.set({ metric, page, device }, value)
  }
  
  updateLighthouseScore(category: string, score: number, page: string) {
    this.lighthouseScoreGauge.set({ category, page }, score)
  }
  
  updateKeywordPosition(keyword: string, position: number, page: string) {
    this.keywordPositionsGauge.set({ keyword, page }, position)
  }
  
  incrementOrganicTraffic(page: string, source: string) {
    this.organicTrafficCounter.inc({ page, source })
  }
  
  getMetrics() {
    return register.metrics()
  }
}
```

## 10. Checklist de Déploiement

### Avant le Déploiement

- [ ] Tests SEO automatisés passés
- [ ] Lighthouse CI validé
- [ ] Sitemap généré et validé
- [ ] Robots.txt vérifié
- [ ] Données structurées validées
- [ ] Meta tags vérifiés
- [ ] URLs canoniques configurées
- [ ] Redirections testées

### Après le Déploiement

- [ ] Soumettre le sitemap à GSC
- [ ] Vérifier l'indexation des nouvelles pages
- [ ] Tester les Core Web Vitals
- [ ] Valider les données structurées
- [ ] Vérifier les alertes de monitoring
- [ ] Contrôler les métriques de performance

### Rollback si Nécessaire

```bash
# Script de rollback SEO
#!/bin/bash
echo "🔄 Rollback SEO en cours..."

# Restaurer l'ancien sitemap
cp backup/sitemap.xml public/sitemap.xml

# Restaurer les anciennes configurations
git checkout HEAD~1 -- src/lib/seo-config.ts

# Régénérer les assets
npm run build

# Notifier l'équipe
curl -X POST "$SLACK_WEBHOOK" -d '{"text":"🔄 Rollback SEO effectué sur kamlease.com"}'

echo "✅ Rollback terminé"
```

Cette configuration complète assure un monitoring SEO robuste et automatisé pour le site Kamlease.