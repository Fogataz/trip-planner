import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import LiveLocationMap from '../components/LiveLocationMap'
import { useTrip } from './TripContext'

/**
 * The live map as a dismissible full-screen mode (F9). Closing it unmounts the map,
 * which stops location sharing - so sharing never outlives the screen that shows it.
 */
export default function MapMode() {
  const { t } = useTranslation()
  const { trip, socket, currentUid, locations, setMapOpen } = useTrip()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMapOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [setMapOpen])

  return (
    <div className="map-mode" role="dialog" aria-modal="true" aria-label={t('trip.map.open')}>
      <div className="map-mode__bar">
        <button ref={closeRef} type="button" className="btn-secondary" onClick={() => setMapOpen(false)}>
          {t('trip.map.close')}
        </button>
      </div>
      <div className="map-mode__body">
        <LiveLocationMap
          groupId={trip.groupId}
          socket={socket}
          currentUid={currentUid}
          destination={trip.destination}
          initialLocations={locations}
        />
      </div>
    </div>
  )
}
