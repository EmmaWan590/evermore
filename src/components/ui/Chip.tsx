import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-[11.5px] tracking-[0.1em] transition-colors duration-300',
        active
          ? 'border-starlight/40 bg-starlight/10 text-starlight'
          : 'border-divider text-dust hover:border-dust/40 hover:text-starlight',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Non-interactive chip used to show a detail that is already attached. */
export function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-divider px-3 py-1 text-[11.5px] tracking-[0.06em] text-dust">
      {children}
    </span>
  )
}
