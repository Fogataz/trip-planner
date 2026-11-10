import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { AssistantSection, DraftStop, useTrip } from './TripContext'
import { chunkIdeas } from './ideas'

interface Comment {
  _id: string
  question: string
  answer: string | null
  createdAt: string
}

const SECTIONS: AssistantSection[] = ['ask', 'draft', 'ideas']

/**
 * The Trip assistant (spec 004 section 7.5, F10, D3): one surface for asking, drafting a plan and
 * the trip ideas, reachable from every destination. One contract: it drafts, the group decides.
 * Drafted stops stay private to the person who asked until they add them to the plan.
 * The accuracy disclaimer appears once, here.
 */
export default function Assistant() {
  const { t } = useTranslation()
  const { assistantOpen, setAssistantOpen } = useTrip()
  const section: AssistantSection = assistantOpen || 'ask'
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAssistantOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setAssistantOpen])

  return (
    <div className="sheet-backdrop" onClick={() => setAssistantOpen(false)}>
      <section
        className="sheet assistant"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <h2 id="assistant-title">{t('trip.assistant.title')}</h2>
          <button ref={closeRef} type="button" className="btn-secondary btn-sm" onClick={() => setAssistantOpen(false)}>
            {t('trip.assistant.close')}
          </button>
        </div>
        <p className="hint assistant-disclaimer">{t('trip.assistant.disclaimer')}</p>

        <div className="assistant-tabs" role="tablist" aria-label={t('trip.assistant.title')}>
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={section === s}
              className={`assistant-tab${section === s ? ' is-active' : ''}`}
              onClick={() => setAssistantOpen(s)}
            >
              {t(`trip.assistant.sections.${s}`)}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {section === 'ask' && <AskSection />}
          {section === 'draft' && <DraftSection />}
          {section === 'ideas' && <IdeasSection />}
        </div>
      </section>
    </div>
  )
}

/* ---------- Ask: the former Q&A ---------- */

function AskSection() {
  const { t } = useTranslation()
  const { trip, apiUrl, token } = useTrip()
  const [comments, setComments] = useState<Comment[]>([])
  const [questionText, setQuestionText] = useState('')
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    let cancelled = false
    axios
      .get(`${apiUrl}/api/comments/trip/${trip._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => !cancelled && setComments(response.data))
      .catch((err) => console.error('Failed to load comments:', err))
    return () => {
      cancelled = true
    }
  }, [apiUrl, token, trip._id])

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return
    setAsking(true)
    try {
      const response = await axios.post(
        `${apiUrl}/api/comments/trip/${trip._id}`,
        { question: questionText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments((prev) => [response.data, ...prev])
      setQuestionText('')
    } catch (err) {
      console.error('Failed to ask question:', err)
    } finally {
      setAsking(false)
    }
  }

  return (
    <>
      <form className="question-form" onSubmit={ask}>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={t('detail.askPlaceholder')}
          aria-label={t('trip.assistant.sections.ask')}
          rows={3}
        />
        <button type="submit" disabled={asking || !questionText.trim()}>
          {asking ? t('detail.thinking') : t('detail.askAi')}
        </button>
      </form>

      <div className="qa-list">
        {comments.length === 0 ? (
          <p className="empty">{t('detail.noQuestions')}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="qa-item">
              <strong>
                {t('detail.q')} {comment.question}
              </strong>
              {comment.answer ? (
                <div className="qa-answer">
                  <strong>{t('detail.a')}</strong> {comment.answer}
                </div>
              ) : (
                <div className="qa-answer loading">{t('detail.generatingAnswer')}</div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}

/* ---------- Draft a plan: proposals, never written straight into the plan ---------- */

function DraftSection() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || 'en'
  const { trip, apiUrl, token, drafts, setDrafts } = useTrip()
  const [preferences, setPreferences] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [adding, setAdding] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const headers = { Authorization: `Bearer ${token}` }

  const draftPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setDrafting(true)
    setError(null)
    try {
      const res = await axios.post<{ drafts: DraftStop[] }>(
        `${apiUrl}/api/trips/${trip.groupId}/itinerary/generate`,
        { preferences, draft: true },
        { headers }
      )
      setDrafts(res.data.drafts || [])
    } catch (err: any) {
      setError(err.response?.data?.error || t('detail.generateFailed'))
    } finally {
      setDrafting(false)
    }
  }

  const accept = async (indexes: number[]) => {
    setError(null)
    setAdding(new Set(indexes))
    const added: number[] = []
    for (const i of indexes) {
      const d = drafts[i]
      try {
        // The normal add-stop route: it logs the change and tells the rest of the group
        await axios.post(
          `${apiUrl}/api/trips/${trip.groupId}/itinerary`,
          { stop: d.stop, time: d.time, transport: d.transport, notes: d.notes },
          { headers }
        )
        added.push(i)
      } catch (err: any) {
        setError(err.response?.data?.error || t('detail.saveItemFailed'))
        break
      }
    }
    setDrafts((prev) => prev.filter((_, i) => !added.includes(i)))
    setAdding(new Set())
  }

  const dismiss = (index: number) => setDrafts((prev) => prev.filter((_, i) => i !== index))

  return (
    <>
      <form className="question-form" onSubmit={draftPlan}>
        <label htmlFor="draft-preferences">{t('trip.assistant.preferencesLabel')}</label>
        <textarea
          id="draft-preferences"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder={t('trip.assistant.preferencesPlaceholder')}
          rows={2}
        />
        <button type="submit" disabled={drafting}>
          {drafting ? t('detail.generating') : drafts.length ? t('trip.assistant.redraft') : t('trip.assistant.draft')}
        </button>
      </form>

      {error && (
        <p className="text-error" role="alert">
          {error}
        </p>
      )}

      {drafts.length > 0 && (
        <>
          <div className="draft-bar">
            <span className="muted">{t('trip.assistant.draftCount', { count: drafts.length })}</span>
            <div className="row-actions">
              <button type="button" className="btn-sm" onClick={() => accept(drafts.map((_, i) => i))} disabled={adding.size > 0}>
                {t('trip.assistant.addAll')}
              </button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setDrafts([])} disabled={adding.size > 0}>
                {t('trip.assistant.dismissAll')}
              </button>
            </div>
          </div>
          <ul className="draft-list">
            {drafts.map((d, i) => (
              <li key={`${d.stop}-${d.time}`} className="draft-item">
                <p className="time">
                  {new Date(d.time).toLocaleString(locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                <strong>{d.stop}</strong>
                {d.transport && <span className="muted">{d.transport}</span>}
                {d.notes && <span className="muted">{d.notes}</span>}
                <div className="row-actions">
                  <button type="button" className="btn-sm" onClick={() => accept([i])} disabled={adding.size > 0}>
                    {adding.has(i) ? t('common.saving') : t('trip.assistant.addToPlan')}
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => dismiss(i)} disabled={adding.size > 0}>
                    {t('trip.assistant.dismiss')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

/* ---------- Ideas: the former travel-suggestions essay, as cards ---------- */

function IdeasSection() {
  const { t } = useTranslation()
  const { trip } = useTrip()
  const suggestions = trip.travelSuggestions
  const cards = chunkIdeas(suggestions?.raw_suggestions)

  if (cards.length === 0) {
    return (
      <p className="suggestions-loading">
        {suggestions?.error ? t('detail.suggestionsError', { error: suggestions.error }) : t('detail.suggestionsLoading')}
      </p>
    )
  }

  return (
    <ul className="idea-cards">
      {cards.map((card, i) => (
        <li key={i} className="idea-card">
          {card.title && <h3>{card.title}</h3>}
          {card.lines.map((line, j) => (
            <p key={j}>{line}</p>
          ))}
        </li>
      ))}
    </ul>
  )
}
