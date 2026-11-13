# How we work

> **Living reference.** Updated whenever a way of working changes, so it stays true. Written 2026-11-11, updated 2026-11-13.
>
> The front door to `docs/process/`: one document per thing, plus the two outside this folder that they all defer to. This file says what is where, and why we chose it.

## The map

| Document | Owns | Read it when |
|---|---|---|
| [system.md](system.md) | **Start here.** The whole thing on one page: the loop, the objects, the documents, every command, agent, skill, hook and script with its status, and the fronts beyond product and engineering | You want to know what we have, or whether a tool exists |
| [tracker.md](tracker.md) | The board: three levels, fields, views, milestones, how an initiative, an epic and a story are written, and follow-ups | You are creating or grooming an issue |
| [dependency-map.md](dependency-map.md) | The Now/Next work backward from each active milestone: a Mermaid dependency network, a work-package register, and the open questions it surfaced | You need to know what blocks what, or what to do next to unblock delivery |
| [pipeline.md](pipeline.md) | The commands and the reviewer agent, and where each hands over | You are about to run a command, or build a new one |
| [ways-of-working.md](ways-of-working.md) | The quality bar, the three tiers of review finding, the weekly rhythm, and who commits what | Before merging, and on Friday |
| [design-lenses.md](design-lenses.md) | The fourteen lenses every new spec is checked against | Stage 2 (Define) and stage 4 (Spec), and when reviewing a pull request |
| [naming.md](naming.md) | Codes, names, and the register that resolves them | You meet a code you cannot read |
| [device-setup.md](device-setup.md) | The one-time steps to get a product session pushing directly on a new device (ww-D9) | A Cowork session on a device that has never had it needs direct push |
| [build-handover.md](build-handover.md) | Starting the pilot build with the repo and nothing else: read order, build order, the traps, what is already decided | A different Claude account or computer picks up the build |
| [../README.md](../README.md) | The stages a feature passes through, and the docs conventions | Any new feature |
| [../../CLAUDE.md](../../CLAUDE.md) | The four product principles, the layout, who does what | Every session, automatically |

Rule of thumb: `docs/README.md` owns **what happens**, `tracker.md` owns **where it is recorded**, `pipeline.md` owns **who runs it**, `ways-of-working.md` owns **how good it has to be**, `design-lenses.md` owns **what a spec must have thought about**, and `system.md` owns **what exists and how it connects**.

## How one piece of work travels

The loop is drawn in [system.md](system.md) §1. There are exactly two places work stops:

1. **The spec gate.** No code before a spec reaches `Status: approved` ([docs/README.md](../README.md), D6).
2. **The milestone gate.** Every bet is settled against its own measure at M0, M1 or M2 ([tracker.md](tracker.md), "Milestones").

Everything else is a recommendation, not a blocker (D27).

## Why we work this way

| Choice | Why | What we turned down | Where |
|---|---|---|---|
| GitHub Issues and Projects as the tracker | Free with no issue cap, sits beside the code and the pull requests, works with Claude Code, Codex and Copilot without a seat or a connector | Notion (two paid seats, a guest cannot connect its MCP, and a second source of truth beside `docs/`), Jira, Linear | [tracker.md](tracker.md) |
| The repo is the only source of truth | Two Claude accounts on two computers, and nothing syncs between them except git. Chats, Projects and memory stay in the account that made them | Keeping a durable doc only in a Claude Project | D26 |
| Epics are outcomes carrying a hypothesis and a measure | A feature list cannot be stopped early. A bet with leading indicators can be stopped or continued before the whole cost is spent | Feature-named epics | [tracker.md](tracker.md), "Writing an epic"; D38 |
| No code before an approved spec | The expensive mistakes are the ones built before anyone wrote down what "done" meant | Building straight from a chat thread | D6 |
| Open questions never block | Two people cannot stall on a decision that is reversible. Each TBD carries a recommendation that acts as the default | Answering everything before starting | D27 |
| Effort is not estimated | Two people. It does not roll up, and the estimate costs more than it tells us | Story points, velocity | [tracker.md](tracker.md), Fields |
| Shipped specs are never rewritten | A spec records what we decided and why, on a date. Rewriting it destroys the only history we have | One evergreen spec per feature | [docs/README.md](../README.md) |
| Living and point-in-time documents are different kinds | A reference that is edited stays true. An analysis that is edited becomes a lie about what we knew at the time | Folders organised by status | [docs/README.md](../README.md) |
| Rules live in documents; commands point at them | A command that copies a rule drifts from it silently | Self-contained commands | [pipeline.md](pipeline.md) §3 |
| The reviewer never built the thing | The session that just built a feature already believes it works | Self-review | [ways-of-working.md](ways-of-working.md) §3 |
| One page that lists every tool and its status | Three partial maps existed and none of them said what tooling we had. A tool nobody knows about is a tool nobody runs | A fourth partial map, or a wiki | [system.md](system.md) |
| One standard every new spec is checked against | A premium bar reached on the first pass costs less than a second design round. Fourteen lines in a spec is cheaper than rework | Judging each spec on its merits | [design-lenses.md](design-lenses.md) |
| A rule gets a script or a hook, or it is goodwill | The checks we skip are the ones that depend on two people remembering while busy | Checklists nobody runs | [ways-of-working.md](ways-of-working.md) §2, §7 |
| A code never travels without its name | "M0 epic target dates" is unreadable a week later | Bare codes | [naming.md](naming.md) |
| Premium hosts are the lead segment | Sized bottom-up and scored on two lenses; offsites stay as a benchmark | An offsite-platform pivot | D33, [venture-analysis.md](../product/venture-analysis.md) |
| Review findings come in three tiers, and follow-ups are filed before the merge | Holding a feature for taste delays value; merging on "we'll clean it up later" means it never happens. Category decides the tier, the board holds what is deferred, and the oldest follow-up joins every sprint | Request every change before merging; or merge and leave the rest in a comment | [ways-of-working.md](ways-of-working.md) §3.1, ww-D17 |
| An epic says what done looks like in plain words | Opening an epic should show what good is at a glance. A summary with AC numbers and a stamp does that without becoming a second spec | AC numbers only; copying the criteria | [tracker.md](tracker.md), trk-D7 |
| One reviewer agent, three moments | The pull request, the spec before the gate and the press release all need someone who did not write them. One definition keeps "independent" meaning one thing | A reviewer per command | [pipeline.md](pipeline.md), pipe-D9 |
| What we learn has one home | A lesson that stays in the retro of the bet that taught it never reaches the next bet | Lessons per initiative, or in chat | [learnings.md](../product/learnings.md), sys-D5 |
| The product session maintains the process tooling | The commands and rules are how the process is enforced; routing every change through Claude Code made them the slowest thing to change. Application code, hooks and CI stay with engineering | A work order for every process change | [ways-of-working.md](ways-of-working.md) §7.1, ww-D18 |

## What we deliberately do not do

- No estimates, story points or velocity.
- No daily stand-up. Monday sets the sprint, Friday closes it.
- No QA step owned by a person. `/audit` checks the shipped acceptance criteria and the seven UX tests.
- No mirror of the repo in Notion or anywhere else.
- No `/strategy` command. Strategy is the owner's call at a milestone, prepared by `/milestone`.
- No auto-merge, even on a green build.
- No rewriting a shipped spec.
- No `TODO` comment in code standing in for work. A follow-up is an issue.
- No task per set of wireframes. They are a link on the epic and a line per story (trk-D6).

## When a way of working changes

It changes like any other decision: a code in the right series ([naming.md](naming.md) §2), a row in the owning document's decisions table, and a pull request. A rule that exists only in a chat does not exist.
