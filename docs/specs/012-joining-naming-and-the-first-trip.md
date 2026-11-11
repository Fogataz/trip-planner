# Spec 012: Joining, naming and the first trip

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —

> **Renumbered before merge (2026-11-11).** Drafted as spec 010 in pull request #102, which was opened before specs 009 trip cover layout (#78) and 010 host edits their trip (#110) took those numbers. Nothing published was renumbered — this one had not merged yet ([naming.md](../process/naming.md) §2).
Wireframes: [`wireframes/012-joining-and-naming/`](../../wireframes/012-joining-and-naming/) — 13 frames, including the three [spec 002](002-hosted-event-pilot.md) §6 left undrawn.
Related: [002 hosted event pilot](002-hosted-event-pilot.md), [003 localization](003-localization.md), [007 profiles](007-profiles-and-display-names.md), [009 roles and permissions](011-roles-and-permissions.md).

> **✅ Decided 2026-11-12 by the product owner: O1 · Organization never required = (b) never required.** `Trip.orgId` is nullable, spec 002 §5.1 step 2 is removed, D18 · Account model now reads "Organizations **may** own hosted trips", and §5.7's move path is required rather than reserved. O2–O14 run on their recommendations per D27 · Recommendations are working defaults, except **O2 · The word for Organization** and **O8 · Ungendered role labels**, which are not mine or yours alone — see §10.
>
> Written 2026-11-11 from a QA pass over spec 002 and its wireframes after [spec 011](011-roles-and-permissions.md); extended the same day with the invited path (§5.8), localization (§6) and the consolidated direction (§14).
>
> **Three of the findings are regressions spec 002 would ship as written.** Q1 renames existing friend trips, Q4 breaks the host's approval decision, and **Q13 puts an approval step in front of people a host already invited — in front of a mechanism the code already has.**

## 1. The problem in one line

Spec 002 asks for administrative decisions before any value (an Organization at step 2 of 6), renames existing users' friends into "guests", and routes people a host **already invited** through a request-and-wait they do not need.

## 2. What we are solving, and the outcome to build for

**The aha moment is not "I made a trip."** A trip with one person in it is a worse to-do list. It is **the second person appearing in it** — when the thing stops being a document and becomes a group.

> **North star: time from first contact to being inside the trip with other people.**
> Measured two ways, because there are two readers: for a **host**, first sign-in → second active member. For a **guest**, link tapped → inside the trip.

Every question we ask before that moment has to justify itself against the clock. The onboarding research is consistent on method — collect the minimum to get the user in, ask for more as context demands, push time-to-value toward zero — with one caveat that matters here: **do not defer steps the product needs in order to function** ([PLG onboarding](https://www.plg.news/p/the-ultimate-guide-to-product-led), [SaaS onboarding practices](https://formbricks.com/blog/user-onboarding-best-practices)).

So the test is narrow. **Does the product function without this step?**

| Step | Needed? |
|---|---|
| An Organization | **No.** Only continuity and billing need one, and neither exists in the pilot (§5.2) |
| Approval, for someone the host invited by name | **No.** The host already decided. The code already has the mechanism (§5.8) |
| Approval, for someone arriving on a shared link | **Yes.** Nobody has decided anything about them yet |
| A display name | **Yes, but only when the provider did not give us one** (§5.5) |
| A photo, interests, a profile | No (§5.6) |

## 3. Benchmark

| Product | What it does | What we take |
|---|---|---|
| **Figma** — the cautionary one | Allowed personal drafts for years, then required every draft to belong to a team. Users move files **one at a time**; there is no bulk move, moves between Organizations are not possible, and personal-to-organization migration goes through support or a `.fig` export ([Figma blog](https://www.figma.com/blog/updates-to-how-drafts-work/), [forum](https://forum.figma.com/t/drafts-are-changing-here-s-what-you-need-to-know/73701/39)). Their gate is precise: existing collaborators keep working in an unmoved draft, but **inviting a new one** requires the team. | Defer the container — Figma did, correctly, for years. **And build the adoption path on day one**, because their pain was bolting the move on afterwards. Their gate is also the right shape: the container is needed where collaboration *expands*, not where it starts. |
| **Luma** | "Require approval" for registrations, but **invited guests skip approval** ([Luma help](https://help.lu.ma/p/helpart-u9pkpOQLUKfvfke/inviting-and-adding-guests-to-your-event)) — already in spec 002's benchmark and already in F17. Calls the container a **Calendar**, not an organization. | Two doors, not one. Invitation and approval are different decisions and the host makes only one of them twice. And the word for the container is a choice (**O2**). |
| **Airbnb** | "Hosted by [first name]" with a face, even for professional managers. An academic study found the more trustworthy a host is perceived from her photo, the higher the price and the probability of being chosen ([Ert, Fleischer & Magen](https://researchgate.net/profile/Eyal-Ert/publication/315410754_Trust_and_Reputation_in_the_Sharing_Economy_The_Role_of_Personal_Photos_on_Airbnb)); Guesty tells property managers to use a headshot rather than a company logo ([Guesty](https://www.guesty.com/setting-up-profile-airbnb-how-does-it-work/)). | **Trust is carried by a person even when a business is behind it.** The person goes on the invitation; the Organization vouches for it. |
| **Eventbrite** | The organizer profile is a first-class public identity on the listing — and it **auto-creates an "unnamed organizer"** by default ([Eventbrite help](https://www.eventbrite.com/help/en-us/articles/161196/)). | The org identity is what a stranger checks. And the failure to avoid: never auto-create a container (Q9). |
| **Partiful** | "[Name] invites you." One link, no app, social register. | The voice for a personal trip. Nobody hosts a weekend with friends. |
| **Slack, Notion, Linear** | Workspace first, always. | What not to do before anyone is sold. These are bought by someone already convinced; our link arrives cold in a group chat. |

## 4. QA register

**Q1, Q4 and Q13 are regressions spec 002 would ship as written.**

| # | Finding | Where | Severity | Position |
|---|---|---|---|---|
| **Q1 · Guest on friend trips** | **"Guest" is applied to existing friend trips.** F7 migrates members → **guests**; today the word is "member". Five friends planning Lisbon become a host and four guests. [Brand foundations](../brand/brand-foundations.md) §1.3 says the personality is **Fair — "everyone has a voice", not "bossy, organizer-only"**. | 002 F7, every member screen | **High** — visible regression for every existing user, on a migration that cannot be partly undone | Label roles per trip kind (§5.3). Free: spec 011 made roles presets, so the stored role never changes. |
| **Q2 · Organization as a gate** | **The Organization is a gate before any value** — §5.1 step 2 of 6, before the trip exists. | 002 §5.1 | High for self-serve; **zero for the pilot**, where the Organization is created by hand | Never required (§5.2). |
| **Q3 · No Organization on the join page** | **The join page shows no Organization at all.** F12 gives "event name, dates, host name, cover". For a link arriving cold in a group chat the company name is the legitimacy signal. | 002 F12, S1, frame 1 | Medium | Attribution rule (§5.4). |
| **Q4 · Bare email in the queue** | **A host cannot tell who is asking to join.** The queue draws "Marta R. · marta@example.com", but on the email-link path there is **no name**, so the host is asked to approve `j.p.2847@example.com`. | 002 F14, frame 5 | **High** — breaks the approval decision itself | Ask one field, only on that path (§5.5). |
| **Q5 · Dead-end waiting state** | **The waiting state is a dead end** for up to the 1-hour approval target. | 002 frame 4 | Medium | Make it the profile moment (§5.6). |
| **Q6 · Create-org as a menu item** | **"Create an Organization" is a permanent menu item**, which promotes it against S7 and offers it when nobody needs it. | frame 13 | Low | Contextual prompt (§5.2). |
| **Q7 · No move path** | **No path from a personal trip to an Organization.** Exactly Figma's mistake. | 009 case 10 | High if O1 is (b) | §5.7. |
| **Q8 · No attribution rule** | **Attribution has no rule anywhere.** | frames 1, 4, 9; F12 | Medium | §5.4. |
| **Q9 · Auto-created Organization** | **An Organization could be auto-created** to satisfy D18 — Eventbrite's "unnamed organizer". | implied by D18 | Medium | Never auto-create (§5.2). |
| **Q10 · Two asks in one step** | Privacy note and a name field would land on the same screen. | frames 3, 19 | Low | One screen, one ask (§5.5). |
| **Q11 · Approved guest's first screen** | An approved guest's first screen is unspecified; if the agenda is unpublished they land in an empty trip. | 002 F16 | Low | §5.1's ordering already puts import before sharing. Confirmed correct; must not be swapped. |
| **Q12 · The word Organization** | **"Organization" is a cold word** outside a company. Luma says Calendar; Slack and Notion say Workspace. | everywhere | Low now, higher with weddings | **O2**, owner's call. |
| **Q13 · Invited people must request** | **Invited people are sent through request-and-wait.** F17 says they skip *approval*, but every frame and the whole §5.2 flow routes one journey: open → sign in → privacy → **Request to join** → wait → approved → in. For someone the host added by name that is a request to confirm a decision already made, and a wait of up to an hour for it. **`TripInvitation` already carries a unique per-invitation token and `POST /:groupId/invitations/:token/accept` already activates the member with no approval** (`server/routes/groups.js:371`). The spec would layer a queue on top of a working one-tap path. | 002 §5.2, F17, frames 1–5 | **High** — it is the dominant path for the pilot's 38 attendees | Three doors (§5.8). |
| **Q14 · Invited funnel unmeasured** | **The pilot's headline metric cannot be computed.** §11 targets *join rate = joined ÷ invited ≥ 60%*. F30 records `invite_link_opened`, `join_requested`, `join_approved`, `join_declined` — **nothing for the invited path**, which is most of the pilot. An invited person generates an open and then nothing until `trip_viewed`. | 002 F30, §11 | **High** — we would run the pilot and not be able to answer its first question | §5.9.1. |
| **Q15 · No bulk invite** | **No way to invite 38 people.** F2 adds org members by email one at a time, and `groups.js:10` does the same for trips. The host does this on 20 Nov for 38 people. | 002 F2; `routes/groups.js` | **High for the pilot**, low after | Bulk invite (§5.9.2). |
| **Q16 · Nothing drives the approval target** | **Nothing makes the approval target happen.** §11 targets request → approval median **< 1 hour**. If a host does not notice, the funnel stalls at the precise point being measured. | 002 §11 | Medium | Host nudge (§5.9.3). |
| **Q17 · Token lost at sign-in** | **The invite token may not survive sign-in.** AC 5 and 6 require returning to the same join page after a Google redirect or an email link. If the token is dropped the user lands on an empty trip list and the one-tap claim collapses silently. | 002 AC 5, AC 6 | Medium | §5.9.4. |
| **Q18 · Gendered role nouns** | **Role labels do not survive translation ungendered.** Spanish and Portuguese inflect *anfitrión/anfitriona*, *invitado/invitada*. We do not collect gender and should not. | §5.3 × 003 | Medium | §6.2, **O8**. |
| **Q19 · First invitation has no language** | **The first invitation email has no language.** F36 sends push and email in the recipient's saved language — an invitee has no account yet, so there is none. | 002 F36 | Medium | §6.5, **O9 · First invitation language**. |
| **Q20 · Entitlement conflated with trip kind** | **The money model does not fit the capability model.** Working doc §4.3's **Trip Pass** sells agenda import, approvals and a ~50-member cap to the organiser of a **personal** trip. Spec 011 §5.1 puts all three in the *hosted* column and §5.2 ties the columns to `trip.kind`. A paying customer would be refused what they bought, or have their trip flipped to `hosted` — which renames their friends into guests, i.e. Q1 again, now charged for. | 011 §5.1, §5.2 × working doc §4.3 | **High for Phase 1, and the fix is only cheap now** | A third axis: role ∩ trip kind ∩ **entitlement** (011 §5.4). One nullable field reserved in block 1; **R8 · Entitlement axis**. |

## 5. The design

### 5.1 Principle

> **Nothing before the second person that the product does not need.** Not an Organization, not a profile, and not an approval for a decision the host has already made.

### 5.2 The Organization is never a gate

| Moment | Required? |
|---|---|
| Signing up, creating a trip, creating the invite link, **inviting the first guests**, publishing, adding a co-host | **No** |
| Adding a co-host who must keep access if the host leaves | **The first real need.** Offer, do not force |
| A second hosted event by the same person | Offer |
| Billing and payouts | Require — not built |

A trip with no Organization is **personally owned**. It is never auto-adopted, and an Organization is never auto-created without a name a user typed (Q9).

This changes the reading of D18 ("Organizations own hosted trips"), which is why it is **O1**. It costs the pilot nothing: the pilot Organization is created by hand either way.

### 5.3 Role labels follow the trip kind

Stored role unchanged; only the word differs, in one lookup.

| Stored (009) | Personal trip | Hosted event |
|---|---|---|
| `host` | **Organizer** | **Host** |
| `co-host` | **Organizer** | **Co-host** |
| `guest` | **Member** | **Guest** |

After the F7 migration an existing user therefore sees **no change in wording at all** — which is what "no user loses access they have today" (AC 4) should mean in the interface as well as the permission table. See §6.2: this table does not survive translation unchanged.

### 5.4 Attribution — the rule

Two questions, two readers:

- **"Is this real?"** → the **Organization**.
- **"Do I know who is asking me?"** → a **person, with a face**.

> **An Organization is never the author of anything. People write, post and host; Organizations own and vouch.**

| Context | What it says |
|---|---|
| Join page, hosted trip in an Organization | Organization above the event name, small. Below, the host's face and "Alberto C. and 2 others". |
| Join page, hosted trip, no Organization | "Hosted by Alberto C." with a face. |
| Join page, personal trip | "Marta invited you." No institution, no "host". |
| **Invitation email and push** | **The person**, always: "Alberto invited you to Annual Gathering". The Organization appears as a line inside, never as the sender's name. |
| Inside a trip | Person first; Organization in trip info. |
| Announcements | Always the person. A company does not write "breakfast moved to the lobby". |
| Analytics and audit | The Organization — the owning entity. |

**Edge case:** when the event name already starts with the Organization name, drop the Organization line on the join page. Never print the same words twice.

### 5.5 What a joining guest is asked

| Signed in with | We have | Asked |
|---|---|---|
| Google | Name, email, picture | **Nothing.** |
| Email link | Email only | **One field: first name**, reason in line — "so {host} knows who is asking". |

Nothing else. Spec 007 already agrees: prompted once, "never blocking".

### 5.6 The waiting state is the profile moment

Only door B (§5.8) has a wait. That hour is free — the person is blocked on someone else — so the profile step we took off the critical path is offered there, never required. It collects exactly what spec 007 wants at the one moment it is not friction. Skipping gives initials on a colour from the uid (007 §4).

### 5.7 Moving a trip into an Organization

Figma's lesson is not "do not defer", it is "do not bolt the move on afterwards". **O1 · Organization never required landed on "never" (2026-11-12), so this is load-bearing from day one** — a personally owned trip is now the normal case, and this is the only way one ever reaches an Organization:

- `Trip.orgId` nullable and settable after creation — spec 011 §10.2 reserves the field; **this spec requires the path exists**.
- Host only, into an Organization they belong to. One way in v1.
- Shown as what it is: the trip now survives its host (spec 011 R1).

### 5.8 Three doors

**This is the main correction.** There is not one way in; there are three, and they differ by **who has already decided about you**.

| Door | How you arrive | Approval | Why |
|---|---|---|---|
| **A — Invited** | A host added your email. You get a mail or push carrying a token unique to **your** invitation. | **None.** One tap in. | The host already decided. Asking them again is asking them to confirm their own decision — and making you wait an hour for it. |
| **B — Shared link** | The link was posted in a group chat. Nobody has decided anything about you. | **Request → approve.** | Approval is where the host makes the decision for the first time. |
| **C — Invited, arrived via the shared link** | You open the shared link and a pending invitation matches your verified email. | **None.** Silently upgraded to door A. | Same decision, different door. |

**What this costs today, for the pilot's dominant path:**

| | Steps |
|---|---|
| Door A as spec 002 reads | open → sign in → privacy → **request** → *wait up to 1h* → approved → open again → in |
| Door A as designed | open → sign in → privacy *(first time ever only)* → **in** |

The button says **"Join Annual Gathering"**, not "Request to join". The privacy note stays — it is the consent moment (N4) — but it is **once per person, before first entering any trip**, not once per trip.

#### 5.8.1 The token is the credential, not the email

This also closes the principle-3 hole I flagged in F17. F17 removes the exact-email match so an invitee can accept with any account — which is right (work Google, personal mailbox) and which, on its own, makes a **forwarded invitation a usable key**.

The fix is already half-built. `TripInvitation` carries a unique token per invitation (`models/TripInvitation.js`), and the accept route resolves it (`routes/groups.js:371`). So:

| Rule | Why |
|---|---|
| The **token** identifies which invitation is being accepted. The email does not. | One invitation, one person, one credential. |
| Any signed-in account may accept. | What F17 wanted. The work/personal split is real. |
| The invitation is marked **consumed** by that account, whatever its email. | Fixes spec 011 case 8 — one human holding two TripMembers, one pending forever. |
| An email mismatch is **recorded and shown to the host**, not blocked: "Marta's invitation was accepted by alberto@gmail.com". | Attributable. A host can revoke that one person. |
| Revoking one invitation touches only that person. | Unlike the shared link, where revoke resets everyone (F11). |

A forward is now a traceable, revocable, single-use event instead of an anonymous shared secret. That is strictly better than both today's exact-match (too strict — breaks the work/personal case, `groups.js:395`) and F17 as written (too loose).

### 5.8A When an Organization makes sense, and who can pay

Added 2026-11-12, after reading the revenue docs. §5.2 said an Organization is never a gate and justified it from onboarding. **The money model gives a second, independent argument for the same answer — and a sharper rule for when one is actually needed.**

**Can a person invite one or two friends without becoming an Organization?** Yes, and it must stay that way. Friends and family are free by design and are *the acquisition loop* (revenue analysis §1; **D33 · Primary segment** keeps them free). Working doc §4.3 takes this from Notion deliberately: free personal use is generous, the paywall sits at the team moment, and punitive free limits backfired badly enough to force a pricing overhaul. An Organization gate on a four-person weekend would tax the one motion the whole funnel depends on.

**When does an Organization actually make sense?** Not when you host — when one of these is true:

| Trigger | Why it needs an Organization |
|---|---|
| **Someone other than the host pays** | A company needs an invoice to a legal entity with a VAT number. A person pays with a card. |
| **Money flows *out* to the host** (models C1, H, D) | A payout needs a payee entity. |
| **One plan covers many events** (yearly, **D8 · Offsite test price**) | The Organization is the subscription container. |
| **The events must outlive one person** | Continuity — §5.2's original argument. |
| **A team shares admin across events** | One member list instead of N. |

None of those is "I want to host an event", and three of them are about money rather than access. **So hosting ≠ Organization, for revenue reasons as well as onboarding ones.** That is a second, independent argument for **O1 · Organization never required**.

**Should we only charge when there is an Organization?** No — the revenue docs already assume otherwise in two places:

- **The Trip Pass** (model I) is sold to "the organiser (maid of honour, best man, couple)" for €19–39 on *one personal trip*. That payer is a person, and asking them to invent a company name at checkout is friction at the worst possible moment.
- Working doc §4.2 already specifies the payout record as **"payee (Organization, **or host for personal trips**)"**. The data model anticipated a person being paid; it should equally anticipate a person paying.

Solo retreat hosts (model C1, premium buyer lens score 12) are the same shape: a one-person business that is not a company and should not have to pretend to be one.

> **The rule: the payer is a billing account, and a billing account may be a person or an Organization.** An Organization is required to *receive* an invoice or a payout, never to *pay* and never to *host*.

**What this spec builds now: nothing.** The pilot charges nobody — the gathering runs as a free Organization pilot (working doc §5). The decisions are **O13 · Who can pay** and **O14 · What the Trip Pass unlocks**, and the only code is the nullable `Trip.entitlement` field in [spec 011](011-roles-and-permissions.md) §5.4.

**One thing this does change today.** Spec 011 §5.4 found that the Trip Pass sells agenda import, approvals and a larger member cap to the host of a **personal** trip — capabilities §5.1 puts in the hosted column. Without the entitlement axis, a paying customer is either refused what they bought or has their trip flipped to `hosted`, which renames their friends into guests (**Q1 · Guest on friend trips**). That is **Q20** below.

### 5.9 Four more things the outcome needs

#### 5.9.1 The invited path must be measured (Q14)

`join rate = joined ÷ invited ≥ 60%` is the pilot's first threshold and today it is uncomputable for door A. Add: `invitation_sent`, `invitation_opened`, `invitation_accepted` (property: `emailMatched`), and `invitation_revoked`. Then:

- **Door A funnel:** sent → opened → accepted.
- **Door B funnel:** link_opened → requested → approved (F30 as written).

Reported separately, because they are different decisions and mixing them hides which one leaks.

#### 5.9.2 Bulk invite (Q15)

One paste box: emails separated by commas, spaces or newlines. Parse, show "34 addresses, 2 look wrong, 1 already invited", pick a role for all of them, send. Idempotent — re-pasting the same list sends nothing new.

#### 5.9.3 Host nudge on pending requests (Q16)

Push to hosts and co-hosts when the first request arrives, and again when anything has been pending **30 minutes**. It is the only mechanism aimed directly at the §11 median, and it rides the notification plumbing spec 002 part 7 builds anyway. Subject to the host's own category settings (F28).

#### 5.9.4 Carry the token through sign-in (Q17)

The invite or join token must survive the Google redirect and the email-link round trip, and return the person to the page they tapped. If it is lost they land on an empty trip list, which looks like the invitation was wrong. Deep-link state is a named requirement, not an implementation detail (AC 5, AC 6).

## 6. Localization

Spec 003 shipped the base: `react-i18next`, `en.json` / `es.json` / `pt.json` (pt-BR per S5), language order saved → country from IP → browser → English, AI output in the request language. i18next plurals (`_one` / `_other`) and `{{name}}` interpolation are already in use. **Everything new in this spec and spec 002 ships in all three languages from the start** (F33) — these are the parts that are not mechanical.

### 6.1 Never assemble a sentence

Every string with a name or a number in it is **one key**, with `{{name}}` and `{{count}}`. Never concatenate fragments — word order differs and the pieces cannot be reordered by a translator.

| | |
|---|---|
| Wrong | `t('hostedBy') + name + t('andOthers', n)` |
| Right | `joinPage.hosts` with `_one` / `_other`: EN "{{name}} and {{count}} others are hosting" · ES "{{name}} y {{count}} personas más organizan" · pt-BR "{{name}} e mais {{count}} pessoas organizam" |

Applies to: "Marta invited you", "Alberto usually approves within the hour", "Goes to {{count}} people", "{{count}} will get a push", "34 addresses, 2 look wrong".

### 6.2 Role labels, and the gender problem (Q18, O8)

§5.3 is 2 trip kinds × 3 roles × 3 languages = **18 flat keys** (`roles.hosted.host`, `roles.personal.host`, …). Never derived by concatenating kind and role.

The problem: English role nouns are ungendered; Spanish and Portuguese ones are not. *Anfitrión/anfitriona*, *invitado/invitada*, *organizador/organizadora* all inflect. **We do not collect gender and should not** — it is not needed for anything else, and guessing it from a name is exactly the error to avoid.

Three ways out, and only one is acceptable: slashes ("Invitado/a") are ugly and still signal that we wanted to know; guessing is wrong; **so the labels must use forms that do not inflect.** Proposed, and explicitly **for the native reviewers in spec 003 §6 to confirm** before any of it is written into a locale file:

| Stored | EN personal | EN hosted | ES personal | ES hosted | pt-BR personal | pt-BR hosted |
|---|---|---|---|---|---|---|
| `host` | Organizer | Host | Organiza | Organiza | Organiza | Organiza |
| `co-host` | Organizer | Co-host | Coorganiza | Coorganiza | Coorganiza | Coorganiza |
| `guest` | Member | Guest | Participante | Asistente | Participante | Participante |

Two things to note honestly. **The verb forms ("Organiza") are a workaround**, not natural label copy, and a native reviewer may well have something better. And **the personal/hosted distinction partly collapses in Spanish and Portuguese** — the English pair carries a tonal difference that the ungendered options do not reproduce. That weakens Q1's fix outside English, which is a real cost of choosing ungendered forms and belongs in **O8** rather than being hidden.

### 6.3 Dates, times and the event zone

`Intl.DateTimeFormat` with `timeZone: trip.timeZone` and `timeZoneName`, so "Madrid time (CET)" localizes to "hora de Madrid (CET)" rather than being assembled from a hardcoded English word plus an abbreviation (F35, AC 28).

### 6.4 Layout under expansion

N6 budgets ~30% expansion. The tightest elements in the new frames are the **role pills** — "Co-host" → "Coorganiza" is half as long again — and the role choices in frame 7. Pills wrap or truncate with the full value available; they never clip.

### 6.5 The first invitation has no recipient language (Q19, O9)

F36 sends push and email in the recipient's saved `User.locale`. A door-A invitee **has no account yet**, so there is none. The first invitation needs a language chosen for it; everything after it uses their own.

### 6.6 The missing-key check belongs in CI

Spec 002 part 10 adds a script that fails when a key is missing in any locale. A script nobody runs is not a check — it runs in CI on every PR (ww-D1), or the three files drift the first busy week.

## 7. Requirements

| # | Requirement |
|---|---|
| O-F1 | No flow requires an Organization: sign-up, trip creation, invite link, approval, publishing and adding co-hosts all work without one. |
| O-F2 | An Organization is never created automatically, and never without a name the user typed. |
| O-F3 | `Trip.orgId` is nullable. A trip with none is personally owned. |
| O-F4 | A trip's host can move it into an Organization they belong to. One way in v1. |
| O-F5 | Role labels resolve from `trip.kind`. The stored role never changes. |
| O-F6 | The join page shows the Organization when there is one and the event name does not repeat it, the host's name and face always, and personal-trip wording on a personal trip. |
| O-F7 | Google sign-in asks nothing at join. Email-link sign-in asks for a first name, one field, with the reason shown. |
| O-F8 | The approval queue always shows a human-readable name, never a bare email. |
| O-F9 | The waiting state offers a photo and name and never requires them. |
| O-F10 | Announcements, pushes, invitations and activity are attributed to a person. The Organization is never the author or the sender. |
| O-F11 | Creating a trip asks which kind it is and does not ask about Organizations. |
| **O-F12** | **An invited person enters without approval and without a request.** Door A and door C reach the trip in one tap after sign-in. |
| **O-F13** | **The invitation token is the credential.** Any signed-in account may accept. The invitation is marked consumed by that account; an email mismatch is recorded and shown to the host, not blocked. |
| **O-F14** | Revoking one invitation affects only that person. |
| **O-F15** | The privacy note is shown once per person, before first entering any trip — not once per trip. |
| **O-F16** | Analytics records `invitation_sent`, `invitation_opened`, `invitation_accepted` (with `emailMatched`) and `invitation_revoked`, and reports the invited and link funnels separately. |
| **O-F17** | A host can invite many people in one paste. Parsing reports valid, malformed and already-invited counts before sending. Re-sending the same list sends nothing new. |
| **O-F18** | Hosts and co-hosts are notified when the first request arrives and when any request has been pending 30 minutes, subject to their notification settings. |
| **O-F19** | The invite or join token survives Google and email-link sign-in and returns the person to the page they tapped. |
| **O-F20** | Every string added by this spec and spec 002 exists in `en`, `es` and `pt`. Strings containing a name or a count are single keys with interpolation and plurals, never concatenated. |
| **O-F21** | Role labels are 18 flat keys and use forms that do not inflect for gender. |
| **O-F22** | The missing-key check runs in CI on every pull request. |

## 8. Acceptance criteria

1. Given a brand-new account, when I create a trip, publish a schedule, create an invite link and approve a guest, then I am never asked about an Organization.
2. Given a user with no Organization, then no Organization exists for them in the database.
3. Given a personal trip the interface says organizer and member; given a hosted event, host, co-host and guest. The stored role is identical.
4. Given a trip migrated by F7, when its members open it, then the words they see are the words they saw before.
5. Given a hosted trip in an Organization whose name the event name does not repeat, when a stranger opens the invite link, then the Organization appears above the event name and the host's name and face below it.
6. Given an event name starting with the Organization name, then the Organization line is not shown on the join page.
7. Given a personal trip, then the join page says "{name} invited you" and the words host and guest do not appear.
8. Given Google sign-in on a join page, then I reach the join action without being asked for anything.
9. Given email-link sign-in, then I am asked for a first name and the host's queue shows that name.
10. Given I am waiting for approval, when I skip the profile offer, then nothing is blocked and I appear with initials.
11. Given a host on a personally owned trip, when they move it into an Organization, then `orgId` is set and members and roles are unchanged.
12. Given an announcement posted in an Organization's trip, then it is attributed to the person, in-app and in the push.
13. **Given an invitation sent to me, when I open its link and sign in, then I am inside the trip with no request and no approval, and the button I pressed said Join.**
14. **Given an invitation sent to `marta@work.com`, when Marta accepts signed in as `marta@gmail.com`, then she joins, the invitation is consumed, and the host's people screen shows the mismatch.**
15. **Given a consumed invitation, when its link is opened again by anyone, then it does not grant access.**
16. **Given a host revokes one invitation, then only that person's link stops working and every other invitation still works.**
17. **Given I open the shared link and a pending invitation matches my verified email, then I join without a request (door C).**
18. **Given I have already seen the privacy note on another trip, when I accept an invitation, then I am not shown it again.**
19. **Given the pilot runs, when the product owner exports the events, then join rate is computable separately for invited people and for shared-link arrivals.**
20. **Given a host pastes 38 addresses of which 2 are malformed and 1 is already invited, then they see those three counts before sending, and sending invites 35.**
21. **Given a request has been pending 30 minutes, then the hosts are notified unless they turned that category off.**
22. **Given I tap an invitation on a device where I am signed out, when I complete Google sign-in, then I land on that trip and not on an empty trip list.**
23. **Given any screen added by this spec or spec 002, then every string resolves in `en`, `es` and `pt`, and the missing-key check passes in CI.**
24. **Given a Spanish or Portuguese interface, then no role label is gendered and none is rendered with a slash.**
25. **Given an event in Europe/Madrid viewed in Spanish from another time zone, then times show in Madrid time with the zone named in Spanish.**

## 9. Product principles

| Principle | This spec |
|---|---|
| 1. One source of truth | Unaffected. |
| 2. Real-time by default | Unaffected. |
| 3. Privacy first | **Strengthened twice.** §5.5 collects less. §5.8.1 closes the forwarded-invitation hole that F17 opens, by making the credential a revocable per-person token instead of an email address anyone can forward. |
| 4. AI drafts are editable | Unaffected. |

**Brand check.** Q1 conflicts with brand foundations §1.3 ("Fair… not bossy, organizer-only") and §1.4 rule 2 ("use people's names"). §5.3 and §5.4 resolve both — with the caveat in §6.2 that the fix is weaker in Spanish and Portuguese.

## 10. Open decisions — need your call

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **O1 · Organization never required** ✅ | **Decided 2026-11-12: (b) never required.** Is an Organization ever required to host a trip? (D18 · Account model says "Organizations own hosted trips") | (a) Required — 002 §5.1 as written / (b) **Never required; offered when continuity or billing makes it useful** / (c) Required before inviting the first guest | **(b).** The product functions without one, and (c) gates exactly the aha moment. Costs the pilot nothing. If taken, D18 re-reads as "Organizations *may* own hosted trips" and Q7's move path becomes required. |
| **O2 · The word for Organization** | The user-facing word for an Organization | (a) **Organization** / (b) Team / (c) Workspace / (d) Brand-specific, as Luma chose "Calendar" | **(a) for the pilot**, where the user is a company. Revisit with the wedding and retreat segments — "organization" is wrong for a wedding. Belongs with [brand foundations](../brand/brand-foundations.md) §3. |
| **O3 · Role labels per trip kind** | Role labels per trip kind | (a) **Yes** / (b) host/co-host/guest everywhere / (c) organizer/member everywhere | **(a)**, with §6.2's caveat that it is weaker in ES and pt-BR. |
| **O4 · Join-page attribution** | Join-page attribution order | (a) **Organization above, person below with a face** / (b) person only / (c) Organization only | **(a).** Legitimacy and trust are different questions; a cold link needs both. |
| **O5 · First name at join** | Ask email-link users for a first name | (a) **Yes, one field** / (b) no, show the email / (c) after approval | **(a).** (b) breaks the host's decision, (c) is after the only moment it is needed. |
| **O6 · Profile while waiting** | Offer the profile step while waiting | (a) **Yes, optional** / (b) no / (c) require it | **(a).** Otherwise-dead time, and it is the data spec 007 wants. |
| **O7 · Move path timing** | When to build the move-into-an-Organization path | (a) data in block 1, screen in Phase 1 / (b) **data in block 1, screen when a user asks** / (c) both in the pilot | **(b).** The field is the whole of Figma's lesson; the screen has no pilot user. |
| **O8 · Ungendered role labels** | Role labels in ES and pt-BR (Q18) | (a) **Ungendered forms (§6.2 table), confirmed by the native reviewers** / (b) gendered with a slash ("Invitado/a") / (c) collect gender | **(a).** (c) is out of the question and (b) still signals we wanted to know. Accept that the personal/hosted tonal split is weaker outside English — the alternative is misgendering real attendees at a real company event. **This needs the spec 003 §6 native reviewers before any locale file is written.** |
| **O9 · First invitation language** | Language of the **first** invitation email, before the invitee has an account (Q19) | (a) **The trip's language, set by the host when they create it** / (b) the inviter's own language / (c) English always | **(a).** The host knows who they are inviting better than we do, and one field at trip creation covers the whole guest list. (b) breaks when an English-speaking admin invites a Spanish team. |
| **O10 · Declined requester** | What a declined requester sees (carried from 009 R6) | (a) "request sent" forever / (b) **"The host has not added you. Ask them directly."**, re-request allowed if a host re-opens it / (c) explicit "declined" | **(b).** (a) is a lie they will act on; (c) delivers a rejection nobody asked us to send. F16's silence is kept without being false. |
| **O11 · Who-is-going count** | Does the join page show how many people are going? | (a) **A count only, no names, and only when it is 3 or more** / (b) nothing / (c) names and faces | **(a).** Social proof raises join rate (Partiful, Luma) and a count identifies nobody, so principle 3 holds. The threshold stops a new event looking abandoned. (c) breaks principle 3 outright. |
| **O12 · Privacy note once** | Does door A still show the privacy note? | (a) **Yes, once per person before first entering any trip** / (b) once per trip / (c) not for invited people | **(a).** It is the consent moment (N4) and consent is not per trip. (c) would mean most pilot attendees never see it. |
| **O13 · Who can pay** | Can a person pay us without creating an Organization? (§5.8A) | (a) **Yes — a billing account is a person or an Organization. An Organization is needed to receive an invoice or a payout, never to pay or to host** / (b) only Organizations can pay / (c) only Organizations can pay, and we auto-create one at checkout | **(a).** The Trip Pass's named buyer is "the organiser (maid of honour, best man, couple)" and solo retreat hosts are a one-person business; (b) deletes model I and taxes model C1. (c) is Eventbrite's "unnamed organizer" at the worst possible moment — and working doc §4.2 already names the payout payee as "Organization, **or host for personal trips**", so the data model assumed (a) all along. |
| **O14 · What the Trip Pass unlocks** | Does buying a Trip Pass change the trip's kind? (§5.8A, Q20) | (a) **No. It unlocks features via the entitlement axis; kind, roles and labels are untouched** / (b) yes, it flips the trip to `hosted` / (c) a Trip Pass is only sold on hosted trips | **(a).** (b) renames the buyer's friends into guests the moment they pay us — Q1, charged for. (c) contradicts working doc §4.3, which sells the pass for "one big **personal** trip". This is the decision 011 §5.4's third axis exists to serve. |

**Still TBD and not mine:** O2's eventual answer (brand foundations §3) and O8's exact Spanish and Portuguese wording (spec 003 §6 native reviewers).

## 11. Direction, in one page

Three sentences, then the shape.

> **We are building the shortest possible path from a link in a group chat to a person inside a live trip, and nothing administrative stands in it.** Roles, Organizations and approval exist to protect that path, not to precede it. Where a decision has already been made — a host invited you by name — the product acts on it instead of asking again.

What that means concretely, across the three specs:

| | Direction |
|---|---|
| **Access** | One capability table, roles as presets, two layers. Access comes only from an active trip role; an Organization grants the right to *obtain* one, never to read (009). |
| **Entry** | Three doors, by who has already decided about you. Invited is one tap; shared-link is request-and-approve; the token is the credential, so one-tap and principle 3 stop fighting (012 §5.8). |
| **Structure** | The container arrives when it earns its keep, and the path into it is built on day one because Figma's is not (012 §5.2, §5.7). |
| **Words** | A person authors, an Organization vouches. Role words follow the trip's kind, and no role word guesses anyone's gender (012 §5.4, §6.2). |
| **Proof** | Two funnels measured separately, because invited and uninvited leak for different reasons (012 §5.9.1). |
| **Money** | The payer is a billing account, and it may be a person or an Organization. An Organization is needed to *receive* an invoice or a payout — never to pay, and never to host. Entitlement is a third axis beside role and trip kind, reserved now as one nullable field so pricing lands as a lookup (012 §5.8A, 011 §5.4). |

**Why this stays three specs and not four.** The revenue work above changes `can()` and changes when an Organization appears, so it belongs in 009 and 010 respectively. A fourth spec twelve days before the pilot would add an approval gate without adding a decision — every new question here is an **R** or **O** row in a spec already waiting on you.

**The one real risk is the calendar.** The build window is 12–19 Nov for an event on 24–25 Nov. Everything above is sized against that in §12: the pilot slices contain the three regressions and nothing speculative, and §5.8's one-tap path is largely **removing** a step from a mechanism the code already has.

## 12. Build order — the slices

Spec 002 §12 has eleven build-order rows. These are the same rows grouped into shippable slices, with the new work folded in — not a competing plan.

| Slice | 002 rows | Plus | Pilot? | Maps to |
|---|---|---|---|---|
| **S1 · Permissions foundation** | 1 | 009 block 1 (capability table, `can()`, TripMember/OrgMember, migration with dry-run and reverse, **G3 · No self-demotion**, **G5 · One helper**) and **G4 · Immediate revocation**; role labels (§5.3); **`Trip.entitlement` reserved** (011 §5.4, **R8 · Entitlement axis**) | **Must** | Epic [#20](https://github.com/Fogataz/trip-planner/issues/20) — enrich, do not replace |
| **S2 · The door** | 2, 3, 9 | §5.8 three doors, token-as-credential, §5.5 name field, §5.6 waiting state, §5.9.2 bulk invite, §5.9.3 host nudge, §5.9.4 deep link, §5.4 attribution | **Must** | New epic |
| **S3 · Localization of the new surface** | 4, 10 | §6 in full: 18 role keys, no concatenation, `Intl` zone names, CI missing-key check, O8 and O9 | **Must** | New epic |
| **S4 · Analytics** | 5 | §5.9.1 invited-path events and two separate funnels | **Must** | New epic |
| **S5 · Agenda drafts** | 6, 11 | — | **Must** | New epic |
| **S6 · Announcements and notifications** | 7, 8 | — | Must / Should | New epic |
| **S7 · Lifecycle hardening** | — | 009 block 2 remainder (G1 last host, G2 last owner) | Should | New epic |
| **S8 · After the pilot** | — | 009 blocks 3–5 (guest proposals, per-member overrides, org reach); 012 §5.7 move screen; Organization member list and contextual create | **No** | Phase 1 |

**Dependency:** S1 before everything. S2 and S3 run together. S4 must land before the dry run on 20 Nov or the pilot produces no numbers.

## 13. Out of scope

Organization home page beyond the switcher and member list; billing and payouts; interests onboarding (D2 · Gathering scope); avatars beyond Google's and §5.6's offer (spec 007 owns profiles); moving a trip *out* of an Organization; partner sharing between Organizations (009 block 5); a fourth language; machine translation of content; the naming decision behind O2.

## 14. What this changes elsewhere

| Document | Change |
|---|---|
| **002** §5.1 step 2 | Organization becomes optional and moves after the trip exists (O1). |
| **002** §5.2 | Becomes door B only. Door A is §5.8 and does not pass through it. |
| **002** F12, S1 | "host name" → "who is hosting" (§5.4). |
| **002** F14 | The queue shows a name (§5.5). |
| **002** F17 | Kept, with the credential corrected: the **token**, not the email, and a recorded mismatch instead of a block (§5.8.1). |
| **002** F7 | Unchanged in data; the words are §5.3's. |
| **002** F30, §11 | Four invited-path events; two funnels reported separately (§5.9.1). |
| **002** F2 | Bulk paste (§5.9.2). |
| **002** F36 | Needs O9 for the first invitation. |
| **002** part 10 | The missing-key script runs in CI (§6.6). |
| **002** frames 1, 4, 5, 13 | Attribution, the waiting offer, names in the queue, and "Create an Organization" leaving the switcher. |
| **009** case 8, §10.2 case 10 | Case 8 is closed by consumed-on-accept (§5.8.1); case 10 becomes required if O1 is (b). |
| **009** R6 | Carried here as O10. |
| **003** §6 | Its native-review gap now blocks O8. |
| **007** | Agrees; §5.5 and §5.6 are where its prompt lands. |

## 15. Design lenses

Per [design-lenses.md](../process/design-lenses.md) (lens-D1 · All fourteen lenses).

| # | Lens | This spec |
|---|---|---|
| L1 | Localization | §6 in full. Every string with a name or count is **one key** with interpolation and plurals, never glued (§6.1); role labels are 18 flat keys using forms that do not inflect for gender (§6.2, **O8 · Ungendered role labels**); `Intl.DateTimeFormat` with `trip.timeZone` and `timeZoneName` so "hora de Madrid (CET)" is not assembled (§6.3); the missing-key check runs in CI (§6.6). The first invitation has no recipient language — **O9 · First invitation language** (§6.5). Frame 13 is the Spanish proof. |
| L2 | Roles and access | The join page is the signed-out visitor's only surface and shows four facts plus a count (**O11 · Who-is-going count**). A prospective traveller sees the same until approved. Inviting, approving and bulk invite need `member.invite` / `member.approve`; moving a trip into an Organization is **host only**, and only into one they belong to (O-F4). Org roles grant nothing (**D19 · Org membership grants no trip access**). |
| L3 | Money | §5.8A. **The payer is a billing account and may be a person or an Organization**; an Organization is needed to receive an invoice or a payout, never to pay or to host. The single place entitlement is checked is `entitlements(trip)` in [spec 011](011-roles-and-permissions.md) §5.4. Nothing is charged in the pilot. The AI cost here is unchanged — this spec adds no model call. |
| L4 | Privacy and data | **Less is collected, not more.** Google users are asked nothing; email-link users give a first name only, with the reason in line (§5.5). The photo in §5.6 is optional and skipping blocks nothing. The join page shows a **count, never identities** (O11). The privacy note is consent and is shown once per person before first entering any trip (**O12 · Privacy note once**, N4). The email-mismatch record (§5.8.1) is visible to hosts only. |
| L5 | Real-time | Join requests reach the host over the existing socket within the round trip (002 AC 10), so the badge and queue move without a refresh. Approval opens the trip on the next visit (002 F16). No new event type. |
| L6 | Measurability | §5.9.1. Four events — `invitation_sent`, `invitation_opened`, `invitation_accepted` (`emailMatched`), `invitation_revoked` — and **two funnels reported separately**, because invited and shared-link arrivals leak for different reasons. Without them the pilot's headline *join rate ≥ 60%* is uncomputable (**Q14 · Invited funnel unmeasured**). No content, no coordinates. |
| L7 | States and degradation | Drawn, not described: logged-out join page (frame 1), email sent with a countdown and an escape hatch (frame 2), waiting (frame 4), one-tap invited (frame 11), malformed and duplicate addresses before sending (frame 12). A revoked link is a state of frame 1 (002 AC 13); a declined requester is **O10 · Declined requester**. If push fails the person still sees the event in-app (**S6 · iPhone announcement reach**). |
| L8 | Notifications | §5.9.3 adds a **host nudge** — first request, then anything pending 30 minutes — under the existing categories and subject to the host's own settings (002 F28). It is aimed at a threshold nothing else drives (**Q16 · Nothing drives the approval target**). The invitation itself goes in the event's language (O9). Guests gain no new notification. |
| L9 | Accessibility | N5 throughout. Frame 12's language options each carry their own `lang` attribute so a screen reader pronounces them correctly; role pills wrap or truncate under the ~30% expansion N6 budgets, which frame 13 makes visible ("Coorganiza" against "Co-host"); every control in the 13 frames has a visible name and a 44px target. |
| L10 | Reversibility | An invitation is a **per-person revocable credential** — revoking one touches only that person (O-F14), unlike the shared link where revoking resets everyone. A trip move into an Organization is **one way in v1 and says so on the screen** (frame 10). A demotion never un-publishes what someone wrote ([spec 011](011-roles-and-permissions.md) §6.3). |
| L11 | Migration | §5.3 is what makes 002 F7 safe: the stored role changes, **the words do not**, so an existing trip reads exactly as it did (AC 4). With no migration run, nothing in this spec is reachable — it all sits behind slice S1. `Trip.orgId` becomes nullable, which is additive and needs no backfill. |
| L12 | Enforcement | **The invitation token is the credential, not the email** (§5.8.1): any signed-in account may accept, the invitation is consumed by that account, and a mismatch is recorded and shown to the host rather than blocking. A consumed or revoked token grants nothing (AC 15, 16). Every endpoint goes through `requireCapability()`; a guest calling the invite or approve endpoints gets 403. |
| L13 | Scale | Built for the hosted-event numbers, not eight friends: bulk invite parses a paste of 38+ and reports counts before sending (§5.9.2); the people list and approval queue are paged; counts read `status: 'active'` only, so 41 means 41 (**Q15 · No bulk invite**, [spec 011](011-roles-and-permissions.md) case 15). |
| L14 | Lifecycle | Mostly **before**: joining, inviting, approving. During the event the host nudge still fires and the people screen is how a host fixes a wrong role. After it ends, nothing here runs except **O7 · Move path timing**'s move into an Organization, which is a continuity act and is most likely to happen once the event is over. |

## 16. Build status

Not started. Draft, pending the gate.
