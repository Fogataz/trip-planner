# Spec 004: Trip Information Architecture

Status: building
Owner: Alberto Calvo · Approved: 2026-11-10 · Shipped: — · PR: — (slice 1 on branch `feature/trip-ia-slice-1`)
Wireframes: [`wireframes/004-trip-ia-redesign/index.html`](../../wireframes/004-trip-ia-redesign/index.html)

> Benchmark (§6) → define (§7) → wireframes (§15) → spec → gate → **build (§13)**.
> **Approved on 2026-11-10.** The eight decisions in §11 were taken the same day. Build may start, in the slices in §13 and on a branch. The handoff for whoever builds it is §16.
>
> **Approved without the tree test in §10, deliberately.** Slice 1 is a parity move — it changes where things live, not what they do — so the design risk of starting is low, and the test stays open as item 2 in §17. The exposure, if a label later fails: slice 1's routes and its EN/PT/ES keys. Run the test before slice 2 builds anything on top of those labels.

## 1. The problem in one line

Every feature we have ever built is stacked on one scrolling page at the same visual weight, so the product has **features but no structure** — people cannot tell what this app is for, and cannot find the one thing that matters to them right now.

## 2. The process (what the ideation stage is, and why it comes first)

The temptation is to "clean up the trip page". That produces a tidier pancake. The IA has to be derived, not styled, so we work in this order:

| Step | What we do | Output |
|---|---|---|
| 1 | **Feature inventory.** For every shipped and upcoming feature: what it does, whose job it serves, *when* in a trip it matters, how often it is touched | §4 |
| 2 | **Lifecycle model.** Establish that a trip has phases, and map each feature onto the phase where it earns its place | §5 |
| 3 | **Benchmark.** Steal the structural patterns that already work in adjacent products, and name what we deliberately do *not* copy | §6 |
| 4 | **Architecture.** Object model → navigation model → what adapts and what never moves | §7 |
| 5 | **Requirements + acceptance criteria.** Testable, so the wireframe and the build can both be checked against them | §8, §9 |
| 6 | **Validate the structure before drawing it.** Tree test / first-click test on the proposed nav | §10 |
| 7 | **Lo-fi wireframes.** Annotated frames per destination, mobile and desktop, every empty state | §15 |
| 8 | **Build in slices.** Shell and parity first, then the adaptive layer, then the new surfaces | §13 |

The rule for the ideation stage: **no visual design decisions**. Nothing here is about colour, type or spacing. If a question can be answered with "it depends what it looks like", it belongs in the wireframes.

### 2.1 Check against the product principles

Stage 2 of the process in [docs/README.md](../README.md) requires checking the four principles in [CLAUDE.md](../../CLAUDE.md) and flagging conflicts.

| Principle | This spec |
|---|---|
| 1. One source of truth | **Reinforced.** Four destinations, each owning exactly one object type. Nothing is reachable only from Overview (F5) |
| 2. Real-time by default | **Reinforced.** §8.2 replaces the 2-second refetch loop with the socket events the server already emits |
| 3. Privacy first | **Preserved.** Live location stays opt-in and becomes a dismissible mode (F9); its sharing state and countdown are visible whenever the map is open |
| 4. AI suggestions are editable drafts | **Reinforced.** §7.5 makes "it drafts, the group decides" the single contract across all AI, instead of three unrelated surfaces |

No conflicts found.

## 3. Audit — what we have today

### 3.1 The current structure

`client/src/pages/TripDetail.tsx` is 830 lines rendering ten sibling blocks in a single column, in this order:

1. Back link
2. Header card: cover · title · notification toggle · presence · from/to/dates/members · accommodation · **the entire AI travel-suggestions essay**
3. Conflict banner
4. Itinerary (AI generate, add stop, list)
5. Members (invite form, member list)
6. Live location map
7. Polls (create form, poll list)
8. Expenses (create form, settle-up, expense list)
9. Questions & Answers (ask form, Q&A list)

Three of those blocks (Members, Polls, Q&A) literally share the CSS class `qa-section`, and members, polls and expenses all render as `comment-item`. **The markup is an honest confession that no information architecture exists** — four unrelated object types are presented as the same kind of thing.

Covers (spec 001) and localization (spec 003) have both shipped into this same file since the audit was first written. Neither changed its shape: the ten blocks, the shared classes and the 2-second poll at line 183 are all still there.

### 3.2 Diagnosis

| # | Problem | Consequence |
|---|---|---|
| A1 | **Flat hierarchy.** Ten `h2` siblings, no levels. Nothing is more important than anything else | The user has to read everything to find anything |
| A2 | **No temporal relevance.** The page is identical 60 days before the trip and on the morning of day 2 | Live location is dead weight while planning; polls are noise mid-trip |
| A3 | **Unbounded content in the header.** The AI suggestions essay sits *inside* the title card and pushes the itinerary — the actual object of the product — below the fold | The first screen is raw AI text, not the group's plan |
| A4 | **Form-first, content-second.** Polls, expenses, Q&A and invite all lead with an expanded form | The page reads as five data-entry tasks, not a trip |
| A5 | **Five empty states on first open.** A brand-new trip shows "Generating…", no stops, no polls, no expenses, no questions | Worst possible first impression, at the exact moment of highest intent |
| A6 | **No addressability.** Ten features share one URL | You cannot link a friend to the expenses, and the back button does nothing useful |
| A7 | **No "needs me" layer.** Nothing tells you an open poll is waiting on your vote or that you owe €42 | Return visits have no hook; the app never pulls you back |
| A8 | **Three unrelated AI surfaces.** Auto-generated travel suggestions, a "Generate with AI" button, and "Ask AI" Q&A — three mental models, no concept | AI feels scattered and untrustworthy rather than like one assistant |
| A9 | **Identity is raw email addresses** in presence, members, expenses and polls | A group product where you cannot recognise your group at a glance |
| A10 | **Activity log exists server-side and is invisible in the UI** | We built the answer to "what changed while I was away" and never surfaced it |
| A11 | **Mobile is the same pancake, longer.** No bottom nav, no tabs, one `@media (max-width: 600px)` block | On a phone — where the trip is actually used — it is a scroll marathon |

A3, A5 and A7 are the ones that cost us the most. They are all IA problems, not styling problems.

## 4. Feature inventory

### 4.1 What exists today

| Feature | What it does | Whose job | When it matters | Touch frequency | Today it lives |
|---|---|---|---|---|---|
| Trip identity (name, route, dates) | Names the thing | Everyone | Always | Glance, every visit | Header card ✅ right place |
| Trip cover (spec 001) | Recognition and ownership | Everyone | Setup, then glance | Once | Header banner + list thumbnail ✅ |
| Accommodation ("Stay") | Anchors where the group sleeps; grounds AI suggestions | Organizer sets, all read | Planning → Live | Set once, read often | Buried in header |
| Itinerary | The plan: stops, times, transport, notes | Everyone | Planning → Live | High, the core loop | Mid-page, below the AI essay |
| AI itinerary generation | Drafts a plan from trip context | Organizer, early | Setup → Planning | Once or twice per trip | Button inside Itinerary |
| AI travel suggestions | Prose ideas for getting there and around | Everyone | Setup → Planning | Read once, then noise | **Header card, unbounded** |
| Ask AI (Q&A) | Free-text questions about the trip | Everyone | Any phase | Occasional, bursty | Bottom of the page |
| Polls | Group decides between options | Everyone | Planning, some Live | Bursty, deadline-shaped | Mid-page, form expanded |
| Expenses | Log shared costs | Everyone | Live → Wrap | High during the trip | Low on the page |
| Settle up (balances) | Who owes whom | Everyone | Wrap, mostly | The reason people return after | Inside Expenses, below the form |
| Members & invites | Who is coming, invite link, roles | Organizer writes, all read | Setup, then rarely | Spike at setup | Mid-page |
| Presence | Who is looking at this right now | Everyone | While co-planning | Ambient | Header chip, emails |
| Live location | Where everyone is, opt-in, 5-min TTL | Everyone | **Live phase only** | Intense for 2 days | Mid-page, always rendered |
| Push notifications | Device registration | Everyone | Setup, once | Once | Toggle in the title row |
| Language switcher (spec 003) | EN / PT / ES, IP-detected | Everyone | Any phase | Rare, set once | Global, outside the trip page |
| Activity log | Server-side record of trip changes | Everyone | Every return visit | — | **Not in the UI at all** |

### 4.2 Next 2–3 weeks (from [product/roadmap.md](../product/roadmap.md))

These are not built. The architecture must have an obvious, already-shaped home for each, so shipping them is "fill the slot", not "find somewhere to put it".

| # | Feature | What it will do | Phase it serves | Slot it needs |
|---|---|---|---|---|
| R2 | **Expense settlement** | Who owes whom, mark as settled | Wrap | **Money**, balance-first, above the ledger. The server already computes `settlements` |
| R3 | **Transport updates** | Live delays and disruption for the group's legs | Countdown + Live | **Alert strip** on Overview + inline badge on the affected itinerary item |
| R4 | **Notification triggers** | Which events push (new poll, itinerary change, invite) | All | **Activity feed** on Overview as the in-app twin of each push, plus one preferences surface |
| R5 | Quality fixes (indexes, Redis URL) | — | — | No UI |

Reserved but **not** in this scope — slots exist, they render nothing until specced: group chat, packing checklist, bookings/documents, photos & recap.

**Interaction with spec 002 (hosted event pilot).** That spec is still draft. If a hosted event turns out to need its own top-level surface inside a trip, it has to argue for a fifth destination against §7.2 — or, more likely, land as content inside Overview and Plan. Flagged here so the two specs do not quietly contradict each other. **TBD** until 002 is approved.

## 5. The organising idea: a trip has a lifecycle

This is the spine of the whole proposal. A trip is not a static document, it is an **object that moves through phases**, and the same feature is essential in one phase and clutter in another.

| Phase | Trigger | The group's job | What must be loudest |
|---|---|---|---|
| **Setup** | Created, and (no itinerary items **or** < 2 active members) | Get people in, get a skeleton | Invite, cover, AI starter plan, Stay |
| **Planning** | Has a plan or a group, and > 7 days to start | Decide together | Itinerary, polls, ideas, estimated cost |
| **Countdown** | 7 days → start | Remove uncertainty | Final plan, day 1 logistics, transport status, who's confirmed |
| **Live** | start 00:00 → end 23:59 (viewer's timezone) | Coordinate *now* | Today's stops, next stop, where everyone is, add an expense fast |
| **Wrap** | After end | Settle and remember | Balances and settle up, trip summary |

```
Setup ──▶ Planning ──▶ Countdown ──▶ Live ──▶ Wrap
  │           │            │           │        │
invite     decide      confirm     coordinate  settle
```

**The design rule that falls out of this:** navigation stays still, content adapts. Users must never hunt for a tab that moved — but what greets them *inside* the default tab should be the thing their trip needs today. Stable chrome, adaptive content.

## 6. Benchmark

What we are stealing, and from whom. Each row is a structural pattern we can point at during wireframing.

| Product | The pattern | What we take |
|---|---|---|
| **Wanderlog** | Closest direct competitor. Trip = tabs (Itinerary / Budget / Places / Map), itinerary grouped by day, map alongside rather than below | Day-grouped itinerary; map as a companion mode, never a stacked section |
| **TripIt** | Chronological master itinerary; **alerts are a separate, loud channel** from plans | Transport disruption (R3) is an alert strip, not a row in a list |
| **Splitwise** | **Balance-first, not ledger-first.** "You owe Ana €42" is the screen; transactions are secondary. Settle up is the primary action | The entire shape of our Money destination (R2) |
| **Airbnb Trips / Google Travel** | Collection split into Upcoming vs Past; day-of surfaces the current reservation | Trips list grouping; the Live-phase "today" card |
| **Partiful / Luma** | An event is one emotional object: cover, title, who's coming, one primary action. Low-effort, high-affect | Trip header as a *thing*, not a form summary; guest list as social proof |
| **Notion** | Cover + page + blocks; create first, decorate later | Already adopted in spec 001; keep the same restraint |
| **Slack / Linear** | **Unreads and "assigned to me" are the organising principle for returning users** | The needs-me badge layer (§7.6) — the single biggest fix for A7 |
| **Citymapper** | Time-critical info gets its own urgent, glanceable treatment | Live-phase Overview is a *now* screen, not a summary |
| **Monzo / Revolut trips** | Spending auto-grouped per trip with a running total | Money shows a trip total, not just a list |
| **WhatsApp group** | The real incumbent. Chronological, zero structure, everyone already there | What we must beat: our advantage is *state* (the plan, the balance) vs their *stream*. Never try to out-chat it in v1 |

**Deliberately not copied:** Wanderlog's density (we have a fraction of the features and would look empty), TripIt's business-travel formality, and any pattern that needs more than five top-level destinations.

## 7. Proposed architecture

### 7.1 Object model

Three levels, and nothing else:

```
Account
└── Trips (collection)        → /trips
    └── Trip (object)         → /trips/:groupId
        ├── Overview          → /trips/:groupId
        ├── Plan              → /trips/:groupId/plan
        ├── Money             → /trips/:groupId/money
        └── Group             → /trips/:groupId/group
```

Everything a trip contains belongs to exactly one of those four. If something does not fit, we have either mis-scoped the feature or we need a fifth destination — and a fifth destination needs its own argument.

### 7.2 Navigation model

| Surface | Mobile (≤768px) | Desktop (≥1024px) |
|---|---|---|
| App shell | Sticky header: product mark, activity bell, account | Same, plus the trip name in a breadcrumb |
| Trip chrome | Cover + title + dates + presence avatars — **persistent across all four destinations** | Same, wider |
| Destinations | **Bottom tab bar**, 4 items, safe-area aware | Segmented tabs directly under the trip header, within the existing 1100px container |
| Map | Full-screen **mode**, entered and dismissed, never a tab | Side panel next to Plan, or full-screen |
| Assistant | FAB → bottom sheet | Right-hand panel or ⌘K |

Four destinations is the deliberate ceiling: five-plus bottom-bar items stop being glanceable, and we would be padding the nav with things that are really content.

### 7.3 The four destinations

**Overview — "what does this trip need from me today?"**
The only adaptive destination (§7.4). Everything on it is a *summary that links elsewhere*; no feature lives exclusively here. Always contains: key facts (route, dates, Stay), "since you were away" from the activity log (A10), and the phase-appropriate primary action.

**Plan — "what are we doing?"**
Itinerary grouped by day with a Today/Next marker during Live. Decisions (polls) live here, because a poll is nearly always a question *about the plan* — "where do we eat on day 2". Trip ideas (the former AI essay) sit here as a collapsed, chunked card, not as prose dumped in the header (fixes A3). Primary action: add a stop. Map button opens the map mode.

**Money — "what do I owe?"**
Balance-first, Splitwise-shaped: *my* position at the top, settle-up as the primary action (the home for R2), trip total, then the ledger. The add-expense form collapses behind a button (fixes A4) — except in the Live phase, where fast capture is the whole point and it stays one tap from the top.

**Group — "who is coming?"**
Members with status, role and presence; the invite flow and link in one place; notification preferences for this trip (R4). Reserved slot for chat. Identity gets upgraded here: avatars and display names instead of raw emails (fixes A9).

### 7.4 Phase-adaptive Overview

Same four tabs in every phase. Overview's *stack order* changes:

| Phase | Overview, top to bottom |
|---|---|
| **Setup** | Invite the group (primary) · add a cover · set your Stay · generate a starter plan · facts |
| **Planning** | Open decisions needing your vote · plan progress (n stops, m days covered) · since you were away · ideas · facts |
| **Countdown** | Countdown ribbon · day-1 logistics · transport status *(R3 slot)* · who hasn't confirmed · packing *(reserved)* |
| **Live** | **Now/Next stop** · where everyone is (map entry) · add an expense · today's remaining stops · alerts *(R3 slot)* |
| **Wrap** | Your balance and settle up *(R2)* · trip summary · expenses recap · recap/photos *(reserved)* |

Phase is a pure function of `startDate`, `endDate`, itinerary length and member count — deterministic, unit-testable, no server change.

### 7.5 One assistant, not three AI surfaces

Fixes A8. AI itinerary generation, trip ideas and Q&A collapse into a single **Trip assistant**, reachable from every destination, with one consistent contract: *it drafts, the group decides*. Anything it produces arrives as a proposal the group can accept into the plan or dismiss — which is principle 4 in [CLAUDE.md](../../CLAUDE.md), finally expressed in the UI. The existing accuracy disclaimer moves onto the assistant itself, once, instead of being repeated beside every list.

### 7.6 The "needs me" layer

Fixes A7, and it is what makes the app worth reopening. A numeric badge per destination, computed from data we already hold:

| Destination | Badge counts |
|---|---|
| Plan | Open polls I have not voted in · itinerary changes since my last visit |
| Money | 1 if I have a non-zero balance |
| Group | Pending invites I sent (organizer only) |
| Overview | Unread activity since my last visit |

Zero means no badge — never a grey "0". Nothing here needs a new endpoint beyond reading the existing activity log.

### 7.7 Parity map — where everything lands

Nothing is removed in this change. Every element of today's page has a destination:

| Today | Becomes |
|---|---|
| Back link | Breadcrumb / back in the trip chrome |
| Cover, title, route, dates | Trip chrome, persistent on all four |
| Presence (emails) | Avatar cluster in the trip chrome |
| Members count | Group badge + facts card |
| Accommodation box | Overview "Stay" card, editable in place; also in Plan logistics |
| AI travel suggestions (essay) | Plan → Ideas, chunked into cards, collapsed |
| Notification toggle | Group → trip notification preferences; first-run prompt on Overview |
| Conflict banner | Inline on the affected itinerary item + a toast |
| Itinerary + AI generate + add stop | Plan |
| Polls | Plan → Decisions; unvoted ones surface on Overview |
| Members, invite form, invite link | Group |
| Live location map | Map mode, entered from Overview (Live) and Plan |
| Expenses, settle up | Money |
| Ask AI (Q&A) | Assistant |
| Language switcher | Unchanged, stays in the app shell |
| Trip list cards | Trips list, grouped Live now / Upcoming / Past |

## 8. Requirements

### 8.1 Functional

| # | Requirement |
|---|---|
| F1 | Trip detail exposes exactly four destinations — Overview, Plan, Money, Group. Labels, order and presence never change by phase, role or screen size |
| F2 | Each destination is its own route; deep links work, back/forward are correct, and a destination URL is shareable to another member |
| F3 | The trip chrome (cover, name, route, dates, presence, overflow menu) persists across all four destinations and does not re-render on switch |
| F4 | Overview's composition is determined by trip phase per §7.4. Phase is derived client-side from trip data in the viewer's timezone |
| F5 | Everything on Overview is a summary that links to its destination. No feature is reachable *only* from Overview |
| F6 | No destination renders a creation form expanded by default. Creation sits behind an explicit affordance. Exception: the expense composer in the Live phase |
| F7 | Each destination has exactly one primary action, visually unambiguous |
| F8 | Needs-me badges per §7.6; zero renders no badge |
| F9 | The live map is a dismissible full-screen mode, not a destination, and not a block stacked in a scroll |
| F10 | One assistant surface owns AI generation, ideas and Q&A, reachable from every destination. Its output is always a draft the group accepts or dismisses |
| F11 | The itinerary is grouped by day, with a Today / Next marker during the Live phase |
| F12 | Money leads with the viewer's own balance and a settle-up action, then the trip total, then the ledger |
| F13 | Group shows members with avatar, display name, role, status and presence; the invite flow and link live only here |
| F14 | Every destination has an empty state that explains the feature in one line and offers its primary action |
| F15 | The trips list groups into Live now / Upcoming / Past, ordered by proximity to today |
| F16 | Overview shows "since you were away" built from the existing activity log |
| F17 | Full parity per §7.7 — no capability is lost in this change |
| F18 | Reserved slots for R2, R3, R4 and chat exist in the layout and render nothing until their feature ships |
| F19 | Organizer-only actions appear only to organizers; the navigation itself is identical for every member |
| F20 | Every new label — the four destination names, phase headings, empty states and badge labels — ships with EN, PT and ES translation keys per spec 003. No hardcoded English strings |

### 8.2 Technical

- **Routing:** nested routes under `/trips/:groupId` with a shared layout and outlet. One trip fetch and one socket connection in a `TripContext` provider — switching destinations must not refetch the trip.
- **Decomposition:** `TripDetail.tsx` (830 lines) splits into `TripLayout` + four destination components. `Polls`, `Expenses`, `LiveLocationMap` and the members list move under their destinations with their behaviour unchanged — this is a move, not a rewrite.
- **Data:** each destination loads on first visit and is then cached in the context; sockets keep it fresh. Badges are computed from context data, no new endpoints.
- **Fix the polling:** the current `setInterval(fetchTrip, 2000)` at `TripDetail.tsx:183` refetches the whole trip every 2s until suggestions arrive. Replaced by a socket event with a single backed-off fallback poll.
- **Phase:** a pure `tripPhase(trip, now)` function with unit tests, including the timezone and end-of-day boundaries.
- **i18n:** new strings go through the existing `react-i18next` setup; the language switcher and IP detection from spec 003 are untouched.
- **State:** scroll position is retained per destination; the active destination survives reload.
- **CSS:** keep the existing token set and dark-mode handling in `index.css`. Retire the misused `.qa-section` / `.comment-item` classes in favour of per-object components.

### 8.3 Non-functional

| # | Requirement |
|---|---|
| N1 | Mobile first: bottom tab bar ≤768px with safe-area insets; segmented tabs ≥1024px. Both drive the same routes |
| N2 | Tap targets ≥44px; the tab bar is reachable one-handed |
| N3 | Switching to an already-loaded destination is instant — no spinner. First load shows skeletons, never a blank column |
| N4 | No layout shift when badges, covers or presence resolve |
| N5 | Nav is a landmark with `aria-current`; a destination change moves focus to its heading and is announced |
| N6 | Keyboard: switch destinations without a pointer; `Esc` closes the map mode and the assistant |
| N7 | ≥4.5:1 contrast in light and dark; honours `prefers-reduced-motion` and `prefers-color-scheme` |
| N8 | Dates, times and currency in the viewer's locale and timezone |
| N9 | One voice: sentence case, plain language, no feature jargon in nav labels. Nav labels must stay short in PT and ES as well as EN |
| N10 | p75 LCP on trip detail must not regress against today's baseline, and the route split must not add a round trip to first paint |

## 9. Acceptance criteria

**Navigation**
1. Given a trip, when I open it, then I land on Overview and see exactly four destinations in a fixed order.
2. Given I am on Money, when I reload, then I am still on Money.
3. Given I open Plan then Money, when I press back, then I return to Plan with its scroll position intact.
4. Given I copy the URL while on Group and send it to another member, when they open it, then they land on Group of the same trip.
5. Given I am on any destination, when the trip phase changes, then the four destinations are unchanged in label, order and number.

**Overview and phase**
6. Given a trip starting in 30 days with no itinerary and one member, when I open Overview, then the primary action is to invite the group.
7. Given a trip starting in 3 days, when I open Overview, then a countdown and day-1 logistics are above the fold, and the transport-status slot is present.
8. Given today is between the start and end dates, when I open Overview, then the first block is the now/next stop and "where everyone is" is one tap away.
9. Given the trip ended yesterday and I owe money, when I open Overview, then my balance and settle up are the first block.
10. Given a feature appears on Overview, when I tap its block, then I arrive at the destination that owns it.

**Plan**
11. Given an itinerary spanning three days, when I open Plan, then stops are grouped under day headings in chronological order.
12. Given it is day 2 of the trip, when I open Plan, then today's group is marked and scrolled to.
13. Given an open poll, when I open Plan, then it appears under Decisions, and the create-poll form is collapsed until I ask for it.
14. Given AI travel suggestions exist, when I open the trip, then they do **not** appear in the trip header, and are reachable as a collapsed Ideas card in Plan.

**Money**
15. Given expenses exist and I owe €42, when I open Money, then "you owe €42" is the first thing I see, above the expense list.
16. Given I owe nothing and am owed nothing, when I open Money, then it says I am settled up, with no red state.
17. Given the Live phase, when I open Money, then adding an expense takes one tap from the top of the screen.

**Group**
18. Given I am the organizer, when I open Group, then I can invite by email and copy the invite link without leaving the destination.
19. Given I am not the organizer, when I open Group, then I see the member list and no remove controls, and the nav looks identical to the organizer's.

**Signals**
20. Given an open poll I have not voted in, when I am anywhere in the trip, then Plan carries a badge of 1, which clears once I vote.
21. Given no items need me anywhere, then no destination shows a badge — not a zero.
22. Given changes happened since my last visit, when I open Overview, then "since you were away" lists them from the activity log.

**Parity and resilience**
23. Given every capability listed in §7.7, when I use the redesigned app, then each one is reachable — nothing is lost.
24. Given a destination's data fails to load, then that destination shows an inline error with a retry, and the other three still work.
25. Given a brand-new trip, when I open it, then I see **one** purposeful empty state with a clear next action, not five competing empty sections.

**Accessibility and language**
26. Given keyboard-only use, when I move between destinations, then focus lands on the destination heading and `aria-current` tracks the active tab.
27. Given a screen reader, when I switch destination, then the change is announced and the trip chrome is not re-read.
28. Given `prefers-reduced-motion: reduce`, then destination transitions are instant with no slide animation.
29. Given my language is PT or ES, when I open any destination, then every label, empty state and badge is translated and the tab labels still fit on one line.

## 10. Validate the structure before we build it

An IA mistake found on paper is cheap; the same mistake found after the routes, the three languages and the shared links exist is not. So the four names get tested before anyone builds them.

### 10.1 The tree test

**The instrument:** <https://claude.ai/artifact/KUoaJHuF5sdsyY8SHp4EUU>

Labels only — no screens, no wireframes, no working app. That is the point: it tests whether the words carry, independently of how good the design is. Participants drill down through the menu to where they *would* expect each thing to live, and confirm. Six tasks, randomised per participant, about four minutes.

| | |
|---|---|
| **Participants** | 5–8 people who have taken a group trip. Five is enough to expose a broken label; past eight you are buying precision you will not use |
| **Tasks** | settle up after the trip · change the hotel · vote on dinner · invite your brother · see where Ana is right now · check what changed since yesterday |
| **Measured** | first click, final answer, whether they backtracked, "I'm not sure" |
| **Pass bar** | **≥80% first-choice success per task** |
| **Results** | Append `#results` to the link. Live, no export step |

**How to run it.** Send the link; do not sit with them, and do not explain the tree. Say only "click where you'd expect to find it, there are no wrong answers." Watching over someone's shoulder turns a findability test into a politeness test.

**The first click is the measurement that matters.** It is the choice made before any hunting, which is the choice a real user makes. Someone who clicks Money, then Group, then finds the answer in Plan has told us the label is wrong even though they eventually succeeded.

**What failing means.** A task below 80% means the label or the grouping is wrong, and we change it on the canvas. It does not mean participants failed, and it is not a reason to add a help tooltip. The three most likely failures and what each would tell us:

| If this fails | It probably means |
|---|---|
| *Vote on dinner* → Plan | Polls under Plan is wrong, and Decisions needs to be its own destination — which breaks the four-destination ceiling in §7.2 |
| *Where Ana is* → Plan | The map has no obvious home, which is the weakest part of D2 |
| *Change the hotel* → Overview | "Where you're staying" is being read as a fact to view, not a thing to edit |

### 10.2 One constraint on who can take part

The test stores results, which makes the page organization-internal: **participants must be signed in to the same organization**. Colleagues, in practice.

That is a real limitation and it biases the result in a specific direction — people who work at a travel company read travel words more fluently than the people we are designing for. A label that passes with colleagues has not been proven; a label that **fails** with colleagues is definitely broken. Treat a clean pass as weaker evidence than a failure, and if a result is marginal (say 70–85% on a task that matters), get it in front of someone outside the company before trusting it.

### 10.3 Still to do

- **The tree test has not been run.** The instrument is ready; it needs participants.
- **First-click test** on a static Overview in each of the five phases: does the first click match the phase's intended primary action? The frames in §15 are usable for this as they stand, but the instrument above does not cover it.

## 11. Decisions

> **All eight settled by the product owner on 2026-11-10**, as recommended.

| # | Decision | Outcome |
|---|---|---|
| D1 | Four destinations, named Overview · Plan · Money · Group? | Yes. "Money" beats "Expenses" because it has to hold settlement and later budget. "Group" beats "Members" because chat and notifications land there |
| D2 | Live map: a fifth tab, or a mode? | **Mode.** It is useful for roughly 2 days of a 60-day object; a permanent tab would be dead weight 97% of the time |
| D3 | Q&A: fold into one assistant, or keep as its own section? | **Fold in.** Three AI surfaces is the single most confusing thing in the product today |
| D4 | Phase thresholds — is Countdown 7 days? | 7 days. Short enough to feel imminent, long enough to matter. Live runs start 00:00 → end 23:59 in the viewer's timezone |
| D5 | Is group chat in v1? | **No** — reserve the slot in Group. We cannot out-chat WhatsApp; our advantage is state, not stream |
| D6 | Desktop: left rail or segmented tabs? | **Segmented tabs** under the trip header, inside the existing 1100px container. A rail only earns its place beyond five destinations |
| D7 | One release or incremental? | **Three slices** behind the same routes (§13). A big-bang redesign of an 830-line file with no tests is the riskiest version of this |
| D8 | Does the cover work land first? | **Yes** — and it already has. Covers shipped as spec 001 on 2026-11-06, so this is satisfied |

## 12. Out of scope

- Group chat, packing checklists, bookings and documents, photos and trip recap (slots reserved, specs later)
- Per-day budgets and multi-currency
- Role- or behaviour-personalised navigation (the nav is the same for everyone, deliberately)
- Command palette and power-user shortcuts beyond basic keyboard nav
- Offline support and native apps
- New languages beyond the EN/PT/ES of spec 003
- Any visual redesign beyond what the structure forces — colours, type and spacing stay as they are

## 13. Build order and risk

| Slice | Contents | Risk |
|---|---|---|
| **1** | Shell: routes, trip chrome, four destinations, parity move of existing components, kill the 2s poll | Mostly mechanical; the one to get right. No new features, so it is independently shippable |
| **2** | Phase-adaptive Overview, needs-me badges, activity feed, day-grouped itinerary, trips-list grouping | Where the value is. Needs slice 1 merged |
| **3** | Assistant consolidation, plus the R2/R3/R4 slots filled as those features ship | Can run in parallel with their own specs |

One pull request per slice. Slice 1's PR description lists the §9 criteria verified, because that is the only parity evidence this code has.

**Main risks.** (1) `TripDetail.tsx` has no test coverage, so parity is checked by the §9 criteria and by hand — slice 1 should not change behaviour, only location. (2) Four destinations on a product this young can feel empty; the empty states in F14 are what stop that, so they are not optional polish. (3) Phase logic is a correctness surface — timezones and end-of-day boundaries need unit tests, or someone's trip will be "over" while they are still on it.

## 14. How we will know it worked

| Signal | Target |
|---|---|
| Tree-test findability on the six tasks | ≥80% first-choice success before build |
| Time to first meaningful action on a new trip | Down vs today's baseline |
| Scroll depth needed to reach the itinerary | Zero — it is a destination, not a scroll position |
| Trips using two or more feature areas | Up — the badge layer is the mechanism |
| Poll votes cast within 24h of creation | Up |
| Settle-up completion after a trip ends | Establish a baseline, then up (gated on R2) |
| Return visits during the Live phase | Up |
| Itinerary items added per trip | **Guardrail:** must not fall. If moving the itinerary behind a tab reduces planning, the IA is wrong |
| p75 LCP on trip detail | **Guardrail:** no regression |

## 15. Wireframes

[`wireframes/004-trip-ia-redesign/index.html`](../../wireframes/004-trip-ia-redesign/index.html) — one self-contained page, opens in any browser, no account or tooling needed.

Fifteen annotated artboards in five rows: the trips list and a brand-new trip; Overview in all five phases; Plan and its empty state, Money owing and settled, and Group; the map mode and the assistant; and desktop Overview and Plan. Each frame carries a note naming the requirement or acceptance criterion above that it satisfies.

Greyscale by design — the frames are there to be argued with on structure, not on styling. Solid border means it ships; a dashed border is a reserved slot that renders nothing until R2, R3, R4 or chat lands.

The frames were authored on a Claude Design canvas. Per rule 7 in [docs/README.md](../README.md), the repository copy is the one to build from: `wireframes/004-trip-ia-redesign/artboards/` holds each frame as plain HTML and `canvas.json` holds the layout and annotations, so the canvas can be rebuilt from this repo by any account.

## 16. Handoff to whoever builds this

Everything a builder needs is in this repository. No design tool, no Claude account but their own, nobody from the design stages.

| They need | Where |
|---|---|
| The contract | This spec: §7 architecture, §8 requirements, §9 acceptance criteria, §13 build order |
| The pictures | `wireframes/004-trip-ia-redesign/index.html` |
| Where things move to | §7.7, the parity map |
| What not to do | §12 |

### The prompt

Paste this into Claude Code — or any coding agent — from the repository root.

```text
You are picking up a UX/IA redesign of this app at the build stage. Design is finished;
your job is implementation only.

Read these first, in this order, before you write any code:

  1. docs/specs/004-trip-ia-redesign.md — the whole thing. §7 is the architecture, §8 the
     requirements (F1–F20), §9 the 29 acceptance criteria, §13 the build order.
  2. wireframes/004-trip-ia-redesign/index.html — 15 lo-fi frames. Each one carries an
     annotation naming the requirement or acceptance criterion it satisfies. Read the
     annotations; they explain intent, which the markup alone does not.
  3. docs/README.md and CLAUDE.md — how this repo works and the four product principles.
  4. client/src/pages/TripDetail.tsx — the 830-line page being replaced, and
     client/src/pages/TripPlanner.tsx.

Then build slice 1 from §13, and only slice 1:

  the route shell, the trip chrome, the four destinations, a parity move of every existing
  component into its new address per the parity map in §7.7, and removal of the 2-second
  setInterval poll in favour of the socket events the server already emits.

Rules:

  - Slice 1 changes location, not behaviour. No feature gains or loses capability. The
    acceptance criteria in §9 are the parity check, and TripDetail.tsx has no test
    coverage, so work through them by hand before you call it done.
  - The wireframes are greyscale on purpose. They are structural, not visual. Keep the
    app's existing colours, type and spacing — §12 puts visual redesign out of scope.
  - Every new label needs EN, PT and ES keys (F20). No hardcoded English.
  - A dashed border in a frame is a reserved slot for a feature that has not shipped.
    Render nothing there. Do not stub it, do not fake it.
  - Do not start slices 2 or 3. Do not fold in anything from §12.
  - Where the spec and the wireframes disagree, the spec wins — and tell me, because that
    is a defect in the design, not something for you to resolve quietly.

When you are done, give me: the acceptance criteria you verified and how, the ones you
could not verify and why, and anything in the spec that turned out to be wrong or
impossible once you were in the code.
```

For slice 2, change the slice paragraph and the rules that reference parity; the rest holds.

### The rules of engagement

**Decide freely:** component boundaries, file layout, routing library and URL shapes, state management, how the phase is computed, naming inside the code, test strategy.

**Come back to product first:**

- A destination label that does not work once it is real. The four names are D1, and the tree test in §10 is the mechanism for changing them — not a judgement call in a PR.
- Anything that would make a feature in §7.7 land somewhere other than where the parity map puts it.
- Any reason the two-second poll cannot simply go away.
- Anything that pushes the itinerary back behind a scroll. That is the guardrail in §14: itinerary items added per trip must not fall. If the structure threatens it, the structure is wrong and we change the design, not the metric.

## 17. Open items

| # | Item | Owner |
|---|---|---|
| 1 | ~~Approval gate~~ — approved 2026-11-10, without the tree test, deliberately | Done |
| 2 | Tree test in §10 — instrument is built, needs 5–8 participants. **Run it before slice 2**, which builds on these labels | **TBD** |
| 3 | First-click test on the five Overview phases (§10.3) — not built | **TBD** |
| 4 | Whether spec 002 (hosted event pilot) needs its own surface inside a trip (§4.2) | Blocked on 002 |
