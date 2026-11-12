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

let impl = null;

function setRevoker(handlers) {
  impl = handlers && typeof handlers.revokeTripAccess === 'function' ? handlers : null;
}

async function run(name, groupId, userId) {
  if (!impl || !groupId || !userId) return;
  try {
    await impl[name](groupId, userId);
  } catch (err) {
    // Best-effort on the socket layer: the HTTP decision is already written
    // and every later request re-checks can() anyway.
    console.error(`${name} error:`, err.message);
  }
}

// Access is GONE — removed from the trip. Evict their sockets, drop their
// live location, tell the room.
async function revokeTripAccess(groupId, userId) {
  return run('revokeTripAccess', groupId, userId);
}

// Still a member, but what they may DO changed — a promotion or demotion.
// Tell them so the client re-fetches its capabilities, and leave them in the
// room: evicting them would stop their live updates until they reloaded
// (review finding 1, principle 2).
async function notifyAccessChanged(groupId, userId) {
  return run('notifyAccessChanged', groupId, userId);
}

module.exports = { setRevoker, revokeTripAccess, notifyAccessChanged };
