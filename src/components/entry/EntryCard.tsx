import { Link } from 'react-router-dom'
import { useAppData } from '../../data/AppData'
import type { Entry } from '../../data/types'
import { useAttachmentUrl } from '../../features/attachments/useAttachmentUrl'
import { useI18n } from '../../i18n'
import { entryDay, formatDay } from '../../lib/date'
import { cn } from '../../lib/utils'

interface EntryCardProps {
  entry: Entry
  className?: string
}

export function EntryCard({ entry, className }: EntryCardProps) {
  const { t, lang } = useI18n()
  const { objectMap } = useAppData()
  const thumb = useAttachmentUrl(entry.attachmentIds[0], 'thumb')

  const content = entry.content.trim()
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  const hasTitle = entry.title.trim().length > 0
  const title = hasTitle ? entry.title.trim() : firstLine || t('create.untitled')
  const preview = hasTitle ? content : content.split('\n').slice(1).join('\n').trim()
  const names = entry.objectIds
    .map((id) => objectMap.get(id)?.name)
    .filter((name): name is string => Boolean(name))

  const meta = [
    formatDay(entryDay(entry), lang),
    entry.category ? t(`world.${entry.category}`) : null,
    entry.location,
    names.length ? names.join(' · ') : null,
  ].filter((value): value is string => Boolean(value))

  return (
    <Link
      to={`/entry/${entry.id}`}
      className={cn('group flex gap-5 py-7 transition-colors duration-300', className)}
    >
      {thumb ? (
        <img
          src={thumb}
          alt=""
          loading="lazy"
          className="h-[68px] w-[68px] shrink-0 rounded-sm border border-divider/50 object-cover opacity-85 transition-opacity duration-500 group-hover:opacity-100"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-[16px] tracking-[0.01em] text-starlight/85 transition-colors duration-300 group-hover:text-starlight">
          {title}
        </h3>

        {preview ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.9] text-dust/70">{preview}</p>
        ) : null}

        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] uppercase tracking-[0.18em] text-dust/45">
          {meta.map((item) => (
            <span key={item} className="tabular">
              {item}
            </span>
          ))}
        </p>
      </div>
    </Link>
  )
}
