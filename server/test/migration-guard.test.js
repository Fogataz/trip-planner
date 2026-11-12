// The startup guard that refuses to serve a database older than the code.
//
// Deploying the TripMember build before the migration has run leaves no
// TripMember rows, so every can() is false and every existing trip is
// inaccessible to every member — silently. Rails halts on a pending
// migration for the same reason; so do we.
//
// findUnmigrated() needs a database and is exercised by hand against a real
// one. What is asserted here is the decision logic around it, which is what
// decides whether the server starts.

const { test } = require('node:test');
const assert = require('node:assert');

const { assertMigrated, MESSAGE } = require('../services/migrationGuard');

function spy() {
  const calls = { logged: [], exited: null };
  return {
    calls,
    log: (m) => calls.logged.push(m),
    exit: (c) => {
      calls.exited = c;
    },
  };
}

test('the override lets a deliberate start through without touching the database', async () => {
  const before = process.env.ALLOW_UNMIGRATED_TRIPS;
  process.env.ALLOW_UNMIGRATED_TRIPS = '1';
  try {
    const s = spy();
    assert.strictEqual(await assertMigrated(s), true);
    assert.strictEqual(s.calls.exited, null, 'it must not exit');
    assert.deepStrictEqual(s.calls.logged, [], 'and it must not shout');
  } finally {
    if (before === undefined) delete process.env.ALLOW_UNMIGRATED_TRIPS;
    else process.env.ALLOW_UNMIGRATED_TRIPS = before;
  }
});

test('a check that cannot run never becomes the reason the server is down', async () => {
  // No database is connected in this test run, so the count throws. The guard
  // exists to prevent a silent lockout, not to add a new way to fail closed.
  const before = process.env.ALLOW_UNMIGRATED_TRIPS;
  delete process.env.ALLOW_UNMIGRATED_TRIPS;
  try {
    const s = spy();
    const ok = await assertMigrated(s);
    assert.strictEqual(ok, true);
    assert.strictEqual(s.calls.exited, null);
  } finally {
    if (before !== undefined) process.env.ALLOW_UNMIGRATED_TRIPS = before;
  }
});

test('the message names the trips and the exact commands to run', () => {
  const text = MESSAGE(2, [
    { groupId: 'lisbon-1', name: 'Lisbon weekend' },
    { groupId: 'ski-2', name: 'Ski trip' },
  ]);
  assert.match(text, /REFUSING TO START/);
  assert.match(text, /lisbon-1/);
  assert.match(text, /Ski trip/);
  assert.match(text, /node scripts\/migrate-tripmembers\.js --dry-run/);
  assert.match(text, /migrate first, then this code/);
  assert.match(text, /ALLOW_UNMIGRATED_TRIPS=1/);
});
