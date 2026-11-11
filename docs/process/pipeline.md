# Pipeline

> **Status: draft for review.** Written 2026-11-11. `/feature` and `/epic` exist. `/roadmap`, `/audit` and `/milestone` are proposals. Items marked **TBD** are the product owner's.
>
> What each command owns, and where it hands over. It does not repeat the rules: [docs/README.md](../README.md) owns the stages, [tracker.md](tracker.md) owns the board and how an epic is written, [ways-of-working.md](ways-of-working.md) owns the quality bar and the rhythm. This file owns the chain between them.

## 1. The loop

```
   strategy (owner, at a milestone)
         |
         v
    /roadmap --> /epic --> /feature --> ships
         ^                                |
         |                                v
    /milestone <-------------------- /audit
```

| Command | Owns | State |
|---|---|---|
| `/roadmap` | What we do next, and the Now / Next / Later cut | Proposed |
| `/epic` | The GitHub epic: outcome, hypothesis, measures, stories | Built |
| `/feature` | The spec and the build, one stage at a time | Built |
| `/audit` | What is wrong with what is already live | Proposed |
| `/milestone` | Whether the bets paid off, at M0, M1 and M2 | Proposed |

Each name is the thing the command owns. Nothing is named after a job that two commands share.

## 2. What each command reads and writes

| Command | Cadence | Reads | Writes | Hands to |
|---|---|---|---|---|
| `/roadmap` | Monday, and after a strategy change | strategy, venture-analysis §11, roadmap, the board, spec-backlog | recommended Horizon moves, the next brief | `/epic` |
| `/epic` | Per bet | a brief, a spec or an issue | the epic, its fields, story sub-issues | `/feature` |
| `/feature` | Per feature | the stages in docs/README.md, the spec | spec, wireframes, branch, PR, docs | `/epic`, then `/audit` |
| `/audit` | After a ship, and monthly | shipped acceptance criteria, the seven UX tests, the four principles | Bug issues under I3, rows in spec-backlog | `/roadmap` |
| `/milestone` | At M0, M1, M2 | each epic's own measures, analytics, the board | verdicts and an evidence pack | the owner, then `/roadmap` |

## 3. Rules every command follows

These are why the two existing commands have not drifted. Keep them in any new one.

1. **The rules live in a doc, not in the command.** The command names the doc and reads it. If a rule changes, the doc wins.
2. **One stage, then stop.** Report where the thing stands, do only the next step.
3. **A `check` mode that changes nothing.** Every command can answer "what is wrong right now?" without writing.
4. **Show, then wait.** Print the body or the `gh` commands and wait for an OK before writing to GitHub or to `main`.
5. **Owner decisions stay open**, with options and a recommendation, never answered (D27).
6. **Never restate a spec.** Link it.

## 4. The handoffs

Described in [epic-briefs.md](../product/epic-briefs.md) §6, but absent from both command files: neither mentions the other. Each command should end by naming the next one.

| After | Hand to | Line to add |
|---|---|---|
| `/roadmap` writes a brief | `/epic` | "Next: `/epic <brief>`" |
| `/epic` creates an epic with no spec | `/feature` | "Next: `/feature <title>`, stage 1 benchmark" |
| `/feature` drafts the spec (stage 4) | `/epic` | "Next: `/epic <spec>` to link the spec and set fields" |
| `/feature` passes the approval gate | `/epic` | "Next: `/epic <spec>` to create one story per build-order row" |
| `/feature` ships | `/audit` | "Next: `/audit <spec>` once it is live" |
| `/audit` finds something | the board or the backlog | A Bug issue under I3, or a row in [spec-backlog.md](../product/spec-backlog.md) |
| `/milestone` records verdicts | `/roadmap` | "Next: `/roadmap` to re-cut Now / Next / Later" |

## 5. Keeping the board true: not a command

A command only runs when a person remembers to run it, and board hygiene fails exactly when people are busy. So the job splits three ways, and only the judgment part belongs in a command.

| Change | Handled by | Why |
|---|---|---|
| Item added to the project; issue closed becomes Shipped | GitHub Projects built-in workflows | No human memory needed |
| In build becomes In review when a PR opens | By hand, on the board | Two seconds of work. An Action would need a personal token to renew, for this one move |
| Fields on a new epic: Layer, Revenue Model, Horizon, Priority, milestone | `/epic` | Judgment |
| Horizon moves, re-parenting, milestone changes | `/roadmap` | Judgment |
| "The board says In build, the spec says draft" | `/epic check`, extended | A report, not a write |

Decided in pipe-D1: no Action and no token. The built-in workflows cover adding items and Shipped; In review is moved by hand; `/epic check` reports any drift.

## 6. The three proposed commands

### 6.1 `/roadmap` — what we do next

**When:** Monday, and after any strategy change. **Input:** nothing, or an initiative.

1. Report state: open epics by Horizon and milestone, what is in the sprint, what is blocked, what has no spec yet.
2. For each open epic, check it still serves its initiative's key result. Flag the ones that do not.
3. Compare the order on the board with [venture-analysis.md](../product/venture-analysis.md) §11 and the briefs in [epic-briefs.md](../product/epic-briefs.md). List every difference as a recommendation with a reason.
4. Recommend the next one or two things to start, against real capacity: two people, one week.
5. Write or update the top brief in `epic-briefs.md` so `/epic` can take it.
6. Never rewrite [strategy.md](../product/strategy.md). Strategy changes at a milestone, by the owner.

**Output:** a status report, recommended Horizon moves, and one brief ready for `/epic`.

### 6.2 `/audit` — what is wrong with what we shipped

**When:** after a spec ships, and monthly. **Input:** `qa`, `ux`, a spec number, or `all`.

1. `qa`: walk the acceptance criteria of shipped specs against the running app. Met, not met, or can't tell.
2. `ux`: apply the seven tests in [brand-foundations.md](../brand/brand-foundations.md) §5. Each principle already carries a one-line test an engineer can apply.
3. Check the four principles in [CLAUDE.md](../../CLAUDE.md) against current behaviour, not against the spec.
4. Rank each finding: broken, confusing, slower than it should be, cosmetic.
5. Route every one. Broken against a spec becomes a Bug issue under **I3**. An improvement becomes a row in [spec-backlog.md](../product/spec-backlog.md). Nothing stays only in the report.
6. Change no code.

**Output:** a findings table, plus the issues and backlog rows it would create, shown for an OK first.

### 6.3 `/milestone` — did the bets pay off

**When:** at M0, M1 and M2. **Input:** the milestone.

1. List every epic closed since the previous milestone.
2. For each, read the leading and lagging measures in its own body against its own targets. Record: paid off, did not, or could not be measured.
3. Count "could not be measured" separately. It is a finding about how we work, not a result.
4. Run the milestone checklist in [ways-of-working.md](ways-of-working.md) §6.
5. Set the result against the gate criteria in [tracker.md](tracker.md), "Milestones".
6. Assemble the evidence and stop. The decision is the owner's.

**Output:** an evidence pack. Measures against targets, the checklist, and what the criteria say. No decision.

**Why there is no `/strategy` command.** Strategy changes three or four times a year, on evidence from interviews and milestones rather than on repo state, and the call is the owner's. `/milestone` prepares that conversation. A command would manufacture it from stale documents.

## 7. Build order

| When | What | Why |
|---|---|---|
| Before 20 Nov | The handoff lines in §4. CI (ww-D1). Rollback (ww-D3) | The pilot is the deadline. New commands are not on the critical path |
| By 27 Nov | `/milestone` | M0 falls on 27 Nov and nothing checks a measure today |
| December | `/audit`, and the board automation in §5 | Before the host-layer work piles up |
| January | `/roadmap` | It earns its keep once there are more candidate epics than weeks |

## 8. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| pipe-D1 | Board automation and the extended `/epic check` (§5) | Engineering | **Decided 2026-11-11:** built-in Projects workflows only (auto-add open issues; item closed → Shipped). No Action, so no personal token to create or renew. In review is set by hand. `/epic check` compares board Status with spec headers and open PRs |
| pipe-D2 | The names `/roadmap`, `/audit`, `/milestone` | Product owner | **Decided 2026-11-11** |
| pipe-D3 | The build order in §7 | Product owner | **Decided 2026-11-11** |
| pipe-D4 | Whether `/audit ux` may drive a browser, or only read code and report | Engineering | **TBD** |

## Appendix A. Proposed `.claude/commands/roadmap.md`

```markdown
---
description: Report where the product stands and recommend what to build next, following docs/process/pipeline.md
argument-hint: <nothing, an initiative number, or "check">
---

Work on the roadmap: $ARGUMENTS

The rules are in docs/process/pipeline.md §6.1. Read them first; do not copy them here.
Strategy comes from docs/product/strategy.md and docs/product/venture-analysis.md §11.

1. State. Open epics by Horizon and milestone, what is in the sprint, what is blocked,
   what has no spec. Use gh for the board.
2. Alignment. For each open epic, name the initiative it serves and its key result. Flag
   any epic that no longer serves one.
3. Drift. Compare the board's order with venture-analysis.md §11 and the briefs in
   epic-briefs.md. List each difference with a reason and a recommendation.
4. Next. Recommend one or two things to start, sized against two people for one week.
5. Brief. Write or update the top brief in docs/product/epic-briefs.md §4, following
   docs/process/tracker.md, "Writing an epic".
6. Never edit strategy.md, and never answer a TBD. Recommendations are defaults (D27).
7. Show every proposed change and wait for an OK. Then: "Next: /epic <brief>".
8. "check" mode: report state and drift only. Change nothing.
```

## Appendix B. Proposed `.claude/commands/audit.md`

```markdown
---
description: Audit what is live against the specs, the UX tests and the product principles
argument-hint: <qa | ux | all | a spec number>
---

Audit: $ARGUMENTS

The rules are in docs/process/pipeline.md §6.2. Read them first; do not copy them here.

1. Scope. "qa": acceptance criteria of every shipped spec. "ux": the seven tests in
   docs/brand/brand-foundations.md §5. A spec number: that spec only. "all": both.
2. Check each item against what the app actually does. Read the code; run the client if
   it is already running. Verdict per item: met, not met, can't tell. "Can't tell" is not met.
3. Check the four product principles in CLAUDE.md against current behaviour.
4. Rank each finding: broken, confusing, slower than it should be, cosmetic.
5. Route each one. Broken against a spec: a Bug issue under initiative I3. An improvement:
   a row in docs/product/spec-backlog.md. Never leave a finding only in the report.
6. Change no code and open no PR. Show the findings table and the issues or rows you would
   create, and wait for an OK.
```

## Appendix C. Proposed `.claude/commands/milestone.md`

```markdown
---
description: Assemble the evidence for a milestone gate: did the bets pay off
argument-hint: <M0 | M1 | M2>
---

Milestone: $ARGUMENTS

The rules are in docs/process/pipeline.md §6.3. Read them first; do not copy them here.
The gate criteria are in docs/process/tracker.md, "Milestones". The checklist is in
docs/process/ways-of-working.md §6.

1. List every epic closed since the previous milestone, with its initiative.
2. For each, read the leading and lagging measures in the issue body against its own
   targets. Verdict: paid off, did not pay off, or could not be measured.
3. Count "could not be measured" on its own. Say which measure was missing and why.
4. Run the §6 checklist: measures, privacy and security, docs truth.
5. Set the totals against the gate criteria for this milestone.
6. Stop there. Present the evidence pack. The decision is the product owner's; do not
   recommend passing or failing the gate unless asked.
```
