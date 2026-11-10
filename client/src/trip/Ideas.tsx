import { useTranslation } from 'react-i18next'
import { useTrip } from './TripContext'

/** The former AI travel-suggestions essay: same content, now a collapsed card in Plan (A3) */
export default function Ideas() {
  const { t } = useTranslation()
  const { trip } = useTrip()
  const suggestions = trip.travelSuggestions

  if (!suggestions?.raw_suggestions) {
    return (
      <p className="suggestions-loading">
        {suggestions?.error
          ? t('detail.suggestionsError', { error: suggestions.error })
          : t('detail.suggestionsLoading')}
      </p>
    )
  }

  return (
    <details className="travel-suggestions ideas-card">
      <summary>{t('trip.ideas.summary')}</summary>
      <h3>{t('detail.suggestionsTitle')}</h3>
      <p className="hint">{t('detail.suggestionsDisclaimer')}</p>
      <div className="suggestion-content">
        {suggestions.raw_suggestions
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string, idx: number) => {
            const trimmed = line.trim()
            const isHeader = trimmed.startsWith('####')
            const isOption = trimmed.match(/^Option\s+[A-Z]:/i)

            // Clean up markdown symbols
            const cleaned = trimmed
              .replace(/^#+\s*/g, '') // Remove headers
              .replace(/\*\*/g, '') // Remove bold
              .replace(/\*/g, '') // Remove italics
              .replace(/^[-•]\s*/g, '') // Remove bullets
              .replace(/`/g, '') // Remove code ticks
              .trim()

            return (
              <p key={idx} className={isHeader || isOption ? 'suggestion-heading' : 'suggestion-text'}>
                {cleaned}
              </p>
            )
          })}
      </div>
    </details>
  )
}
