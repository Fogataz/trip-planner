// requireCapability('schedule.edit')
//
// Spec 011 §10.2: loads the trip and the member ONCE and attaches both, so a
// route body never re-queries and never re-checks. N8: an unauthorized call
// returns 403 and changes nothing.
//
// This is the only way an HTTP route is allowed to decide access. The socket
// path calls can() through the same module — that both go through one helper
// is G5, and server/test/g5-one-helper.test.js fails if either stops.

const { can } = require('../services/permissions');
const { loadTripAndMember } = require('../services/membership');

// Both refusals are 403, which is what spec 011 AC 2 asks for in so many
// words: "they get 403 and see nothing". An earlier version of this comment
// claimed the first case was a 404 while the code returned 403 — the comment
// was wrong, not the code (review of PR #124).
//
// The two messages differ because the situations do: not being on the trip is
// not actionable by the caller, whereas being on it and lacking one
// capability is — ask a host. Neither says anything about what exists.
function refuse(res, { member, capability }) {
  if (!member || member.status !== 'active') {
    return res.status(403).json({ error: 'You do not have access to this trip.' });
  }
  return res.status(403).json({
    error: 'You cannot do this on this trip.',
    capability,
  });
}

function requireCapability(capability, options = {}) {
  const param = options.param || 'groupId';

  return async function requireCapabilityMiddleware(req, res, next) {
    try {
      const groupId = req.params[param] || req.body?.[param];
      if (!groupId) return res.status(400).json({ error: 'No trip was named.' });

      const { trip, member } = await loadTripAndMember(groupId, req.user.uid);
      if (!trip) return res.status(404).json({ error: 'Trip not found' });

      if (!can(member, trip, capability)) {
        return refuse(res, { member, capability });
      }

      // Loaded once, for the route body.
      req.trip = trip;
      req.member = member;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

// For a route whose decision needs the object's author as well — poll.close
// and expense.delete, the CREATOR rows of the table. The capability check
// still runs first and authorship is resolved after it, never instead of it
// (spec 011 §5.1 footnote 2).
function canWithResource(req, capability, resource) {
  return can(req.member, req.trip, capability, { resource });
}

module.exports = { requireCapability, canWithResource, refuse };
