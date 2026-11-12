// The TripMember migration's mapping, tested without a database.
//
// "No migration tests" was a fair finding on PR #124: the mapping runs once
// against live data and spec 002 AC 4 says no user loses access they have
// today. The IO stays in the script; everything that decides anything is in
// scripts/lib/tripmember-mapping.js so it can be asserted here, in CI, with
// no Mongo and no dependency.

const { test } = require('node:test');
const assert = require('node:assert');

const { planTrip, statusFor, beforeOf, byJoinedAt } = require('../../scripts/lib/tripmember-mapping');

const d = (iso) => new Date(iso);

test('the ordinary trip: creator is host, the rest are guests', () => {
  const trip = { createdBy: 'marta' };
  const { rows, promotedHost, wouldLoseAccess } = planTrip(trip, [
    { userId: 'marta', email: 'm@x.com', role: 'organizer', status: 'active' },
    { userId: 'joao', email: 'j@x.com', role: 'member', status: 'active' },
  ]);

  assert.deepStrictEqual(rows.map((r) => r.role), ['host', 'guest']);
  assert.strictEqual(promotedHost, null);
  assert.deepStrictEqual(wouldLoseAccess, []);
});

test('a second organizer becomes a co-host, not a second host', () => {
  const { rows } = planTrip({ createdBy: 'alberto' }, [
    { userId: 'alberto', role: 'organizer', status: 'active' },
    { userId: 'nuria', role: 'organizer', status: 'active' },
  ]);
  assert.deepStrictEqual(rows.map((r) => r.role), ['host', 'co-host']);
});

test('Q22 · pending becomes invited, and nothing becomes an invalid status', () => {
  assert.strictEqual(statusFor({ status: 'pending' }), 'invited');
  assert.strictEqual(statusFor({ status: 'active' }), 'active');
  assert.strictEqual(statusFor({ status: 'removed' }), 'removed');
  // Anything unrecognised must not be written through as-is.
  assert.strictEqual(statusFor({ status: 'nonsense' }), 'active');
  assert.strictEqual(statusFor({}), 'active');
});

// ---------------------------------------------------------------------------
// Q21 · Migration can leave a trip with no host
// ---------------------------------------------------------------------------

test('Q21 · a trip whose creator has left still gets a host', () => {
  const { rows, promotedHost } = planTrip({ createdBy: 'gone' }, [
    { userId: 'ana', role: 'organizer', status: 'active', joinedAt: d('2026-03-01') },
    { userId: 'luis', role: 'member', status: 'active', joinedAt: d('2026-01-01') },
  ]);
  assert.ok(promotedHost, 'a host was invented');
  assert.strictEqual(promotedHost.userId, 'ana', 'an organizer outranks an earlier-joined member');
  // Asserted as a mapped list rather than a filter, because comparing a
  // role string with === is what the G5 test forbids — and it caught this
  // line when it was written the other way.
  assert.deepStrictEqual(
    rows.map((r) => [r.role, r.status]),
    [['host', 'active'], ['guest', 'active']]
  );
  assert.ok(rows.find((r) => r.userId === 'ana').promoted);
});

test('the promoted host is the EARLIEST-JOINED organizer, not the first in the array', () => {
  // The review's finding: array order is whatever order the pushes happened
  // in, while the amendment promised "longest-standing".
  const { promotedHost } = planTrip({ createdBy: 'gone' }, [
    { userId: 'newer', role: 'organizer', status: 'active', joinedAt: d('2026-06-01') },
    { userId: 'older', role: 'organizer', status: 'active', joinedAt: d('2026-01-01') },
  ]);
  assert.strictEqual(promotedHost.userId, 'older');
});

test('with no organizer at all, the earliest-joined active member is promoted', () => {
  const { promotedHost } = planTrip({ createdBy: 'gone' }, [
    { userId: 'newer', role: 'member', status: 'active', joinedAt: d('2026-06-01') },
    { userId: 'older', role: 'member', status: 'active', joinedAt: d('2026-01-01') },
  ]);
  assert.strictEqual(promotedHost.userId, 'older');
});

test('a removed or invited member is never promoted to host', () => {
  const { promotedHost } = planTrip({ createdBy: 'gone' }, [
    { userId: 'removed', role: 'organizer', status: 'removed', joinedAt: d('2026-01-01') },
    { userId: 'invited', role: 'organizer', status: 'pending', joinedAt: d('2026-01-02') },
    { userId: 'here', role: 'member', status: 'active', joinedAt: d('2026-05-01') },
  ]);
  assert.strictEqual(promotedHost.userId, 'here');
});

test('a member with no joinedAt does not outrank one that has a date', () => {
  const { promotedHost } = planTrip({ createdBy: 'gone' }, [
    { userId: 'undated', role: 'member', status: 'active' },
    { userId: 'dated', role: 'member', status: 'active', joinedAt: d('2026-09-01') },
  ]);
  assert.strictEqual(promotedHost.userId, 'dated');
  assert.ok(byJoinedAt({ joinedAt: d('2026-01-01') }, {}) < 0);
});

test('an empty trip invents nobody rather than crashing', () => {
  const { rows, promotedHost } = planTrip({ createdBy: 'gone' }, []);
  assert.deepStrictEqual(rows, []);
  assert.strictEqual(promotedHost, null);
});

// ---------------------------------------------------------------------------
// AC 4 · nobody loses access
// ---------------------------------------------------------------------------

test('AC 4 · an active member always maps to an active member', () => {
  const { wouldLoseAccess } = planTrip({ createdBy: 'a' }, [
    { userId: 'a', role: 'organizer', status: 'active' },
    { userId: 'b', role: 'member', status: 'active' },
    { userId: 'c', role: 'member', status: 'pending' },
    { userId: 'd', role: 'member', status: 'removed' },
  ]);
  assert.deepStrictEqual(wouldLoseAccess, [], 'nobody active before is inactive after');
});

// ---------------------------------------------------------------------------
// The rollback snapshot
// ---------------------------------------------------------------------------

test('a field the trip never had is left out of `before`, so rollback unsets it', () => {
  const raw = { name: 'Lisbon' };
  const before = beforeOf(raw, ['kind', 'status', 'orgId', 'entitlement', 'guestPermissions']);
  assert.deepStrictEqual(before, {});
});

test('a field the trip genuinely had is preserved', () => {
  const raw = { kind: 'hosted', orgId: 'org-1' };
  const before = beforeOf(raw, ['status', 'entitlement', 'guestPermissions']);
  assert.deepStrictEqual(before, { kind: 'hosted', orgId: 'org-1' });
});
