# 010 — Joining and naming, lo-fi wireframes

Wireframes for [spec 010](../../docs/specs/010-joining-naming-and-the-first-trip.md)
(**Status: draft**). Thirteen frames.

Includes the **three screens [spec 002](../../docs/specs/002-hosted-event-pilot.md) §6 left
undrawn** — create an Organization (F1), the Organization member list (F2) and trip people
and roles (F4). They live here rather than in the [002 set](../002-hosted-event-pilot/)
because what they show is decided by spec 010's open decisions, not by 002.

## How to look at them

```bash
npx serve wireframes/010-joining-and-naming
```

Same conventions as the [002 set](../002-hosted-event-pilot/README.md): greyscale, phone
first at 390×844, grey block = image, dashed box = explanatory copy or a drop target.

Two kinds of annotation:

- **Orange** — the frame's requirements, as in the 002 set.
- **Blue** — this frame fixes a **QA finding** (Q1–Q12, spec 010 §4), and the annotation
  names what the current spec or frame does instead.

## The frames

| # | Frame | Covers | Fixes |
|---|---|---|---|
| 1 | Join page — hosted, in an Organization | 010 §5.4, O4 · 002 F12, S1 | Q3, Q8 |
| 2 | Join page — personal trip | 010 §5.3, §5.4, O3 | Q1, Q8 |
| 3 | Request to join — email-link path | 010 §5.5, O5 · 002 F14 | Q4, Q10 |
| 4 | Waiting — with the profile offer | 010 §5.6, O6 · 007 | Q5 |
| 5 | New trip | 010 O-F11, O1 · 009 §5.2 | Q2 |
| 6 | **Trip people and roles** | **002 F4** · 009 §6.3 · 010 §5.3 | — (undrawn until now) |
| 7 | Change role — with the last-host guard | 009 G1, G3, §6.3 · 002 F4 | — |
| 8 | **Create an Organization** | **002 F1** · 010 O1 | Q6, Q9 |
| 9 | **Organization members** | **002 F2** · 009 G2, F5 | — (undrawn until now) |
| 10 | Move a trip into an Organization | 009 case 10 · 010 O7, O-F4 | Q7 |
| 11 | **Invited — one tap in** | 010 §5.8, O-F12, O11, O12 · 002 F17 | **Q13** |
| 12 | Host: invite people (bulk) | 010 §5.9.2, O-F17, O9 · 002 F2 | Q15 |
| 13 | The same screen in Español | 010 §6.2, §6.3, §6.4, O8 · 003 §6 | Q18 |

## Open decisions drawn as the working default

| # | Assumed | Frames |
|---|---|---|
| O1 | An Organization is never required | 5, 8, 10 |
| O3 | Role labels follow the trip kind | 2, 6, 7 |
| O4 | Organization above, person with a face below | 1, 2 |
| O5 | First name asked on the email-link path only | 3 |
| O6 | Profile offered while waiting, never required | 4 |
| O7 | Move path: data in block 1, screen in Phase 1 | 10 |
| O8 | Ungendered role labels in ES and pt-BR | 13 |
| O9 | First invitations go in the event's language | 12 |
| O11 | A count of who is going, never names, from 3 up | 11 |
| O12 | Privacy note once per person, not per trip | 11 |

**Two matter most.** If **O1** lands on "an Organization is required", frame 5 gains a gate
before the trip exists, frame 8 stops being contextual and frame 10 loses its purpose. If
**door A** (§5.8) is not taken, frame 11 disappears and the pilot's 38 invited attendees all
go through request-and-wait for a decision their host already made.

**O8 is blocked on someone else.** The Spanish and Portuguese role labels in frame 13 are a
proposal for the native reviewers named in [spec 003](../../docs/specs/003-localization.md)
§6 — not final copy, and not something to write into a locale file first.

Two frames also depend on decisions in [spec 009](../../docs/specs/009-roles-and-permissions.md):
**R1** (frame 10's second "what changes" line is false if an org owner can never claim a
trip) and **R2** (frame 9's removal behaviour).

## Not drawn

The Organization switcher and trip list stay as [002 frame 13](../002-hosted-event-pilot/index.html),
minus the permanent "Create an Organization" row (Q6). Everything else in the 002 set is
unchanged by this spec.

Out of scope: the Organization home page beyond the member list, billing and payouts,
interests onboarding, avatars beyond frame 4's offer ([spec 007](../../docs/specs/007-profiles-and-display-names.md)
owns profiles), moving a trip back out of an Organization, and whether "Organization" is the
right word at all — **O2**, which belongs with [brand foundations](../../docs/brand/brand-foundations.md) §3.
