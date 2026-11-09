import axios from 'axios'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import pt from './locales/pt.json'
import es from './locales/es.json'

export const SUPPORTED_LANGUAGES = ['en', 'pt', 'es'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, pt: { translation: pt }, es: { translation: es } },
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: 'language', caches: [] },
  })

// Keeps <html lang> and the API's X-Language header (used for AI output) in step with the UI language
const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng
  axios.defaults.headers.common['X-Language'] = lng
}
syncHtmlLang(i18n.resolvedLanguage || 'en')
i18n.on('languageChanged', syncHtmlLang)

const STORAGE_KEY = 'language'

// An explicit choice from the language switcher always wins over detection
export const setLanguage = (lng: Language) => {
  localStorage.setItem(STORAGE_KEY, lng)
  return i18n.changeLanguage(lng)
}

// With no saved choice, prefer the language of the visitor's country (from IP), else keep the browser language
export async function applyIpLanguage(apiUrl: string, timeoutMs = 1500) {
  if (localStorage.getItem(STORAGE_KEY)) return
  try {
    const res = await fetch(`${apiUrl}/api/locale`, { signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) return
    const { language } = await res.json()
    if (SUPPORTED_LANGUAGES.includes(language)) await i18n.changeLanguage(language)
  } catch {
    // Offline or slow: keep the browser-detected language
  }
}

export default i18n
