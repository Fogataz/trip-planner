# Spec backlog

> **Living document.** Candidates for future specs and improvements, so a feature never starts from scratch. Each row says where the work goes in the product structure (spec 004: Overview, Plan, Money, Group, plus the map and assistant modes), what we recommend exploring first, and where in the code to start. When a candidate gets a spec, link it here and remove the row once that spec ships.
>
> Started 2026-11-10 at the end of the [spec 004](../specs/004-trip-ia-redesign.md) build. Recommendations are working defaults, not decisions (D27).

## Specs already seeded

These have a seed draft: a starting point with recommendations, before benchmark and wireframes.

| Spec | One line | Next step |
|---|---|---|
| [005 Settle up](../specs/005-settle-up.md) | Record "I paid Ana" so balances reach zero (roadmap R2) | Benchmark Splitwise and Tricount, frame the record-payment sheet |
| [006 Transport updates](../specs/006-transport-updates.md) | Delays and cancellations on the group's legs (roadmap Phase 5, R3) | Product owner: provider and budget (T1) |
| [007 Profiles and display names](../specs/007-profiles-and-display-names.md) | Names and avatars instead of email addresses (spec 004 A9) | Decide whether it ships with spec 002's Google sign-in |
| [008 Activity coverage and read state](../specs/008-activity-and-read-state.md) | Log polls and expenses; sync "last seen" across devices | Decide A1 (server-side read state) |

## Belongs in an existing spec

| Item | Where it goes | Recommendation |
|---|---|---|
| **Notification preferences (roadmap R4)** | [Spec 002](../specs/002-hosted-event-pilot.md) F27–F29 (five categories per trip). In the product: Group → Notifications, where spec 004 reserved the slot | Build there; no new spec. Note: push **triggers already exist** for new expense, new poll, member joined, question asked and stop add/change/delete (`notifyTrip` calls in `server/routes/`). What is missing is the per-category opt-out and push in the recipient's language (002 F36) |
| **Shared AI drafts for hosted trips** | Spec 002 F21–F23 (host-only drafts, publish, discard) | Build on spec 004's draft mode (`itinerary/generate` with `draft: true`, PR #14). Today drafts are private to the person who asked and live only in the browser |
| **AI context for Q&A** | Spec 002 F24 (accommodation and calendar in the answer prompt) | Also pass the current stops, so answers stop suggesting what is already planned |

## Candidates without a spec yet

| Item | Why | Where it goes | Recommendation | Starting point |
|---|---|---|---|---|
| **Q&A answers as proposals** | The assistant wireframe shows answers with Add to plan / Dismiss; today answers are prose | Assistant → Ask | Ask the model for structured places (JSON, like the itinerary builder) alongside the prose answer; render them as draft stops with the same Add to plan flow | `server/routes/comments.js` prompt, `server/services/itineraryBuilder.js` for the JSON pattern, `DraftSection` in `client/src/trip/Assistant.tsx` |
| **Edit trip dates and length** | There is no UI to change dates; the approximate length (spec 004 D10) can never become a real end date | Overview → facts card, Dates row (organizer) | An inline editor like Stay. During Countdown, nudge the organizer to confirm the end date when only a range is set | `PUT /api/trips/:groupId` already accepts `endDate` and `durationDays` (an end date clears the range) |
| **Desktop map beside the plan** | Wireframe 15: on wide screens the map is a companion panel next to the itinerary (the Wanderlog pattern) | Plan, ≥1024 px | A toggle that shows the map panel in a two-column Plan, with stops numbered on the map; full-screen mode stays for phones | `client/src/trip/MapMode.tsx`, `LiveLocationMap.tsx` (stops are not plotted yet; needs coordinates on stops) |
| **Sharing countdown in map mode** | The wireframe shows "You're sharing · stops in 4 min"; principle 3 wants the sharing state always visible | Map mode | Show the remaining time of the 5-minute TTL and a clear Stop button in a bottom bar | `LiveLocationMap.tsx`, TTL in `server/index.js` |
| **Conflict warning on the item** | Parity map (spec 004 §7.7) says inline on the affected stop plus a toast; today it is a banner on Plan | Plan | Mark the conflicting item and offer "Reload this stop" | `handleAddItinerary` in `client/src/trip/destinations/Plan.tsx` |
| **Group chat** | Reserved by spec 004 D5; we cannot out-chat WhatsApp | Group (reserved slot) | Do not build chat. Explore "comments on a stop or a poll" first: discussion attached to state, which WhatsApp cannot do | — |
| **Packing checklist** | Reserved slot in the Countdown Overview | Overview (Countdown) and Plan | A shared checklist with "who brings what", tied to the trip, not to a person | New model; the Countdown block in `Overview.tsx` |
| **Bookings and documents** | People keep tickets and confirmations in email | Plan, attached to a stop | Attach a file or a parsed booking to a stop; reuse spec 002's AI import as a draft to parse confirmations. Pairs with spec 006's structured legs | Cover upload pipeline (spec 001) for files |
| **Photos and recap** | Reserved slot in the Wrap Overview; the reason to reopen a finished trip besides money | Overview (Wrap) | A shared album link first (no storage cost), then an auto-recap (stops visited, km, spend) | Wrap block in `Overview.tsx` |
| **Server and push text in the user's language** | Roadmap Phase 7: server errors and push text are still English | Everywhere | Covered for pilot categories by spec 002 F36; extend to every server error by returning codes and translating in the client | `server/routes/*` error strings |
| **CI** | No checks run on pull requests; spec 004 added the first client tests | Engineering | A GitHub Actions workflow running `tsc`, `npm test` and `vite build` in `client/` on every PR | `client/package.json` scripts |

## Research, not a spec

| Item | Why | Owner |
|---|---|---|
| Tree test (spec 004 §10) | The four labels shipped before the test (D11). A failing label is a cheap rename now | **TBD** |
| First-click test on the five Overview phases (spec 004 §10.3) | Does the first click match each phase's primary action? | **TBD** |
