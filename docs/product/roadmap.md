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
| 6. Notifications | Push notifications through Firebase Cloud Messaging | **Partly in place.** Token registration and pushes for new expense, new poll, member joined, question asked and stop changes exist. Per-category preferences are in [spec 002](../specs/002-hosted-event-pilot.md) F27–F29 |
| 7. Frontend and polish | Full web client and UX polish | **In progress** (React client exists). Trip covers shipped 2026-11-06 ([spec 001](../specs/001-trip-covers.md)). EN/PT/ES localization shipped ([spec 003](../specs/003-localization.md)). Trip information architecture ([spec 004](../specs/004-trip-ia-redesign.md)) shipped 2026-11-10, built in three slices (PRs #11–#14, landed on `main` by [#77](https://github.com/Fogataz/trip-planner/pull/77)). Server errors and push text still English |

The Phase 3 socket events in the README (`join-trip`, `leave-trip`, `trip:updated`, `location:update`, `transport:update`) are partly implemented. `join-trip`, `leave-trip` and `location:update` exist. `trip:updated` and `transport:update` should be confirmed.

## Next priorities (proposal)

**After the pilot (D33):** product work follows the epic order in [venture-analysis.md](venture-analysis.md) §11 and the briefs in [epic-briefs.md](epic-briefs.md): the host layer for premium hosts first, then payments. The list below is the engineering backlog that runs alongside.

0. **Hosted event pilot** for the first pilot event on 24–25 Nov: Organizations and trip roles, Google and email-link sign-in, invite link with approval, AI agenda import as a draft, announcements and notification settings, analytics, and the pilot's localization on top of spec 003 (event time zone, language saved to the account, push in each person's language). See [spec 002](../specs/002-hosted-event-pilot.md) and the [planning list](pilot-event-feature-list.md). It also covers item 3 (notification triggers) and part of item 4 (activity logging).

   **Approved 2026-11-12**, together with two specs that came out of reviewing it:
   - **[011 Organizations, roles and permissions](../specs/011-roles-and-permissions.md)** — the model spec 002 part 1 builds. Capability is the primitive, role is a preset, on three axes: **role ∩ trip kind ∩ entitlement**. Five guarantees, and two confirmed defects in today's code that it closes (a removed member keeps receiving socket events; live location is never re-checked against membership).
   - **[012 Joining, naming and the first trip](../specs/012-joining-naming-and-the-first-trip.md)** — a QA pass over 002 that found three regressions it would have shipped, the one-tap invited path, the attribution rule and the localization mechanics.

   **Four decisions taken 2026-11-12, settling the data model:** an Organization is **never required** to host a trip (O1); an org owner reaches a trip they hold no role on only by a **logged claim** (R1); leaving an Organization **drops** host and co-host roles on its trips (R2, which also closes a contradiction between this doc's §4.2 and spec 002 §10); and `Trip.entitlement` is **reserved** now so pricing later is a lookup rather than a migration (R8).

   **Slice S1 is built and in review** (2026-11-12): the capability table and `can()`, `TripMember` and `OrgMember`, role labels per trip kind, `Trip.orgId` nullable and `Trip.entitlement` reserved, **G3 · No self-demotion**, **G5 · One helper** as a test that fails the build, **G4 · Immediate revocation**, and the migration with a dry run and a reverse script. Building it found four defects in the specs, written up as **Q21–Q24** in [spec 011](../specs/011-roles-and-permissions.md) §17 — the most serious being that the migration as specified could leave a trip with no host at all.

   **Build order:** spec 012 §12 groups 002's eleven parts into eight slices. Epic [#20](https://github.com/Fogataz/trip-planner/issues/20) is slice 1 and everything else depends on it. [#40](https://github.com/Fogataz/trip-planner/issues/40) (analytics) must land before the dry run on 20 Nov, or the pilot runs and teaches us nothing. **One item is not engineering and is on the critical path:** the Spanish and Portuguese role labels need the spec 003 §6 native reviewers before any locale file is written (O8).
1. **Expense settlement.** Suggested settlements are built (`computeSettlements` in `server/routes/expenses.js`), and spec 004 made Money balance-first ("You owe Ana €42.00"). **Missing:** recording that a payment happened, so balances reach zero. Seed draft: [spec 005 Settle up](../specs/005-settle-up.md).
2. **Transport updates (Phase 5).** The alert slots exist in the Countdown and Live Overview (spec 004). Seed draft: [spec 006](../specs/006-transport-updates.md), recommending manual status first, then one flight API. **TBD:** provider and budget.
3. **Notification preferences.** Pushes already fire for the main events; what is missing is opting out per category. This is [spec 002](../specs/002-hosted-event-pilot.md) F27–F29, not a new spec.
4. **Activity feed.** Built in spec 004 slice 2 (PR #13): a read endpoint, "since you were away" on Overview, and needs-me badges. **Missing:** polls and expenses are not logged, and read state is per device. Seed draft: [spec 008](../specs/008-activity-and-read-state.md).
5. **Quality fixes.** Remove duplicate Mongoose index definitions and fix the Redis URL configuration. Add CI that runs the client's `tsc`, tests and build on every pull request.
6. **Profiles and display names.** Replace email addresses with names and avatars. Seed draft: [spec 007](../specs/007-profiles-and-display-names.md); best shipped with spec 002's Google sign-in.

Smaller candidates and reserved slots (chat, packing, bookings, photos, editing trip dates) are in the [spec backlog](spec-backlog.md).

## Not planned yet

- Payments between members and to hosts: back in scope since 2026-11-09, planned after the pilot (see the product working doc). No spec yet.
- Booking inside the app: back in scope since 2026-11-09, but parked for now. No spec yet.
- Native mobile apps. A web app manifest (spec 002) lets people add the web app to their home screen first.

## Changelog pointer

Shipped work is recorded in git history and in the specs table in [docs/README.md](../README.md). Update this file in the same pull request as the feature when a phase changes status.
