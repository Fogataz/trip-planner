import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import Polls from '../../components/Polls'
import DestinationHeading from '../DestinationHeading'
import { chunkIdeas } from '../ideas'
import { ItineraryItem, useTrip } from '../TripContext'
import { useOneShotIntent } from '../useOneShotIntent'
import { groupByDay, nowAndNext } from '../itineraryDays'

function transportIcon(transport: string): string {
  const t = transport.toLowerCase()
  if (/\b(walk|on foot|stroll|caminh|a pé|a pie|pasear)/.test(t)) return '🚶'
  if (/\b(bus|coach|ônibus|onibus|autocarro|autobús|autobus)\b/.test(t)) return '🚌'
  if (/\b(train|rail|tram|luas|dart|trem|comboio|tren|bonde|eléctrico)\b/.test(t)) return '🚆'
  if (/\b(metro|metrô|tube|underground|subway|line)\b/.test(t)) return '🚇'
  if (/\b(flight|fly|plane|airport|voo|avião|aeroporto|vuelo|avión|aeropuerto)\b/.test(t)) return '✈️'
  if (/\b(ferry|boat|ship|balsa|barco|barca|ferri)\b/.test(t)) return '⛴️'
  if (/\b(bike|bicycle|cycle|bicicleta|bici)\b/.test(t)) return '🚲'
  if (/\b(taxi|táxi|uber|cab)\b/.test(t)) return '🚕'
  if (/\b(car|drive|driving|carro|coche|dirigir|conduc\w*)\b/.test(t)) return '🚗'
  return '🧭'
}

export default function Plan() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const { trip, refetch, socket, activeUsers, apiUrl, token, currentUid, canOn, setMapOpen, setAssistantOpen, phase, seen, activity } =
    useTrip()
  const groupId = trip.groupId
  const live = phase === 'live'
  const ideaCount = chunkIdeas(trip.travelSuggestions?.raw_suggestions).length
  const [now] = useState(() => new Date())
  const current = nowAndNext(trip.itinerary, now)

  // Opening Plan clears its "itinerary changed" badge
  // While it is open, new activity counts as seen, so the tab you are looking at never badges itself
  useEffect(() => {
    seen.mark('plan')
  }, [seen, activity.data])

  // During the trip, Plan opens on today's stops (AC12)
  useEffect(() => {
    if (live) document.getElementById('plan-today')?.scrollIntoView({ block: 'start' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const intent = useOneShotIntent()
  const [showItineraryForm, setShowItineraryForm] = useState(intent === 'addStop')
  const [itineraryForm, setItineraryForm] = useState({ stop: '', time: '', transport: '', notes: '' })
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [conflictError, setConflictError] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddItinerary = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingItemId ? 'put' : 'post'
      const url = editingItemId
        ? `${apiUrl}/api/trips/${groupId}/itinerary/${editingItemId}`
        : `${apiUrl}/api/trips/${groupId}/itinerary`

      const payload = editingItemId
        ? { ...itineraryForm, version: trip.itinerary.find((i) => i._id === editingItemId)?.version }
        : itineraryForm

      await axios[method](url, payload, { headers: { Authorization: `Bearer ${token}` } })

      setItineraryForm({ stop: '', time: '', transport: '', notes: '' })
      setEditingItemId(null)
      setShowItineraryForm(false)
      setConflictError(null)
      setError(null)

      if (socket) socket.emit('presence:stopEdit', { tripId: groupId, userId: token })

      refetch()
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflictError({
          currentVersion: err.response.data.currentVersion,
          expectedVersion: err.response.data.expectedVersion,
          itemId: editingItemId,
        })
        setError(t('detail.conflictError'))
      } else {
        setError(t('detail.saveItemFailed'))
      }
      console.error(err)
    }
  }

  const handleDeleteItinerary = async (itemId: string) => {
    try {
      await axios.delete(`${apiUrl}/api/trips/${groupId}/itinerary/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      refetch()
    } catch (err) {
      setError(t('detail.deleteItemFailed'))
      console.error(err)
    }
  }

  const handleEditItinerary = (item: ItineraryItem) => {
    setItineraryForm({
      stop: item.stop,
      time: item.time.slice(0, 16),
      transport: item.transport,
      notes: item.notes,
    })
    setEditingItemId(item._id)
    setShowItineraryForm(true)
    if (socket) socket.emit('presence:startEdit', { tripId: groupId, userId: token, itemId: item._id })
  }

  const handleCancelEdit = () => {
    setItineraryForm({ stop: '', time: '', transport: '', notes: '' })
    setEditingItemId(null)
    setShowItineraryForm(false)
    setConflictError(null)
    if (socket) socket.emit('presence:stopEdit', { tripId: groupId, userId: token })
  }

  return (
    <>
      <DestinationHeading name="plan" />

      {conflictError && (
        <div className="conflict-banner">
          <strong>{t('detail.conflictTitle')}</strong> {t('detail.conflictBody')}
          <button
            className="btn-link"
            onClick={() => {
              refetch()
              setConflictError(null)
              setError(null)
            }}
          >
            {t('detail.reload')}
          </button>
        </div>
      )}
      {error && !conflictError && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {trip.itinerary.length === 0 && !showItineraryForm ? (
        // Empty state (F14): one line of purpose, the primary action, then the low-effort path
        <section className="itinerary-section empty-state">
          <h2>{t('trip.planEmpty.title')}</h2>
          <p>{t('trip.planEmpty.body')}</p>
          <div className="row-actions">
            <button type="button" onClick={() => setShowItineraryForm(true)}>
              {t('trip.setup.planAction')}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setAssistantOpen('draft')}>
              {t('trip.setup.draftPlan')}
            </button>
          </div>
        </section>
      ) : (
      <div className="itinerary-section">
        <div className="section-header">
          <h2>{t('detail.itinerary')}</h2>
          <div className="section-actions plan-actions">
            {/* One primary action per destination (F7): Add stop. The rest are secondary. */}
            <button type="button" className="btn-secondary" onClick={() => setMapOpen(true)}>
              {t('trip.map.short')}
            </button>
            {/* AI drafting lives in the Trip assistant: it proposes, the group decides (section 7.5) */}
            <button type="button" className="btn-secondary" onClick={() => setAssistantOpen('draft')}>
              {t('trip.assistant.draftShort')}
            </button>
            <button
              type="button"
              className="add-button"
              onClick={() => (showItineraryForm ? handleCancelEdit() : setShowItineraryForm(true))}
            >
              {showItineraryForm ? t('common.cancel') : t('detail.addStop')}
            </button>
          </div>
        </div>

        {showItineraryForm && (
          <form className="itinerary-form" onSubmit={handleAddItinerary}>
            <div className="form-group">
              <label>{t('detail.stop')}</label>
              <input
                type="text"
                value={itineraryForm.stop}
                onChange={(e) => setItineraryForm({ ...itineraryForm, stop: e.target.value })}
                placeholder={t('detail.stopPlaceholder')}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('detail.dateTime')}</label>
              <input
                type="datetime-local"
                value={itineraryForm.time}
                onChange={(e) => setItineraryForm({ ...itineraryForm, time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('detail.transport')}</label>
              <input
                type="text"
                value={itineraryForm.transport}
                onChange={(e) => setItineraryForm({ ...itineraryForm, transport: e.target.value })}
                placeholder={t('detail.transportPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('detail.notes')}</label>
              <textarea
                value={itineraryForm.notes}
                onChange={(e) => setItineraryForm({ ...itineraryForm, notes: e.target.value })}
                placeholder={t('detail.notesPlaceholder')}
              />
            </div>

            <button type="submit">{editingItemId ? t('detail.updateStop') : t('detail.addStopSubmit')}</button>
          </form>
        )}

        {groupByDay(trip.itinerary, trip.startDate, now).map((group) => {
          const heading = new Date(`${group.day}T12:00:00`).toLocaleDateString(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })
          return (
            <section
              key={group.day}
              id={group.isToday ? 'plan-today' : undefined}
              className={`itinerary-day${group.isToday && live ? ' is-today' : ''}`}
              aria-labelledby={`day-${group.day}`}
            >
              <h3 id={`day-${group.day}`} className="day-heading">
                {group.dayNumber ? t('trip.plan.dayHeading', { n: group.dayNumber, date: heading }) : heading}
                {group.isToday && live && <span className="day-today">{t('trip.plan.today')}</span>}
              </h3>
              <div className="itinerary-list">
                {group.items.map((item) => {
                  const editingUser = activeUsers.find((u) => u.editingItemId === item._id)
                  const marker = live && current.now?._id === item._id ? 'now' : live && current.next?._id === item._id ? 'next' : null
                  return (
                    <div
                      key={item._id}
                      className={`itinerary-item${editingUser ? ' editing' : ''}${marker ? ` is-${marker}` : ''}`}
                    >
                      <div className="item-content">
                        {editingUser && (
                          <div className="editing-note">{t('detail.isEditing', { name: editingUser.userEmail })}</div>
                        )}
                        {marker && <span className="stop-marker">{t(`trip.plan.${marker}`)}</span>}
                        <h3>{item.stop}</h3>
                        <p className="time">{new Date(item.time).toLocaleTimeString(locale, { timeStyle: 'short' })}</p>
                        {item.transport && (
                          <p className="transport">
                            {transportIcon(item.transport)} {item.transport}
                          </p>
                        )}
                        {item.notes && <p className="notes">{item.notes}</p>}
                      </div>
                      <div className="item-actions">
                        <button
                          className="edit-button"
                          aria-label={t('trip.plan.editStop', { stop: item.stop })}
                          onClick={() => handleEditItinerary(item)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-button"
                          aria-label={t('trip.plan.deleteStop', { stop: item.stop })}
                          onClick={() => handleDeleteItinerary(item._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      )}

      <Polls
        groupId={trip.groupId}
        apiUrl={apiUrl}
        token={token}
        currentUid={currentUid}
        canManagePoll={(poll) => canOn('poll.close', poll.createdBy)}
      />

      {ideaCount > 0 && (
        <button type="button" className="overview-card summary-card ideas-link" onClick={() => setAssistantOpen('ideas')}>
          <strong>{t('trip.assistant.ideasCount', { count: ideaCount })}</strong>
          <span className="muted">{t('trip.assistant.ideasHint')}</span>
        </button>
      )}
    </>
  )
}
