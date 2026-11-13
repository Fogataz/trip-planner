# Agent instructions

Follow [CLAUDE.md](CLAUDE.md) and [docs/README.md](docs/README.md). They hold the working rules for every tool and account (Claude Code, Codex, Cowork). Do not copy rules into this file.

## Reading order

1. [CLAUDE.md](CLAUDE.md): layout, commands, product principles, who does what.
2. [docs/README.md](docs/README.md): doc conventions and the staged process from idea to shipped.
3. [docs/features.md](docs/features.md): what the product does today.
4. Only when working on a spec: the matching `docs/specs/NNN-*.md`, and [docs/product/working-doc.md](docs/product/working-doc.md) for product context.

**Picking up the hosted event pilot build?** Read [docs/process/build-handover.md](docs/process/build-handover.md) instead of the list above. It is the "you have the repo and nothing else" page: read order, build order, the traps, and the decisions already taken. Specs [002](docs/specs/002-hosted-event-pilot.md), [011](docs/specs/011-roles-and-permissions.md) and [012](docs/specs/012-joining-naming-and-the-first-trip.md) are approved; epic [#20](https://github.com/Fogataz/trip-planner/issues/20) is first and blocks every other slice.

## Feature workflow

Follow the stage table in `docs/README.md`, "How a feature goes from idea to shipped". No code until the spec is `Status: approved`. The `/feature` command in `.claude/commands/` is a Claude Code shortcut for the same stages; other tools follow the README directly.

## Always

- Pull at the start of a session, commit and push at the end.
- Work on a branch, never `main`. Do not merge a PR without the product owner's OK.
- Never answer a **TBD** or an open decision for the product owner.

## What is Claude Code only, and what replaces it

The hooks and commands under `.claude/` do not run in Codex, Copilot or any other tool. **Nothing is lost by that** — every rule they enforce is also a CI check on the pull request, which is the part nobody can skip:

| Claude Code only | Runs for everyone |
|---|---|
| `.claude/commands/` (`/feature`, `/epic`, …) | The stage table in `docs/README.md` — follow it directly |
| `.claude/hooks/spec-lint.sh` | `scripts/spec-lint.sh`, in CI and runnable by hand |
| `.claude/hooks/claude-md-mirror.sh` | `scripts/claude-md-mirror-check.sh`, same |
| `.claude/skills/` | The process docs they are built from, under `docs/process/` |
| `.claude/agents/reviewer.md` | The review rules in `docs/process/ways-of-working.md` §3 and `docs/process/pipeline.md` §6.4 and §6.6 — run the review in a fresh session that did not build the change, and sort findings into must fix, follow-up and nit |

So a session in another tool gets the same answer, just later — on the pull request instead of inside the edit.

**One command closes that gap:**

```bash
npm run check        # everything CI fails you for, about a minute
npm run check:fast   # docs and server only, a few seconds
```

Run it before you push and the difference disappears.
