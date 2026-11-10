# Premium Buyer Lens: Selling to People Who Can Pay

> **Point-in-time analysis.** Written 2026-11-10. Applies Alex Hormozi's advice on market choice and pricing to our revenue models ([revenue-models-analysis.md](revenue-models-analysis.md)). Nothing here is decided. Decisions are listed in §7 and tracked in the [working doc](working-doc.md). Source numbers in square brackets refer to the list at the end.

## 1. What Hormozi says

| Idea | In short |
|---|---|
| **Pick a starving crowd** | A good market has four traits: massive pain, purchasing power ("sell to rich people, don't sell to broke people"), easy to target, and growing [H1]. Market choice matters more than the offer, and the offer more than persuasion [H2]. |
| **Solve rich people's problems** | Solving problems for people with money lets you charge them accordingly; they pay better and are easier to work with [H3]. Wealthy buyers prioritise speed, less effort and status over low prices, and prefer turnkey solutions [H4]. |
| **Virtuous cycle of price** | Premium prices raise the buyer's commitment and results, and the margin funds better delivery [H5]. Cutting prices does the opposite [H6]. |
| **Price at the extremes** | He argues businesses do best with high-ticket or low-ticket offers, not the middle. Unscalable one-to-one premium offers often earn more early on than cheaper scaled ones [H7]. Premium tiers 5–10 times the base price make the difference clear [H8]. |
| **Cheap can look wrong** | Wealthy customers often read price as a quality signal and distrust services that seem too cheap [H9]. |

**Caveat.** His advice comes mostly from services, gyms and info products. Software has near-zero cost per extra customer, and our free tier is also our acquisition loop (working doc §4.3). We use the lens to choose **who pays and for what**, not to make everything expensive.

## 2. Our niches against the four traits

Scores are judgement, 1–5 (5 is best for us). Pain and purchasing power belong to **the payer**, not the guests.

| Niche (payer) | Pain | Purchasing power | Easy to target | Growing | Total | Notes |
|---|---|---|---|---|---|---|
| **D: company offsites** (People/Ops lead) | 3 | 5 | 4 | 3 | **15** | Offsites often cost $2,000–5,000 per person all-in (revenue analysis S20). Software is a rounding error. |
| **Destination-wedding planners** (B2B) | 4 | 4 | 4 | 2 | **14** | Repeat buyers: one planner runs many weddings a year. Market share of destination weddings is slipping [W3]. See [destination-weddings.md](destination-weddings.md). |
| **Premium group-trip operators** (C1/H: expeditions, photo workshops, community trips) | 4 | 3 | 4 | 3 | **14** | Their travellers pay thousands per trip. Three are in your network ([early-testers.md](early-testers.md)). |
| **Destination-wedding couples** | 4 | 4 | 2 | 2 | **12** | High budget, but one-off and hard to reach without planners. |
| **Wellness retreat hosts** (C1) | 3 | 3 | 3 | 3 | **12** | Already pay for booking tools (revenue analysis §4). |
| **Celebration trips** (I: stag, hen) | 3 | 3 | 2 | 2 | **10** | The organiser is stressed, but the money is split across friends. |
| **Curators** (B) | 2 | 2 | 3 | 3 | **10** | Guide buyers have low willingness to pay. |
| **Friends and family** (A) | 2 | 1 | 2 | 3 | **8** | Keep free: it's the acquisition loop. |

**What changes vs the revenue analysis:** D stays first. **Premium group-trip operators** and **destination-wedding planners** move up as Phase 2 candidates, because both have a payer with money, repeat business, and a reachable first group. Friend groups and curators stay at the bottom as payers.

## 3. What it changes in the revenue models

| Model | Who has the money | Premium offer (done with you) | Price anchor |
|---|---|---|---|
| D Offsites | The company | We import the agenda, set up the event, brief organisers, support on the day. Branded event space. | Under 1% of the event budget. A 50-person offsite at $2,000+ per head is $100,000+. |
| Weddings (planner) | Planner, billed to the couple | Branded guest space per wedding: per-event RSVPs, guest-specific schedules, pre- and post-wedding plans | Planner fees run from about $600–1,500 (Costa Rica coordination) to $5,000–15,000 (US full service) [W11][W12]. A per-wedding fee should sit well under the planner's fee. |
| C1/H Operators | Operator, from trip revenue | Set up each departure: forms, schedule, gear list, announcements, payments later | Under 1–2% of a departure's revenue (12 travellers × several thousand each). |
| I Celebration trips | Organiser or couple | One-off Trip Pass (working doc §4.3) | €19–39 (low-ticket end) |
| A Friends | Nobody, by design | — | Free |

## 4. What it changes in the product

**Build (what buyers with money value):**

| Value | Product response | Already planned? |
|---|---|---|
| **Speed and no effort** (turnkey) | AI import of the host's agenda or plan, templates, pre-made plans (Casa Catz guides imported as drafts) | Agenda import in spec 002; guides later |
| **Status** | A beautiful, branded event space; covers; custom name and colours | Covers shipped (spec 001); branding later |
| **Exclusivity and privacy** | Guests see only the events they're invited to; private sub-groups | Not yet: per-event visibility (see [destination-weddings.md](destination-weddings.md)) |
| **Certainty** | Works on the day (live updates, announcements, offline schedule); a measurable outcome | Live and announcements in spec 002; offline later |
| **A person to call** | A named contact during setup and on event days (premium tier) | Not a product feature; a service with a time cap |

**Don't build:** a cheaper wedding website (Joy is free [W7]), a feature war on price, or anything whose only purpose is to undercut a competitor.

**Outcome guarantee (Hormozi's risk reversal).** Our analytics can measure guest adoption, so a guarantee is possible: for example, *"If fewer than 60% of your guests join, the next event is free."* It uses the pilot threshold (working doc §5).

## 5. Pricing structure to test

Two ends, no middle:

| Tier | Who | What | Price (hypothesis, TBD) |
|---|---|---|---|
| **Free** | Friends, family, guests | Personal trips (working doc §4.3) | €0 |
| **Self-serve** | Organisations and Trip Pass | All host features, no help | Low: Trip Pass €19–39; Organisation per event or yearly (D8) |
| **Done with you** | Companies, planners, operators | Self-serve plus setup, import, brief, event-day support, guarantee | 5–10× the self-serve price |

## 6. Risks and counterpoints

| Risk | What to do |
|---|---|
| **The service trap.** Done-with-you can turn into a second job, which your goals doc puts on the "not now" list. | Treat it as paid discovery. Cap it: at most 5 customers and a fixed number of hours each. Turn whatever repeats into product. Stop if setup time per event doesn't fall. |
| **Small markets.** Premium niches are narrow. | Fine at this stage: we need 20 paying customers, not a mass market. |
| **Shrinking segment.** Destination weddings fell to 17% of US weddings in 2025, from 21% in 2019 [W3]. | Sell to planners (repeat volume), not only to couples. |
| **Brand mismatch.** Premium buyers expect premium design and tone. | Follow the brand foundations: calm, warm, competent. Hold the premium tier until the design is ready. |
| **Pricing guests out.** | Guests never pay us. The payer is the organiser. |
| **Accommodation commissions.** Resorts pay wedding travel advisors 10–21% on room blocks [W9]. | That is accommodation sales: the area flagged in the revenue analysis (model F). It's your call; this analysis does not depend on it. |

## 7. Decisions for you

| # | Decision | Options | Recommendation |
|---|---|---|---|
| P1 | Adopt "the organiser with the budget pays; guests never pay" as a pricing rule | Yes / no | **Yes.** It matches D, C1, H and planners, and keeps guests' experience free. |
| P2 | Add a done-with-you tier as paid discovery | Yes, capped / no | **Yes, capped:** 5 customers, fixed hours each, reviewed at Phase 1 end. |
| P3 | Phase 2 candidates | C1/H operators, wedding planners, both | **Both, interviews first.** Operators are in your network now; planners need recruiting in Costa Rica. |
| P4 | Test an outcome guarantee in Phase 1 | Yes / no | **Yes**, on one or two paid events, once pilot data shows a join rate we trust. |

## Sources

- [H1] Summary of *$100M Offers*, "picking markets": https://stmcculloch-website.pages.dev/docs/lessons-from-good-books/100m-offers
- [H2] Book review, r/Entrepreneur: https://lr.us.psf.lt/r/Entrepreneur/comments/14xh01v/book_review_100_million_offers_by_alex_hormozi
- [H3] *The Game*, Ep 852 "Sell to the Rich" (transcript excerpt): https://www.audioscrape.com/podcast/the-game-with-alex-hormozi/episode/throwback-billionaire-recession-advice-sell-to-the-rich--ep-852
- [H4] Shortform summary of Ep 852: https://shortform.com/podcast/episode/the-game-w-alex-hormozi-2025-03-14-episode-summary-throwback-billionaire-recession-advice-sell-to-the-rich-ep-852
- [H5] SuperSummary, *$100M Offers* ch. 5: https://www.supersummary.com/100m-offers/section-2-summary/
- [H6] Young and Profiting interview (E199): https://youngandprofiting.com/alex-hormozi-the-value-equation-how-to-make-offers-so-good-people-feel-stupid-saying-no-e199/
- [H7] Shortform summary of Ep 986 "The Downsell Math": https://www.shortform.com/podcast/episode/the-game-w-alex-hormozi-2026-07-09-episode-summary-the-downsell-math-and-how-to-build-an-offer-worth-10x-more-ep-986
- [H8] Shortform summary of Ep 949 "Rich People Buy Differently": https://www.shortform.com/podcast/episode/the-game-w-alex-hormozi-2026-03-03-episode-summary-rich-people-buy-differently-so-price-like-it-ep-949
- [H9] Shortform summary of Ep 996 "High Ticket Offers": https://www.shortform.com/podcast/episode/the-game-w-alex-hormozi-2026-01-27-episode-summary-how-to-sell-high-ticket-offers-to-the-right-customers-ep-996
- [W3], [W7], [W9], [W11], [W12]: see [destination-weddings.md](destination-weddings.md), Sources.
