import { useState } from 'react'
import { useAppData } from '../../data/AppData'
import type { ObjectKind } from '../../data/types'
import { useI18n, type MessageKey } from '../../i18n'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Field } from '../ui/Field'
import { Sheet } from '../ui/Sheet'

const KIND_LABEL: Record<ObjectKind, MessageKey> = {
  person: 'kind.personOne',
  place: 'kind.placeOne',
  thing: 'kind.thingOne',
  idea: 'kind.ideaOne',
}

interface ObjectPickerProps {
  kind: ObjectKind
  label: string
  selected: string[]
  onChange: (ids: string[]) => void
}

/** Chips of existing people/places/things/ideas, with a quiet way to add a new one. */
export function ObjectPicker({ kind, label, selected, onChange }: ObjectPickerProps) {
  const { t } = useI18n()
  const { objects, addObject } = useAppData()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const items = objects.filter((object) => object.kind === kind)

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id])
  }

  const create = async () => {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    try {
      const object = await addObject(kind, trimmed)
      onChange([...selected, object.id])
      setName('')
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-dust">{label}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[10px] uppercase tracking-[0.2em] text-dust/60 transition-colors hover:text-starlight"
        >
          + {t('explore.add')}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-[11.5px] text-dust/45">{t('explore.empty')}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip
              key={item.id}
              active={selected.includes(item.id)}
              onClick={() => toggle(item.id)}
            >
              {item.name}
            </Chip>
          ))}
        </div>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t('explore.addTitle', { kind: t(KIND_LABEL[kind]) })}
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
