// The one place a role turns into permission.
//
// Spec 011 §5.1 is the capability table and it lives here AS DATA. A new
// feature adds a row; it does not invent a check (spec 011 case 13). Every
// HTTP route and socket handler resolves access through can() — G5 · One
// helper, enforced by server/test/g5-one-helper.test.js.
//
// Everything in this file is a pure function. Nothing here touches Mongo:
// callers pass the already-loaded member and trip. That is deliberate (spec
// 011 §10.2) — it makes the whole authorization model unit-testable on a
// machine with no database, which is how the table below can be trusted.
//
// Spec 011 §5.4, the resolution:
//
//   can(actor, trip, capability)
//     = roleGrants(member.role)     // who you are
//     ∩ guestPermissions(trip)      // the social shape, kind as its preset
//     ∩ entitlements(trip)          // what has been paid for

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

const TRIP_ROLES = ['host', 'co-host', 'guest'];
const ORG_ROLES = ['owner', 'admin', 'member'];

// Spec 011 §6.1. Only 'active' counts as a member — every count, denominator,
// split and analytics role reads this and nothing else (R-F9).
const MEMBER_STATUSES = ['invited', 'requested', 'active', 'declined', 'left', 'removed'];
const ACTIVE = 'active';

// Trip kinds. The social shape, not the permission (spec 011 §5.2). It selects
// which guest preset applies; it is never branched on in a route.
const TRIP_KINDS = ['personal', 'hosted'];

// Grant values in the table below.
const YES = true;
const NO = false;
// The person who made that object, whatever their role. Authorship is a
// separate axis and is resolved AFTER the capability check, never instead of
// it (spec 011 §5.1 footnote 2).
const CREATOR = 'creator';
// A co-host may set guest ↔ co-host, but only a host may create or demote a
// host. can() answers "may you set roles at all"; changeRoleRefusal() below
// holds the finer rule (spec 011 §6.3).
const PARTIAL = 'partial';

// ---------------------------------------------------------------------------
// The table — spec 011 §5.1, one row per capability
// ---------------------------------------------------------------------------
//
// The two guest columns are the two shipped PRESETS, not two code paths. A
// host flipping "guests can add schedule items" on a hosted trip overrides one
// entry of the guest column via Trip.guestPermissions; it branches nothing
// (spec 011 §5.2, F6).

const CAPABILITIES = {
  //                        host   co-host   guest (hosted)  guest (personal)
  'trip.view':            { host: YES, 'co-host': YES, hostedGuest: YES,     personalGuest: YES },
  'trip.edit':            { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'trip.delete':          { host: YES, 'co-host': NO,  hostedGuest: NO,      personalGuest: NO },
  'trip.transfer':        { host: YES, 'co-host': NO,  hostedGuest: NO,      personalGuest: NO },
  'member.invite':        { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'member.approve':       { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: NO },
  'member.remove':        { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: NO },
  'member.setRole':       { host: YES, 'co-host': PARTIAL, hostedGuest: NO,  personalGuest: NO },
  'invite.manage':        { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'schedule.view':        { host: YES, 'co-host': YES, hostedGuest: YES,     personalGuest: YES },
  'schedule.edit':        { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'schedule.propose':     { host: YES, 'co-host': YES, hostedGuest: YES,     personalGuest: YES },
  'draft.create':         { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'draft.view':           { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'draft.publish':        { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'poll.create':          { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'poll.vote':            { host: YES, 'co-host': YES, hostedGuest: YES,     personalGuest: YES },
  'poll.close':           { host: YES, 'co-host': YES, hostedGuest: CREATOR, personalGuest: CREATOR },
  'expense.create':       { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: YES },
  'expense.delete':       { host: YES, 'co-host': YES, hostedGuest: CREATOR, personalGuest: CREATOR },
  'announcement.post':    { host: YES, 'co-host': YES, hostedGuest: NO,      personalGuest: NO },
  'announcement.read':    { host: YES, 'co-host': YES, hostedGuest: YES,     personalGuest: YES },
  'question.ask':         { host: YES, 'co-host': YES, hostedGuest: YES,     personalGuest: YES },
  'location.share':       { host: YES, 'co-host': YES, hostedGuest: YES,     personalGuest: YES },
  'analytics.export':     { host: YES, 'co-host': NO,  hostedGuest: NO,      personalGuest: NO },
  // Added 2026-11-12 for the endpoint that makes AC 4 true end to end.
  // Spec 011 case 13: a feature PR that adds a write path adds a row here in
  // the same PR, defaulting to host-only. Changing what guests may do is a
  // decision about the shape of the trip, so it stays with the host.
  'trip.setGuestPermissions': { host: YES, 'co-host': NO, hostedGuest: NO,   personalGuest: NO },
};

const ALL_CAPABILITIES = Object.keys(CAPABILITIES);

// Capabilities that only read. A locked or archived trip still serves these
// (§4.1 question 3). A trip that has merely ENDED is not read-only — settle-up
// (spec 005) needs writes after the event (R7 · Trip after it ends).
const READ_ONLY_CAPABILITIES = new Set([
  'trip.view',
  'schedule.view',
  'draft.view',
  'announcement.read',
]);

const FROZEN_TRIP_STATUSES = new Set(['archived', 'locked']);

// ---------------------------------------------------------------------------
// Role labels — spec 012 §5.3
// ---------------------------------------------------------------------------
//
// The stored role never changes; only the word does. This is what stops the
// F7 migration renaming five friends into "a host and four guests"
// (Q1 · Guest on friend trips, AC 4).
//
// 18 FLAT keys, never derived by concatenating kind and role (spec 012 §6.2).
// The keys are named here; the Spanish and Portuguese VALUES are not written
// anywhere yet and must not be — they are blocked on the native reviewers in
// spec 003 §6 (O8 · Ungendered role labels), and scripts/locale-lint.sh fails
// any `roles` entry that inflects for gender.

const ROLE_LABEL_KEYS = {
  personal: {
    host: 'roles.personal.host',
    'co-host': 'roles.personal.coHost',
    guest: 'roles.personal.guest',
  },
  hosted: {
    host: 'roles.hosted.host',
    'co-host': 'roles.hosted.coHost',
    guest: 'roles.hosted.guest',
  },
};

// Until the 18 keys above exist, the client falls back to the role strings
// that spec 003 already shipped in all three languages. Without this a
// Spanish member list would read "Organizer" and "Member" in English, which
// is what happens if the server's English label is rendered directly — a
// localization regression, and one that spec 002 F33 and AC 27 forbid.
//
// The pair is resolved by i18next as an ordered key list, so the moment O8
// lands and `roles.*` is written, these stop being reached. Nothing has to
// change in a component for that to happen.
const ROLE_LABEL_FALLBACK_KEYS = {
  host: 'detail.organizer',
  'co-host': 'detail.organizer',
  guest: 'detail.member',
};

// English, for the server (push text, the CSV export, a log line). The client
// resolves the keys above through i18next instead.
const ROLE_LABELS_EN = {
  personal: { host: 'Organizer', 'co-host': 'Organizer', guest: 'Member' },
  hosted: { host: 'Host', 'co-host': 'Co-host', guest: 'Guest' },
};

function tripKind(trip) {
  return trip?.kind === 'hosted' ? 'hosted' : 'personal';
}

function roleLabelKey(role, trip) {
  return ROLE_LABEL_KEYS[tripKind(trip)]?.[role] || null;
}

function roleLabel(role, trip) {
  return ROLE_LABELS_EN[tripKind(trip)]?.[role] || null;
}

function roleLabelFallbackKey(role) {
  return ROLE_LABEL_FALLBACK_KEYS[role] || null;
}

// ---------------------------------------------------------------------------
// Entitlement — spec 011 §5.4, R8 · Entitlement axis
// ---------------------------------------------------------------------------
//
// Reserved, and nothing more. While Trip.entitlement is null the trip is
// unlimited and nothing is gated anywhere (R-F13, AC 13). The point of
// shipping the parameter now is that pricing later lands as a lookup in this
// one function instead of a migration against live pilot data.
//
// Entitlement attaches to the TRIP, never to a user: a guest in a paid trip
// pays nothing and their own trips are unaffected (R-F14).

function entitlements(trip) {
  if (!trip || trip.entitlement == null) {
    return { unlimited: true, capabilities: null };
  }
  // No plan sells anything yet. An unknown entitlement is unlimited rather
  // than empty, because billing must never remove access (R-F15, case 17).
  return { unlimited: true, capabilities: null };
}

function entitlementAllows(trip, capability) {
  const { unlimited, capabilities } = entitlements(trip);
  if (unlimited || !capabilities) return true;
  return capabilities.includes(capability);
}

// ---------------------------------------------------------------------------
// Guest permissions — spec 011 §5.2
// ---------------------------------------------------------------------------
//
// Trip.guestPermissions holds OVERRIDES to the guest column, nothing else.
// Absent or unset means the preset for the trip's kind.

function guestGrant(trip, capability) {
  const preset = tripKind(trip) === 'hosted' ? 'hostedGuest' : 'personalGuest';
  const row = CAPABILITIES[capability];
  if (!row) return NO;

  const override = guestOverride(trip, capability);
  if (override === true || override === false || override === CREATOR) return override;
  return row[preset];
}

// Trip.guestPermissions is a list of { capability, allowed }. It is a list
// rather than an object keyed by capability because capability names contain
// a dot, which Mongoose Maps reject outright and which is ambiguous in a
// $set path.
function guestOverride(trip, capability) {
  const overrides = trip?.guestPermissions;
  if (!overrides) return undefined;
  const entries = typeof overrides.toObject === 'function' ? overrides.toObject() : overrides;
  if (!Array.isArray(entries)) return undefined;
  return entries.find((e) => e && e.capability === capability)?.allowed;
}

// ---------------------------------------------------------------------------
// can() — the helper G5 is about
// ---------------------------------------------------------------------------
//
// actor      the loaded TripMember for this user on this trip, or null.
//            Access comes ONLY from an active TripMember record. An
//            Organization role grants no trip capability, ever — it grants
//            the right to OBTAIN one (spec 011 §4.2, D19, AC 2).
// trip       the trip, for kind, guestPermissions, entitlement and status.
// capability one of ALL_CAPABILITIES.
// context    { resource } for the CREATOR rows: the poll or expense whose
//            author is being checked. Authorship is resolved after the
//            capability check, never instead of it.

function can(actor, trip, capability, context = {}) {
  const row = CAPABILITIES[capability];
  if (!row) return false;

  // 1. Is there an active TripMember? If not → no, and nothing else is
  //    consulted (spec 011 §4.1).
  if (!actor || actor.status !== ACTIVE) return false;

  // 3. Does the trip's own state allow it? Checked before the role so a frozen
  //    trip refuses a host as firmly as a guest.
  if (FROZEN_TRIP_STATUSES.has(trip?.status) && !READ_ONLY_CAPABILITIES.has(capability)) {
    return false;
  }

  // 2. What does the role grant?
  let grant;
  if (actor.role === 'host' || actor.role === 'co-host') {
    grant = row[actor.role];
  } else if (actor.role === 'guest') {
    grant = guestGrant(trip, capability);
  } else {
    // An unknown role grants nothing. A trip that has not been migrated yet
    // lands here rather than falling through to something permissive.
    return false;
  }

  if (grant === NO) return false;

  if (grant === CREATOR) {
    const resource = context.resource;
    if (!resource) return false;
    const author = resource.createdBy ?? resource.userId ?? resource.authorId;
    if (!author || String(author) !== String(actor.userId)) return false;
  }

  // PARTIAL and YES both pass here; PARTIAL's finer rule is changeRoleRefusal.

  // ∩ entitlement (reserved — always true while nothing is sold).
  return entitlementAllows(trip, capability);
}

// Which column of the table applies to this actor on this trip.
function columnFor(actor, trip) {
  if (actor?.role === 'host' || actor?.role === 'co-host') return actor.role;
  if (actor?.role === 'guest') return tripKind(trip) === 'hosted' ? 'hostedGuest' : 'personalGuest';
  return null;
}

// The viewer's resolved capabilities, for the trip payload (R-F11).
//
// The client renders its action controls from this and never sees a role name
// except to display it (spec 011 risk 1). Capabilities are DERIVED, never
// persisted on the member (§4.3) — a stored copy goes stale the moment a
// preset changes.
//
// TWO LISTS, not one. An earlier version returned a single list and reported
// a CREATOR row — poll.close, expense.delete — as simply "held", on the
// reasoning that a UI needs it to show the control at all. That is ambiguous
// in the one place it matters: "I may close polls" and "I may close the polls
// I made" are different answers, and a client that cannot tell them apart
// shows a close button on everyone's poll and collects a 403. It did exactly
// that (review of PR #124, finding 7).
//
//   capabilities     — held outright, on anything
//   ownCapabilities  — held only on objects this person created
//
// Authorship stays a separate axis resolved after the capability check
// (§5.1 footnote 2); this only reports which axis applies.
function capabilitiesFor(actor, trip) {
  const column = columnFor(actor, trip);
  const held = [];
  const own = [];
  if (!column) return { capabilities: held, ownCapabilities: own };

  for (const capability of ALL_CAPABILITIES) {
    const grant = actor.role === 'guest' ? guestGrant(trip, capability) : CAPABILITIES[capability][column];
    if (grant === CREATOR) {
      if (can(actor, trip, capability, { resource: { createdBy: actor.userId } })) own.push(capability);
    } else if (can(actor, trip, capability)) {
      held.push(capability);
    }
  }
  return { capabilities: held, ownCapabilities: own };
}

// ---------------------------------------------------------------------------
// G3 · No self-demotion, and the §6.3 promotion and demotion matrix
// ---------------------------------------------------------------------------
//
// Returns a refusal message, or null when the change is allowed. A message
// rather than a boolean because every refusal here has to name the way out
// rather than being a bare error (lens L7).

function changeRoleRefusal(actor, target, newRole, trip) {
  if (!TRIP_ROLES.includes(newRole)) {
    return `Unknown role: ${newRole}.`;
  }
  if (!can(actor, trip, 'member.setRole')) {
    return 'You cannot change roles on this trip.';
  }
  // G3 · No self-demotion. Nobody changes their own role — it prevents the
  // accidental self-lockout and makes every demotion attributable to someone
  // else (spec 011 §6.2, AC 7).
  if (String(actor.userId) === String(target.userId)) {
    return 'You cannot change your own role. Ask another host to do it.';
  }

  const actorIsHost = actor.role === 'host';
  if (!actorIsHost) {
    // A co-host may set guest ↔ co-host and nothing else (PARTIAL).
    if (newRole === 'host') {
      return 'Only a host can make someone a host.';
    }
    if (target.role === 'host') {
      return 'Only a host can change a host’s role.';
    }
    if (target.role === 'co-host' && newRole === 'guest') {
      // A co-host cannot demote a co-host — otherwise two co-hosts can demote
      // each other (spec 011 §6.3).
      return 'Only a host can move a co-host back to guest.';
    }
  }
  return null;
}

// May this actor REMOVE this person? (review finding 4)
//
// `member.remove` alone said yes to a co-host removing a host. The §6.3
// matrix governs who may move whom between roles, and removal is strictly
// more destructive than demotion — it would be odd for a co-host to be unable
// to demote a host but able to remove one. So removal borrows the same rule:
// you may remove someone only if you could have moved them to guest first.
//
// Returns a refusal message, or null when it is allowed.
function removeRefusal(actor, target, trip) {
  if (!can(actor, trip, 'member.remove')) {
    return 'You cannot remove people from this trip.';
  }
  if (String(actor.userId) === String(target.userId)) {
    // Frame 7: "You cannot remove yourself." Leaving is a different act and
    // is not built in this slice.
    return 'You cannot remove yourself from this trip.';
  }
  const actorIsHost = actor.role === 'host';
  if (!actorIsHost && target.role === 'host') {
    return 'Only a host can remove a host.';
  }
  if (!actorIsHost && target.role === 'co-host') {
    return 'Only a host can remove a co-host.';
  }
  return null;
}

// What role should someone come back with? (review finding 5)
//
// Spec 011 §6.1 is deliberate: role and status are orthogonal so that
// "re-adding someone restores what they were". That is the behaviour we want
// — but `member.invite` is held by every member of a PERSONAL trip, so on its
// own it let a guest re-add a removed host and silently restore host, which
// is a role they could never have granted.
//
// So the record still remembers, and the restore is bounded by the actor's
// own authority: you get your old role back if the person letting you back in
// could have given it to you, and guest otherwise.
function restoredRole(actor, previousRole, trip) {
  if (!previousRole || previousRole === 'guest') return 'guest';
  const target = { userId: '__restoring__', role: 'guest' };
  return changeRoleRefusal(actor, target, previousRole, trip) ? 'guest' : previousRole;
}

// The last active host cannot be demoted or removed (spec 011 G1 · Last host).
//
// Scope note: G1 and G2 are slice S7 (#115), not block 1. What is here is only
// the pure predicate, and only because block 1 REMOVES today's blunt guard —
// `if (target.role === 'organizer') return "Organizers cannot be removed"`
// (routes/groups.js) — which is the single thing standing between a trip and
// having nobody in charge. Replacing a crude guard with none would be a
// regression introduced by this slice, so the predicate lands with it. The
// service-layer count across an Organization (G2) stays in #115.
//
// members: the trip's members. change: { userId, newRole } or { userId, remove }.
function wouldLeaveNoHost(members, change) {
  const activeHosts = (members || []).filter((m) => m.status === ACTIVE && m.role === 'host');
  const affected = activeHosts.some((m) => String(m.userId) === String(change.userId));
  if (!affected) return false;
  if (!change.remove && change.newRole === 'host') return false;
  return activeHosts.length <= 1;
}

const LAST_HOST_REFUSAL =
  'This is the only host. Make someone else a host first, then this can go ahead.';

module.exports = {
  CAPABILITIES,
  ALL_CAPABILITIES,
  TRIP_ROLES,
  ORG_ROLES,
  TRIP_KINDS,
  MEMBER_STATUSES,
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
  LAST_HOST_REFUSAL,
};
