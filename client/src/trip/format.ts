/** "24–25 Nov" in the viewer's locale; the year only appears when it is not this year (N8) */
export function formatDateRange(start: string, end: string | undefined, locale: string, tbd: string): string {
  const s = new Date(start)
  const thisYear = new Date().getFullYear()
  if (!end) {
    const one = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
      ...(s.getUTCFullYear() === thisYear ? {} : { year: 'numeric' }),
    })
    return `${one.format(s)} – ${tbd}`
  }
  const e = new Date(end)
  const showYear = s.getUTCFullYear() !== thisYear || e.getUTCFullYear() !== thisYear
  // Dates are calendar days stored as UTC midnight: format them in UTC so they never shift a day
  const f = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC', ...(showYear ? { year: 'numeric' } : {}) })
  const withRange = f as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string }
  return withRange.formatRange ? withRange.formatRange(s, e) : `${f.format(s)} – ${f.format(e)}`
}

/**
 * Trip dates are calendar days, stored as UTC midnight. Read them back as that calendar day,
 * not as an instant, so a trip never starts a day early west of UTC.
 */
function calendarDay(value: string): string {
  return new Date(value).toISOString().slice(0, 10)
}

function localToday(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** True from the start day 00:00 to the end day 23:59 in the viewer's timezone (spec 004 D4) */
export function isTripLive(startDate: string, endDate: string | undefined, now = new Date()): boolean {
  if (!startDate) return false
  const today = localToday(now)
  return calendarDay(startDate) <= today && today <= calendarDay(endDate || startDate)
}
