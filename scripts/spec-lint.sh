#!/usr/bin/env bash
# Check that a spec carries the sections docs/README.md requires (ww-D10).
#
#   scripts/spec-lint.sh [--hook] [docs/specs/NNN-name.md ...]
#
# --hook is for the PostToolUse hook: it stays silent when nothing is wrong and
# skips the specs-table check, because a session writes the spec file before it
# writes the table row. CI runs the full check.
#
# With no arguments, checks every spec. Run by CI on the specs a pull request
# touches, by the PostToolUse hook in .claude/settings.json, and by /feature at
# stage 4. It checks that a question was answered, never whether the answer is
# good: that judgment is the reviewer's (/pr).
#
# Every spec needs a Status header and a row in the specs table. From
# "approved" onwards it also needs acceptance criteria, open decisions, a build
# order, and a design-lenses section carrying every lens code L1-L14
# (docs/process/design-lenses.md). A draft is never blocked, so a seed draft
# still costs nothing.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1

LENS_COUNT=14

# Specs 001-004 were written before the lenses existed, and a shipped spec is
# never rewritten (docs/README.md). Their sections are not checked. The lenses
# start at 005.
GRANDFATHERED_THROUGH=4

failed=0
checked=0
hook_mode=0

args=()
for arg in "$@"; do
  case "$arg" in
    --hook) hook_mode=1 ;;
    *) args+=("$arg") ;;
  esac
done
set -- ${args[@]+"${args[@]}"}

files=("$@")
if [ "${#files[@]}" -eq 0 ]; then
  while IFS= read -r f; do files+=("$f"); done < <(ls docs/specs/*.md 2>/dev/null)
fi
if [ "${#files[@]}" -eq 0 ]; then
  [ "$hook_mode" -eq 0 ] && echo "spec-lint: no specs to check."
  exit 0
fi

# A heading matches on its words, so our numbered headings ("## 9. Acceptance
# criteria") pass without the lint caring about the number.
has_heading() { grep -qiE "^#{1,6}[[:space:]]*[0-9.]*[[:space:]]*$2" "$1"; }

for file in "${files[@]}"; do
  case "$file" in docs/specs/*.md) ;; *) continue ;; esac
  [ -f "$file" ] || continue
  checked=$((checked + 1))

  missing=()
  status="$(grep -m1 -oE '^Status:[[:space:]]*[a-z]+' "$file" | awk '{print $2}')"
  number="$(basename "$file" | grep -oE '^[0-9]+' || true)"

  if [ -z "$status" ]; then
    missing+=("a 'Status:' header line (draft | approved | building | shipped | superseded)")
  fi
  if [ "$hook_mode" -eq 0 ] && ! grep -q "$(basename "$file")" docs/README.md; then
    missing+=("a row in the specs table in docs/README.md")
  fi

  enforce=0
  case "$status" in
    approved|building|shipped) enforce=1 ;;
  esac
  if [ -n "$number" ] && [ "$((10#$number))" -le "$GRANDFATHERED_THROUGH" ]; then
    enforce=0
  fi

  if [ "$enforce" -eq 1 ]; then
    has_heading "$file" "acceptance criteria" || missing+=("an 'Acceptance criteria' section")
    has_heading "$file" "(open )?decisions"   || missing+=("an 'Open decisions' section")
    has_heading "$file" "build order"         || missing+=("a 'Build order' section")
    if has_heading "$file" "design lenses"; then
      absent=()
      n=1
      while [ "$n" -le "$LENS_COUNT" ]; do
        grep -qE "(^|[^A-Za-z0-9])L${n}([^0-9]|$)" "$file" || absent+=("L$n")
        n=$((n + 1))
      done
      if [ "${#absent[@]}" -gt 0 ]; then
        missing+=("a line for each lens; no answer found for: ${absent[*]}")
      fi
    else
      missing+=("a 'Design lenses' section, one line per lens (docs/process/design-lenses.md)")
    fi
  fi

  if [ "${#missing[@]}" -gt 0 ]; then
    failed=1
    printf '%s (Status: %s) is missing:\n' "$file" "${status:-none}"
    printf '  - %s\n' "${missing[@]}"
  fi
done

if [ "$failed" -ne 0 ]; then
  echo
  echo "Fix the spec, or leave it at Status: draft until it is ready."
  echo "The sections are listed in docs/README.md, 'How to write a spec'."
  exit 1
fi

[ "$hook_mode" -eq 0 ] && echo "spec-lint: ok ($checked checked)."
exit 0
