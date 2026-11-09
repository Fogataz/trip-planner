# Trip Planner: Revenue Models Analysis

> **Point-in-time analysis.** Written 2026-11-09. Input to decision D3 (lead revenue model) in the [working doc](working-doc.md). Nothing here is decided. Items marked **TBD** are for the product owner. Source numbers in square brackets, e.g. [S4], refer to the source list at the end.
>
> Moved into the repo on 2026-11-09 (D26). Like a spec, it is not rewritten: a later analysis gets a new file.

## 1. Summary

- **Lead with D (team offsites and company events).** The eDreams gathering already tests it. One company is one customer, so there is no two-sided cold start. Companies already pay per event for event apps. It needs no payments and no public pages, and it does not touch OTA territory.
- **Build the host layer once, for D first.** The same layer (roles, AI agenda import, announcements, RSVP, guest forms) also serves C1 (retreat host tool) and H (operator client app). Those are the best candidates for Phase 2.
- **Keep A (friends and family) free.** It is the core and the acquisition loop. Friend groups rarely pay. Monetise them later through E (fees on money collected), not a subscription.
- **Park F (booking commissions).** It is the highest conflict with your job (you work on hotel cross-sell at eDreams) and it pulls the AI towards being pushy.
- **Defer the marketplace and public layers (B, C2, G).** They are two-sided, need the most build and add a privacy change. Revisit only after a Phase 2 gate.

## 2. Starting point (from the repo)

| Area | Today |
|---|---|
| Accounts | Email and password with JWT. No SSO. |
| Roles | Per trip: `organizer` or `member` (`server/models/Trip.js`). |
| Trip core | Trips, invitations, itinerary, polls, comments, presence, opt-in live location, covers. |
| AI | Itinerary generation writes straight to the trip. Not a reviewable draft yet. |
| Money | Expenses with balances and suggested settlements (`computeSettlements` in `server/routes/expenses.js`). No payments. |
| Notifications | Device registration only. Triggers TBD. |
| Activity | Logged on the server. No feed and no read endpoint. |
| Not built | Public pages, payments, host roles, analytics, tests. |

## 3. Models evaluated

A to G are yours. H and I are new.

| # | Model | One line |
|---|---|---|
| A | Group trip planner | Friends and family plan a trip together. |
| B | Curator guides | Curators sell city or country guides; platform takes a cut. |
| C1 | Retreat host tool (new split) | Private tool for a retreat host to run a retreat with guests. No marketplace. |
| C2 | Retreat marketplace (wellness first) | Guests discover and book retreats by interest. |
| D | Team offsites and company events | A company runs an offsite or gathering in the app. |
| E | Group payments | Collect and split money for a trip; fee on money moved. |
| F | Booking commissions | Partner links for stays, activities and transport inside plans. |
| G | Clubs and communities | Run clubs, surf clubs, travel groups; monthly. |
| H | **New:** client trip app for small tour operators and travel advisors | The operator builds the trip; travellers get the live group app. B2B SaaS. |
| I | **New:** paid pass for high-stakes celebration trips | Stag and hen weekends, destination weddings, milestone birthdays. Per-trip fee paid by the organiser. |

**Why C is split.** The host tool and the marketplace have very different risk. The host tool is one-sided and close to what is built. The marketplace is two-sided and needs public pages, discovery and payments. Scoring them together hides the cheap path.

**Why H.** It is the same "host plus guests, on dates, in a place" pattern as D and C1. Operators already pay for exactly the guest-side app we have: Travefy charges travel advisors from $39 a month for the first seat [S26] and gives their clients a free itinerary app [S26]. It is one-sided and B2B. Caution: travel advisors are travel distribution, so check the eDreams conflict.

**Why I.** It answers the main weakness of A. Most friend trips will not pay, but one organiser carries a lot of stress and spend on a few trips: BACH quotes an average bachelor or bachelorette cost of about $650 per person [S25]. BACH raised a $9M Series A for this niche [S25] and earns commission on experiences booked in the app [S25]. We can test a per-trip pass instead of commissions, which avoids the F conflict.

## 4. Model cards

Cadence key: per trip, per booking, per event, monthly, yearly.

### A. Group trip planner (friends, family)

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Organiser (sometimes split). For less chaos on one trip. Per trip, a few times a year. A subscription is a weak fit. |
| 2. Pricing benchmarks | Wanderlog Pro $39.99 a year, mostly offline access, export and more AI [S14]. Splitwise Pro around $39.99 a year in the US App Store [S15]. Tricount: free with ads plus an optional subscription [S16]. |
| 3. Willingness to pay today | Weak. Tricount had 5.4M users but low revenue per user, and was bought by bunq as a funnel [S16]. Splitwise's tighter free tier drew angry reviews about paying to log expenses [S15]. |
| 4. First 20 paying customers | Your own trips and friends; a paywall on one premium feature (for example a PDF/offline pack or AI drafts). Expect low conversion. |
| 5. Cold start | Low. One group gets value alone. Growth is viral inside each group. |
| 6. Layers and build effort | Core only. **S**: mostly built. Gaps: SSO, AI as draft, real-time polls and comments. |
| 7. Principles and eDreams | Fits all principles. eDreams conflict: **Low** while we do not sell travel. |
| 8. Time to first revenue | 1 to 2 months, but very small amounts. |

### B. Curator guides

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Guide buyer, one-off per guide. Platform takes a cut from the curator. |
| 2. Pricing benchmarks | Thatch lets travel creators sell guides and takes a small percentage per transaction [S23]. Thatch creators also earn hotel commissions [S23]. |
| 3. Willingness to pay today | Mixed. Reviewers note travellers may not pay for content that is often free [S23]. Thatch has raised $5.2M in total [S23], a small sign for the category. |
| 4. First 20 paying customers | Through Casa Catz and 2 to 3 creators with audiences. The creator brings the buyers. |
| 5. Cold start | High. Two-sided: curators and buyers. Softer if each curator brings an audience. |
| 6. Layers and build effort | Core, content, money, public. **XL**: storefront, paid access, payouts, public pages. |
| 7. Principles and eDreams | Public guides change "privacy first". eDreams conflict: **Low to Medium** (guides tend to link to bookings). |
| 8. Time to first revenue | 4 to 6 months. |

### C1. Retreat host tool (private, no marketplace)

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Host. For running a retreat without admin and giving guests a shared plan. Per retreat or yearly. Guests do not pay us. |
| 2. Pricing benchmarks | Bookinglayer: one fixed monthly fee, no commission [S7]; examples €260 and €410 a month [S6]. Retreat Guru software: 0.9% to 1.2% of bookings with a monthly minimum of $100 to $440 [S9]. Gather: £699 a year plus 2% per booking (from our earlier benchmark, not re-checked today) [S8]. WeTravel: 1% transaction fee; Pro plan $79 a month [S12]. |
| 3. Willingness to pay today | Strong. Hosts already pay for booking and admin tools. WeTravel says it is used by yoga retreat leaders [S12]. None of these lead with a live, real-time guest experience. That is our gap. |
| 4. First 20 paying customers | Pick one niche you can reach (TBD, D2 in the discovery plan). Instagram DMs to hosts, retreat directories, and yoga or surf teacher communities. Concierge the first 3 to 5 retreats. |
| 5. Cold start | Low. One-sided: one host brings their guests. |
| 6. Layers and build effort | Core and host; money optional (link out to the host's own payment tool first). **M to L**: the same host layer as D, plus guest forms and capacity. |
| 7. Principles and eDreams | Fits. Private by default. eDreams conflict: **Low**. |
| 8. Time to first revenue | 2 to 3 months (concierge pilot, pre-sell the next retreat). |

### C2. Retreat marketplace (wellness first)

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Host commission per booking (and/or a guest fee). For filling the retreat. |
| 2. Pricing benchmarks | Retreat Guru marketplace: 14% commission, paid by the guest as a deposit [S10]. BookRetreats: free to list, 15% commission including processing [S11]. Retreator: 10%, and says most platforms charge 15% to 30% [S29]. Airbnb: hosts now pay a single fee of about 15.5%; the old split was 3% host plus 14.1% to 16.5% guest, announced to retire by 13 Oct 2026 in the EEA [S4]. |
| 3. Willingness to pay today | Strong once there is demand: hosts pay 10% to 15% for guests they would not find. Incumbents are big: Retreat Guru claims about 1M annual visitors and over 10k listings [S10]; BookRetreats has a 360k email list [S11]. |
| 4. First 20 paying customers | Only after C1 has hosts. Seed listings from C1 hosts. Buying guest demand is expensive against these incumbents. |
| 5. Cold start | Very high. Two-sided, and incumbents already hold both sides. BookRetreats even polices hosts taking bookings off-platform [S11], which shows how hard leakage is. |
| 6. Layers and build effort | Core, host, money, public. **XL**: listings, search by interest, reviews, payments, refunds, payouts. |
| 7. Principles and eDreams | Needs a public listing page separate from the private trip space; amend "privacy first". Selling stay plus activities may raise package-travel rules (check). eDreams conflict: **Medium**. |
| 8. Time to first revenue | 9 to 12+ months. |

### D. Team offsites and company events

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | The company (People, HR, office or event lead). For one place where the agenda, logistics, votes and updates live, and attendees actually use it. Per event, or yearly for several events. Attendees never pay. |
| 2. Pricing benchmarks | Event apps: LineUpr from €147 per event [S17]; Event Vault €500 base plus €1 per attendee [S17]; Whova quoted per event, reported from $2,999 plus 3% + $0.99 per paid ticket [S17]. Luma: free, 5% fee on paid tickets, or $59 a month for 0% [S18]. Planners: TeamOut takes about 10% from venues on rooms [S19]; a full offsite often costs $2,000 to $5,000 per person all-in [S20]. |
| 3. Willingness to pay today | Strong. Companies already pay per event for event apps and planning services. TeamOut reports 500+ retreats supported [S19]. The software is a tiny share of a budget measured in thousands per person. |
| 4. First 20 paying customers | (1) The eDreams gathering as a free case study, if allowed. (2) Organisers you know at Barcelona and Madrid tech companies. (3) Offsite venues and planners as a referral channel. (4) A short public demo page of the gathering (no personal data). |
| 5. Cold start | Very low. One-sided. Attendees are invited, not acquired. |
| 6. Layers and build effort | Core and host; money optional. **M**: the four gathering features plus RSVP and a host workspace. Mostly the shared core. |
| 7. Principles and eDreams | Fits. Events stay private. Colleagues' data and location: opt-in, never stored. eDreams conflict: **Low** (no booking), but testing with eDreams staff needs permission first (D5). |
| 8. Time to first revenue | 4 to 8 weeks after the gathering (first paid pilot in January). |

### E. Group payments

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Whoever moves the money, usually passed on to the payer. For collecting deposits and shares without chasing people. Per transaction. |
| 2. Pricing benchmarks | WeTravel: from 1% + 30c on bank payments, organiser chooses who pays fees [S12]. Heylo: 3.7% + $0.59 plus Stripe [S21]. Spond: free app, fee per payment, e.g. 2.5% + £0.20 in the UK [S22]. Luma: 5% on paid tickets [S18]. Meetup: 7% plus organiser fees (as Heylo reports it) [S21]. |
| 3. Willingness to pay today | Proven for organisers: Heylo says it has paid $4M to group leaders [S21]; Spond funds a free app with payment fees only [S22]. Unproven for friend groups, who already settle with Bizum, bank transfers or Tricount. |
| 4. First 20 paying customers | Not alone. Attach it to C1, D or I hosts who collect money in advance. |
| 5. Cold start | Low. Rides on existing groups. |
| 6. Layers and build effort | Core and money. **L**: Stripe Connect (or similar), onboarding and KYC for payees, refunds, disputes, payouts. Builds on the current settlement maths. |
| 7. Principles and eDreams | Fits "one source of truth" (expenses and payments in the same trip). eDreams conflict: **Low**. |
| 8. Time to first revenue | 3 to 4 months. Small per trip; grows with money moved. |

### F. Booking commissions

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Partners (OTAs, activity platforms) pay per completed booking. |
| 2. Pricing benchmarks | GetYourGuide and Viator affiliates: about 8% per booking; Booking.com affiliates: 25% to 40% of Booking.com's commission [S24]. |
| 3. Willingness to pay today | Partners pay reliably, but revenue needs volume we do not have. Wanderlog also earns referral commissions [S14]. |
| 4. First 20 paying customers | Not applicable. Needs traffic, not customers. |
| 5. Cold start | Medium. One-sided, but tiny revenue until volume. |
| 6. Layers and build effort | Core, public, partner links. **S to M** for links. |
| 7. Principles and eDreams | Conflicts with "helpful, not pushy AI" if suggestions carry commissions. eDreams conflict: **High**. eDreams sells hotels and is expanding accommodation inside Prime [S27], and your role is hotel cross-sell. |
| 8. Time to first revenue | 1 to 2 months technically. Blocked by the conflict check. |

### G. Clubs and communities

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Club organiser (software) or members (fees on dues and events). Monthly or yearly dues; per event. |
| 2. Pricing benchmarks | Heylo: $0 base plan, earns on payments [S21]. Spond: free, fees on payments [S22]. Playtomic: club software €59 to €279 a month plus about 4% commission (as a competitor reports it) [S1], plus a player service fee on online payments [S2]; about $25M revenue [S3]. |
| 3. Willingness to pay today | Low for software (free tools dominate); real for payment fees. Playtomic shows clubs pay when the tool brings bookings, but clubs complain about commission [S1]. |
| 4. First 20 paying customers | Barcelona run and surf clubs via Instagram and Strava. Best wedge: clubs that run trips (surf trips, race weekends). |
| 5. Cold start | Low. One club brings its members. |
| 6. Layers and build effort | Core, host, money. **L**: recurring events and memberships are a new object; today's product is one trip with dates. |
| 7. Principles and eDreams | Discovery of clubs needs public pages. eDreams conflict: **Low**. |
| 8. Time to first revenue | 2 to 3 months (via payment fees). |

### H. New: client trip app for small tour operators and travel advisors

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | Operator or advisor. For a branded, live trip app their travellers use, without building one. Monthly or yearly per seat; or per departure. |
| 2. Pricing benchmarks | Travefy Core: $39 a month for the first seat, $20 per extra seat (annual) [S26]. WeTravel Pro $79 a month [S12]. TrovaTrip shows the creator-led group-trip model works: hosts earn on average over 20% of trip revenue [S13]. |
| 3. Willingness to pay today | Strong. Travefy says 30,000+ travel brands use it [S26]. Operators pay for itinerary and client-app tools today. |
| 4. First 20 paying customers | Small operators in Spain and Portugal (surf, hiking, food tours), and creator-hosts of group trips. LinkedIn and operator communities. |
| 5. Cold start | Very low. One-sided. |
| 6. Layers and build effort | Core and host, plus light branding. **M**: reuses AI import (operator itinerary becomes a draft). |
| 7. Principles and eDreams | Fits. eDreams conflict: **Medium**. Travel advisors and operators are travel distribution. Check before going further. |
| 8. Time to first revenue | 2 to 3 months. |

### I. New: paid pass for high-stakes celebration trips

| Question | Answer |
|---|---|
| 1. Who pays, for what, cadence | The organiser (maid of honour, best man, couple), sometimes split. For running a stressful, expensive trip for a group. Per trip. |
| 2. Pricing benchmarks | BACH is free and earns commission on bookable experiences [S25]. No strong per-trip pass benchmark found; price is a hypothesis (for example €15 to €39 per trip). |
| 3. Willingness to pay today | Medium. High spend per person [S25] and funded competitors [S25], but they monetise through commissions, not a fee. |
| 4. First 20 paying customers | Friends planning weddings and hen or stag trips; wedding planners as referrers; Instagram. Seasonal (spring and summer peak). |
| 5. Cold start | Low. One group gets value alone. |
| 6. Layers and build effort | Core; money (E) helps. **S to M**. |
| 7. Principles and eDreams | Fits. eDreams conflict: **Low** if we do not sell stays. |
| 8. Time to first revenue | 2 to 3 months (timing depends on season). |

### Reference companies you named

| Company | What it shows us |
|---|---|
| Playtomic | Tool first, marketplace second. Club software plus commission plus a player service fee [S1] [S2]; about $25M revenue [S3]. Commission is a source of club complaints [S1]. |
| Airbnb | Two-sided fees can be moved between sides. Airbnb moved from a 3% host plus ~14% guest split to one ~15.5% host fee [S4]. |
| Arrival | A travel brand that sells its own curated small-group trips, marketed through the founders' own audience [S5]. The founders started it because one of them was always the friend organising trips [S5]. It shows distribution beats tooling in group travel. |
| Bookinglayer | Retreat and surf-camp operators pay a fixed monthly fee with no commission [S7], from about €260 a month [S6]. |
| Gather | Retreat booking for independent hosts, with a custom website, deposits and payment plans [S8]. Host-only; no guest group experience. |

## 5. Comparison scores

Scale 1 to 5. **5 is best for us on every column**: high willingness to pay, easy reach, low build effort, low cold-start risk, high fit, large long-term size. Totals are a guide, not a decision. eDreams conflict is shown separately and is not scored.

| Model | WTP | Reach | Build effort | Cold-start risk | Fit | Long-term size | Total | eDreams conflict |
|---|---|---|---|---|---|---|---|---|
| A Group trip planner | 1 | 3 | 5 | 4 | 5 | 3 | 21 | Low |
| B Curator guides | 2 | 2 | 1 | 2 | 2 | 2 | 11 | Low–Med |
| C1 Retreat host tool | 4 | 3 | 3 | 4 | 4 | 3 | 21 | Low |
| C2 Retreat marketplace | 4 | 2 | 1 | 1 | 2 | 5 | 15 | Medium |
| **D Team offsites and events** | **4** | **4** | **4** | **5** | **4** | **3** | **24** | **Low** |
| E Group payments | 3 | 3 | 2 | 4 | 4 | 4 | 20 | Low |
| F Booking commissions | 2 | 2 | 4 | 3 | 2 | 3 | 16 | **High** |
| G Clubs and communities | 2 | 3 | 3 | 4 | 2 | 3 | 17 | Low |
| H Operator client app (new) | 4 | 3 | 3 | 5 | 4 | 3 | 22 | Medium |
| I Celebration trip pass (new) | 3 | 3 | 4 | 4 | 5 | 3 | 22 | Low |

### One-line reasons

| Model | WTP | Reach | Build | Cold start | Fit | Size |
|---|---|---|---|---|---|---|
| A | Friend groups mostly use free tools; paid tiers sell little. | Viral inside groups, but a crowded consumer category. | Mostly built. | One group gets value alone. | It is the current product. | Many users, very low revenue per user. |
| B | Free travel content is everywhere. | Depends on finding creators with audiences. | Needs storefront, paid access, payouts, public pages. | Curators and buyers both needed. | Low reuse of the trip product. | Niche creator economy. |
| C1 | Hosts already pay monthly or per booking for tools. | Reachable on Instagram and directories, but one niche at a time. | Host layer plus guest forms and capacity. | One host brings their guests. | Guest side is our product today. | Hosts are many but small. |
| C2 | Hosts pay 10–15% for guests they would not find. | Must out-acquire Retreat Guru and BookRetreats. | Listings, discovery, reviews, payments. | Two-sided against strong incumbents. | Needs public pages, a principle change. | Biggest prize if it works. |
| D | Companies pay per event for event apps today. | Your network plus a live case study. | Mostly the shared core plus the four gathering features. | One company is one customer. | Same trip object, roles added. | Crowded event-app category; offsites are a niche. |
| E | Organisers accept fees; friends avoid them. | Only as an add-on to another model. | Payments, KYC, refunds, payouts. | Rides on existing groups. | Extends expenses and settle-up. | Scales with money moved. |
| F | Partners pay, but only at volume. | Needs traffic we do not have. | Links are simple. | Tiny revenue until volume. | Pulls AI towards selling. | Real at scale, not for us now. |
| G | Free club tools dominate; fees on dues only. | Local clubs are reachable. | Recurring events and memberships are new objects. | One club brings its members. | Clubs are recurring, not trip-shaped. | Large number of small groups. |
| H | Advisors and operators pay per seat today. | B2B outreach to small operators. | Host layer plus light branding. | One operator is one customer. | Same host-plus-guests pattern. | Many small operators; Travefy is entrenched. |
| I | High stakes and spend, but no proven fee benchmark. | Seasonal, word of mouth. | Core plus optional payments. | One group gets value alone. | Best match to today's product. | Niche, seasonal. |

## 6. Shared features vs models

✓ = needed. Count = number of models (out of 10) that need it. **Bold** = needed by 3 or more models, so it belongs in the shared core or a shared layer.

| Feature | A | B | C1 | C2 | D | E | F | G | H | I | Count |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **SSO / one-tap join** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 10 |
| **Analytics events** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 10 |
| **AI output as reviewable draft** | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | 9 |
| **Real-time polls and comments** | ✓ | | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ | 7 |
| **Announcements with mute** | ✓ | | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ | 7 |
| **Activity feed** | ✓ | | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ | 7 |
| **Collect payments (pay-in)** | opt | ✓ | opt | ✓ | opt | ✓ | | ✓ | opt | ✓ | 5 + 4 optional |
| **Roles: owner, co-host, guest** | | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ | 7 |
| **Public share page** | | ✓ | | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | 7 |
| **Host workspace (many trips or events)** | | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ | | 6 |
| **AI import of a host's plan** | | | ✓ | ✓ | ✓ | | | ✓ | ✓ | | 5 |
| **Payouts to a host or organiser** | | ✓ | | ✓ | | ✓ | | ✓ | ✓ | | 5 |
| **RSVP, capacity, check-in** | | | ✓ | ✓ | ✓ | | | ✓ | ✓ | | 5 |
| **Guest forms (dietary, contacts, waivers)** | | | ✓ | ✓ | ✓ | | | ✓ | ✓ | | 5 |
| **Light onboarding with interests** | | ✓ | | ✓ | ✓ | | | ✓ | | | 4 |
| **Deposits and instalments** | | | ✓ | ✓ | | ✓ | | | ✓ | ✓ | 5 |
| **Branding / white label** | | | ✓ | | ✓ | | | ✓ | ✓ | | 4 |
| **Discovery and search by interest** | | ✓ | | ✓ | | | | ✓ | | | 3 |
| **Partner or affiliate links** | | ✓ | | | | | ✓ | | | ✓ | 3 |
| Reviews | | ✓ | | ✓ | | | | | | | 2 |
| Storefront and paid content | | ✓ | | | | | | | | | 1 |
| Recurring events and memberships | | | | | | | | ✓ | | | 1 |

**What this says.** The top six rows (SSO, analytics, AI as draft, real-time gaps, announcements, activity feed) serve almost every model. They are exactly the gathering scope plus the activity feed. Roles, host workspace, AI import, RSVP and guest forms form a **host layer** used by C1, C2, D, G and H. Payments are the next most shared layer. Discovery, reviews, storefront and recurring memberships serve only B, C2 and G.

## 7. Phased plan (proposal)

Thresholds below are proposals. **TBD: you set the final numbers.**

### Phase 0: eDreams gathering (now to 27 Nov 2026)

| Item | Detail |
|---|---|
| Validates | **D**: the host-and-guest pattern on a real company event. Also the shared core every model needs. |
| Precondition | D5 done in writing before any invite goes out: side-project and internal-testing policy, and no OTA overlap. |
| Scope | The working doc's four features (D2, yours to confirm): AI agenda import as a draft, easy join with SSO and roles, real-time gaps and announcements, analytics events. |
| Revenue | None. Free pilot. |
| Measure | Join rate, day 1 and day 2 active, actions per attendee, "very disappointed" survey, organiser interviews. |
| Gate to Phase 1 | Proposed: 60%+ of invitees join; 40%+ active on day 2; 30%+ "very disappointed"; at least 2 organisers would use it again; at least 1 intro to another event organiser. |

### Phase 1: paid D pilots (Dec 2026 to Feb 2027)

| Item | Detail |
|---|---|
| Validates | **D** willingness to pay outside eDreams. Discovery only for **C1** and **H**, to pick the Phase 2 segment. |
| Build | Host workspace, co-hosts, RSVP and capacity, guest forms, activity feed, a simple invoice (no in-app payments). |
| Sell | 3 to 5 paid events at one test price (options in section 8). |
| Parallel discovery | 10 retreat-host interviews (C1) and 10 small-operator interviews (H). Ask about the last retreat or departure they ran, tools used and cost. |
| Gate to Phase 2 | Proposed: 3+ paid events from 3+ companies; 1+ repeat booking or yearly-plan intent; Phase 0 activation held; your setup time under 2 hours per event. |

### Phase 2: second segment and the money layer (Mar to Jun 2027)

| Item | Detail |
|---|---|
| Validates | **C1 or H** (whichever won Phase 1 discovery) as the second paying segment, and **E** with hosts who collect money in advance. |
| Build | Payments: collect deposits and shares, payouts, refunds (Stripe Connect or similar, engineering to advise). Light branding for hosts. Yearly plan for D. |
| Not yet | Public listings, discovery, reviews, storefront (B, C2, G). F stays parked. |
| Gate to a marketplace (Phase 3) | Proposed: 20+ paying hosts or companies; 30%+ repeat within 6 months; guests asking to find other retreats or events; fee revenue from E covers its own costs. |

## 8. Recommendation and trade-offs

**Recommendation: D as the lead model (D3), with the host layer built so that C1 or H can follow, A free as the core, and E added in Phase 2.**

Why:

- D scores highest and is the only model the gathering tests directly.
- It is one-sided, so the first 20 customers are a sales problem, not a marketplace problem.
- It needs no payments and no public pages, so it keeps "privacy first" intact.
- Its build is mostly the shared core, so the work is not wasted if D fails.
- Low eDreams conflict, as long as we never sell travel.

Trade-offs:

| You gain | You give up |
|---|---|
| Fastest route to first revenue (weeks, not months). | Smaller long-term size than a marketplace (C2). |
| B2B prices (hundreds per event), not €3 per friend. | B2B sales take your time; this is a side project. |
| Low build risk. | Event apps are a crowded category (Whova, LineUpr, Luma). Our edge must be the real-time group experience and AI import, not the agenda. |
| Clean story for the eDreams check. | Using colleagues as first users is sensitive. If eDreams says no, Phase 0 needs another first event. |

Alternatives if you prefer:

- **C1 first.** Better long-term path to a marketplace and a niche you may care about more. Slower: no live test this month, and you must find hosts.
- **I first.** Best fit to today's product and almost no new build. Weaker evidence that organisers pay a fee rather than commissions.

**D pricing options to test (yours to choose):**

| Option | Example | Pros | Cons |
|---|---|---|---|
| Flat per event by size | €249 up to 50 people, €499 up to 150 | Simple to sell and invoice | Leaves money on big events |
| Per attendee with a minimum | €5 per attendee, €150 minimum | Matches how event apps quote [S17] | Harder to budget before the guest list is final |
| Yearly plan | €1,500 a year, unlimited events | Matches companies with several offsites; recurring | Hard to sell before trust exists |

Recommendation: start with **flat per event** for the first 3 to 5 pilots, then offer a yearly plan to any company that books twice.

## 9. Three riskiest assumptions and cheap tests

| # | Assumption | Why it is risky | Cheap test | Pass signal (proposed) |
|---|---|---|---|---|
| 1 | Companies will pay for a group app for offsites instead of WhatsApp plus a shared doc. | Free workarounds are good enough for many teams. | After the gathering, pitch 10 organisers outside eDreams with the case study and one price. Ask for a deposit or a signed pilot. | 3 of 10 commit with money or a signed order. |
| 2 | Attendees will join and use a separate web app during an event. | Without attendee use there is nothing for the organiser to pay for. | The 20 Nov dry run with 3 to 5 people, then the gathering itself. | Phase 0 gate numbers (60% join, 40% day 2 active). |
| 3 | Retreat hosts or operators value the live guest experience enough to pay, on top of their booking tool. | They already pay Bookinglayer, Retreat Guru or WeTravel for bookings and payments. | 10 interviews per segment, then a concierge pilot on one real retreat or departure with a pre-sell for the next one. | 2+ hosts or operators pre-pay for their next retreat or departure. |

Not an assumption but a blocker: **the eDreams policy check (D5)**. Spanish law allows a second activity except where it is unfair competition with the employer or where a paid full-dedication pact exists (art. 21.1 Estatuto de los Trabajadores) [S28]. Unfair competition can be grounds for dismissal [S28]. Check your contract and the company code of conduct, and get written approval for the internal test. I am not a lawyer; this is not legal advice.

## 10. Decisions for you

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Confirm gathering date, size, organisers, who invites | – | Needed this week; it sets the Phase 0 timeline. |
| D2 | Gathering scope | The four features in section 7, or fewer | Keep the four. |
| D3 | Lead revenue model after the gathering | D, C1, I, or A only | **D**, with C1 or H as the Phase 2 candidate. |
| D5 | eDreams policy check | Ask manager and HR/legal now, or after the gathering | **Now, in writing**, before invites. It blocks Phase 0. |
| D7 (new) | Phase 0 and Phase 1 gate thresholds | Use the proposals in section 7, or set your own | Use the proposals, adjust after the dry run. |
| D8 (new) | D test price | Flat per event, per attendee, yearly | Flat per event for the first pilots. |
| D9 (new) | Park F (booking commissions) | Park, or test after the eDreams check | **Park** until D5 is answered. |
| D10 (new) | Phase 2 candidate to research in Phase 1 | C1, H, both | Both, through interviews only. H needs its own conflict check. |
| D11 (new) | Payments approach for Phase 2 | In-app (Stripe Connect or similar) or link out to the host's own tool | Link out in Phase 1, in-app in Phase 2. Engineering to advise. |

## Sources

- [S1] Book & Go, *Playtomic comparison* (competitor's view): https://www.bookandgo.app/de/playtomic-alternative and https://bookandgo.app/en/compare/playtomic
- [S2] Playtomic Help, *Service Fee*: https://playerhelp.playtomic.com/hc/en-gb/articles/19831779272337-Service-Fee
- [S3] Multiples, *Playtomic*: https://multiples.vc/private-comps/playtomic
- [S4] Hostaway, *Airbnb fee calculator and split-fee change*: https://www.hostaway.com/tools/airbnb-fee-calculator/ and https://www.hostaway.com/glossary/split-fee/
- [S5] KarryOn, *The Inspired Unemployed launches ARRIVAL*: https://karryon.com.au/?p=3121406
- [S6] European Purpose, *Bookinglayer review*: https://europeanpurpose.com/tool/bookinglayer
- [S7] Bookinglayer: https://bookinglayer.com/ and PricingSaaS: https://pricingsaas.com/companies/bookinglayer
- [S8] Gather: pricing from our earlier benchmark in `docs/product/discovery-amf-pmf.md` (https://try-gather.co/, not reachable from this session); GetApp profile: https://www.getapp.com/all-software/a/gather-8/
- [S9] TrustRadius, *Retreat Guru pricing*: https://tr-web.dev.trustradius.com/compare-products/retreat-guru
- [S10] Retreat Guru, *Marketplace commissions*: https://help.retreat.guru/knowledge/commissions-and-payments and https://retreat.guru/signup
- [S11] BookRetreats, *How fees work*: https://bookretreats.com/help/en/articles/2501284-how-do-fees-work-on-bookretreats-com and *Off-platform policy*: https://bookretreats.com/help/off-platform-communication-booking-policy
- [S12] TrekkSoft, *WeTravel pricing guide*: https://www.trekksoft.com/en/blog/wetravel-pricing-guide-what-to-know-before-you-buy ; WeTravel Academy: https://academy.wetravel.com/wetravels-payment-platform-pricing ; WeTravel help: https://help.wetravel.com/accepting-payments/collecting-payments/can-i-absorb-the-credit-card-fees-myself
- [S13] TrovaTrip: https://trovatrip.com/v2024/home
- [S14] Wanderlog Pro (competitor reviews): https://monkeytravel.app/blog/wanderlog-alternative-2026 and https://www.pilotplans.com/compare/wanderlog-alternative-feature-comparison
- [S15] Splitwise, App Store (US and NL reviews): https://apps.apple.com/us/app/splitwise/id458023433 and https://apps.apple.com/nl/app/splitwise/id458023433?l=en-GB
- [S16] TechCrunch, *Bunq to acquire Tricount*: https://techcrunch.com/2022/05/03/bunq-to-acquire-group-expenses-app-tricount
- [S17] Event app pricing: Eventtia on Whova https://www.eventtia.com/platform-comparison/whova/ ; Event Vault https://event-vault.com/compare/whova/ ; LineUpr https://lineupr.com/en/blog/whova-event-app-pricing-review
- [S18] Luma pricing: https://luma.com/pricing and https://help.luma.com/p/luma-vs-eventbrite
- [S19] TeamOut, *Hosts*: https://teamout.com/host ; Extruct profile: https://www.extruct.ai/hub/teamout-com/
- [S20] Toolradar, *We Offsite*: https://toolradar.com/tools/we-offsite
- [S21] Heylo, *Platform and processing fees*: https://heylo.com/help/platform-and-processing-fees ; pricing: https://heylo.com/pricing ; https://wf.heylo.com/pricing
- [S22] Spond, *Payment costs*: https://help.spond.com/app/en/articles/118091-payments-costs-in-the-spond-app ; https://www.spond.com/news-and-blog/spond-club-vs-loveadmin/
- [S23] Thatch: Tubefilter https://www.tubefilter.com/?p=161380 ; Creator Economy Tools https://creatoreconomytools.com/tool/thatch ; Craft https://craft.co/thatch ; hotel commissions https://thatch.notion.site/Earn-Hotel-Commissions-A-Step-by-step-guide-63203b25e05748f49a7930063f6fcf08
- [S24] UpPromote, *GetYourGuide affiliate program* (with Viator and Booking.com comparison): https://uppromote.com/affiliate-directory/getyourguide/
- [S25] BACH: TechCrunch https://techcrunch.com/?p=2496656 ; Dealroom https://app.dealroom.co/companies/bachx ; Trazee https://trazeetravel.com/bach-app
- [S26] Travefy: https://travefy.com/pricing ; https://agentstudio.travefy.com ; SaaS CRM Review https://saascrmreview.com/?p=17461
- [S27] eDreams ODIGEO, Business Wire: https://secure.businesswire.com/news/home/20260428416894/en/eDreams-ODIGEO-Exceeds-Subscriber-Growth-Target-by-5-and-Reaches-7.9-Million-Prime-Members and https://www.businesswire.com/news/home/20260514946880/en/
- [S28] Art. 21 Estatuto de los Trabajadores: https://www.ikelma.com/blog/pluriempleo-pluriactividad-guia and https://www.conceptosjuridicos.com/?p=169502
- [S29] IPS News, *Retreator launch*: https://ipsnews.net/business/?p=246614
