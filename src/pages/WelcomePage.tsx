import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StarCluster } from '../components/brand/StarCluster'
import { Wordmark } from '../components/brand/Wordmark'
import { useI18n } from '../i18n'
import { cn } from '../lib/utils'

export const INTRO_SEEN_KEY = 'evermore.intro.seen'

/**
 * The opening: the cluster finds itself, the name arrives, then silence.
 * Skippable by a tap, a key, or simply waiting.
 */
export function WelcomePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [stage, setStage] = useState(0)
  const leaving = useRef(false)

  const finish = useCallback(() => {
    if (leaving.current) return
    leaving.current = true
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    } catch {
      // A private window may refuse storage; the intro simply plays again.
    }
    navigate('/universe', { replace: true })
  }, [navigate])

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 420),
      window.setTimeout(() => setStage(2), 1700),
      window.setTimeout(() => setStage(3), 3300),
    ]
    const auto = window.setTimeout(finish, 4700)
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      window.clearTimeout(auto)
    }
  }, [finish])

  return (
    <main
      onClick={finish}
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-void px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(126,166,198,0.08), transparent 58%)',
        }}
      />

      <div
        className={cn(
          'relative w-[290px] transition-all duration-[1800ms] ease-out sm:w-[430px]',
          stage >= 1 ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0',
        )}
      >
        <StarCluster className="w-full" />
      </div>

      <div
        className={cn(
          'relative mt-16 text-center transition-all duration-[1600ms] ease-out',
          stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <h1>
          <Wordmark className="text-[19px] sm:text-[24px]" />
        </h1>
        <p className="mt-5 text-[9.5px] uppercase tracking-[0.42em] text-dust/80">
          {t('app.tagline')}
        </p>
        <p className="mt-7 font-display text-[12.5px] leading-[1.9] tracking-[0.2em] text-starlight/70 sm:text-[13.5px]">
          {t('app.motto')}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          finish()
        }}
        className={cn(
          'absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9.5px] uppercase tracking-[0.34em] text-dust/45 transition-opacity duration-[1200ms] hover:text-dust',
          stage >= 3 ? 'opacity-100' : 'opacity-0',
        )}
      >
        {t('intro.hint')}
      </button>
    </main>
  )
}
