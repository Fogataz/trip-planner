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
  ROLE_LABEL_KEYS,
  can,
  capabilitiesFor,
  entitlements,
  roleLabel,
  roleLabelKey,
  roleLabelFallbackKey,
  changeRoleRefusal,
  removeRefusal,
  restoredRole,
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
  const before = capabilitiesFor(guest, hostedTrip).capabilities;
  const after = capabilitiesFor(guest, trip).capabilities;
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
      assert.deepStrictEqual(withField.ownCapabilities, withoutField.ownCapabilities, `${role} own`);
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

test('capabilitiesFor separates what you hold outright from what you hold on your own', () => {
  const { capabilities, ownCapabilities } = capabilitiesFor(member('guest'), hostedTrip);

  assert.ok(capabilities.includes('poll.vote'));
  assert.ok(!capabilities.includes('schedule.edit'));

  // The regression this split exists to prevent (review finding 7): a guest
  // may close the poll THEY made, and a client told only "poll.close" showed
  // a close button on everyone's poll and collected a 403.
  assert.ok(!capabilities.includes('poll.close'), 'not held outright');
  assert.ok(ownCapabilities.includes('poll.close'), 'held on their own');
  assert.ok(ownCapabilities.includes('expense.delete'));

  // The two lists never overlap — a capability is one or the other.
  assert.deepStrictEqual(capabilities.filter((c) => ownCapabilities.includes(c)), []);
});

test('a host holds the creator rows outright, not conditionally', () => {
  const { capabilities, ownCapabilities } = capabilitiesFor(member('host'), hostedTrip);
  assert.ok(capabilities.includes('poll.close'), 'a host may close any poll');
  assert.deepStrictEqual(ownCapabilities, [], 'nothing is creator-conditional for a host');
  assert.strictEqual(capabilities.length, ALL_CAPABILITIES.length, 'a host holds everything');
});

test('a non-member and a removed member hold nothing, in either list', () => {
  for (const actor of [null, member('guest', 'u1', 'removed')]) {
    const resolved = capabilitiesFor(actor, hostedTrip);
    assert.deepStrictEqual(resolved.capabilities, []);
    assert.deepStrictEqual(resolved.ownCapabilities, []);
  }
});

test('a personal guest keeps the creator rows conditional too', () => {
  // The regression was worst here: on a personal trip every member holds
  // member.invite, so "isOrganizer" was true for everyone.
  const { capabilities, ownCapabilities } = capabilitiesFor(member('guest'), personalTrip);
  assert.ok(capabilities.includes('schedule.edit'), 'friends still edit the plan');
  assert.ok(capabilities.includes('member.invite'), 'and still invite');
  assert.ok(!capabilities.includes('poll.close'));
  assert.ok(ownCapabilities.includes('poll.close'));
  assert.ok(!capabilities.includes('member.remove'), 'but do not remove people');
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

// ---------------------------------------------------------------------------
// The role pill must be localized — spec 002 F33 and AC 27
// ---------------------------------------------------------------------------

test('every role falls back to a key spec 003 already ships', () => {
  // Rendering the server's English label in the client is the regression this
  // guards: a Spanish member list would read "Organizer" and "Member".
  assert.strictEqual(roleLabelFallbackKey('host'), 'detail.organizer');
  assert.strictEqual(roleLabelFallbackKey('co-host'), 'detail.organizer');
  assert.strictEqual(roleLabelFallbackKey('guest'), 'detail.member');
});

test('those fallback keys resolve in en, es and pt', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const dir = path.join(__dirname, '..', '..', 'client', 'src', 'locales');

  for (const file of ['en.json', 'es.json', 'pt.json']) {
    const json = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    for (const role of ['host', 'co-host', 'guest']) {
      const key = roleLabelFallbackKey(role);
      const value = key.split('.').reduce((node, part) => node?.[part], json);
      assert.ok(
        typeof value === 'string' && value.length > 0,
        `${file} has no string at ${key} — the role pill would render the raw key`
      );
    }
  }
});

test('the 18 key names are stable, so O8 lands as a value change', () => {
  // The structure is the expensive half. Keeping personal and hosted as
  // SEPARATE keys — even where a language ends up using the same word for
  // both — means a reviewer's answer is an edit to locale files and never a
  // change at a call site (spec 012 §6.2, O8 · Ungendered role labels).
  const names = Object.values(ROLE_LABEL_KEYS).flatMap((kind) => Object.values(kind));
  assert.strictEqual(new Set(names).size, 6, 'six key names per language, 18 across three');
  assert.ok(names.every((n) => n.startsWith('roles.')), 'all under `roles.`, which locale-lint checks');
});

// ---------------------------------------------------------------------------
// Who may remove whom — review finding 4
// ---------------------------------------------------------------------------

test('a co-host cannot remove a host, or another co-host', () => {
  const coHost = member('co-host', 'nuria');
  assert.match(removeRefusal(coHost, member('host', 'alberto'), hostedTrip), /only a host/i);
  assert.match(removeRefusal(coHost, member('co-host', 'diego'), hostedTrip), /only a host/i);
  assert.strictEqual(removeRefusal(coHost, member('guest', 'marta'), hostedTrip), null);
});

test('a host may remove a co-host or a guest', () => {
  const host = member('host', 'alberto');
  assert.strictEqual(removeRefusal(host, member('co-host', 'nuria'), hostedTrip), null);
  assert.strictEqual(removeRefusal(host, member('guest', 'marta'), hostedTrip), null);
});

test('nobody removes themselves', () => {
  const host = member('host', 'alberto');
  assert.match(removeRefusal(host, host, hostedTrip), /yourself/i);
});

test('a guest may not remove anyone, on either kind of trip', () => {
  const guest = member('guest', 'marta');
  for (const trip of [hostedTrip, personalTrip]) {
    assert.match(removeRefusal(guest, member('guest', 'joao'), trip), /cannot remove/i);
  }
});

// ---------------------------------------------------------------------------
// What role you come back with — review finding 5
// ---------------------------------------------------------------------------

test('a host re-adding a removed co-host restores co-host', () => {
  // §6.1: role and status are orthogonal so re-adding restores what they were.
  assert.strictEqual(restoredRole(member('host', 'alberto'), 'co-host', hostedTrip), 'co-host');
  assert.strictEqual(restoredRole(member('host', 'alberto'), 'host', hostedTrip), 'host');
});

test('a personal-trip guest re-adding a removed host gets them back as a guest', () => {
  // The escalation: member.invite is held by every member of a personal trip,
  // so without this a guest could restore a host they could never appoint.
  const guest = member('guest', 'marta');
  assert.strictEqual(restoredRole(guest, 'host', personalTrip), 'guest');
  assert.strictEqual(restoredRole(guest, 'co-host', personalTrip), 'guest');
});

test('a co-host restores a co-host but not a host', () => {
  const coHost = member('co-host', 'nuria');
  assert.strictEqual(restoredRole(coHost, 'co-host', hostedTrip), 'co-host');
  assert.strictEqual(restoredRole(coHost, 'host', hostedTrip), 'guest');
});

test('somebody brand new is always a guest', () => {
  assert.strictEqual(restoredRole(member('host', 'a'), undefined, hostedTrip), 'guest');
  assert.strictEqual(restoredRole(member('host', 'a'), 'guest', hostedTrip), 'guest');
});
