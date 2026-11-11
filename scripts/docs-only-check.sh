#!/usr/bin/env bash
# Refuse a branch that claims to be docs-only but is not (ww-D11).
#
#   scripts/docs-only-check.sh [base-ref]        # default: origin/main
#
# Compares HEAD with its merge base against <base-ref> and fails if anything
# outside docs/ or wireframes/ changed. wireframes/ counts as documentation:
# docs/README.md rule 7 tells a product session to save frames there as files,
# and stage 3 of the feature process produces them, so a guard that excluded
# them would have made wireframes the one output a product session could not
# commit. Two callers, one rule:
#   - step 3 of scripts/docs-commit.sh, before a product session pushes;
#   - CI, on every pull request whose head branch starts with "docs/".
# CI is the backstop, because the "ci" check is required on main and a hook
# only runs where Claude Code runs.
set -uo pipefail

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
outside="$(git diff --name-only "$merge_base" HEAD | grep -vE '^(docs|wireframes)/' || true)"

if [ -n "$outside" ]; then
  echo "This branch changes files outside docs/ and wireframes/:" >&2
  printf '  %s\n' $outside >&2
  cat >&2 <<'MSG'

A docs/… branch is for documentation only — docs/ and wireframes/
(ways-of-working.md §7.1, ww-D11).
If this is an engineering change, rename the branch — for example:

  git branch -m chore/<name> && git push -u origin chore/<name>

and close the pull request opened from the docs/… branch.
MSG
  exit 1
fi

echo "docs-only-check: ok, only docs/ and wireframes/ changed."
