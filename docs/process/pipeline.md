# Pipeline

> **Living reference.** Written 2026-11-11, and current: all seven commands and the reviewer agent exist (updated 2026-11-13). Updated whenever a command is built or changed.
>
> What each command owns, and where it hands over. It does not repeat the rules: [docs/README.md](../README.md) owns the stages, [tracker.md](tracker.md) owns the board and how an epic is written, [ways-of-working.md](ways-of-working.md) owns the quality bar and the rhythm. This file owns the chain between them.

## 1. The loop

The loop is drawn once, in [system.md](system.md) §1. The commands on it:

| Command | Owns | State |
|---|---|---|
| `/initiative` | The bet itself: press release, sceptic's FAQ, strategy block | Built |
| `/roadmap` | What we do next, and the Now / Next / Later cut | Built |
| `/epic` | The GitHub epic: outcome, hypothesis, measures, stories | Built |
| `/feature` | The spec and the build, one stage at a time | Built |
| `/pr` | The verdict on one pull request, before it is merged | Built |
| `/audit` | What is wrong with what is already live | Built |
| `/milestone` | Whether the bets paid off, at M0, M1 and M2 | Built |

Each name is the thing the command owns. Nothing is named after a job that two commands share.

One **agent** sits under them: the reviewer ([`.claude/agents/reviewer.md`](../../.claude/agents/reviewer.md), pipe-D9). It never built what it reads. `/pr` calls it on a diff, `/feature` on a spec before the gate, `/initiative` on a press release before approval. It judges and reports; the command that called it does the writing.

## 2. What each command reads and writes

| Command | Cadence | Reads | Writes | Hands to |
|---|---|---|---|---|
| `/initiative` | Per bet, before its epics | working-doc §2–3, venture-analysis, epic-briefs §2, early-testers, learnings | the initiative file and the issue body; the reviewer's sceptic verdict on the press release | `/epic` |
| `/roadmap` | Monday, and after a strategy change | the initiatives and their key results and kill conditions, the board, open follow-ups, learnings, venture-analysis §11 as a dated reference, spec-backlog, **the dependency map** | recommended Horizon moves with a reason on the issue, the next brief | `/epic` |
| `/epic` | Per bet | a brief, a spec or an issue | the epic with **What done looks like**, its fields, story sub-issues with **Done when** | `/feature` |
| `/feature` | Per feature | the stages in docs/README.md, the spec | spec, wireframes, the reviewer's verdict at the gate, branch, PR, docs | `/pr`, then `/audit` |
| `/pr` | Per pull request | the spec, the diff, the lenses, the four principles | a verdict in three tiers; on an OK, one PR comment and the follow-up issues | the owner, who merges |
| `/audit` | After a ship, and before a gate | `scripts/audit-checks.sh`, shipped acceptance criteria, the seven UX tests, the fourteen lenses, the four principles | Bug issues under I3, rows in spec-backlog, `features.md` corrections, learnings rows | `/roadmap` |
| `/milestone` | At M0, M1, M2 | each epic's own measures, analytics, the board, open follow-ups | verdicts, an evidence pack, learnings rows | the owner, then `/roadmap` |

## 3. Rules every command follows

These are why the two existing commands have not drifted. Keep them in any new one.

1. **The rules live in a doc, not in the command.** The command names the doc and reads it. If a rule changes, the doc wins.
2. **One stage, then stop.** Report where the thing stands, do only the next step.
3. **A `check` mode that changes nothing.** Every command can answer "what is wrong right now?" without writing.
4. **Show, then wait.** Print the body or the `gh` commands and wait for an OK before writing to GitHub or to `main`.
5. **Owner decisions stay open**, with options and a recommendation, never answered (D27).
6. **Never restate a spec.** Link it, and where a reader needs the gist, summarise in plain words with the AC numbers and the spec version it was read from (trk-D7).

## 4. The handoffs

Each command ends by naming the next one. Added to `feature.md`, `epic.md` and `milestone.md` on 2026-11-11. The table below is the contract.

| After | Hand to | Line to add |
|---|---|---|
| `/initiative` writes a press release | `/epic` | "Next: `/epic <brief>` for the first epic under this initiative" |
| `/roadmap` writes a brief | `/epic` | "Next: `/epic <brief>`" |
| `/epic` creates an epic with no spec | `/feature` | "Next: `/feature <title>`, stage 1 benchmark" |
| `/feature` drafts the spec (stage 4) | the reviewer, then `/epic` | "Next: read the reviewer's verdict on the spec, then approve it; `/epic <spec>` to link the spec and set fields" |
| `/feature` passes the approval gate | `/epic` | "Next: `/epic <spec>` to create one story per build-order row" |
| `/feature` opens a pull request | `/pr` | "Next: `/pr <number>` from a session that did not build this" |
| `/pr` returns a verdict | the owner | "Next: your call. Nothing auto-merges" — or, with a must-fix open, "Next: `/feature <spec>` to fix it on this branch, then `/pr` again" |
| `/feature` ships | `/audit` | "Next: `/audit <spec>` once it is live" |
| `/audit` finds something | the board or the backlog | A Bug issue under I3, or a row in [spec-backlog.md](../product/spec-backlog.md) |
| `/milestone` records verdicts | `/roadmap` | "Next: `/roadmap` to re-cut Now / Next / Later" |

## 5. Keeping the board true: not a command

A command only runs when a person remembers to run it, and board hygiene fails exactly when people are busy. So the job splits three ways, and only the judgment part belongs in a command.

| Change | Handled by | Why |
|---|---|---|
| Item added to the project; issue closed becomes Shipped | GitHub Projects built-in workflows | No human memory needed |
| In build becomes In review when a PR opens | By hand, on the board | Two seconds of work. An Action would need a personal token to renew, for this one move |
| Fields on a new epic: Layer, Revenue Model, Horizon, Priority, milestone | `/epic` | Judgment |
| Horizon moves, re-parenting, milestone changes | `/roadmap` | Judgment |
| "The board says In build, the spec says draft" | `/epic check`, extended | A report, not a write |

Decided in pipe-D1: no Action and no token. The built-in workflows cover adding items and Shipped; In review is moved by hand; `/epic check` reports any drift.

## 6. The commands in detail

### 6.1 `/roadmap` — what we do next

**When:** Monday, and after any strategy change. **Input:** nothing, an initiative, or `check`.
Built 2026-11-11 (pipe-D6), both halves at once: pipe-D3 split it into December and January, and the
five changes below made the writing half cheap enough to build with the rest.

1. **State.** Open epics by Horizon and milestone, what is in the sprint, what is blocked, what has
   no spec yet. Cross-check against [dependency-map.md](dependency-map.md)'s register: a package it
   marks blocked on an unmerged prerequisite is reported as blocked here too, even if nothing on the
   issue itself says so.
2. **Work in progress, first.** Two or more epics `In build` or `In review` and it recommends
   nothing new: it reports what is in flight and stops. Two people cannot carry three open epics,
   and a roadmap that keeps starting work is how a quarter ends with nothing finished.
3. **Measures.** Print each open epic's leading measure and say whether it can be read today — is
   the analytics event named, and does it exist in the code? Flagged here, not at the gate
   (ways-of-working §1 check 7, lens L6 measurability).
4. **Kill conditions.** For every open initiative, read its kill condition and say whether what it
   describes has already happened. This is the weekly version of the milestone gate.
5. **Alignment and drift.** Name the initiative and key result each epic serves. Then compare the
   board's order with [venture-analysis.md](../product/venture-analysis.md) §11 and the briefs in
   [epic-briefs.md](../product/epic-briefs.md) — **printing that document's date**, because a
   difference from a three-month-old analysis is the document ageing, not drift.
6. **Follow-ups and learnings.** Count the open `follow-up` issues and name the oldest with its age:
   it goes in this sprint. At **eight or more**, recommend no new epic, as step 2 does for work in
   progress ([ways-of-working.md](ways-of-working.md) §5, ww-D17). Then read the
   [learnings](../product/learnings.md) added since last Monday and say which open epic or initiative
   each one touches.
7. **Next.** One or two things to start, sized against two people for one week. Skipped entirely if
   step 2 or step 6 stopped it.
8. **Brief.** Write or update the top brief in `epic-briefs.md` so `/epic` can take it.
9. Never rewrite [strategy.md](../product/strategy.md), and never answer a TBD. A Horizon move, a
   re-parenting or a milestone change is recorded as a comment on the issue with its reason, not
   only in a chat (ww-D7).

**Output:** a status report, recommended Horizon moves, and one brief ready for `/epic`. `check` mode
runs steps 1 to 6 and writes nothing.

### 6.2 `/audit` — what is wrong with what we shipped

**When:** after a spec ships, and before a gate. **Input:** `checks`, `qa`, `ux`, a spec number, or
`all`. Built 2026-11-11 (pipe-D7).

1. **The mechanical half first:** [`scripts/audit-checks.sh`](../../scripts/audit-checks.sh) finds
   socket events emitted with no listener (L5), locale keys missing from a language and hard-coded
   user-visible strings (L1), and API routers mounted without the auth middleware (L12). `checks`
   runs only this. It is **not** a CI check: it reports on code that already exists, and a required
   check that fails on day one gets bypassed (sys-D3).
2. `qa`: the acceptance criteria of shipped specs against the running app. Met, not met, or can't
   tell — and can't tell counts as not met.
3. `ux`: the seven tests in [brand-foundations.md](../brand/brand-foundations.md) §5 **and** the
   fourteen lenses in [design-lenses.md](design-lenses.md) applied to what is live. The lenses did
   not exist when this command was first drafted; they are what make the judgment half concrete.
4. Check the four principles in [CLAUDE.md](../../CLAUDE.md) against current behaviour, not against
   the spec.
5. Rank each finding: broken, confusing, slower than it should be, cosmetic.
6. **Route every one, after checking for a duplicate** (`gh issue list --state open --search …`).
   Broken against a spec becomes a Bug issue under **I3 what we have built works as documented**, or
   a comment on the issue that already exists. An improvement becomes a row in
   [spec-backlog.md](../product/spec-backlog.md). **A contradiction with `features.md` is fixed in
   `features.md`**, so documentation rot has a route like anything else. A pattern across findings
   — the same lens missed in three specs, say — becomes a row in
   [learnings.md](../product/learnings.md). Nothing stays only in the report.
7. Change no application code, and open no pull request except the `features.md` correction.

**Output:** a findings table, plus the issues and backlog rows it would create, shown for an OK
first. "Monthly" was dropped on purpose: a calendar ritual for two people is a ritual that gets
skipped, so it runs on ships and gates instead.

### 6.3 `/milestone` — did the bets pay off

**When:** at M0, M1 and M2. **Input:** the milestone.

1. List every epic closed since the previous milestone.
2. For each, read the leading and lagging measures in its own body against its own targets. Record: paid off, did not, or could not be measured.
3. Count "could not be measured" separately. It is a finding about how we work, not a result.
4. Run the milestone checklist in [ways-of-working.md](ways-of-working.md) §6, and count the open follow-ups per epic: debt carried into a gate is a finding too.
5. Set the result against the gate criteria in [tracker.md](tracker.md), "Milestones".
6. Draft the [learnings](../product/learnings.md) the verdicts support, one claim per row with its evidence, and show them for an OK.
7. Assemble the evidence and stop. The decision is the owner's.

**Output:** an evidence pack — measures against targets, the checklist, what the criteria say — and the learnings rows. No decision.

**Why there is no `/strategy` command.** Strategy changes three or four times a year, on evidence from interviews and milestones rather than on repo state, and the call is the owner's. `/milestone` prepares that conversation. A command would manufacture it from stale documents.

### 6.4 `/pr` — the verdict on one pull request

**When:** after a pull request is opened, before it is merged. **Input:** the pull request number. Built 2026-11-11 (pipe-D5). The command is [`.claude/commands/pr.md`](../../.claude/commands/pr.md).

1. Read the pull request, its diff, and the spec it names. If no spec can be found, say so and stop rather than inventing acceptance criteria.
2. Hand the spec and the diff to the **reviewer agent** in `pr` mode, and nothing else. [ways-of-working.md](ways-of-working.md) §3 requires a reviewer that did not build the thing; running the review in an agent makes that true even when `/pr` is typed in the session that wrote the code.
3. The reviewer checks four things: every acceptance criterion (met, not met, can't tell — "can't tell" counts as not met); the four product principles in [CLAUDE.md](../../CLAUDE.md); the fourteen lenses in [design-lenses.md](design-lenses.md) against what the diff actually does; and anything in the diff the spec did not ask for.
4. **It sorts every finding into one tier** — must fix, follow-up or nit — by the definitions in [ways-of-working.md](ways-of-working.md) §3.1 (ww-D17), and ends with one line: ready to merge, or the must-fix list.
5. Show the verdict. On an OK: post it as one pull-request comment, and create one issue per follow-up ([tracker.md](tracker.md), "Follow-ups from review"), after checking none already exists. Link the new issues in the comment.
6. Never merge, push, approve on GitHub, enable auto-merge, or edit code.

**Output:** a verdict the owner reads instead of the whole diff, and no finding that exists only in a comment. The merge stays the owner's.

### 6.6 The spec review at the gate

**When:** `/feature` has finished stage 4 and before the owner approves. Added 2026-11-13 (pipe-D9). It is not a command: `/feature` calls the reviewer agent in `spec` mode.

The reviewer reads the spec and the lenses, and nothing from the conversation that wrote it. It answers: is each acceptance criterion testable as written; is each lens answer true of the design, not just present; does every build-order row name its criteria and frames, and does every criterion land in a row; is every number sourced or marked (ww-D16); does every open decision carry options and a recommendation. Findings use the same three tiers. The owner reads the verdict, then approves or sends the spec back. Spec 012 exists because a careful read of spec 002 found three regressions; this makes that read routine instead of lucky.

### 6.5 `/initiative` — the bet itself

**When:** before an initiative's epics are written, and whenever an open initiative has no press
release. **Input:** an initiative number, a name, or `check`. Built 2026-11-11 (pipe-D8). The rules
and both templates are in [tracker.md](tracker.md), "Writing an initiative".

1. Report what the initiative already has — file, press release, sceptic's FAQ, six strategy lines —
   and write only what is missing.
2. The press release is the work: under one page, future-dated, in the host's words, and it carries
   the "so what?" test. If the release is not meaningfully better, easier or cheaper for the host,
   the command says so and recommends not doing the initiative.
3. It never invents a customer quote and presents it as real: draft wording is marked as the owner's
   to confirm.
4. Before the owner approves the press release, the reviewer agent reads it in `press-release` mode:
   the sceptic sys-D4 planned. It attacks the "so what?", the payer and the riskiest assumption, and
   checks the release against [learnings.md](../product/learnings.md).
5. `check` mode reports what is missing across every open initiative, **plus whether any kill
   condition has already happened**. It is the same read `/roadmap` step 4 does, available on its own.

**Output:** the initiative file, the issue body, and nothing restated between them.

## 7. Build order

| When | What | Why |
|---|---|---|
| Before 20 Nov | The handoff lines in §4. CI (ww-D1). Rollback (ww-D3) | **Done 2026-11-11.** The pilot is the deadline; new commands are not on the critical path |
| By 27 Nov | `/milestone` | **Built 2026-11-11.** M0 Pilot retro falls on 27 Nov and nothing checked a measure before |
| Before 20 Nov | The design lenses, `/pr`, and the three checks that run by themselves (spec lint, docs-only branches, session staleness) | **Built 2026-11-11.** The lenses apply to specs 005 onwards, so they have to exist before the next spec is written, not after |
| Before 20 Nov | `/initiative`, `/roadmap`, `/audit` and `scripts/audit-checks.sh` | **Built 2026-11-11**, ahead of pipe-D3's December and January dates. The five changes to each (§6.1, §6.2) made them cheap enough to finish in one pass, and `/initiative` has to exist before the next initiative is written rather than after |
| 13 Nov | The reviewer agent and its three modes; three-tier `/pr` with follow-up issues; the spec review at the gate; epics and stories that summarise done; learnings read and written by `/roadmap`, `/milestone`, `/audit` and `/initiative` | **Built 2026-11-13** from a product session (ww-D18). None of it touches the pilot build |
| December | The Friday digest, if the audit script has earned it (sys-D4) | Board automation is settled: built-in workflows only (pipe-D1, §5) |

## 8. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| pipe-D1 | Board automation and the extended `/epic check` (§5) | Engineering | **Decided 2026-11-11:** built-in Projects workflows only (auto-add open issues; item closed → Shipped). No Action, so no personal token to create or renew. In review is set by hand. `/epic check` compares board Status with spec headers and open PRs |
| pipe-D2 | The names `/roadmap`, `/audit`, `/milestone` | Product owner | **Decided 2026-11-11** |
| pipe-D3 | The build order in §7 | Product owner | **Decided 2026-11-11.** Amended twice the same day: `/roadmap check` moved to December with `/audit`; then both, plus `/initiative`, were built on 2026-11-11 (pipe-D6 to pipe-D8). December now holds only the Friday digest |
| pipe-D4 | Whether `/audit ux` may drive a browser, or only read code and report | Engineering | **Decided 2026-11-11: read-only, and only a client that is already running.** Options were: no browser at all (rejected — half the UX tests, focus order and what a guest sees at a glance, cannot be read from source); drive a browser freely, signing in and submitting forms (rejected — `/audit` changes nothing, and a session driving a signed-in client can change real trip data); **read-only on an already-running client: navigate, screenshot and read the accessibility tree, no form submission, no sign-in, no writes** (taken). `scripts/audit-checks.sh` needs no browser, so a missing one never blocks the command — it degrades to the checks plus a code read |
| pipe-D5 | `/pr` as a command, and where the reviewer runs | Engineering | **Decided 2026-11-11: built, reviewer in a subagent** (§6.4). Options were: a skill that loads itself (rejected — it would load into the session that wrote the code, which is the one thing §3 forbids); a command reviewing in the same session (rejected — self-review with extra steps); a command that hands spec and diff to a subagent (taken) |
| pipe-D6 | The five changes to `/roadmap` before building it | Engineering | **Decided 2026-11-11** (§6.1): a work-in-progress limit that refuses, measures printed and checked for readability, kill conditions read weekly, the drift baseline moved from a point-in-time analysis to the initiatives' key results with the analysis's date printed, and Horizon moves recorded on the issue. Options considered and rejected: build it as originally drafted (it would recommend work while three epics were in flight, and report drift that was really a stale document) |
| pipe-D7 | The five changes to `/audit` before building it | Engineering | **Decided 2026-11-11** (§6.2): the lenses added, the mechanical half split into a script, the script kept out of CI, a duplicate check before filing, and `features.md` given a route. "Monthly" dropped for ships and gates. Options rejected: build it as drafted (no lenses, no script, and one near-duplicate issue already proved the filing gap) |
| pipe-D8 | Is `/initiative` its own command, or a mode on `/epic`? | Engineering | **Decided 2026-11-11: its own command.** Options were: a mode on `/epic` (rejected — writing a press release is a different conversation from setting fields, and §1 says a command is named after the object it owns); a skill that loads itself (rejected — initiatives are written a handful of times a year, and a skill would have to guess the moment); its own command (taken) |
| pipe-D10 | Does `/roadmap` read the dependency map? | Product owner | **Decided 2026-11-13: yes.** Added to `/roadmap`'s reads in §2 and §6.1 step 1, next to the board and venture-analysis §11. [dependency-map.md](dependency-map.md) exists to answer exactly what step 7 ("one or two things to start") needs — what's blocked and on what — so leaving it out would mean the one document built to show that never reaches the command that recommends what's next |
| pipe-D9 · One reviewer agent | Where does independent judgment live, now that three steps need it (the pull request, the spec at the gate, the press release)? | Product owner | **Decided 2026-11-13: one agent definition, [`.claude/agents/reviewer.md`](../../.claude/agents/reviewer.md), with three modes**, called by `/pr`, `/feature` and `/initiative`. It replaces the reviewer instructions written inline in `/pr` and is the sceptic sys-D4 planned. Options rejected: three agents (three copies of what "independent" means, drifting apart); keep the review inline in each command (pipe-D5's subagent stays, but its definition would live in three places). The agent reads the rules from the process docs, like every command (§3) |

## Appendix A. `/roadmap` and `/audit`

Built on 2026-11-11 with the changes in §6.1 and §6.2 (pipe-D6, pipe-D7). The commands are
[`.claude/commands/roadmap.md`](../../.claude/commands/roadmap.md) and
[`.claude/commands/audit.md`](../../.claude/commands/audit.md); the earlier drafts of both are in git
history. A command is never copied into this file: the rule lives here, the command reads it (§3).

## Appendix B. `/initiative`

Built on 2026-11-11 (pipe-D8). The command is
[`.claude/commands/initiative.md`](../../.claude/commands/initiative.md); its rules and both
templates are in [tracker.md](tracker.md), "Writing an initiative".

## Appendix C. `/milestone`

Built on 2026-11-11. The command is [`.claude/commands/milestone.md`](../../.claude/commands/milestone.md); it is not copied here.
