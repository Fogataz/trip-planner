#!/usr/bin/env node
//
// Move membership from the embedded Trip.members array into the TripMember
// collection (spec 002 F7 and AC 4, spec 011 §10.2 and L11).
//
// THE MAPPING
//
//   trip creator          → host
//   other 'organizer'     → co-host
//   'member'              → guest
//   status 'pending'      → 'invited'      (sent, not accepted — counts as nobody)
//   status 'active'       → 'active'
//   status 'removed'      → 'removed'
//
// and every existing trip becomes kind: 'personal'.
//
// THE WORDS DO NOT CHANGE. The stored role becomes host/guest, but on a
// personal trip those are shown as "Organizer" and "Member" — exactly what
// these users saw yesterday (spec 012 §5.3, Q1 · Guest on friend trips). Five
// friends planning Lisbon do not wake up as a host and four guests. That is
// what AC 4's "no user loses access they have today" has to mean in the
// interface as well as in the permission table.
//
// RESUMABLE BY CONSTRUCTION (Q25, review of PR #124)
//
// An earlier version skipped a trip that already had ANY TripMember row, on
// the theory that it had been migrated. That is the dangerous kind of
// shortcut: a run that dies part-way through a trip — a duplicate key, a
// dropped connection — leaves that trip half-migrated, and the re-run skips
// it, so the missing members are locked out and nothing says so.
//
// There is no "already done" flag now. Every member is upserted on its unique
// key every run, so a re-run is a no-op for the rows that exist and repairs
// the rows that do not. Partial failure heals instead of hiding.
//
// SAFETY, in the order spec 011 risk 3 asks for them:
//
//   1. BACKUP FIRST. Every trip document it will touch is written to
//      backups/ before anything is changed, alongside the manifest.
//   2. IDEMPOTENT. Re-running changes nothing: a second run creates 0.
//   3. --dry-run PRINTS THE MAPPING and writes nothing.
//   4. THE REVERSE SCRIPT ALREADY EXISTS — scripts/migrate-tripmembers-reverse.js,
//      committed before this file. It reads the manifest written here.
//   5. VERIFY AFTER. Every active legacy member must have an active
//      TripMember. The run exits non-zero if even one does not.
//
// This migration is ADDITIVE. It never modifies or deletes Trip.members, so
// the old state is still on every document and a rollback is instant rather
// than a recovery. The array is dropped in a later slice, after the pilot.
//
// Usage:
//   node scripts/migrate-tripmembers.js --dry-run     # always do this first
//   node scripts/migrate-tripmembers.js
//   node scripts/migrate-tripmembers.js --verify-only # check a finished run

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

const Trip = require('../server/models/Trip');
const TripMember = require('../server/models/TripMember');
const { planTrip, MIGRATED_FIELDS, beforeOf, label } = require('./lib/tripmember-mapping');

const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY_ONLY = process.argv.includes('--verify-only');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Every active legacy member must have an active TripMember. This is AC 4
// checked against what is actually in the database, after the fact — not the
// plan's promise about what it was going to do.
async function verify(trips) {
  const missing = [];
  for (const trip of trips) {
    for (const m of trip.members || []) {
      if (m.status !== 'active') continue;
      const query = m.userId
        ? { tripId: trip._id, userId: m.userId }
        : { tripId: trip._id, userId: null, email: m.email };
      const row = await TripMember.findOne(query);
      if (!row || row.status !== 'active') {
        missing.push({ groupId: trip.groupId, who: m.email || m.userId, found: row?.status || 'nothing' });
      }
    }
  }
  return missing;
}

function reportVerification(missing) {
  if (missing.length === 0) {
    console.log('\n  verified         every active member has an active TripMember');
    return true;
  }
  console.log(`\n  VERIFICATION FAILED — ${missing.length} member(s) would have lost access:`);
  for (const m of missing) console.log(`    ${m.groupId}  ${m.who}  (found: ${m.found})`);
  console.log(
    '\n  The trips above are HALF MIGRATED. Run this script again — it is\n' +
      '  resumable and will repair them. If a re-run does not fix it, roll\n' +
      '  back with scripts/migrate-tripmembers-reverse.js and work out why.'
  );
  return false;
}

async function main() {
  const trips = await Trip.find({});

  if (VERIFY_ONLY) {
    console.log(`\nVerifying ${trips.length} trip(s) — nothing will be written`);
    process.exitCode = reportVerification(await verify(trips)) ? 0 : 1;
    return;
  }

  // The "before" snapshot is read RAW, straight from the driver, never from
  // the hydrated Mongoose document. Mongoose applies schema defaults when it
  // hydrates, so a trip with no `kind` field in the database comes back from
  // Trip.find() already carrying kind: 'personal' — the migration's own
  // output. Recording that as "before" makes the rollback leave the new
  // fields behind instead of removing them. Found by running the reverse
  // script against a seeded database rather than by reading this code.
  const rawTrips = new Map(
    (await Trip.collection.find({}).toArray()).map((t) => [String(t._id), t])
  );

  console.log(`\nTripMember migration — ${trips.length} trip(s) found`);
  if (DRY_RUN) console.log('MODE: dry run — nothing will be written\n');

  const manifest = {
    kind: 'tripmember-migration',
    ranAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    trips: [],
    createdMemberIds: [],
  };

  const plan = [];
  let hostless = 0;
  const lostAccess = [];

  // ---------------------------------------------------------------------
  // Pass 1 — work out and PRINT the whole mapping. Nothing is written here.
  // ---------------------------------------------------------------------
  for (const trip of trips) {
    const raw = rawTrips.get(String(trip._id));
    const { rows, promotedHost, wouldLoseAccess } = planTrip(trip, trip.members || []);

    for (const who of wouldLoseAccess) lostAccess.push({ groupId: trip.groupId, who });
    if (promotedHost) hostless += 1;

    // Record `before` only for the fields that are genuinely absent. On a
    // re-run the fields are already set — writing them into `before` would
    // record the migration's own output as the state to roll back to.
    const needsFields = MIGRATED_FIELDS.filter(
      (f) => !raw || !Object.prototype.hasOwnProperty.call(raw, f)
    );

    plan.push({ trip, raw, rows, needsFields });

    console.log(`\n  ${trip.groupId}  "${trip.name}"  (${rows.length} member(s)) → kind: personal`);
    for (const row of rows) {
      const who = row.email || row.userId || '(no identity)';
      console.log(
        `      ${who.padEnd(32)} ${String(row.from.role).padEnd(10)} → ${row.role.padEnd(8)}` +
          ` shown as "${label(row.role)}"   ${row.from.status} → ${row.status}` +
          (row.promoted ? '   ← promoted: this trip had no host' : '')
      );
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log(`  trips            ${trips.length}`);
  console.log(`  members to map   ${plan.reduce((n, p) => n + p.rows.length, 0)}`);
  if (hostless) {
    console.log(`  no clear host    ${hostless} trip(s) — the earliest-joined active organizer was promoted`);
  }

  // The stop condition from epic #20, checked before anything is written.
  if (lostAccess.length) {
    console.log('\n  STOP — these people would lose access they have today (AC 4):');
    for (const l of lostAccess) console.log(`    ${l.groupId}  ${l.who}`);
    console.log('\n  Nothing was written. Rethink the mapping before running again.\n');
    process.exitCode = 1;
    return;
  }

  if (DRY_RUN) {
    console.log('\nDry run complete. Nothing was written.');
    console.log('Run again without --dry-run when the mapping above looks right.\n');
    return;
  }

  // ---------------------------------------------------------------------
  // BACKUP FIRST — before a single write, not after (spec 011 risk 3).
  //
  // Only trips this run can still change are recorded. A trip that is
  // already fully migrated has nothing left to undo, and recording it would
  // put the migration's own output in the manifest as a rollback target.
  // ---------------------------------------------------------------------
  for (const { trip, raw, needsFields } of plan) {
    manifest.trips.push({
      _id: trip._id,
      groupId: trip.groupId,
      name: trip.name,
      before: beforeOf(raw, needsFields),
      members: (trip.members || []).map((m) => (typeof m.toObject === 'function' ? m.toObject() : m)),
    });
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = manifest.ranAt.replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `tripmember-migration-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
  console.log(`\n  backup written to ${file}`);

  // ---------------------------------------------------------------------
  // Pass 2 — the writes. Every member every run: an existing row is left
  // alone, a missing one is created. Nothing is skipped on the strength of
  // a sibling row existing, which is what made the old version unsafe to
  // interrupt.
  // ---------------------------------------------------------------------
  let created = 0;
  let alreadyThere = 0;

  try {
    for (const { trip, rows, needsFields } of plan) {
      for (const row of rows) {
        const query = row.userId
          ? { tripId: trip._id, userId: row.userId }
          : { tripId: trip._id, userId: null, email: row.email };

        if (await TripMember.findOne(query)) {
          alreadyThere += 1;
          continue;
        }
        const doc = await TripMember.create({
          tripId: trip._id,
          groupId: trip.groupId,
          userId: row.userId,
          email: row.email,
          role: row.role,
          status: row.status,
          joinedAt: row.joinedAt || trip.createdAt || new Date(),
          invitedBy: row.invitedBy,
          invitedAt: row.invitedAt,
        });
        manifest.createdMemberIds.push(doc._id);
        created += 1;
      }

      // Only the fields that were absent, so a re-run is a true no-op.
      if (needsFields.length) {
        const set = {};
        if (needsFields.includes('kind')) set.kind = 'personal';
        if (needsFields.includes('status')) set.status = 'active';
        if (needsFields.includes('orgId')) set.orgId = null;
        if (needsFields.includes('entitlement')) set.entitlement = null;
        if (Object.keys(set).length) await Trip.updateOne({ _id: trip._id }, { $set: set });
      }
    }
  } finally {
    // Record what was created even if the run died halfway, or the reverse
    // script has no way to find those documents.
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
  }

  console.log(`  members created  ${created}`);
  console.log(`  already present  ${alreadyThere}  (a re-run is a no-op)`);

  // ---------------------------------------------------------------------
  // Pass 3 — verify. The run is not finished because it did not throw.
  // ---------------------------------------------------------------------
  const ok = reportVerification(await verify(trips));
  if (!ok) process.exitCode = 1;

  console.log('\n  To undo this exactly:');
  console.log(`    node scripts/migrate-tripmembers-reverse.js --manifest ${file} --dry-run\n`);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(main)
  .catch((err) => {
    console.error('\nMigration failed:', err.message, '\n');
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
