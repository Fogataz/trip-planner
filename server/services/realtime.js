// A one-function registry so a route can reach the socket layer without
// importing server/index.js (which would be circular, since index.js mounts
// the routes).
//
// It exists for G4 · Immediate revocation (spec 011 §6.2): removing a member
// has to take effect on the socket room, the live-location map and any
// in-flight request WITHIN THE SAME REQUEST — not at next reconnect. index.js
// owns `io` and the `liveLocations` map, so it registers the implementation
// here at start-up and the routes call revokeTripAccess().
//
// Unregistered (a unit test, a script, a worker) it is a no-op, so nothing
// here can fail a request.

let revoker = null;

function setRevoker(fn) {
  revoker = typeof fn === 'function' ? fn : null;
}

// groupId: the socket room key. userId: who just lost access.
async function revokeTripAccess(groupId, userId) {
  if (!revoker || !groupId || !userId) return;
  try {
    await revoker(groupId, userId);
  } catch (err) {
    // Revocation is best-effort on the socket layer; the HTTP decision has
    // already been written and every later request re-checks can() anyway.
    console.error('revokeTripAccess error:', err.message);
  }
}

module.exports = { setRevoker, revokeTripAccess };
