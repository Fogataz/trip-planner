# Spec 008: Activity coverage and read state

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Comes from: [spec 004](004-trip-ia-redesign.md) §7.6 and §18.4 (built in PR #13 with two known limits). Roadmap priority 4 "Activity feed".

> **Seed draft (2026-11-10).** Stages 1–3 are **not done**. Open decisions carry recommendations that act as working defaults (D27).

## 1. The problem in one line

"Since you were away" and the needs-me badges miss half of what happens in a trip (polls and expenses are never logged), and they forget what you have seen whenever you switch device.

## 2. What exists today (after spec 004)

| Piece | Where |
|---|---|
| Activity log, written for stop add/change/delete, member changes and cover updates | `server/services/activityLogger.js`, `server/models/ActivityLog.js` |
| Read endpoint `GET /api/trips/:groupId/activity` (members only, newest first, `limit`, `since`) | `server/routes/trips.js` (PR #13) |
| "Since you were away" on Overview, rendered per language from the action type | `client/src/trip/SinceAway.tsx` |
| Badges per destination | `client/src/trip/badges.ts` (unit tested) |
| "Last visit" per trip, kept per device in browser storage | `useSeen` in `client/src/trip/tripData.ts` |

Known gaps:

1. **Coverage.** Polls (created, closed), expenses (added, deleted), payments (spec 005), stay changes, questions and announcements (spec 002) are not logged, so they never appear in the feed.
2. **Read state is per device.** Open the trip on your phone and your laptop still shows the badge.
3. **Logged emails go stale.** Entries store `userEmail` at write time ([spec 007](007-profiles-and-display-names.md) fixes this by resolving names at read time).
4. **No retention.** The log grows forever.

## 3. Where it lives

No new surface. Overview's "since you were away" and the tab badges get complete and consistent. Optionally, a "See all activity" page linked from Overview (a list, not a destination).

## 4. Recommended direction

- **Log every shared change** through the existing `logActivity`: add `poll_created`, `poll_closed`, `expense_added`, `expense_deleted`, `payment_recorded`, `stay_updated`, `question_asked`. Store the small fields the feed needs (stop name, poll question, amount) so it renders without extra reads.
- **Server-side read state:** a `TripReadState { tripId, userId, seen: { overview, plan, money, group } }` document, written with a debounced `PUT /api/trips/:groupId/seen`. The client keeps browser storage as a cache and takes the newer of the two.
- **One badge source:** compute badges from the server's read state plus the live data the client already holds. `computeBadges` stays the single pure function.
- **Retention:** keep 180 days, matching spec 002's analytics recommendation (S4).
- Keep the feed and analytics separate: the activity log is product content members see; spec 002's analytics events are pseudonymous and never shown.

## 5. Benchmark leads (stage 1 to confirm)

Slack and Linear (unread and "assigned to me" as the organising principle), Notion (updates feed), Splitwise (activity tab), Google Docs (per-document "new since you last opened").

## 6. Open decisions

| # | Decision | Options | Recommendation |
|---|---|---|---|
| A1 | Sync read state across devices | Yes, server-side / keep per device | **Yes.** A badge that has already been cleared elsewhere trains people to ignore badges |
| A2 | Which events are in the feed | Everything shared / only plan and money changes | **Everything shared**, except votes (too noisy: show "3 people voted" on the poll instead) |
| A3 | Full activity page | Now / later | **Later.** Overview's six most recent are enough until people ask |
| A4 | Retention | 90 days / 180 days / forever | **180 days** |

## 7. Starting points for the build

- `server/models/ActivityLog.js`: extend the `action` and `targetType` enums.
- Call `logActivity` from `server/routes/polls.js`, `expenses.js`, the accommodation route in `trips.js`, and `comments.js`.
- `client/src/trip/SinceAway.tsx`: add cases to `describeActivity` and EN/PT/ES keys under `trip.activity`; link polls and expenses to Plan and Money.
- New model and route for read state; `useSeen` in `tripData.ts` reads and writes it.
- A TTL index on `ActivityLog.timestamp` for retention.

## 8. Next step

Decide A1. Then a short define pass (which events, what each line says), no new frames needed beyond the existing Overview, and a full draft for approval.
