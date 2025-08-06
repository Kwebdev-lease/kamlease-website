import { useLanguage } from '@/contexts/LanguageProvider'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function LegalNotice() {
  const { t } = useLanguage()

  const goBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          onClick={goBack}
          variant="outline"
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('legal.back')}
        </Button>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {t('legal.notice.title')}
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('legal.notice.publisher.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.notice.publisher.content')}
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>{t('legal.notice.company')}:</strong> Kamlease</li>
              <li><strong>{t('legal.notice.address')}:</strong> 123 Rue de l'Innovation, 75001 Paris, France</li>
              <li><strong>{t('legal.notice.phone')}:</strong> +33 1 23 45 67 89</li>
              <li><strong>{t('legal.notice.email')}:</strong> contact@kamlease.com</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('legal.notice.hosting.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.hosting.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('legal.notice.intellectual.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.intellectual.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('legal.notice.liability.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.liability.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('legal.notice.applicable.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.notice.applicable.content')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}