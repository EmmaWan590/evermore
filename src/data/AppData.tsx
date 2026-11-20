import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { downloadBackup, restoreBackup } from '../features/backup/backup'
import { requestPersistentStorage } from './db'
import { repository } from './repository'
import type { AttachmentMeta, Entry, EntryInput, EverObject, ObjectKind } from './types'

interface AppDataValue {
  ready: boolean
  error: string | null
  entries: Entry[]
  objects: EverObject[]
  objectMap: Map<string, EverObject>
  refresh: () => Promise<void>
  createEntry: (input: EntryInput) => Promise<Entry>
  updateEntry: (id: string, patch: EntryInput) => Promise<Entry>
  deleteEntry: (id: string) => Promise<void>
  addObject: (kind: ObjectKind, name: string) => Promise<EverObject>
  deleteObject: (id: string) => Promise<void>
  addAttachment: (entryId: string, file: File) => Promise<AttachmentMeta>
  removeAttachment: (entryId: string, attachmentId: string) => Promise<void>
  downloadBackup: () => Promise<number>
  restoreBackup: (file: File) => Promise<number>
}

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [objects, setObjects] = useState<EverObject[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const [nextEntries, nextObjects] = await Promise.all([
      repository.listEntries(),
      repository.listObjects(),
    ])
    setEntries(nextEntries)
    setObjects(nextObjects)
  }, [])

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        await refresh()
        void requestPersistentStorage()
      } catch (cause) {
        console.error('[evermore] could not open the local database', cause)
        if (alive) setError(cause instanceof Error ? cause.message : 'unknown')
      } finally {
        if (alive) setReady(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [refresh])

  const createEntry = useCallback(
    async (input: EntryInput) => {
      const entry = await repository.createEntry(input)
      await refresh()
      return entry
    },
    [refresh],
  )

  const updateEntry = useCallback(
    async (id: string, patch: EntryInput) => {
      const entry = await repository.updateEntry(id, patch)
      await refresh()
      return entry
    },
    [refresh],
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      await repository.deleteEntry(id)
      await refresh()
    },
    [refresh],
  )

  const addObject = useCallback(
    async (kind: ObjectKind, name: string) => {
      const object = await repository.createObject(kind, name)
      await refresh()
      return object
    },
    [refresh],
  )

  const deleteObject = useCallback(
    async (id: string) => {
      await repository.deleteObject(id)
      await refresh()
    },
    [refresh],
  )

  const addAttachment = useCallback(
    async (entryId: string, file: File) => {
      const meta = await repository.addAttachment(entryId, file)
      await refresh()
      return meta
    },
    [refresh],
  )

  const removeAttachment = useCallback(
    async (entryId: string, attachmentId: string) => {
      await repository.removeAttachment(entryId, attachmentId)
      await refresh()
    },
    [refresh],
  )

  const restore = useCallback(
    async (file: File) => {
      const count = await restoreBackup(file)
      await refresh()
      return count
    },
    [refresh],
  )

  const objectMap = useMemo(
    () => new Map(objects.map((object) => [object.id, object])),
    [objects],
  )

  const value = useMemo<AppDataValue>(
    () => ({
      ready,
      error,
      entries,
      objects,
      objectMap,
      refresh,
      createEntry,
      updateEntry,
      deleteEntry,
      addObject,
      deleteObject,
      addAttachment,
      removeAttachment,
      downloadBackup,
      restoreBackup: restore,
    }),
    [
      ready,
      error,
      entries,
      objects,
      objectMap,
      refresh,
      createEntry,
      updateEntry,
      deleteEntry,
      addObject,
      deleteObject,
      addAttachment,
      removeAttachment,
      restore,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used inside <AppDataProvider>')
  return value
}
