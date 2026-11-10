import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useTrip } from './TripContext'

interface Comment {
  _id: string
  question: string
  answer: string | null
  createdAt: string
}

/**
 * The Ask-AI Q&A, reachable from every destination. Slice 3 folds generation and
 * trip ideas into this same surface; for now it carries the existing Q&A unchanged.
 */
export default function Assistant() {
  const { t } = useTranslation()
  const { trip, apiUrl, token, setAssistantOpen } = useTrip()
  const [comments, setComments] = useState<Comment[]>([])
  const [questionText, setQuestionText] = useState('')
  const [askingQuestion, setAskingQuestion] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAssistantOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setAssistantOpen])

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return
    setAskingQuestion(true)
    try {
      const response = await axios.post(
        `${apiUrl}/api/comments/trip/${trip._id}`,
        { question: questionText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments([response.data, ...comments])
      setQuestionText('')
    } catch (err) {
      console.error('Failed to ask question:', err)
    } finally {
      setAskingQuestion(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={() => setAssistantOpen(false)}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <h2 id="assistant-title">{t('trip.assistant.title')}</h2>
          <button
            ref={closeRef}
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => setAssistantOpen(false)}
          >
            {t('trip.assistant.close')}
          </button>
        </div>

        <form className="question-form" onSubmit={handleAskQuestion}>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={t('detail.askPlaceholder')}
            rows={3}
          />
          <button type="submit" disabled={askingQuestion || !questionText.trim()}>
            {askingQuestion ? t('detail.thinking') : t('detail.askAi')}
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
      </section>
    </div>
  )
}
