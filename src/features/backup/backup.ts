import { repository } from '../../data/repository'
import type { ExportBundle } from '../../data/types'

/** Writes the whole world to a single JSON download. Returns the entry count. */
export async function downloadBackup(): Promise<number> {
  const bundle = await repository.exportAll()
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `evermore-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
  return bundle.entries.length
}

/** Replaces everything with the contents of a backup file. Returns the entry count. */
export async function restoreBackup(file: File): Promise<number> {
  const text = await file.text()
  let parsed: ExportBundle
  try {
    parsed = JSON.parse(text) as ExportBundle
  } catch {
    throw new Error('invalid-backup')
  }
  await repository.importAll(parsed)
  return parsed.entries.length
}
