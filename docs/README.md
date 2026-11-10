# Trip Planner Docs

This folder holds product documentation for the Trip Planner. Engineering setup lives in the root [README](../README.md).

> **Status: draft.** The product documents are a first version for review. Items marked **TBD** need input from the product owner.

## Two kinds of document

- **Living reference** describes the product as it is today. Edit it whenever the product changes, so it is always true. This is [features.md](features.md).
- **Specs** record what we decided to build and why, at one point in time. Once a feature ships, its spec is not rewritten. A later change to the feature gets a new spec, or an amendment section at the end of the old one.

Product thinking follows the same split. The [working doc](product/working-doc.md) and [brand foundations](brand/brand-foundations.md) are living: edit them as decisions are made. Analyses such as the [revenue models analysis](product/revenue-models-analysis.md) are point-in-time: a later analysis gets a new file.

Folders are organized by kind of document, not by status. Status lives inside each spec and in the table below, so files never move and links never break.

## Contents

| Document | What it covers |
|---|---|
| [product/strategy.md](product/strategy.md) | Why the product exists, who it serves, and where it is heading |
| [product/working-doc.md](product/working-doc.md) | **Start here.** Current product thinking: strategy bet, revenue models, shared foundation, the eDreams gathering, open decisions (D1…) and the decision log |
| [product/roadmap.md](product/roadmap.md) | Planned phases, current status and next priorities |
| [product/discovery-amf-pmf.md](product/discovery-amf-pmf.md) | Discovery plan: revenue avenues, roles, and next steps to test audience-market fit and product-market fit |
| [product/revenue-models-analysis.md](product/revenue-models-analysis.md) | Revenue models compared, shared features, phased plan (point-in-time, 2026-11-09) |
| [brand/brand-foundations.md](brand/brand-foundations.md) | Brand platform, voice and tone, architecture, naming, visual directions, UX principles (v0) |
| [product/pilot-event-feature-list.md](product/pilot-event-feature-list.md) | Planning list for the first pilot event (spec 002): why each feature matters now and later, effort, risks and fallbacks |
| [process/tracker.md](process/tracker.md) | How delivery is tracked in GitHub Issues and the Trip-Planner project: the three levels, fields, views, and how the board relates to specs |
| [features.md](features.md) | What the product does today, based on the current code |
| [specs/](specs/) | One spec per feature, numbered |

## Specs

| # | Spec | Status | Shipped | PR |
|---|---|---|---|---|
| 001 | [Trip covers](specs/001-trip-covers.md) | shipped | 2026-11-06 | [#3](https://github.com/barry-dempsey/trip-planner/pull/3) |
| 002 | [Hosted event pilot](specs/002-hosted-event-pilot.md) | draft | — | — |
| 003 | [Localization (EN/PT/ES)](specs/003-localization.md) | shipped | 2026-11-09 | [#5](https://github.com/barry-dempsey/trip-planner/pull/5) |
| 004 | [Trip information architecture](specs/004-trip-ia-redesign.md) | approved | — | — |

## How a feature goes from idea to shipped

Adopted 2026-11-09. Any Claude account working in this repo follows the same stages. In Claude Code, run `/feature <name or spec number>`.

| Stage | What | Output |
|---|---|---|
| 1. Benchmark | 3–5 comparable products (event apps, retreat tools, group planners): what they do, what we take, what we avoid, with source links | Benchmark section in the spec |
| 2. Define | What works for us: options, trade-offs and a recommendation. Check the four product principles in [CLAUDE.md](../CLAUDE.md) and flag conflicts. | Experience and requirements in the spec |
| 3. Wireframes | Lo-fi frames, one per screen, annotated. In Lucid if connected, otherwise HTML files in `wireframes/NNN-short-name/`. | Frames linked from the spec |
| 4. Spec | Written from the template below, `Status: draft`, added to the specs table. Every product-owner decision is listed as an open decision with options and a recommendation, never answered for them. | `specs/NNN-short-name.md` |
| **Gate** | **The product owner approves the spec. Status becomes `approved`. No code before this.** Open decisions do not block approval: each carries a recommendation that is the working default until the owner overrides it (D27). | Approved spec |
| 5. Build | On a branch, in the spec's build order, checked against its acceptance criteria | Pull request |
| 6. Docs | In the same pull request: see "When a spec ships" below | Updated docs |

Small fixes with no new screen can skip stages 1 and 3.

## How to write a spec

- Name it `specs/NNN-short-name.md`, using the next free number. Never rename or move it.
- Start it with a header:

  ```
  Status: draft        (draft | approved | building | shipped | superseded)
  Owner: …   Shipped: YYYY-MM-DD   PR: #N
  ```

- Add it to the specs table above in the same PR.

## When a spec ships

In the same pull request as the feature:

1. Set the spec's status to `shipped` and fill in the date and PR.
2. Add or update the feature's section in [features.md](features.md), with a link to the spec.
3. Update its status in [product/roadmap.md](product/roadmap.md).
4. Update the specs table above.

## Working across accounts and computers

Adopted 2026-11-09 (D26). The product owner works from two Claude accounts on two computers. Each has its own Claude Project, Cowork and Claude Code. **Nothing syncs between accounts except this repo.** Chats, Claude Project docs, project instructions, memory and artifacts stay in the account that made them.

Rules:

1. **The repo is the only source of truth.** Every durable doc lives in `docs/`. A Claude Project may hold a short pointer, never the only copy.
2. **Pull before you start, push before you stop.** At the start of a session, Claude Code pulls `main` and the working branch. At the end, it commits and pushes, even for docs-only work. Uncommitted edits on one computer are invisible on the other.
3. **One working branch at a time for docs.** Docs changes go on a `docs/…` branch and are merged to `main` quickly. Don't edit the same doc on both computers before one side has pushed.
4. **Product sessions don't run git.** Cowork edits files; Claude Code commits, pushes and opens the pull request. When a product session ends, it says which files changed so Claude Code can commit them.
5. **Rules live in the repo.** [CLAUDE.md](../CLAUDE.md) and this file hold the working rules, so any account or tool picks them up. Each Claude Project's instructions should say "Follow `CLAUDE.md` and `docs/README.md`" rather than repeat them.
6. **Shared tooling lives in the repo too.** Claude Code commands (such as `/feature`) go in `.claude/commands/`, so both computers have them. Claude Code reads `CLAUDE.md` and Codex reads `AGENTS.md`; `AGENTS.md` points to `CLAUDE.md` so there is one set of rules. Commands are Claude Code only, so the stages in this file stay the source of truth for every tool. Secrets (`.env`) never go in git; copy them between computers by hand or through a password manager.
7. **Links, not copies.** Wireframes and other artifacts made in one account are private to it. Save the files (for example HTML in `wireframes/NNN-short-name/`) or a screenshot in the repo, and link them from the spec.

## How to update

- Keep documents short and factual. Link to code or issues instead of copying them.
- Change a document through a pull request so it can be reviewed.
- When `features.md` gets too long, split it into one page per feature under `features/`. Specs stay where they are.
