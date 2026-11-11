# Trip Planner: Product Strategy Working Doc

> **Living document.** Last updated 2026-11-10. This is where current product thinking lives. Update it as decisions are made. Items marked **TBD** are open decisions for the product owner.
>
> **Open questions are not blockers (D27).** TBD items are decided as we learn. Where a decision affects the build, its recommendation is the working default until the product owner overrides it. Only items marked **Blocks** stop work.
>
> Moved into the repo on 2026-11-09 (D26), so every Claude account and computer reads the same copy. Edit it here, not in a Claude Project.
>
> This supersedes the "Out of scope" list in [strategy.md](strategy.md). Payments and booking are no longer excluded. Those limits were initial setup defaults.

## 1. Where we are

- **Built:** a real-time group trip planner. It has trips, members and invitations, an itinerary with AI generation, polls, expenses with settle-up, AI Q&A, live location, covers, push notifications, and the interface in English, Spanish and Portuguese (spec 003).
- **Not built:** SSO, public pages, payments, host/guest roles, an activity feed, analytics and tests.
- **Direction:** build one solid core that every revenue model can reuse, then add a thin layer per model.
- **First live test:** the eDreams product team gathering.

## 2. The strategic bet

One shared core for "a group doing something together on dates in a place". Each revenue model adds a layer on top.

| Layer | Contents | Status |
|---|---|---|
| **Core (shared)** | Accounts and SSO, roles, the trip/event object, schedule, members, real-time, notifications, polls, comments, expenses, activity feed, analytics | Mostly built; gaps in section 4 |
| **Host layer** | Host workspace, co-hosts, AI import of a host's plan, guest list, capacity, check-in | Not built |
| **Money layer** | Collect payments, deposits, payouts, fees, refunds | Not built |
| **Public layer** | Listing pages, discovery, search by interest, reviews | Not built |
| **Content layer** | Curator guides, a storefront, paid access | Not built (Casa Catz overlap) |

Each revenue model is a mix of these layers. The core comes first because every model needs it.

## 3. Revenue models under consideration

**Analysis done 2026-11-09:** see [revenue-models-analysis.md](revenue-models-analysis.md). It recommends **D (team offsites and company events)** as the lead model. A stays free as the core, C1 (retreat host tool) or H (operator client app) is the Phase 2 candidate, E is added in Phase 2, and F is parked. **Not decided yet (D3).**

**Added 2026-11-10:** [premium-buyer-lens.md](premium-buyer-lens.md) applies Alex Hormozi's "sell to people who can pay" advice: the organiser with the budget pays, guests never pay, prices sit at two ends (self-serve and done-with-you), not the middle. It moves **premium group-trip operators** (C1/H) and **destination-wedding planners** up as Phase 2 candidates. [destination-weddings.md](destination-weddings.md) analyses weddings as a niche of model I: we'd be the trip around the wedding, sold to planners first.

| # | Model | Payer | Layers needed |
|---|---|---|---|
| A | Group trip planner (friends, family) | Organizer or group, per trip | Core, plus optional money |
| B | Curator guides (food, adventure, wellness) | Guide buyer; platform takes a cut | Core, content, money, public |
| C1 | Retreat host tool (private) | Host, per retreat or yearly | Core, host |
| C2 | Retreat marketplace (wellness first) | Host and/or guest, per booking | Core, host, money, public |
| D | Team offsites and company events | Company, per event or yearly | Core, host, optional money |
| E | Group payments | Fee on money collected | Core, money |
| F | Booking commissions | Partners pay commission | Core, public, partner links |
| G | Clubs and communities | Club, monthly | Core, host, money |
| H | Client trip app for small tour operators and advisors | Operator, per seat or departure | Core, host, light branding |
| I | Paid pass for celebration trips (weddings, stag and hen) | Organiser, per trip | Core, optional money |

**Added 2026-11-10:** [venture-analysis.md](venture-analysis.md) sizes each segment bottom-up and scores it on two lenses. Owner-operator lens: **D leads** for the next 3–6 months. Venture lens: **premium hosts (C1/H operators and retreat hosts, with payments E)** lead. **Decided (D33): premium hosts lead**; offsites stay as a reference and benchmark. Build the host layer v1 now, payments for hosts after the February gate, and keep weddings and celebration trips to discovery. Epic briefs: [epic-briefs.md](epic-briefs.md).

## 4. Shared foundation: what to build

Checked against the code on 2026-11-09. Two corrections to earlier notes:

- **Polls are already real-time.** The server emits `poll:created`, `poll:updated` and `poll:deleted`, and the client listens.
- **"Comments" are AI Q&A, not people-to-people comments.** `TripComment` stores a member's question and an AI answer. It is not emitted in real time. Organizer announcements need a new object.

### 4.1 Build order

Ordered by dependency, then by how many models each feature serves (see the feature matrix in the revenue analysis, section 6). Items 1 to 6 are the gathering scope.

| # | Feature | Today (code) | Gap | Models served | Gathering |
|---|---|---|---|---|---|
| 1 | **Account and role model:** Organizations, trip roles, a membership collection (4.2) | Roles `organizer` or `member`, embedded in `Trip.members`. Only organizers add members, change roles and edit the trip. No account above a trip. | Organization and org roles. Trip roles host, co-host, guest. Per-trip guest permissions. Migrate existing trips. | All 10 (billing and payouts need an account to attach to) | **Yes:** organizers vs attendees |
| 2 | **Sign-in: Google and email magic link** (D4) | Own JWT and bcrypt (`services/auth.js`). Firebase Admin is initialised for push, and `verifyIdToken` exists in `config/firebase.js` but is unused. `User.password` is required. | Firebase Auth with Google and email link. Link to an existing user by verified email. Make the password optional. Keep email and password working for existing accounts. | All 10 | **Yes:** one-tap join |
| 3 | **Invite link with approval** (D17) | Email invites only. The signed-in email must match the invited email exactly. Invites expire after 7 days. | A revocable link per trip. Opening it creates a join request. A host or co-host approves. Email invites keep working. | All 10 | **Yes:** colleagues may sign in with a personal Google account |
| 4 | **Analytics events** | None | A short event list (section 5), a store, and a simple retro view. No content and no coordinates. | All 10 | **Yes:** otherwise we learn nothing |
| 5 | **AI as a reviewable draft, plus AI agenda import** | `POST /itinerary/generate` writes up to 15 items straight into the itinerary. Items have stop, time, transport and notes only. | A draft object, a review screen, then publish. Import from markdown or a file. Agenda fields: end time, location, description. | Draft: 9 models. Import: C1, C2, D, G, H | **Yes:** organizer drops the agenda |
| 6 | **Announcements and notification preferences** | Push fires on every new stop, poll, expense, question and member join (`services/notifications.js`). No preferences. | Announcement object: only hosts and co-hosts post, can pin. Each member can mute by category (announcements, itinerary, polls, expenses, questions). | 7 | **Yes** |
| 7 | **Real-time gaps** | Live today: itinerary, polls, expenses, cover, presence, location. Not live: AI Q&A. `trip:accommodationUpdated` is emitted, but the client does not listen. | Emit new questions and answers. Listen for accommodation changes. | 7 | Small fix; include if time allows |
| 8 | **Activity feed** | Logs trip, itinerary, member and comment actions. Polls and expenses are not logged. No read endpoint, no UI. | Read endpoint and UI. Log polls, expenses and announcements. | 7 | After the gathering |
| 9 | **RSVP, capacity, check-in, guest forms** | None | Per-member RSVP and form answers; trip capacity | C1, C2, D, G, H | Phase 1 |
| 10 | **Organization home** (many events, members, settings) | None | List of an org's trips, members and invites | B, C1, C2, D, G, H | Phase 1 |
| 11 | **Public share page** | None | A separate public listing object (4.2) | 7 | Phase 1–2 |
| 12 | **Payments:** collect, deposits, payouts | Expense ledger in cents with currency; `computeSettlements` suggests who pays whom | Payment requests per member, payee is an Organization or host, payouts, refunds | 5, plus 4 optional | Phase 2 |

**Not in the foundation:** interests onboarding (dropped from the gathering, D2; add it with discovery), reviews, storefront, recurring memberships.

### 4.2 Data model and roles

Direction from the product owner (D18, D19), detailed here. Engineering confirms the details in the spec.

**Principle:** one account per person. A person's role is set per trip. Organizations sit above trips and own hosted trips, billing and payouts. "Host mode" is not a separate app. It is the Organization view in the same app, shown only to people who belong to an Organization (like switching workspaces in Notion).

| Object | What it is | Key fields | Notes |
|---|---|---|---|
| **User** | A person | uid, email, display name, sign-in methods, password (optional), push tokens | No billing on the user |
| **Organization** | A company, host, operator or curator that runs hosted trips | name, type (company, host, operator, curator), plan, billing reference (later), payout reference (later) | Pays, and later receives payouts. Curator is an Organization type, not a trip role. |
| **OrgMember** | A person in an Organization | orgId, userId, role (owner, admin, member), status | |
| **Trip** | The shared object for a trip, event or retreat | owner type (personal or organization), orgId, kind (trip, event, retreat), status (draft, published, archived), visibility (private by default), join policy, guest permissions, capacity (later) | One object for all models |
| **TripMember** | A person's place in one trip | tripId, userId, email, role (host, co-host, guest), status (invited, requested, active, declined, removed), source (email, link, listing), notification preferences; later RSVP, form answers, payment status | A separate collection. Replaces the embedded `Trip.members` array. Events and retreats can have hundreds of members, and each member gets more state. |
| **InviteLink** | A shareable way in | tripId, token, needs approval, expires at, revoked at, created by | |
| **Draft** | AI output waiting for review | tripId, source (generate, import), input, items, status (pending, published, discarded), created by | Publishing copies items into the itinerary and records the source |
| **Announcement** | A message from hosts | tripId, author, body, pinned, created at | |
| **AnalyticsEvent** | One tracked action | name, tripId, role, time, pseudonymous user id | No content, no coordinates |
| Later: **Listing** | The public page of a trip | tripId, public fields only (title, dates, place, agenda summary, host) | Separate object, so private trip data never goes public through a flag |
| Later: **PaymentRequest, Payment, Payout** | Money in and out | payer (TripMember), payee (Organization, or host for personal trips), amount, status | Links to the expense ledger, so money stays in the trip (one source of truth) |
| Later: **Guide** | Curator content | orgId, content | Imports into a trip as a Draft |

**Permissions:**

| Action | Org owner | Org admin | Org member | Trip host | Co-host | Guest |
|---|---|---|---|---|---|---|
| Billing and payouts | ✓ | | | | | |
| Manage Organization members | ✓ | ✓ | | | | |
| Create a hosted trip in the Organization | ✓ | ✓ | ✓ | | | |
| See a trip's members, questions and live location | Only with a trip role | Only with a trip role | Only with a trip role | ✓ | ✓ | ✓ |
| Edit trip settings, publish drafts, approve joins, post announcements | | | | ✓ | ✓ | |
| Add itinerary items, polls, expenses | | | | ✓ | ✓ | Per trip setting: on for personal trips, off for hosted trips |
| Vote, ask questions, share location (opt-in) | | | | ✓ | ✓ | ✓ |

**Rules:**

- Organization membership never gives access to a trip by itself (D19). Live location stays visible only to active trip members.
- Hosted trips belong to the Organization, not to the person. **Proposed (D21):** if someone leaves an Organization, they lose host and co-host roles on its trips, and the trips stay. Each hosted trip keeps at least one host. If the last host leaves, an org owner or admin is asked to take over.
- A user without an Organization can join any trip as a guest (D18). What they can create on their own is D20 (4.3).
- **Migration:** each existing trip becomes a personal trip. Its creator becomes host, other organizers become co-hosts, and members become guests.

**Why this avoids rework:** payments attach to a TripMember (payer) and an Organization (payee), not to a trip or a person's profile. Payment status lives on TripMember. Public pages are a separate Listing object. Curators are an Organization type. None of these needs a change to the role model when it arrives.

### 4.3 Free personal use and the upgrade path (recommendation, D20 TBD)

**What Notion did:**

- **Free personal use, generous.** In May 2020 Notion removed the content limit for personal users and made solo use free indefinitely ([gupta GTM map](https://guptadeepak.com/gtm-map/companies/notion/)). Its CEO calls the strategy B2C2B: people bring Notion to work, and half of its B2B customers came from personal users (same source).
- **The paywall sits at the team moment.** A free workspace with two or more owners gets a 1,000-block limit, after which it must upgrade ([Notion help](https://www.notion.com/en-gb/help/understanding-block-usage)). Free plans allow 10 guests ([Usecarly](https://www.usecarly.com/blog/notion-free-plan-limits/)).
- **Punitive limits backfired.** The old 1,000-block cap drew enough complaints to force a pricing overhaul ([IdeaPlan](https://www.ideaplan.io/case-studies/notion-pricing-strategy)). Splitwise's tighter free tier drew similar anger (revenue analysis, S15).

**What it means for us:** keep friend and family trips free and generous, because every trip invites new people. Charge when a trip becomes a hosted event, with a large group, co-hosts, an agenda and approvals. Then attendees of hosted events become free personal users, and some of them bring the product to their next work offsite.

**Limit options:**

| Lever | For | Against | Recommendation |
|---|---|---|---|
| Number of trips | Simple | Friends take few trips a year, so it rarely bites. It also caps the invite loop. | No |
| Trips expire or are deleted | Creates urgency | Trips hold memories and expense records people need later. Breaks trust and "one source of truth". | **No.** Archive finished trips as read-only, still free. |
| Group size per personal trip | Marks the move from friends to a hosted event | Big friend trips (weddings, stag and hen) hit it | **Yes**, with a one-off Trip Pass (model I) for big personal trips |
| AI drafts per trip | Matches our real AI cost | AI is a core helper | **Yes**, a few per trip free |
| Host features (agenda import, approvals, RSVP, forms, branding, host analytics, large announcements) | Matches who pays | None strong | **Yes:** Organization (or Trip Pass) only |

**Proposed tiers (numbers TBD):**

| Tier | Who | Price | Includes |
|---|---|---|---|
| Free personal | Anyone | €0 | Unlimited trips, all collaboration, polls, expenses, live location, announcements. Up to about 12 members per trip. A few AI drafts per trip. |
| Trip Pass (model I) | Organiser of one big personal trip | One-off, e.g. €19–39 | One trip: up to about 50 members, more AI drafts, agenda import, approvals, RSVP |
| Organization (D, C1, H) | Companies, hosts, operators | Per event or yearly (D8) | Hosted trips, co-hosts, all host features, host analytics, payments later. First event free as a trial. |

The gathering needs none of this. It runs as a free Organization pilot.

### 4.4 Conflicts with our principles

| # | Item | Principle | Status and fix |
|---|---|---|---|
| 1 | AI itinerary generation writes straight into the trip | 4. AI suggestions are editable drafts | Known. Fixed by the Draft object (build item 5). |
| 2 | AI Q&A prompt uses origin, destination and date, but not the accommodation | 4. Based on real accommodation and dates | New. Add accommodation and the trip calendar to the prompt. Small fix. |
| 3 | Shareable invite link | 3. Only active trip members can see a trip | Resolved by D17: the link only creates a join request. Nothing is visible before approval. |
| 4 | Organization admins seeing trips they are not on | 3. Privacy first | Resolved by D19: trip roles gate access. |
| 5 | Analytics on colleagues' behaviour | 3. Privacy first | No content, no coordinates, pseudonymous ids. Count location opt-in only. Say what we track in the onboarding privacy note. |
| 6 | Agenda files and questions go to an outside AI provider (OpenAI) | 3. Privacy first | Say so in the privacy note. Keep personal data out of prompts. |
| 7 | Push on every change | 2. Real-time by default (live updates should not mean noise) | Fixed by notification preferences (build item 6). |
| 8 | AI Q&A not live; accommodation change not shown live | 2. Real-time by default | Build item 7. |
| 9 | Public listing pages (later) | 3. Only active trip members can see a trip | Needs a principle amendment before Phase 2: a public page is a separate, opt-in object with no member data. |
| 10 | Expiring or deleting free trips (idea) | 1. One source of truth | Not recommended (4.3). Archive instead. |

## 5. The eDreams gathering as a testing ground

**Assumption to confirm (D1):** the Madrid gathering on 24–25 November 2026. This is taken from the cover artwork in spec 001. That leaves about two weeks.

**What it tests:** the host-and-guest pattern on a real event with real people. One organizer team acts as hosts and colleagues are guests. This is the core of models C, D, G and H. It runs as a free Organization pilot.

**Scope (decided, D2):**

1. **AI agenda import.** An organizer drops the agenda as markdown or a file. AI builds a draft schedule, and organizers review it and publish. This also fixes the "AI as draft" gap.
2. **Easy join.** Google or email magic-link sign-in (D4), an invite link with organizer approval (D17), and roles for hosts, co-hosts and guests (D18). No interests step.
3. **Announcements with mute settings.** Hosts post and pin. Attendees mute by category.
4. **Analytics events.** Instrument the events below so the test produces data.

**Across all four (D23):** the interface in English, Spanish and Portuguese, with times in the event's time zone. Treated as a requirement on every screen, not a fifth feature. The base shipped on 9 Nov in [spec 003](../specs/003-localization.md) (Portuguese as pt-BR). What remains for the pilot: strings for the new screens, the event time zone, the language saved to the account, push in each person's language, and a native review.

**Spec and build list:** [specs/002-hosted-event-pilot.md](../specs/002-hosted-event-pilot.md) (draft) and [pilot-event-feature-list.md](pilot-event-feature-list.md).

Keep what exists: polls (sessions, dinner choice), opt-in live location (meeting points), AI Q&A and covers.

**Events to track:** invite link opened, join requested, join approved, signed in (method), trip viewed, agenda viewed, poll voted, question asked, announcement posted, announcement opened, notifications muted (category), location sharing started (no coordinates), draft imported, draft published (number of items edited).

**What to measure and proposed thresholds (D7, yours to confirm):**

| Metric | Definition | Proposed threshold |
|---|---|---|
| Join rate | Joined ÷ invited | 60% or more |
| Join speed | Link opened to join request sent | Median under 2 minutes |
| Approval speed | Join request to approval | Median under 1 hour |
| Day 1 active | Joined attendees who open the event on day 1 | 60% or more |
| Day 2 active | Joined attendees who open the event on day 2 | 40% or more |
| Actions per active attendee per day | Agenda views, votes, questions, announcement opens | 3 or more |
| Poll participation | Joined attendees who vote in at least one poll | 50% or more |
| Mute rate | Joined attendees who mute all categories | 25% or less |
| Agenda import | Organizer time from upload to publish; share of AI items kept as is or with small edits | Under 30 minutes; 70% or more |
| Survey | "Very disappointed without it" among respondents; response rate | 30% or more; 40% or more respond |
| Organizers | Would use it again; intros to another organizer | At least 2 say yes; at least 1 intro |
| Location opt-in | Attendees who share location at least once | Report only. No target: we do not push it. |

The join, day 2 and survey thresholds match the Phase 0 gate in the revenue analysis.

**Risks:**

| Risk | Mitigation |
|---|---|
| Colleagues' personal data and location | Opt-in only. Keep "never stored". A short privacy note in onboarding covers analytics and the AI provider. |
| No tests and unknown hosting | Run a dry run with 3 to 5 people before the event. Engineering confirms deployment. |
| Scope creep in two weeks | Four features plus the remaining localization is about 9–12 days of work for about 6 days of build. Cut line in spec 002, §12. |
| Email deliverability for magic links | Test with eDreams and personal mailboxes in the dry run. Keep email and password as a fallback. |
| iPhone push | Web push on iPhone needs the site on the Home Screen. Add a web app manifest; announcements are also shown in-app. |

## 6. Two-week plan (proposal)

| When | What |
|---|---|
| Mon 9 – Wed 11 Nov | Confirm gathering details (D1). Gathering scope decided (D2). Brand foundations v0 written ([../brand/brand-foundations.md](../brand/brand-foundations.md)). Spec 002 drafted (D22). |
| Wed 11 – Thu 12 Nov | Owner review of spec 002 and its open decisions (S1–S8). Lo-fi wireframes for its 13 frames. Spanish and Portuguese string review starts. Pick a working name (D12). |
| Thu 12 – Thu 19 Nov | Build (engineering), in the order of spec 002, §12 |
| Tue 17 Nov | Cut-line check. If behind: one "mute this event" switch, email and password instead of the email link, Portuguese only if reviewed, drop the small fixes. |
| Fri 20 Nov | Dry run with 3 to 5 people: a personal Google account, an email link from a work mailbox, an iPhone and an Android phone, all three languages |
| Tue 24 – Wed 25 Nov | Gathering. Collect quotes and organizer feedback. Test 2 to 3 shortlisted names informally. |
| By Fri 27 Nov | Retro: data against the thresholds in section 5, survey, decision on lead model (D3), next steps for brand and go-to-market |

## 7. Open decisions

| # | Decision | Status |
|---|---|---|
| D1 | Confirm gathering date, size, organizers, and who invites | TBD |
| D2 | Gathering scope (section 5) | **Decided 2026-11-09** |
| D3 | Lead revenue model | **Decided 2026-11-10 (D33):** premium hosts (C1/H, with E next). D stays as a reference and benchmark |
| D4 | SSO provider | **Decided 2026-11-09:** Google and email magic link |
| D5 | eDreams policy check (side project, testing, OTA overlap) | **Closed 2026-11-09** at project level by the product owner |
| D6 | Adopt "benchmark and wireframe before spec" as a rule | **Decided 2026-11-09:** stages and approval gate in [docs/README.md](../README.md); `/feature` command in Claude Code |
| D7 | Gate thresholds | Proposed in section 5 for Phase 0; others in the revenue analysis, section 7 |
| D8–D11 | D test price, park F, Phase 2 candidate, payments approach | See revenue analysis, section 10 |
| D12 | Working name for the gathering | TBD, by 12 Nov. Options in brand foundations, B2 |
| D13 | Buy 1–2 domains for strong candidates | TBD, only if cheap and free |
| D14 | Brand architecture: umbrella brand plus product descriptors, or separate brands | **Decided 2026-11-09:** umbrella brand with plain descriptors |
| D15 | Phase 1 go-to-market focus: offsite organisers in Barcelona and Madrid tech companies | **Superseded by D33:** Phase 1 go-to-market is premium hosts (T1–T3, then retreat and workshop hosts) |
| D16 | Start an organisers circle (design partners) after the gathering | Proposed |
| D17 | Invite link policy | **Decided 2026-11-09:** link plus host approval |
| D18 | Account model | **Decided 2026-11-09:** Organizations own hosted trips; one account per person, role per trip |
| D19 | Does Organization membership give trip access? | **Decided 2026-11-09:** no, trip roles apply |
| D20 | What users without an Organization can create, and the free limits | TBD. Recommendation in 4.3: free personal trips, limit group size and AI drafts, no expiry |
| D21 | What happens to trips when someone leaves an Organization | Proposed in 4.2 |
| D22 | How to spec the gathering work | **Decided 2026-11-09:** one spec, 002 Hosted event pilot |
| D23 | Localization in the gathering scope | **Decided 2026-11-09:** English, Spanish and Portuguese |
| D24 | Spec 002 open decisions S1–S8 (join page content, file types, analytics store and retention, Portuguese variant, iPhone reach, who creates Organizations, replies to announcements) | Not blockers. The recommendations in spec 002, §9 are the working defaults (D27). S5 is now pt-BR (shipped). |
| D25 | Where shared docs live | Superseded by D26 |
| D27 | Do open product and strategy questions block the build? | **Decided 2026-11-09:** no. Recommendations are working defaults; the owner can override them later. Only items marked **Blocks** stop work. |
| D28 | Portuguese variant | pt-BR shipped in spec 003. Confirm or switch to pt-PT later (one file). Not a blocker. |
| D29 | Pricing rule: the organiser with the budget pays; guests never pay (premium-buyer lens P1) | Proposed |
| D30 | Done-with-you tier as capped paid discovery (P2) | Proposed |
| D31 | Phase 2 candidates: C1/H premium operators and destination-wedding planners, interviews first (P3, W-a, W-b) | **Superseded by D33:** premium hosts lead now; planners stay in discovery (D36) |
| D32 | Use the April 2027 bachelor trip in Costa Rica as a product test (W-c) | Proposed |
| D33 | Lead segment ([venture-analysis.md](venture-analysis.md) §14) | **Decided 2026-11-10:** premium hosts (premium retreats, workshops, expeditions: C1/H, with E next). Offsites stay as a reference and benchmark; no Naboo-style pivot |
| D34 | Board changes: Horizon field, milestones M0–M2, outcome-named initiatives 6–8, close initiative 5, epics from [epic-briefs.md](epic-briefs.md) (venture analysis §12) | Proposed |
| D35 | Funding path: bootstrap to M2 (30 Jun 2027), decide at M3 (Apr 2028) | Proposed |
| D36 | Weddings: discovery only until the M1 gate (26 Feb 2027) | Proposed |
| D37 | Prices to test with the first hosts (per departure, monthly, done with you) | TBD |
| D38 | Adopt the epic standard (outcome titles, hypothesis, measures, user stories) and an `/epic` command ([epic-briefs.md](epic-briefs.md) §1, §6) | Proposed |
| D26 | Where shared docs live, with two Claude accounts on two computers | **Decided 2026-11-09:** every durable doc lives in the repo's `docs/` (product, brand, specs). Claude Projects keep pointers only. See "Working across accounts and computers" in [docs/README.md](../README.md). |
| 004-D9 | Trip phase precedence (spec 004 §18.3 D9) | **Decided 2026-11-10:** the calendar wins. Countdown, Live and Wrap follow the dates even for a solo or plan-less trip |
| 004-D10 | Trips without an end date (spec 004 §18.3 D10) | **Decided 2026-11-10:** offer an approximate length (e.g. 8–10 days); phases use the longer estimate |
| 004-D11 | Build spec 004 slices 2 and 3 before the tree test (spec 004 §18.3 D11) | **Decided 2026-11-10:** yes. Run the tree test before the labels ship |

## 8. Related

- Discovery plan for audience-market fit and product-market fit: [discovery-amf-pmf.md](discovery-amf-pmf.md)
- Revenue model analysis: [revenue-models-analysis.md](revenue-models-analysis.md)
- Brand foundations: [../brand/brand-foundations.md](../brand/brand-foundations.md) (platform, voice, architecture, naming rounds 1 and 2, visual moods, UX principles)
- Gathering spec: [../specs/002-hosted-event-pilot.md](../specs/002-hosted-event-pilot.md)
- Gathering build list: [pilot-event-feature-list.md](pilot-event-feature-list.md)
- Premium buyer lens (Hormozi): [premium-buyer-lens.md](premium-buyer-lens.md)
- Destination weddings use case: [destination-weddings.md](destination-weddings.md)
- Early testers register: [early-testers.md](early-testers.md)
- Venture analysis (market size, unit economics, two lenses, horizon ranking, board plan): [venture-analysis.md](venture-analysis.md)
- Epic briefs and how we write an epic: [epic-briefs.md](epic-briefs.md)
- Feature workflow (benchmark → define → wireframes → spec → owner approval → build → docs): [docs/README.md](../README.md)

## 9. Brand

**Timing:** a lightweight version now, final choices after audience-market fit. A name should speak to an audience, and the audience is not chosen yet.

| Do now (cheap, reversible) | Wait until after audience-market fit |
|---|---|
| Brand direction: purpose, personality, voice, 2–3 visual moods | Final name and trademark filing |
| Naming criteria, naming themes and a long list | Logo and full visual identity |
| A working name for the gathering | Full design system and component library |
| 1–2 cheap domains if a strong candidate is free | Many or premium domains, social handles everywhere |
| 5–7 UX principles that guide the build | Marketing site |

**Umbrella:** "groups sharing experiences with intention". That covers friends' trips, team offsites, retreats, guides and clubs.

- One umbrella brand with plain product descriptors under it ("[Name] for Teams", "[Name] Retreats"). Pivoting adds a descriptor, not a rebrand. **Decided (D14).**
- Name the feeling (together, presence, journey, place), not the category. No "trip", "travel", "wellness" or "retreat" in the name.
- Lean towards wellness in tone (calm, warm, intentional), not in the name. This also keeps clear of OTA territory.
- Note: if D wins, the tone needs to work for companies too. Calm and competent, not only soft.

**Naming criteria:**

1. One or two syllables, easy to say in English, Spanish and Portuguese.
2. Not literal, not corny: no "-ly", "-ify", puns or "wander".
3. Works as a place ("see you on ___").
4. No overlap with big travel brands, including eDreams ODIGEO brands.
5. A usable domain: .com, or a clean .co or .app.
6. A trademark search comes back clear in the travel, events and hospitality classes.

**Naming status (2026-11-09):** see [brand foundations](../brand/brand-foundations.md), sections 3.4 to 3.7. The product owner's current favourite is **Lazo**. Proposed finalists for a proper clearance search: Lazo, Fogata, Corro (B3, TBD). Web searches only so far; no legal trademark check.

**Design system later:** UX principles and voice rules now. Tokens and components after the visual direction is chosen. The client already has CSS tokens (`--gradient`, `--radius`) to build on.

## 10. Community building

**Why:** in every model, organisers bring the group. Hosts, team leads, club leads and curators are the people to know and win. A small community of organisers gives us feedback, design partners, referrals and, later, supply for any marketplace. It is the moat the revenue models share.

**Principle:** start with organisers, not attendees. Keep it small and real. No empty Discord servers.

| Phase | Community move | Size |
|---|---|---|
| **Phase 0 (gathering)** | The gathering organizers are the first design partners. Hold a 30-minute retro with them after the event. | 2–5 people |
| **Phase 1 (Dec – Feb)** | **Hosts circle:** premium hosts (T1–T3 and new ones) who try the product. A private group chat, a monthly 30-minute call, early access, and a direct line to you. Offer the first 5 design partners a free first event or a discount in exchange for feedback and a quote. | 10–30 people |
| **Phase 1, in parallel** | Interviews: 15 retreat, workshop and expedition hosts (C1, H) and 5 wedding planners (W). Invite the good ones into the circle. | 15 + 5 interviews |
| **Phase 2 (Mar – Jun)** | Templates people share: offsite agendas, retreat schedules, packing lists. They import straight into the product through AI import. Showcase real events with permission. | Grows with users |
| **Later** | A host community for retreats (C), if C wins. It becomes marketplace supply. | TBD |

**Product loops that feed the community:**

- **Attendee to organiser:** every attendee sees the product working. Ask at the end of each event, "Organising something yourself?", with a one-tap start.
- **Templates:** an organiser's agenda becomes a shareable template, with credit to them.
- **Public event page:** a "made with [Name]" footer on any public page (when public pages exist).

**Measure:** circle members, active design partners, referrals and intros per event, and the share of new organisers who came from a previous event.

**Early testers (2026-11-10):** the first names are in [early-testers.md](early-testers.md): two Costa Rica trip operators, a photography-workshop operator, two Barcelona food-experience hosts, the bachelor trip (April 2027) and the pilot organisers. Contact details stay out of the repo.

## 11. Go-to-market

Updated 2026-11-10 for D33: premium hosts lead. The earlier offsite version is in git history; offsites are now inbound only and serve as a benchmark.

**Ideal first customer:** the founder of a small-group trip business (a retreat, a photography or creative workshop, an expedition) running several departures a year for about 8–15 travellers who each pay thousands. They use a sign-up form, a spreadsheet and WhatsApp today [early-testers T1–T3]. Spanish, Portuguese or English speaking.

**Positioning draft:** for hosts of premium small-group trips, [Name] is the live space where each departure's schedule, traveller details, updates and (soon) payments live, so travellers feel looked after and the host stops running the trip from WhatsApp and a spreadsheet. Unlike booking marketplaces, it takes no commission on the host's sales.

| Phase | Goal | Channels | Offer |
|---|---|---|---|
| **Phase 0 (now – 27 Nov)** | Proof the host layer works on a real event; pilot metrics become the benchmark | The eDreams gathering | Free |
| **Phase 1 (Dec – Feb)** | 15 host interviews; 2+ hosts pay for or commit a departure (M1) | Founder-led: T1–T3, intros from them, Instagram DMs to hosts, Costa Rica and Spain networks | Concierge setup of one departure for a flat fee (D37); free for the first design partners if needed |
| **Phase 2 (Mar – Jun)** | 10+ paying hosts; first deposits collected in the app (M2) | Host referrals, "made with" footer on public departure pages, retreat-teacher and operator communities | Monthly plan plus a payment fee |
| **Later** | Scale what worked | Templates, the traveller-to-organiser loop, partner programmes | TBD |

**Funnel to track:** hosts contacted → interviews → concierge departures → paid → second departure without our help. For each departure, also track travellers → organisers.

**Not now:** paid ads, an App Store launch, Product Hunt, broad social accounts, a marketplace launch, or an outbound offsite sales push.

## Decision log

| Date | Decision |
|---|---|
| 2026-11-09 | Payments and booking are back in scope. The earlier exclusion was a setup default. |
| 2026-11-09 | Strategy direction: a shared core first, model layers on top. The eDreams gathering is the first live test. |
| 2026-11-09 | Branding: a lightweight v0 now (direction, voice, working name). Final name, logo and design system after audience-market fit. |
| 2026-11-09 | D2: gathering scope is four features: AI agenda import as a reviewable draft, easy join (sign-in, invite link, roles), announcements with mute, analytics events. No interests step. |
| 2026-11-09 | D4: sign-in with Google and email magic link. |
| 2026-11-09 | D17: invite links create a join request. Nothing is visible until a host or co-host approves. |
| 2026-11-09 | D18: Organizations own hosted trips and let their members create and manage them. One account per person with a role per trip. A user without an Organization can join trips as a guest. |
| 2026-11-09 | D19: Organization membership does not give access to a trip. Trip roles do. |
| 2026-11-09 | D5: the eDreams policy topic is closed at project level (product owner). |
| 2026-11-09 | D14: one umbrella brand with plain descriptors. Lazo is the current name favourite; final name after clearance and audience-market fit. |
| 2026-11-09 | D22: the gathering work is one spec, `002-hosted-event-pilot.md`. |
| 2026-11-09 | D23: localization (English, Spanish, Portuguese) is part of the gathering scope, as a requirement on every screen. |
| 2026-11-09 | D6: every feature goes benchmark → define → wireframes → spec → owner approval → build → docs. Written in `docs/README.md`. |
| 2026-11-09 | D25: anything engineering needs lives in the repo's `docs/`. The pilot feature list moved there. |
| 2026-11-09 | Spec 003 shipped (PR #5): the interface in English, Spanish and Portuguese (pt-BR), language by saved choice, country from IP, then browser. AI output follows the UI language. |
| 2026-11-09 | D27: open product and strategy questions are not blockers. Recommendations act as working defaults; the next two weeks focus on the spec 002 build. |
| 2026-11-09 | D26: with two Claude accounts on two computers, every durable doc lives in the repo. The working doc, revenue analysis and brand foundations moved to `docs/`. Claude Projects keep pointers only. |
| 2026-11-10 | D33 (also D3): premium hosts lead (premium retreats, workshops, expeditions; C1/H with payments E next). Offsites stay as a reference and benchmark; we won't become an offsite booking platform. D15 and D31 superseded. See [venture-analysis.md](venture-analysis.md). |
| 2026-11-10 | Spec 004 (trip information architecture) built in three slices, in review as PRs #11–#14. 004-D9: trip phases follow the calendar. 004-D10: trips without an end date take an approximate length. 004-D11: slices 2–3 built before the tree test. Follow-ups seeded as specs 005–008 and the [spec backlog](spec-backlog.md). |
