// G4 · Immediate revocation — spec 011 §6.2, §10.2, AC 8, R-F8.
//
// "Revocation is immediate across every channel. Removing a member closes
// their socket room membership, drops their live location, and invalidates
// their access within the same request — not at next reconnect."
//
// The defect this closes is live in today's code, not hypothetical: join-trip
// authorizes ONCE (server/index.js) and nothing ever removes a socket from
// `trip:<id>`. A removed member keeps receiving every schedule change, poll,
// expense and announcement, and keeps broadcasting their position, until they
// happen to disconnect. Principle 3 says only active trip members see a trip,
// so this is a principle-3 defect in production — which is why spec 011 §14
// puts it in slice 1 rather than in the hardening slice after the pilot.
//
// EVICTION IS FOR ACCESS LOST, NOT FOR A ROLE CHANGE (review finding 1).
//
// An earlier version called this on every role change too. Eviction removes
// the socket from the room, and the client emits join-trip only on `connect`
// — so a promotion or demotion silently stopped someone receiving live events
// until they reloaded the page. That is principle 2 broken by the fix for
// principle 3.
//
// Every comparable product draws the same line: Figma downgrades an open
// file's toolbar in place and ejects you only when access is revoked; Google
// Docs moves editor→commenter live; a Slack role change never drops you from
// a channel. So:
//
//   revokeTripAccess   — access is GONE. Evict, drop location, tell them.
//   notifyAccessChanged — what they may DO changed. Tell them, leave them in.
//
// R-F8 ("removing or demoting takes effect immediately") still holds for a
// demotion, because every write re-checks can() per request. "Takes effect"
// is not "gets ejected".
//
// It is a factory rather than a function so the socket state it needs (io and
// the two in-memory maps, both owned by index.js) can be handed in — and so
// server/test/g4-revocation.test.js can drive it with no database.
//
// That test uses a stand-in for `io` with the four methods used below, not a
// real socket.io server: it proves which sockets are evicted, which events
// fire and which map entries are dropped, and not socket.io's own room
// semantics. An earlier version of this comment claimed otherwise (review of
// PR #124). The whole path runs against real clients at the dry run.
//
// G4 is the part of this slice most easily left half-done, and an assertion
// is the only thing that stops that.

function makeRevokeTripAccess({ io, liveLocations, activePresence }) {
  // What they may do here changed, but they are still a member: tell them so
  // the client re-fetches its capabilities, and leave the room alone.
  async function notifyAccessChanged(groupId, userId) {
    const room = `trip:${groupId}`;
    const sockets = await io.in(room).fetchSockets();
    for (const socket of sockets) {
      if (socket.data?.uid !== userId) continue;
      socket.emit('trip:access-changed', { tripId: groupId });
    }
  }

  async function revokeTripAccess(groupId, userId) {
    const room = `trip:${groupId}`;
    const key = `${groupId}:${userId}`;

    // 1. Drop their live location and tell the room they stopped sharing, so
    //    the others' maps do not keep a pin that will never move again
    //    (spec 011 case 5). Live location is in memory and never stored.
    if (liveLocations.has(key)) {
      liveLocations.delete(key);
      io.to(room).emit('location:stopped', { userId });
    }

    // 2. Drop their presence, so "who is here" stops counting them.
    activePresence.delete(key);

    // 3. Force every socket they hold out of the room. Afterwards they
    //    receive nothing, and location:update refuses them too, because it
    //    checks room membership before accepting a position.
    const sockets = await io.in(room).fetchSockets();
    for (const socket of sockets) {
      if (socket.data?.uid !== userId) continue;
      // Tell them before cutting them off: the trip context re-fetches
      // rather than sitting on a screen it may no longer show (L5).
      socket.emit('trip:access-changed', { tripId: groupId });
      socket.leave(room);
    }

    // 4. Tell the room, so member lists and counts move without a refresh.
    const remaining = Array.from(activePresence.entries())
      .filter(([k]) => k.startsWith(`${groupId}:`))
      .map(([, presence]) => presence);
    io.to(room).emit('presence:update', { activeUsers: remaining });
  }

  return { revokeTripAccess, notifyAccessChanged };
}

module.exports = { makeRevokeTripAccess };
