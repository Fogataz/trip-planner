import { useTranslation } from 'react-i18next'

/**
 * Each destination starts with its own heading. It is visually hidden (the active tab already
 * names the destination) but it is where focus lands when the destination changes.
 */
export default function DestinationHeading({ name }: { name: 'overview' | 'plan' | 'money' | 'group' }) {
  const { t } = useTranslation()
  return (
    <h2 id="destination-heading" className="sr-only" tabIndex={-1}>
      {t(`trip.tabs.${name}`)}
    </h2>
  )
}
