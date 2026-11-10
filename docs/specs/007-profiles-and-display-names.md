# Spec 007: Profiles and display names

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Comes from: [spec 004](004-trip-ia-redesign.md) audit item A9 ("identity is raw email addresses"), deferred in §18.4. Related: [spec 002](002-hosted-event-pilot.md) F8 (Google sign-in).

> **Seed draft (2026-11-10).** Stages 1–3 are **not done**. Open decisions carry recommendations that act as working defaults (D27).

## 1. The problem in one line

A group product where you cannot recognise your group: presence, members, expenses, polls and the activity feed all show email addresses like `slice2-ana@example.com`.

## 2. What exists today

| Piece | Where |
|---|---|
| User has `uid`, `email`, `password`, `fcmTokens`. No name, no picture | `server/models/User.js` |
| Trip members store `email` (copied at invite time) | `server/models/Trip.js` (`members[]`) |
| Presence shows initials from the email, full email on hover | `client/src/trip/TripLayout.tsx` |
| Members, ledger, settlements, polls, "since you were away" print emails | `Group.tsx`, `Expenses.tsx`, `SinceAway.tsx` |
| Activity log stores `userEmail` at write time | `server/models/ActivityLog.js` |

## 3. Where it lives

- **Setting it:** a small profile sheet from the account menu in the app header (name, optional photo). Also prompted once after sign-up or after the first trip join, never blocking.
- **Showing it:** everywhere a person appears. Chrome presence avatars, Group member rows, Money ("Ana paid · split 4 ways", "Pay Ana €42.00"), poll voters, the activity feed, map tooltips.
- **Group** keeps the email visible to the organizer only (for invites and support).

## 4. Recommended direction

- Add `displayName` (required on next sign-in, prefilled from the email's local part) and optional `avatarUrl` to User.
- With Google sign-in (spec 002 F8), take name and picture from the Google profile on first sign-in.
- **Resolve names at read time, not write time.** One helper builds a `uid → { name, avatar }` map per trip; the client renders from it. Do not copy names into members or log entries, or renames go stale (principle 1).
- Avatars: initials on a colour derived from the uid when there is no picture, so people are recognisable before anyone uploads anything. Reuse the cover upload pipeline (spec 001) for pictures.
- Privacy: other members see name and avatar, not email (principle 3). Organizers still see emails in Group.

## 5. Benchmark leads (stage 1 to confirm)

Partiful and Luma (guest list as social proof), Splitwise (names everywhere money appears), WhatsApp (the incumbent: phone contacts as identity), Slack (display name vs full name).

## 6. Open decisions

| # | Decision | Options | Recommendation |
|---|---|---|---|
| P1 | Required or optional name | Required / optional | **Required, prefilled**, asked once without blocking |
| P2 | Name per trip or global | Global / per-trip nickname | **Global** in v1 |
| P3 | Who sees emails | Everyone / organizer only / nobody | **Organizer only** |
| P4 | Photo upload in v1 | Yes / initials only | **Initials in v1**, photos with Google sign-in or the cover pipeline later |

## 7. Starting points for the build

- `server/models/User.js`: `displayName`, `avatarUrl`. A `PUT /api/me` route.
- A per-trip people endpoint, or names in `GET /api/trips/:groupId`, resolved from User by uid.
- Client: a `usePeople()` map in `client/src/trip/TripContext.tsx`; replace every email render (search for `.email` and `userEmail` in `client/src`).
- Socket presence: send `uid` only and resolve the name client-side.

## 8. Next step

Decide whether this ships with spec 002's Google sign-in (recommended: the profile data arrives with it) or on its own first. Then frames for the profile sheet and an audit of every screen that shows a person.
