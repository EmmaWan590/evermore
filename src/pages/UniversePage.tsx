import { Link } from 'react-router-dom'
import { StarCluster } from '../components/brand/StarCluster'
import { Wordmark } from '../components/brand/Wordmark'
import { useAppData } from '../data/AppData'
import type { Category } from '../data/types'
import { useI18n, type MessageKey } from '../i18n'

const WORLDS: { category: Category; label: MessageKey; line: MessageKey }[] = [
  { category: 'wealth', label: 'world.wealth', line: 'world.wealthLine' },
  { category: 'health', label: 'world.health', line: 'world.healthLine' },
  { category: 'journey', label: 'world.journey', line: 'world.journeyLine' },
  { category: 'memories', label: 'world.memories', line: 'world.memoriesLine' },
]

export function UniversePage() {
  const { t } = useI18n()
  const { entries } = useAppData()

  return (
    <div className="flex animate-fade flex-col items-center pt-6 text-center lg:pt-10">
      <p className="text-[9.5px] uppercase tracking-[0.38em] text-dust/60">{t('home.eyebrow')}</p>

      <StarCluster className="mt-12 w-[300px] opacity-95 sm:mt-16 sm:w-[420px]" />

      <h1 className="mt-14">
        <Wordmark className="text-[21px] sm:text-[26px]" />
      </h1>

      <p className="mt-6 font-display text-[11.5px] tracking-[0.2em] text-starlight/55 sm:text-[12.5px]">
        {t('app.motto')}
      </p>

      {entries.length > 0 ? (
        <p className="mt-7 text-[10px] uppercase tracking-[0.3em] text-dust/45">
          {t('timeline.count', { n: entries.length })}
        </p>
      ) : null}

      <section className="mt-20 grid w-full grid-cols-2 gap-x-6 gap-y-12 sm:mt-24 sm:gap-y-16">
        {WORLDS.map(({ category, label, line }) => (
          <Link
            key={category}
            to={`/timeline?category=${category}`}
            className="group flex flex-col items-center"
          >
            <span className="font-display text-[15px] uppercase tracking-[0.24em] text-starlight/85 transition-colors duration-500 group-hover:text-starlight sm:text-[16px]">
              {t(label)}
            </span>
            <span className="mt-3 h-px w-6 bg-divider transition-colors duration-500 group-hover:bg-eighth/70" />
            <span className="mt-3 max-w-[150px] text-[11px] leading-[1.9] text-dust/65 transition-colors duration-500 group-hover:text-dust sm:text-[12px]">
              {t(line)}
            </span>
          </Link>
        ))}
      </section>

      <Link
        to="/create"
        className="group mt-24 flex flex-col items-center gap-4 pb-6 text-starlight/75 transition-colors duration-500 hover:text-starlight sm:mt-28"
      >
        <span className="text-[10px] uppercase tracking-[0.34em]">{t('home.begin')}</span>
        <span className="h-10 w-px bg-gradient-to-b from-divider via-divider to-transparent transition-colors duration-700 group-hover:from-eighth/70 group-hover:via-eighth/40" />
      </Link>
    </div>
  )
}
