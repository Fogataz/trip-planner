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
