export const CATEGORIES = ['wealth', 'health', 'journey', 'memories'] as const
export type Category = (typeof CATEGORIES)[number]

export const OBJECT_KINDS = ['person', 'place', 'thing', 'idea'] as const
export type ObjectKind = (typeof OBJECT_KINDS)[number]

/** A single thing the user chose to remember. */
export interface Entry {
  id: string
  title: string
  content: string
  category: Category | null
  /** Calendar day the entry belongs to, `YYYY-MM-DD`. Optional. */
  eventDate: string | null
  location: string | null
  objectIds: string[]
  attachmentIds: string[]
  createdAt: string
  updatedAt: string
}

/** A person, place, thing or idea the world is made of. */
export interface EverObject {
  id: string
  kind: ObjectKind
  name: string
  createdAt: string
}

export interface AttachmentMeta {
  id: string
  entryId: string
  mimeType: string
  fileName: string
  size: number
  width: number
  height: number
  createdAt: string
}

/** Stored record: metadata plus the actual pixels. */
export interface AttachmentRecord extends AttachmentMeta {
  blob: Blob
  thumb: Blob
}

export interface EntryInput {
  title?: string
  content?: string
  category?: Category | null
  eventDate?: string | null
  location?: string | null
  objectIds?: string[]
}

export interface ExportBundle {
  app: 'evermore'
  schemaVersion: 1
  exportedAt: string
  entries: Entry[]
  objects: EverObject[]
  attachments: (AttachmentMeta & { data: string })[]
}

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

export function isObjectKind(value: unknown): value is ObjectKind {
  return typeof value === 'string' && (OBJECT_KINDS as readonly string[]).includes(value)
}
