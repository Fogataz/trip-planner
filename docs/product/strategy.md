# Product Strategy

> **Status: draft for review.** Sections marked **TBD** are open questions for the product owner.

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

**TBD:** primary segment (friends, families, work groups) and typical group size.

## Product principles

1. **One source of truth.** The itinerary, polls, expenses and comments live in the same trip.
2. **Real-time by default.** Changes appear for everyone in the trip without a refresh.
3. **Privacy first.** Only active trip members can see a trip. Live location is opt-in and is never stored.
4. **Helpful, not pushy AI.** AI suggestions are drafts that members can edit or reject. They should be based on the trip's real accommodation and dates.

## Strategic pillars

| Pillar | Goal | Current state |
|---|---|---|
| Collaborative planning | Members build and edit the itinerary together | Itinerary, comments and presence are in place |
| Group decisions | Members decide quickly and fairly | Polls are in place |
| Shared money | Costs are visible and easy to settle | Expenses are in place. Settlement (who owes whom) is **TBD** |
| Live coordination | Members see where others are during the trip | Opt-in live location is in place |
| Smart suggestions | AI helps draft itineraries and travel ideas | AI itinerary and travel suggestions are in place |
| Transport awareness | Members are alerted to delays and changes | **Not started.** See [roadmap.md](roadmap.md) |

## Success metrics

**TBD.** Candidate metrics for discussion:

- Trips with at least three active members
- Share of trips that use polls or expenses
- Itinerary items added per trip
- Invitation acceptance rate

## Key risks

- **Trust in AI output.** Suggestions can be wrong. Mitigation: they are drafts, and they must be reviewed by members.
- **Privacy of location data.** Mitigation: opt-in only, in-memory only, and visible only to active members.
- **Scope creep.** Mitigation: work through the roadmap in phases.

## Out of scope for now

- Booking flights, hotels or transport inside the app
- Payments between members
- A native mobile app (the web client comes first)

**TBD:** confirm this list.
