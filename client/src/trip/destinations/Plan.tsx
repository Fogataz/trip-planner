import { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import Polls from '../../components/Polls'
import DestinationHeading from '../DestinationHeading'
import Ideas from '../Ideas'
import { ItineraryItem, useTrip } from '../TripContext'

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
  const { trip, refetch, socket, activeUsers, apiUrl, token, currentUid, isOrganizer, setMapOpen } = useTrip()
  const groupId = trip.groupId

  const [showItineraryForm, setShowItineraryForm] = useState(false)
  const [itineraryForm, setItineraryForm] = useState({ stop: '', time: '', transport: '', notes: '' })
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [conflictError, setConflictError] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatingItinerary, setGeneratingItinerary] = useState(false)

  const handleGenerateItinerary = async () => {
    const preferences = window.prompt(t('detail.aiPreferencesPrompt'), '')
    if (preferences === null) return
    setGeneratingItinerary(true)
    try {
      await axios.post(
        `${apiUrl}/api/trips/${groupId}/itinerary/generate`,
        { preferences },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      refetch()
    } catch (err: any) {
      alert(t('common.errorPrefix', { message: err.response?.data?.error || t('detail.generateFailed') }))
    } finally {
      setGeneratingItinerary(false)
    }
  }

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

      <div className="itinerary-section">
        <div className="section-header">
          <h2>{t('detail.itinerary')}</h2>
          <div className="section-actions">
            <button type="button" className="btn-secondary" onClick={() => setMapOpen(true)}>
              {t('trip.map.open')}
            </button>
            <button className="add-button" onClick={handleGenerateItinerary} disabled={generatingItinerary}>
              {generatingItinerary ? t('detail.generating') : t('detail.generate')}
            </button>
            <button
              className="add-button"
              onClick={() => (showItineraryForm ? handleCancelEdit() : setShowItineraryForm(true))}
            >
              {showItineraryForm ? t('common.cancel') : t('detail.addStop')}
            </button>
          </div>
        </div>

        <p className="hint">{t('detail.itineraryDisclaimer')}</p>

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

        <div className="itinerary-list">
          {trip.itinerary.length === 0 ? (
            <p className="empty">{t('detail.noStops')}</p>
          ) : (
            trip.itinerary.map((item) => {
              const editingUser = activeUsers.find((u) => u.editingItemId === item._id)
              return (
                <div key={item._id} className={`itinerary-item${editingUser ? ' editing' : ''}`}>
                  <div className="item-content">
                    {editingUser && (
                      <div className="editing-note">{t('detail.isEditing', { name: editingUser.userEmail })}</div>
                    )}
                    <h3>{item.stop}</h3>
                    <p className="time">{new Date(item.time).toLocaleString(locale)}</p>
                    {item.transport && (
                      <p className="transport">
                        {transportIcon(item.transport)} {item.transport}
                      </p>
                    )}
                    {item.notes && <p className="notes">{item.notes}</p>}
                  </div>
                  <div className="item-actions">
                    <button className="edit-button" onClick={() => handleEditItinerary(item)}>
                      ✏️
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteItinerary(item._id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Polls
        groupId={trip.groupId}
        apiUrl={apiUrl}
        token={token}
        currentUid={currentUid}
        isOrganizer={isOrganizer}
        socket={socket}
      />

      <Ideas />
    </>
  )
}
