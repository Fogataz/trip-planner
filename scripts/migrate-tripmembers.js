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
// SAFETY, in the order spec 011 risk 3 asks for them:
//
//   1. BACKUP FIRST. Every trip document it will touch is written to
//      backups/ before anything is changed, alongside the manifest.
//   2. IDEMPOTENT. Re-running changes nothing: members are upserted on
//      (tripId, userId) or (tripId, email), and a second run reports 0 created.
//   3. --dry-run PRINTS THE MAPPING and writes nothing.
//   4. THE REVERSE SCRIPT ALREADY EXISTS — scripts/migrate-tripmembers-reverse.js,
//      committed before this file. It reads the manifest written here.
//
// This migration is ADDITIVE. It never modifies or deletes Trip.members, so
// the old state is still on every document and a rollback is instant rather
// than a recovery. The array is dropped in a later slice, after the pilot.
//
// Usage:
//   node scripts/migrate-tripmembers.js --dry-run     # always do this first
//   node scripts/migrate-tripmembers.js

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

const Trip = require('../server/models/Trip');
const TripMember = require('../server/models/TripMember');

const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// The creator is the host; any other organizer becomes a co-host.
function roleFor(member, trip) {
  if (member.userId && member.userId === trip.createdBy) return 'host';
  return member.role === 'organizer' ? 'co-host' : 'guest';
}

// Spec 011 §6.1's vocabulary. 'pending' meant "invited, not accepted".
const STATUS = { pending: 'invited', active: 'active', removed: 'removed' };
function statusFor(member) {
  return STATUS[member.status] || 'active';
}

// The fields this migration sets, as they are in the database right now —
// `undefined` where the field is genuinely absent, so the reverse script
// knows to $unset rather than to write a default back.
const MIGRATED_FIELDS = ['kind', 'status', 'orgId', 'entitlement', 'guestPermissions'];
function beforeOf(raw) {
  const before = {};
  for (const field of MIGRATED_FIELDS) {
    if (raw && Object.prototype.hasOwnProperty.call(raw, field)) before[field] = raw[field];
  }
  return before;
}

function label(role) {
  // What these people will SEE, since every migrated trip is personal.
  return role === 'guest' ? 'Member' : 'Organizer';
}

async function main() {
  const trips = await Trip.find({});

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
  let alreadyMigrated = 0;
  const lostAccess = [];

  // ---------------------------------------------------------------------
  // Pass 1 — work out and PRINT the whole mapping. Nothing is written here.
  // ---------------------------------------------------------------------
  for (const trip of trips) {
    // A trip that already has TripMember documents was migrated by an earlier
    // run. Skip it entirely rather than re-snapshotting it: its CURRENT field
    // values are the migration's output, so recording them as "before" would
    // produce a manifest that cannot undo anything. Running this script twice
    // must not quietly cost you your rollback.
    if (await TripMember.countDocuments({ tripId: trip._id })) {
      alreadyMigrated += 1;
      continue;
    }

    const members = trip.members || [];
    const rows = members.map((m) => ({
      userId: m.userId || null,
      email: m.email || null,
      from: { role: m.role, status: m.status },
      role: roleFor(m, trip),
      status: statusFor(m),
      joinedAt: m.joinedAt,
      invitedBy: m.invitedBy,
      invitedAt: m.invitedAt,
    }));

    // AC 4, checked rather than asserted: everyone who could open this trip
    // yesterday must be able to open it tomorrow.
    for (const row of rows) {
      if (row.from.status === 'active' && row.status !== 'active') {
        lostAccess.push({ groupId: trip.groupId, who: row.email || row.userId });
      }
    }

    // Every trip needs someone in charge. A trip whose creator is no longer
    // in its own member list would migrate to nobody holding host, which
    // breaks G1 · Last host before the pilot even starts.
    if (!rows.some((r) => r.role === 'host' && r.status === 'active')) {
      hostless += 1;
      const promoted =
        rows.find((r) => r.from.role === 'organizer' && r.status === 'active') ||
        rows.find((r) => r.status === 'active');
      if (promoted) promoted.role = 'host';
    }

    manifest.trips.push({
      _id: trip._id,
      groupId: trip.groupId,
      name: trip.name,
      before: beforeOf(rawTrips.get(String(trip._id))),
      members: members.map((m) => (typeof m.toObject === 'function' ? m.toObject() : m)),
    });
    plan.push({ trip, rows });

    console.log(`\n  ${trip.groupId}  "${trip.name}"  (${rows.length} member(s)) → kind: personal`);
    for (const row of rows) {
      const who = row.email || row.userId || '(no identity)';
      console.log(
        `      ${who.padEnd(32)} ${String(row.from.role).padEnd(10)} → ${row.role.padEnd(8)}` +
          ` shown as "${label(row.role)}"   ${row.from.status} → ${row.status}`
      );
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log(`  trips            ${trips.length}`);
  console.log(`  to migrate       ${plan.length}`);
  if (alreadyMigrated) {
    console.log(`  already done     ${alreadyMigrated} trip(s) — skipped, a re-run is a no-op`);
  }
  console.log(`  members to map   ${plan.reduce((n, p) => n + p.rows.length, 0)}`);
  if (hostless) {
    console.log(`  no clear host    ${hostless} trip(s) — the longest-standing organizer was promoted`);
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

  if (plan.length === 0) {
    console.log(
      '\n  Nothing to do — every trip is already migrated.\n' +
        '  No manifest was written, deliberately: an empty one would look like a\n' +
        '  rollback and would undo nothing. To roll back, use the manifest from\n' +
        '  the run that did the work:\n' +
        `    ls -t ${path.relative(process.cwd(), BACKUP_DIR)}/tripmember-migration-*.json | head -1\n`
    );
    return;
  }

  // ---------------------------------------------------------------------
  // BACKUP FIRST — before a single write, not after (spec 011 risk 3).
  // ---------------------------------------------------------------------
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = manifest.ranAt.replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `tripmember-migration-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
  console.log(`\n  backup written to ${file}`);

  // ---------------------------------------------------------------------
  // Pass 2 — the writes. Idempotent, and additive: Trip.members is never
  // modified, so the state this backup describes is still on every document.
  // ---------------------------------------------------------------------
  let created = 0;
  let alreadyThere = 0;

  try {
    for (const { trip, rows } of plan) {
      const raw = rawTrips.get(String(trip._id));
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

      await Trip.updateOne(
        { _id: trip._id },
        {
          $set: {
            kind: raw?.kind || 'personal',
            status: raw?.status || 'active',
            orgId: raw?.orgId ?? null,
            entitlement: raw?.entitlement ?? null,
          },
        }
      );
    }
  } finally {
    // Record what was created even if the run died halfway, or the reverse
    // script has no way to find those documents.
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
  }

  console.log(`  members created  ${created}`);
  console.log(`  already present  ${alreadyThere}  (a re-run is a no-op)`);
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
