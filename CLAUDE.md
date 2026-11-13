# Trip Planner

A real-time group trip planning app. Groups share an itinerary, vote, split costs and see live locations.

This file is read by both Claude Code (engineering) and the Claude Cowork project (product). Keep it short and factual.

## Layout

- `server/`: Node.js + Express API, Socket.io (optional Redis adapter), MongoDB via Mongoose. Sign-in is our own JWT (`services/auth.js`); Firebase Admin is used only for push notifications. Entry point is `server/index.js`. Code is split into `config/`, `middleware/`, `models/`, `routes/` and `services/`.
- `client/`: React 18 + TypeScript, built with Vite. Uses React Router, Leaflet maps and socket.io-client.
- `docs/`: product docs and feature specs. See [docs/README.md](docs/README.md). How the objects, documents and tooling fit together is [docs/process/system.md](docs/process/system.md).

## Commands

- Server: `npm run dev` (nodemon) or `npm start`, run from the repo root.
- Client: `npm run dev` or `npm run build`, run from `client/`.
- Client tests: `npm test` in `client/` runs Vitest. The server has no test suite yet; its `npm test` is a placeholder.
- Copy `.env.example` to `.env` for MongoDB, Firebase, and the optional Maps and Redis settings. Never commit `.env`.

## Product principles

These come from [docs/product/strategy.md](docs/product/strategy.md). Flag any change that conflicts with them.

1. One source of truth: itinerary, polls, expenses and comments live in the trip.
2. Real-time by default: changes reach every trip member without a refresh.
3. Privacy first: only active trip members can see a trip. Live location is opt-in and never stored.
4. AI suggestions are editable drafts, based on the trip's real accommodation and dates.

## Docs conventions

[docs/README.md](docs/README.md) is the source of truth. In short:

<!-- conventions-pin: 0c7f790c31cbe0b7600890ef1e2b9b1846a86759f4c9eb94cff33933fb314a32 -->
<!-- Summary of docs/README.md "How to write a spec", "When a spec ships" and "How to update".
     Change those and CI fails until someone re-reads this list and runs
     scripts/claude-md-mirror-check.sh --update. CLAUDE.md is loaded into every session,
     so a stale summary is followed by every session until someone notices. -->


- `docs/features.md` is living reference. It describes what the code does today.
- `docs/specs/NNN-short-name.md` are point-in-time decisions. Never rename, move or rewrite a shipped spec. Changes go in a new spec or an amendment section.
- Each spec starts with a `Status:` header (draft, approved, building, shipped or superseded) and is listed in the specs table in `docs/README.md`.
- Every spec from 005 on answers the fourteen design lenses in [docs/process/design-lenses.md](docs/process/design-lenses.md), one line each, in a `## Design lenses` section. `scripts/spec-lint.sh` checks it from `approved` onwards.
- When a spec ships, update the spec, `features.md`, `roadmap.md` and the specs table in the same PR as the feature.
- Write plainly: short sentences, tables where they help, no marketing tone. Items waiting on the product owner are marked **TBD**.
- A decision or finding code carries a short name after a `·` wherever a reader could meet it cold — the first mention in a section, every table row and heading, and every pull request or chat message (`D27 · Recommendations are working defaults`, `R1 · Org owner reach`). Not every occurrence: a range or a repeat in the same breath is already clear. [docs/process/naming.md](docs/process/naming.md) §5 resolves any code.
- Mark what is not known: **TBD** for the owner's decisions, `[assumption]` and `[unverified]` for claims and numbers with no source yet. A number carries its source and date, or a marker (ww-D16).
- Acceptance criteria are numbered and never renumbered once approved. From spec 013 on, the build order is a table with an **ACs** and a **Frames** column, and `scripts/spec-lint.sh` checks that every criterion lands in a row (trk-D7).

## Working across computers

- Pull `main` and your working branch at the start of every session.
- Commit and push at the end of every session, even for docs-only work. Uncommitted edits on one computer are invisible on the other.
- Shared tooling (such as the `/feature` command in `.claude/commands/`) lives in the repo. See "Working across accounts and computers" in [docs/README.md](docs/README.md).

## Who does what

- **Product (Cowork project):** edits `docs/product/`, `docs/brand/`, `docs/process/`, `docs/README.md`, draft specs in `docs/specs/` and `wireframes/`, plus `CLAUDE.md`, `AGENTS.md` and `scripts/*.sh` (ww-D18). `.claude/` changes are made in Claude Code, because the Cowork bridge cannot write it. Reads application code to check facts but never edits it, and leaves `.claude/`, `.github/` and data scripts to engineering. Its git is read-only and fast-forward — `git fetch`, `git pull --ff-only`, `git status`, `git log`, `git diff` — plus `scripts/docs-commit.sh`, which commits only those paths on a `docs/…` branch (ww-D6, ww-D8, ww-D13). Never commits by hand, merges, rebases, resets, or changes git config; those are Claude Code's. Pulls before editing; if the pull is refused, says so and names the commit it worked from. If Cowork blocks the push, the script prints the line to run from the computer, which pushes and opens the PR (ww-D9). It never merges and doesn't make up answers to TBDs.
- **Engineering (Claude Code):** builds features from specs, owns all code, all of `.claude/` and `docs/features.md`, and handles branches, commits and PRs for code, config and mixed changes. It reports its outcome into the repo or the board (the PR, the doc it changed, or the issue), never only into its chat (ww-D7).
- Work on a branch, never directly on `main`. PRs go to `main` on GitHub (`Fogataz/trip-planner`).
