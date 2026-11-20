import { cn } from '../../lib/utils'

/** The seven stars of the Great Bear, plus one more that belongs just as much. */
const STARS = [
  { x: 12, y: 14, r: 1.5, delay: 0 },
  { x: 16.5, y: 33, r: 1.15, delay: 1.4 },
  { x: 33, y: 40, r: 1.1, delay: 2.6 },
  { x: 37.5, y: 25.5, r: 0.9, delay: 3.3 },
  { x: 54, y: 19.5, r: 1.2, delay: 0.7 },
  { x: 70, y: 14, r: 1.3, delay: 2.1 },
  { x: 88, y: 9, r: 1.15, delay: 3.0 },
] as const

const EIGHTH = { x: 29, y: 19, r: 1.1 } as const

interface StarClusterProps {
  className?: string
  animate?: boolean
  label?: string
}

export function StarCluster({ className, animate = true, label }: StarClusterProps) {
  return (
    <svg
      viewBox="0 0 100 52"
      className={cn('overflow-visible', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <radialGradient id="evermore-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7EA6C6" stopOpacity="0.1" />
          <stop offset="60%" stopColor="#7EA6C6" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#7EA6C6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="50" cy="26" rx="44" ry="22" fill="url(#evermore-halo)" />

      {STARS.map((star, index) => (
        <circle
          key={index}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#E6D9B8"
          className={animate ? 'animate-twinkle' : undefined}
          style={animate ? { animationDelay: `${star.delay}s` } : undefined}
        />
      ))}

      {/* The eighth star: same cluster, its own colour, no ceremony. */}
      <circle
        cx={EIGHTH.x}
        cy={EIGHTH.y}
        r={EIGHTH.r}
        fill="#7EA6C6"
        className={animate ? 'animate-twinkle' : undefined}
        style={{
          animationDelay: '4.2s',
          filter: 'drop-shadow(0 0 3px rgba(126,166,198,0.55))',
        }}
      />
    </svg>
  )
}
