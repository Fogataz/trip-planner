# Product Strategy

> **Status: draft for review.** Sections marked **TBD** are open questions for the product owner. They are not blockers (D27).
>
> This page holds the stable parts: vision, problem and principles. Current bets, audience hypotheses, revenue models and the next two weeks live in the [working doc](working-doc.md).

## Vision

A shared place where a group can plan a trip together in real time: agree on the itinerary, split costs, decide by vote, and see where everyone is, without juggling chat threads and spreadsheets.

## Problem

Group trips break down in predictable ways:

- Plans live in scattered chats, so people miss decisions.
- Decisions are slow, with no simple way to vote.
- Shared costs are tracked by hand and are often disputed later.
- Once travel starts, the group has little visibility of where each other is or how transport is running.

## Target users

- **Trip organizer:** creates the trip, invites people, and keeps the plan moving.
- **Trip member:** joins through an invitation, contributes ideas, votes and tracks their own expenses.

**Primary segment (D33, 2026-11-10):** premium hosts: leaders of small-group retreats, workshops and expeditions, who pay us, and their travellers, who never do. Team offsites stay as a reference and benchmark (the pilot event). Friends and family use the app free. **TBD:** typical group size (working assumption: 8–15 travellers). See [venture-analysis.md](venture-analysis.md). See the [working doc](working-doc.md) and [brand foundations](../brand/brand-foundations.md), section 1.2. Hosted trips add a third role, the host or co-host (spec 002).

## Product principles

1. **One source of truth.** The itinerary, polls, expenses and comments live in the same trip.
2. **Real-time by default.** Changes appear for everyone in the trip without a refresh.
3. **Privacy first.** Only active trip members can see a trip. Live location is opt-in and is never stored.
4. **Helpful, not pushy AI.** AI suggestions are drafts that members can edit or reject. They should be based on the trip's real accommodation and dates.

## Strategic pillars

**Retired 2026-11-11 (trk-D3)**, because they predate **D33 premium hosts lead**. The live taxonomy is the layers in [working-doc.md](working-doc.md) §2 (Core, Host, Money, Public, Content) plus the revenue models in §3 by name. An initiative cites a Layer and the revenue-model claim it validates ([tracker.md](../process/tracker.md), "Writing an initiative"). The six pillars are in git history; the table was removed on 2026-11-13, since a retired table in a living document is read as current.

## Success metrics

Each bet carries its own: the **key result** of every initiative and the **gate criteria** of each milestone (M0 · Pilot retro, M1 · Phase 1 gate, M2 · Phase 2 gate) in [tracker.md](../process/tracker.md). What they taught us goes in [learnings.md](learnings.md). There is no separate product-wide metric yet, on purpose: with no paying host, a usage metric would measure the friends-and-family app rather than the bet.

## Key risks

- **Trust in AI output.** Suggestions can be wrong. Mitigation: they are drafts, and they must be reviewed by members.
- **Privacy of location data.** Mitigation: opt-in only, in-memory only, and visible only to active members.
- **Scope creep.** Mitigation: work through the roadmap in phases.

## Out of scope for now

- A native mobile app (the web client comes first)

**Update 2026-11-09:** payments and booking are no longer out of scope. Current product thinking (revenue models, shared foundation, the eDreams gathering test) lives in [working-doc.md](working-doc.md), with background in [discovery-amf-pmf.md](discovery-amf-pmf.md) and [revenue-models-analysis.md](revenue-models-analysis.md).
