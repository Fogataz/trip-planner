# Pilot Event: Feature List

> Status: planning list, 2026-11-09. Build scope for the first pilot event (company gathering, Madrid, 24–25 Nov, to confirm). Full requirements: [specs/002-hosted-event-pilot.md](../specs/002-hosted-event-pilot.md). This list adds the "why now / why later", risks and fallbacks per feature. Decision numbers (D…) refer to the [product working doc](working-doc.md).
>
> **Updated 2026-11-09 (evening):** the localization base shipped in [spec 003](../specs/003-localization.md), so feature 4 is smaller. Open product and strategy questions are not blockers: build with the spec 002 §9 recommendations as defaults (D27).
>
> It is a planning aid for spec 002, not living reference. When the pilot ships, [features.md](../features.md) describes what was built.

## Summary

Effort is a rough guide for engineering with Claude Code: **S** = up to 1 day, **M** = 1–2 days, **L** = 2–3 days. Build window: Thu 12 – Thu 19 Nov (about 6 working days).

| # | Feature | One line | Priority | Effort | Spec 002 §7 | Status |
|---|---|---|---|---|---|---|
| 1 | Organizations and trip roles | Organizations own hosted events; people are host, co-host or guest per trip | Must | L | F1–F7 | Not started |
| 2 | Sign-in: Google and email link | Join without a password | Must (Google) / Should (email link) | M | F8–F10 | Not started |
| 3 | Invite link with approval | One link for the group chat; hosts approve requests | Must | M | F11–F17 | Not started |
| 4 | Localization for the new screens | New strings in 3 languages, event time zone, language saved to the account, push in the recipient's language | Must (strings, time zone) / Should (account language, localized push) | S–M | F33–F37 | Base done in spec 003; pilot parts not started |
| 5 | Analytics events | Count actions so the pilot teaches us something | Must | S–M | F30–F32 | Not started |
| 6 | AI agenda import as a draft | Paste the agenda, review, publish | Must | M–L | F18–F23 | Not started |
| 7 | Announcements | Hosts post and pin; everyone sees them live | Must | M | F25–F26 | Not started |
| 8 | Notification settings | Each member mutes by category | Should | S–M | F27–F29 | Not started |
| 9 | Small fixes | Q&A uses accommodation and language; web app manifest for iPhone push | Should | S | F24, §7.2 | Q&A language done (spec 003); rest not started |

**Total is about 9–12 days of work for about 6 days of build** (down from 11–14 now that the localization base has shipped). The cut line in spec 002 §12 keeps the "Must" items and has a fallback for each "Should". Check progress on Tue 17 Nov.

**Scope note:** localization was added after D2 (four features) as a cross-cutting requirement (D23). Its base shipped on 9 Nov in spec 003, so what is left is the pilot-specific part: strings for new screens, the event time zone, and push in each person's language.

## Feature details

### 1. Organizations and trip roles

| | |
|---|---|
| **Description** | An Organization (company, host, operator) owns hosted events. Its owner, admins and members can create and manage them. Inside any trip, a person is host, co-host or guest. Organization membership alone gives no access to a trip. |
| **Today** | Roles are `organizer` or `member`, stored inside each trip. Nothing sits above a trip. |
| **Why now** | Organizers and attendees need different powers at the event (guests vote, they don't edit the agenda). |
| **Why later** | Billing, payouts, public listings and curators all attach to the Organization, so the role model doesn't need rework (D18, D19). Serves all 10 revenue models. |
| **Technical** | New `Organization`, `OrgMember`, `TripMember` collections. One capability helper replaces scattered `role === 'organizer'` checks. Socket `join-trip` reads `TripMember`. Idempotent migration with a backup. |
| **Principles** | Privacy first: trip roles gate access, not Organization roles. |
| **Depends on** | Nothing. Everything else depends on it. |
| **Measure** | Not measured directly. Supports all other metrics. |
| **Risk and fallback** | Migration breaks access. Fallback: run on a copy first, keep a restore script. |

### 2. Sign-in: Google and email link

| | |
|---|---|
| **Description** | Continue with Google, or get a sign-in link by email. Email and password stay for existing accounts. |
| **Today** | Own email and password with JWT. Firebase Admin is set up for push; `verifyIdToken` exists but is unused. |
| **Why now** | Colleagues join from a phone in seconds. No passwords to forget on the day. |
| **Why later** | Every model needs low-friction joining. The account stays ours (our JWT), so we can add Apple sign-in or switch providers later. |
| **Technical** | Firebase Auth on the client (package already installed). New `POST /api/auth/firebase` exchanges the Firebase token for our JWT. Link accounts by verified email. Password becomes optional. Firebase sends the email link in the user's language. |
| **Principles** | No conflict. |
| **Depends on** | Feature 1 (user fields). |
| **Measure** | `signed_in` by method; link opened → request sent under 2 minutes. |
| **Risk and fallback** | Email links land in spam or work mail scanners use them up. Fallback: email and password. Test both mailboxes in the dry run. |

### 3. Invite link with approval

| | |
|---|---|
| **Description** | A host shares one link. Opening it shows only the event name, dates, host and cover. Signing in sends a join request. A host approves one by one or all at once. People invited by email skip approval. |
| **Today** | Email invites only; the signed-in email must match exactly; 7-day expiry. |
| **Why now** | Invites happen in a group chat, and people use personal and work accounts. |
| **Why later** | The same link plus approval works for retreats, clubs and operators. Later, public listings can feed the same request queue. |
| **Technical** | `InviteLink` with a 128-bit token, revocable. Public preview endpoint returns only safe fields. Rate limits on requests. Requesters cannot join socket rooms. |
| **Principles** | Privacy first: nothing visible before approval (D17). |
| **Depends on** | Features 1 and 2. |
| **Measure** | Join rate ≥ 60%; request → approval under 1 hour. |
| **Risk and fallback** | Hosts forget to approve. Fallback: push to hosts on each request, badge count, Approve all. |

### 4. Localization: English, Spanish, Portuguese

| | |
|---|---|
| **Description** | New screens in English, Spanish (Spain) and Portuguese (pt-BR, S5). Dates and times show in the event's time zone, labelled. The language choice is saved to the account. Push and sign-in emails use the recipient's language. Content (agenda, announcements) is never machine-translated. |
| **Today** | **Spec 003 shipped on 9 Nov:** all current screens in en, es and pt (207 keys, none missing), header switcher, saved choice → country from IP → browser → English, AI output in the UI language. Still missing: the choice is only saved in the browser, push text is English, dates use the device time zone, no missing-key script, no native review. |
| **Why now** | A Madrid event with a mixed team. And our first markets are Spain and Portugal. |
| **Why later** | Every later screen is built with keys from day one. Adding pt-BR or another language is one file. |
| **Technical** | New keys in the existing locale files. `User.locale` set from the switcher and applied on sign-in. Small server dictionary for push text per recipient. `Intl.DateTimeFormat` with a new `trip.timeZone`. A missing-key script. Layouts must allow about 30% longer text. **Watch:** spec 003 tells the AI to write in the UI language; the agenda import must override that to keep the source language. |
| **Principles** | One source of truth: we don't keep translated copies of content. |
| **Depends on** | None. The framework exists, so other features add keys from day one. |
| **Measure** | Language split (report only); no missing keys at release. |
| **Risk and fallback** | Translation quality (no native review yet). Fallback: you review Spanish and Portuguese strings for the new screens before the dry run; English push and device-only language if time runs out. |

### 5. Analytics events

| | |
|---|---|
| **Description** | 16 events (join funnel, views, votes, questions, announcements, notification changes, location sharing started, drafts, language), with a CSV export for the retro. |
| **Today** | None. The activity log records some actions but not polls or expenses, and nothing reads it. |
| **Why now** | Without it the pilot gives anecdotes, not evidence for D3. |
| **Why later** | The same events become the funnel for every customer event and the gates in the revenue plan. |
| **Technical** | First-party collection in MongoDB (S3). Pseudonymous id (HMAC of uid). Server-side events where possible; batched client events. Retention 180 days (S4). |
| **Principles** | Privacy first: no content, names, emails or coordinates. Mentioned in the privacy note. |
| **Depends on** | Feature 1 (roles in each event). |
| **Measure** | All F30 events present in the dry run export. |
| **Risk and fallback** | Events missing on the day. Fallback: verify the export in the dry run. |

### 6. AI agenda import as a draft

| | |
|---|---|
| **Description** | A host pastes the agenda or uploads `.md`, `.txt` or `.csv`. AI returns a draft schedule within the event's dates and time zone, flags unsure items, and the host edits and publishes. "Generate itinerary" also becomes a draft. |
| **Today** | AI generation writes up to 15 items straight into the itinerary. Items have stop, time, transport and notes; no end time or place. |
| **Why now** | The organizers have an agenda already. Retyping it is the biggest setup cost. |
| **Why later** | The host time-saver for retreats (C1), operators (H) and clubs (G). Templates and curator guides import through the same draft. Fixes principle 4 for all AI features. |
| **Technical** | `Draft` collection; review screen; publish copies items with a `source`. Prompt includes dates, time zone and accommodation; returns JSON with a confidence flag per item. Limits: 200 KB, 50 sessions, 3 imports per hour. Keeps the source language. |
| **Principles** | AI suggestions are editable drafts (principle 4). Agenda text goes to the AI provider: said in the privacy note. |
| **Depends on** | Features 1 and 4 (time zone). |
| **Measure** | Upload → publish under 30 minutes; ≥ 70% of items kept or lightly edited. |
| **Risk and fallback** | AI misreads days or times. Fallback: the review screen and flags; manual entry still works. |

### 7. Announcements

| | |
|---|---|
| **Description** | Hosts and co-hosts post short announcements and pin one. Members see them live at the top of the event, with unread badges. Guests can't reply (S8). |
| **Today** | No announcements. "Comments" are questions answered by AI. Push fires on many changes. |
| **Why now** | "Bus leaves at 9:15 from the lobby" needs one trusted channel during the event. |
| **Why later** | Every hosted model needs it. Later: scheduled announcements, audiences (for example only one session's attendees), email delivery. |
| **Technical** | `Announcement` collection, REST plus socket events, read state per member, push category `announcements`. |
| **Principles** | Real-time by default. |
| **Depends on** | Feature 1. |
| **Measure** | Announcement opens per announcement; by platform (iPhone reach, S6). |
| **Risk and fallback** | iPhone users without the site on the Home Screen get no push. Fallback: in-app strip and the "Add to Home Screen" help (feature 9). |

### 8. Notification settings

| | |
|---|---|
| **Description** | Per event, each member switches five categories on or off: announcements, schedule changes, polls, expenses, questions. Hosted-event guests start with expenses and questions off. |
| **Today** | No settings. Push on new stops, polls, expenses, questions and joins. |
| **Why now** | Notification overload is the top complaint about event apps. A muted app is a dead app. |
| **Why later** | The same settings carry over to email and SMS channels later. |
| **Technical** | Settings on `TripMember`. `notifyTrip` gets a category and filters recipients. |
| **Principles** | Real-time by default, but not noisy. |
| **Depends on** | Feature 1. |
| **Measure** | Share who mute everything ≤ 25%. |
| **Risk and fallback** | Time. Fallback: one "mute this event" switch. |

### 9. Small fixes

| | |
|---|---|
| **Description** | AI Q&A includes the accommodation and calendar, and answers in the asker's language. Add a web app manifest and icons so iPhone users can add the site to the Home Screen and get push. Optionally make new questions and answers live. |
| **Today** | The Q&A prompt ignores the accommodation. No manifest. Questions are not broadcast. |
| **Why now** | Cheap, and it closes a principle 4 gap and the iPhone push gap. |
| **Why later** | The manifest is the first step to an installable app without the App Store. |
| **Technical** | Prompt change; `manifest.webmanifest`, icons, meta tags; one socket event. |
| **Principles** | Fixes principle 4 (accommodation) and helps principle 2. |
| **Depends on** | Feature 4 (language). |
| **Measure** | Push registration rate by platform. |
| **Risk and fallback** | None significant. |

## Other fields worth tracking

The fields above cover what you asked for. These are worth adding as the list turns into a build tracker:

| Field | Why |
|---|---|
| **Status** (not started, building, in QA, done, cut) | Shows progress against the Tue 17 Nov cut-line check. |
| **Acceptance criteria** (spec §8 numbers) | Lets QA tick off each feature. |
| **Wireframe frame** (spec §6 numbers) | Links design to build. |
| **Analytics events** per feature | Makes sure every feature is measured. |
| **New strings** (count per feature) | Sizes translation work for Spanish and Portuguese review. |
| **Owner** | Who answers questions: you (product) or engineering. |
| **Dry-run result** | What broke on Fri 20 Nov. |
