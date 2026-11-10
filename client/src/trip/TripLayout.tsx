import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TripCover from '../components/TripCover'
import { TripProvider, useTrip } from './TripContext'
import Assistant from './Assistant'
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
  const { trip, setTrip, apiUrl, token, activeUsers, mapOpen, assistantOpen, setAssistantOpen } = useTrip()

  // Set when we arrive straight from creating the trip, to nudge the cover once.
  // Captured once, then cleared from history so a reload does not nudge again.
  const [justCreated] = useState(() =>
    Boolean((location.state as { justCreated?: boolean } | null)?.justCreated)
  )
  useEffect(() => {
    if (justCreated) navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Per-destination scroll position: restored on back/forward, reset on a fresh visit.
  // On a destination change focus moves to that destination's heading (N5, AC26).
  const scrollPositions = useRef<Record<string, number>>({})
  const previousPath = useRef(location.pathname)
  useEffect(() => {
    const key = location.pathname
    if (previousPath.current !== key) {
      previousPath.current = key
      window.scrollTo(0, navigationType === 'POP' ? scrollPositions.current[key] ?? 0 : 0)
      document.getElementById('destination-heading')?.focus({ preventScroll: true })
    }
    return () => {
      scrollPositions.current[key] = window.scrollY
    }
  }, [location.pathname, navigationType])

  const dateRange = `${new Date(trip.startDate).toLocaleDateString(locale)} – ${
    trip.endDate ? new Date(trip.endDate).toLocaleDateString(locale) : t('detail.tbd')
  }`
  const route = [trip.origin?.address, trip.destination?.address].filter(Boolean).join(' → ')

  return (
    <div className="trip-detail">
      <button className="back-button" onClick={() => navigate('/trips')}>
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
          <h1>{trip.name}</h1>
          <button type="button" className="btn-secondary" onClick={() => setAssistantOpen(true)}>
            {t('trip.assistant.open')}
          </button>
        </div>
        <p className="trip-subtitle">
          {[route, dateRange].filter(Boolean).join(' · ')}
        </p>
        {activeUsers.length > 0 && (
          <div className="presence-indicator">
            <span>{t('detail.active')}</span>
            <ul className="avatar-cluster">
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
          </div>
        )}
      </TripCover>

      <nav className="trip-tabs" aria-label={t('trip.navLabel')}>
        {TABS.map((tab) => (
          <NavLink key={tab.key} to={tab.to} end={tab.end} className="trip-tab">
            {t(`trip.tabs.${tab.key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="trip-destination">
        <Outlet />
      </div>

      {assistantOpen && <Assistant />}
      {mapOpen && (
        <Suspense fallback={null}>
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
