import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/Toast'
import { useAppData } from '../data/AppData'
import { storageEstimate } from '../data/db'
import { useI18n } from '../i18n'
import { formatBytes } from '../lib/date'
import { useAppearance, type Appearance } from '../theme/appearance'
import { INTRO_SEEN_KEY } from './WelcomePage'

const VERSION = '1.0.0'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-divider/60 py-9">
      <h2 className="text-[9.5px] uppercase tracking-[0.32em] text-dust/55">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function ProfilePage() {
  const { t, lang, setLang } = useI18n()
  const { appearance, setAppearance } = useAppearance()
  const { downloadBackup, restoreBackup, entries } = useAppData()
  const toast = useToast()
  const navigate = useNavigate()

  const [busy, setBusy] = useState<'export' | 'import' | null>(null)
  const [pendingImport, setPendingImport] = useState<File | null>(null)
  const [storage, setStorage] = useState<{
    usage: number
    quota: number
    persisted: boolean
  } | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      const estimate = await storageEstimate()
      let persisted = false
      try {
        persisted = await (navigator.storage?.persisted?.() ?? Promise.resolve(false))
      } catch {
        persisted = false
      }
      if (alive) setStorage({ ...estimate, persisted })
    })()
    return () => {
      alive = false
    }
  }, [entries.length])

  const onExport = async () => {
    setBusy('export')
    try {
      const count = await downloadBackup()
      toast.push(t('profile.exported', { n: count }))
    } catch {
      toast.push(t('error.generic'))
    } finally {
      setBusy(null)
    }
  }

  const onImport = async () => {
    if (!pendingImport) return
    setBusy('import')
    try {
      await restoreBackup(pendingImport)
      toast.push(t('toast.imported'))
    } catch {
      toast.push(t('error.invalidBackup'))
    } finally {
      setBusy(null)
      setPendingImport(null)
    }
  }

  return (
    <div className="animate-fade pb-6">
      <h1 className="font-display text-[24px] tracking-[0.04em] text-starlight/95 sm:text-[27px]">
        {t('profile.title')}
      </h1>

      <div className="mt-10">
        <Section title={t('profile.language')}>
          <div className="flex flex-wrap gap-2">
            <Chip active={lang === 'en'} onClick={() => setLang('en')}>
              English
            </Chip>
            <Chip active={lang === 'zh'} onClick={() => setLang('zh')}>
              中文
            </Chip>
          </div>
        </Section>

        <Section title={t('profile.appearance')}>
          <div className="flex flex-wrap gap-2">
            {(['void', 'deep'] as Appearance[]).map((value) => (
              <Chip
                key={value}
                active={appearance === value}
                onClick={() => setAppearance(value)}
              >
                {t(value === 'void' ? 'profile.void' : 'profile.deep')}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title={t('profile.data')}>
          <p className="text-[12.5px] leading-[1.95] text-dust/60">{t('profile.exportHint')}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={() => void onExport()} disabled={busy !== null}>
              {t('profile.export')}
            </Button>
            <label className="cursor-pointer text-[10px] uppercase tracking-[0.22em] text-dust/60 transition-colors hover:text-starlight">
              {busy === 'import' ? t('create.saving') : t('profile.import')}
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) setPendingImport(file)
                  event.target.value = ''
                }}
              />
            </label>
          </div>
        </Section>

        <Section title={t('profile.storage')}>
          <p className="text-[12.5px] leading-[1.95] text-dust/60">
            {storage && storage.quota > 0
              ? t('profile.storageLine', {
                  used: formatBytes(storage.usage),
                  total: formatBytes(storage.quota),
                })
              : t('profile.storageUnknown')}
          </p>
          <p className="mt-3 text-[12.5px] leading-[1.95] text-dust/45">
            {storage?.persisted ? t('profile.persisted') : t('profile.notPersisted')}
          </p>
        </Section>

        <Section title={t('profile.privacy')}>
          <p className="text-[12.5px] leading-[2] text-dust/60">{t('profile.privacyBody')}</p>
        </Section>

        <Section title={t('profile.account')}>
          <p className="text-[12.5px] leading-[1.95] text-dust/60">{t('profile.accountBody')}</p>
        </Section>

        <Section title={t('profile.about')}>
          <p className="text-[12.5px] text-dust/55">
            {t('profile.version')} {VERSION}
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem(INTRO_SEEN_KEY)
              } catch {
                // Nothing to clear.
              }
              navigate('/welcome')
            }}
            className="mt-4 text-[10px] uppercase tracking-[0.22em] text-dust/55 transition-colors hover:text-starlight"
          >
            {t('profile.replayIntro')}
          </button>
        </Section>
      </div>

      <ConfirmDialog
        open={pendingImport !== null}
        message={t('profile.importQuestion')}
        confirmLabel={t('profile.import')}
        onConfirm={() => void onImport()}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  )
}
