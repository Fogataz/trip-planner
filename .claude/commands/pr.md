---
description: Review a pull request against its spec, the product principles and the design lenses, following docs/process/pipeline.md §6.4
argument-hint: <pull request number>
---

Review pull request: $ARGUMENTS

The rules are in `docs/process/pipeline.md` §6.4 and `docs/process/ways-of-working.md` §3.
Read them first; do not copy them here. The lenses are in `docs/process/design-lenses.md`.

1. Gather, and nothing more. `gh pr view <n> --json title,body,headRefName,files,url`,
   `gh pr diff <n>`, and the spec the pull request or branch names. If no spec can be
   found, say so and stop. Never invent acceptance criteria.
2. **Review in a subagent.** Launch one general-purpose subagent and give it only: the
   spec's text, the diff, `docs/process/design-lenses.md`, and the four product principles
   from `CLAUDE.md`. Not this conversation. ways-of-working §3 requires a reviewer that did
   not build the feature, and the subagent is what makes that true even when this command
   is run in the session that wrote the code. Tell it to read files from the branch only to
   answer a question the diff leaves open.
3. The verdict has four parts, in this order:
   - **Acceptance criteria**, one row each: met, not met, or can't tell. "Can't tell" counts
     as not met. Quote the file and line that satisfies each one.
   - **The four product principles** in `CLAUDE.md`. A conflict is named, never absorbed.
   - **The fourteen lenses** (L1–L14) against what the diff actually does, not against what
     the spec claims. A lens the spec answered and the code did not is the finding this
     command exists for.
   - **Not asked for**: anything in the diff the spec did not ask for, including new
     dependencies, new endpoints and changed config.
4. End with one line: ready to merge, or the shortest list of what is missing.
5. Show the verdict. Then offer to post it as a single pull-request comment
   (`gh pr comment <n> --body-file …`) and post only on an explicit OK.
6. Never merge, push, approve on GitHub, enable auto-merge, or edit code. If something is
   broken, say so; the fix is `/feature`'s, on the same branch.
7. Hand over (`docs/process/pipeline.md` §4): end with "Next: your call. Nothing
   auto-merges."
