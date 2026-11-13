#!/usr/bin/env bash
# Refuse a docs/… branch that changes anything a product session may not change
# (ww-D11, widened by ww-D18).
#
#   scripts/docs-only-check.sh [base-ref]        # default: origin/main
#   scripts/docs-only-check.sh --pattern         # print the allowed-path rule
#
# Compares HEAD with its merge base against <base-ref> and fails if anything
# outside the allowed paths changed. The allowed paths are, since ww-D18:
#
#   docs/ and wireframes/          documentation (wireframes since ww-D13)
#   .claude/commands/, .claude/agents/, .claude/skills/
#   CLAUDE.md, AGENTS.md           the rules every session reads
#   scripts/*.sh                   the process scripts (lint, commit, checks)
#
# Still engineering's, and refused here: client/, server/, scripts/*.js and
# scripts/lib/ (data migrations), package files and lockfiles, .github/, and
# .claude/hooks/ and .claude/settings.json — the things that run on their own
# on someone's machine.
#
# The name predates ww-D18: "docs-only" now means "product-session paths".
# Two callers, one rule:
#   - scripts/docs-commit.sh, which reads --pattern before staging and runs
#     the full check before pushing;
#   - CI, on every pull request whose head branch starts with "docs/".
# CI is the backstop, because the "ci" check is required on main and a hook
# only runs where Claude Code runs.
set -uo pipefail

ALLOWED='^(docs|wireframes)/|^\.claude/(commands|agents|skills)/|^(CLAUDE|AGENTS)\.md$|^scripts/[^/]+\.sh$'

if [ "${1:-}" = "--pattern" ]; then
  printf '%s\n' "$ALLOWED"
  exit 0
fi

cd "$(git rev-parse --show-toplevel)" || exit 1

base="${1:-origin/main}"

if ! git rev-parse --verify --quiet "$base" >/dev/null; then
  git fetch --quiet origin main || true
  if ! git rev-parse --verify --quiet "$base" >/dev/null; then
    echo "docs-only-check: cannot resolve '$base'. Pass a ref that exists." >&2
    exit 1
  fi
fi

merge_base="$(git merge-base HEAD "$base")" || exit 1
outside="$(git diff --name-only "$merge_base" HEAD | grep -vE "$ALLOWED" || true)"

if [ -n "$outside" ]; then
  echo "This branch changes files a product session may not change:" >&2
  printf '  %s\n' $outside >&2
  cat >&2 <<'MSG'

A docs/… branch carries documentation and process tooling only: docs/,
wireframes/, .claude/commands|agents|skills/, CLAUDE.md, AGENTS.md and
scripts/*.sh (ways-of-working.md §7.1, ww-D11, ww-D18).
If this is an engineering change, rename the branch — for example:

  git branch -m chore/<name> && git push -u origin chore/<name>

and close the pull request opened from the docs/… branch.
MSG
  exit 1
fi

echo "docs-only-check: ok, only product-session paths changed."
