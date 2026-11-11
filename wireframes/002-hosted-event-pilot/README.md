# 002 — Hosted event pilot, lo-fi wireframes

Wireframes for [spec 002](../../docs/specs/002-hosted-event-pilot.md) (**Status: draft**).
The thirteen frames proposed in §6 of that spec, drawn so the spec can go to the approval
gate with something to look at.

## How to look at them

Open [`index.html`](index.html) in any browser. One self-contained page — no build, no
server, no account.

```bash
npx serve wireframes/002-hosted-event-pilot
```

Opening the file directly with `file://` works too; the only thing it loses is the webfont,
which falls back to the system sans.

## Reading conventions

- **Greyscale on purpose.** No brand colour, no type scale, no icon set. These frames are
  for arguing about structure — what sits where, what is loudest, and what is deliberately
  absent. Visual design is a separate pass.
- **Grey block** = an image (cover, avatar).
- **Dashed box** = a drop target or a piece of explanatory copy, *not* a reserved feature.
  (This differs from [004](../004-trip-ia-redesign/README.md), where dashed meant a slot
  waiting for a later feature. Spec 002 has no reserved slots.)
- Every frame carries an annotation naming the requirements (F), non-functionals (N),
  acceptance criteria (AC) and open decisions (S) it has to satisfy.

## The frames

| # | Frame | Covers |
|---|---|---|
| 1 | Join page (logged out) | F8, F12, S1 · AC 9 |
| 2 | Email link sent | F8, F36 · AC 6 |
| 3 | Privacy note | N3, N4 |
| 4 | Request sent / waiting | F13, F15, F16, S6 · AC 11 |
| 5 | Host: join requests | F14, F16 · AC 10, AC 12 |
| 6 | Host: invite link panel | F11, F30 · AC 13 |
| 7 | Host: import agenda | F18, F19, N2, S2 · AC 20 |
| 8 | Host: review draft | F20, F21, F22 · AC 17, AC 18 |
| 9 | Event home with announcements | F25, F26, F35, S8 · AC 23, AC 28 |
| 10 | Host: post announcement | F25, F28, S6, S8 · AC 23, AC 29 |
| 11 | Member: notification settings | F27, F28, F29 · AC 22, AC 24 |
| 12 | Language switcher | F33, F34, F36, F37, N5, S5 · AC 27 |
| 13 | Organization switcher | F1, F3, F5, S7 · AC 1, AC 2 |

## Open decisions drawn as the working default

The frames assume the §9 recommendations, per D27. They are **not** owner decisions, and
overriding one changes the frame listed against it:

| # | Assumed | Frame |
|---|---|---|
| S1 | Join page shows name, dates, host, cover | 1 |
| S2 | Paste plus `.md`, `.txt`, `.csv` | 7 |
| S6 | Manifest and in-app only on iPhone | 4, 10 |
| S7 | Anyone may create an Organization, not promoted | 13 |
| S8 | Announcements are one-way | 9, 10 |

## Gaps to settle before the build

Three screens spec 002 requires that §6 did not list, so they are not drawn:

1. **Create an Organization** (F1).
2. **Organization member list** — add and remove people by email as admin or member (F2).
   §10 puts an Organization home page out of scope "beyond the switcher and member list",
   so the member list is in scope and has no frame.
3. **Trip people and roles** — where a host moves someone between host, co-host and guest
   (F4, "manage roles").

All three belong to epic [#20](https://github.com/Fogataz/trip-planner/issues/20), which is
build-order part 1. They are small and conventional, but they are screens, and they are the
product owner's call rather than something to invent here.

**Drawn 2026-11-11** in [`wireframes/012-joining-and-naming/`](../012-joining-and-naming/)
as frames 6, 8 and 9, together with a QA pass (Q1–Q12) over the thirteen frames here.
**Frames 1 and 4 of this set have corrected versions there** — frame 1 shows no Organization
at all, and frame 4 is a dead end for the whole approval wait.

**Added 2026-11-11.** What screen 3 has to show now depends on two open decisions in
[spec 011](../../docs/specs/011-roles-and-permissions.md) §13: **R1** (can an Organization
owner claim a trip they hold no role on?) and **R2** (what happens to trip roles when
someone leaves the Organization?). Frame 13's dashed note — "belonging to an Organization
does not open its events" — is drawn on R1 option (a), the strictest reading. If R1 lands
on (b) Claim, that note gains a second line and the Organization row gains an action.

## Not drawn

Spec 002 §10, out of scope: RSVP, capacity, check-in and guest forms; an Organization home
page; public event pages and discovery; payments; interests onboarding; the activity feed
UI; chat and comments; Apple sign-in; announcements by email; machine translation of
content.
