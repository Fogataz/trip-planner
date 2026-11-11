---
description: Create, enrich or check a GitHub epic, following docs/process/tracker.md
argument-hint: <brief number, spec number, issue number, or "check">
---

Work on the epic: $ARGUMENTS

The rules and template are in docs/process/tracker.md, "Writing an epic". Read them first;
do not copy them here. Strategy and order come from docs/product/venture-analysis.md.

1. Find the source. A brief number: docs/product/epic-briefs.md §4. A spec number:
   docs/specs/NNN-*.md. An issue number: `gh issue view <n>`. "check": list all open epics.
2. Title. It must be an outcome for a host or traveller. If it names a feature, propose
   an outcome title. Prefix the spec number once a spec exists.
3. Body. Fill the template. Before a spec, the body is the full brief. After a spec, keep
   outcome, hypothesis, measures and stories, and link the spec for requirements. Never
   restate the spec. 3–6 stories from the personas in epic-briefs.md §2.
4. Check the four product principles in CLAUDE.md and flag conflicts.
5. Owner questions stay open with options and a recommendation. Never answer TBDs.
6. Fields: parent initiative, Layer, Revenue Model, Horizon, Priority, milestone.
7. If the spec is approved, create one story sub-issue per build-order row (title and
   spec link only).
8. Show the gh commands and the issue body, and wait for OK before running them.
9. After creating an issue, replace its brief in epic-briefs.md with "Created as #<n>".
10. "check" mode: report epics missing an outcome title, hypothesis, measure, stories,
    initiative or fields. Then compare each epic's board Status with its spec's `Status:`
    header and its open PRs (`gh pr list --search "<spec number or issue>"`), and flag
    every mismatch: Spec draft vs draft, Spec approved vs approved, In build vs approved
    or building with a branch, In review vs an open PR to main, Shipped vs shipped and
    merged. Report only; change nothing without OK (pipeline.md §5).
11. Hand over (docs/process/pipeline.md §4). If the epic has no spec yet, end with:
    "Next: `/feature <title>`, stage 1 benchmark".
