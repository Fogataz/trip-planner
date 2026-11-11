#!/usr/bin/env bash
# The mechanical half of /audit: the lens checks a person gets bored of running.
#
#   scripts/audit-checks.sh [a|b|c]      # default: all three
#
#   a  L5 real-time   — socket events the server emits that no client listens for
#   b  L1 localization — locale keys missing from a language, and strings not translated
#   c  L12 enforcement — API routers mounted without the auth middleware
#
# Judgment stays with /audit and the reviewer; this only finds candidates. It is
# deliberately NOT a CI check: it reports on code that already exists, and a
# required check that fails on day one gets bypassed (sys-D3).
#
# Exit 1 if anything was found, so it can gate a local pre-check if you want.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1
which="${1:-all}"
found=0

hr() { printf '\n%s\n' "— $1 —"; }

# ---------------------------------------------------------------- a) L5 real-time
if [ "$which" = "all" ] || [ "$which" = "a" ]; then
  hr "L5 real-time: emitted with no listener"

  emitted="$(grep -rhoE "emit\('[a-zA-Z:_-]+'" server --include='*.js' 2>/dev/null \
    | sed "s/emit('//;s/'$//" | sort -u)"
  listened="$(grep -rhoE "\.on\('[a-zA-Z:_-]+'" client/src 2>/dev/null \
    | sed "s/\.on('//;s/'$//" | sort -u)"

  orphans=""
  for e in $emitted; do
    printf '%s\n' "$listened" | grep -qx "$e" || orphans="$orphans $e"
  done

  if [ -n "$orphans" ]; then
    found=1
    for e in $orphans; do
      printf 'EMITTED, NOT LISTENED: %s\n' "$e"
      grep -rn "emit('$e'" server --include='*.js' | sed 's/^/    /'
    done
  else
    echo "ok: every literal server emit has a client listener."
  fi

  # A listener with no literal emit is usually a dynamic emit, not a bug.
  for l in $listened; do
    case "$l" in connect|disconnect|connect_error|languageChanged) continue ;; esac
    printf '%s\n' "$emitted" | grep -qx "$l" || printf 'listener with no literal emit (check by hand, may be dynamic): %s\n' "$l"
  done
  dynamic="$(grep -rn "emit([a-z]" server --include='*.js' 2>/dev/null | grep -v node_modules || true)"
  [ -n "$dynamic" ] && printf 'dynamic emits this check cannot read:\n%s\n' "$(printf '%s' "$dynamic" | sed 's/^/    /')"
fi

# ------------------------------------------------------------- b) L1 localization
if [ "$which" = "all" ] || [ "$which" = "b" ]; then
  hr "L1 localization: locale keys and untranslated strings"

  if node -e '
const fs = require("fs");
const dir = "client/src/locales";
const flat = (o, p = "") => Object.entries(o).flatMap(([k, v]) =>
  v && typeof v === "object" ? flat(v, p + k + ".") : [p + k]);
const langs = fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""));
const keys = {};
for (const l of langs) keys[l] = new Set(flat(JSON.parse(fs.readFileSync(`${dir}/${l}.json`, "utf8"))));
const all = new Set(langs.flatMap(l => [...keys[l]]));
let bad = 0;
for (const l of langs) {
  const missing = [...all].filter(k => !keys[l].has(k)).sort();
  if (missing.length) {
    bad = 1;
    console.log(`${l}.json is missing ${missing.length} key(s):`);
    missing.slice(0, 20).forEach(k => console.log("    " + k));
    if (missing.length > 20) console.log(`    … and ${missing.length - 20} more`);
  }
}
if (!bad) console.log(`ok: ${langs.join(", ")} carry the same ${all.size} keys.`);
process.exit(bad);
  '; then :; else found=1; fi

  # Narrow heuristic, kept narrow on purpose: user-visible attributes with a
  # literal string instead of t(). Anything wider drowns the signal in noise.
  attrs="$(grep -rnE '(placeholder|title|aria-label|alt)="[A-Za-z][A-Za-z ,.!?'"'"'-]{3,}"' client/src 2>/dev/null || true)"
  if [ -n "$attrs" ]; then
    found=1
    printf 'user-visible attributes with a hard-coded string:\n%s\n' "$(printf '%s' "$attrs" | sed 's/^/    /')"
  else
    echo "ok: no hard-coded placeholder, title, aria-label or alt strings."
  fi
fi

# -------------------------------------------------------------- c) L12 enforcement
if [ "$which" = "all" ] || [ "$which" = "c" ]; then
  hr "L12 enforcement: routers mounted without auth"

  # Deliberately public, with the reason. Add to this list only with a comment.
  # auth    — sign-up and sign-in must work before there is a token.
  # covers  — a decorative image by opaque id; see server/routes/covers.js.
  # locale  — language of the visitor's country, from the IP. No trip data.
  public_ok="auth covers locale"

  while IFS= read -r line; do
    path="$(printf '%s' "$line" | sed -E "s/.*app\.use\('([^']*)'.*/\1/")"
    name="$(basename "$path")"
    printf '%s\n' "$line" | grep -q "authMiddleware" && continue
    if printf '%s\n' $public_ok | grep -qx "$name"; then
      printf 'public on purpose: %s\n' "$path"
    else
      found=1
      printf 'ROUTER WITH NO AUTH: %s\n    %s\n' "$path" "$line"
      echo "    Mount it with authMiddleware, or add it to public_ok in this script with a reason."
    fi
  done < <(grep -n "app.use('/api" server/index.js 2>/dev/null)
fi

printf '\n'
if [ "$found" -ne 0 ]; then
  echo "audit-checks: findings above. Route each one through /audit step 6; check for an existing issue first."
  exit 1
fi
echo "audit-checks: nothing found."
