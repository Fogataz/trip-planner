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

Check 7 is the one that gets skipped. An epic with a measure nobody can read is a bet nobody can settle.

## 2. Quality gate (CI)

CI runs in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (ww-D1). The server's `npm test` is still a placeholder that exits 1, so CI does not run it.

| Step | Command | When |
|---|---|---|
| Client types and build | `cd client && npm run build` (`tsc` then Vite) | Now |
| Client tests | `cd client && npm test` (Vitest) | Now |
| Server syntax | `node --check` over `server/**/*.js` | Now, costs nothing |
| Dependency audit | `npm audit --omit=dev`, report only | Now |
| Server tests | A real suite, supertest on the health and auth routes first, replacing the placeholder | After the pilot |

CI runs on every pull request to `main`. A red check blocks the merge. Nothing auto-merges: the product owner's OK is still required.

## 3. Reviewing code Claude wrote

Most of this code is written by Claude Code, so the review has to come from outside the session that wrote it.

- The reviewer is a session or subagent that did **not** build the feature. It gets the spec and the diff, nothing else.
- It answers one question per acceptance criterion: met, not met, or can't tell. Then it lists anything in the diff the spec did not ask for.
- "Can't tell" counts as not met.
- The product owner reads the verdict rather than the whole diff, and merges.

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

## 7. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| ww-D1 | Add the CI workflow and make it a required check | Engineering | **Done 2026-11-11:** `.github/workflows/ci.yml`, check `ci` required on `main` |
| ww-D2 | Who is on call during the pilot, each day | Product owner | **Decided 2026-11-11:** both of us, together, both days |
| ww-D3 | Rollback steps, and where errors are visible during the event | Engineering | **Written 2026-11-11** in §4. The redeploy step and log location are **TBD** until hosting is chosen. Tried once in the dry run |
| ww-D4 | Retro day and length | Product owner | **Decided 2026-11-11:** Friday, 15 minutes. Clock time **TBD** |
| ww-D5 | May product sessions edit `docs/process/`? | Product owner | **Decided 2026-11-11: yes.** Engineering updates the "Who does what" list in CLAUDE.md |
