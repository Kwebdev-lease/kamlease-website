import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageProvider'
import { Language } from '@/lib/translations'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-1">
      <Button
        variant={language === 'fr' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setLanguage('fr')}
        className={`border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          language === 'fr' ? 'bg-orange-500 border-orange-500 hover:bg-orange-600' : ''
        }`}
        title="Français"
      >
        <span className="text-base">🇫🇷</span>
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setLanguage('en')}
        className={`border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          language === 'en' ? 'bg-orange-500 border-orange-500 hover:bg-orange-600' : ''
        }`}
        title="English"
      >
        <span className="text-base">🇬🇧</span>
      </Button>
    </div>
  )
}