// G4 · Immediate revocation.
//
// Spec 011 AC 8: "Given a member in the trip's socket room, when a host
// removes them, then they leave the room and receive no further trip events
// WITHOUT RECONNECTING, their live location is dropped, and the remaining
// members see them stop sharing."
//
// G4 is the part of slice 1 most easily left half done: it lives in
// server/index.js rather than in the permissions module, so nothing else here
// would notice if it quietly stopped working. Hence a test.
//
// WHAT THIS DOUBLE IS. `io` below is a stand-in with the four methods
// revokeAccess.js actually uses — to(room).emit, in(room).fetchSockets, and
// a socket's emit and leave. It proves the decisions: WHICH sockets are
// kicked, WHICH events fire, WHICH map entries are dropped, and that another
// trip is untouched. It does not prove socket.io's own room semantics; those
// are the library's, and the dry run on 20 Nov is where the whole path gets
// exercised against real clients.

const { test } = require('node:test');
const assert = require('node:assert');

const { makeRevokeTripAccess } = require('../services/revokeAccess');

const GROUP = 'trip-abc';
const ROOM = `trip:${GROUP}`;

function fakeSocket(uid) {
  return {
    data: { uid },
    rooms: new Set(),
    emitted: [],
    left: [],
    emit(event, payload) {
      this.emitted.push({ event, payload });
    },
    leave(room) {
      this.left.push(room);
      this.rooms.delete(room);
    },
  };
}

function fakeIo(sockets) {
  const broadcasts = [];
  const target = (room) => ({
    emit(event, payload) {
      broadcasts.push({ room, event, payload });
      // Anyone still in the room receives it. This is what makes "no further
      // trip events" assertable rather than assumed.
      for (const socket of sockets) {
        if (socket.rooms.has(room)) socket.emit(event, payload);
      }
    },
    async fetchSockets() {
      return sockets.filter((s) => s.rooms.has(room));
    },
  });
  return { to: target, in: target, broadcasts };
}

function setUp() {
  const removed = fakeSocket('marta');
  const staying = fakeSocket('alberto');
  removed.rooms.add(ROOM);
  staying.rooms.add(ROOM);

  const sockets = [removed, staying];
  const io = fakeIo(sockets);

  const liveLocations = new Map([
    [`${GROUP}:marta`, { userId: 'marta', lat: 40.4, lng: -3.7 }],
    [`${GROUP}:alberto`, { userId: 'alberto', lat: 40.5, lng: -3.6 }],
  ]);
  const activePresence = new Map([
    [`${GROUP}:marta`, { userId: 'marta' }],
    [`${GROUP}:alberto`, { userId: 'alberto' }],
  ]);

  const { revokeTripAccess, notifyAccessChanged } = makeRevokeTripAccess({
    io,
    liveLocations,
    activePresence,
  });

  return {
    removed,
    staying,
    io,
    liveLocations,
    activePresence,
    revoke: revokeTripAccess,
    notify: notifyAccessChanged,
  };
}

const eventsOn = (socket, event) => socket.emitted.filter((e) => e.event === event);

test('AC 8 · a removed member leaves the room and gets no further trip events', async () => {
  const { removed, staying, io, revoke } = setUp();

  // Before: both are in the room and both receive trip events.
  io.to(ROOM).emit('poll:created', { poll: { question: 'Dinner?' } });
  assert.strictEqual(eventsOn(removed, 'poll:created').length, 1);
  assert.strictEqual(eventsOn(staying, 'poll:created').length, 1);

  await revoke(GROUP, 'marta');

  // They were forced out — not asked to reconnect.
  assert.deepStrictEqual(removed.left, [ROOM]);
  assert.strictEqual(removed.rooms.has(ROOM), false);
  assert.strictEqual(staying.rooms.has(ROOM), true);

  // This is the criterion: nothing more reaches them.
  io.to(ROOM).emit('announcement:created', { body: 'Breakfast moved to the lobby' });
  assert.strictEqual(eventsOn(removed, 'announcement:created').length, 0);
  assert.strictEqual(eventsOn(staying, 'announcement:created').length, 1);
});

test('AC 8 · they are told, so the client re-fetches instead of showing stale state', async () => {
  const { removed, revoke } = setUp();
  await revoke(GROUP, 'marta');

  const told = eventsOn(removed, 'trip:access-changed');
  assert.strictEqual(told.length, 1);
  assert.deepStrictEqual(told[0].payload, { tripId: GROUP });

  // Told BEFORE being cut off, or the message never arrives.
  const toldAt = removed.emitted.findIndex((e) => e.event === 'trip:access-changed');
  assert.ok(toldAt > -1 && removed.left.length === 1);
});

test('AC 8 · their live location is dropped and the others see them stop', async () => {
  const { removed, staying, liveLocations, revoke } = setUp();
  await revoke(GROUP, 'marta');

  assert.strictEqual(liveLocations.has(`${GROUP}:marta`), false);
  // Everyone else keeps sharing (spec 011 case 5 is about one person).
  assert.strictEqual(liveLocations.has(`${GROUP}:alberto`), true);

  const stopped = eventsOn(staying, 'location:stopped');
  assert.strictEqual(stopped.length, 1);
  assert.deepStrictEqual(stopped[0].payload, { userId: 'marta' });
});

test('presence stops counting them, and the room is told', async () => {
  const { staying, activePresence, revoke } = setUp();
  await revoke(GROUP, 'marta');

  assert.strictEqual(activePresence.has(`${GROUP}:marta`), false);
  const updates = eventsOn(staying, 'presence:update');
  assert.deepStrictEqual(updates.at(-1).payload, { activeUsers: [{ userId: 'alberto' }] });
});

test('a member who was not sharing a location triggers no location:stopped', async () => {
  const { staying, liveLocations, revoke } = setUp();
  liveLocations.delete(`${GROUP}:marta`);
  await revoke(GROUP, 'marta');
  assert.strictEqual(eventsOn(staying, 'location:stopped').length, 0);
});

test('revoking touches nobody else, in this trip or another', async () => {
  const { removed, staying, liveLocations, activePresence, io, revoke } = setUp();

  // The same person is also on another trip, which they were not removed from.
  const otherRoom = 'trip:other';
  const elsewhere = { ...fakeSocket('marta'), rooms: new Set([otherRoom]) };
  liveLocations.set('other:marta', { userId: 'marta' });
  activePresence.set('other:marta', { userId: 'marta' });

  await revoke(GROUP, 'marta');

  assert.strictEqual(liveLocations.has('other:marta'), true, 'their other trip is untouched');
  assert.strictEqual(activePresence.has('other:marta'), true);
  assert.strictEqual(elsewhere.rooms.has(otherRoom), true);

  // And the person staying was not kicked.
  assert.deepStrictEqual(staying.left, []);
  assert.deepStrictEqual(removed.left, [ROOM]);
  assert.ok(io.broadcasts.every((b) => b.room === ROOM));
});

test('revoking someone who is not connected is harmless', async () => {
  const { removed, staying, revoke } = setUp();
  await revoke(GROUP, 'nobody-here');
  assert.deepStrictEqual(removed.left, []);
  assert.deepStrictEqual(staying.left, []);
});

test('every socket that person holds is removed, not just the first', async () => {
  // A phone and a laptop, both signed in as the same person.
  const phone = fakeSocket('marta');
  const laptop = fakeSocket('marta');
  const staying = fakeSocket('alberto');
  for (const s of [phone, laptop, staying]) s.rooms.add(ROOM);

  const io = fakeIo([phone, laptop, staying]);
  const { revokeTripAccess: revoke } = makeRevokeTripAccess({
    io,
    liveLocations: new Map(),
    activePresence: new Map(),
  });

  await revoke(GROUP, 'marta');

  assert.deepStrictEqual(phone.left, [ROOM]);
  assert.deepStrictEqual(laptop.left, [ROOM]);
  assert.deepStrictEqual(staying.left, []);
});


// ---------------------------------------------------------------------------
// A ROLE CHANGE IS NOT A REVOCATION — review finding 1
// ---------------------------------------------------------------------------
//
// An earlier version called revokeTripAccess on every role change. Eviction
// removes the socket from the room and the client emits join-trip only on
// `connect`, so a promotion or demotion silently stopped someone receiving
// live events until they reloaded: principle 2 broken by the fix for
// principle 3.

test('a role change tells them, and leaves them in the room', async () => {
  const { removed: demoted, staying, io, notify } = setUp();

  await notify(GROUP, 'marta');

  // Told, so the client re-fetches its capabilities.
  const told = eventsOn(demoted, 'trip:access-changed');
  assert.strictEqual(told.length, 1);
  assert.deepStrictEqual(told[0].payload, { tripId: GROUP });

  // Still in the room — this is the whole point.
  assert.deepStrictEqual(demoted.left, [], 'not evicted');
  assert.strictEqual(demoted.rooms.has(ROOM), true);

  // And still receiving live events, with no reload and no re-join.
  io.to(ROOM).emit('itinerary:itemAdded', { item: { stop: 'Dinner' } });
  assert.strictEqual(eventsOn(demoted, 'itinerary:itemAdded').length, 1);
  assert.strictEqual(eventsOn(staying, 'itinerary:itemAdded').length, 1);
});

test('a role change does not touch their live location or presence', async () => {
  const { liveLocations, activePresence, staying, notify } = setUp();

  await notify(GROUP, 'marta');

  assert.strictEqual(liveLocations.has(`${GROUP}:marta`), true, 'still sharing');
  assert.strictEqual(activePresence.has(`${GROUP}:marta`), true, 'still present');
  assert.strictEqual(eventsOn(staying, 'location:stopped').length, 0);
});

test('notifying someone who is not connected is harmless', async () => {
  const { removed, staying, notify } = setUp();
  await notify(GROUP, 'nobody-here');
  assert.deepStrictEqual(removed.left, []);
  assert.strictEqual(eventsOn(removed, 'trip:access-changed').length, 0);
  assert.strictEqual(eventsOn(staying, 'trip:access-changed').length, 0);
});
