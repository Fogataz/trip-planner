# Trip Planner Docs

This folder holds product documentation for the Trip Planner. Engineering setup lives in the root [README](../README.md).

> **Status: draft.** The product documents are a first version for review. Items marked **TBD** need input from the product owner.

## Two kinds of document

- **Living reference** describes the product as it is today. Edit it whenever the product changes, so it is always true. This is [features.md](features.md).
- **Specs** record what we decided to build and why, at one point in time. Once a feature ships, its spec is not rewritten. A later change to the feature gets a new spec, or an amendment section at the end of the old one.

Folders are organized by kind of document, not by status. Status lives inside each spec and in the table below, so files never move and links never break.

## Contents

| Document | What it covers |
|---|---|
| [product/strategy.md](product/strategy.md) | Why the product exists, who it serves, and where it is heading |
| [product/roadmap.md](product/roadmap.md) | Planned phases, current status and next priorities |
| [features.md](features.md) | What the product does today, based on the current code |
| [specs/](specs/) | One spec per feature, numbered |

## Specs

| # | Spec | Status | Shipped | PR |
|---|---|---|---|---|
| 001 | [Trip covers](specs/001-trip-covers.md) | shipped | 2026-11-06 | [#3](https://github.com/barry-dempsey/trip-planner/pull/3) |

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

## How to update

- Keep documents short and factual. Link to code or issues instead of copying them.
- Change a document through a pull request so it can be reviewed.
- When `features.md` gets too long, split it into one page per feature under `features/`. Specs stay where they are.
