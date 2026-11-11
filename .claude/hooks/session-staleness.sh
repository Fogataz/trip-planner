#!/usr/bin/env bash
# SessionStart hook: say how stale this clone is, and never change it (ww-D12).
#
# Pull before you start is rule 2 in docs/README.md, "Working across accounts
# and computers", and the step most likely to be skipped. This hook does the
# read-only half — git fetch — and reports. It never pulls: an invisible pull
# can land on a dirty tree or mid-rebase, and can move the branch under a
# session that has already read files.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}" || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
lines=()

# Never block on a prompt, and give up on a slow network rather than hanging.
if GIT_TERMINAL_PROMPT=0 git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=10 \
     fetch --quiet origin main 2>/dev/null; then
  behind="$(git rev-list --count "HEAD..origin/main" 2>/dev/null || echo 0)"
  if [ "$behind" -gt 0 ]; then
    if [ "$branch" = "main" ]; then
      lines+=("main is $behind commit(s) behind origin/main. Pull before you edit: git pull --ff-only origin main")
    else
      lines+=("Branch $branch is $behind commit(s) behind origin/main.")
    fi
  else
    lines+=("Up to date with origin/main.")
  fi
else
  lines+=("Could not reach origin, so this clone's freshness is unknown. Do not assume it is current.")
fi

dirty="$(git status --porcelain 2>/dev/null | grep -c . || true)"
[ "${dirty:-0}" -gt 0 ] && lines+=("$dirty file(s) uncommitted. Commit and push before the session ends, even for docs-only work.")

printf '%s\n' "${lines[@]}" | node -e '
let s = "";
process.stdin.on("data", d => s += d).on("end", () => {
  const text = "Clone state (SessionStart hook, read-only): " + s.trim().replace(/\n/g, " ");
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text }
  }));
});'
