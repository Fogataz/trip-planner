import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DestinationHeading from '../DestinationHeading'
import { useTrip } from '../TripContext'
import { formatTripDates } from '../format'
import { calendarDay, localToday, tripEndDay } from '../phase'
import { groupByDay, nowAndNext } from '../itineraryDays'
import SinceAway from '../SinceAway'
import { chunkIdeas } from '../ideas'

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

/**
 * Overview: "what does this trip need from me today?" (spec 004 section 7.3).
 * The only adaptive destination: the four tabs never change, but the stack here follows the
 * trip's phase (section 7.4). Every block is a summary that links to the destination that owns it
 * (F5). Facts and "since you were away" are present in every phase.
 */
export default function Overview() {
  const { phase, seen, activity } = useTrip()

  // Opening Overview clears its unread-activity badge. "Since you were away" keeps showing what
  // was new on arrival, because it reads the snapshot taken when the trip was opened.
  // While it is open, new activity counts as seen, so the tab you are looking at never badges itself
  useEffect(() => {
    seen.mark('overview')
  }, [seen, activity.data])

  return (
    <>
      <DestinationHeading name="overview" />
      {phase === 'setup' && <SetupBlocks />}
      {phase === 'planning' && <PlanningBlocks />}
      {phase === 'countdown' && <CountdownBlocks />}
      {phase === 'live' && <LiveBlocks />}
      {phase === 'wrap' && <WrapBlocks />}
      <SinceAway />
      <Facts />
    </>
  )
}

/* ---------- Setup: one job on screen (AC6, AC25) ---------- */

function SetupBlocks() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { trip, setAssistantOpen } = useTrip()
  const activeMembers = trip.members.filter((m) => m.status === 'active').length
  const needsGroup = activeMembers < 2
  const needsPlan = trip.itinerary.length === 0
  const hasStay = !!(trip.accommodation?.name || trip.accommodation?.address)

  return (
    <section className="overview-card setup-card">
      <h2>{t('trip.setup.title')}</h2>
      <p>{needsGroup ? t('trip.setup.inviteBody') : t('trip.setup.planBody')}</p>
      <button
        type="button"
        onClick={() =>
          needsGroup
            ? navigate('group', { state: { intent: 'invite' } })
            : navigate('plan', { state: { intent: 'addStop' } })
        }
      >
        {needsGroup ? t('trip.setup.inviteAction') : t('trip.setup.planAction')}
      </button>
      <ul className="setup-secondary">
        {needsPlan && (
          <li>
            <button type="button" className="btn-link" onClick={() => setAssistantOpen('draft')}>
              {t('trip.setup.draftPlan')}
            </button>
          </li>
        )}
        {!hasStay && (
          <li>
            <button
              type="button"
              className="btn-link"
              onClick={() => document.dispatchEvent(new CustomEvent('trip:editStay'))}
            >
              {t('trip.setup.setStay')}
            </button>
          </li>
        )}
      </ul>
    </section>
  )
}

/* ---------- Planning: decide together (AC20, AC22) ---------- */

function PlanningBlocks() {
  const { t } = useTranslation()
  const { trip, polls, currentUid, setAssistantOpen } = useTrip()
  const ideaCount = chunkIdeas(trip.travelSuggestions?.raw_suggestions).length
  const unvoted = polls.data.filter(
    (p) => p.status === 'open' && !p.options.some((o) => !!currentUid && o.votes.includes(currentUid))
  )
  const activeMembers = trip.members.filter((m) => m.status === 'active').length

  const totalDays = trip.startDate ? daysBetween(calendarDay(trip.startDate), tripEndDay(trip.startDate, trip.endDate, trip.durationDays)) + 1 : 0
  const plannedDays = groupByDay(trip.itinerary, trip.startDate).filter(
    (g) => g.dayNumber !== null && g.dayNumber <= totalDays
  ).length

  return (
    <>
      {unvoted.slice(0, 2).map((poll) => {
        const total = poll.options.reduce((sum, o) => sum + o.votes.length, 0)
        const voters = new Set(poll.options.flatMap((o) => o.votes)).size
        return (
          <section key={poll._id} className="overview-card needs-vote">
            <p className="eyebrow">{t('trip.overview.needsVote')}</p>
            <h2>{poll.question}</h2>
            <ul className="vote-preview">
              {poll.options.map((o) => {
                const pct = total ? Math.round((o.votes.length / total) * 100) : 0
                return (
                  <li key={o._id} style={{ ['--pct' as string]: `${pct}%` }}>
                    <span>{o.text}</span>
                    <span className="muted">{pct}%</span>
                  </li>
                )
              })}
            </ul>
            <p className="muted small">{t('trip.overview.votedCount', { voted: voters, total: activeMembers })}</p>
            <Link className="button-link" to="plan">
              {t('trip.overview.vote')}
            </Link>
          </section>
        )
      })}

      <Link to="plan" className="overview-card summary-card">
        <p className="eyebrow">{t('trip.overview.yourPlan')}</p>
        <strong>{t('trip.overview.planSummary', { count: trip.itinerary.length })}</strong>
        {totalDays > 0 && (
          <span className="muted">{t('trip.overview.daysPlanned', { planned: plannedDays, total: totalDays })}</span>
        )}
      </Link>

      {ideaCount > 0 && (
        <button type="button" className="overview-card summary-card ideas-link" onClick={() => setAssistantOpen('ideas')}>
          <strong>{t('trip.assistant.ideasCount', { count: ideaCount })}</strong>
          <span className="muted">{t('trip.assistant.ideasHint')}</span>
        </button>
      )}
    </>
  )
}

/* ---------- Countdown: be certain (AC7) ---------- */

function CountdownBlocks() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const { trip } = useTrip()
  const daysToGo = daysBetween(localToday(new Date()), calendarDay(trip.startDate))
  const dayOne = groupByDay(trip.itinerary, trip.startDate).find((g) => g.dayNumber === 1)
  const firstStop = dayOne?.items[0]
  const pending = trip.members.filter((m) => m.status === 'invited')
  const stay = [trip.accommodation?.name, trip.accommodation?.address].filter(Boolean).join(', ')

  return (
    <>
      <section className="overview-card countdown-ribbon">
        <h2>{t('trip.overview.daysToGo', { count: daysToGo })}</h2>
        {firstStop && (
          <p className="muted">
            {t('trip.overview.leaves', {
              when: new Date(firstStop.time).toLocaleString(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
            })}
          </p>
        )}
      </section>

      <Link to="plan" className="overview-card summary-card">
        <p className="eyebrow">{t('trip.overview.dayOne')}</p>
        {dayOne ? (
          <ul className="mini-stops">
            {dayOne.items.slice(0, 4).map((item) => (
              <li key={item._id}>
                <time>{new Date(item.time).toLocaleTimeString(locale, { timeStyle: 'short' })}</time>
                <span>{item.stop}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="muted">{t('trip.overview.dayOneEmpty')}</span>
        )}
        {stay && <span className="muted">{t('trip.overview.stayLine', { stay })}</span>}
      </Link>

      {/* Transport status (R3) and packing are reserved slots: they render nothing until they ship (F18) */}

      {pending.length > 0 && (
        <Link to="group" className="overview-card summary-card">
          <strong>{t('trip.overview.notJoined', { count: pending.length })}</strong>
          <span className="muted">{pending.map((m) => m.email).filter(Boolean).join(', ')}</span>
        </Link>
      )}
    </>
  )
}

/* ---------- Live: a now screen (AC8, AC17) ---------- */

function LiveBlocks() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const { trip, setMapOpen } = useTrip()
  const now = new Date()
  const current = nowAndNext(trip.itinerary, now)
  const today = groupByDay(trip.itinerary, trip.startDate, now).find((g) => g.isToday)
  const rest = (today?.items ?? []).filter(
    (i) => Date.parse(i.time) > now.getTime() && i._id !== current.next?._id
  )
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { timeStyle: 'short' })

  return (
    <>
      <Link to="plan" className="overview-card now-card">
        {current.now ? (
          <>
            <p className="eyebrow">{t('trip.plan.now')}</p>
            <h2>{current.now.stop}</h2>
            {current.now.notes && <p className="muted">{current.now.notes}</p>}
          </>
        ) : (
          <>
            <p className="eyebrow">{t('trip.plan.today')}</p>
            <h2>{current.next ? t('trip.overview.nothingYet') : t('trip.overview.nothingToday')}</h2>
          </>
        )}
        {current.next && (
          <p className="next-line">
            <strong>{t('trip.plan.next')}</strong> {time(current.next.time)} · {current.next.stop}
            {current.next.transport ? ` · ${current.next.transport}` : ''}
          </p>
        )}
      </Link>

      <div className="live-actions">
        <button type="button" className="btn-secondary" onClick={() => setMapOpen(true)}>
          {t('trip.map.open')}
        </button>
        <Link className="button-link" to="money">
          {t('trip.money.addExpense')}
        </Link>
      </div>

      {rest.length > 0 && (
        <Link to="plan" className="overview-card summary-card">
          <p className="eyebrow">{t('trip.overview.restOfToday')}</p>
          <ul className="mini-stops">
            {rest.map((item) => (
              <li key={item._id}>
                <time>{time(item.time)}</time>
                <span>{item.stop}</span>
              </li>
            ))}
          </ul>
        </Link>
      )}
    </>
  )
}

/* ---------- Wrap: settle and remember (AC9) ---------- */

function WrapBlocks() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const { trip, expenses, currentUid } = useTrip()
  const data = expenses.data
  const currency = data.expenses[0]?.currency || 'EUR'
  const money = (cents: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
  const myBalance = currentUid ? data.balances[currentUid] ?? 0 : 0
  const total = data.expenses.reduce((sum, e) => sum + e.amountCents, 0)
  const activeMembers = trip.members.filter((m) => m.status === 'active').length
  const days = daysBetween(calendarDay(trip.startDate), tripEndDay(trip.startDate, trip.endDate, trip.durationDays)) + 1

  return (
    <>
      {data.expenses.length > 0 && (
        <Link to="money" className={`overview-card balance-card${Math.abs(myBalance) < 1 ? ' is-settled' : myBalance < 0 ? ' is-owing' : ''}`}>
          <p className="eyebrow">{t('trip.money.yourBalance')}</p>
          <h2 className="balance-amount">
            {Math.abs(myBalance) < 1
              ? t('trip.money.settled')
              : myBalance < 0
                ? t('trip.money.youOwe', { amount: money(-myBalance) })
                : t('trip.money.youAreOwed', { amount: money(myBalance) })}
          </h2>
          {Math.abs(myBalance) >= 1 && <span className="button-link">{t('expenses.settleUp')}</span>}
        </Link>
      )}

      <section className="overview-card">
        <p className="eyebrow">{t('trip.overview.summaryTitle')}</p>
        <dl className="trip-summary">
          <div>
            <dt>{t('trip.overview.statDays', { count: days })}</dt>
            <dd>{days}</dd>
          </div>
          <div>
            <dt>{t('trip.overview.statStops', { count: trip.itinerary.length })}</dt>
            <dd>{trip.itinerary.length}</dd>
          </div>
          <div>
            <dt>{t('trip.overview.statSpent')}</dt>
            <dd>{money(total)}</dd>
          </div>
          <div>
            <dt>{t('trip.overview.statPeople', { count: activeMembers })}</dt>
            <dd>{activeMembers}</dd>
          </div>
        </dl>
      </section>
      {/* Photos and recap: reserved slot, renders nothing until it ships (F18) */}
    </>
  )
}

/* ---------- Facts and Stay: in every phase ---------- */

function Facts() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const { trip, refetch, apiUrl, token } = useTrip()
  const [editingStay, setEditingStay] = useState(false)
  const [stayName, setStayName] = useState('')
  const [stayAddress, setStayAddress] = useState('')
  const [savingStay, setSavingStay] = useState(false)
  const hasStay = !!(trip.accommodation?.name || trip.accommodation?.address)

  const startEditingStay = () => {
    setStayName(trip.accommodation?.name || '')
    setStayAddress(trip.accommodation?.address || '')
    setEditingStay(true)
  }

  // The Setup card's "Add where you're staying" opens this editor
  useEffect(() => {
    const open = () => {
      startEditingStay()
      setTimeout(() => document.getElementById('stay')?.scrollIntoView({ block: 'center' }), 0)
    }
    document.addEventListener('trip:editStay', open)
    return () => document.removeEventListener('trip:editStay', open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.accommodation?.name, trip.accommodation?.address])

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

  return (
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
          <strong>{t('detail.dates')}</strong> {formatTripDates(trip, locale, t)}
        </p>
        <p>
          <Link to="group" className="fact-link">
            <strong>{t('detail.members')}</strong> {trip.members.filter((m) => m.status === 'active').length}
          </Link>
        </p>
      </div>

      <div className="stay-box" id="stay">
        {editingStay ? (
          <form className="stay-form" onSubmit={handleSaveStay}>
            <input
              value={stayName}
              onChange={(e) => setStayName(e.target.value)}
              placeholder={t('detail.stayNamePlaceholder')}
              maxLength={200}
              autoFocus
            />
            <input
              value={stayAddress}
              onChange={(e) => setStayAddress(e.target.value)}
              placeholder={t('detail.stayAddressPlaceholder')}
              maxLength={300}
            />
            <div className="row-actions">
              <button type="submit" className="btn-sm" disabled={savingStay || !(stayName.trim() || stayAddress.trim())}>
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
            <button type="button" className="btn-secondary btn-sm" onClick={startEditingStay}>
              {hasStay ? t('common.edit') : t('common.add')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
