import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Appearance = 'void' | 'deep'

const STORAGE_KEY = 'evermore.appearance'

interface AppearanceValue {
  appearance: Appearance
  setAppearance: (value: Appearance) => void
}

const AppearanceContext = createContext<AppearanceValue | null>(null)

function readInitialAppearance(): Appearance {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'void' || saved === 'deep') return saved
  } catch {
    // Ignore storage failures.
  }
  return 'void'
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>(readInitialAppearance)

  useEffect(() => {
    document.documentElement.dataset.appearance = appearance
    const themeColor = appearance === 'deep' ? '#111827' : '#080D14'
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', themeColor))
    try {
      localStorage.setItem(STORAGE_KEY, appearance)
    } catch {
      // Ignore storage failures.
    }
  }, [appearance])

  const value = useMemo<AppearanceValue>(() => ({ appearance, setAppearance }), [appearance])

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance(): AppearanceValue {
  const value = useContext(AppearanceContext)
  if (!value) throw new Error('useAppearance must be used inside <AppearanceProvider>')
  return value
}
