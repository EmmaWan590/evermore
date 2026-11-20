import { useEffect, type ReactNode } from 'react'
import { useI18n } from '../../i18n'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * A quiet panel: bottom sheet on phones, small centred dialog on desktop.
 * Closes on Escape and on a click outside.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-md animate-rise border-t border-divider bg-deep px-6 pb-8 pt-6 shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.9)] sm:rounded-sm sm:border sm:px-7 sm:pb-7"
      >
        <div className="flex items-start justify-between gap-6">
          {title ? (
            <h2 className="font-display text-[17px] tracking-[0.06em] text-starlight">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] uppercase tracking-[0.2em] text-dust transition-colors hover:text-starlight"
          >
            {t('common.close')}
          </button>
        </div>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-8 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  )
}
