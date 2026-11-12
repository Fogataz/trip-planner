#!/usr/bin/env bash
# Everything CI will fail you for, in one command, before you push.
#
# Why this exists: the .claude/ hooks give a Claude Code session the same
# answers inside the edit, in seconds. Codex, Copilot and a person get them
# only when the pull request goes red. That is the one real difference between
# agents working in this repo, and the fix is not more hooks — it is making the
# local path a single command nobody has to remember four pieces of.
#
# Mirrors .github/workflows/ci.yml step for step, except `npm audit`, which CI
# runs with continue-on-error and never fails a build on.
#
# Usage:
#   npm run check          # from the repo root
#   scripts/check.sh       # the same
#   scripts/check.sh --fast   # docs and server only: no client build or tests
#
# Decided 2026-11-12 (ww-D15).

set -uo pipefail
cd "$(dirname "$0")/.."

FAST=0
[ "${1:-}" = "--fast" ] && FAST=1

failed=0
run() {
  local label="$1"; shift
  printf '\n\033[1m› %s\033[0m\n' "$label"
  if "$@"; then
    printf '  \033[32mok\033[0m\n'
  else
    printf '  \033[31mFAILED\033[0m\n'
    failed=1
  fi
}

run "Spec sections and design lenses" bash scripts/spec-lint.sh
run "CLAUDE.md mirrors the docs conventions" bash scripts/claude-md-mirror-check.sh
run "Role labels do not inflect for gender" bash scripts/locale-lint.sh

run "Server syntax" bash -c "find server -name '*.js' -not -path '*/node_modules/*' -print0 | xargs -0 -n1 node --check"

if [ "$FAST" -eq 1 ]; then
  printf '\n(--fast: skipped the client build and tests)\n'
else
  if [ -d client/node_modules ]; then
    run "Client types and build" bash -c "cd client && npm run build"
    run "Client tests" bash -c "cd client && npm test"
  else
    printf '\n\033[33m› Client build and tests skipped: client/node_modules is missing.\033[0m\n'
    printf '  Run: cd client && npm install\n'
    printf '  CI will still run them, so do not push on this alone.\n'
    failed=1
  fi
fi

printf '\n'
if [ "$failed" -eq 0 ]; then
  printf '\033[32mAll checks passed.\033[0m CI runs the same ones, plus npm audit (report only).\n'
  exit 0
fi
printf '\033[31mSomething above failed.\033[0m Fix it before pushing — CI runs the same checks.\n'
exit 1
