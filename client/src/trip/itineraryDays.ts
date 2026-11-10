import { calendarDay, localToday } from './phase'

export interface DayGroup<T> {
  /** Local calendar day, YYYY-MM-DD */
  day: string
  /** 1 for the trip's start day; null for stops dated before the trip starts */
  dayNumber: number | null
  isToday: boolean
  items: T[]
}

function localDay(value: string | Date): string {
  return localToday(new Date(value))
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

/**
 * Groups stops by the local calendar day of their time, in chronological order (spec 004 F11, AC11).
 * Stop times are real instants (a train at 09:40 local), so they are read in the viewer's timezone,
 * unlike trip dates, which are calendar days.
 */
export function groupByDay<T extends { time: string }>(items: readonly T[], startDate: string, now = new Date()): DayGroup<T>[] {
  const start = calendarDay(startDate)
  const today = localToday(now)
  const sorted = [...items].sort((a, b) => Date.parse(a.time) - Date.parse(b.time))
  const groups: DayGroup<T>[] = []
  for (const item of sorted) {
    const day = localDay(item.time)
    let group = groups[groups.length - 1]
    if (!group || group.day !== day) {
      const offset = daysBetween(start, day)
      group = { day, dayNumber: offset >= 0 ? offset + 1 : null, isToday: day === today, items: [] }
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
}

/** The stop happening now (the latest one already started today) and the next one today */
export function nowAndNext<T extends { time: string }>(items: readonly T[], now = new Date()): { now: T | null; next: T | null } {
  const today = localToday(now)
  const todays = [...items]
    .filter((i) => localDay(i.time) === today)
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time))
  const started = todays.filter((i) => Date.parse(i.time) <= now.getTime())
  const upcoming = todays.filter((i) => Date.parse(i.time) > now.getTime())
  return { now: started[started.length - 1] ?? null, next: upcoming[0] ?? null }
}
