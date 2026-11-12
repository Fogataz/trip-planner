#!/usr/bin/env node
//
// REVERSE the TripMember migration.
//
// This script is written and committed BEFORE the forward one has ever run,
// which is the requirement in spec 011 risk 3 and spec 002 §7.2. The reason is
// narrow and worth stating: the forward migration runs ONCE, against live
// data, and spec 002 AC 4 says no user loses access they have today. If the
// forward mapping turns out to be wrong, "we'll write the rollback then" means
// writing it under time pressure against data that is already wrong.
//
// It is cheap to make this safe, because the forward migration is ADDITIVE:
//   - it CREATES TripMember documents
//   - it SETS kind / status / guestPermissions / entitlement / orgId on trips
//   - it NEVER touches, rewrites or deletes Trip.members
//
// So reversing is not a restore from a backup. It is: delete exactly the
// documents that run created, and put back exactly the fields it changed. The
// old embedded member array is still sitting there untouched, which is why
// rolling back is instant and lossless rather than a recovery operation.
//
// Precision comes from the manifest the forward run writes. We delete the
// TripMember _ids it recorded — never "all TripMembers for this trip", which
// would also delete anyone who joined after the migration.
//
// Usage:
//   node scripts/migrate-tripmembers-reverse.js --manifest backups/<file>.json [--dry-run]
//
// --dry-run prints what it would undo and writes nothing.

require('dotenv').config();
const fs = require('node:fs');
const mongoose = require('mongoose');

const Trip = require('../server/models/Trip');
const TripMember = require('../server/models/TripMember');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const manifestPath = args[args.indexOf('--manifest') + 1];

function die(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

async function main() {
  if (!args.includes('--manifest') || !manifestPath) {
    die(
      'Pass the manifest the forward migration wrote:\n' +
        '  node scripts/migrate-tripmembers-reverse.js --manifest backups/<file>.json [--dry-run]\n\n' +
        'Without it this script will not guess. Deleting "every TripMember on\n' +
        'this trip" would also delete everyone who joined after the migration.'
    );
  }
  if (!fs.existsSync(manifestPath)) die(`Manifest not found: ${manifestPath}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.kind !== 'tripmember-migration') {
    die(`${manifestPath} is not a TripMember migration manifest.`);
  }

  const createdIds = manifest.createdMemberIds || [];
  const trips = manifest.trips || [];

  console.log('\nReversing the TripMember migration');
  console.log(`  manifest    ${manifestPath}`);
  console.log(`  ran at      ${manifest.ranAt}`);
  console.log(`  trips       ${trips.length}`);
  console.log(`  members     ${createdIds.length} TripMember documents to delete`);
  if (DRY_RUN) console.log('  MODE        dry run — nothing will be written');

  // Anyone who joined after the migration keeps their membership. Say so out
  // loud, because it is the thing a person running this at 2am needs to know.
  const liveTotal = await TripMember.countDocuments({
    tripId: { $in: trips.map((t) => t._id) },
  });
  const joinedSince = liveTotal - createdIds.length;
  if (joinedSince > 0) {
    console.log(
      `\n  NOTE: ${joinedSince} TripMember document(s) on these trips were not\n` +
        '  created by the migration. They are left alone. If the app has been\n' +
        '  live on the new code, those people joined after it ran and their\n' +
        '  membership exists ONLY in TripMember — reversing loses them.\n' +
        '  Check that list before continuing.'
    );
  }

  console.log('\nTrips whose fields will be restored:');
  for (const t of trips.slice(0, 20)) {
    console.log(`  ${t.groupId}  "${t.name}"  kind → ${t.before.kind ?? '(unset)'}`);
  }
  if (trips.length > 20) console.log(`  … and ${trips.length - 20} more`);

  if (DRY_RUN) {
    console.log('\nDry run complete. Nothing was written.\n');
    return;
  }

  const deleted = await TripMember.deleteMany({ _id: { $in: createdIds } });
  console.log(`\nDeleted ${deleted.deletedCount} TripMember document(s).`);

  let restored = 0;
  for (const t of trips) {
    const set = {};
    const unset = {};
    for (const field of ['kind', 'status', 'orgId', 'entitlement', 'guestPermissions']) {
      if (t.before[field] === undefined) unset[field] = 1;
      else set[field] = t.before[field];
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    if (Object.keys(update).length) {
      await Trip.updateOne({ _id: t._id }, update);
      restored += 1;
    }
  }
  console.log(`Restored fields on ${restored} trip(s).`);
  console.log(
    '\nDone. Trip.members was never modified by the forward migration, so\n' +
      'every trip is exactly as it was before it ran.\n'
  );
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(main)
  .catch((err) => {
    console.error('\nReverse migration failed:', err.message, '\n');
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
