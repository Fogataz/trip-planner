// Fail loudly when the code is newer than the data.
//
// The failure this prevents (review of PR #124, lens L11): membership moved
// from the embedded Trip.members array into the TripMember collection. Deploy
// this code WITHOUT running scripts/migrate-tripmembers.js first and there are
// no TripMember rows, so every can() is false and EVERY EXISTING TRIP IS
// INACCESSIBLE TO EVERYONE. Nothing errors. The site just quietly tells every
// user they are not a member of their own trip.
//
// Rails halts the app on a pending migration and Django has migrate --check,
// for exactly this shape of problem: it is better to not start than to start
// and serve wrong answers. We do the same.
//
// The check is cheap — two counts — and runs once at boot.

const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');

// A trip that has legacy members but no TripMember row has not been migrated.
async function findUnmigrated(limit = 5) {
  const legacy = await Trip.find({ 'members.0': { $exists: true } })
    .select('_id groupId name')
    .lean();
  if (legacy.length === 0) return [];

  const withMembers = await TripMember.distinct('tripId', {
    tripId: { $in: legacy.map((t) => t._id) },
  });
  const have = new Set(withMembers.map(String));

  const missing = legacy.filter((t) => !have.has(String(t._id)));
  return { count: missing.length, sample: missing.slice(0, limit) };
}

const MESSAGE = (count, sample) => `
┌─────────────────────────────────────────────────────────────────────┐
│  REFUSING TO START — the database has not been migrated             │
└─────────────────────────────────────────────────────────────────────┘

  ${count} trip(s) still keep their members in the old embedded array and
  have no TripMember rows. This build reads membership from TripMember
  only, so those trips would be INACCESSIBLE TO EVERY ONE OF THEIR
  MEMBERS — silently, with a "you do not have access" on every request.

  For example:
${sample.map((t) => `    ${t.groupId}  "${t.name}"`).join('\n')}

  Run the migration, which is safe to run twice and prints the mapping
  before it writes anything:

    node scripts/migrate-tripmembers.js --dry-run
    node scripts/migrate-tripmembers.js

  Deploy order is: migrate first, then this code.

  If you are certain you want to start anyway — a fresh database, or a
  restore in progress — set ALLOW_UNMIGRATED_TRIPS=1.
`;

// Returns true when it is safe to serve. `exit` is injected so the check can
// be tested without taking the test runner down with it.
async function assertMigrated({ log = console.error, exit = process.exit } = {}) {
  if (process.env.ALLOW_UNMIGRATED_TRIPS === '1') return true;
  try {
    const { count, sample } = await findUnmigrated();
    if (!count) return true;
    log(MESSAGE(count, sample));
    exit(1);
    return false;
  } catch (err) {
    // A check that cannot run must not be the thing that stops the server.
    log(`Migration check could not run: ${err.message}`);
    return true;
  }
}

module.exports = { assertMigrated, findUnmigrated, MESSAGE };
