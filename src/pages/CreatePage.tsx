import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ObjectPicker } from '../components/entry/ObjectPicker'
import { PhotoField, type PendingPhoto } from '../components/entry/PhotoField'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/ui/Toast'
import { useAppData } from '../data/AppData'
import { CATEGORIES, type Category, type EntryInput } from '../data/types'
import { MAX_FILE_BYTES, MAX_FILES_PER_ENTRY } from '../features/attachments/image'
import { useI18n, type MessageKey } from '../i18n'
import { newId } from '../lib/utils'

const CATEGORY_LABEL: Record<Category, MessageKey> = {
  wealth: 'world.wealth',
  health: 'world.health',
  journey: 'world.journey',
  memories: 'world.memories',
}

export function CreatePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const toast = useToast()
  const { id } = useParams<{ id: string }>()
  const { entries, objects, ready, createEntry, updateEntry, addAttachment } = useAppData()

  const entry = useMemo(() => (id ? entries.find((item) => item.id === id) : undefined), [entries, id])
  const editing = Boolean(id)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState('')
  const [place, setPlace] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [objectIds, setObjectIds] = useState<string[]>([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [prefilled, setPrefilled] = useState(false)
  const [pending, setPending] = useState<PendingPhoto[]>([])
  const [saving, setSaving] = useState(false)

  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const urls = useRef<string[]>([])

  useEffect(() => {
    return () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    if (!entry || prefilled) return
    setTitle(entry.title)
    setBody(entry.content)
    setDate(entry.eventDate ?? '')
    setPlace(entry.location ?? '')
    setCategory(entry.category)
    setObjectIds(entry.objectIds)
    setDetailsOpen(true)
    setPrefilled(true)
  }, [entry, prefilled])

  useEffect(() => {
    const element = bodyRef.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [body])

  const places = objects.filter((object) => object.kind === 'place')
  const totalPhotos = pending.length

  const pickPhotos = (files: FileList) => {
    const room = MAX_FILES_PER_ENTRY - totalPhotos
    if (room <= 0) return
    const accepted: PendingPhoto[] = []
    for (const file of Array.from(files).slice(0, room)) {
      if (!file.type.startsWith('image/')) {
        toast.push(t('error.notImage'))
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.push(t('error.fileTooLarge'))
        continue
      }
      const url = URL.createObjectURL(file)
      urls.current.push(url)
      accepted.push({ key: newId(), file, url })
    }
    if (accepted.length) setPending((previous) => [...previous, ...accepted])
  }

  const removePending = (key: string) => {
    setPending((previous) => {
      const target = previous.find((photo) => photo.key === key)
      if (target) {
        URL.revokeObjectURL(target.url)
        urls.current = urls.current.filter((url) => url !== target.url)
      }
      return previous.filter((photo) => photo.key !== key)
    })
  }

  const canSave = title.trim().length > 0 || body.trim().length > 0 || totalPhotos > 0

  const save = useCallback(async () => {
    if (saving || !canSave) return
    setSaving(true)
    try {
      const input: EntryInput = {
        title,
        content: body,
        category,
        eventDate: date || null,
        location: place.trim() || null,
        objectIds,
      }

      const saved = editing && entry ? await updateEntry(entry.id, input) : await createEntry(input)

      let failed = 0
      for (const photo of pending) {
        try {
          await addAttachment(saved.id, photo.file)
        } catch {
          failed += 1
        }
      }

      if (failed > 0) toast.push(t('error.storage'))
      else toast.push(t('toast.saved'))

      navigate(`/entry/${saved.id}`, { replace: true })
    } catch {
      toast.push(t('error.generic'))
    } finally {
      setSaving(false)
    }
  }, [
    addAttachment,
    body,
    canSave,
    category,
    createEntry,
    date,
    editing,
    entry,
    navigate,
    objectIds,
    pending,
    place,
    saving,
    t,
    title,
    toast,
    updateEntry,
  ])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void save()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [save])

  if (editing && ready && !entry) {
    return <EmptyState title={t('detail.notFound')} body={t('notFound.body')} />
  }

  return (
    <div className="animate-fade pb-8">
      <header>
        <h1 className="font-display text-[20px] leading-snug tracking-[0.02em] text-starlight/90 sm:text-[23px]">
          {editing ? t('detail.edit') : t('create.prompt')}
        </h1>
      </header>

      <div className="mt-10">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t('create.titlePlaceholder')}
          aria-label={t('create.titlePlaceholder')}
          maxLength={120}
          className="w-full border-b border-divider bg-transparent pb-3 font-display text-[18px] text-starlight outline-none transition-colors duration-300 placeholder:font-sans placeholder:text-[13.5px] placeholder:text-dust/40 focus:border-eighth"
        />
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t('create.bodyPlaceholder')}
          aria-label={t('create.bodyPlaceholder')}
          rows={6}
          className="mt-6 min-h-[180px] w-full resize-none bg-transparent text-[15px] leading-[1.95] text-starlight/90 outline-none placeholder:text-dust/40"
        />
      </div>

      {!detailsOpen ? (
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="mt-2 text-[10px] uppercase tracking-[0.28em] text-dust/60 transition-colors duration-300 hover:text-starlight"
        >
          {t('create.addDetails')}
        </button>
      ) : (
        <section className="mt-8 animate-rise space-y-9 border-t border-divider/60 pt-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.3em] text-dust">
                {t('create.date')}
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full border-b border-divider bg-transparent pb-2 text-[14px] text-starlight outline-none transition-colors focus:border-eighth"
              />
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.3em] text-dust">
                {t('create.place')}
              </span>
              <input
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                list="evermore-places"
                placeholder={t('common.optional')}
                maxLength={80}
                className="mt-2 w-full border-b border-divider bg-transparent pb-2 text-[14px] text-starlight outline-none transition-colors placeholder:text-[12.5px] placeholder:text-dust/40 focus:border-eighth"
              />
              <datalist id="evermore-places">
                {places.map((object) => (
                  <option key={object.id} value={object.name} />
                ))}
              </datalist>
            </label>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-dust">
              {t('create.category')}
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((value) => (
                <Chip
                  key={value}
                  active={category === value}
                  onClick={() => setCategory(category === value ? null : value)}
                >
                  {t(CATEGORY_LABEL[value])}
                </Chip>
              ))}
            </div>
          </div>

          <ObjectPicker
            kind="person"
            label={t('create.people')}
            selected={objectIds}
            onChange={setObjectIds}
          />
          <ObjectPicker
            kind="thing"
            label={t('kind.thing')}
            selected={objectIds}
            onChange={setObjectIds}
          />
          <ObjectPicker
            kind="idea"
            label={t('kind.idea')}
            selected={objectIds}
            onChange={setObjectIds}
          />

          <PhotoField
            entryId={entry?.id}
            pending={pending}
            onPick={pickPhotos}
            onRemovePending={removePending}
          />
        </section>
      )}

      <div className="mt-12 flex items-center justify-between gap-6 border-t border-divider/60 pt-6">
        <Button variant="quiet" onClick={() => navigate(-1)}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" onClick={() => void save()} disabled={!canSave || saving}>
          {saving ? t('create.saving') : t('create.save')}
        </Button>
      </div>

      {!canSave ? (
        <p className="mt-4 text-center text-[11px] text-dust/40">{t('create.empty')}</p>
      ) : null}
    </div>
  )
}
