# Agent instructions

Follow [CLAUDE.md](CLAUDE.md) and [docs/README.md](docs/README.md). They hold the working rules for every tool and account (Claude Code, Codex, Cowork). Do not copy rules into this file.

## Reading order

1. [CLAUDE.md](CLAUDE.md): layout, commands, product principles, who does what.
2. [docs/README.md](docs/README.md): doc conventions and the staged process from idea to shipped.
3. [docs/features.md](docs/features.md): what the product does today.
4. Only when working on a spec: the matching `docs/specs/NNN-*.md`, and [docs/product/working-doc.md](docs/product/working-doc.md) for product context.

## Feature workflow

Follow the stage table in `docs/README.md`, "How a feature goes from idea to shipped". No code until the spec is `Status: approved`. The `/feature` command in `.claude/commands/` is a Claude Code shortcut for the same stages; other tools follow the README directly.

## Always

- Pull at the start of a session, commit and push at the end.
- Work on a branch, never `main`. Do not merge a PR without the product owner's OK.
- Never answer a **TBD** or an open decision for the product owner.
