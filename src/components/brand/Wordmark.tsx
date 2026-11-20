import { cn } from '../../lib/utils'

/** Wide-tracked display wordmark. Wrap in an <h1> where the page owns the heading. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('block font-display uppercase leading-none text-starlight', className)}
      style={{ letterSpacing: '0.42em', marginRight: '-0.42em' }}
    >
      Evermore
    </span>
  )
}
