# 004 — Trip information architecture, lo-fi wireframes

Wireframes for [spec 004](../../docs/specs/004-trip-ia-redesign.md). Fifteen artboards
covering the four-destination information architecture.

## How to look at them

Open [`index.html`](index.html) in any browser. It is one self-contained page — no build,
no server, no account. Every frame is laid out at size with the annotation that ties it
back to a requirement (F*) or acceptance criterion (AC*) in the spec.

```bash
npx serve wireframes/004-trip-ia-redesign
```

(Opening the file directly with `file://` works too; the only thing it loses is the
webfont, which falls back to the system sans.)

## What is in here

| Path | What it is |
|---|---|
| `index.html` | All 15 frames on one page, with annotations. **Start here.** |
| `artboards/*.dc.html` | The individual frames, one file each. Source of truth. |
| `artboards/canvas.json` | Board positions, row titles and annotation text. |

The `.dc.html` files were authored on a Claude Design canvas. Each one is ordinary HTML
with inline styles wrapped in an `<x-dc>` element — readable and editable without any
Claude tooling, which is what rule 7 in [docs/README.md](../../docs/README.md) asks for.
`index.html` is generated from them, so if you edit an artboard by hand, update the page
to match.

## Reading conventions

- **Greyscale on purpose.** No brand colour, no type scale, no icon set. These frames are
  for arguing about structure — what sits where, and what is loudest. Visual design is a
  separate pass, and §12 of the spec puts it out of scope.
- **Solid border** = ships in this redesign.
- **Dashed border** = reserved slot. Renders nothing until that feature lands
  (R2 settlement, R3 transport, R4 notification preferences, chat).
- **Flat grey block** = cover image (spec 001, already shipped).

## The five rows

1. **Arriving** — the trips list, and a brand-new trip (Overview · Setup).
2. **Overview adapts to the phase** — Planning, Countdown, Live, Wrap. The four tabs never
   move across any of them; only the content stack changes. This row is the argument.
3. **The three fixed destinations** — Plan (and its empty state), Money (owing and
   settled), Group.
4. **Modes, not tabs** — the live map, and the assistant sheet.
5. **Desktop** — same four routes, segmented tabs instead of a bottom bar.

## Status

Frames complete. The tree test in §10 of the spec has **not** been run, so these have not
been validated with users. The spec is `draft` and has not passed the approval gate.
