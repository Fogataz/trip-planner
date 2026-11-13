---
description: Create, enrich or check a GitHub epic and its stories, following docs/process/tracker.md
argument-hint: <brief number, spec number, issue number, or "check">
---

Work on the epic: $ARGUMENTS

The rules and templates are in docs/process/tracker.md, "Writing an epic", "Writing a story" and
"Follow-ups from review". Read them first; do not copy them here. Strategy and order come from
docs/product/venture-analysis.md.

1. Find the source. A brief number: docs/product/epic-briefs.md §4. A spec number:
   docs/specs/NNN-*.md. An issue number: `gh issue view <n>`. "check": list all open epics.
2. Title. It must be an outcome for a host or traveller. If it names a feature, propose
   an outcome title. Prefix the spec number once a spec exists.
3. Body. Fill the template. Before a spec, the body is the full brief. After a spec, keep
   outcome, hypothesis, measures and stories, link the spec, and fill:
   - **Wireframes:** the set and its frame range, or "none" (trk-D6).
   - **What done looks like:** four to eight lines a person can check at a glance, in plain
     words, each ending with the acceptance criteria it covers — `(AC 3, 8)`. Write what a host or
     traveller can now do, or what can no longer go wrong. Not the Given/When/Then, not the edge
     cases, not the thresholds: those stay in the spec. Group the criteria; do not write one line
     per criterion here (trk-D7).
   - **The stamp** under it: `Summarised from spec NNN at <short commit>, YYYY-MM-DD.`, where the
     commit is `git log -1 --format=%h -- docs/specs/NNN-*.md`.
   3–6 stories from the personas in epic-briefs.md §2.
4. Check the four product principles in CLAUDE.md and flag conflicts.
5. Owner questions stay open with options and a recommendation. Never answer TBDs.
6. Fields: parent initiative, Layer, Revenue Model, Horizon, Priority, milestone.
7. If the spec is approved, create **one sub-issue per build-order row**, from "Writing a story":
   Story if a person can see the change, Task if it only enables one; the row's frames; **Done
   when** with one plain line per acceptance criterion the row names, each with its number; the
   same stamp; and **Not in this story**. Then link each sub-issue from the matching line in the
   epic's Main user stories.
8. Show the gh commands and every issue body, and wait for OK before running them.
9. After creating an issue, replace its brief in epic-briefs.md with "Created as #<n>".
10. "check" mode, report only, change nothing without OK (pipeline.md §5):
    - epics missing an outcome title, hypothesis, measure, stories, initiative or fields; after a
      spec, missing the Wireframes line or What done looks like;
    - board Status against the spec's `Status:` header and open PRs
      (`gh pr list --search "<spec number or issue>"`): Spec draft vs draft, Spec approved vs
      approved, In build vs approved or building with a branch, In review vs an open PR to main,
      Shipped vs shipped and merged;
    - **stale summaries:** any stamp older than the last commit that touched its spec. Re-summarise
      from the spec; never edit the spec to match the summary;
    - an approved spec's build-order row with no sub-issue, or a spec with no epic and no line in
      its Build status saying why (trk-D5);
    - **open follow-ups** (label `follow-up`) under an epic that is Shipped or about to be. Each
      one is fixed, or moved under I3 with a reason, before the epic closes.
11. Hand over (docs/process/pipeline.md §4). If the epic has no spec yet, end with:
    "Next: `/feature <title>`, stage 1 benchmark".
