#!/usr/bin/env bash
# Role labels must not inflect for gender (O8 · Ungendered role labels).
#
# Why a check and not just a rule: spec 012 §6.2 says Spanish and Portuguese
# role nouns inflect — anfitrión/anfitriona, invitado/invitada — and that we
# neither collect gender nor guess it from a name. That is a rule in a spec,
# and a rule in a spec is goodwill. The realistic failure is not the reviewers
# choosing badly; it is someone adding a string six weeks from now and reaching
# for "Invitado/a" because it reads naturally in Spanish. Nobody would notice.
#
# This is deliberately narrow. It does not try to detect gender in Spanish —
# that is not tractable. It checks the closed set of role-label keys for the
# three shapes the mistake actually takes:
#
#   1. a slash pair            Invitado/a, Organizador/a
#   2. a parenthesised ending  Convidado(a)
#   3. a known gendered noun   anfitrión, invitada, organizadora, convidado
#
# It passes silently while the keys do not exist yet, which is today: O8 is
# still with the native reviewers named in spec 003 §6, and spec 012 §6.2 says
# no locale file gets role labels until that lands.
#
# Decided 2026-11-12 (ww-D15).

set -uo pipefail
cd "$(dirname "$0")/.."

LOCALES="client/src/locales"
[ -d "$LOCALES" ] || { echo "locale-lint: $LOCALES not found."; exit 1; }

node - "$LOCALES" <<'NODE'
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];

// Known gendered role nouns, by language. Lower-cased, accent-sensitive on
// purpose: "anfitrion" without the accent is a typo, not a different word, and
// we would rather flag it.
//
// Checked ONLY against the locale file of the same language. The first version
// of this check loaded every list for every file, on the theory that copying a
// row from the wrong column is the realistic mistake. It flagged "Participante"
// in es.json — which is the correct Spanish answer, because Spanish
// "participante" is invariable while French "participante" is the feminine of
// "participant". Same spelling, opposite verdict. A check that fails the right
// answer gets switched off, so: per language, no cross-contamination.
//
// English is the outlier, not Spanish: every language on the roadmap inflects
// role nouns. Adding a language means adding its row here in the same pull
// request as its locale file (spec 003 §8.5).
const GENDERED = {
  es: ['anfitrión', 'anfitriona', 'anfitriones', 'anfitrionas',
       'invitado', 'invitada', 'invitados', 'invitadas',
       'organizador', 'organizadora', 'organizadores', 'organizadoras',
       'coanfitrión', 'coanfitriona', 'co-anfitrión', 'co-anfitriona'],
  pt: ['anfitrião', 'anfitriã', 'anfitriões', 'anfitriãs',
       'convidado', 'convidada', 'convidados', 'convidadas',
       'organizador', 'organizadora', 'organizadores', 'organizadoras'],
  // Not shipped yet. Here so the check is ready before the language is.
  fr: ['hôtesse', 'invité', 'invitée', 'invités', 'invitées',
       'organisateur', 'organisatrice', 'organisateurs', 'organisatrices',
       'participante', 'participantes'],
  it: ['organizzatore', 'organizzatrice', 'organizzatori', 'organizzatrici',
       'invitato', 'invitata', 'invitati', 'invitate'],
  ca: ['amfitrió', 'amfitriona', 'amfitrions', 'amfitriones',
       'convidat', 'convidada', 'convidats', 'convidades',
       'organitzador', 'organitzadora', 'organitzadors', 'organitzadores'],
  de: ['gastgeber', 'gastgeberin', 'gastgeberinnen',
       'teilnehmer', 'teilnehmerin', 'teilnehmerinnen',
       'veranstalter', 'veranstalterin', 'veranstalterinnen'],
};


const problems = [];
let checked = 0;

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const full = path.join(dir, file);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (e) {
    problems.push([file, '(whole file)', `is not valid JSON: ${e.message}`]);
    continue;
  }

  const roles = json.roles;
  if (!roles || typeof roles !== 'object') continue; // not written yet — fine

  // es.json -> 'es'. An unknown file still gets the shape checks below.
  const lang = path.basename(file, '.json').toLowerCase().split('-')[0];
  const wordList = GENDERED[lang] || [];

  const walk = (node, trail) => {
    for (const [k, v] of Object.entries(node)) {
      if (v && typeof v === 'object') { walk(v, `${trail}.${k}`); continue; }
      if (typeof v !== 'string') continue;
      checked++;
      const key = `${trail}.${k}`;
      const low = v.toLowerCase();

      if (/\w\/\w/.test(v)) {
        problems.push([file, key, `"${v}" — a slash pair. Pick one form that does not inflect.`]);
      }
      if (/\w\([ao]s?\)/i.test(v)) {
        problems.push([file, key, `"${v}" — a parenthesised ending. Pick one form that does not inflect.`]);
      }
      if (/\w@/.test(v)) {
        problems.push([file, key, `"${v}" — an @ ending. Pick one form that does not inflect.`]);
      }
      // German's contested workarounds: Teilnehmer*innen, TeilnehmerInnen,
      // Teilnehmer_innen. Ungendered in intent, but they are a political choice
      // that varies by organisation, and they read badly aloud.
      if (/\w[*_]innen/i.test(v) || /\p{Ll}Innen/u.test(v)) {
        problems.push([file, key, `"${v}" — a gender-star or Binnen-I form. Contested, varies by organisation, and poor for screen readers. Use a form that does not inflect, or change the construction.`]);
      }
      for (const word of wordList) {
        if (new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, 'u').test(low)) {
          problems.push([file, key, `"${v}" — "${word}" inflects for gender.`]);
          break;
        }
      }
    }
  };
  walk(roles, 'roles');
}

if (checked === 0) {
  console.log('locale-lint: ok (no role labels yet — O8 is still with the reviewers, spec 003 §6).');
  process.exit(0);
}

if (problems.length === 0) {
  console.log(`locale-lint: ok (${checked} role labels checked).`);
  process.exit(0);
}

console.error('Role labels must not inflect for gender (O8 · Ungendered role labels).\n');
for (const [file, key, why] of problems) console.error(`  ${file}  ${key}\n    ${why}`);
console.error(`
We do not collect gender and must not guess it from a name, so a role label has
to use a form that works for anyone. Spec 012 §6.2 has the constraint and the
proposed set; spec 003 §8 has the review brief.

If a reviewer has told you the proposed word is wrong, change the word — not
this rule. If you believe a gendered word is genuinely the only option, that is
a change to O8 and belongs in a spec amendment, not in a locale file.`);
process.exit(1);
NODE
