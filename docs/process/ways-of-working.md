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
| 9 | No **must fix** finding is open, and every **follow-up** from the review exists as an issue, linked from the pull request (§3, ww-D17) | Reviewer |

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
| Docs-only branches | [`scripts/docs-only-check.sh`](../../scripts/docs-only-check.sh) on any pull request from a `docs/…` branch: documentation and process tooling only (ww-D11, ww-D13, ww-D18) | Now |
| Server tests | A real suite, supertest on the health and auth routes first, replacing the placeholder | After the pilot |

CI runs on every pull request to `main`. A red check blocks the merge. Nothing auto-merges: the product owner's OK is still required.

The two new steps are the same scripts the local tooling runs, not a second copy of the rule. `spec-lint.sh` is also a `PostToolUse` hook, so a session that writes a spec is told immediately; `docs-only-check.sh` is step 3 of `scripts/docs-commit.sh`. CI is the backstop, because the `ci` check is required on `main` and a hook is not: a hook only runs where Claude Code runs (§7.1).

## 3. Reviewing code Claude wrote

Most of this code is written by Claude Code, so the review has to come from outside the session that wrote it.

- The reviewer is a session or subagent that did **not** build the feature. It gets the spec and the diff, nothing else.
- It answers one question per acceptance criterion: met, not met, or can't tell. Then it lists anything in the diff the spec did not ask for.
- "Can't tell" counts as not met.
- The product owner reads the verdict rather than the whole diff, and merges.

Run it with `/pr <number>` ([pipeline.md](pipeline.md) §6.4, pipe-D5). The command hands the spec and the diff to the **reviewer agent** ([`.claude/agents/reviewer.md`](../../.claude/agents/reviewer.md), pipe-D9), so the rule holds even when `/pr` is typed in the session that wrote the code. It never merges, pushes, or approves on GitHub.

This is the cheapest insurance a two-person team has. The session that just built something is the worst judge of it, because it already believes it works.

### 3.1 Three tiers of finding (ww-D17)

Two failures to avoid: holding a feature that already adds value for a matter of taste, and merging on a promise to "clean it up later". Google's reviewer guide names both: approve once a change [definitely improves the code](https://google.github.io/eng-practices/review/reviewer/standard.html), even if it is not perfect, but expect a [cleanup promised for later never to happen](https://google.github.io/eng-practices/review/reviewer/pushback.html) unless it is done straight away or filed. Every finding goes in exactly one tier, and the tier is set by **what kind of finding it is**, not by how strongly the reviewer feels:

| Tier | What belongs here | What happens |
|---|---|---|
| **Must fix** | An acceptance criterion not met or can't tell. A conflict with a product principle. A lens the code gets wrong — L1 a hard-coded or untranslated string, L4 personal data, L5 an emit with no listener, L11 an existing trip that breaks, L12 a role check only in the UI. A security or data-loss risk. A problem in the code **this pull request wrote** that takes minutes to fix | Blocks the merge. Fixed on the same branch, then `/pr` again |
| **Follow-up** | Real, but outside this pull request: a problem it exposed in older code, or an improvement beyond the spec's scope | Filed as an issue **before** the merge, on the owner's OK: label `follow-up`, parent the same epic, linked from the pull request. Never a `TODO` comment in code — the issue is the record |
| **Nit** | Taste: naming, wording, style | Listed once, in one line each. Take it or leave it. Never filed |

The pull request is ready to merge when no must-fix is open and every follow-up exists as an issue (§1 check 9). A must-fix the owner chooses to defer becomes a follow-up **with his name and the reason on it**, so the exception is visible rather than silent.

Follow-ups are paid weekly (§5), and an epic does not move to Shipped while any of its follow-ups is open, unless each one is moved under I3 · What we have built works as documented with a reason ([tracker.md](tracker.md), "Follow-ups").

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
| Monday, 15 min | What is in this sprint and what is not. **The oldest open follow-up goes in** (ww-D17). With **eight or more** open, no new epic starts until the count is below eight — `/roadmap` reports both | Sprint set on the board |
| Friday, 15 min | Retro and demo: what shipped against what was planned, one process friction, one thing to keep. **Any follow-up older than four weeks is decided:** next sprint, or closed as won't-fix with the reason on the issue | Three lines, in the sprint item or here |
| Friday, 5 min | Read the analytics events shipped so far: trend, not detail | Noted only if it changes a priority |

Two people need no more ceremony than this. The Friday quarter of an hour exists so process problems surface weekly instead of at a gate three months away.

Follow-ups ride on these two rituals rather than getting a third. Closing one on purpose is a fine outcome; one that sits for months is the failure. The eight is a working default, not a measured number (D27): change it at a retro if it proves wrong.

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
| `docs/`, `wireframes/`, and the process tooling: `.claude/commands/`, `.claude/agents/`, `.claude/skills/`, `CLAUDE.md`, `AGENTS.md`, `scripts/*.sh` | The product session | `scripts/docs-commit.sh <branch-suffix> "<message>" [path ...]` (§7.5, ww-D6, ww-D18) |
| Application code, config, lockfiles, data scripts (`scripts/*.js`, `scripts/lib/`), `.claude/hooks/`, `.claude/settings.json`, `.github/` | Claude Code | Branch, pull request, review, as today |
| A mix of the two | Claude Code | One pull request, so the docs land with the code that made them true |

The script stages only those paths and refuses if anything else reaches the index. That is the whole safety model: a product session cannot commit application code, hooks or CI, because the script will not let it. **Amended 2026-11-11 (ww-D13):** `wireframes/` was added after the guard blocked a product session's own stage-3 frames. **Amended 2026-11-13 (ww-D18):** the process tooling was added, because the commands, the reviewer agent and the rules in `CLAUDE.md` are how the product side's process is enforced, and routing every change to them through Claude Code made the process the slowest thing to change. What stays out is what runs on its own on someone's machine (hooks, settings) or touches data (migrations). A pull request that changes `CLAUDE.md` or a command says so in its description, so whoever reviews it sees the rules moved.

**One limit the rule cannot lift.** The Cowork device bridge refuses every write to `.claude/` ("Writing to .claude is not permitted via remote tools", found 2026-11-13), whatever the repo allows. So a product session drafts a `.claude/` change under `docs/process/pending-claude/`, mirroring the path (`docs/process/pending-claude/commands/pr.md` → `.claude/commands/pr.md`), and Claude Code moves it into place on the same branch before the merge:

```bash
git mv -f docs/process/pending-claude/<path> .claude/<path>   # per file, then commit and push
```

The folder is empty on `main`; a pull request that still has files in it is not ready to merge. `CLAUDE.md`, `AGENTS.md` and `scripts/*.sh` have no such limit.

**And CI says the same thing (ww-D11).** A hook cannot enforce this: a product session does not run Claude Code's hook loop at all, so a path guard would constrain only the session that is allowed to write everywhere. So the guard lives where nobody can skip it — [`scripts/docs-only-check.sh`](../../scripts/docs-only-check.sh) runs in CI on every pull request from a `docs/…` branch and fails if the diff touches anything outside the allowed paths. The rule lives once, in that script (`--pattern`), and `docs-commit.sh` reads it. The trade-off, named: branch names are load-bearing. An engineering change parked on a `docs/…` branch fails CI, and the fix is to rename the branch.

**Pull, or know how stale you are (ww-D12).** A `SessionStart` hook runs `git fetch` — read-only, so it cannot lose work — and tells the session how far behind `main` and the working branch are, how many files are uncommitted, and the one command that fixes it. It never pulls: a pull inside a hook runs invisibly, can land on a dirty tree or mid-rebase, and can move the branch under a session that has already read files. The pull stays a deliberate first step, as [CLAUDE.md](../../CLAUDE.md) already requires.

**Which git a product session may run (ww-D8).**

| May run | Why it is safe |
|---|---|
| `git fetch`, `git pull --ff-only`, `git status`, `git log`, `git diff` | Read-only or fast-forward. None of them can lose work or write to the remote |
| `scripts/docs-commit.sh` | Stages the allowed paths only and refuses anything else (§7.5) |
| Nothing else — committing by hand, `merge`, `rebase`, `reset`, `push`, checking out code, any `git config` | Engineering's, every time |

**Pull before you edit.** It is the step most likely to be skipped, and the only thing that keeps a product session and Claude Code in sync. If the pull is refused, say so and name the commit you are working from, rather than editing from an unknown base.

**Pushing from a product session (ww-D9).** It needs three things on that device: a git identity in the clone, network to GitHub, and `gh` logged in inside the device-bridge sandbox with a fine-grained, repo-scoped, short-lived token. The steps, the token's scope, the trade-off of a plaintext token in that sandbox, and the fallbacks (push from macOS, or edit through GitHub in the browser) are in [device-setup.md](device-setup.md). The sandbox can be reset between sessions, so check `gh auth status` before relying on it. The history of how this was first made to work is in git, not here.

### 7.2 Claude Code reports into the repo, never only into its chat

An engineering session ends by writing its outcome where the other session can read it: the pull request, the document it changed, or the board. The product owner does not carry output between sessions by hand (ww-D7).

### 7.3 One work order out, one report in

A product session ends with one work order: what changed, what to do, and what not to do yet. An engineering session ends with one pull request plus the line in 7.2. Anything either session notices on the way becomes a row in [spec-backlog.md](../product/spec-backlog.md) or a decision code in the document that owns it, never another trip.

### 7.4 What a product session still never does

Edit application code, config, lockfiles, data scripts, hooks or CI (ww-D18). Commit by hand, merge, rebase, reset, push, or change git config (ww-D8). Rewrite a shipped spec. Answer a TBD.

### 7.5 `scripts/docs-commit.sh`

The script is [scripts/docs-commit.sh](../../scripts/docs-commit.sh); its header is the reference. It runs end to end in Claude Code, and from a product session once that sandbox's `gh` is logged in (§7.1).

```bash
scripts/docs-commit.sh <branch-suffix> "<commit message>" [path ...]
```

Start on `main`. The script updates it, creates `docs/<branch-suffix>`, commits, pushes and opens the pull request. Run it again from that branch to add to the same pull request. Name paths to commit only those files; with no paths it commits everything changed under the allowed paths (§7.1).

It refuses, before it changes anything, when:

- a path given, or a file already staged, is outside the allowed paths (`scripts/docs-only-check.sh --pattern`);
- you are on any branch other than `main` or `docs/<branch-suffix>`, so another branch's commits cannot ride along;
- the branch already carries commits that touch files outside them.

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
| ww-D13 | Does the docs-only guard allow `wireframes/`? | Engineering | **Decided 2026-11-11: yes.** Found when pull request #102 — a product session's own stage-3 frames for spec 002 — would have failed the guard it was supposed to be protected by. Options were: keep `docs/` only and have engineering commit every wireframe (rejected — it makes a trip to Claude Code out of the one artefact stage 3 exists to produce); move wireframes under `docs/` (rejected — it breaks every existing link and the spec header convention); allow `wireframes/` alongside `docs/` in both the script and the CI check (taken). Frames are static lo-fi HTML, never served to users |
| ww-D12 | Does a session pull automatically at start, or report staleness? | Engineering | **Decided 2026-11-11: report.** Options were: a `SessionStart` hook that runs `git pull`; one that runs `git fetch` and reports; or nothing. Taken: fetch and report (§7.1). An automatic pull can land on a dirty tree or move the branch under a session mid-read, and loses the one thing a hook should keep — visibility |
| ww-D14 · CLAUDE.md mirror | CLAUDE.md summarizes conventions docs/README.md owns, and product edits one while engineering owns the other. How do we stop the summary going stale? | Engineering | **Decided 2026-11-12: pin it in CI.** CLAUDE.md is loaded into every session, so a stale summary is followed by every session until someone notices. Options were: let a `docs/…` branch edit CLAUDE.md (rejected — it lets a product session change the rules engineering runs on without engineering seeing it, which is exactly what ww-D11 exists to prevent); require the two texts to match verbatim (rejected — CLAUDE.md says "In short:" on purpose, and a copy is not a summary); **hash the conventions sections of docs/README.md and pin that hash in CLAUDE.md** (taken). Changing docs/README.md fails CI until a person re-reads the summary and re-pins with [`scripts/claude-md-mirror-check.sh`](../../scripts/claude-md-mirror-check.sh) `--update`. It guarantees someone looked, not that the words match |
| ww-D15 · One local check | The `.claude/` hooks give a Claude Code session its answers inside the edit. Codex, Copilot and a person get them only when the pull request goes red. Close that gap, or accept it? | Engineering | **Decided 2026-11-12: close it with one command, not more hooks.** Options were: accept it (rejected — it makes the repo quietly worse for every agent but one, which contradicts AGENTS.md's "one set of rules for every tool"); a committed `core.hooksPath` pre-commit hook (rejected for the same reason as ww-D11 — it needs a `git config` per clone, so it is goodwill again); **`npm run check`** (taken), which mirrors CI step for step minus `npm audit`. The local path was always possible; it was four commands nobody remembered. `--fast` skips the client build for the seconds-long version. Also added [`scripts/locale-lint.sh`](../../scripts/locale-lint.sh), because O8 · Ungendered role labels was a rule in a spec and a rule in a spec is goodwill |
| ww-D16 · Evidence markers | How does a document show what is not known? | Product owner | **Decided 2026-11-13.** **TBD** stays the owner's open decision. Two markers are added: `[assumption]` for something we believe and have not checked, and `[unverified]` for a fact or number not yet traced to a source. A number in a spec, initiative or analysis carries its source and date, or one of the markers. The rule lives in [docs/README.md](../README.md), "How to update"; the reviewer treats an unmarked, unsourced number as a finding. Options rejected: a full evidence-grading scale (ceremony for two people); nothing (an invented number reads the same as a measured one) |
| ww-D17 · Three tiers of finding | Does a pull request wait for every change the review asks for, or merge and fix later? | Product owner | **Decided 2026-11-13: neither — three tiers (§3.1).** Must fix blocks, by category; follow-ups are filed as issues before the merge and paid weekly (§5); nits are listed and never filed. Options rejected: request every change before merging (stalls features that already add value, and lets taste block a release); merge and note the rest in the pull request (a note in a merged pull request is never reopened). The cap of eight open follow-ups is a working default |
| ww-D18 · Product maintains process tooling | May a product session change the commands, agents, skills, `CLAUDE.md` and the process scripts, or only describe the changes for Claude Code? | Product owner | **Decided 2026-11-13: it may change them** (§7.1). Allowed: `.claude/commands|agents|skills/`, `CLAUDE.md`, `AGENTS.md`, `scripts/*.sh`. Still engineering's: application code, config, lockfiles, data scripts, `.claude/hooks/`, `.claude/settings.json`, `.github/`. Amends ww-D8, ww-D11 and ww-D14: the guard and the CI check enforce the wider list, and the `CLAUDE.md` pin now makes a convention change visible rather than separating who edits it. Option rejected: a work order for every process change (the process became the slowest thing in the repo to change, for files that hold no application logic). **Limit found the same day:** the Cowork bridge refuses writes to `.claude/`, so those changes travel under `docs/process/pending-claude/` and Claude Code moves them into place before the merge (§7.1) |
