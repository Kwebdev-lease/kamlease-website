import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SEOMonitoringDashboard } from './SEOMonitoringDashboard';
import { seoMonitoring } from '../lib/seo-monitoring';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';

/**
 * Composant de démonstration du système de monitoring SEO
 * Montre les capacités du système de monitoring en temps réel
 */
export const SEOMonitoringDemo: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    {
      title: "Collecte des Core Web Vitals",
      description: "Mesure des métriques de performance en temps réel",
      icon: <Zap className="h-5 w-5" />,
      action: async () => {
        const vitals = await seoMonitoring.measureCoreWebVitals();
        setDemoData({ vitals });
      }
    },
    {
      title: "Analyse des métriques SEO",
      description: "Évaluation du contenu et de la structure SEO",
      icon: <Eye className="h-5 w-5" />,
      action: async () => {
        const seoMetrics = seoMonitoring.analyzeSEOMetrics();
        setDemoData(prev => ({ ...prev, seoMetrics }));
      }
    },
    {
      title: "Génération d'alertes",
      description: "Détection automatique des problèmes SEO",
      icon: <AlertTriangle className="h-5 w-5" />,
      action: async () => {
        const monitoringData = await seoMonitoring.collectMonitoringData();
        const alerts = seoMonitoring.getActiveAlerts();
        setDemoData(prev => ({ ...prev, alerts, monitoringData }));
      }
    },
    {
      title: "Rapport de performance",
      description: "Génération du rapport complet avec recommandations",
      icon: <BarChart3 className="h-5 w-5" />,
      action: async () => {
        const report = seoMonitoring.generatePerformanceReport();
        setDemoData(prev => ({ ...prev, report }));
      }
    }
  ];

  const runDemo = async () => {
    setIsMonitoring(true);
    setDemoData(null);
    setDemoStep(0);

    for (let i = 0; i < demoSteps.length; i++) {
      setDemoStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause pour l'effet visuel
      await demoSteps[i].action();
      await new Promise(resolve => setTimeout(resolve, 1500)); // Pause entre les étapes
    }

    setIsMonitoring(false);
  };

  const stopDemo = () => {
    setIsMonitoring(false);
    setDemoStep(0);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getVitalStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Démonstration du Monitoring SEO</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez comment notre système de monitoring SEO analyse en temps réel 
          les performances, détecte les problèmes et génère des recommandations automatiques.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={runDemo} 
            disabled={isMonitoring}
            size="lg"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isMonitoring ? 'Analyse en cours...' : 'Lancer la démonstration'}
          </Button>
          
          {isMonitoring && (
            <Button 
              onClick={stopDemo} 
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Arrêter
            </Button>
          )}
        </div>
      </div>

      {/* Étapes de la démonstration */}
      {isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression de l'analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    index === demoStep ? 'bg-primary/10 border border-primary/20' :
                    index < demoStep ? 'bg-green-50 border border-green-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    index === demoStep ? 'text-primary animate-pulse' :
                    index < demoStep ? 'text-green-600' :
                    'text-gray-400'
                  }`}>
                    {index < demoStep ? <CheckCircle className="h-5 w-5" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <Badge variant={
                    index === demoStep ? 'default' :
                    index < demoStep ? 'default' :
                    'secondary'
                  }>
                    {index === demoStep ? 'En cours' :
                     index < demoStep ? 'Terminé' :
                     'En attente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de la démonstration */}
      {demoData && (
        <Tabs defaultValue="vitals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
            <TabsTrigger value="seo">Métriques SEO</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="report">Rapport</TabsTrigger>
          </TabsList>

          {/* Core Web Vitals */}
          <TabsContent value="vitals" className="space-y-4">
            {demoData.vitals && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">LCP</CardTitle>
                    <CardDescription>Largest Contentful Paint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(demoData.vitals.lcp)}
                    </div>
                    <Badge 
                      variant={getStatusBadge(getVitalStatus(demoData.vitals.lcp, { good: 2500, poor: 4000 }))}
                      className="mt-2"
                    >
                      {getVitalStatus(demoData.vitals.lcp, { good: 2500, poor: 4000 }) === 'good' ? 'Excellent' : 
                       getVitalStatus(demoData.vitals.lcp, { good: 2500, poor: 4000 }) === 'needs-improvement' ? 'À améliorer' : 'Critique'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">FID</CardTitle>
                    <CardDescription>First Input Delay</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(demoData.vitals.fid)}
                    </div>
                    <Badge 
                      variant={getStatusBadge(getVitalStatus(demoData.vitals.fid, { good: 100, poor: 300 }))}
                      className="mt-2"
                    >
                      {getVitalStatus(demoData.vitals.fid, { good: 100, poor: 300 }) === 'good' ? 'Excellent' : 
                       getVitalStatus(demoData.vitals.fid, { good: 100, poor: 300 }) === 'needs-improvement' ? 'À améliorer' : 'Critique'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">CLS</CardTitle>
                    <CardDescription>Cumulative Layout Shift</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {demoData.vitals.cls.toFixed(3)}
                    </div>
                    <Badge 
                      variant={getStatusBadge(getVitalStatus(demoData.vitals.cls, { good: 0.1, poor: 0.25 }))}
                      className="mt-2"
                    >
                      {getVitalStatus(demoData.vitals.cls, { good: 0.1, poor: 0.25 }) === 'good' ? 'Excellent' : 
                       getVitalStatus(demoData.vitals.cls, { good: 0.1, poor: 0.25 }) === 'needs-improvement' ? 'À améliorer' : 'Critique'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">FCP</CardTitle>
                    <CardDescription>First Contentful Paint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(demoData.vitals.fcp)}
                    </div>
                    <Badge 
                      variant={getStatusBadge(getVitalStatus(demoData.vitals.fcp, { good: 1800, poor: 3000 }))}
                      className="mt-2"
                    >
                      {getVitalStatus(demoData.vitals.fcp, { good: 1800, poor: 3000 }) === 'good' ? 'Excellent' : 
                       getVitalStatus(demoData.vitals.fcp, { good: 1800, poor: 3000 }) === 'needs-improvement' ? 'À améliorer' : 'Critique'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Métriques SEO */}
          <TabsContent value="seo" className="space-y-4">
            {demoData.seoMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contenu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Titre de page:</span>
                      <Badge variant={demoData.seoMetrics.pageTitle ? 'default' : 'destructive'}>
                        {demoData.seoMetrics.pageTitle ? 'Présent' : 'Manquant'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Meta description:</span>
                      <Badge variant={demoData.seoMetrics.metaDescription ? 'default' : 'destructive'}>
                        {demoData.seoMetrics.metaDescription ? 'Présente' : 'Manquante'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Titres H1:</span>
                      <Badge variant={demoData.seoMetrics.h1Count === 1 ? 'default' : 'secondary'}>
                        {demoData.seoMetrics.h1Count}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Mots total:</span>
                      <span>{demoData.seoMetrics.wordCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimisation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Images avec alt:</span>
                      <span>{demoData.seoMetrics.imagesWithAlt}/{demoData.seoMetrics.imageCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Liens internes:</span>
                      <span>{demoData.seoMetrics.internalLinks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Données structurées:</span>
                      <Badge variant={demoData.seoMetrics.structuredDataPresent ? 'default' : 'secondary'}>
                        {demoData.seoMetrics.structuredDataPresent ? 'Présentes' : 'Absentes'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>URL canonique:</span>
                      <Badge variant={demoData.seoMetrics.canonicalUrl ? 'default' : 'secondary'}>
                        {demoData.seoMetrics.canonicalUrl ? 'Définie' : 'Non définie'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Alertes */}
          <TabsContent value="alerts" className="space-y-4">
            {demoData.alerts && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertes détectées ({demoData.alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {demoData.alerts.length > 0 ? (
                    <div className="space-y-3">
                      {demoData.alerts.slice(0, 5).map((alert: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border ${
                            alert.type === 'error' ? 'border-red-200 bg-red-50' :
                            alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                            'border-blue-200 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={
                                  alert.type === 'error' ? 'destructive' :
                                  alert.type === 'warning' ? 'secondary' :
                                  'default'
                                }>
                                  {alert.type === 'error' ? 'Erreur' : 
                                   alert.type === 'warning' ? 'Attention' : 'Info'}
                                </Badge>
                              </div>
                              <p className="text-sm">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Page: {alert.page}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-600 mb-2">
                        Aucune alerte détectée
                      </h3>
                      <p className="text-muted-foreground">
                        Toutes les métriques SEO sont optimales !
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rapport */}
          <TabsContent value="report" className="space-y-4">
            {demoData.report && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé des performances</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Pages analysées:</span>
                      <Badge>{demoData.report.summary.totalPages}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>LCP moyen:</span>
                      <span>{formatDuration(demoData.report.summary.averageLCP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FID moyen:</span>
                      <span>{formatDuration(demoData.report.summary.averageFID)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CLS moyen:</span>
                      <span>{demoData.report.summary.averageCLS.toFixed(3)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommandations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {demoData.report.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {demoData.report.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-600 font-medium">Performances optimales !</p>
                        <p className="text-sm text-muted-foreground">
                          Aucune amélioration nécessaire
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Dashboard complet */}
      {!isMonitoring && demoData && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Dashboard SEO Complet</h3>
            <p className="text-muted-foreground">
              Voici le dashboard complet avec toutes les fonctionnalités de monitoring
            </p>
          </div>
          <SEOMonitoringDashboard autoRefresh={false} />
        </div>
      )}
    </div>
  );
};