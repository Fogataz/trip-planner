const mongoose = require('mongoose');
const { TRIP_ROLES, MEMBER_STATUSES } = require('../services/permissions');

// Membership as a collection, not an embedded array (spec 011 §10.2).
//
// Why a collection: the pilot is 38 attendees and the model targets hundreds
// (working doc §4.2). The capability check reads ONE member document, never
// the whole member list, and the unique index below is what makes "a guest is
// removed and re-added" restore the same record instead of creating a second
// (spec 011 case 12).
//
// Role and status are ORTHOGONAL (§6.1). A removed co-host is
// { role: 'co-host', status: 'removed' } — not demoted. History stays
// readable and re-adding someone restores what they were.

const tripMemberSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  // Carried alongside the ObjectId because routes and the socket room are both
  // keyed by groupId, exactly as TripInvitation already does. It saves a trip
  // lookup on the hot path (join-trip, every requireCapability call).
  groupId: {
    type: String,
    required: true,
  },
  // Absent until an invited person accepts: an invitation is addressed to an
  // email, and the account that accepts it may be a different one
  // (spec 012 §5.8.1, the token is the credential).
  userId: {
    type: String,
    default: null,
  },
  email: String,
  role: {
    type: String,
    enum: TRIP_ROLES,
    default: 'guest',
  },
  status: {
    type: String,
    enum: MEMBER_STATUSES,
    default: 'active',
  },

  // Per-member overrides. RESERVED AND EMPTY — spec 011 block 4 fills them,
  // and can() does not read them yet. Reserving the two fields now is what
  // makes "three presets turn out to be too few" an additive change rather
  // than a migration against live pilot data (risk 5).
  grants: {
    type: [String],
    default: [],
  },
  revokes: {
    type: [String],
    default: [],
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: String,
  invitedAt: Date,
  // Attribution for every status change: who removed whom, and when. Readable
  // by hosts only (lens L4).
  statusChangedAt: Date,
  statusChangedBy: String,
});

// Spec 011 §10.2: unique on (tripId, userId), which enforces case 12.
// Partial, because a member invited by email has no userId yet and several of
// those on one trip are normal.
tripMemberSchema.index(
  { tripId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' } } }
);
tripMemberSchema.index({ tripId: 1, email: 1 });
tripMemberSchema.index({ groupId: 1, userId: 1 });
tripMemberSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('TripMember', tripMemberSchema);
