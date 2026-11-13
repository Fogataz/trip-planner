---
description: Report where the product stands and recommend what to build next, following docs/process/pipeline.md §6.1
argument-hint: <nothing, an initiative number, or "check">
---

Work on the roadmap: $ARGUMENTS

The rules are in `docs/process/pipeline.md` §6.1. Read them first; do not copy them here. The
initiatives and their key results are the baseline; `docs/product/venture-analysis.md` is a
point-in-time reference, not the baseline.

1. **State.** Open epics by Horizon and milestone, what is in the sprint, what is blocked, what has
   no spec. Use `gh` for the board.
2. **Work in progress, before anything else.** Count the epics with board Status `In build` or
   `In review`. **If that count is two or more, recommend nothing new.** Report what is in flight,
   what each one needs to finish, and stop after step 6. Two people cannot carry three open epics, and
   a roadmap that keeps starting work is how a two-person team ends a quarter with nothing finished.
3. **Measures.** For each open epic, print its leading measure and say whether it can actually be
   read today: is the analytics event named, and does it exist in the code? An epic whose measure
   cannot be read is flagged here, not at the gate (ways-of-working §1 check 7, lens L6
   measurability).
4. **Kill conditions.** For every open initiative, read the kill condition in
   `docs/product/initiatives/I<n>-*.md` and say whether what it describes has already happened. This
   is the weekly version of the milestone gate; without it, nothing stops a bet for three months.
5. **Alignment and drift.** For each open epic, name the initiative it serves and that initiative's
   key result, and flag any epic that no longer serves one. Then compare the order on the board with
   `venture-analysis.md` §11 and the briefs in `epic-briefs.md` — and **print the date of
   venture-analysis.md when you do**, because a difference from a document three months old is the
   document ageing, not drift. List each real difference with a reason and a recommendation.
6. **Follow-ups and learnings.** `gh issue list --label follow-up --state open`: print the count,
   the oldest with its age, and its epic. The oldest goes in this sprint. **At eight or more, recommend
   no new epic** until the count is below eight (ways-of-working §5, ww-D17). Flag any older than
   four weeks for Friday's retro. Then read the rows added to `docs/product/learnings.md` since last
   Monday and say which open epic or initiative each one touches.
7. **Next.** Recommend one or two things to start, sized against two people for one week. Skip this
   step entirely if step 2 or step 6 stopped you.
8. **Brief.** Write or update the top brief in `docs/product/epic-briefs.md` §4, following
   `docs/process/tracker.md`, "Writing an epic".
9. Never edit `strategy.md`, and never answer a TBD. Recommendations are defaults (D27).
10. Show every proposed change and wait for an OK. **A Horizon move, a re-parenting or a milestone
   change is recorded as a comment on the issue with its reason**, not only in this chat (ww-D7).
11. Hand over (`docs/process/pipeline.md` §4): "Next: `/epic <brief>`".
12. "check" mode: steps 1 to 6 only. Change nothing, write no brief, comment on nothing.
