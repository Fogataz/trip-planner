import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import type { Socket } from 'socket.io-client'

interface PollOption {
  _id: string
  text: string
  votes: string[]
}

interface Poll {
  _id: string
  question: string
  options: PollOption[]
  allowMultiple: boolean
  status: 'open' | 'closed'
  createdBy: string
}

interface Props {
  groupId: string
  apiUrl: string
  token: string | null
  currentUid?: string
  isOrganizer: boolean
  socket: Socket | null
}

export default function Polls({ groupId, apiUrl, token, currentUid, isOrganizer, socket }: Props) {
  const { t } = useTranslation()
  const [polls, setPolls] = useState<Poll[]>([])
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  // The create form sits behind an explicit button (spec 004 F6)
  const [showForm, setShowForm] = useState(false)

  const base = `${apiUrl}/api/polls/trip/${groupId}`
  const headers = { Authorization: `Bearer ${token}` }

  const load = () => {
    setError(null)
    axios
      .get<Poll[]>(base, { headers })
      .then((res) => {
        setPolls(res.data)
        setLoadFailed(false)
      })
      .catch((err) => {
        setLoadFailed(true)
        setError(err.response?.data?.error || t('polls.loadFailed'))
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  useEffect(() => {
    if (!socket) return
    const onCreated = ({ poll }: { poll: Poll }) =>
      setPolls((prev) => (prev.some((p) => p._id === poll._id) ? prev : [poll, ...prev]))
    const onUpdated = ({ poll }: { poll: Poll }) =>
      setPolls((prev) => prev.map((p) => (p._id === poll._id ? poll : p)))
    const onDeleted = ({ pollId }: { pollId: string }) =>
      setPolls((prev) => prev.filter((p) => p._id !== pollId))

    socket.on('poll:created', onCreated)
    socket.on('poll:updated', onUpdated)
    socket.on('poll:deleted', onDeleted)
    return () => {
      socket.off('poll:created', onCreated)
      socket.off('poll:updated', onUpdated)
      socket.off('poll:deleted', onDeleted)
    }
  }, [socket])

  const run = async (fn: () => Promise<void>) => {
    setError(null)
    try {
      await fn()
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.somethingWrong'))
    }
  }

  const createPoll = (e: React.FormEvent) => {
    e.preventDefault()
    run(async () => {
      const res = await axios.post<Poll>(
        base,
        { question, options: options.filter((o) => o.trim()), allowMultiple },
        { headers }
      )
      setPolls((prev) => (prev.some((p) => p._id === res.data._id) ? prev : [res.data, ...prev]))
      setQuestion('')
      setOptions(['', ''])
      setAllowMultiple(false)
      setShowForm(false)
    })
  }

  const vote = (poll: Poll, optionId: string) =>
    run(async () => {
      const res = await axios.post<Poll>(`${base}/${poll._id}/vote`, { optionId }, { headers })
      setPolls((prev) => prev.map((p) => (p._id === poll._id ? res.data : p)))
    })

  const close = (poll: Poll) =>
    run(async () => {
      const res = await axios.post<Poll>(`${base}/${poll._id}/close`, {}, { headers })
      setPolls((prev) => prev.map((p) => (p._id === poll._id ? res.data : p)))
    })

  const remove = (poll: Poll) =>
    run(async () => {
      await axios.delete(`${base}/${poll._id}`, { headers })
      setPolls((prev) => prev.filter((p) => p._id !== poll._id))
    })

  return (
    <div className="qa-section">
      <div className="section-header">
        <h2>{t('polls.title')}</h2>
        <button type="button" className="btn-secondary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t('common.cancel') : t('trip.polls.new')}
        </button>
      </div>

      {error && (
        <p className="text-error" role="alert">
          {error}{' '}
          {loadFailed && (
            <button type="button" className="btn-link" onClick={load}>
              {t('trip.retry')}
            </button>
          )}
        </p>
      )}

      {showForm && (
      <form className="question-form" onSubmit={createPoll}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('polls.questionPlaceholder')}
          maxLength={300}
        />
        {options.map((opt, i) => (
          <input
            key={i}
            value={opt}
            onChange={(e) => setOptions(options.map((o, j) => (j === i ? e.target.value : o)))}
            placeholder={t('polls.option', { n: i + 1 })}
            maxLength={200}
          />
        ))}
        <div className="form-row">
          {options.length < 10 && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => setOptions([...options, ''])}>
              {t('polls.addOption')}
            </button>
          )}
          <label>
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
            />{' '}
            {t('polls.allowMultiple')}
          </label>
        </div>
        <button
          type="submit"
          disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
        >
          {t('polls.create')}
        </button>
      </form>
      )}

      <div className="comments-list">
        {polls.length === 0 ? (
          loadFailed || showForm ? null : <p className="hint">{t('trip.polls.emptyHint')}</p>
        ) : (
          polls.map((poll) => {
            const total = poll.options.reduce((sum, o) => sum + o.votes.length, 0)
            const canManage = poll.createdBy === currentUid || isOrganizer
            return (
              <div key={poll._id} className="comment-item">
                <div className="question">
                  <strong>{poll.question}</strong>
                  {poll.status === 'closed' && (
                    <span className="badge badge-muted">{t('polls.closed')}</span>
                  )}
                </div>
                {poll.options.map((opt) => {
                  const mine = !!currentUid && opt.votes.includes(currentUid)
                  const pct = total ? Math.round((opt.votes.length / total) * 100) : 0
                  return (
                    <button
                      key={opt._id}
                      type="button"
                      disabled={poll.status === 'closed'}
                      onClick={() => vote(poll, opt._id)}
                      className={`poll-option${mine ? ' mine' : ''}`}
                      style={{ ['--pct' as string]: `${pct}%` }}
                    >
                      {mine ? '✓ ' : ''}
                      {opt.text} — {opt.votes.length} ({pct}%)
                    </button>
                  )
                })}
                {canManage && (
                  <div className="row-actions">
                    {poll.status === 'open' && (
                      <button type="button" className="btn-secondary btn-sm" onClick={() => close(poll)}>
                        {t('polls.close')}
                      </button>
                    )}
                    <button type="button" className="btn-danger btn-sm" onClick={() => remove(poll)}>
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
