import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TripCover from '../components/TripCover'
import { TripProvider, useTrip } from './TripContext'
import Assistant from './Assistant'
import { formatTripDates } from './format'
import '../pages/TripDetail.css'
import './trip.css'

const MapMode = lazy(() => import('./MapMode'))

const TABS = [
  { key: 'overview', to: '', end: true },
  { key: 'plan', to: 'plan', end: false },
  { key: 'money', to: 'money', end: false },
  { key: 'group', to: 'group', end: false },
] as const

function initials(email?: string): string {
  return (email || '?').trim().charAt(0).toUpperCase()
}

function TripChrome() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const navigate = useNavigate()
  const location = useLocation()
  const navigationType = useNavigationType()
  const { trip, setTrip, apiUrl, token, activeUsers, mapOpen, assistantOpen, setAssistantOpen, badges } = useTrip()
  const tabsRef = useRef<HTMLElement>(null)

  // Set when we arrive straight from creating the trip, to nudge the cover once.
  // Captured once, then cleared from history so a reload does not nudge again.
  const [justCreated] = useState(() =>
    Boolean((location.state as { justCreated?: boolean } | null)?.justCreated)
  )
  useEffect(() => {
    if (justCreated) navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The sticky tabs sit right under the sticky app header, whatever height it wraps to
  useEffect(() => {
    const header = document.querySelector('header')
    if (!header) return
    const sync = () =>
      document.documentElement.style.setProperty('--app-header-height', `${header.getBoundingClientRect().height}px`)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  // Per-destination scroll position: restored on back/forward. On a tab switch the new destination
  // starts just under the tabs if the trip header has already scrolled away, so the chrome does not
  // jump back into view. Focus moves to the destination heading (N5, AC26).
  const scrollPositions = useRef<Record<string, number>>({})
  const previousPath = useRef(location.pathname)
  useEffect(() => {
    const key = location.pathname
    if (previousPath.current !== key) {
      previousPath.current = key
      if (navigationType === 'POP') {
        window.scrollTo(0, scrollPositions.current[key] ?? 0)
      } else {
        const tabs = tabsRef.current
        const dest = document.querySelector('.trip-destination')
        if (tabs && dest) {
          const style = getComputedStyle(tabs)
          // Room taken at the top of the viewport: the sticky app header + sticky tabs on desktop,
          // only the app header on phones (the tab bar sits at the bottom there)
          const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0
          const covered = style.position === 'sticky' ? (parseFloat(style.top) || 0) + tabs.offsetHeight : headerHeight
          const destTop = dest.getBoundingClientRect().top + window.scrollY
          window.scrollTo(0, Math.max(0, Math.min(window.scrollY, destTop - covered - 16)))
        }
      }
      document.getElementById('destination-heading')?.focus({ preventScroll: true })
    }
    return () => {
      scrollPositions.current[key] = window.scrollY
    }
  }, [location.pathname, navigationType])

  const dateRange = formatTripDates(trip, locale, t)
  const route = [trip.origin?.address, trip.destination?.address].filter(Boolean).join(' → ')

  return (
    <div className="trip-detail">
      <button type="button" className="back-link" onClick={() => navigate('/trips')}>
        {t('detail.back')}
      </button>

      <TripCover
        apiUrl={apiUrl}
        token={token}
        groupId={trip.groupId}
        tripName={trip.name}
        cover={trip.cover ?? null}
        nudge={justCreated}
        onChange={(cover) => setTrip((prev) => (prev ? { ...prev, cover } : prev))}
      >
        <div className="trip-title-row">
          <div className="trip-title-text">
            <h1>{trip.name}</h1>
            <p className="trip-subtitle">{[route, dateRange].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="trip-title-aside">
            {activeUsers.length > 0 && (
              <ul className="avatar-cluster" aria-label={t('detail.active')}>
                {activeUsers.map((user) => (
                  <li
                    key={user.userId}
                    className={`avatar${user.status === 'editing' ? ' editing' : ''}`}
                    title={user.userEmail}
                  >
                    <span aria-hidden="true">{initials(user.userEmail)}</span>
                    <span className="sr-only">{user.userEmail}</span>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn-secondary assistant-open" onClick={() => setAssistantOpen('ask')}>
              {t('trip.assistant.open')}
            </button>
          </div>
        </div>
      </TripCover>

      <nav ref={tabsRef} className="trip-tabs" aria-label={t('trip.navLabel')}>
        {TABS.map((tab) => (
          <NavLink key={tab.key} to={tab.to} end={tab.end} className="trip-tab">
            {t(`trip.tabs.${tab.key}`)}
            {/* Needs-me badge (spec 004 section 7.6): zero renders nothing, never a grey 0 */}
            {badges[tab.key] > 0 && (
              <>
                <span className="tab-badge" aria-hidden="true">
                  {badges[tab.key] > 9 ? '9+' : badges[tab.key]}
                </span>
                <span className="sr-only">{t('trip.badge', { count: badges[tab.key] })}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="trip-destination">
        <Outlet />
      </div>

      {/* Phones: the assistant is a floating button above the tab bar (spec 7.2) */}
      <button
        type="button"
        className="assistant-fab"
        onClick={() => setAssistantOpen('ask')}
        aria-label={t('trip.assistant.open')}
      >
        <span aria-hidden="true">✦</span>
      </button>

      {assistantOpen && <Assistant />}
      {mapOpen && (
        <Suspense fallback={<div className="map-mode" aria-busy="true" />}>
          <MapMode />
        </Suspense>
      )}
    </div>
  )
}

export default function TripLayout() {
  const { groupId } = useParams<{ groupId: string }>()
  if (!groupId) return null
  return (
    <TripProvider key={groupId} groupId={groupId}>
      <TripChrome />
    </TripProvider>
  )
}
