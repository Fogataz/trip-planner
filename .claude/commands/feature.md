---
description: Take a feature from idea to shipped through a staged process: audit, benchmark, define, wireframes, spec, gate, build, docs
argument-hint: <feature name or spec number>
---

Work on the feature: $ARGUMENTS

This command is product-agnostic. It defines the stages. The project's own docs (`CLAUDE.md`, `AGENTS.md`, `docs/README.md` or the equivalent) define the specifics: folder names, spec template, status values, branch and merge rules, product principles, who may edit what. Read them first. Where they conflict with this file, the project docs win.

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
- An impact checklist. Mark each line as affected, not affected, or open: who may do it (permissions); how other users see it (live sync, notifications, activity history); languages and locale; validation and error states; data that already exists and may be affected; analytics; migration.
- Adjacent improvements found in the audit, each marked in scope, later, or rejected, with a reason.
- Output: experience and requirements in the spec.

**3. Wireframes.** Lo-fi frames, one per screen or state, annotated and tied to requirement IDs. Show the current screen beside the proposed one. Cover the empty, error, loading and no-permission states. Save them as files in the repo, so they survive across accounts and tools. Link them from the spec.

**4. Spec.** Written from the project's template with `Status: draft`, added to the specs index. Every owner decision is an open decision with options and a recommendation. Acceptance criteria are testable and cover the impact checklist.

**Gate.** Do not write code until the spec is approved and its decisions are answered or carry a recommendation the owner accepted as the working default. If it is not approved, stop and say what is missing.

**5. Build.** On a branch, in the spec's build order, checked against its acceptance criteria. Add tests for the logic you add.

**6. Docs.** In the same pull request: set the spec to shipped with date and PR; update the living feature reference, the roadmap and the specs index. Open the PR; do not merge without the owner's OK.

## After the feature

Note what slowed the process or what you had to guess. If a stage or checklist line would have helped, propose the change to this file in a separate pull request, and keep it general.

## Hand over

If the project defines a chain of commands (here: `docs/process/pipeline.md` §4), end by naming the next one:
- after stage 4 (spec drafted): "Next: `/epic <spec>` to link the spec and set fields";
- after the gate: "Next: `/epic <spec>` to create one story per build-order row";
- after it ships: "Next: `/audit <spec>` once it is live" (`/audit` is planned for December; until it exists, say so).

## Session hygiene

Commit and push at the end of every session, even for docs-only work, so other computers and accounts see it. Say which files changed.
