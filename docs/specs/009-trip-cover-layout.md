# Spec 009: Trip cover layout

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Comes from: [spec 001](001-trip-covers.md) (covers) and [spec 004](004-trip-ia-redesign.md) §18 (the compact header, which shrank the cover).

> Stage 1 of 3 (analysis and proposal, 2026-11-10). Wireframes are in [wireframes/009-trip-cover-layout](../../wireframes/009-trip-cover-layout/index.html). **Not signed off. Do not build yet.** Items waiting on the product owner are marked **TBD**.

## 1. The problem in one line

Spec 004 made the trip header compact, and the cover went from a banner to a thin strip that crops the artwork to its middle fifth.

## 2. What changed, and why it looks wrong

Spec 004 slice 1 set the cover to 110 px on desktop and 86 px on phones (spec 001 had 280 and 200). It did that on purpose: the header is now on every destination, and at the old sizes the first screen on a phone was mostly header ([spec 004 §18](004-trip-ia-redesign.md)). The header card then overlaps the banner by 28 px (16 px on phones), so less than the banner height is visible.

Measured on the running app (local build of `main`, `art-pod-gathering` cover, 2026-11-10):

| Viewport | Banner box | Visible after overlap | Visible ratio | Share of the artwork shown |
|---|---|---|---|---|
| Desktop, content 1060 px wide | 1060 × 110 | 1060 × 82 | 12.9 : 1 | 19% |
| Phone, 375 px wide | 375 × 86 | 375 × 70 | 5.4 : 1 | 45% |

The artwork is 2000 × 833 (2.4 : 1). On desktop only a horizontal slice through the heads is left. The group is recognisable, but the title text in the art and its sunset are gone. That is the user's complaint ("too narrow"), and the numbers agree.

## 3. QA findings

Checked in the running app at 1311 px and 375 px, dark theme.

| # | Finding | Where | Severity |
|---|---|---|---|
| Q1 | Banner is 12.9 : 1 on desktop. Artwork and uploads are cropped to a thin slice | Desktop | High. This is the reported problem |
| Q2 | On phones the *Change cover* and *Reposition* buttons are 44 px tall in a 70 px visible strip. They cover about 58% of the width and most of the art | Phone | High |
| Q3 | Controls are lifted 42 px (set for the old 28 px overlap) but the phone overlap is 16 px, so the lift is now wrong on phones | Phone | Low |
| Q4 | A reposition drag moves the image inside a 70 px window, so very little can move. Reposition is nearly pointless at this height | Both | Medium |
| Q5 | Cover height lives in three places: `TripCover.css`, an override in `trip/trip.css` and a phone override in the same file. Easy to break again | Code | Low |
| Q6 | Uploads are resized to 1600 px wide with their own ratio. A 4 : 3 photo shows about 14% of its height on desktop, so most uploads look like a smear | Both | Medium |
| Q7 | The title and date inside `art-pod-gathering` are cropped at every height (already open as O5 in spec 001) | Both | Medium |

Not checked: a real phone, reduced motion, the Pod trip list thumbnail after the change.

## 4. Benchmark

What comparable products do with the same job. Sources are linked. Where I could not find a first-party number I say so.

| Product | Cover treatment | What to take from it |
|---|---|---|
| **Notion** | Full-width banner above the title. Guides converge on about 1500 px wide and 2.5 : 1 (1500 × 600). Notion publishes no fixed height. Third-party guides say tablets crop the top and bottom more ([Landmark Labs](https://www.landmarklabs.co/notion-tutorials/notion-cover-sizes), [Moda](https://moda.app/resources/sizes/notion-cover)) | The banner is tall enough to be a picture, and the user can reposition it. Spec 001 already follows Notion on interaction |
| **Luma** | Square (1:1) cover, shown beside the title on desktop and reused in feeds and share cards ([Luma help](https://help.luma.com/p/event-cover-images)) | One image does several jobs, so it is cropped to one shape. This is the "tile" option below |
| **Facebook events and groups** | Events: 16 : 9 (about 1920 × 1005), key content kept central because phones crop the top and bottom. Groups: about 1.91 : 1, and on phones the group name sits over the lower 20% ([Jon Loomer](https://www.jonloomer.com/facebook-image-dimensions-page-group-event/)) | The title over the image is a known pattern, and it costs the lower fifth of the art. This is the "hero" option below |
| **Partiful, Wanderlog** | I could not find first-party size or layout guidance for either. Not benchmarked. **TBD:** look at them by hand before sign-off | |

Spec 004 §6 already names Partiful and Luma as the reference for the trip header being "a thing, not a form summary". This confirms that a cover is expected to be a real picture, not a strip.

Two lessons carry over. Wide banners work only if the art is made for them (a safe zone in the middle). A single image used in several places forces a single crop.

## 5. Options

All three keep the four destinations and the persistent header from spec 004 (F3). Frames are in the wireframes.

| | A. Taller banner (recommended) | B. Hero header | C. Side tile |
|---|---|---|---|
| Idea | Same structure as today. The height follows the width, within limits | The cover is the background of the header card. Title, route, avatars and *Ask the assistant* sit on a scrim over it | The cover is a tile beside the title. No full-width banner |
| Desktop (1060 wide) | 4 : 1, capped at 260 px. Visible after a 16 px overlap: 244 px, 4.3 : 1 | About 220 px in total. The header and cover are one object | 200 × 133 tile (3 : 2) beside a 133 px header |
| Phone (375 wide) | 5 : 2, capped at 140 px. Visible after a 12 px overlap: 128 px | About 170 px in total (estimate) | 72 px square next to the title |
| Extra height vs today | Phone +58 px, desktop +162 px | Phone about +20 px, desktop about +100 px (estimate from the frames) | Phone about −40 px, desktop about +30 px (estimate from the frames) |
| Art shown (pod art) | 55% desktop, 82% phone | About 65% before the scrim | A 3 : 2 crop, so a new crop of every image |
| Reposition | Useful. There is room to move | Useful | Useless on a tile |
| Fits spec 001 and the sign-off | Yes. Same shape, taller | Partly. Changes the "banner above a card" frame that was signed off | No. Breaks the banner decision in spec 001 §4 |
| Risks | Pushes Overview content down by 58 px on phones (162 px on desktop, where the tabs are sticky) | The title is over a picture, so contrast needs a scrim for every cover. White text on a pale upload fails | Needs a second crop of every cover and a crop step in upload |
| Build size | Small: CSS and the picker hint | Medium: header markup and contrast rules | Medium to large |

**Recommendation: A.** It is the smallest change that fixes the reported problem. It keeps what was already signed off and lets reposition do real work again. B is the better look and may come back once the header carries more (rename, RSVP, status). C solves a different problem (shared cards) that we do not have yet.

## 6. Proposed behaviour (option A)

| Rule | Detail |
|---|---|
| Height | Set by aspect ratio with a cap, in one place. Desktop (769 px and up): 4 : 1, max 260 px. Tablet (601–768 px): 3 : 1. Phone (600 px and down): 5 : 2, max 140 px |
| Overlap | The header card overlaps the banner by 16 px (12 px on phones). Controls sit above the overlap, using the same variable, so they cannot drift (fixes Q3 and Q5) |
| Controls, desktop | As today: appear on hover and focus. *Change cover* and *Reposition* |
| Controls, phone | One *Edit cover* button, 36 px tall, in the top right of the banner. It opens a sheet with Change cover, Reposition and Remove. This removes the two large buttons that hide the art (fixes Q2) |
| Reposition | Works at the new height. Drag or slider, as today |
| Art | Gallery artwork is made at 2000 × 500 (4 : 1) with the title and date inside the middle 60%. The pod-gathering art needs a new crop (closes O5) |
| Upload | The picker shows a live preview at the banner ratio and says "Wide pictures work best". A tall picture still works, and the reposition step lets the user choose the slice (addresses Q6) |
| Trip list thumbnail | Unchanged: 96 px strip |
| No cover | Unchanged: the *Add cover* row above the title. The empty state does not reserve banner space |
| Layout shift | Height is known from the ratio before the image loads, so no shift (N2 from spec 001 still holds) |

Open question on phones: with the sheet pattern, spec 001 O2 (action sheet instead of buttons on mobile) is closed by this spec. **TBD** whether to ship it in the same PR or after.

## 7. Renaming the trip (out of scope here)

The product owner wants organisers to be able to rename a trip, probably from the trips list rather than the trip page. That is a separate UX analysis, to be done in its own chat and spec. This spec only makes sure it is not blocked:

- Spec 004 F3 lists an overflow menu in the trip chrome. It is not built yet. The header keeps the slot to the right of the title, beside the avatars and *Ask the assistant*.
- Option A leaves the title row unchanged, so a rename control can be added there or in the list without moving the cover.

## 8. Requirements

| # | Requirement |
|---|---|
| F1 | The banner height is derived from its width with a cap, as in §6, from one definition |
| F2 | At 1060 px content width the visible banner is at least 4 : 1. At 375 px it is at least 2.5 : 1 |
| F3 | On phones the cover controls cover no more than 25% of the visible banner |
| F4 | The overlap and the control offset come from one variable |
| F5 | The upload step previews the banner crop |
| F6 | The pod-gathering artwork is re-cropped to 4 : 1 with the text in the safe zone |
| N1 | No layout shift from the cover. No regression in LCP on the trip page |
| N2 | On phones the first destination content starts no more than 60 px lower than today (Overview, 375 × 812) |
| N3 | Cover actions remain reachable by keyboard and by touch |

## 9. Acceptance criteria

1. Given the pod cover on desktop at 1311 px, when I open a trip, then the banner is at least 4 : 1 and the heads, skyline and the art's title are visible. (F1, F2, F6)
2. Given a phone at 375 px, when I open a trip, then the banner is about 140 px, and *Edit cover* hides less than a quarter of it. (F2, F3)
3. Given a phone, when I tap *Edit cover*, then a sheet offers Change, Reposition and Remove, and focus returns to the button on close. (N3)
4. Given a cover, when I reposition it, then the picture moves visibly between 0% and 100% and the saved position matches. (Q4)
5. Given an upload of a 4 : 3 photo, when I choose it, then I see the banner crop before saving. (F5)
6. Given any width from 320 to 1600 px, when the page loads, then there is no horizontal scroll and no layout shift from the cover. (N1)
7. Given a trip with no cover, then the page looks as it does today. (no change)
8. Given Overview on 375 × 812, then its first content starts no more than 60 px lower than it does now. (N2)

## 10. Open decisions

| # | Decision | Recommendation | Status |
|---|---|---|---|
| D1 | Option A, B or C | A | **TBD** |
| D2 | Phone height: 140 px cap, or shorter at the cost of the art | 140 px, because N2 allows it (+58 px) | **TBD** |
| D3 | Ship the phone action sheet in the same PR | Yes. The big buttons are the worse half of the problem | **TBD** |
| D4 | Who makes the 4 : 1 pod-gathering crop | Product owner. Engineering cannot judge the art | **TBD** |
| D5 | Look at Partiful and Wanderlog by hand before sign-off | Yes | **TBD** |

## 11. How we will know it worked

| Signal | Target |
|---|---|
| Share of trips with a cover | Up from the spec 001 baseline |
| Reposition used after a cover is set | Greater than zero. Today it is almost unusable |
| Itinerary items added per trip | Guardrail from spec 004: must not fall |
| p75 LCP on trip detail | Guardrail: no regression |

## 12. Next step

Sign-off on the wireframes and D1–D5. Then a PR that touches `TripCover.css`, `trip/trip.css` and `TripCover.tsx`, plus the picker preview. When it ships, update this spec, `features.md`, `roadmap.md` and the specs table in the same PR. Spec 001 stays as it is.
