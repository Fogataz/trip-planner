---
description: Review a pull request against its spec, the product principles and the design lenses, in three tiers, following docs/process/pipeline.md §6.4
argument-hint: <pull request number>
---

Review pull request: $ARGUMENTS

The rules are in `docs/process/pipeline.md` §6.4 and `docs/process/ways-of-working.md` §3.
Read them first; do not copy them here. The lenses are in `docs/process/design-lenses.md`.

1. Gather, and nothing more. `gh pr view <n> --json title,body,headRefName,files,url`,
   `gh pr diff <n>`, and the spec the pull request or branch names, with its amendments. If no
   spec can be found, say so and stop. Never invent acceptance criteria.
2. **Review in the reviewer agent** (`.claude/agents/reviewer.md`), mode `pr`. Give it only: the
   spec's text, the diff, and the list of changed files. Not this conversation.
   ways-of-working §3 requires a reviewer that did not build the feature, and the agent is what
   makes that true even when this command is run in the session that wrote the code.
3. Show its verdict as it comes back: **must fix**, **follow-ups**, **nits**, then what it checked.
   Do not move a finding between tiers; if you disagree with one, say so beside it and let the
   owner decide.
4. On an explicit OK, and only then:
   - post the verdict as a single pull-request comment (`gh pr comment <n> --body-file …`);
   - for each follow-up, check `gh issue list --state open --search "<keywords>"` for a duplicate,
     then create one issue: type Task or Bug, label `follow-up`, parent the pull request's epic (or
     **I3 · What we have built works as documented** if there is none), body linking the pull
     request and the file and line (`docs/process/tracker.md`, "Follow-ups from review");
   - edit the comment to link the issues created.
   If the session cannot create issues, print the `gh` commands for the owner instead.
5. Never merge, push, approve on GitHub, enable auto-merge, or edit code. Nits are never filed.
6. Hand over (`docs/process/pipeline.md` §4). With a must-fix open: "Next: `/feature <spec>` to fix
   it on this branch, then `/pr <n>` again". Otherwise: "Next: your call. Nothing auto-merges."
