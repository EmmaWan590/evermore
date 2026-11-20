import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'
import { AppDataProvider } from './data/AppData'
import { I18nProvider } from './i18n'
import { CreatePage } from './pages/CreatePage'
import { EntryDetailPage } from './pages/EntryDetailPage'
import { ExploreKindPage } from './pages/ExploreKindPage'
import { ExplorePage } from './pages/ExplorePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { TimelinePage } from './pages/TimelinePage'
import { UniversePage } from './pages/UniversePage'
import { INTRO_SEEN_KEY, WelcomePage } from './pages/WelcomePage'
import { AppearanceProvider } from './theme/appearance'

/** A new screen always begins at its top, never mid-scroll. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

/**
 * The opening plays once per visit. Afterwards the root quietly becomes the
 * Universe, so a refresh or a bookmark never lingers on the intro.
 */
function RootGate() {
  let seen = false
  try {
    seen = sessionStorage.getItem(INTRO_SEEN_KEY) === '1'
  } catch {
    seen = false
  }
  return seen ? <Navigate to="/universe" replace /> : <WelcomePage />
}

const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export function App() {
  return (
    <AppearanceProvider>
      <I18nProvider>
        <ToastProvider>
          <AppDataProvider>
            <BrowserRouter basename={BASENAME}>
              <ScrollToTop />
              <Routes>
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/" element={<RootGate />} />
                <Route element={<AppShell />}>
                  <Route path="/universe" element={<UniversePage />} />
                  <Route path="/timeline" element={<TimelinePage />} />
                  <Route path="/create" element={<CreatePage />} />
                  <Route path="/entry/:id" element={<EntryDetailPage />} />
                  <Route path="/entry/:id/edit" element={<CreatePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/explore/:kind" element={<ExploreKindPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AppDataProvider>
        </ToastProvider>
      </I18nProvider>
    </AppearanceProvider>
  )
}
