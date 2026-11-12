const express = require('express');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const TripInvitation = require('../models/TripInvitation');
const User = require('../models/User');
const { logMemberChange } = require('../services/activityLogger');
const { notifyTrip, notifyEmail } = require('../services/notifications');
const {
  can,
  changeRoleRefusal,
  removeRefusal,
  restoredRole,
  wouldLeaveNoHost,
  LAST_HOST_REFUSAL,
} = require('../services/permissions');
const { loadMember, allMembers, presentMember } = require('../services/membership');
const { revokeTripAccess, notifyAccessChanged } = require('../services/realtime');

const router = express.Router();

// G1 · Last host, without a check-then-write race (review finding 6).
//
// Counting active hosts and then writing leaves a window: two hosts removing
// each other at the same moment both read "2 hosts", both pass, and the trip
// is left with none. Mongo cannot express "at least one host" as a constraint
// and we cannot assume a replica set for transactions, so the write is made
// and then VERIFIED — and undone if it was the one that emptied the hosts.
//
// `apply` must return a function that puts the record back as it was.
async function guardLastHost(trip, apply) {
  const undo = await apply();
  const hostsLeft = await TripMember.countDocuments({
    tripId: trip._id,
    role: 'host',
    status: 'active',
  });
  if (hostsLeft > 0) return null;
  await undo();
  return LAST_HOST_REFUSAL;
}

// Load the trip and the caller's membership, and refuse unless they hold
// `capability`. Returns { trip, me } or null, having already answered.
// Every decision in this file goes through can() — G5 · One helper.
async function gate(req, res, capability, { byInvitation = null } = {}) {
  const trip = byInvitation
    ? await Trip.findById(byInvitation.tripId)
    : await Trip.findOne({ groupId: req.params.groupId });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return null;
  }
  const me = await loadMember(trip.groupId, req.user.uid);
  if (!can(me, trip, capability)) {
    if (!me || me.status !== 'active') {
      res.status(403).json({ error: 'You do not have access to this trip.' });
    } else {
      res.status(403).json({ error: 'You cannot do this on this trip.', capability });
    }
    return null;
  }
  return { trip, me };
}

// Add a member to a trip (by userId) or send invitation (by email)
router.post('/:groupId/members', async (req, res) => {
  try {
    const { userId, email } = req.body;
    const gated = await gate(req, res, 'member.invite');
    if (!gated) return;
    const { trip, me: requesterMember } = gated;

    // If userId provided, add directly
    if (userId) {
      const existing = await TripMember.findOne({ tripId: trip._id, userId });
      if (existing && existing.status === 'active') {
        return res.status(400).json({ error: 'Member already in trip' });
      }

      // Get user email if available
      const user = await User.findOne({ uid: userId });
      const memberEmail = user?.email || email || null;

      // Re-adding restores the record they had, never a second one (case 12,
      // unique index). The ROLE it restores is bounded by the authority of
      // the person letting them back in: §6.1 wants "restore what they were",
      // but member.invite is held by every member of a personal trip, so on
      // its own it let a guest re-add a removed host (review finding 5).
      const role = restoredRole(requesterMember, existing?.role, trip);
      const member = await TripMember.findOneAndUpdate(
        { tripId: trip._id, userId },
        {
          $set: {
            groupId: trip.groupId,
            email: memberEmail,
            role,
            status: 'active',
            statusChangedAt: new Date(),
            statusChangedBy: req.user.uid,
          },
          $setOnInsert: { joinedAt: new Date() },
        },
        { new: true, upsert: true }
      );

      await logMemberChange(
        trip._id,
        trip.groupId,
        req.user.uid,
        requesterMember.email,
        userId,
        'member_added',
        { email: memberEmail }
      );

      return res.status(201).json(presentMember(member, trip));
    }

    // If email provided, send invitation
    if (email) {
      const invitationExists = await TripMember.findOne({
        tripId: trip._id,
        email,
        status: { $in: ['invited', 'active'] },
      });
      if (invitationExists) {
        return res.status(400).json({ error: 'Member already in trip' });
      }

      const token = TripInvitation.generateToken();
      const invitation = new TripInvitation({
        tripId: trip._id,
        groupId: trip.groupId,
        recipientEmail: email,
        invitedBy: req.user.uid,
        invitedByEmail: requesterMember.email,
        token,
      });

      await invitation.save();

      // An invited person is a TripMember with status 'invited'. They are not
      // a member yet and count towards nothing until they accept (§6.1).
      await TripMember.create({
        tripId: trip._id,
        groupId: trip.groupId,
        email,
        role: 'guest',
        status: 'invited',
        invitedBy: req.user.uid,
        invitedAt: new Date(),
      });

      await logMemberChange(
        trip._id,
        trip.groupId,
        req.user.uid,
        requesterMember.email,
        email,
        'member_invited',
        { email, token }
      );

      notifyEmail(email, {
        title: `You're invited to ${trip.name}`,
        body: `${requesterMember.email || 'An organizer'} invited you to join this trip`,
        url: `/accept-invite/${token}`,
      });

      return res.status(201).json({
        message: 'Invitation sent',
        invitation: {
          token,
          recipientEmail: email,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt,
        },
      });
    }

    res.status(400).json({ error: 'Either userId or email is required' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update member role
router.put('/:groupId/members/:userId', async (req, res) => {
  try {
    const { role } = req.body;
    const gated = await gate(req, res, 'member.setRole');
    if (!gated) return;
    const { trip, me: requesterMember } = gated;

    const targetMember = await TripMember.findOne({ tripId: trip._id, userId: req.params.userId });
    if (!targetMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // G3 · No self-demotion, and the §6.3 matrix: who may move whom, where.
    // Each refusal names the way out rather than being a bare error (L7).
    const refusal = changeRoleRefusal(requesterMember, targetMember, role, trip);
    if (refusal) return res.status(403).json({ error: refusal });

    const oldRole = targetMember.role;

    // Cheap pre-check first, so the common refusal never writes at all.
    const members = await allMembers(trip._id);
    if (wouldLeaveNoHost(members, { userId: req.params.userId, newRole: role })) {
      return res.status(409).json({ error: LAST_HOST_REFUSAL });
    }

    const refusedByRace = await guardLastHost(trip, async () => {
      targetMember.role = role;
      await targetMember.save();
      return async () => {
        targetMember.role = oldRole;
        await targetMember.save();
      };
    });
    if (refusedByRace) return res.status(409).json({ error: refusedByRace });

    await logMemberChange(
      trip._id,
      trip.groupId,
      req.user.uid,
      requesterMember.email,
      req.params.userId,
      'member_role_changed',
      { from: oldRole, to: role }
    );

    // What they may do changed, now — the client re-fetches rather than
    // keeping controls it no longer has (R-F8). They are NOT evicted from the
    // trip room: they are still a member, and evicting them would stop their
    // live updates until they reloaded (review finding 1, principle 2).
    await notifyAccessChanged(trip.groupId, req.params.userId);

    res.json(presentMember(targetMember, trip));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove a member from a trip
router.delete('/:groupId/members/:userId', async (req, res) => {
  try {
    const gated = await gate(req, res, 'member.remove');
    if (!gated) return;
    const { trip, me: requesterMember } = gated;

    const targetMember = await TripMember.findOne({ tripId: trip._id, userId: req.params.userId });
    if (!targetMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Who may remove whom (§6.3, applied to removal — review finding 4).
    // member.remove on its own let a co-host remove a host.
    const refusal = removeRefusal(requesterMember, targetMember, trip);
    if (refusal) return res.status(403).json({ error: refusal });

    const members = await allMembers(trip._id);
    if (wouldLeaveNoHost(members, { userId: req.params.userId, remove: true })) {
      return res.status(409).json({ error: LAST_HOST_REFUSAL });
    }

    // Removal is a STATUS change, not a delete. Role and status are
    // orthogonal (§6.1): a removed co-host stays a co-host, so re-adding can
    // restore what they were, and their polls and expenses keep their name
    // (R-F12). The record is the history.
    const previousStatus = targetMember.status;
    const raced = await guardLastHost(trip, async () => {
      targetMember.status = 'removed';
      targetMember.statusChangedAt = new Date();
      targetMember.statusChangedBy = req.user.uid;
      await targetMember.save();
      return async () => {
        targetMember.status = previousStatus;
        await targetMember.save();
      };
    });
    if (raced) return res.status(409).json({ error: raced });

    await logMemberChange(
      trip._id,
      trip.groupId,
      req.user.uid,
      requesterMember.email,
      req.params.userId,
      'member_removed',
      { email: targetMember.email }
    );

    // G4 · Immediate revocation. Without this they keep receiving every
    // schedule change, poll, expense and announcement until they happen to
    // disconnect, and keep broadcasting their location (spec 011 §2, AC 8).
    await revokeTripAccess(trip.groupId, req.params.userId);

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove a member (by userId) or cancel a pending invite (by email)
router.delete('/:groupId/members', async (req, res) => {
  try {
    const { userId, email } = req.body || {};
    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email is required' });
    }

    const gated = await gate(req, res, 'member.remove');
    if (!gated) return;
    const { trip, me: requesterMember } = gated;

    const target = userId
      ? await TripMember.findOne({ tripId: trip._id, userId })
      : await TripMember.findOne({ tripId: trip._id, userId: null, email });
    if (!target) return res.status(404).json({ error: 'Member not found' });

    // Replaces "Organizers cannot be removed". That guard refused to remove
    // ANY organizer, which also meant two organizers could never part company.
    // The real rules are narrower: who may remove whom (§6.3), and a trip is
    // never left with nobody in charge (G1 · Last host).
    if (target.userId) {
      const refusal = removeRefusal(requesterMember, target, trip);
      if (refusal) return res.status(403).json({ error: refusal });
    }

    const members = await allMembers(trip._id);
    if (wouldLeaveNoHost(members, { userId: target.userId, remove: true })) {
      return res.status(409).json({ error: LAST_HOST_REFUSAL });
    }

    if (target.userId) {
      const previousStatus = target.status;
      const raced = await guardLastHost(trip, async () => {
        target.status = 'removed';
        target.statusChangedAt = new Date();
        target.statusChangedBy = req.user.uid;
        await target.save();
        return async () => {
          target.status = previousStatus;
          await target.save();
        };
      });
      if (raced) return res.status(409).json({ error: raced });
    } else {
      // Never accepted, so there is no history to keep: cancelling an
      // invitation removes the placeholder rather than leaving a ghost in
      // the people list.
      await target.deleteOne();
    }

    if (target.email) {
      await TripInvitation.updateMany(
        { tripId: trip._id, recipientEmail: target.email, status: 'pending' },
        { status: 'rejected' }
      );
    }

    await logMemberChange(
      trip._id,
      trip.groupId,
      req.user.uid,
      requesterMember.email,
      target.userId || target.email,
      'member_removed',
      { email: target.email }
    );

    if (target.userId) await revokeTripAccess(trip.groupId, target.userId);

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get trip members
router.get('/:groupId/members', async (req, res) => {
  try {
    const gated = await gate(req, res, 'trip.view');
    if (!gated) return;
    const { trip } = gated;

    // Each member carries the WORD for their role on this trip as well as the
    // stored value, so the client never maps a role name itself (012 §5.3).
    const members = await allMembers(trip._id);
    res.json(members.map((m) => presentMember(m, trip)));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get pending invitations for a trip
router.get('/:groupId/invitations', async (req, res) => {
  try {
    const gated = await gate(req, res, 'invite.manage');
    if (!gated) return;
    const { trip } = gated;

    const invitations = await TripInvitation.find({
      tripId: trip._id,
      status: 'pending',
    }).select('-token');

    res.json(invitations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Accept invitation (by token, no groupId needed)
router.post('/invitations/:token/accept', async (req, res) => {
  try {
    const invitation = await TripInvitation.findOne({ token: req.params.token });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    const trip = await Trip.findById(invitation.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // The accepting user must be the logged-in user the invite was sent to
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.email.toLowerCase() !== invitation.recipientEmail.toLowerCase()) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }

    // Check if user already in trip
    const alreadyMember = await TripMember.findOne({
      tripId: trip._id,
      userId: user.uid,
      status: 'active',
    });
    if (alreadyMember) {
      return res.status(400).json({ error: 'Already a member of this trip' });
    }

    // Claim the invited placeholder if there is one, so one invitation makes
    // one member rather than leaving a row pending forever (spec 011 case 8).
    const placeholder = await TripMember.findOne({
      tripId: trip._id,
      userId: null,
      email: invitation.recipientEmail,
    });
    if (placeholder) {
      placeholder.userId = user.uid;
      placeholder.status = 'active';
      placeholder.joinedAt = new Date();
      placeholder.statusChangedAt = new Date();
      placeholder.statusChangedBy = user.uid;
      await placeholder.save();
    } else {
      // Accepting an invitation never restores an elevated role on its own:
      // the role a returning member comes back with is set by whoever invited
      // them, not by what they used to be (review finding 5).
      await TripMember.findOneAndUpdate(
        { tripId: trip._id, userId: user.uid },
        {
          $set: {
            groupId: trip.groupId,
            email: invitation.recipientEmail,
            status: 'active',
            statusChangedAt: new Date(),
            statusChangedBy: user.uid,
          },
          $setOnInsert: {
            role: 'guest',
            joinedAt: new Date(),
            invitedBy: invitation.invitedBy,
          },
        },
        { upsert: true, new: true }
      );
    }

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedByUserId = user.uid;
    await invitation.save();

    await logMemberChange(trip._id, trip.groupId, user.uid, user.email, user.uid, 'member_added', {
      email: invitation.recipientEmail,
    });

    notifyTrip(trip, user.uid, {
      title: trip.name,
      body: `${user.email} joined the trip`,
    });

    res.json({ message: 'Invitation accepted', trip, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Accept invitation
router.post('/:groupId/invitations/:token/accept', async (req, res) => {
  try {
    const invitation = await TripInvitation.findOne({ token: req.params.token });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    const trip = await Trip.findById(invitation.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // The accepting user must be the logged-in user the invite was sent to
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.email.toLowerCase() !== invitation.recipientEmail.toLowerCase()) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }

    // Check if user already in trip
    const alreadyMember = await TripMember.findOne({
      tripId: trip._id,
      userId: user.uid,
      status: 'active',
    });
    if (alreadyMember) {
      return res.status(400).json({ error: 'Already a member of this trip' });
    }

    // Claim the invited placeholder if there is one, so one invitation makes
    // one member rather than leaving a row pending forever (spec 011 case 8).
    const placeholder = await TripMember.findOne({
      tripId: trip._id,
      userId: null,
      email: invitation.recipientEmail,
    });
    if (placeholder) {
      placeholder.userId = user.uid;
      placeholder.status = 'active';
      placeholder.joinedAt = new Date();
      placeholder.statusChangedAt = new Date();
      placeholder.statusChangedBy = user.uid;
      await placeholder.save();
    } else {
      // Accepting an invitation never restores an elevated role on its own:
      // the role a returning member comes back with is set by whoever invited
      // them, not by what they used to be (review finding 5).
      await TripMember.findOneAndUpdate(
        { tripId: trip._id, userId: user.uid },
        {
          $set: {
            groupId: trip.groupId,
            email: invitation.recipientEmail,
            status: 'active',
            statusChangedAt: new Date(),
            statusChangedBy: user.uid,
          },
          $setOnInsert: {
            role: 'guest',
            joinedAt: new Date(),
            invitedBy: invitation.invitedBy,
          },
        },
        { upsert: true, new: true }
      );
    }

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedByUserId = user.uid;
    await invitation.save();

    await logMemberChange(trip._id, trip.groupId, user.uid, user.email, user.uid, 'member_added', {
      email: invitation.recipientEmail,
    });

    notifyTrip(trip, user.uid, {
      title: trip.name,
      body: `${user.email} joined the trip`,
    });

    res.json({ message: 'Invitation accepted', trip, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel invitation
router.delete('/:groupId/invitations/:invitationId', async (req, res) => {
  try {
    const invitation = await TripInvitation.findById(req.params.invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const gated = await gate(req, res, 'invite.manage', { byInvitation: invitation });
    if (!gated) return;
    const { trip } = gated;

    // Revoking one invitation touches only that person (O-F14).
    await TripMember.deleteOne({
      tripId: trip._id,
      userId: null,
      email: invitation.recipientEmail,
      status: 'invited',
    });

    // Mark invitation as rejected
    invitation.status = 'rejected';
    invitation.rejectedAt = new Date();
    await invitation.save();

    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Resend invitation
router.post('/:groupId/invitations/:invitationId/resend', async (req, res) => {
  try {
    const invitation = await TripInvitation.findById(req.params.invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const gated = await gate(req, res, 'invite.manage', { byInvitation: invitation });
    if (!gated) return;

    // Reset expiration
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await invitation.save();

    res.json({ message: 'Invitation resent', invitation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
