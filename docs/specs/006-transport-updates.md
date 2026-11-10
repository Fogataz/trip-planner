# Spec 006: Transport updates

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Roadmap: Phase 5 "Transport API integration" and priority 2 in [product/roadmap.md](../product/roadmap.md). Slot reserved by [spec 004](004-trip-ia-redesign.md) §4.2 (R3) and §18.5.

> **Seed draft (2026-11-10).** Stages 1–3 are **not done**. This records where the feature goes, what blocks it, and a recommended first step. Open decisions carry recommendations that act as working defaults (D27). Provider and budget are still **TBD** for the product owner.

## 1. The problem in one line

On travel day the group finds out about a delayed train or a gate change from someone's screenshot in WhatsApp, not from the trip.

## 2. What exists today

| Piece | Where |
|---|---|
| Itinerary items with a **free-text** `transport` field ("train", "Metro L5, 12 min") | `server/models/Trip.js` (itinerary), `client/src/trip/destinations/Plan.tsx` |
| Transport icon guessed from that text | `transportIcon` in `Plan.tsx` |
| Reserved slots that render nothing: "Transport status" on the Countdown Overview, "Transport alerts" on the Live Overview | `client/src/trip/destinations/Overview.tsx` (spec 004 F18, PR #13) |
| A planned socket event `transport:update` | Root README, Phase 3/5. Not implemented |
| Push notifications | `server/services/notifications.js` (`notifyTrip`) |

Missing: structured legs (carrier, number, from, to, scheduled time), a status source, and the alert UI.

## 3. Where it lives

Per spec 004 and the TripIt pattern (alerts are a separate, loud channel):

- **Countdown and Live Overview:** the reserved alert slot. One line per affected leg ("Train to Madrid · 25 min late"), linking to the stop in Plan.
- **Plan:** an inline status badge on the affected itinerary item ("On time", "Delayed 25 min", "Cancelled").
- **Push:** a disruption on a leg in the next 24 hours, under spec 002's "schedule changes" category.
- **Not** a new destination or tab.

## 4. Recommended direction

1. **Structured legs first, live data second.** Add an optional structured `leg` to an itinerary item: mode (flight, train, bus, ferry), carrier, service number, from, to, scheduled departure and arrival. Without it no provider can be queried. The free-text field stays for everything else.
2. **Start with flights.** Flight status APIs are mature and cheap to try; rail in Spain and Portugal is fragmented (Renfe, Iryo, Ouigo, CP).
3. **Poll on the server, push to the trip.** A job checks legs departing in the next 24 hours every 10–15 minutes, stores the last status on the item, and emits `transport:update` to the trip room. Clients never call the provider.
4. **Manual status as a fallback.** Any member can mark a leg "delayed" or "cancelled" with a note. This works for every mode on day one and tests whether people want the feature before any provider cost.

## 5. Benchmark and provider leads (stage 1 to confirm)

| Kind | Look at |
|---|---|
| Products | TripIt (alerts as a separate channel, gate changes), Google Travel / Gmail trip cards, Citymapper (disruption on today's journeys), Wanderlog (bookings attached to items) |
| Flight data | AeroDataBox, AviationStack, FlightAware AeroAPI, OpenSky (free, limited): coverage, price per call, terms for showing data to end users |
| Rail data | Renfe open data (GTFS and GTFS-RT where available), CP, Navitia, Transitland; check real-time coverage for long-distance trains |
| Parsing bookings | Whether pasting a booking confirmation could fill a leg (reuse spec 002's AI import as a draft) |

## 6. Open decisions

| # | Decision | Options | Recommendation |
|---|---|---|---|
| T1 | Provider and budget | Flight API only / flight + rail / manual only first | **Manual status first, then one flight API.** Proves demand before paying |
| T2 | How a leg gets structured data | Manual fields / paste a booking for an AI draft / both | **Manual fields now, paste later** with spec 002's import pipeline |
| T3 | Who sees alerts | Everyone in the trip / only people on that leg | **Everyone** in v1 (no per-leg attendees yet) |
| T4 | Push threshold | Any change / delay ≥ 15 min, cancellation, platform or gate change | **Delay ≥ 15 min, cancellation, platform or gate change** |
| T5 | Polling window | 24 h / 6 h before departure | **24 h, then every 10–15 min**; cost scales with legs, not users |

## 7. Starting points for the build

- `server/models/Trip.js`: `itinerary[].leg` subdocument plus `itinerary[].status { state, delayMinutes, note, source, checkedAt }`.
- New `server/services/transportStatus.js` with a provider interface (`getStatus(leg)`), a manual provider, and one real provider behind an env key.
- A scheduled job (the server has none yet): a simple interval in `server/index.js`, or a queue if Redis is configured.
- Socket: emit `transport:update` with `{ itemId, status }`; handle it in `client/src/trip/TripContext.tsx` like `itinerary:itemUpdated`.
- UI: fill the reserved slots in `Overview.tsx`; add a status badge to items in `Plan.tsx`.

## 8. Next step

Product owner: decide T1 (provider and budget). Then stage 1 (benchmark the table above), frames for the alert strip and the Plan badge, and a full draft for approval.
