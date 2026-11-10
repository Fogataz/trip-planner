import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import './TripPlanner.css'
import '../components/TripCover.css'
import { TripCoverData, coverBackground, coverImageSrc, defaultGradient } from '../covers'
import { calendarDay, localToday, tripEndDay, tripPhase } from '../trip/phase'
import { formatTripDates } from '../trip/format'

interface Trip {
  _id: string
  name: string
  groupId: string
  cover?: TripCoverData | null
  destination: { address: string }
  origin: { address: string }
  startDate: string
  endDate?: string
  durationDays?: { min: number; max: number } | null
  itinerary?: Array<unknown>
  members: Array<{ userId: string; status?: string }>
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

type TripGroup = 'live' | 'upcoming' | 'past'

/** Live now / Upcoming / Past, each ordered by how close it is to today (spec 004 F15) */
function groupTrips(trips: Trip[], now = new Date()): Array<{ key: TripGroup; trips: Trip[] }> {
  const groups: Record<TripGroup, Trip[]> = { live: [], upcoming: [], past: [] }
  for (const trip of trips) {
    const phase = tripPhase(trip, now)
    groups[phase === 'live' ? 'live' : phase === 'wrap' ? 'past' : 'upcoming'].push(trip)
  }
  const byStart = (a: Trip, b: Trip) => Date.parse(a.startDate) - Date.parse(b.startDate)
  groups.live.sort(byStart)
  groups.upcoming.sort(byStart)
  groups.past.sort(
    (a, b) =>
      Date.parse(tripEndDay(b.startDate, b.endDate, b.durationDays)) -
      Date.parse(tripEndDay(a.startDate, a.endDate, a.durationDays))
  )
  return (['live', 'upcoming', 'past'] as const).map((key) => ({ key, trips: groups[key] })).filter((g) => g.trips.length > 0)
}

export default function TripPlanner() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const emptyForm = {
    name: '',
    destination: '',
    origin: '',
    startDate: '',
    // The end date is optional: people often know roughly how long, not the exact day
    lengthMode: 'end' as 'end' | 'approx',
    endDate: '',
    minDays: '',
    maxDays: '',
  }
  const [formData, setFormData] = useState(emptyForm)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001'
  const token = localStorage.getItem('authToken')

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrips(response.data)
    } catch (err) {
      setError(t('trips.loadFailed'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    const start = new Date(formData.startDate)
    if (!formData.startDate || isNaN(start.getTime())) {
      setError(t('trips.invalidDate'))
      return
    }
    let endDate: string | undefined
    let durationDays: { min: number; max: number } | undefined
    if (formData.lengthMode === 'end' && formData.endDate) {
      if (formData.endDate < formData.startDate) {
        setError(t('trips.endBeforeStart'))
        return
      }
      endDate = new Date(formData.endDate).toISOString()
    }
    if (formData.lengthMode === 'approx' && (formData.minDays || formData.maxDays)) {
      const min = Number(formData.minDays || formData.maxDays)
      const max = Number(formData.maxDays || formData.minDays)
      if (!(min >= 1) || !(max >= min) || max > 365) {
        setError(t('trips.invalidLength'))
        return
      }
      durationDays = { min, max }
    }
    try {
      const tripData = {
        name: formData.name,
        destination: { address: formData.destination },
        origin: { address: formData.origin },
        startDate: start.toISOString(),
        endDate,
        durationDays,
      }
      const response = await axios.post(`${apiUrl}/api/trips`, tripData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrips([...trips, response.data])
      setFormData(emptyForm)
      setFormOpen(false)
      setError(null)
      // Land on the new trip, where the cover affordance gets its one nudge
      navigate(`/trips/${response.data.groupId}`, { state: { justCreated: true } })
    } catch (err) {
      setError(t('trips.createFailed'))
      console.error(err)
    }
  }

  const handleDeleteTrip = async (groupId: string) => {
    try {
      await axios.delete(`${apiUrl}/api/trips/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrips(trips.filter((t) => t.groupId !== groupId))
    } catch (err) {
      setError(t('trips.deleteFailed'))
      console.error(err)
    }
  }

  const today = localToday(new Date())
  const daysAway = (trip: Trip) => daysBetween(today, calendarDay(trip.startDate))
  const dayOf = (trip: Trip) => daysBetween(calendarDay(trip.startDate), today) + 1
  const lengthOf = (trip: Trip) =>
    daysBetween(calendarDay(trip.startDate), tripEndDay(trip.startDate, trip.endDate, trip.durationDays)) + 1

  if (loading) return <div className="loading">{t('trips.loading')}</div>

  return (
    <div className="trip-planner">
      <div className="header">
        <h2>{t('trips.title')}</h2>
        <button onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? t('common.cancel') : t('trips.new')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {formOpen && (
        <form className="trip-form" onSubmit={handleCreateTrip}>
          <div className="form-group">
            <label>{t('trips.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('trips.namePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('trips.origin')}</label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder={t('trips.originPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('trips.destination')}</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder={t('trips.destinationPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('trips.startDate')}</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <fieldset className="form-group trip-length">
            <legend>{t('trips.length')}</legend>
            <div className="segmented" role="radiogroup">
              <label>
                <input
                  type="radio"
                  name="lengthMode"
                  checked={formData.lengthMode === 'end'}
                  onChange={() => setFormData({ ...formData, lengthMode: 'end' })}
                />
                {t('trips.lengthEnd')}
              </label>
              <label>
                <input
                  type="radio"
                  name="lengthMode"
                  checked={formData.lengthMode === 'approx'}
                  onChange={() => setFormData({ ...formData, lengthMode: 'approx' })}
                />
                {t('trips.lengthApprox')}
              </label>
            </div>
            {formData.lengthMode === 'end' ? (
              <input
                type="date"
                aria-label={t('trips.endDate')}
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            ) : (
              <div className="length-range">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={365}
                  aria-label={t('trips.minDays')}
                  placeholder="8"
                  value={formData.minDays}
                  onChange={(e) => setFormData({ ...formData, minDays: e.target.value })}
                />
                <span aria-hidden="true">–</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={365}
                  aria-label={t('trips.maxDays')}
                  placeholder="10"
                  value={formData.maxDays}
                  onChange={(e) => setFormData({ ...formData, maxDays: e.target.value })}
                />
                <span>{t('trips.days')}</span>
              </div>
            )}
            <p className="hint">{t('trips.lengthHint')}</p>
          </fieldset>

          <button type="submit">{t('trips.create')}</button>
        </form>
      )}

      {trips.length === 0 ? (
        <p className="empty">{t('trips.empty')}</p>
      ) : (
        groupTrips(trips).map((group) => (
          <section key={group.key} className="trip-group" aria-labelledby={`trips-${group.key}`}>
            <h3 id={`trips-${group.key}`} className="trip-group-heading">
              {t(`trips.group.${group.key}`)}
            </h3>
            <div className="trips-list">
              {group.trips.map((trip) => (
                <div key={trip._id} className="trip-card">
                  <div
                    className="trip-card__cover"
                    style={{ background: coverBackground(trip.cover ?? null, trip.groupId) }}
                    onClick={() => navigate(`/trips/${trip.groupId}`)}
                  >
                    {coverImageSrc(apiUrl, trip.cover) && (
                      <img
                        src={coverImageSrc(apiUrl, trip.cover) as string}
                        alt=""
                        loading="lazy"
                        style={{ objectPosition: `50% ${trip.cover?.focalY ?? 50}%` }}
                        onError={(e) => {
                          // Missing asset: fall back to the trip's default gradient, never a broken icon
                          const strip = e.currentTarget.parentElement
                          if (strip) strip.style.background = defaultGradient(trip.groupId)
                          e.currentTarget.remove()
                        }}
                      />
                    )}
                  </div>
                  <div className="trip-info" onClick={() => navigate(`/trips/${trip.groupId}`)}>
                    <h3>{trip.name}</h3>
                    <p>{trip.origin?.address || t('common.unknown')} → {trip.destination?.address || t('common.unknown')}</p>
                    <small>
                      {formatTripDates(trip, i18n.resolvedLanguage || 'en', t)}
                      {group.key === 'upcoming' && daysAway(trip) > 0 && ` · ${t('trips.inDays', { count: daysAway(trip) })}`}
                      {group.key === 'live' && ` · ${t('trips.dayOf', { n: dayOf(trip), total: lengthOf(trip) })}`}
                    </small>
                  </div>
                  <div className="trip-actions">
                    <span className="members">{t('trips.members', { count: trip.members.length })}</span>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        if (confirm(t('trips.confirmDelete'))) {
                          handleDeleteTrip(trip.groupId)
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
