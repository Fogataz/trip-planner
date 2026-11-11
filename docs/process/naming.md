# Naming and codes

> **Status: draft for review.** Written 2026-11-11. The rule in §1 and the prefixes in §2 can be used now. The fixes in §3 and the model names in §4 touch several documents, so they are the product owner's call.
>
> Why this exists: a code with no name beside it is unreadable a week later. "Spec 002 approval" and "M0 epic target dates" are both real examples from our own board.

## 1. The rule

**Never write a bare code. The name travels with it.**

| Not this | This |
|---|---|
| D33 | D33 premium hosts lead |
| M0 | M0 pilot retro |
| initiative 6 | I6 repeat departures |
| spec 004 | spec 004 trip IA |
| Models: C1, H | Models: host tool, operator app |
| L13 | L13 scale |

**Fix it where the string is made, not where it is read.** A GitHub milestone titled `M0` makes every notification say "M0" forever. Title the object itself:

| Object | Title it |
|---|---|
| Milestone | `M0 Pilot retro — 27 Nov 2026` |
| Initiative | `I6 Premium hosts run a repeat departure without our help` |
| Epic | `[009] Hosts start a new departure from a past one` (already the rule) |
| Spec file | `004-trip-ia-redesign.md` (already the rule) |

## 2. One prefix per kind

| Kind | Code | Example | Name of record lives in |
|---|---|---|---|
| Decision, global | `D##` | D33 premium hosts lead | working-doc §7 and its decision log |
| Decision, inside one doc | `<doc>-D##` | 004-D9, ww-D2, pipe-D1 | that document's own decisions table |
| Milestone | `M#` | M1 Phase 1 gate | tracker.md, "Milestones" |
| Initiative | `I#` | I6 repeat departures | the GitHub issue |
| Epic | `#<issue>` | #37 | the GitHub issue title |
| Spec | `spec ###` and slug | spec 004 trip IA | the specs table in docs/README.md |
| Revenue model | short name (§4) | host tool | working-doc §3 |
| Layer | name | Host | working-doc §2 |
| Horizon | name | Next | tracker.md |
| Design lens | `L#` | L13 scale | [design-lenses.md](design-lenses.md) §2 |
| Early tester | `T#` | T2 | early-testers.md, no contact details |
| Source in a point-in-time doc | `[X#]` | [E1] | that document's Sources section. Document-local |

Three rules: a prefix is never reused for two kinds; a published code is never renumbered; a new kind checks this table before taking a letter.

## 3. Three things to fix

### 3.1 Three decision numbers are used twice

`working-doc.md` §7 lists **D29, D30 and D31 twice each** — once for the pricing rule, the done-with-you tier and the Phase 2 candidates, and again for the spec 004 decisions.

Cause: spec 004 numbered its own decisions D9–D11 in its §18.3, and they were copied into the global log under numbers that were already taken.

Fix: a document's own decisions keep their own namespace, and the global log links to them instead of renumbering. The three spec 004 rows become **004-D9**, **004-D10** and **004-D11**. The original D29, D30 and D31 keep their numbers. Nothing else changes. **Decided 2026-11-11.** Applied to working-doc.md on the same day.

### 3.2 Initiative numbers look like issue numbers

"Initiative 6" and "#6" are different objects, and the repo already has issues and pull requests past #77. Prefix initiatives with `I`, in the docs and in the GitHub title.

### 3.3 A collision introduced on 10 Nov

`ways-of-working.md` used W1–W5, and `W` already means the destination-weddings model (W-a, W-b, W-c in destination-weddings.md). Those five are now **ww-D1 … ww-D5**. `W` stays with weddings.

## 4. Revenue models: letters to names

Ten letters and two sub-splits are unreadable in place. `Models: C1, H (also D, W)` appears in live briefs today, and nobody can read it without a lookup.

| Code | Proposed name | What it is |
|---|---|---|
| A | group trips | friends and family planner |
| B | curator guides | paid guides from curators |
| C1 | host tool | private retreat host tool |
| C2 | host marketplace | wellness-first marketplace |
| D | offsites | team offsites and company events |
| E | group payments | a fee on money collected |
| F | booking commissions | partner commissions, parked |
| G | clubs | clubs and communities |
| H | operator app | client trip app for operators and advisors |
| I | celebration pass | paid pass for weddings, stag and hen |
| W | weddings | destination weddings, a niche of celebration pass |

Proposal: the name becomes the label in anything new, and the letter stays here as an alias so older documents still resolve. The GitHub "Revenue Model" field carries both for one cycle: `host tool (C1)`. **Decided 2026-11-11.**

## 5. The register

One lookup, so a person or a Claude session can resolve any code without hunting. This table points; it never copies.

### Milestones

| Code | Name | Due |
|---|---|---|
| M0 | Pilot retro | 2026-11-27 |
| M1 | Phase 1 gate | 2027-02-26 |
| M2 | Phase 2 gate | 2027-06-30 |

### Initiatives

| Code | Name | Horizon | Milestone |
|---|---|---|---|
| I1 | Run the hosted event pilot | Now | M0 |
| I2 | Learn from the pilot, keep offsites as a benchmark | Now | M0 |
| I3 | What we have built works as documented | Now | — |
| I4 | Travellers hear about delays before they matter | Later | — |
| I5 | Give the product a structure | — | Closed |
| I6 | Premium hosts run a repeat departure without our help | Now | M1 |
| I7 | We know which premium hosts will pay, and for what | Now | M1 |
| I8 | Hosts collect guest money inside the trip | Next | M2 |

### Specs

| Code | Name | Status |
|---|---|---|
| spec 001 | trip covers | shipped |
| spec 002 | hosted event pilot | draft |
| spec 003 | localization EN/ES/PT | shipped |
| spec 004 | trip information architecture | shipped |
| spec 005 | settle up | draft |
| spec 006 | transport updates | draft |
| spec 007 | profiles and display names | draft |
| spec 008 | activity coverage and read state | draft |

### Decision series in use

| Series | Scope | Where |
|---|---|---|
| `D##` | product and strategy, global | working-doc §7 |
| `002-S#` | spec 002's own decisions, published as S1–S8 | spec 002 §9 |
| `004-D#` | spec 004's own decisions | spec 004 §18.3 |
| `B#` | brand | brand-foundations §7 |
| `ww-D#` | quality bar, rhythm and the Cowork handoff | ways-of-working §8 |
| `pipe-D#` | the command pipeline | pipeline §8 |
| `lens-D#` | the design lenses | design-lenses §6 |
| `name-D#` | naming | this file, §6 |

## 6. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| name-D1 | Fix the duplicate D29–D31 by namespacing the spec 004 rows | Product owner | **Decided 2026-11-11.** Applied to working-doc.md |
| name-D2 | Revenue models by name, letters kept as aliases | Product owner | **Decided 2026-11-11.** Names in anything new; old docs are corrected only when touched for another reason |
| name-D3 | Prefix initiatives with `I`, in docs and in GitHub titles | Product owner | **Decided 2026-11-11** |
| name-D4 | Retire roadmap phases 1–7 into a history section, leaving Horizon and milestones as the only forward-looking taxonomy | Product owner | **Decided 2026-11-11** |
