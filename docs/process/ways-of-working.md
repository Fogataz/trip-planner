# Ways of working

> **Status: draft for review.** Written 2026-11-10. Items marked **TBD** are the product owner's or engineering's.
>
> How two people and Claude keep a quality bar while moving fast. This file owns the **quality bar and the rhythm**. It does not repeat the lifecycle: [docs/README.md](../README.md) owns how a feature goes from idea to shipped, and [tracker.md](tracker.md) owns the board and how an epic is written.

## 1. Done means done

A story or epic is done when all of these are true.

| # | Check | Who |
|---|---|---|
| 1 | Every acceptance criterion in the spec passes, checked by name | Engineering |
| 2 | The four product principles in [CLAUDE.md](../../CLAUDE.md) still hold. A conflict is flagged, never absorbed silently | Engineering |
| 3 | CI is green (section 2) | Automatic |
| 4 | The diff was reviewed by someone who did not write it (section 3) | Reviewer |
| 5 | Spec status, `features.md`, `roadmap.md` and the specs table updated in the same PR ("When a spec ships") | Engineering |
| 6 | Every new screen has strings in English, Spanish and Portuguese (D23) | Engineering |
| 7 | The epic's leading measure can actually be read: the event is instrumented, or there is a way to count it | Product |
| 8 | The spec's `## Design lenses` section is answered line by line, and the reviewer checked each answer against the diff ([design-lenses.md](design-lenses.md)) | Reviewer |

Check 7 is the one that gets skipped. An epic with a measure nobody can read is a bet nobody can settle. Check 8 is new on 2026-11-11: `scripts/spec-lint.sh` enforces that the lines exist, `/pr` judges whether they are true (ww-D10).

## 2. Quality gate (CI)

CI runs in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (ww-D1). The server's `npm test` is still a placeholder that exits 1, so CI does not run it.

| Step | Command | When |
|---|---|---|
| Client types and build | `cd client && npm run build` (`tsc` then Vite) | Now |
| Client tests | `cd client && npm test` (Vitest) | Now |
| Server syntax | `node --check` over `server/**/*.js` | Now, costs nothing |
| Dependency audit | `npm audit --omit=dev`, report only | Now |
| Spec sections | [`scripts/spec-lint.sh`](../../scripts/spec-lint.sh) over the specs the pull request touches (ww-D10) | Now |
| Docs-only branches | [`scripts/docs-only-check.sh`](../../scripts/docs-only-check.sh) on any pull request from a `docs/…` branch (ww-D11) | Now |
| Server tests | A real suite, supertest on the health and auth routes first, replacing the placeholder | After the pilot |

CI runs on every pull request to `main`. A red check blocks the merge. Nothing auto-merges: the product owner's OK is still required.

The two new steps are the same scripts the local tooling runs, not a second copy of the rule. `spec-lint.sh` is also a `PostToolUse` hook, so a session that writes a spec is told immediately; `docs-only-check.sh` is step 3 of `scripts/docs-commit.sh`. CI is the backstop, because the `ci` check is required on `main` and a hook is not: a hook only runs where Claude Code runs (§7.1).

## 3. Reviewing code Claude wrote

Most of this code is written by Claude Code, so the review has to come from outside the session that wrote it.

- The reviewer is a session or subagent that did **not** build the feature. It gets the spec and the diff, nothing else.
- It answers one question per acceptance criterion: met, not met, or can't tell. Then it lists anything in the diff the spec did not ask for.
- "Can't tell" counts as not met.
- The product owner reads the verdict rather than the whole diff, and merges.

Run it with `/pr <number>` ([pipeline.md](pipeline.md) §6.4, pipe-D5). The command hands the spec and the diff to a **subagent**, so the rule holds even when `/pr` is typed in the session that wrote the code. It never merges, pushes, or approves on GitHub.

This is the cheapest insurance a two-person team has. The session that just built something is the worst judge of it, because it already believes it works.

## 4. If it breaks during the pilot

The pilot runs on 24–25 November. We are both there, together, and both on call. Keep it simple.

1. **Before the event:** tag the pilot build once it is deployed and the dry run passed, so there is one known-good commit to go back to.

   ```bash
   git checkout main && git pull
   git tag -a pilot-2026-11-24 -m "Pilot build, known good"
   git push origin pilot-2026-11-24
   ```

2. **If something breaks:** if a fix is not obviously minutes away, redeploy the `pilot-2026-11-24` tag on the hosting platform (server and client) and fix it after the session. Code only: never touch the database. **TBD (ww-D3):** the exact redeploy step, once hosting is chosen.
3. **Errors:** the server logs errors to standard output. Keep the hosting platform's live log open on one laptop. **TBD (ww-D3):** where that log is, once hosting is chosen.
4. **Attendees:** a host posts an announcement in the app. If the app is down, the organizers' group chat.

In the 20 Nov dry run, try one redeploy of the tag so we know it works.

## 5. Weekly rhythm

The board already runs one-week sprints from Mon 10 Nov. Two short rituals hang off it.

| When | Ritual | Output |
|---|---|---|
| Monday, 15 min | What is in this sprint and what is not | Sprint set on the board |
| Friday, 15 min | Retro and demo: what shipped against what was planned, one process friction, one thing to keep | Three lines, in the sprint item or here |
| Friday, 5 min | Read the analytics events shipped so far: trend, not detail | Noted only if it changes a priority |

Two people need no more ceremony than this. The Friday quarter of an hour exists so process problems surface weekly instead of at a gate three months away.

## 6. At every milestone (M0, M1, M2)

Run this before the gate decision, not after it.

1. **Measures.** For every epic closed since the last milestone, read its leading and lagging measures against the targets in its own body. Record a verdict: paid off, did not pay off, or could not be measured.
2. **Privacy and security.** Live location still never stored. No personal data in AI prompts. Analytics still carry no content and no coordinates. `npm audit` reviewed. Secrets still only in `.env`.
3. **Docs truth.** `features.md` matches the code. Spec statuses match reality.
4. **Gate.** The criteria in [tracker.md](tracker.md), "Milestones". The decision is the owner's, taken with the evidence above in front of him.

"Could not be measured" is a finding about our process, not a neutral result. Count them.

## 7. Working between the product session and Claude Code

Two sessions share one repository and no other state. Every extra trip between them is paid for by hand, so these rules exist to keep the number of trips down.

### 7.1 Who commits what

| Change | Committed by | How |
|---|---|---|
| Anything under `docs/` only | The product session | `scripts/docs-commit.sh <branch-suffix> "<message>" [docs/path ...]` (§7.5, ww-D6) |
| Code, config, lockfiles, `.claude/`, `.github/` | Claude Code | Branch, pull request, review, as today |
| A mix of docs and code | Claude Code | One pull request, so the docs land with the code that made them true |

The script stages `docs/` and nothing else, and refuses if anything outside `docs/` reaches the index. That is the whole safety model: a product session cannot commit code, because the script will not let it.

**And CI says the same thing (ww-D11).** A hook cannot enforce this: hooks and committed skills are Claude Code features, and a product session does not run Claude Code's hook loop at all, so a path guard would constrain only the session that is allowed to write everywhere. So the guard lives where nobody can skip it — [`scripts/docs-only-check.sh`](../../scripts/docs-only-check.sh) runs in CI on every pull request from a `docs/…` branch and fails if the diff touches anything outside `docs/`. The trade-off, named: branch names are load-bearing. An engineering change parked on a `docs/…` branch fails CI, and the fix is to rename the branch.

**Pull, or know how stale you are (ww-D12).** A `SessionStart` hook runs `git fetch` — read-only, so it cannot lose work — and tells the session how far behind `main` and the working branch are, how many files are uncommitted, and the one command that fixes it. It never pulls: a pull inside a hook runs invisibly, can land on a dirty tree or mid-rebase, and can move the branch under a session that has already read files. The pull stays a deliberate first step, as [CLAUDE.md](../../CLAUDE.md) already requires.

**Which git a product session may run (ww-D8).**

| May run | Why it is safe |
|---|---|
| `git fetch`, `git pull --ff-only`, `git status`, `git log`, `git diff` | Read-only or fast-forward. None of them can lose work or write to the remote |
| `scripts/docs-commit.sh` | Stages `docs/` only and refuses anything else (§7.5) |
| Nothing else — committing by hand, `merge`, `rebase`, `reset`, `push`, checking out code, any `git config` | Engineering's, every time |

**Pull before you edit.** It is the step most likely to be skipped, and the only thing that keeps a product session and Claude Code in sync. If the pull is refused, say so and name the commit you are working from, rather than editing from an unknown base.

**Prerequisites.** Rechecked 2026-11-11 against Alberto's own laptop clone through the device bridge — the path the script actually runs on, never a separate cloud-sandbox clone:

| What | How it stood | Fix, and whose |
|---|---|---|
| A git identity | No clone had `user.email` or `user.name` set | **Done 2026-11-11** on Alberto's computer: `Calvur-Labs` with the GitHub noreply address, in that clone's `.git/config`. Applies to that clone only. Each person sets their own identity in their own clone; Barry's clone is still untouched |
| Network to GitHub | Genuinely blocked on the bridge path: HTTP 403 `blocked-by-allowlist` from the device-bridge shell on 2026-11-11 | **Fixed 2026-11-11 by the product owner:** turned on "Use the internet while making files" in Settings → Capabilities. Confirmed the same day from the laptop clone — the same shell went from 403 to 200, and `git ls-remote origin HEAD` reached `Fogataz/trip-planner` cleanly |

`gh` as a way to *open the pull request* is not a prerequisite: §7.5 already covers its absence, pushing and leaving the pull request to the compare link `git push` prints.

**First real run, 2026-11-11 (this change):** identity and commit worked — the script branched, staged and committed cleanly through the device bridge. **Push failed**, on something the table above missed: this clone's `credential.https://github.com.helper` is set to `!gh auth git-credential`, so without `gh` installed, git has no way to authenticate the push itself (separate from `gh` only being needed to open the PR). **Resolved the same day, two ways:** `gh` was installed on the laptop, so push succeeds from macOS (Claude Code, or by hand). Separately, `gh` was also installed inside the device-bridge VM itself and logged in with a fine-grained personal access token (scoped to `Fogataz/trip-planner` only, `Contents` and `Pull requests`: read and write, 30-day expiry) — so push now works directly from a product session too (ww-D9).

**Where that leaves it:** a product session can branch, commit and push through the device bridge end to end, once that VM's `gh` is authenticated. The trade-off, named rather than hidden: that VM has no credential store, so the token sits in a plaintext `gh` config file local to this device only — not shared with Alberto's own Terminal, Claude Code, or any other computer, and it expires and needs reissuing. Anyone who would rather avoid that trade-off still has two fallbacks: push from macOS as before, or edit the file on the branch through GitHub in the browser, which commits server-side and needs no push at all — at the cost of leaving local clones a `git pull` behind. **Setting this up on a different device** (a second computer, a different Claude account, it makes no difference) is the same three steps, written down once in [device-setup.md](device-setup.md) rather than re-derived per device.

### 7.2 Claude Code reports into the repo, never only into its chat

An engineering session ends by writing its outcome where the other session can read it: the pull request, the document it changed, or the board. The product owner does not carry output between sessions by hand (ww-D7).

### 7.3 One work order out, one report in

A product session ends with one work order: what changed, what to do, and what not to do yet. An engineering session ends with one pull request plus the line in 7.2. Anything either session notices on the way becomes a row in [spec-backlog.md](../product/spec-backlog.md) or a decision code in the document that owns it, never another trip.

### 7.4 What a product session still never does

Edit code, config or lockfiles. Commit by hand, merge, rebase, reset, push, or change git config (ww-D8). Rewrite a shipped spec. Answer a TBD.

### 7.5 `scripts/docs-commit.sh`

The script is [scripts/docs-commit.sh](../../scripts/docs-commit.sh); its header is the reference. It runs end to end in Claude Code. From a product session it branches and commits, and the push is run from macOS (§7.1).

```bash
scripts/docs-commit.sh <branch-suffix> "<commit message>" [docs/path ...]
```

Start on `main`. The script updates it, creates `docs/<branch-suffix>`, commits, pushes and opens the pull request. Run it again from that branch to add to the same pull request. Name paths to commit only those files; with no paths it commits everything changed under `docs/`.

It refuses, before it changes anything, when:

- a path given, or a file already staged, is outside `docs/`;
- you are on any branch other than `main` or `docs/<branch-suffix>`, so another branch's commits cannot ride along;
- the branch already carries commits that touch files outside `docs/`.

`gh` is not optional here. This clone sets `credential.https://github.com.helper` to `!gh auth git-credential`, so without `gh` git cannot authenticate the push at all — separate from `gh` being the thing that opens the pull request. Once `gh` is installed and authenticated in the device-bridge VM (ww-D9), the script pushes and opens the pull request from a product session too; otherwise it stops at the push and hands over the branch.

## 8. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| ww-D1 | Add the CI workflow and make it a required check | Engineering | **Done 2026-11-11:** `.github/workflows/ci.yml`, check `ci` required on `main` |
| ww-D2 | Who is on call during the pilot, each day | Product owner | **Decided 2026-11-11:** both of us, together, both days |
| ww-D3 | Rollback steps, and where errors are visible during the event | Engineering | **Written 2026-11-11** in §4. The redeploy step and log location are **TBD** until hosting is chosen. Tried once in the dry run |
| ww-D4 | Retro day and length | Product owner | **Decided 2026-11-11:** Friday, 15 minutes, **17:00 CET as the working default** (D27) — moved by whoever cannot make it, rather than left open. First one: Friday 14 Nov |
| ww-D5 | May product sessions edit `docs/process/`? | Product owner | **Decided 2026-11-11: yes.** Engineering updates the "Who does what" list in CLAUDE.md |
| ww-D6 | May product sessions commit documentation themselves? | Product owner | **Decided 2026-11-11: yes**, docs-only, through `scripts/docs-commit.sh` (§7.1). **Unblocked 2026-11-11:** identity, commit and push all work from Alberto's own clone; the push itself is run from macOS, not from the product session (§7.1). Engineering created the script, set the git identity and updated CLAUDE.md |
| ww-D7 | Claude Code reports its outcome into the repo or the board, not only into its chat | Product owner | **Decided 2026-11-11** (§7.2) |
| ww-D8 | Which git commands a product session may run | Product owner | **Decided 2026-11-11:** read-only and fast-forward commands, plus `scripts/docs-commit.sh` (§7.1). Engineering replaces the "its only git is the script" wording in CLAUDE.md, which as written forbids the `git pull` every session is told to run first |
| ww-D9 | Can a product session push, not just commit? | Product owner | **Decided 2026-11-11: yes, per device.** `gh` installed and logged in with a fine-grained, repo-scoped, time-limited PAT inside the device-bridge VM (§7.1). The token is plaintext, local to that VM, and expires; re-authenticate per device as needed. Repeatable steps: [device-setup.md](device-setup.md) |
| ww-D10 | Is a spec's section list enforced, or left to the writer? | Engineering | **Decided 2026-11-11: enforced, from `approved` onwards.** Options were: leave it to `/feature`; a CI check only; or a CI check plus a `PostToolUse` hook. Taken: both, from one script ([`scripts/spec-lint.sh`](../../scripts/spec-lint.sh)), because the hook gives the feedback in seconds and CI is the part nobody can skip. Drafts are never blocked, so a seed draft still costs nothing. A spec written before the lenses — numbers 001–004, or any `Shipped:` date before 2026-11-11 — is checked for its header only |
| ww-D11 | How is "a product session commits docs only" enforced beyond the script? | Engineering | **Decided 2026-11-11: in CI, not in a hook.** Options were: a `PreToolUse` path guard (rejected — a product session runs no Claude Code hooks, so it would guard the wrong session); a committed `core.hooksPath` pre-commit hook (rejected — needs a `git config` per clone, so it is goodwill again, and it fires after the mistake is staged); a CI check on `docs/…` branches (taken) |
| ww-D12 | Does a session pull automatically at start, or report staleness? | Engineering | **Decided 2026-11-11: report.** Options were: a `SessionStart` hook that runs `git pull`; one that runs `git fetch` and reports; or nothing. Taken: fetch and report (§7.1). An automatic pull can land on a dirty tree or move the branch under a session mid-read, and loses the one thing a hook should keep — visibility |
