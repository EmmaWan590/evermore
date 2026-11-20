import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EntryCard } from '../components/entry/EntryCard'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Field } from '../components/ui/Field'
import { BackIcon } from '../components/ui/icons'
import { Sheet } from '../components/ui/Sheet'
import { useToast } from '../components/ui/Toast'
import { useAppData } from '../data/AppData'
import { isObjectKind, type ObjectKind } from '../data/types'
import { useI18n, type MessageKey } from '../i18n'

const LABEL: Record<ObjectKind, MessageKey> = {
  person: 'kind.person',
  place: 'kind.place',
  thing: 'kind.thing',
  idea: 'kind.idea',
}

const LABEL_ONE: Record<ObjectKind, MessageKey> = {
  person: 'kind.personOne',
  place: 'kind.placeOne',
  thing: 'kind.thingOne',
  idea: 'kind.ideaOne',
}

export function ExploreKindPage() {
  const { kind: rawKind } = useParams<{ kind: string }>()
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const { t } = useI18n()
  const { objects, entries, addObject, deleteObject } = useAppData()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const kind = isObjectKind(rawKind) ? rawKind : null
  const openId = params.get('open')
  const openObject = kind && openId ? objects.find((object) => object.id === openId) : undefined

  if (!kind) {
    return <EmptyState title={t('notFound.title')} body={t('notFound.body')} />
  }

  const list = objects.filter((object) => object.kind === kind)
  const countFor = (id: string) =>
    entries.filter((entry) => entry.objectIds.includes(id)).length

  const create = async () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    try {
      await addObject(kind, trimmed)
      setName('')
      setSheetOpen(false)
    } catch {
      toast.push(t('error.generic'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!openObject) return
    try {
      await deleteObject(openObject.id)
      toast.push(t('toast.removed'))
      setConfirming(false)
      setParams({}, { replace: true })
    } catch {
      toast.push(t('error.generic'))
      setConfirming(false)
    }
  }

  if (openObject) {
    const related = entries.filter((entry) => entry.objectIds.includes(openObject.id))
    return (
      <div className="animate-fade">
        <Link
          to={`/explore/${kind}`}
          className="inline-flex items-center gap-2 text-[9.5px] uppercase tracking-[0.26em] text-dust/55 transition-colors hover:text-starlight"
        >
          <BackIcon />
          {t(LABEL[kind])}
        </Link>

        <header className="mt-9">
          <p className="text-[9.5px] uppercase tracking-[0.3em] text-dust/45">
            {t(LABEL_ONE[kind])}
          </p>
          <h1 className="mt-3 font-display text-[26px] leading-tight tracking-[0.01em] text-starlight">
            {openObject.name}
          </h1>
          <p className="mt-3 text-[9.5px] uppercase tracking-[0.24em] text-dust/40">
            {t('timeline.count', { n: related.length })}
          </p>
        </header>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-[10px] uppercase tracking-[0.22em] text-dust/45 transition-colors hover:text-dust"
          >
            {t('explore.remove')}
          </button>
        </div>

        {related.length > 0 ? (
          <div className="mt-4 divide-y divide-divider/50 border-t border-divider/50">
            {related.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <EmptyState title={t('explore.noEntries')} />
        )}

        <ConfirmDialog
          open={confirming}
          message={t('explore.removeQuestion', { name: openObject.name })}
          confirmLabel={t('explore.remove')}
          onConfirm={() => void remove()}
          onCancel={() => setConfirming(false)}
        />
      </div>
    )
  }

  return (
    <div className="animate-fade">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[22px] tracking-[0.04em] text-starlight/95 sm:text-[25px]">
            {t('explore.allHere', { kind: t(LABEL[kind]) })}
          </h1>
          <p className="mt-2.5 text-[9.5px] uppercase tracking-[0.26em] text-dust/40">
            {list.length > 0 ? t('timeline.count', { n: list.length }) : ''}
          </p>
        </div>
        <Button variant="ghost" onClick={() => setSheetOpen(true)} className="shrink-0">
          {t('explore.add')}
        </Button>
      </header>

      {list.length === 0 ? (
        <EmptyState title={t('explore.empty')} />
      ) : (
        <ul className="mt-10 border-t border-divider/60">
          {list.map((object) => (
            <li key={object.id}>
              <Link
                to={`/explore/${kind}?open=${object.id}`}
                className="group flex items-baseline justify-between gap-4 border-b border-divider/60 py-5"
              >
                <span className="truncate font-display text-[15.5px] tracking-[0.01em] text-starlight/85 transition-colors group-hover:text-starlight">
                  {object.name}
                </span>
                <span className="tabular shrink-0 text-[10px] tracking-[0.1em] text-dust/35">
                  {countFor(object.id)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('explore.addTitle', { kind: t(LABEL_ONE[kind]) })}
        footer={
          <Button onClick={() => void create()} disabled={!name.trim() || busy}>
            {t('explore.add')}
          </Button>
        }
      >
        <Field
          label={t('explore.nameLabel')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void create()
            }
          }}
          maxLength={60}
          autoFocus
        />
      </Sheet>
    </div>
  )
}
