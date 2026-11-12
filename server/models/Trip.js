const mongoose = require('mongoose');
const { TRIP_KINDS, ALL_CAPABILITIES } = require('../services/permissions');

// A trip cover is either a curated gallery entry (key = gallery slug) or an
// uploaded image (key = GridFS file id). focalY is the point every crop centres on.
const coverSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['gallery', 'upload'], required: true },
    key: { type: String, required: true },
    focalY: { type: Number, default: 50, min: 0, max: 100 },
    dominantColor: String,
    alt: String,
    width: Number,
    height: Number,
    setBy: String,
    setAt: Date,
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema({
  cover: {
    type: coverSchema,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  groupId: {
    type: String,
    required: true,
    unique: true,
  },
  destination: {
    lat: Number,
    lng: Number,
    address: String,
  },
  origin: {
    lat: Number,
    lng: Number,
    address: String,
  },
  accommodation: {
    name: String,
    address: String,
  },
  startDate: Date,
  endDate: Date,
  // When the end date is not known yet: an approximate length in days, e.g. 8 to 10
  durationDays: {
    min: { type: Number, min: 1, max: 365 },
    max: { type: Number, min: 1, max: 365 },
  },
  // The Organization that owns this trip, or null.
  //
  // O1 · Organization never required (decided 2026-11-12). Nullable, and a
  // trip without one is PERSONALLY OWNED — which is the normal case, not the
  // exception (spec 012 O-F3, §5.2). Settable after creation by the host, into
  // an Organization they belong to: that move path is the whole of Figma's
  // lesson and the field ships now even though the screen is Phase 1
  // (spec 011 case 10, O7 · Move path timing).
  //
  // There is deliberately no `ownerType`. Spec 002 §7.2 proposed one, but
  // "personally owned" is exactly "orgId is null" — a second field holding the
  // same fact is a second thing to keep true. See docs/specs/011 §17.
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null,
  },

  // The social shape of the trip (spec 011 §5.2). It selects which guest
  // preset applies and which words the roles are shown with — it is never
  // branched on in a route.
  kind: {
    type: String,
    enum: TRIP_KINDS,
    default: 'personal',
  },

  status: {
    type: String,
    enum: ['active', 'ended', 'archived', 'locked'],
    default: 'active',
  },

  // Overrides to the GUEST COLUMN of the capability table, nothing else
  // (spec 011 §5.2). A host turning on "guests can add schedule items" flips
  // one entry here; it branches no route. Keys are capability names.
  // A LIST, not a map keyed by capability name. Mongoose Maps reject keys
  // containing a dot and every capability is named `noun.verb`, so a map here
  // could never actually be written — found by exercising the endpoint
  // against a real database rather than by unit tests, which passed because
  // they used plain objects. Dotted keys are also ambiguous in a $set path.
  guestPermissions: {
    type: [
      {
        _id: false,
        capability: { type: String, enum: ALL_CAPABILITIES, required: true },
        allowed: { type: Boolean, required: true },
      },
    ],
    default: () => [],
  },

  // RESERVED ONLY — R8 · Entitlement axis (decided 2026-11-12).
  // Null means free and unlimited; nothing is gated in the pilot. The third
  // axis beside role and trip kind, reserved now so that pricing lands as a
  // lookup in entitlements() rather than as a migration against live data
  // (spec 011 §5.4, AC 13). Entitlement attaches to the TRIP, never a user.
  entitlement: {
    type: String,
    default: null,
  },

  // DEPRECATED by this slice — read nothing from it.
  //
  // TripMember is the source of truth for membership. This array is left in
  // place on purpose: the forward migration is additive, so rolling back is
  // deleting the TripMember documents and nothing is reconstructed from a
  // backup (spec 002 AC 4, spec 011 risk 3). It is removed in a later slice,
  // once the pilot has run.
  members: [
    {
      userId: String,
      email: String,
      role: {
        type: String,
        enum: ['organizer', 'member'],
        default: 'member',
      },
      status: {
        type: String,
        enum: ['pending', 'active', 'removed'],
        default: 'active',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      invitedBy: String,
      invitedAt: Date,
      inviteAccepted: Date,
    },
  ],
  itinerary: [
    {
      stop: String,
      time: Date,
      transport: String,
      notes: String,
      createdBy: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedBy: String,
      updatedAt: Date,
      version: {
        type: Number,
        default: 1,
      },
    },
  ],
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  travelSuggestions: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

tripSchema.index({ groupId: 1 });
tripSchema.index({ orgId: 1 });
tripSchema.index({ createdBy: 1 });
tripSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Trip', tripSchema);
