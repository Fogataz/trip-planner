#!/usr/bin/env bash
# Commit and push a product session's changes (ww-D6, widened by ww-D18).
#
#   scripts/docs-commit.sh <branch-suffix> "<commit message>" [path ...]
#
# Stages only the paths a product session may change — documentation and the
# process tooling (scripts/docs-only-check.sh --pattern is the one rule) — or
# just the paths given, and refuses if:
#   - you are not on main or on docs/<branch-suffix>;
#   - anything outside those paths is staged;
#   - the branch already carries commits that touch files outside them.
# So a product session can never commit or push application code with it.
# If the push is blocked (Cowork's network policy, ww-D9), it prints the line to
# run from a terminal on the computer: the same command, which then just pushes.
set -euo pipefail

usage='usage: docs-commit.sh branch-suffix "commit message" [path ...]'
suffix="${1:?$usage}"
message="${2:?$usage}"
shift 2
branch="docs/${suffix}"

cd "$(git rev-parse --show-toplevel)"

allowed="$(scripts/docs-only-check.sh --pattern)"
refusal='Refusing: %s is outside what a product session may commit (docs-only-check.sh --pattern).\n'

# 0. Check the inputs before touching any branch.
for path in "$@"; do
  if ! printf '%s\n' "$path" | grep -qE "$allowed"; then
    printf "$refusal" "$path" >&2
    exit 1
  fi
done
outside="$(git diff --cached --name-only | grep -vE "$allowed" || true)"
if [ -n "$outside" ]; then
  printf 'Refusing: these staged files are outside what a product session may commit:\n%s\nUnstage them first (git restore --staged <file>).\n' "$outside" >&2
  exit 1
fi

# 1. Only start from main or from the target docs branch, so no other
#    branch's commits can ride along.
current="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current" = "main" ]; then
  git pull --ff-only --quiet origin main || echo "Warning: could not update main; branching from the local copy." >&2
  if git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "Refusing: $branch already exists. Check it out first, or pick another suffix." >&2
    exit 1
  fi
  git checkout -b "$branch"
elif [ "$current" != "$branch" ]; then
  printf 'Refusing: you are on %s. Start from main or from %s.\n' "$current" "$branch" >&2
  exit 1
fi

# 2. Stage the paths given, or every changed file under the allowed paths
#    (modified, new or deleted). A loop, not mapfile: macOS ships bash 3.2.
if [ "$#" -gt 0 ]; then
  git add -A -- "$@"
else
  git ls-files -m -o -d --exclude-standard | sort -u | grep -E "$allowed" | while IFS= read -r f; do
    git add -A -- "$f"
  done || true
fi

outside="$(git diff --cached --name-only | grep -vE "$allowed" || true)"
if [ -n "$outside" ]; then
  printf 'Refusing: these staged files are outside what a product session may commit:\n%s\n' "$outside" >&2
  exit 1
fi

if git diff --cached --quiet; then
  echo "Nothing to commit."
else
  git commit -m "$message"
fi

# 3. Everything this branch adds on top of main must be within the allowed
#    paths. One rule in one place: scripts/docs-only-check.sh, which CI runs on
#    every docs/… pull request too (ww-D11).
git fetch --quiet origin main || true
base_ref="origin/main"
git rev-parse --verify --quiet "$base_ref" >/dev/null || base_ref="main"
if ! scripts/docs-only-check.sh "$base_ref"; then
  printf 'Refusing to push %s. Ask Claude Code to handle this branch.\n' "$branch" >&2
  exit 1
fi

if ! git push -u origin "$branch"; then
  printf 'Push blocked from here. The commit is on %s. From a terminal on your computer, run:\n  cd %s && scripts/docs-commit.sh %s "%s"\n' \
    "$branch" "$(pwd)" "$suffix" "$message" >&2
  exit 1
fi

# 4. Open the pull request, or say how to.
if ! command -v gh >/dev/null 2>&1; then
  echo "gh is not installed. Open the pull request from the link git printed above."
elif [ "$(gh pr view "$branch" --json state --jq .state 2>/dev/null || true)" = "OPEN" ]; then
  echo "Pull request already open: $(gh pr view "$branch" --json url --jq .url)"
else
  gh pr create --base main --head "$branch" --title "$message" --body "From a product session, committed with scripts/docs-commit.sh (ww-D6, ww-D18)."
fi
