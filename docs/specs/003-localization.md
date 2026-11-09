# Spec 003: Localization

Status: shipped
Shipped: 2026-11-09 · PR: [#5](https://github.com/barry-dempsey/trip-planner/pull/5)
Current behavior: [features.md → Languages](../features.md#languages)

> Native-speaker review of the translations is still pending. English, Portuguese (pt-BR) and Spanish (es-ES). Code review feedback applied on this PR.

## 1. Goal

The app is available in **English, Portuguese and Spanish**. The UI, dates, currency and AI-generated content all follow the user's language.

## 2. Requirements

| # | Requirement |
|---|---|
| R1 | All user-facing UI text is available in `en`, `pt` and `es`. |
| R2 | The language is chosen automatically, and the user can always override it. |
| R3 | Dates and currency follow the selected language. |
| R4 | AI Q&A answers, itineraries and travel suggestions are written in the selected language. |
| R5 | Locale detection never sends a visitor's IP to a third party and never stores it. |

## 3. How the language is chosen

In order, first match wins:

1. **Saved choice** from the header language dropdown (`localStorage` key `language`).
2. **Country from IP:** `GET /api/locale` returns `{ country, language }` using an offline database (`geoip-country`).
   - Portuguese: PT, BR, AO, MZ, CV, GW, ST, TL
   - Spanish: ES, MX, AR, CO, CL, PE, VE, EC, GT, CU, BO, DO, HN, PY, SV, NI, CR, PA, UY, PR, GQ
   - Any other country, or a private/unknown IP, returns `language: null`.
3. **Browser language.**
4. **English.**

The page waits at most 1.5 seconds for the IP lookup. If it is slow or fails, the browser language is used.

IP is only a hint: VPNs, expats and travellers can be wrong, and a country does not always imply one language. That is why a saved choice always wins.

## 4. AI output

- The client sends its UI language on every API call in the `X-Language` header (`en`, `pt` or `es`; anything else is treated as `en`).
- The server adds a system instruction to every AI call (`server/services/ai.js`, `server/services/language.js`). Place names stay in their original form. JSON keys and the `####` headings in travel suggestions are unchanged so parsing keeps working.
- **Travel suggestions are stored once per trip** with `language` and `generatedAt`. Opening the trip in a different language regenerates them, at most once every 10 minutes, so members using different languages do not cause constant regeneration. Suggestions saved before this feature count as English.
- Existing itineraries, answers and comments are not translated. Only new AI output follows the language.

## 5. Configuration

| Variable | Purpose |
|---|---|
| `TRUST_PROXY` | Set when running behind a proxy or load balancer (hop count or `loopback`) so `req.ip` is the real client IP. Without it IP detection sees the proxy's address. |

## 6. Known gaps

- **Server error messages** and the "Unable to generate answer" fallback are English.
- **Push notification text** is English.
- Itinerary weekday names sent to the AI are English by design, so the model can check opening days reliably.
- PT and ES wording was written without native review. **TBD:** reviewer.
- Mixed-language trips: suggestions follow whoever opened the trip last, subject to the cooldown.

## 7. Adding a language

1. Add `client/src/locales/<code>.json` with the same keys as `en.json`.
2. Register it in `client/src/i18n.ts` (`SUPPORTED_LANGUAGES` and `resources`) and add its name under `app.languages` in every locale file.
3. Add its name to `LANGUAGE_NAMES` in `server/services/language.js`.
4. Map its countries in `server/routes/locale.js`.
