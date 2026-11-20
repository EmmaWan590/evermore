import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { AttachmentRecord, Entry, EverObject } from './types'

interface EvermoreSchema extends DBSchema {
  entries: {
    key: string
    value: Entry
    indexes: { 'by-created': string }
  }
  objects: {
    key: string
    value: EverObject
  }
  attachments: {
    key: string
    value: AttachmentRecord
    indexes: { 'by-entry': string }
  }
  meta: {
    key: string
    value: { key: string; value: unknown }
  }
}

export type EvermoreDB = IDBPDatabase<EvermoreSchema>

const DB_NAME = 'evermore'

let dbPromise: Promise<EvermoreDB> | null = null

export function getDB(): Promise<EvermoreDB> {
  if (!dbPromise) {
    dbPromise = openDB<EvermoreSchema>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('entries')) {
          const store = db.createObjectStore('entries', { keyPath: 'id' })
          store.createIndex('by-created', 'createdAt')
        }
        if (!db.objectStoreNames.contains('objects')) {
          db.createObjectStore('objects', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('attachments')) {
          const store = db.createObjectStore('attachments', { keyPath: 'id' })
          store.createIndex('by-entry', 'entryId')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      },
    }).catch((error: unknown) => {
      dbPromise = null
      throw error
    })
  }
  return dbPromise
}

/** Ask the browser to keep this origin's data instead of evicting it under pressure. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function storageEstimate(): Promise<{ usage: number; quota: number }> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
      return { usage: 0, quota: 0 }
    }
    const estimate = await navigator.storage.estimate()
    return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 }
  } catch {
    return { usage: 0, quota: 0 }
  }
}
