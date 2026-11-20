import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type ButtonVariant = 'primary' | 'ghost' | 'quiet' | 'link'

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[11.5px] uppercase tracking-[0.22em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'rounded-sm bg-starlight px-6 py-3 text-void hover:opacity-90',
  ghost: 'rounded-sm border border-divider px-5 py-2.5 text-starlight hover:border-dust/50',
  quiet: 'px-2 py-1 text-dust hover:text-starlight',
  link: 'border-b border-divider px-0 pb-1 text-starlight/80 hover:border-eighth hover:text-starlight',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn(BASE, VARIANTS[variant], className)} {...rest} />
}
