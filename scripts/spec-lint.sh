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
#
# From spec 013 on (trk-D7), the build order is a table with an "ACs" column,
# and every numbered acceptance criterion must appear in some row of it. That
# is what lets /epic turn each row into a story whose "Done when" covers the
# spec between them. Specs 001-012 were approved before the column existed.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1

LENS_COUNT=14

# A spec written before the lenses existed is checked for its header only: a
# shipped spec is never rewritten (docs/README.md), so there is nothing to fix.
# Two ways to qualify, because spec 009 shipped from a branch opened before the
# lenses landed and is not covered by a number alone:
#   - number 001-004, which includes spec 002, still a draft from before; or
#   - a Shipped date earlier than the day the lenses landed.
# Everything else carries the lenses from Status: approved onwards.
GRANDFATHERED_THROUGH=4
LENSES_LANDED=2026-11-11
AC_COVERAGE_FROM=13

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

# Print the body of the first heading whose words match $2 (lower case), up to
# the next heading of the same or a higher level. Plain awk: macOS has no gawk.
section_body() {
  awk -v pat="$2" '
    /^#+[[:space:]]/ {
      n = match($0, /^#+/); level = RLENGTH
      if (grab && level <= want) exit
      if (!grab && tolower($0) ~ pat) { grab = 1; want = level; next }
    }
    grab { print }
  ' "$1"
}

# The numbered acceptance criteria: top-level "N." list items in that section.
ac_numbers() {
  section_body "$1" "acceptance criteria" | grep -oE '^[0-9]+\.' | tr -d '.' | sort -un
}

# Every number in the build-order table's ACs column, with ranges (3–5, 3-5)
# expanded. Prints nothing if the table has no such column.
build_order_acs() {
  section_body "$1" "build order" | awk -F'|' '
    /^\|/ {
      if (!col) {
        for (i = 1; i <= NF; i++) {
          c = tolower($i); gsub(/^[ \t]+|[ \t]+$/, "", c)
          if (c ~ /^(acs?|acceptance criteria)$/) col = i
        }
        next
      }
      if ($0 ~ /^\|[ \t:|-]+$/) next
      print $col
    }
  ' | sed -E 's/([0-9]+)[[:space:]]*(–|-|to)[[:space:]]*([0-9]+)/\1..\3/g' \
    | grep -oE '[0-9]+(\.\.[0-9]+)?' \
    | while IFS= read -r n; do
        case "$n" in
          *..*) seq "${n%%..*}" "${n##*..}" ;;
          *) echo "$n" ;;
        esac
      done | sort -un
}

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
  shipped="$(grep -m1 -oE '^Owner:.*Shipped: *[0-9]{4}-[0-9]{2}-[0-9]{2}' "$file" \
    | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}$' || true)"
  if [ -n "$shipped" ] && [ "$shipped" \< "$LENSES_LANDED" ]; then
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

    if [ -n "$number" ] && [ "$((10#$number))" -ge "$AC_COVERAGE_FROM" ] \
       && has_heading "$file" "build order" && has_heading "$file" "acceptance criteria"; then
      acs="$(ac_numbers "$file")"
      covered="$(build_order_acs "$file")"
      if [ -z "$covered" ]; then
        missing+=("a build-order table with an 'ACs' column naming the criteria each row satisfies (trk-D7)")
      elif [ -n "$acs" ]; then
        uncovered="$(comm -23 <(printf '%s\n' "$acs" | sort) <(printf '%s\n' "$covered" | sort) \
          | sort -n | sed 's/^/AC /' | paste -sd, - | sed 's/,/, /g')"
        [ -n "$uncovered" ] && missing+=("every acceptance criterion in some build-order row; in none: $uncovered (trk-D7)")
      fi
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
