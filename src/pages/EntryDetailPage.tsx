import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { MetaChip } from '../components/ui/Chip'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { BackIcon } from '../components/ui/icons'
import { useToast } from '../components/ui/Toast'
import { useAppData } from '../data/AppData'
import type { Category, EverObject } from '../data/types'
import { useAttachmentUrl } from '../features/attachments/useAttachmentUrl'
import { useI18n, type MessageKey } from '../i18n'
import { entryDay, formatDay, formatTimestamp } from '../lib/date'

const CATEGORY_LABEL: Record<Category, MessageKey> = {
  wealth: 'world.wealth',
  health: 'world.health',
  journey: 'world.journey',
  memories: 'world.memories',
}

function Photo({ id, onOpen }: { id: string; onOpen: () => void }) {
  const { t } = useI18n()
  const url = useAttachmentUrl(id, 'thumb')
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[4/3] overflow-hidden rounded-sm border border-divider/50 bg-deep"
    >
      {url ? (
        <img
          src={url}
          alt={t('detail.photoAlt')}
          loading="lazy"
          className="h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        />
      ) : null}
    </button>
  )
}

function Lightbox({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useI18n()
  const url = useAttachmentUrl(id, 'full')
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex animate-fade items-center justify-center bg-void/95 p-4"
    >
      {url ? (
        <img src={url} alt={t('detail.photoAlt')} className="max-h-full max-w-full object-contain" />
      ) : null}
    </div>
  )
}

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { t, lang } = useI18n()
  const { entries, objectMap, ready, deleteEntry } = useAppData()

  const [confirming, setConfirming] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const entry = useMemo(() => entries.find((item) => item.id === id), [entries, id])

  if (!ready) return null

  if (!entry) {
    return (
      <div className="animate-fade">
        <EmptyState title={t('detail.notFound')} body={t('notFound.body')} />
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate('/timeline')}>
            {t('detail.back')}
          </Button>
        </div>
      </div>
    )
  }

  const content = entry.content.trim()
  const hasTitle = entry.title.trim().length > 0
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  const title = hasTitle ? entry.title.trim() : firstLine || t('create.untitled')
  const body = hasTitle ? content : content.split('\n').slice(1).join('\n').trim()

  const objects = entry.objectIds
    .map((objectId) => objectMap.get(objectId))
    .filter((object): object is EverObject => Boolean(object))

  const remove = async () => {
    try {
      await deleteEntry(entry.id)
      toast.push(t('toast.deleted'))
      navigate('/timeline', { replace: true })
    } catch {
      toast.push(t('error.generic'))
      setConfirming(false)
    }
  }

  return (
    <article className="animate-fade">
      <Link
        to="/timeline"
        className="inline-flex items-center gap-2 text-[9.5px] uppercase tracking-[0.26em] text-dust/55 transition-colors hover:text-starlight"
      >
        <BackIcon />
        {t('detail.back')}
      </Link>

      <header className="mt-9">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] uppercase tracking-[0.2em] text-dust/50">
          <span className="tabular">{formatDay(entryDay(entry), lang)}</span>
          {entry.category ? <span>{t(CATEGORY_LABEL[entry.category])}</span> : null}
          {entry.location ? <span>{entry.location}</span> : null}
        </p>
        <h1 className="mt-4 font-display text-[23px] leading-[1.45] tracking-[0.01em] text-starlight sm:text-[27px]">
          {title}
        </h1>
      </header>

      {objects.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {objects.map((object) => (
            <Link key={object.id} to={`/explore/${object.kind}?open=${object.id}`}>
              <MetaChip>{object.name}</MetaChip>
            </Link>
          ))}
        </div>
      ) : null}

      {body ? (
        <div className="mt-10 whitespace-pre-wrap text-[15px] leading-[2.05] text-starlight/85">
          {body}
        </div>
      ) : null}

      {entry.attachmentIds.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {entry.attachmentIds.map((attachmentId) => (
            <Photo
              key={attachmentId}
              id={attachmentId}
              onOpen={() => setLightbox(attachmentId)}
            />
          ))}
        </div>
      ) : null}

      <footer className="mt-14 flex flex-wrap items-end justify-between gap-5 border-t border-divider/60 pt-6">
        <span className="text-[10px] uppercase tracking-[0.18em] text-dust/35">
          {t('detail.updated', { when: formatTimestamp(entry.updatedAt, lang) })}
        </span>
        <div className="flex items-center gap-7">
          <Link
            to={`/entry/${entry.id}/edit`}
            className="text-[10px] uppercase tracking-[0.24em] text-dust transition-colors hover:text-starlight"
          >
            {t('detail.edit')}
          </Link>
          <Button
            variant="quiet"
            onClick={() => setConfirming(true)}
            className="text-[10px] tracking-[0.24em] text-dust/45 hover:text-dust"
          >
            {t('detail.delete')}
          </Button>
        </div>
      </footer>

      {lightbox ? <Lightbox id={lightbox} onClose={() => setLightbox(null)} /> : null}

      <ConfirmDialog
        open={confirming}
        message={t('detail.deleteQuestion')}
        confirmLabel={t('detail.delete')}
        onConfirm={() => void remove()}
        onCancel={() => setConfirming(false)}
      />
    </article>
  )
}
