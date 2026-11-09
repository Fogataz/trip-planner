import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import './TripPlanner.css'
import '../components/TripCover.css'
import { TripCoverData, coverBackground, coverImageSrc, defaultGradient } from '../covers'

interface Trip {
  _id: string
  name: string
  groupId: string
  cover?: TripCoverData | null
  destination: { address: string }
  origin: { address: string }
  startDate: string
  members: Array<{ userId: string }>
}

export default function TripPlanner() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    origin: '',
    startDate: '',
  })

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
    try {
      const tripData = {
        name: formData.name,
        destination: { address: formData.destination },
        origin: { address: formData.origin },
        startDate: start.toISOString(),
      }
      const response = await axios.post(`${apiUrl}/api/trips`, tripData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrips([...trips, response.data])
      setFormData({ name: '', destination: '', origin: '', startDate: '' })
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

          <button type="submit">{t('trips.create')}</button>
        </form>
      )}

      <div className="trips-list">
        {trips.length === 0 ? (
          <p className="empty">{t('trips.empty')}</p>
        ) : (
          trips.map((trip) => (
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
                <small>{new Date(trip.startDate).toLocaleDateString(i18n.resolvedLanguage)}</small>
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
          ))
        )}
      </div>
    </div>
  )
}
