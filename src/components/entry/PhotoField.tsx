import { useEffect, useState } from 'react'
import { repository } from '../../data/repository'
import type { AttachmentMeta } from '../../data/types'
import { MAX_FILES_PER_ENTRY } from '../../features/attachments/image'
import { useAttachmentUrl } from '../../features/attachments/useAttachmentUrl'
import { useI18n } from '../../i18n'
import { CloseIcon } from '../ui/icons'

export interface PendingPhoto {
  key: string
  file: File
  url: string
}

interface PhotoFieldProps {
  entryId?: string
  pending: PendingPhoto[]
  onPick: (files: FileList) => void
  onRemovePending: (key: string) => void
}

function StoredPhoto({ id, onRemove }: { id: string; onRemove: () => void }) {
  const { t } = useI18n()
  const url = useAttachmentUrl(id, 'thumb')

  return (
    <div className="relative aspect-square overflow-hidden rounded-sm border border-divider/50 bg-deep">
      {url ? <img src={url} alt="" className="h-full w-full object-cover opacity-90" /> : null}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('common.remove')}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-void/70 text-dust transition-colors hover:text-starlight"
      >
        <CloseIcon />
      </button>
    </div>
  )
}

/** Photo grid shared by writing and editing. Files stay pending until the entry is saved. */
export function PhotoField({ entryId, pending, onPick, onRemovePending }: PhotoFieldProps) {
  const { t } = useI18n()
  const [stored, setStored] = useState<AttachmentMeta[]>([])

  useEffect(() => {
    let alive = true
    if (!entryId) {
      setStored([])
      return
    }
    void repository
      .listAttachments(entryId)
      .then((list) => {
        if (alive) setStored(list)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [entryId])

  const total = stored.length + pending.length
  const canAddMore = total < MAX_FILES_PER_ENTRY

  const removeStored = async (id: string) => {
    if (!entryId) return
    await repository.removeAttachment(entryId, id)
    setStored((list) => list.filter((item) => item.id !== id))
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-dust">{t('create.photos')}</span>
        <span className="text-[10px] tracking-[0.1em] text-dust/40">
          {total}/{MAX_FILES_PER_ENTRY}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {stored.map((photo) => (
          <StoredPhoto
            key={photo.id}
            id={photo.id}
            onRemove={() => void removeStored(photo.id)}
          />
        ))}

        {pending.map((photo) => (
          <div key={photo.key} className="relative aspect-square overflow-hidden rounded-sm border border-eighth/30">
            <img src={photo.url} alt="" className="h-full w-full object-cover opacity-90" />
            <button
              type="button"
              onClick={() => onRemovePending(photo.key)}
              aria-label={t('common.remove')}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-void/70 text-dust transition-colors hover:text-starlight"
            >
              <CloseIcon />
            </button>
          </div>
        ))}

        {canAddMore ? (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-divider text-dust/50 transition-colors hover:border-dust/40 hover:text-dust">
            <span className="text-lg leading-none">+</span>
            <span className="text-[9.5px] uppercase tracking-[0.18em]">{t('explore.add')}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                const files = event.target.files
                if (files && files.length > 0) {
                  const room = MAX_FILES_PER_ENTRY - total
                  if (room > 0) {
                    const chosen = Array.from(files).slice(0, room)
                    try {
                      const transfer = new DataTransfer()
                      chosen.forEach((file) => transfer.items.add(file))
                      onPick(transfer.files)
                    } catch {
                      onPick(files)
                    }
                  }
                }
                event.target.value = ''
              }}
            />
          </label>
        ) : null}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-dust/45">
        {t('create.photoHint', { n: MAX_FILES_PER_ENTRY })}
      </p>
    </div>
  )
}
