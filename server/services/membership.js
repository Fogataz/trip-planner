// Loading membership. The database half that services/permissions.js refuses
// to do, kept apart so the capability model stays unit-testable (spec 011
// §10.2).

const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const { capabilitiesFor, roleLabel, roleLabelKey, roleLabelFallbackKey } = require('./permissions');

// The one member document a capability check needs. Never the member list:
// that is spec 011 lens L13's point about hundreds of attendees.
async function loadMember(groupId, userId) {
  if (!groupId || !userId) return null;
  return TripMember.findOne({ groupId, userId });
}

async function loadTripAndMember(groupId, userId) {
  const trip = await Trip.findOne({ groupId });
  if (!trip) return { trip: null, member: null };
  const member = await loadMember(groupId, userId);
  return { trip, member };
}

// Everyone who counts. status: 'active' and nothing else — announcement
// reach, poll denominators, expense splits and the analytics role property
// all read this, so "goes to 38 people" means 38 (R-F9, case 15).
async function activeMembers(tripId) {
  return TripMember.find({ tripId, status: 'active' });
}

async function activeMemberCount(tripId) {
  return TripMember.countDocuments({ tripId, status: 'active' });
}

// Everyone on the trip, in any state — for the people screen, which shows
// pending and invited separately rather than mixed into the count.
async function allMembers(tripId) {
  return TripMember.find({ tripId });
}

// What a member looks like to a client: the stored role, the WORD for it on
// this trip (spec 012 §5.3), and never a resolved capability stored anywhere.
function presentMember(member, trip) {
  if (!member) return null;
  return {
    userId: member.userId,
    email: member.email,
    role: member.role,
    // The English word, for the server's own use. The client renders from
    // the two keys below so the pill is localized (spec 002 F33, AC 27).
    roleLabel: roleLabel(member.role, trip),
    roleLabelKey: roleLabelKey(member.role, trip),
    roleLabelFallbackKey: roleLabelFallbackKey(member.role),
    status: member.status,
    joinedAt: member.joinedAt,
    invitedBy: member.invitedBy,
    invitedAt: member.invitedAt,
  };
}

// R-F11: the trip payload carries the viewer's resolved capability list, so
// the client renders controls from capabilities and never from a role name
// (spec 011 risk 1, AC 12).
function presentTrip(trip, member, members) {
  const json = typeof trip.toObject === 'function' ? trip.toObject() : { ...trip };
  json.viewer = {
    role: member?.role || null,
    roleLabel: member ? roleLabel(member.role, trip) : null,
    status: member?.status || null,
    capabilities: capabilitiesFor(member, trip),
  };
  // `members` comes from the TripMember collection, never from the embedded
  // array on the document — that one is deprecated and no longer written.
  if (members) json.members = members.map((m) => presentMember(m, trip));
  else delete json.members;
  return json;
}

module.exports = {
  loadMember,
  loadTripAndMember,
  activeMembers,
  activeMemberCount,
  allMembers,
  presentMember,
  presentTrip,
};
