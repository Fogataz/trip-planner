// G5 · One helper — the leading measure for epic #20.
//
// Spec 011 §6.2: "Every capability check goes through one helper.
// can(actor, trip, capability). No route, socket handler or client component
// compares a role string."
//
// Spec 011 §10.2 states the shape: a test that greps server/routes,
// server/index.js and client/src for 'organizer', 'host', 'co-host' and
// 'guest' in a comparison and fails outside services/permissions.js and
// locale files.
//
// This test is written BEFORE the capability module, on purpose. Written
// afterwards it would be shaped to pass whatever the routes happen to do;
// written first it constrains them. It is red on the commit that adds it —
// 11 role-string comparisons across 5 server files and 3 in the client — and
// green only once every one of them goes through can().
//
// WHAT COUNTS AS A VIOLATION: comparing a role string. ===, !==, ==, !=
// against a role literal, a switch case on one, and membership tests like
// ['host','co-host'].includes(role).
//
// WHAT DOES NOT: assigning or storing one. `role: 'host'` when creating a
// TripMember, a Mongoose `enum`, a migration's mapping table and a database
// query that counts active hosts are all writes or reads of stored data, not
// capability decisions. G5 is about the decision, not the noun. Keeping the
// line here means the test stays honest instead of forcing contortions that
// hide a check rather than remove it.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.join(__dirname, '..', '..');

// The role names, stored and legacy. 'member' is deliberately absent: it is an
// English word that appears everywhere ("is a member of this trip") and a
// comparison against it is caught by its partner 'organizer' on the same line.
const ROLES = ['organizer', 'host', 'co-host', 'guest'];
const ROLE_RE = ROLES.join('|');

// The one place a role string may be compared.
const ALLOWED = [
  'server/services/permissions.js',
  // This file: it carries every role name above, inside the patterns below.
  'server/test/g5-one-helper.test.js',
];

const SCAN = [
  { dir: 'server', exts: ['.js'] },
  { dir: 'client/src', exts: ['.ts', '.tsx'] },
];

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'locales', '.git']);

const PATTERNS = [
  {
    name: 'equality against a role string',
    re: new RegExp(`(===|!==|==|!=)\\s*['"\`](${ROLE_RE})['"\`]`, 'i'),
  },
  {
    name: 'a role string compared with equality',
    re: new RegExp(`['"\`](${ROLE_RE})['"\`]\\s*(===|!==|==|!=)`, 'i'),
  },
  {
    name: 'switch case on a role string',
    re: new RegExp(`case\\s+['"\`](${ROLE_RE})['"\`]\\s*:`, 'i'),
  },
  {
    name: 'membership test against role strings',
    re: new RegExp(`\\[[^\\]]*['"\`](${ROLE_RE})['"\`][^\\]]*\\]\\s*\\.\\s*(includes|indexOf|some)\\b`, 'i'),
  },
  {
    name: 'includes() on a role string',
    re: new RegExp(`\\.\\s*(includes|indexOf|startsWith|endsWith)\\s*\\(\\s*['"\`](${ROLE_RE})['"\`]`, 'i'),
  },
];

function walk(dir, exts, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, exts, out);
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

// Strip line and block comments so a comment mentioning a role is not a finding.
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
}

function findViolations() {
  const files = [];
  for (const { dir, exts } of SCAN) walk(path.join(REPO, dir), exts, files);

  const violations = [];
  for (const file of files) {
    const rel = path.relative(REPO, file).split(path.sep).join('/');
    if (ALLOWED.includes(rel)) continue;

    const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      for (const { name, re } of PATTERNS) {
        if (re.test(line)) {
          violations.push({ file: rel, line: i + 1, rule: name, text: line.trim() });
          break;
        }
      }
    });
  }
  return violations;
}

test('G5 · One helper: no role string is compared outside services/permissions.js', () => {
  const violations = findViolations();
  const report = violations
    .map((v) => `  ${v.file}:${v.line}  (${v.rule})\n      ${v.text}`)
    .join('\n');

  assert.strictEqual(
    violations.length,
    0,
    `${violations.length} role-string comparison(s) outside services/permissions.js.\n` +
      `Every one of these is a capability decision that belongs in can().\n\n${report}\n`
  );
});

test('G5 · the test can actually see a violation', () => {
  // A guard against the measure quietly rotting into "always green" — if the
  // scanner stops matching, this fails and says so.
  const samples = [
    "if (member.role === 'organizer') return true;",
    'if (m.role !== "host") deny();',
    "case 'co-host':",
    "['host', 'co-host'].includes(role)",
    "roles.includes('guest')",
  ];
  for (const sample of samples) {
    const hit = PATTERNS.some(({ re }) => re.test(sample));
    assert.ok(hit, `scanner failed to flag: ${sample}`);
  }
});

test('G5 · storing or querying a role is not a comparison', () => {
  // The boundary stated at the top of this file, kept executable so it cannot
  // drift into either over- or under-reach.
  const allowed = [
    "members: [{ userId, email, role: 'host', status: 'active' }]",
    "enum: ['host', 'co-host', 'guest'],",
    "await TripMember.countDocuments({ tripId, role: 'host', status: 'active' })",
    "const LABELS = { host: 'Organizer' };",
  ];
  for (const sample of allowed) {
    const hit = PATTERNS.find(({ re }) => re.test(sample));
    assert.ok(!hit, `scanner wrongly flagged (${hit?.name}): ${sample}`);
  }
});
