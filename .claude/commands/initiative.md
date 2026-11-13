---
description: Write or check an initiative — press release, sceptic's FAQ and strategy block, following docs/process/tracker.md
argument-hint: <initiative number, a name, or "check">
---

Work on the initiative: $ARGUMENTS

The rules and both templates are in `docs/process/tracker.md`, "Writing an initiative". Read them
first; do not copy them here. The bet and the layers are in `docs/product/working-doc.md` §2–3, the
revenue models in §3 by name (name-D2), and the sizing and risks in
`docs/product/venture-analysis.md`.

1. Find it. A number: `docs/product/initiatives/I<n>-*.md`, else the GitHub issue (`gh issue list
   --search "I<n>"`). A name: check the register in `docs/process/naming.md` §5 first — initiatives
   I1–I8 already exist, and this command more often fills one in than creates one. "check": every
   open initiative.
2. Report where it stands before writing anything: does it have a file, a press release, a sceptic's
   FAQ, and all six strategy lines? Then do only what is missing.
3. **The press release is the work.** Under one page, dated in the future, written in the host's or
   traveller's words. A headline a host would read, a subhead naming who it is for, then the problem
   in their words, what they can now do, one quote from a host, one from us, and how to start. No
   feature list and no internal language.
   - Draft it from what the repo already knows: the positioning in `working-doc.md` §11, the host
     personas in `epic-briefs.md` §2, and the real hosts in `early-testers.md` (T-codes only, never
     contact details).
   - **Never invent a customer quote and present it as real.** Mark every quote `[draft wording —
     owner to confirm]` until the owner approves it or a real host says it.
   - Apply the "so what?" test out loud: if the release is not meaningfully better, easier or
     cheaper for the host, say so and recommend not doing the initiative.
4. **The sceptic's FAQ**, five to seven questions, always including: who pays and how much; why now
   and why us; what we are deliberately not building; the riskiest assumption and the cheapest test
   of it. Pull the assumption from `venture-analysis.md` §13 if one fits rather than writing a new one.
5. **The strategy block**, six lines, each one short: Layer, Validates (the model by name plus the
   one claim), Unblocks, Next bottleneck, Instead of, Kill condition with a date. Do not cite the
   strategic pillars in `strategy.md`: they predate D33 premium hosts lead (trk-D3).
6. Owner decisions stay open with options and a recommendation, never answered (D27). The kill
   condition and the price are the two most likely to be the owner's. Read
   `docs/product/learnings.md` first: a row that contradicts the bet goes in the sceptic's FAQ.
7. **The sceptic's read.** Before showing the draft for approval, give the initiative file — and
   nothing from this conversation — to the reviewer agent (`.claude/agents/reviewer.md`), mode
   `press-release`. Show its verdict beside the draft. A must-fix (an invented quote, a kill
   condition nobody could observe) is fixed before asking for approval.
8. Show the file and the `gh` commands, and wait for an OK before writing the file or touching
   GitHub. Then: the file in `docs/product/initiatives/`, the issue body's outcome, key result,
   fields and link, and nothing restated between them.
9. Hand over (`docs/process/pipeline.md` §4): "Next: `/epic <brief>` for the first epic under this
   initiative".
10. "check" mode: for every open initiative, report what is missing from §2's list, plus **whether
   its kill condition has already happened**. Change nothing.
