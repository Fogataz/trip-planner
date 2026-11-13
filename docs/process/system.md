# How the whole thing fits together

> **Living reference.** Updated when an object, a document, a tool or a front changes. Written 2026-11-11, updated 2026-11-13.
>
> The one page that shows what we have and how it connects: the objects work travels through, the documents that hold them, the tooling that moves them, and the fronts beyond product and engineering. **It points; it never copies.** Where a detail is here and also in the document that owns it, the other document wins. This is the only document that carries tooling status, so the others do not try (sys-D1).

## 1. The loop

This is the only copy of the diagram; the other process docs point here.

```
              strategy  (owner, at a gate: M0, M1, M2)
                  |                          ^
                  v                          |  a change cites its rows
   /initiative --> /roadmap --> /epic --> /feature --> /pr --> ships
        ^   (sceptic)   ^         (spec review)   (tiers)       |
        |               |                            |          v
        |               +---- follow-ups ------------+       /audit
        |                                                       |
   /milestone <-------------------------------------------------+
        |
        +--> learnings.md --> read by /roadmap and /initiative
```

Work stops in exactly two places ([README.md](README.md)): the **spec gate** — no code before a spec
reaches `Status: approved` (D6) — and the **milestone gate**, where every bet is settled against its
own measure. Everything else is a recommendation, not a blocker (D27).

Two loops run inside the big one. **Follow-ups:** a review files what is real but out of scope as an
issue, and `/roadmap` puts the oldest in every sprint (ww-D17). **Learnings:** what a gate, an audit
or an interview teaches goes in [learnings.md](../product/learnings.md), and the next initiative
starts from it (sys-D5).

## 2. The objects

| Object | Carries | Lives in | Written by | Gate |
|---|---|---|---|---|
| **Strategy** | Vision, the bet, the layers, the revenue models, the principles | [strategy.md](../product/strategy.md), [working-doc.md](../product/working-doc.md) §2–3 | The owner, at a gate | — |
| **Initiative** `I#` | Outcome, key result, press release, sceptic's FAQ, the six-line strategy block | `docs/product/initiatives/I<n>-<slug>.md` + the GitHub issue | `/initiative` ([tracker.md](tracker.md), "Writing an initiative") | — |
| **Epic** `#<issue>` | Outcome title, problem, hypothesis, measures, **what done looks like**, stories, payer, stop condition, wireframes link | The GitHub issue | `/epic` ([tracker.md](tracker.md), "Writing an epic") | — |
| **Spec** `spec ###` | Audit of what exists, benchmark, experience, requirements, numbered acceptance criteria, build order with ACs and frames per row, the fourteen lenses, open decisions | `docs/specs/NNN-*.md` | `/feature` ([README.md](../README.md)) | **Reviewer's verdict, then approval. No code before it** |
| **Story / Task / Bug / Spike** | One build-order row with its **Done when**, or one defect | A GitHub sub-issue | `/epic` after approval, `/audit` for defects | — |
| **Follow-up** | A real review finding outside the pull request's scope | A Task or Bug labelled `follow-up`, under the epic | `/pr`, on the owner's OK ([tracker.md](tracker.md), "Follow-ups from review") | Blocks the epic's Shipped |
| **Shipped feature** | What the product does today | [features.md](../features.md) | Engineering, in the same pull request | — |
| **Learning** `K#` | One claim, its evidence, a confidence, what it changes | [learnings.md](../product/learnings.md) | `/milestone`, `/audit`, research write-ups | — |
| **Research write-up** | One interview or test, same shape every time, and the tally the M1 gate counts | [research/](../product/research/README.md) | Product, from the template | — |

One rule holds the chain together: **each object links to the one below and never restates it.** The
board does not copy a spec — it summarises it in plain words with AC numbers, stamped with the spec
version, and the spec wins if they differ (trk-D7). A spec does not restate a brief.

## 3. The documents

By folder, because the per-document index already exists and should not be copied here.

| Folder | Kind | Who may edit | Index |
|---|---|---|---|
| [docs/README.md](../README.md) | Living: the stages and the specs table | Engineering and product | Itself |
| `docs/product/` | Living working docs, plus point-in-time analyses that are never rewritten | **Product only.** Engineering reads it | [docs/README.md](../README.md) contents |
| `docs/product/initiatives/` | Living while the initiative is open, frozen when it closes | Product (`/initiative`) | [tracker.md](tracker.md) |
| `docs/brand/` | Living | **Product only** | [docs/README.md](../README.md) |
| `docs/process/` | Living | Product may edit (ww-D5); engineering owns this file's tooling table | [README.md](README.md) |
| `docs/specs/` | Point-in-time. **Never renamed, moved or rewritten** | Engineering writes, the owner approves | The specs table in [docs/README.md](../README.md) |
| [docs/features.md](../features.md) | Living: what the code does today | **Engineering only** | [docs/README.md](../README.md) |
| `wireframes/` | Artifacts, linked from a spec, each set with a Build status per frame (trk-D6) | Either — a product session commits them with `docs-commit.sh` (ww-D13) | The spec that uses them |
| [CLAUDE.md](../../CLAUDE.md), [AGENTS.md](../../AGENTS.md) | Living: principles, layout, conventions summary, who does what | Either (ww-D18). A change to the conventions summary is re-pinned and named in the pull request (ww-D14) | Read automatically, every session |
| `.claude/commands/`, `.claude/agents/`, `.claude/skills/` | The process tooling (§4) | Claude Code (the Cowork bridge cannot write it) | §4 below |
| `scripts/*.sh`, `CLAUDE.md`, `AGENTS.md` | The process tooling (§4) | Either (ww-D18) | §4 below |
| `.claude/hooks/`, `.claude/settings.json`, `.github/`, data scripts | Run on their own, or touch data | **Engineering only** | §4 below |

Who commits what, and how, is [ways-of-working.md](ways-of-working.md) §7. In one line: documentation,
`CLAUDE.md`, `AGENTS.md` and `scripts/*.sh` go through `scripts/docs-commit.sh` from a product session; application code,
all of `.claude/`, CI and anything mixed goes through Claude Code.

## 4. The tooling

Everything that runs. **State** is the column to trust; the rest points at the document that owns the
rule.

| Tool | Kind | Owns | Runs | State | Will not |
|---|---|---|---|---|---|
| `/feature` | Command | The spec and the build, one stage at a time; calls the reviewer on the spec before the gate | Per feature, by hand | **Built**; gate review 2026-11-13 | Write code before the spec is approved |
| `/epic` | Command | The epic and its stories: outcome, hypothesis, measures, **what done looks like**, **done when** per story, fields. `check` flags stale summaries and open follow-ups | Per bet, by hand | **Built**; summaries 2026-11-13 (trk-D7) | Answer an owner's decision, or copy the spec's text |
| `/initiative` | Command | The initiative: press release, sceptic's FAQ, strategy block; calls the reviewer as sceptic | Per bet, before its epics | **Built** 2026-11-11; sceptic 2026-11-13 | Invent the owner's words, or answer a TBD |
| `/pr` | Command | The verdict on one pull request, in three tiers, and the follow-up issues on an OK | After a pull request opens | **Built** 2026-11-11; tiers 2026-11-13 (ww-D17) | Merge, push, approve on GitHub, or file a nit |
| `/milestone` | Command | Whether the bets paid off, and the learnings they support | At M0, M1, M2 | **Built**; learnings 2026-11-13 | Make the gate decision |
| `/roadmap` | Command | What we do next, and the Now/Next/Later cut; the follow-up count and the new learnings | Monday, and after a strategy change | **Built** 2026-11-11 | Recommend new work while the work-in-progress limit or the follow-up cap is reached |
| `/audit` | Command | What is wrong with what is already live | After a ship, and before a gate | **Built** 2026-11-11 | Change code, file a duplicate issue, or sign in to a running client — the browser is read-only (pipe-D4) |
| `reviewer` | Agent (`.claude/agents/reviewer.md`) | Independent judgment in three modes: a pull request, a spec, a press release. Replaces the inline subagent in `/pr` and is the sceptic sys-D4 planned (pipe-D9) | Called by `/pr`, `/feature`, `/initiative` | **Built** 2026-11-13 | Edit, post or file anything. It reports; the command writes |
| `design-lenses` | Skill | Pointing at the lens standard when a spec is open | Loads itself on `docs/specs/**` | **Built** | Replace the document. Whether a Cowork session loads it depends on the client; one did on 2026-11-13 |
| `session-staleness` | Hook (`SessionStart`) | Telling a session how stale the clone is | Every session start | **Built** | Pull. It only fetches and reports (ww-D12) |
| `spec-lint` | Hook (`PostToolUse`) | Telling a session what its spec is missing | After an `Edit` or `Write` | **Built** | Block a draft, or judge an answer's quality |
| `claude-md-mirror` | Hook (`PostToolUse`) | Telling a session that the docs conventions moved and `CLAUDE.md` needs a re-pin (ww-D14) | After an `Edit` or `Write` | **Built** 2026-11-12 | Fix the summary. A person re-reads it |
| `scripts/spec-lint.sh` | Script | The spec's required sections (ww-D10); from spec 013, every acceptance criterion in a build-order row (trk-D7) | CI, the hook, and `/feature` stage 4 | **Built**; coverage 2026-11-13 | Lint a shipped spec nobody touched |
| `scripts/claude-md-mirror-check.sh` | Script | The pin between `docs/README.md`'s conventions and `CLAUDE.md`'s summary (ww-D14) | CI, the hook, and `--update` by hand | **Built** 2026-11-12 | Check that the words match. It checks that someone looked |
| `scripts/locale-lint.sh` | Script | Role labels never inflect for gender (O8 · Ungendered role labels) | CI | **Built** 2026-11-12 | Judge Spanish or Portuguese beyond the role-label keys |
| `scripts/check.sh` | Script | Everything CI fails you for, in one command: `npm run check`, `--fast` (ww-D15) | By hand, before a push | **Built** 2026-11-12 | Run `npm audit` as a failure |
| `scripts/docs-only-check.sh` | Script | The paths a product session may change: documentation and process tooling (ww-D11, ww-D13, ww-D18). `--pattern` prints the rule | CI on every `docs/…` pull request, and `docs-commit.sh` | **Built**; widened 2026-11-13 | Allow application code, hooks, settings, CI or data scripts on a `docs/…` branch |
| `scripts/audit-checks.sh` | Script | The mechanical half of `/audit`: orphan socket events, locale-key parity, routes with no auth | On demand, from `/audit` | **Built** 2026-11-11 | Run in CI. It reports on code that already exists, and a required check that fails on day one gets bypassed (sys-D3) |
| `scripts/docs-commit.sh` | Script | A product session's commit, push and pull request (ww-D6, ww-D18); prints the computer-side command when Cowork blocks the push | From a product session | **Built**; widened 2026-11-13 | Stage anything outside the allowed paths |
| `.github/workflows/ci.yml` | CI | The quality gate ([ways-of-working.md](ways-of-working.md) §2, ww-D1) | Every pull request to `main` | **Built**, required on `main` | Auto-merge anything |
| GitHub Projects workflows | Board | Adding open issues; closed issues become Shipped (pipe-D1) | Automatically | **Built** | Move "In review" — that is done by hand |
| `follow-up` label and Follow-ups view | Board | Where review follow-ups are counted, oldest first (ww-D17) | By hand, once | **To set up** — a product session's token cannot create labels or views | — |
| Friday digest | Scheduled agent | The prep for the Friday fifteen minutes | Weekly | **Proposed**, December (sys-D4) | — |

## 5. The fronts

Product and engineering are covered above. These are the rest. Each one has a **tripwire** rather
than only a date, because a date we invent now is a date we miss and then ignore (sys-D2).

| Front | Where it stands | Now | Next (to M1, 26 Feb) | Later | Tripwire |
|---|---|---|---|---|---|
| **User research** | The strongest front: [discovery-amf-pmf.md](../product/discovery-amf-pmf.md), [early-testers.md](../product/early-testers.md) with interview questions and "how we run a test", five dated spikes | **A write-up template and a tally.** I7's key result counts who names the Sheets-and-WhatsApp pain unprompted across 15 interviews, and there is nowhere to count it. First three are due 18 Dec; the 27 Nov retro is itself research | 15 host interviews, 5 wedding planners | A research summary per gate | The second interview written up in a different shape from the first |
| **Benchmarking** | Stage 1 per feature; [venture-analysis.md](../product/venture-analysis.md) and [premium-buyer-lens.md](../product/premium-buyer-lens.md) at market level | — | **A one-page living competitor register:** who, price, who they serve, what they do better, our answer. D37 prices cannot be chosen in a host conversation without it | Win/loss notes | The first host who says "I already use X" |
| **Sales and outreach** | Leads in [discovery-amf-pmf.md](../product/discovery-amf-pmf.md) §5.1, a "to recruit" list, and a funnel named in [working-doc.md](../product/working-doc.md) §11 | — | **A Status column on the early-testers register**, using the funnel stages, so counts live in the repo while names and contact details stay out of it (and in one private place of the owner's) | A real pipeline tool | More than ~30 contacts in flight |
| **Marketing** | [brand-foundations.md](../brand/brand-foundations.md) voice and naming, GTM phases and channels, the community plan | — | **Nothing new.** The initiative press releases become the messaging source, so this comes free | Content, templates, the "made with" loop | The first host quote we are allowed to publish |
| **Website** | Nothing, and **blocked rather than neglected: the product has no name.** B3 name finalists are TBD and clearance has not run | — | — | **One credibility page, after B3.** Phase 1 is founder-led DMs, where one page helps. Not a signup funnel | B3 decided |
| **Customer support** | Nothing. For the pilot, the plan is that both of us are in the room, and [ways-of-working.md](ways-of-working.md) §4 covers breakage. A guest's fallback is the organisers' group chat | — | — | **A process at M1.** R4 warns that done-with-you work becomes a second job, and support load is what kills five concierge customers | **The third paying host** |

## 6. When to add more automation

The rule: **automate an invariant, script a mechanical check, command a judgment step, and give an
agent a perspective we cannot hold ourselves.** Anything that does not fit one of those four is
ceremony (sys-D3).

| Level | Worth it when | Where we are |
|---|---|---|
| **Hook** | A rule must hold every time, and forgetting is the failure | Three: staleness, spec sections, the `CLAUDE.md` pin. None added on 2026-11-13: every new rule had a script or a command to live in |
| **Script** | The check has a right answer and needs no judgment | Seven process scripts. AC coverage went into `spec-lint.sh` rather than a new one |
| **Command** | A person starts a step that needs judgment | Seven |
| **Skill** | A rule is needed exactly when a file is open | One, the lenses, scoped to `docs/specs/**` |
| **Agent** | The main session cannot hold the perspective | One: `reviewer`, which enforces "did not build this" in three places — the pull request, the spec at the gate, and the press release (pipe-D9). One definition rather than three, so "independent" means the same thing everywhere |
| **Scheduled agent** | The trigger is time, not a person | None yet. The Friday digest is the one candidate, because it removes preparation rather than adding a ritual |
| **Plugin** | Commands, skills and hooks must travel across repositories or people | **Nothing to gain now.** One repository, two people, and `.claude/` already travels with the repo. Reconsider at a second repository — a marketing site, a mobile app — or a third person |
| **Autonomous agent** | Volume exceeds what a person can absorb | No. Revisit above ten paying hosts, or when support passes a few messages a week |

## 7. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| sys-D1 | Does a single map exist, and what stops it rotting? | Engineering | **Decided 2026-11-11: yes, this file.** Options were: leave the three partial maps ([README.md](README.md), [docs/README.md](../README.md), [pipeline.md](pipeline.md)); add a map that copies them (rejected — a fifth map that rots); or a map that points and holds the one thing no other document has, the tooling table with status. Taken: the third |
| sys-D2 | The now / next / later cut across the six fronts, and a tripwire for each | Product owner | **Decided 2026-11-11** (§5), except the website, which stays blocked on **B3 brand name finalists** and is not answered here |
| sys-D3 | The automation ladder, and whether `audit-checks.sh` becomes a required CI check | Engineering | **Decided 2026-11-11:** the ladder in §6, and **not in CI.** It reports on code that already exists, so a required check would fail on day one and be bypassed, which is how a required check dies |
| sys-D4 | The Friday digest as a scheduled agent, and a sceptic subagent for press releases | Engineering | **Decided 2026-11-11.** The **digest in December, after `audit-checks.sh` has run at least twice**, so it reports what the script actually finds rather than what we guess it will. The **sceptic once the first press release exists** — an agent with nothing to attack is theatre. Options rejected: build both now (both would be written against imagined input); build neither until a ritual is missed (the digest removes preparation rather than adding a ritual, which is the whole case for it). **Amended 2026-11-13:** the sceptic was built early, as the `press-release` mode of the one reviewer agent (pipe-D9). Building the agent for `/pr` and the spec gate made the third mode a few lines, not a new agent |
| sys-D5 · A learnings register | Where does what we learn go, so it changes the next bet? | Product owner | **Decided 2026-11-13: [learnings.md](../product/learnings.md)**, one claim per row with its evidence and a confidence, written by `/milestone`, `/audit` and research write-ups, read by `/roadmap` and `/initiative`. A strategy change at a gate cites its rows. Options rejected: leave it in retro notes and milestone comments (each bet's lesson stayed with that bet); a per-initiative "lessons" section (frozen when the initiative closes, so the next one never reads it) |
| sys-D6 · roadmap.md shrinks | `roadmap.md` still lists phases 1–7, retired by name-D4, and every ship must update it by hand | Product owner | **Decided 2026-11-13: shrink it to "parked and not planned"**, and drop it from "When a spec ships" (docs/README.md, CLAUDE.md, ways-of-working §1 check 5). The board and `/roadmap` own Now / Next / Later. **Applied after PR #124 merges**, because that pull request edits `roadmap.md` and the conventions it is listed in; doing both at once would leave the pilot build a merge conflict to resolve |
