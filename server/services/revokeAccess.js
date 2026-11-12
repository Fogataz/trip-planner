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
// It is a factory rather than a function so the socket state it needs (io and
// the two in-memory maps, both owned by index.js) can be handed in — and so
// server/test/g4-revocation.test.js can drive the real thing against a real
// socket.io server, with no database. G4 is the part of this slice most
// easily left half-done, and an assertion is the only thing that stops that.

function makeRevokeTripAccess({ io, liveLocations, activePresence }) {
  return async function revokeTripAccess(groupId, userId) {
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
  };
}

module.exports = { makeRevokeTripAccess };
