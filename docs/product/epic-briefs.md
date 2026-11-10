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

**Outcome:** the 24–25 Nov pilot's lessons are written down and turned into changes to briefs 3–7. **Initiative:** 2 · **Horizon:** Now · **Milestone:** M0 · **Models:** D · **Spec:** 002 §11.

Done when: retro against spec 002 §11 signals; pilot metrics (join rate, day-2 active, "very disappointed") recorded as the benchmark hosts must meet; a list of changes for briefs 3–7.

### Brief 3. Hosts have every traveller's details before departure

**Initiative:** 6 · **Horizon:** Now · **Milestone:** M1 · **Models:** C1, H (also D, W) · **Layer:** Host · **Was:** "RSVP, capacity, check-in and guest forms" (working doc §4.1 item 9).

**Problem.** Hosts collect names, emergency contacts, dietary needs and experience levels through a sign-up form that feeds a spreadsheet, then chase missing answers on WhatsApp [T2]. The data lives outside the trip and goes stale.

**Hypothesis.** We believe a form inside the trip, with a "who's missing" view and one-tap reminders, will end the chasing. We'll know when 90% of travellers complete it 7 days before departure without the host messaging anyone individually.

**Measures.** Leading: completion rate and days to complete per departure. Lagging: admin hours per departure, from the host, before and after.

**Main user stories**
- As a host, I want to pick questions from a ready list (dietary needs, emergency contact, room sharing, experience level, size) or write my own, so that I ask only what I need.
- As a traveller, I want to answer once on my phone and edit later, so that the host always has current details.
- As a host, I want to see who hasn't answered and remind only them, so that I stop chasing on WhatsApp.
- As a host, I want to set capacity and a waiting list, so that I never overbook.
- As a co-host, I want a check-in list on the day, so that I know who is here.
- As a host, I want to export the answers, so that I can send dietary needs to the venue.

**Scope.** In: forms, required questions, reminders, capacity, waiting list, check-in, CSV export. Not in: payments (brief 9), uploading ID documents.

**Depends on:** spec 002 Organizations, roles and invite link.

**Principles check.** Privacy first: answers are visible to the traveller, hosts and co-hosts only, never to other travellers.

**Open questions.** Q3.1 Allow medical or allergy questions? Health data needs explicit consent under GDPR. *Recommendation:* dietary preferences yes; medical questions not in v1. Q3.2 How long to keep answers? *Recommendation:* delete 30 days after the trip ends, with an export first.

### Brief 4. Hosts start a new departure from a past one in minutes

**Initiative:** 6 · **Horizon:** Now · **Milestone:** M1 · **Models:** C1, H (also W) · **Layer:** Host · **New.**

**Problem.** Premium hosts repeat the same programme several times a year: the same workshop each season [T3], several community departures a year [T2]. Today every trip starts empty. Setup time is our main cost of serving many small hosts, and the M1 gate asks for under 2 hours.

**Hypothesis.** We believe creating a departure from a past one, with every item moved to the new dates, will cut setup of a repeat departure to under 30 minutes. We'll know when the median setup time of second departures is under 30 minutes.

**Measures.** Leading: share of new departures created from a past one. Lagging: median setup time per departure.

**Main user stories**
- As a host, I want to create a new departure from a past one and choose the new start date, so that every item moves to the right day.
- As a host, I want to choose what to copy (schedule, forms, packing list, announcements as drafts), so that I start from my best version.
- As a host, I want to keep my programmes as templates for my business, so that a co-host can start a departure too.
- As a host, I want the copied plan to open as a draft I review before travellers see it, so that nothing goes out by mistake.

**Scope.** In: copy with date shift, choose parts, templates at Organization level, draft review. Not in: copying travellers, expenses, Q&A or location; a public template library.

**Depends on:** brief 5 (where templates live); spec 002 drafts.

**Principles check.** Privacy first: nothing about past travellers is copied. AI suggestions are drafts: date-shifted items open as a draft.

**Open questions.** Q4.1 Should we offer a few starter templates (yoga retreat, photo workshop, trek)? *Recommendation:* yes, two or three, written with T1–T3.

### Brief 5. Hosts run all their departures from one place

**Initiative:** 6 · **Horizon:** Now · **Milestone:** M1 · **Models:** C1, H (also D) · **Layer:** Host · **Was:** "Organization home" (working doc §4.1 item 10).

**Problem.** A host with several departures a year needs to see which one needs attention: spots left, forms missing, co-hosts assigned. Today a person sees a flat list of trips.

**Hypothesis.** We believe one home for a host's business, showing each departure's readiness, will let hosts find what needs action in under a minute. We'll know when hosts open it weekly and it holds all of their departures.

**Measures.** Leading: weekly active hosts on the home. Lagging: departures per Organization.

**Main user stories**
- As a host, I want to see my upcoming and past departures with spots left and missing forms, so that I know where to act.
- As a host, I want to add a co-host to my business and choose which departures they run, so that guides help without seeing everything.
- As a host, I want to set my business name, logo and defaults once, so that each new departure starts with them.
- As a host, I want to see my plan and invoices, so that billing is in one place (brief 7).

**Scope.** In: departure list with status, co-host management, business defaults. Not in: reports across departures, roles beyond host and co-host.

**Depends on:** spec 002 Organizations.

**Principles check.** Fits. D19: Organization membership never grants trip access; trip roles do.

### Brief 6. Travellers see only the activities they signed up for

**Initiative:** 6 · **Horizon:** Now · **Milestone:** M1 · **Models:** C1, H (also D breakouts, W, I) · **Layer:** Host · **New** (destination-weddings §8 item 1).

**Problem.** Premium departures have optional activities (a sunrise shoot, a summit day, a spa session) and sub-groups. Today every member sees every item, so travellers ask "is this for me?" and hosts track sign-ups on paper.

**Hypothesis.** We believe per-item sign-ups and audiences will remove those questions and give hosts a live headcount. We'll know when optional items fill through the app and schedule questions to the host drop.

**Measures.** Leading: sign-up rate on optional items. Lagging: host-reported questions about the schedule, before and after.

**Main user stories**
- As a host, I want to mark an item as optional with a capacity and a deadline, so that travellers sign up in the app.
- As a traveller, I want to join or leave an optional activity before the deadline, so that my plan is right.
- As a traveller, I want my schedule to show only my items, with a switch to see the full programme, so that I'm not confused.
- As a host, I want to show an item only to a group (for example the advanced group or the crew), so that others don't see it.
- As a host, I want a list of who is in each item, so that I can confirm numbers with the supplier.

**Scope.** In: optional items, capacity, deadline, audiences, headcount. Not in: charging for add-ons (brief 9), households (weddings, later).

**Principles check.** Real-time: sign-ups update for everyone at once. One source of truth: the schedule holds the headcount.

### Brief 7. We can charge a host for a departure

**Initiative:** 6 · **Horizon:** Now · **Milestone:** M1 · **Models:** C1, H · **Layer:** Money · **New** (revenue analysis §7, Phase 1).

**Problem.** The M1 gate needs hosts who pay. We have no way to mark a paying Organization or take its money.

**Hypothesis.** We believe a plan on the Organization plus a card payment link is enough for the first 5–10 hosts. We'll know when committed hosts pay within 7 days and billing takes us under 15 minutes per host.

**Measures.** Leading: hosts who pay after committing. Lagging: billing minutes per host.

**Main user stories**
- As the product owner, I want to put an Organization on a plan (trial, per departure, monthly) with an end date, so that what they get is clear.
- As a host, I want to pay by card through a link and receive an invoice, so that I can account for it.
- As a host, I want to see my plan and what it includes, so that I know what I pay for.
- As the product owner, I want a list of Organizations with plan and renewal date, so that I can follow up.

**Scope.** In: plan field, payment link, invoices, a simple list. Not in: in-app checkout, metering, travellers' payments.

**Open questions.** Q7.1 **Blocks charging:** which legal entity invoices hosts? *Options:* self-employed (autónomo), a new company, or a partner. *Recommendation:* ask an accountant before M1; self-employed is the quickest start. Q7.2 Prices (D37).

### Brief 8. Spike: decide how hosts take payments

**Initiative:** 8 · **Horizon:** Now · **Milestone:** M1 · **Models:** E · **Layer:** Money · **New.** Timebox: 3 days.

**Questions to answer:** provider (Stripe Connect or similar) and who is the merchant of record; fees per payment against a target fee of about 1% [S12]; host onboarding and identity checks in Spain, Portugal and Costa Rica (check provider coverage per country); refunds and chargebacks; currencies (EUR, USD, CRC); whether EU package-travel rules touch us as the tool, not the organiser.

**Done when:** a short memo in `docs/product/` with options and a recommendation, and the owner decisions listed. It feeds the spec for brief 9.

### Brief 9. Hosts collect deposits and instalments without chasing anyone

**Initiative:** 8 · **Horizon:** Next · **Milestone:** M2 · **Models:** E, C1, H · **Layer:** Money · **New** (working doc §4.1 item 12).

**Problem.** Hosts sell places with a deposit and instalments, then track payments by hand and chase on WhatsApp [T2]. Competing payment tools charge about 1% [S12].

**Hypothesis.** We believe a payment schedule on each traveller's place, with automatic reminders, will get instalments paid on time and earn us a fee. We'll know when 95% of instalments are paid by their due date and payment fees cover their own cost.

**Measures.** Leading: on-time payment rate; travellers who pay the deposit on joining. Lagging: payment volume per host; fee revenue; disputes.

**Main user stories**
- As a host, I want to set a price, a deposit and instalment dates for a departure, so that travellers know what is due.
- As a traveller, I want to pay my deposit by card when I take my place, so that it is held.
- As a traveller, I want a reminder before each instalment and to pay in one tap, so that I don't miss a date.
- As a host, I want to see who has paid what and receive payouts to my bank, so that I stop reconciling in a spreadsheet.
- As a host, I want to refund under my cancellation policy, so that cancellations are handled in one place.
- As a host, I want to choose who pays the card fee, so that my price stays clean.

**Scope.** In: price, deposit, instalments, reminders, payouts, refunds, fee setting. Not in: booking third-party suppliers (F stays parked), friends splitting costs (later).

**Depends on:** brief 8 memo; briefs 3 and 7.

**Principles check.** One source of truth: payments live in the same trip as expenses.

**Open questions.** Q9.1 Our fee (D37). Q9.2 Offer cancellation policy templates? *Recommendation:* two simple templates, host can edit.

### Brief 10. Travellers sign up for a departure from a public page

**Initiative:** 8 · **Horizon:** Next · **Milestone:** M2 · **Models:** C1, H · **Layer:** Public · **Was:** "Public share page" (working doc §4.1 item 11), refocused.

**Problem.** Hosts announce departures on Instagram or their website and take sign-ups in a separate form [T2]. The trip space starts only after a manual handoff.

**Hypothesis.** We believe a public departure page with a sign-up form that leads straight into the trip after approval will replace the separate form. We'll know when most of a host's sign-ups come through the page.

**Measures.** Leading: page visits to sign-up requests. Lagging: share of a host's travellers who joined through the page; days from request to joined.

**Main user stories**
- As a host, I want to publish a page for a departure with dates, description, price and spots left, so that I can share one link.
- As a prospective traveller, I want to request a place with the host's questions, so that I don't fill in a separate form.
- As a host, I want to approve each request, so that I choose my group.
- As a traveller, I want to land in the trip right after approval, and pay my deposit there once brief 9 ships.
- As a host, I want to mark a departure as full or unpublish it, so that nobody requests a place that doesn't exist.

**Scope.** In: one public page per departure, request form, approval, sold out. Not in: search across hosts (C2, later), reviews.

**Principles check.** Privacy first: the public page is a separate object. It never shows trip content, members or location (working doc §4.2). This needs an amendment to principle 3's wording; flag it in the spec.

### Brief 11. Every departure looks like the host's own

**Initiative:** 8 · **Horizon:** Next · **Milestone:** M2 · **Models:** C1, H · **Layer:** Host · **New** (premium buyer lens §4).

**Problem.** Premium buyers judge by look. Hosts want travellers to see their brand, not ours.

**Hypothesis.** We believe the host's name, logo and colour on the trip, the public page and invite emails will make hosts present the app as part of their service. We'll know when most paying hosts add their branding.

**Main user stories**
- As a host, I want to add my logo and colour, so that travellers see my business.
- As a host, I want invite emails and the public page in my brand, so that travellers trust the link.
- As a traveller, I want a clean, branded space, so that it feels part of what I paid for.

**Scope.** In: logo, colour, cover, branded emails, a small "made with" footer. Not in: custom domains, a separate app per host.

### Brief 12. Travellers have the schedule without signal

**Initiative:** 8 · **Horizon:** Next · **Milestone:** M2 · **Models:** H · **Layer:** Core · **New** ([T1]).

**Problem.** Expeditions and remote workshops spend days with weak or no signal [T1]. Travellers still need the schedule, meeting points, host contacts and documents.

**Hypothesis.** We believe a read-only offline copy of the plan will keep the app useful on remote days. We'll know when travellers open it offline and hosts stop printing paper schedules.

**Main user stories**
- As a traveller, I want to open today's schedule and the host's contacts without signal, so that I know where to be.
- As a traveller, I want to see when the plan last updated, so that I know if it might be out of date.
- As a host, I want my latest announcements saved on travellers' phones whenever they have signal, so that changes still reach them.

**Scope.** In: read-only offline schedule, contacts, last-updated time; installable web app (spec 002 web manifest). Not in: offline editing, offline maps, live location offline.

**Principles check.** Real-time by default: offline mode must show clearly that data may be stale. Live location still needs a connection and is never stored.

## 5. Prompt for Claude Code

Paste this in Claude Code on the repo. It replaces the prompt in venture-analysis.md §12.

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
