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
- Issue bodies link to the spec and **summarise** what done looks like: one plain line per outcome, each with the acceptance criteria it covers, stamped with the spec version it was read from. They never copy the spec's text, and the spec wins if they differ (trk-D7).

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

## Writing an initiative

Written by the `/initiative` command (`.claude/commands/initiative.md`), which follows this section.

An initiative is a one-to-three-month bet. It is the most expensive commitment we make and, until
2026-11-11, it carried the least written thinking: one sentence of outcome and a list of epics. The
cost of *building* fell when Claude Code arrived, so the cost of building the wrong thing is now the
larger risk, and the cheapest thing to throw away is a page of text.

**Where it lives.** One file per initiative, `docs/product/initiatives/I<n>-<slug>.md`, linked from
the GitHub issue. The issue body keeps the outcome, the key result, the fields and the link; the file
holds the long form. A product session cannot write to a GitHub issue (ww-D8) and the repo is the
only thing that syncs between accounts (D26), so the thinking has to live in a file. It is living
while the initiative is open and frozen when it closes, like a spec.

### Rules

| Rule | Why |
|---|---|
| **The press release is under one page**, future-dated, and written in the host's or traveller's words — not ours | Amazon's own rule for the format we are borrowing: a few paragraphs, always less than a page. If it needs two pages it is two initiatives. If it is boring, the initiative is boring, and that is cheap to find out on paper |
| **A sceptic's FAQ of five to seven questions**, one of which is the kill condition | The format exists to kill ideas before code. Most PR/FAQs at Amazon never launch, and that is the point |
| **The strategy block is six lines, not six paragraphs**, and every line is read back by a command | A field nobody reads back is decoration. See the table below: each line names the command that reads it |
| **No customer-facing FAQ, and no impact score** | The customer FAQ is written for a launch audience we do not have until public pages exist. An impact number invented by two people is worse than no number: the key result carries the target, and "next bottleneck" carries the magnitude honestly |
| **Owner questions are listed, never answered** | D27: each carries a recommendation that is the working default |
| **Size: one to three months.** Bigger is a strategy change | A strategy change is the owner's call at a milestone ([pipeline.md](pipeline.md) §6.3), not an initiative |
| **Written before its epics** | An initiative whose epics are already written is a summary, not a bet |

### The strategy block

Six lines that keep the work pointed at the bet in [working-doc.md](../product/working-doc.md) §2
and stop it drifting. The right-hand column is the rule that keeps them honest: a line goes in only
because something reads it back.

| Line | What it says | Read back by |
|---|---|---|
| **Layer** | Core, Host, Money, Public or Content (working-doc §2) | `/roadmap`, `/milestone` |
| **Validates** | The revenue model by name (name-D2) and the **one claim** we are testing — "host tool: a host will pay before payments exist", not just "host tool" | `/milestone`, against the measure |
| **Unblocks** | What becomes possible once this lands, and what stays blocked until it does | `/roadmap`, for ordering |
| **Next bottleneck** | If this works perfectly, the next thing that stops us | `/roadmap`. This is the honest version of "magnitude": it says what the win is worth without inventing a number |
| **Instead of** | What we are not doing this quarter because we chose this | `/roadmap`. Drift is rarely building something off-strategy; it is starting five things and finishing no bet |
| **Kill condition** | What we would see that makes us stop, and by when | `/roadmap` every week, `/milestone` at the gate. Without it, the only stop-early mechanism is a gate three months wide |

**Note on strategic pillars.** The pillars in [strategy.md](../product/strategy.md) describe the
product's capability areas and predate D33 premium hosts lead, so an initiative that cited one would
record the old shape of the business rather than the current bet. Layer plus the revenue-model claim
are the live anchors. Realigning `strategy.md` is the product owner's (trk-D3).

### Initiative file template

```markdown
# I<n> <outcome in plain words>

Status: open | closed   ·   Issue: [#<n>](link)   ·   Opened: YYYY-MM-DD   ·   Closes: M<n>

**Outcome:** <one sentence: what changes for whom>
**Key result:** <measure and target> by <date>

## Strategy

- **Layer:** Core | Host | Money | Public | Content
- **Validates:** <model by name> — <the one claim>
- **Unblocks:** <what becomes possible> · Blocked until then: <what waits>
- **Next bottleneck:** <if this works, what stops us next>
- **Instead of:** <what we are not doing this quarter>
- **Kill condition:** <what we would see> by <date>

## Press release

<Dated in the future. Under one page. A headline a host would read, a subhead naming who it
is for, then: the problem in their words, what they can now do, one quote from a host, one
from us, and how to get started. No internal language, no feature list.>

## Sceptic's FAQ

Five to seven. Always these four, plus what this initiative makes someone ask:

1. **Who pays, and how much?**
2. **Why now, and why us?**
3. **What are we deliberately not building here?**
4. **What is the riskiest assumption, and what is the cheapest test of it?**

## Epics and spikes

| # | Epic or spike (outcome) | Horizon | Brief |
|---|---|---|---|

## Open questions for the owner (with recommendation)
```

**Where the format comes from.** The press release and FAQ pair is Amazon's "working backwards",
popularised by Colin Bryar and Bill Carr. Amazon's own account of it: the press release is always
less than one page, the FAQ five pages or less, teams write ten or more drafts, and most PR/FAQs are
abandoned on paper — which is the saving.
[Amazon on its own process](https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes).
We take the press release, trim the FAQ to the sceptic's half, and drop the rest (trk-D1).

## Writing an epic

Epics are written by the `/epic` command (`.claude/commands/epic.md`), which follows this section.

### Rules

| Rule | Why |
|---|---|
| **The title is an outcome**: what changes for a host or traveller, in plain words. "Hosts start a new departure from a past one in minutes", not "Templates". Once a spec exists, prefix its number: `[009] Hosts start…` | Roadmaps work best when they name problems and outcomes, not features [E3][E4]. The title survives if the solution changes. |
| **Every epic carries a hypothesis and a measure** | An epic is a bet. A testable hypothesis plus early (leading) indicators lets us stop or continue before all the work is spent [E1][E2]. |
| **3–6 main user stories, from named personas (personas in [epic-briefs.md](../product/epic-briefs.md) §2)** | Enough to show the shape of the work. Stories become sub-issues only after the spec is approved, from its build order (tracker.md). |
| **Before a spec:** the issue body is the full brief. **After a spec:** the body keeps outcome, hypothesis, measures and stories, adds **What done looks like** — four to eight plain lines, each ending with the acceptance criteria it covers — and links the spec for the detail | Opening an epic should tell a person what good looks like without opening the spec. A summary in plain words with AC numbers does that; a copy of the criteria would go stale the first time the spec is amended. The stamp says which version was summarised, and `/epic check` flags it once the spec has moved on (trk-D7). |
| **Wireframes are a link, not a task** | Frames are made at stage 3, before the gate, and the board already shows that work as Spec draft. A task would be a second record of whether they are done, and a product session cannot create issues (ww-D8). The epic links the set; each story names the frames it builds (trk-D6). |
| **Principles check in every brief** | CLAUDE.md asks us to flag conflicts early. |
| **Owner questions are listed, never answered** | D27: each has a recommendation that is the working default. |
| **The leading measure names an analytics event**, not a description of one | ways-of-working §1 check 7 is the check that gets skipped, and L6 measurability asks the same thing at spec time. "Hosts reuse a departure" cannot be read; `departure_duplicated` can (trk-D2). |
| **Every epic carries a stop condition with a date** | An epic is a bet, and a bet with no exit is a feature list that cannot be cancelled. The initiative's kill condition covers the bet; this covers the epic (trk-D2). |
| **Name the payer** | The [premium buyer lens](../product/premium-buyer-lens.md) says travellers never pay. An epic that serves only travellers has to say what it buys us (trk-D2). |
| **Size:** 2–8 weeks. Bigger means two epics | tracker.md level 2. |

### Issue body template

```markdown
**Outcome:** <one sentence: what changes for whom>
**Initiative:** I<n> <name> (#<issue>) · **Horizon:** Now | Next | Later · **Milestone:** M0 | M1 | M2
**Models:** <by name, e.g. host tool> · **Layer:** Core | Host | Money | Public | Content
**Payer:** host | organisation | nobody — <if nobody, what it buys us>
**Spec:** none yet (next step: /feature benchmark) | [NNN](link)
**Wireframes:** none | [wireframes/NNN-slug](link) — F1–F<n>

### Problem
<2–3 sentences, with the evidence and a link>

### Hypothesis
We believe <capability> for <persona> will <outcome>.
We'll know when <measure and target>.

### What done looks like
<!-- After a spec only. Four to eight lines a person can check at a glance, in plain
     words, each ending with the acceptance criteria it covers. Not the Given/When/Then,
     not the edge cases, not the thresholds — those stay in the spec. -->
- <what a host or traveller can now do, or what can no longer go wrong> (AC 1, 4)
- …

<sub>Summarised from spec NNN at `<short commit>`, YYYY-MM-DD. The spec wins if they differ.</sub>

### Measures
- Leading (during build or the first departure): `<analytics_event_name>` — <how it is counted>.
  Name the event, not a description of it. If no event exists, adding it is a build-order row.
- Lagging (by the milestone): …

### Stop if
<what we would see that means we stop this epic> by <date>.

### Main user stories
- As a <persona>, I want <goal>, so that <reason>. → #<sub-issue, once the spec is approved>

### Scope
- In: …
- Not in: …

### Depends on
### Principles check
### Open questions for the owner (with recommendation)
### Done when
Spec shipped and docs updated (docs/README.md "When a spec ships"), no follow-up from review left open, and the measure checked at the milestone.
```

### Writing a story

After the gate, `/epic` creates **one sub-issue per row of the spec's build order**. The build order
already names, per row, the acceptance criteria it satisfies and the frames it builds
([docs/README.md](../README.md), "How to write a spec"), so a story is assembled, not invented.

| Rule | Why |
|---|---|
| **Story** if a person can see the change; **Task** if it only enables one (a migration, a capability table). Bug and Spike as usual | A Task with no user sentence is honest; a fake "As a developer…" story is not |
| The title is an outcome where it can be, prefixed with the spec number | Same as an epic |
| **Done when** lists the row's acceptance criteria as plain one-liners with their numbers, stamped like the epic | The builder and the reviewer check the same numbers; the reader gets the sense without opening the spec |
| **Not in this story** names what a reader might expect here and where it lives instead | Most review disputes are about scope, not quality |

```markdown
**Epic:** #<n> · **Spec:** [NNN, build order row <k>](link) · **Frames:** F6, F7 | none
As a <persona>, I want <goal>, so that <reason>.
<!-- A Task replaces the sentence with one line: what it unblocks. -->

### Done when
- <the outcome in plain words> (AC 8)
- <…> (AC 11)

<sub>Summarised from spec NNN at `<short commit>`, YYYY-MM-DD. The spec wins if they differ.</sub>

### Not in this story
- <what someone might expect here> — in #<n>
```

**When the spec moves.** An approved spec gets amendments while it is built (spec 011 §17 is the
example). `/epic check` compares each stamp with the last commit that touched the spec and flags every
summary older than it. The fix is to re-summarise from the spec, never to edit the spec to match.

## Follow-ups from review

A follow-up is a real finding from a review that is outside the pull request's scope
([ways-of-working.md](ways-of-working.md) §3.1, ww-D17). It is filed before the merge, so it cannot
be forgotten after it.

- **Type and label:** Task or Bug, label `follow-up`.
- **Parent:** the epic the pull request belongs to. If there is none, or it is closed, I3 · What we have built works as documented.
- **Body:** what is wrong in a user's terms, the pull request and the file and line it came from, and the review tier it was given.
- **An epic does not move to Shipped with an open follow-up**, unless each one is moved under I3 with a reason on the issue. `/epic check` reports it.
- **Cadence:** the oldest one joins every sprint; eight or more open stops new epics; one older than four weeks is decided at the Friday retro ([ways-of-working.md](ways-of-working.md) §5).
- No `TODO` comment in code stands in for one. The issue is the record.

## Views

| View | Shows |
|---|---|
| Backlog | open items with no sprint, sliced by Layer, hierarchy on |
| Sprint board | the current sprint, columns by Status |
| Roadmap | initiatives and epics across Start → Target date |
| Initiatives | top-level bets, expandable to their children |
| Follow-ups | open issues labelled `follow-up`, oldest first, with their parent epic |

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

### The link runs both ways (trk-D5)

The epic links the spec — that is the rule above, and it has always worked. **Nothing pointed back**, so an approved spec could sit with no epic anywhere and nobody would see it. That is the failure this closes: not a broken link, but **approved work nobody scheduled**. It was live on 2026-11-12, when specs [011](../specs/011-roles-and-permissions.md) and [012](../specs/012-joining-naming-and-the-first-trip.md) were approved with their work scattered across spec 002's epics and no record of where.

| Direction | Where it lives | Why there |
|---|---|---|
| **Epic → spec** | The issue body. Links, and summarises what done looks like with AC numbers (trk-D7). | Already the rule. When the two disagree, the spec wins. |
| **Spec → epic** | The spec's **Build status** section, and nowhere else | A spec is point-in-time; an epic gets re-cut, merged and renamed. Putting epic links in the body would make a frozen document depend on a mutable board. Build status is the one section whose job is to track reality, so it is the only place that may go stale and be corrected. |
| **Epic → wireframes** | The issue body's `Wireframes:` line, beside the spec link; each story names its frames | Frames live in `wireframes/`, not in the spec. A builder who misses them builds blind. |
| **Wireframe → code** | The set's README, "Build status": which frames are built, in review or untouched, with the pull request | A drawn frame says nothing about whether it is built. The pull request that builds a frame updates its line (trk-D6) |

Rules:

- **An approved spec names its epics in Build status**, or says in one line why it has none — "its work lands inside the spec 002 epics it corrects" is a valid answer, and is what spec 012 says.
- **A spec that reaches `approved` with no epic and no such line is the thing to catch.** `/epic check` reports it, next to the drift it already reports.
- **An epic links the wireframes it is built from**, when the spec has any, and each story names its frames (trk-D6).
- A spec at `draft` needs none of this. The link appears at the gate, not before.

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

## Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| trk-D1 | Does an initiative carry a press release, and how much of Amazon's PR/FAQ do we take? | Product owner | **Decided 2026-11-11:** the one-page press release and a sceptic's FAQ of five to seven questions. Options were: nothing (today's one-line outcome); the full PR/FAQ including a customer FAQ and five pages; or the press release plus the sceptic's half. Taken: the third. The customer FAQ waits for public pages, and the epic template already carries the structured version of the rest |
| trk-D2 | The three additions to the epic template: a named analytics event, a stop condition, and the payer | Engineering | **Decided 2026-11-11.** Each closes a check that already exists somewhere and is skipped: ways-of-working §1 check 7, the bet-with-no-exit problem, and the premium buyer lens |
| trk-D3 | The strategic pillars in `strategy.md` predate D33 premium hosts lead. Realign them, retire them, or leave them | Product owner | **Decided 2026-11-11: retire them**, on the owner's instruction to take engineering's recommendation. Options were: rewrite the pillars around the layers in working-doc §2 (keeps one taxonomy, but duplicates §2); leave them (they would keep describing the old shape of the business); retire them into history, as name-D4 did for the roadmap phases (taken). The table stays in [strategy.md](../product/strategy.md) marked retired and pointing at working-doc §2, so nothing is lost. **Layer and the revenue-model claim are the live anchors**. **Amended 2026-11-13:** the table itself moved to git history, leaving the pointer, because a retired table in a living document is read as current |
| trk-D4 | Where an initiative's long form lives | Engineering | **Decided 2026-11-11:** `docs/product/initiatives/I<n>-<slug>.md`, linked from the issue. A product session cannot write an issue body (ww-D8) and the repo is the only thing that syncs (D26) |
| trk-D5 · Spec names its epics | Does the spec → epic link exist, or only epic → spec? | Engineering | **Decided 2026-11-12: it exists, in Build status only.** The gap: an approved spec could sit with no epic anywhere and nothing would show it — approved work nobody scheduled. Live the same day, when specs 011 and 012 were approved with their work scattered across spec 002's epics and no record of where. Options were: leave it one-way (rejected — the board is the only place you would notice, and only if you went looking); link epics from the spec body (rejected — a point-in-time document must not depend on a mutable board); name them in **Build status**, the one section whose job is to track reality (taken). An epic also links its wireframes, because frames live outside the spec and a builder who misses them builds blind |
| trk-D6 · Wireframes are links | Are wireframes linked tasks under the epic, or a link in its body? | Product owner | **Decided 2026-11-13: a link.** The epic carries a `Wireframes:` line, each story names the frames it builds, and the set's README keeps a Build status per frame, updated by the pull request that builds it. Options rejected: a task per set (a second record of what the spec's status already says, and a trip to Claude Code each time, because a product session cannot create issues). **Revisit** when someone other than the spec's author draws frames: then the drawing is separate work, and a Spike under the epic fits |
| trk-D7 · Epics summarise done | How does someone opening an epic see what done and good look like, without the board restating the spec? | Product owner | **Decided 2026-11-13: a plain-words summary with AC numbers, stamped.** After the gate the epic carries **What done looks like** (four to eight lines) and each story a **Done when** list, one line per acceptance criterion with its number. Each summary carries the spec commit it was read from; `/epic check` flags it when the spec has moved since. The build order names each row's criteria and frames, and `scripts/spec-lint.sh` checks that every criterion lands in some row. Options rejected: AC numbers only (unreadable at a glance — the reason for this decision); copy the criteria (stale at the first amendment, and spec 011 had two in its first day of build) |
