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
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rootRef.current?.querySelector<HTMLButtonElement>('.map-close')?.focus()
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
    <div ref={rootRef} className="map-mode" role="dialog" aria-modal="true" aria-label={t('trip.map.open')}>
      <LiveLocationMap
        groupId={trip.groupId}
        socket={socket}
        currentUid={currentUid}
        destination={trip.destination}
        initialLocations={locations}
        onClose={() => setMapOpen(false)}
        closeLabel={t('trip.map.close')}
      />
    </div>
  )
}
