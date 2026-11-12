const mongoose = require('mongoose');

// An Organization owns trips, and nothing else.
//
// O1 · Organization never required (decided 2026-11-12): an Organization is
// NEVER required to host a trip. Trip.orgId is nullable and a trip without one
// is personally owned (spec 012 §5.2, O-F1, O-F3).
//
// O-F2: one is never created automatically, and never without a name a user
// typed. Eventbrite's auto-created "unnamed organizer" is the failure to avoid
// (spec 012 Q9).
//
// Minimal on purpose. The Organization home page, the member list screen and
// the contextual create prompt are Phase 1; this is the record the nullable
// Trip.orgId and OrgMember.orgId point at.

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

organizationSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Organization', organizationSchema);
