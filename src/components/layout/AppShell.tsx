import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useI18n, type MessageKey } from '../../i18n'
import { cn } from '../../lib/utils'
import { Wordmark } from '../brand/Wordmark'
import {
  CreateIcon,
  ExploreIcon,
  ProfileIcon,
  TimelineIcon,
  UniverseIcon,
} from '../ui/icons'

const NAV = [
  { to: '/universe', key: 'nav.universe', Icon: UniverseIcon },
  { to: '/timeline', key: 'nav.timeline', Icon: TimelineIcon },
  { to: '/create', key: 'nav.create', Icon: CreateIcon },
  { to: '/explore', key: 'nav.explore', Icon: ExploreIcon },
  { to: '/profile', key: 'nav.profile', Icon: ProfileIcon },
] as const satisfies readonly { to: string; key: MessageKey; Icon: typeof UniverseIcon }[]

export function AppShell() {
  const { t } = useI18n()
  const { pathname } = useLocation()

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`)

  return (
    <div className="min-h-dvh">
      {/* Desktop: a quiet left margin of navigation. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] flex-col border-r border-divider/60 bg-[var(--app-surface)] px-8 py-12 lg:flex">
        <Link to="/universe" aria-label={t('app.name')}>
          <Wordmark className="text-[13px]" />
        </Link>

        <nav className="mt-24 flex flex-col">
          {NAV.map(({ to, key, Icon }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 border-l py-3 pl-4 text-[10.5px] uppercase tracking-[0.24em] transition-colors duration-300',
                  active
                    ? 'border-eighth text-starlight'
                    : 'border-divider/60 text-dust/70 hover:border-dust/50 hover:text-starlight',
                )}
              >
                <Icon className={cn('shrink-0', active ? 'text-eighth' : 'text-current')} />
                <span>{t(key)}</span>
              </Link>
            )
          })}
        </nav>

        <p className="mt-auto text-[9.5px] uppercase leading-[1.9] tracking-[0.28em] text-dust/35">
          {t('app.tagline')}
        </p>
      </aside>

      <div className="lg:pl-[228px]">
        <main className="mx-auto w-full max-w-[720px] px-6 pb-32 pt-10 sm:px-9 lg:px-12 lg:pb-24 lg:pt-16">
          <Outlet />
        </main>
      </div>

      {/* Phones: one row, always in reach. */}
      <nav
        aria-label={t('app.name')}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-divider/70 bg-[var(--app-surface)]/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch px-2 pb-safe">
          {NAV.map(({ to, key, Icon }) => {
            const active = isActive(to)
            return (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 transition-colors duration-300',
                    active ? 'text-starlight' : 'text-dust/55 hover:text-dust',
                  )}
                >
                  <Icon className={active ? 'text-eighth' : 'text-current'} />
                  <span className="text-[9.5px] uppercase tracking-[0.14em]">{t(key)}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
