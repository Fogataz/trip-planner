---
description: Audit what is live against the specs, the design lenses, the UX tests and the product principles
argument-hint: <checks | qa | ux | all | a spec number>
---

Audit: $ARGUMENTS

The rules are in `docs/process/pipeline.md` §6.2. Read them first; do not copy them here.

1. **Run the mechanical checks first: `scripts/audit-checks.sh`.** It finds what a person gets bored
   of looking for — socket events emitted with no listener (lens L5 real-time), locale keys missing
   from `es` or `pt` and strings hard-coded in components (L1 localization), and API routes with no
   auth middleware (L12 enforcement). `checks` mode runs only this and stops. Never add it to CI: it
   reports on code that already exists, and a required check that fails on day one gets bypassed
   (sys-D3).
2. **Scope the judgment half.** "qa": the acceptance criteria of every shipped spec. "ux": the seven
   tests in `docs/brand/brand-foundations.md` §5 **and** the fourteen lenses in
   `docs/process/design-lenses.md` applied to what is live. A spec number: that spec only. "all":
   everything.
3. Check each item against what the app actually does. Read the code. You **may** use a browser on a
   client that is already running, read-only: navigate, screenshot, read the accessibility tree. No
   sign-in, no form submission, no writes of any kind — a signed-in client holds real trip data, and
   this command changes nothing (pipe-D4). With no client running, say so and fall back to the
   checks plus a code read. Verdict per item: met, not met, can't tell. **"Can't tell" is not met.**
4. Check the four product principles in `CLAUDE.md` against current behaviour, not against the spec.
5. Rank each finding: broken, confusing, slower than it should be, cosmetic.
6. **Route every finding, and check for a duplicate before filing anything.**
   `gh issue list --state open --search "<keywords>"` first — the accommodation event already had
   issue #64 open when it was found by hand, and a second issue would have been noise. Then:
   - broken against a spec → a Bug issue under initiative **I3 what we have built works as
     documented**, or a comment on the existing issue with the file and line;
   - an improvement → a row in `docs/product/spec-backlog.md`;
   - **`features.md` says something the code does not** → fix `features.md` in a pull request.
     Engineering owns it and it is living, so documentation rot is a finding with a route, not a note.
7. Change no application code and open no pull request except the `features.md` correction. Show the
   findings table and the issues or rows you would create, and wait for an OK.
8. **When to run this:** after a spec ships, and before a milestone gate. Not monthly — a calendar
   ritual for two people is a ritual that gets skipped (pipe-D7).
9. Hand over (`docs/process/pipeline.md` §4): "Next: `/roadmap` if anything here changes what we do
   next".
