const mongoose = require('mongoose');
const { ORG_ROLES, MEMBER_STATUSES } = require('../services/permissions');

// Membership of an Organization (spec 011 §10.2).
//
// THIS GRANTS NO TRIP ACCESS. Not one capability, ever
// (D19 · Org membership grants no trip access, R-F3, AC 2). An Organization
// role grants the right to OBTAIN a trip role — under R1 · Org owner reach an
// owner may CLAIM one, which is logged and announced — never to read a trip
// silently. The claim path itself is spec 011 block 5, not this slice.

const orgMemberSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  userId: {
    type: String,
    default: null,
  },
  email: String,
  role: {
    type: String,
    enum: ORG_ROLES,
    default: 'member',
  },
  status: {
    type: String,
    enum: MEMBER_STATUSES,
    default: 'active',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

orgMemberSchema.index(
  { orgId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' } } }
);
orgMemberSchema.index({ orgId: 1, email: 1 });
orgMemberSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('OrgMember', orgMemberSchema);
