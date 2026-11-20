import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EntryCard } from '../components/entry/EntryCard'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { useAppData } from '../data/AppData'
import { CATEGORIES, isCategory, type Category, type Entry } from '../data/types'
import { useI18n, type MessageKey } from '../i18n'
import { compareEntriesDesc, formatMonthLabel, monthKeyOf } from '../lib/date'

const CATEGORY_LABEL: Record<Category, MessageKey> = {
  wealth: 'world.wealth',
  health: 'world.health',
  journey: 'world.journey',
  memories: 'world.memories',
}

export function TimelinePage() {
  const { t, lang } = useI18n()
  const { entries } = useAppData()
  const [params, setParams] = useSearchParams()

  const raw = params.get('category')
  const active: Category | 'all' = isCategory(raw) ? raw : 'all'

  const groups = useMemo(() => {
    const filtered = entries
      .filter((entry) => active === 'all' || entry.category === active)
      .slice()
      .sort(compareEntriesDesc)

    const result: { key: string; entries: Entry[] }[] = []
    for (const entry of filtered) {
      const key = monthKeyOf(entry)
      const last = result[result.length - 1]
      if (last && last.key === key) last.entries.push(entry)
      else result.push({ key, entries: [entry] })
    }
    return result
  }, [entries, active])

  return (
    <div className="animate-fade">
      <header>
        <h1 className="font-display text-[24px] tracking-[0.04em] text-starlight/95 sm:text-[27px]">
          {t('timeline.title')}
        </h1>
        <p className="mt-3 text-[9.5px] uppercase tracking-[0.3em] text-dust/45">
          {t('timeline.count', { n: entries.length })}
        </p>
      </header>

      <div className="-mx-6 mt-8 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={active === 'all'} onClick={() => setParams({}, { replace: true })}>
          {t('timeline.all')}
        </Chip>
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            active={active === category}
            onClick={() => setParams({ category }, { replace: true })}
          >
            {t(CATEGORY_LABEL[category])}
          </Chip>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState title={t('timeline.emptyTitle')} body={t('timeline.emptyBody')} />
      ) : (
        <div className="mt-10">
          {groups.map((group) => (
            <section key={group.key} className="mb-6">
              <h2 className="sticky top-0 z-10 -mx-6 bg-[var(--app-surface)]/92 px-6 py-3 text-[9.5px] uppercase tracking-[0.3em] text-dust/50 backdrop-blur sm:-mx-0 sm:px-0">
                {formatMonthLabel(group.key, lang)}
              </h2>
              <div className="divide-y divide-divider/50 border-t border-divider/50">
                {group.entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
