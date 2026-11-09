import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, setLanguage, type Language } from '../i18n'

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  return (
    <select
      className="language-switcher"
      aria-label={t('app.language')}
      value={i18n.resolvedLanguage}
      onChange={(e) => setLanguage(e.target.value as Language)}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <option key={lng} value={lng}>
          {t(`app.languages.${lng}`)}
        </option>
      ))}
    </select>
  )
}
