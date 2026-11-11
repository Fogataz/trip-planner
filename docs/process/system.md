# How the whole thing fits together

> **Living reference.** Updated when an object, a document, a tool or a front changes. Written 2026-11-11.
>
> The one page that shows what we have and how it connects: the objects work travels through, the documents that hold them, the tooling that moves them, and the fronts beyond product and engineering. **It points; it never copies.** Where a detail is here and also in the document that owns it, the other document wins. This is the only document that carries tooling status, so the others do not try (sys-D1).

## 1. The loop

```
              strategy  (owner, at a gate: M0, M1, M2)
                  |
                  v
   /initiative --> /roadmap --> /epic --> /feature --> /pr --> ships
        ^                                                        |
        |                                                        v
   /milestone <------------------------------------------------ /audit
```

Work stops in exactly two places ([README.md](README.md)): the **spec gate** — no code before a spec
reaches `Status: approved` (D6) — and the **milestone gate**, where every bet is settled against its
own measure. Everything else is a recommendation, not a blocker (D27).

## 2. The objects

| Object | Carries | Lives in | Written by | Gate |
|---|---|---|---|---|
| **Strategy** | Vision, the bet, the layers, the revenue models, the principles | [strategy.md](../product/strategy.md), [working-doc.md](../product/working-doc.md) §2–3 | The owner, at a gate | — |
| **Initiative** `I#` | Outcome, key result, press release, sceptic's FAQ, the six-line strategy block | `docs/product/initiatives/I<n>-<slug>.md` + the GitHub issue | `/initiative` ([tracker.md](tracker.md), "Writing an initiative") | — |
| **Epic** `#<issue>` | Outcome title, problem, hypothesis, measures, stories, payer, stop condition | The GitHub issue | `/epic` ([tracker.md](tracker.md), "Writing an epic") | — |
| **Spec** `spec ###` | Benchmark, experience, requirements, acceptance criteria, build order, the fourteen lenses, open decisions | `docs/specs/NNN-*.md` | `/feature` ([README.md](../README.md)) | **Approval. No code before it** |
| **Story / Task / Bug / Spike** | One build-order row, or one defect | A GitHub sub-issue | `/epic` after approval, `/audit` for defects | — |
| **Shipped feature** | What the product does today | [features.md](../features.md) | Engineering, in the same pull request | — |

One rule holds the chain together: **each object links to the one below and never restates it.** The
board does not restate a spec; a spec does not restate a brief.

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
| `wireframes/` | Artifacts, linked from a spec | Either | The spec that uses them |
| [CLAUDE.md](../../CLAUDE.md) | Living: principles, layout, who does what | Engineering | Read automatically, every session |

Who commits what, and how, is [ways-of-working.md](ways-of-working.md) §7. In one line: documentation
goes through `scripts/docs-commit.sh` from a product session; code, config and anything mixed goes
through Claude Code.

## 4. The tooling

Everything that runs. **State** is the column to trust; the rest points at the document that owns the
rule.

| Tool | Kind | Owns | Runs | State | Will not |
|---|---|---|---|---|---|
| `/feature` | Command | The spec and the build, one stage at a time | Per feature, by hand | **Built** | Write code before the spec is approved |
| `/epic` | Command | The epic: outcome, hypothesis, measures, stories, fields | Per bet, by hand | **Built** | Answer an owner's decision |
| `/initiative` | Command | The initiative: press release, sceptic's FAQ, strategy block | Per bet, before its epics | **Built** 2026-11-11 | Invent the owner's words, or answer a TBD |
| `/pr` | Command | The verdict on one pull request | After a pull request opens | **Built** 2026-11-11 | Merge, push, or approve on GitHub |
| `/milestone` | Command | Whether the bets paid off | At M0, M1, M2 | **Built** | Make the gate decision |
| `/roadmap` | Command | What we do next, and the Now/Next/Later cut | Monday, and after a strategy change | **Built** 2026-11-11 | Recommend new work while the work-in-progress limit is reached |
| `/audit` | Command | What is wrong with what is already live | After a ship, and before a gate | **Built** 2026-11-11 | Change code, or file a duplicate issue |
| `design-lenses` | Skill | Pointing at the lens standard when a spec is open | Loads itself on `docs/specs/**` | **Built** | Reach a Cowork session — committed skills are Claude Code only |
| `session-staleness` | Hook (`SessionStart`) | Telling a session how stale the clone is | Every session start | **Built** | Pull. It only fetches and reports (ww-D12) |
| `spec-lint` | Hook (`PostToolUse`) | Telling a session what its spec is missing | After an `Edit` or `Write` | **Built** | Block a draft, or judge an answer's quality |
| `scripts/spec-lint.sh` | Script | The spec's required sections (ww-D10) | CI, the hook, and `/feature` stage 4 | **Built** | Lint a shipped spec nobody touched |
| `scripts/docs-only-check.sh` | Script | Docs-only branches (ww-D11) | CI on every `docs/…` pull request, and `docs-commit.sh` | **Built** | Allow a code file on a docs branch |
| `scripts/audit-checks.sh` | Script | The mechanical half of `/audit`: orphan socket events, locale-key parity, routes with no auth | On demand, from `/audit` | **Built** 2026-11-11 | Run in CI. It reports on code that already exists, and a required check that fails on day one gets bypassed (sys-D3) |
| `scripts/docs-commit.sh` | Script | A product session's docs-only commit, push and pull request (ww-D6) | From a product session | **Built** | Stage anything outside `docs/` |
| `.github/workflows/ci.yml` | CI | The quality gate ([ways-of-working.md](ways-of-working.md) §2, ww-D1) | Every pull request to `main` | **Built**, required on `main` | Auto-merge anything |
| GitHub Projects workflows | Board | Adding open issues; closed issues become Shipped (pipe-D1) | Automatically | **Built** | Move "In review" — that is done by hand |
| Friday digest | Scheduled agent | The prep for the Friday fifteen minutes | Weekly | **Proposed**, December (sys-D4) | — |
| Spec sceptic | Subagent | Attacking an initiative's press release before approval | Before an initiative is approved | **Proposed** (sys-D4) | — |

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
| **Hook** | A rule must hold every time, and forgetting is the failure | Two: staleness, spec sections |
| **Script** | The check has a right answer and needs no judgment | Four. `audit-checks.sh` is the newest |
| **Command** | A person starts a step that needs judgment | Seven |
| **Skill** | A rule is needed exactly when a file is open | One, the lenses, scoped to `docs/specs/**` |
| **Subagent** | The main session cannot hold the perspective | One: `/pr`'s reviewer, which enforces "did not build this" — something a human in that session cannot do. Next candidate: a sceptic that attacks a press release |
| **Scheduled agent** | The trigger is time, not a person | None yet. The Friday digest is the one candidate, because it removes preparation rather than adding a ritual |
| **Plugin** | Commands, skills and hooks must travel across repositories or people | **Nothing to gain now.** One repository, two people, and `.claude/` already travels with the repo. Reconsider at a second repository — a marketing site, a mobile app — or a third person |
| **Autonomous agent** | Volume exceeds what a person can absorb | No. Revisit above ten paying hosts, or when support passes a few messages a week |

## 7. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| sys-D1 | Does a single map exist, and what stops it rotting? | Engineering | **Decided 2026-11-11: yes, this file.** Options were: leave the three partial maps ([README.md](README.md), [docs/README.md](../README.md), [pipeline.md](pipeline.md)); add a map that copies them (rejected — a fifth map that rots); or a map that points and holds the one thing no other document has, the tooling table with status. Taken: the third |
| sys-D2 | The now / next / later cut across the six fronts, and a tripwire for each | Product owner | **Decided 2026-11-11** (§5), except the website, which stays blocked on **B3 brand name finalists** and is not answered here |
| sys-D3 | The automation ladder, and whether `audit-checks.sh` becomes a required CI check | Engineering | **Decided 2026-11-11:** the ladder in §6, and **not in CI.** It reports on code that already exists, so a required check would fail on day one and be bypassed, which is how a required check dies |
| sys-D4 | The Friday digest as a scheduled agent, and a sceptic subagent for press releases | Engineering | **TBD, December.** Options: build both in December; build the digest only once `audit-checks.sh` has run a few times and we know what it finds; build neither until a ritual is actually missed. Recommendation: **the digest in December, after the audit script has run twice**, and the sceptic once the first press release exists — an agent with nothing to attack is theatre |
