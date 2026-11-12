// The TripMember migration's mapping, as pure functions.
//
// Split out of scripts/migrate-tripmembers.js so it can be unit-tested with
// no database and no dependencies — which is the only way it runs in CI, and
// the reason "no migration tests" was a fair finding on PR #124. The script
// keeps the IO; everything that decides anything is here.
//
// Role strings are compared in this file. That is not a G5 · One helper
// violation: G5 is about capability DECISIONS at runtime, and this is a
// one-off translation of stored data from the old vocabulary to the new.
// scripts/ is outside the G5 scan for exactly that reason.

// The creator is the host; any other organizer becomes a co-host.
function roleFor(member, trip) {
  if (member.userId && member.userId === trip.createdBy) return 'host';
  return member.role === 'organizer' ? 'co-host' : 'guest';
}

// Spec 011 §6.1's vocabulary. 'pending' meant "invited, not accepted", and is
// in none of the new enums — Q22 · Status carried over is not a valid status.
const STATUS = { pending: 'invited', active: 'active', removed: 'removed' };
function statusFor(member) {
  return STATUS[member.status] || 'active';
}

// The fields the migration sets on the trip.
const MIGRATED_FIELDS = ['kind', 'status', 'orgId', 'entitlement', 'guestPermissions'];

// `before`, for the reverse script: only the fields listed in `absent` are
// omitted, so a field the trip genuinely had keeps its value and one it never
// had is $unset rather than written back as a default.
function beforeOf(raw, absent = []) {
  const before = {};
  for (const field of MIGRATED_FIELDS) {
    if (absent.includes(field)) continue;
    if (raw && Object.prototype.hasOwnProperty.call(raw, field)) before[field] = raw[field];
  }
  return before;
}

function label(role) {
  // What these people will SEE, since every migrated trip is personal.
  return role === 'guest' ? 'Member' : 'Organizer';
}

// Oldest membership first. An absent joinedAt sorts last rather than first:
// a row with no date is not evidence of being the longest-standing member.
function byJoinedAt(a, b) {
  const at = a.joinedAt ? new Date(a.joinedAt).getTime() : Infinity;
  const bt = b.joinedAt ? new Date(b.joinedAt).getTime() : Infinity;
  return at - bt;
}

// The whole plan for one trip. Returns the rows to write, whether a host had
// to be invented, and anyone who would lose access (AC 4).
function planTrip(trip, members) {
  const rows = members.map((m) => ({
    userId: m.userId || null,
    email: m.email || null,
    from: { role: m.role, status: m.status },
    role: roleFor(m, trip),
    status: statusFor(m),
    joinedAt: m.joinedAt,
    invitedBy: m.invitedBy,
    invitedAt: m.invitedAt,
    promoted: false,
  }));

  // AC 4: anyone who could open this trip yesterday must be able to tomorrow.
  const wouldLoseAccess = rows
    .filter((r) => r.from.status === 'active' && r.status !== 'active')
    .map((r) => r.email || r.userId);

  // Q21 · Migration can leave a trip with no host. The mapping above can only
  // produce a host from the creator, so a trip whose creator is no longer in
  // its own member list migrates to zero hosts — unadministrable, and
  // G1 · Last host violated from the first second.
  //
  // The replacement is the EARLIEST-JOINED active organizer, falling back to
  // the earliest-joined active member. Array order is not seniority: it is
  // whatever order the pushes happened in, and PR #124's first version used
  // it while the amendment promised "longest-standing".
  let promotedHost = null;
  if (!rows.some((r) => r.role === 'host' && r.status === 'active')) {
    const active = rows.filter((r) => r.status === 'active').sort(byJoinedAt);
    const candidate =
      active.find((r) => r.from.role === 'organizer') || active[0] || null;
    if (candidate) {
      candidate.role = 'host';
      candidate.promoted = true;
      promotedHost = candidate;
    }
  }

  return { rows, promotedHost, wouldLoseAccess };
}

module.exports = { planTrip, roleFor, statusFor, beforeOf, label, byJoinedAt, MIGRATED_FIELDS, STATUS };
