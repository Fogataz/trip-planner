#!/usr/bin/env bash
# PostToolUse hook: after a spec is written, say what the spec is missing (ww-D10).
#
# The rule itself lives in one place only — scripts/spec-lint.sh, which CI runs
# too. This wrapper decides whether the edited file is a spec and turns the
# script's output into a block, so the session fixes it in seconds instead of
# finding out on the pull request. It exits silently for every other file.
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

case "$rel" in docs/specs/*.md) ;; *) exit 0 ;; esac

output="$(scripts/spec-lint.sh --hook "$rel" 2>&1)" && exit 0

printf '%s' "$output" | node -e '
let s = "";
process.stdin.on("data", d => s += d).on("end", () => {
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: "spec-lint (ww-D10): " + s.trim() +
      "\nAdd the missing sections, or set Status back to draft. The lenses are in docs/process/design-lenses.md."
  }));
});'
