---
description: Assemble the evidence for a milestone gate: did the bets pay off, and what did we learn
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
4. Run the §6 checklist: measures, privacy and security, docs truth. Count the open
   follow-ups (label `follow-up`) per epic: debt carried into a gate is a finding too.
5. Set the totals against the gate criteria for this milestone.
6. **Draft learnings.** For each verdict that teaches something beyond its own epic, draft a
   row for `docs/product/learnings.md`: one claim, its evidence as a link, a confidence
   (strong, medium, weak), and what it should change. Read the research tally in
   `docs/product/research/README.md` if the gate counts interviews. Show the rows; write
   them only on an OK.
7. Stop there. Present the evidence pack and the draft learnings. The decision is the
   product owner's; do not recommend passing or failing the gate unless asked.
8. Once the owner has recorded verdicts, end with: "Next: `/roadmap` to re-cut
   Now / Next / Later".
