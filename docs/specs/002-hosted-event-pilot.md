# Spec 002: Hosted Event Pilot

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Current behavior: [features.md](../features.md) (nothing from this spec is built yet)
Planning list (why now, why later, risks and fallbacks per feature): [product/pilot-event-feature-list.md](../product/pilot-event-feature-list.md)

> Benchmark (2026-11-09) → spec draft (2026-11-09) → lo-fi wireframes → build.
> This spec is a record of what was decided and why. It is not updated as the features change; see [features.md](../features.md) once they ship. Strategy context lives in the [product working doc](../product/working-doc.md) (decisions D2, D4, D17–D19).

## 1. The idea in one line

Make Trip Planner run a **real hosted event**: an Organization creates the event, attendees join from one link with Google or an email link, organizers turn their agenda into a reviewed schedule with AI, post announcements people can mute, and every screen works in English, Spanish and Portuguese. We measure all of it.

## 2. Why this is worth building

**The first test is close.** A 2-day company gathering in Madrid (24–25 Nov 2026, to confirm) is our first live event. Today it would fail at the door: invites are email-only, the signed-in email must match the invited one, and there is no link to share in a group chat. Organizers would also retype the agenda by hand, and attendees would get a push for every change.

**It is the shared foundation, not a one-off.** Every revenue model we are considering needs the same pieces (revenue analysis, section 6):

| Piece | Why it outlives the pilot |
|---|---|
| Organizations and trip roles | Hosted trips, billing and payouts later attach to an Organization (D18). |
| One-tap sign-in and invite links | Every model needs low-friction joining. |
| AI as a reviewable draft | Fixes a principle 4 conflict for all AI features. Agenda import is the host's main time-saver in models C, D, G and H. |
| Announcements and mute | Hosts need one channel that is not a chat and not noise. |
| Analytics | Without it the pilot teaches us nothing. |
| Localization | Our first markets are Spain and Portugal, and attendees mix languages. |

## 3. Design principles for this feature

| Principle | What it means here |
|---|---|
| **The door is one tap** | From a shared link to "request sent" in under a minute, on a phone, without a password. |
| **Nothing is visible before approval** | A link only creates a request. A requester sees the event name, dates and host, and nothing else (principle 3). |
| **AI drafts, people publish** | AI output never lands in the schedule until a host reviews and publishes it (principle 4). |
| **Quiet by default** | Attendees get announcements and real changes, not every edit. They decide what to mute. |
| **One language per person** | The interface follows each person's language. Content (agenda, announcements) stays in the language the host wrote it in. |
| **Measure without watching** | We count actions. We never store content or coordinates in analytics. |

## 4. Benchmark

Five products that solve parts of this today.

| Product | What it does well | What we take | What we avoid |
|---|---|---|---|
| **Luma** (event pages) | "Require approval": guests register and the host approves or declines, with Approve All for 2+ pending guests ([help](https://help.luma.com/p/expanded-guest-table.md)). Invited guests skip approval ([help](https://help.lu.ma/p/helpart-u9pkpOQLUKfvfke/inviting-and-adding-guests-to-your-event)). Blasts go by email, SMS and push, and stay on the event page ([help](https://help.luma.com/p/sending-or-scheduling-event-blasts)). Guests choose channels per notification type; hosts cannot override ([help](https://help.luma.com/p/notification-types)). Luma deliberately does not force a work email ([help](https://help.luma.com/p/why-luma-doesnt-require-specific-email-types)). | Link + approval, Approve All, invited people skip approval, announcements also visible in-app, guests own their notification settings, any email allowed. | Event discovery and public pages (not now). |
| **Whova** (conference app) | Agenda import from its Excel template or your own spreadsheet with column mapping ([blog](https://whova.com/?p=37686)). Announcements as push plus a pinned "Organizer Announcements" thread with red badges ([help](https://whova.zendesk.com/hc/en-us/articles/235961848-How-do-announcements-notify-my-attendees)). | Import with a preview before anything is saved. Announcements live in one place in-app, not only as push. | Notification overload: reviewers say volume is excessive and hard to manage ([Capterra](https://www.capterra.com/p/149712/Whova/reviews/1377574/)). Template-first import. AI parsing removes the template. |
| **Partiful** (invites) | One link, RSVP without downloading an app ([APKMirror listing](https://www.apkmirror.com/?p=13798094)). Text blasts to everyone who RSVP'd; hosts choose whether guests can reply ([JBSA](https://www.jbsagolf.com/blogs/?p=9826)). | A link that works in WhatsApp. No install. One-way announcements. | Phone number as identity (we use Google or email). |
| **TripIt** (trip organizer) | Forward a confirmation email to plans@tripit.com and it builds the itinerary ([TripIt](https://www.tripit.com/learnMore)). It sends a success or failure reply ([Office Watch](https://office-watch.com/2017/tripit-tips-microsoft-outlook/)). | "Give us what you already have" import, with clear success and failure feedback. | Auto-adding parsed items without review. We keep a draft step. |
| **WhatsApp Communities** (what organizers use today) | An announcement group where only admins post; members can mute it ([TechWiser](https://techwiser.com/most-common-questions-answered-about-whatsapp-communities/)). Members cannot reply there ([MacMyths](https://macmyths.com/14-whatsapp-communities-common-questions-answered)). | Admin-only announcements as a familiar pattern. Muting is per channel. | Announcements mixed with chat. No schedule, no votes, no structure. |

**Takeaways:** approval with bulk approve is standard (Luma). Announcements need a home in the app, not only push (Whova, Luma). Notification overload is the most common complaint (Whova). Import should accept what organizers already have, with a preview (Whova, TripIt).

## 5. The experience

### 5.1 Organizer: set up the event

1. Sign in with Google or an email link.
2. **Create an Organization** (name only), or pick one you belong to. The pilot Organization is created by the product owner, who adds the organizers as admins.
3. **Create a hosted event** in the Organization: name, place, dates, time zone (defaults to the destination's), accommodation.
4. **Import the agenda** (5.3). Review and publish.
5. **Share the invite link** in the team's chat. Optionally add co-hosts.
6. **Approve requests** as they arrive, one by one or all at once.

### 5.2 Attendee: join

1. Tap the link in WhatsApp or Slack. The page shows the event name, dates and host, in the attendee's browser language.
2. Choose **Continue with Google** or **Email me a link**. No password.
3. First time only: a short **privacy note** (what we store, live location is opt-in and never stored, we count actions for analytics, an AI provider processes agendas and questions). One button: **Request to join**.
4. Screen: "Request sent. You'll get a notification when a host approves you." If push is not possible (for example iPhone without the app on the home screen), we show the "Add to Home Screen" steps.
5. On approval: push (where available), and the event opens on the next visit.

People already invited by email skip approval (as in Luma).

### 5.3 Organizer: agenda import as a draft

1. **Import agenda**: paste text, or upload a `.md`, `.txt` or `.csv` file.
2. AI reads it with the event's dates, time zone and accommodation, and returns a **draft**: a list of sessions with start, end, title, place and description.
3. The **review screen** shows the draft next to the source. Each item can be edited or deleted. Items the AI was unsure about (missing time, ambiguous day) are flagged.
4. **Publish** copies the items into the schedule. Everyone sees it live. **Discard** throws the draft away.
5. The existing **Generate itinerary** button now also creates a draft, never writes directly.

The draft keeps the source language. We do not translate content.

### 5.4 Announcements and mute

- Hosts and co-hosts post an **announcement** (text, up to 1,000 characters) and can pin one.
- Everyone sees announcements in a strip at the top of the event and in an Announcements list, with an unread badge.
- Push goes to everyone who has not muted announcements.
- Each member opens **Notifications** for this event and switches categories on or off: announcements, schedule changes, polls, expenses, questions.

### 5.5 Language

- The interface is available in **English, Spanish and Portuguese**.
- Default: the person's saved choice, else the browser language, else English.
- A language switcher sits in the account menu and on the join page.
- Dates and times use the person's language and the **event's time zone**, labelled ("Madrid time").
- Push titles and bodies use the recipient's language. Content inside them (the announcement text) stays as written.
- AI answers to questions use the asker's language. AI drafts keep the source language.

## 6. Lo-fi wireframe frames (proposed)

For the wireframe stage. Mobile first; desktop is the same layout, wider.

| # | Frame | What it must show |
|---|---|---|
| 1 | **Join page (logged out)** | Event name, dates, host name, cover. Language switcher. Continue with Google / Email me a link. Nothing else about the event. |
| 2 | **Email link sent** | "Check your inbox", the email address, resend, use a different email. |
| 3 | **Privacy note** | 4 short lines, a link to more, one primary button: Request to join. |
| 4 | **Request sent / waiting** | Status, what happens next, "Add to Home Screen" help on iPhone. |
| 5 | **Host: join requests** | List of pending people (name, email, time), Approve / Decline per row, Approve all. Badge count in the event header. |
| 6 | **Host: invite link panel** | Copy link, share, link status (active, expires on), Revoke and create a new link. |
| 7 | **Host: import agenda** | Paste box and file drop, accepted formats, the event's dates and time zone shown for context, Import button, progress state (5–20 s). |
| 8 | **Host: review draft** | Two columns on desktop (source left, draft right); stacked on mobile. Editable rows, flags on uncertain items, Publish and Discard. |
| 9 | **Event home with announcements** | Pinned announcement strip at the top, schedule below grouped by day in the event time zone, existing polls and map entry points. |
| 10 | **Host: post announcement** | Text box with counter, Pin toggle, Send. A note: "Sent to N people. Some may have muted announcements." |
| 11 | **Member: notification settings** | Five switches with one-line descriptions, per event. |
| 12 | **Language switcher** | Three options, each in its own language (English, Español, Português). |
| 13 | **Organization switcher** | Personal / Organization name, and "Create an Organization". Shown only to people with an Organization. |

## 7. Requirements

### 7.1 Functional

**Organizations and roles**

| # | Requirement |
|---|---|
| F1 | A signed-in user can create an Organization. The creator is its owner. |
| F2 | An owner or admin can add people to the Organization by email as admin or member, and remove them. |
| F3 | Organization owners, admins and members can create hosted trips in that Organization. The creator becomes the trip's host. |
| F4 | Trip roles are host, co-host and guest. Hosts and co-hosts can edit the event, publish drafts, approve requests, post announcements and manage roles. |
| F5 | Organization membership alone gives no access to a trip (D19). Only an active trip role does. |
| F6 | Each trip has guest permissions. Personal trips: guests can add schedule items, polls and expenses (today's behavior). Hosted trips: guests can vote, ask questions and share location, but not edit the schedule. |
| F7 | Existing trips become personal trips. The creator becomes host, other organizers co-hosts, members guests. No user loses access they have today. |

**Sign-in**

| # | Requirement |
|---|---|
| F8 | Users can sign in with Google or with an email link (D4). |
| F9 | A Google or email-link sign-in with a verified email that matches an existing account signs in to that account. |
| F10 | Email and password keep working for existing accounts. |

**Invite link and approval**

| # | Requirement |
|---|---|
| F11 | A host or co-host can create one active invite link per trip, copy it, and revoke it. Revoking creates a new link on request; the old one stops working at once. |
| F12 | Opening a link shows only the event name, dates, host name and cover. |
| F13 | A signed-in user who opens a valid link can send a join request. Duplicate requests from the same user are ignored. |
| F14 | Hosts and co-hosts see pending requests and can approve or decline each, or approve all. |
| F15 | A requester cannot see members, schedule, polls, expenses, questions, announcements or locations, and cannot join the trip's real-time room, until approved. |
| F16 | Approval sends the requester a push (if registered) and makes the event available. Decline sends nothing. |
| F17 | People invited by email skip approval when they accept with any signed-in account (the exact-email match is removed). |

**AI drafts and agenda import**

| # | Requirement |
|---|---|
| F18 | A host or co-host can import an agenda by pasting text or uploading `.md`, `.txt` or `.csv` (up to 200 KB). |
| F19 | The import produces a draft of sessions (start, end, title, place, description) within the event's dates and time zone. |
| F20 | Draft items the AI could not place with confidence are flagged with a reason. |
| F21 | A draft is visible only to hosts and co-hosts until published. Items can be edited or deleted before publishing. |
| F22 | Publish adds the items to the schedule, broadcasts them live, and records the source (`ai_import` or `ai_generate`). Discard deletes the draft. |
| F23 | "Generate itinerary" creates a draft instead of writing to the schedule. |
| F24 | AI Q&A answers include the trip's accommodation and calendar in their context (fixes a principle 4 gap). |

**Announcements and notifications**

| # | Requirement |
|---|---|
| F25 | Hosts and co-hosts can post, pin, unpin and delete announcements. One pinned announcement at a time. |
| F26 | Announcements appear live for all active members, with unread state per member. |
| F27 | Each member can turn five categories on or off per trip: announcements, schedule changes, polls, expenses, questions. |
| F28 | Every push the server sends checks the recipient's category setting first. |
| F29 | Defaults for guests in hosted trips: announcements, schedule changes and polls on; expenses and questions off. Personal trips: all on. |

**Analytics**

| # | Requirement |
|---|---|
| F30 | The product records these events: invite_link_opened, join_requested, join_approved, join_declined, signed_in (method), trip_viewed, schedule_viewed, poll_voted, question_asked, announcement_posted, announcement_opened, notifications_changed (category, on/off), location_sharing_started, draft_created (source, item count), draft_published (items edited, deleted), language_changed. |
| F31 | Each event stores: name, trip id, role, time, a pseudonymous user id, and small properties listed above. Never content, names, emails or coordinates. |
| F32 | A product owner can export the events for a trip as CSV for the retro. |

**Localization**

| # | Requirement |
|---|---|
| F33 | Every interface string is available in English, Spanish (es-ES) and Portuguese (variant: open decision S5). |
| F34 | Language is chosen as: saved user choice, else browser language, else English. The choice is saved to the account. |
| F35 | Dates and times are formatted for the user's language and shown in the event's time zone, with the zone named. |
| F36 | Push notifications and the sign-in email use the recipient's language. |
| F37 | AI answers use the asker's language. AI drafts keep the source language. Content is never machine-translated in this version. |

### 7.2 Technical

Proposed; engineering confirms or adjusts in the PR.

- **New models** (see the working doc, section 4.2): `Organization`, `OrgMember`, `TripMember`, `InviteLink`, `JoinRequest` (or a `requested` status on TripMember), `Draft`, `Announcement`, `AnalyticsEvent`. Trip gains `ownerType`, `orgId`, `kind`, `status`, `timeZone`, `guestPermissions`. User gains `displayName`, `locale`, `authProviders`; `password` becomes optional.
- **Membership:** move from the embedded `Trip.members` array to `TripMember`. Replace every `role === 'organizer'` check with one capability helper (for example `can(trip, uid, 'publishDrafts')`). The socket `join-trip` check reads `TripMember` and rejects `requested` and `removed`.
- **Migration:** a one-off, idempotent script with a backup first. Map creator → host, other organizers → co-host, members → guest. Copy invitations as they are.
- **Sign-in:** the client uses Firebase Auth (Google provider and email link; the `firebase` package is already a client dependency). A new `POST /api/auth/firebase` takes the Firebase ID token, verifies it with `verifyIdToken` (already in `server/config/firebase.js`), finds or creates the user by verified email, and returns our existing JWT. Existing auth middleware stays. Set the Firebase `languageCode` so the sign-in email uses the user's language.
- **Invite links:** token of 128 random bits. Public `GET /api/invite-links/:token` returns only name, dates, host name and cover. `POST /api/invite-links/:token/requests` creates a request (rate limited per user and per IP). Host endpoints to list, approve, decline and approve all.
- **Drafts:** `POST /api/trips/:groupId/drafts` (source text or file), `GET`, `PATCH` items, `POST …/publish`, `DELETE`. The AI prompt gets the event dates, time zone and accommodation, and returns JSON with a confidence flag per item. Limit: 50 sessions per import, 3 imports per trip per hour. Schedule items gain `endTime`, `location`, `description` and `source`.
- **Announcements:** REST endpoints plus socket events `announcement:created`, `announcement:updated`, `announcement:deleted`. Read state per member.
- **Notifications:** `notifyTrip` takes a category and filters recipients by their `TripMember` settings. Push text is built per recipient language.
- **iPhone push:** web push on iPhone needs the site added to the Home Screen. Add a web app manifest and icons so this is possible. Without it, announcements reach iPhone users only in-app.
- **Analytics:** first-party store in MongoDB (open decision S3), written by the server for server-side actions and by a batched `POST /api/analytics/events` from the client. Pseudonymous id: HMAC of the uid with a server secret. Retention: open decision S4. CSV export for the product owner.
- **Localization:** `react-i18next` with one JSON file per language (`en`, `es`, `pt`). Move all client strings into keys. A small server-side dictionary for push and email text. `Intl.DateTimeFormat` with the trip's `timeZone` for all dates. A check in CI or a script that fails on missing keys.
- **AI language:** add "Answer in {language}" to the Q&A prompt; tell the import prompt to keep the source language.

### 7.3 Non-functional

| # | Requirement |
|---|---|
| N1 | Join flow: from opening the link to "request sent" in under 60 seconds for a first-time user on a phone (excluding email delivery). |
| N2 | Agenda import returns a draft within 30 seconds for a 2-day agenda of 40 sessions, with a visible progress state. |
| N3 | No content, names, emails or coordinates in analytics. Live location stays in memory only. |
| N4 | The privacy note is shown before the first join request and is available later from the event menu. |
| N5 | Every new screen is keyboard operable and readable by a screen reader. Language switcher options are labelled in their own language with the right `lang` attribute. |
| N6 | Text expansion: layouts hold up with Spanish and Portuguese strings about 30% longer than English. |
| N7 | Push failures never block the action that triggered them (today's fire-and-forget behavior). |
| N8 | All new endpoints use the capability helper; unauthorized calls return 403 and change nothing. |

## 8. Acceptance criteria

**Organizations and roles**
1. Given I am signed in, when I create an Organization, then I am its owner and can create a hosted event in it.
2. Given I am an Organization admin with no role on a hosted event, when I open that event's URL or call its endpoints, then I get 403 and see nothing.
3. Given a hosted event, when a guest tries to add a schedule item, then it is refused; in a personal trip, a guest can add one.
4. Given an existing trip from before this spec, after migration its creator is host, organizers are co-hosts, members are guests, and every member still opens it.

**Sign-in**
5. Given a new user on the join page, when they choose Continue with Google, then they return to the same join page signed in.
6. Given a user who chooses Email me a link, when they open the link on the same device, then they are signed in and back on the join page.
7. Given an existing email-and-password account, when the same person signs in with Google using that verified email, then they land in the same account with their trips.
8. Given an existing account, email and password sign-in still works.

**Invite link and approval**
9. Given a host, when they create an invite link and open it in a private window, then the page shows only event name, dates, host and cover.
10. Given a signed-in user on a valid link, when they tap Request to join, then the host sees a pending request within the socket round-trip.
11. Given a pending requester, when they call any trip endpoint or try to join the trip's socket room, then they get 403 and receive no trip events.
12. Given 3 pending requests, when a host taps Approve all, then all 3 become guests and each gets a push if registered.
13. Given a revoked link, when anyone opens it, then they see "This link no longer works. Ask the host for a new one."
14. Given someone invited by email, when they accept while signed in with a different email, then they join without approval.

**AI drafts**
15. Given a pasted 2-day agenda, when I import it, then I see a draft with sessions on the right days in the event time zone, and nothing appears in the schedule yet.
16. Given a draft, when a guest calls the draft endpoints, then they get 403.
17. Given a draft with an item that has no time, then it is flagged with a reason.
18. Given I edit 2 items and publish, then all members see the schedule update live, and analytics records draft_published with 2 items edited.
19. Given I tap Generate itinerary, then a draft is created and the schedule does not change until I publish.
20. Given a 300 KB file or a `.pdf`, then it is rejected before upload with the limit and the allowed formats named.

**Announcements and notifications**
21. Given a host posts an announcement, then every active member sees it live and gets a push unless they muted announcements.
22. Given I muted polls in this event, when a new poll is created, then I get no push but still see the poll in the app.
23. Given a pinned announcement, when the host pins another, then only the new one is pinned.
24. Given a guest in a hosted event who never changed settings, then expenses and questions pushes are off and announcements, schedule and polls are on.

**Analytics**
25. Given the pilot runs, when the product owner exports the trip's events, then the CSV contains every event type in F30 that occurred, with pseudonymous ids and no names, emails, content or coordinates.

**Localization**
26. Given a browser set to Spanish and no saved choice, when I open the join page, then it is in Spanish.
27. Given I switch to Portuguese, then every screen in this spec is in Portuguese, and the choice persists on my next sign-in on another device.
28. Given an event in Europe/Madrid and a viewer whose device is in another time zone, then session times show in Madrid time, labelled.
29. Given a Spanish-speaking recipient, then the push title for an announcement is in Spanish and the announcement text is as the host wrote it.
30. Given I ask a question in Portuguese, then the AI answers in Portuguese.
31. Given the release build, then the missing-key check passes for all three languages.

## 9. Open decisions — need your call

| # | Decision | Options | Recommendation |
|---|---|---|---|
| S1 | What the join page shows before approval | Name, dates, host, cover / also agenda summary / nothing but a request button | **Name, dates, host, cover.** Enough to know what you are asking to join; nothing about other people. |
| S2 | Agenda file types | Paste, `.md`, `.txt`, `.csv` / also `.docx` and `.pdf` | **Paste plus `.md`, `.txt`, `.csv` now.** Organizers can copy from Google Docs. Add `.docx` and `.pdf` once we see what organizers try to upload. |
| S3 | Where analytics live | First-party in MongoDB / PostHog (EU cloud) | **First-party now.** No new vendor or data processor, no cookie banner question, and we control what is stored. Move to a product analytics tool when we need funnels across many events. |
| S4 | Analytics retention | 90 days / 180 days / 12 months | **180 days.** Covers the pilot and Phase 1 comparisons. Pseudonymous, so the risk is low; shorter is easy later. |
| S5 | Portuguese variant | Portugal (pt-PT) / Brazil (pt-BR) | **pt-PT now.** Our first markets are Spain and Portugal. Add pt-BR as a second file if Brazil becomes a target. |
| S6 | Announcement reach on iPhone | Manifest and Add to Home Screen only / plus email for announcements | **Manifest and in-app only for the pilot.** Email needs a sending provider and templates in 3 languages. Measure announcement_opened by platform, then decide. |
| S7 | Who can create an Organization | Anyone / invite only for now | **Anyone, but not promoted in the UI yet.** No billing exists, so there is nothing to protect. |
| S8 | Can guests reply to announcements? | No / yes, as comments | **No.** One-way, like WhatsApp announcement groups. Questions go to the existing Q&A. |

## 10. Out of scope for this spec

- RSVP, capacity, check-in and guest forms (Phase 1).
- An Organization home page beyond the switcher and member list (Phase 1).
- Public event pages and discovery.
- Payments.
- Interests onboarding (D2).
- Activity feed UI.
- People-to-people chat or comments.
- Apple sign-in.
- Email delivery of announcements (S6).
- Machine translation of content.
- Free-tier limits and the Trip Pass (D20).
- What happens to trips when someone leaves an Organization (D21). Until decided, removing an org member does not change their trip roles.

## 11. How we will know it worked

Proposed pilot thresholds (working doc, section 5; D7 to confirm).

| Signal | Target |
|---|---|
| Join rate (joined ÷ invited) | ≥ 60% |
| Link opened → request sent, median | < 2 minutes |
| Request → approval, median | < 1 hour |
| Day 1 / day 2 active (of joined) | ≥ 60% / ≥ 40% |
| Actions per active attendee per day | ≥ 3 |
| Poll participation (of joined) | ≥ 50% |
| Muted all categories (of joined) | ≤ 25% |
| Agenda import: upload → publish; items kept as is or lightly edited | < 30 minutes; ≥ 70% |
| "Very disappointed" in the survey; response rate | ≥ 30%; ≥ 40% |
| Language split | Report only. Tells us which languages matter. |
| Location sharing started | Report only. We do not push it. |

## 12. Next step

1. **Owner review of this spec** and the open decisions in §9.
2. **Lo-fi wireframes** for the 13 frames in §6.
3. **Build** (Thu 12 – Thu 19 Nov), in this order, with a cut-line check on Tue 17 Nov. Effort, risks and fallbacks per feature are in [the planning list](../product/pilot-event-feature-list.md).

| Order | Part | Cut line |
|---|---|---|
| 1 | Organizations, trip roles, TripMember and migration | Must |
| 2 | Google sign-in and `POST /api/auth/firebase` | Must |
| 3 | Invite link, requests, approve and approve all | Must |
| 4 | Localization framework, English and Spanish | Must |
| 5 | Analytics events and CSV export | Must |
| 6 | Agenda import as draft | Must |
| 7 | Announcements, pin, unread | Must |
| 8 | Notification categories | Should: fall back to one "mute this event" switch |
| 9 | Email-link sign-in | Should: fall back to email and password |
| 10 | Portuguese | Should: ship the file if translation is reviewed in time |
| 11 | Generate itinerary as draft, Q&A context fix, web app manifest | Should |

4. **Dry run** on Fri 20 Nov with 3 to 5 people: a personal Google account, a work mailbox email link, an iPhone and an Android phone, and all three languages.

## 13. Build status

Not started.
