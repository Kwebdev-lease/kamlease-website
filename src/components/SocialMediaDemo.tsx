import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageProvider'
import { SocialImageGenerator, useSocialImageGenerator } from '@/lib/social-image-generator'
import { useSocialMediaOptimizer } from '@/lib/social-media-optimizer'
import { pagesSEOData, seoConfig } from '@/lib/seo-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink, Download, Eye, Share2, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface SocialPreview {
  platform: string
  title: string
  description: string
  image: string
  url: string
  dimensions: string
}

/**
 * Demo component showcasing social media integration features
 */
export function SocialMediaDemo() {
  const { language } = useLanguage()
  const { generateImage, getOptimizedUrl, createConfig } = useSocialImageGenerator()
  const { optimizeForAllPlatforms, validateOptimization, generateMetaTags, generateSharingUrls } = useSocialMediaOptimizer()
  const [selectedPage, setSelectedPage] = useState<string>('home')
  const [socialPreviews, setSocialPreviews] = useState<SocialPreview[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [optimization, setOptimization] = useState<any>(null)
  const [validation, setValidation] = useState<any>(null)

  // Get current page data
  const pageData = pagesSEOData[selectedPage as keyof typeof pagesSEOData]

  useEffect(() => {
    generateSocialPreviews()
  }, [selectedPage, language])

  const generateSocialPreviews = async () => {
    if (!pageData) return

    setIsGenerating(true)
    
    try {
      // Generate comprehensive optimization
      const socialOptimization = await optimizeForAllPlatforms(pageData, language)
      setOptimization(socialOptimization)
      
      // Validate the optimization
      const validationResult = validateOptimization(socialOptimization)
      setValidation(validationResult)
      
      const previews: SocialPreview[] = [
        {
          platform: 'Open Graph',
          title: socialOptimization.openGraph.title,
          description: socialOptimization.openGraph.description,
          image: socialOptimization.images.openGraph,
          url: socialOptimization.openGraph.url,
          dimensions: '1200 × 630'
        },
        {
          platform: 'Twitter Card',
          title: socialOptimization.twitter.title,
          description: socialOptimization.twitter.description,
          image: socialOptimization.images.twitter,
          url: socialOptimization.openGraph.url,
          dimensions: '1200 × 600'
        },
        {
          platform: 'LinkedIn',
          title: socialOptimization.linkedin.title,
          description: socialOptimization.linkedin.description,
          image: socialOptimization.images.linkedin,
          url: socialOptimization.linkedin.url,
          dimensions: '1200 × 627'
        }
      ]

      setSocialPreviews(previews)
    } catch (error) {
      console.error('Error generating social previews:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCustomImage = async (platform: 'og' | 'twitter' | 'linkedin') => {
    if (!pageData) return

    setIsGenerating(true)
    
    try {
      const config = createConfig(
        pageData.title[language],
        pageData.description[language],
        language,
        selectedPage === 'contact' ? 'contact' : selectedPage === 'about' ? 'service' : 'default'
      )

      const generatedImage = await generateImage(config, platform)
      
      // Create download link
      const link = document.createElement('a')
      link.download = `${selectedPage}-${platform}-${language}.png`
      link.href = generatedImage.url
      link.click()
    } catch (error) {
      console.error('Error generating custom image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyMetaTags = (platform: string) => {
    if (!pageData) return

    const title = pageData.title[language]
    const description = pageData.description[language]
    const imageUrl = getOptimizedUrl(selectedPage, language, platform.toLowerCase() as any)
    const pageUrl = `${seoConfig.site.url}${language === 'en' ? '/en' : ''}${pageData.canonicalUrl}`

    let metaTags = ''

    if (platform === 'Open Graph') {
      metaTags = `<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:type" content="${pageData.type || 'website'}" />
<meta property="og:site_name" content="${seoConfig.site.name}" />
<meta property="og:locale" content="${language === 'fr' ? 'fr_FR' : 'en_US'}" />`
    } else if (platform === 'Twitter Card') {
      metaTags = `<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl}" />
<meta name="twitter:site" content="${seoConfig.socialMedia.twitter.site}" />
<meta name="twitter:creator" content="${seoConfig.socialMedia.twitter.creator}" />`
    }

    navigator.clipboard.writeText(metaTags)
  }

  const testSocialSharing = (platform: string, preview: SocialPreview) => {
    if (!optimization) return
    
    const sharingUrls = generateSharingUrls(preview.url, preview.title, preview.description)
    let shareUrl = ''
    
    switch (platform) {
      case 'Open Graph':
        shareUrl = sharingUrls.facebook
        break
      case 'Twitter Card':
        shareUrl = sharingUrls.twitter
        break
      case 'LinkedIn':
        shareUrl = sharingUrls.linkedin
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          {language === 'fr' ? 'Démonstration Réseaux Sociaux' : 'Social Media Demo'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'fr' 
            ? 'Testez et prévisualisez les balises Open Graph et Twitter Cards'
            : 'Test and preview Open Graph and Twitter Cards tags'
          }
        </p>
      </div>

      {/* Page Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? 'Sélection de Page' : 'Page Selection'}
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Choisissez une page pour voir ses métadonnées sociales'
              : 'Choose a page to see its social media metadata'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(pagesSEOData).map((pageId) => (
              <Button
                key={pageId}
                variant={selectedPage === pageId ? 'default' : 'outline'}
                onClick={() => setSelectedPage(pageId)}
                className="capitalize"
              >
                {pageId === 'legal-notice' ? 'Legal' : pageId === 'privacy-policy' ? 'Privacy' : pageId}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Media Previews */}
      <Tabs defaultValue="previews" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="previews">
            {language === 'fr' ? 'Aperçus' : 'Previews'}
          </TabsTrigger>
          <TabsTrigger value="meta-tags">
            {language === 'fr' ? 'Meta Tags' : 'Meta Tags'}
          </TabsTrigger>
          <TabsTrigger value="validation">
            {language === 'fr' ? 'Validation' : 'Validation'}
          </TabsTrigger>
          <TabsTrigger value="optimization">
            {language === 'fr' ? 'Optimisation' : 'Optimization'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="previews" className="space-y-4">
          {isGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>{language === 'fr' ? 'Génération en cours...' : 'Generating...'}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {socialPreviews.map((preview) => (
                <Card key={preview.platform} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{preview.platform}</CardTitle>
                      <Badge variant="secondary">{preview.dimensions}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Image Preview */}
                    <div className="aspect-[1200/630] bg-muted rounded-lg overflow-hidden">
                      <img
                        src={preview.image}
                        alt={`${preview.platform} preview`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default logo if image fails to load
                          (e.target as HTMLImageElement).src = `${seoConfig.site.url}${seoConfig.site.logo}`
                        }}
                      />
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{preview.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{preview.description}</p>
                      <p className="text-xs text-muted-foreground truncate">{preview.url}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyMetaTags(preview.platform)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {language === 'fr' ? 'Copier Tags' : 'Copy Tags'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateCustomImage(preview.platform.toLowerCase().replace(' ', '').replace('card', '') as any)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        {language === 'fr' ? 'Télécharger' : 'Download'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testSocialSharing(preview.platform, preview)}
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        {language === 'fr' ? 'Tester' : 'Test'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meta-tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'fr' ? 'Balises Meta Générées' : 'Generated Meta Tags'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Copiez ces balises dans votre HTML'
                  : 'Copy these tags into your HTML'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {language === 'fr' ? 'Balises Complètes' : 'Complete Tags'}
                    </h4>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                      {generateMetaTags(optimization)}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => navigator.clipboard.writeText(generateMetaTags(optimization))}
                    >
                      {language === 'fr' ? 'Copier Tout' : 'Copy All'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'fr' ? 'Outils de Validation' : 'Validation Tools'}
                </CardTitle>
                <CardDescription>
                  {language === 'fr' 
                    ? 'Testez vos balises avec ces outils officiels'
                    : 'Test your tags with these official tools'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://developers.facebook.com/tools/debug/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Facebook Sharing Debugger
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://cards-dev.twitter.com/validator', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Twitter Card Validator
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://www.linkedin.com/post-inspector/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  LinkedIn Post Inspector
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'fr' ? 'Recommandations' : 'Recommendations'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h5 className="font-semibold">Open Graph</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• {language === 'fr' ? 'Titre: max 95 caractères' : 'Title: max 95 characters'}</li>
                    <li>• {language === 'fr' ? 'Description: max 300 caractères' : 'Description: max 300 characters'}</li>
                    <li>• {language === 'fr' ? 'Image: 1200×630px minimum' : 'Image: 1200×630px minimum'}</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold">Twitter Card</h5>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• {language === 'fr' ? 'Titre: max 70 caractères' : 'Title: max 70 characters'}</li>
                    <li>• {language === 'fr' ? 'Description: max 200 caractères' : 'Description: max 200 characters'}</li>
                    <li>• {language === 'fr' ? 'Image: 1200×600px recommandé' : 'Image: 1200×600px recommended'}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {validation && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {validation.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {language === 'fr' ? 'État de Validation' : 'Validation Status'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={validation.isValid ? 'default' : 'destructive'}>
                      {validation.isValid 
                        ? (language === 'fr' ? 'Valide' : 'Valid')
                        : (language === 'fr' ? 'Erreurs Détectées' : 'Errors Detected')
                      }
                    </Badge>
                  </div>

                  {validation.errors.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-red-600 mb-2">
                        {language === 'fr' ? 'Erreurs' : 'Errors'}
                      </h5>
                      <ul className="text-sm space-y-1">
                        {validation.errors.map((error: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-yellow-600 mb-2">
                        {language === 'fr' ? 'Avertissements' : 'Warnings'}
                      </h5>
                      <ul className="text-sm space-y-1">
                        {validation.warnings.map((warning: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-blue-600 mb-2">
                        {language === 'fr' ? 'Recommandations' : 'Recommendations'}
                      </h5>
                      <ul className="text-sm space-y-1">
                        {validation.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'fr' ? 'Métriques d\'Optimisation' : 'Optimization Metrics'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {optimization && (
                    <div className="space-y-3 text-sm">
                      <div>
                        <h5 className="font-semibold">Open Graph</h5>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <span className="text-muted-foreground">
                              {language === 'fr' ? 'Titre:' : 'Title:'}
                            </span>
                            <span className={`ml-2 ${optimization.openGraph.title.length > 95 ? 'text-red-500' : 'text-green-500'}`}>
                              {optimization.openGraph.title.length}/95
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {language === 'fr' ? 'Description:' : 'Description:'}
                            </span>
                            <span className={`ml-2 ${optimization.openGraph.description.length > 300 ? 'text-red-500' : 'text-green-500'}`}>
                              {optimization.openGraph.description.length}/300
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold">Twitter Card</h5>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <span className="text-muted-foreground">
                              {language === 'fr' ? 'Titre:' : 'Title:'}
                            </span>
                            <span className={`ml-2 ${optimization.twitter.title.length > 70 ? 'text-red-500' : 'text-green-500'}`}>
                              {optimization.twitter.title.length}/70
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {language === 'fr' ? 'Description:' : 'Description:'}
                            </span>
                            <span className={`ml-2 ${optimization.twitter.description.length > 200 ? 'text-red-500' : 'text-green-500'}`}>
                              {optimization.twitter.description.length}/200
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold">LinkedIn</h5>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <span className="text-muted-foreground">
                              {language === 'fr' ? 'Titre:' : 'Title:'}
                            </span>
                            <span className={`ml-2 ${optimization.linkedin.title.length > 200 ? 'text-red-500' : 'text-green-500'}`}>
                              {optimization.linkedin.title.length}/200
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {language === 'fr' ? 'Description:' : 'Description:'}
                            </span>
                            <span className={`ml-2 ${optimization.linkedin.description.length > 256 ? 'text-red-500' : 'text-green-500'}`}>
                              {optimization.linkedin.description.length}/256
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}