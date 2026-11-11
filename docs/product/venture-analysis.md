# Venture Analysis: Which Opportunity to Build Next

> **Point-in-time analysis.** Written 2026-11-10. **Revised the same day** after the product owner's call (D33): premium hosts lead; offsites stay as a reference and benchmark. It builds on the [revenue models analysis](revenue-models-analysis.md) (2026-11-09), the [premium buyer lens](premium-buyer-lens.md), [destination weddings](destination-weddings.md) and the [early testers](early-testers.md) register. Apart from D33, nothing here is decided. Decisions are in §14 and tracked in the [working doc](working-doc.md). Like a spec, this file is not rewritten: a later analysis gets a new file.
>
> Source numbers in square brackets: [V1] etc. are listed at the end; [S1] etc. are in the revenue models analysis; [W1] etc. in destination weddings.

## 1. Summary

**Decision (D33, 2026-11-10): premium hosts lead.** Premium retreats, workshops and expeditions: small-group operators and retreat hosts (C1/H), with payments (E) next. Offsites (D) stay as a reference and benchmark. We will not become an offsite booking or procurement platform like Naboo.

- **Why premium hosts.** They have the best venture score (78/100), the best unit economics (lifetime value about 12× acquisition cost, payback about 4 months, both hypotheses) and real switching costs once their forms, schedule and money live in the app. They are also our industry: leisure travel, not corporate events.
- **What offsites still give us.** The 24–25 Nov pilot is the first live run of the host layer every segment needs. Offsites scored highest on speed (79/100 owner-operator), so we keep them as a benchmark: pilot metrics are the bar hosts must meet, and inbound offsite requests are welcome, but we don't sell into offsites.
- **The trade-off we accept.** Hosts need more build before they pay (payments and a public sign-up page). Revenue may come a few weeks later than with offsites. The host layer is shared, so little work is lost.
- **Weddings and celebration trips are discovery, not build.** Test with interviews and the April 2027 trip; build nothing specific before the February gate.
- **Friends and family stay free.** It is the acquisition loop: every traveller of every host is a future organiser.
- **Curators, the retreat marketplace and clubs are later.** The marketplace (C2) is the long-term option once we hold enough hosts.
- **What to build next:** finish the pilot, then the **host layer v1** (guest details, templates, all departures in one place, optional activities), a way to charge hosts, and a payments spike. Payments and a public departure page follow after the February gate. Epic briefs with user stories are in [epic-briefs.md](epic-briefs.md).

## 2. Method

| Step | What we did | Why |
|---|---|---|
| Size bottom-up | Count payers × events or departures × price. Top-down market reports are shown for context only. | Top-down numbers (for example "$894B wellness tourism") say nothing about what we can sell. |
| Reachability before size | A segment we can't reach in the next 6 months scores low, however large. | Two people, part-time. Distribution decides more than market size. |
| Two lenses | **Owner-operator:** cash and learning in 18 months. **Venture:** can this be a large, defensible company? | They give different answers. Showing both makes the trade-off visible. |
| Frameworks | Hormozi's starving crowd (via the premium buyer lens), *Crossing the Chasm* beachhead and "bowling pin" sequence, unit economics (LTV/CAC, payback), Hamilton Helmer's *7 Powers*, "why now". | Standard venture questions, kept short. |

**Caveats.** Prices are hypotheses (TBD). Scores are judgement. Where only US dollar sources exist, we treat $1 ≈ €1 for rough sizing. Assumptions are marked **(A)**.

## 3. What we have vs what each opportunity needs

✓ built · ◐ in spec 002 (pilot, building now) · ✗ missing. Source: [features.md](../features.md) and spec 002.

| Capability | Today | D Offsites | O Operators and retreat hosts | W Wedding planners | I Celebration trips | A Friends |
|---|---|---|---|---|---|---|
| Trip core: itinerary, polls, expenses, settle-up suggestions, live location, AI Q&A, 3 languages, IA (spec 004) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Organizations and host roles | ◐ | needed | needed | needed | — | — |
| Google sign-in, invite link with approval | ◐ | needed | needed | needed | helps | helps |
| AI import of a plan as a draft | ◐ | needed | needed | needed | — | helps |
| Announcements, notification settings | ◐ | needed | needed | needed | helps | — |
| Analytics | ◐ | needed (proof for buyer) | needed | needed | — | — |
| RSVP, capacity, guest forms | ✗ | needed | needed | needed | — | — |
| Event audiences (who sees which item) | ✗ | breakouts | optional activities | **needed** | — | — |
| Templates (reuse a past event or departure) | ✗ | helps | **needed** (repeat departures) | **needed** | — | — |
| Payments: deposits, instalments, payouts | ✗ | — | **needed** | helps | helps | — |
| Public page with sign-up | ✗ | — | **needed** (replaces Google Forms) | — | — | — |
| Guest groups and households | ✗ | — | — | **needed** | — | — |
| Sub-trips | ✗ | — | — | helps | **needed** | helps |
| Offline schedule | ✗ | — | helps (expeditions) | — | — | helps |
| **Missing after spec 002** | | **1–2** | **4–5** | **5** | **1–2** | **0** |

**Read:** D is closest. Operators need the most important missing piece (payments), but most of their list is shared with D, so building the host layer for D also moves operators forward.

## 4. Opportunity map

| Segment | Payer | Job they hire us for | Models | Evidence today |
|---|---|---|---|---|
| **D Offsites and company events** | People, Ops or event lead | One place attendees actually use; less chasing; proof it worked | D | Pilot 24–25 Nov (T6). No paid customer yet. |
| **O Premium operators and retreat hosts** | Operator or host, from trip revenue | Run a departure without Sheets plus WhatsApp; collect deposits; look premium | C1, H, E, later C2 | Three warm testers (T1–T3) with public evidence of the pain (Sheets, WhatsApp, instalments [T1 in early-testers]). No interviews yet. |
| **W Destination-wedding planners** | Planner, billed to the couple | Guest logistics around the wedding: who goes to which event, arrivals, free days | I (planner variant) | Use cases only. Planners still to recruit. The US alone has about 21,700 planner businesses, most with one or two people [V8]. |
| **I Celebration trips** (bachelor, hen, milestone) | Organiser or group | Less stress organising an expensive trip for friends | I, A | Product owner's own trip, April 2027 (T5). Guests spend about $1,300–1,500 each on these trips [V18]. |
| **A Friends and family** | Nobody | Plan together | A | The current product. Wanderlog shows the ceiling of a free planner: 1M+ users with a team of 1–10 [V17]. |
| **B Curators and guides** | Guide buyer | Ready-made plans | B | T4 and Casa Catz idea. |
| **C2 Retreat marketplace** | Host commission | Fill the retreat | C2 | None. Incumbents strong [S10][S11]. |
| **G Clubs** | Club | Recurring trips and dues | G | None. |

## 5. Market size

### 5.1 Bottom-up TAM, SAM, SOM

TAM: everyone who could buy this product type. SAM: those we can serve and reach with our languages, network and product in 2–3 years. SOM: what we could plausibly win by **end of 2029** (about 3 years). Figures are yearly revenue to us, not the size of the travel spend.

| Segment | TAM | SAM | SOM (≈3 years) |
|---|---|---|---|
| **D Offsites** | **€207M.** 246,000 EU companies with 50–249 staff [V1] × 70% hold an offsite yearly [V4] × 2 events (A) × €600 per event (A) | **€15.8M.** Spain: 18,800 such companies [V2], same ratios | **€180k.** 150 companies × €1,200 a year (A) |
| **O Operators and retreat hosts** | **€53M software only.** (23,750 small-group operators [V11] + 20,000 retreat hosts [V14]) × €1,200 a year (A). **≈€470M with payments:** 1% of the $46.8B small-group operator market [V11] | **€17.5M.** 10% of both groups speak Spanish or Portuguese or sit in our network (A): 4,375 × (€1,200 software + €2,800 payment fees (A)) | **€312k.** 120 hosts on software (€144k) + 60 of them collecting payments (€168k) (A) |
| **W Wedding planners** | **€109M (US only).** 2.13M US weddings in 2024 [V6] × 17% destination [V7] = 362,000 × €300 per wedding (A) | **€10M.** Southern Europe and Costa Rica ≈ 2 × Italy's 16,700 foreign weddings [V9] (A) × €300 | **€96k.** 40 planners × 8 weddings × €300 (A) |
| **I Celebration trips** | **€137M.** 3.9M US and EU weddings [V6][V10] × 2 parties × 60% travel (A) × €29 pass (A) | **€6.8M.** 5% we can reach in our languages and channels (A) | **€87k.** 3,000 passes a year (A) |
| **A Friends** | Group trip-planning apps: about $248M in 2024 [V16] | — | €0 direct. Value is acquisition. |
| **C2 Marketplace** | Very large: wellness tourism alone was $894B in 2024 [V15]; at 15% commission [S11] any small share is large | Not reachable before we hold hosts | €0 before 2028 |

**What this says.** No segment gives a large SOM in three years: €100–300k a year each. That is normal for a beachhead. The difference is in the ceiling: operators with payments, and later the marketplace, are the only paths where revenue grows with the money our customers move, not just with seats.

### 5.2 What it takes to reach €10M a year

A rough test of venture scale: how much of each market we would need.

| Segment | Customers needed | Share of TAM | Read |
|---|---|---|---|
| D at €1,200 a year | 8,300 companies | 4.8% of EU offsite holders | Hard: crowded, and offsite budgets go to bundled planners |
| D at €6,000 a year (done with you) | 1,700 companies | 1.0% | More plausible, but it is a service business at that price |
| O at €4,000 a year (software + payments) | 2,500 hosts | 5.7% | Plausible, and payments grow with each host's revenue |
| W at €300 per wedding | 33,000 weddings a year | 9.2% of US destination weddings | Hard, and destination weddings are shrinking [V7] |
| I at €29 per trip | 345,000 passes a year | 7.3% | Hard: consumer acquisition, seasonal |

## 6. Unit economics (hypotheses)

All inputs are assumptions **(A)** until Phase 1 data replaces them. CAC is founder-led sales time valued at about €60 an hour, plus small costs.

| Segment | Revenue per customer per year | Gross margin | Lifetime | LTV | CAC | LTV / CAC | Payback |
|---|---|---|---|---|---|---|---|
| D self-serve | €1,200 | 80% | 3 years | €2,880 | €600 | 4.8 | 7.5 months |
| D done with you | €6,000 | 50% (service hours) | 3 years | €9,000 | €1,200 | 7.5 | 4.8 months |
| O operators (software + payments) | €4,000 | 60% (blended) | 4 years | €9,600 | €800 | **12.0** | **4 months** |
| W planners | €2,400 | 80% | 3 years | €5,760 | €800 | 7.2 | 5 months |
| I celebration pass | €29 (one-off) | 90% | 1.2 trips | €31 | €25 (paid social) | 1.3 | 11.5 months |
| A friends | €0 | — | — | — | — | — | — |

Rules of thumb: LTV / CAC above 3 and payback under 12 months are healthy. I fails both unless it grows by word of mouth. O looks best because one host brings many guests every departure, and payments add revenue without more sales effort.

## 7. Defensibility and why now

### 7.1 Seven Powers (Helmer)

Only the powers that apply. ● strong, ◐ possible, ○ weak.

| Power | D | O | W | I / A | C2 |
|---|---|---|---|---|---|
| **Switching costs** (data, workflows, money in the app) | ○ events are one-off; the next one can use another tool | ● forms, guest history, templates and payments live with us | ◐ templates per planner | ○ | ◐ |
| **Network economies** | ○ | ◐ every guest sees the product; guests who travel again become a demand pool | ◐ | ◐ guest-to-organiser loop | ● two-sided if it works |
| **Counter-positioning** | ◐ attendee-first vs procurement-first (Naboo) | ● no commission on bookings, unlike marketplaces that take 10–15% [S10][S11] | ◐ | ○ | ○ |
| **Cornered resource** | ◐ the pilot company as a reference | ◐ warm network in Costa Rica and Spain | ◐ Costa Rica network | ○ | ○ |
| **Scale, brand, process** | ○ none yet | ○ | ○ | ○ | ◐ brand later |

### 7.2 Why now

- **Offsites are growing and funded.** One market estimate puts corporate retreats at $31.8B in 2024, reaching $73.7B by 2034 [V3]. Naboo's $70M Series B [V5] shows investor appetite, and also that the booking side is taken.
- **Small groups are the growth pocket in adventure travel.** ATTA reports rising demand for small, capped-capacity trips led by local operators [V13], with a median of 800 travellers per operator [V12]. Those operators run on Sheets, WhatsApp and generic tools (T2).
- **AI lowers setup cost.** Turning a host's PDF or spreadsheet into a live trip in minutes (spec 002 import) is newly cheap. Setup time is the main cost of serving many small hosts.
- **Retreat hosts are many and small.** BookRetreats alone lists 20,000+ hosts and 6,800+ retreats [V14].

## 8. Scorecard and the two lenses

Scores 1–5, 5 is best for us. **Evidence** = proof of pain and willingness to pay we hold today. **Build** = how close the product is (5 = closest).

| Segment | Evidence | Purchasing power | Reach | Build | Unit economics | Defensibility | Ceiling | Time to revenue | Why now | Owner-operator /100 | Venture /100 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **D Offsites** | 4 | 5 | 4 | 4 | 4 | 2 | 3 | 4 | 4 | **79** | 70 |
| **O Operators and retreat hosts** | 3 | 3 | 4 | 3 | 5 | 4 | 4 | 4 | 4 | 73 | **78** |
| C2 Marketplace | 1 | 4 | 1 | 1 | 3 | 5 | 5 | 1 | 3 | 40 | 66 |
| W Wedding planners | 2 | 4 | 3 | 2 | 4 | 3 | 3 | 3 | 3 | 57 | 62 |
| I Celebration trips | 2 | 3 | 2 | 4 | 2 | 1 | 2 | 3 | 3 | 53 | 42 |
| A Friends | 3 | 1 | 3 | 5 | 1 | 2 | 2 | 1 | 2 | 51 | 41 |
| G Clubs | 1 | 2 | 3 | 2 | 2 | 3 | 3 | 2 | 2 | 42 | 48 |
| B Curators | 1 | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 2 | 30 | 36 |

Weights. Owner-operator: evidence 15, power 10, reach 15, build 20, unit economics 10, defensibility 5, ceiling 5, time to revenue 15, why now 5. Venture: evidence 10, power 10, reach 10, build 5, unit economics 15, defensibility 20, ceiling 20, time to revenue 5, why now 5.

**Read.** D wins on speed; O wins on what lasts. They need the same host layer. **Decision (D33): O leads.** D is kept as a benchmark because it is outside our industry of interest and its booking side is already held by funded players.

## 9. Ranking by horizon

The sequence is a "bowling pin" path: win one narrow segment, then move to the next one that reuses most of the product. After D33 the first pin is premium hosts.

| Horizon | Lead | Also running | Not yet | Gate to move on |
|---|---|---|---|---|
| **Short: now to end Feb 2027** | **O:** interviews with T1–T3 and 10 retreat or workshop hosts; one or two concierge departures; host layer v1; charge the first hosts | **D as benchmark:** run the 24–25 Nov pilot, record its metrics as the bar for hosts, accept inbound offsite requests. **W and I discovery:** 5 planner interviews; set up the April trip (T5) | Payments build, public pages, wedding features, any offsite sales push | **M0, 27 Nov:** pilot retro (working doc §5 thresholds). **M1, 26 Feb 2027:** at least 2 hosts paid or committed a departure with a deposit; 8 of 15 interviewed hosts describe the pain unprompted; setup under 2 hours per departure |
| **Mid: Mar 2027 to Apr 2028** | **O with payments (E):** deposits, instalments, public departure page | W only if M1 interviews pass. D only inbound, self-serve | Marketplace, guides | **M2, 30 Jun 2027:** 10+ paying hosts, first host collecting deposits in the app, second departure run without our help. **M3, Apr 2028:** venture decision (§14, D35) |
| **Long: from May 2028** | **Network:** travellers become organisers (A), then optional discovery of hosts' trips (C2-style) | Guides as content inside trips (B), clubs (G) if hosts ask | F booking commissions stays parked | Revenue analysis Phase 3 gate: travellers asking to find other trips; payment revenue covers its own cost |

**Most profitable, by horizon (our estimate):** short term little revenue from anyone; hosts' concierge departures are the first fees. Mid term hosts with payments, because fees grow with each host's revenue and need no extra sales. Long term the network and marketplace, if the host base gets large enough; otherwise a healthy niche software business.

## 10. Audience-market fit before product-market fit

Audience-market fit (AMF): a reachable group feels the pain and will talk to us. Product-market fit (PMF): they use it again and pay.

| Segment | AMF signal (by M1) | PMF signal (by M2) |
|---|---|---|
| D (benchmark) | Pilot thresholds met (working doc §5) | Not pursued; inbound only |
| **O (lead)** | 8 of 15 interviewed hosts describe the Sheets + WhatsApp pain without prompting; 2 commit a departure with a deposit | 10+ hosts on a paid plan; second departure run without our help; setup under 2 hours; 40% of hosts "very disappointed" without it |
| W | 2 of 5 planners describe guest-logistics pain unprompted; 1 agrees to a pilot wedding | One planner pays for a second wedding |
| I | The April 2027 group moves planning out of WhatsApp; 1 person asks to use it for their own trip | Not tested for payment (friends trip) |

## 11. Epics to build next

In order, after D33. Titles are outcomes (what changes for the host or traveller), not features. Full briefs with user stories, hypotheses and measures are in [epic-briefs.md](epic-briefs.md). Every new epic still goes benchmark → define → wireframes → spec → approval → build (D6).

| # | Epic (outcome) | Was called | Horizon | Models | Layer |
|---|---|---|---|---|---|
| 1 | Spec 002 pilot epics 1–7 (8–11 may be cut on 17 Nov) | — | Now | D, all | Core, Host |
| 2 | Spike: what the pilot teaches us about hosts | Pilot retro and D3 call | Now | D | — |
| 3 | Hosts have every traveller's details before departure | RSVP, capacity, check-in, guest forms | Now | C1, H | Host |
| 4 | Hosts start a new departure from a past one in minutes | Templates (new) | Now | C1, H | Host |
| 5 | Hosts run all their departures from one place | Organization home | Now | C1, H | Host |
| 6 | Travellers see only the activities they signed up for | Event audiences (new) | Now | C1, H, I | Host |
| 7 | We can charge a host for a departure | Billing v0 (new) | Now | C1, H | Money |
| 8 | Spike: decide how hosts take payments | Payments spike (new) | Now | E | Money |
| 9 | Hosts collect deposits and instalments without chasing anyone | Payments for hosts (new) | Next | E, C1, H | Money |
| 10 | Travellers sign up for a departure from a public page | Public share page, refocused | Next | C1, H | Public |
| 11 | Every departure looks like the host's own | Light branding (new) | Next | C1, H | Host |
| 12 | Travellers have the schedule without signal | Offline schedule (new) | Next | H | Core |
| — | Close the gaps in what's built (initiative 3) and CI | — | Now | all | Core |

Later and conditional, no brief yet: guest groups and households (W), sub-trips (I, W), guide import (B), discovery of hosts' trips (C2). They stay in the [spec backlog](spec-backlog.md).

## 12. Board change plan (GitHub)

The board convention is [tracker.md](../process/tracker.md). Engineering applies these changes and updates tracker.md in the same pull request. Initiative and epic titles follow the outcome rule in [epic-briefs.md](epic-briefs.md) §1.

### 12.1 Fields and milestones

| Change | Detail |
|---|---|
| Add project field **Horizon** | Single select: Now, Next, Later. Set on initiatives and epics. Roadmap and Backlog views can group by it. |
| Add milestones (repo) | **M0 Pilot retro** due 2026-11-27 · **M1 Phase 1 gate** due 2027-02-26 · **M2 Phase 2 gate** due 2027-06-30. Put each gate's criteria (§9) in the description. |
| Revenue Model field | Unchanged. Premium hosts are tagged C1 and H. |

### 12.2 Initiatives

| # | Initiative (outcome) | Change | Horizon | Key result |
|---|---|---|---|---|
| 1 | Run the hosted event pilot | Keep | Now | Spec 002 §11 signals collected |
| 2 | Learn from the pilot and keep offsites as a benchmark | **Rename and refocus** from "Prove the offsites model". Keep the retro spike. Move RSVP and Organization home to 6, the public share page to 8. Close after M0 | Now | Retro written; pilot metrics recorded as the host benchmark |
| 3 | What we have built works as documented | Rename from "Close the gaps"; add a CI task | Now | features.md matches the code |
| 4 | Travellers hear about delays before they matter | Rename from "Transport awareness" | Later | Unchanged |
| 5 | Give the product a structure | **Close:** spec 004 shipped | — | Done |
| 6 | **New:** Premium hosts run a repeat departure without our help | Epics 3–7 | Now | 2 hosts run a second departure with under 2 hours of setup |
| 7 | **New:** We know which premium hosts will pay, and for what | Discovery spikes (epic-briefs §3) | Now | Phase 2 scope chosen on evidence at M1 |
| 8 | **New:** Hosts collect guest money inside the trip | Epic 8 now; 9–12 after M1 | Next | First host collects deposits in the app by M2 |

Later items are not created as issues; they stay in the spec backlog.

### 12.3 Prompt for Claude Code

The current prompt is in [epic-briefs.md](epic-briefs.md) §5, because it also creates the epics from the briefs.

## 13. Risks and riskiest assumptions

| # | Assumption | Why it might be wrong | Cheapest test | By |
|---|---|---|---|---|
| R1 | Premium hosts pay before payments exist | They may only value the app once it collects money | Charge the first concierge departures a flat fee; see who pays | M1 |
| R2 | Operators will leave Sheets and WhatsApp | Guests already live in WhatsApp; switching a live departure is risky | Concierge one departure; count WhatsApp messages and operator hours before and after | M1 |
| R3 | We can run payments with a healthy margin | Card fees, KYC, refunds and package-travel rules can eat a 1% fee | Payments spike (epic 8) | M1 |
| R4 | Two part-time people can serve two segments | Done-with-you work becomes a second job (premium lens §6) | Track setup hours per event; cap at 5 done-with-you customers | Ongoing |
| R5 | eDreams conflict stays low | H touches travel distribution (revenue analysis §4 H) | Keep F parked; check before selling to travel advisors | Before H outreach |
| R6 | Venture scale exists | §5.2 needs 2,500 paying hosts; small hosts churn | Watch repeat rate and payment volume per host to M2 | M2 |

## 14. Decisions for you

New decision numbers start at D33. Note: the working doc's decision table already uses D29–D31 twice (spec 004 decisions and premium-lens proposals).

| # | Decision | Options | Status |
|---|---|---|---|
| D33 | Lead segment | Offsites / premium hosts / both | **Decided 2026-11-10:** premium hosts (premium retreats, workshops, expeditions: C1/H, with E next). Offsites stay as a reference and benchmark; no Naboo-style pivot. Also decides D3. |
| D34 | Apply the board changes in §12 | Yes / partly / no | Recommendation: **yes**. |
| D35 | Funding path | Bootstrap to M2, then decide / raise a pre-seed now / never raise | Recommendation: **bootstrap to M2, decide at M3 (Apr 2028).** Raise only if hosts show repeat use and payment volume. |
| D36 | Weddings | Build now / discovery only until M1 / drop | Recommendation: **discovery only until M1.** Epic 6 (optional activities) helps weddings anyway. |
| D37 | Prices to test with the first hosts | Flat fee per departure / monthly / % of departure revenue | **TBD by you.** Working default: a flat fee per concierge departure (about €150), then €100 a month self-serve; 5× for done with you (premium lens §5). |

## Sources

- [V1] Eurostat via EUbusiness, medium-sized enterprises in the EU (246,000, 0.8% of enterprises): https://www.eubusiness.com/sme/large-businesses-make-up-only-0-2-of-eu-enterprises
- [V2] Statista (European Commission data), SMEs in Spain by size, 2024 (over 18,800 medium firms): https://www.statista.com/statistics/880150/number-of-smes-in-spain/
- [V3] Allied Market Research, corporate retreats market 2025–2034: https://www.alliedmarketresearch.com/corporate-retreats-market-A325808
- [V4] Retreats and Venues, corporate retreat statistics (70%+ of mid-size to large companies hold a yearly retreat or offsite): https://retreatsandvenues.com/blog/corporate-retreat-statistics
- [V5] Naboo Series B: ShortTermRentalz https://shorttermrentalz.com/news/naboo-raises-70-million/ ; Naboo, 5,000+ client companies https://www.naboo.app/en-ca/about-us ; Multiples (valuation about $150M) https://multiples.vc/private-comps/naboo
- [V6] CDC/NCHS, provisional marriages 2000–2024 (2,128,446 in 2024): https://www.cdc.gov/nchs/data/dvs/marriage-divorce/national-marriage-divorce-rates-00-24.pdf
- [V7] The Knot 2026 Real Weddings Study, via Walnut (destination share 17% in 2025, 21% in 2019): https://walnutinvest.com/stats/wedding-cost-statistics ; The Knot, average wedding cost: https://www.theknot.com/content/average-wedding-cost
- [V8] IBISWorld, Wedding Planners in the US (21,714 businesses in 2025, 1.2 employees each): https://www.ibisworld.com/united-states/industry/wedding-planners/4412/
- [V9] Destination weddings in Italy, 2025 (16,700 foreign couples, €1.1bn): https://www.9colonne.it/593950/more-and-more-foreign-couples-choose-to-marry-in-italy-16-700-last-year ; average €67,000 per event: https://quifinanza.it/lifestyle/travel-economy/matrimoni-stranieri-italia-2025/959327/
- [V10] EU marriages about 1.8M in 2023 (secondary summary of Eurostat): https://onlinemftprograms.com/?p=2813
- [V11] Ken Research, small-group adventure tour operator market ($46.8B in 2025; 23,750 players): https://www.kenresearch.com/industry-reports/global-small-group-adventure-tour-operator-market.md
- [V12] ATTA, 2026 Adventure Travel Trends & Insights (median 800 travellers per operator): https://learn.adventuretravel.biz/research/2026-adventure-travel-trends-insights-state-of-the-adventure-travel-industry
- [V13] ATTA 2025 market sizing report, via Travel Daily News: https://www.traveldailynews.com/?p=432574
- [V14] BookRetreats, for hosts (20,000+ hosts, 6,800+ retreats): https://bookretreats.com/family
- [V15] Global Wellness Institute, Global Wellness Economy Monitor 2025 (wellness tourism $894B in 2024), via StyleSpeak: https://stylespeak.com/?p=48336
- [V16] Bosson Research, group travel planning apps market ($247.55M in 2024): https://www.marketresearch.com/Bosson-Research-v4252/Global-Group-Travel-Planning-Apps-40703527
- [V17] Wanderlog company profile (1M+ users, 1–10 employees): https://wfh.team/companies/wanderlog
- [V18] Joy, bachelor and bachelorette party costs (about $1,300–1,500 per guest in 2025): https://withjoy.com/blog/bachelor-vs-bachelorette-parties-hidden-costs-traditions-revealed-2025/
