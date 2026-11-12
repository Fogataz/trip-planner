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
bash scripts/spec-lint.sh
bash scripts/claude-md-mirror-check.sh
cd client && npm run build && npm test
```

CI runs all of these on every pull request, plus a server syntax check and `npm audit` on both
package trees.

> This file exists because the guides disagree about which instruction files Copilot reads in which
> surface. AGENTS.md and CLAUDE.md are both documented as supported by the coding agent
> ([GitHub changelog](https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions)),
> but a three-line pointer costs nothing and removes the doubt.
