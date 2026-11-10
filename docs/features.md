# Current Features

This page describes what the product does today, based on the code in `server/` and `client/`. It is the living reference: keep it true as the product changes. For why a feature was built the way it is, follow the link to its spec in [specs/](specs/).

## Accounts

- Sign up and log in with email and password (`POST /api/auth/signup`, `POST /api/auth/login`)
- Sessions use a token that expires after 7 days
- Token check endpoint (`POST /api/auth/verify`)

## Trips

- Create, list, view, update and delete trips
- **Trip page structure (spec 004, slice 1):** a trip opens on one of four destinations, each its own URL under `/trips/:groupId`: Overview (`/`), Plan (`/plan`), Money (`/money`) and Group (`/group`). The cover, title, route, dates and presence stay on screen across all four. The tabs are a bottom bar on phones (up to 768px) and a segmented bar above that. See [spec 004](specs/004-trip-ia-redesign.md)
  - **Overview:** changes with the trip's phase, computed in the viewer's timezone by `tripPhase` (`client/src/trip/phase.ts`). The four tabs never change.
    - **Setup** (no stops, or fewer than two active members, more than 7 days out): one "Get the trip started" card with a single next step
    - **Planning** (more than 7 days out): polls waiting on your vote, plan progress (stops and days planned), and a link to the trip ideas
    - **Countdown** (the last 7 days): days to go and the first departure, day 1's stops and stay, and invites not yet accepted
    - **Live** (start day to end day): the stop happening now and the next one, the live map, Add expense, and the rest of today
    - **Wrap** (after the end day): your balance with Settle up, and a trip summary (days, stops, spent, people)
    - Dates decide Countdown, Live and Wrap even for a solo or plan-less trip. Every phase also shows "Since you were away" and the facts with the Stay card
  - **Since you were away:** changes by others since your last visit to Overview on this device, from the activity log (`GET /api/trips/:groupId/activity`). Stop changes, members and cover updates are logged; polls and expenses are not
  - **Badges:** a count on a tab when something needs you, nothing at zero. Plan counts open polls you haven't voted in plus stop changes by others since you last opened Plan. Money shows 1 when your balance isn't zero. Group counts pending invites (organizer only). Overview counts new activity. "Last visit" is kept per device in the browser
  - **Plan:** itinerary (add, edit, delete, generate with AI), polls, and the AI travel suggestions as a collapsed "Trip ideas" card. Add stop is the one primary action. The poll form opens from "+ New poll". With no stops, Plan shows a single empty state with Add the first stop and Draft a plan with AI Stops are grouped by day ("Day 2 · Tue, Dec 1"); during the trip today is marked, Plan opens on it, and the current and next stops are labelled
  - **Money:** balance first. Your own position ("You owe €42.00" with who to pay, or "You're all settled up"), then the trip total and everyone's balance, then the expense list. The add form opens from "+ Add expense", except while the trip is happening (start day to end day in the viewer's timezone), when it stays open at the top. Marking a payment as settled is not built yet (roadmap R2)
  - **Group:** members, invite by email and link, and push notifications for this device. A trip with only you says so and points to Invite
  - **Map:** live location opens as a full-screen mode from Overview or Plan, and closes with Esc. Closing it stops sharing
  - **Assistant:** the "Ask the assistant" button (a floating button on phones) opens the Q&A from any destination
  - The trip header is compact (110px cover on desktop, 86px on phones) so each destination starts on the first screen. On desktop the tabs stay pinned under the app header
  - The trip is fetched once and shared by all four destinations, which stay current through the trip's socket. AI travel suggestions arrive by the `trip:suggestionsUpdated` socket event, with a short backed-off re-fetch as a fallback
- Each trip has a name, destination, origin, start date, accommodation, and either an end date or an approximate length in days (for example 8 to 10). Without an end date, the trip is treated as lasting the longer estimate
- The trips list is grouped into Live now, Upcoming and Past, nearest first
- Only active members can view a trip, and only the organizer can change or delete it (see `server/routes/trips.js`)

## Trip covers

- Each trip can have a cover image: a banner at the top of the trip page and a thumbnail on the trip card
- Pick from a built-in gallery of 9 covers, or upload your own image (resized in the browser to WebP, 2 MB limit)
- Reposition the cover vertically, or remove it. A trip without a cover shows the default gradient
- Cover changes sync live to everyone viewing the trip and are recorded in the activity log
- Gallery entries live in `client/src/covers.ts` and `server/config/coverGallery.js`; endpoints in `server/routes/trips.js` and `server/routes/covers.js`
- Spec and open items: [specs/001-trip-covers.md](specs/001-trip-covers.md)

## Members and invitations

- Invite people to a trip by email. Invitations can be resent or cancelled
- Accept an invitation with its token
- Change a member's role, or remove members

## Itinerary

- Add, edit and delete itinerary items (stop, time, transport, notes)
- Generate an itinerary suggestion with AI from the trip's details (`POST /api/trips/:groupId/itinerary/generate`)
- Live presence shows who is viewing or editing an item

## Polls

- Create polls, vote, close a poll, and delete it

## Expenses

- Add, list and delete shared expenses per trip
- **Settle up:** the expense list also returns each member's balance and suggested settlements (who pays whom) so the group can clear what it owes (`computeSettlements` in `server/routes/expenses.js`)

## AI Q&A

- Opened from the "Ask the assistant" button, available on every destination of a trip
- Members ask a question about the trip and the AI answers it. Questions and answers are listed for the trip (`server/routes/comments.js`)
- Answers are written in the asker's language

## Live features

- **Presence:** see who is currently viewing a trip
- **Live location:** opt in to share your location with trip members. It is not saved, and it expires after 5 minutes without an update

## Languages

- The app is available in English, Portuguese (pt-BR) and Spanish (es-ES). Details in [spec 003](specs/003-localization.md)
- Language precedence: the choice saved from the header dropdown, then the visitor's country from their IP (`GET /api/locale`, offline lookup), then the browser language, then English
- The client sends its language in the `X-Language` header, and AI answers, itineraries and travel suggestions are written in it
- Set `TRUST_PROXY` when running behind a proxy so IP detection sees the real client IP
- Still English: server error messages and push notification text

## Notifications

- Register and unregister a device for push notifications

## Activity log

- The server records trip activity through `server/services/activityLogger.js`
- There is no activity feed in the client yet, and no endpoint reads the log

**Note:** the README lists `websocket/` and `services/` as "coming later". Both exist now. Keep the README in sync when it changes.
