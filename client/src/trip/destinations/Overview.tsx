import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DestinationHeading from '../DestinationHeading'
import { useTrip } from '../TripContext'
import { formatDateRange } from '../format'

/**
 * Slice 1: key facts, the Stay card and summaries that link to the destination that owns each thing.
 * The phase-adaptive stack (spec 004 section 7.4) is slice 2.
 */
export default function Overview() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const { trip, refetch, apiUrl, token, setMapOpen } = useTrip()

  const [editingStay, setEditingStay] = useState(false)
  const [stayName, setStayName] = useState('')
  const [stayAddress, setStayAddress] = useState('')
  const [savingStay, setSavingStay] = useState(false)

  const handleSaveStay = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingStay(true)
    try {
      await axios.put(
        `${apiUrl}/api/trips/${trip.groupId}/accommodation`,
        { name: stayName, address: stayAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEditingStay(false)
      refetch()
    } catch (err: any) {
      alert(t('common.errorPrefix', { message: err.response?.data?.error || t('detail.saveStayFailed') }))
    } finally {
      setSavingStay(false)
    }
  }

  const hasStay = !!(trip.accommodation?.name || trip.accommodation?.address)

  return (
    <>
      <DestinationHeading name="overview" />

      <section className="overview-card">
        <h2>{t('trip.overview.factsTitle')}</h2>
        <div className="trip-meta">
          <p>
            <strong>{t('detail.from')}</strong> {trip.origin?.address || t('common.unknown')}
          </p>
          <p>
            <strong>{t('detail.to')}</strong> {trip.destination?.address || t('common.unknown')}
          </p>
          <p>
            <strong>{t('detail.dates')}</strong> {formatDateRange(trip.startDate, trip.endDate, locale, t('detail.tbd'))}
          </p>
          <p>
            <strong>{t('detail.members')}</strong> {trip.members.length}
          </p>
        </div>

        <div className="stay-box">
          {editingStay ? (
            <form className="stay-form" onSubmit={handleSaveStay}>
              <input
                value={stayName}
                onChange={(e) => setStayName(e.target.value)}
                placeholder={t('detail.stayNamePlaceholder')}
                maxLength={200}
              />
              <input
                value={stayAddress}
                onChange={(e) => setStayAddress(e.target.value)}
                placeholder={t('detail.stayAddressPlaceholder')}
                maxLength={300}
              />
              <div className="row-actions">
                <button
                  type="submit"
                  className="btn-sm"
                  disabled={savingStay || !(stayName.trim() || stayAddress.trim())}
                >
                  {savingStay ? t('common.saving') : t('common.save')}
                </button>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setEditingStay(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="stay-summary">
              <span>
                <strong>{t('detail.stayingAt')}</strong>{' '}
                {hasStay ? (
                  [trip.accommodation?.name, trip.accommodation?.address].filter(Boolean).join(', ')
                ) : (
                  <span className="muted">{t('detail.stayNotSet')}</span>
                )}
              </span>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setStayName(trip.accommodation?.name || '')
                  setStayAddress(trip.accommodation?.address || '')
                  setEditingStay(true)
                }}
              >
                {hasStay ? t('common.edit') : t('common.add')}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="overview-card">
        <h2>{t('trip.overview.summaryTitle')}</h2>
        <ul className="summary-links">
          <li>
            <Link to="plan">
              <strong>{t('trip.tabs.plan')}</strong>
              <span>{t('trip.overview.planSummary', { count: trip.itinerary.length })}</span>
            </Link>
          </li>
          <li>
            <Link to="money">
              <strong>{t('trip.tabs.money')}</strong>
              <span>{t('trip.overview.moneySummary')}</span>
            </Link>
          </li>
          <li>
            <Link to="group">
              <strong>{t('trip.tabs.group')}</strong>
              <span>{t('trip.overview.groupSummary', { count: trip.members.length })}</span>
            </Link>
          </li>
          <li>
            <button type="button" className="summary-link-button" onClick={() => setMapOpen(true)}>
              <strong>{t('trip.map.open')}</strong>
              <span>{t('location.title')}</span>
            </button>
          </li>
        </ul>
      </section>
    </>
  )
}
