# Epic Briefs

> **Living document.** Started 2026-11-10 after D33 (premium hosts lead). It holds (1) how we write an epic, and (2) briefs for the next epics until they exist on GitHub. Once an epic's issue is created, **the issue is the source**: replace its brief here with a one-line link. Once a spec exists, the spec holds the requirements and the issue links to it.
>
> Order and reasoning come from [venture-analysis.md](venture-analysis.md) §11. Items marked **TBD** are for the product owner. Source numbers [E1] etc. are at the end; [T1] etc. are rows in [early-testers.md](early-testers.md).

## 1. How we write an epic

The rules and the issue body template are in [tracker.md](../process/tracker.md), "Writing an epic".

## 2. Personas used in stories

| Persona | Who | Pays us? |
|---|---|---|
| **Host** | Runs paid small-group departures: a retreat leader, a photography-workshop leader, an expedition guide (T1–T3). Often a one- or two-person business. | Yes |
| **Co-host** | A guide or assistant who runs the departure on the ground. | No |
| **Traveller** | Has paid the host for a place. | Never (premium buyer lens P1, proposed) |
| **Prospective traveller** | Sees a departure and wants a place. | Never |
| **Product owner** | Us, for billing and support stories. | — |

## 3. Initiatives and discovery work

| Initiative (outcome) | Key result | Epics or spikes |
|---|---|---|
| **6. Premium hosts run a repeat departure without our help** | 2 hosts run a second departure with under 2 hours of setup, by M1 | Briefs 3–7 |
| **7. We know which premium hosts will pay, and for what** | Phase 2 scope chosen on evidence at M1 | Spikes below |
| **8. Hosts collect guest money inside the trip** | First host collects deposits in the app, by M2 | Brief 8 now; briefs 9–12 after M1 |

Discovery spikes under initiative 7. Each is a few days, done when the notes are in early-testers.md (no contact details) and the signal is recorded.

| Spike | Done when | By |
|---|---|---|
| Interview T1, T2 and T3 about their last departure: tools, hours, money, what broke | 3 interviews written up against the questions in early-testers.md | 18 Dec |
| Interview 10 more retreat or workshop hosts | 10 write-ups; count who names the Sheets + WhatsApp pain unprompted | 5 Feb |
| Run one or two concierge departures, set up by us | Setup hours, traveller join rate and host verdict recorded | M1 |
| Interview 5 Costa Rica destination-wedding planners (W) | 5 write-ups; decision W-a in destination-weddings.md | M1 |
| Set up the April 2027 bachelor trip (T5) | Trip created and members invited | 15 Feb |

## 4. Briefs

Numbers match the epic table in venture-analysis.md §11. Epic 1 (the spec 002 pilot) already has a spec and epics, so it has no brief.

### Brief 2. Spike: what the pilot teaches us about hosts

Created as #58.

### Brief 3. Hosts have every traveller's details before departure

Created as #59.

### Brief 4. Hosts start a new departure from a past one in minutes

Created as #85.

### Brief 5. Hosts run all their departures from one place

Created as #60.

### Brief 6. Travellers see only the activities they signed up for

Created as #86.

### Brief 7. We can charge a host for a departure

Created as #87.

### Brief 8. Spike: decide how hosts take payments

Created as #88.

### Brief 9. Hosts collect deposits and instalments without chasing anyone

Created as #89.

### Brief 10. Travellers sign up for a departure from a public page

Created as #61.

### Brief 11. Every departure looks like the host's own

Created as #90.

### Brief 12. Travellers have the schedule without signal

Created as #91.

## 5. Prompt for Claude Code

_Used on 2026-11-10; kept for reference._ Paste this in Claude Code on the repo. It replaces the prompt in venture-analysis.md §12.

```
Read docs/product/venture-analysis.md (§11–12), docs/product/epic-briefs.md and
docs/process/tracker.md.

1. Docs. On a new branch docs/premium-hosts, commit the changed files in docs/
   (venture-analysis.md, epic-briefs.md, working-doc.md, strategy.md, roadmap.md,
   early-testers.md, README.md). Open a PR to main. Do not include other uncommitted
   changes in the working tree (client/ CSS and .claude/launch.json are separate work).

2. Process. In the same PR:
   - add a section "Writing an epic" to docs/process/tracker.md with the rules and the
     issue body template from epic-briefs.md §1, and replace §1 in epic-briefs.md with
     a link to it;
   - add the Horizon field and the milestones M0–M2 to tracker.md, and update its
     initiative tables to venture-analysis.md §12.2;
   - create .claude/commands/epic.md from epic-briefs.md Appendix A, and mention /epic
     in docs/README.md next to /feature.

3. Board. With gh, in the Fogataz "Trip-Planner" project and Fogataz/trip-planner:
   - add the single-select project field Horizon (Now, Next, Later);
   - create milestones M0 (2026-11-27), M1 (2027-02-26), M2 (2027-06-30) with the gate
     criteria from venture-analysis.md §9 in each description;
   - rename, refocus, close and create initiatives as in venture-analysis.md §12.2;
   - for briefs 2–12 in epic-briefs.md §4, run /epic to create or update each epic
     (existing epics are renamed to the outcome title and enriched; new ones are
     created), and create the discovery spikes in §3 under initiative 7;
   - set Layer, Revenue Model, Horizon, Priority and milestone on each.
   Show me the full list of gh changes and wait for my OK before running them.

4. After the board is updated, replace each brief in epic-briefs.md §4 with
   "Created as #<n>" and commit that to the same PR.
```

## 6. Should we have an `/epic` command?

**Yes.** We have `/feature` for the path from idea to shipped. Epics are the other repeated job: about 15 to create or rewrite now, more each month, and each needs the same checks. A command makes every Claude account and computer do it the same way (D26).

| | `/feature` | `/epic` (proposed) |
|---|---|---|
| Question it answers | How do we build this well? | Why are we building this, and how will we know it worked? |
| Input | Spec number or feature name | A brief, a spec number or an issue number |
| Output | Benchmark, wireframes, spec, code, docs | A GitHub epic with outcome title, hypothesis, measures, stories and fields; story sub-issues once the spec is approved |
| Gate | No code before an approved spec | No epic without a hypothesis and a measure; no stories as sub-issues before an approved spec |

They link: `/epic` creates the epic with "next step: /feature benchmark"; `/feature` at stage 4 and 5 calls back to `/epic <spec>` to link the spec and add the stories.

Who can run it: Claude Code today. A product session could too, once it has GitHub access (see the note in the chat).

## Appendix A. `/epic` command

Created as [.claude/commands/epic.md](../../.claude/commands/epic.md).

## Sources

- [E1] Agility at Scale, SAFe Lean Business Case: epic hypothesis statement, business outcomes and leading indicators: https://agility-at-scale.com/safe/lpm/safe-lean-business-case-from-epic-hypothesis-to-go-no-go/
- [E2] Romano Roth, the epic hypothesis statement (customer, problem, solution, business outcome, leading indicators): https://romanoroth-website.pages.dev/en/blogs/what-is-hypothesize-safe-devops-health-radar/
- [E3] Product School, outcome-based roadmaps and how they combine with Now-Next-Later: https://productschool.com/blog/product-strategy/outcome-based-roadmap
- [E4] Full Scale, roadmaps framed as problems instead of features: https://fullscale.io/blog/creating-software-product-roadmaps/
- [S12] WeTravel pricing: see [revenue-models-analysis.md](revenue-models-analysis.md), Sources.
