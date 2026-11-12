# Starting the pilot build on another machine or agent

> **Runbook.** Written 2026-11-12, when specs 002, 011 and 012 were approved and the build had to be able to start on a different computer, a different account, or a different agent from the one that wrote them. It is written for **any** of them — Claude Code, Codex, Copilot or a person.
>
> This is the "you have the repo and nothing else" page. It assumes **nothing from any chat**: everything the build needs is in the repo, which is the point of [ww rule 1](../README.md#working-across-accounts-and-computers) — the repo is the only source of truth, and nothing syncs between accounts except it.
>
> **Not using Claude Code?** Nothing here depends on it. The `.claude/` hooks and commands do not run elsewhere, and nothing is lost by that: every rule they enforce is also a CI check on the pull request. [AGENTS.md](../../AGENTS.md) has the table. Run the two scripts in §2 before you push and the difference disappears.

## 0. The one-paragraph brief

We are building the **hosted event pilot**: a real company gathering in Madrid on **24–25 Nov 2026** runs on Trip Planner. Attendees join from a link, hosts turn an agenda into a reviewed schedule with AI, announcements reach everyone, and we measure all of it. The build window is **12–19 Nov** with a cut-line check on **Tue 17 Nov** and a dry run on **Fri 20 Nov**. Three specs are approved and the data model is settled. Nothing is built yet.

## 1. Get the repo and read in this order

```bash
git clone https://github.com/Fogataz/trip-planner.git && cd trip-planner
```

Already cloned? **Pull first — always.** Specs were renumbered on 11 Nov and working from a stale copy means working from spec numbers that no longer exist:

```bash
git checkout main && git pull --ff-only
```

Then read, in this order. It is about 90 minutes and it replaces every conversation that produced it.

| # | Read | Why |
|---|---|---|
| 1 | [CLAUDE.md](../../CLAUDE.md) | The rules. Layout, commands, product principles, who does what. |
| 2 | [docs/README.md](../README.md) | How a feature goes from idea to shipped, the specs table, the conventions. |
| 3 | [docs/specs/002-hosted-event-pilot.md](../specs/002-hosted-event-pilot.md) | **What we are building.** §7 requirements, §8 acceptance criteria, §12 the eleven build-order parts. |
| 4 | [docs/specs/011-roles-and-permissions.md](../specs/011-roles-and-permissions.md) | **The model everything sits on.** §5 capabilities, §6 lifecycle and the five guarantees, §10.2 the technical shape. |
| 5 | [docs/specs/012-joining-naming-and-the-first-trip.md](../specs/012-joining-naming-and-the-first-trip.md) | A QA pass over 002 that found three regressions it would otherwise ship. §4 is the register; §12 is the slice plan. |
| 6 | The wireframes, in a browser | `npx serve wireframes/002-hosted-event-pilot` and `npx serve wireframes/012-joining-and-naming`. 26 frames, each annotated with the requirement it satisfies. |
| 7 | [docs/process/tracker.md](tracker.md) and [design-lenses.md](design-lenses.md) | How the board works; the fourteen lenses every spec answers. |

**Do not read the product docs first.** [working-doc.md](../product/working-doc.md), [revenue-models-analysis.md](../product/revenue-models-analysis.md) and the rest are the *why*. They are worth reading, and nothing in the build is blocked on them.

## 2. Check you are looking at the right thing

```bash
npm run check:fast    # spec sections, the CLAUDE.md pin, role labels, server syntax
grep -m1 '^Status:' docs/specs/002-hosted-event-pilot.md \
  docs/specs/011-roles-and-permissions.md \
  docs/specs/012-joining-naming-and-the-first-trip.md
```

All three must say `Status: approved`. **If any says `draft`, stop** — the gate in docs/README.md allows no code before approval, and you are on a stale commit or the wrong branch.

`npm run check` is the same thing plus the client build and tests — the whole of what CI fails you for, in about a minute. Run it before you push and you will not find out from a red check.

This matters most if you are **not** in Claude Code: the `.claude/` hooks give a Claude Code session these answers inside the edit, and this command is how every other agent gets them.

## 3. Get it running

```bash
cp .env.example .env     # then fill in MongoDB, Firebase, and optionally Maps and Redis
npm install && npm run dev        # server, from the repo root
cd client && npm install && npm run dev   # client
```

`.env` is never in git. Copy it from the other machine by hand or through a password manager. The server has no test suite; `npm test` in `client/` runs Vitest.

## 4. Build order — and it is not negotiable

Spec 012 §12 groups spec 002's eleven parts into eight slices. **Slice 1 is the dependency for everything else**, because it replaces the embedded `Trip.members` array with a `TripMember` collection and every other slice reads membership.

| Slice | Epic | Pilot? |
|---|---|---|
| **S1 Permissions foundation** | [#20](https://github.com/Fogataz/trip-planner/issues/20) | **Must — start here** |
| S2 The door | [#25](https://github.com/Fogataz/trip-planner/issues/25), [#29](https://github.com/Fogataz/trip-planner/issues/29), [#52](https://github.com/Fogataz/trip-planner/issues/52) | Must |
| S3 Localization of the new surface | [#36](https://github.com/Fogataz/trip-planner/issues/36), [#53](https://github.com/Fogataz/trip-planner/issues/53) | Must |
| S4 Analytics | [#40](https://github.com/Fogataz/trip-planner/issues/40) | **Must, and before 20 Nov** |
| S5 Agenda drafts | [#43](https://github.com/Fogataz/trip-planner/issues/43), [#54](https://github.com/Fogataz/trip-planner/issues/54) | Must |
| S6 Announcements and notifications | [#48](https://github.com/Fogataz/trip-planner/issues/48), [#51](https://github.com/Fogataz/trip-planner/issues/51) | Must / Should |
| S7 Lifecycle hardening | [#115](https://github.com/Fogataz/trip-planner/issues/115) | Should |
| S8 After the pilot | — | No |

Each epic body carries the brief, the measure, the stop condition and the scope. **The epic links the spec; it never restates it** — when they disagree, the spec wins.

**S4 before the dry run on 20 Nov.** If analytics slips, the pilot can run perfectly and still answer none of the questions in spec 002 §11, which is the stated reason the pilot exists.

## 5. The things that will bite you

| Trap | What to do |
|---|---|
| **Branch naming is enforced by CI.** A `docs/…` branch may only touch `docs/` and `wireframes/` (ww-D11). Touch anything else and the docs-only check fails. | Code goes on `feat/…`, `fix/…` or `chore/…`. Never work on `main`. |
| **`role === 'organizer'` appears 11 times across 5 files.** Replacing them is the job, not a side effect. | One helper, `can(actor, trip, capability)`. The **G5 · One helper** test fails if any route, socket handler or client component compares a role string. Write that test early — it is the measure for #20. |
| **Socket authorization happens once, at join** (`server/index.js:127`). Nothing removes a socket from `trip:<id>` afterwards. | **G4 · Immediate revocation** is in slice 1, not after the pilot. A removed member currently keeps receiving everything until they disconnect. |
| **The migration runs once against live data.** | Backup first, idempotent, `--dry-run` that prints the mapping, and **write the reverse script before running the forward one**. Spec 002 AC 4: no user loses access they have today. |
| **The one-tap invited path mostly already exists.** `TripInvitation` carries a per-invitation token and `POST /:groupId/invitations/:token/accept` already activates the member with no approval (`server/routes/groups.js:371`). | Do not build a queue on top of it. Spec 012 §5.8 is three doors; the exact-email match at `:395` is what changes. |
| **Role labels are not role names.** The stored role is `host`/`co-host`/`guest` always; the words shown depend on `trip.kind`. | Spec 012 §5.3. Get this wrong and the migration renames every existing user's friends into "guests". |
| **Localization is blocked on a human.** The Spanish and Portuguese role labels need the native reviewers in [spec 003](../specs/003-localization.md) §6. | **Write no locale file for role labels until that lands.** Everything else in S3 can proceed. |
| **Every code carries a short name.** `R1 · Org owner reach`, not `R1`. | docs/README.md "How to update". A bare code is a defect to fix when you touch the line. |
| **Two GitHub accounts may be configured.** Pushing from the wrong one fails with a 403 even though `gh auth status` looks fine. | `gh api repos/Fogataz/trip-planner --jq .permissions` — if `push` is `false`, switch: `gh auth switch -u <the account with write access>`. Restore the original active account afterwards. |
| **Touching `.github/workflows/` needs the `workflow` scope**, which the account with write access may not have. The push is rejected by the server, not by git. | `gh auth switch -u <that account>` **first**, then `gh auth refresh -h github.com -s workflow`. `refresh` acts on the *active* account — run it in the wrong order and it fails with "received credentials for &lt;other account&gt;", which looks like an SSO problem and is not. On Windows PowerShell there is no `&&`; use two lines. |

## 6. What is already decided, so you do not reopen it

Four decisions on 2026-11-12 settled the data model:

| Code | Decision |
|---|---|
| **O1 · Organization never required** | `Trip.orgId` is **nullable**. A trip without one is personally owned. Hosting never requires an Organization. |
| **R1 · Org owner reach** | An org owner reaches a trip they hold no role on only by a **claim** that is logged and announced. Never silent read access. |
| **R2 · Leaving an Organization** | Leaving **drops** host and co-host roles on that Organization's trips. The trips stay. |
| **R8 · Entitlement axis** | `Trip.entitlement` is **reserved** — nullable, returns unlimited, nothing gated in the pilot. |

Everything else runs on the recommendation written next to it, per **D27 · Recommendations are working defaults**. You do not need an answer to proceed; you need to not contradict one. Spec 011 §13 and spec 012 §10 have the full lists.

**Two are not ours to decide:** **O2 · The word for Organization** (brand) and **O8 · Ungendered role labels** (native reviewers).

## 7. Reporting back

Engineering reports its outcome **into the repo or the board — never only into a chat** (ww-D7). Concretely:

1. Branch, commit, open a PR to `main`. Never merge without the product owner's OK.
2. In the **same PR as the feature**, update: the spec's status and PR number, [features.md](../features.md), [roadmap.md](../product/roadmap.md), and the specs table in [docs/README.md](../README.md). That is docs/README.md "When a spec ships", and it is not optional.
3. Move the epic's Status on the board: Spec approved → In build → In review.
4. **Commit and push at the end of every session**, even for docs-only work. Uncommitted edits on one computer are invisible on the other.

Commit messages end with:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

PR descriptions end with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## 8. If something looks wrong in a spec

Say so in the PR and fix it there. The specs were written fast, against a deadline, and spec 012 exists because reading spec 002 carefully found three regressions it would have shipped. **Finding a fourth is a good outcome, not a problem** — but the fix goes in the repo, as an amendment with a date, not into a chat.

A shipped spec is never rewritten (docs/README.md). These three are `approved`, not shipped, so an amendment section with a date is the right move.
