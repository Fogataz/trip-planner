const LANGUAGE_NAMES = {
  en: 'English',
  pt: 'Brazilian Portuguese',
  es: 'Spanish (Spain)',
};

// The client sends its UI language in X-Language so AI output matches it
function requestLanguage(req) {
  const lang = String(req.get('x-language') || '').toLowerCase().slice(0, 2);
  return LANGUAGE_NAMES[lang] ? lang : 'en';
}

function languageInstruction(lang) {
  const name = LANGUAGE_NAMES[lang] || LANGUAGE_NAMES.en;
  return `Write all human-readable text in ${name}. Keep proper nouns (venue, street and place names) in their original form, and keep any requested JSON keys and "####" headings markers exactly as specified.`;
}

module.exports = { requestLanguage, languageInstruction, LANGUAGE_NAMES };
