# Copilot instructions

Follow [AGENTS.md](../AGENTS.md). It holds the reading order and points at the working rules in
[CLAUDE.md](../CLAUDE.md) and [docs/README.md](../docs/README.md). **Do not copy rules into this
file** — one set of rules, reachable from every tool.

Picking up the hosted event pilot build? Read
[docs/process/build-handover.md](../docs/process/build-handover.md) first.

## The two that are easiest to get wrong

- **No code until the spec says `Status: approved`.** The gate is in `docs/README.md`.
- **Work on a branch, never `main`.** A `docs/…` branch may only touch `docs/` and `wireframes/` —
  CI enforces it. Code goes on `feat/…`, `fix/…` or `chore/…`.

## Before you push

```bash
npm run check        # everything CI fails you for, about a minute
npm run check:fast   # docs and server only, a few seconds
```

That is the same set CI runs, minus `npm audit`, which CI reports and never fails on. You do not
get the inline feedback a Claude Code session gets from its hooks — this command is how you get it
anyway.

> This file exists because the guides disagree about which instruction files Copilot reads in which
> surface. AGENTS.md and CLAUDE.md are both documented as supported by the coding agent
> ([GitHub changelog](https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions)),
> but a three-line pointer costs nothing and removes the doubt.
