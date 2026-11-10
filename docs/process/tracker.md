# Tracker

> **Status: draft for review.** Adopted 2026-11-10. Replaces nothing; this is the first version.

Delivery is tracked in GitHub Issues and the **Trip-Planner** project in the `Fogataz` organization.
This file is the convention. The board is a view onto the specs, never a second place to define work.

## Why GitHub and not Notion or Jira

Free with no issue cap, it sits beside the code and the pull requests, and it works with Copilot,
Codex and Claude Code without a seat or a connector. A Notion board would have needed two paid seats
(a guest cannot connect Notion MCP) and a second source of truth next to `docs/`.

## Three levels

| Level | Issue type | Size | Answers | Maps to |
|---|---|---|---|---|
| 1 | **Initiative** | 1–3 months, measurable outcome | why we are spending the next month this way | a bet in [working-doc.md](../product/working-doc.md) §2–3 |
| 2 | **Epic** | 2–8 weeks, one capability | what we are building | a spec, or one part of a large spec |
| 3 | **Story / Task / Bug / Spike** | ≤ a few days | what to do next | a requirement or build-order row in the spec |

Linked as sub-issues. A parent takes up to 100 children across up to 8 levels.

Rules:

- Every epic has exactly one initiative. A story needs no epic if it is a one-off fix.
- An initiative closes when its outcome is decided or achieved, not when its last child closes.
- If the outcome does not fit in one sentence, it is an epic, not an initiative.
- Issue bodies link to the spec. They never restate it.

**One deviation, on purpose.** The rule is one epic per spec. Spec 002 is a two-week programme with
eleven parts, so its §12 build order becomes eleven epics, all pointing at the same spec. If a spec
ever needs more than about five epics again, that is a sign it should have been two specs.

## Fields

Set on the issue (org-level issue fields), so they survive outside the board:

| Field | Levels | Values |
|---|---|---|
| Layer | Epic | Core, Host, Money, Public, Content — from working-doc §2 |
| Phase | Epic | 1–7 — from [roadmap.md](../product/roadmap.md). Historical; phases 1–4 are largely done |
| Revenue Model | Initiative, Epic | All models, A…I — the "Models served" column in working-doc §4.1 |
| Priority | all | |
| Start date / Target date | Initiative, Epic | drives the Roadmap view |
| Effort | — | deliberately unused. Two people, and it does not roll up |

Set on the board (project fields):

| Field | Values |
|---|---|
| Status | Backlog, Spec draft, Spec approved, In build, In review, Shipped |
| Sprint | 1-week iterations, from Mon 10 Nov |

Layer, Phase and Revenue Model live on the **epic only**. A story inherits context from its parent.

## Views

| View | Shows |
|---|---|
| Backlog | open items with no sprint, sliced by Layer, hierarchy on |
| Sprint board | the current sprint, columns by Status |
| Roadmap | initiatives and epics across Start → Target date |
| Initiatives | top-level bets, expandable to their children |

## How this fits the spec process

[docs/README.md](../README.md) still owns how a feature goes from idea to shipped. The board tracks
execution, not decisions.

- **The spec file header is the source of truth for `draft` and `approved`.** The board's Status
  mirrors it.
- **The board owns every state after approval:** In build, In review, Shipped.
- The specs table in `docs/README.md` keeps the shipped date and the PR.
- At stage 4 the spec gets an **epic**; at stage 5 its build order becomes **stories** under it.
- The gate is unchanged: nothing moves to In build before the spec is `approved`.

Put the spec number in the epic title: `[002] Invite link, requests and approval`.

## Seeding

[seed-board.sh](seed-board.sh) creates the initiatives, epics and stories below. It is one-off;
delete it once it has run. Shipped specs 001 and 003 are **not** seeded — they are already recorded
in the specs table, and back-filling closed issues adds noise.

### Initiative 1 — Run the hosted event pilot (24–25 Nov)

Outcome: the Madrid gathering runs on Trip Planner and we get the signals in spec 002 §11.
12–25 Nov. Revenue Model: D.

Epics are the eleven parts of [spec 002](../specs/002-hosted-event-pilot.md) §12, in build order.
Parts 1–7 are **Must** and carry stories. Parts 8–11 are **Should** and may be cut on 17 Nov, so
they are seeded as epics only.

| # | Epic | Cut line | Layer | Phase |
|---|---|---|---|---|
| 1 | Organizations, trip roles and TripMember migration | Must | Host | 1 |
| 2 | Google sign-in | Must | Core | 1 |
| 3 | Invite link, requests and approval | Must | Core | 2 |
| 4 | Pilot localization: event time zone and new strings | Must | Core | 7 |
| 5 | Analytics events and CSV export | Must | Core | 7 |
| 6 | Agenda import as a reviewable draft | Must | Host | 7 |
| 7 | Announcements with pin and unread | Must | Host | 6 |
| 8 | Notification categories | Should | Core | 6 |
| 9 | Email-link sign-in | Should | Core | 1 |
| 10 | Language saved to the account, localized push | Should | Core | 7 |
| 11 | Generate itinerary as draft, Q&A context, web manifest | Should | Core | 7 |

Plus two tasks on the initiative itself: the 13 lo-fi wireframe frames (§6) and the dry run on
Fri 20 Nov (§12.4).

### Initiative 2 — Prove the offsites model (decide D3)

Outcome: D3 is decided on pilot evidence, and a second event runs without hand-holding.
Target 19 Dec. Revenue Model: D.

| Epic | Layer | Source |
|---|---|---|
| Spike: pilot retro against the §11 signals, and the D3 call | — | spec 002 §11 |
| RSVP, capacity, check-in and guest forms | Host | working-doc §4.1 item 9 |
| Organization home | Host | working-doc §4.1 item 10 |
| Public share page | Public | working-doc §4.1 item 11 |

### Initiative 3 — Close the gaps in what is already built

Outcome: `features.md` matches the code, and the known defects are gone. Target 5 Dec.

| Item | Type | Source |
|---|---|---|
| Confirm expense settlement and update features.md | Task | roadmap, next priority 1 |
| Real-time gaps: emit Q&A events, listen for accommodation changes | Story | working-doc §4.1 item 7 |
| Activity feed: read endpoint, UI, log polls and expenses | Epic | working-doc §4.1 item 8 |
| Remove duplicate Mongoose index definitions | Task | roadmap, next priority 5 |
| Fix the Redis URL configuration | Task | roadmap, next priority 5 |

### Initiative 4 — Transport awareness

Outcome: members are alerted to delays that affect the schedule. No target date: blocked on the
provider and budget (**TBD**). Phase 5.

| Item | Type |
|---|---|
| Spike: choose a transport data provider (coverage, budget) | Spike |
| Transport delay alerts | Epic |
