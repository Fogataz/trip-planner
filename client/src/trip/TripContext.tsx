import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { io, Socket } from 'socket.io-client'
import { TripCoverData } from '../covers'
import { usePushNotifications } from '../hooks/usePushNotifications'

export interface ItineraryItem {
  _id: string
  stop: string
  time: string
  transport: string
  notes: string
  createdAt: string
  version?: number
}

export interface TripMember {
  userId?: string
  email?: string
  role: string
  status?: string
}

export interface Trip {
  _id: string
  name: string
  groupId: string
  destination: { address: string; lat?: number; lng?: number }
  origin: { address: string; lat?: number; lng?: number }
  startDate: string
  endDate: string
  itinerary: ItineraryItem[]
  members: TripMember[]
  travelSuggestions?: any
  accommodation?: { name?: string; address?: string }
  cover?: TripCoverData | null
}

export interface SharedLocation {
  userId: string
  userEmail?: string
  lat: number
  lng: number
  accuracy: number | null
  updatedAt: number
}

interface TripContextValue {
  trip: Trip
  setTrip: React.Dispatch<React.SetStateAction<Trip | null>>
  refetch: () => Promise<void>
  socket: Socket | null
  activeUsers: any[]
  locations: Record<string, SharedLocation>
  apiUrl: string
  token: string | null
  currentUid?: string
  isOrganizer: boolean
  push: ReturnType<typeof usePushNotifications>
  mapOpen: boolean
  setMapOpen: (open: boolean) => void
  assistantOpen: boolean
  setAssistantOpen: (open: boolean) => void
}

const TripContext = createContext<TripContextValue | null>(null)

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used inside TripProvider')
  return ctx
}

// Suggestions arrive over the socket. This backed-off poll is only the fallback if that event is missed.
const FALLBACK_POLL_MAX_ATTEMPTS = 6
const FALLBACK_POLL_BASE_MS = 3000
const FALLBACK_POLL_CAP_MS = 30000

export function TripProvider({ groupId, children }: { groupId: string; children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001'
  const token = localStorage.getItem('authToken')
  const currentUid = JSON.parse(localStorage.getItem('user') || '{}').uid
  const push = usePushNotifications(apiUrl, token)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [locations, setLocations] = useState<Record<string, SharedLocation>>({})
  const [mapOpen, setMapOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const hasTrip = useRef(false)

  const refetch = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/trips/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTrip(response.data)
      hasTrip.current = true
      setError(null)
    } catch (err: any) {
      const status = err.response?.status
      // A failed background refetch must not replace a trip that is already on screen
      if (!hasTrip.current) {
        setError(
          status === 403
            ? t('detail.notMember')
            : status === 404
              ? t('detail.notFound')
              : t('detail.loadFailed')
        )
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [apiUrl, groupId, token, t])

  // One trip fetch on entry, and again when the UI language changes (suggestions are generated per language)
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, locale])

  // One socket for the whole trip, shared by every destination
  useEffect(() => {
    const socketInstance = io(apiUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      socketInstance.emit('join-trip', { tripId: groupId, userId: token })
    })

    socketInstance.on('presence:update', (data) => {
      setActiveUsers(data.activeUsers || [])
    })

    socketInstance.on('itinerary:itemAdded', (data) => {
      setTrip((prev) => {
        if (!prev) return prev
        if (prev.itinerary.some((i) => i._id === data.item._id)) return prev
        return { ...prev, itinerary: [...prev.itinerary, data.item] }
      })
    })

    socketInstance.on('itinerary:itemUpdated', (data) => {
      setTrip((prev) =>
        prev
          ? { ...prev, itinerary: prev.itinerary.map((item) => (item._id === data.itemId ? data.item : item)) }
          : prev
      )
    })

    socketInstance.on('itinerary:itemDeleted', (data) => {
      setTrip((prev) =>
        prev ? { ...prev, itinerary: prev.itinerary.filter((item) => item._id !== data.itemId) } : prev
      )
    })

    socketInstance.on('trip:coverUpdated', (data) => {
      setTrip((prev) => (prev ? { ...prev, cover: data.cover ?? null } : prev))
    })

    socketInstance.on('trip:suggestionsUpdated', (data) => {
      setTrip((prev) => (prev ? { ...prev, travelSuggestions: data.travelSuggestions } : prev))
    })

    // Live location is kept here so the map can open and close without missing anyone (it is never stored)
    socketInstance.on('location:snapshot', ({ locations: list }: { locations: SharedLocation[] }) =>
      setLocations(Object.fromEntries(list.map((l) => [l.userId, l])))
    )
    socketInstance.on('location:update', (loc: SharedLocation) =>
      setLocations((prev) => ({ ...prev, [loc.userId]: loc }))
    )
    socketInstance.on('location:stopped', ({ userId }: { userId: string }) =>
      setLocations((prev) => {
        const { [userId]: _removed, ...rest } = prev
        return rest
      })
    )

    setSocket(socketInstance)

    return () => {
      socketInstance.emit('leave-trip', groupId)
      socketInstance.disconnect()
      setSocket(null)
    }
  }, [groupId, apiUrl, token])

  // Fallback only: backed-off re-fetch while suggestions are missing or in the wrong language
  const suggestions = trip?.travelSuggestions
  const needsSuggestions =
    !!trip && (!suggestions?.raw_suggestions || (suggestions.language || 'en') !== locale)
  useEffect(() => {
    if (!needsSuggestions) return
    let attempt = 0
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      if (attempt >= FALLBACK_POLL_MAX_ATTEMPTS) return
      const delay = Math.min(FALLBACK_POLL_BASE_MS * 2 ** attempt, FALLBACK_POLL_CAP_MS)
      attempt += 1
      timer = setTimeout(async () => {
        await refetch()
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [needsSuggestions, locale, refetch])

  const isOrganizer = !!trip?.members.some((m) => m.role === 'organizer' && m.userId === currentUid)

  const value = useMemo<TripContextValue | null>(
    () =>
      trip
        ? {
            trip,
            setTrip,
            refetch,
            socket,
            activeUsers,
            locations,
            apiUrl,
            token,
            currentUid,
            isOrganizer,
            push,
            mapOpen,
            setMapOpen,
            assistantOpen,
            setAssistantOpen,
          }
        : null,
    [trip, refetch, socket, activeUsers, locations, apiUrl, token, currentUid, isOrganizer, push, mapOpen, assistantOpen]
  )

  // Skeleton in the shape of the trip chrome and tabs, so nothing jumps when the trip arrives (N3, N4)
  if (loading)
    return (
      <div className="trip-skeleton" role="status" aria-label={t('detail.loading')}>
        <div className="skeleton-block skeleton-back" />
        <div className="skeleton-block skeleton-cover" />
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-tabs" />
        <div className="skeleton-block skeleton-card" />
      </div>
    )
  if (error)
    return (
      <div className="error">
        {error}{' '}
        <button type="button" className="btn-link" onClick={() => { setLoading(true); refetch() }}>
          {t('trip.retry')}
        </button>
      </div>
    )
  if (!value) return <div className="error">{t('detail.notFound')}</div>

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}
