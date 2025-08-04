import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Globe, 
  Smartphone,
  Monitor,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { seoMonitoring } from '@/lib/seo-monitoring'
import { useLanguage } from '@/contexts/LanguageProvider'

interface SEOMetrics {
  lighthouse: {
    seo: number
    performance: number
    accessibility: number
    bestPractices: number
    lastUpdated: string
  }
  coreWebVitals: {
    lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }
    fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }
    cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }
    lastUpdated: string
  }
  keywords: {
    totalTracked: number
    topPositions: number
    averagePosition: number
    trending: Array<{
      keyword: string
      position: number
      change: number
      clicks: number
    }>
  }
  indexation: {
    totalPages: number
    indexedPages: number
    errors: number
    warnings: number
  }
  traffic: {
    organicSessions: number
    organicUsers: number
    bounceRate: number
    avgSessionDuration: number
    conversionRate: number
  }
}

export function SEOMonitoringDashboard() {
  const { language } = useLanguage()
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [alerts, setAlerts] = useState<Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: string
  }>>([])

  useEffect(() => {
    loadMetrics()
    
    // Actualiser toutes les 5 minutes
    const interval = setInterval(loadMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      
      // Simuler le chargement des métriques (à remplacer par de vraies API)
      const mockMetrics: SEOMetrics = {
        lighthouse: {
          seo: 95,
          performance: 88,
          accessibility: 92,
          bestPractices: 90,
          lastUpdated: new Date().toISOString()
        },
        coreWebVitals: {
          lcp: { value: 2.1, rating: 'good' },
          fid: { value: 85, rating: 'good' },
          cls: { value: 0.08, rating: 'good' },
          lastUpdated: new Date().toISOString()
        },
        keywords: {
          totalTracked: 45,
          topPositions: 12,
          averagePosition: 8.5,
          trending: [
            { keyword: 'solutions mécatroniques', position: 3, change: 2, clicks: 156 },
            { keyword: 'électronique industrielle', position: 5, change: -1, clicks: 89 },
            { keyword: 'auto-staging', position: 7, change: 3, clicks: 67 },
            { keyword: 'ingénierie mécatronique', position: 12, change: 0, clicks: 34 }
          ]
        },
        indexation: {
          totalPages: 8,
          indexedPages: 8,
          errors: 0,
          warnings: 1
        },
        traffic: {
          organicSessions: 1247,
          organicUsers: 892,
          bounceRate: 0.32,
          avgSessionDuration: 185,
          conversionRate: 0.045
        }
      }
      
      setMetrics(mockMetrics)
      setLastRefresh(new Date())
      
      // Vérifier les alertes
      checkAlerts(mockMetrics)
      
    } catch (error) {
      console.error('Erreur lors du chargement des métriques SEO:', error)
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger les métriques SEO',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const checkAlerts = (metrics: SEOMetrics) => {
    const newAlerts = []
    
    // Vérifier les Core Web Vitals
    if (metrics.coreWebVitals.lcp.rating === 'poor') {
      newAlerts.push({
        id: 'cwv-lcp',
        type: 'error' as const,
        title: 'LCP Critique',
        message: `Largest Contentful Paint trop élevé: ${metrics.coreWebVitals.lcp.value}s`,
        timestamp: new Date().toISOString()
      })
    }
    
    // Vérifier le score Lighthouse
    if (metrics.lighthouse.seo < 90) {
      newAlerts.push({
        id: 'lighthouse-seo',
        type: 'warning' as const,
        title: 'Score SEO Lighthouse',
        message: `Score SEO en dessous de 90: ${metrics.lighthouse.seo}`,
        timestamp: new Date().toISOString()
      })
    }
    
    // Vérifier les erreurs d'indexation
    if (metrics.indexation.errors > 0) {
      newAlerts.push({
        id: 'indexation-errors',
        type: 'error' as const,
        title: 'Erreurs d\'indexation',
        message: `${metrics.indexation.errors} erreurs d'indexation détectées`,
        timestamp: new Date().toISOString()
      })
    }
    
    setAlerts(newAlerts)
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'good': return <Badge variant="default" className="bg-green-100 text-green-800">Bon</Badge>
      case 'needs-improvement': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">À améliorer</Badge>
      case 'poor': return <Badge variant="destructive">Critique</Badge>
      default: return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des métriques SEO...</span>
      </div>
    )
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les métriques SEO. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard SEO</h2>
          <p className="text-muted-foreground">
            Dernière mise à jour: {lastRefresh.toLocaleString('fr-FR')}
          </p>
        </div>
        <Button onClick={loadMetrics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
          <TabsTrigger value="indexation">Indexation</TabsTrigger>
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Scores Lighthouse */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SEO</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.lighthouse.seo}</div>
                <Progress value={metrics.lighthouse.seo} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.lighthouse.performance}</div>
                <Progress value={metrics.lighthouse.performance} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accessibilité</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.lighthouse.accessibility}</div>
                <Progress value={metrics.lighthouse.accessibility} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bonnes pratiques</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.lighthouse.bestPractices}</div>
                <Progress value={metrics.lighthouse.bestPractices} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>Métriques de performance utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">LCP</span>
                    {getRatingBadge(metrics.coreWebVitals.lcp.rating)}
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.coreWebVitals.lcp.value}s
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Largest Contentful Paint
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">FID</span>
                    {getRatingBadge(metrics.coreWebVitals.fid.rating)}
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.coreWebVitals.fid.value}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    First Input Delay
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CLS</span>
                    {getRatingBadge(metrics.coreWebVitals.cls.rating)}
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.coreWebVitals.cls.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cumulative Layout Shift
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métriques de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Score Lighthouse Performance</span>
                  <Badge variant={metrics.lighthouse.performance >= 90 ? 'default' : 'secondary'}>
                    {metrics.lighthouse.performance}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>LCP (Largest Contentful Paint)</span>
                  <span className={getRatingColor(metrics.coreWebVitals.lcp.rating)}>
                    {metrics.coreWebVitals.lcp.value}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>FID (First Input Delay)</span>
                  <span className={getRatingColor(metrics.coreWebVitals.fid.rating)}>
                    {metrics.coreWebVitals.fid.value}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CLS (Cumulative Layout Shift)</span>
                  <span className={getRatingColor(metrics.coreWebVitals.cls.rating)}>
                    {metrics.coreWebVitals.cls.value}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {metrics.lighthouse.performance < 90 && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span>Optimiser les images et activer la compression</span>
                    </div>
                  )}
                  {metrics.coreWebVitals.lcp.rating !== 'good' && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Améliorer le temps de chargement du contenu principal</span>
                    </div>
                  )}
                  {metrics.coreWebVitals.cls.rating !== 'good' && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Réduire les décalages de mise en page</span>
                    </div>
                  )}
                  {metrics.lighthouse.performance >= 90 && 
                   metrics.coreWebVitals.lcp.rating === 'good' && 
                   metrics.coreWebVitals.cls.rating === 'good' && (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Toutes les métriques de performance sont optimales</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Mots-clés suivis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.keywords.totalTracked}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.keywords.topPositions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Position moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.keywords.averagePosition}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Évolution des positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.keywords.trending.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{keyword.keyword}</p>
                      <p className="text-xs text-muted-foreground">
                        {keyword.clicks} clics
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">#{keyword.position}</Badge>
                      {keyword.change > 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">+{keyword.change}</span>
                        </div>
                      ) : keyword.change < 0 ? (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm">{keyword.change}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Pages totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.indexation.totalPages}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pages indexées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.indexation.indexedPages}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Erreurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.indexation.errors}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avertissements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.indexation.warnings}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Statut d'indexation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Taux d'indexation</span>
                  <Badge variant="default">
                    {Math.round((metrics.indexation.indexedPages / metrics.indexation.totalPages) * 100)}%
                  </Badge>
                </div>
                <Progress 
                  value={(metrics.indexation.indexedPages / metrics.indexation.totalPages) * 100} 
                  className="mt-2" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sessions organiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.traffic.organicSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">30 derniers jours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs organiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.traffic.organicUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">30 derniers jours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taux de rebond</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(metrics.traffic.bounceRate * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Trafic organique</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Durée moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(metrics.traffic.avgSessionDuration)}
                </div>
                <p className="text-xs text-muted-foreground">Par session</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taux de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics.traffic.conversionRate * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Trafic organique</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Liens utiles */}
      <Card>
        <CardHeader>
          <CardTitle>Outils SEO</CardTitle>
          <CardDescription>Liens vers les outils de monitoring externes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" size="sm" asChild>
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Search Console
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Analytics
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                PageSpeed Insights
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://validator.schema.org" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Schema Validator
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}