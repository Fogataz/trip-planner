# Spec 011: Organizations, roles and permissions

Status: approved
Owner: Alberto (product)   Shipped: —   PR: block 1 in review, [#124](https://github.com/Fogataz/trip-planner/pull/124)

> **Renumbered before merge (2026-11-11).** Drafted as spec 009 in pull request #102, which was opened before specs 009 trip cover layout (#78) and 010 host edits their trip (#110) took those numbers. Nothing published was renumbered — this one had not merged yet ([naming.md](../process/naming.md) §2).
Current behavior: [features.md](../features.md) — two roles (`organizer`, `member`) embedded in `Trip.members`, checked by string comparison in 11 places across 5 files.

> **✅ Decided 2026-11-12 by the product owner:** **R1 · Org owner reach** = (b) claim, logged and announced. **R2 · Leaving an Organization** = (b) roles are dropped; spec 002 §10 is corrected to match and D21 · Leaving an Organization can move to *decided*. **R8 · Entitlement axis** = (a) reserve `Trip.entitlement` only. Together with **O1 · Organization never required** in [spec 012](012-joining-naming-and-the-first-trip.md), the data model for block 1 is settled. R3–R7 run on their recommendations per D27 · Recommendations are working defaults.
>
> Written 2026-11-11, before the approval gate on [spec 002](002-hosted-event-pilot.md). Spec 002 part 1 (epic [#20](https://github.com/Fogataz/trip-planner/issues/20)) builds the first slice of this model; this spec owns the model itself, because [005 settle up](005-settle-up.md), [006 transport](006-transport-updates.md), [007 profiles](007-profiles-and-display-names.md) and everything after will each ask "who is allowed to do this?" and should not each answer it again.
>
> **This spec does not add a feature.** It defines a vocabulary and five guarantees, so that features built later do not have to be unpicked. Build-order §12 says which part is in the pilot and which is not.

## 1. The idea in one line

Make **capability the primitive and role the preset**, on two layers — Organization and trip — so that "who can do what" is one table we extend, instead of a condition we rewrite in every route.

## 2. Why now

Three reasons, in order of how expensive they get later.

**The shape of the data is decided in the pilot whether we think about it or not.** Spec 002 part 1 replaces the embedded `Trip.members` array with a `TripMember` collection and migrates every existing trip into it (F7, AC 4). That migration runs once. If `TripMember` has the right shape, blocks 2 to 5 below are additive. If it has the wrong shape, each of them is another migration against live pilot data.

**The current check does not survive a third role.** `role === 'organizer'` appears 11 times across `routes/trips.js`, `routes/groups.js`, `routes/polls.js` and `routes/expenses.js`. Spec 002 adds host, co-host and guest, hosted and personal trips, and a different guest rule for each (F4, F6). That is at least four conditions per call site, written out by hand, with no single place to read what a guest can do.

**Two confirmed gaps in today's base.** Both are small now and both get worse the moment removal becomes a real workflow, which spec 002 makes it:

| Gap | Where | Why it matters after spec 002 |
|---|---|---|
| Socket authorization is checked **once, at join** (`server/index.js:127`). Nothing removes a socket from `trip:<id>` afterwards. | `join-trip` handler | A removed member keeps receiving every schedule change, poll, expense and announcement until they happen to disconnect. Principle 3 says only active members see a trip. |
| Live location is keyed by `tripId:userId` in memory with no re-check against membership | `liveLocations` map | A removed member keeps broadcasting their position to the trip, and keeps receiving everyone else's. |

## 3. Benchmark

Six products that solve the same problem. The question asked of each: **where does the container's role end and the thing's role begin?**

| Product | Container layer | Thing layer | What we take | What we avoid |
|---|---|---|---|---|
| **Meta Business Manager** | Business portfolio role: **Admin** (full control) or **Employee**. Meta recommends adding people as employees by default ([Meta help](https://en-gb.facebook.com/business/help/442345745885606)) | Per-asset **tasks** granted individually — Meta's own example is an employee who can create ads and view Page performance but cannot publish to the Page | **The two-layer model, and tasks as the primitive.** A role name is a preset over a task set, not the thing itself. This is the answer to "a collaborator who can help with certain functions". | The full task matrix as a user-facing control. Meta's own UI is widely reported as hard to reason about; we expose presets and keep the matrix internal. |
| **GitHub** | Org role: **Owner** or **Member**, plus a **base permission** every member gets on every repo | Repo role: Read → Triage → Write → Maintain → Admin ([GitHub docs](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)) | **Base permission as an explicit, settable default** rather than an implicit one. Our D19 · Org membership grants no trip access is "base permission = none". Also **outside collaborators**: repo access with no org role — our guest. | Five graded repo roles. Three presets is what a trip needs. |
| **GitHub, ownership continuity** | — | — | **The last-owner rule.** GitHub warns that if an organization only has one owner, its projects can become inaccessible if that owner is unreachable, and recommends at least two ([GitHub docs](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/maintaining-ownership-continuity-for-your-organization)). Transfer is *add the new owner, then remove yourself*. An owner cannot change their own role. | Leaving it to a warning. We enforce it. |
| **Slack** | Workspace role: Primary Owner → Owner → Admin → Member → Guest | Channel membership; **single-channel guest** | **Ownership is transferred, never dropped.** Only one primary owner at a time, and deactivating them requires transferring first ([Slack help](https://slack.com/help/articles/204401633-Transfer-ownership-of-a-workspace-or-org)). **Guests convert to members in both directions** ([Slack help](https://slack.com/help/articles/218124397)) — the promotion path, with the rule that an owner must become a member before becoming a guest. | Five workspace roles. |
| **Notion** | Workspace **member** | **Guest**, invited page by page ([Notion help](https://www.notion.com/en-gb/help/add-members-admins-guests-and-groups)) | Guest as a first-class, per-thing identity — not a lesser member. Upgrading a guest is a deliberate, listed action. | Guest count as a billing lever. |
| **Google Docs** | Drive / workspace admin | File role: Viewer, **Commenter**, Editor. A commenter can switch to Suggesting mode and propose changes; **only editors can accept or reject them** ([Google help](https://support.google.com/docs/answer/6033474)) | **Suggesting mode is the answer to "guests can suggest but not override".** The proposal is a real object, visible, attributable, and it does not touch the document until someone with rights accepts it. | Nothing. This is the pattern. |
| **Luma** | **Calendar** with multiple admins; a calendar admin can manage any event under it | Event host: **Manager** (full access to the event — invites, payment) or **Non-Manager** (shown on the event page, no backend access) ([Luma help](https://help.luma.com/p/adding-hosts-and-managers-to-your-event)) | **A credited role with no powers.** "Non-Manager" is a real need — the person whose name belongs on the event but who should not touch it. | Only two levels. |

### What the benchmark says about our decisions

**D19 · Org membership grants no trip access is right, and it is the conservative end of the range.** Every product separates the two layers. But note where we sit: Meta's business *Admin* has full control, GitHub's org *Owner* has admin on every repo, a Luma *calendar admin* can manage any event under the calendar. Spec 002 AC 2 says an Organization admin with no trip role gets 403 and sees nothing — stricter than all six. That is good for principle 3 and it creates a lockout, dealt with in §7 case 9 and open decision R1.

**Nobody models "suggest" as a weaker write.** Google models it as a *proposal object*. That matters to us because spec 002 already builds one (§5 below).

**Everyone enforces the last-owner rule.** We do not have it anywhere today.

## 4. The model

### 4.1 Two layers, three questions

```
Organization  ──owns──▶  Trip  ──grants──▶  TripMember
  OrgMember                                   (role)
   (role)
```

Every authorization answer comes from three questions, asked in this order:

1. **Is there an active TripMember for this user on this trip?** If not → 403, and nothing else is consulted. This is D19.
2. **What capabilities does that member's role grant?** Resolved from the matrix in §5, with per-trip settings applied.
3. **Does the trip's own state allow it?** Archived, ended, or locked trips refuse writes regardless of role.

### 4.2 The resolution rule, stated once

> **Access to a trip comes only from an active TripMember record. An Organization role grants no trip capability, ever. It grants the right to *obtain* one.**

The second sentence is what makes R1 possible without weakening the first. An org owner cannot *read* a trip they have no role on; under R1 they could *claim* a role on it, which is a logged, visible, attributable act.

### 4.3 Roles as presets

Roles are stored. Capabilities are derived. **Never store the resolved capability set on the member** — it goes stale the moment a preset changes, and then two members with the same role behave differently for reasons nobody can see.

**The role names below are the stored values, not necessarily the words a user sees.** [Spec 012](012-joining-naming-and-the-first-trip.md) §5.3 labels them per trip kind — organizer/member on a personal trip, host/co-host/guest on a hosted event — so the F7 migration does not rename existing friend trips. The capability presets are identical either way.

| Layer | Role | One line |
|---|---|---|
| Organization | `owner` | The Organization exists because of them. Can transfer ownership, add and remove admins, delete the Organization. |
| Organization | `admin` | Runs the Organization day to day: adds and removes members, creates trips in it. No trip access by that fact alone. |
| Organization | `member` | Belongs to the Organization, can create trips in it. Nothing else. |
| Trip | `host` | Owns the trip. Everything, including deleting it and changing roles. |
| Trip | `co-host` | Runs the trip, cannot end it. Everything except delete, transfer and demoting a host. |
| Trip | `guest` | Takes part. What that means is per-trip (§5.2). |

Three org roles and three trip roles. Luma's "Non-Manager" (credited, no powers) is a real need we have not got a slot for — open decision R4.

## 5. Capabilities

### 5.1 The vocabulary

The point of this list is that it is **one list**, in one file, and a new feature adds a row to it rather than inventing a check. Named `noun.verb`.

| Capability | Host | Co-host | Guest (hosted) | Guest (personal) |
|---|---|---|---|---|
| `trip.view` | ✓ | ✓ | ✓ | ✓ |
| `trip.edit` — name, dates, place, accommodation, cover | ✓ | ✓ | — | ✓ |
| `trip.delete` | ✓ | — | — | — |
| `trip.transfer` — hand over host | ✓ | — | — | — |
| `member.invite` | ✓ | ✓ | — | ✓ |
| `member.approve` — accept or decline join requests | ✓ | ✓ | — | — |
| `member.remove` | ✓ | ✓ | — | — |
| `member.setRole` | ✓ | partial¹ | — | — |
| `invite.manage` — create and revoke the link | ✓ | ✓ | — | ✓ |
| `schedule.view` | ✓ | ✓ | ✓ | ✓ |
| `schedule.edit` — add, change, delete items | ✓ | ✓ | — | ✓ |
| `schedule.propose` — suggest an item for review (§5.3) | ✓ | ✓ | ✓ | ✓ |
| `draft.create` — AI import or generate | ✓ | ✓ | — | ✓ |
| `draft.view` | ✓ | ✓ | — | ✓ |
| `draft.publish` | ✓ | ✓ | — | ✓ |
| `poll.create` | ✓ | ✓ | — | ✓ |
| `poll.vote` | ✓ | ✓ | ✓ | ✓ |
| `poll.close` | ✓ | ✓ | creator² | creator² |
| `expense.create` | ✓ | ✓ | — | ✓ |
| `expense.delete` | ✓ | ✓ | creator² | creator² |
| `announcement.post` | ✓ | ✓ | — | — |
| `announcement.read` | ✓ | ✓ | ✓ | ✓ |
| `question.ask` — AI Q&A | ✓ | ✓ | ✓ | ✓ |
| `location.share` | ✓ | ✓ | ✓ | ✓ |
| `analytics.export` | ✓ | — | — | — |

¹ A co-host can set guest ↔ co-host. Only a host can create or demote a host (§6.3).
² "creator" = the person who made that object, regardless of role. Authorship is a separate axis from role and is resolved *after* the capability check, never instead of it.

The hosted-guest column is the one that encodes spec 002 F6. Read down it: a hosted guest can view, vote, ask, share location and propose — and writes nothing into the shared trip directly.

### 5.2 Per-trip settings, not per-trip code

`Trip.guestPermissions` (already proposed in spec 002 §7.2) holds **overrides to the guest column**, nothing else. The hosted and personal columns above are the two presets it ships with. A host turning on "guests can add schedule items" for their hosted trip flips one entry; it does not branch any route.

This is why F6's "hosted trips vs personal trips" must not become an `if (trip.kind === 'hosted')` in a route. It is a default for a settings object.

### 5.3 `schedule.propose` — the one new idea in this spec

**A guest suggestion and an AI agenda import are the same object.** Spec 002 already builds it: a `Draft` that a host reviews and publishes (F19–F22). Give that object a `source` field — it already has one for analytics (`ai_import`, `ai_generate`) — and add `guest_suggestion`.

What that buys:

- "Participants can suggest, but cannot override the main schedule" is a capability row and a `source` value, not a feature.
- Principle 4 generalizes from a rule about AI into a rule about the product: **nothing enters the shared trip except through someone holding `draft.publish`.** AI and guests are then treated identically, which is the honest position — both are untrusted input to the host's decision.
- The host's review screen (wireframe frame 8) already exists. A suggestion is one more row in it.

**This spec does not build it.** It reserves the `source` value and the capability name, so block 3 adds a screen and no migration. Open decision **R3 · Guest proposals** covers whether guests get it at all.

### 5.4 The entitlement axis — what the revenue models force

Added 2026-11-12, after reading [revenue-models-analysis.md](../product/revenue-models-analysis.md), [premium-buyer-lens.md](../product/premium-buyer-lens.md) and [working-doc](../product/working-doc.md) §4.3.

**The money model does not line up with the two axes above, and that is a problem this spec has to fix now.** Working doc §4.3 proposes three tiers (**D20 · Free personal limits**, TBD):

| Tier | Who pays | Unlocks |
|---|---|---|
| Free personal | nobody | all collaboration, ~12 members per trip, a few AI drafts |
| **Trip Pass** (model I, celebration trips) | **one person** — "the organiser (maid of honour, best man, couple)" — one-off, €19–39 | **~50 members, more AI drafts, agenda import, approvals, RSVP** |
| Organization plan (models D, C1, H) | a company, host or operator, per event or yearly (**D8 · Offsite test price**) | hosted trips, co-hosts, all host features, host analytics, payments later |

Read the middle row against §5.1. **Agenda import (`draft.create`), approvals (`member.approve`) and a larger member cap are things the Trip Pass sells to the host of a *personal* trip.** In §5.1 those sit in the hosted-event column, and §5.2 ties the two columns to `trip.kind`. So a paying Trip Pass holder would be refused capabilities they just paid for, or we would have to flip their trip to `kind: 'hosted'` and rename their friends into guests — the exact regression [spec 012](012-joining-naming-and-the-first-trip.md) Q1 is about.

**Three independent axes, which this spec currently collapses into two:**

| Axis | Decides | Example |
|---|---|---|
| **Role** (`TripMember.role`) | what *this person* may do | a co-host may publish, a guest may not |
| **Trip kind** (`trip.kind`) | the *social shape* — what guests may do, and the words we use | friends all edit the schedule; event guests do not |
| **Entitlement** (plan) | which host *features* are unlocked, and the limits | agenda import, approvals, 50 members |

They are genuinely independent. A free personal trip of eight friends and a 45-person hen trip on a Trip Pass are both `kind: 'personal'` with the same guest freedoms — and only one of them can import an agenda. A company offsite is `kind: 'hosted'` on an Organization plan. Nothing forces these to move together.

So the capability check is:

```
can(actor, trip, capability)
  = roleGrants(member.role)                    // who you are
  ∩ guestPermissions(trip)                     // the social shape, kind as its preset
  ∩ entitlements(trip)                         // what has been paid for
```

**Entitlement attaches to the trip, not to the person.** This is Airtable's rule — your bill "is connected to your workspace and not your Airtable account", and one workspace can be paid while others stay free ([Airtable](https://support.airtable.com/docs/changing-your-airtable-workspace-plan)) — and it is the only shape a one-off Trip Pass can have. It also keeps guests free, which is **P1 · Guests never pay** in the premium buyer lens: a guest in a paid trip pays nothing and their own trips stay free.

**What this spec builds now: one nullable field and one parameter.** `Trip.entitlement` (`null` → free) and `entitlements(trip)` returning unlimited while nothing is sold. Roughly twenty lines, zero behaviour change, and it means pricing lands as a lookup rather than a migration against live pilot data. **Nothing is gated during the pilot** — the gathering runs as a free Organization pilot (working doc §5).

What it does **not** build: plans, prices, checkout, limit enforcement, or any upgrade prompt. Those are Phase 1 and **R8 · Entitlement axis** covers how far to go now.

## 6. Lifecycle

### 6.1 TripMember status

Role and status are **orthogonal**. A removed co-host is `role: 'co-host', status: 'removed'` — not demoted. This keeps history readable and makes re-adding someone restore what they were.

```
            invited ──accepts──▶ active ──removed by host──▶ removed
               │                   │                            │
            (link)              leaves                     re-added
               ▼                   ▼                            │
           requested ──approved──▶ active ◀────────────────────┘
               │
           declined ──▶ declined
```

| Status | Sees | Counts as a member |
|---|---|---|
| `invited` | Nothing but the invitation | No |
| `requested` | Name, dates, host, cover only (spec 002 F12) | No |
| `active` | Per the matrix | **Yes** |
| `declined` | Same as `requested` | No |
| `left` | Nothing | No |
| `removed` | Nothing | No |

Only `active` counts. Everything that counts members — announcement reach ("goes to 38 people", frame 10), poll denominators, expense splits, the analytics `role` property — reads `status: 'active'` and nothing else.

### 6.2 Five guarantees

These are the building blocks. They are cheap now and expensive to retrofit.

| # · Name | Guarantee |
|---|---|
| **G1 · Last host** | **Every trip has at least one active host.** The last host cannot be removed, demoted, or leave. They transfer first. (Slack's primary owner; GitHub's add-then-remove.) |
| **G2 · Last owner** | **Every Organization has at least one active owner.** Same rule. |
| **G3 · No self-demotion** | **Nobody can change their own role.** Prevents the accidental self-lockout and makes every demotion attributable to someone else. (GitHub.) |
| **G4 · Immediate revocation** | **Revocation is immediate across every channel.** Removing a member closes their socket room membership, drops their live location, and invalidates their access within the same request — not at next reconnect. |
| **G5 · One helper** | **Every capability check goes through one helper.** `can(actor, trip, capability)`. No route, socket handler or client component compares a role string. |

G5 · One helper is testable: a lint rule or a test that greps the server for a role-string comparison outside `services/permissions.js` and fails.

### 6.3 Promotion and demotion

The user's case: a guest becomes a collaborator. Benchmark says Slack converts guests to members both ways, and requires an owner to become a member before becoming a guest.

| From → To | Who can | Note |
|---|---|---|
| guest → co-host | host, co-host | The common case: someone turns out to be helping. |
| co-host → guest | host | A co-host cannot demote a co-host — otherwise two co-hosts can demote each other. |
| co-host → host | host only (`trip.transfer`) | Creates a second host. |
| host → co-host | host, and never the last one (G1) | |
| requested → active as co-host | host, co-host | Approve and promote in one step, or must they be approved first? → **R5** |

A demotion **never** removes what the person already published. Authorship is permanent; capability is current. A co-host who published the schedule and is demoted to guest keeps their name on those items and loses the ability to change them.

## 7. Corner cases

The register. Each is a decision the build will otherwise make by accident.

| # | Case | Position |
|---|---|---|
| 1 | **An Organization with one person** | Allowed. Meta allows a one-person business and it is the natural start of every Organization. It must still have an owner (G2), who cannot remove themselves. An Organization is never member-less. |
| 2 | **Sole host becomes unreachable before the event** | This is the real failure mode for a company gathering. Today: nobody gets in. See R1. |
| 3 | **Someone leaves the Organization** | The working doc §4.2 proposes they lose host and co-host roles on its trips, and the trips stay (D21, proposed). Spec 002 §10 says the opposite — "removing an org member does not change their trip roles". **These two documents contradict each other today.** → R2 |
| 4 | **A removed member with an open socket** | Confirmed gap (§2). G4 fixes it. |
| 5 | **A removed member sharing live location** | Same. Their entry in `liveLocations` must be dropped and a `location:stopped` broadcast sent. |
| 6 | **Two hosts approve the same request at once** | The approval must be idempotent: a second approval of an `active` member is a no-op returning 200, not an error and not a duplicate TripMember. Spec 002 F13 says this for requests; it must also hold for approvals. |
| 7 | **A declined person opens the link again** | Spec 002 has no position. They currently see the same "request sent" screen forever (wireframe frame 4). Silence is deliberate for the decline itself (F16) but a permanent lie is not. → R6 |
| 8 | **The same human, two accounts** | Work Google and personal email are two users unless the verified email matches (F9). Combined with F17 — an email invitee skips approval with *any* account — one person can hold two TripMembers on one trip, one `invited` forever and one `active`. Counts, splits and analytics all drift. The invitation should be marked consumed when it is accepted, whatever account accepts it. |
| 9 | **An org admin opens a trip in their own Organization** | 403, sees nothing (spec 002 AC 2). Stricter than all six benchmarked products. → R1 |
| 10 | **A personal trip that should become an Organization's** | A wedding planner starts personal and formalizes. Needs `Trip.orgId` to be settable after creation, by the host only, and only into an Organization they belong to. Reserve the move; do not build the screen. **✅ Upgraded 2026-11-12: required, not reserved.** O1 · Organization never required landed on "never", so a personally owned trip is now the normal case and the move path is the only way one ever reaches an Organization. Figma deferred the container correctly and then had to move every draft one file at a time, with no bulk move and support tickets for cross-account cases. The **field** (`Trip.orgId` settable by the host, into an Organization they belong to) ships in block 1; the **screen** is Phase 1 per O7 · Move path timing. See 012 §5.7 and Q7 · No move path. |
| 11 | **Removing someone who owes money** | Spec 005 territory. Position for now: removal is blocked while they are part of an unsettled expense, or their share is reassigned first. Named here so 005 inherits it rather than inventing it. |
| 12 | **A guest is removed and re-added** | Their old polls, expenses and questions stay and keep their name. Re-adding restores `active` on the same record; it does not create a second one. |
| 13 | **A new feature ships with no capability decided** | The governance case, and the one most likely to actually happen. Rule: **a feature PR that adds a write path adds a row to §5.1 in the same PR, defaulting to host-only.** Reviewable in a diff. |
| 14 | **A trip after the event ends** | Nobody has decided whether a past trip is read-only. Expenses and settle-up (005) argue for staying writable; announcements argue for closing. → R7 |
| 15 | **Pending requesters counted as members** | Frame 10 says "goes to 38 people". If that count includes `requested` or `invited`, hosts will believe they reached people they did not. §6.1 settles it: `active` only. |
| 16 | **A paid trip moves into an Organization** | A Trip Pass holder's trip is adopted into an Organization on a plan ([spec 012](012-joining-naming-and-the-first-trip.md) §5.7). Two entitlements now cover one trip. Wispr Flow warns of exactly this overlap — joining a team can replace a personal plan, and joining an unbilled team can make you its payer ([Wispr Flow](https://docs.wisprflow.ai/articles/2458545840-faqs-for-flow-pro-team-and-flow-enterprise-plans)). Position: **entitlements are additive and the trip keeps the most permissive**; the Trip Pass is never silently consumed or refunded, and the move screen says so. |
| 17 | **An Organization's plan lapses with trips mid-flight** | Not during the pilot, but the rule belongs here: a lapse **never** removes access or data. It stops new paid actions (no new import, no new approvals beyond the free cap) and leaves every existing member, item and expense exactly as it is. Principle 1 says the trip is the source of truth; billing is not allowed to edit it. |
| 18 | **The payer is not a trip member** | A People lead buys the offsite and never joins it. Billing must not require a `TripMember`, and buying must not grant one — otherwise paying silently breaks D19 · Org membership grants no trip access. The payer is an account, not a role. |

## 8. Risks

| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| 1 | The capability check gets duplicated in the client — `if (role === 'host')` to show a button — and drifts from the server | **High.** It is the path of least resistance. | The trip payload carries the viewer's **resolved capability list**. The client renders from capabilities and never sees a role name except to display it. G5's test covers `client/src` too. |
| 2 | Socket and HTTP authorization diverge, because they are two code paths and only one is obvious | **High.** It already happened (§2). | Both call `can()`. G4 is an acceptance criterion, not a note. |
| 3 | The `TripMember` migration runs once against live data and is wrong | Medium | Backup first, idempotent, a `--dry-run` that prints the mapping, and a reverse script written *before* the forward one runs. Spec 002 F7 and AC 4 already require the first two. |
| 4 | This spec delays the pilot | **Medium, and it is the one that matters.** Build window is 12–19 Nov; the event is 24–25 Nov. | §12 block 1 is the only part in the pilot, and it is almost exactly what epic #20 already scopes. The rest is reserved, not built. If block 1 slips, the pilot slips — so block 1 contains nothing that is not already in #20. |
| 5 | Three presets turn out to be too few mid-pilot | Low | Per-member overrides (block 4) are additive: a `grants` array on TripMember, empty for everyone. Reserving the field costs nothing. |
| 6 | Guests find the trip read-only and disengage | Medium | The pilot measures it: actions per active attendee per day, poll participation (spec 002 §11). `schedule.propose` (block 3) is the designed answer if the number is bad. |

## 9. Product principles

Checked against [CLAUDE.md](../../CLAUDE.md).

| Principle | This spec |
|---|---|
| 1. One source of truth | **Strengthened.** §5.3 makes "nothing enters the trip except by publish" a product rule, so suggestions cannot become a second schedule living in comments. |
| 2. Real-time by default | **Gap closed.** G4 makes revocation reach the socket room, which it does not today. |
| 3. Privacy first | **Strengthened by G4 and G5; one tension.** R1 would give an org owner a path to claim a trip they cannot currently see. The claim is logged and visible to the trip; silent read access is not on the table. |
| 4. AI drafts are editable | **Generalized.** §5.3 treats AI output and guest suggestions as the same reviewable object. |

One conflict to flag, inherited from spec 002 and not created here: **F17** removes the exact-email match, so a forwarded email invitation lets any signed-in account skip approval. Case 8 above compounds it.

## 10. Requirements

### 10.1 Functional

| # | Requirement |
|---|---|
| R-F1 | Capabilities are defined in one module. Every HTTP route and socket handler that reads or writes trip data resolves access through `can(actor, trip, capability)`. |
| R-F2 | Trip roles are `host`, `co-host`, `guest`; Organization roles are `owner`, `admin`, `member`. Roles are stored; capabilities are derived and never persisted on the member. |
| R-F3 | Only an active `TripMember` grants any trip capability. An Organization role grants none. |
| R-F4 | `Trip.guestPermissions` overrides the guest column of the matrix. Hosted and personal are its two shipped presets. |
| R-F5 | Every trip has at least one active host (G1). Removing, demoting or leaving as the last host is refused with a message naming the transfer. |
| R-F6 | Every Organization has at least one active owner (G2), with the same rule. |
| R-F7 | No user can change their own role on a trip or an Organization (G3). |
| R-F8 | Removing or demoting a member takes effect immediately on the socket room, live location and any in-flight request (G4). |
| R-F9 | Member counts, announcement reach, poll denominators, expense splits and analytics `role` read `status: 'active'` only. |
| R-F10 | Approving an already-active member is a no-op that succeeds. Accepting an invitation marks it consumed whatever account accepts it. |
| R-F11 | The trip payload returned to a client includes the viewer's resolved capability list. |
| R-F12 | A demotion or removal never deletes or reattributes content the person created. |
| R-F13 | `can()` resolves role ∩ guest permissions ∩ **entitlement**. `Trip.entitlement` is nullable and reserved; while it is null the trip is unlimited and nothing is gated. |
| R-F14 | Entitlement attaches to the **trip**, never to a user. A guest in a paid trip pays nothing and their own trips are unaffected. |
| R-F15 | Nothing about billing may grant, remove or require a trip role, and a lapsed or absent entitlement never removes access or data. |

### 10.2 Technical

- **`services/permissions.js`** exports `CAPABILITIES` (the §5.1 table as data), `can(actor, trip, capability)` and `capabilitiesFor(actor, trip)`. Pure functions, no database access — callers pass the loaded `TripMember`. Makes it unit-testable without Mongo, which the server has no suite for today.
- **`TripMember`**: `{ tripId, userId, email, role, status, grants: [], revokes: [], joinedAt, invitedBy, invitedAt, statusChangedAt, statusChangedBy }`. `grants` and `revokes` ship empty and unused — block 4 fills them. Unique index on `(tripId, userId)` enforces case 12.
- **`OrgMember`**: `{ orgId, userId, email, role, status, joinedAt }`. Unique index on `(orgId, userId)`.
- **Middleware**: `requireCapability('schedule.edit')` loads the trip and the member once and attaches both, so a route body never re-queries or re-checks.
- **Socket**: `join-trip` calls the same helper. On removal or demotion the server calls `io.in(room).fetchSockets()` and forces the affected sockets out, drops `liveLocations` entries keyed `tripId:userId`, and emits `trip:access-changed` so the client re-fetches rather than showing stale state. This is the G4 work and it is the only part of this spec that touches `server/index.js`.
- **G1/G2 enforcement** belongs in the service layer, not a Mongoose hook — the check needs to count *other* active holders, which a document-level hook cannot see cheaply.
- **The G5 test**: a test that greps `server/routes`, `server/index.js` and `client/src` for `'organizer'`, `'host'`, `'co-host'` and `'guest'` in a comparison and fails outside `services/permissions.js` and locale files.
- **Migration** (shared with spec 002 F7): creator → host, other `organizer` → co-host, `member` → guest; status carried over; `--dry-run` prints the mapping; reverse script written first.

## 11. Acceptance criteria

1. Given any route or socket handler that reads or writes trip data, then its access decision comes from `can()`, and the G5 test passes.
2. Given an Organization owner with no role on a trip in their Organization, when they open it or call its endpoints, then they get 403 and see nothing.
3. Given a hosted trip, when a guest tries to add a schedule item, then it is refused; in a personal trip the same call succeeds.
4. Given a host turns on "guests can add schedule items" for a hosted trip, then a guest can add one, and no other guest capability changes.
5. Given a trip with one host, when that host is removed, demoted or leaves, then it is refused and the message names transfer as the way out.
6. Given an Organization with one owner, the same.
7. Given any user, when they change their own role, then it is refused.
8. Given a member in the trip's socket room, when a host removes them, then they leave the room and receive no further trip events **without reconnecting**, their live location is dropped, and the remaining members see them stop sharing.
9. Given a trip with 38 active members, 4 pending requests and 2 removed, then announcement reach, poll denominators and the member count all read 38.
10. Given a co-host who published schedule items, when they are demoted to guest, then the items remain with their name and the former co-host can no longer edit them.
11. Given two hosts approve the same request simultaneously, then one TripMember exists and both calls return success.
12. Given a client, when it renders the trip, then every action control is shown from the resolved capability list and no component compares a role name.
13. Given `Trip.entitlement` is null, then every capability resolves exactly as it did before the field existed, and no limit is enforced anywhere.
14. Given a personal trip whose entitlement unlocks agenda import, then its host can import — without the trip's kind changing and without any member's role or label changing.
15. Given a guest in a paid trip, then they are charged nothing and their own personal trips keep their own entitlement.

## 12. Build order — the blocks

**Only block 1 is in the pilot.** Blocks 2 to 5 are reserved by this spec, which is the point: each is additive against the block 1 schema, with no migration.

| Block | What | In the pilot? | Depends on |
|---|---|---|---|
| **1** | Capability vocabulary, `can()`, `TripMember` + `OrgMember` with `grants`/`revokes` reserved, the three presets, `guestPermissions`, the migration, **G3 · No self-demotion** and **G5 · One helper**, plus `Trip.entitlement` reserved (§5.4, **R8 · Entitlement axis**) | **Yes — this is epic [#20](https://github.com/Fogataz/trip-planner/issues/20)** | — |
| **2** | G1, G2, G4: last host, last owner, revocation across socket and live location | **Partly.** G4 is a principle-3 gap in today's code and should not wait; G1 and G2 are one service check each. **Amended 2026-11-12 (§17, Q23):** G4 and G1's pure predicate shipped in block 1 — block 1 is what removes the only last-host guard there is, so leaving the replacement here would have left the pilot unprotected in between. G2 · Last owner is still block 2 | 1 |
| **3** | `schedule.propose`: guest suggestions as drafts with `source: 'guest_suggestion'`, reviewed in the existing draft screen | No | 1, and spec 002 part 6 |
| **4** | Per-member overrides: `grants` and `revokes` filled, the "collaborator who can do one extra thing" case | No | 1 |
| **5** | Organization reach: R1's claim path, moving a trip into an Organization (case 10), partner-style sharing between Organizations | No | 1, 2 |

Block 1 adds nothing to epic #20's existing scope. It **constrains** it: reserve two fields, put the matrix in one file, and write the G5 test.

## 13. Open decisions — need your call

**Code key.** Every code in these specs carries a short name after a `·`, so it can be read without a lookup: **R*n*** open decisions here, **G*n*** guarantees (§6.2), **Q*n*** QA findings and **O*n*** open decisions in [spec 012](012-joining-naming-and-the-first-trip.md), **S*n*** open decisions in [spec 002](002-hosted-event-pilot.md), **D*n*** product-owner decisions in the [working doc](../product/working-doc.md). Write them as `R1 · Org owner reach`, never bare.

Per D27 each carries a recommendation as the working default. **R1 and R2 shape block 1's data and should be answered before the pilot build starts.** The rest can run on their recommendation.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **R1 · Org owner reach** ✅ | **Decided 2026-11-12: (b) Claim.** Can an Organization owner reach a trip in their Organization that they have no role on? | (a) Never — spec 002 AC 2 as written / (b) **Claim**: an owner can take a host role, the act is logged and announced in the trip, and they see nothing until they do / (c) Implicit read access, as GitHub and Meta do | **(b) Claim.** (a) means a company cannot get into its own event if the sole host is unreachable, which is case 2 and the single most likely real failure. (c) breaks principle 3. A claim is visible, attributable and refusable in audit — "nobody reads your trip silently" survives. |
| **R2 · Leaving an Organization** ✅ | **Decided 2026-11-12: (b) roles are dropped.** What happens to trip roles when someone leaves an Organization? Working doc §4.2 (**D21 · Leaving an Organization**, proposed) and spec 002 §10 **currently say opposite things.** | (a) Nothing changes — spec 002 §10 / (b) **They lose host and co-host on that Organization's trips; the trips stay; if that empties the hosts, an org owner is asked to take over** — working doc §4.2 / (c) They are removed from the Organization's trips entirely | **(b), and fix spec 002 §10 to match.** (a) means a departed employee keeps host rights on company events. (c) destroys their expense and poll history. Whichever you pick, the two documents must stop disagreeing. |
| **R3 · Guest proposals** | Do guests get `schedule.propose` at all? | (a) **Reserve the capability and the `source` value now, build it after the pilot** / (b) Build it in the pilot / (c) Guests never propose; hosted trips are read-only for guests | **(a).** It is the designed answer if pilot engagement is low (risk 6), and building it now is the clearest way to miss 24 Nov. Reserving costs one enum value. |
| **R4 · Credited-but-powerless role** | Do we need Luma's "credited but powerless" role — a name on the event with no access? | (a) **No, not yet** / (b) Yes, a fourth trip role / (c) Yes, as a flag on guest | **(a).** Real need, no pilot evidence. If it comes up, (c) is cheaper than a fourth preset and fits the overrides in block 4. |
| **R5 · Approve straight to co-host** | Can a pending requester be approved straight into co-host? | (a) **Yes, one step** / (b) No, approve first then promote | **(a).** Hosts know who their co-organizers are before the link goes out. Two steps for a known case is friction with no safety gain — the host is making the same decision either way. |
| **R6 · Declined requester** | What does a declined requester see? | (a) The "request sent" screen forever — today's behaviour / (b) **"The host has not added you. Ask them directly."** with no reason, and re-requesting allowed after a host re-opens it / (c) An explicit "declined" | **(b).** (a) is a lie the user will act on. (c) is a rejection notification nobody asked us to deliver — spec 002 F16 is deliberate that a decline is silent, and this keeps it silent without being false. **Carried to spec 012 as O10 · Declined requester**, where the join screens live. |
| **R7 · Trip after it ends** | Is a trip read-only after it ends? | (a) **No, nothing changes** / (b) Read-only after a grace period / (c) Host can close it | **(a) for now.** Settle-up (spec 005) needs writes after the event, and we have no evidence anyone wants an archive. Revisit with 005. |
| **R8 · Entitlement axis** ✅ | **Decided 2026-11-12: (a) reserve the field only.** How far do we go now on §5.4's third axis? | (a) **Reserve `Trip.entitlement` and the `entitlements()` parameter in block 1; build nothing else** / (b) Ignore it until pricing is decided / (c) Build plans and limit enforcement now | **(a).** It is ~20 lines and no behaviour change, and it is the difference between pricing being a lookup and pricing being a migration against live pilot data. (b) is the one that costs real money later: **D20 · Free personal limits** is already TBD with a Trip Pass in it, so we know this axis is coming. (c) is scope we cannot afford before 24 Nov and prices nobody has set. |

**TBD — needs the product owner, not a recommendation:** the three screens flagged in spec 002 §6 (create an Organization, the Organization member list, trip people and roles) are the UI for this model. R1 and R2 change what the third one has to show.

## 14. What this changes in spec 002

Nothing in spec 002's scope. Four corrections and one addition:

| Spec 002 | Change |
|---|---|
| §7.2 "Replace every `role === 'organizer'` check with one capability helper" | Points here for the capability list and `can()`'s signature. |
| §10 "removing an org member does not change their trip roles" | **Contradicts the working doc §4.2 (D21 · Leaving an Organization).** Resolve via R2. |
| F6 hosted vs personal guest permissions | Is a preset over `Trip.guestPermissions`, not a branch. §5.2. |
| F7 migration | Gains `--dry-run` and a reverse script before it runs. Risk 3. |
| — | **New:** G4. Spec 002 makes removal a real workflow and today's socket keeps serving removed members. Belongs in the pilot, not after it. |

## 15. Design lenses

Per [design-lenses.md](../process/design-lenses.md) (lens-D1 · All fourteen lenses).

| # | Lens | This spec |
|---|---|---|
| L1 | Localization | No user-facing string except the role labels, which are 18 flat keys resolved per trip kind and use forms that do not inflect for gender ([spec 012](012-joining-naming-and-the-first-trip.md) §6.2, **O8 · Ungendered role labels**). The stored role is never shown raw. |
| L2 | Roles and access | **This spec is that table.** §5.1 is one row per action across host, co-host and guest, by trip kind; §4.3 covers org owner, admin and member; §6.1 covers prospective traveller (`requested`) and signed-out visitor — both see nothing. **D19 · Org membership grants no trip access** holds: only an active `TripMember` grants anything. |
| L3 | Money | §5.4. The single place entitlement is checked is `entitlements(trip)` inside `can()`. `Trip.entitlement` is nullable and returns unlimited; no tier is enforced in the pilot. No AI cost is added by this spec. |
| L4 | Privacy and data | No new personal data. `TripMember` and `OrgMember` hold uid and email, both already stored today; `statusChangedBy` is added for attribution and is readable by hosts only. **G4 · Immediate revocation** drops a removed member's live location, which is in memory and never stored. Nothing leaves to an AI provider. |
| L5 | Real-time | Emits `trip:access-changed` on removal or demotion; the listener is the trip context in `client/src/trip/TripContext.tsx`, which re-fetches rather than showing stale state. No other new event. |
| L6 | Measurability | None added here — [spec 012](012-joining-naming-and-the-first-trip.md) §5.9.1 owns the funnel events. The analytics `role` property reads `status: 'active'` only (R-F9). |
| L7 | States and degradation | Every refused action is a 403 that changes nothing (N8). **G1 · Last host** and **G2 · Last owner** refuse with the way out named ("make someone else a host first"), never a bare error. A capability check never depends on a third party, so nothing here degrades when maps, AI or push fail. |
| L8 | Notifications | None added. `notifyTrip` filters recipients by their `TripMember` settings (002 F28); this spec only changes where that list comes from. |
| L9 | Accessibility | No new screens. The UI for this model is [spec 012](012-joining-naming-and-the-first-trip.md) frames 6, 7 and 9, where N5 applies. |
| L10 | Reversibility | A demotion or removal never deletes or reattributes content (§6.3, R-F12); re-adding restores the same record rather than creating a second (case 12). The migration has a reverse script written before the forward one runs (risk 3). Nothing AI-made reaches the trip without `draft.publish`. |
| L11 | Migration | The core of it: creator → host, other organizers → co-host, members → guest, status carried over. **With no migration run, every existing trip is unreadable to the new code**, so the script is a build-order row in slice S1 and ships in the same PR. `--dry-run` prints the mapping; a backup is taken first (002 F7, AC 4). |
| L12 | Enforcement | `requireCapability('x')` middleware on every new endpoint, loading trip and member once. A guest, a signed-out visitor or a valid token for another trip all get 403. The socket path calls the same `can()`, which is the gap that exists today (§2). **G5 · One helper** is a test that fails if any route, socket handler or client component compares a role string. |
| L13 | Scale | `TripMember` is a collection rather than an embedded array precisely for hundreds of members (working doc §4.2); unique index on `(tripId, userId)`, and the capability check reads one member document, not the member list. The people list is the one unbounded list and is paged in [spec 012](012-joining-naming-and-the-first-trip.md) frame 6. |
| L14 | Lifecycle | Roles apply identically before, during and after. **R7 · Trip after it ends** keeps a trip writable once it is over, because settle-up ([spec 005](005-settle-up.md)) needs writes after the event. A week later, roles still gate the ledger. |

## 16. Build status

**Approved 2026-11-12. Block 1 built and in review the same day — [#124](https://github.com/Fogataz/trip-planner/pull/124)** — see §17 for the four defects building it found.

| Block | Epic |
|---|---|
| 1 — the foundation | [#20 Organizations, trip roles and TripMember migration](https://github.com/Fogataz/trip-planner/issues/20) |
| 2 — G1 · Last host and G2 · Last owner | [#115 A trip and an Organization always have someone in charge](https://github.com/Fogataz/trip-planner/issues/115) |
| 2 — G4 · Immediate revocation | [#20](https://github.com/Fogataz/trip-planner/issues/20), because it closes a live principle-3 defect |
| 3–5 | No epic yet. Phase 1, after the pilot. |

Both epics sit under **I1 Run the hosted event pilot** ([#19](https://github.com/Fogataz/trip-planner/issues/19)), milestone **M0**. Wireframes for this model are [012 frames 6, 7 and 9](../../wireframes/012-joining-and-naming/index.html).

## 17. Amendment 2026-11-12 — four defects found while building block 1

Added by engineering while building epic [#20](https://github.com/Fogataz/trip-planner/issues/20), per [build-handover.md](../process/build-handover.md) §8: a shipped spec is never rewritten, and these three specs are `approved` rather than shipped, so corrections land here as a dated amendment. Nothing below changes a decision; each is a place where the spec as written would have produced the wrong code, and says what was built instead.

Three were found by building, and **two of those only by running the migration against a seeded database rather than by reading it.** They are registered as **Q21–Q24** in [spec 012](012-joining-naming-and-the-first-trip.md) §4, which is where QA findings live.

> **✅ Q23's scope change accepted 2026-11-12 by the product owner.** Fixing **Q23 · Block 1 removes the only last-host guard** meant pulling the pure predicate `wouldLeaveNoHost()` into block 1, which §12 assigns to block 2. That is scope the slice was not given, so it was put to the product owner rather than taken: accepted. **§12 now reads: the pure last-host predicate is block 1; G1 · Last host's service-layer enforcement and G2 · Last owner remain block 2 ([#115](https://github.com/Fogataz/trip-planner/issues/115)).** The boundary moved by one function, not by a feature.

| # | Finding | Where | Severity | What was built |
|---|---|---|---|---|
| **Q21 · Migration can leave a trip with no host** | The §10.2 mapping is "creator → host, other `organizer` → co-host, `member` → guest". **If the trip's creator is not in its own member list, that mapping produces a trip with zero hosts.** The creator's uid is on `Trip.createdBy` whether or not they are still a member, and nothing else in the mapping can produce a host. Such a trip would migrate into a state nobody can administer: no one can invite, approve, change a role or delete it, and **G1 · Last host** is violated from the first second. It is not hypothetical — one of the four seeded trips hit it. | §10.2, 002 F7 | **High** — unadministrable trips, created by the one migration that runs against live data | The migration counts active hosts per trip and, finding none, promotes the longest-standing active `organizer` (or, failing that, the longest-standing active member), and **prints how many trips needed it** so the number is seen before the run is approved rather than discovered later. |
| **Q22 · "Status carried over" produces an invalid status** | §10.2 says "status carried over" and §6.1 defines the vocabulary as `invited`, `requested`, `active`, `declined`, `left`, `removed`. **Today's `Trip.members.status` is `pending`, `active` or `removed`** (`models/Trip.js`). Carrying `pending` over writes a value that is in no enum — it fails the schema, or worse, is stored and then counts as nothing anywhere. | §10.2 × §6.1 | Medium — the migration fails, or silently mis-states who is invited | `pending → invited` is now explicit in the mapping, and the client reads `invited` (the old string appeared in `badges.ts` and `Overview.tsx` too). |
| **Q23 · Block 1 removes the only last-host guard and block 2 adds its replacement** | §12 puts **G1 · Last host** in block 2 and block 1 is "the only part in the pilot". But block 1 is what deletes today's guard — `if (target.role === 'organizer') return 'Organizers cannot be removed'` (`routes/groups.js:222`), the single thing standing between a trip and having nobody in charge. Taking a crude guard out in one slice and putting the real one in a later slice **leaves a window, during the pilot, with no protection at all** — a regression this slice would introduce rather than inherit. | §12 blocks 1–2 | **High for the pilot** — and invisible, because it is a gap between two correct-looking slices | The pure predicate `wouldLeaveNoHost(members, change)` ships in block 1 and guards both the remove and the set-role paths, refusing with the way out named. The **service-layer count across an Organization (G2 · Last owner) stays in [#115](https://github.com/Fogataz/trip-planner/issues/115)**, so the slice boundary moves by one function, not by a feature. |
| **Q24 · `Trip.ownerType` duplicates `Trip.orgId`** | Spec 002 §7.2 has Trip gain `ownerType` **and** `orgId`. Since **O1 · Organization never required** made `orgId` nullable, "personally owned" is exactly "`orgId` is null". A second field holding the same fact is a second thing to keep true, and the first bug it produces is a trip whose `ownerType` says personal while its `orgId` is set. | 002 §7.2 × 012 O-F3 | Low | `ownerType` was **not** built. `orgId === null` is the single source of truth, as [spec 012](012-joining-naming-and-the-first-trip.md) O-F3 states it. |

### Amendment 2026-11-12 (second) — what the review of PR #124 found

[PR #124](https://github.com/Fogataz/trip-planner/pull/124) was reviewed against this spec by someone who did not build it, and changes were requested. Eleven findings, all of them real. Three changed what this spec says; the rest were defects in the build and are recorded in the pull request.

| # | Finding | What changed here |
|---|---|---|
| **Q25 · Eviction is for access lost, not for a role change** | Block 1 evicted a member's sockets on every promotion and demotion. The client re-joins the trip room only on `connect`, so a demoted co-host silently stopped receiving live events until they reloaded — principle 2 broken by the fix for principle 3. | **R-F8 is read as two signals, not one.** Removal evicts; a role change emits `trip:access-changed` and leaves the member in the room. "Takes effect immediately" is satisfied because every write re-checks `can()` per request. Figma, Google Docs and Slack all draw the line at access lost rather than role changed. |
| **Q26 · Removal needs the §6.3 matrix too** | `member.remove` is ✓ for a co-host in §5.1 with no footnote, so a co-host could **remove** a host — while §6.3 forbids them even to demote one. Removal is strictly more destructive than demotion. | **§6.3 governs removal as well as role changes.** You may remove someone only if you could first have moved them to guest. Nobody removes themselves. |
| **Q27 · Restoring a role must respect the restorer's authority** | §6.1 says re-adding someone "restores what they were", and that is right. But `member.invite` is held by every member of a **personal** trip, so a guest could re-add a removed host and silently restore host — a role they could never grant. | **The record still remembers; the restore is bounded.** You get your old role back if the person letting you in could have granted it, and guest otherwise. §6.1 is unchanged for the case it was written for. |

**A new capability row**, per case 13 (a feature PR that adds a write path adds a row to §5.1 in the same PR, defaulting to host-only):

| Capability | Host | Co-host | Guest (hosted) | Guest (personal) |
|---|---|---|---|---|
| `trip.setGuestPermissions` — turn one guest capability on or off | ✓ | — | — | — |

Changing what guests may do is a decision about the shape of the trip, so it stays with the host. Without it AC 4 was only half true: `can()` honoured `Trip.guestPermissions` and nothing could set it.

**And one correction to §10.2's technical shape.** `Trip.guestPermissions` is a **list of `{ capability, allowed }`**, not an object keyed by capability. Mongoose Maps reject keys containing a dot and every capability is named `noun.verb`, so the field as first built could never have been written at all — the unit tests passed because they used plain objects. A dotted key is also ambiguous in a `$set` path. Nothing had written the field, so there was no data to migrate.

**One operational rule this spec did not state.** With no migration run, every existing trip is unreadable to the new code (L11 says so) — which means **deploying the code before the migration locks every existing member out of every existing trip, silently**. The server now refuses to start in that state, naming the trips and the commands, overridable with `ALLOW_UNMIGRATED_TRIPS=1`. Rails halts on a pending migration for the same reason. **Deploy order: migrate first, then the code.**

**One note that is not a defect.** §10.2 asks for `can()` to be pure and database-free, and that is the reason Q21 and Q22 were catchable at all: the capability model has 31 unit tests that run with no Mongo, so the only thing left to verify by hand was the migration — and running it, rather than reading it, is what produced two of the four findings above. The instruction to keep the module pure earned its place.
