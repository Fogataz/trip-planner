---
description: Take a feature from idea to shipped, following the staged process in docs/README.md
argument-hint: <feature name or spec number>
---

Work on the feature: $ARGUMENTS

The process is defined in `docs/README.md`, section "How a feature goes from idea to shipped". Read it first and follow it. Do not copy it here; if it changes, the README wins.

1. Find the feature. If `$ARGUMENTS` is a spec number, open `docs/specs/NNN-*.md`. If it is a name, check `docs/specs/` and `docs/product/roadmap.md`. If no spec exists, start at stage 1 (Benchmark).
2. Report the spec's current `Status:` and the next stage in the README table. Then do only that stage.
3. Check the four product principles in `CLAUDE.md`. Flag any conflict before going further.
   At **stage 2 (Define)**, also apply the fourteen lenses in `docs/process/design-lenses.md`
   as questions. At **stage 4 (Spec)**, write the answers into a `## Design lenses` section,
   one line per lens, `n/a` where a lens does not apply, and run
   `scripts/spec-lint.sh docs/specs/NNN-*.md` before showing the spec.
4. Product decisions that belong to the product owner stay listed as open decisions with options and a recommendation. Never answer them. Never invent answers to **TBD** items.
5. **Gate:** do not write code until the spec has `Status: approved` and its open decisions are answered. If it is not approved, stop and say what is missing.
6. Once approved: work on a branch (never `main`), build in the spec's build order, check against its acceptance criteria, and in the same PR update the spec, `docs/features.md`, `docs/product/roadmap.md` and the specs table in `docs/README.md`.
7. Pull at the start and commit and push at the end of the session. Open a PR to `main`; do not merge without the product owner's OK.
8. Hand over (docs/process/pipeline.md §4). End by naming the next command:
   - after stage 4 (spec drafted): "Next: `/epic <spec>` to link the spec and set fields";
   - after the approval gate: "Next: `/epic <spec>` to create one story per build-order row";
   - after opening a pull request: "Next: `/pr <number>` from a session that did not build
     this" (ways-of-working.md §3);
   - after it ships: "Next: `/audit <spec>` once it is live" (`/audit` is planned for
     December, pipeline.md §7; until it exists, say so).
