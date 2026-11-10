import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { ActivityEntry } from './tripData'
import { useTrip } from './TripContext'

const MAX_ITEMS = 6

function who(email?: string): string {
  return email || '?'
}

/** The stop name an itinerary entry is about; older entries only have the English description */
function stopOf(entry: ActivityEntry): string {
  return (
    entry.changes?.after?.stop ||
    entry.changes?.deleted?.stop ||
    entry.changes?.before?.stop ||
    (entry.description || '').replace(/^(Added|Updated|Deleted) stop:\s*/, '')
  )
}

/** One activity entry as a sentence in the viewer's language (the server stores English only) */
export function describeActivity(entry: ActivityEntry, t: TFunction): string {
  const name = who(entry.userEmail)
  const other = entry.targetDetails?.email || entry.targetId || ''
  switch (entry.action) {
    case 'itinerary_added':
      return t('trip.activity.stopAdded', { name, stop: stopOf(entry) })
    case 'itinerary_updated':
      return t('trip.activity.stopUpdated', { name, stop: stopOf(entry) })
    case 'itinerary_deleted':
      return t('trip.activity.stopDeleted', { name, stop: stopOf(entry) })
    case 'member_added':
      return entry.targetId === entry.userId
        ? t('trip.activity.joined', { name })
        : t('trip.activity.memberAdded', { name, other })
    case 'member_invited':
      return t('trip.activity.invited', { name, other })
    case 'member_removed':
      return t('trip.activity.memberRemoved', { name, other })
    case 'member_role_changed':
      return t('trip.activity.roleChanged', { name, other })
    case 'trip_updated':
      return t('trip.activity.tripUpdated', { name })
    default:
      return entry.description || t('trip.activity.tripUpdated', { name })
  }
}

function destinationOf(entry: ActivityEntry): string | null {
  if (entry.targetType === 'itinerary') return 'plan'
  if (entry.targetType === 'member') return 'group'
  return null
}

function relativeTime(iso: string, locale: string): string {
  const seconds = (Date.parse(iso) - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const abs = Math.abs(seconds)
  if (abs < 60) return rtf.format(Math.round(seconds), 'second')
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour')
  return rtf.format(Math.round(seconds / 86400), 'day')
}

/**
 * "Since you were away" (spec 004 F16, AC22): what others changed since this person last opened
 * Overview, from the activity log the server already keeps (A10). Each line links to the
 * destination that owns the change (F5). Renders nothing on a first visit or when nothing is new.
 */
export default function SinceAway() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const { activity, seen, currentUid } = useTrip()
  const since = seen.since.overview
  if (!since) return null

  const fresh = activity.data
    .filter((a) => a.userId !== currentUid && Date.parse(a.timestamp) > Date.parse(since))
    .slice(0, MAX_ITEMS)
  if (fresh.length === 0) return null

  return (
    <section className="overview-card since-away">
      <h2>{t('trip.activity.title')}</h2>
      <ul className="activity-list">
        {fresh.map((entry) => {
          const to = destinationOf(entry)
          const text = describeActivity(entry, t)
          return (
            <li key={entry._id}>
              <span className="activity-avatar" aria-hidden="true">
                {who(entry.userEmail).charAt(0).toUpperCase()}
              </span>
              <span className="activity-text">{to ? <Link to={to}>{text}</Link> : text}</span>
              <time className="muted" dateTime={entry.timestamp}>
                {relativeTime(entry.timestamp, locale)}
              </time>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
