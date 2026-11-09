# Roadmap

> **Status: draft for review.** Phases come from the root README. Status reflects the current code, not confirmed delivery dates. **TBD** items need a date or owner.

## Phases

| Phase | Scope | Status |
|---|---|---|
| 1. Project setup and auth | Project scaffolding, signup and login, JWT sessions | **Done** |
| 2. Core trip management | Create, view, update and delete trips; members and invitations | **Largely in place.** Confirm remaining gaps |
| 3. Real-time collaboration | Socket.io trip rooms, presence, membership checks, polls, comments | **Largely in place** |
| 4. Location tracking | Opt-in live location shared within a trip | **In place** (in-memory only) |
| 5. Transport API integration | Live transport delays and updates | **Not started** |
| 6. Notifications | Push notifications through Firebase Cloud Messaging | **Partly in place.** Token registration exists. Triggers **TBD** |
| 7. Frontend and polish | Full web client and UX polish | **In progress** (React client exists). Trip covers shipped 2026-11-06 ([spec 001](../specs/001-trip-covers.md)). EN/PT/ES localization shipped ([spec 003](../specs/003-localization.md)). Server errors and push text still English |

The Phase 3 socket events in the README (`join-trip`, `leave-trip`, `trip:updated`, `location:update`, `transport:update`) are partly implemented. `join-trip`, `leave-trip` and `location:update` exist. `trip:updated` and `transport:update` should be confirmed.

## Next priorities (proposal)

0. **Hosted event pilot** for the first pilot event on 24–25 Nov: Organizations and trip roles, Google and email-link sign-in, invite link with approval, AI agenda import as a draft, announcements and notification settings, analytics, and the pilot's localization on top of spec 003 (event time zone, language saved to the account, push in each person's language). See [spec 002](../specs/002-hosted-event-pilot.md) (draft) and the [planning list](pilot-event-feature-list.md). It also covers item 3 (notification triggers) and part of item 4 (activity logging).
1. **Expense settlement.** **Looks built (checked 2026-11-09):** the API returns suggested settlements (`computeSettlements` in `server/routes/expenses.js`) and the client shows a "Settle up" list. Engineering to confirm and update [features.md](../features.md), which still lists add, list and delete only.
2. **Transport updates (Phase 5).** Choose a provider, then design the alert flow. **TBD:** provider and budget.
3. **Notification triggers.** Decide which events send push notifications (new poll, itinerary change, invitation). **TBD.**
4. **Activity feed.** The server logs trip activity, but nothing in the client shows it and no endpoint reads it. Found while building trip covers (spec 001, O1). **TBD:** owner and target date.
5. **Quality fixes.** Remove duplicate Mongoose index definitions and fix the Redis URL configuration.

## Not planned yet

- Payments between members and to hosts: back in scope since 2026-11-09, planned after the pilot (see the product working doc). No spec yet.
- Booking inside the app: back in scope since 2026-11-09, but parked for now. No spec yet.
- Native mobile apps. A web app manifest (spec 002) lets people add the web app to their home screen first.

## Changelog pointer

Shipped work is recorded in git history and in the specs table in [docs/README.md](../README.md). Update this file in the same pull request as the feature when a phase changes status.
