# How we work

> **Living reference.** Updated whenever a way of working changes, so it stays true. Written 2026-11-11.
>
> The front door to `docs/process/`: one document per thing, plus the two outside this folder that they all defer to. This file says what is where, and why we chose it.

## The map

| Document | Owns | Read it when |
|---|---|---|
| [tracker.md](tracker.md) | The board: three levels, fields, views, milestones, and how an epic is written | You are creating or grooming an issue |
| [pipeline.md](pipeline.md) | The commands, and where each hands over | You are about to run a command, or build a new one |
| [ways-of-working.md](ways-of-working.md) | The quality bar and the weekly rhythm | Before merging, and on Friday |
| [design-lenses.md](design-lenses.md) | The fourteen lenses every new spec is checked against | Stage 2 (Define) and stage 4 (Spec), and when reviewing a pull request |
| [naming.md](naming.md) | Codes, names, and the register that resolves them | You meet a code you cannot read |
| [device-setup.md](device-setup.md) | The one-time steps to get a product session pushing directly on a new device (ww-D9) | A Cowork session on a device that has never had it needs direct push |
| [../README.md](../README.md) | The stages a feature passes through, and the docs conventions | Any new feature |
| [../../CLAUDE.md](../../CLAUDE.md) | The four product principles, the layout, who does what | Every session, automatically |

Rule of thumb: `docs/README.md` owns **what happens**, `tracker.md` owns **where it is recorded**, `pipeline.md` owns **who runs it**, `ways-of-working.md` owns **how good it has to be**, `design-lenses.md` owns **what a spec must have thought about**.

## How one piece of work travels

```
strategy -> /roadmap -> /epic -> /feature -> ships -> /audit -> /milestone -> strategy
```

There are exactly two places work stops:

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
| One standard every new spec is checked against | A premium bar reached on the first pass costs less than a second design round. Fourteen lines in a spec is cheaper than rework | Judging each spec on its merits | [design-lenses.md](design-lenses.md) |
| A rule gets a script or a hook, or it is goodwill | The checks we skip are the ones that depend on two people remembering while busy | Checklists nobody runs | [ways-of-working.md](ways-of-working.md) §2, §7 |
| A code never travels without its name | "M0 epic target dates" is unreadable a week later | Bare codes | [naming.md](naming.md) |
| Premium hosts are the lead segment | Sized bottom-up and scored on two lenses; offsites stay as a benchmark | An offsite-platform pivot | D33, [venture-analysis.md](../product/venture-analysis.md) |

## What we deliberately do not do

- No estimates, story points or velocity.
- No daily stand-up. Monday sets the sprint, Friday closes it.
- No QA step owned by a person. `/audit` checks the shipped acceptance criteria and the seven UX tests.
- No mirror of the repo in Notion or anywhere else.
- No `/strategy` command. Strategy is the owner's call at a milestone, prepared by `/milestone`.
- No auto-merge, even on a green build.
- No rewriting a shipped spec.

## When a way of working changes

It changes like any other decision: a code in the right series ([naming.md](naming.md) §2), a row in the owning document's decisions table, and a pull request. A rule that exists only in a chat does not exist.
