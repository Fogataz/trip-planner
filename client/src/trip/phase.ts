/**
 * Trip phase (spec 004 §5, §7.4, D4). A pure function of the trip's dates, itinerary length,
 * active member count and the current instant. No server change, no UI here.
 *
 * How the phases combine. The §5 table gives each phase a trigger, but the triggers overlap:
 * Setup is "no itinerary items or < 2 active members", while Countdown, Live and Wrap are pure
 * date windows. §5 does not say which wins, so this function decides:
 *
 * 1. The calendar wins. Countdown, Live and Wrap depend only on the dates. A 1-member trip with
 *    no itinerary that starts tomorrow is Countdown, not Setup. Otherwise a solo trip, or one
 *    that never got an itinerary, would show "invite the group" forever and never reach Live
 *    or Wrap. Acceptance criteria 7–9 in §9 also set those phases by date alone.
 * 2. Setup and Planning only compete for the time more than 7 days before the start. Inside
 *    that window, Setup's trigger wins. So Planning needs both an itinerary item and at least
 *    2 active members, even though §5 words Planning as "a plan *or* a group".
 *
 * Rule 1 was confirmed by the product owner on 2026-11-10 ("calendar wins").
 *
 * Other rules:
 * - No start date: there is no date window, so the phase is Setup or Planning by rule 2.
 * - No end date but an approximate length (`durationDays`, e.g. 8 to 10 days): the trip ends on
 *   the last day of the LONGER estimate, so nobody's trip is "over" while they are still on it.
 *   Product owner decision, 2026-11-10.
 * - Neither: the trip is treated as one day long (end = start).
 * - An end date before the start date is treated as the start date.
 * - "Active member" means `status === 'active'`, the same count Overview uses.
 */

export type TripPhase = 'setup' | 'planning' | 'countdown' | 'live' | 'wrap'

/** Countdown covers the last 7 days before the start day (D4). 8 days out is still Planning. */
export const COUNTDOWN_DAYS = 7

export interface TripPhaseInput {
  startDate?: string | null
  endDate?: string | null
  itinerary?: readonly unknown[] | null
  members?: readonly { status?: string }[] | null
  durationDays?: { min?: number; max?: number } | null
}

/**
 * Trip dates are calendar days, stored as UTC midnight. Read them back as that calendar day,
 * not as an instant, so a trip never starts a day early west of UTC.
 */
export function calendarDay(value: string): string {
  return new Date(value).toISOString().slice(0, 10)
}

/** Today's calendar day (YYYY-MM-DD) in the viewer's timezone */
export function localToday(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Whole days from calendar day `from` to calendar day `to` (both YYYY-MM-DD) */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

type DateWindow = 'before' | 'countdown' | 'live' | 'after'

/** Where `now` falls against the trip's dates, in the viewer's timezone. Null without a start date. */
/** Calendar day `days` after calendar day `day` (both YYYY-MM-DD) */
function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
}

/** The trip's last calendar day: the end date, else start + the longer approximate length, else the start */
export function tripEndDay(
  startDate: string,
  endDate?: string | null,
  durationDays?: { min?: number; max?: number } | null
): string {
  const start = calendarDay(startDate)
  if (endDate) return calendarDay(endDate)
  const longest = Math.max(durationDays?.max ?? 0, durationDays?.min ?? 0)
  return longest >= 1 ? addDays(start, Math.round(longest) - 1) : start
}

function dateWindow(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  now: Date,
  durationDays?: { min?: number; max?: number } | null
): DateWindow | null {
  if (!startDate) return null
  const start = calendarDay(startDate)
  const endRaw = tripEndDay(startDate, endDate, durationDays)
  const end = endRaw < start ? start : endRaw
  const today = localToday(now)
  if (today > end) return 'after'
  if (today >= start) return 'live'
  return daysBetween(today, start) <= COUNTDOWN_DAYS ? 'countdown' : 'before'
}

export function tripPhase(trip: TripPhaseInput, now: Date = new Date()): TripPhase {
  const window = dateWindow(trip.startDate, trip.endDate, now, trip.durationDays)
  if (window === 'after') return 'wrap'
  if (window === 'live') return 'live'
  if (window === 'countdown') return 'countdown'

  const hasPlan = (trip.itinerary?.length ?? 0) > 0
  const activeMembers = (trip.members ?? []).filter((m) => m.status === 'active').length
  return !hasPlan || activeMembers < 2 ? 'setup' : 'planning'
}

/** True from the start day 00:00 to the end day 23:59 in the viewer's timezone (spec 004 D4) */
export function isTripLive(
  startDate: string | null | undefined,
  endDate?: string | null,
  now: Date = new Date(),
  durationDays?: { min?: number; max?: number } | null
): boolean {
  return dateWindow(startDate, endDate, now, durationDays) === 'live'
}
