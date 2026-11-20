import { Button } from '../components/ui/Button'
import { useI18n } from '../i18n'
import { StarCluster } from '../components/brand/StarCluster'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="flex animate-fade flex-col items-center py-16 text-center">
      <StarCluster className="w-[190px] opacity-70" />
      <h1 className="mt-12 font-display text-[20px] tracking-[0.04em] text-starlight/85">
        {t('notFound.title')}
      </h1>
      <p className="mt-4 max-w-[320px] text-[13px] leading-[1.95] text-dust/70">
        {t('notFound.body')}
      </p>
      <Link to="/universe" className="mt-10">
        <Button variant="ghost">{t('nav.universe')}</Button>
      </Link>
    </div>
  )
}
