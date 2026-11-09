# Discovery Plan: Audience-Market Fit and Product-Market Fit

> **Status: draft for review.** Written 2026-11-09 from the product owner's raw notes. Items marked **TBD** are decisions for the product owner. Nothing here is approved scope yet.

## 1. Why this document exists

The notes widen Trip Planner from a group trip planner for friends into three possible businesses, with hosts, guests and paid content. Before we spec more features, we need to know which audience to serve first and what they will pay for.

| Term | Meaning here | Question it answers |
|---|---|---|
| **Audience-market fit (AMF)** | A specific, reachable audience has a painful, recurring problem and already spends money or time on workarounds. | Who exactly is this for, and can we reach them? |
| **Product-market fit (PMF)** | That audience uses our product, comes back, and pays at a price and cadence that works. | Does our product solve it well enough to pay for? |

We test AMF first. PMF work on the wrong audience is wasted.

## 2. Starting point: what is built today

- A real-time group trip planner: trips, members and invitations, itinerary with AI generation, polls, expenses with settle-up, comments, live location, covers, push notifications. See [features.md](../features.md).
- Roles are per trip: organizer and member. One account can be organizer of one trip and member of another.
- Login is email and password with JWT. There is no SSO.
- No payments, no public pages. Every trip is private to its members.
- Current strategy lists booking and payments as out of scope. See [strategy.md](strategy.md).

## 3. The three revenue avenues (hypotheses)

| | A. Group trip planner | B. Curator guides | C. Retreat marketplace |
|---|---|---|---|
| **Idea** | Groups plan a trip together. Closest to what is built. | Curators (food, adventure, wellness) create and sell city or country guides. Builds on Casa Catz. | Hosts create retreats and invite guests. Guests can also browse and book other retreats by interest. Wellness niche first. |
| **Who pays** | Organizer or the group | Guide buyer; platform takes a cut from the curator | Host (software fee and/or commission) and/or guest (service fee) |
| **What they pay for** | Less chaos planning one trip | A trusted, ready plan for a place | Filling a retreat and running it without admin |
| **Likely cadence** | Per trip, a few times a year. A subscription is a weak fit. | One-off per guide | Per retreat or per booking. Hosts may accept a yearly plan. |
| **Reuse of current product** | High | Low: needs public content, storefront, payments | Medium: trip, itinerary, members and real-time are the guest experience. Needs listings, discovery, payments. |
| **Main risk** | Friend groups rarely pay; crowded category | Content business, not a tool; overlaps Casa Catz | Two-sided cold start; payments and trust |

## 4. Users and roles

The notes describe two sides plus a curator role.

| Side | Role | What they do |
|---|---|---|
| Host | Account owner | Owns the host account, billing, retreats or guides |
| Host | Co-owner / collaborator | Helps run retreats; no billing rights |
| Guest | Guest | Joins a trip or retreat, contributes, pays (in C) |
| Curator (B) | Curator | Creates and sells guides |

**Dual roles.** A person can host one retreat and be a guest on another. Two reference patterns, to confirm in the benchmark:

- **One account, switch modes** (Airbnb: travelling and hosting in the same app).
- **Separate apps** (Uber: rider app and driver app).

Today's per-trip roles already behave like the first pattern. **Recommendation:** one account, role decided per trip, plus a host workspace that appears only when someone has a host plan. Separate apps only if host tools grow large. **TBD:** owner decision once the revenue model is chosen, because billing decides who the "account owner" is.

## 5. Business model reference points

Charge for the job, at the cadence of the job. A retreat host pays per retreat or per booking more willingly than monthly. A friend group pays per trip, if at all.

| Company | Model | Who pays | Cadence |
|---|---|---|---|
| Playtomic | Marketplace plus club software: commission on bookings, club subscription, player service fee | Clubs and players | Per booking plus monthly |
| Gather | Retreat booking software for hosts: £699 a year plus 2% per booking | Host | Yearly plus per booking |
| Bookinglayer | Booking and operations software for retreats and surf camps: fixed monthly fee, no commission | Operator | Monthly |
| Arrival | Sells its own curated group trips per person. Not a marketplace. | Traveller | Per trip |
| Airbnb | Two-sided marketplace with host and guest fees. **To research** for current fee split. | Host and guest | Per booking |

Takeaways for us:

- Retreat hosts already pay for software. That is a signal of willingness to pay in avenue C.
- Gather and Bookinglayer sell host tools only. Neither shows a guest-side group experience. That gap is where our real-time trip product fits.
- Playtomic shows the path: a tool clubs need, then a marketplace on top. Clubs complain about commission, so pricing is a lever and a risk.

## 6. Feature ideas from the notes

These are backlog candidates, not specs. Each depends on the avenue chosen.

| Idea | Needed for | Notes |
|---|---|---|
| SSO (Google, Apple) | All | Lowers signup friction. Docs say Firebase Auth but code uses JWT; engineering to advise. |
| Easy onboarding, then ask for interests (yoga, surf, food) | B, C | Interests only matter where there is discovery. Low value for A alone. |
| Host AI import: drop a markdown or file with schedule and ideas, AI builds the retreat, host reviews | C | Fits principle 4 if the output is an editable draft the host confirms. Today's AI itinerary writes straight to the trip; fix that pattern first. |
| Host and guest roles, co-owners | C (and B) | See section 4. |
| Dual-role accounts | C | See section 4. |

## 7. Conflicts with current strategy and principles

| Item | Conflict | Needed decision |
|---|---|---|
| Payments | Resolved 2026-11-09: payments and booking are back in scope. | **TBD:** take payments in-app, or link out to the host's own system at first? |
| Privacy first | "Only active members can see a trip." A marketplace needs public listings. | **TBD:** split a public listing page from the private trip space, and amend the principle. |
| Target users | Strategy names organizer and member, segment TBD. The notes add hosts, guests and curators. | Update strategy once the lead avenue is chosen. |
| Native app | Out of scope. Fine for discovery; revisit at PMF. | None now. |

## 8. Process change: benchmark and wireframe before spec

From the notes: every new feature starts with benchmarking and lo-fi wireframes, then the spec. Spec 001 already followed ideation, wireframe, build.

Proposed flow for each feature:

1. Benchmark: 3 to 5 comparable products, with screenshots and notes.
2. Lo-fi wireframes (Lucid or similar) with the key flows.
3. Spec in `docs/specs/`, linking both.
4. Handoff to engineering.

**TBD:** confirm, then add it to "How to write a spec" in [docs/README.md](../README.md).

## 9. Next steps

### Step 0: decisions (owner)

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Which avenue leads discovery? | A, B or C | **C, host side first.** Hosts already pay for tools, the niche is narrow and reachable, and the built product covers the guest experience. Run it as a private tool for one host's retreat before building any marketplace. Keep A as the free core. Keep B with Casa Catz until C shows signal. |
| D2 | Which niche inside C? | Yoga, surf, wellness, other | **TBD.** Pick one where you can reach 15 hosts quickly. |
| D3 | Payer and cadence to test first | Host per retreat, host yearly, guest fee | Test host per retreat first; it matches the job. |
| D4 | Adopt the benchmark and wireframe step? | Yes / no | Yes. |

### Step 1: audience-market fit (about 3 to 4 weeks)

1. **Write audience hypotheses.** For each: who, the problem, how often, what they use and pay today, where to reach them.
2. **Benchmark** the five companies above plus 2 or 3 direct retreat tools. Focus on pricing, who pays and onboarding.
3. **Interview 10 to 15 people per audience.** Ask about the last retreat or trip they ran, not opinions about our idea. Capture current tools, cost and pain.
4. **Test reach.** Find two channels that produce conversations cheaply (Instagram, host communities, retreat directories).
5. **Decide** using exit criteria. **TBD:** set thresholds. A starting proposal: most interviewees describe the problem without prompting, at least a third pay for a workaround today, and one channel works.

### Step 2: product-market fit (after AMF)

1. **Concierge pilot.** 3 to 5 hosts run a real retreat in the app. We help with setup by hand, including the AI import as a manual step.
2. **Pre-sell.** Ask each pilot host to pay for the next retreat at the price under test.
3. **Measure:** guest activation per retreat, host repeat use, and the "very disappointed" survey (share of users who would be very disappointed without the product).
4. **Decide** whether to build listings, discovery and payments. **TBD:** set PMF thresholds.

### What not to build yet

Marketplace discovery, public listings, payments, curator storefront and native apps. Each waits for a passed AMF or PMF gate.

## Sources

- [Arrival](https://arrival.com.au/)
- [Bookinglayer](https://www.bookinglayer.com/)
- [Gather](https://try-gather.co/)
- [Playtomic revenue and model (Multiples)](https://multiples.vc/private-comps/playtomic)
- [Playtomic pricing as described by a competitor (Book & Go)](https://bookandgo.app/pt/compare/playtomic)
