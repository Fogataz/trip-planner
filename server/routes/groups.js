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
  wouldLeaveNoHost,
  LAST_HOST_REFUSAL,
} = require('../services/permissions');
const { loadMember, allMembers, presentMember } = require('../services/membership');
const { revokeTripAccess, notifyAccessChanged } = require('../services/realtime');

const router = express.Router();

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

      // Re-adding someone restores the record they had, with the role they
      // had — it never creates a second one (spec 011 case 12, unique index).
      const member = await TripMember.findOneAndUpdate(
        { tripId: trip._id, userId },
        {
          $set: {
            groupId: trip.groupId,
            email: memberEmail,
            status: 'active',
            statusChangedAt: new Date(),
            statusChangedBy: req.user.uid,
          },
          $setOnInsert: { role: 'guest', joinedAt: new Date() },
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

    // G1 · Last host. See the note in services/permissions.js: the blunt
    // "organizers cannot be removed" guard this slice replaces was the only
    // thing keeping a trip from ending up with nobody in charge.
    const members = await allMembers(trip._id);
    if (wouldLeaveNoHost(members, { userId: req.params.userId, newRole: role })) {
      return res.status(409).json({ error: LAST_HOST_REFUSAL });
    }

    const oldRole = targetMember.role;
    targetMember.role = role;
    await targetMember.save();

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

    const members = await allMembers(trip._id);
    if (wouldLeaveNoHost(members, { userId: req.params.userId, remove: true })) {
      return res.status(409).json({ error: LAST_HOST_REFUSAL });
    }

    // Removal is a STATUS change, not a delete. Role and status are
    // orthogonal (§6.1): a removed co-host stays a co-host, so re-adding
    // restores what they were, and their polls and expenses keep their name
    // (R-F12). The record is the history.
    targetMember.status = 'removed';
    targetMember.statusChangedAt = new Date();
    targetMember.statusChangedBy = req.user.uid;
    await targetMember.save();

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
    // The real rule is narrower and is the one that matters: a trip is never
    // left with nobody in charge (G1 · Last host).
    const members = await allMembers(trip._id);
    if (wouldLeaveNoHost(members, { userId: target.userId, remove: true })) {
      return res.status(409).json({ error: LAST_HOST_REFUSAL });
    }

    if (target.userId) {
      target.status = 'removed';
      target.statusChangedAt = new Date();
      target.statusChangedBy = req.user.uid;
      await target.save();
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
