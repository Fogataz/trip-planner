import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { io, Socket } from 'socket.io-client'
import { TripCoverData } from '../covers'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { ActivityEntry, ExpenseSummary, Poll, Remote, SeenKey, useActivity, useExpenses, usePolls, useSeen } from './tripData'
import { Badges, computeBadges } from './badges'
import { TripPhase, tripPhase } from './phase'

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
  /** The stored role: host, co-host or guest. Never compared in a component. */
  role: string
  /** The English word for that role on THIS trip. Server-side use; prefer the keys below. */
  roleLabel?: string
  /** i18n key for the role word on this trip kind — one of the 18 flat keys (spec 012 §6.2). */
  roleLabelKey?: string
  /** The spec 003 key to fall back to until O8 lands and `roles.*` is written. */
  roleLabelFallbackKey?: string
  status?: string
  invitedBy?: string
  invitedAt?: string
}

/**
 * What the signed-in viewer may do here, resolved by the server from the one
 * capability table (spec 011 §5.1, R-F11).
 *
 * The client renders every action control from `capabilities` and never from
 * a role name — spec 011 risk 1 is that the check gets duplicated here as
 * `if (role === 'host')` and drifts from the server. G5's test covers
 * client/src for exactly that reason.
 */
export interface TripViewer {
  role: string | null
  roleLabel: string | null
  status: string | null
  /** Held outright, on anything in this trip. */
  capabilities: string[]
  /** Held only on objects this person created — e.g. a guest closing their own poll. */
  ownCapabilities: string[]
}

export interface Trip {
  _id: string
  name: string
  groupId: string
  destination: { address: string; lat?: number; lng?: number }
  origin: { address: string; lat?: number; lng?: number }
  startDate: string
  endDate?: string
  /** Approximate length in days when the end date is not known yet */
  durationDays?: { min: number; max: number } | null
  itinerary: ItineraryItem[]
  members: TripMember[]
  viewer?: TripViewer
  travelSuggestions?: any
  accommodation?: { name?: string; address?: string }
  cover?: TripCoverData | null
}

/** Which part of the Trip assistant to show when it opens (spec 004 section 7.5) */
export type AssistantSection = 'ask' | 'draft' | 'ideas'

/** A stop the assistant proposed. Private to the person who asked until they add it to the plan. */
export interface DraftStop {
  stop: string
  time: string
  transport: string
  notes: string
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
  /** Does the viewer hold `capability` outright on this trip? */
  can: (capability: string) => boolean
  /** Does the viewer hold `capability` on this particular object, by right or by authorship? */
  canOn: (capability: string, createdBy?: string) => boolean
  push: ReturnType<typeof usePushNotifications>
  mapOpen: boolean
  setMapOpen: (open: boolean) => void
  assistantOpen: AssistantSection | false
  setAssistantOpen: (open: AssistantSection | false) => void
  drafts: DraftStop[]
  setDrafts: React.Dispatch<React.SetStateAction<DraftStop[]>>
  /** Where the trip is in its lifecycle (spec 004 section 5), in the viewer's timezone */
  phase: TripPhase
  polls: Remote<Poll[]>
  expenses: Remote<ExpenseSummary>
  activity: Remote<ActivityEntry[]>
  /** Last looks at Overview and Plan: `since` is the snapshot from when the trip was opened */
  seen: { since: Partial<Record<SeenKey, string>>; mark: (what: SeenKey) => void }
  badges: Badges
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
  const [assistantOpen, setAssistantOpen] = useState<AssistantSection | false>(false)
  const [drafts, setDrafts] = useState<DraftStop[]>([])
  const hasTrip = useRef(false)

  const refetch = useCallback(
    async ({ accessChanged = false } = {}) => {
      try {
        const response = await axios.get(`${apiUrl}/api/trips/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setTrip(response.data)
        hasTrip.current = true
        setError(null)
      } catch (err: any) {
        const status = err.response?.status
        // A failed background refetch must not replace a trip that is already
        // on screen — EXCEPT when the server has just told us this viewer's
        // access changed. Then a 403 is the answer, not a glitch, and leaving
        // the trip up would be the stale screen G4 exists to prevent.
        if (accessChanged && status === 403) {
          hasTrip.current = false
          setTrip(null)
          setError(t('detail.notMember'))
        } else if (!hasTrip.current) {
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
    },
    [apiUrl, groupId, token, t]
  )

  // Held in a ref so the socket effect can call the latest refetch without
  // tearing down and rebuilding the connection every time it changes.
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

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

    // G4 · Immediate revocation (spec 011 §6.2). The viewer's role or access
    // just changed. Re-fetch rather than sit on a screen whose controls may
    // no longer be theirs — if access is gone the fetch 403s and the normal
    // error path takes over, and if they were merely demoted the new
    // capability list arrives with the trip.
    socketInstance.on('trip:access-changed', () => {
      refetchRef.current({ accessChanged: true })
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

  // Capabilities come from the server already resolved. A component asks
  // "may I?", never "what am I?" (R-F11, AC 12).
  const capabilities = useMemo(() => new Set(trip?.viewer?.capabilities ?? []), [trip?.viewer?.capabilities])
  const ownCapabilities = useMemo(
    () => new Set(trip?.viewer?.ownCapabilities ?? []),
    [trip?.viewer?.ownCapabilities]
  )

  /** Held outright: may I do this to anything here? */
  const can = useCallback((capability: string) => capabilities.has(capability), [capabilities])

  /**
   * May I do this to THIS object? Held outright, or held on my own and this
   * one is mine. Asking `can()` alone is what put a close button on everyone's
   * poll and collected a 403 — the two cases are different answers.
   */
  const canOn = useCallback(
    (capability: string, createdBy?: string) =>
      capabilities.has(capability) ||
      (ownCapabilities.has(capability) && !!createdBy && createdBy === currentUid),
    [capabilities, ownCapabilities, currentUid]
  )

  const polls = usePolls(apiUrl, token, groupId, socket)
  const expenses = useExpenses(apiUrl, token, groupId, socket)
  const activity = useActivity(apiUrl, token, groupId, socket)
  const seenState = useSeen(groupId, currentUid)

  // Re-evaluate the phase each minute so a trip moves into Live at midnight without a reload
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  const phase = trip ? tripPhase(trip, now) : 'setup'

  const badges = useMemo(
    () =>
      computeBadges({
        currentUid,
        canManageInvites: capabilities.has('invite.manage'),
        members: trip?.members ?? [],
        polls: polls.data,
        expenses: expenses.data,
        activity: activity.data,
        seen: seenState.seen,
      }),
    [currentUid, capabilities, trip?.members, polls.data, expenses.data, activity.data, seenState.seen]
  )
  const seen = useMemo(() => ({ since: seenState.since, mark: seenState.mark }), [seenState.since, seenState.mark])

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
            can,
            canOn,
            push,
            mapOpen,
            setMapOpen,
            assistantOpen,
            setAssistantOpen,
            drafts,
            setDrafts,
            phase,
            polls,
            expenses,
            activity,
            seen,
            badges,
          }
        : null,
    [trip, refetch, socket, activeUsers, locations, apiUrl, token, currentUid, can, canOn, push, mapOpen, assistantOpen, drafts, phase, polls, expenses, activity, seen, badges]
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
