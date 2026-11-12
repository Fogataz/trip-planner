# Trip Planner Docs

This folder holds product documentation for the Trip Planner. Engineering setup lives in the root [README](../README.md).

> Items marked **TBD** need input from the product owner.

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
| [process/system.md](process/system.md) | The whole setup on one page: objects, documents, tooling with its status, and the fronts beyond product and engineering |
| [process/README.md](process/README.md) | How we work: the map of the process docs (tracker, pipeline, ways of working, naming), how one piece of work travels, and why we chose it |
| [process/tracker.md](process/tracker.md) | How delivery is tracked in GitHub Issues and the Trip-Planner project: the three levels, fields, views, and how the board relates to specs |
| [product/spec-backlog.md](product/spec-backlog.md) | Candidates for future specs: where each goes in the product, a recommendation and where to start in the code |
| [product/premium-buyer-lens.md](product/premium-buyer-lens.md) | Analysis (2026-11-10): who should pay and at what price, using Alex Hormozi's market and pricing advice |
| [product/destination-weddings.md](product/destination-weddings.md) | Analysis (2026-11-10): destination weddings as a niche, use cases, gaps, who pays, test plan |
| [product/early-testers.md](product/early-testers.md) | Living register of early testers and design partners (no contact details) |
| [product/venture-analysis.md](product/venture-analysis.md) | Analysis (2026-11-10): market size, unit economics and defensibility per segment; premium hosts lead (D33); epics to build next and the board change plan |
| [product/epic-briefs.md](product/epic-briefs.md) | How we write an epic (outcome titles, hypothesis, stories) and briefs for the next epics until they are on GitHub |
| [features.md](features.md) | What the product does today, based on the current code |
| [specs/](specs/) | One spec per feature, numbered |

## Specs

| # | Spec | Status | Shipped | PR |
|---|---|---|---|---|
| 001 | [Trip covers](specs/001-trip-covers.md) | shipped | 2026-11-06 | [#3](https://github.com/Fogataz/trip-planner/pull/3) |
| 002 | [Hosted event pilot](specs/002-hosted-event-pilot.md) | **approved** 2026-11-12 | — | — |
| 003 | [Localization (EN/PT/ES)](specs/003-localization.md) | shipped | 2026-11-09 | [#5](https://github.com/Fogataz/trip-planner/pull/5) |
| 004 | [Trip information architecture](specs/004-trip-ia-redesign.md) | shipped | 2026-11-10 | [#77](https://github.com/Fogataz/trip-planner/pull/77) |
| 005 | [Settle up](specs/005-settle-up.md) | draft | — | — |
| 006 | [Transport updates](specs/006-transport-updates.md) | draft | — | — |
| 007 | [Profiles and display names](specs/007-profiles-and-display-names.md) | draft | — | — |
| 008 | [Activity coverage and read state](specs/008-activity-and-read-state.md) | draft | — | — |
| 009 | [Trip cover layout](specs/009-trip-cover-layout.md) | shipped | 2026-11-10 | [#78](https://github.com/Fogataz/trip-planner/pull/78) |
| 010 | [Host edits their trip](specs/010-host-trip-edit.md) | draft | — | — |
| 011 | [Organizations, roles and permissions](specs/011-roles-and-permissions.md) | **approved** 2026-11-12 | — | — |
| 012 | [Joining, naming and the first trip](specs/012-joining-naming-and-the-first-trip.md) | **approved** 2026-11-12 | — | — |

## How a feature goes from idea to shipped

Adopted 2026-11-09. Any Claude account working in this repo follows the same stages. In Claude Code, run `/feature <name or spec number>`. To create or check the GitHub epic for a feature, run `/epic <brief, spec or issue number>` (rules in [process/tracker.md](process/tracker.md), "Writing an epic"). At a milestone gate (M0, M1, M2), run `/milestone <M0|M1|M2>` to assemble the evidence (rules in [process/pipeline.md](process/pipeline.md) §6.3). The full set of commands, skills, hooks and scripts, with what each one is for and whether it is built, is the tooling table in [process/system.md](process/system.md) §4.

| Stage | What | Output |
|---|---|---|
| 0. Audit | What exists today for this feature: screenshots of the current screens, the code paths (UI, API, data model), the docs and backlog entries, plus any gaps, bugs and risks found — kept apart from the requested scope | Audit section in the spec; screenshots in `wireframes/NNN-short-name/current/` |
| 1. Benchmark | 3–5 comparable products, 2–3 for a medium feature (event apps, retreat tools, group planners): what they do, what we take, what we avoid, with source links. Never cite what you have not checked | Benchmark section in the spec |
| 2. Define | What works for us: options, trade-offs and a recommendation. Check the four product principles in [CLAUDE.md](../CLAUDE.md) and flag conflicts. Apply the fourteen lenses in [process/design-lenses.md](process/design-lenses.md) as questions: each one you cannot answer is either an option for the owner or something not designed yet. | Experience and requirements in the spec |
| 3. Wireframes | Lo-fi frames, one per screen or state, annotated and tied to requirement IDs, with the current screen beside the proposed one. Cover empty, loading, error and no-permission states. In Lucid if connected, otherwise HTML files in `wireframes/NNN-short-name/`. | Frames linked from the spec |
| 4. Spec | Written from the template below, `Status: draft`, added to the specs table. Every product-owner decision is listed as an open decision with options and a recommendation, never answered for them. The lenses come back as answers: one line each in a `## Design lenses` section. | `specs/NNN-short-name.md` |
| **Gate** | **The product owner approves the spec. Status becomes `approved`. No code before this.** Open decisions do not block approval: each carries a recommendation that is the working default until the owner overrides it (D27). | Approved spec |
| 5. Build | On a branch, in the spec's build order, checked against its acceptance criteria | Pull request |
| 6. Docs | In the same pull request: see "When a spec ships" below | Updated docs |

### Size decides the stages

State the size and the reason at the start. The product owner can override it.

| Size | Typical case | Stages |
|---|---|---|
| Small | Fix or tweak, no new screen | 0, then build |
| Medium | New UI or behaviour on an existing screen | 0, 1 (light), 2, 3, 4 |
| Large | New area, new model, or a new kind of user | All |

The stages are written in general terms in [`.claude/commands/feature.md`](../.claude/commands/feature.md), so the same command works in another product. This file holds what is specific to Trip Planner: the folders, the spec template, the lens standard and the status values.

## How to write a spec

- Name it `specs/NNN-short-name.md`, using the next free number. Never rename or move it.
- Start it with a header:

  ```
  Status: draft        (draft | approved | building | shipped | superseded)
  Owner: …   Shipped: YYYY-MM-DD   PR: #N
  ```

- Add it to the specs table above in the same PR.
- A spec at `approved`, `building` or `shipped` must also carry four sections, checked by [`scripts/spec-lint.sh`](../scripts/spec-lint.sh) in CI (ww-D10). Specs written before the lenses landed on 2026-11-11 are exempt, since a shipped spec is never rewritten: **acceptance criteria**, **open decisions**, **build order**, and **design lenses** — one line per lens from [process/design-lenses.md](process/design-lenses.md), `n/a` where a lens does not apply. A `draft` needs only the header and its row in the table, so a seed draft is never blocked.

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
4. **Product sessions commit documentation, and nothing else.** A product session runs `scripts/docs-commit.sh` to put `docs/` and `wireframes/` changes on a `docs/…` branch and open the pull request (ww-D6, ww-D13). The script stages those two folders only and refuses anything else, so a product session still cannot commit code. Code, config and mixed changes stay with Claude Code, which reports its outcome into the repo or the board rather than only into its chat (ww-D7). See [process/ways-of-working.md](process/ways-of-working.md) §7.
5. **Rules live in the repo.** [CLAUDE.md](../CLAUDE.md) and this file hold the working rules, so any account or tool picks them up. Each Claude Project's instructions should say "Follow `CLAUDE.md` and `docs/README.md`" rather than repeat them.
6. **Shared tooling lives in the repo too.** Claude Code commands (such as `/feature`) go in `.claude/commands/`, so both computers have them. Claude Code reads `CLAUDE.md` and Codex reads `AGENTS.md`; `AGENTS.md` points to `CLAUDE.md` so there is one set of rules. Commands are Claude Code only, so the stages in this file stay the source of truth for every tool. Secrets (`.env`) never go in git; copy them between computers by hand or through a password manager.
7. **Links, not copies.** Wireframes and other artifacts made in one account are private to it. Save the files (for example HTML in `wireframes/NNN-short-name/`) or a screenshot in the repo, and link them from the spec.

## How to update

- Keep documents short and factual. Link to code or issues instead of copying them.
- **Every code carries a short name after a `·`**, so a reference reads without a lookup: `D27 · Recommendations are working defaults`, `R1 · Org owner reach`, `Q13 · Invited people must request`. Codes are scoped per document — **D** product-owner decisions in the [working doc](product/working-doc.md), **S / R / O** open decisions in specs 002 / 011 / 012, **G** guarantees, **Q** QA findings. A bare code with no name is a defect: fix it when you touch the line.
- Change a document through a pull request so it can be reviewed.
- When `features.md` gets too long, split it into one page per feature under `features/`. Specs stay where they are.
