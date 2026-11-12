// The capability model, proven without a database.
//
// This is the payoff for making services/permissions.js pure (spec 011
// §10.2): the acceptance criteria that are about WHO MAY DO WHAT can be
// asserted directly, on a machine with no Mongo, instead of being hoped for.
//
// Each test names the spec 011 acceptance criterion it covers.

const { test } = require('node:test');
const assert = require('node:assert');

const {
  CAPABILITIES,
  ALL_CAPABILITIES,
  can,
  capabilitiesFor,
  entitlements,
  roleLabel,
  roleLabelKey,
  changeRoleRefusal,
  wouldLeaveNoHost,
} = require('../services/permissions');

const hostedTrip = { kind: 'hosted', entitlement: null };
const personalTrip = { kind: 'personal', entitlement: null };

const member = (role, userId = 'u1', status = 'active') => ({ userId, role, status });

// ---------------------------------------------------------------------------
// The table itself
// ---------------------------------------------------------------------------

test('every capability row has all four columns', () => {
  for (const [name, row] of Object.entries(CAPABILITIES)) {
    for (const column of ['host', 'co-host', 'hostedGuest', 'personalGuest']) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(row, column),
        `${name} is missing the ${column} column`
      );
    }
  }
});

test('the vocabulary is the one in spec 011 §5.1 — 25 capabilities', () => {
  assert.strictEqual(ALL_CAPABILITIES.length, 25);
});

// ---------------------------------------------------------------------------
// AC 1 / D19 · Access comes only from an active TripMember
// ---------------------------------------------------------------------------

test('AC 2 · no member record is no access, whatever the Organization says', () => {
  // An Organization owner or admin with no role on the trip arrives here as
  // null: an org role grants no trip capability, ever (spec 011 §4.2).
  assert.strictEqual(can(null, hostedTrip, 'trip.view'), false);
  assert.strictEqual(can(undefined, hostedTrip, 'schedule.edit'), false);
});

test('a member who is not active grants nothing', () => {
  for (const status of ['invited', 'requested', 'declined', 'left', 'removed']) {
    assert.strictEqual(
      can(member('host', 'u1', status), hostedTrip, 'trip.view'),
      false,
      `${status} should see nothing`
    );
  }
});

test('an unknown or unmigrated role grants nothing', () => {
  assert.strictEqual(can(member('organizer'), personalTrip, 'trip.view'), false);
  assert.strictEqual(can(member(undefined), personalTrip, 'trip.view'), false);
});

// ---------------------------------------------------------------------------
// AC 3 · the guest columns, which are F6
// ---------------------------------------------------------------------------

test('AC 3 · a hosted guest cannot edit the schedule; a personal guest can', () => {
  assert.strictEqual(can(member('guest'), hostedTrip, 'schedule.edit'), false);
  assert.strictEqual(can(member('guest'), personalTrip, 'schedule.edit'), true);
});

test('a hosted guest can view, vote, ask, share location and propose', () => {
  for (const capability of [
    'trip.view',
    'schedule.view',
    'poll.vote',
    'question.ask',
    'location.share',
    'schedule.propose',
    'announcement.read',
  ]) {
    assert.strictEqual(can(member('guest'), hostedTrip, capability), true, capability);
  }
});

test('a hosted guest writes nothing into the shared trip directly', () => {
  for (const capability of [
    'trip.edit',
    'schedule.edit',
    'poll.create',
    'expense.create',
    'announcement.post',
    'draft.create',
    'draft.view',
    'draft.publish',
    'member.invite',
    'member.approve',
    'member.remove',
  ]) {
    assert.strictEqual(can(member('guest'), hostedTrip, capability), false, capability);
  }
});

// ---------------------------------------------------------------------------
// AC 4 · guestPermissions is a preset, not a branch
// ---------------------------------------------------------------------------

test('AC 4 · one guest override flips one entry and nothing else', () => {
  const trip = { kind: 'hosted', entitlement: null, guestPermissions: { 'schedule.edit': true } };
  const guest = member('guest');

  assert.strictEqual(can(guest, trip, 'schedule.edit'), true);

  // No other guest capability changed.
  const before = capabilitiesFor(guest, hostedTrip);
  const after = capabilitiesFor(guest, trip);
  assert.deepStrictEqual(
    after.filter((c) => !before.includes(c)),
    ['schedule.edit']
  );
  assert.deepStrictEqual(before.filter((c) => !after.includes(c)), []);
});

test('an override can also take a capability away', () => {
  const trip = { kind: 'personal', entitlement: null, guestPermissions: { 'schedule.edit': false } };
  assert.strictEqual(can(member('guest'), trip, 'schedule.edit'), false);
});

// ---------------------------------------------------------------------------
// Authorship is resolved after the capability check, never instead of it
// ---------------------------------------------------------------------------

test('a guest may close the poll they made, and no other', () => {
  const guest = member('guest', 'marta');
  const own = { createdBy: 'marta' };
  const other = { createdBy: 'joao' };

  assert.strictEqual(can(guest, hostedTrip, 'poll.close', { resource: own }), true);
  assert.strictEqual(can(guest, hostedTrip, 'poll.close', { resource: other }), false);
  // No resource given: nothing is assumed.
  assert.strictEqual(can(guest, hostedTrip, 'poll.close'), false);
});

test('a host may close any poll, including one a guest made', () => {
  assert.strictEqual(
    can(member('host'), hostedTrip, 'poll.close', { resource: { createdBy: 'marta' } }),
    true
  );
});

test('a removed member who authored the poll still cannot close it', () => {
  const removed = member('guest', 'marta', 'removed');
  assert.strictEqual(
    can(removed, hostedTrip, 'poll.close', { resource: { createdBy: 'marta' } }),
    false
  );
});

// ---------------------------------------------------------------------------
// The co-host boundary
// ---------------------------------------------------------------------------

test('a co-host runs the trip but cannot end or hand it over', () => {
  const coHost = member('co-host');
  assert.strictEqual(can(coHost, hostedTrip, 'schedule.edit'), true);
  assert.strictEqual(can(coHost, hostedTrip, 'draft.publish'), true);
  assert.strictEqual(can(coHost, hostedTrip, 'member.approve'), true);
  assert.strictEqual(can(coHost, hostedTrip, 'trip.delete'), false);
  assert.strictEqual(can(coHost, hostedTrip, 'trip.transfer'), false);
  assert.strictEqual(can(coHost, hostedTrip, 'analytics.export'), false);
});

// ---------------------------------------------------------------------------
// AC 7 · G3 · No self-demotion, and the §6.3 matrix
// ---------------------------------------------------------------------------

test('AC 7 · nobody can change their own role', () => {
  const host = member('host', 'alberto');
  const refusal = changeRoleRefusal(host, host, 'co-host', hostedTrip);
  assert.match(refusal, /your own role/i);
});

test('a host may promote a guest to co-host and back', () => {
  const host = member('host', 'alberto');
  const guest = member('guest', 'marta');
  const coHost = member('co-host', 'marta');
  assert.strictEqual(changeRoleRefusal(host, guest, 'co-host', hostedTrip), null);
  assert.strictEqual(changeRoleRefusal(host, coHost, 'guest', hostedTrip), null);
  assert.strictEqual(changeRoleRefusal(host, coHost, 'host', hostedTrip), null);
});

test('a co-host may set guest ↔ co-host and nothing beyond it', () => {
  const coHost = member('co-host', 'nuria');
  const guest = member('guest', 'marta');
  const otherCoHost = member('co-host', 'diego');
  const host = member('host', 'alberto');

  assert.strictEqual(changeRoleRefusal(coHost, guest, 'co-host', hostedTrip), null);
  // A co-host cannot demote a co-host, or the two can demote each other.
  assert.match(changeRoleRefusal(coHost, otherCoHost, 'guest', hostedTrip), /only a host/i);
  assert.match(changeRoleRefusal(coHost, guest, 'host', hostedTrip), /only a host/i);
  assert.match(changeRoleRefusal(coHost, host, 'co-host', hostedTrip), /only a host/i);
});

test('a guest may not change anyone’s role', () => {
  const guest = member('guest', 'marta');
  assert.match(
    changeRoleRefusal(guest, member('guest', 'joao'), 'co-host', hostedTrip),
    /cannot change roles/i
  );
});

// ---------------------------------------------------------------------------
// G1 · Last host — the pure predicate (see the note in permissions.js)
// ---------------------------------------------------------------------------

test('the only host cannot be demoted or removed', () => {
  const members = [
    { userId: 'alberto', role: 'host', status: 'active' },
    { userId: 'nuria', role: 'co-host', status: 'active' },
  ];
  assert.strictEqual(wouldLeaveNoHost(members, { userId: 'alberto', remove: true }), true);
  assert.strictEqual(wouldLeaveNoHost(members, { userId: 'alberto', newRole: 'guest' }), true);
  assert.strictEqual(wouldLeaveNoHost(members, { userId: 'nuria', remove: true }), false);
});

test('with two hosts either may step down', () => {
  const members = [
    { userId: 'alberto', role: 'host', status: 'active' },
    { userId: 'diego', role: 'host', status: 'active' },
  ];
  assert.strictEqual(wouldLeaveNoHost(members, { userId: 'alberto', remove: true }), false);
});

test('a removed host does not count as cover for the last one', () => {
  const members = [
    { userId: 'alberto', role: 'host', status: 'active' },
    { userId: 'old', role: 'host', status: 'removed' },
  ];
  assert.strictEqual(wouldLeaveNoHost(members, { userId: 'alberto', remove: true }), true);
});

// ---------------------------------------------------------------------------
// AC 13 / R8 · the entitlement axis is reserved and changes nothing
// ---------------------------------------------------------------------------

test('AC 13 · with entitlement null, every capability resolves as before', () => {
  for (const role of ['host', 'co-host', 'guest']) {
    for (const trip of [hostedTrip, personalTrip]) {
      const withField = capabilitiesFor(member(role), { ...trip, entitlement: null });
      const withoutField = capabilitiesFor(member(role), { kind: trip.kind });
      assert.deepStrictEqual(withField, withoutField, `${role} on ${trip.kind}`);
    }
  }
});

test('entitlements() returns unlimited and gates nothing', () => {
  assert.deepStrictEqual(entitlements({ entitlement: null }), { unlimited: true, capabilities: null });
  // R-F15: a lapsed or unknown entitlement never removes access.
  assert.strictEqual(entitlements({ entitlement: 'lapsed-plan' }).unlimited, true);
});

test('AC 14 · an entitlement never changes a trip’s kind, role or labels', () => {
  const paid = { kind: 'personal', entitlement: 'trip-pass' };
  assert.strictEqual(can(member('host'), paid, 'draft.create'), true);
  assert.strictEqual(roleLabel('guest', paid), 'Member');
});

// ---------------------------------------------------------------------------
// Spec 012 §5.3 / AC 4 · role labels follow the trip kind
// ---------------------------------------------------------------------------

test('012 AC 3 · the same stored role reads differently by trip kind', () => {
  assert.strictEqual(roleLabel('host', personalTrip), 'Organizer');
  assert.strictEqual(roleLabel('co-host', personalTrip), 'Organizer');
  assert.strictEqual(roleLabel('guest', personalTrip), 'Member');

  assert.strictEqual(roleLabel('host', hostedTrip), 'Host');
  assert.strictEqual(roleLabel('co-host', hostedTrip), 'Co-host');
  assert.strictEqual(roleLabel('guest', hostedTrip), 'Guest');
});

test('012 AC 4 · a migrated trip says what it said before', () => {
  // The words an existing user saw were "Organizer" and "Member". After the
  // F7 migration the stored roles are host and guest on a personal trip —
  // and the words are unchanged. That is Q1 · Guest on friend trips, closed.
  const migrated = { kind: 'personal', entitlement: null };
  assert.strictEqual(roleLabel('host', migrated), 'Organizer');
  assert.strictEqual(roleLabel('guest', migrated), 'Member');
});

test('role label keys are 18 flat keys, never concatenated at the call site', () => {
  assert.strictEqual(roleLabelKey('co-host', hostedTrip), 'roles.hosted.coHost');
  assert.strictEqual(roleLabelKey('co-host', personalTrip), 'roles.personal.coHost');
  assert.strictEqual(roleLabelKey('nonsense', personalTrip), null);
});

// ---------------------------------------------------------------------------
// Trip state (§4.1 question 3)
// ---------------------------------------------------------------------------

test('an archived trip refuses writes from everyone and still reads', () => {
  const archived = { kind: 'personal', entitlement: null, status: 'archived' };
  assert.strictEqual(can(member('host'), archived, 'schedule.edit'), false);
  assert.strictEqual(can(member('host'), archived, 'trip.view'), true);
});

test('R7 · a trip that has merely ended stays writable', () => {
  // Settle-up (spec 005) needs writes after the event.
  const ended = { kind: 'hosted', entitlement: null, status: 'ended' };
  assert.strictEqual(can(member('host'), ended, 'expense.create'), true);
});

// ---------------------------------------------------------------------------
// AC 12 · the client renders from the resolved list
// ---------------------------------------------------------------------------

test('capabilitiesFor returns the viewer’s resolved list', () => {
  const guestList = capabilitiesFor(member('guest'), hostedTrip);
  assert.ok(guestList.includes('poll.vote'));
  assert.ok(!guestList.includes('schedule.edit'));
  assert.ok(guestList.includes('poll.close'), 'a guest may close polls they made');

  assert.deepStrictEqual(capabilitiesFor(null, hostedTrip), []);
  assert.deepStrictEqual(capabilitiesFor(member('guest', 'u1', 'removed'), hostedTrip), []);

  const hostList = capabilitiesFor(member('host'), hostedTrip);
  assert.strictEqual(hostList.length, ALL_CAPABILITIES.length, 'a host holds everything');
});

test('can() is pure — it never mutates what it is given', () => {
  const actor = member('guest');
  const trip = { kind: 'hosted', entitlement: null, guestPermissions: { 'poll.create': true } };
  const actorBefore = JSON.stringify(actor);
  const tripBefore = JSON.stringify(trip);
  capabilitiesFor(actor, trip);
  can(actor, trip, 'schedule.edit');
  assert.strictEqual(JSON.stringify(actor), actorBefore);
  assert.strictEqual(JSON.stringify(trip), tripBefore);
});
