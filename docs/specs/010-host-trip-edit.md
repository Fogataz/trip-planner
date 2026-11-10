# Spec 010: Host edits their trip

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Comes from: the backlog item "Edit trip dates and length" in [spec-backlog.md](../product/spec-backlog.md), widened to the trip name after the product owner's request (2026-11-10). Related: [spec 004](004-trip-ia-redesign.md) D10 (approximate length), [spec 008](008-activity-and-read-state.md) (activity coverage).

> Stages 0–4 are done (audit, light benchmark, define, [wireframes](../../wireframes/010-host-trip-edit/index.html), this spec). Open decisions carry recommendations that act as working defaults until the owner overrides them (D27). Numbered 010 because 009 is taken by the trip cover layout spec on another branch.

## 1. The problem in one line

A host can create a trip but cannot fix it. A typo in the name or a change of plan means deleting the trip and starting again, and losing the members, stops and expenses.

## 2. Audit: what exists today (stage 0)

Size: **medium** (new UI on existing screens).

| Piece | State |
|---|---|
| Create form | `client/src/pages/TripPlanner.tsx`. Name, origin, destination, required start date, then an end date or an approximate length (min–max days). Validates in the client only |
| Edit UI | None for name or dates. Only the Stay card has an editor (`Facts` in `client/src/trip/destinations/Overview.tsx`) |
| Server | `PUT /api/trips/:groupId` in `server/routes/trips.js`. Organizer only. Accepts `name`, `destination`, `origin`, `startDate`, `endDate`, `durationDays`. An end date clears the approximate length |
| Dates | Stored as UTC midnight, read as calendar days (`calendarDay` in `client/src/trip/phase.ts`) |
| Dependents of the dates | Trip phase (Setup, Planning, Countdown, Live, Wrap), the day grouping of stops (`groupByDay`), the "in 13 days" label on the trips list |

Screens reviewed: the trip Overview (header, Facts card) and the Your Trips list. In both, dates read "Nov 23 – TBD" and there is no edit control.

### Gaps found (not all in scope)

| # | Gap | Where |
|---|---|---|
| G1 | `PUT` sends no socket event, so other members see changes only after a refresh. Breaks principle 2 | `server/routes/trips.js` |
| G2 | `PUT` writes no activity log entry (`logTripUpdate` is imported but not called) | same |
| G3 | `PUT` has no validation: empty name, end before start, invalid date | same |
| G4 | `PUT` passes every field straight to the update, so a request that omits a field may clear it. **To verify in code and with a test before relying on it** | same |
| G5 | "TBD" for the end date is ambiguous: not decided, or forgotten? | Overview, trips list |
| G6 | Stops dated outside the trip's range lose their day number and nothing explains why | `groupByDay` |
| G7 | Origin is required at creation although only the destination feeds the assistant | create form |

## 3. Benchmark (stage 1, light)

Only what the sources say. Product pages change, so confirm before copying wording.

| Product | What it does | Take | Avoid |
|---|---|---|---|
| [Airbnb (host changes a booking)](https://www.airbnb.com/help/article/50) | A host cannot silently change a confirmed booking. They send a change request with new dates, the guest sees old and new totals and accepts or declines; if ignored, nothing changes | Show the other side what changed. Make date changes explicit | Request and approval. Here the host owns the trip, and approval would slow a small fix. Revisit if members ever pay up front |
| [Wanderlog](https://help.wanderlog.com/hc/en-us/categories/4450528751643-General) | Lists "Change dates of a trip" in its trip settings; a trip needs a name at creation, dates and tripmates can come later | Trip settings, not creation, is where dates are changed. Dates are optional at first | Could not confirm the exact steps or how it treats existing items; do not copy behavior from this source |
| [Splitwise](https://splitwise.uservoice.com/knowledgebase/articles/264547-can-i-set-a-group-admin-or-set-different-permis) | No group admin. Anyone in the group can fix mistakes, wiki style | The principle that mistakes should be cheap to fix | Open editing. Our principle 3 and the hosted-event pilot need a clear host |

Result: the pattern is "editable after creation, in settings, with the others told". The benchmark did not find a better answer on stops outside the new dates; that is decided in D3.

## 4. Define (stage 2)

### 4.1 Principles check

| Principle | Effect |
|---|---|
| 1. One source of truth | Name and dates live in the trip and are edited in one place |
| 2. Real-time by default | Needs G1 fixed: a live event so every member sees the change |
| 3. Privacy first | Organizer-only edit; only active members can read the trip. No conflict |
| 4. AI suggestions are editable drafts based on real dates | Existing drafts and suggestions were made for the old dates. See D6 |

### 4.2 Impact checklist

| Line | Result |
|---|---|
| Permissions | Organizer only (server already enforces it). See D5 |
| Live sync | **Affected.** New `trip:updated` event (G1) |
| Notifications and activity | **Affected.** Activity entries for rename and date change (G2). Push is D1 |
| Languages | **Affected.** New strings in EN, PT and ES. Activity lines are rendered per language from the action type |
| Validation | **Affected.** Server-side (G3). Client mirrors it |
| Existing data | **Affected.** Stops outside the new range (D3), phase changes, travel suggestions and AI drafts based on old dates (D6) |
| Analytics | Not affected (no analytics yet; spec 002 S4 covers it) |
| Migration | None. Existing trips keep their fields |

### 4.3 Adjacent improvements

| Item | Decision |
|---|---|
| "Not decided" and approximate length shown instead of "TBD" (G5) | **In scope** (F5, F12) |
| Server validation and live event (G1–G4) | **In scope**, required for the feature to be correct |
| Marking stops outside the dates (G6) | **In scope**, small (F7) |
| Make origin optional at creation (G7) | **Later.** Needs a product call; see D2 |
| Nudge in Countdown to confirm the end date when only a range is set | **Later.** Natural follow-up once dates are editable (backlog) |
| Same form component for create and edit | **In scope** (F8), prevents drift |

## 5. Requirements

### 5.1 Functional

| # | Requirement |
|---|---|
| F1 | The organizer sees an edit pencil next to the trip name |
| F2 | The Dates row of the Facts card has an Edit button for the organizer |
| F3 | Both open one editor: name, start date, length |
| F4 | Length offers three choices: an end date, an approximate range of days, or not decided |
| F5 | "Not decided" clears both the end date and the range. Dates display "Nov 23 – ~8–10 days" for a range and "Nov 23 – TBD" only when not decided |
| F6 | Validation: name is required and trimmed; start date is a valid day; end date is not before the start; a range is 1–365 days with min ≤ max. Errors show under the field and nothing is lost |
| F7 | When the change would leave stops outside the new range, ask for confirmation and say how many. Stops are never moved or deleted by this action. Plan marks them "Outside trip dates" |
| F8 | Create and edit share one form component |
| F9 | After saving, every member sees the new name and dates without refreshing: header, Facts, Trips list and phase |
| F10 | Activity entries "renamed the trip" and "changed the dates" appear in "Since you were away", rendered in each viewer's language |
| F11 | Non-organizers see no edit controls. The server returns 403 for them |
| F12 | The trips list shows the same date text as Overview |

### 5.2 Technical

- Server: `PUT /api/trips/:groupId` validates (G3) and builds its update from the fields actually present (G4), emits `trip:updated` to the trip room with the changed fields, and calls the activity logger with old and new values.
- Client: `TripContext` listens for `trip:updated` and merges the fields, as it does for `trip:coverUpdated`.
- Dates stay UTC midnight calendar days. Do not send local times.
- Strings in `client/src/locales/{en,pt,es}.json`.
- Tests: client unit tests for the date text and phase after a change; the server has no test suite, so verify by hand and list the cases in the PR.

## 6. Open decisions

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Push notification when dates change | A. Activity feed only. B. Push for date changes, not for renames. C. Push for both | **B.** A new date affects people's plans; a typo fix does not. Uses the existing `notifyTrip` |
| D2 | Can origin and destination be edited here? | A. Name and dates only. B. Also origin and destination | **A.** Destination feeds AI suggestions and drafts; changing it needs its own rules (D6). Keep this spec small |
| D3 | Stops outside the new dates | A. Keep and mark. B. Ask to shift all stops by the same offset. C. Delete | **A.** Stops are exact instants and may be booked. Offer B later |
| D4 | Two organizers edit at once | A. Last save wins, everyone sees the result live. B. Version check with a conflict message | **A.** Rare, and live sync makes it visible |
| D5 | Who can edit | A. Organizer only. B. Any active member | **A.** Matches the server and the hosted-event model |
| D6 | AI suggestions and drafts made for the old dates | A. Leave them. B. Show "Made for the old dates" and offer to regenerate. C. Regenerate automatically | **B.** Principle 4: drafts stay editable and honest about their basis |

## 7. Acceptance criteria

1. Given I am the organizer, when I open the trip, then I see the pencil and the Dates Edit button.
2. Given I am a member, then I see neither, and a direct `PUT` returns 403.
3. Given I clear the name, then I cannot save and see an error.
4. Given an end date before the start, then I cannot save and see an error.
5. Given I save a new name, then every connected member sees it within a second without refreshing, and the Trips list shows it on next open.
6. Given I change the dates and 3 stops fall outside, then I see a confirmation naming 3 stops; after confirming, the stops still exist and Plan marks them.
7. Given I change the dates and no stops are affected, then it saves without a confirmation.
8. Given I choose "Not decided", then no end date and no range remain and the text reads "TBD".
9. Given a range of 8–10 days, then the text reads "~8–10 days" everywhere, not "TBD".
10. Given the change moves the trip into another phase, then Overview shows that phase on the next render.
11. Given a member uses Portuguese, then the activity lines for rename and dates are in Portuguese.
12. Given I send a `PUT` with only `name`, then dates, origin and destination are unchanged (G4).
13. Given the save fails, then the editor stays open with my input intact.

## 8. Build order

1. Server: validation, field-safe update, `trip:updated`, activity entries (G1–G4), with a manual test list.
2. Client: `TripContext` listener and the shared date text helper (F5, F12), with unit tests.
3. Shared trip form, then the editor and both entry points (F1–F4, F8).
4. Outside-range confirmation and Plan marker (F7).
5. Strings in three languages and the activity lines (F10).
6. Docs in the same PR: spec to shipped, `features.md`, roadmap, specs table; remove the backlog row.

Risk: low. The main one is G4; check what the update does with omitted fields before building on it.

## 9. Out of scope

Editing origin and destination (D2), shifting stops with the dates (D3), approval by members, co-organizer roles, the Countdown nudge, optional origin at creation.

## 10. Next step

The product owner reviews D1–D6 and approves, or overrides a recommendation. Then build on a feature branch.
