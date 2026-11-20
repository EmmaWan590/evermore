import { localRepository } from './localRepository'
import type {
  AttachmentMeta,
  Entry,
  EntryInput,
  EverObject,
  ExportBundle,
  ObjectKind,
} from './types'

/**
 * The one seam between the UI and storage.
 *
 * v1 ships only the on-device adapter (IndexedDB). A Supabase adapter would
 * implement exactly this interface — same methods, same shapes — so no page or
 * component has to change when the project grows up.
 */
export interface EverRepository {
  listEntries(): Promise<Entry[]>
  getEntry(id: string): Promise<Entry | undefined>
  createEntry(input: EntryInput): Promise<Entry>
  updateEntry(id: string, patch: EntryInput): Promise<Entry>
  deleteEntry(id: string): Promise<void>

  listObjects(): Promise<EverObject[]>
  createObject(kind: ObjectKind, name: string): Promise<EverObject>
  deleteObject(id: string): Promise<void>

  addAttachment(entryId: string, file: File): Promise<AttachmentMeta>
  removeAttachment(entryId: string, attachmentId: string): Promise<void>
  listAttachments(entryId: string): Promise<AttachmentMeta[]>
  getAttachmentBlob(id: string, variant?: 'thumb' | 'full'): Promise<Blob | undefined>

  exportAll(): Promise<ExportBundle>
  importAll(bundle: ExportBundle): Promise<void>
}

export const repository: EverRepository = localRepository
