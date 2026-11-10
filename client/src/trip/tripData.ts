import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import type { Socket } from 'socket.io-client'

/*
 * Trip data shared by the four destinations (spec 004 section 8.2): each list loads once per trip,
 * lives in TripContext, and the trip's socket keeps it fresh. Switching destinations never refetches.
 */

export interface PollOption {
  _id: string
  text: string
  votes: string[]
}

export interface Poll {
  _id: string
  question: string
  options: PollOption[]
  allowMultiple: boolean
  status: 'open' | 'closed'
  createdBy: string
}

export interface Expense {
  _id: string
  description: string
  amountCents: number
  currency: string
  paidBy: string
  splitAmong: string[]
  createdBy: string
}

export interface ExpenseSummary {
  expenses: Expense[]
  /** Per member, in cents: positive means the group owes them, negative means they owe */
  balances: Record<string, number>
  settlements: Array<{ from: string; to: string; amountCents: number }>
}

export interface ActivityEntry {
  _id: string
  action: string
  targetType?: string
  targetId?: string
  targetDetails?: any
  changes?: any
  description?: string
  userId?: string
  userEmail?: string
  timestamp: string
}

export interface Remote<T> {
  data: T
  loaded: boolean
  error: string | null
  reload: () => Promise<void>
  set: React.Dispatch<React.SetStateAction<T>>
}

function useRemote<T>(url: string, token: string | null, initial: T): Remote<T> {
  const [data, set] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const res = await axios.get<T>(url, { headers: { Authorization: `Bearer ${token}` } })
      set(res.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'error')
    } finally {
      setLoaded(true)
    }
  }, [url, token])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loaded, error, reload, set }
}

export function usePolls(apiUrl: string, token: string | null, groupId: string, socket: Socket | null) {
  const polls = useRemote<Poll[]>(`${apiUrl}/api/polls/trip/${groupId}`, token, [])
  const { set } = polls
  useEffect(() => {
    if (!socket) return
    const onCreated = ({ poll }: { poll: Poll }) =>
      set((prev) => (prev.some((p) => p._id === poll._id) ? prev : [poll, ...prev]))
    const onUpdated = ({ poll }: { poll: Poll }) => set((prev) => prev.map((p) => (p._id === poll._id ? poll : p)))
    const onDeleted = ({ pollId }: { pollId: string }) => set((prev) => prev.filter((p) => p._id !== pollId))
    socket.on('poll:created', onCreated)
    socket.on('poll:updated', onUpdated)
    socket.on('poll:deleted', onDeleted)
    return () => {
      socket.off('poll:created', onCreated)
      socket.off('poll:updated', onUpdated)
      socket.off('poll:deleted', onDeleted)
    }
  }, [socket, set])
  return polls
}

export function useExpenses(apiUrl: string, token: string | null, groupId: string, socket: Socket | null) {
  const expenses = useRemote<ExpenseSummary>(`${apiUrl}/api/expenses/trip/${groupId}`, token, {
    expenses: [],
    balances: {},
    settlements: [],
  })
  const { reload } = expenses
  useEffect(() => {
    if (!socket) return
    socket.on('expenses:changed', reload)
    return () => {
      socket.off('expenses:changed', reload)
    }
  }, [socket, reload])
  return expenses
}

/** The activity log (A10). Re-read when something that writes to it happens on the trip's socket. */
export function useActivity(apiUrl: string, token: string | null, groupId: string, socket: Socket | null) {
  const activity = useRemote<ActivityEntry[]>(`${apiUrl}/api/trips/${groupId}/activity?limit=50`, token, [])
  const { reload } = activity
  useEffect(() => {
    if (!socket) return
    let timer: ReturnType<typeof setTimeout>
    // Writes to the log happen just after the socket event, so wait a moment and batch bursts
    const soon = () => {
      clearTimeout(timer)
      timer = setTimeout(reload, 800)
    }
    const events = ['itinerary:itemAdded', 'itinerary:itemUpdated', 'itinerary:itemDeleted', 'trip:coverUpdated']
    events.forEach((e) => socket.on(e, soon))
    return () => {
      clearTimeout(timer)
      events.forEach((e) => socket.off(e, soon))
    }
  }, [socket, reload])
  return activity
}

export type SeenKey = 'overview' | 'plan'
type SeenMap = Partial<Record<SeenKey, string>>

/**
 * When this person last looked at Overview and Plan for this trip, on this device.
 * Kept in browser storage: no new endpoint (spec 004 section 7.6). `since` is the snapshot taken
 * when the trip was opened, so "since you were away" keeps showing what was new on arrival.
 */
export function useSeen(groupId: string, uid?: string) {
  const key = `tripSeen:${uid || 'anon'}:${groupId}`
  const read = (): SeenMap => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}')
    } catch {
      return {}
    }
  }
  const [since] = useState<SeenMap>(read)
  const [seen, setSeen] = useState<SeenMap>(since)

  const mark = useCallback(
    (what: SeenKey) => {
      const next = { ...read(), [what]: new Date().toISOString() }
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Storage unavailable (private mode): badges simply reset next visit
      }
      setSeen(next)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )

  return { since, seen, mark }
}
