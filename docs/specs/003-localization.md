# Spec 003: Localization

Status: shipped
Shipped: 2026-11-09 · PR: [#5](https://github.com/Fogataz/trip-planner/pull/5)
Current behavior: [features.md → Languages](../features.md#languages)

> Native-speaker review of the translations is in review. English, Portuguese (pt-BR) and Spanish (es-ES).

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
- PT and ES wording was written without native review. **In review:** native-speaker review is under way.
- Mixed-language trips: suggestions follow whoever opened the trip last, subject to the cooldown.

## 7. Adding a language

1. Add `client/src/locales/<code>.json` with the same keys as `en.json`.
2. Register it in `client/src/i18n.ts` (`SUPPORTED_LANGUAGES` and `resources`) and add its name under `app.languages` in every locale file.
3. Add its name to `LANGUAGE_NAMES` in `server/services/language.js`.
4. Map its countries in `server/routes/locale.js`.

---

## 8. Amendment 2026-11-12 — role labels, and the review that unblocks them

> Spec 003 is **shipped**, so nothing above is rewritten. This is an amendment section, per [docs/README.md](../README.md), "Two kinds of document".

[Spec 012](012-joining-naming-and-the-first-trip.md) §5.3 labels trip roles differently depending on the kind of trip, so that migrating an existing friend trip does not rename everyone's friends into "guests" (Q1 · Guest on friend trips). That is free in English. It is not free in Spanish or Portuguese, and §6 above already records the gap it runs into: **PT and ES wording was written without native review.**

### 8.1 The constraint

English role nouns do not inflect for gender. Spanish and Portuguese ones do — *anfitrión / anfitriona*, *invitado / invitada*, *convidado / convidada*, *organizador / organizadora*.

**We do not collect gender, and we must not guess it from a name.** It is not needed for anything else in the product, and guessing it would be wrong often enough to be worth avoiding entirely. That rules out three of the four available moves:

| Option | Why not |
|---|---|
| Guess from the name | Wrong for a real attendee at a real event, and we have no reason to hold the data |
| `Invitado/a` | Still signals we wanted to know, and reads as a form field rather than a person |
| `Invitad@` | Same, plus it breaks screen readers |
| **A form that does not inflect** | **Taken.** O8 · Ungendered role labels |

### 8.2 The structure, which is settled

This does not wait for the review. The words do; the shape does not.

- **18 flat keys**: 2 trip kinds × 3 roles × 3 languages, named `roles.<kind>.<role>` — `roles.hosted.host`, `roles.personal.guest`.
- **Never derived** by concatenating kind and role at runtime. A translator needs to see each string whole.
- **Never written into a locale file before the review lands** (spec 012 §6.2). A plausible-looking placeholder is worse than a missing key, because the missing-key check goes green on a wrong word.
- [`scripts/locale-lint.sh`](../../scripts/locale-lint.sh) fails the build on a slash pair, a parenthesised ending, an `@` ending, or a known gendered noun. It passes silently while the keys do not exist.

### 8.3 The brief — send this as it is

**What we need:** six Spanish and six Portuguese (pt-BR) words, each of which works for a person of any gender.

**Where they appear:** as a small label next to a person's name — in the people list, on a role-change sheet, and in the approval queue. They are read at a glance, beside a name and a photo. See [frame 13](../../wireframes/012-joining-and-naming/index.html) for the Spanish version drawn in place.

**Our proposal, which is a starting point and not a preference:**

| Stored role | Trip kind | EN | ES (proposed) | pt-BR (proposed) |
|---|---|---|---|---|
| `host` | personal | Organizer | Organiza | Organiza |
| `co-host` | personal | Organizer | Organiza | Organiza |
| `guest` | personal | Member | Participante | Participante |
| `host` | hosted | Host | Organiza | Organiza |
| `co-host` | hosted | Co-host | Coorganiza | Coorganiza |
| `guest` | hosted | Guest | Asistente | Participante |

**The three questions, in order of how much they matter:**

1. **Does each word work for a person of any gender?** This is the hard constraint. If one does not, it is wrong whatever else it has going for it.
2. **Does it sound like a person, or like a job title?** The brand is *warm, clear, calm* ([brand foundations](../brand/brand-foundations.md) §1.3). "Organiza" is a verb used as a label, which is a workaround — if there is something that is both ungendered and more natural, we want it.
3. **Do the personal and hosted rows read differently enough?** In English, "Organizer / Member" is peer-to-peer and "Host / Guest" is an event. That difference is the whole point of having two rows. **We think it partly collapses in Spanish and Portuguese, and we would rather know than pretend otherwise.** If it does collapse, say so — one vocabulary for both kinds is an acceptable answer in those two languages.

**What we are not asking:** whether to have role labels at all, or whether to collect gender. Both are settled.

**How to answer:** a replacement word per row, or "fine" per row. A sentence on question 3. Nothing longer is needed.

### 8.4 What is blocked, and what is not

Worth being precise, because "blocked on the reviewers" overstates it:

| Blocked | Not blocked |
|---|---|
| Writing the six ES and six pt-BR role labels into `es.json` and `pt.json` | Everything else in the localization slice: `Intl` zone names, the single-key refactor, the missing-key check, the join-page strings |
| — | The English labels, which ship with [epic #20](https://github.com/Fogataz/trip-planner/issues/20) |
| — | The build. No slice stops for this |
