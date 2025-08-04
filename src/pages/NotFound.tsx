import { Button } from '@/components/ui/button';
import { SimpleSEOHead } from '@/components/SEOHead';
import { useLanguage } from '@/contexts/LanguageProvider';

export default function NotFoundPage() {
  const { language } = useLanguage()
  
  const title = language === 'fr' ? 'Page non trouvée - Kamlease' : 'Page Not Found - Kamlease'
  const description = language === 'fr' 
    ? 'La page que vous recherchez n\'existe pas ou a été déplacée.'
    : 'The page you\'re looking for doesn\'t exist or may have been moved.'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6 text-center">
      <SimpleSEOHead 
        title={title}
        description={description}
        noindex={true}
      />
      <div className="space-y-6 max-w-md">
        <div className="space-y-3">
          <h1 className="text-8xl font-bold text-blue-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or may have been moved.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
