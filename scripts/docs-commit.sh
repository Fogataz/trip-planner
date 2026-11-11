#!/usr/bin/env bash
# Commit and push documentation changes from a product session (ww-D6).
#
#   scripts/docs-commit.sh <branch-suffix> "<commit message>" [docs/path ...]
#
# Stages docs/ only (or just the docs/ paths given), and refuses if:
#   - you are not on main or on docs/<branch-suffix>;
#   - anything outside docs/ is staged;
#   - the branch already carries commits that touch files outside docs/.
# So a product session can never commit or push code with it.
set -euo pipefail

usage='usage: docs-commit.sh branch-suffix "commit message" [docs/path ...]'
suffix="${1:?$usage}"
message="${2:?$usage}"
shift 2
branch="docs/${suffix}"

cd "$(git rev-parse --show-toplevel)"

# 0. Check the inputs before touching any branch.
for path in "$@"; do
  case "$path" in
    docs/*) ;;
    *) printf 'Refusing: %s is outside docs/.\n' "$path" >&2; exit 1 ;;
  esac
done
outside="$(git diff --cached --name-only | grep -v '^docs/' || true)"
if [ -n "$outside" ]; then
  printf 'Refusing: these staged files are outside docs/:\n%s\nUnstage them first (git restore --staged <file>).\n' "$outside" >&2
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

# 2. Stage docs/ only, or just the docs/ paths given.
if [ "$#" -gt 0 ]; then
  git add -- "$@"
else
  git add -- docs/
fi

outside="$(git diff --cached --name-only | grep -v '^docs/' || true)"
if [ -n "$outside" ]; then
  printf 'Refusing: these staged files are outside docs/:\n%s\n' "$outside" >&2
  exit 1
fi

if git diff --cached --quiet; then
  echo "Nothing to commit under docs/."
else
  git commit -m "$message"
fi

# 3. Everything this branch adds on top of main must be docs/ only.
git fetch --quiet origin main || true
base="$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main)"
outside="$(git diff --name-only "$base" HEAD | grep -v '^docs/' || true)"
if [ -n "$outside" ]; then
  printf 'Refusing to push: %s changes files outside docs/:\n%s\nAsk Claude Code to handle this branch.\n' "$branch" "$outside" >&2
  exit 1
fi

git push -u origin "$branch"

# 4. Open the pull request, or say how to.
if ! command -v gh >/dev/null 2>&1; then
  echo "gh is not installed. Open the pull request from the link git printed above."
elif [ "$(gh pr view "$branch" --json state --jq .state 2>/dev/null || true)" = "OPEN" ]; then
  echo "Pull request already open: $(gh pr view "$branch" --json url --jq .url)"
else
  gh pr create --base main --head "$branch" --title "$message" --body "Docs-only change from a product session, committed with scripts/docs-commit.sh (ww-D6)."
fi
