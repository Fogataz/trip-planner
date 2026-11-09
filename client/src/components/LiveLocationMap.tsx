import { useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import type { Socket } from 'socket.io-client'
import 'leaflet/dist/leaflet.css'

interface SharedLocation {
  userId: string
  userEmail?: string
  lat: number
  lng: number
  accuracy: number | null
  updatedAt: number
}

interface Props {
  groupId: string
  socket: Socket | null
  currentUid?: string
  destination?: { lat?: number; lng?: number; address?: string }
}

const STALE_AFTER_MS = 2 * 60 * 1000

// Keeps everyone in view whenever the set of shared locations changes
function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) map.setView(points[0], Math.max(map.getZoom(), 13))
    else map.fitBounds(points, { padding: [40, 40], maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])
  return null
}

export default function LiveLocationMap({ groupId, socket, currentUid, destination }: Props) {
  const { t } = useTranslation()
  const [locations, setLocations] = useState<Record<string, SharedLocation>>({})
  const [sharing, setSharing] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const watchId = useRef<number | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!socket) return
    const onSnapshot = ({ locations: list }: { locations: SharedLocation[] }) =>
      setLocations(Object.fromEntries(list.map((l) => [l.userId, l])))
    const onUpdate = (loc: SharedLocation) => setLocations((prev) => ({ ...prev, [loc.userId]: loc }))
    const onStopped = ({ userId }: { userId: string }) =>
      setLocations((prev) => {
        const { [userId]: _removed, ...rest } = prev
        return rest
      })

    socket.on('location:snapshot', onSnapshot)
    socket.on('location:update', onUpdate)
    socket.on('location:stopped', onStopped)
    return () => {
      socket.off('location:snapshot', onSnapshot)
      socket.off('location:update', onUpdate)
      socket.off('location:stopped', onStopped)
    }
  }, [socket])

  const stopSharing = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    socket?.emit('location:stop', { tripId: groupId })
    setSharing(false)
  }

  const startSharing = () => {
    if (!socket) return
    if (!('geolocation' in navigator)) {
      setGeoError(t('location.unsupported'))
      return
    }
    setGeoError(null)
    watchId.current = navigator.geolocation.watchPosition(
      (pos) =>
        socket.emit('location:update', {
          tripId: groupId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? t('location.denied')
            : t('location.failed')
        )
        stopSharing()
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    )
    setSharing(true)
  }

  // Stop sharing when leaving the page
  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
      socket?.emit('location:stop', { tripId: groupId })
    }
  }, [socket, groupId])

  const list = Object.values(locations)
  const destPoint: [number, number] | null =
    destination?.lat != null && destination?.lng != null ? [destination.lat, destination.lng] : null
  const points: Array<[number, number]> = list.map((l) => [l.lat, l.lng])
  if (destPoint) points.push(destPoint)

  return (
    <div className="qa-section">
      <div className="section-header">
        <h2>{t('location.title')}</h2>
        <button type="button" onClick={sharing ? stopSharing : startSharing} disabled={!socket}>
          {sharing ? t('location.stop') : t('location.share')}
        </button>
      </div>

      <p className="hint">
        {sharing
          ? t('location.hintOn')
          : t('location.hintOff')}
      </p>
      {geoError && <p className="text-error">{geoError}</p>}

      <MapContainer
        center={destPoint || [20, 0]}
        zoom={destPoint ? 11 : 2}
        className="live-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {destPoint && (
          <CircleMarker
            center={destPoint}
            radius={10}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#d32f2f', fillOpacity: 1 }}
          >
            <Popup>{destination?.address || t('location.destination')}</Popup>
          </CircleMarker>
        )}
        {list.map((loc) => {
          const mine = loc.userId === currentUid
          const stale = now - loc.updatedAt > STALE_AFTER_MS
          const color = stale ? '#9e9e9e' : mine ? '#4caf50' : '#1976d2'
          return (
            <CircleMarker
              key={loc.userId}
              center={[loc.lat, loc.lng]}
              radius={9}
              pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}
            >
              <Tooltip permanent direction="top" offset={[0, -8]}>
                {mine ? t('location.you') : loc.userEmail || t('location.member')}
                {stale ? ` ${t('location.stale')}` : ''}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <p className="hint">
        {list.length === 0
          ? t('location.nobody')
          : t('location.sharingCount', { count: list.length })}
      </p>
    </div>
  )
}
