import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang } from '../lib/date'
import { en, type MessageKey } from './en'
import { zh } from './zh'

const DICTS: Record<Lang, Record<MessageKey, string>> = { en, zh }
const STORAGE_KEY = 'evermore.lang'

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function readInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {
    // Storage can be unavailable in private modes; fall back to the browser language.
  }

  if (typeof navigator !== 'undefined') {
    const locales = navigator.languages?.length ? navigator.languages : [navigator.language]
    if (locales.some((locale) => locale.toLowerCase().startsWith('zh'))) return 'zh'
  }
  return 'en'
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Ignore: the choice simply will not survive this session.
    }
  }, [lang])

  const t = useCallback<I18nValue['t']>(
    (key, vars) => interpolate(DICTS[lang][key] ?? en[key] ?? key, vars),
    [lang],
  )

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>')
  return value
}

export type { MessageKey }
