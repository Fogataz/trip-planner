---
name: design-lenses
description: The fourteen design lenses every Trip Planner spec is checked against. Use when writing, defining, approving or reviewing a spec under docs/specs/, or when asked what a feature has to have thought about.
paths:
  - docs/specs/**
---

# Design lenses

The standard is [docs/process/design-lenses.md](../../../docs/process/design-lenses.md). Read it;
this file does not copy it, so that the document stays the only place the rule lives
(`docs/process/pipeline.md` §3, rule 1).

In short:

- **Stage 2 (Define):** apply L1–L14 as questions. Each one you cannot answer is either an
  option for the product owner or something not designed yet.
- **Stage 4 (Spec):** the answers go in a `## Design lenses` section, one line per lens, in
  order. `n/a` is a valid answer as long as it is written down.
- Never answer a product owner's decision. It becomes an open decision with options and a
  recommendation (D27 open questions never block).
- `scripts/spec-lint.sh` checks that each lens has a line once the spec reaches
  `Status: approved`. It does not judge the answers; `/pr` does.
- The lenses ask whether a feature is **complete**. The seven UX tests in
  `docs/brand/brand-foundations.md` §5 ask whether it is **good**. Both apply.

A product session in Cowork does not load this skill — committed skills are a Claude Code
feature. `docs/process/design-lenses.md` is therefore the source of truth, and
`docs/README.md` names it in the stage table so every tool reaches it.
