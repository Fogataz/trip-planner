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
| 7. Frontend and polish | Full web client and UX polish | **In progress** (React client exists). Trip covers shipped 2026-11-06 ([spec 001](../specs/001-trip-covers.md)) |

The Phase 3 socket events in the README (`join-trip`, `leave-trip`, `trip:updated`, `location:update`, `transport:update`) are partly implemented. `join-trip`, `leave-trip` and `location:update` exist. `trip:updated` and `transport:update` should be confirmed.

## Next priorities (proposal)

1. **Expense settlement.** Show who owes whom so shared costs can be closed out. **TBD:** owner and target date.
2. **Transport updates (Phase 5).** Choose a provider, then design the alert flow. **TBD:** provider and budget.
3. **Notification triggers.** Decide which events send push notifications (new poll, itinerary change, invitation). **TBD.**
4. **Activity feed.** The server logs trip activity, but nothing in the client shows it and no endpoint reads it. Found while building trip covers (spec 001, O1). **TBD:** owner and target date.
5. **Quality fixes.** Remove duplicate Mongoose index definitions and fix the Redis URL configuration.

## Not planned yet

- Booking inside the app
- Payments between members
- Native mobile apps

## Changelog pointer

Shipped work is recorded in git history and in the specs table in [docs/README.md](../README.md). Update this file in the same pull request as the feature when a phase changes status.
