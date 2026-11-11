# Spec 010: Joining, naming and the first trip

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Wireframes: [`wireframes/010-joining-and-naming/`](../../wireframes/010-joining-and-naming/) — 8 frames, including the three [spec 002](002-hosted-event-pilot.md) §6 left undrawn.
Related: [002 hosted event pilot](002-hosted-event-pilot.md) (F1, F2, F4, F12, F17), [007 profiles and display names](007-profiles-and-display-names.md), [009 roles and permissions](009-roles-and-permissions.md).

> Written 2026-11-11, from a QA pass over spec 002 and its wireframes after [spec 009](009-roles-and-permissions.md). Two of the findings below are regressions spec 002 would ship as written; the rest are the onboarding and naming decisions 002 never had to make because the pilot's Organization is created by hand.

## 1. The problem in one line

An **Organization** is an administrative object — it exists for ownership, continuity and billing (D18). Planning a trip is a social act. Spec 002 §5.1 puts the administrative decision at **step 2 of 6**, before the user has made anything or seen anyone, and spec 002's role names turn five friends into "a host and four guests".

## 2. What we are actually solving, and the ideal outcome

**The aha moment is not "I made a trip."** A trip with one person in it is a worse to-do list. It is **the second person appearing in it** — the moment the thing stops being a document and starts being a group. Everything before that is cost the user pays; everything after is value they receive.

That gives one number to design against:

> **Time from first sign-in to second active member.**

Every question we ask before that moment has to justify itself against it. The onboarding research is consistent on the method: collect the minimum to get the user in and ask for more as context demands; measure time from signup to the aha moment and push it toward zero; but **do not defer steps the product needs in order to function** ([PLG onboarding guide](https://www.plg.news/p/the-ultimate-guide-to-product-led), [SaaS onboarding practices](https://formbricks.com/blog/user-onboarding-best-practices)).

So the test is narrow and answerable: **does the product function without an Organization?**

| Needs an Organization | Works without one |
|---|---|
| Shared ownership that outlives one person (continuity) | Creating a trip — it has a host |
| Billing and payouts (not built) | The invite link and approval |
| An org-level member list across trips | The schedule, polls, expenses, announcements, AI drafts |

Only continuity and billing genuinely need it, and neither exists in the pilot. **The product functions without an Organization, so the Organization must not be a gate.**

## 3. Benchmark

| Product | What it does | What we take |
|---|---|---|
| **Figma** — the cautionary one | Allowed personal drafts for years, then required every draft to belong to a team. Users move files **one at a time**: Figma's community confirms there is no bulk move, moves between Organizations are not possible, and a personal-to-organization migration goes through support or a `.fig` export ([Figma blog](https://www.figma.com/blog/updates-to-how-drafts-work/), [Figma forum](https://forum.figma.com/t/drafts-are-changing-here-s-what-you-need-to-know/73701/39)). Notably, **existing collaborators keep working in unmoved drafts, but inviting a new one requires moving the file into a team.** | Two things. Defer the container — Figma did, for years, correctly. **And build the adoption path on day one**, because Figma's pain is not deferral, it is bolting the move on afterwards. Also their gate is the right one: collaboration continues, *adding a new collaborator* is where the team is needed. |
| **Airbnb** | "Hosted by [first name]" with a face, even for professional managers. The default profile is a first name and the year they joined. An academic study found the more trustworthy a host is perceived to be from her photo, the higher the price of the listing and the probability of its being chosen ([Ert, Fleischer & Magen](https://researchgate.net/profile/Eyal-Ert/publication/315410754_Trust_and_Reputation_in_the_Sharing_Economy_The_Role_of_Personal_Photos_on_Airbnb)). Guesty advises property managers to use a headshot of the primary contact rather than a company logo ([Guesty](https://www.guesty.com/setting-up-profile-airbnb-how-does-it-work/)). | **Trust is carried by a person, not a logo** — even when a business is really behind it. The person goes on the invitation. |
| **Eventbrite** | The organizer profile is a first-class public identity whose name, image and website appear on the listing where attendees register. It auto-creates an **"unnamed organizer"** profile by default ([Eventbrite help](https://www.eventbrite.com/help/en-us/articles/161196/)) | The org identity is what a stranger checks for legitimacy. And the failure mode: a container created for you, unnamed, shown to the public. Never auto-create one. |
| **Partiful** | "[Name] invites you." One link, no app, social register (spec 002 benchmark) | The voice for a personal trip. Nobody "hosts" a weekend with friends. |
| **Slack, Notion, Linear** | Workspace first, always. You name the container before you see the product | What not to do before anyone is sold. These are bought by someone already convinced; our link arrives cold in a WhatsApp group. |
| **Luma** | Calls the container a **Calendar**, not an organization ([Luma help](https://help.luma.com/p/adding-hosts-and-managers-to-your-event)) | The word matters. See O2. |

## 4. QA register

Findings from the pass over spec 002, its 13 frames and spec 009. **Q1 and Q2 are regressions spec 002 would ship as written.**

| # | Finding | Where | Severity | Position |
|---|---|---|---|---|
| **Q1** | **"Guest" is applied to existing friend trips.** F7 migrates creator → host, organizers → co-hosts, members → **guests**. Today the words are "organizer" and "member". Five friends planning Lisbon become a host and four guests. Brand foundations §1.3 says the personality is **Fair — "everyone has a voice", not "bossy, organizer-only"**. Calling your friends guests is precisely that register. | 002 F7, every member-facing screen | **High** — it is a visible regression for every existing user, on a migration that cannot be partially undone | **Label the role per trip kind** (§5.3). Free: spec 009 made roles presets, so the stored role is unchanged and only the lookup differs. |
| **Q2** | **The Organization is a gate before any value.** §5.1 makes "create an Organization, or pick one" step 2 of 6, before the trip exists. | 002 §5.1 | **High** for self-serve; **zero for the pilot**, where the owner creates the Organization by hand | Never required (§5.2). |
| **Q3** | **The join page shows no Organization at all.** F12 and S1 give "event name, dates, **host name** and cover". For a link arriving cold in a WhatsApp group, the company name is the legitimacy signal, and it is missing. | 002 F12, frame 1 | Medium | Attribution rule, §5.4. F12's "host name" becomes "who is hosting". |
| **Q4** | **A host cannot tell who is asking to join.** Frame 5 shows "Marta R. · marta@example.com". With Google we get a name; with an email link we have **only an email**, so the queue shows bare addresses and the host cannot decide. | 002 F14, frame 5 | **High** — it breaks the approval decision itself | Ask one field, only on the email-link path (§5.5). |
| **Q5** | **The waiting state is a dead end** for up to the 1-hour approval target in §11. | 002 frame 4 | Medium | Make it the progressive-profiling moment (§5.6). |
| **Q6** | **"Create an Organization" is a permanent menu item** in frame 13, which both promotes it (against S7's "not promoted") and offers it at the one moment nobody needs it. | frame 13 | Low | Contextual prompt at the continuity moment (§5.2). |
| **Q7** | **No path from a personal trip to an Organization.** Spec 009 case 10 reserved `Trip.orgId` as settable but nothing requires the path. Deferring the Organization makes this load-bearing — this is exactly Figma's mistake. | 009 case 10 | **High if O1 lands on "defer"** | Build the data in block 1, the screen in Phase 1 (§5.7). |
| **Q8** | **Attribution has no rule anywhere.** "Hosted by Alberto C." is hard-coded in frames 1 and 4 with no statement of what happens when an Organization exists, when it does not, or on a personal trip. | frames 1, 4, 9; F12 | Medium | §5.4. |
| **Q9** | **An Organization could be auto-created** to satisfy D18 ("Organizations own hosted trips") when a user has none — Eventbrite's "unnamed organizer" failure. | implied by D18 | Medium | Never auto-create. A trip with no Organization is personally owned, full stop (§5.2). |
| **Q10** | The privacy note (frame 3) is shown **before** the request, but a first-name field (Q4) would land on the same screen. Two asks in one step. | frame 3, frame 19 | Low | One screen, one ask: the name goes on the request screen, the privacy note keeps its own (§5.5). |
| **Q11** | **An approved guest's first screen is unspecified.** F16 says approval "makes the event available"; §5.2 step 5 says it opens on the next visit. If the agenda is not published yet they land in an empty trip. | 002 F16 | Low | §5.1's ordering already puts import (step 4) before sharing (step 5). Confirmed correct; no change, but it is an ordering the build must not swap. |
| **Q12** | **The word "Organization" is cold** outside a company. The pilot is a corporate gathering so it fits; a wedding or a retreat is not an organization. Luma says Calendar, Slack and Notion say Workspace, Meta says Business portfolio. | everywhere | Low now, higher with the wedding segment | **O2**, owner's call. |

## 5. The design

### 5.1 Principle

> **Nothing administrative before the second person.** Every question between first sign-in and the second active member must be one the product cannot function without.

### 5.2 The Organization is never a gate

| Moment | Organization required? |
|---|---|
| Signing up | No |
| Creating a trip | No |
| **Creating the invite link, and inviting the first guests** | **No** — this is the aha moment; gating it is the one change that would cost most |
| Publishing the agenda | No |
| Adding a co-host | No |
| **Adding a co-host who must keep access if the host leaves** | **This is the first real need.** Offer here, do not force |
| A second hosted event by the same person | Offer |
| Billing and payouts | Require — not built |

A trip with no Organization is **personally owned**: its host is a person, and §9 of spec 009 already covers what happens to it. It is never auto-adopted into one, and an Organization is never auto-created (Q9).

**This changes the reading of D18** ("Organizations own hosted trips"), which is why it is **O1** and not a decision taken here. It costs the pilot nothing: §5.1 already says the product owner creates the pilot Organization by hand and adds the organizers as admins, so the self-serve path is not exercised on 24 Nov either way.

### 5.3 Role labels follow the trip kind

The stored role is unchanged. Only the word differs, resolved in one lookup and three locale files.

| Stored role (009) | Personal trip | Hosted event |
|---|---|---|
| `host` | **Organizer** | **Host** |
| `co-host` | **Organizer** | **Co-host** |
| `guest` | **Member** | **Guest** |

Consequences worth stating: after the F7 migration an existing user sees **no change in wording at all**, which is what "no user loses access they have today" (AC 4) should mean in the interface as well as in the permission table. And the capability difference between the two columns stays exactly where spec 009 §5.2 put it — in `Trip.guestPermissions`, not in a word.

### 5.4 Attribution — the rule

Two different questions, asked at two different moments:

- **"Is this real?"** — answered by the **Organization**.
- **"Do I know who is asking me?"** — answered by the **person**, with a face. This is the Airbnb finding: trust transfers from a human even when a business is behind it.

> **An Organization is never the author of anything. People write, post and host; Organizations own and vouch.**

| Context | What it says |
|---|---|
| Join page — hosted trip in an Organization | Organization name above the event name, small. Below: the host's face and **"Alberto C. and 2 others"**. Legitimacy first for a stranger, then the human. |
| Join page — hosted trip, no Organization | **"Hosted by Alberto C."** with a face. The person is the only legitimacy there is. |
| Join page — personal trip | **"Marta invited you."** Social register, no institution, no "host". |
| Inside a trip | Person first in the header; the Organization appears in trip info. They are already in; the question has changed. |
| Announcements | **Always the person.** A company does not write "breakfast moved to the lobby". |
| Push notifications | The person's name (brand voice rule 2: use people's names, never emails). |
| Analytics and audit | The Organization, because that is the owning entity. |

**Edge case:** when the event name already starts with the Organization name ("eDreams ODIGEO Gathering" by "eDreams ODIGEO"), drop the Organization line on the join page and show it in trip info only. Never print the same words twice on one screen.

### 5.5 What a joining guest is asked

The approval queue is a decision screen. A host who cannot tell who is asking cannot make it (Q4). That is the one piece of information the join flow genuinely needs.

| Signed in with | We already have | Asked at join |
|---|---|---|
| Google | Name, email, picture | **Nothing.** Straight to Request to join. |
| Email link | Email only | **One field: first name**, with the reason in-line — "so {host} knows who is asking". |

Nothing else. No avatar, no surname, no interests (out of scope, D2), no company. Spec 007 already agrees: the profile is "prompted once after sign-up or after the first trip join, **never blocking**".

### 5.6 The waiting state is the profile moment

Approval is targeted at under an hour (§11) and frame 4 currently leaves the requester staring at a status card (Q5). That hour is free: they are blocked on someone else, so anything offered there costs the critical path nothing.

Offer — never require — a photo and a confirmed name, framed as what it is: *"so people recognise you when you are in."* It collects exactly what spec 007 wants, at the one moment it is not friction. If they skip it, initials on a colour derived from the uid (spec 007 §4) and nothing is blocked.

### 5.7 Moving a trip into an Organization

Figma's lesson is not "do not defer". It is "do not bolt the move on afterwards" (Q7). If O1 lands on deferral, this path is load-bearing from day one:

- `Trip.orgId` is nullable and settable after creation — **spec 009 §10.2 already reserves the field; this spec requires the path exists.**
- Only the trip's host can move it, and only into an Organization they belong to.
- Moving changes who can *claim* the trip (spec 009 R1) and who it survives. It is shown as that, not as a filing action.
- It is one-way in v1. Moving a trip out of an Organization is not built.

## 6. Requirements

| # | Requirement |
|---|---|
| O-F1 | No flow requires an Organization: sign-up, trip creation, invite link, approval, publishing and adding co-hosts all work without one. |
| O-F2 | An Organization is never created automatically, and never created without a name the user typed. |
| O-F3 | `Trip.orgId` is nullable. A trip with none is personally owned and behaves identically except for continuity (spec 009 R1). |
| O-F4 | A trip's host can move it into an Organization they belong to. One way in v1. |
| O-F5 | Role labels resolve from `trip.kind`: organizer/organizer/member on personal, host/co-host/guest on hosted. One lookup; the stored role never changes. |
| O-F6 | The join page shows the Organization when there is one and the event name does not already start with it, the host's name and face always, and the personal-trip wording on a personal trip. |
| O-F7 | A user signing in with Google is asked for nothing at join. A user signing in by email link is asked for a first name, one field, with the reason shown. |
| O-F8 | The approval queue always shows a human-readable name, never a bare email. |
| O-F9 | The waiting state offers a photo and name and never requires them. Skipping blocks nothing. |
| O-F10 | Announcements, pushes and activity are attributed to a person. The Organization is never the author. |
| O-F11 | Creating a trip asks which kind it is (personal or hosted event) and does not ask about Organizations. |

## 7. Acceptance criteria

1. Given a brand-new account, when I create a trip, publish a schedule, create an invite link and approve a guest, then I am never asked about an Organization.
2. Given a user with no Organization, then no Organization exists for them in the database.
3. Given a personal trip, then the interface says organizer and member; given a hosted event, host, co-host and guest. The stored `TripMember.role` is identical in both.
4. Given an existing trip migrated by F7, when its members open it, then the words they see are the words they saw before the migration.
5. Given a hosted trip in an Organization whose name the event name does not repeat, when a stranger opens the invite link, then the Organization name appears above the event name and the host's name and face appear below it.
6. Given a hosted trip whose event name starts with the Organization name, then the Organization line is not shown on the join page.
7. Given a personal trip, when someone opens its invite link, then it says "{name} invited you" and the words host and guest do not appear.
8. Given I sign in with Google on a join page, then I reach Request to join without being asked for anything.
9. Given I sign in with an email link, then I am asked for a first name, and the host's approval queue shows that name.
10. Given I am waiting for approval, when I skip the profile offer, then nothing is blocked and I appear to the host with initials.
11. Given a host on a personally owned trip, when they move it into an Organization they belong to, then the trip's `orgId` is set, the members and their roles are unchanged, and the trip is listed under that Organization.
12. Given an announcement posted by a host in an Organization's trip, then it is attributed to the person, in-app and in the push.

## 8. Product principles

| Principle | This spec |
|---|---|
| 1. One source of truth | Unaffected. |
| 2. Real-time by default | Unaffected. |
| 3. Privacy first | **Strengthened.** §5.5 reduces what we collect and when. The join page still shows only what S1 allows, plus the Organization, which is less personal than the host name already shown. |
| 4. AI drafts are editable | Unaffected. |

**Brand check.** Q1 is a direct conflict with brand foundations §1.3 ("Fair: everyone has a voice… not bossy, organizer-only") and §1.4 rule 2 ("use people's names"). §5.3 and §5.4 resolve both.

## 9. Open decisions — need your call

**O1 is the one that matters, and it changes how D18 reads.** The rest can run on their recommendation (D27).

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **O1** | Is an Organization ever required to host a trip? D18 says "Organizations own hosted trips". | (a) Required to create a hosted trip — spec 002 §5.1 as written / (b) **Never required; offered when continuity or billing makes it useful; a trip with none is personally owned** / (c) Required before inviting the first guest | **(b).** The product functions without one (§2), and (c) gates exactly the aha moment. It costs the pilot nothing, because the pilot Organization is created by hand either way. If you take (b), D18 should be re-read as "Organizations *may* own hosted trips", and Q7's adoption path becomes required rather than reserved. |
| **O2** | The user-facing word for an Organization | (a) **Organization** / (b) Team / (c) Workspace / (d) Something brand-specific, as Luma chose "Calendar" | **(a) for the pilot**, where the user really is a company, and revisit when the wedding and retreat segments are tested — "organization" is wrong for a wedding and the brand doc has not named the alternative. This is a naming decision and belongs with brand foundations §3, not here. |
| **O3** | Role labels per trip kind (§5.3) | (a) **Yes** / (b) One vocabulary everywhere (host/co-host/guest) / (c) One vocabulary everywhere (organizer/member) | **(a).** It is a lookup and three locale files, it removes a visible regression for every existing user, and (b) is the regression. |
| **O4** | Join-page attribution order (§5.4) | (a) **Organization above, person below with a face** / (b) Person only, as drawn today / (c) Organization only | **(a).** Legitimacy and trust are different questions and a cold link needs both answered. |
| **O5** | Ask email-link users for a first name at join | (a) **Yes, one field** / (b) No, show the email to the host / (c) Ask after approval | **(a).** (b) breaks the host's decision (Q4), and (c) is too late for the only moment it is needed. |
| **O6** | Offer the profile step in the waiting state | (a) **Yes, optional** / (b) No, keep the waiting state static / (c) Require it before the request is sent | **(a).** Free time that is otherwise dead, and it is the data spec 007 wants. (c) would put it back on the critical path. |
| **O7** | When do we build the move-into-an-Organization path? | (a) Data in block 1, screen in Phase 1 / (b) **Data in block 1, screen when the first user asks** / (c) Both in the pilot | **(b).** The field costs nothing now and is the whole of Figma's lesson; the screen has no pilot user, since the pilot Organization exists before its trip does. |

**Still TBD and not for me:** O2's eventual answer belongs with the naming work in [brand foundations](../brand/brand-foundations.md) §3.

## 10. Build order

| Block | What | In the pilot? |
|---|---|---|
| **1** | §5.3 role labels; `Trip.orgId` nullable and settable; the approval queue showing names not emails (Q4); the join-page attribution rule (§5.4) | **Yes.** Q1 and Q4 are regressions and the other two are copy and one nullable field. All inside epic [#20](https://github.com/Fogataz/trip-planner/issues/20) and spec 002 part 3. |
| **2** | §5.5 first-name field on the email-link path; §5.6 waiting-state profile offer | **Yes if spec 002 part 9 (email-link sign-in) ships.** Both are cut if it is cut — they only exist on that path. |
| **3** | Trip kind at creation without an Organization (O-F11); no Organization gate anywhere (O-F1) | Only if O1 is (b). Small: it is the removal of a step. |
| **4** | Create an Organization as a contextual prompt; Organization member list; move a trip into an Organization | No. Phase 1. The pilot Organization is made by hand. |

## 11. Out of scope

Organization home page beyond the switcher and member list (spec 002 §10); billing and payouts; interests onboarding (D2); avatars beyond what Google provides and what §5.6 offers (spec 007 owns profiles); moving a trip *out* of an Organization; partner-style sharing between Organizations (spec 009 block 5); the naming decision behind O2 (brand foundations §3).

## 12. What this changes elsewhere

| Document | Change |
|---|---|
| **002** §5.1 | Step 2 "Create an Organization, or pick one you belong to" becomes optional and moves after the trip exists. Subject to O1. |
| **002** F12, S1 | "host name" becomes "who is hosting", resolved by §5.4. |
| **002** F7 | Unchanged in data. The interface words are §5.3's, so the migration is invisible to existing users. |
| **002** F14, frame 5 | The approval queue shows a name. Requires §5.5. |
| **002** frames 1, 4, 13 | Attribution (§5.4), the waiting-state offer (§5.6), and "Create an Organization" leaving the switcher (Q6). |
| **009** §10.2, case 10 | `Trip.orgId` settable moves from reserved to required, if O1 is (b). |
| **007** | Agrees already. §5.5 and §5.6 are where its profile prompt lands; 007 keeps ownership of profiles. |

## 13. Build status

Not started. Draft, pending the gate.
