import { Link } from 'react-router-dom'
import { useAppData } from '../data/AppData'
import { OBJECT_KINDS, type ObjectKind } from '../data/types'
import { useI18n, type MessageKey } from '../i18n'

const LABEL: Record<ObjectKind, MessageKey> = {
  person: 'kind.person',
  place: 'kind.place',
  thing: 'kind.thing',
  idea: 'kind.idea',
}

export function ExplorePage() {
  const { t } = useI18n()
  const { objects } = useAppData()

  return (
    <div className="animate-fade">
      <header>
        <h1 className="font-display text-[24px] tracking-[0.04em] text-starlight/95 sm:text-[27px]">
          {t('explore.title')}
        </h1>
        <p className="mt-3 text-[12.5px] leading-relaxed text-dust/60">{t('explore.subtitle')}</p>
      </header>

      <div className="mt-12 grid gap-x-10">
        {OBJECT_KINDS.map((kind) => {
          const items = objects.filter((object) => object.kind === kind)
          return (
            <Link
              key={kind}
              to={`/explore/${kind}`}
              className="group flex items-baseline justify-between gap-6 border-t border-divider/60 py-7 transition-colors duration-300 hover:border-eighth/40"
            >
              <div className="min-w-0">
                <h2 className="font-display text-[16px] uppercase tracking-[0.2em] text-starlight/85 transition-colors duration-300 group-hover:text-starlight">
                  {t(LABEL[kind])}
                </h2>
                <p className="mt-2.5 truncate text-[11.5px] leading-[1.9] text-dust/55">
                  {items.length > 0
                    ? items
                        .slice(0, 6)
                        .map((item) => item.name)
                        .join(' · ')
                    : t('explore.empty')}
                </p>
              </div>
              <span className="tabular shrink-0 text-[10px] tracking-[0.1em] text-dust/35">
                {items.length > 0 ? items.length : ''}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
