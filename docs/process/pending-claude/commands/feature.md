---
description: Take a feature from idea to shipped through a staged process: audit, benchmark, define, wireframes, spec, gate, build, docs
argument-hint: <feature name or spec number>
---

Work on the feature: $ARGUMENTS

This command is product-agnostic. It defines the stages. The project's own docs (`CLAUDE.md`, `AGENTS.md`, `docs/README.md` or the equivalent) define the specifics: folder names, spec template, status values, branch and merge rules, product principles, the design-lens standard, who may edit what. Read them first. Where they conflict with this file, the project docs win.

## Before you start

1. Find the feature. If `$ARGUMENTS` is a spec number, open that spec. If it is a name, check the specs folder, the backlog and the roadmap. If a backlog entry exists, start from it and do not duplicate it. If nothing exists, start at stage 0.
2. Report the spec's current status and the next stage. Then do only that stage.
3. Pull the latest main and your working branch. Work on a branch, never on `main`. If another session has uncommitted work in this checkout, use a separate worktree.
4. Check the product principles. Flag any conflict before going further.
5. Decisions that belong to the product owner stay listed as open decisions with options and a recommendation. Never answer them. Never invent answers to items marked TBD.

## Size the work first

State the size and the reason, and let the owner override it.

| Size | Typical case | Stages |
|---|---|---|
| Small | Fix or tweak, no new screen | 0, then build |
| Medium | New UI or behavior on an existing screen | 0, 1 (light: 2–3 comparable products), 2, 3, 4 |
| Large | New area, new model, or a new kind of user | All stages, full benchmark |

## Stages

**0. Audit the current state.** Describe what exists today before proposing anything.
- Save screenshots of the relevant screens in the wireframes folder under `current/`. Use the ones the owner attached, or capture them.
- List what the product already does for this feature: the code paths (UI, API, data model), the docs and the backlog entries.
- Write down gaps, bugs and risks you find, even outside the request. Keep them in a separate list from the requested scope.
- Output: an "Audit" section in the spec.

**1. Benchmark.** Look at comparable products. For each: what they do, what we take, what we avoid, with source links. Do not cite what you have not checked. Output: a "Benchmark" section.

**2. Define.** Options, trade-offs and a recommendation. Include:
- The principles check.
- **The project's design lenses, applied as questions** (here: `docs/process/design-lenses.md`, fourteen of them). Each one you cannot answer is either an option for the owner or something not designed yet. If the project has no lens standard, cover at least: who may do it, how other users see it, languages and locale, validation and error states, existing data and migration, and analytics.
- Adjacent improvements found in the audit, each marked in scope, later, or rejected, with a reason.
- Output: experience and requirements in the spec.

**3. Wireframes.** Lo-fi frames, one per screen or state, numbered, annotated and tied to requirement IDs. Show the current screen beside the proposed one. Cover the empty, error, loading and no-permission states. Save them as files in the repo, so they survive across accounts and tools, with a README that says per frame whether it is built yet. Link them from the spec.

**4. Spec.** Written from the project's template with `Status: draft`, added to the specs index. Every owner decision is an open decision with options and a recommendation. Acceptance criteria are numbered, testable and cover what the lenses turned up. **The lenses come back as answers**: one line per lens in a `## Design lenses` section, `n/a` where one does not apply. **The build order names, per row, the acceptance criteria it satisfies and the frames it builds**, so every criterion lands in a row. Numbers carry a source or the project's evidence marker. Run the project's spec check before showing it (here: `scripts/spec-lint.sh docs/specs/NNN-*.md`).

**Gate.** First, if the project has an independent reviewer (here: `.claude/agents/reviewer.md`, mode `spec`), give it the spec and nothing from this conversation, and show its verdict to the owner. Must-fix findings are fixed before asking for approval. Then: do not write code until the spec is approved and its decisions are answered or carry a recommendation the owner accepted as the working default. If it is not approved, stop and say what is missing.

**5. Build.** On a branch, in the spec's build order, checked against its acceptance criteria. Add tests for the logic you add. When you build a frame, update its line in the wireframes README. Leave no `TODO` comment in place of a follow-up: if something is out of scope, say so in the pull request so the review files it.

**6. Docs.** In the same pull request: set the spec to shipped with date and PR; update the living feature reference, the roadmap and the specs index. Open the PR; do not merge without the owner's OK.

## After the feature

Note what slowed the process or what you had to guess. If a stage or checklist line would have helped, propose the change to this file in a separate pull request, and keep it general.

## Hand over

If the project defines a chain of commands (here: `docs/process/pipeline.md` §4), end by naming the next one:
- after stage 4 (spec drafted): "Next: read the reviewer's verdict, then approve the spec; `/epic <spec>` to link the spec and set fields";
- after the gate: "Next: `/epic <spec>` to create one story per build-order row";
- after opening a pull request: "Next: `/pr <number>` from a session that did not build this";
- after it ships: "Next: `/audit <spec>` once it is live".

## Session hygiene

Commit and push at the end of every session, even for docs-only work, so other computers and accounts see it. Say which files changed.
