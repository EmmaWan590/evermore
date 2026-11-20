import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function UniverseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="5.2" cy="12.4" r="1.1" />
      <circle cx="10.6" cy="4.8" r="1.4" />
      <circle cx="15.2" cy="13.6" r="0.9" />
      <path d="M6.1 11.6 9.7 5.9M11.6 5.9l2.8 6.8" opacity="0.45" />
    </svg>
  )
}

export function TimelineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 3.5v13" opacity="0.5" />
      <circle cx="5.5" cy="6.2" r="1.1" />
      <circle cx="5.5" cy="11" r="1.1" />
      <circle cx="5.5" cy="15.6" r="1.1" />
      <path d="M9 6.2h6.5M9 11h5M9 15.6h6.5" opacity="0.6" />
    </svg>
  )
}

export function CreateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  )
}

export function ExploreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="7" opacity="0.55" />
      <path d="m12.6 7.4-1.5 3.7-3.7 1.5 1.5-3.7z" />
    </svg>
  )
}

export function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="7.1" r="2.6" />
      <path d="M4.9 16.2c.5-2.9 2.5-4.5 5.1-4.5s4.6 1.6 5.1 4.5" opacity="0.65" />
    </svg>
  )
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  )
}

export function BackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M16 10H5M9 6l-4 4 4 4" />
    </svg>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={14} height={14} {...props}>
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  )
}
