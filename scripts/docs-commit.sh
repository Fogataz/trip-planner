#!/usr/bin/env bash
# Commit and push documentation changes from a product session (ww-D6).
# Stages docs/ and nothing else, and refuses if anything else reaches the index.
set -euo pipefail

suffix="${1:?usage: docs-commit.sh branch-suffix commit-message}"
message="${2:?usage: docs-commit.sh branch-suffix commit-message}"
branch="docs/${suffix}"

git rev-parse --abbrev-ref HEAD | grep -qx "$branch" || git checkout -b "$branch"
git add -- docs/

outside="$(git diff --cached --name-only | grep -v '^docs/' || true)"
if [ -n "$outside" ]; then
  printf 'Refusing: these staged files are outside docs/:\n%s\n' "$outside" >&2
  exit 1
fi

git diff --cached --quiet && { echo "Nothing to commit under docs/."; exit 0; }
git commit -m "$message"
git push -u origin "$branch"
gh pr create --base main --fill
