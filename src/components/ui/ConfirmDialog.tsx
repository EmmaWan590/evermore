import { useI18n } from '../../i18n'
import { Button } from './Button'
import { Sheet } from './Sheet'

interface ConfirmDialogProps {
  open: boolean
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  return (
    <Sheet
      open={open}
      onClose={onCancel}
      footer={
        <>
          <Button variant="quiet" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="ghost" onClick={onConfirm}>
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </>
      }
    >
      <p className="text-[14px] leading-relaxed text-starlight/90">{message}</p>
    </Sheet>
  )
}
