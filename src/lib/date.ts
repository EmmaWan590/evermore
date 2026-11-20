import type { Entry } from '../data/types'

export type Lang = 'en' | 'zh'

const LOCALES: Record<Lang, string> = { en: 'en-US', zh: 'zh-CN' }

export function toDayString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayString(): string {
  return toDayString(new Date())
}

/** Parses `YYYY-MM-DD` as a local calendar day (never shifted by time zone). */
export function parseDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** The day an entry belongs to: its own date when given, otherwise the day it was written. */
export function entryDay(entry: Pick<Entry, 'eventDate' | 'createdAt'>): string {
  if (entry.eventDate) return entry.eventDate
  const created = new Date(entry.createdAt)
  return Number.isNaN(created.getTime()) ? todayString() : toDayString(created)
}

export function monthKeyOf(entry: Pick<Entry, 'eventDate' | 'createdAt'>): string {
  return entryDay(entry).slice(0, 7)
}

export function sortTimeOf(entry: Pick<Entry, 'eventDate' | 'createdAt'>): number {
  const day = parseDay(entryDay(entry))
  if (day) return day.getTime()
  const created = Date.parse(entry.createdAt)
  return Number.isNaN(created) ? 0 : created
}

export function compareEntriesDesc(a: Entry, b: Entry): number {
  const diff = sortTimeOf(b) - sortTimeOf(a)
  if (diff !== 0) return diff
  return Date.parse(b.createdAt) - Date.parse(a.createdAt)
}

export function formatDay(day: string, lang: Lang): string {
  const date = parseDay(day)
  if (!date) return day
  return new Intl.DateTimeFormat(LOCALES[lang], {
    year: 'numeric',
    month: lang === 'zh' ? 'long' : 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDayShort(day: string, lang: Lang): string {
  const date = parseDay(day)
  if (!date) return day
  return new Intl.DateTimeFormat(LOCALES[lang], { month: 'short', day: 'numeric' }).format(date)
}

export function formatMonthLabel(monthKey: string, lang: Lang): string {
  const date = parseDay(`${monthKey}-01`)
  if (!date) return monthKey
  return new Intl.DateTimeFormat(LOCALES[lang], { year: 'numeric', month: 'long' }).format(date)
}

export function formatTimestamp(iso: string, lang: Lang): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(LOCALES[lang], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** index
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
}
