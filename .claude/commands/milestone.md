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
7. Once the owner has recorded verdicts, end with: "Next: `/roadmap` to re-cut
   Now / Next / Later" (`/roadmap` is planned for January, pipeline.md §7; until it
   exists, re-cut by hand).
