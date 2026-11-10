import { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useTrip } from '../trip/TripContext'
import type { ExpenseSummary as Summary } from '../trip/tripData'

interface Member {
  userId?: string
  email?: string
  role: string
  status?: string
}

interface Props {
  groupId: string
  apiUrl: string
  token: string | null
  currentUid?: string
  members: Member[]
  /** During the trip, fast capture is the job: the add form stays open at the top (spec 004 F6, AC17) */
  liveNow?: boolean
}

const fmt = (cents: number, currency = 'EUR', locale?: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)

/**
 * Money, balance-first (spec 004 F12): your own position, then who pays whom, the trip total,
 * everyone's balance, and finally the ledger. Marking a payment as settled is R2 and not built yet.
 */
export default function Expenses({ groupId, apiUrl, token, currentUid, members, liveNow = false }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  // The summary lives in TripContext so the Money badge and Overview see the same numbers
  const { expenses: remote } = useTrip()
  const data: Summary = remote.data
  const setData = remote.set
  const loaded = remote.loaded
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUid || '')
  const [error, setError] = useState<string | null>(null)
  const loadFailed = !!remote.error
  const [showForm, setShowForm] = useState(liveNow)

  const base = `${apiUrl}/api/expenses/trip/${groupId}`
  const headers = { Authorization: `Bearer ${token}` }
  const active = members.filter((m) => m.status === 'active' && m.userId)
  const nameOf = (uid: string) =>
    uid === currentUid ? t('trip.money.you') : active.find((m) => m.userId === uid)?.email || uid
  const currency = data.expenses[0]?.currency || 'EUR'
  const money = (cents: number) => fmt(cents, currency, locale)

  const load = () => {
    setError(null)
    remote.reload()
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await axios.post<Summary>(base, { description, amount, paidBy }, { headers })
      setData(res.data)
      setDescription('')
      setAmount('')
      if (!liveNow) setShowForm(false)
    } catch (err: any) {
      setError(err.response?.data?.error || t('expenses.addFailed'))
    }
  }

  const remove = async (id: string) => {
    setError(null)
    try {
      const res = await axios.delete<Summary>(`${base}/${id}`, { headers })
      setData(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || t('expenses.deleteFailed'))
    }
  }

  const form = (
    <form className="question-form" onSubmit={add}>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('expenses.descriptionPlaceholder')}
        maxLength={200}
        autoFocus={!liveNow}
      />
      <input
        type="number"
        inputMode="decimal"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t('expenses.amount')}
      />
      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
        {active.map((m) => (
          <option key={m.userId} value={m.userId}>
            {t('expenses.paidByOption', { name: m.email || m.userId })}
          </option>
        ))}
      </select>
      <div className="row-actions">
        <button type="submit" disabled={!description.trim() || !(Number(amount) > 0)}>
          {t('expenses.add')}
        </button>
        {!liveNow && (
          <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  )

  const errorLine = (error || loadFailed) && (
    <p className="text-error" role="alert">
      {error || t('expenses.loadFailed')}{' '}
      {loadFailed && (
        <button type="button" className="btn-link" onClick={load}>
          {t('trip.retry')}
        </button>
      )}
    </p>
  )

  if (!loaded) return <div className="money-card skeleton-block money-skeleton" aria-busy="true" />

  // Empty state (F14): one line of purpose and the primary action
  if (data.expenses.length === 0 && !loadFailed) {
    return (
      <section className="money-card empty-state">
        <h2>{t('trip.money.emptyTitle')}</h2>
        <p>{t('trip.money.emptyBody')}</p>
        {errorLine}
        {showForm ? form : (
          <button type="button" onClick={() => setShowForm(true)}>
            {t('trip.money.emptyAction')}
          </button>
        )}
      </section>
    )
  }

  const myBalance = currentUid ? data.balances[currentUid] ?? 0 : 0
  const iOwe = data.settlements.filter((s) => s.from === currentUid)
  const owedToMe = data.settlements.filter((s) => s.to === currentUid)
  const others = data.settlements.filter((s) => s.from !== currentUid && s.to !== currentUid)
  const total = data.expenses.reduce((sum, e) => sum + e.amountCents, 0)
  const settled = Math.abs(myBalance) < 1

  return (
    <>
      {liveNow && (
        <section className="money-card" aria-label={t('expenses.title')}>
          {form}
        </section>
      )}

      <section className={`money-card balance-card${settled ? ' is-settled' : myBalance < 0 ? ' is-owing' : ''}`}>
        {settled ? (
          <>
            <h2>{t('trip.money.settled')}</h2>
            <p className="muted">{t('trip.money.settledBody')}</p>
          </>
        ) : (
          <>
            <p className="eyebrow">{t('trip.money.yourBalance')}</p>
            <h2 className="balance-amount">
              {myBalance < 0
                ? t('trip.money.youOwe', { amount: money(-myBalance) })
                : t('trip.money.youAreOwed', { amount: money(myBalance) })}
            </h2>
            <ul className="settle-list">
              {iOwe.map((s, i) => (
                <li key={`o${i}`}>{t('trip.money.payTo', { name: nameOf(s.to), amount: money(s.amountCents) })}</li>
              ))}
              {owedToMe.map((s, i) => (
                <li key={`i${i}`}>{t('trip.money.getFrom', { name: nameOf(s.from), amount: money(s.amountCents) })}</li>
              ))}
            </ul>
          </>
        )}
        {others.length > 0 && (
          <div className="settle-others">
            <p className="eyebrow">{t('expenses.settleUp')}</p>
            <ul className="settle-list">
              {others.map((s, i) => (
                <li key={i}>
                  {nameOf(s.from)} → {nameOf(s.to)}: <strong>{money(s.amountCents)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="money-card">
        <div className="money-total">
          <span className="eyebrow">{t('trip.money.tripTotal')}</span>
          <strong>{money(total)}</strong>
        </div>
        <p className="eyebrow">{t('trip.money.everyone')}</p>
        <ul className="money-people">
          {active.map((m) => {
            const b = data.balances[m.userId!] ?? 0
            return (
              <li key={m.userId}>
                <span>{nameOf(m.userId!)}</span>
                <span className="muted">
                  {Math.abs(b) < 1
                    ? t('trip.money.memberSettled')
                    : b > 0
                      ? t('trip.money.isOwed', { amount: money(b) })
                      : t('trip.money.owes', { amount: money(-b) })}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="money-card">
        <div className="section-header">
          <h2>{t('trip.money.allExpenses')}</h2>
          {!liveNow && !showForm && (
            <button type="button" className="btn-secondary" onClick={() => setShowForm(true)}>
              {t('trip.money.addExpense')}
            </button>
          )}
        </div>
        {errorLine}
        {!liveNow && showForm && form}
        <ul className="ledger">
          {data.expenses.map((exp) => (
            <li key={exp._id} className="ledger-row">
              <div className="ledger-main">
                <strong>{exp.description}</strong>
                <span className="muted">
                  {t('expenses.paidBySplit', { name: nameOf(exp.paidBy), count: exp.splitAmong.length })}
                </span>
              </div>
              <div className="ledger-side">
                <strong>{fmt(exp.amountCents, exp.currency, locale)}</strong>
                {exp.createdBy === currentUid && (
                  <button type="button" className="btn-danger btn-sm" onClick={() => remove(exp._id)}>
                    {t('common.delete')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
