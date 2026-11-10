# Destination Weddings: Use Case Analysis

> **Point-in-time analysis.** Written 2026-11-10. Looks at destination weddings as a niche inside model I (celebration trips) in [revenue-models-analysis.md](revenue-models-analysis.md), with the payer lens from [premium-buyer-lens.md](premium-buyer-lens.md). Nothing here is decided; decisions are in §9.

## 1. Summary

- **The job:** a destination wedding is a multi-day trip for 40–60 guests, with several events, not all of them open to every guest. The couple (or their planner) has to get everyone there, keep them informed and give them a good time around the wedding.
- **The gap:** wedding websites handle the wedding (Joy does multi-event RSVPs well, for free). Nobody handles **the trip around it**: where to stay, getting there, plans for the free days before and after, sub-groups like the bachelor trip, shared costs, and live coordination on the ground. That is what Trip Planner already does.
- **Who pays:** recommend **planners** (repeat B2B, they bill couples), with a self-serve pass for couples who plan alone. Couples alone are one-off and hard to reach.
- **Test:** your bachelor trip in Costa Rica (April 2027) tests the sub-group trip. Interviews with Costa Rica wedding planners and couples test the wedding itself.

## 2. The problem

| Fact | Source |
|---|---|
| The average destination wedding cost $39,000 in 2025 ($41,000 international), vs $32,000 for a hometown wedding. | The Knot [W1] |
| 72% of couples say making guests feel taken care of is their top priority, above cost. | The Knot 2025 study [W2] |
| Destination weddings were 17% of US weddings in 2025, down from 21% in 2019. | Walnut, citing The Knot 2026 study [W3] |
| Guests spend about $1,400 on travel and accommodation; up to about $2,500 for international weddings. | BeachBride, citing a 2024 survey [W4] |
| Costa Rica weddings typically have 40–60 guests. Couples often stay at least three days. | BeachBride [W5]; Tico Times [W6] |
| A destination wedding is several events (welcome dinner, ceremony, brunch, excursions), and not every guest is invited to every event. | Joy help centre [W8] |
| Guests without clear logistics ask the couple one by one: "multiplied by 50+ guests, that's a lot of texts during wedding week". | Yopki template guide [W13] |

**In one line:** the couple is hosting a 3–5 day group trip for people who don't know the place, while also getting married.

## 3. Users and jobs

| User | Job | Pays? |
|---|---|---|
| **Couple** | Get guests there, informed and happy; keep private events private; stop answering the same questions | Yes, or through the planner |
| **Planner** | Run several weddings at once with less admin; look professional to couples | Yes (B2B) |
| **Guests** | Know where to stay, when to arrive, where to be, what to wear, what to do in free time | Never |
| **Wedding party / sub-groups** | Run their own trip inside the trip (bachelor/hen trip, family day, excursion) | Sometimes (Trip Pass) |
| **Vendors** (transport, excursions) | Know headcounts and times | No |

## 4. Use cases

"Today in the product" refers to the code and [spec 002](../specs/002-hosted-event-pilot.md).

| # | Use case | How couples solve it today | What we would offer | Today in the product |
|---|---|---|---|---|
| U1 | **RSVP per event** within the trip | Wedding website (Joy, Zola, The Knot) | RSVP for each event, with guests seeing only events they're invited to | **Gap.** Itinerary items have no per-item RSVP or audience. |
| U2 | **Personal schedule per guest** | Joy shows a schedule by invited events [W8] | Schedule filtered by the guest's groups, in their language and the event's time zone | Partly: time zone and languages (specs 002, 003); filtering is a gap |
| U3 | **Where to stay and getting there** | Room-block links, a FAQ page | Accommodation options per guest group, arrival and departure times (for transfers) | Partly: one accommodation per trip. Per-guest stays and flights are a gap. |
| U4 | **Plans before and after** (Casa Catz) | A Google Doc or Pinterest board; guests improvise | Pre-made plans for free days: curated places on a map, day plans, imported as drafts the couple edits | Partly: map (Leaflet) and AI drafts (spec 002). Guide import is a gap. |
| U5 | **Group excursions** | WhatsApp polls; money by bank transfer | Sign-ups per excursion with capacity; payments later (model E) | Polls exist; capacity and payments are gaps |
| U6 | **Announcements on the day** | WhatsApp group | Announcements with mute (spec 002) | Planned in spec 002 |
| U7 | **Sub-groups** (bachelor trip, wedding party, families) | Separate WhatsApp groups | Sub-groups with their own schedule, polls and expenses, linked to the main trip | **Gap.** One trip has one member list. Workaround: a separate trip. |
| U8 | **Meeting points and transfers** | Calls and messages | Opt-in live location (exists) and a transfers list by arrival time | Live location exists; transfers are a gap |
| U9 | **Shared costs** in sub-groups | Splitwise, Tricount | Expenses with settle-up | **Built** |
| U10 | **Photos after the wedding** | Joy app, shared albums | Shared photo roll | Not planned; Joy does it free |

## 5. Benchmarks

| Product | What it does | Lesson for us |
|---|---|---|
| **Joy** | Free wedding website and app [W7]. Multi-event RSVP, private events, a personalised schedule per guest, announcement banners and push notifications [W8][W14]. | Don't compete on the website or RSVP alone; Joy is free and good. Match it on per-event RSVP, and win on the trip around the wedding. |
| **BACH** | Free app for bachelorette trips; earns commission on experiences booked in the app (revenue analysis S25). | Sub-group trips are a real job. Its money comes from commissions, not fees. |
| **Room-block advisors** (BeachBride, Destify, Fora) | Free to couples; resorts pay advisors 10–21% commission on group bookings [W9]. A 25-room, 4-night block at $600 per night is $60,000 in bookings [W10]. | Big money sits in accommodation, which is model F territory (see the revenue analysis). We can link to a room block without selling it. |
| **Local planners** | Coordinate vendors, legal ceremony, logistics. In Costa Rica, coordination may add about $600–1,500 [W12]; US full-service destination planners quote about $5,000–15,000 [W11]. | Planners are the repeat buyer and the channel to couples. |

## 6. Where we fit

**Positioning (draft):** *the wedding website is for the wedding; we're the trip around it.* One place where every guest sees their own schedule, where to stay, how to get there, what to do on free days, and live updates, and where the bachelor trip and the excursions run as part of the same trip.

| Principle | Fit |
|---|---|
| One source of truth | Strong: the wedding, the sub-group trips and the money in one trip |
| Real-time | Strong: day-of changes and meeting points |
| Privacy first | Strong if guests see only their events (U1). Guests' flight details are personal data: hosts only. |
| AI drafts on real accommodation and dates | Strong: pre- and post-wedding plans are drafts based on where guests actually stay |

## 7. Who pays: options

| Option | How | For | Against |
|---|---|---|---|
| **W1 Couple pays a per-wedding pass** | Self-serve, one-off | Simple; the couple has budget [W1] | One-off; Joy is free; hard to reach couples |
| **W2 Planner pays** (Organisation, per wedding or yearly) | Planner uses it for every wedding and bills couples | Repeat B2B; planners are reachable; they value time saved and looking professional | Must fit their workflow; planners already use other tools |
| **W3 Commission** on stays or excursions | Partner links, room blocks | Large amounts at stake [W9][W10] | Model F: accommodation sales and pushy AI; parked in the revenue analysis |
| **W4 Done-with-you** | We set up the guest space for a couple or planner | Premium price; fastest learning | Service trap; cap it (premium-buyer lens §6) |

**Recommendation:** **W2 first**, with W1 as the self-serve fallback and W4 as capped paid discovery for the first planners. Keep W3 parked.

## 8. Product gaps (for a future spec, not now)

All of these fit the data model in working doc §4.2 without rework:

1. **Event audiences:** itinerary items get an audience (guest groups) and an optional RSVP. Guests see only their items. This also helps offsites (D) with breakout sessions.
2. **Guest groups and households:** invite a couple or family as one unit, with plus-ones.
3. **Sub-groups:** a trip inside a trip (bachelor trip, excursion) with its own members, polls and expenses.
4. **Per-guest travel:** stay, arrival and departure times, visible to hosts only, for transfers.
5. **Guide import:** a Casa Catz guide or Google Maps list becomes a Draft of places and day plans (the Guide object in §4.2).
6. **Excursion sign-ups with capacity**, with payments when model E arrives.

Items 1 and 2 are the minimum to compete for weddings. The pilot (spec 002) builds none of them; they're Phase 2 candidates.

## 9. Test plan

| Test | What it tests | When | Success signal (proposed) |
|---|---|---|---|
| **Your bachelor trip, Costa Rica, April 2027** | The sub-group trip (I, A): itinerary, polls, expenses, live location, guides for free days | Plan from about Feb 2027; trip in April | Every member joins; most planning moves out of WhatsApp; the group says they'd use it again; at least one person asks to use it for their own trip |
| **5 interviews with Costa Rica wedding planners** | W2: would planners pay, and for what? | Phase 1 (Dec 2026 – Feb 2027) | 2 of 5 describe the guest-logistics pain without prompting; 1 agrees to a pilot wedding |
| **5 interviews with couples** who had or are planning a destination wedding | The trip-around-the-wedding gap | Phase 1 | Most mention guest questions, sub-groups or free days as pain |
| **One pilot wedding** (done with you) | End-to-end value, with U1 and U2 built | Phase 2 | Join rate and day-of use at pilot thresholds (working doc §5); planner pays for the next one |

Ask the bachelor-trip group for nothing but honest feedback; it's a friends trip, so it can't test willingness to pay.

## 10. Decisions for you

| # | Decision | Options | Recommendation |
|---|---|---|---|
| W-a | Treat destination weddings as a named niche of model I | Yes / later | **Yes**, as a Phase 2 candidate next to C1/H operators |
| W-b | First payer to test | Couple (W1), planner (W2) | **Planner (W2)** |
| W-c | Use your bachelor trip as a test | Yes / no | **Yes**, as a product test, not a pricing test |
| W-d | Recruit Costa Rica planners and couples for interviews | Now / after the pilot | **After the 24–25 Nov pilot**, during Phase 1 |

## Sources

- [W1] The Knot, average destination wedding cost (2025 Real Weddings Study): https://www.theknot.com/content/average-destination-wedding-cost
- [W2] Business Wire, The Knot 2025 Real Weddings Study: https://www.businesswire.com/news/home/20250227544757/en
- [W3] Walnut, wedding cost statistics citing The Knot 2026 study: https://walnutinvest.com/stats/wedding-cost-statistics
- [W4] BeachBride, destination wedding guest gifts (guest spend): https://beachbride.com/destination-wedding-guest-gifts-17-ideas-that-actually/
- [W5] BeachBride, wedding planning in Costa Rica: https://beachbride.com/wedding-planning-costa-rica/
- [W6] Tico Times, Guanacaste as a wedding destination: https://ticotimes.net/2025/02/27/guanacaste-costa-rica-emerges-as-the-ultimate-wedding-destination
- [W7] Joy features and pricing: https://withjoy.com/features and https://withjoy.com/blog/?p=6301
- [W8] Joy help: planning a destination wedding, and multi-event RSVP: https://withjoy.com/help/en/articles/15388665-planning-a-destination-wedding-with-joy and https://withjoy.com/help/en/articles/11085588-how-can-i-use-joy-to-manage-rsvps-and-schedules-for-multiple-events-when-not-everyone-is-invited-to-every-event
- [W9] BeachBride, room block calculator (resort commissions): https://beachbride.com/tools/room-block-calculator/
- [W10] Fora, how to become a destination wedding travel agent: https://www.foratravel.com/join/resources/how-to-become-destination-wedding-travel-agent
- [W11] Wedding planner price calculator, destination planner cost: https://wedding-planner-price-calculator.vercel.app/destination-wedding-planner-cost
- [W12] Wedding Frontier, Costa Rica wedding cost: https://weddingfrontier.com/?p=7134
- [W13] Yopki, destination wedding itinerary template: https://yopki.com/templates/destination-wedding-itinerary
- [W14] The Budget Savvy Bride, Joy review (announcements and push): https://thebudgetsavvybride.com/?p=134822
