#!/usr/bin/env bash
# CLAUDE.md mirrors the docs conventions that docs/README.md owns.
#
# The problem this solves: CLAUDE.md is the file loaded into every Claude
# session automatically, so a convention only really binds once it is there.
# But docs/README.md is the source of truth, and product owns it while
# engineering owns CLAUDE.md (CLAUDE.md, "Who does what"). So the summary in
# CLAUDE.md can go stale silently, and every session afterwards follows the
# stale copy.
#
# What this checks: NOT that the two texts match. CLAUDE.md says "In short:"
# on purpose, and forcing the wording to be identical would make the summary
# useless. It checks that the conventions in docs/README.md have not changed
# since someone last read them and confirmed the summary still holds.
#
# How: a pin. The script hashes the convention sections of docs/README.md and
# compares that hash with the one recorded in CLAUDE.md. Change docs/README.md
# and the pin no longer matches, so CI fails until a person re-reads the
# summary, fixes it if needed, and re-pins.
#
# Usage:
#   scripts/claude-md-mirror-check.sh            # check (CI)
#   scripts/claude-md-mirror-check.sh --update   # re-pin, after checking the summary
#
# Decided 2026-11-12. The alternative was letting a docs/… branch edit
# CLAUDE.md, which would let a product session change the rules engineering
# runs on without engineering seeing it (ways-of-working.md §7.1, ww-D11).

set -euo pipefail

cd "$(dirname "$0")/.."

README="docs/README.md"
CLAUDE="CLAUDE.md"

# The sections of docs/README.md that CLAUDE.md's "Docs conventions" summarizes.
# Renaming one of these headings fails the check on purpose: the summary is
# almost certainly stale too.
SECTIONS=(
  "How to write a spec"
  "When a spec ships"
  "How to update"
)

PIN_PREFIX="<!-- conventions-pin:"

die() { printf '%s\n' "$@" >&2; exit 1; }

[ -f "$README" ] || die "$README not found — run this from anywhere in the repo."
[ -f "$CLAUDE" ] || die "$CLAUDE not found."

# Extract one "## <name>" section, up to the next "## " heading.
section() {
  awk -v want="## $1" '
    $0 == want { grab = 1; next }
    grab && /^## / { exit }
    grab { print }
  ' "$README"
}

canonical() {
  local name body missing=0
  for name in "${SECTIONS[@]}"; do
    body="$(section "$name")"
    if [ -z "${body//[[:space:]]/}" ]; then
      printf 'Section "## %s" is missing or empty in %s.\n' "$name" "$README" >&2
      missing=1
      continue
    fi
    printf '### %s\n%s\n' "$name" "$body"
  done
  [ "$missing" -eq 0 ] || die "" "Fix $README, or update SECTIONS in $0 if a heading was renamed deliberately."
}

hash_of() {
  canonical | sha256sum | cut -d' ' -f1
}

current_pin() {
  grep -F "$PIN_PREFIX" "$CLAUDE" | head -1 | sed -E 's/.*conventions-pin: *([0-9a-f]+).*/\1/'
}

want="$(hash_of)"
have="$(current_pin || true)"

if [ "${1:-}" = "--update" ]; then
  if [ -z "$have" ]; then
    die "No pin found in $CLAUDE." \
        "Add this line inside the 'Docs conventions' section first:" \
        "  $PIN_PREFIX $want -->"
  fi
  if [ "$have" = "$want" ]; then
    echo "claude-md-mirror: already up to date ($want)."
    exit 0
  fi
  # Portable in-place edit: BSD and GNU sed disagree about -i.
  tmp="$(mktemp)"
  sed -E "s|($PIN_PREFIX) *[0-9a-f]+|\\1 $want|" "$CLAUDE" > "$tmp"
  mv "$tmp" "$CLAUDE"
  echo "claude-md-mirror: re-pinned $have -> $want"
  exit 0
fi

if [ -z "$have" ]; then
  die "No conventions pin found in $CLAUDE." \
      "" \
      "Add this line inside the 'Docs conventions' section:" \
      "  $PIN_PREFIX $want -->"
fi

if [ "$have" != "$want" ]; then
  die "The docs conventions in $README have changed since $CLAUDE was last checked against them." \
      "" \
      "  pinned in $CLAUDE: $have" \
      "  $README now:       $want" \
      "" \
      "CLAUDE.md is loaded into every Claude session, so a stale summary is followed by" \
      "every session until someone notices. Do this:" \
      "" \
      "  1. Read the 'Docs conventions' section of $CLAUDE beside these sections of $README:" \
      "       ${SECTIONS[*]}" \
      "  2. Fix the summary if it no longer matches. Keep it short — it is a summary, not a copy." \
      "  3. Re-pin:  scripts/claude-md-mirror-check.sh --update" \
      "" \
      "If only the wording of $README changed and the summary still holds, step 3 alone is correct." \
      "" \
      "A product session cannot do this. The pin lives in CLAUDE.md, which a docs/… branch may not" \
      "touch (ww-D11) and which product does not own (CLAUDE.md, 'Who does what'). Say in the pull" \
      "request that the conventions moved and hand it to Claude Code, which re-pins on a chore/…" \
      "branch. That handoff is the point: it is how engineering finds out the rules changed."
fi

echo "claude-md-mirror: ok ($want)."
