#!/usr/bin/env bash
# PostToolUse hook: after the docs conventions move, say so before the pull
# request does (ww-D14).
#
# The rule lives in one place only — scripts/claude-md-mirror-check.sh, which
# CI runs too. This wrapper decides whether the edited file is one of the two
# that matter and turns a mismatch into a block, so the session re-pins in
# seconds instead of finding out in CI. It exits silently for every other file.
#
# Same shape as spec-lint.sh, and the same reasoning as ww-D10: the hook gives
# the feedback immediately, CI is the part nobody can skip.
set -uo pipefail

input="$(cat)"

read_json() {
  printf '%s' "$input" | node -e '
let s = "";
process.stdin.on("data", d => s += d).on("end", () => {
  try {
    const j = JSON.parse(s);
    const ti = j.tool_input || {};
    process.stdout.write(ti.file_path || ti.notebook_path || "");
  } catch (e) { /* malformed input: say nothing, block nothing */ }
});'
}

file="$(read_json)"
[ -n "$file" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$root" || exit 0
rel="${file#"$root"/}"
rel="${rel//\\//}"

# Only these two files can move the pin out of alignment.
case "$rel" in
  docs/README.md|CLAUDE.md) ;;
  *) exit 0 ;;
esac

output="$(scripts/claude-md-mirror-check.sh 2>&1)" && exit 0

printf '%s' "$output" | node -e '
let s = "";
process.stdin.on("data", d => s += d).on("end", () => {
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: "claude-md-mirror (ww-D14): " + s.trim()
  }));
});'
