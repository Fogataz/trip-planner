# Spec 001: Trip Covers

Status: shipped
Shipped: 2026-11-06 · PR: [#3](https://github.com/Fogataz/trip-planner/pull/3)
Current behavior: [features.md → Trip covers](../features.md#trip-covers)

> Ideation (approved 2026-11-05) → lo-fi wireframe (signed off 2026-11-06) → build (merged 2026-11-06).
> This spec is a record of what was decided and why. It is not updated as the feature changes; see [features.md](../features.md) for how it works today. QA results and open items are in §11.

## 1. The idea in one line

Every trip gets a **cover image** — a wide banner at the top of the trip page and a thumbnail on the trip card — that the group picks, like a Notion page cover.

## 2. Why this is worth building

The trip page today opens with a dark card and a text title. Functionally fine, emotionally flat. A trip is the one object in this product people feel something about before it happens.

Three concrete jobs a cover does:

1. **Recognition.** The trip list is a wall of near-identical cards. A cover makes "Madrid Gathering" findable in 200ms instead of by reading.
2. **Ownership.** The moment a group customises something together, it becomes *theirs*. Notion covers, Slack channel emojis, WhatsApp group photos — same mechanic, consistently drives return visits.
3. **Anticipation.** The attached sample (pixel-art pod banner, "24–25 November 2026") is the proof: people already make these by hand and paste them into chat. We are formalising a behaviour that already exists.

**It is decoration with a job.** Not a priority over expense settlement; a cheap, high-affect win that makes everything else look more finished.

## 3. Design principles for this feature

| Principle | What it means here |
|---|---|
| **Never block the trip** | Creating a trip must not get longer. The cover is added *after*, never a required step. |
| **Good by default** | A trip with no cover must still look deliberate, not broken. No grey rectangles. |
| **One tap to decent, three to perfect** | Gallery pick = 1 tap. Upload + reposition = the long path, for people who care. |
| **The group owns it** | Any active member can change it, and everyone sees the change live. It is a shared object, not the organiser's. |
| **The image never eats the content** | Title, dates and actions stay legible over any image, in light and dark mode. |

## 4. The experience

### 4.1 Entry points

| Where | What the user sees |
|---|---|
| **Trip detail, no cover** | On hover (desktop) a ghost button `🖼 Add cover` appears just above the trip title. On mobile it is always visible, small and quiet. |
| **Trip detail, has cover** | Hovering the banner reveals, bottom-right over the image: `Change cover` · `Reposition`. On mobile, tap the banner → action sheet. |
| **Just after creating a trip** | The new trip page opens with the `Add cover` button in a one-time highlighted state (subtle pulse, dismisses on any click). One nudge, never again. |
| **Trip list card** | Cover shows as a 96px-tall strip at the top of the card. Not editable from here — one place to edit, no duplicated controls. |

**Explicitly rejected:** a cover step inside the create-trip form. It adds a decision before the user has a trip, and at that moment they do not yet care. Notion gets this right — create first, decorate once the thing is real.

### 4.2 The picker

A modal (desktop) / bottom sheet (mobile) with three tabs:

**Gallery** (default tab)
- ~16 curated covers in a 2-up / 4-up grid, grouped: *Gradients*, *Pixel cities*, *Travel*.
- One tap applies instantly and closes the sheet. No Save button, no confirm. Reversible via `Change cover`.
- The pixel-city set is deliberately in the spirit of the attached sample — that aesthetic is why this feature got proposed.

**Upload**
- Drop zone + file picker. JPEG / PNG / WebP, max 8 MB in.
- The image is downscaled **in the browser** (long edge 1600px, WebP, target < 400 KB) before upload — instant preview, no server image pipeline, no new native dependency.
- Progress bar, cancellable; the old cover stays until the new one lands.

**Generate**: *not in v1.* The tab is hidden until v2 (wireframe review, 2026-11-06). Spec §8 gives it no date, and a SOON label would promise one. See §8.

### 4.3 Reposition

Wide images crop differently on phone and desktop — the sample banner loses half its characters at a 16:9 crop. So:

- `Reposition` puts the banner into a drag mode: vertical drag only, with a hint bar reading *"Drag image to reposition · Save / Cancel"*.
- What is stored is a **focal point** (`focalY`, 0–100), not a crop. Every viewport then crops around the same point.
- Default on upload: `50` (centre). Gallery assets ship with a curated `focalY` so they are right without anyone touching it.

### 4.4 Visual spec (input for the wireframe stage)

- **Banner height:** 200px mobile, 280px desktop. Full-bleed to the viewport edges, above the existing trip card.
- **Overlap:** the trip card slides up to overlap the banner's bottom edge by ~28px with the existing `--radius`, so banner and content read as one object.
- **Legibility:** a bottom-up scrim (`transparent → rgba(0,0,0,.55)`) over the lower third of the banner. The `← Back to Trips` button gets a blurred pill background when it sits over an image.
- **Loading:** the image's dominant colour is stored and painted first; the image fades in over it. No layout shift — height is reserved before the image arrives.
- **Default (no cover):** a deterministic gradient derived from the trip's `groupId`, using the existing `--gradient` token family. Same trip = same gradient, always. Blank-but-intentional, and the trip card never looks empty.

## 5. Requirements

### 5.1 Functional

| # | Requirement |
|---|---|
| F1 | Any **active member** of a trip can set, change, reposition or remove its cover. |
| F2 | Cover source is one of: curated gallery asset, or member upload. |
| F3 | Uploads accept JPEG, PNG, WebP; everything else is rejected, including a file renamed to `.jpg`. |
| F4 | Uploads are downscaled client-side to long edge ≤1600px / <400 KB before transfer; the server re-validates type and size. |
| F5 | A cover stores a focal point; all crops (mobile banner, desktop banner, list thumbnail) derive from it. |
| F6 | Removing a cover returns the trip to its deterministic default gradient. |
| F7 | A cover change is broadcast to everyone in the trip room in real time (`trip:coverUpdated`). |
| F8 | A cover change is written to the activity log as *"{member} changed the trip cover"*. |
| F9 | The trip list shows each trip's cover as a card thumbnail. |
| F10 | Trips created before this feature render the default gradient with no migration step. |

### 5.2 Technical

- **Model:** `trip.cover = { source: 'gallery' | 'upload', key, focalY, dominantColor, alt, width, height, setBy, setAt }`. `key` is a gallery slug or an uploaded asset id.
- **Endpoints:** `PUT /api/trips/:groupId/cover` (set gallery cover, update focalY, set alt), `POST /api/trips/:groupId/cover/upload` (multipart, returns the stored cover), `DELETE /api/trips/:groupId/cover`. All reuse the existing active-member guard (`denyUnlessMember`), not the organiser-only guard.
- **Upload body:** the browser sends the resized image as the raw request body (`Content-Type: image/webp|jpeg|png`) with width, height, dominant colour and focal point as query parameters, not multipart. Server cap 2 MB, magic-byte sniffing.
- **Image access (decided at build):** `GET /api/covers/:id` is **unauthenticated**, because `<img>` cannot send a bearer token. The id is the capability: 128 random bits, deliberately not a Mongo ObjectId (ObjectIds are timestamp + counter, so neighbours can be guessed). The id is only ever handed out by the authenticated trip endpoints, and a leaked URL exposes one decorative image and nothing else about the trip.
- **Storage:** gallery assets are static files shipped with the client. Uploads go to **GridFS in the existing MongoDB**, served from `GET /api/covers/:id` with an immutable cache header (every upload gets a new id). Rationale: no new service, no new credentials, identical in dev and prod. Firebase Storage or S3 is the swap-in if volume ever justifies it — the `key` indirection keeps that a one-file change.
- **Rate limit:** uploads reuse `express-rate-limit`; 10 uploads per member per hour.
- **Orphan cleanup:** deleting a trip, or replacing a cover, deletes the previous uploaded asset.

### 5.3 Non-functional

| # | Requirement |
|---|---|
| N1 | The banner becomes the LCP element on trip detail. p75 LCP must not regress by more than 200ms vs today. |
| N2 | No cumulative layout shift from the cover (height reserved before load). |
| N3 | Every cover has alt text: author-supplied, else *"Cover image for {trip name}"*. |
| N4 | Title and meta keep ≥4.5:1 contrast over any cover, in light and dark mode. |
| N5 | The picker is fully keyboard operable; reposition has a keyboard path (arrow keys adjust the focal point). |
| N6 | A broken or deleted cover asset degrades to the default gradient — never a broken-image icon. |
| N7 | Respects `prefers-reduced-motion` (no fade-in, no nudge pulse). |

## 6. Acceptance criteria

**Adding**
1. Given a trip with no cover, when I open it on desktop and hover the header area, then an `Add cover` button appears above the title.
2. Given the picker is open on the Gallery tab, when I tap any gallery cover, then it is applied, the sheet closes, and the banner shows it — with no further confirmation.
3. Given I pick a gallery cover, when the request fails, then the banner reverts to its previous state and an inline error says the cover could not be saved.

**Uploading**
4. Given the Upload tab, when I choose a 6 MB JPEG, then it is downscaled in-browser, a progress indicator runs, and the banner updates on completion.
5. Given I choose a PDF renamed to `.jpg`, then it is rejected before upload with *"That file isn't an image we can use. Try JPG, PNG or WebP."*
6. Given I choose a 20 MB file, then it is rejected client-side with the size limit named.
7. Given an upload is in progress, when I cancel or close the sheet, then the upload aborts and the existing cover is unchanged.

**Repositioning**
8. Given a trip with a cover, when I choose `Reposition` and drag vertically, then the visible crop follows the drag, and `Save` persists the focal point.
9. Given a saved focal point, when I open the same trip on a phone, then the crop is centred on that same point.
10. Given reposition mode, when I press `Cancel` or `Esc`, then the previous focal point is restored.

**Removing**
11. Given a trip with a cover, when I choose `Remove cover`, then the trip returns to its deterministic default gradient and the uploaded asset is deleted.

**Collaboration**
12. Given two members have the trip open, when one sets a cover, then the other's banner updates within the socket round-trip, with no reload.
13. Given a cover change, when I open the activity log, then it records who changed the cover and when.
14. Given I am not an active member, when I call the cover endpoints directly, then I get 403 and nothing changes.

**Defaults and resilience**
15. Given a trip created before this feature, when I open it, then I see its deterministic default gradient — the same one on every device and every reload.
16. Given a cover whose asset has been deleted, when I open the trip, then I see the default gradient and no broken image.

**Accessibility**
17. Given a screen reader, when it reaches the banner, then it announces the cover's alt text.
18. Given keyboard-only use, when I tab to the cover controls, then I can open the picker, choose a cover, and adjust the focal point with arrow keys.
19. Given `prefers-reduced-motion: reduce`, then no fade-in and no nudge animation play.

## 7. Open decisions — need your call

| # | Decision | Recommendation |
|---|---|---|
| D1 | Can **any member** change the cover, or organiser only? | Any active member. Matches how accommodation already works, and the shared-object framing. Easy to tighten later, awkward to loosen. |
| D2 | Default for a coverless trip: **deterministic gradient** or genuinely blank, Notion-style? | Gradient. The trip list is the main surface and blank cards look broken there. |
| D3 | Is **Upload** in v1, or Gallery only? | Both. Gallery alone is an afternoon of work, but the attached sample shows people want *their* image. Upload is where the emotion is. |
| D4 | Is **AI generate** in scope at all? | Not v1. See §8. |

## 8. Out of scope for v1

- **AI-generated covers.** A "Generate" tab that builds a banner from the trip's own context (destination, dates, member count) in a chosen style — pixel-art, watercolour, retro poster. This is the attached sample, automated, and it is the most interesting version of this feature. It is also an image-model dependency, a per-generation cost, a moderation surface, and a 10–20s wait that needs its own UX. It gets its own spec once v1 ships and we know people use covers at all.
- Per-member covers (everyone sees the same one).
- Cover history or undo beyond "pick another".
- Unsplash or any third-party image search.
- Covers on anything other than trips.

## 9. How we will know it worked

| Signal | Target |
|---|---|
| Trips with a cover within 7 days of creation | ≥ 40% |
| Covers set within 5 minutes of trip creation | ≥ 25% (tells us the post-create nudge works) |
| Gallery vs upload split | Any split is informative; >80% gallery means the curation is good and upload can stay thin |
| Repeat opens of the trip page in week 1 | No decrease (guardrail) |
| p75 LCP on trip detail | ≤ +200ms vs baseline (guardrail) |
| Upload failure rate | < 2% (guardrail) |

## 10. Next step

**Stage 1 approved 2026-11-05.** Decisions taken: D1 any active member, D2 deterministic gradient, D3 upload in v1, D4 Generate out of v1.

**Stage 2 — lo-fi wireframes:** <https://claude.ai/artifact/LUmzAaJP4LA3bjRYywwd2y> (private; share from the page's Share menu before sending it on). Seven annotated frames: trip detail with a cover, the coverless empty state in both resting and hover form, the picker on its Gallery and Upload tabs, reposition mode with the focal-point model, the trip list, and mobile with the action sheet.

**Stage 2 signed off 2026-11-06**, with the two pressure-tested frames resolved:

- **Frame 2, resting empty state:** keep **hover-only** on desktop, as specified in §4.1 and AC1. The button shows on hover or keyboard focus, is always visible on mobile, and gets the one-time post-create nudge.
- **Frame 3, Generate tab:** **hidden until v2** rather than shown disabled with SOON.
- **Gallery size:** ship **9 covers** (8 gradients + the pod-gathering artwork) instead of ~16. The *Pixel cities* and *Travel* groups wait for real artwork, not placeholders. Adding a cover is one entry in `client/src/covers.ts` and one in `server/config/coverGallery.js`.

**Stage 3, build:** implemented and merged in PR #3. Status and open items in §11.

## 11. Build status (2026-11-06)

**Verified.** Server: an API script against a local server and MongoDB (22/22 checks) covering AC2, AC5, AC8, AC11, AC12 (including removal), AC13 (log written), AC14, AC16 and F10, plus the 2 MB cap, rate-limit headers, focal clamping, asset replacement and trip-delete cleanup. Browser QA (desktop 1280px, mobile 375px, dark and light): AC1 (hover-only on desktop, always visible on touch), AC4 (a 3.8 MB JPEG uploaded as a 273 KB WebP), AC5, AC6, AC7 (cancel or close at 5, 80 and 300 ms leaves the cover unchanged), AC10, AC11, AC16 (a broken image falls back to the default gradient), AC18 (focus lands in the dialog, Tab stays inside it, focus returns to the opener, a slider moves the focal point), the post-create nudge, trip-list thumbnails (96px, flush to the card) and mobile layout (no horizontal scroll). N2: layout shift 0.016, none from the cover. N1: the cover image is the LCP element, 484 ms locally. N4: contrast 4.85 (light) and 6.67 (dark) on the Add cover button.

**Bugs found in QA and fixed**

| Bug | Fix |
|---|---|
| Change cover / Reposition buttons were half-hidden under the trip card, which overlaps the banner by 28px. The reposition bar's Save and Cancel had the same problem. | Controls and bar are lifted clear of the overlap. |
| Add cover was visible without hovering: the post-create nudge never ended until the picker opened, and any window under 768px counted as touch. | The nudge ends on any click or key press, or after 7 seconds. Always-visible now keys off `(hover: none)`, not window width. |
| An in-flight upload was aborted whenever the parent re-rendered, including when the cover-updated socket event arrived, so the picker stayed open after a successful upload. | `onClose` is held in a ref so the effect runs once. |
| Cancel or closing the picker during the in-browser resize did not stop the upload. | The abort controller is created before the resize and checked after it. |
| The picker did not return focus to its opener and let Tab leave the dialog. | Focus is restored on close and Tab is trapped inside. |

**Not verified:** AC3, AC9, AC15 and AC19 (reduced-motion CSS exists but was not exercised), and a real phone or touch device.

**Open items**

| # | Item |
|---|---|
| O1 | **No activity UI exists anywhere in the client**, and no endpoint reads `ActivityLog`. Cover changes are logged (F8), but AC13 ("when I open the activity log") can't be met until an activity feed is built. That's a product-wide gap, not just a covers one. |
| O2 | Mobile uses always-visible `Change cover` / `Reposition` buttons rather than the tap-to-open action sheet in §4.1 / wireframe frame 7. |
| O3 | AC3: gallery picks aren't optimistic, so there is no visible change to revert. A failed save shows an inline error in the picker. |
| O4 | Gallery is 9 of ~16; *Pixel cities* and *Travel* need commissioned art. |
| O5 | The pod-gathering artwork is a 3:1 banner with text at its top and bottom edges, so the title and date are partly cropped at every banner height. `focalY` only moves it vertically. Worth a taller crop of the art, or a different default focal point. |
