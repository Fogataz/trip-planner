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
| Phase | Epic | **Retired (name-D4).** Phases 1–7 are history in [roadmap.md](../product/roadmap.md). Horizon and the milestones replace it |
| Revenue Model | Initiative, Epic | By name (name-D2): host tool, operator app, offsites, group payments… Letters stay as aliases in [naming.md](naming.md) §4 |
| Priority | all | |
| Start date / Target date | Initiative, Epic | drives the Roadmap view |
| Effort | — | deliberately unused. Two people, and it does not roll up |

Set on the board (project fields):

| Field | Values |
|---|---|
| Horizon | Now, Next, Later. Set on initiatives and epics. Roadmap and Backlog views can group by it |
| Status | Backlog, Spec draft, Spec approved, In build, In review, Shipped |
| Sprint | 1-week iterations, from Mon 10 Nov |

Layer and Revenue Model live on the **epic only**. A story inherits context from its parent.

## Milestones

Three gate milestones in `Fogataz/trip-planner`. The criteria are from [venture-analysis.md](../product/venture-analysis.md) §9. Put them in each milestone's description. Every initiative and epic belongs to one.

| Milestone | Due | Gate |
|---|---|---|
| **M0 Pilot retro** | 2026-11-27 | Pilot retro against the [working doc](../product/working-doc.md) §5 thresholds |
| **M1 Phase 1 gate** | 2027-02-26 | At least 2 hosts paid or committed a departure with a deposit; 8 of 15 interviewed hosts describe the pain unprompted; setup under 2 hours per departure |
| **M2 Phase 2 gate** | 2027-06-30 | 10+ paying hosts; first host collecting deposits in the app; second departure run without our help |

## Writing an epic

Epics are written by the `/epic` command (`.claude/commands/epic.md`), which follows this section.

### Rules

| Rule | Why |
|---|---|
| **The title is an outcome**: what changes for a host or traveller, in plain words. "Hosts start a new departure from a past one in minutes", not "Templates". Once a spec exists, prefix its number: `[009] Hosts start…` | Roadmaps work best when they name problems and outcomes, not features [E3][E4]. The title survives if the solution changes. |
| **Every epic carries a hypothesis and a measure** | An epic is a bet. A testable hypothesis plus early (leading) indicators lets us stop or continue before all the work is spent [E1][E2]. |
| **3–6 main user stories, from named personas (personas in [epic-briefs.md](../product/epic-briefs.md) §2)** | Enough to show the shape of the work. Stories become sub-issues only after the spec is approved, from its build order (tracker.md). |
| **Before a spec:** the issue body is the full brief. **After a spec:** the body keeps outcome, hypothesis, measures and stories, and links the spec for requirements and acceptance criteria | Keeps one source of truth: the brief, then the spec. The board never restates a spec (tracker.md). |
| **Principles check in every brief** | CLAUDE.md asks us to flag conflicts early. |
| **Owner questions are listed, never answered** | D27: each has a recommendation that is the working default. |
| **Size:** 2–8 weeks. Bigger means two epics | tracker.md level 2. |

### Issue body template

```markdown
**Outcome:** <one sentence: what changes for whom>
**Initiative:** I<n> <name> (#<issue>) · **Horizon:** Now | Next | Later · **Milestone:** M0 | M1 | M2
**Models:** <by name, e.g. host tool> · **Layer:** Core | Host | Money | Public | Content
**Spec:** none yet (next step: /feature benchmark) | [NNN](link)

### Problem
<2–3 sentences, with the evidence and a link>

### Hypothesis
We believe <capability> for <persona> will <outcome>.
We'll know when <measure and target>.

### Measures
- Leading (during build or the first departure): …
- Lagging (by the milestone): …

### Main user stories
- As a <persona>, I want <goal>, so that <reason>.

### Scope
- In: …
- Not in: …

### Depends on
### Principles check
### Open questions for the owner (with recommendation)
### Done when
Spec shipped and docs updated (docs/README.md "When a spec ships"), and the measure checked at the milestone.
```

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

I1–I5 and their epics below were created in `Fogataz/trip-planner` on 2026-11-10 by a one-off
script, since removed (it is in git history). Shipped specs 001 and 003 are **not** seeded — they are already recorded
in the specs table, and back-filling closed issues adds noise.

### I1 Run the hosted event pilot (24–25 Nov)

Outcome: the Madrid gathering runs on Trip Planner and we get the signals in spec 002 §11.
12–25 Nov. Revenue Model: offsites (D).

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

### I2 Learn from the pilot and keep offsites as a benchmark

> Renamed and refocused 2026-11-10 (D33). Was "Prove the offsites model". RSVP and Organization home moved to I6 premium hosts run a repeat departure, the public share page to I8 hosts collect guest money. Closes after M0.

Outcome: the pilot is written up and its metrics are the benchmark premium hosts must meet.
Horizon: Now. Milestone: M0. Revenue Model: offsites (D).

| Epic | Layer | Source |
|---|---|---|
| Spike: what the pilot teaches us about hosts (brief 2) | — | spec 002 §11 |

### I3 What we have built works as documented

> Renamed from "Close the gaps in what is already built". Add a CI task. Horizon: Now.

Outcome: `features.md` matches the code, and the known defects are gone. Target 5 Dec.

| Item | Type | Source |
|---|---|---|
| Confirm expense settlement and update features.md | Task | roadmap, next priority 1. Settlement is built (`computeSettlements`, spec 004); what remains is recording a payment, tracked as [005] |
| Real-time gaps: emit Q&A events, listen for accommodation changes | Story | working-doc §4.1 item 7 |
| Activity feed: log polls and expenses, server-side read state | Epic | working-doc §4.1 item 8. The read endpoint, since-you-were-away and needs-me badges shipped in spec 004 slice 2; the rest is tracked as [008] |
| Remove duplicate Mongoose index definitions | Task | roadmap, next priority 5 |
| Fix the Redis URL configuration | Task | roadmap, next priority 5 |

### I4 Travellers hear about delays before they matter

> Renamed from "Transport awareness". Horizon: Later.

Outcome: members are alerted to delays that affect the schedule. No target date: blocked on the
provider and budget (**TBD**). Phase 5.

Alert slots already exist in Countdown and Live Overview (spec 004). Spec 006 recommends manual
status first, then one flight API.

| Item | Type |
|---|---|
| Spike: choose a transport data provider (coverage, budget) | Spike |
| Transport delay alerts | Epic |

### I5 Give the product a structure (closed)

> Closed 2026-11-10: spec 004 shipped.

Outcome: people can tell what the app is for and find the one thing that matters to them right now.
Added after the first seed, when spec 004 was approved (2026-11-10). It is the foundation that specs
005–008 build on.

| Epic | Source |
|---|---|
| [004] Trip information architecture | [spec 004](../specs/004-trip-ia-redesign.md) §1. Built in three slices, PRs #11–#14 |

Spec 007 (profiles and display names) is a separate epic under I1 run the hosted event pilot, because it ships with
Google sign-in.

## Initiatives added by venture-analysis.md §12.2

Added 2026-11-10 after D33 (premium hosts lead). Outcome titles; epics come from [epic-briefs.md](../product/epic-briefs.md).

| # | Initiative | Horizon | Key result | Epics |
|---|---|---|---|---|
| I6 | Premium hosts run a repeat departure without our help | Now | 2 hosts run a second departure with under 2 hours of setup | Briefs 3–7 |
| I7 | We know which premium hosts will pay, and for what | Now | Phase 2 scope chosen on evidence at M1 | Discovery spikes (epic-briefs §3) |
| I8 | Hosts collect guest money inside the trip | Next | First host collects deposits in the app by M2 | Brief 8 now; briefs 9–12 after M1 |

### Summary of initiatives

| # | Initiative | Horizon | Milestone |
|---|---|---|---|
| I1 | Run the hosted event pilot | Now | M0 |
| I2 | Learn from the pilot and keep offsites as a benchmark | Now | M0 |
| I3 | What we have built works as documented | Now | — |
| I4 | Travellers hear about delays before they matter | Later | — |
| I5 | Give the product a structure | — | Closed |
| I6 | Premium hosts run a repeat departure without our help | Now | M1 |
| I7 | We know which premium hosts will pay, and for what | Now | M1 |
| I8 | Hosts collect guest money inside the trip | Next | M2 |
