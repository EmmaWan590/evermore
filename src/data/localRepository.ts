import { blobToDataUrl, dataUrlToBlob } from '../lib/binary'
import { compareEntriesDesc } from '../lib/date'
import { newId } from '../lib/utils'
import { makeThumb, processImage } from '../features/attachments/image'
import { getDB } from './db'
import type {
  AttachmentMeta,
  AttachmentRecord,
  Entry,
  EntryInput,
  EverObject,
  ExportBundle,
  ObjectKind,
} from './types'

function metaOf(record: AttachmentRecord): AttachmentMeta {
  const { blob: _blob, thumb: _thumb, ...meta } = record
  return meta
}

function normaliseObjectIds(ids: string[] | undefined): string[] {
  return Array.from(new Set((ids ?? []).filter((id) => typeof id === 'string' && id.length > 0)))
}

async function listEntries(): Promise<Entry[]> {
  const db = await getDB()
  const entries = await db.getAll('entries')
  return entries.sort(compareEntriesDesc)
}

async function getEntry(id: string): Promise<Entry | undefined> {
  const db = await getDB()
  return db.get('entries', id)
}

async function createEntry(input: EntryInput): Promise<Entry> {
  const now = new Date().toISOString()
  const location = input.location?.trim() ? input.location.trim() : null
  const objectIds = normaliseObjectIds(input.objectIds)

  // A place typed into an entry is part of the world, so it becomes a place object.
  if (location) {
    const place = await createObject('place', location)
    if (!objectIds.includes(place.id)) objectIds.push(place.id)
  }

  const entry: Entry = {
    id: newId(),
    title: (input.title ?? '').trim(),
    content: input.content ?? '',
    category: input.category ?? null,
    eventDate: input.eventDate ?? null,
    location,
    objectIds,
    attachmentIds: [],
    createdAt: now,
    updatedAt: now,
  }
  const db = await getDB()
  await db.add('entries', entry)
  return entry
}

async function updateEntry(id: string, patch: EntryInput): Promise<Entry> {
  const db = await getDB()
  const current = await db.get('entries', id)
  if (!current) throw new Error('entry-not-found')

  const next: Entry = {
    ...current,
    title: patch.title === undefined ? current.title : patch.title.trim(),
    content: patch.content === undefined ? current.content : patch.content,
    category: patch.category === undefined ? current.category : patch.category,
    eventDate: patch.eventDate === undefined ? current.eventDate : patch.eventDate,
    location:
      patch.location === undefined
        ? current.location
        : patch.location?.trim()
          ? patch.location.trim()
          : null,
    objectIds:
      patch.objectIds === undefined ? current.objectIds : normaliseObjectIds(patch.objectIds),
    updatedAt: new Date().toISOString(),
  }

  if (next.location) {
    const place = await createObject('place', next.location)
    if (!next.objectIds.includes(place.id)) next.objectIds = [...next.objectIds, place.id]
  }

  await db.put('entries', next)
  return next
}

async function deleteEntry(id: string): Promise<void> {
  const db = await getDB()
  const transaction = db.transaction(['entries', 'attachments'], 'readwrite')
  const entries = transaction.objectStore('entries')
  const attachments = transaction.objectStore('attachments')

  const entry = await entries.get(id)
  if (entry) {
    const index = attachments.index('by-entry')
    let cursor = await index.openCursor(id)
    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }
    await entries.delete(id)
  }
  await transaction.done
}

async function listObjects(): Promise<EverObject[]> {
  const db = await getDB()
  const objects = await db.getAll('objects')
  return objects.sort((a, b) => a.name.localeCompare(b.name))
}

async function createObject(kind: ObjectKind, name: string): Promise<EverObject> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('empty-name')
  const db = await getDB()
  const existing = await db.getAll('objects')
  const match = existing.find(
    (object) => object.kind === kind && object.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (match) return match

  const object: EverObject = {
    id: newId(),
    kind,
    name: trimmed,
    createdAt: new Date().toISOString(),
  }
  await db.add('objects', object)
  return object
}

async function deleteObject(id: string): Promise<void> {
  const db = await getDB()
  const transaction = db.transaction(['entries', 'objects'], 'readwrite')
  const entries = transaction.objectStore('entries')
  const objects = transaction.objectStore('objects')

  let cursor = await entries.openCursor()
  while (cursor) {
    const entry = cursor.value
    if (entry.objectIds.includes(id)) {
      await cursor.update({ ...entry, objectIds: entry.objectIds.filter((value) => value !== id) })
    }
    cursor = await cursor.continue()
  }
  await objects.delete(id)
  await transaction.done
}

async function addAttachment(entryId: string, file: File): Promise<AttachmentMeta> {
  const processed = await processImage(file)
  const db = await getDB()
  const entry = await db.get('entries', entryId)
  if (!entry) throw new Error('entry-not-found')

  const record: AttachmentRecord = {
    id: newId(),
    entryId,
    mimeType: processed.mimeType,
    fileName: file.name || 'photo',
    size: processed.full.size,
    width: processed.width,
    height: processed.height,
    createdAt: new Date().toISOString(),
    blob: processed.full,
    thumb: processed.thumb,
  }

  const transaction = db.transaction(['entries', 'attachments'], 'readwrite')
  await transaction.objectStore('attachments').add(record)
  await transaction.objectStore('entries').put({
    ...entry,
    attachmentIds: [...entry.attachmentIds, record.id],
    updatedAt: new Date().toISOString(),
  })
  await transaction.done

  return metaOf(record)
}

async function removeAttachment(entryId: string, attachmentId: string): Promise<void> {
  const db = await getDB()
  const transaction = db.transaction(['entries', 'attachments'], 'readwrite')
  const entries = transaction.objectStore('entries')
  const attachments = transaction.objectStore('attachments')

  const entry = await entries.get(entryId)
  if (entry) {
    await entries.put({
      ...entry,
      attachmentIds: entry.attachmentIds.filter((id) => id !== attachmentId),
      updatedAt: new Date().toISOString(),
    })
  }
  await attachments.delete(attachmentId)
  await transaction.done
}

async function listAttachments(entryId: string): Promise<AttachmentMeta[]> {
  const db = await getDB()
  const records = await db.getAllFromIndex('attachments', 'by-entry', entryId)
  return records.map(metaOf).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

async function getAttachmentBlob(
  id: string,
  variant: 'thumb' | 'full' = 'thumb',
): Promise<Blob | undefined> {
  const db = await getDB()
  const record = await db.get('attachments', id)
  if (!record) return undefined
  return variant === 'thumb' ? record.thumb : record.blob
}

async function exportAll(): Promise<ExportBundle> {
  const db = await getDB()
  const [entries, objects, records] = await Promise.all([
    db.getAll('entries'),
    db.getAll('objects'),
    db.getAll('attachments'),
  ])

  const attachments = await Promise.all(
    records.map(async (record) => ({
      ...metaOf(record),
      data: await blobToDataUrl(record.blob),
    })),
  )

  return {
    app: 'evermore',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    entries,
    objects,
    attachments,
  }
}

async function importAll(bundle: ExportBundle): Promise<void> {
  if (!bundle || bundle.app !== 'evermore' || !Array.isArray(bundle.entries)) {
    throw new Error('invalid-backup')
  }

  const records: AttachmentRecord[] = []
  for (const attachment of bundle.attachments ?? []) {
    if (!attachment?.data) continue
    const blob = dataUrlToBlob(attachment.data)
    records.push({
      id: attachment.id,
      entryId: attachment.entryId,
      mimeType: attachment.mimeType || blob.type || 'image/jpeg',
      fileName: attachment.fileName || 'photo',
      size: blob.size,
      width: attachment.width ?? 0,
      height: attachment.height ?? 0,
      createdAt: attachment.createdAt ?? new Date().toISOString(),
      blob,
      thumb: await makeThumb(blob),
    })
  }

  const knownIds = new Set(records.map((record) => record.id))
  const entries: Entry[] = bundle.entries.map((entry) => ({
    ...entry,
    objectIds: normaliseObjectIds(entry.objectIds),
    attachmentIds: (entry.attachmentIds ?? []).filter((id) => knownIds.has(id)),
  }))

  const db = await getDB()
  const transaction = db.transaction(['entries', 'objects', 'attachments'], 'readwrite')
  await Promise.all([
    transaction.objectStore('entries').clear(),
    transaction.objectStore('objects').clear(),
    transaction.objectStore('attachments').clear(),
  ])
  for (const entry of entries) await transaction.objectStore('entries').put(entry)
  for (const object of bundle.objects ?? []) await transaction.objectStore('objects').put(object)
  for (const record of records) await transaction.objectStore('attachments').put(record)
  await transaction.done
}

export const localRepository = {
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  listObjects,
  createObject,
  deleteObject,
  addAttachment,
  removeAttachment,
  listAttachments,
  getAttachmentBlob,
  exportAll,
  importAll,
}



