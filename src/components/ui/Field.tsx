import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function Field({ label, hint, className, id, ...rest }: FieldProps) {
  const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <label htmlFor={inputId} className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-dust">{label}</span>
      <input
        id={inputId}
        className={cn(
          'mt-2 w-full border-b border-divider bg-transparent pb-2 text-[15px] text-starlight outline-none transition-colors duration-300 focus:border-eighth',
          className,
        )}
        {...rest}
      />
      {hint ? <span className="mt-2 block text-[11.5px] text-dust/70">{hint}</span> : null}
    </label>
  )
}
